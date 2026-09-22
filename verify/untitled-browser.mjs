// Render the pinned public demo exports, independently of Storybook linkage.
// Run on the corpus host after installing its upstream runtime dependencies.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {homedir} from 'node:os';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {load} from './deps.mjs';
import {untitledSourceFingerprint} from '../corpus/untitled-proof.mjs';
const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:undefined;
const root=resolve(process.env.DESIGN_CORPUS||join(homedir(),'design-corpus'),'untitled-ui-react'),out=resolve(opt('--out')||'/tmp/shine-untitled-browser');mkdirSync(out,{recursive:true});
const sourceFingerprint=untitledSourceFingerprint(root);
const catalog=JSON.parse(readFileSync(new URL('../corpus/untitledui-examples.json',import.meta.url),'utf8'));
const interactionIds=['untitledui-checkbox-base','untitledui-toggle-base','untitledui-toggle-slim-base','untitledui-default-10','untitledui-date-picker-controlled','untitledui-table01-divider-line'];
const examples=args.includes('--interactions')?catalog.examples.filter(x=>interactionIds.includes(x.id)):opt('--example')?catalog.examples.filter(x=>x.id===opt('--example')):catalog.examples;
if(!examples.length)throw Error('No examples matched');
const files=[...new Set(examples.map(x=>x.sourceFile.replace('untitled-ui-react/','')))];
const entry=files.map((f,i)=>`import * as demo${i} from ${JSON.stringify(join(root,f))};`).join('\n')+`
import {Carousel} from ${JSON.stringify(join(root,"components/application/carousel/carousel-base.tsx"))};
import React from ${JSON.stringify(join(root,'node_modules/react/index.js'))};
import {createRoot} from ${JSON.stringify(join(root,'node_modules/react-dom/client.js'))};
const demos={${examples.map(x=>JSON.stringify(x.id)+':demo'+files.indexOf(x.sourceFile.replace('untitled-ui-react/',''))+'['+JSON.stringify(x.export)+']').join(',')}};
class Boundary extends React.Component{state={error:null};static getDerivedStateFromError(e){return {error:String(e)}};render(){return this.state.error?<pre role="alert">{this.state.error}</pre>:this.props.children}}
const id=new URLSearchParams(location.search).get('example'),Demo=demos[id];const content=id==='untitledui-carousel-indicator'?<Carousel.Root><Carousel.Content><Carousel.Item>First sample</Carousel.Item><Carousel.Item>Second sample</Carousel.Item></Carousel.Content><Demo/></Carousel.Root>:id==='untitledui-custom-radar-chart-tick'?<svg width={320} height={160}><Demo payload={{value:'Sample axis'}} x={160} y={80} textAnchor='middle' stroke='currentColor'/></svg>:<Demo/>;createRoot(document.getElementById('root')).render(<Boundary>{content}</Boundary>);`;
writeFileSync(join(out,'entry.tsx'),entry);
await load('esbuild').build({entryPoints:[join(out,'entry.tsx')],outfile:join(out,'app.js'),bundle:true,platform:'browser',jsx:'automatic',alias:{'@':root,react:join(root,'node_modules/react'), 'react-dom':join(root,'node_modules/react-dom')},define:{'process.env.NODE_ENV':'"production"'},logLevel:'warning'});
const css=await load('postcss')([load('@tailwindcss/postcss')({base:root})]).process(readFileSync(join(root,'styles/globals.css'),'utf8'),{from:join(root,'styles/globals.css')});writeFileSync(join(out,'app.css'),css.css);
writeFileSync(join(out,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Untitled public source verification</title><link rel="stylesheet" href="/app.css"><body><main id="root" style="padding:24px"></main><script src="/app.js"></script></body></html>');
const server=createServer((req,res)=>{const path=new URL(req.url,'http://localhost').pathname,file=path==='/app.js'?'app.js':path==='/app.css'?'app.css':'index.html';res.setHeader('content-type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(readFileSync(join(out,file)));});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const {chromium}=load('playwright'),browser=await chromium.launch(),results=[];
try{for(const example of examples){const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/?example='+example.id,{waitUntil:'domcontentloaded'});await page.locator('#root > *').first().waitFor({state:'attached',timeout:15000});await page.evaluate(()=>document.fonts.ready);
 const alert=await page.locator('#root > [role=alert]').allTextContents();if(alert.length)errors.push(...alert);
 const widths=[];for(const width of [390,1440]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));widths.push({width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});}
 const interactions=[];
 if(['untitledui-checkbox-base','untitledui-toggle-base','untitledui-toggle-slim-base'].includes(example.id)){
  const control=page.locator('input[type=checkbox]:enabled').first();const before=await control.isChecked();await control.focus();await page.keyboard.press('Space');if(await control.isChecked()===before)throw Error('Keyboard toggle did not change checked state');await page.keyboard.press('Space');if(await control.isChecked()!==before)throw Error('Keyboard toggle did not restore checked state');interactions.push('Space toggles and restores checked state');
 }
 if(example.id==='untitledui-default-10'){
  const trigger=page.locator('button').filter({hasText:'Select team member'}).last();await trigger.click();const option=page.getByRole('option').filter({hasText:'Phoenix Baker'});await option.click();const selected=page.locator('button').filter({hasText:'Phoenix Baker'}).last();await selected.waitFor();await selected.click();await page.getByRole('listbox').waitFor();await page.getByRole('option').first().focus();await page.keyboard.press('Escape');await page.getByRole('listbox').waitFor({state:'hidden',timeout:5000});interactions.push('Select changes value; Escape dismisses listbox');
 }
 if(example.id==='untitledui-date-picker-controlled'){
  const trigger=page.getByRole('button').first();await trigger.click();await page.getByRole('dialog',{name:'Date picker'}).waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden',timeout:5000});if(!await trigger.evaluate(e=>e===document.activeElement))throw Error('Date picker did not restore focus');interactions.push('Date picker opens, Escape dismisses and restores focus');
 }
 if(example.id==='untitledui-table01-divider-line'){
  const header=page.locator('th').filter({hasText:'Name'}).first();await header.click();const ascending=await page.locator('tbody tr').allTextContents();await header.click();const descending=await page.locator('tbody tr').allTextContents();if(JSON.stringify(ascending)===JSON.stringify(descending))throw Error('Sort did not change actual rows');const cb=page.locator('tbody input[type=checkbox]').first();await cb.focus();await page.keyboard.press('Space');if(!await cb.isChecked())throw Error('Row selection failed');interactions.push('Sort changes actual rows; row checkbox selects record');
 }
 if(interactions.length){await page.screenshot({path:join(out,example.id+'-1440.png'),fullPage:true});await page.setViewportSize({width:390,height:1000});await page.screenshot({path:join(out,example.id+'-390.png'),fullPage:true});}
 const source=readFileSync(join(root,example.sourceFile.replace('untitled-ui-react/','')));results.push({id:example.id,status:errors.length?'failed':'rendered',sourceSha256:createHash('sha256').update(source).digest('hex'),storyLinked:example.renderable,widths,errors,interactions,context:example.id==='untitledui-carousel-indicator'?'real Carousel provider':example.id==='untitledui-custom-radar-chart-tick'?'SVG with required sample axis payload':'standalone demo',interactionStatus:interactions.length?'passed':'not_tested'});
 }catch(e){results.push({id:example.id,status:'failed',sourceSha256:createHash('sha256').update(readFileSync(join(root,example.sourceFile.replace('untitled-ui-react/','')))).digest('hex'),errors:[e.message],diagnostic:await page.locator('body').innerText().catch(()=>''),interactionStatus:'not_tested'});}finally{await page.close();}
 writeFileSync(join(out,'results.json'),JSON.stringify({kind:'shine-untitled-render',sourceFingerprint,createdAt:new Date().toISOString(),upstream:catalog.upstream,expected:examples.length,results},null,2));console.log(example.id+': '+results.at(-1).status);
}}finally{await browser.close();await new Promise(r=>server.close(r));}
if(results.some(r=>r.status==='failed'))process.exitCode=1;
