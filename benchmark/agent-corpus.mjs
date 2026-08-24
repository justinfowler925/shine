#!/usr/bin/env node
import {existsSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
import {hydrateRunRecord,runCodexProduction,validateRunRecord} from "./agent-production.mjs";
import {loadAgentCorpus,scoreAgentCorpus} from "./agent-score.mjs";

const ROOT=resolve(new URL("..",import.meta.url).pathname),arg=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1]};
const out=resolve(arg("--out")||"/private/tmp/shine-production-corpus"),baseline=resolve(arg("--baseline-root")||"/Users/justinfowler/Projects/shine-baseline-9f6a2cf"),current=resolve(arg("--current-root")||ROOT),only=arg("--only");
const briefs=JSON.parse(readFileSync(join(ROOT,"benchmark/briefs.json"),"utf8")).filter(x=>!only||x.id===only);mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function runWithTransientRetry(options){for(let attempt=1;attempt<=3;attempt++){const record=await runCodexProduction(options);const message=String(record.error?.message||"");if(record.status!=="error"||!/connect|fetch failed|exchange endpoint|rate limit|temporar/i.test(message)||attempt===3)return record;console.log(`RETRY transient native failure ${attempt}/3: ${message}`);await delay(attempt*5000)}}
const reusable=(arm,record)=>arm==="current"?record.gaps.length===0:record.status==="finished"&&record.transcript?.length>0&&record.artifactSha256&&record.artifactBytes>=1000&&record.build?.status===0&&record.screenshot&&record.interaction?.status==="pass";
const gitSha=root=>spawnSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).stdout.trim();
const manifest={version:1,harness:"Codex CLI native exec JSONL",model:"gpt-5.6-terra",reasoning:"medium",concurrency:Number(process.env.SHINE_AGENT_CONCURRENCY||4),configurationVariable:"skillRoot only",baseline:{sha:gitSha(baseline),root:baseline},current:{sha:gitSha(current),root:current},historicalRuntime:"not reconstructed; causal control uses one current model/harness with only the skill tree varied",humanVotes:false};writeFileSync(join(out,"manifest.json"),JSON.stringify(manifest,null,2));
const jobs=[];for(let i=0;i<briefs.length;i++)for(const arm of i%2?["current","baseline"]:["baseline","current"])jobs.push({brief:{...briefs[i],arm},arm});
async function execute({brief,arm}){const dir=join(out,arm,brief.id),existing=join(dir,"record.json");if(existsSync(existing)){const record=hydrateRunRecord(JSON.parse(readFileSync(existing,"utf8")));record.gaps=validateRunRecord(record);writeFileSync(existing,JSON.stringify(record,null,2));if(reusable(arm,record)){console.log(`SKIP ${arm}/${brief.id}`);return}}console.log(`RUN ${arm}/${brief.id}`);try{const record=await runWithTransientRetry({brief,skillRoot:arm==="baseline"?baseline:current,outDir:dir});console.log(`${record.gaps.length?"FAIL":"PASS"} ${arm}/${brief.id} ${record.gaps.join("; ")}`)}catch(error){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,"error.json"),JSON.stringify({message:error.message,stack:error.stack},null,2));console.log(`ERROR ${arm}/${brief.id}: ${error.message}`)}}
let next=0;const concurrency=Math.max(1,Math.min(4,Number(process.env.SHINE_AGENT_CONCURRENCY||4)));await Promise.all(Array.from({length:concurrency},async()=>{while(next<jobs.length){const job=jobs[next++];await execute(job)}}));
const records=loadAgentCorpus(out,briefs),score=scoreAgentCorpus({briefs,records});writeFileSync(join(out,"summary.json"),JSON.stringify(score,null,2));console.log(`CORPUS ${score.automatedGate}: ${records.length}/${briefs.length*2} runs, ${score.gaps.length} gap(s)`);if(score.gaps.length)process.exit(1);
