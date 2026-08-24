import assert from "node:assert/strict";
import {mkdtempSync,readFileSync,readlinkSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {spawnSync} from "node:child_process";
const root=mkdtempSync(join(tmpdir(),"shine-release-"));
try{const run=spawnSync(process.execPath,["scripts/release.mjs","--root",root,"--no-install"],{encoding:"utf8"});assert.equal(run.status,0,run.stderr);const result=JSON.parse(run.stdout),current=resolve(root,readlinkSync(join(root,"current"))),manifest=JSON.parse(readFileSync(join(current,"release.json"),"utf8"));assert.equal(current,result.release);assert.equal(manifest.sha,result.sha);assert.equal(manifest.dependenciesInstalled,false);assert.match(manifest.node,/^v\d+/);assert.match(manifest.corpusSha256,/^[a-f0-9]{64}$/);assert.match(manifest.skillSha256,/^[a-f0-9]{64}$/);console.log("release PASS: immutable manifest and atomic current pointer");}finally{rmSync(root,{recursive:true,force:true})}
