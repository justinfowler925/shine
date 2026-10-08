#!/usr/bin/env node
/**
 * Doctor bite — preflight ai-slop-badge-spam promote: Operate queue hard-fail →
 * pill-collapse clears (data-shine-pill-rest excluded from count).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanPreflightSlop } from "./preflight-slop.mjs";
import { applyPillCollapse } from "./restructure/apply-dom.mjs";
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

bite("Operate queue badge-spam hard-fails ≥5 hosts", () => {
  const before = readFileSync(join(FIX, "queue-pill-badge-before.html"), "utf8");
  const r = scanPreflightSlop(before, { gate: true, screen: "queue" });
  assert.ok(r.failures.some((f) => /ai-slop-badge-spam/.test(f)), JSON.stringify(r));
  assert.ok(r.signals.some((s) => s.id === "ai-slop-badge-spam" && s.severity === "fail"));
});

bite("pill-collapse + pill-rest exclusion clears preflight fail", () => {
  assert.match(preflightSrc, /data-shine-pill-rest/);
  const before = readFileSync(join(FIX, "queue-pill-badge-before.html"), "utf8");
  const afterPinned = readFileSync(join(FIX, "queue-pill-badge-after.html"), "utf8");
  assert.equal(
    scanPreflightSlop(afterPinned, { gate: true, screen: "queue" }).failures.filter((f) =>
      /ai-slop-badge-spam/.test(f),
    ).length,
    0,
  );
  const applied = applyPillCollapse(before, { maxVisible: 3 });
  assert.match(applied, /data-shine-pill-rest/);
  const cleared = scanPreflightSlop(applied, { gate: true, screen: "queue" });
  assert.ok(
    !cleared.failures.some((f) => /ai-slop-badge-spam/.test(f)),
    `apply should clear badge-spam: ${JSON.stringify(cleared)}`,
  );
});

bite("diagnosis pillFilterCheck → pill-collapse with badge/chip selector", () => {
  const diagnosis = seedDiagnosis({ job: "Queue badge spam", category: "datagrid", lane: "saas" });
  diagnosis.pillFilterCheck = { ok: false, note: "From preflight-slop badge-spam" };
  const plan = emitRestructureFromDiagnosis(diagnosis, { citePrimary: "shadcn-queue" });
  assert.ok(plan.ops.some((o) => o.op === "pill-collapse"));
  const pill = plan.ops.find((o) => o.op === "pill-collapse");
  assert.match(String(pill.selector || ""), /badge|chip/);
  assert.equal(plan.humanGate, false, "pill-collapse must not humanGate");
});

bite("collapse-peer-grids no longer forces humanGate", () => {
  const diagnosis = seedDiagnosis({ job: "Queue dual", category: "datagrid", lane: "saas" });
  diagnosis.dualFocalCheck = { ok: false };
  const plan = emitRestructureFromDiagnosis(diagnosis, { citePrimary: "shadcn-queue" });
  assert.ok(plan.ops.some((o) => o.op === "collapse-peer-grids"));
  assert.equal(plan.humanGate, false);
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /badge-spam-preflight-bite\.mjs/);
  assert.match(pkg, /badge-spam:preflight-bite/);
});

console.log(`badge-spam-preflight-bite.mjs: ok (${passed} bites)`);
