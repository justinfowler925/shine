#!/usr/bin/env node
/**
 * Doctor bite — D10 XOR dual-grid deepen: recommend → packet bind → FAIL→PASS crop.
 * Mirrors records-pilot-table-quality-bite (#165): typed fixture on denoise recommend,
 * packet.xorSavedView paths, DDR collapse-peer-grids, self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  DUAL_GRID_XOR_FIXTURES,
  recommendPattern,
  xorSavedViewForQueueJob,
  formatRecommendationSummary,
} from "../corpus/recommend.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";
import {
  DEFECT_CROP_PAIRS,
  assertCropPairOk,
  ensureDefectCropReceipts,
} from "./restructure/defect-crops.mjs";
import { applyXorSavedView, extractGridWraps } from "./restructure/xor-saved-view.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");
const RECEIPTS = join(FIX, "receipts");
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const pkg = readFileSync(join(ROOT, "package.json"), "utf8");

let passed = 0;
const bite = (name, fn) => {
  fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

bite("fixture path constants agree", () => {
  assert.equal(DUAL_GRID_XOR_FIXTURES.before, "verify/fixtures/denoise/queue-dual-grid-before.html");
  assert.equal(DUAL_GRID_XOR_FIXTURES.cropAfter, "verify/fixtures/denoise/receipts/queue-dual-grid-fold-crop.html");
  assert.equal(DUAL_GRID_XOR_FIXTURES.cropPairId, "queue-dual-grid");
  assert.equal(DUAL_GRID_XOR_FIXTURES.helper, "verify/restructure/xor-saved-view.mjs");
});

bite("golden before/after + crop receipts exist", () => {
  for (const rel of [
    DUAL_GRID_XOR_FIXTURES.before,
    DUAL_GRID_XOR_FIXTURES.after,
    DUAL_GRID_XOR_FIXTURES.cropBefore,
    DUAL_GRID_XOR_FIXTURES.cropAfter,
    DUAL_GRID_XOR_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
  const before = readFileSync(join(ROOT, DUAL_GRID_XOR_FIXTURES.before), "utf8");
  const after = readFileSync(join(ROOT, DUAL_GRID_XOR_FIXTURES.after), "utf8");
  assert.ok(extractGridWraps(before).length >= 2, "before peer grids");
  assert.equal(extractGridWraps(after).length, 1, "after one grid-wrap");
  assert.equal((after.match(/role=["']grid["']/gi) || []).length, 1);
  assert.match(after, /data-shine-xor-views/);
});

bite("recommend emits xorSavedView for queue/triage jobs", () => {
  const jobs = [
    { job: "work queue triage inbox", category: "queue" },
    { job: "Decide Pursue on the next notice", category: "queue" },
    { job: "approval inbox assign owners", category: "queue" },
    { job: "queue worklist dual-grid XOR fold peer", category: "queue" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.xorSavedView, `${job}: xorSavedView`);
    assert.equal(rec.xorSavedView.mode, "xor-saved-view", job);
    assert.equal(rec.xorSavedView.op, "collapse-peer-grids", job);
    assert.equal(rec.xorSavedView.fixtureBefore, DUAL_GRID_XOR_FIXTURES.before, job);
    assert.equal(rec.xorSavedView.cropAfter, DUAL_GRID_XOR_FIXTURES.cropAfter, job);
    assert.equal(rec.xorSavedView.cropPairId, "queue-dual-grid", job);
    assert.match(rec.xorSavedView.instruction || "", /xor-saved-view|FAIL→PASS|collapse-peer/i);
    assert.ok(
      (rec.restructureHints || []).some((h) => /collapse-peer-grids|xor-saved-view/i.test(h)),
      `${job}: restructureHints still name XOR`,
    );
    const direct = xorSavedViewForQueueJob(job, { category });
    assert.equal(direct.fixtureBefore, DUAL_GRID_XOR_FIXTURES.before);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /xorSavedView/);
    }
  }
  // Category-only bind (datagrid) still emits fixture even when cite shortlist is thin
  const datagridOnly = xorSavedViewForQueueJob("fold peer grids into shared DataGrid", {
    category: "datagrid",
  });
  assert.ok(datagridOnly);
  assert.equal(datagridOnly.cropPairId, "queue-dual-grid");
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.xorSavedView, null, "settings job must not bind XOR fixture");
});

bite("denoise packet binds xorSavedView + DDR collapse-peer-grids", () => {
  const packet = createDesignPacket({
    job: "Queue triage: fold peer David worklist into XOR saved-view chip",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.xorSavedView?.fixtureBefore);
  assert.equal(packet.recommendation.xorSavedView.fixtureBefore, DUAL_GRID_XOR_FIXTURES.before);
  assert.match(packet.xorSavedView.fixtureBefore, /queue-dual-grid-before\.html$/);
  assert.match(packet.xorSavedView.fixtureAfter, /queue-dual-grid-after\.html$/);
  assert.match(packet.xorSavedView.cropBefore, /queue-dual-grid-before-crop\.html$/);
  assert.match(packet.xorSavedView.cropAfter, /queue-dual-grid-fold-crop\.html$/);
  assert.match(packet.xorSavedView.helper, /xor-saved-view\.mjs$/);
  assert.equal(packet.xorSavedView.mode, "xor-saved-view");
  assert.equal(packet.xorSavedView.op, "collapse-peer-grids");
  assert.match(packet.recommendation.instruction || "", /xorSavedView/);
  assert.equal(packet.ddr.restructureVsRepaint, "restructure");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("collapse-peer-grids"),
    `DDR ops missing collapse-peer-grids: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("FAIL→PASS crop pair self-contained (no xorAfterHtml override)", () => {
  const dual = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-dual-grid");
  assert.ok(dual, "queue-dual-grid crop pair");
  assert.equal(typeof dual.buildAfter, "function", "buildAfter must be set");
  // Write without xorAfterHtml — deepen requires self-contained after builder.
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => {
    const path = join(RECEIPTS, name);
    assert.ok(existsSync(path), `missing crop ${name}`);
    return readFileSync(path, "utf8");
  };
  const result = assertCropPairOk(dual, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  const before = read(dual.beforeCrop);
  const after = read(dual.afterCrop);
  assert.notEqual(before, after, "FAIL→PASS crops must not be twins");
  assert.ok((before.match(/role=["']grid["']/gi) || []).length >= 2, "before ≥2 grids");
  assert.equal((after.match(/role=["']grid["']/gi) || []).length, 1, "after exactly 1 grid");
  assert.match(after, /data-shine-xor-views|data-shine-xor-from-peer/);
});

bite("recipe applies before→structural after; doctor + npm wire this bite", () => {
  const before = readFileSync(join(FIX, "queue-dual-grid-before.html"), "utf8");
  const xor = applyXorSavedView(before, {
    mode: "xor-saved-view",
    keepTitleIncludes: ["Queue"],
    foldTitleIncludes: ["David"],
  });
  assert.equal(xor.applied, true);
  assert.ok(xor.gridCountBefore >= 2);
  assert.equal(xor.gridCountAfter, 1);
  assert.match(xor.html, /data-shine-xor-views/);
  assert.match(doctorSrc, /xor-saved-view-recommend-bite\.mjs/);
  assert.match(pkg, /xor-saved-view-recommend-bite/);
  assert.match(pkg, /"restructure:xor"/);
});

console.log(`xor-saved-view-recommend-bite.mjs: ok (${passed} bites)`);
