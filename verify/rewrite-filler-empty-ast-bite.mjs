#!/usr/bin/env node
/**
 * Doctor bite — filler-empty-copy TSX AST deepen: recommend → packet bind →
 * AST rewrite-filler-empty → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  FILLER_EMPTY_AST_FIXTURES,
  recommendPattern,
  fillerEmptyAstForQueueJob,
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
  countFillerEmptyTsx,
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
  assert.equal(FILLER_EMPTY_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-filler-empty.tsx");
  assert.equal(FILLER_EMPTY_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-filler-empty-ast.tsx");
  assert.equal(FILLER_EMPTY_AST_FIXTURES.cropPairId, "queue-filler-empty-tsx");
  assert.equal(FILLER_EMPTY_AST_FIXTURES.op, "rewrite-filler-empty");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    FILLER_EMPTY_AST_FIXTURES.tsxBefore,
    FILLER_EMPTY_AST_FIXTURES.tsxAstHard,
    FILLER_EMPTY_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits fillerEmptyAst for queue jobs", () => {
  for (const job of ["work queue triage inbox", "queue rewrite-filler-empty welcome dashboard"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.fillerEmptyAst, `${job}: fillerEmptyAst`);
    assert.equal(rec.fillerEmptyAst.op, "rewrite-filler-empty", job);
    assert.ok((rec.restructureHints || []).some((h) => /rewrite-filler-empty/i.test(h)), job);
    assert.equal(
      fillerEmptyAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      FILLER_EMPTY_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /fillerEmptyAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.fillerEmptyAst, null, "settings/form must not bind filler AST");
});

bite("denoise packet binds fillerEmptyAst + DDR rewrite-filler-empty", () => {
  const packet = createDesignPacket({
    job: "Queue triage: rewrite filler empty copy via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.fillerEmptyAst?.fixtureTsx);
  assert.match(packet.fillerEmptyAst.fixtureTsx, /queue-filler-empty\.tsx$/);
  assert.equal(packet.fillerEmptyAst.op, "rewrite-filler-empty");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("rewrite-filler-empty"),
    `DDR ops missing rewrite-filler-empty: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST rewrite-filler-empty replaces filler phrases", () => {
  assert.match(applyTsxSrc, /rewriteFillerEmptyTsx|countFillerEmptyTsx/);
  const hard = readFileSync(join(ROOT, FILLER_EMPTY_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countFillerEmptyTsx(hard);
  assert.ok(before.hits >= 2, `hard hits≥2, got ${before.hits}`);
  const afterSrc = rewriteFillerEmptyTsx(hard);
  assert.equal(countFillerEmptyTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-shine-empty-rewritten/);
  assert.match(afterSrc, /No notices match this view/);

  const soup = readFileSync(join(ROOT, FILLER_EMPTY_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Rewrite filler",
    category: "queue",
    ops: [{ op: "rewrite-filler-empty" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("rewrite-filler-empty"));
  assert.equal(countFillerEmptyTsx(result.source).hits, 0);
});

bite("FAIL→PASS crop pair self-contained (queue-filler-empty-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-filler-empty-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /rewrite-filler-empty-ast-bite\.mjs/);
  assert.match(pkg, /rewrite-filler-empty:ast-bite/);
});

console.log(`rewrite-filler-empty-ast-bite.mjs: ok (${passed} bites)`);
