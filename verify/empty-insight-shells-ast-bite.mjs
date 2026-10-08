#!/usr/bin/env node
/**
 * Doctor bite — empty-insight-shells TSX AST deepen: recommend → packet bind →
 * AST collapse-empty-shells → FAIL→PASS crop.
 * Mirrors kpi-soup-ast-bite / dual-focal-ast-bite: typed fixture on denoise
 * recommend, packet.emptyInsightShellAst paths, DDR collapse-empty-shells,
 * self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  EMPTY_INSIGHT_SHELL_AST_FIXTURES,
  recommendPattern,
  emptyInsightShellAstForQueueJob,
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
  countEmptyInsightShellsTsx,
  collapseEmptyShellsTsx,
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
  assert.equal(
    EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxBefore,
    "verify/fixtures/denoise/tsx/queue-empty-shells.tsx",
  );
  assert.equal(
    EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxAstHard,
    "verify/fixtures/denoise/tsx/queue-empty-shells-ast.tsx",
  );
  assert.equal(
    EMPTY_INSIGHT_SHELL_AST_FIXTURES.cropAfter,
    "verify/fixtures/denoise/receipts/queue-empty-shells-tsx-after-crop.html",
  );
  assert.equal(EMPTY_INSIGHT_SHELL_AST_FIXTURES.cropPairId, "queue-empty-shells-tsx");
  assert.equal(EMPTY_INSIGHT_SHELL_AST_FIXTURES.helper, "verify/restructure/apply-tsx.mjs");
  assert.equal(EMPTY_INSIGHT_SHELL_AST_FIXTURES.op, "collapse-empty-shells");
  assert.equal(EMPTY_INSIGHT_SHELL_AST_FIXTURES.mode, "remove");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxBefore,
    EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxAstHard,
    EMPTY_INSIGHT_SHELL_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits emptyInsightShellAst for queue jobs", () => {
  const jobs = [
    { job: "work queue triage inbox", category: "queue" },
    { job: "collapse empty Active in Usul insight shells", category: "queue" },
    { job: "Missed awards blank peer cards under focal", category: "queue" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.emptyInsightShellAst, `${job}: emptyInsightShellAst`);
    assert.equal(rec.emptyInsightShellAst.mode, "tsx-ast", job);
    assert.equal(rec.emptyInsightShellAst.op, "collapse-empty-shells", job);
    assert.equal(rec.emptyInsightShellAst.fixtureTsx, EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxBefore, job);
    assert.equal(rec.emptyInsightShellAst.cropAfter, EMPTY_INSIGHT_SHELL_AST_FIXTURES.cropAfter, job);
    assert.equal(rec.emptyInsightShellAst.cropPairId, "queue-empty-shells-tsx", job);
    assert.match(rec.emptyInsightShellAst.instruction || "", /collapse-empty-shells|FAIL→PASS|empty/i);
    assert.ok(
      (rec.restructureHints || []).some((h) => /collapse-empty-shells/i.test(h)),
      `${job}: restructureHints name collapse-empty-shells`,
    );
    const direct = emptyInsightShellAstForQueueJob(job, { category });
    assert.equal(direct.fixtureTsx, EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxBefore);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /emptyInsightShellAst/);
    }
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(
    settings.emptyInsightShellAst,
    null,
    "settings/form job must not bind empty-insight-shell AST fixture",
  );
});

bite("denoise packet binds emptyInsightShellAst + DDR collapse-empty-shells", () => {
  const packet = createDesignPacket({
    job: "Queue triage: collapse empty Active in Usul insight shells via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.emptyInsightShellAst?.fixtureTsx);
  assert.equal(
    packet.recommendation.emptyInsightShellAst.fixtureTsx,
    EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxBefore,
  );
  assert.match(packet.emptyInsightShellAst.fixtureTsx, /queue-empty-shells\.tsx$/);
  assert.match(packet.emptyInsightShellAst.fixtureTsxAst, /queue-empty-shells-ast\.tsx$/);
  assert.match(packet.emptyInsightShellAst.cropBefore, /queue-empty-shells-tsx-before-crop\.html$/);
  assert.match(packet.emptyInsightShellAst.cropAfter, /queue-empty-shells-tsx-after-crop\.html$/);
  assert.match(packet.emptyInsightShellAst.helper, /apply-tsx\.mjs$/);
  assert.equal(packet.emptyInsightShellAst.mode, "tsx-ast");
  assert.equal(packet.emptyInsightShellAst.op, "collapse-empty-shells");
  assert.match(packet.recommendation.instruction || "", /emptyInsightShellAst/);
  assert.equal(packet.ddr.restructureVsRepaint, "restructure");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("collapse-empty-shells"),
    `DDR ops missing collapse-empty-shells: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST collapse-empty-shells removes blank shells via TypeScript compiler", () => {
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /collapseEmptyShellsTsx|countEmptyInsightShellsTsx/);

  const hard = readFileSync(join(ROOT, EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countEmptyInsightShellsTsx(hard);
  assert.ok(before.hasFocal, "hard fixture must have focal");
  assert.ok(before.emptyShells >= 2, `emptyShells≥2, got ${before.emptyShells}`);
  assert.match(hard, /className=\{\s*["']card["']\s*\}/);
  assert.match(hard, /data-shine-insight/);
  assert.match(hard, /Active in Usul/);

  const afterSrc = collapseEmptyShellsTsx(hard, { mode: "remove" });
  const after = countEmptyInsightShellsTsx(afterSrc);
  assert.equal(after.emptyShells, 0, "after must clear empty shells");
  assert.doesNotMatch(afterSrc, /Active in Usul/);
  assert.doesNotMatch(afterSrc, /Missed awards/);
  assert.match(afterSrc, /Needs attention/);
  assert.match(afterSrc, /Open card/);

  const golden = readFileSync(join(ROOT, EMPTY_INSIGHT_SHELL_AST_FIXTURES.tsxBefore), "utf8");
  assert.ok(countEmptyInsightShellsTsx(golden).emptyShells >= 2);
  const plan = buildRestructurePlan({
    job: "Collapse empty insight shells",
    category: "queue",
    ops: [{ op: "collapse-empty-shells", mode: "remove" }],
  });
  const result = applyTsxRestructure(golden, plan);
  assert.ok(result.applied.includes("collapse-empty-shells"));
  assert.equal(countEmptyInsightShellsTsx(result.source).emptyShells, 0);
});

bite("FAIL→PASS crop pair self-contained (queue-empty-shells-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-empty-shells-tsx");
  assert.ok(pair, "queue-empty-shells-tsx crop pair");
  assert.equal(typeof pair.buildAfter, "function", "buildAfter must be set");
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => {
    const path = join(RECEIPTS, name);
    assert.ok(existsSync(path), `missing crop ${name}`);
    return readFileSync(path, "utf8");
  };
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.doesNotMatch(read("queue-empty-shells-tsx-after-crop.html"), /Active in Usul/);
  assert.match(read("queue-empty-shells-tsx-before-crop.html"), /data-shine-tsx-ast="before"/);
});

bite("doctor + npm script wire empty-insight-shells AST bite", () => {
  assert.match(doctorSrc, /empty-insight-shells-ast-bite\.mjs/);
  assert.match(doctorSrc, /empty-insight-shells TSX AST|emptyInsightShellAst/);
  assert.match(pkg, /"empty-insight-shells:ast-bite"/);
});

console.log(`empty-insight-shells-ast-bite.mjs: ok (${passed} bites)`);
