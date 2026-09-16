import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {buckets,readDiagnosis,seedDiagnosis,validateDiagnosis} from "../core/diagnosis.mjs";

const blank=seedDiagnosis({job:"Fix the customer support queue",category:"datagrid"});
assert.match(validateDiagnosis(blank,{requireFiles:false}).join(" "),/primaryTask/);
assert.equal(blank.defects.length,1,"the seed must not pre-populate a defect quota");
assert.match(blank.guidance,/no-change/);
const dir=mkdtempSync(join(tmpdir(),"shine-diagnosis-")),artifact=join(dir,"before.html"),shot=join(dir,"before.png"),file=join(dir,"diagnosis.json");
writeFileSync(artifact,"<!doctype html>");writeFileSync(shot,"png");
const valid={...blank,primaryTask:"Triage unresolved support requests and assign an owner",before:{artifact,screenshot:shot},defects:[
 {bucket:"usability",severity:"major",problem:"The next action is hidden below the fold",evidence:"Primary control begins after the first viewport",expectedEffect:"Agents can assign an owner without hunting"},
 {bucket:"completeness",severity:"major",problem:"The empty state offers no recovery action",evidence:"Empty fixture renders only a heading and paragraph",expectedEffect:"Agents can clear filters or create a request"},
 {bucket:"composition",severity:"minor",problem:"The toolbar is visually detached from the records",evidence:"A large unrelated panel separates controls from results",expectedEffect:"Controls read as operating on the visible queue"}
]};
assert.deepEqual(validateDiagnosis(valid),[]);writeFileSync(file,JSON.stringify(valid));assert.match(readDiagnosis(file).hash,/^[a-f0-9]{64}$/);
assert.equal(readDiagnosis(file).verdict,"defects");

// One real, minor defect is a complete diagnosis. The 3-defect floor and the
// critical/major requirement forced invented findings and inflated severities.
const single=structuredClone(valid);single.defects=[valid.defects[2]];
assert.deepEqual(validateDiagnosis(single),[],"a single minor defect must validate");
const none=structuredClone(valid);none.defects=[];
assert.match(validateDiagnosis(none).join(" "),/1–8/,"zero defects without a verdict must fail and point at no-change");
const nine=structuredClone(valid);nine.defects=Array.from({length:9},()=>valid.defects[0]);
assert.match(validateDiagnosis(nine).join(" "),/1–8/);

// no-change: the honest exit for a sound surface.
const sound={...valid,verdict:"no-change",defects:[],checked:[...buckets],verdictEvidence:"Exercised assign-owner flow at 390/1280; measure exits 0; every state renders; no composition or craft finding survived the screenshot review"};
assert.deepEqual(validateDiagnosis(sound),[],"a no-change verdict with evidence and full bucket coverage must validate");
writeFileSync(file,JSON.stringify(sound));assert.equal(readDiagnosis(file).verdict,"no-change");
const lazy={...sound,verdictEvidence:"looks fine"};
assert.match(validateDiagnosis(lazy).join(" "),/verdictEvidence/,"no-change without evidence must fail");
const partial={...sound,checked:["usability","craft"]};
assert.match(validateDiagnosis(partial).join(" "),/missing completeness, composition, adoption/,"no-change must prove every bucket was checked");
const contradictory={...sound,defects:[valid.defects[0]]};
assert.match(validateDiagnosis(contradictory).join(" "),/cannot carry defects/);
assert.match(validateDiagnosis({...sound,verdict:"maybe"}).join(" "),/verdict must be/);

console.log("diagnosis PASS: evidence hashed · 1–8 real defects · no-change verdict requires evidence and full bucket coverage");
