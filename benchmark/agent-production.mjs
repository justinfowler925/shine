#!/usr/bin/env node
import {chromium} from "playwright";
import {createHash} from "node:crypto";
import {closeSync,copyFileSync,existsSync,mkdirSync,openSync,readFileSync,realpathSync,rmSync,symlinkSync,writeFileSync} from "node:fs";
import {execFile,spawn,spawnSync} from "node:child_process";
import {basename,dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {seedDesignSpec,validateDesignSpec} from "../core/design-spec.mjs";
import {renderDesignSpec} from "../core/render-spec.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const CODEX="/Applications/ChatGPT.app/Contents/Resources/codex";
const MODEL="gpt-5.6-luna";
export const BUDGETS={timeoutMs:180000,maxFreshInputTokens:100000,maxOutputTokens:12000};
const sha=value=>createHash("sha256").update(value).digest("hex");

export function discoverProductionEntries({cursorApiKey=process.env.CURSOR_API_KEY}={}){
 return {
  codex:{available:existsSync(CODEX),entry:`${CODEX} exec --json`,skill:"~/.agents/skills/shine",agent:"~/.Codex/agents/shine-ux.md"},
  cursor:{available:Boolean(cursorApiKey),entry:"@cursor/sdk Agent.create local",skill:"~/.cursor/skills/shine",agent:"AgentOptions.agents[shine-ux]"},
  causalHarness:{surface:"codex-cli-native",model:MODEL,reasoning:"low",variable:"skillRoot only"}
 };
}

export function buildPrompt(brief){
 return `Lane: ${brief.lane}\nJob: ${brief.brief}\n\nUse the supplied Shine skill directly. This is a locked benchmark brief: do not ask questions. Edit only design.json. Preserve version, briefId, category, lane, and cite. Make direction.name, direction.principle, copy, metrics, rows, fields, and insight specific to this exact job. Choose a distinctive information hierarchy and editorial voice grounded in shine-packet.json. Do not create index.html, install packages, run tests, or run proof; the harness owns deterministic contract rendering and independent verification. Finish as soon as design.json is valid JSON with no placeholders.`;
}

function preseedArtifact({brief,skillRoot,app}){const packet=spawnSync(process.execPath,[join(skillRoot,"core/design-packet.mjs"),"--job",brief.brief,"--lane",brief.lane,"--mode","new","--project",app],{encoding:"utf8",env:{...process.env,SHINE_ROOT:skillRoot}});if(packet.status!==0)throw new Error(`design packet failed: ${packet.stderr||packet.stdout}`);const data=JSON.parse(packet.stdout);writeFileSync(join(app,"shine-packet.json"),JSON.stringify(data,null,2));writeFileSync(join(app,"design.json"),JSON.stringify(seedDesignSpec({brief,packet:data}),null,2));return data}

function materializeArtifact({brief,app}){const specPath=join(app,"design.json");if(!existsSync(specPath))throw new Error("design.json missing");const spec=JSON.parse(readFileSync(specPath,"utf8"));const errors=validateDesignSpec(spec,{brief});if(errors.length)throw new Error(`invalid design spec: ${errors.join("; ")}`);writeFileSync(join(app,"index.html"),renderDesignSpec(spec));return spec;}

function proveArtifact({brief,skillRoot,app,outDir,receiptPath}){const artifact=join(app,"index.html"),source=readFileSync(artifact),artifactSha256=sha(source),selectedKits=[...String(source).matchAll(/data-cite=["']([^"']+)/g)].map(x=>x[1]),cite=selectedKits[0],shot=join(outDir,"screenshot.png"),measureJson=join(outDir,"measure.json");const measure=spawnSync(process.execPath,[join(skillRoot,"verify/measure.mjs"),artifact,"--shot",shot,"--json",measureJson,"--cite",cite],{encoding:"utf8",timeout:120000});writeFileSync(join(outDir,"measure.log"),`${measure.stdout||""}${measure.stderr||""}`);const compare=measure.status===0?spawnSync(process.execPath,[join(skillRoot,"verify/compare.mjs"),artifact,"--cite",cite,"--brief",brief.brief,"--lane",brief.lane,"--out",join(outDir,"compare.png")],{encoding:"utf8",timeout:120000,env:{...process.env,SHINE_RECEIPT:receiptPath}}):{status:1,stdout:"",stderr:"measure failed"};writeFileSync(join(outDir,"compare.log"),`${compare.stdout||""}${compare.stderr||""}`);const receipt=readReceipt(receiptPath,artifactSha256);return {artifact,source,artifactSha256,selectedKits,shot,measure,compare,receipt};}

export function validateRunRecord(record){
 const gaps=[];
 if(record.status!=="finished")gaps.push(`run status ${record.status||"missing"}`);
 if(!record.runId)gaps.push("run id missing");
 if(!record.agentId)gaps.push("agent id missing");
 if(!record.transcript?.length)gaps.push("transcript empty");
 if(!record.artifactSha256)gaps.push("artifact missing");
 if(record.artifactBytes<1000)gaps.push(`artifact too small ${record.artifactBytes||0}`);
 if(record.build?.status!==0)gaps.push("production build failed");
 if(record.measure?.status!==0)gaps.push("independent measure failed");
 if(!record.screenshot)gaps.push("screenshot missing");
 if(record.interaction?.status!=="pass")gaps.push("real task interaction failed");
 if(!record.receipt?.verdict||record.receipt.verdict!=="pass")gaps.push("compare receipt missing or failed");
 if(record.receipt?.artifactSha256!==record.artifactSha256)gaps.push("receipt is not bound to artifact");
 if(!record.selectedKits?.length)gaps.push("selected kit missing");
 if(record.usage?.finishReason&&record.usage.finishReason!=="stop")gaps.push(`incomplete finish ${record.usage.finishReason}`);
 if(record.elapsedMs>BUDGETS.timeoutMs)gaps.push(`runtime budget exceeded ${record.elapsedMs}ms`);
 const input=record.usage?.input_tokens||record.usage?.inputTokens||0,cached=record.usage?.cached_input_tokens||record.usage?.cachedInputTokens||0;
 if(input-cached>BUDGETS.maxFreshInputTokens)gaps.push("fresh input token budget exceeded");
 if((record.usage?.output_tokens||record.usage?.outputTokens||0)>BUDGETS.maxOutputTokens)gaps.push("output token budget exceeded");
 return gaps;
}

function prepareHome(home,skillRoot,agentFile){
 mkdirSync(join(home,".agents/skills"),{recursive:true});mkdirSync(join(home,".cursor/skills"),{recursive:true});mkdirSync(join(home,".Codex/agents"),{recursive:true});mkdirSync(join(home,".cursor/agents"),{recursive:true});
 symlinkSync(join(skillRoot,"skill"),join(home,".agents/skills/shine"));symlinkSync(join(skillRoot,"skill"),join(home,".cursor/skills/shine"));
 symlinkSync(agentFile,join(home,".Codex/agents/shine-ux.md"));symlinkSync(agentFile,join(home,".cursor/agents/shine-ux.md"));
}

function parseCodexEvents(stdout){
 const events=[];for(const line of String(stdout||"").split("\n")){if(!line.trim())continue;try{events.push(JSON.parse(line))}catch{events.push({type:"unparsed",text:line})}}
 return events;
}

function codexRunIdentity(events){
 const thread=events.find(x=>x.type==="thread.started")?.thread_id||events.find(x=>x.thread_id)?.thread_id||null;
 const reverse=[...events].reverse();return {thread,turn:reverse.find(x=>x.type==="turn.completed"),failed:reverse.find(x=>x.type==="turn.failed")};
}

function execFileRecord(file,args,options){return new Promise(resolve=>execFile(file,args,options,(error,stdout,stderr)=>resolve({status:error?.code==="ETIMEDOUT"?null:typeof error?.code==="number"?error.code:error?1:0,error,stdout,stderr})));}
function spawnRecord(file,args,{cwd,env,timeout,maxBuffer=64*1024*1024}){return new Promise(resolve=>{const child=spawn(file,args,{cwd,env,stdio:["pipe","pipe","pipe"]});const stdout=[],stderr=[];let bytes=0,timedOut=false,settled=false,timer;const finish=(status,error=null)=>{if(settled)return;settled=true;clearTimeout(timer);resolve({status:timedOut?null:status,error:timedOut?Object.assign(new Error(`agent timeout ${timeout}ms`),{code:"ETIMEDOUT"}):error,stdout:Buffer.concat(stdout).toString(),stderr:Buffer.concat(stderr).toString()})};for(const [stream,parts] of [[child.stdout,stdout],[child.stderr,stderr]])stream.on("data",chunk=>{bytes+=chunk.length;if(bytes>maxBuffer){child.kill("SIGTERM");finish(1,new Error(`agent output exceeded ${maxBuffer} bytes`));return}parts.push(chunk)});child.on("error",error=>finish(1,error));child.on("close",code=>finish(code??1));child.stdin.end();timer=setTimeout(()=>{timedOut=true;child.kill("SIGTERM")},timeout);});}

function readReceipt(path,artifactSha256){
 if(!existsSync(path))return null;const data=JSON.parse(readFileSync(path,"utf8"));const receipts=Array.isArray(data.receipts)?data.receipts:[data];return receipts.find(x=>x.artifactSha256===artifactSha256)||null;
}

export function hydrateRunRecord(record){
 if(record.receipt||!record.artifact||!record.artifactSha256)return record;
 const app=dirname(record.artifact),outDir=dirname(app),candidates=[join(outDir,"compare-receipt.json"),join(app,"last-prove.json"),join(app,"artifacts/last-prove.json"),join(app,"proof/last-prove.json")];
 const receipt=candidates.map(path=>readReceipt(path,record.artifactSha256)).find(Boolean)||null;
 return receipt?{...record,receipt,gaps:[]} : record;
}

function acquireLock(lock){
 try{const fd=openSync(lock,"wx");writeFileSync(fd,String(process.pid));return fd}catch(error){
  if(error.code!=="EEXIST")throw error;
  const pid=Number(readFileSync(lock,"utf8"));let alive=Number.isInteger(pid)&&pid>0;
  if(alive)try{process.kill(pid,0)}catch{alive=false}
  if(alive)throw new Error(`production benchmark already running as pid ${pid}`);
  rmSync(lock,{force:true});const fd=openSync(lock,"wx");writeFileSync(fd,String(process.pid));return fd;
 }
}

async function verifyInteraction(artifact,shot){
 const browser=await chromium.launch({headless:true});
 try{const page=await browser.newPage({viewport:{width:1280,height:900}});await page.goto(`file://${artifact}`);await page.screenshot({path:shot,fullPage:true});const control=page.locator("[data-task-control]").first(),result=page.locator("[data-task-result]").first();if(await control.count()!==1||await result.count()!==1)return {status:"fail",reason:"task markers missing"};const before=await result.evaluate(el=>({text:el.textContent,html:el.innerHTML,hidden:el.hidden,aria:el.getAttribute("aria-expanded")}));const tag=await control.evaluate(el=>el.tagName.toLowerCase()),type=await control.getAttribute("type");if(tag==="input"&&(type==="search"||type==="text"||!type))await control.fill("__shine_task_probe__");else if(tag==="select")await control.selectOption({index:1});else await control.click();await page.waitForTimeout(150);const after=await result.evaluate(el=>({text:el.textContent,html:el.innerHTML,hidden:el.hidden,aria:el.getAttribute("aria-expanded")}));return {status:JSON.stringify(before)!==JSON.stringify(after)?"pass":"fail",before,after};}finally{await browser.close()}
}

export async function runCursorProduction({brief,skillRoot,outDir,apiKey=process.env.CURSOR_API_KEY,model=MODEL}){
 if(!apiKey)throw new Error("CURSOR_API_KEY is required");
 const {Agent}=await import("@cursor/sdk");
 const lock=join(dirname(outDir),`.${basename(outDir)}.production-agent.lock`);mkdirSync(dirname(outDir),{recursive:true});const lockFd=acquireLock(lock);
 try{
  rmSync(outDir,{recursive:true,force:true});mkdirSync(outDir,{recursive:true});
  const home=join(outDir,"home"),app=join(outDir,"app"),receiptPath=join(outDir,"compare-receipt.json");mkdirSync(app,{recursive:true});
  const agentFile=join(skillRoot,"agents/shine-ux.md");prepareHome(home,skillRoot,agentFile);
  writeFileSync(join(app,"AGENTS.md"),`# Benchmark execution\nRead ${join(skillRoot,"skill/SKILL.md")} completely and obey it. The shine-ux agent is provided by the harness. Only write inside this app.\n`);
  writeFileSync(join(app,"package.json"),JSON.stringify({private:true,scripts:{build:"vite build"},devDependencies:{vite:"6.1.0"}},null,2));
  spawnSync("git",["init"],{cwd:app,encoding:"utf8"});
  const steps=[];const oldHome=process.env.HOME,oldReceipt=process.env.SHINE_RECEIPT;process.env.HOME=home;process.env.SHINE_RECEIPT=receiptPath;
  let agent;
  try{
   agent=await Agent.create({apiKey,model:{id:model},local:{cwd:app,dirs:[skillRoot],autoReview:true,settingSources:["project"]},agents:{"shine-ux":{description:"Shine UI/UX director",prompt:readFileSync(agentFile,"utf8"),model:"inherit"}},name:`shine-${brief.id}`});
   const run=await agent.send(buildPrompt(brief),{model:{id:model},mode:"agent",onStep:({step})=>steps.push(step)});
   const timeoutMs=Number(process.env.SHINE_AGENT_TIMEOUT_MS||900000);let timer;const timed=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(`agent timeout ${timeoutMs}ms`)),timeoutMs)});let result;try{result=await Promise.race([run.wait(),timed])}catch(error){if(run.supports("cancel"))await run.cancel();throw error}finally{clearTimeout(timer)}const conversation=run.supports("conversation")?await run.conversation():[];
   writeFileSync(join(outDir,"tool-trace.json"),JSON.stringify(steps,null,2));writeFileSync(join(outDir,"transcript.json"),JSON.stringify(conversation,null,2));writeFileSync(join(outDir,"run-result.json"),JSON.stringify(result,null,2));
   const artifact=join(app,"index.html"),source=existsSync(artifact)?readFileSync(artifact):Buffer.alloc(0),artifactSha256=source.length?sha(source):null;
   const vite=join(ROOT,"verify/fixtures/integrations/node_modules/.bin/vite");const build=spawnSync(vite,["build"],{cwd:app,encoding:"utf8",env:{...process.env,HOME:home}});writeFileSync(join(outDir,"build.log"),`${build.stdout||""}${build.stderr||""}`);
   const receiptCandidates=[receiptPath,join(app,"last-prove.json"),join(app,"artifacts/last-prove.json"),join(app,"proof/last-prove.json"),join(home,".cache/shine/last-prove.json")];
   const receipt=artifactSha256?receiptCandidates.map(path=>readReceipt(path,artifactSha256)).find(Boolean)||null:null;
   const selectedKits=[...String(source).matchAll(/data-cite=["']([^"']+)/g)].map(x=>x[1]);
   const shot=join(outDir,"screenshot.png"),measureJson=join(outDir,"measure.json"),cite=selectedKits[0];const measure=cite?spawnSync(process.execPath,[join(skillRoot,"verify/measure.mjs"),artifact,"--shot",shot,"--json",measureJson,"--cite",cite],{encoding:"utf8",timeout:120000,env:{...process.env,HOME:oldHome}}):{status:1,stdout:"",stderr:"no cite"};writeFileSync(join(outDir,"measure.log"),`${measure.stdout||""}${measure.stderr||""}`);const interaction=source.length?await verifyInteraction(artifact,shot):{status:"fail",reason:"artifact missing"};writeFileSync(join(outDir,"interaction.json"),JSON.stringify(interaction,null,2));
   const record={version:1,surface:"cursor-sdk-local",arm:brief.arm,brief:brief.id,model,agentId:agent.agentId,runId:result.id,status:result.status,error:result.error||null,result:result.result,usage:result.usage,artifact,artifactSha256,artifactBytes:source.length,selectedKits:[...new Set(selectedKits)],transcript:conversation,toolTrace:steps,build:{status:build.status,log:"build.log"},measure:{status:measure.status,log:"measure.log",json:"measure.json"},screenshot:existsSync(shot),interaction,receipt};
   record.gaps=validateRunRecord(record);writeFileSync(join(outDir,"record.json"),JSON.stringify(record,null,2));return record;
  } finally {if(agent)await agent[Symbol.asyncDispose]();process.env.HOME=oldHome;if(oldReceipt===undefined)delete process.env.SHINE_RECEIPT;else process.env.SHINE_RECEIPT=oldReceipt;}
 } finally {closeSync(lockFd);rmSync(lock,{force:true});}
}

export async function runCodexProduction({brief,skillRoot,outDir,model=MODEL}){
 if(!existsSync(CODEX))throw new Error(`Codex CLI missing: ${CODEX}`);
 const lock=join(dirname(outDir),`.${basename(outDir)}.production-agent.lock`);mkdirSync(dirname(outDir),{recursive:true});const lockFd=acquireLock(lock);
 try{
  rmSync(outDir,{recursive:true,force:true});mkdirSync(outDir,{recursive:true});
  const app=join(outDir,"app"),receiptPath=join(outDir,"compare-receipt.json"),lastMessage=join(outDir,"last-message.txt");mkdirSync(app,{recursive:true});
  writeFileSync(join(app,"package.json"),JSON.stringify({private:true,scripts:{build:"vite build"},devDependencies:{vite:"6.1.0"}},null,2));spawnSync("git",["init"],{cwd:app,encoding:"utf8"});
  const packet=preseedArtifact({brief,skillRoot,app});
  writeFileSync(join(app,"AGENTS.md"),`# Native Shine benchmark\nRead ${join(skillRoot,"skill/SKILL.md")} completely before acting. Execute it directly in this task. Only write design.json. The benchmark harness, brief, and model are fixed; the supplied Shine tree is the only experimental variable. The bounded design packet and seeded schema are ready. Do not rediscover the root or perform implementation/proof mechanics.\n`);
  const started=Date.now(),timeout=Number(process.env.SHINE_AGENT_TIMEOUT_MS||BUDGETS.timeoutMs),args=["exec","--json","--ephemeral","--ignore-user-config","--ignore-rules","--approve-for-me","--model",model,"--config",'model_reasoning_effort="low"',"--cd",app,"--output-last-message",lastMessage,buildPrompt(brief)];
  const run=await spawnRecord(CODEX,args,{cwd:app,timeout,maxBuffer:64*1024*1024,env:{...process.env,SHINE_ROOT:skillRoot,SHINE_PRESEEDED:packet?.starter?"1":"",SHINE_RECEIPT:receiptPath}}),events=parseCodexEvents(run.stdout),identity=codexRunIdentity(events);writeFileSync(join(outDir,"tool-trace.json"),JSON.stringify(events,null,2));writeFileSync(join(outDir,"transcript.json"),JSON.stringify(events.filter(x=>/message|item/.test(x.type||"")),null,2));writeFileSync(join(outDir,"run.log"),`${run.stdout||""}\nSTDERR\n${run.stderr||""}`);
  let specError=null;try{materializeArtifact({brief,app})}catch(error){specError=error}const artifact=join(app,"index.html"),source=existsSync(artifact)?readFileSync(artifact):Buffer.alloc(0),vite=join(ROOT,"verify/fixtures/integrations/node_modules/vite/bin/vite.js"),build=source.length?spawnSync(process.execPath,[vite,"build"],{cwd:app,encoding:"utf8"}):{status:1,stdout:"",stderr:String(specError||"artifact missing")};writeFileSync(join(outDir,"build.log"),`${build.stdout||""}${build.stderr||""}`);const proof=source.length?proveArtifact({brief,skillRoot,app,outDir,receiptPath}):{artifact,source,artifactSha256:null,selectedKits:[],shot:join(outDir,"screenshot.png"),measure:{status:1},receipt:null};const {artifactSha256,selectedKits,shot,measure,receipt}=proof;const interaction=source.length?await verifyInteraction(artifact,shot):{status:"fail",reason:String(specError||"artifact missing")};writeFileSync(join(outDir,"interaction.json"),JSON.stringify(interaction,null,2));
  const timedOut=run.error?.code==="ETIMEDOUT",status=run.status===0&&!identity.failed?"finished":"error",usage=identity.turn?.usage||{},runError=timedOut?{message:`agent timeout ${timeout}ms`}:(identity.failed||run.error||run.status!==0)?{message:identity.failed?.error?.message||run.error?.message||`exit ${run.status}`} :null,record={version:1,surface:"codex-cli-native",elapsedMs:Date.now()-started,arm:brief.arm,brief:brief.id,model,agentId:"shine-native",runId:identity.thread,status,error:runError,result:existsSync(lastMessage)?readFileSync(lastMessage,"utf8"):null,usage:{...usage,finishReason:status==="finished"?"stop":timedOut?"timeout":"error"},artifact,artifactSha256,artifactBytes:source.length,selectedKits:[...new Set(selectedKits)],transcript:events,toolTrace:events,build:{status:build.status,log:"build.log"},measure:{status:measure.status,log:"measure.log",json:"measure.json"},screenshot:existsSync(shot),interaction,receipt};
  record.gaps=validateRunRecord(record);writeFileSync(join(outDir,"record.json"),JSON.stringify(record,null,2));return record;
 } finally {closeSync(lockFd);rmSync(lock,{force:true});}
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const arg=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null};const briefId=arg("--brief"),skillRoot=realpathSync(resolve(arg("--skill-root")||".")),outDir=resolve(arg("--out")||join("/private/tmp","shine-agent",briefId||"run"));
 const briefs=JSON.parse(readFileSync(join(ROOT,"benchmark/briefs.json"),"utf8"));const brief=briefs.find(x=>x.id===briefId);if(!brief)throw new Error(`unknown brief ${briefId}`);brief.arm=arg("--arm")||"current";
 const surface=arg("--surface")||"codex",record=surface==="cursor"?await runCursorProduction({brief,skillRoot,outDir}):await runCodexProduction({brief,skillRoot,outDir});console.log(JSON.stringify({record:join(outDir,"record.json"),status:record.status,gaps:record.gaps},null,2));if(record.gaps.length)process.exit(1);
}
