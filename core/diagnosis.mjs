#!/usr/bin/env node
import {createHash} from "node:crypto";
import {existsSync, readFileSync, realpathSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

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

export function requiresSaasProductUxChecks(value,{lane}={}){
 const resolved=text(lane||value?.lane);
 if(resolved!=="saas")return false;
 return saasPageCategories.has(text(value?.category));
}

function validateSaasProductUxCheck(value,key,errors){
 const check=value?.[key];
 if(!check||typeof check!=="object"||Array.isArray(check)){
  errors.push(`${key} is required for saas page diagnoses (object with note)`);
  return;
 }
 if(text(check.note).length<8)errors.push(`${key}.note is missing (at least 8 characters)`);
 if(check.ok!==undefined&&typeof check.ok!=="boolean")errors.push(`${key}.ok must be a boolean when present`);
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

export function seedDiagnosis({job,category,lane=""}){
 const base={version:1,job,category,primaryTask:"",before:{artifact:"",screenshot:""},
  verdict:"defects",
  guidance:"Keep only defects you can evidence from the before screenshot or measure output. One real defect is a valid pass. If nothing is wrong, set verdict to no-change, list all five buckets in checked, and write verdictEvidence; do not invent defects or inflate severity to satisfy a count. For lane=saas Operate page categories, fill primaryTaskCheck, emptyErrorTriadCheck, and competingCtaCheck (presence is machine-gated; honesty of the note is yours).",
  checked:[],
  verdictEvidence:"",
  defects:[
   {id:"primary-workflow",assertions:[],bucket:"usability",severity:"major",problem:"",evidence:"",expectedEffect:""}
  ]};
 if(text(lane))base.lane=text(lane);
 if(requiresSaasProductUxChecks(base))Object.assign(base,emptySaasProductUxChecks());
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
  }else throw new Error("usage: diagnosis.mjs init --job <job> --category <category> [--lane saas] --out <file> | check --file <file> [--lane saas]");
 }catch(error){console.error(`diagnosis: ${error.message}`);process.exit(1)}
}
