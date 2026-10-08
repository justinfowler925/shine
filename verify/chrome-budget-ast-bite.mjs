#!/usr/bin/env node
/**
 * Doctor bite — dual-chrome-actions TSX AST deepen: recommend → packet bind →
 * AST chrome-budget (maxFilledChrome=0) → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  CHROME_PRESSURE_AST_FIXTURES,
  recommendPattern,
  chromePressureAstForQueueJob,
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
  chromeBudgetTsx,
  countChromeFilledButtonsTsx,
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
  assert.equal(CHROME_PRESSURE_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-chrome-actions.tsx");
  assert.equal(CHROME_PRESSURE_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-chrome-actions-ast.tsx");
  assert.equal(CHROME_PRESSURE_AST_FIXTURES.cropPairId, "queue-chrome-tsx");
  assert.equal(CHROME_PRESSURE_AST_FIXTURES.op, "chrome-budget");
  assert.equal(CHROME_PRESSURE_AST_FIXTURES.maxFilledChrome, 0);
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    CHROME_PRESSURE_AST_FIXTURES.tsxBefore,
    CHROME_PRESSURE_AST_FIXTURES.tsxAstHard,
    CHROME_PRESSURE_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits chromePressureAst for queue jobs", () => {
  for (const job of ["work queue triage inbox", "queue chrome-budget nav chrome Export New"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.chromePressureAst, `${job}: chromePressureAst`);
    assert.equal(rec.chromePressureAst.op, "chrome-budget", job);
    assert.equal(rec.chromePressureAst.maxFilledChrome, 0, job);
    assert.ok((rec.restructureHints || []).some((h) => /chrome-budget/i.test(h)), job);
    assert.equal(
      chromePressureAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      CHROME_PRESSURE_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /chromePressureAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.chromePressureAst, null, "settings/form must not bind chrome AST");
});

bite("denoise packet binds chromePressureAst + DDR chrome-budget", () => {
  const packet = createDesignPacket({
    job: "Queue triage: demote filled chrome actions via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.chromePressureAst?.fixtureTsx);
  assert.match(packet.chromePressureAst.fixtureTsx, /queue-chrome-actions\.tsx$/);
  assert.equal(packet.chromePressureAst.op, "chrome-budget");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("chrome-budget"),
    `DDR ops missing chrome-budget: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST chrome-budget demotes chrome Buttons; keeps main Pursue", () => {
  assert.match(applyTsxSrc, /chromeBudgetTsx|isChromeHostOpening/);
  const hard = readFileSync(join(ROOT, CHROME_PRESSURE_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countChromeFilledButtonsTsx(hard);
  assert.ok(before.filled >= 3, `hard chrome filled≥3, got ${before.filled}: ${before.labels.join(",")}`);
  const afterSrc = chromeBudgetTsx(hard, { demotePolicy: "outline" });
  assert.equal(countChromeFilledButtonsTsx(afterSrc).filled, 0);
  assert.match(afterSrc, /variant=\{\s*["']outline["']\s*\}/);
  assert.match(afterSrc, /variant="outline"/);
  // Main Pursue stays filled
  assert.match(afterSrc, /variant="default">Pursue|variant=\{\s*["']default["']\s*\}>Pursue|>Pursue</);

  const soup = readFileSync(join(ROOT, CHROME_PRESSURE_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Demote chrome",
    category: "queue",
    ops: [{ op: "chrome-budget", maxFilledChrome: 0, demotePolicy: "outline" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("chrome-budget"));
  assert.equal(countChromeFilledButtonsTsx(result.source).filled, 0);
});

bite("FAIL→PASS crop pair self-contained (queue-chrome-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-chrome-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /chrome-budget-ast-bite\.mjs/);
  assert.match(pkg, /chrome-budget:ast-bite/);
});

console.log(`chrome-budget-ast-bite.mjs: ok (${passed} bites)`);
