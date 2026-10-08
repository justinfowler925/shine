#!/usr/bin/env node
/**
 * Doctor bite — copy blank-cta TSX AST deepen: recommend → packet bind →
 * AST name-controls → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  BLANK_CTA_AST_FIXTURES,
  recommendPattern,
  blankCtaAstForQueueJob,
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
  nameControlsTsx,
  countBlankCtaTsx,
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
  assert.equal(BLANK_CTA_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-blank-cta.tsx");
  assert.equal(BLANK_CTA_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-blank-cta-ast.tsx");
  assert.equal(BLANK_CTA_AST_FIXTURES.cropPairId, "queue-blank-cta-tsx");
  assert.equal(BLANK_CTA_AST_FIXTURES.op, "name-controls");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    BLANK_CTA_AST_FIXTURES.tsxBefore,
    BLANK_CTA_AST_FIXTURES.tsxAstHard,
    BLANK_CTA_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits blankCtaAst for Operate jobs", () => {
  for (const job of ["queue triage blank-cta nameless button", "queue name-controls blank cta"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.blankCtaAst, `${job}: blankCtaAst`);
    assert.equal(rec.blankCtaAst.op, "name-controls", job);
    assert.equal(
      blankCtaAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      BLANK_CTA_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /blankCtaAst/);
  }
});

bite("denoise packet binds blankCtaAst + DDR name-controls", () => {
  const packet = createDesignPacket({
    job: "Queue triage: name blank CTAs via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.blankCtaAst?.fixtureTsx);
  assert.match(packet.blankCtaAst.fixtureTsx, /queue-blank-cta\.tsx$/);
  assert.equal(packet.blankCtaAst.op, "name-controls");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("name-controls"),
    `DDR ops missing name-controls: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST name-controls clears blank CTAs", () => {
  assert.match(applyTsxSrc, /countBlankCtaTsx|data-shine-blank-cta/);
  const hard = readFileSync(join(ROOT, BLANK_CTA_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countBlankCtaTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = nameControlsTsx(hard);
  assert.equal(countBlankCtaTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-shine-blank-cta/);
  assert.match(afterSrc, /aria-label=["']Pursue["']/);

  const soup = readFileSync(join(ROOT, BLANK_CTA_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Name blank CTAs",
    category: "queue",
    ops: [{ op: "name-controls" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("name-controls"));
  assert.match(result.source, /data-shine-blank-cta/);
});

bite("FAIL→PASS crop pair self-contained (queue-blank-cta-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-blank-cta-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /blank-cta-ast-bite\.mjs/);
  assert.match(pkg, /blank-cta:ast-bite/);
});

console.log(`blank-cta-ast-bite.mjs: ok (${passed} bites)`);
