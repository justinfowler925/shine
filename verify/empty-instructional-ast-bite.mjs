#!/usr/bin/env node
/**
 * Doctor bite — copy empty-instructional TSX AST deepen: recommend → packet bind →
 * AST rewrite-filler-empty → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  EMPTY_INSTRUCTIONAL_AST_FIXTURES,
  recommendPattern,
  emptyInstructionalAstForQueueJob,
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
  rewriteFillerEmptyTsx,
  countEmptyInstructionalTsx,
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
  assert.equal(EMPTY_INSTRUCTIONAL_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-empty-instructional.tsx");
  assert.equal(EMPTY_INSTRUCTIONAL_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-empty-instructional-ast.tsx");
  assert.equal(EMPTY_INSTRUCTIONAL_AST_FIXTURES.cropPairId, "queue-empty-instructional-tsx");
  assert.equal(EMPTY_INSTRUCTIONAL_AST_FIXTURES.op, "rewrite-filler-empty");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    EMPTY_INSTRUCTIONAL_AST_FIXTURES.tsxBefore,
    EMPTY_INSTRUCTIONAL_AST_FIXTURES.tsxAstHard,
    EMPTY_INSTRUCTIONAL_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits emptyInstructionalAst for Operate jobs", () => {
  for (const job of ["queue triage empty-instructional no data", "queue blank empty rewrite-filler"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.emptyInstructionalAst, `${job}: emptyInstructionalAst`);
    assert.equal(rec.emptyInstructionalAst.op, "rewrite-filler-empty", job);
    assert.equal(
      emptyInstructionalAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      EMPTY_INSTRUCTIONAL_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /emptyInstructionalAst/);
  }
});

bite("denoise packet binds emptyInstructionalAst + DDR rewrite-filler-empty", () => {
  const packet = createDesignPacket({
    job: "Queue triage: rewrite empty-instructional via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.emptyInstructionalAst?.fixtureTsx);
  assert.match(packet.emptyInstructionalAst.fixtureTsx, /queue-empty-instructional\.tsx$/);
  assert.equal(packet.emptyInstructionalAst.op, "rewrite-filler-empty");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("rewrite-filler-empty"),
    `DDR ops missing rewrite-filler-empty: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST rewrite-filler-empty clears blank/stub empty hosts", () => {
  assert.match(applyTsxSrc, /countEmptyInstructionalTsx|EMPTY_INSTRUCTIONAL/);
  const hard = readFileSync(join(ROOT, EMPTY_INSTRUCTIONAL_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countEmptyInstructionalTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = rewriteFillerEmptyTsx(hard);
  assert.equal(countEmptyInstructionalTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-shine-empty-rewritten/);
  assert.match(afterSrc, /No notices match this view/);

  const soup = readFileSync(join(ROOT, EMPTY_INSTRUCTIONAL_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Rewrite empty instructional",
    category: "queue",
    ops: [{ op: "rewrite-filler-empty" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("rewrite-filler-empty"));
  assert.match(result.source, /data-shine-empty-rewritten/);
});

bite("FAIL→PASS crop pair self-contained (queue-empty-instructional-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-empty-instructional-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /empty-instructional-ast-bite\.mjs/);
  assert.match(pkg, /empty-instructional:ast-bite/);
});

console.log(`empty-instructional-ast-bite.mjs: ok (${passed} bites)`);
