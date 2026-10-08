#!/usr/bin/env node
/**
 * Doctor bite — copy missing-page-title TSX AST deepen: recommend → packet bind →
 * AST stamp-page-title → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  STAMP_PAGE_TITLE_AST_FIXTURES,
  recommendPattern,
  stampPageTitleAstForQueueJob,
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
  stampPageTitleTsx,
  countMissingPageTitleTsx,
} from "./restructure/apply-tsx.mjs";
import { buildRestructurePlan, sortRestructureOps, DENOISE_OP_ORDER } from "./restructure/schema.mjs";

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
  assert.equal(STAMP_PAGE_TITLE_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-missing-page-title.tsx");
  assert.equal(STAMP_PAGE_TITLE_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-missing-page-title-ast.tsx");
  assert.equal(STAMP_PAGE_TITLE_AST_FIXTURES.cropPairId, "queue-missing-page-title-tsx");
  assert.equal(STAMP_PAGE_TITLE_AST_FIXTURES.op, "stamp-page-title");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    STAMP_PAGE_TITLE_AST_FIXTURES.tsxBefore,
    STAMP_PAGE_TITLE_AST_FIXTURES.tsxAstHard,
    STAMP_PAGE_TITLE_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits stampPageTitleAst for Operate jobs", () => {
  for (const job of ["queue triage missing-page-title no h1", "queue stamp-page-title empty-h1"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.stampPageTitleAst, `${job}: stampPageTitleAst`);
    assert.equal(rec.stampPageTitleAst.op, "stamp-page-title", job);
    assert.ok((rec.restructureHints || []).some((h) => /stamp-page-title/i.test(h)), job);
    assert.equal(
      stampPageTitleAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      STAMP_PAGE_TITLE_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /stampPageTitleAst/);
  }
});

bite("denoise packet binds stampPageTitleAst + DDR stamp-page-title", () => {
  const packet = createDesignPacket({
    job: "Queue triage: stamp missing page title via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.stampPageTitleAst?.fixtureTsx);
  assert.match(packet.stampPageTitleAst.fixtureTsx, /queue-missing-page-title\.tsx$/);
  assert.equal(packet.stampPageTitleAst.op, "stamp-page-title");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("stamp-page-title"),
    `DDR ops missing stamp-page-title: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST stamp-page-title fills empty / missing h1", () => {
  assert.match(applyTsxSrc, /stampPageTitleTsx|countMissingPageTitleTsx/);
  const hard = readFileSync(join(ROOT, STAMP_PAGE_TITLE_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countMissingPageTitleTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = stampPageTitleTsx(hard, { title: "Queue" });
  assert.equal(countMissingPageTitleTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-shine-page-title-stamped/);
  assert.match(afterSrc, /Queue/);

  const soup = readFileSync(join(ROOT, STAMP_PAGE_TITLE_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Stamp page title",
    category: "queue",
    ops: [{ op: "stamp-page-title", title: "Queue" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("stamp-page-title"));
  assert.match(result.source, /<h1\b/);
});

bite("stamp-page-title sorts before title-singular", () => {
  const ordered = sortRestructureOps([
    { op: "title-singular" },
    { op: "stamp-page-title" },
  ]).map((o) => o.op);
  assert.deepEqual(ordered, ["stamp-page-title", "title-singular"]);
  assert.ok(DENOISE_OP_ORDER.indexOf("stamp-page-title") < DENOISE_OP_ORDER.indexOf("title-singular"));
});

bite("FAIL→PASS crop pair self-contained (queue-missing-page-title-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-missing-page-title-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /stamp-page-title-ast-bite\.mjs/);
  assert.match(pkg, /stamp-page-title:ast-bite/);
});

console.log(`stamp-page-title-ast-bite.mjs: ok (${passed} bites)`);
