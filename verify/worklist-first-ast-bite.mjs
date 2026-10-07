#!/usr/bin/env node
/**
 * Doctor bite — worklist-first composition TSX AST deepen: recommend → packet bind →
 * AST worklist-first (records/worklist before KPI chrome) → FAIL→PASS crop.
 * Mirrors dual-focal-ast-bite / kpi-soup-ast-bite: typed fixture on denoise
 * recommend, packet.worklistFirstAst paths, DDR worklist-first, self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  WORKLIST_FIRST_AST_FIXTURES,
  recommendPattern,
  worklistFirstAstForQueueJob,
  formatRecommendationSummary,
} from "../corpus/recommend.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";
import {
  DEFECT_CROP_PAIRS,
  assertCropPairOk,
  ensureDefectCropReceipts,
} from "./restructure/defect-crops.mjs";
import {
  applyTsxRestructure,
  compositionOrderTsx,
  worklistFirstTsx,
} from "./restructure/apply-tsx.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");
const RECEIPTS = join(FIX, "receipts");
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
const applyTsxSrc = readFileSync(join(ROOT, "verify/restructure/apply-tsx.mjs"), "utf8");

let passed = 0;
const bite = (name, fn) => {
  fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

bite("fixture path constants agree", () => {
  assert.equal(WORKLIST_FIRST_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-kpi-chrome-first.tsx");
  assert.equal(WORKLIST_FIRST_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-worklist-first-ast.tsx");
  assert.equal(
    WORKLIST_FIRST_AST_FIXTURES.cropAfter,
    "verify/fixtures/denoise/receipts/queue-worklist-first-tsx-after-crop.html",
  );
  assert.equal(WORKLIST_FIRST_AST_FIXTURES.cropPairId, "queue-worklist-first-tsx");
  assert.equal(WORKLIST_FIRST_AST_FIXTURES.helper, "verify/restructure/apply-tsx.mjs");
  assert.equal(WORKLIST_FIRST_AST_FIXTURES.op, "worklist-first");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    WORKLIST_FIRST_AST_FIXTURES.tsxBefore,
    WORKLIST_FIRST_AST_FIXTURES.tsxAstHard,
    WORKLIST_FIRST_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits worklistFirstAst for queue/records jobs", () => {
  const jobs = [
    { job: "work queue triage inbox", category: "queue" },
    { job: "Decide Pursue on the next notice", category: "queue" },
    { job: "records list worklist Monday decide", category: "record" },
    { job: "queue triage worklist-first KPI chrome composition", category: "queue" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.worklistFirstAst, `${job}: worklistFirstAst`);
    assert.equal(rec.worklistFirstAst.mode, "tsx-ast", job);
    assert.equal(rec.worklistFirstAst.op, "worklist-first", job);
    assert.equal(rec.worklistFirstAst.fixtureTsx, WORKLIST_FIRST_AST_FIXTURES.tsxBefore, job);
    assert.equal(rec.worklistFirstAst.cropAfter, WORKLIST_FIRST_AST_FIXTURES.cropAfter, job);
    assert.equal(rec.worklistFirstAst.cropPairId, "queue-worklist-first-tsx", job);
    assert.match(rec.worklistFirstAst.instruction || "", /apply-tsx|worklist-first|FAIL→PASS/i);
    assert.ok(
      (rec.restructureHints || []).some((h) => /worklist-first|set-focal/i.test(h)),
      `${job}: restructureHints name worklist-first or set-focal`,
    );
    const direct = worklistFirstAstForQueueJob(job, { category });
    assert.equal(direct.fixtureTsx, WORKLIST_FIRST_AST_FIXTURES.tsxBefore);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /worklistFirstAst/);
    }
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.worklistFirstAst, null, "settings/form job must not bind worklist-first AST fixture");
});

bite("denoise packet binds worklistFirstAst + DDR worklist-first", () => {
  const packet = createDesignPacket({
    job: "Queue triage: worklist before KPI chrome via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.worklistFirstAst?.fixtureTsx);
  assert.equal(packet.recommendation.worklistFirstAst.fixtureTsx, WORKLIST_FIRST_AST_FIXTURES.tsxBefore);
  assert.match(packet.worklistFirstAst.fixtureTsx, /queue-kpi-chrome-first\.tsx$/);
  assert.match(packet.worklistFirstAst.fixtureTsxAst, /queue-worklist-first-ast\.tsx$/);
  assert.match(packet.worklistFirstAst.cropBefore, /queue-worklist-first-tsx-before-crop\.html$/);
  assert.match(packet.worklistFirstAst.cropAfter, /queue-worklist-first-tsx-after-crop\.html$/);
  assert.match(packet.worklistFirstAst.helper, /apply-tsx\.mjs$/);
  assert.equal(packet.worklistFirstAst.mode, "tsx-ast");
  assert.equal(packet.worklistFirstAst.op, "worklist-first");
  assert.match(packet.recommendation.instruction || "", /worklistFirstAst/);
  assert.equal(packet.ddr.restructureVsRepaint, "restructure");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("worklist-first"),
    `DDR ops missing worklist-first: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST worklist-first reorders expression KPI chrome ahead of worklist", () => {
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /worklistFirstTsx|compositionOrderTsx/);
  assert.match(applyTsxSrc, /data-shine-records|data-sled-kpis/);

  const hard = readFileSync(join(ROOT, WORKLIST_FIRST_AST_FIXTURES.tsxAstHard), "utf8");
  const before = compositionOrderTsx(hard);
  assert.equal(before.kpiBeforeWorklist, true, "hard fixture must start KPI-first");
  assert.ok(before.worklistCount >= 1, `worklistCount≥1, got ${before.worklistCount}`);
  assert.ok(before.kpiCount >= 1, `kpiCount≥1, got ${before.kpiCount}`);
  assert.match(hard, /className=\{\s*["']metrics["']\s*\}/);
  assert.match(hard, /className=\{\s*["']grid-wrap["']\s*\}/);
  assert.match(hard, /role=\{\s*["']grid["']\s*\}/);
  assert.match(hard, /data-shine-records/);

  const afterSrc = worklistFirstTsx(hard, { attr: "data-region", value: "focal" });
  const after = compositionOrderTsx(afterSrc);
  assert.equal(after.kpiBeforeWorklist, false, "after must not keep KPI before worklist");
  assert.equal(after.alreadyOrdered, true);
  assert.match(afterSrc, /data-region="focal"/);
  // Expression forms preserved
  assert.match(afterSrc, /className=\{\s*["']metrics["']\s*\}/);
  assert.match(afterSrc, /className=\{\s*["']grid-wrap["']\s*\}/);
  assert.match(afterSrc, /role=\{\s*["']grid["']\s*\}/);
  // Focal worklist appears before KPI chrome in source
  const focalIdx = afterSrc.indexOf('data-region="focal"');
  const kpiIdx = afterSrc.indexOf("data-sled-kpis");
  assert.ok(focalIdx >= 0 && kpiIdx >= 0 && focalIdx < kpiIdx, "focal worklist before KPI chrome");

  // Golden simple fixture via plan apply
  const golden = readFileSync(join(ROOT, WORKLIST_FIRST_AST_FIXTURES.tsxBefore), "utf8");
  assert.equal(compositionOrderTsx(golden).kpiBeforeWorklist, true);
  const plan = buildRestructurePlan({
    job: "Worklist before KPI chrome",
    category: "queue",
    ops: [{ op: "worklist-first", attr: "data-region", value: "focal" }],
  });
  const result = applyTsxRestructure(golden, plan);
  assert.ok(result.applied.includes("worklist-first"));
  assert.equal(compositionOrderTsx(result.source).kpiBeforeWorklist, false);
  assert.match(result.source, /data-region="focal"/);
});

bite("FAIL→PASS crop pair self-contained (queue-worklist-first-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-worklist-first-tsx");
  assert.ok(pair, "queue-worklist-first-tsx crop pair");
  assert.equal(typeof pair.buildAfter, "function", "buildAfter must be set");
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => {
    const path = join(RECEIPTS, name);
    assert.ok(existsSync(path), `missing crop ${name}`);
    return readFileSync(path, "utf8");
  };
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  const before = read(pair.beforeCrop);
  const after = read(pair.afterCrop);
  assert.notEqual(before, after, "FAIL→PASS crops must not be twins");
  assert.match(before, /data-tsx-kpi-chrome="first"/);
  assert.match(after, /data-region="focal"/);
  assert.match(after, /data-shine-tsx-ast="after"/);
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /worklist-first-ast-bite\.mjs/);
  assert.match(pkg, /worklist-first-ast-bite/);
  assert.match(pkg, /"restructure:tsx"/);
});

console.log(`worklist-first-ast-bite.mjs: ok (${passed} bites)`);
