import assert from "node:assert/strict";
import {buildPrompt,discoverProductionEntries,hydrateRunRecord,validateRunRecord} from "./agent-production.mjs";
const good={status:"finished",runId:"run-1",agentId:"agent-1",transcript:[{}],artifactSha256:"abc",artifactBytes:2000,build:{status:0},measure:{status:0},screenshot:true,interaction:{status:"pass"},receipt:{verdict:"pass",artifactSha256:"abc"},selectedKits:["carbon-datatable"],usage:{finishReason:"stop"}};
assert.deepEqual(validateRunRecord(good),[]);
for(const [name,mutate,needle] of [
 ["status",x=>x.status="error",/run status/],["zero transcript",x=>x.transcript=[],/transcript empty/],["zero artifact",x=>x.artifactBytes=0,/too small/],["build",x=>x.build.status=1,/build failed/],["measure",x=>x.measure.status=1,/measure failed/],["screenshot",x=>x.screenshot=false,/screenshot missing/],["interaction",x=>x.interaction.status="fail",/interaction failed/],["receipt",x=>x.receipt=null,/receipt missing/],["binding",x=>x.receipt.artifactSha256="wrong",/not bound/],["kit",x=>x.selectedKits=[],/selected kit/],["truncation",x=>x.usage.finishReason="length",/incomplete finish/]
])for(let i=0;i<20;i++){const seeded=structuredClone(good);mutate(seeded);assert.match(validateRunRecord(seeded).join(" "),needle,`${name} escaped`)}
assert.match(buildPrompt({lane:"internal",brief:"fraud queue"}),/execute the shine-ux role natively/);
const entries=discoverProductionEntries({cursorApiKey:"present"});assert.equal(entries.codex.available,true);assert.equal(entries.cursor.available,true);assert.equal(entries.causalHarness.variable,"skillRoot only");
assert.equal(hydrateRunRecord(good),good);
console.log("production-agent contract PASS: 11 fail paths bite 20/20; positive path and dual entry discovery pass");
