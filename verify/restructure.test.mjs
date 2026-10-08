#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyDomRestructure, applyCtaBudget, applyKpiCollapse, applySetFocal, applyRebindCite } from "./restructure/apply-dom.mjs";
import { buildRestructurePlan, validateRestructurePlan, RESTRUCTURE_SCHEMA } from "./restructure/schema.mjs";
import { runDenoiseEval } from "./denoise-eval.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const before = readFileSync(join(SHINE, "verify/fixtures/denoise/queue-cta-before.html"), "utf8");

const plan = buildRestructurePlan({
  job: "Decide Pursue on the next notice",
  category: "queue",
  citePrimary: "shadcn-queue",
  ops: [
    { op: "cta-budget", maxFilled: 1, preferLabels: ["Pursue"] },
    { op: "kpi-collapse", maxVisible: 3 },
    { op: "set-focal", attr: "data-region", value: "focal" },
    { op: "collapse-peer-grids", mode: "xor-saved-view" },
  ],
});
assert.equal(plan.$schema, RESTRUCTURE_SCHEMA);
assert.equal(validateRestructurePlan(plan).ok, true);

const cta = applyCtaBudget(before, { maxFilled: 1, preferLabels: ["Pursue"] });
// Peer fill may remain as a CSS rule; button classes must not keep filled-peer.
assert.ok(!/<button\b[^>]*class=["'][^"']*\bfilled-peer\b/.test(cta));
assert.ok(/class="btn filled">Pursue/.test(cta) || /class="btn filled"/.test(cta));
assert.match(cta, /\.btn\.ghost\{[^}]*background:\s*transparent/);

// Promote when XOR/peer-fold left zero filled preferred primaries.
const zeroPrimary = `
<main>
  <button type="button" class="btn outline">Pursue</button>
  <button type="button" class="btn outline">Review</button>
  <button type="button" class="btn outline">Dismiss</button>
</main>`;
const promoted = applyCtaBudget(zeroPrimary, { maxFilled: 1, preferLabels: ["Pursue"] });
assert.match(promoted, /class="btn filled">Pursue/);
assert.equal((promoted.match(/\bfilled\b/g) || []).length, 1);

const kpi = applyKpiCollapse(before, { maxVisible: 3 });
assert.match(kpi, /data-shine-kpi-rest/);
assert.match(kpi, /More metrics/);

const focal = applySetFocal(before, {});
assert.match(focal, /data-region="focal"/);

const rebound = applyRebindCite('html data-cite="shadcn-queue"', { from: "shadcn-queue", to: "shadcn-settings" });
assert.match(rebound, /shadcn-settings/);

const applied = applyDomRestructure(before, plan);
assert.ok(applied.applied.includes("cta-budget"));
assert.ok(applied.applied.includes("kpi-collapse"));
assert.ok(applied.applied.includes("set-focal"));
assert.ok(applied.applied.includes("collapse-peer-grids"), "DOM XOR auto-applies on dual grid-wraps");
assert.match(applied.html, /data-shine-xor-views/);
assert.equal(applied.plans.length, 0);
assert.equal(applied.humanGate, false);

// Fast scorecard without full browser measure (ops + preflight + cropped receipts)
const score = runDenoiseEval({ runMeasure: false });
assert.ok(score.passed >= 4, JSON.stringify(score, null, 2));
assert.equal(score.failed, 0, JSON.stringify(score.cases.filter((c) => !c.pass), null, 2));
assert.equal(score.cropPairsOk, true, JSON.stringify(score.cases.map((c) => c.cropPair), null, 2));
for (const id of ["queue-cta", "queue-kpi", "sources-cite", "queue-dual-grid"]) {
  const row = score.cases.find((c) => c.id === id);
  assert.ok(row?.cropPair?.ok, `${id} crop pair: ${JSON.stringify(row?.cropPair)}`);
}

console.log(`restructure PASS: schema · DOM ops · denoise-eval ${score.passed}/${score.total} · crop pairs`);
