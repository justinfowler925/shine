#!/usr/bin/env node
/**
 * Doctor bite — dual-focal ban TSX AST deepen: recommend → packet bind →
 * AST collapse-peer-grids (XOR peer→chip) → FAIL→PASS crop.
 * Mirrors kpi-soup-ast-bite / cta-pressure-ast-bite: typed fixture on denoise
 * recommend, packet.dualFocalAst paths, DDR collapse-peer-grids, self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  DUAL_FOCAL_AST_FIXTURES,
  recommendPattern,
  dualFocalAstForQueueJob,
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
  collapsePeerGridsTsx,
  countPeerGridsTsx,
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
  assert.equal(DUAL_FOCAL_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-dual-grid.tsx");
  assert.equal(DUAL_FOCAL_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-dual-grid-ast.tsx");
  assert.equal(DUAL_FOCAL_AST_FIXTURES.cropAfter, "verify/fixtures/denoise/receipts/queue-dual-grid-tsx-after-crop.html");
  assert.equal(DUAL_FOCAL_AST_FIXTURES.cropPairId, "queue-dual-grid-tsx");
  assert.equal(DUAL_FOCAL_AST_FIXTURES.helper, "verify/restructure/apply-tsx.mjs");
  assert.equal(DUAL_FOCAL_AST_FIXTURES.op, "collapse-peer-grids");
  assert.equal(DUAL_FOCAL_AST_FIXTURES.mode, "xor-saved-view");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    DUAL_FOCAL_AST_FIXTURES.tsxBefore,
    DUAL_FOCAL_AST_FIXTURES.tsxAstHard,
    DUAL_FOCAL_AST_FIXTURES.tsxAfter,
    DUAL_FOCAL_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits dualFocalAst for queue/triage jobs", () => {
  const jobs = [
    { job: "work queue triage inbox", category: "queue" },
    { job: "Decide Pursue on the next notice", category: "queue" },
    { job: "approval inbox assign owners", category: "queue" },
    { job: "queue triage dual-focal peer grids collapse-peer-grids", category: "queue" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.dualFocalAst, `${job}: dualFocalAst`);
    assert.equal(rec.dualFocalAst.mode, "tsx-ast", job);
    assert.equal(rec.dualFocalAst.op, "collapse-peer-grids", job);
    assert.equal(rec.dualFocalAst.xorMode, "xor-saved-view", job);
    assert.equal(rec.dualFocalAst.fixtureTsx, DUAL_FOCAL_AST_FIXTURES.tsxBefore, job);
    assert.equal(rec.dualFocalAst.cropAfter, DUAL_FOCAL_AST_FIXTURES.cropAfter, job);
    assert.equal(rec.dualFocalAst.cropPairId, "queue-dual-grid-tsx", job);
    assert.match(rec.dualFocalAst.instruction || "", /apply-tsx|xor-saved-view|FAIL→PASS|collapse-peer-grids/i);
    assert.ok(
      (rec.restructureHints || []).some((h) => /collapse-peer-grids|dual-focal|xor/i.test(h)) ||
        rec.xorSavedView,
      `${job}: restructureHints or xorSavedView still name dual-grid`,
    );
    const direct = dualFocalAstForQueueJob(job, { category });
    assert.equal(direct.fixtureTsx, DUAL_FOCAL_AST_FIXTURES.tsxBefore);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /dualFocalAst/);
    }
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.dualFocalAst, null, "settings/form job must not bind dual-focal AST fixture");
});

bite("denoise packet binds dualFocalAst + DDR collapse-peer-grids", () => {
  const packet = createDesignPacket({
    job: "Queue triage: collapse peer grids via TSX AST XOR",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.dualFocalAst?.fixtureTsx);
  assert.equal(packet.recommendation.dualFocalAst.fixtureTsx, DUAL_FOCAL_AST_FIXTURES.tsxBefore);
  assert.match(packet.dualFocalAst.fixtureTsx, /queue-dual-grid\.tsx$/);
  assert.match(packet.dualFocalAst.fixtureTsxAst, /queue-dual-grid-ast\.tsx$/);
  assert.match(packet.dualFocalAst.cropBefore, /queue-dual-grid-tsx-before-crop\.html$/);
  assert.match(packet.dualFocalAst.cropAfter, /queue-dual-grid-tsx-after-crop\.html$/);
  assert.match(packet.dualFocalAst.helper, /apply-tsx\.mjs$/);
  assert.equal(packet.dualFocalAst.mode, "tsx-ast");
  assert.equal(packet.dualFocalAst.op, "collapse-peer-grids");
  assert.equal(packet.dualFocalAst.xorMode, "xor-saved-view");
  assert.match(packet.recommendation.instruction || "", /dualFocalAst/);
  assert.equal(packet.ddr.restructureVsRepaint, "restructure");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("collapse-peer-grids"),
    `DDR ops missing collapse-peer-grids: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST collapse-peer-grids folds expression + role=grid peers (regex-unsafe)", () => {
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /collapsePeerGridsTsx|collectPeerGridWraps/);
  assert.match(applyTsxSrc, /data-shine-xor-views/);

  const hard = readFileSync(join(ROOT, DUAL_FOCAL_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countPeerGridsTsx(hard);
  assert.ok(before.grids >= 2, `hard fixture grids≥2, got ${before.grids}: ${before.titles.join(",")}`);
  assert.match(hard, /className=\{\s*["']grid-wrap["']\s*\}/);
  assert.match(hard, /role=\{\s*["']grid["']\s*\}/);
  assert.match(hard, /data-grid-title=\{\s*["']David/);

  const afterSrc = collapsePeerGridsTsx(hard, {
    keepTitleIncludes: ["Queue"],
    foldTitleIncludes: ["David"],
    mode: "xor-saved-view",
  });
  const after = countPeerGridsTsx(afterSrc);
  assert.equal(after.grids, 1, `after grids must be 1, got ${after.grids}: ${after.titles.join(",")}`);
  assert.match(afterSrc, /data-shine-xor-views/);
  assert.match(afterSrc, /data-shine-xor-from-peer=/);
  assert.match(afterSrc, /data-region="focal"/);
  assert.match(afterSrc, /data-shine-shared-grid/);
  // Expression forms preserved on kept wrap / grid
  assert.match(afterSrc, /className=\{\s*["']grid-wrap["']\s*\}/);
  assert.match(afterSrc, /role=\{\s*["']grid["']\s*\}/);
  // Peer David wrap gone; chip carries title (AST census = 1; comment may still mention role={"grid"})
  assert.ok(!/data-grid-title=\{\s*["']David/.test(afterSrc), "folded peer data-grid-title must be removed");
  assert.ok(!/<DataGrid[\s\S]*David|David[\s\S]*<DataGrid/.test(afterSrc), "folded DataGrid peer must be gone");
  assert.match(afterSrc, /data-shine-xor-from-peer="David/);

  // Golden simple fixture still works via plan apply
  const dual = readFileSync(join(ROOT, DUAL_FOCAL_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Collapse peer grids",
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
  const result = applyTsxRestructure(dual, plan);
  assert.ok(result.applied.includes("collapse-peer-grids"));
  assert.equal(countPeerGridsTsx(result.source).grids, 1);
  assert.match(result.source, /data-shine-xor-views/);
});

bite("FAIL→PASS crop pair self-contained (queue-dual-grid-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-dual-grid-tsx");
  assert.ok(pair, "queue-dual-grid-tsx crop pair");
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
  assert.ok((before.match(/role=["']grid["']/gi) || []).length >= 2, "before ≥2 grids");
  assert.match(after, /data-shine-xor-views/);
  assert.match(after, /data-shine-tsx-ast="after"/);
  assert.equal((after.match(/role=["']grid["']/gi) || []).length, 1, "after exactly 1 grid");
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /dual-focal-ast-bite\.mjs/);
  assert.match(pkg, /dual-focal-ast-bite/);
  assert.match(pkg, /"restructure:tsx"/);
});

console.log(`dual-focal-ast-bite.mjs: ok (${passed} bites)`);
