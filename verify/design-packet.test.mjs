import assert from "node:assert/strict";
import {mkdirSync,mkdtempSync,rmSync,symlinkSync,writeFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {fileURLToPath} from "node:url";
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
assert.equal(grid.version,4);assert.equal(grid.category,"datagrid");assert.equal(grid.selected.scope,"page");
assert(grid.componentReferences.some(x=>x.id==="untitled-table"));
for(const item of ["search","sort","filters","column visibility","pagination","row selection","row actions"])assert(grid.controlInventory.includes(item),item);
assert.deepEqual(grid.requiredStates,["loading","empty","filtered-empty","error","populated"]);
assert(grid.selected.paths.sourceExcerpts.length>0);
assert(grid.selected.paths.sourceExcerpts.some(x=>/return\s*\(|<[A-Z]|<main|<div/.test(x.excerpt)),"selected source never reaches JSX");
assert(grid.examples.every(x=>x.score>=10&&x.sourceExcerpt?.length>100),"Untitled matches need usable source and a direct semantic hit");
assert.equal(grid.usability.required,true);
assert.match(grid.usability.commands[0],/verify\/usability\.mjs/);
assert.match(grid.proof.commands[2],/--mode existing --diagnosis shine-diagnosis\.json/);
assert.equal(grid.diagnosis.required,true);
assert.equal(grid.productPrecedent.required,true);
assert.equal(grid.productPrecedent.provided,false);

const withSibling=createDesignPacket({job:cases[2][0],lane:"internal",project:process.cwd(),mode:"existing",productReference:"http://localhost:3000/cro/gov",productReferenceName:"Government signals"});
assert.equal(withSibling.productPrecedent.provided,true);
assert.equal(withSibling.productPrecedent.name,"Government signals");
assert(withSibling.proof.commands.some((command)=>command.includes("compare-product.mjs")&&command.includes("/cro/gov")));

const dashboard=createDesignPacket({job:cases[2][0],lane:"internal",project:process.cwd(),mode:"new"});
assert.equal(dashboard.selected.id,"shadcn-dashboard-01","component demo cannot replace the composed page reference");
assert(dashboard.componentReferences.some(x=>x.id==="untitled-line-charts"),"Untitled chart should be a component reference");
assert.equal(dashboard.diagnosis.required,false);
assert.throws(()=>createDesignPacket({job:""}),/job is required/);
// Kit affinity. A consumer's installed kit decided the build recipe but had no
// say in the page reference, so a shadcn/TanStack repo asking for a records
// surface was handed an Ant Design Pro reference to copy: untitled-table and
// the foreign-runtime row both scored 122 and the tie broke alphabetically.
const shadcnRepo=fileURLToPath(new URL("./fixtures/kit-affinity-shadcn",import.meta.url));
mkdirSync(shadcnRepo,{recursive:true});
writeFileSync(join(shadcnRepo,"package.json"),JSON.stringify({name:"kit-affinity-fixture",dependencies:{next:"16.0.0","@tanstack/react-table":"8.21.3"}})+"\n");
writeFileSync(join(shadcnRepo,"components.json"),JSON.stringify({$schema:"https://ui.shadcn.com/schema.json",style:"new-york"})+"\n");

const affine=createDesignPacket({job:"triage the weekly goal board and assign owners",lane:"internal",project:shadcnRepo,mode:"existing",category:"datagrid"});
assert.equal(affine.integration.key,"shadcn-tanstack","fixture must detect as a shadcn/TanStack consumer");
assert(affine.componentReferences.some(x=>x.id==="untitled-table"&&x.matches.includes("installedKit")),
 "a buildable component reference must be marked installedKit");
// Coverage is thin and uneven: queue has exactly one page-scope reference and it
// is Ant Design Pro. Ordering must not eliminate it, but the packet must say it
// is a structure to port rather than source to copy.
assert(affine.selected.scope==="page","a composed page reference is still required");
if(!["shadcn-registry","untitled-ui-react"].includes(affine.selected.kit)){
 assert.equal(affine.selected.port,true,"a cross-kit page reference must be flagged as port-not-copy");
 assert.match(affine.selected.portNote,/port the structure to shadcn-registry/);
}

const affineDash=createDesignPacket({job:"marketing influenced pipeline dashboard",lane:"internal",project:shadcnRepo,mode:"existing",category:"dashboard"});
assert.equal(affineDash.selected.id,"shadcn-dashboard-01","a buildable page reference must win when one is eligible");
assert.notEqual(affineDash.selected.port,true,"a same-kit reference is not a port");
assert(affineDash.selected.matches.includes("installedKit"));

const lex=createDesignPacket({job:"lightning record page for claims",lane:"lex",project:shadcnRepo,mode:"existing",category:"record"});
assert.equal(lex.selected.kit,"slds","kit affinity must not override the Lightning lane");

const linked=mkdtempSync(join(tmpdir(),"shine-packet-link-"));
try {
 const entry=join(linked,"packet.mjs");
 symlinkSync(fileURLToPath(new URL("../core/design-packet.mjs",import.meta.url)),entry);
 const run=spawnSync(process.execPath,[entry,"--job","Explain the product and request a demo","--category","marketing","--mode","new"],{encoding:"utf8"});
 assert.equal(run.status,0,run.stderr);assert.equal(JSON.parse(run.stdout).category,"marketing","installed symlink must execute the packet CLI");
} finally {rmSync(linked,{recursive:true,force:true});}

console.log("design packet PASS: 9 natural briefs · ambiguity refusal · page/component split · usable source · diagnosis contract · kit affinity + port disclosure + lex lane · symlink CLI");
