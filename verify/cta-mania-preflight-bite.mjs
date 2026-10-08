#!/usr/bin/env node
/**
 * Doctor bite — preflight ai-slop-cta-mania deepen: Operate queue hard-fail →
 * cta-budget clears. Leftover .btn.filled-peer CSS selectors must not keep mania
 * fail-closed after demote (class-attr detect on style-stripped markup).
 *
 * Outside saturated card/kpi/badge/nested preflight path (#207–#210).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanPreflightSlop } from "./preflight-slop.mjs";
import { applyCtaBudget } from "./restructure/apply-dom.mjs";
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

bite("Operate queue cta-mania hard-fails dual filled treatments", () => {
  const before = readFileSync(join(FIX, "queue-cta-before.html"), "utf8");
  const r = scanPreflightSlop(before, { gate: true, screen: "queue" });
  assert.ok(r.failures.some((f) => /ai-slop-cta-mania/.test(f)), JSON.stringify(r));
});

bite("cta-budget clears mania despite leftover .filled-peer CSS", () => {
  assert.match(preflightSrc, /srcNoStyle/);
  assert.match(preflightSrc, /class=\["'\]\[\^"'\]\*\\bfilled-peer/);
  const before = readFileSync(join(FIX, "queue-cta-before.html"), "utf8");
  const afterPinned = readFileSync(join(FIX, "queue-cta-after.html"), "utf8");
  assert.equal(
    scanPreflightSlop(afterPinned, { gate: true, screen: "queue" }).failures.filter((f) =>
      /ai-slop-cta-mania/.test(f),
    ).length,
    0,
  );
  const applied = applyCtaBudget(before, { maxFilled: 1, preferLabels: ["Pursue"] });
  assert.match(applied, /filled-peer/); // CSS selector may remain
  assert.doesNotMatch(applied, /<button[^>]*filled-peer/);
  const cleared = scanPreflightSlop(applied, { gate: true, screen: "queue" });
  assert.ok(
    !cleared.failures.some((f) => /ai-slop-cta-mania/.test(f)),
    `apply should clear cta-mania: ${JSON.stringify(cleared)}`,
  );
});

bite("CSS-only .filled-peer rule without markup peer does not trip mania", () => {
  const cssOnly = `<!doctype html><html data-cite="shadcn-queue"><head><style>
.btn.filled{background:#111;color:#fff}
.btn.filled-peer{background:#333;color:#fff}
</style></head><body><main>
<button type="button" class="btn filled">Pursue</button>
<button type="button" class="btn ghost">Assign lead</button>
</main></body></html>`;
  const r = scanPreflightSlop(cssOnly, { gate: true, screen: "queue" });
  assert.ok(!r.failures.some((f) => /ai-slop-cta-mania/.test(f)), JSON.stringify(r));
});

bite("diagnosis competingCtaCheck from cta-mania → cta-budget", () => {
  const diagnosis = seedDiagnosis({ job: "Queue CTA mania", category: "datagrid", lane: "saas" });
  diagnosis.competingCtaCheck = { ok: false, note: "From preflight-slop cta-mania" };
  const plan = emitRestructureFromDiagnosis(diagnosis, { citePrimary: "shadcn-queue" });
  assert.ok(plan.ops.some((o) => o.op === "cta-budget"));
  assert.equal(plan.humanGate, false);
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /cta-mania-preflight-bite\.mjs/);
  assert.match(pkg, /cta-mania:preflight-bite/);
});

console.log(`cta-mania-preflight-bite.mjs: ok (${passed} bites)`);
