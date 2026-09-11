#!/usr/bin/env node
// Run against a separate, genuinely installed Tailwind v4 + CLI project.
// Install downloads on Studio. This proof never changes a consumer stylesheet.
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {resolveIntegration} from '../integrations/resolve.mjs';
const index=process.argv.indexOf('--project');
if(index<0)throw new Error('Pass --project <installed Tailwind v4 and @tailwindcss/cli fixture>');
const project=resolve(process.argv[index+1]),integration=resolveIntegration(project);
assert.equal(integration.layers.styling.name,'tailwind');
assert.match(integration.layers.styling.installedVersion,/^4\./);
const dir=mkdtempSync(join(project,'.shine-tailwind-proof-'));
let browser;
try {
 writeFileSync(join(dir,'input.css'),'@import "tailwindcss" source(none);\n@source "./index.html";\n@theme inline { --color-background: var(--surface); --color-foreground: var(--ink); }\n:root { --surface: rgb(250 250 250); --ink: rgb(20 20 20); }\n[data-mode="dark"] { --surface: rgb(20 20 20); --ink: rgb(250 250 250); }\n');
 writeFileSync(join(dir,'index.html'),'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="./output.css"></head><body class="bg-background text-foreground"><main class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2"><section>Customer records</section><section>Account details</section></main><button class="p-4 focus-visible:outline-2">Open details</button></body></html>');
 const cliPackage=join(project,'node_modules/@tailwindcss/cli');
 const cli=JSON.parse(readFileSync(join(cliPackage,'package.json'),'utf8'));
 const run=spawnSync(process.execPath,[join(cliPackage,typeof cli.bin==='string'?cli.bin:cli.bin.tailwindcss),'-i',join(dir,'input.css'),'-o',join(dir,'output.css')],{cwd:project,encoding:'utf8',timeout:30000});
 assert.equal(run.status,0,run.stderr);
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:800}});
 await page.goto(pathToFileURL(join(dir,'index.html')).href);
 const columns=()=>page.locator('main').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
 assert.equal(await columns(),1);
 assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(250, 250, 250)');
 await page.setViewportSize({width:1280,height:800});assert.equal(await columns(),2);
 await page.evaluate(()=>document.documentElement.dataset.mode='dark');
 assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(20, 20, 20)');
 await page.keyboard.press('Tab');assert.equal(await page.locator('button').evaluate(el=>el===document.activeElement),true);
 assert.equal(await page.locator('button').evaluate(el=>getComputedStyle(el).outlineWidth),'2px');
 console.log(JSON.stringify({status:'pass',tailwind:integration.layers.styling.installedVersion,checks:6,evidence:['390px single column','1280px two columns','consumer light token','consumer dark token','keyboard focus','compiled focus outline'],scope:'real Tailwind compilation and native controls; not shadcn dialog behavior'}));
} finally {if(browser)await browser.close();rmSync(dir,{recursive:true,force:true});}
