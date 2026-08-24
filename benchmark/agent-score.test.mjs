import assert from "node:assert/strict";
import {scoreAgentCorpus} from "./agent-score.mjs";
const briefs=Array.from({length:4},(_,i)=>({id:`brief-${i}`,category:"dashboard"}));
const record=(arm,i)=>({arm,brief:`brief-${i}`,status:"finished",runId:`r-${arm}-${i}`,agentId:`a-${arm}-${i}`,transcript:[{}],artifactSha256:`sha-${arm}-${i}`,artifactBytes:2000,build:{status:0},measure:{status:0},screenshot:true,interaction:{status:"pass"},receipt:{verdict:"pass",artifactSha256:`sha-${arm}-${i}`,proof:{structureFingerprint:`${arm}-${i}`,pagePalette:[i],templatePalette:["kit"]}},selectedKits:["kit"],visiblePhrases:[`Brief ${i} evidence`],decisionData:[i]});
const good=[...briefs.map((_,i)=>record("baseline",i)),...briefs.map((_,i)=>record("current",i))];assert.equal(scoreAgentCorpus({briefs,records:good}).automatedGate,"pass");
for(let n=0;n<20;n++){const missing=good.slice(1);assert.match(scoreAgentCorpus({briefs,records:missing}).gaps.join(" "),/population 3\/4/);const clone=structuredClone(good);for(const x of clone.filter(x=>x.arm==="current")){x.receipt.proof.structureFingerprint="same";x.visiblePhrases=["same generic evidence phrase"];x.decisionData=[18,6,42,8]}assert.match(scoreAgentCorpus({briefs,records:clone}).gaps.join(" "),/current quality/)}
console.log("agent corpus score PASS: population and clone/copy/data failures bite 20/20; valid causal corpus passes");
