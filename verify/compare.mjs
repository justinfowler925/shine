#!/usr/bin/env node
// Import-safe proof orchestration. Facts, never an opaque likeness score.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";
import { capturePage } from "./compare/capture.mjs";
import { assessStructure } from "./compare/structure.mjs";
import { assessVisual, palette, pixelCalibration } from "./compare/visual.mjs";
import { reportProof } from "./compare/report.mjs";
import { readProveReceipt, writeProveReceipt } from "../hooks/receipt.mjs";
import { readDiagnosis } from "../core/diagnosis.mjs";

export async function compareArtifact({target,citeId,outPath="/tmp/shine-compare.png",lane="",brief="",brandLocked=false,mode="new",diagnosisPath=""}) {
  const SHINE=resolve(dirname(fileURLToPath(import.meta.url)),".."); const shotPath=join(SHINE,"corpus/packs",citeId,"shot.png");
  if(!existsSync(shotPath)) return {status:2,failures:[`no harvested shot for ${citeId}; Refusing to compare against nothing`]};
  const catalog=JSON.parse(readFileSync(join(SHINE,"corpus/templates.json"),"utf8")); const row=(catalog.templates||[]).find((t)=>t.id===citeId);
  if(!row)return {status:2,failures:[`unknown cite ${citeId}`]};
  let diagnosis=null;
  if(mode==="existing"){
    if(!diagnosisPath)return {status:2,failures:["existing-surface proof requires --diagnosis <shine-diagnosis.json>"]};
    try{diagnosis=readDiagnosis(diagnosisPath);}catch(error){return {status:2,failures:[error.message]};}
  }
  const tokensPath=existsSync(join(SHINE,"corpus/packs",citeId,"tokens.css"))?join(SHINE,"corpus/packs",citeId,"tokens.css"):join(SHINE,"tokens/voices",`${row.dna?.family||""}.css`);
  const tokens=existsSync(tokensPath)?readFileSync(tokensPath,"utf8"):""; const {chromium}=load("playwright"),sharp=load("sharp");
  const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1280,height:800}});
  const url=/^https?:/.test(target)?target:pathToFileURL(resolve(target)).href; await page.goto(url,{waitUntil:"networkidle"}); await page.evaluate(()=>document.fonts?.ready);
  const captured=await capturePage(page); await browser.close(); const template=readFileSync(shotPath);
  const store=readProveReceipt(); const prior=(store?.receipts||[]).map((r)=>r.proof).filter(Boolean);
  const structure=assessStructure({facts:captured.facts,screen:row.screen,reference:row.reference||{},lane,brief,brandLocked,prior}); const visual=assessVisual({facts:captured.facts,row,tokens});
  const [pagePalette,templatePalette,calibration]=await Promise.all([palette(sharp,captured.screenshot),palette(sharp,template),pixelCalibration(sharp,template,template)]);
  const W=800,a=await sharp(captured.screenshot).resize({width:W}).png().toBuffer(),b=await sharp(template).resize({width:W}).png().toBuffer(); const [ma,mb]=await Promise.all([sharp(a).metadata(),sharp(b).metadata()]);
  await sharp({create:{width:W*2+24,height:Math.max(ma.height,mb.height),channels:3,background:{r:24,g:24,b:24}}}).composite([{input:a,left:0,top:0},{input:b,left:W+24,top:0}]).png().toFile(outPath);
  const citeFailures=captured.facts.cite===citeId?[]:[`artifact data-cite ${captured.facts.cite||"missing"} does not bind the requested template ${citeId}`];
  const failures=[...citeFailures,...structure.failures,...visual.failures]; const report=reportProof({outPath,citeId,facts:captured.facts,pagePalette,templatePalette,calibration,structure,visual});
  const proof={...structure.proof,...visual.proof,calibration,pagePalette,templatePalette,...(diagnosis?{diagnosis:{path:diagnosis.path,hash:diagnosis.hash,defects:diagnosis.value.defects.length}}:{})};
  if(!failures.length&&!/^https?:/.test(target))writeProveReceipt({cite:citeId,target:resolve(target),templateShot:shotPath,compareVersion:"compare-v3",proof});
  else if(!failures.length) return {status:2,failures:["remote URLs cannot mint an artifact-bound receipt"],report,proof};
  return {status:failures.length?1:0,failures,report,proof};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),opt=(f)=>args.includes(f)?args[args.indexOf(f)+1]:""; const target=args.find((a,i)=>!a.startsWith("-")&&(i===0||!args[i-1].startsWith("--"))),citeId=opt("--cite");
  if(!target||!citeId){console.error("usage: node verify/compare.mjs <page|url> --cite <id> [--brief id --lane lane --mode existing --diagnosis file --brand-locked]");process.exit(2)}
  const result=await compareArtifact({target,citeId,outPath:opt("--out")||"/tmp/shine-compare.png",brief:opt("--brief"),lane:opt("--lane"),mode:opt("--mode")||"new",diagnosisPath:opt("--diagnosis"),brandLocked:args.includes("--brand-locked")});
  if(result.report)console.log(result.report); if(result.failures.length){console.error(`compare: not a relative of ${citeId}:`);for(const failure of result.failures)console.error(`  ${failure}`)} process.exit(result.status);
}
