#!/usr/bin/env node
/**
 * Doctor bite — preflight ai-slop-metric-grid promote: Operate queue hard-fail →
 * kpi-collapse clears (style + data-shine-kpi-rest excluded from cluster count).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanPreflightSlop } from "./preflight-slop.mjs";
import { applyDomRestructure } from "./restructure/apply-dom.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";
import { emitRestructureFromDiagnosis, seedDiagnosis } from "../core/diagnosis.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
const preflightSrc = readFileSync(join(ROOT, "verify/preflight-slop.mjs"), "utf8");

let passed = 0;
const bite = (name, fn) => {
  fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

bite("Operate queue metric-grid hard-fails ≥4 hosts in metrics container", () => {
  const before = readFileSync(join(FIX, "queue-kpi-before.html"), "utf8");
  const r = scanPreflightSlop(before, { gate: true, screen: "queue" });
  assert.ok(r.failures.some((f) => /ai-slop-metric-grid/.test(f)), JSON.stringify(r));
  assert.ok(r.signals.some((s) => s.id === "ai-slop-metric-grid" && s.severity === "fail"));
});

bite("kpi-collapse + style/kpi-rest exclusion clears preflight fail", () => {
  assert.match(preflightSrc, /data-shine-kpi-rest/);
  assert.match(preflightSrc, /<style\\b/);
  const before = readFileSync(join(FIX, "queue-kpi-before.html"), "utf8");
  const afterPinned = readFileSync(join(FIX, "queue-kpi-after.html"), "utf8");
  assert.equal(
    scanPreflightSlop(afterPinned, { gate: true, screen: "queue" }).failures.filter((f) =>
      /ai-slop-metric-grid/.test(f),
    ).length,
    0,
  );
  const plan = buildRestructurePlan({
    job: "Collapse KPI soup",
    category: "queue",
    ops: [{ op: "kpi-collapse", maxVisible: 3, rest: "details" }],
  });
  const applied = applyDomRestructure(before, plan);
  assert.ok(applied.applied.includes("kpi-collapse"));
  assert.match(applied.html, /data-shine-kpi-rest/);
  const cleared = scanPreflightSlop(applied.html, { gate: true, screen: "queue" });
  assert.ok(
    !cleared.failures.some((f) => /ai-slop-metric-grid/.test(f)),
    `apply should clear metric-grid: ${JSON.stringify(cleared)}`,
  );
});

bite("CSS-only .metrics/.metric rules do not false-positive", () => {
  const cssOnly = `<!doctype html><html data-cite="shadcn-queue"><head><style>
.metrics{display:flex}.metric{flex:1}.metric span{display:block}.metric strong{font-size:22px}
</style></head><body><main><h1>Queue</h1><div class="metrics"><div class="metric">A</div><div class="metric">B</div><div class="metric">C</div></div></main></body></html>`;
  // 3 hosts → no metric-grid; stylesheet alone must not tip the cluster
  const r = scanPreflightSlop(cssOnly, { gate: true, screen: "queue" });
  assert.ok(!r.signals.some((s) => s.id === "ai-slop-metric-grid"), JSON.stringify(r));
});

bite("diagnosis kpiSoupCheck from metric-grid → kpi-collapse", () => {
  const diagnosis = seedDiagnosis({ job: "Queue metric grid", category: "datagrid", lane: "saas" });
  diagnosis.kpiSoupCheck = { ok: false, note: "From preflight-slop metric-grid" };
  const plan = emitRestructureFromDiagnosis(diagnosis, { citePrimary: "shadcn-queue" });
  assert.ok(plan.ops.some((o) => o.op === "kpi-collapse"));
  assert.equal(plan.humanGate, false);
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /metric-grid-preflight-bite\.mjs/);
  assert.match(pkg, /metric-grid:preflight-bite/);
});

console.log(`metric-grid-preflight-bite.mjs: ok (${passed} bites)`);
