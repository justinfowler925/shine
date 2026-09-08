#!/usr/bin/env node
// Measure the pages shine's CONSUMERS actually ship.
//
// Why this exists: on 2026-08-16 the doctor reported 43 of 43 checks passing while the
// site it governs had 18 serious axe contrast violations and failed WCAG AA on fourteen
// pages. Every shine check was about shine — wiring, token emission, whether the gates
// bite on a fixture. Nothing looked at a page a reader loads. A design system that
// verifies itself and never verifies its output is measuring the wrong layer.
//
// Registry: consumers.pages.local (gitignored, private paths), one per line
//
//   name|path-or-url
//   my-site|~/Projects/my-site/index.html
//   my-site-about|~/Projects/my-site/about.html
//
// Local files are measured directly by measure.mjs. Root-absolute assets (/assets/x.css)
// will not resolve from file://, so a page that needs them should be given as an http URL
// with its own server already running — measuring a page whose stylesheet failed to load
// reports the absence of CSS, not the quality of the design.
//
//   node verify/measure-consumers.mjs            measure everything registered
//   node verify/measure-consumers.mjs --quiet    one line per consumer

import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { homedir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const registryArg = process.argv.indexOf("--registry");
const REGISTRY = registryArg >= 0 ? resolve(process.argv[registryArg + 1] || "") : join(ROOT, "consumers.pages.local");
const QUIET = process.argv.includes("--quiet");

if (!existsSync(REGISTRY)) {
  // Exit 2, never 0. "Nothing registered" and "everything passes" must not look the same
  // from the outside — that equivalence is the whole bug this file exists to close.
  console.log(`measure-consumers: missing registry ${REGISTRY} — nothing measured (this is not a pass)`);
  process.exit(2);
}

const targets = readFileSync(REGISTRY, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => {
    const [name, ...rest] = l.split("|");
    let t = rest.join("|").trim();
    if (t.startsWith("~")) t = join(homedir(), t.slice(1));
    else if (!/^https?:\/\//.test(t) && !t.startsWith("/")) t = resolve(ROOT, t);
    return { name: name.trim(), target: t };
  });

if (!targets.length) {
  console.log("measure-consumers: registry is empty — nothing measured (this is not a pass)");
  process.exit(2);
}

let failed = 0;
const rows = [];

for (const { name, target } of targets) {
  const isUrl = /^https?:\/\//.test(target);
  if (!isUrl && !existsSync(target)) {
    rows.push({ name, verdict: "MISSING", detail: target });
    failed++;
    continue;
  }
  // Serve local module/data fixtures when explicitly requested. The verifier still
  // receives the real contract path; the server is scoped to this artifact directory.
  let server=null, measuredTarget=target;
  if(!isUrl && process.argv.includes("--serve-local")) {
    const base=dirname(target);
    server=createServer((request,response)=>{
      try {
        const file=resolve(base,"."+decodeURIComponent(new URL(request.url,"http://localhost").pathname));
        if(!file.startsWith(base+"/")){response.writeHead(403);response.end();return;}
        const body=readFileSync(file);
        response.setHeader("Content-Type",file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":file.endsWith(".json")?"application/json":"text/html");response.end(body);
      }catch{response.writeHead(404);response.end();}
    });
    await new Promise(done=>server.listen(0,"127.0.0.1",done));
    measuredTarget=`http://127.0.0.1:${server.address().port}/${target.slice(base.length+1)}`;
  }
  const contract=!isUrl?join(dirname(target),"shine-tables.json"):null;
  let r;
  try {
    r=await new Promise(done=>{
      const child=spawn(process.execPath,[join(ROOT,"verify/measure.mjs"),measuredTarget,...(contract&&existsSync(contract)?["--table-contract",contract]:[])],{timeout:120_000});
      let stdout="",stderr="",error;
      child.stdout.on("data",data=>stdout+=data);child.stderr.on("data",data=>stderr+=data);child.on("error",value=>{error=value;});
      child.on("close",status=>done({status,stdout,stderr,error}));
    });
  }finally{if(server)await new Promise(done=>server.close(done));}
  const out = `${r.stdout}${r.stderr}`;

  // A probe that could not run is not a page that failed. The first version of this file
  // reported "0 text elements measured" for three healthy pages because the worktree had
  // no node_modules and measure.mjs died before opening a browser — a tooling fault
  // rendered as a design defect. Separate the two before reading any verdict.
  const brokeBeforeMeasuring =
    r.error ||
    /cannot resolve "playwright"|Cannot find module|ERR_MODULE_NOT_FOUND|npm install/.test(out) ||
    !/contrast:|wireframe/i.test(out);
  if (brokeBeforeMeasuring) {
    const why = r.error?.message ?? (out.match(/Error: ([^\n]+)/) ?? [])[1] ?? "measure produced no verdict";
    rows.push({ name, verdict: "TOOLING", detail: `could not measure — ${why.slice(0, 90)}` });
    failed++;
    continue;
  }

  // measure.mjs already refuses to pass when it measured nothing, so a clean run here
  // means targets were found AND checked. Read its own verdict rather than re-deriving.
  const contrast = Number((out.match(/color-contrast\(serious,(\d+)\)/) ?? [])[1] ?? 0);
  const measured = Number((out.match(/contrast: (\d+) text elements measured/) ?? [])[1] ?? 0);
  const pass = r.status === 0;

  if (measured === 0 && !/wireframe/i.test(out)) {
    rows.push({ name, verdict: "VACUOUS", detail: "0 text elements measured — probe found targets but checked none" });
    failed++;
    continue;
  }
  rows.push({
    name,
    verdict: pass ? "PASS" : "FAIL",
    detail: `${measured} elements, ${contrast} serious contrast violation${contrast === 1 ? "" : "s"}`,
  });
  if (!pass) failed++;
  if (!QUIET && !pass) {
    for (const line of out.split("\n").filter((l) => l.trim().startsWith("✗"))) {
      rows.push({ name: "", verdict: "", detail: line.trim() });
    }
  }
}

for (const r of rows) {
  if (!r.name) console.log(`      ${r.detail}`);
  else console.log(`  ${r.verdict.padEnd(8)} ${r.name.padEnd(28)} ${r.detail}`);
}
console.log("");
console.log(
  failed
    ? `measure-consumers: ${failed} of ${targets.length} consumer page(s) failed`
    : `measure-consumers: ${targets.length} consumer page(s) pass`,
);
process.exit(failed ? 1 : 0);
