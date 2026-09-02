#!/usr/bin/env node
import {createHash} from "node:crypto";
import {existsSync, readFileSync, realpathSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

const buckets=new Set(["usability","completeness","composition","craft","adoption"]);
const severities=new Set(["critical","major","minor"]);
const text=(value)=>String(value||"").trim();

export function validateDiagnosis(value,{requireFiles=true}={}){
 const errors=[];
 if(value?.version!==1)errors.push("version must be 1");
 if(text(value?.job).length<8)errors.push("job is missing");
 if(text(value?.category).length<3)errors.push("category is missing");
 if(text(value?.primaryTask).length<8)errors.push("primaryTask is missing");
 if(text(value?.before?.artifact).length<1)errors.push("before.artifact is missing");
 if(text(value?.before?.screenshot).length<1)errors.push("before.screenshot is missing");
 if(requireFiles&&text(value?.before?.artifact)&&!existsSync(resolve(value.before.artifact)))errors.push("before.artifact does not exist");
 if(requireFiles&&text(value?.before?.screenshot)&&!existsSync(resolve(value.before.screenshot)))errors.push("before.screenshot does not exist");
 const defects=Array.isArray(value?.defects)?value.defects:[];
 if(defects.length<3||defects.length>8)errors.push("defects must contain 3–8 prioritized findings");
 defects.forEach((item,index)=>{
  if(!buckets.has(item?.bucket))errors.push(`defects[${index}].bucket must be usability|completeness|composition|craft|adoption`);
  if(!severities.has(item?.severity))errors.push(`defects[${index}].severity must be critical|major|minor`);
  for(const key of ["problem","evidence","expectedEffect"])if(text(item?.[key]).length<8)errors.push(`defects[${index}].${key} is missing`);
 });
 if(defects.length&&!defects.some((item)=>item.severity==="critical"||item.severity==="major"))errors.push("at least one critical or major defect is required");
 return errors;
}

export function readDiagnosis(path,options={}){
 const absolute=resolve(path),value=JSON.parse(readFileSync(absolute,"utf8")),errors=validateDiagnosis(value,options);
 if(errors.length)throw new Error(`invalid diagnosis: ${errors.join("; ")}`);
 return {value,path:absolute,hash:createHash("sha256").update(readFileSync(absolute)).digest("hex")};
}

export function seedDiagnosis({job,category}){
 return {version:1,job,category,primaryTask:"",before:{artifact:"",screenshot:""},defects:[
  {bucket:"usability",severity:"major",problem:"",evidence:"",expectedEffect:""},
  {bucket:"completeness",severity:"major",problem:"",evidence:"",expectedEffect:""},
  {bucket:"composition",severity:"minor",problem:"",evidence:"",expectedEffect:""}
 ]};
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=(name)=>args.includes(name)?args[args.indexOf(name)+1]:"",command=args[0];
 try{
  if(command==="init"){
   const out=resolve(opt("--out")||"shine-diagnosis.json");
   writeFileSync(out,JSON.stringify(seedDiagnosis({job:opt("--job"),category:opt("--category")}),null,2)+"\n");
   console.log(out);
  }else if(command==="check"){
   const result=readDiagnosis(opt("--file")||args[1]);
   console.log(`diagnosis PASS ${result.hash}`);
  }else throw new Error("usage: diagnosis.mjs init --job <job> --category <category> --out <file> | check --file <file>");
 }catch(error){console.error(`diagnosis: ${error.message}`);process.exit(1)}
}
