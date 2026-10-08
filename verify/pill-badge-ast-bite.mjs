#!/usr/bin/env node
/**
 * Doctor bite — pill-filter badge/chip TSX AST deepen: recommend → packet bind →
 * AST pill-collapse → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  PILL_BADGE_AST_FIXTURES,
  recommendPattern,
  pillBadgeAstForQueueJob,
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
  pillCollapseTsx,
  countFilterPillsTsx,
} from "./restructure/apply-tsx.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RECEIPTS = join(ROOT, "verify/fixtures/denoise/receipts");
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
  assert.equal(PILL_BADGE_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-pill-badge.tsx");
  assert.equal(PILL_BADGE_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-pill-badge-ast.tsx");
  assert.equal(PILL_BADGE_AST_FIXTURES.cropPairId, "queue-pill-badge-tsx");
  assert.equal(PILL_BADGE_AST_FIXTURES.op, "pill-collapse");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    PILL_BADGE_AST_FIXTURES.tsxBefore,
    PILL_BADGE_AST_FIXTURES.tsxAstHard,
    PILL_BADGE_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits pillBadgeAst for Operate jobs", () => {
  for (const job of ["queue triage pill-badge chip filter", "queue badge-spam pill-collapse"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.pillBadgeAst, `${job}: pillBadgeAst`);
    assert.equal(rec.pillBadgeAst.op, "pill-collapse", job);
    assert.equal(
      pillBadgeAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      PILL_BADGE_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /pillBadgeAst/);
  }
});

bite("denoise packet binds pillBadgeAst + DDR pill-collapse", () => {
  const packet = createDesignPacket({
    job: "Queue triage: collapse badge/chip filters via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.pillBadgeAst?.fixtureTsx);
  assert.match(packet.pillBadgeAst.fixtureTsx, /queue-pill-badge\.tsx$/);
  assert.equal(packet.pillBadgeAst.op, "pill-collapse");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("pill-collapse"),
    `DDR ops missing pill-collapse: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST pill-collapse clears badge/chip hosts", () => {
  assert.match(applyTsxSrc, /data-slot|Chip|isFilterPillOpening/);
  const hard = readFileSync(join(ROOT, PILL_BADGE_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countFilterPillsTsx(hard);
  assert.ok(before.pills >= 5, `hard pills≥5, got ${before.pills}`);
  const afterSrc = pillCollapseTsx(hard);
  assert.ok(countFilterPillsTsx(afterSrc).pills <= 3);
  assert.match(afterSrc, /data-shine-pill-rest/);

  const soup = readFileSync(join(ROOT, PILL_BADGE_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Collapse badge filters",
    category: "queue",
    ops: [{ op: "pill-collapse", maxVisible: 3 }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("pill-collapse"));
  assert.match(result.source, /data-shine-pill-rest/);
});

bite("FAIL→PASS crop pair self-contained (queue-pill-badge-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-pill-badge-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /pill-badge-ast-bite\.mjs/);
  assert.match(pkg, /pill-badge:ast-bite/);
});

console.log(`pill-badge-ast-bite.mjs: ok (${passed} bites)`);
