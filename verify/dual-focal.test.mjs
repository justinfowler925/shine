#!/usr/bin/env node
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { load } from "./deps.mjs";
import {
  DUAL_FOCAL_MIN_GRIDS,
  dualFocalGateApplies,
  evaluateDualFocal,
  formatDualFocalFailures,
} from "./dual-focal.mjs";
import {
  KPI_SOUP_MIN,
  evaluateKpiSoup,
  formatKpiSoupFailures,
  kpiSoupGateApplies,
} from "./kpi-soup.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const before = join(SHINE, "verify/fixtures/denoise/queue-cta-before.html");
const after = join(SHINE, "verify/fixtures/denoise/queue-cta-after.html");
const { chromium } = load("playwright");

assert.equal(DUAL_FOCAL_MIN_GRIDS, 2);
assert.equal(dualFocalGateApplies({ citeScreen: "queue", lane: "saas" }), true);
assert.equal(kpiSoupGateApplies({ citeScreen: "queue", lane: "saas" }), true);
assert.equal(kpiSoupGateApplies({ citeScreen: "dashboard", lane: "saas" }), false);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(pathToFileURL(before).href, { waitUntil: "load" });
  const dual = await page.evaluate(evaluateDualFocal);
  assert.ok(dual.peerGridCount >= 2, JSON.stringify(dual));
  assert.ok(formatDualFocalFailures(dual, { gate: true }).some((f) => /dual-focal/.test(f)));

  const soup = await page.evaluate(evaluateKpiSoup);
  assert.ok(soup.equalMetricCount >= KPI_SOUP_MIN, JSON.stringify(soup));
  assert.ok(formatKpiSoupFailures(soup, { gate: true }).some((f) => /kpi-soup/.test(f)));

  await page.goto(pathToFileURL(after).href, { waitUntil: "load" });
  const dualAfter = await page.evaluate(evaluateDualFocal);
  // after fixture collapses to one queue grid
  assert.ok(dualAfter.peerGridCount < 2, JSON.stringify(dualAfter));
} finally {
  await browser.close();
}

const run = spawnSync(
  process.execPath,
  [join(SHINE, "verify/measure.mjs"), before, "--cite", "shadcn-queue", "--lane", "saas"],
  {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
    timeout: 120_000,
  },
);
assert.notEqual(run.status, 0);
const text = `${run.stderr}\n${run.stdout}`;
assert.match(text, /dual-focal/);
assert.match(text, /kpi-soup/);

console.log("dual-focal + kpi-soup PASS: queue-before fails both; queue-after clears dual-focal");
