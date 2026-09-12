#!/usr/bin/env node
import {existsSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {load} from './deps.mjs';
export const DEFAULT_VIEWPORTS=[390,768,1280,1440,1920].map(width=>({width,height:1000}));
export const MEDIA_STATES=['baseline','long-content','missing-media','media-loaded','large-text'];
export function readLayoutContract(path){
 if(!path||!existsSync(path))throw new Error('missing layout contract');
 const value=JSON.parse(readFileSync(path,'utf8')),errors=[];
 if(value.version!==1)errors.push('layout version must be 1');
 if(!Array.isArray(value.checks)||!value.checks.length)errors.push('layout checks are required');
 const ids=new Set();
 for(const check of value.checks||[]){
  if(!check.id||ids.has(check.id))errors.push('checks need unique ids');ids.add(check.id);
  if(!['gap','aspect-ratio','no-overflow','visible'].includes(check.type))errors.push(`unknown check type ${check.type}`);
  if(!check.selector)errors.push(`${check.id}: selector required`);
  if(check.type==='gap'&&(!check.to||!Number.isFinite(check.max)||check.max<0))errors.push(`${check.id}: gap needs to and nonnegative max`);
  if(check.type==='aspect-ratio'&&(!Number.isFinite(check.ratio)||check.ratio<=0))errors.push(`${check.id}: positive ratio required`);
 }
 const viewports=value.viewports||DEFAULT_VIEWPORTS;
 if(viewports.length<2||!viewports.some(v=>v.width<=480)||!viewports.some(v=>v.width>=1280))errors.push('include mobile and desktop viewports');
 if(viewports.length>10||viewports.some(v=>!Number.isFinite(v.width)||v.width<240||v.width>3840||!Number.isFinite(v.height)||v.height<320||v.height>2160))errors.push('invalid viewport bounds');
 const states=value.states||MEDIA_STATES.filter(s=>(s!=='media-loaded'||value.media?.length)&&(s!=='missing-media'||value.missingMedia?.length));
 for(const state of ['baseline','long-content',...(value.missingMedia?.length?['missing-media']:[]),'large-text',...(value.media?.length?['media-loaded']:[])])if(!states.includes(state))errors.push(`missing required state ${state}`);
 for(const state of states)if(!MEDIA_STATES.includes(state))errors.push(`unknown state ${state}`);
 if(!value.content?.length)errors.push('declare real long-content targets');
 for(const item of value.content||[])if(!item.selector||typeof item.text!=='string'||item.text.length<150)errors.push('long-content target needs a selector and at least 150 characters');
 if(!value.missingMedia?.length&&String(value.noMediaReason||'').length<12)errors.push('declare missing-media selectors or explain why no media is applicable');
 for(const media of value.media||[])if(!media.video||!media.frame)errors.push('media needs video and frame selectors');
 if(errors.length)throw new Error(errors.join('; '));
 return {...value,viewports,states};
}
// A media descendant does not exempt its occupied wrapper from unused-space checks.
export async function mediaWaste(page){return page.evaluate(()=>{
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
 const found=[],seen=new Set();
 for(const media of document.querySelectorAll('video,img,canvas')){
  if(!visible(media))continue;
  let box=media.parentElement;
  for(let depth=0;box&&depth<4&&box!==document.body;depth++,box=box.parentElement){
   // A shell containing the page's main landmark is not a media frame.
   // Keep checking wrappers inside main, including main itself, so an empty
   // player wrapper cannot evade the check merely by adding a landmark.
   const main=box.querySelector('main,[role=main]'),nav=box.querySelector('nav,[role=navigation]');
   if(main&&nav&&!main.contains(nav))break;
   if(seen.has(box)||!visible(box))continue;seen.add(box);
   const r=box.getBoundingClientRect();let bottom=media.getBoundingClientRect().bottom;
   for(const leaf of box.querySelectorAll('img,video,canvas'))if(visible(leaf))bottom=Math.max(bottom,leaf.getBoundingClientRect().bottom);
   const walker=document.createTreeWalker(box,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){const node=walker.currentNode;if(!node.textContent.trim()||!visible(node.parentElement)||/^(SCRIPT|STYLE)$/.test(node.parentElement.tagName))continue;const range=document.createRange();range.selectNodeContents(node);for(const rect of range.getClientRects())bottom=Math.max(bottom,rect.bottom);}
   const padding=parseFloat(getComputedStyle(box).paddingBottom)||0,gap=r.bottom-bottom-padding;
   if(gap>64&&gap*r.width>innerWidth*innerHeight*.03)found.push({selector:box.id?'#'+box.id:box.tagName.toLowerCase()+'.'+[...box.classList].join('.'),gap:Math.round(gap*100)/100,area:gap*r.width});
  }
 }
 return found;
});}
async function exactlyOne(page,selector){const locator=page.locator(selector);const count=await locator.count();if(count!==1)throw new Error(`${selector}: expected one element, found ${count}`);return locator;}
async function mutate(page,contract,state){
 if(state==='long-content')for(const item of contract.content)await (await exactlyOne(page,item.selector)).evaluate((el,text)=>{el.textContent=text;},item.text);
 if(state==='missing-media'){
  for(const selector of contract.missingMedia){const loc=page.locator(selector);if(!await loc.count())throw new Error(`missing-media selector matched zero elements: ${selector}`);await loc.evaluateAll(els=>els.forEach(el=>{if(el.tagName==='IMG'){el.src='data:,';el.dispatchEvent(new Event('error'));}else{el.hidden=true;el.dispatchEvent(new Event('error'));}}));}
 }
 if(state==='large-text')await page.evaluate(()=>{const items=[...document.querySelectorAll('body *')].filter(el=>!["SCRIPT","STYLE","SVG","PATH"].includes(el.tagName)&&[...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())).map(el=>({el,size:parseFloat(getComputedStyle(el).fontSize),line:parseFloat(getComputedStyle(el).lineHeight)}));for(const {el,size,line} of items){el.style.fontSize=(size*2)+'px';if(Number.isFinite(line))el.style.lineHeight=(line*2)+'px';}});
 if(state==='media-loaded')for(const item of contract.media||[]){
  await exactlyOne(page,item.video);await exactlyOne(page,item.frame);
  await page.locator(item.video).evaluate(async(video,poster)=>{
   const canvas=document.createElement('canvas');canvas.width=1152;canvas.height=768;canvas.getContext('2d').fillRect(0,0,1152,768);
   video.srcObject=canvas.captureStream(10);video.hidden=false;video.style.display='block';video.muted=true;
   if(poster)document.querySelectorAll(poster).forEach(el=>el.style.display='none');await video.play();
  },item.poster||'');
  await page.waitForFunction(selector=>document.querySelector(selector)?.videoWidth===1152,item.video,{timeout:10000});
 }
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(50);
}
async function checkGeometry(page,check){
 const element=await exactlyOne(page,check.selector);
 if(!await element.isVisible())throw new Error(`${check.selector} is not visible`);
 const a=await element.boundingBox();
 if(check.type==='visible')return {visible:true};
 if(check.type==='gap'){
  const target=await exactlyOne(page,check.to);if(!await target.isVisible())throw new Error(`${check.to} is not visible`);
  const b=await target.boundingBox(),gap=check.axis==='horizontal'?b.x-(a.x+a.width):b.y-(a.y+a.height);
  if(gap>(check.max??1)||gap<(check.min??-1))throw new Error(`gap ${gap.toFixed(2)}px outside [${check.min??-1},${check.max}]`);
  return {gap};
 }
 if(check.type==='aspect-ratio'){const ratio=a.width/a.height;if(Math.abs(ratio-check.ratio)>(check.tolerance??.02))throw new Error(`ratio ${ratio.toFixed(3)} != ${check.ratio}`);return {ratio};}
 const dimensions=await element.evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,height:el.clientHeight,scrollHeight:el.scrollHeight}));
 if(dimensions.scrollWidth>dimensions.width+1||(check.axis==='both'&&dimensions.scrollHeight>dimensions.height+1))throw new Error('unexpected content overflow');
 return dimensions;
}
export async function proveLayout({target,contractPath,storageState}){
 let contract;try{contract=readLayoutContract(contractPath);}catch(error){return {status:'not_tested',checks:[],scenarios:0,failures:[error.message]};}
 const {chromium}=load('playwright'),browser=await chromium.launch(),checks=[],failures=[];let scenarios=0;
 try{
  for(const viewport of contract.viewports)for(const state of contract.states){
   const context=await browser.newContext({viewport,...(storageState?{storageState}:{} )});const page=await context.newPage();const scope=`${viewport.width}x${viewport.height}/${state}`;scenarios++;
   try{
    await page.goto(/^https?:/.test(target)?target:pathToFileURL(resolve(target)).href,{waitUntil:'networkidle',timeout:30000});
    if(contract.ready)await page.locator(contract.ready).waitFor({state:'visible',timeout:10000});
    await mutate(page,contract,state);
    for(const check of contract.checks){try{const facts=await checkGeometry(page,check);checks.push({id:check.id,scope,status:'passed',facts});}catch(error){checks.push({id:check.id,scope,status:'failed',reason:error.message});failures.push(`${scope}/${check.id}: ${error.message}`);}}
    for(const waste of await mediaWaste(page))failures.push(`${scope}: ${waste.gap}px unused below media in ${waste.selector}`);
   }catch(error){failures.push(`${scope}: ${error.message}`);}finally{await context.close();}
  }
 }finally{await browser.close();}
 return {status:failures.length?'failed':'passed',scenarios,checks,failures,mediaProof:'synthetic media-element loading; not live-provider playback'};
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:undefined;
 const result=await proveLayout({target:args[0],contractPath:opt('--contract'),storageState:opt('--storage-state')});
 if(opt('--json'))writeFileSync(opt('--json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));process.exit(result.status==='passed'?0:1);
}
