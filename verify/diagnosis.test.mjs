import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {
 buckets,
 emptySaasAdoptionChecks,
 emptySaasCopyChecks,
 emptySaasProductUxChecks,
 readDiagnosis,
 requiresSaasAdoptionChecks,
 requiresSaasCopyChecks,
 requiresSaasProductUxChecks,
 saasAdoptionCheckKeys,
 saasCopyCheckKeys,
 saasPageCategories,
 saasProductUxCheckKeys,
 seedDiagnosis,
 validateDiagnosis,
} from "../core/diagnosis.mjs";

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

// M3a: saas Operate page diagnoses require product-UX check field presence.
assert.ok(saasPageCategories.has("dashboard"));
assert.deepEqual(saasProductUxCheckKeys,["primaryTaskCheck","emptyErrorTriadCheck","competingCtaCheck"]);
assert.equal(requiresSaasProductUxChecks({lane:"saas",category:"dashboard"}),true);
assert.equal(requiresSaasProductUxChecks({lane:"saas",category:"marketing"}),false);
assert.equal(requiresSaasProductUxChecks({category:"dashboard"}),false,"missing lane stays backward-compatible");
assert.equal(requiresSaasProductUxChecks({lane:"internal",category:"dashboard"}),false);

const saasProductChecks={
 primaryTaskCheck:{ok:false,note:"Assign owner is below the fold at 1280; primary job is not startable in 3s"},
 emptyErrorTriadCheck:{ok:true,note:"Loading, empty, and error are distinct; filtered-empty shows Clear filters"},
 competingCtaCheck:{ok:true,note:"Single filled Assign primary; secondary actions are outline only"},
};
const saasCopyChecks={
 copyHeadlineCheck:{ok:true,note:"H1 names the support queue and the assign-owner job"},
 copyBeliefCheck:{ok:true,note:"Beliefs 1–5 mapped; proof sits next to time-to-value claim"},
 copyInstructionalCheck:{ok:true,note:"Empty and error states name the next fix, not only the fault"},
};
const saasAdoptionChecks={
 adoptionRitualCheck:{ok:true,note:"Daily triage standup projects this queue first"},
 adoptionPrivateWinCheck:{ok:true,note:"Agents see the three tickets their lead will raise"},
 adoptionAbsenceCheck:{ok:true,note:"A week offline would leave owners unassigned before SLA"},
};
const saasChecks={...saasProductChecks,...saasCopyChecks,...saasAdoptionChecks};
const saasValid={...valid,lane:"saas",category:"datagrid",...saasChecks};
assert.deepEqual(validateDiagnosis(saasValid),[],"saas page with product-UX+copy+adoption checks must validate");
assert.deepEqual(validateDiagnosis({...valid,category:"dashboard"},{lane:"saas"}).filter((e)=>/primaryTaskCheck|emptyErrorTriadCheck|competingCtaCheck/.test(e)).length,3,"options.lane=saas requires the three product-UX checks");
assert.equal(requiresSaasCopyChecks({lane:"saas",category:"datagrid"}),true);
assert.equal(requiresSaasAdoptionChecks({lane:"saas",category:"datagrid"}),true);

const missingChecks={...valid,lane:"saas",category:"form"};
const missingErrors=validateDiagnosis(missingChecks,{requireFiles:false});
for(const key of saasProductUxCheckKeys)assert.match(missingErrors.join(" "),new RegExp(key),"each saas product-UX check must be required");
for(const key of saasCopyCheckKeys)assert.match(missingErrors.join(" "),new RegExp(key),"each saas copy check must be required");
for(const key of saasAdoptionCheckKeys)assert.match(missingErrors.join(" "),new RegExp(key),"each saas adoption check must be required");

const shortNote={...saasValid,primaryTaskCheck:{ok:true,note:"ok"}};
assert.match(validateDiagnosis(shortNote,{requireFiles:false}).join(" "),/primaryTaskCheck\.note/);

const badOk={...saasValid,competingCtaCheck:{ok:"yes",note:"Competing CTAs reviewed against weight budget"}};
assert.match(validateDiagnosis(badOk,{requireFiles:false}).join(" "),/competingCtaCheck\.ok/);

// Marketing needs copy checks, not product-UX or adoption.
const marketing={...valid,lane:"saas",category:"marketing",...saasCopyChecks};
assert.deepEqual(validateDiagnosis(marketing),[],"marketing saas diagnoses need copy checks only");
assert.equal(requiresSaasProductUxChecks(marketing),false);
assert.equal(requiresSaasAdoptionChecks(marketing),false);
assert.match(validateDiagnosis({...valid,lane:"saas",category:"marketing"},{requireFiles:false}).join(" "),/copyHeadlineCheck/);

// Seed with lane=saas + Operate category stubs product+copy+adoption checks.
const saasSeed=seedDiagnosis({job:"Fix the weekly revenue dashboard",category:"dashboard",lane:"saas"});
assert.equal(saasSeed.lane,"saas");
for(const key of saasProductUxCheckKeys)assert.deepEqual(saasSeed[key],{ok:false,note:""});
for(const key of saasCopyCheckKeys)assert.deepEqual(saasSeed[key],{ok:false,note:""});
for(const key of saasAdoptionCheckKeys)assert.deepEqual(saasSeed[key],{ok:false,note:""});
assert.ok("dualFocalCheck" in saasSeed&&"kpiSoupCheck" in saasSeed&&"citeHonestyCheck" in saasSeed);
assert.equal(saasSeed.restructureRequired,false);
assert.ok(Array.isArray(saasSeed.restructureOps));
assert.match(validateDiagnosis({...saasSeed,primaryTask:"Decide which revenue exception to open next",before:{artifact,screenshot:shot}},{requireFiles:false}).join(" "),/note is missing/);
assert.match(saasSeed.guidance,/primaryTaskCheck/);
assert.match(saasSeed.guidance,/copy\/adoption/);
assert.match(saasSeed.guidance,/emit-restructure|shine-restructure/);
assert.deepEqual(emptySaasProductUxChecks().primaryTaskCheck,{ok:false,note:""});
assert.deepEqual(emptySaasCopyChecks().copyHeadlineCheck,{ok:false,note:""});
assert.deepEqual(emptySaasAdoptionChecks().adoptionRitualCheck,{ok:false,note:""});

// no-change on saas pages still needs the product-UX + copy + adoption checks.
const saasSound={...sound,lane:"saas",category:"record",...saasChecks};
assert.deepEqual(validateDiagnosis(saasSound),[],"saas no-change with product-UX+copy+adoption checks must validate");
const saasSoundMissing={...sound,lane:"saas",category:"record"};
assert.match(validateDiagnosis(saasSoundMissing,{requireFiles:false}).join(" "),/primaryTaskCheck/);
assert.match(validateDiagnosis(saasSoundMissing,{requireFiles:false}).join(" "),/copyHeadlineCheck/);
assert.match(validateDiagnosis(saasSoundMissing,{requireFiles:false}).join(" "),/adoptionRitualCheck/);

console.log("diagnosis PASS: evidence hashed · 1–8 real defects · no-change verdict · saas product-UX + copy + adoption check presence");
