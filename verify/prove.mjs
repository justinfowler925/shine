#!/usr/bin/env node
import {existsSync,mkdtempSync,readFileSync,realpathSync,rmSync,writeFileSync} from 'node:fs';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {referenceHealth,hash} from '../corpus/reference-health.mjs';
import {readDiagnosis} from '../core/diagnosis.mjs';
import {proveLayout} from './layout.mjs';
import {proveUsability} from './usability.mjs';
import {compareArtifact} from './compare.mjs';
import {load} from './deps.mjs';
import {bindBrowser,writeCompletionReceipt} from './completion-receipt.mjs';
import {verifyReuse} from '../integrations/blocks.mjs';
import {verifyCoverage} from '../integrations/coverage.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..'),exec=promisify(execFile);
// Closed native dialogs are separate workflows. Hidden players in the active
// surface still require a loaded-media scenario, including poster-first players.
export async function activeSurfaceVideos(page){
 return page.locator('video').evaluateAll(videos=>videos.filter(video=>!video.closest('dialog:not([open])')).length);
}
export function checkDefectAssertions(diagnosis,layout,usability){
 const errors=[],out=[];
 for(const [index,defect] of diagnosis.defects.entries()){
  if(!['critical','major'].includes(defect.severity))continue;
  if(!defect.id||!Array.isArray(defect.assertions)||!defect.assertions.length){errors.push(`defect ${index+1} needs an id and executable assertion ids`);continue;}
  for(const id of defect.assertions){
   if(id.startsWith('flow:')){const flow=usability.flows?.find(f=>'flow:'+f.id===id);if(usability.status!==0||!flow)errors.push(`${defect.id}: workflow ${id} did not pass`);else out.push({defect:defect.id,assertion:id,status:'passed'});}
   else{const results=layout.checks?.filter(c=>c.id===id)||[];if(!layout.scenarios||results.length!==layout.scenarios||results.some(r=>r.status!=='passed'))errors.push(`${defect.id}: ${id} must pass in every layout scenario`);else out.push({defect:defect.id,assertion:id,status:'passed',scenarios:results.length});}
  }
 }
 return {status:errors.length?'failed':'passed',assertions:out,failures:errors};
}
export async function prove({target,citeId,layoutPath,usabilityPath,diagnosisPath,project,commit,buildId,receiptPath,storageState,reusePath,coveragePath}){
 const temp=mkdtempSync(join(tmpdir(),'shine-completion-')),checks={},evidence={};let observed;
 try{
  coveragePath ||= project && existsSync(join(project,"shine-coverage.json")) ? join(project,"shine-coverage.json") : undefined;
  if(coveragePath){try{checks.patternCoverage=verifyCoverage(project,JSON.parse(readFileSync(coveragePath,"utf8")));}catch(error){checks.patternCoverage={status:"failed",reason:error.message};}}
  if(reusePath){try{const result=verifyReuse(project,JSON.parse(readFileSync(reusePath,'utf8')));checks.componentReuse=result;evidence.reuse=result;}catch(error){checks.componentReuse={status:'failed',reason:error.message};}}
  const measurement=join(temp,'measure.json');
  try{await exec(process.execPath,[join(ROOT,'verify/measure.mjs'),target,'--cite',citeId,'--json',measurement,...(storageState?['--storage-state',storageState]:[])],{maxBuffer:5_000_000,timeout:120000});}catch(error){evidence.measureError=String(error.stderr||error.message).slice(-3000);}
  const measure=existsSync(measurement)?JSON.parse(readFileSync(measurement,'utf8')):null;
  checks.accessibility={status:measure?(measure.axe?.violations?.length||measure.failures?.some(f=>/contrast|axe|text.*measur/i.test(f))?'failed':'passed'):'not_tested'};
  checks.styling={status:measure?(measure.failures.length?'failed':'passed'):'not_tested',failures:measure?.failures||[evidence.measureError||'measurement missing']};
  const layout=await proveLayout({target,contractPath:layoutPath,storageState});checks.layout={status:layout.status,scenarios:layout.scenarios,failures:layout.failures};evidence.layout=layout;
  let usability;
  try{usability=await proveUsability({target,contractPath:usabilityPath,citeId,storageState});checks.interactions={status:'passed',flows:usability.flows};}catch(error){usability={status:1,flows:[]};checks.interactions={status:usabilityPath&&existsSync(usabilityPath)?'failed':'not_tested',reason:error.message};}
  checks.referenceValidity=referenceHealth(ROOT,citeId);
  if(checks.referenceValidity.status==='passed'){
   try{const comparison=await compareArtifact({target,citeId,outPath:join(temp,'compare.png'),lane:'internal',mode:diagnosisPath?'existing':'new',diagnosisPath,writeReceipt:false,storageState});checks.visualComparison={status:comparison.status===0?'passed':'failed',failures:comparison.failures};}catch(error){checks.visualComparison={status:'failed',reason:error.message};}
  }else checks.visualComparison={status:'not_tested',reason:'reference capture is not verified'};
  if(diagnosisPath){try{const {value}=readDiagnosis(diagnosisPath);checks.defectAssertions=checkDefectAssertions(value,layout,usability);}catch(error){checks.defectAssertions={status:'failed',reason:error.message};}}
  const {chromium}=load('playwright'),browser=await chromium.launch();
  try{const page=await browser.newPage({...(storageState?{storageState}:{})});const response=await page.goto(/^https?:/.test(target)?target:pathToFileURL(resolve(target)).href,{waitUntil:'networkidle'});
   const meta=await page.evaluate(()=>({sourceCommit:document.querySelector('meta[name="shine-source-commit"]')?.content,buildId:document.querySelector('meta[name="shine-build-id"]')?.content}));
   observed={url:page.url(),status:response?.status()??200,sourceCommit:response?.headers()['x-shine-source-commit']||meta.sourceCommit,buildId:response?.headers()['x-shine-build-id']||meta.buildId,renderedSha256:hash(await page.content()),screenshotSha256:hash(await page.screenshot({fullPage:true}))};
   const videos=await activeSurfaceVideos(page);if(videos&&(!layoutPath||!existsSync(layoutPath)||!JSON.parse(readFileSync(layoutPath,'utf8')).media?.length))checks.layout={status:'not_tested',reason:'video is present but no media-loaded scenario is configured'};
  }finally{await browser.close();}
  let binding;
  if(/^https?:/.test(target)){try{binding=bindBrowser({target,project,expectedCommit:commit,expectedBuild:buildId,observed});checks.buildBinding={status:'passed',commit:binding.commit,buildId:binding.buildId};}catch(error){checks.buildBinding={status:'not_tested',reason:error.message};}}
  else {binding={artifact:resolve(target),artifactSha256:hash(readFileSync(target)),...observed};checks.buildBinding={status:'passed',kind:'local-file'};}
  const status=Object.values(checks).every(c=>c.status==='passed')?'passed':Object.values(checks).some(c=>c.status==='failed')?'failed':'incomplete';
  const report={version:1,status,checks,evidence};
  if(status==='passed'&&receiptPath){writeCompletionReceipt(receiptPath,report,binding);report.receipt=resolve(receiptPath);}
  return report;
 }catch(error){return {version:1,status:'failed',checks,error:error.message};}finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:undefined;
 const report=await prove({target:args[0],citeId:opt('--cite'),layoutPath:opt('--layout'),usabilityPath:opt('--usability'),diagnosisPath:opt('--diagnosis'),project:opt('--project'),commit:opt('--commit'),buildId:opt('--build-id'),receiptPath:opt('--receipt'),storageState:opt('--storage-state'),reusePath:opt('--reuse'),coveragePath:opt('--coverage')});
 if(opt('--json'))writeFileSync(opt('--json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));process.exit(report.status==='passed'?0:1);
}
