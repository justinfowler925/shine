#!/usr/bin/env node
/**
 * Doctor bite — irreversible-filters TSX AST deepen: recommend → packet bind →
 * AST filter-clearable → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  FILTER_REVERSIBLE_AST_FIXTURES,
  recommendPattern,
  filterReversibleAstForQueueJob,
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
  filterClearableTsx,
  countIrreversibleFiltersTsx,
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
  assert.equal(FILTER_REVERSIBLE_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-irreversible-filters.tsx");
  assert.equal(FILTER_REVERSIBLE_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-irreversible-filters-ast.tsx");
  assert.equal(FILTER_REVERSIBLE_AST_FIXTURES.cropPairId, "queue-filters-tsx");
  assert.equal(FILTER_REVERSIBLE_AST_FIXTURES.op, "filter-clearable");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    FILTER_REVERSIBLE_AST_FIXTURES.tsxBefore,
    FILTER_REVERSIBLE_AST_FIXTURES.tsxAstHard,
    FILTER_REVERSIBLE_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits filterReversibleAst for queue jobs", () => {
  for (const job of ["work queue triage inbox", "queue filter-clearable irreversible filters"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.filterReversibleAst, `${job}: filterReversibleAst`);
    assert.equal(rec.filterReversibleAst.op, "filter-clearable", job);
    assert.ok((rec.restructureHints || []).some((h) => /filter-clearable/i.test(h)), job);
    assert.equal(
      filterReversibleAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      FILTER_REVERSIBLE_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /filterReversibleAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.filterReversibleAst, null, "settings/form must not bind filter AST");
});

bite("denoise packet binds filterReversibleAst + DDR filter-clearable", () => {
  const packet = createDesignPacket({
    job: "Queue triage: make active filters clearable via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.filterReversibleAst?.fixtureTsx);
  assert.match(packet.filterReversibleAst.fixtureTsx, /queue-irreversible-filters\.tsx$/);
  assert.equal(packet.filterReversibleAst.op, "filter-clearable");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("filter-clearable"),
    `DDR ops missing filter-clearable: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST filter-clearable stamps dismiss + clear-all", () => {
  assert.match(applyTsxSrc, /filterClearableTsx|isActiveFilterOpening/);
  const hard = readFileSync(join(ROOT, FILTER_REVERSIBLE_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countIrreversibleFiltersTsx(hard);
  assert.ok(before.irreversible >= 2, `hard irreversible≥2, got ${before.irreversible}`);
  const afterSrc = filterClearableTsx(hard, { perChip: true, clearAll: true });
  assert.equal(countIrreversibleFiltersTsx(afterSrc).irreversible, 0);
  assert.match(afterSrc, /data-shine-filter-dismiss/);
  assert.match(afterSrc, /data-shine-filter-clear-all/);

  const soup = readFileSync(join(ROOT, FILTER_REVERSIBLE_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Clear filters",
    category: "queue",
    ops: [{ op: "filter-clearable", perChip: true, clearAll: true }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("filter-clearable"));
  assert.equal(countIrreversibleFiltersTsx(result.source).irreversible, 0);
});

bite("FAIL→PASS crop pair self-contained (queue-filters-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-filters-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /filter-clearable-ast-bite\.mjs/);
  assert.match(pkg, /filter-clearable:ast-bite/);
});

console.log(`filter-clearable-ast-bite.mjs: ok (${passed} bites)`);
