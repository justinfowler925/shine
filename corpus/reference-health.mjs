import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
export const hash = value => createHash('sha256').update(value).digest('hex');
const errorPage = /(?:\b(?:404|403|500|502|503)\b|page not found|access denied|just a moment|verify (?:you are|you're) human|checking your browser|enable javascript and cookies)/i;
export function captureHealth({status,title='',headings='',expectedSelector='',expectedCount=0,expectedText='',expectedTextMatched=false,body='',sourceUrl='',finalUrl=''}) {
 const reasons=[];
 if(!Number.isFinite(status)||status<200||status>=300)reasons.push(`HTTP ${status}`);
 if(errorPage.test(title+'\n'+headings))reasons.push('error, access or challenge page');
 if(!sourceUrl||!finalUrl)reasons.push('capture URL missing');
 const meaningful=expectedSelector && expectedSelector.split(',').some(s=>! /^(?:body|main|h1|a|header|article)\s*$/.test(s.trim()));
 if(!meaningful&&!expectedText)reasons.push('capture needs a semantic selector or expected page text');
 if(!expectedCount)reasons.push(`expected content missing: ${expectedSelector}`);
 if(expectedText&&!expectedTextMatched&&!body.includes(expectedText))reasons.push(`expected text missing: ${expectedText}`);
 return {status:reasons.length?'failed':'passed',reasons};
}
export function referenceHealth(root,id) {
 const dir=join(root,'corpus/packs',id),metaPath=join(dir,'meta.json'),shotPath=join(dir,'shot.png');
 if(!existsSync(shotPath))return {status:'not_tested',reasons:['reference screenshot missing']};
 if(!existsSync(metaPath))return {status:'not_tested',reasons:['capture provenance missing']};
 try {
  const meta=JSON.parse(readFileSync(metaPath,'utf8'));
  if(meta.review?.status==='failed')return {status:'failed',reasons:[meta.review.reason]};
  if(!meta.capture)return {status:'not_tested',reasons:['legacy capture has no HTTP/content evidence; recapture it']};
  const check=captureHealth(meta.capture);
  if(check.status!=='passed')return check;
  if(!Number.isFinite(Date.parse(meta.capture.capturedAt)))return {status:'failed',reasons:['capture date missing or invalid']};
  if(meta.capture.shotSha256!==hash(readFileSync(shotPath)))return {status:'failed',reasons:['screenshot changed since capture validation']};
  if(meta.capture.sourceSha256 && (!existsSync(join(root,meta.capture.sourceUrl))||hash(readFileSync(join(root,meta.capture.sourceUrl)))!==meta.capture.sourceSha256))return {status:'failed',reasons:['reference source changed after capture']};
  return {...check,source:meta.capture.sourceUrl,capturedAt:meta.capture.capturedAt,shotSha256:meta.capture.shotSha256};
 }catch{return {status:'failed',reasons:['invalid capture metadata']};}
}
/** Run before screenshotting; the caller binds the resulting image hash afterwards. */
export async function inspectReferencePage(page,response,{url,expect,expectedText=''}) {
 const facts=await page.evaluate(()=>({title:document.title,headings:[...document.querySelectorAll('h1,h2')].map(e=>e.textContent).join('\n'),body:document.body.innerText}));
 const evidence={status:response?.status()??(url.startsWith('file:')?200:0),...facts,expectedSelector:expect,expectedCount:await page.locator(expect).count(),expectedText,sourceUrl:url,finalUrl:page.url(),capturedAt:new Date().toISOString()};
 const health=captureHealth(evidence);if(health.status!=='passed')throw new Error(health.reasons.join('; '));
 // Store only the semantic evidence, not arbitrary full-page contents.
 evidence.expectedTextMatched=expectedText?facts.body.includes(expectedText):false;delete evidence.body;
 return evidence;
}
