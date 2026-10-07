#!/usr/bin/env node
/**
 * Doctor bite — CTA pressure TSX AST deepen: recommend → packet bind →
 * AST cta-budget (maxFilled=1) → FAIL→PASS crop.
 * Mirrors xor-saved-view-recommend-bite (#167): typed fixture on denoise recommend,
 * packet.ctaPressureAst paths, DDR cta-budget, self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  CTA_PRESSURE_AST_FIXTURES,
  recommendPattern,
  ctaPressureAstForQueueJob,
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
  ctaBudgetTsx,
  countFilledButtonsTsx,
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
  assert.equal(CTA_PRESSURE_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-dual-cta.tsx");
  assert.equal(CTA_PRESSURE_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-dual-cta-ast.tsx");
  assert.equal(CTA_PRESSURE_AST_FIXTURES.cropAfter, "verify/fixtures/denoise/receipts/queue-cta-tsx-after-crop.html");
  assert.equal(CTA_PRESSURE_AST_FIXTURES.cropPairId, "queue-cta-tsx");
  assert.equal(CTA_PRESSURE_AST_FIXTURES.helper, "verify/restructure/apply-tsx.mjs");
  assert.equal(CTA_PRESSURE_AST_FIXTURES.maxFilled, 1);
  assert.equal(CTA_PRESSURE_AST_FIXTURES.op, "cta-budget");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    CTA_PRESSURE_AST_FIXTURES.tsxBefore,
    CTA_PRESSURE_AST_FIXTURES.tsxAstHard,
    CTA_PRESSURE_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits ctaPressureAst for queue/triage jobs", () => {
  const jobs = [
    { job: "work queue triage inbox", category: "queue" },
    { job: "Decide Pursue on the next notice", category: "queue" },
    { job: "approval inbox assign owners", category: "queue" },
    { job: "queue triage competing filled primary Button TSX cta-budget", category: "queue" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.ctaPressureAst, `${job}: ctaPressureAst`);
    assert.equal(rec.ctaPressureAst.mode, "tsx-ast", job);
    assert.equal(rec.ctaPressureAst.op, "cta-budget", job);
    assert.equal(rec.ctaPressureAst.maxFilled, 1, job);
    assert.equal(rec.ctaPressureAst.fixtureTsx, CTA_PRESSURE_AST_FIXTURES.tsxBefore, job);
    assert.equal(rec.ctaPressureAst.cropAfter, CTA_PRESSURE_AST_FIXTURES.cropAfter, job);
    assert.equal(rec.ctaPressureAst.cropPairId, "queue-cta-tsx", job);
    assert.match(rec.ctaPressureAst.instruction || "", /apply-tsx|maxFilled|FAIL→PASS|cta-budget/i);
    assert.ok(
      (rec.restructureHints || []).some((h) => /cta-budget/i.test(h)),
      `${job}: restructureHints still name cta-budget`,
    );
    const direct = ctaPressureAstForQueueJob(job, { category });
    assert.equal(direct.fixtureTsx, CTA_PRESSURE_AST_FIXTURES.tsxBefore);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /ctaPressureAst/);
    }
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.ctaPressureAst, null, "settings/form job must not bind CTA AST fixture");
});

bite("denoise packet binds ctaPressureAst + DDR cta-budget", () => {
  const packet = createDesignPacket({
    job: "Queue triage: demote competing filled Button primaries via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.ctaPressureAst?.fixtureTsx);
  assert.equal(packet.recommendation.ctaPressureAst.fixtureTsx, CTA_PRESSURE_AST_FIXTURES.tsxBefore);
  assert.match(packet.ctaPressureAst.fixtureTsx, /queue-dual-cta\.tsx$/);
  assert.match(packet.ctaPressureAst.fixtureTsxAst, /queue-dual-cta-ast\.tsx$/);
  assert.match(packet.ctaPressureAst.cropBefore, /queue-cta-tsx-before-crop\.html$/);
  assert.match(packet.ctaPressureAst.cropAfter, /queue-cta-tsx-after-crop\.html$/);
  assert.match(packet.ctaPressureAst.helper, /apply-tsx\.mjs$/);
  assert.equal(packet.ctaPressureAst.mode, "tsx-ast");
  assert.equal(packet.ctaPressureAst.op, "cta-budget");
  assert.equal(packet.ctaPressureAst.maxFilled, 1);
  assert.match(packet.recommendation.instruction || "", /ctaPressureAst/);
  assert.equal(packet.ddr.restructureVsRepaint, "restructure");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("cta-budget"),
    `DDR ops missing cta-budget: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
  assert.equal(packet.ddr.ctaBudget, 1);
});

bite("AST cta-budget demotes expression + missing variant (regex-unsafe)", () => {
  // Prove transform uses TypeScript AST — not only /variant=["']default["']/.
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /isJsxElement|JsxOpening/);
  assert.match(applyTsxSrc, /isFilledButtonOpening|variant/);

  const hard = readFileSync(join(ROOT, CTA_PRESSURE_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countFilledButtonsTsx(hard);
  assert.ok(before.filled >= 3, `hard fixture filled≥3, got ${before.filled}: ${before.labels.join(",")}`);

  const afterSrc = ctaBudgetTsx(hard, { maxFilled: 1, preferLabels: ["Pursue"] });
  const after = countFilledButtonsTsx(afterSrc);
  assert.equal(after.filled, 1, `after filled must be 1, got ${after.filled}: ${after.labels.join(",")}`);
  assert.ok(after.labels.some((l) => l.includes("pursue")), after.labels.join(","));
  // Pursue kept as expression form variant={"default"}
  assert.match(afterSrc, /variant=\{\s*["']default["']\s*\}/);
  assert.match(afterSrc, /Assign lead/);
  assert.match(afterSrc, /Open queue/);
  // Assign lead demoted from variant="default"
  assert.match(afterSrc, /variant="outline"/);
  // Missing-variant Button must gain outline before className or as first attr
  assert.match(afterSrc, /<Button\s+variant="outline"[^>]*className="peer-action"/);

  // Golden simple fixture still works
  const dual = readFileSync(join(ROOT, CTA_PRESSURE_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Decide Pursue",
    category: "queue",
    ops: [{ op: "cta-budget", maxFilled: 1, preferLabels: ["Pursue"], demotePolicy: "outline" }],
  });
  const result = applyTsxRestructure(dual, plan);
  assert.ok(result.applied.includes("cta-budget"));
  assert.equal(countFilledButtonsTsx(result.source).filled, 1);
});

bite("FAIL→PASS crop pair self-contained (queue-cta-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-cta-tsx");
  assert.ok(pair, "queue-cta-tsx crop pair");
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
  assert.ok((before.match(/class="btn filled/g) || []).length >= 2, "before ≥2 filled");
  assert.equal((after.match(/class="btn filled"/g) || []).length, 1, "after exactly 1 filled");
  assert.match(after, /data-shine-tsx-ast="after"/);
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /cta-pressure-ast-bite\.mjs/);
  assert.match(pkg, /cta-pressure-ast-bite/);
  assert.match(pkg, /"restructure:tsx"/);
});

console.log(`cta-pressure-ast-bite.mjs: ok (${passed} bites)`);
