#!/usr/bin/env node
// M1a: Operate SaaS page cites cannot pass prove interactions without a real
// usability contract. Missing / shallow → interactions: failed (policy).
import assert from "node:assert/strict";
import {mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {prove} from "./prove.mjs";
import {
  OPERATE_USABILITY_SCREENS,
  interactionsCheckForError,
  operateUsabilityScreen,
  readUsabilityContract,
  requiresOperateUsability,
} from "./usability.mjs";

const root=dirname(fileURLToPath(import.meta.url));
const repo=join(root,"..");
const dir=mkdtempSync(join(tmpdir(),"shine-prove-interactions-"));

const queuePage=`<!doctype html><html lang="en" data-cite="untitled-table"><head><meta charset="utf-8"><title>queue</title>
<style>body{margin:0;font:16px/1.4 system-ui;background:#fff;color:#111;padding:24px}input,button{padding:10px 14px;font:inherit}</style>
</head><body>
<main>
 <h1>Work queue</h1>
 <input id="capture" aria-label="Capture work" placeholder="Add work">
 <div id="queue" role="table" aria-label="Queue">No work</div>
</main>
<script>capture.onkeydown=e=>{if(e.key==="Enter")queue.textContent=capture.value}</script>
</body></html>`;

const settingsPage=`<!doctype html><html lang="en" data-cite="shadcn-settings"><head><meta charset="utf-8"><title>settings</title>
<style>body{margin:0;font:16px/1.4 system-ui;background:#fff;color:#111;padding:24px}label{display:block;margin:12px 0}input,button{padding:10px 14px;font:inherit}</style>
</head><body>
<nav aria-label="Settings sections"><a href="#profile">Profile</a></nav>
<main id="profile">
 <h1>Profile settings</h1>
 <label>Display name <input id="name" value="Ada"></label>
 <button id="save" type="button">Save</button>
 <p id="status" role="status">Unsaved</p>
</main>
<script>save.onclick=()=>{status.textContent="Saved "+name.value}</script>
</body></html>`;

const blogPage=`<!doctype html><html lang="en" data-cite="shadcn-blog"><head><meta charset="utf-8"><title>blog</title>
<style>body{margin:0;font:16px/1.4 Georgia,serif;background:#fff;color:#111;padding:32px}article{max-width:40rem}</style>
</head><body><article><h1>Notes</h1><p>A written edition, not an Operate SaaS shell.</p></article></body></html>`;

try{
 assert.equal(operateUsabilityScreen("shadcn-settings",repo),"settings");
 assert.equal(operateUsabilityScreen("untitled-table",repo),"queue");
 assert.equal(operateUsabilityScreen("shadcn-blog",repo),"blog");
 assert.equal(requiresOperateUsability("shadcn-settings",repo),true);
 assert.equal(requiresOperateUsability("shadcn-dashboard-01",repo),true);
 assert.equal(requiresOperateUsability("untitled-table",repo),true);
 assert.equal(requiresOperateUsability("shadcn-blog",repo),false);
 assert.equal(requiresOperateUsability("shadcn-broadcast",repo),false);
 assert.ok(OPERATE_USABILITY_SCREENS.has("form"));
 assert.ok(OPERATE_USABILITY_SCREENS.has("record"));

 const missing=interactionsCheckForError("shadcn-settings",undefined,new Error("usability: missing --contract <shine-usability.json>"),{root:repo});
 assert.equal(missing.status,"failed");
 assert.equal(missing.policy,"failed");
 assert.equal(missing.screen,"settings");
 assert.match(missing.reason,/requires shine-usability\.json/);

 const soft=interactionsCheckForError("shadcn-blog",undefined,new Error("usability: missing --contract <shine-usability.json>"),{root:repo});
 assert.equal(soft.status,"not_tested");
 assert.equal(soft.required,false);

 const settingsTarget=join(dir,"settings.html");
 writeFileSync(settingsTarget,settingsPage);
 const missingProve=await prove({target:settingsTarget,citeId:"shadcn-settings"});
 assert.equal(missingProve.checks.interactions.status,"failed","Operate settings without usability must hard-fail interactions");
 assert.match(missingProve.checks.interactions.reason||"",/requires shine-usability|missing/i);
 assert.notEqual(missingProve.status,"passed");
 assert.equal(missingProve.status,"failed");

 const shallowPath=join(dir,"shallow-usability.json");
 writeFileSync(shallowPath,JSON.stringify({
  version:1,cite:"shadcn-settings",
  objects:[
   {id:"nav",selector:"nav",referenceRole:"navigation",purpose:"Jump between settings sections"},
   {id:"name",selector:"#name",referenceRole:"form",purpose:"Edit the display name"},
  ],
  flows:[{id:"glance",userJob:"Look at the form",steps:[
   {action:"visible",selector:"nav"},
   {action:"visible",selector:"#name"},
  ]}],
 }));
 assert.throws(()=>readUsabilityContract(shallowPath,{citeId:"shadcn-settings"}),/at least three steps|no user action|observable outcome/);
 const shallowProve=await prove({target:settingsTarget,citeId:"shadcn-settings",usabilityPath:shallowPath});
 assert.equal(shallowProve.checks.interactions.status,"failed","shallow Operate usability must fail interactions");
 assert.match(shallowProve.checks.interactions.reason||"",/three steps|user action|observable outcome/i);
 assert.equal(shallowProve.status,"failed");

 const noOutcomePath=join(dir,"no-outcome.json");
 writeFileSync(noOutcomePath,JSON.stringify({
  version:1,cite:"shadcn-settings",
  objects:[
   {id:"nav",selector:"nav",referenceRole:"navigation",purpose:"Jump between settings sections"},
   {id:"name",selector:"#name",referenceRole:"form",purpose:"Edit the display name"},
   {id:"save",selector:"#save",referenceRole:"command",purpose:"Commit profile changes"},
  ],
  flows:[{id:"click-around",userJob:"Click without proving state",steps:[
   {action:"click",selector:"#save"},
   {action:"click",selector:"nav a"},
   {action:"click",selector:"#save"},
  ]}],
 }));
 assert.throws(()=>readUsabilityContract(noOutcomePath,{citeId:"shadcn-settings"}),/observable outcome/);
 const noOutcomeProve=await prove({target:settingsTarget,citeId:"shadcn-settings",usabilityPath:noOutcomePath});
 assert.equal(noOutcomeProve.checks.interactions.status,"failed");
 assert.match(noOutcomeProve.checks.interactions.reason||"",/observable outcome/i);

 const blogTarget=join(dir,"blog.html");
 writeFileSync(blogTarget,blogPage);
 const blogProve=await prove({target:blogTarget,citeId:"shadcn-blog"});
 assert.equal(blogProve.checks.interactions.status,"not_tested","non-Operate screens stay soft when usability is skipped");
 assert.notEqual(blogProve.status,"passed");
 // Soft path: interactions alone must not inject `failed` for non-Operate cites.
 assert.notEqual(blogProve.checks.interactions.status,"failed");

 const queueTarget=join(dir,"queue.html");
 writeFileSync(queueTarget,queuePage);
 const goodContract=join(dir,"queue-usability.json");
 writeFileSync(goodContract,JSON.stringify({
  version:1,cite:"untitled-table",
  objects:[
   {id:"queue",selector:"#queue",referenceRole:"table",purpose:"See work that needs a decision"},
   {id:"capture",selector:"#capture",referenceRole:"command",purpose:"Add work without leaving the queue"},
  ],
  flows:[{id:"capture-work",userJob:"Capture a request and see it enter the queue",steps:[
   {action:"fill",selector:"#capture",value:"Call Acme"},
   {action:"press",selector:"#capture",value:"Enter"},
   {action:"text",selector:"#queue",value:"Call Acme"},
  ]}],
 }));
 const goodProve=await prove({target:queueTarget,citeId:"untitled-table",usabilityPath:goodContract});
 assert.equal(goodProve.checks.interactions.status,"passed","non-trivial Operate usability still passes interactions");
 assert.ok(goodProve.checks.interactions.flows?.some(f=>f.id==="capture-work"));

 console.log("prove interactions PASS: Operate screens fail closed on missing/shallow usability; non-Operate stays not_tested; real flows still pass");
}finally{rmSync(dir,{recursive:true,force:true});}
