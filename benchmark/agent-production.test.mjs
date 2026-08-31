import assert from "node:assert/strict";
import {buildPrompt,discoverProductionEntries,hydrateRunRecord,validateRunRecord} from "./agent-production.mjs";
const good={status:"finished",runId:"run-1",agentId:"agent-1",transcript:[{}],artifactSha256:"abc",artifactBytes:2000,build:{status:0},measure:{status:0},screenshot:true,interaction:{status:"pass"},receipt:{verdict:"pass",artifactSha256:"abc"},selectedKits:["untitled-table"],usage:{finishReason:"stop"}};
assert.deepEqual(validateRunRecord(good),[]);
for(const [name,mutate,needle] of [
 ["status",x=>x.status="error",/run status/],["zero transcript",x=>x.transcript=[],/transcript empty/],["zero artifact",x=>x.artifactBytes=0,/too small/],["build",x=>x.build.status=1,/build failed/],["measure",x=>x.measure.status=1,/measure failed/],["screenshot",x=>x.screenshot=false,/screenshot missing/],["interaction",x=>x.interaction.status="fail",/interaction failed/],["receipt",x=>x.receipt=null,/receipt missing/],["binding",x=>x.receipt.artifactSha256="wrong",/not bound/],["kit",x=>x.selectedKits=[],/selected kit/],["truncation",x=>x.usage.finishReason="length",/incomplete finish/]
])for(let i=0;i<20;i++){const seeded=structuredClone(good);mutate(seeded);assert.match(validateRunRecord(seeded).join(" "),needle,`${name} escaped`)}
assert.match(buildPrompt({lane:"internal",brief:"fraud queue"}),/shine-packet\.json/);
assert.match(buildPrompt({lane:"internal",brief:"fraud queue"}),/Edit only design\.json/);
for(const [name,mutate,needle] of [["runtime budget",x=>x.elapsedMs=180001,/runtime budget/],["fresh input budget",x=>{x.usage.input_tokens=500001;x.usage.cached_input_tokens=399999},/fresh input token budget/],["cached input excluded",x=>{x.usage.input_tokens=500001;x.usage.cached_input_tokens=450001},null],["output budget",x=>x.usage.output_tokens=12001,/output token budget/]]){const seeded=structuredClone(good);mutate(seeded);const gaps=validateRunRecord(seeded).join(" ");if(needle)assert.match(gaps,needle,name);else assert.doesNotMatch(gaps,/input token budget/,name)}
const entries=discoverProductionEntries({cursorApiKey:"present"});assert.equal(entries.codex.available,true);assert.equal(entries.cursor.available,true);assert.equal(entries.causalHarness.variable,"skillRoot only");
assert.equal(hydrateRunRecord(good),good);
console.log("production-agent contract PASS: 11 fail paths bite 20/20; positive path and dual entry discovery pass");
