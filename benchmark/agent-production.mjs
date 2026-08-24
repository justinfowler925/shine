#!/usr/bin/env node
import {Agent} from "@cursor/sdk";
import {chromium} from "playwright";
import {createHash} from "node:crypto";
import {closeSync,existsSync,mkdirSync,openSync,readFileSync,rmSync,symlinkSync,writeFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const CODEX="/Applications/ChatGPT.app/Contents/Resources/codex";
const MODEL="gpt-5.4";
const sha=value=>createHash("sha256").update(value).digest("hex");

export function discoverProductionEntries({cursorApiKey=process.env.CURSOR_API_KEY}={}){
 return {
  codex:{available:existsSync(CODEX),entry:`${CODEX} exec --json`,skill:"~/.agents/skills/shine",agent:"~/.Codex/agents/shine-ux.md"},
  cursor:{available:Boolean(cursorApiKey),entry:"@cursor/sdk Agent.create local",skill:"~/.cursor/skills/shine",agent:"AgentOptions.agents[shine-ux]"},
  causalHarness:{surface:"cursor",model:MODEL,settingSources:["project"],variable:"skillRoot only"}
 };
}

export function buildPrompt(brief){
 const tasks={datagrid:"Search must change visible rows; sorting must change order; pagination must change the visible range.",dashboard:"A time-range control and the primary drilldown must change visible decision data.",form:"Validation must reject an incomplete value and successful submission must show an in-page confirmation.",marketing:"The primary product-demo action must reveal or navigate to concrete product evidence.",lex:"The primary record action must enter an editable state and saving must visibly confirm the record update.",voice:"Sending a message must append both the user turn and an assistant/tool/source state to the transcript."};
 return `Lane: ${brief.lane}\nJob: ${brief.brief}\n\nUse the Shine skill and dispatch the shine-ux agent. Build the finished interface in index.html. This is a locked benchmark brief: do not ask questions. It must be a standalone Vite-buildable page with real job-specific content and interactions, not a wireframe or generic category shell. ${tasks[brief.category]} Mark the control that starts that task with data-task-control and the visibly changing result region with data-task-result. Choose one cited direction, make at most one visual refinement pass, then run cite, measure, compare, and the DataGrid contract when applicable. Compare is the final write: do not edit index.html after it. Finish only after the artifact and artifact-bound compare receipt exist.`;
}

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
 return gaps;
}

function prepareHome(home,skillRoot,agentFile){
 mkdirSync(join(home,".agents/skills"),{recursive:true});mkdirSync(join(home,".cursor/skills"),{recursive:true});mkdirSync(join(home,".Codex/agents"),{recursive:true});mkdirSync(join(home,".cursor/agents"),{recursive:true});
 symlinkSync(join(skillRoot,"skill"),join(home,".agents/skills/shine"));symlinkSync(join(skillRoot,"skill"),join(home,".cursor/skills/shine"));
 symlinkSync(agentFile,join(home,".Codex/agents/shine-ux.md"));symlinkSync(agentFile,join(home,".cursor/agents/shine-ux.md"));
}

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
 const lock=join(dirname(outDir),".production-agent.lock");mkdirSync(dirname(outDir),{recursive:true});const lockFd=acquireLock(lock);
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

if(import.meta.url===`file://${process.argv[1]}`){
 const arg=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null};const briefId=arg("--brief"),skillRoot=resolve(arg("--skill-root")||"."),outDir=resolve(arg("--out")||join("/private/tmp","shine-agent",briefId||"run"));
 const briefs=JSON.parse(readFileSync(join(ROOT,"benchmark/briefs.json"),"utf8"));const brief=briefs.find(x=>x.id===briefId);if(!brief)throw new Error(`unknown brief ${briefId}`);brief.arm=arg("--arm")||"current";
 const record=await runCursorProduction({brief,skillRoot,outDir});console.log(JSON.stringify({record:join(outDir,"record.json"),status:record.status,gaps:record.gaps},null,2));if(record.gaps.length)process.exit(1);
}
