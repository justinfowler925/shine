#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "./deps.mjs";
import { pixelCalibration } from "./compare/visual.mjs";
import { compareArtifact } from "./compare.mjs";

assert.equal(typeof compareArtifact, "function", "compare orchestrator must be import-safe");
const root=dirname(fileURLToPath(import.meta.url)), repo=join(root,".."), compare=join(root,"compare.mjs"), fixtures=join(root,"fixtures");
const dir=mkdtempSync(join(tmpdir(),"shine-compare-proof-")), receipt=join(dir,"receipts.json"), env={...process.env,SHINE_RECEIPT:receipt};
const runTarget=(target,...args)=>spawnSync(process.execPath,[compare,target,...args,"--out",join(dir,`${target.split("/").pop()}.png`)],{cwd:repo,encoding:"utf8",env});
const run=(file,...args)=>runTarget(join(fixtures,file),...args);
const output=(r)=>`${r.stdout}${r.stderr}`;
try {
  const sharp=load("sharp"), shot=readFileSync(join(repo,"corpus/packs/untitled-table/shot.png"));
  assert.deepEqual(await pixelCalibration(sharp,shot,shot),{changedChannels:0,maxChannelDelta:0,baseline:true});
  for(const [file,needle] of [["attribute-stamp.html","region graph"],["zinc-on-untitled.html","kit-faithful family"],["table-presence-clone.html","table-presence clone"]]){
    const r=run(file,"--cite","untitled-table"); assert.equal(r.status,1,`${file} must fail`); assert.match(output(r),new RegExp(needle)); assert.equal(existsSync(receipt),false,"failed proof minted receipt");
  }
  for(const [file,cite,needle] of [["generic-shadcn-dashboard.html","shadcn-dashboard-01","navigation required"],["generic-untitled-chart.html","untitled-line-charts","chart required"]]){
    const r=run(file,"--cite",cite);assert.equal(r.status,1,`${file} must fail`);assert.match(output(r),new RegExp(needle));assert.equal(existsSync(receipt),false,"reference mismatch minted receipt");
  }
  const uncited=run("missing-cite.html","--cite","untitled-table"); assert.equal(uncited.status,1); assert.match(output(uncited),/artifact data-cite missing/); assert.equal(existsSync(receipt),false);
  const stock=run("stock-clone.html","--cite","magicui-hero","--lane","marketing","--brief","claims"); assert.equal(stock.status,1); assert.match(output(stock),/brief-specific visible signature/); assert.equal(existsSync(receipt),false);
  const first=run("cross-brief-a.html","--cite","magicui-hero","--lane","marketing","--brief","claims"); assert.equal(first.status,0,output(first));
  const count=JSON.parse(readFileSync(receipt,"utf8")).receipts.length;
  const clone=run("cross-brief-b.html","--cite","magicui-hero","--lane","marketing","--brief","hiring"); assert.equal(clone.status,1); assert.match(output(clone),/cross-brief structural clone/); assert.equal(JSON.parse(readFileSync(receipt,"utf8")).receipts.length,count,"clone failure minted receipt");
  const unrelated=run("same-palette-unrelated.html","--cite","magicui-hero","--lane","marketing","--brief","inspection"); assert.equal(unrelated.status,0,output(unrelated));
  const branded=run("cross-brief-b.html","--cite","magicui-hero","--lane","marketing","--brief","hiring","--brand-locked"); assert.equal(branded.status,0,output(branded));
  // A blueprint with authored source and a captured reference is provable. This
  // specifically prevents weekly-board from regressing to compare's exit-2
  // "no harvested shot" path while its own checklist still requires compare.
  const weekly=runTarget(join(repo,"corpus/blueprints/shadcn-weekly-board/reference.html"),"--cite","shadcn-weekly-board");
  assert.equal(weekly.status,0,output(weekly));
  assert.doesNotMatch(output(weekly),/no harvested shot|Refusing to compare against nothing/);
  const dashboard=runTarget(join(fixtures,"e2e/brutus-session/after.html"),"--cite","shadcn-dashboard-01");
  assert.equal(dashboard.status,0,output(dashboard));
  console.log("compare proof PASS: import-safe · baseline 0/0 · 11 seeded branches · receipt fail-closed · authored blueprint + dashboard proofs");
} finally { rmSync(dir,{recursive:true,force:true}); }
