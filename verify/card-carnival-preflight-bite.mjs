#!/usr/bin/env node
/**
 * Doctor bite — preflight ai-slop-card-carnival deepen: Operate catalog hard-fail →
 * collapse-card-soup clears (host count; style + data-shine-card-rest excluded).
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

bite("Operate catalog card-carnival hard-fails ≥4 card hosts", () => {
  const before = readFileSync(join(FIX, "catalog-card-soup-before.html"), "utf8");
  const r = scanPreflightSlop(before, { gate: true, screen: "catalog" });
  assert.ok(r.failures.some((f) => /ai-slop-card-carnival/.test(f)), JSON.stringify(r));
  const sig = r.signals.find((s) => s.id === "ai-slop-card-carnival");
  assert.ok(sig && sig.severity === "fail");
  assert.equal(sig.count, 4, `host count should be 4 not inflated: ${JSON.stringify(sig)}`);
});

bite("collapse-card-soup + card-rest exclusion clears carnival", () => {
  assert.match(preflightSrc, /data-shine-card-rest/);
  const before = readFileSync(join(FIX, "catalog-card-soup-before.html"), "utf8");
  const afterPinned = readFileSync(join(FIX, "catalog-card-soup-after.html"), "utf8");
  assert.equal(
    scanPreflightSlop(afterPinned, { gate: true, screen: "catalog" }).failures.filter((f) =>
      /ai-slop-card-carnival/.test(f),
    ).length,
    0,
  );
  const applied = applyCollapseCardSoup(before, { maxVisible: 1 });
  assert.match(applied, /data-shine-card-rest/);
  const cleared = scanPreflightSlop(applied, { gate: true, screen: "catalog" });
  assert.ok(
    !cleared.failures.some((f) => /ai-slop-card-carnival/.test(f)),
    `apply should clear card-carnival: ${JSON.stringify(cleared)}`,
  );
  assert.ok(
    !cleared.failures.some((f) => /ai-slop-nested-cards/.test(f)),
    `apply should also clear nested-cards: ${JSON.stringify(cleared)}`,
  );
});

bite("CSS-only .card rules do not inflate carnival", () => {
  const cssOnly = `<!doctype html><html data-cite="shadcn-catalog"><head><style>
.cards{display:grid}.card{padding:16px}.card h2{font-size:18px}.card p{color:#666}
</style></head><body><main><h1>Tools</h1><section class="cards"><div>A</div><div>B</div><div>C</div><div>D</div></section></main></body></html>`;
  const r = scanPreflightSlop(cssOnly, { gate: true, screen: "catalog" });
  assert.ok(!r.signals.some((s) => s.id === "ai-slop-card-carnival"), JSON.stringify(r));
});

bite("diagnosis cardSoupCheck from card-carnival → collapse-card-soup", () => {
  const diagnosis = seedDiagnosis({ job: "Catalog card carnival", category: "catalog", lane: "saas" });
  diagnosis.cardSoupCheck = { ok: false, note: "From preflight-slop card-carnival" };
  const plan = emitRestructureFromDiagnosis(diagnosis, { citePrimary: "shadcn-catalog" });
  assert.ok(plan.ops.some((o) => o.op === "collapse-card-soup"));
  assert.equal(plan.humanGate, false);
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /card-carnival-preflight-bite\.mjs/);
  assert.match(pkg, /card-carnival:preflight-bite/);
});

console.log(`card-carnival-preflight-bite.mjs: ok (${passed} bites)`);
