import assert from "node:assert/strict";
import {checkCopyAdoptionPresence,checkDefectAssertions} from "./prove.mjs";

// M3b: usability-bucket critical/major defects must bind executable assertions.
// Content honesty stays agent; this gate is assertion presence + flow resolution.

const layoutPassed={
 scenarios:2,
 checks:[
  {id:"toolbar-visible",status:"passed"},
  {id:"toolbar-visible",status:"passed"},
 ],
};
const usabilityPassed={
 status:0,
 flows:[{id:"assign-owner",status:"passed"}],
};

const primaryTask={
 defects:[{
  id:"primary-assign-owner",
  bucket:"usability",
  severity:"critical",
  assertions:["flow:assign-owner"],
  problem:"Operators cannot assign an owner from the first viewport",
  evidence:"Assign control is below the fold",
  expectedEffect:"Assign-owner flow completes from the queue",
 }],
};

assert.equal(
 checkDefectAssertions(primaryTask,layoutPassed,usabilityPassed).status,
 "passed",
 "usability critical with resolved flow: binding must pass",
);

const missingAssertions={
 defects:[{
  id:"primary-assign-owner",
  bucket:"usability",
  severity:"critical",
  assertions:[],
  problem:"Operators cannot assign an owner from the first viewport",
  evidence:"Assign control is below the fold",
  expectedEffect:"Assign-owner flow completes from the queue",
 }],
};
const missing=checkDefectAssertions(missingAssertions,layoutPassed,usabilityPassed);
assert.equal(missing.status,"failed");
assert.match(missing.failures.join(" "),/needs an id and executable assertion ids/);

const omittedAssertions={
 defects:[{
  bucket:"usability",
  severity:"critical",
  problem:"Primary CTA competes with three filled peers",
  evidence:"Four filled buttons in the header",
  expectedEffect:"One filled primary remains",
 }],
};
assert.equal(checkDefectAssertions(omittedAssertions,layoutPassed,usabilityPassed).status,"failed");

const brokenFlow=checkDefectAssertions(primaryTask,layoutPassed,{status:1,flows:[]});
assert.equal(brokenFlow.status,"failed");
assert.match(brokenFlow.failures.join(" "),/flow:assign-owner/);

const unknownFlow=checkDefectAssertions({
 defects:[{...primaryTask.defects[0],assertions:["flow:missing-flow"]}],
},layoutPassed,usabilityPassed);
assert.equal(unknownFlow.status,"failed");

// Minor usability defects do not require assertion binding.
assert.equal(checkDefectAssertions({
 defects:[{
  id:"polish-label",
  bucket:"usability",
  severity:"minor",
  assertions:[],
  problem:"Secondary label wraps awkwardly",
  evidence:"Label wraps at 390",
  expectedEffect:"Label stays one line",
 }],
},layoutPassed,usabilityPassed).status,"passed");

// no-change still binds nothing.
assert.equal(checkDefectAssertions({verdict:"no-change",defects:[]},layoutPassed,usabilityPassed).status,"passed");

// Adoption-bucket critical/major also needs assertion ids (same path as usability).
const adoptionCritical={
 defects:[{
  id:"monday-ritual",
  bucket:"adoption",
  severity:"critical",
  assertions:["flow:assign-owner"],
  problem:"No ritual owns the queue",
  evidence:"Managers rebuild numbers in a spreadsheet before Monday",
  expectedEffect:"Monday call runs off this screen",
 }],
};
assert.equal(checkDefectAssertions(adoptionCritical,layoutPassed,usabilityPassed).status,"passed");
assert.equal(checkDefectAssertions({
 defects:[{...adoptionCritical.defects[0],assertions:[]}],
},layoutPassed,usabilityPassed).status,"failed");

// copyAdoption presence gate
const saasFull={
 lane:"saas",
 category:"dashboard",
 copyHeadlineCheck:{ok:true,note:"H1 names the revenue exceptions job"},
 copyBeliefCheck:{ok:true,note:"Five beliefs mapped to carrying elements"},
 copyInstructionalCheck:{ok:true,note:"Empty state names the first useful action"},
 adoptionRitualCheck:{ok:true,note:"Monday forecast call owns this screen"},
 adoptionPrivateWinCheck:{ok:true,note:"Managers get a ranked short list"},
 adoptionAbsenceCheck:{ok:true,note:"A week offline breaks the forecast call"},
};
assert.equal(checkCopyAdoptionPresence(saasFull,{lane:"saas"}).status,"passed");
assert.equal(checkCopyAdoptionPresence({lane:"saas",category:"dashboard"},{lane:"saas"}).status,"failed");

console.log("prove defect-assertions PASS: usability/adoption critical requires flow: binding · copyAdoption presence");
