#!/usr/bin/env node
import {verifySurfaceReceipt} from "../integrations/surface-audit.mjs";
import {checkCompatibility} from "../integrations/compatibility.mjs";
import {existsSync,mkdtempSync,readFileSync,realpathSync,rmSync,writeFileSync} from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {referenceHealth,hash} from '../corpus/reference-health.mjs';
import {
 readDiagnosis,
 requiresSaasAdoptionChecks,
 requiresSaasCopyChecks,
 saasAdoptionCheckKeys,
 saasCopyCheckKeys,
} from '../core/diagnosis.mjs';
import {proveLayout} from './layout.mjs';
import {interactionsCheckForError,operateUsabilityScreen,proveUsability} from './usability.mjs';
import {compareArtifact} from './compare.mjs';
import {load} from './deps.mjs';
import {bindBrowser,writeCompletionReceipt} from './completion-receipt.mjs';
import {writeCompletionProveReceipt} from '../hooks/receipt.mjs';
import {checkCompetingCtaFlowBinding} from './cta-pressure.mjs';
import {verifyReuse} from '../integrations/blocks.mjs';
import {verifyCoverage} from '../integrations/coverage.mjs';
import {assertDdrHasEditionCatalog,resolveProveConstitution} from '../core/constitution.mjs';
import {recordProveCompletion} from '../core/audit-trail.mjs';
import {resolveStopReflexionVerdict} from '../core/reflexion.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..'),exec=promisify(execFile);
const text=(value)=>String(value||"").trim();
// Closed native dialogs are separate workflows. Hidden players in the active
// surface still require a loaded-media scenario, including poster-first players.
export async function activeSurfaceVideos(page){
 return page.locator('video').evaluateAll(videos=>videos.filter(video=>!video.closest('dialog:not([open])')).length);
}
export function checkDefectAssertions(diagnosis,layout,usability){
 const errors=[],out=[];
 // A no-change verdict binds nothing: the diagnosis proved the surface sound and
 // the other categories (layout, usability, comparison) still have to pass.
 if(diagnosis.verdict==='no-change')return {status:'passed',verdict:'no-change',assertions:[],failures:[]};
 for(const [index,defect] of diagnosis.defects.entries()){
  if(!['critical','major'].includes(defect.severity))continue;
  if(!defect.id||!Array.isArray(defect.assertions)||!defect.assertions.length){errors.push(`defect ${index+1} needs an id and executable assertion ids`);continue;}
  for(const id of defect.assertions){
   if(id.startsWith('flow:')){const flow=usability.flows?.find(f=>'flow:'+f.id===id);if(usability.status!==0||!flow)errors.push(`${defect.id}: workflow ${id} did not pass`);else out.push({defect:defect.id,assertion:id,status:'passed'});}
   else{const results=layout.checks?.filter(c=>c.id===id)||[];if(!layout.scenarios||results.length!==layout.scenarios||results.some(r=>r.status!=='passed'))errors.push(`${defect.id}: ${id} must pass in every layout scenario`);else out.push({defect:defect.id,assertion:id,status:'passed',scenarios:results.length});}
  }
 }
 return {status:errors.length?'failed':'passed',verdict:diagnosis.verdict||'defects',assertions:out,failures:errors};
}

/** Presence gate for saas copy + adoption diagnosis buckets. Honesty of notes stays agent. */
export function checkCopyAdoptionPresence(diagnosis,{lane}={}){
 const failures=[],required=[];
 if(requiresSaasCopyChecks(diagnosis,{lane})){
  for(const key of saasCopyCheckKeys){
   required.push(key);
   if(!diagnosis?.[key]||typeof diagnosis[key]!=="object"||text(diagnosis[key].note).length<8){
    failures.push(`${key} missing or note too short for saas copy proof`);
   }
  }
 }
 if(requiresSaasAdoptionChecks(diagnosis,{lane})){
  for(const key of saasAdoptionCheckKeys){
   required.push(key);
   if(!diagnosis?.[key]||typeof diagnosis[key]!=="object"||text(diagnosis[key].note).length<8){
    failures.push(`${key} missing or note too short for saas adoption proof`);
   }
  }
 }
 if(!required.length)return {status:"passed",required:[],failures:[],skipped:true};
 return {status:failures.length?"failed":"passed",required,failures,skipped:false};
}
// Lane defaults to internal when omitted so programmatic callers and media/lex
// fixtures keep prior behavior. Packet completion always passes --lane explicitly
// (design-packet defaults lane to saas); saas/marketing originality then bites.
export async function prove({target,citeId,layoutPath,usabilityPath,diagnosisPath,project,commit,buildId,receiptPath,storageState,reusePath,coveragePath,surfaceContractPath,surfaceReceiptPath,lane="internal",brief="",ddrId="",constitutionIds=null,constitutionEdition="",mode=""}){
 const temp=mkdtempSync(join(tmpdir(),'shine-completion-')),checks={},evidence={};let observed;
 const constitution=resolveProveConstitution({lane,mode,constitutionIds,constitutionEdition});
 try{
  coveragePath ||= project && existsSync(join(project,"shine-coverage.json")) ? join(project,"shine-coverage.json") : undefined;
  if(coveragePath){try{checks.patternCoverage=verifyCoverage(project,JSON.parse(readFileSync(coveragePath,"utf8")));}catch(error){checks.patternCoverage={status:"failed",reason:error.message};}}
  if(reusePath){try{const result=verifyReuse(project,JSON.parse(readFileSync(reusePath,'utf8')));checks.componentReuse=result;evidence.reuse=result;}catch(error){checks.componentReuse={status:'failed',reason:error.message};}}
  surfaceContractPath ||= project && existsSync(join(project,"shine-surfaces.json")) ? join(project,"shine-surfaces.json") : undefined;
  if(surfaceContractPath){try{checks.surfaceWorkflows=verifySurfaceReceipt(project,JSON.parse(readFileSync(surfaceContractPath,"utf8")),surfaceReceiptPath?JSON.parse(readFileSync(surfaceReceiptPath,"utf8")):null);}catch(error){checks.surfaceWorkflows={status:"failed",reason:error.message};}}
  if(project&&existsSync(join(project,"shine-installation.json"))){try{const manifest=JSON.parse(readFileSync(join(project,"shine-installation.json"),"utf8"));checks.componentCompatibility=checkCompatibility(project,manifest.blocks.map(block=>block.path));}catch(error){checks.componentCompatibility={status:"failed",reason:error.message};}}
  const measurement=join(temp,'measure.json');
  try{await exec(process.execPath,[join(ROOT,'verify/measure.mjs'),target,'--cite',citeId,'--json',measurement,...(lane?['--lane',lane]:[]),...(storageState?['--storage-state',storageState]:[])],{maxBuffer:5_000_000,timeout:120000});}catch(error){evidence.measureError=String(error.stderr||error.message).slice(-3000);}
  const measure=existsSync(measurement)?JSON.parse(readFileSync(measurement,'utf8')):null;
  checks.accessibility={status:measure?(measure.axe?.violations?.length||measure.failures?.some(f=>/contrast|axe|text.*measur/i.test(f))?'failed':'passed'):'not_tested'};
  checks.styling={status:measure?(measure.failures.length?'failed':'passed'):'not_tested',failures:measure?.failures||[evidence.measureError||'measurement missing']};
  const layout=await proveLayout({target,contractPath:layoutPath,storageState});checks.layout={status:layout.status,scenarios:layout.scenarios,failures:layout.failures};evidence.layout=layout;
  let usability;
  try{usability=await proveUsability({target,contractPath:usabilityPath,citeId,storageState});checks.interactions={status:'passed',flows:usability.flows};}
  catch(error){usability={status:1,flows:[]};checks.interactions=interactionsCheckForError(citeId,usabilityPath,error);}
  checks.referenceValidity=referenceHealth(ROOT,citeId);
  if(checks.referenceValidity.status==='passed'){
   try{const comparison=await compareArtifact({target,citeId,outPath:join(temp,'compare.png'),lane,brief,mode:diagnosisPath?'existing':'new',diagnosisPath,writeReceipt:false,storageState});checks.visualComparison={status:comparison.status===0?'passed':'failed',failures:comparison.failures,lane};}catch(error){checks.visualComparison={status:'failed',reason:error.message,lane};}
  }else checks.visualComparison={status:'not_tested',reason:'reference capture is not verified',lane};
  if(diagnosisPath){
   try{
    const {value}=readDiagnosis(diagnosisPath,{lane});
    checks.defectAssertions=checkDefectAssertions(value,layout,usability);
    checks.copyAdoption=checkCopyAdoptionPresence(value,{lane});
    checks.competingCtaProof=checkCompetingCtaFlowBinding(value);
   }catch(error){
    checks.defectAssertions={status:'failed',reason:error.message};
    checks.copyAdoption={status:'failed',reason:error.message};
   }
  }
  const {chromium}=load('playwright'),browser=await chromium.launch();
  try{const page=await browser.newPage({...(storageState?{storageState}:{})});const response=await page.goto(/^https?:/.test(target)?target:pathToFileURL(resolve(target)).href,{waitUntil:'networkidle'});
   const meta=await page.evaluate(()=>({sourceCommit:document.querySelector('meta[name="shine-source-commit"]')?.content,buildId:document.querySelector('meta[name="shine-build-id"]')?.content}));
   observed={url:page.url(),status:response?.status()??200,sourceCommit:response?.headers()['x-shine-source-commit']||meta.sourceCommit,buildId:response?.headers()['x-shine-build-id']||meta.buildId,renderedSha256:hash(await page.content()),screenshotSha256:hash(await page.screenshot({fullPage:true}))};
   const videos=await activeSurfaceVideos(page);if(videos&&(!layoutPath||!existsSync(layoutPath)||!JSON.parse(readFileSync(layoutPath,'utf8')).media?.length))checks.layout={status:'not_tested',reason:'video is present but no media-loaded scenario is configured'};
  }finally{await browser.close();}
  let binding;
  if(/^https?:/.test(target)){try{binding=bindBrowser({target,project,expectedCommit:commit,expectedBuild:buildId,observed});checks.buildBinding={status:'passed',commit:binding.commit,buildId:binding.buildId};}catch(error){checks.buildBinding={status:'not_tested',reason:error.message};}}
  else {binding={artifact:resolve(target),artifactSha256:hash(readFileSync(target)),...observed};checks.buildBinding={status:'passed',kind:'local-file'};}
  // Operate prove recipe: saas/denoise + ddrId must carry the full edition catalog.
  if(ddrId&&(lane==='saas'||mode==='denoise')){
   try{
    assertDdrHasEditionCatalog({
     ddrId,
     constitutionIds:constitution.constitutionIds,
     constitutionEdition:constitution.constitutionEdition,
    });
    checks.constitutionCatalog={status:'passed',editionId:constitution.constitutionEdition,count:constitution.constitutionIds.length};
   }catch(error){
    evidence.constitutionCatalogError=error.message;
    checks.constitutionCatalog={status:'failed',reason:error.message};
   }
  }else if(constitution.constitutionIds.length){
   checks.constitutionCatalog={status:'passed',editionId:constitution.constitutionEdition||null,count:constitution.constitutionIds.length,optional:true};
  }
  let status=Object.values(checks).every(c=>c.status==='passed')?'passed':Object.values(checks).some(c=>c.status==='failed')?'failed':'incomplete';
  const report={version:1,status,checks,evidence};
  if(status==='passed'){
   // Always mint the stop-sweep completion store on green — Operate cannot skip prove.
   // SaaS receipts stamp constitutionIds (catalog default when omitted).
   const localTarget=/^https?:/.test(target)?undefined:resolve(target);
   let completionReceipt=null;
   try{
    // Green prove completion always stamps Atlas reflexionVerdict=done (stop).
    const reflexionVerdict=resolveStopReflexionVerdict({cleared:true});
    completionReceipt=writeCompletionProveReceipt({
     cite:citeId,
     target:localTarget,
     lane,
     screen:operateUsabilityScreen(citeId,ROOT)||"",
     checks,
     binding,
     ddrId,
     constitutionIds:constitution.constitutionIds,
     constitutionEdition:constitution.constitutionEdition||"",
     reflexionVerdict,
    });
    report.reflexionVerdict=reflexionVerdict;
   }catch(error){evidence.completionReceiptError=error.message;}
   // Decision-path audit: auto-append prove + receipt-linked hash when --ddr is set.
   if(ddrId&&completionReceipt){
    try{
     const trail=recordProveCompletion(ddrId,completionReceipt);
     checks.auditTrail={status:'passed',proveReceiptHash:trail.proveReceiptHash,events:trail.events.length};
     report.proveReceiptHash=trail.proveReceiptHash;
    }catch(error){
     evidence.auditTrailError=error.message;
     checks.auditTrail={status:'failed',reason:error.message};
     status=Object.values(checks).every(c=>c.status==='passed')?'passed':Object.values(checks).some(c=>c.status==='failed')?'failed':'incomplete';
     report.status=status;
    }
   }
   if(receiptPath){writeCompletionReceipt(receiptPath,report,binding);report.receipt=resolve(receiptPath);}
   if(ddrId)report.ddrId=ddrId;
   if(constitution.constitutionIds.length){
    report.constitutionIds=constitution.constitutionIds;
    report.constitutionEdition=constitution.constitutionEdition;
   }
  }
  return report;
 }catch(error){return {version:1,status:'failed',checks,error:error.message};}finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:undefined;
 const report=await prove({target:args[0],citeId:opt('--cite'),layoutPath:opt('--layout'),usabilityPath:opt('--usability'),diagnosisPath:opt('--diagnosis'),project:opt('--project'),commit:opt('--commit'),buildId:opt('--build-id'),receiptPath:opt('--receipt'),storageState:opt('--storage-state'),reusePath:opt('--reuse'),coveragePath:opt('--coverage'),surfaceContractPath:opt('--surface-contract'),surfaceReceiptPath:opt('--surface-receipt'),lane:opt('--lane')||'internal',brief:opt('--brief')||'',ddrId:opt('--ddr')||'',constitutionIds:opt('--constitution-ids')||null,constitutionEdition:opt('--constitution-edition')||'',mode:opt('--mode')||''});
 if(opt('--json'))writeFileSync(opt('--json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));process.exit(report.status==='passed'?0:1);
}
