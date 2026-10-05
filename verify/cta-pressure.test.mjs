#!/usr/bin/env node
// P1 — Primary-job CTA pressure: dual filled primaries fail for Operate cites;
// single primary passes; competingCtaCheck.ok=false requires flow: binding.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";
import {
  checkCompetingCtaFlowBinding,
  ctaPressureGateApplies,
  evaluateMainCtaPressure,
  formatCtaPressureFailures,
  isOperateProveScreen,
  isCtaPressureScreen,
} from "./cta-pressure.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/cta-pressure");
const measure = join(SHINE, "verify/measure.mjs");
const { chromium } = load("playwright");

assert.equal(isOperateProveScreen("settings"), true);
assert.equal(isOperateProveScreen("marketing"), false);
assert.equal(isCtaPressureScreen("catalog"), true);
assert.equal(isOperateProveScreen("catalog"), false);
assert.equal(ctaPressureGateApplies({ citeScreen: "settings" }), true);
assert.equal(ctaPressureGateApplies({ citeScreen: "dashboard", lane: "saas" }), true);
assert.equal(ctaPressureGateApplies({ isWireframe: true, citeScreen: "settings" }), false);
assert.equal(ctaPressureGateApplies({ citeId: "magicui-hero", citeScreen: "marketing-hero" }), false);
assert.equal(ctaPressureGateApplies({}), false);

const unbound = checkCompetingCtaFlowBinding({
  competingCtaCheck: { ok: false, note: "Save and Export both filled" },
  defects: [{ id: "d1", severity: "major", assertions: [] }],
});
assert.equal(unbound.status, "failed", JSON.stringify(unbound));

const bound = checkCompetingCtaFlowBinding({
  competingCtaCheck: { ok: false, note: "Save and Export both filled" },
  defects: [{ id: "d1", severity: "major", assertions: ["flow:demote-export"] }],
});
assert.equal(bound.status, "passed", JSON.stringify(bound));

const okTrue = checkCompetingCtaFlowBinding({
  competingCtaCheck: { ok: true, note: "Single Save primary" },
  defects: [],
});
assert.equal(okTrue.status, "passed");

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(pathToFileURL(join(FIX, "dual-primary.html")).href, { waitUntil: "load" });
  const dual = await page.evaluate(evaluateMainCtaPressure);
  assert.ok(dual.mainFilledCount > 1, `dual expected >1 filled, got ${JSON.stringify(dual)}`);
  const dualFails = formatCtaPressureFailures(dual, { gate: true });
  assert.ok(dualFails.some((f) => /cta-pressure:.*competing filled/.test(f)), dualFails.join("\n"));

  await page.goto(pathToFileURL(join(FIX, "single-primary.html")).href, { waitUntil: "load" });
  const single = await page.evaluate(evaluateMainCtaPressure);
  assert.equal(single.mainFilledCount, 1, JSON.stringify(single));
  assert.equal(formatCtaPressureFailures(single, { gate: true }).length, 0);
} finally {
  await browser.close();
}

function runMeasure(file, extraArgs = []) {
  return spawnSync(process.execPath, [measure, file, ...extraArgs], {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
    timeout: 120_000,
  });
}

const outDir = mkdtempSync(join(tmpdir(), "shine-cta-pressure-"));
try {
  const dualRun = runMeasure(join(FIX, "dual-primary.html"), [
    "--cite",
    "shadcn-settings",
    "--lane",
    "saas",
  ]);
  const dualErr = `${dualRun.stderr || ""}\n${dualRun.stdout || ""}`;
  assert.notEqual(dualRun.status, 0, "dual primary must fail measure");
  assert.match(dualErr, /cta-pressure:.*competing filled/, dualErr.slice(-800));

  const singleRun = runMeasure(join(FIX, "single-primary.html"), [
    "--cite",
    "shadcn-settings",
    "--lane",
    "saas",
  ]);
  const singleErr = `${singleRun.stderr || ""}\n${singleRun.stdout || ""}`;
  assert.doesNotMatch(singleErr, /cta-pressure:/, singleErr.slice(-800));
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

console.log("cta-pressure PASS: gate applies · dual fails · single passes · competingCta flow binding");
