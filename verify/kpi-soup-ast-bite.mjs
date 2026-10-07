#!/usr/bin/env node
/**
 * Doctor bite — KPI soup TSX AST deepen: recommend → packet bind →
 * AST kpi-collapse (maxVisible=3) → FAIL→PASS crop.
 * Mirrors cta-pressure-ast-bite (#173): typed fixture on denoise recommend,
 * packet.kpiSoupAst paths, DDR kpi-collapse, self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  KPI_SOUP_AST_FIXTURES,
  recommendPattern,
  kpiSoupAstForQueueJob,
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
  kpiCollapseTsx,
  countMetricTilesTsx,
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
  assert.equal(KPI_SOUP_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-kpi-soup.tsx");
  assert.equal(KPI_SOUP_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-kpi-soup-ast.tsx");
  assert.equal(KPI_SOUP_AST_FIXTURES.cropAfter, "verify/fixtures/denoise/receipts/queue-kpi-tsx-after-crop.html");
  assert.equal(KPI_SOUP_AST_FIXTURES.cropPairId, "queue-kpi-tsx");
  assert.equal(KPI_SOUP_AST_FIXTURES.helper, "verify/restructure/apply-tsx.mjs");
  assert.equal(KPI_SOUP_AST_FIXTURES.maxVisible, 3);
  assert.equal(KPI_SOUP_AST_FIXTURES.op, "kpi-collapse");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    KPI_SOUP_AST_FIXTURES.tsxBefore,
    KPI_SOUP_AST_FIXTURES.tsxAstHard,
    KPI_SOUP_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits kpiSoupAst for queue/triage jobs", () => {
  const jobs = [
    { job: "work queue triage inbox", category: "queue" },
    { job: "Decide Pursue on the next notice", category: "queue" },
    { job: "approval inbox assign owners", category: "queue" },
    { job: "queue triage KPI soup metric tiles kpi-collapse", category: "queue" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.kpiSoupAst, `${job}: kpiSoupAst`);
    assert.equal(rec.kpiSoupAst.mode, "tsx-ast", job);
    assert.equal(rec.kpiSoupAst.op, "kpi-collapse", job);
    assert.equal(rec.kpiSoupAst.maxVisible, 3, job);
    assert.equal(rec.kpiSoupAst.fixtureTsx, KPI_SOUP_AST_FIXTURES.tsxBefore, job);
    assert.equal(rec.kpiSoupAst.cropAfter, KPI_SOUP_AST_FIXTURES.cropAfter, job);
    assert.equal(rec.kpiSoupAst.cropPairId, "queue-kpi-tsx", job);
    assert.match(rec.kpiSoupAst.instruction || "", /apply-tsx|maxVisible|FAIL→PASS|kpi-collapse/i);
    assert.ok(
      (rec.restructureHints || []).some((h) => /kpi-collapse/i.test(h)),
      `${job}: restructureHints still name kpi-collapse`,
    );
    const direct = kpiSoupAstForQueueJob(job, { category });
    assert.equal(direct.fixtureTsx, KPI_SOUP_AST_FIXTURES.tsxBefore);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /kpiSoupAst/);
    }
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.kpiSoupAst, null, "settings/form job must not bind KPI AST fixture");
});

bite("denoise packet binds kpiSoupAst + DDR kpi-collapse", () => {
  const packet = createDesignPacket({
    job: "Queue triage: collapse KPI encyclopedia via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.kpiSoupAst?.fixtureTsx);
  assert.equal(packet.recommendation.kpiSoupAst.fixtureTsx, KPI_SOUP_AST_FIXTURES.tsxBefore);
  assert.match(packet.kpiSoupAst.fixtureTsx, /queue-kpi-soup\.tsx$/);
  assert.match(packet.kpiSoupAst.fixtureTsxAst, /queue-kpi-soup-ast\.tsx$/);
  assert.match(packet.kpiSoupAst.cropBefore, /queue-kpi-tsx-before-crop\.html$/);
  assert.match(packet.kpiSoupAst.cropAfter, /queue-kpi-tsx-after-crop\.html$/);
  assert.match(packet.kpiSoupAst.helper, /apply-tsx\.mjs$/);
  assert.equal(packet.kpiSoupAst.mode, "tsx-ast");
  assert.equal(packet.kpiSoupAst.op, "kpi-collapse");
  assert.equal(packet.kpiSoupAst.maxVisible, 3);
  assert.match(packet.recommendation.instruction || "", /kpiSoupAst/);
  assert.equal(packet.ddr.restructureVsRepaint, "restructure");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("kpi-collapse"),
    `DDR ops missing kpi-collapse: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST kpi-collapse wraps expression + data-shine-kpi (regex-unsafe)", () => {
  // Prove transform uses TypeScript AST — not only /className=["']metric["']/.
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /kpiCollapseTsx|isMetricTileOpening/);
  assert.match(applyTsxSrc, /data-shine-kpi-rest/);

  const hard = readFileSync(join(ROOT, KPI_SOUP_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countMetricTilesTsx(hard);
  assert.ok(before.tiles >= 6, `hard fixture tiles≥6, got ${before.tiles}: ${before.labels.join(",")}`);
  assert.match(hard, /className=\{\s*["']metrics["']\s*\}/);
  assert.match(hard, /className=\{\s*["']metric["']\s*\}/);
  assert.match(hard, /data-shine-kpi/);

  const afterSrc = kpiCollapseTsx(hard, { maxVisible: 3 });
  const after = countMetricTilesTsx(afterSrc);
  assert.equal(after.tiles, 3, `after visible tiles must be 3, got ${after.tiles}: ${after.labels.join(",")}`);
  assert.match(afterSrc, /data-shine-kpi-rest/);
  assert.match(afterSrc, /More metrics/);
  // Expression forms preserved on visible + container
  assert.match(afterSrc, /className=\{\s*["']metrics["']\s*\}/);
  assert.match(afterSrc, /className=\{\s*["']metric["']\s*\}/);
  assert.match(afterSrc, /data-shine-kpi/);
  // Rest parked inside details
  assert.match(afterSrc, /<details data-shine-kpi-rest>[\s\S]*data-kpi="Due soon"/);
  assert.match(afterSrc, /<details data-shine-kpi-rest>[\s\S]*data-kpi="Missed"/);

  // Golden simple fixture still works via plan apply
  const soup = readFileSync(join(ROOT, KPI_SOUP_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Collapse KPI soup",
    category: "queue",
    ops: [{ op: "kpi-collapse", maxVisible: 3, rest: "details" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("kpi-collapse"));
  assert.equal(countMetricTilesTsx(result.source).tiles, 3);
  assert.match(result.source, /data-shine-kpi-rest/);
});

bite("FAIL→PASS crop pair self-contained (queue-kpi-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-kpi-tsx");
  assert.ok(pair, "queue-kpi-tsx crop pair");
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
  assert.ok((before.match(/data-kpi=/g) || []).length >= 8, "before ≥8 kpi tiles");
  assert.match(after, /data-shine-kpi-rest/);
  assert.match(after, /data-shine-tsx-ast="after"/);
  const afterVisible = after.replace(/<details[\s\S]*?<\/details>/gi, "");
  assert.ok((afterVisible.match(/data-kpi=/g) || []).length <= 3, "after ≤3 visible");
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /kpi-soup-ast-bite\.mjs/);
  assert.match(pkg, /kpi-soup-ast-bite/);
  assert.match(pkg, /"restructure:tsx"/);
});

console.log(`kpi-soup-ast-bite.mjs: ok (${passed} bites)`);
