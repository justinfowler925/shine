#!/usr/bin/env node
import assert from "node:assert/strict";
import {mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {proveUsability,readUsabilityContract} from "./usability.mjs";

const dir=mkdtempSync(join(tmpdir(),"shine-usability-")),page=join(dir,"page.html"),contract=join(dir,"shine-usability.json");
const base={version:1,cite:"untitled-table",objects:[
 {id:"queue",selector:"#queue",referenceRole:"table",purpose:"See work that needs a decision"},
 {id:"capture",selector:"#capture",referenceRole:"command",purpose:"Add work without leaving the queue"}
],flows:[{id:"capture-work",userJob:"Capture a request and see it enter the queue",steps:[
 {action:"fill",selector:"#capture",value:"Call Acme"},{action:"press",selector:"#capture",value:"Enter"},{action:"text",selector:"#queue",value:"Call Acme"}
]}]};
try {
 writeFileSync(page,'<input id="capture"><div id="queue">No work</div><script>capture.onkeydown=e=>{if(e.key==="Enter")queue.textContent=capture.value}</script>');
 writeFileSync(contract,JSON.stringify(base));
 const result=await proveUsability({target:page,contractPath:contract,citeId:"untitled-table"}); assert.equal(result.status,0); assert.equal(result.flows[0].id,"capture-work");
 const staticWall=structuredClone(base); staticWall.flows[0].steps[2].value="Never appears"; writeFileSync(contract,JSON.stringify(staticWall));
 await assert.rejects(()=>proveUsability({target:page,contractPath:contract,citeId:"untitled-table"}),/capture-work step 3/);
 const wrongRole=structuredClone(base);wrongRole.objects[0].referenceRole="summary";assert.throws(()=>readUsabilityContract(contract,{citeId:"shadcn-dashboard-01"}),/does not match/);writeFileSync(contract,JSON.stringify(wrongRole));assert.throws(()=>readUsabilityContract(contract),/requires a table object/);
 console.log("usability PASS: reference objects + executable user task reject static walls");
} finally {rmSync(dir,{recursive:true,force:true});}
