#!/usr/bin/env node
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {load} from '../verify/deps.mjs';
import {hash,inspectReferencePage} from './reference-health.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),ids=process.argv.slice(2);
const rows=JSON.parse(readFileSync(join(root,'corpus/templates.json'),'utf8')).templates;
const {chromium}=load('playwright'),browser=await chromium.launch();
try{for(const id of ids){const row=rows.find(r=>r.id===id);if(!row||row.kind!=='blueprint')throw new Error('Expected an authored blueprint');
 const path=join(root,'corpus/blueprints',id,'reference.html'),url=pathToFileURL(path).href;
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),response=await page.goto(url);
 await page.evaluate(()=>document.fonts.ready);
 /*
  * The reference declares what proves it rendered; this file no longer guesses.
  *
  * It used to expect `article details` for everything except a broadcast, which
  * is only true of a blog post. shadcn-queue and shadcn-weekly-board are a work
  * queue and a cadence board — neither is an article containing a details — so
  * both were unrecapturable, their captures stayed legacy/unverified, and every
  * prove.mjs run citing them reported referenceValidity and visualComparison as
  * not_tested. A completion receipt was unreachable through no fault of the
  * surface being proved.
  */
 const expect=row.reference?.captureExpect;
 if(!expect)throw new Error(`${id}: declare reference.captureExpect in corpus/templates.json — the selector that proves this page rendered. Refusing to guess.`);
 const capture=await inspectReferencePage(page,response,{url,expect});
 const dir=join(root,'corpus/packs',id);mkdirSync(dir,{recursive:true});const shot=await page.screenshot({path:join(dir,'shot.png'),fullPage:true});
 capture.sourceUrl=`corpus/blueprints/${id}/reference.html`;capture.finalUrl=capture.sourceUrl;
 capture.sourceSha256=hash(readFileSync(path));capture.shotSha256=hash(shot);
 writeFileSync(join(dir,'meta.json'),JSON.stringify({id,source:capture.sourceUrl,harvested:capture.capturedAt.slice(0,10),bytes:shot.length,provenance:'Authored blueprint, not an upstream component demo',capture},null,2)+'\n');await page.close();console.log(`captured ${id}`);
}}finally{await browser.close();}
