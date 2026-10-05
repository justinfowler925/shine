#!/usr/bin/env node
// M0: prove must forward --lane to compareArtifact so saas originality bites
// on the completion path the same way compare.mjs --lane saas already does.
import assert from "node:assert/strict";
import {mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {spawnSync} from "node:child_process";
import {createDesignPacket} from "../core/design-packet.mjs";
import {prove} from "./prove.mjs";

const root=dirname(fileURLToPath(import.meta.url)),repo=join(root,"..");
const dir=mkdtempSync(join(tmpdir(),"shine-prove-lane-"));
const target=join(dir,"saas-stock.html");
// Valid cite binding, composed regions, primary control — no data-shine-signature.
writeFileSync(target,`<!doctype html><html data-cite="magicui-hero"><head><title>stock clone</title>
<style>body{margin:0;font:16px Arial;background:#fff;color:#111}header,main,section{padding:32px}main{min-height:420px;background:#f4f4f4}button{padding:12px 20px}</style>
</head><body><header><h1>Modern platform</h1></header>
<main><h2>Everything in one place</h2><p>A stock surface reusable for any brief.</p><button data-primary>Get started</button></main>
<section><h2>Features</h2></section></body></html>`);

try{
 const saas=await prove({target,citeId:"magicui-hero",lane:"saas",brief:"claims"});
 assert.equal(saas.checks.referenceValidity.status,"passed");
 assert.equal(saas.checks.visualComparison.status,"failed","saas lane without signature must fail visualComparison");
 assert.equal(saas.checks.visualComparison.lane,"saas");
 assert.match((saas.checks.visualComparison.failures||[]).join("\n"),/brief-specific visible signature/);

 const internal=await prove({target,citeId:"magicui-hero",lane:"internal",brief:"claims"});
 assert.equal(internal.checks.referenceValidity.status,"passed");
 assert.equal(internal.checks.visualComparison.lane,"internal");
 assert.doesNotMatch((internal.checks.visualComparison.failures||[]).join("\n"),/brief-specific visible signature|originality:/,"internal lane must not apply saas/marketing originality");

 const omitted=await prove({target,citeId:"magicui-hero",brief:"claims"});
 assert.equal(omitted.checks.visualComparison.lane,"internal","omitted lane defaults to internal so existing fixtures stay stable");

 const cli=spawnSync(process.execPath,[join(root,"prove.mjs"),target,"--cite","magicui-hero","--lane","saas","--brief","claims"],{cwd:repo,encoding:"utf8",timeout:120000});
 assert.equal(cli.status,1);
 const cliReport=JSON.parse(cli.stdout);
 assert.equal(cliReport.checks.visualComparison.status,"failed");
 assert.match((cliReport.checks.visualComparison.failures||[]).join("\n"),/brief-specific visible signature/);

 const saasPacket=createDesignPacket({job:"landing page hero for claims evidence",lane:"saas",project:repo,mode:"new",category:"marketing"});
 assert.match(saasPacket.completion.command,/--lane saas/);
 assert.match(saasPacket.proof.commands.join("\n"),/--lane saas/);
 const lexPacket=createDesignPacket({job:"lightning record page for claims",lane:"lex",project:repo,mode:"existing",category:"record"});
 assert.match(lexPacket.completion.command,/--lane lex/);

 console.log("prove lane PASS: saas originality fails visualComparison; internal default unchanged; packet completion carries --lane");
}finally{rmSync(dir,{recursive:true,force:true});}
