#!/usr/bin/env node
/**
 * Doctor bite — decorative-chart-no-units TSX AST deepen: recommend → packet bind →
 * AST stamp-chart-units → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  DECORATIVE_CHART_AST_FIXTURES,
  recommendPattern,
  decorativeChartAstForQueueJob,
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
  stampChartUnitsTsx,
  countDecorativeChartTsx,
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
  assert.equal(DECORATIVE_CHART_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-decorative-chart.tsx");
  assert.equal(DECORATIVE_CHART_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-decorative-chart-ast.tsx");
  assert.equal(DECORATIVE_CHART_AST_FIXTURES.cropPairId, "queue-decorative-chart-tsx");
  assert.equal(DECORATIVE_CHART_AST_FIXTURES.op, "stamp-chart-units");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    DECORATIVE_CHART_AST_FIXTURES.tsxBefore,
    DECORATIVE_CHART_AST_FIXTURES.tsxAstHard,
    DECORATIVE_CHART_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits decorativeChartAst for queue jobs", () => {
  for (const job of ["queue triage decorative chart no units", "queue stamp-chart-units activity chart"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.decorativeChartAst, `${job}: decorativeChartAst`);
    assert.equal(rec.decorativeChartAst.op, "stamp-chart-units", job);
    assert.ok((rec.restructureHints || []).some((h) => /stamp-chart-units/i.test(h)), job);
    assert.equal(
      decorativeChartAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      DECORATIVE_CHART_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /decorativeChartAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.decorativeChartAst, null, "settings/form must not bind decorative-chart AST");
});

bite("denoise packet binds decorativeChartAst + DDR stamp-chart-units", () => {
  const packet = createDesignPacket({
    job: "Queue triage: stamp chart units via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.decorativeChartAst?.fixtureTsx);
  assert.match(packet.decorativeChartAst.fixtureTsx, /queue-decorative-chart\.tsx$/);
  assert.equal(packet.decorativeChartAst.op, "stamp-chart-units");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("stamp-chart-units"),
    `DDR ops missing stamp-chart-units: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST stamp-chart-units stamps unit + baseline", () => {
  assert.match(applyTsxSrc, /stampChartUnitsTsx|countDecorativeChartTsx/);
  const hard = readFileSync(join(ROOT, DECORATIVE_CHART_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countDecorativeChartTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = stampChartUnitsTsx(hard);
  assert.equal(countDecorativeChartTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-unit=["']count["']/);
  assert.match(afterSrc, /data-shine-chart-stamped/);
  assert.match(afterSrc, /data-shine-chart-legend/);

  const soup = readFileSync(join(ROOT, DECORATIVE_CHART_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Stamp chart units",
    category: "queue",
    ops: [{ op: "stamp-chart-units" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("stamp-chart-units"));
  assert.match(result.source, /data-unit=["']count["']/);
});

bite("FAIL→PASS crop pair self-contained (queue-decorative-chart-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-decorative-chart-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /stamp-chart-units-ast-bite\.mjs/);
  assert.match(pkg, /stamp-chart-units:ast-bite/);
});

console.log(`stamp-chart-units-ast-bite.mjs: ok (${passed} bites)`);
