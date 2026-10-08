#!/usr/bin/env node
/**
 * Doctor bite — preflight ai-slop-nested-cards promote: Operate catalog/queue
 * hard-fail → collapse-card-soup clears (style + data-shine-card-rest excluded).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scanPreflightSlop } from "./preflight-slop.mjs";
import { applyCollapseCardSoup } from "./restructure/apply-dom.mjs";
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

bite("Operate catalog nested-cards hard-fails equal Card soup", () => {
  const before = readFileSync(join(FIX, "catalog-card-soup-before.html"), "utf8");
  const r = scanPreflightSlop(before, { gate: true, screen: "catalog" });
  assert.ok(r.failures.some((f) => /ai-slop-nested-cards/.test(f)), JSON.stringify(r));
  assert.ok(r.signals.some((s) => s.id === "ai-slop-nested-cards" && s.severity === "fail"));
});

bite("collapse-card-soup + card-rest exclusion clears preflight fail", () => {
  assert.match(preflightSrc, /data-shine-card-rest/);
  assert.match(preflightSrc, /<style\\b/);
  const before = readFileSync(join(FIX, "catalog-card-soup-before.html"), "utf8");
  const afterPinned = readFileSync(join(FIX, "catalog-card-soup-after.html"), "utf8");
  assert.equal(
    scanPreflightSlop(afterPinned, { gate: true, screen: "catalog" }).failures.filter((f) =>
      /ai-slop-nested-cards/.test(f),
    ).length,
    0,
  );
  const applied = applyCollapseCardSoup(before, { maxVisible: 1 });
  assert.match(applied, /data-shine-card-rest/);
  const cleared = scanPreflightSlop(applied, { gate: true, screen: "catalog" });
  assert.ok(
    !cleared.failures.some((f) => /ai-slop-nested-cards/.test(f)),
    `apply should clear nested-cards: ${JSON.stringify(cleared)}`,
  );
});

bite("CSS-only .card rules do not false-positive", () => {
  const cssOnly = `<!doctype html><html data-cite="shadcn-catalog"><head><style>
.cards{display:grid}.card{padding:16px}.card h2{font-size:18px}
</style></head><body><main><h1>Tools</h1><section class="cards"><div>A</div><div>B</div></section></main></body></html>`;
  const r = scanPreflightSlop(cssOnly, { gate: true, screen: "catalog" });
  assert.ok(!r.signals.some((s) => s.id === "ai-slop-nested-cards"), JSON.stringify(r));
});

bite("diagnosis cardSoupCheck from nested-cards → collapse-card-soup", () => {
  const diagnosis = seedDiagnosis({ job: "Catalog card soup", category: "catalog", lane: "saas" });
  diagnosis.cardSoupCheck = { ok: false, note: "From preflight-slop nested-cards" };
  const plan = emitRestructureFromDiagnosis(diagnosis, { citePrimary: "shadcn-catalog" });
  assert.ok(plan.ops.some((o) => o.op === "collapse-card-soup"));
  assert.equal(plan.humanGate, false);
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /nested-cards-preflight-bite\.mjs/);
  assert.match(pkg, /nested-cards:preflight-bite/);
});

console.log(`nested-cards-preflight-bite.mjs: ok (${passed} bites)`);
