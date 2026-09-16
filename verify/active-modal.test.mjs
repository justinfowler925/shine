import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {load} from './deps.mjs';
import {capturePage} from './compare/capture.mjs';
const dir=mkdtempSync(join(tmpdir(),'shine-modal-'));
const file=join(dir,'page.html'),out=join(dir,'measure.json');
const html=color=>`<!doctype html><html lang="en" data-cite="shadcn-dashboard-01" data-shine-voice="kit-faithful" data-dna-family="shadcn-zinc"><head><title>Modal proof</title><style>:root{color-scheme:light}body{font:16px/1.5 system-ui;background:white;color:#111}dialog{width:600px;border:1px solid #ddd;padding:32px;color:${color};background:white}dialog::backdrop{background:#9999}button,input{font:inherit;padding:12px}p{margin:16px 0}</style></head><body><main><h1 style="color:#ccc">Inactive low contrast</h1></main><dialog aria-label="Review" data-cite="shadcn-wizard"><header data-region="drawer-navigation"><h2>Review the request</h2><button onclick="document.querySelector('dialog').close()">Close</button></header><section role="form" aria-label="Request"><p>Check this important message before continuing.</p><label>Name <input value="Example"></label><button data-primary>Continue</button></section></dialog><script>document.querySelector('dialog').showModal()</script></body></html>`;
const {chromium}=load('playwright'),browser=await chromium.launch();
try{
 writeFileSync(file,html('#111'));const p=await browser.newPage();await p.goto(pathToFileURL(file).href);
 const {facts}=await capturePage(p);assert.equal(facts.cite,'shadcn-wizard');assert.equal(facts.interactions.form,true);assert.equal(facts.controls.some(c=>c.name.includes('Inactive')),false);
 const run=()=>{spawnSync(process.execPath,[join(import.meta.dirname,'measure.mjs'),file,'--cite','shadcn-wizard','--json',out],{encoding:'utf8',timeout:120000});return JSON.parse(readFileSync(out))};
 let report=run();assert.equal(report.failures.some(x=>x.startsWith('contrast:')),false,JSON.stringify(report.failures));
 writeFileSync(file,html('#aaa'));report=run();assert.equal(report.failures.some(x=>x.startsWith('contrast:')),true,'Active low contrast must still fail');
 await p.goto(pathToFileURL(file).href);await p.locator('dialog button').first().click();assert.equal((await capturePage(p)).facts.cite,'shadcn-dashboard-01');
 console.log('PASS active modal citation, form semantics, inactive exclusion, active low-contrast rejection, closed-dialog fallback');
}finally{await browser.close();rmSync(dir,{recursive:true,force:true})}
