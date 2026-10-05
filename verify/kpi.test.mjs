#!/usr/bin/env node
// M5 — Dashboard / KPI decidability starters: equal-card floor + opt-in data-shine-kpi attrs.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";
import {
  KPI_EQUAL_CARD_MIN,
  KPI_REQUIRED_ATTRS,
  evaluateKpiFloor,
  formatKpiFailures,
  isDashboardScreen,
  kpiDashboardGateApplies,
} from "./kpi.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/kpi");
const measure = join(SHINE, "verify/measure.mjs");
const { chromium } = load("playwright");

assert.equal(KPI_EQUAL_CARD_MIN, 3);
assert.deepEqual(KPI_REQUIRED_ATTRS, ["data-unit", "data-baseline"]);
assert.ok(isDashboardScreen("dashboard"));
assert.equal(isDashboardScreen("settings"), false);

assert.equal(kpiDashboardGateApplies({ dashboardProbe: true }), true, "probe applies");
assert.equal(kpiDashboardGateApplies({ citeScreen: "dashboard" }), true, "cite screen");
assert.equal(kpiDashboardGateApplies({ citeJobs: ["dashboard", "analytics"] }), true, "jobs hint");
assert.equal(kpiDashboardGateApplies({ citeScreen: "settings" }), false, "non-dashboard cite");
assert.equal(kpiDashboardGateApplies({ isWireframe: true, dashboardProbe: true }), false, "wireframe skips");
assert.equal(kpiDashboardGateApplies({}), false, "anonymous skips (a)");

function runMeasure(file, extraArgs = []) {
  return spawnSync(process.execPath, [measure, file, ...extraArgs], {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
    timeout: 120_000,
  });
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(pathToFileURL(join(FIX, "equal-cards-no-focal.html")).href, { waitUntil: "load" });
  const soup = await page.evaluate(evaluateKpiFloor);
  assert.ok(soup.dashboardProbe, "fixture sets dashboard probe");
  assert.ok(soup.equalWeightCount >= 3, `expected ≥3 equal cards, got ${JSON.stringify(soup)}`);
  assert.equal(soup.hasFocalBeyondCards, false, "soup must not invent a focal");
  const soupFails = formatKpiFailures(soup, { dashboardGate: true });
  assert.ok(soupFails.some((f) => /equal-weight summary cards/.test(f)), soupFails.join("\n"));

  await page.goto(pathToFileURL(join(FIX, "with-focal-and-attrs.html")).href, { waitUntil: "load" });
  const good = await page.evaluate(evaluateKpiFloor);
  assert.ok(good.hasFocalBeyondCards, `good must have focal: ${JSON.stringify(good)}`);
  assert.equal(good.missingAttrs.length, 0, JSON.stringify(good.missingAttrs));
  assert.equal(formatKpiFailures(good, { dashboardGate: true }).length, 0);

  await page.goto(pathToFileURL(join(FIX, "missing-attrs.html")).href, { waitUntil: "load" });
  const missing = await page.evaluate(evaluateKpiFloor);
  assert.ok(missing.missingAttrs.length >= 2, JSON.stringify(missing.missingAttrs));
  const attrFails = formatKpiFailures(missing, { dashboardGate: true });
  assert.ok(attrFails.some((f) => /data-unit/.test(f) || /data-baseline/.test(f)), attrFails.join("\n"));
} finally {
  await browser.close();
}

const outDir = mkdtempSync(join(tmpdir(), "shine-kpi-measure-"));
try {
  // (a) equal cards, no focal → measure fail under --cite dashboard
  const soupJson = join(outDir, "soup.json");
  const soupRun = runMeasure(join(FIX, "equal-cards-no-focal.html"), [
    "--cite",
    "shadcn-dashboard-01",
    "--json",
    soupJson,
  ]);
  assert.notEqual(soupRun.status, 0, "equal-card soup must fail measure");
  const soupReport = JSON.parse(readFileSync(soupJson, "utf8"));
  const soupKpi = (soupReport.failures || []).filter((f) => f.startsWith("kpi:"));
  assert.ok(soupKpi.some((f) => /equal-weight/.test(f)), soupKpi.join("\n") || (soupReport.failures || []).join("\n"));

  // Same soup WITHOUT dashboard cite/probe → (a) does not hard-fail
  const anon = join(outDir, "anon-soup.html");
  writeFileSync(
    anon,
    readFileSync(join(FIX, "equal-cards-no-focal.html"), "utf8")
      .replace(/ data-cite="shadcn-dashboard-01"/, "")
      .replace(/ data-shine-probe="dashboard"/, ""),
  );
  const anonJson = join(outDir, "anon.json");
  const anonRun = runMeasure(anon, ["--json", anonJson]);
  const anonReport = JSON.parse(readFileSync(anonJson, "utf8"));
  const anonKpi = (anonReport.failures || []).filter((f) => /equal-weight/.test(f));
  assert.equal(anonKpi.length, 0, `non-dashboard must not equal-card fail:\n${anonKpi.join("\n")}`);
  // status may still be 1 for other reasons (hierarchy etc.) — only assert KPI equal-weight absent
  void anonRun;

  // (a)+(b) good fixture passes KPI gates (other measure fails ok — we only check kpi: lines)
  const goodJson = join(outDir, "good.json");
  runMeasure(join(FIX, "with-focal-and-attrs.html"), [
    "--cite",
    "shadcn-dashboard-01",
    "--json",
    goodJson,
  ]);
  const goodReport = JSON.parse(readFileSync(goodJson, "utf8"));
  const goodKpi = (goodReport.failures || []).filter((f) => f.startsWith("kpi:"));
  assert.equal(goodKpi.length, 0, `good must not emit kpi fails:\n${goodKpi.join("\n")}\nall: ${(goodReport.failures || []).join("\n")}`);

  // (b) missing attrs → kpi fail even with focal present
  const missJson = join(outDir, "miss.json");
  const missRun = runMeasure(join(FIX, "missing-attrs.html"), [
    "--cite",
    "shadcn-dashboard-01",
    "--json",
    missJson,
  ]);
  assert.notEqual(missRun.status, 0, "missing attrs must fail measure");
  const missReport = JSON.parse(readFileSync(missJson, "utf8"));
  const missKpi = (missReport.failures || []).filter((f) => f.startsWith("kpi:"));
  assert.ok(missKpi.some((f) => /data-shine-kpi/.test(f)), missKpi.join("\n"));

  // Without data-shine-kpi attribute, bare numbers stay agent — no attr-floor fail
  const agentOnly = join(outDir, "agent-only.html");
  writeFileSync(
    agentOnly,
    `<!doctype html><html lang="en" data-cite="shadcn-dashboard-01" data-shine-probe="dashboard">
<head><meta charset="utf-8"><title>Agent</title>
<style>:root{color-scheme:light}body{font:15px system-ui;padding:24px;background:#fff;color:#111}
.kpi-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}
.kpi{border:1px solid #ddd;padding:20px;min-height:100px}.value{font-size:28px;font-weight:600}
[data-region=focal]{border:1px solid #ddd;min-height:320px;padding:16px}
svg{width:100%;height:280px}button{background:#111;color:#fff;border:0;padding:10px 16px;font:inherit}
</style></head><body><main><h1>Cockpit</h1>
<section class="kpi-row" data-summary>
<div class="kpi"><div>ARR</div><div class="value">$1.2M</div></div>
<div class="kpi"><div>NRR</div><div class="value">112%</div></div>
<div class="kpi"><div>Pipe</div><div class="value">$4.8M</div></div>
</section>
<section data-region="focal"><svg viewBox="0 0 640 280" role="img" aria-label="Chart">
<rect x="40" y="40" width="500" height="200" fill="#444"/></svg></section>
<button type="button" data-primary>Go</button></main></body></html>`,
  );
  const agentJson = join(outDir, "agent.json");
  runMeasure(agentOnly, ["--cite", "shadcn-dashboard-01", "--json", agentJson]);
  const agentReport = JSON.parse(readFileSync(agentJson, "utf8"));
  const agentAttr = (agentReport.failures || []).filter((f) => /data-shine-kpi/.test(f));
  assert.equal(agentAttr.length, 0, "without attribute, unit/baseline stay agent");
  const agentEqual = (agentReport.failures || []).filter((f) => /equal-weight/.test(f));
  assert.equal(agentEqual.length, 0, "with focal, equal-weight must not fail");
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

console.log(
  "kpi floor PASS: equal-card soup fails on dashboard; focal+attrs clean; missing attrs bite; " +
    "non-dashboard / unmarked metrics stay agent",
);
