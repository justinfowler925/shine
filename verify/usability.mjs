#!/usr/bin/env node
// Executable task proof: a visual relative of a kit still fails if its objects
// cannot complete the user's job.
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const fail=(message)=>{throw new Error(`usability: ${message}`)};
const requiredActions=new Set(["click","fill","press"]);

export function readUsabilityContract(path,{citeId=""}={}) {
  if(!path||!existsSync(path)) fail("missing --contract <shine-usability.json>");
  let value; try { value=JSON.parse(readFileSync(path,"utf8")); } catch { fail("contract is not valid JSON"); }
  const errors=[];
  if(value.version!==1) errors.push("version must be 1");
  if(!value.cite||typeof value.cite!=="string") errors.push("cite is required");
  if(citeId&&value.cite!==citeId) errors.push(`contract cite ${value.cite||"missing"} does not match ${citeId}`);
  if(!Array.isArray(value.objects)||value.objects.length<2) errors.push("at least two user-facing objects are required");
  if(!Array.isArray(value.flows)||!value.flows.length) errors.push("at least one user workflow is required");
  for(const object of value.objects||[]) if(!object.id||!object.selector||!object.referenceRole||!object.purpose) errors.push("every object needs id, selector, referenceRole, and purpose");
  for(const flow of value.flows||[]) {
    if(!flow.id||!flow.userJob||!Array.isArray(flow.steps)||flow.steps.length<3) {errors.push("every flow needs id, userJob, and at least three steps"); continue;}
    if(!flow.steps.some(step=>requiredActions.has(step.action))) errors.push(`flow ${flow.id} has no user action`);
    for(const step of flow.steps) if(!step.action||!step.selector) errors.push(`flow ${flow.id} has a step without action or selector`);
  }
  if(errors.length) fail(errors.join("; "));
  const templates=JSON.parse(readFileSync(resolve(ROOT,"corpus/templates.json"),"utf8")).templates||[];
  const template=templates.find(row=>row.id===value.cite); if(!template) fail(`unknown reference cite ${value.cite}`);
  const roles=new Set(value.objects.map(object=>object.referenceRole));
  for(const role of template.reference?.required||[]) if(!roles.has(role)) errors.push(`selected reference ${value.cite} requires a ${role} object`);
  const selectors=new Set(value.objects.map(object=>object.selector));
  for(const flow of value.flows) for(const step of flow.steps) if(!selectors.has(step.selector)) errors.push(`flow ${flow.id} exercises ${step.selector}, which is not a declared object`);
  if(errors.length) fail(errors.join("; "));
  return value;
}

async function runStep(page,step) {
  const locator=page.locator(step.selector).first();
  if(step.action==="click") return locator.click();
  if(step.action==="fill") return locator.fill(step.value??"");
  if(step.action==="press") return locator.press(step.value||"Enter");
  if(step.action==="visible") return locator.waitFor({state:"visible"});
  if(step.action==="hidden") return locator.waitFor({state:"hidden"});
  if(step.action==="text") { const expected=step.value||""; await locator.filter({hasText:expected}).waitFor({state:"visible"}); const actual=await locator.textContent(); if(!String(actual||"").includes(expected)) fail(`${step.selector} text did not contain ${JSON.stringify(expected)}`); return; }
  if(step.action==="value") { const actual=await locator.inputValue(); if(actual!==(step.value??"")) fail(`${step.selector} value was ${JSON.stringify(actual)}, expected ${JSON.stringify(step.value??"")}`); return; }
  fail(`unknown action ${step.action}`);
}

export async function proveUsability({target,contractPath,citeId=""}) {
  const contract=readUsabilityContract(contractPath,{citeId}); const {chromium}=load("playwright");
  const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1280,height:800}});
  try {
    await page.goto(/^https?:/.test(target)?target:pathToFileURL(resolve(target)).href,{waitUntil:"networkidle"});
    for(const object of contract.objects) await page.locator(object.selector).first().waitFor({state:"visible"});
    for(const flow of contract.flows) for(const [index,step] of flow.steps.entries()) {
      try { await runStep(page,step); } catch(error) { fail(`${flow.id} step ${index+1} (${step.action} ${step.selector}): ${error.message}`); }
    }
    return {status:0,cite:contract.cite,objects:contract.objects.length,flows:contract.flows.map(flow=>({id:flow.id,userJob:flow.userJob,steps:flow.steps.length}))};
  } finally { await browser.close(); }
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2),opt=name=>args.includes(name)?args[args.indexOf(name)+1]:"",target=args.find((arg,index)=>!arg.startsWith("-")&&(index===0||!args[index-1].startsWith("--")));
  if(!target){console.error("usage: node verify/usability.mjs <page|url> --contract shine-usability.json [--cite template-id]");process.exit(2);}
  try { console.log(JSON.stringify(await proveUsability({target,contractPath:opt("--contract"),citeId:opt("--cite")}),null,2)); } catch(error) { console.error(error.message); process.exit(1); }
}
