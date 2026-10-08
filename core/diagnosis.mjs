#!/usr/bin/env node
import {createHash} from "node:crypto";
import {existsSync, readFileSync, realpathSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildRestructurePlan} from "../verify/restructure/schema.mjs";

export const buckets=new Set(["usability","completeness","composition","craft","adoption"]);
const severities=new Set(["critical","major","minor"]);
// A diagnosis names what is wrong, or it says, with evidence, that nothing is.
// The old contract demanded 3–8 defects and at least one critical/major on every
// pass. A sound surface could not pass, so the agent invented defects to fill the
// quota and inflated severities to clear the bar — the "keeps altering shit that
// doesn't need to be altered" failure. `no-change` is the honest exit: it must say
// what was exercised and confirm every bucket was actually looked at.
export const verdicts=new Set(["defects","no-change"]);
const text=(value)=>String(value||"").trim();

// Operate-lane SaaS page categories: product-UX check fields are required when
// lane=saas. Marketing / media / voice / editorial stay optional (backward-compat).
// Machine gate = field *presence* only; honesty of the note stays agent judgment.
// No screenshot OCR or evidence-vs-shot verification in v1.
export const saasPageCategories=new Set(["datagrid","dashboard","form","record","lex"]);
export const saasProductUxCheckKeys=["primaryTaskCheck","emptyErrorTriadCheck","competingCtaCheck"];
/** Denoise / Operate composition checks — presence gated like product-UX (N7). */
export const saasRestructureCheckKeys=["dualFocalCheck","kpiSoupCheck","citeHonestyCheck","pillFilterCheck","pageTitleCheck","chromePressureCheck","filterReversibleCheck","marketingDnaCheck","fillerEmptyCheck","cardSoupCheck","emptyTriadCheck","decorativeChartCheck"];

// Copy checks: persuasive + instructional surfaces under lane=saas (Operate pages
// plus marketing/catalog). Presence only — belief honesty stays agent (copy.md).
export const saasCopyCategories=new Set(["datagrid","dashboard","form","record","lex","marketing","catalog"]);
export const saasCopyCheckKeys=["copyHeadlineCheck","copyBeliefCheck","copyInstructionalCheck"];

// Adoption checks: Operate pages only (tools someone opens on a Tuesday).
// Presence only — ritual honesty stays agent (adoption.md).
export const saasAdoptionCategories=saasPageCategories;
export const saasAdoptionCheckKeys=["adoptionRitualCheck","adoptionPrivateWinCheck","adoptionAbsenceCheck"];

export function requiresSaasProductUxChecks(value,{lane}={}){
 const resolved=text(lane||value?.lane);
 if(resolved!=="saas")return false;
 return saasPageCategories.has(text(value?.category));
}

export function requiresSaasCopyChecks(value,{lane}={}){
 const resolved=text(lane||value?.lane);
 if(resolved!=="saas")return false;
 return saasCopyCategories.has(text(value?.category));
}

export function requiresSaasAdoptionChecks(value,{lane}={}){
 const resolved=text(lane||value?.lane);
 if(resolved!=="saas")return false;
 return saasAdoptionCategories.has(text(value?.category));
}

function validateSaasCheck(value,key,errors,label){
 const check=value?.[key];
 if(!check||typeof check!=="object"||Array.isArray(check)){
  errors.push(`${key} is required for saas ${label} diagnoses (object with note)`);
  return;
 }
 if(text(check.note).length<8)errors.push(`${key}.note is missing (at least 8 characters)`);
 if(check.ok!==undefined&&typeof check.ok!=="boolean")errors.push(`${key}.ok must be a boolean when present`);
}

function validateSaasProductUxCheck(value,key,errors){
 validateSaasCheck(value,key,errors,"page");
}

export function validateDiagnosis(value,{requireFiles=true,lane}={}){
 const errors=[];
 if(value?.version!==1)errors.push("version must be 1");
 if(text(value?.job).length<8)errors.push("job is missing");
 if(text(value?.category).length<3)errors.push("category is missing");
 if(text(value?.primaryTask).length<8)errors.push("primaryTask is missing");
 if(text(value?.before?.artifact).length<1)errors.push("before.artifact is missing");
 if(text(value?.before?.screenshot).length<1)errors.push("before.screenshot is missing");
 if(requireFiles&&text(value?.before?.artifact)&&!existsSync(resolve(value.before.artifact)))errors.push("before.artifact does not exist");
 if(requireFiles&&text(value?.before?.screenshot)&&!existsSync(resolve(value.before.screenshot)))errors.push("before.screenshot does not exist");
 const verdict=value?.verdict===undefined?"defects":value.verdict;
 if(!verdicts.has(verdict))errors.push("verdict must be defects or no-change");
 if(requiresSaasProductUxChecks(value,{lane})){
  for(const key of saasProductUxCheckKeys)validateSaasProductUxCheck(value,key,errors);
  // Restructure checks are soft-present for saas Operate: if any key is present, validate shape.
  for(const key of saasRestructureCheckKeys){
   if(value?.[key]!==undefined)validateSaasProductUxCheck(value,key,errors);
  }
  if(value?.restructureRequired!==undefined&&typeof value.restructureRequired!=="boolean"){
   errors.push("restructureRequired must be a boolean when present");
  }
  if(value?.restructureOps!==undefined&&!Array.isArray(value.restructureOps)){
   errors.push("restructureOps must be an array when present");
  }
 }
 if(requiresSaasCopyChecks(value,{lane})){
  for(const key of saasCopyCheckKeys)validateSaasCheck(value,key,errors,"copy");
 }
 if(requiresSaasAdoptionChecks(value,{lane})){
  for(const key of saasAdoptionCheckKeys)validateSaasCheck(value,key,errors,"adoption");
 }
 const defects=Array.isArray(value?.defects)?value.defects:[];
 if(verdict==="no-change"){
  if(defects.length)errors.push("a no-change verdict cannot carry defects: name them under verdict defects, or drop them");
  if(text(value?.verdictEvidence).length<20)errors.push("no-change requires verdictEvidence: what was exercised and measured, at least 20 characters");
  const checked=Array.isArray(value?.checked)?value.checked:[];
  const missing=[...buckets].filter((bucket)=>!checked.includes(bucket));
  if(missing.length)errors.push(`no-change must list every bucket in checked; missing ${missing.join(", ")}`);
  return errors;
 }
 if(defects.length<1||defects.length>8)errors.push("defects must contain 1–8 prioritized findings; a sound surface records verdict no-change instead of invented defects");
 defects.forEach((item,index)=>{
  if(!buckets.has(item?.bucket))errors.push(`defects[${index}].bucket must be usability|completeness|composition|craft|adoption`);
  if(!severities.has(item?.severity))errors.push(`defects[${index}].severity must be critical|major|minor`);
  for(const key of ["problem","evidence","expectedEffect"])if(text(item?.[key]).length<8)errors.push(`defects[${index}].${key} is missing`);
 });
 return errors;
}

export function readDiagnosis(path,options={}){
 const absolute=resolve(path),value=JSON.parse(readFileSync(absolute,"utf8")),errors=validateDiagnosis(value,options);
 if(errors.length)throw new Error(`invalid diagnosis: ${errors.join("; ")}`);
 return {value,path:absolute,hash:createHash("sha256").update(readFileSync(absolute)).digest("hex"),verdict:value.verdict||"defects"};
}

export function emptySaasProductUxChecks(){
 return Object.fromEntries(saasProductUxCheckKeys.map((key)=>[key,{ok:false,note:""}]));
}

export function emptySaasCopyChecks(){
 return Object.fromEntries(saasCopyCheckKeys.map((key)=>[key,{ok:false,note:""}]));
}

export function emptySaasAdoptionChecks(){
 return Object.fromEntries(saasAdoptionCheckKeys.map((key)=>[key,{ok:false,note:""}]));
}

export function emptySaasRestructureChecks(){
 return Object.fromEntries(saasRestructureCheckKeys.map((key)=>[key,{ok:false,note:""}]));
}

/**
 * Derive restructure ops from diagnosis check fields + category.
 * Used by emit-restructure and denoise loop.
 */
export function deriveRestructureOps(diagnosis={}){
 const ops=[];
 const category=text(diagnosis.category);
 const job=text(diagnosis.job);
 if(diagnosis.competingCtaCheck?.ok===false){
  ops.push({op:"cta-budget",scope:"main",maxFilled:1,preferLabels:["Pursue","Save"],demotePolicy:"outline"});
 }
 if(diagnosis.dualFocalCheck?.ok===false){
  ops.push({op:"collapse-peer-grids",mode:"xor-saved-view",keepTitleIncludes:["Queue"],foldTitleIncludes:["David"]});
 }
 if(diagnosis.kpiSoupCheck?.ok===false){
  ops.push({op:"kpi-collapse",maxVisible:3,rest:"details",selector:".metrics .metric, [data-shine-kpi]"});
 }
 if(diagnosis.pillFilterCheck?.ok===false){
  ops.push({op:"pill-collapse",maxVisible:3,rest:"details",selector:"[data-shine-filter-stack] .pill, [data-shine-filter-pill]"});
 }
 if(diagnosis.pageTitleCheck?.ok===false){
  ops.push({op:"title-singular",on:"primary-title",demote:"kicker"});
 }
 if(diagnosis.chromePressureCheck?.ok===false){
  ops.push({op:"chrome-budget",maxFilledChrome:0,demotePolicy:"ghost",scope:"chrome"});
 }
 if(diagnosis.filterReversibleCheck?.ok===false){
  ops.push({op:"filter-clearable",perChip:true,clearAll:true});
 }
 if(diagnosis.marketingDnaCheck?.ok===false){
  ops.push({op:"strip-marketing-dna"});
 }
 if(diagnosis.fillerEmptyCheck?.ok===false){
  ops.push({op:"rewrite-filler-empty"});
 }
 if(diagnosis.cardSoupCheck?.ok===false){
  ops.push({op:"collapse-card-soup",maxVisible:1});
 }
 if(diagnosis.emptyTriadCheck?.ok===false){
  ops.push({op:"split-empty-triad"});
 }
 if(diagnosis.decorativeChartCheck?.ok===false){
  ops.push({op:"stamp-chart-units"});
 }
 if(diagnosis.citeHonestyCheck?.ok===false||(/settings|sources|recipes/i.test(job)&&/queue|datagrid/i.test(category))){
  ops.push({op:"rebind-cite",from:"shadcn-queue",to:"shadcn-settings",whenCategory:"settings"});
 }
 // Always offer set-focal when any composition/usability structure defect is red.
 if(
  diagnosis.dualFocalCheck?.ok===false||
  diagnosis.kpiSoupCheck?.ok===false||
  diagnosis.primaryTaskCheck?.ok===false||
  Array.isArray(diagnosis.restructureOps)
 ){
  if(!ops.some((o)=>o.op==="set-focal")){
   ops.push({op:"set-focal",attr:"data-region",value:"focal",on:"primary-worklist"});
  }
 }
 if(Array.isArray(diagnosis.restructureOps)){
  for(const op of diagnosis.restructureOps){
   if(op&&typeof op==="object"&&op.op&&!ops.some((o)=>o.op===op.op))ops.push(op);
  }
 }
 return ops;
}

/** Refuse polish/paint while restructure is required and primary task is red (N10). */
export function assertDenoisePaintAllowed(diagnosis={}){
 const primaryRed=diagnosis.primaryTaskCheck?.ok===false;
 const restructure=
  diagnosis.restructureRequired===true||
  (Array.isArray(diagnosis.restructureOps)&&diagnosis.restructureOps.length>0)||
  saasRestructureCheckKeys.some((k)=>diagnosis[k]?.ok===false)||
  diagnosis.competingCtaCheck?.ok===false;
 if(restructure&&primaryRed){
  throw new Error(
   "denoise refuse paint: restructure still required and primaryTaskCheck is red — apply shine-restructure ops before polish",
  );
 }
 return true;
}

/**
 * Emit shine-restructure/v1 from a diagnosis (and optional cite).
 */
export function emitRestructureFromDiagnosis(diagnosis,{citePrimary="",antiCites=[]}={}){
 const category=text(diagnosis.category)||"queue";
 const job=text(diagnosis.job)||"Denoise Operate surface";
 const ops=deriveRestructureOps(diagnosis);
 const restructureRequired=
  diagnosis.restructureRequired===true||
  ops.length>0||
  diagnosis.competingCtaCheck?.ok===false||
  saasRestructureCheckKeys.some((k)=>diagnosis[k]?.ok===false);
 const cite=
  citePrimary||
  (category==="form"||/settings/i.test(job)?"shadcn-settings":"shadcn-queue");
 const plan=buildRestructurePlan({
  job,
  category:category==="datagrid"?"queue":category,
  lane:text(diagnosis.lane)||"saas",
  citePrimary:cite,
  antiCites:antiCites.length?antiCites:["shadcn-dashboard-01","magicui-*"],
  ops:ops.length
   ?ops
   :[
     {op:"cta-budget",scope:"main",maxFilled:1,preferLabels:["Pursue"],demotePolicy:"outline"},
     {op:"set-focal",attr:"data-region",value:"focal",on:"primary-worklist"},
    ],
  measureMustClear:["cta-pressure","dual-focal","kpi-soup","pill-filter","page-title","chrome-pressure","composition-slop"],
  humanGate:ops.some((o)=>o.op==="collapse-peer-grids"),
 });
 plan.restructureRequired=restructureRequired;
 plan.fromDiagnosis={
  competingCtaCheck:diagnosis.competingCtaCheck?.ok,
  dualFocalCheck:diagnosis.dualFocalCheck?.ok,
  kpiSoupCheck:diagnosis.kpiSoupCheck?.ok,
  citeHonestyCheck:diagnosis.citeHonestyCheck?.ok,
  primaryTaskCheck:diagnosis.primaryTaskCheck?.ok,
 };
 return plan;
}

export function seedDiagnosis({job,category,lane=""}){
 const base={version:1,job,category,primaryTask:"",before:{artifact:"",screenshot:""},
  verdict:"defects",
  guidance:"Keep only defects you can evidence from the before screenshot or measure output. One real defect is a valid pass. If nothing is wrong, set verdict to no-change, list all five buckets in checked, and write verdictEvidence; do not invent defects or inflate severity to satisfy a count. For lane=saas Operate page categories, fill primaryTaskCheck, emptyErrorTriadCheck, competingCtaCheck, dualFocalCheck, kpiSoupCheck, citeHonestyCheck, and the copy/adoption check fields (presence is machine-gated; honesty of the note is yours). Set restructureRequired + restructureOps when structure is red. Emit shine-restructure.json via: node core/diagnosis.mjs emit-restructure --file shine-diagnosis.json. Bind critical/major usability and adoption defects to flow:<id> assertions when a usability flow exists. Denoise: no polish while restructureRequired and primaryTaskCheck is red.",
  checked:[],
  verdictEvidence:"",
  restructureRequired:false,
  restructureOps:[],
  defects:[
   {id:"primary-workflow",assertions:[],bucket:"usability",severity:"major",problem:"",evidence:"",expectedEffect:""}
  ]};
 if(text(lane))base.lane=text(lane);
 if(requiresSaasProductUxChecks(base)){
  Object.assign(base,emptySaasProductUxChecks());
  Object.assign(base,emptySaasRestructureChecks());
 }
 if(requiresSaasCopyChecks(base))Object.assign(base,emptySaasCopyChecks());
 if(requiresSaasAdoptionChecks(base))Object.assign(base,emptySaasAdoptionChecks());
 return base;
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=(name)=>args.includes(name)?args[args.indexOf(name)+1]:"",command=args[0];
 try{
  if(command==="init"){
   const out=resolve(opt("--out")||"shine-diagnosis.json");
   writeFileSync(out,JSON.stringify(seedDiagnosis({job:opt("--job"),category:opt("--category"),lane:opt("--lane")}),null,2)+"\n");
   console.log(out);
  }else if(command==="check"){
   const result=readDiagnosis(opt("--file")||args[1],{lane:opt("--lane")||undefined});
   console.log(`diagnosis PASS ${result.hash} verdict=${result.verdict} defects=${result.value.defects?.length||0}`);
  }else if(command==="emit-restructure"){
   const file=resolve(opt("--file")||"shine-diagnosis.json");
   const diagnosis=JSON.parse(readFileSync(file,"utf8"));
   const plan=emitRestructureFromDiagnosis(diagnosis,{citePrimary:opt("--cite")});
   const out=resolve(opt("--out")||"shine-restructure.json");
   writeFileSync(out,JSON.stringify(plan,null,2)+"\n");
   // Mirror ops back onto diagnosis when --write-diagnosis
   if(args.includes("--write-diagnosis")){
    diagnosis.restructureRequired=plan.restructureRequired!==false;
    diagnosis.restructureOps=plan.ops;
    writeFileSync(file,JSON.stringify(diagnosis,null,2)+"\n");
   }
   console.log(out);
  }else throw new Error("usage: diagnosis.mjs init --job <job> --category <category> [--lane saas] --out <file> | check --file <file> [--lane saas] | emit-restructure --file <diagnosis> [--out shine-restructure.json] [--cite id] [--write-diagnosis]");
 }catch(error){console.error(`diagnosis: ${error.message}`);process.exit(1)}
}
