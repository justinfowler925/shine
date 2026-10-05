#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";
import {
  evaluateFormHeuristics,
  formHeuristicGateApplies,
  formatFormHeuristicFailures,
} from "./form-heuristics.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/form-heuristics");
const { chromium } = load("playwright");

assert.equal(formHeuristicGateApplies({ citeScreen: "form" }), true);
assert.equal(formHeuristicGateApplies({ isWireframe: true, citeScreen: "form" }), false);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(join(FIX, "invalid-no-message.html")).href);
  const bad = await page.evaluate(evaluateFormHeuristics);
  assert.ok(bad.findings.some((f) => f.kind === "aria-invalid-without-message"), JSON.stringify(bad));
  assert.ok(formatFormHeuristicFailures(bad, { gate: true }).some((f) => /aria-invalid/.test(f)));

  await page.goto(pathToFileURL(join(FIX, "invalid-with-message.html")).href);
  const good = await page.evaluate(evaluateFormHeuristics);
  assert.equal(formatFormHeuristicFailures(good, { gate: true }).length, 0, JSON.stringify(good));
} finally {
  await browser.close();
}

function run(file) {
  return spawnSync(
    process.execPath,
    [join(SHINE, "verify/measure.mjs"), file, "--cite", "shadcn-form-invite", "--lane", "saas"],
    { encoding: "utf8", cwd: SHINE, env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") }, timeout: 120_000 },
  );
}
const badRun = run(join(FIX, "invalid-no-message.html"));
assert.notEqual(badRun.status, 0);
assert.match(`${badRun.stderr}\n${badRun.stdout}`, /form:.*aria-invalid/);

const goodRun = run(join(FIX, "invalid-with-message.html"));
assert.doesNotMatch(`${goodRun.stderr}\n${goodRun.stdout}`, /form:.*aria-invalid/);

console.log("form-heuristics PASS: invalid without message fails · with message passes");
