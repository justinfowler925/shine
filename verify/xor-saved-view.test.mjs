#!/usr/bin/env node
/**
 * D10 — Dual-grid XOR recipe: peer title → filter chip + shared DataGrid.
 * apply-dom / apply-tsx stay plan-only; this helper is the agent-assisted close.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyDomRestructure } from "./restructure/apply-dom.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";
import { applyXorSavedView, buildXorFoldCropHtml, extractGridWraps } from "./restructure/xor-saved-view.mjs";
import { runDenoiseEval } from "./denoise-eval.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/denoise");
const before = readFileSync(join(FIX, "queue-dual-grid-before.html"), "utf8");
const afterFixture = readFileSync(join(FIX, "queue-dual-grid-after.html"), "utf8");

assert.ok(extractGridWraps(before).length >= 2, "before has peer grids");
assert.match(before, /David/);
assert.match(before, /data-grid-title>Queue/);

const plan = buildRestructurePlan({
  job: "Decide Pursue on the next notice",
  category: "queue",
  ops: [
    {
      op: "collapse-peer-grids",
      mode: "xor-saved-view",
      keepTitleIncludes: ["Queue"],
      foldTitleIncludes: ["David"],
    },
  ],
});
const dom = applyDomRestructure(before, plan);
assert.equal(dom.applied.includes("collapse-peer-grids"), false, "DOM must not auto-delete grids");
assert.ok(dom.plans.length >= 1);
assert.match(dom.plans[0], /xor-saved-view\.mjs/);
assert.ok(dom.humanGate);

const xor = applyXorSavedView(before, plan.ops[0]);
assert.equal(xor.applied, true);
assert.equal(xor.gridCountBefore, 2);
assert.ok(xor.gridCountAfter === 1, `expected 1 grid after XOR, got ${xor.gridCountAfter}`);
assert.match(xor.html, /data-shine-xor-views/);
assert.match(xor.html, /data-shine-xor-from-peer/);
assert.match(xor.html, /data-shine-shared-grid/);
assert.match(xor.html, /data-region="focal"/);
assert.equal((xor.html.match(/role=["']grid["']/gi) || []).length, 1);
assert.ok(!/data-grid-title>David/i.test(xor.html) || /data-shine-xor-from-peer/.test(xor.html));

// After fixture matches recipe shape
assert.match(afterFixture, /data-shine-xor-views/);
assert.equal((afterFixture.match(/role=["']grid["']/gi) || []).length, 1);
assert.ok(extractGridWraps(afterFixture).length === 1);

const crop = buildXorFoldCropHtml({
  keptTitle: "Queue",
  chipLabel: "David's 10 today",
});
assert.match(crop, /data-shine-crop="dual-grid-xor-fold"/);
assert.equal((crop.match(/role=["']grid["']/gi) || []).length, 1);
assert.match(crop, /filter chip/i);

const cropPath = join(FIX, "receipts/queue-dual-grid-fold-crop.html");
assert.ok(existsSync(cropPath), "fold crop receipt must exist");
assert.match(readFileSync(cropPath, "utf8"), /role=["']grid["']/);

// Scorecard without browser still passes XOR structural bar
const score = runDenoiseEval({ runMeasure: false });
const dual = score.cases.find((c) => c.id === "queue-dual-grid");
assert.ok(dual, "queue-dual-grid case present");
assert.equal(dual.pass, true, JSON.stringify(dual, null, 2));
assert.equal(dual.xorApplied, true);
assert.equal(dual.foldCropOk, true);
assert.ok(dual.measureCleared.some((x) => /dual-focal/.test(x)));
assert.ok(score.bar.includes("XOR"));

console.log("xor-saved-view PASS: peer→chip · shared grid · plan-only DOM · eval detect→XOR");
