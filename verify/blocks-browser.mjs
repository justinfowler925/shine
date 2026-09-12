#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import {chromium} from 'playwright';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),fixture=join(root,'verify/fixtures/blocks'),temp=mkdtempSync(join(tmpdir(),'shine-blocks-'));
const out=process.env.SHINE_BLOCK_PROOF||join(tmpdir(),'shine-block-proof');mkdirSync(out,{recursive:true});
const catalog=JSON.parse(readFileSync(join(root,'blocks/catalog.json'),'utf8')).blocks;
const files={};for(const block of catalog){const item=JSON.parse(readFileSync(join(root,`site/r/${block.id}.json`),'utf8'));assert.equal(item.files.length,1);assert.equal(item.files[0].content,readFileSync(join(root,`blocks/${block.id}.tsx`),'utf8'));files[`@/components/shine/${block.id}`]=item.files[0].content;}
await build({entryPoints:[join(fixture,'app.tsx')],outfile:join(temp,'app.js'),bundle:true,jsx:'automatic',plugins:[{name:'published-registry',setup(b){b.onResolve({filter:/^@\//},args=>files[args.path]?{path:args.path,namespace:'registry'}:{path:args.path==='@/lib/utils'?join(fixture,'utils.ts'):join(fixture,'ui',args.path.split('/').at(-1)+'.tsx')});b.onLoad({filter:/.*/,namespace:'registry'},args=>({contents:files[args.path],loader:'tsx',resolveDir:root}));}}]});
const css=await postcss([tailwind()]).process(readFileSync(join(fixture,'theme.css'),'utf8'),{from:join(fixture,'theme.css')});writeFileSync(join(temp,'app.css'),css.css);
const server=createServer((req,res)=>{const path=req.url==='/app.js'?'app.js':req.url==='/app.css'?'app.css':null;res.setHeader('content-type',path?.endsWith('.js')?'text/javascript':path?.endsWith('.css')?'text/css':'text/html');res.end(path?readFileSync(join(temp,path)):'<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shine blocks</title><link rel="stylesheet" href="/app.css"><div id="root"></div><script src="/app.js"></script></html>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(5000);const errors=[];page.on('pageerror',error=>errors.push(error.message));let checked=0;
const check=async(name,fn)=>{await fn();checked++;console.log(`PASS ${name}`);};
const visible=async locator=>assert.equal(await locator.isVisible(),true),hidden=async locator=>assert.equal(await locator.isVisible(),false);
const button=name=>page.getByRole('button',{name,exact:true});
const openEditor=async()=>{await page.getByRole('button',{name:'Open Account 01',exact:true}).click();await button('Edit account').click();await visible(page.getByRole('dialog',{name:'Edit account'}));};
try{
 await page.goto(url);await page.getByRole('heading',{name:'Account workspace'}).waitFor();
 await check('12 records start collapsed',async()=>{await hidden(page.getByRole('table'));assert.equal(await button('Show details').getAttribute('aria-expanded'),'false');});
 await button('Show details').click();
 await check('10 real rows on first page',async()=>assert.equal(await page.locator('tbody tr').count(),10));
 await check('pagination changes real records',async()=>{await button('Next').click();assert.equal(await page.locator('tbody tr').count(),2);assert.match(await page.locator('tbody').innerText(),/Account 11/);await button('Previous').click();});
 await check('sort uses numeric values',async()=>{await page.getByRole('button',{name:/Amount/}).click();await page.locator('tbody tr').first().filter({hasText:'Account 12'}).waitFor();assert.match(await page.locator('tbody tr').first().innerText(),/Account 12/);await page.getByRole('button',{name:/Amount/}).click();});
 await check('search and disclosure preserve state',async()=>{await page.getByLabel('Search accounts').fill('Account 01');assert.equal(await page.locator('tbody tr').count(),1);await button('Hide details').click();await button('Show details').click();assert.equal(await page.getByLabel('Search accounts').inputValue(),'Account 01');await button('Clear filters').click();});
 await check('filter changes records',async()=>{await page.getByLabel('Owner',{exact:true}).selectOption('Sam');assert.equal(await page.locator('tbody tr').count(),6);assert.doesNotMatch(await page.locator('tbody').innerText(),/Riley/);await button('Clear filters').click();});
 await check('filtered empty recovers',async()=>{await page.getByLabel('Search accounts').fill('absent');await visible(page.getByText('No matching records',{exact:true}));await button('Clear filters').last().click();await visible(page.getByRole('table'));});
 await check('visibility changes cells',async()=>{await button('Columns').click();await page.getByRole('menuitemcheckbox',{name:'Owner',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.getByRole('columnheader',{name:/Owner/}).count(),0);await button('Columns').click();await page.getByRole('menuitemcheckbox',{name:'Owner',exact:true}).click();await page.keyboard.press('Escape');});
 await check('bulk failure retains selection; success clears',async()=>{await page.getByRole('checkbox',{name:'Select this page',exact:true}).click();await button('Assign selected').click();await visible(page.getByRole('alert'));await visible(page.getByText('10 selected',{exact:true}));await button('Allow bulk').click();await button('Assign selected').click();await page.getByText('0 selected',{exact:true}).waitFor();assert.match(await page.getByTestId('bulk-result').innerText(),/Account/);});
 await check('loading is visible',async()=>{await button('Load scenario').click();await visible(page.getByText('Loading…',{exact:true}));});
 await check('error retries real state',async()=>{await button('Error scenario').click();await visible(page.getByText('Could not load records',{exact:true}));await button('Retry').click();await visible(page.getByRole('table'));});
 await check('empty is distinct',async()=>{await button('Empty scenario').click();await visible(page.getByText('No records yet',{exact:true}));await button('Reset records').click();});
 await check('tabs keyboard skips disabled; notes persist',async()=>{await page.getByRole('tab',{name:'Accounts',exact:true}).focus();await page.keyboard.press('ArrowRight');await page.getByLabel('Workspace notes').fill('Keep this draft');await page.keyboard.press('Tab');await page.getByRole('tab',{name:'Notes',exact:true}).focus();await page.keyboard.press('End');await page.locator('[role=tab][aria-selected=true]').filter({hasText:'History'}).waitFor();await page.keyboard.press('ArrowLeft');assert.equal(await page.getByLabel('Workspace notes').inputValue(),'Keep this draft');await page.getByRole('tab',{name:'Accounts',exact:true}).click();});
 await check('sheet opens actual row and closes by keyboard',async()=>{await page.getByRole('button',{name:'Open Account 01',exact:true}).click();await visible(page.getByRole('dialog',{name:'Account 01',exact:true}));await page.keyboard.press('Escape');await hidden(page.getByRole('dialog'));await page.locator('button[aria-label="Open Account 01"]:focus').waitFor();});
 await openEditor();
 await check('editor validates required fields',async()=>{await page.getByLabel('Account name (required)',{exact:true}).fill('');await button('Save changes').click();await visible(page.getByRole('alert'));assert.match(await page.getByRole('alert').innerText(),/Account name is required/);});
 await check('failed save retains edited fields',async()=>{await page.getByLabel('Account name (required)',{exact:true}).fill('Updated account');await button('Save changes').click();await page.getByText('Save failed. Your draft is still here.').waitFor();assert.equal(await page.getByLabel('Account name (required)',{exact:true}).inputValue(),'Updated account');});
 await check('Escape confirms; keep editing retains draft',async()=>{await page.keyboard.press('Escape');await visible(page.getByRole('alertdialog'));await button('Keep editing').click();assert.equal(await page.getByLabel('Account name (required)',{exact:true}).inputValue(),'Updated account');});
 await page.screenshot({path:join(out,'editor-wide.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:join(out,'editor-390.png'),fullPage:true});
 await check('editor footer remains reachable at narrow width',async()=>{const box=await button('Save changes').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390&&box.y+box.height<=844);});
 await page.setViewportSize({width:1440,height:1000});
 await check('discard closes without write',async()=>{await button('Cancel').click();await button('Discard changes').click();await hidden(page.getByRole('dialog'));assert.equal(await page.getByTestId('writes').innerText(),'Saved records: 0');});
 await button('Allow save').click();await openEditor();await page.getByLabel('Account name (required)',{exact:true}).fill('Saved account');
 await check('save writes once and updates row',async()=>{await button('Save changes').dblclick();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await page.getByTestId('writes').innerText(),'Saved records: 1');assert.match(await page.locator('tbody').innerText(),/Saved account/);});
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});await check(`usable search and no page overflow at ${width}`,async()=>{assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.ok((await page.getByLabel('Search accounts').boundingBox()).width>=200);});await page.screenshot({path:join(out,`grid-${width}.png`),fullPage:true});}
 await check('enlarged text keeps search usable',async()=>{await page.setViewportSize({width:390,height:1000});const style=await page.addStyleTag({content:'html{font-size:32px!important}'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.ok((await page.getByLabel('Search accounts').boundingBox()).width>=200);await style.evaluate(e=>e.remove());});
 await check('ten records open without a disclosure click',async()=>{await page.reload();await button('Ten records').click();await visible(page.getByRole('table'));assert.equal(await page.locator('tbody tr').count(),10);});
 await check('no browser exceptions',async()=>assert.deepEqual(errors,[]));
 writeFileSync(join(out,'results.json'),JSON.stringify({checked,blocks:6,registryEntries:catalog.length,errors,source:'generated registry content',screenshots:out},null,2));console.log(`blocks browser PASS: ${checked} checks, 6 original workflow blocks (${catalog.length} registry entries compiled)`);
}finally{await browser.close();await new Promise(r=>server.close(r));rmSync(temp,{recursive:true,force:true});}
