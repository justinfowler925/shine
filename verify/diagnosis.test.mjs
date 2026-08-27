import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {readDiagnosis,seedDiagnosis,validateDiagnosis} from "../core/diagnosis.mjs";

const blank=seedDiagnosis({job:"Fix the customer support queue",category:"datagrid"});
assert.match(validateDiagnosis(blank,{requireFiles:false}).join(" "),/primaryTask/);
const dir=mkdtempSync(join(tmpdir(),"shine-diagnosis-")),artifact=join(dir,"before.html"),shot=join(dir,"before.png"),file=join(dir,"diagnosis.json");
writeFileSync(artifact,"<!doctype html>");writeFileSync(shot,"png");
const valid={...blank,primaryTask:"Triage unresolved support requests and assign an owner",before:{artifact,screenshot:shot},defects:[
 {bucket:"usability",severity:"major",problem:"The next action is hidden below the fold",evidence:"Primary control begins after the first viewport",expectedEffect:"Agents can assign an owner without hunting"},
 {bucket:"completeness",severity:"major",problem:"The empty state offers no recovery action",evidence:"Empty fixture renders only a heading and paragraph",expectedEffect:"Agents can clear filters or create a request"},
 {bucket:"composition",severity:"minor",problem:"The toolbar is visually detached from the records",evidence:"A large unrelated panel separates controls from results",expectedEffect:"Controls read as operating on the visible queue"}
]};
assert.deepEqual(validateDiagnosis(valid),[]);writeFileSync(file,JSON.stringify(valid));assert.match(readDiagnosis(file).hash,/^[a-f0-9]{64}$/);
const weak=structuredClone(valid);weak.defects=[valid.defects[2]];assert.match(validateDiagnosis(weak).join(" "),/3–8/);
console.log("diagnosis PASS: existing-surface evidence is required and hashed");
