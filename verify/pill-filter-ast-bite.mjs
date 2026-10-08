#!/usr/bin/env node
/**
 * Doctor bite — pill-filter-stack TSX AST deepen: recommend → packet bind →
 * AST pill-collapse (maxVisible=3) → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  PILL_FILTER_AST_FIXTURES,
  recommendPattern,
  pillFilterAstForQueueJob,
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
  assert.equal(PILL_FILTER_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-pill-stack.tsx");
  assert.equal(PILL_FILTER_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-pill-stack-ast.tsx");
  assert.equal(PILL_FILTER_AST_FIXTURES.cropAfter, "verify/fixtures/denoise/receipts/queue-pill-tsx-after-crop.html");
  assert.equal(PILL_FILTER_AST_FIXTURES.cropPairId, "queue-pill-tsx");
  assert.equal(PILL_FILTER_AST_FIXTURES.maxVisible, 3);
  assert.equal(PILL_FILTER_AST_FIXTURES.op, "pill-collapse");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    PILL_FILTER_AST_FIXTURES.tsxBefore,
    PILL_FILTER_AST_FIXTURES.tsxAstHard,
    PILL_FILTER_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits pillFilterAst for queue/triage jobs", () => {
  for (const job of [
    "work queue triage inbox",
    "Decide Pursue on the next notice",
    "queue triage pill filter stack pill-collapse",
  ]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.pillFilterAst, `${job}: pillFilterAst`);
    assert.equal(rec.pillFilterAst.op, "pill-collapse", job);
    assert.equal(rec.pillFilterAst.maxVisible, 3, job);
    assert.equal(rec.pillFilterAst.cropPairId, "queue-pill-tsx", job);
    assert.match(rec.pillFilterAst.instruction || "", /pill-collapse|FAIL→PASS/i);
    assert.ok((rec.restructureHints || []).some((h) => /pill-collapse/i.test(h)), job);
    assert.equal(pillFilterAstForQueueJob(job, { category: "queue" }).fixtureTsx, PILL_FILTER_AST_FIXTURES.tsxBefore);
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /pillFilterAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  // settings still gets pageTitleAst; pillFilterAst should be null for pure form without queue language
  assert.equal(settings.pillFilterAst, null, "settings/form job must not bind pill AST fixture");
});

bite("denoise packet binds pillFilterAst + DDR pill-collapse", () => {
  const packet = createDesignPacket({
    job: "Queue triage: collapse pill filter stack via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.pillFilterAst?.fixtureTsx);
  assert.match(packet.pillFilterAst.fixtureTsx, /queue-pill-stack\.tsx$/);
  assert.match(packet.pillFilterAst.cropAfter, /queue-pill-tsx-after-crop\.html$/);
  assert.equal(packet.pillFilterAst.op, "pill-collapse");
  assert.equal(packet.pillFilterAst.maxVisible, 3);
  assert.ok(
    (packet.ddr.restructureOps || []).includes("pill-collapse"),
    `DDR ops missing pill-collapse: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST pill-collapse wraps expression + Badge pills", () => {
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /pillCollapseTsx|isFilterPillOpening/);
  assert.match(applyTsxSrc, /data-shine-pill-rest/);

  const hard = readFileSync(join(ROOT, PILL_FILTER_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countFilterPillsTsx(hard);
  assert.ok(before.pills >= 6, `hard fixture pills≥6, got ${before.pills}: ${before.labels.join(",")}`);
  assert.match(hard, /className=\{\s*["']filter-pills["']\s*\}/);
  assert.match(hard, /className=\{\s*["']pill["']\s*\}/);

  const afterSrc = pillCollapseTsx(hard, { maxVisible: 3 });
  const after = countFilterPillsTsx(afterSrc);
  assert.equal(after.pills, 3, `after visible pills must be 3, got ${after.pills}: ${after.labels.join(",")}`);
  assert.match(afterSrc, /data-shine-pill-rest/);
  assert.match(afterSrc, /More filters/);

  const soup = readFileSync(join(ROOT, PILL_FILTER_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Collapse pill stack",
    category: "queue",
    ops: [{ op: "pill-collapse", maxVisible: 3, rest: "details" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("pill-collapse"));
  assert.equal(countFilterPillsTsx(result.source).pills, 3);
});

bite("FAIL→PASS crop pair self-contained (queue-pill-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-pill-tsx");
  assert.ok(pair, "queue-pill-tsx crop pair");
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
  assert.match(doctorSrc, /pill-filter-ast-bite\.mjs/);
  assert.match(pkg, /pill-filter:ast-bite/);
});

console.log(`pill-filter-ast-bite.mjs: ok (${passed} bites)`);
