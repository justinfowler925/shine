#!/usr/bin/env node
// M1c — DOM-detectable incomplete-primitives fail closed in measure.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";
import {
  evaluateIncompletePrimitives,
  formatIncompletePrimitiveFailures,
} from "./incomplete-primitives.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/incomplete-primitives");
const { chromium } = load("playwright");

function measure(file, jsonOut) {
  return spawnSync(
    process.execPath,
    [join(SHINE, "verify/measure.mjs"), file, "--json", jsonOut],
    { encoding: "utf8", cwd: SHINE, timeout: 120_000 },
  );
}

const bad = join(FIX, "bad.html");
const good = join(FIX, "good.html");

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(pathToFileURL(bad).href, { waitUntil: "load" });
  const badEval = await page.evaluate(evaluateIncompletePrimitives);
  const badKinds = new Set(badEval.findings.map((f) => f.kind));
  assert.ok(badKinds.has("icon-only-unnamed"), `bad missing icon-only: ${JSON.stringify(badEval)}`);
  assert.ok(badKinds.has("unlabeled-control"), `bad missing unlabeled: ${JSON.stringify(badEval)}`);
  assert.ok(badKinds.has("destructive-unconfirmed"), `bad missing destructive: ${JSON.stringify(badEval)}`);
  const badMsgs = formatIncompletePrimitiveFailures(badEval);
  assert.equal(badMsgs.length, badEval.findings.length);
  assert.ok(badMsgs.every((m) => m.startsWith("incomplete-primitive:")));

  await page.goto(pathToFileURL(good).href, { waitUntil: "load" });
  const goodEval = await page.evaluate(evaluateIncompletePrimitives);
  assert.equal(
    goodEval.findings.length,
    0,
    `good fixture must be clean: ${JSON.stringify(goodEval.findings)}`,
  );

  // Toast-only / hover-only stay agent — detector must not invent failures for them.
  const dir = mkdtempSync(join(tmpdir(), "shine-ip-agent-"));
  try {
    const agentOnly = join(dir, "agent-only.html");
    writeFileSync(
      agentOnly,
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Agent-only</title>
<style>:root{color-scheme:light}body{font:15px system-ui;padding:32px;background:#fff;color:#111}
button{font:inherit;padding:10px 14px}[data-toast]{position:fixed;bottom:16px;right:16px;padding:12px;border:1px solid #ddd}
tr:hover .row-actions{opacity:1}.row-actions{opacity:0}td{padding:8px}</style></head>
<body><main><h1>Queue</h1>
<table><tr><td>Ada</td><td class="row-actions"><button type="button">Edit</button></td></tr></table>
<button type="button" class="primary" style="background:#111;color:#fff;border:0">Save</button>
<div data-toast role="status">Saved — toast is the only channel here</div>
</main></body></html>`,
    );
    await page.goto(pathToFileURL(agentOnly).href, { waitUntil: "load" });
    const agentEval = await page.evaluate(evaluateIncompletePrimitives);
    assert.equal(
      agentEval.findings.length,
      0,
      `toast/hover-only must stay agent (no machine findings): ${JSON.stringify(agentEval.findings)}`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
} finally {
  await browser.close();
}

const outDir = mkdtempSync(join(tmpdir(), "shine-ip-measure-"));
try {
  const badJson = join(outDir, "bad.json");
  const badRun = measure(bad, badJson);
  assert.notEqual(badRun.status, 0, "bad fixture must fail measure");
  const badReport = JSON.parse(readFileSync(badJson, "utf8"));
  const ipFails = (badReport.failures || []).filter((f) => f.startsWith("incomplete-primitive:"));
  assert.ok(ipFails.some((f) => /icon-only/.test(f)), ipFails.join("\n"));
  assert.ok(ipFails.some((f) => /label association|placeholder-only/.test(f)), ipFails.join("\n"));
  assert.ok(ipFails.some((f) => /destructive/.test(f)), ipFails.join("\n"));

  const goodJson = join(outDir, "good.json");
  const goodRun = measure(good, goodJson);
  // measure writes --json even on failure; require the file either way
  assert.ok(goodRun.status === 0 || goodRun.status === 1, `unexpected measure status ${goodRun.status}`);
  const goodReport = JSON.parse(readFileSync(goodJson, "utf8"));
  const goodIp = (goodReport.failures || []).filter((f) => f.startsWith("incomplete-primitive:"));
  assert.equal(
    goodIp.length,
    0,
    `good must not emit incomplete-primitive fails:\n${goodIp.join("\n")}\nall: ${(goodReport.failures || []).join("\n")}`,
  );
  assert.equal(goodReport.incompletePrimitives?.findings?.length ?? -1, 0);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

console.log(
  "incomplete-primitives PASS: bad bites icon-only + unlabeled + destructive; good clean; toast/hover stay agent",
);
