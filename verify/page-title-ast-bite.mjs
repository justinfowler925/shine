#!/usr/bin/env node
/**
 * Doctor bite — competing-page-titles TSX AST deepen: recommend → packet bind →
 * AST title-singular → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  PAGE_TITLE_AST_FIXTURES,
  recommendPattern,
  pageTitleAstForQueueJob,
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
  titleSingularTsx,
  countPageTitlesTsx,
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
  assert.equal(PAGE_TITLE_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-competing-titles.tsx");
  assert.equal(PAGE_TITLE_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-competing-titles-ast.tsx");
  assert.equal(PAGE_TITLE_AST_FIXTURES.cropAfter, "verify/fixtures/denoise/receipts/queue-titles-tsx-after-crop.html");
  assert.equal(PAGE_TITLE_AST_FIXTURES.cropPairId, "queue-titles-tsx");
  assert.equal(PAGE_TITLE_AST_FIXTURES.op, "title-singular");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    PAGE_TITLE_AST_FIXTURES.tsxBefore,
    PAGE_TITLE_AST_FIXTURES.tsxAstHard,
    PAGE_TITLE_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits pageTitleAst for Operate jobs", () => {
  for (const job of [
    "work queue triage inbox",
    "queue competing page titles title-singular",
    "account settings preferences page title stack",
  ]) {
    const category = /settings/.test(job) ? "form" : "queue";
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.pageTitleAst, `${job}: pageTitleAst`);
    assert.equal(rec.pageTitleAst.op, "title-singular", job);
    assert.equal(rec.pageTitleAst.cropPairId, "queue-titles-tsx", job);
    assert.match(rec.pageTitleAst.instruction || "", /title-singular|FAIL→PASS/i);
    assert.equal(pageTitleAstForQueueJob(job, { category }).fixtureTsx, PAGE_TITLE_AST_FIXTURES.tsxBefore);
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /pageTitleAst/);
  }
});

bite("denoise packet binds pageTitleAst + DDR title-singular", () => {
  const packet = createDesignPacket({
    job: "Queue triage: singularize competing page titles via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.pageTitleAst?.fixtureTsx);
  assert.match(packet.pageTitleAst.fixtureTsx, /queue-competing-titles\.tsx$/);
  assert.match(packet.pageTitleAst.cropAfter, /queue-titles-tsx-after-crop\.html$/);
  assert.equal(packet.pageTitleAst.op, "title-singular");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("title-singular"),
    `DDR ops missing title-singular: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST title-singular demotes expression page-title peers", () => {
  assert.match(applyTsxSrc, /titleSingularTsx|isPageTitleOpening/);
  assert.match(applyTsxSrc, /data-shine-title-demoted/);

  const hard = readFileSync(join(ROOT, PAGE_TITLE_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countPageTitlesTsx(hard);
  assert.ok(before.titles >= 3, `hard fixture titles≥3, got ${before.titles}: ${before.texts.join(",")}`);
  assert.match(hard, /data-page-title=\{\s*["']Triage inbox["']\s*\}/);
  assert.match(hard, /className=\{\s*["']page-title["']\s*\}/);

  const afterSrc = titleSingularTsx(hard, {});
  const after = countPageTitlesTsx(afterSrc);
  assert.equal(after.titles, 1, `after titles must be 1, got ${after.titles}: ${after.texts.join(",")}`);
  assert.match(afterSrc, /data-shine-title-demoted/);
  assert.match(afterSrc, /className="kicker"/);

  const soup = readFileSync(join(ROOT, PAGE_TITLE_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Singularize titles",
    category: "queue",
    ops: [{ op: "title-singular", demote: "kicker" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("title-singular"));
  assert.equal(countPageTitlesTsx(result.source).titles, 1);
});

bite("FAIL→PASS crop pair self-contained (queue-titles-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-titles-tsx");
  assert.ok(pair, "queue-titles-tsx crop pair");
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => {
    const path = join(RECEIPTS, name);
    assert.ok(existsSync(path), `missing crop ${name}`);
    return readFileSync(path, "utf8");
  };
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.notEqual(read(pair.beforeCrop), read(pair.afterCrop));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /page-title-ast-bite\.mjs/);
  assert.match(pkg, /page-title:ast-bite/);
});

console.log(`page-title-ast-bite.mjs: ok (${passed} bites)`);
