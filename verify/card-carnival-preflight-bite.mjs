#!/usr/bin/env node
/**
 * Doctor bite — preflight ai-slop-card-carnival deepen: Operate catalog/queue
 * hard-fail clears after collapse-card-soup (style + data-shine-card-rest excluded;
 * host-based count). Completes #209 nested-cards promote — carnival still counted
 * parked peers on raw src.
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

bite("Operate catalog card-carnival hard-fails ≥4 visible card hosts", () => {
  const before = readFileSync(join(FIX, "catalog-card-soup-before.html"), "utf8");
  const r = scanPreflightSlop(before, { gate: true, screen: "catalog" });
  assert.ok(r.failures.some((f) => /ai-slop-card-carnival/.test(f)), JSON.stringify(r));
  assert.ok(r.signals.some((s) => s.id === "ai-slop-card-carnival" && s.severity === "fail"));
});

bite("collapse-card-soup + card-rest exclusion clears carnival fail", () => {
  // Carnival must count on srcVisible (after style/card-rest strip), not raw src.
  assert.match(preflightSrc, /data-shine-card-rest/);
  assert.match(preflightSrc, /Card carnival: ≥4 visible card hosts/);
  const idPush = preflightSrc.lastIndexOf('id: "ai-slop-card-carnival"');
  assert.ok(idPush > 0);
  assert.match(preflightSrc.slice(idPush - 500, idPush), /srcVisible/);

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
    `apply should keep nested-cards clear: ${JSON.stringify(cleared)}`,
  );
});

bite("CSS .card / bare <article> do not inflate carnival count", () => {
  const cssOnly = `<!doctype html><html data-cite="shadcn-catalog"><head><style>
.card{border:1px solid #ccc}.cards{display:grid}
</style></head><body><main><h1>Tools</h1>
<section class="cards">
<article><h2>A</h2></article><article><h2>B</h2></article>
<article><h2>C</h2></article><article><h2>D</h2></article>
</section></main></body></html>`;
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
