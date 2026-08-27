import assert from "node:assert/strict";
import {classifyJob,createDesignPacket} from "../core/design-packet.mjs";

const cases=[
 ["Customer success needs to scan a customer list and quickly fix stale records","datagrid"],
 ["Applicants abandon the insurance quote after entering their address","form"],
 ["Nobody opens the sales cockpit before the Monday forecast call","dashboard"],
 ["Agents triage unresolved support requests and assign owners","datagrid"],
 ["Employees get lost halfway through account setup","form"],
 ["Explain the fraud detection product and get buyers to request a demo","marketing"],
 ["Researchers ask follow-up questions and inspect citations","voice"],
 ["Workspace owners control access, alerts, and retention","form"],
 ["Adjusters need to understand one claim and take the next action","record"]
];
for(const [job,category] of cases)assert.equal(classifyJob(job).category,category,job);
assert.throws(()=>classifyJob("Fix the design and UX problems"),/cannot infer/);
assert.equal(classifyJob("Fix the design and UX problems","form").category,"form");

const grid=createDesignPacket({job:cases[0][0],lane:"internal",project:process.cwd()});
assert.equal(grid.version,2);assert.equal(grid.category,"datagrid");assert.equal(grid.selected.scope,"page");
assert(grid.componentReferences.some(x=>x.id==="untitled-table"));
for(const item of ["search","sort","filters","column visibility","pagination","row selection","row actions"])assert(grid.controlInventory.includes(item),item);
assert.deepEqual(grid.requiredStates,["loading","empty","filtered-empty","error","populated"]);
assert(grid.selected.paths.sourceExcerpts.length>0);
assert(grid.selected.paths.sourceExcerpts.some(x=>/return\s*\(|<[A-Z]|<main|<div/.test(x.excerpt)),"selected source never reaches JSX");
assert(grid.examples.every(x=>x.score>=10&&x.sourceExcerpt?.length>100),"Untitled matches need usable source and a direct semantic hit");
assert.match(grid.proof.commands[1],/--mode existing --diagnosis shine-diagnosis\.json/);
assert.equal(grid.diagnosis.required,true);

const dashboard=createDesignPacket({job:cases[2][0],lane:"internal",project:process.cwd(),mode:"new"});
assert.equal(dashboard.selected.id,"shadcn-dashboard-01","component demo cannot replace the composed page reference");
assert(dashboard.componentReferences.some(x=>x.id==="untitled-line-charts"),"Untitled chart should be a component reference");
assert.equal(dashboard.diagnosis.required,false);
assert.throws(()=>createDesignPacket({job:""}),/job is required/);
console.log("design packet PASS: 9 natural briefs · ambiguity refusal · page/component split · usable source · diagnosis contract");
