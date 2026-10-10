import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
export const hash = value => createHash('sha256').update(value).digest('hex');
const errorPage = /(?:\b(?:404|403|500|502|503)\b|page not found|access denied|just a moment|verify (?:you are|you're) human|checking your browser|enable javascript and cookies)/i;
/** HeroUI harvest theater — universal OR-selector that any docs shell passes. */
export const HEROUI_THEATER_SELECTOR = 'main, [data-slot], button, h1, nav';
const bareGeneric = /^(?:body|main|h1|a|header|article|nav|button|\[data-slot\])\s*$/;
/** True when the pack is an intentional error-page demo (404 block, TailAdmin not-found, Flowbite 500), not a capture that landed on a wall. */
export function intentionalErrorDemo({expectedText='',expectedTextMatched=false,intentionalErrorPage=false}={}) {
  return Boolean(intentionalErrorPage) || Boolean(expectedTextMatched && expectedText && errorPage.test(expectedText));
}
export function captureHealth({status,title='',headings='',expectedSelector='',expectedCount=0,expectedText='',expectedTextMatched=false,body='',sourceUrl='',finalUrl='',intentionalErrorPage=false}) {
 const reasons=[];
 if(!Number.isFinite(status)||status<200||status>=300)reasons.push(`HTTP ${status}`);
 if(errorPage.test(title+'\n'+headings) && !intentionalErrorDemo({expectedText,expectedTextMatched,intentionalErrorPage}))reasons.push('error, access or challenge page');
 if(!sourceUrl||!finalUrl)reasons.push('capture URL missing');
 const normalizedSelector = String(expectedSelector || '').replace(/\s+/g, ' ').trim();
 if(normalizedSelector === HEROUI_THEATER_SELECTOR){
  reasons.push('theater selector: universal HeroUI shell OR-list proves nothing component-specific');
 }
 const meaningful=normalizedSelector && normalizedSelector.split(',').some(s=>! bareGeneric.test(s.trim()));
 if(!meaningful&&!expectedText)reasons.push('capture needs a semantic selector or expected page text');
 // Empty expectedText + only generic tokens is green theater (docs shell lipstick).
 if(!String(expectedText||'').trim() && normalizedSelector && !meaningful){
  reasons.push('capture needs expected page text when selector is generic');
 }
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
  // Prefer explicit sourcePath (relative to repo root). Legacy sourceSha256+sourceUrl
  // still works when sourceUrl is a repo-relative path.
  const bindPath = meta.capture.sourcePath || (
    meta.capture.sourceSha256 && !/^https?:\/\//i.test(String(meta.capture.sourceUrl || ''))
      ? meta.capture.sourceUrl
      : ''
  );
  if(meta.capture.sourceSha256){
   if(!bindPath || !existsSync(join(root,bindPath)) || hash(readFileSync(join(root,bindPath)))!==meta.capture.sourceSha256){
    return {status:'failed',reasons:['reference source changed after capture']};
   }
  } else if(String(id).startsWith('heroui-')){
   // HeroUI must bind local pack source — remote URL + unbound source/ is theater.
   return {status:'failed',reasons:['heroui pack missing sourceSha256/sourcePath binding']};
  }
  return {...check,source:meta.capture.sourceUrl,capturedAt:meta.capture.capturedAt,shotSha256:meta.capture.shotSha256};
 }catch{return {status:'failed',reasons:['invalid capture metadata']};}
}
/** Run before screenshotting; the caller binds the resulting image hash afterwards. */
export async function inspectReferencePage(page,response,{url,expect,expectedText='',intentionalErrorPage=false}) {
 const facts=await page.evaluate(()=>({title:document.title,headings:[...document.querySelectorAll('h1,h2')].map(e=>e.textContent).join('\n'),body:document.body.innerText}));
 const expectedTextMatched=expectedText?facts.body.includes(expectedText):false;
 const evidence={status:response?.status()??(url.startsWith('file:')?200:0),...facts,expectedSelector:expect,expectedCount:await page.locator(expect).count(),expectedText,expectedTextMatched,intentionalErrorPage,sourceUrl:url,finalUrl:page.url(),capturedAt:new Date().toISOString()};
 const health=captureHealth(evidence);if(health.status!=='passed')throw new Error(health.reasons.join('; '));
 // Store only the semantic evidence, not arbitrary full-page contents.
 delete evidence.body;
 return evidence;
}
