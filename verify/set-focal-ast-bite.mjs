#!/usr/bin/env node
/**
 * Doctor bite — set-focal / NO-FOCAL TSX AST deepen: recommend → packet bind →
 * AST set-focal (data-region=focal) → FAIL→PASS crop.
 * Mirrors worklist-first-ast-bite / wrong-cite-ast-bite: typed fixture on denoise
 * recommend, packet.setFocalAst paths, DDR set-focal, self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  SET_FOCAL_AST_FIXTURES,
  recommendPattern,
  setFocalAstForCompositionJob,
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
  countEqualCardsWithoutFocalTsx,
  setFocalTsx,
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
  assert.equal(SET_FOCAL_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/usul-no-focal.tsx");
  assert.equal(SET_FOCAL_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/usul-no-focal-ast.tsx");
  assert.equal(
    SET_FOCAL_AST_FIXTURES.cropAfter,
    "verify/fixtures/denoise/receipts/usul-focal-tsx-after-crop.html",
  );
  assert.equal(SET_FOCAL_AST_FIXTURES.cropPairId, "usul-focal-tsx");
  assert.equal(SET_FOCAL_AST_FIXTURES.helper, "verify/restructure/apply-tsx.mjs");
  assert.equal(SET_FOCAL_AST_FIXTURES.op, "set-focal");
  assert.equal(SET_FOCAL_AST_FIXTURES.value, "focal");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    SET_FOCAL_AST_FIXTURES.tsxBefore,
    SET_FOCAL_AST_FIXTURES.tsxAstHard,
    SET_FOCAL_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits setFocalAst for composition / queue jobs", () => {
  const jobs = [
    { job: "work queue triage inbox", category: "queue" },
    { job: "Usul pipeline equal card soup no focal", category: "dashboard" },
    { job: "composition-slop set-focal primary work object", category: "queue" },
    { job: "records list worklist Monday decide", category: "record" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.setFocalAst, `${job}: setFocalAst`);
    assert.equal(rec.setFocalAst.mode, "tsx-ast", job);
    assert.equal(rec.setFocalAst.op, "set-focal", job);
    assert.equal(rec.setFocalAst.fixtureTsx, SET_FOCAL_AST_FIXTURES.tsxBefore, job);
    assert.equal(rec.setFocalAst.cropAfter, SET_FOCAL_AST_FIXTURES.cropAfter, job);
    assert.equal(rec.setFocalAst.cropPairId, "usul-focal-tsx", job);
    assert.match(rec.setFocalAst.instruction || "", /apply-tsx|set-focal|FAIL→PASS|data-region/i);
    assert.ok(
      (rec.restructureHints || []).some((h) => /set-focal/i.test(h)),
      `${job}: restructureHints name set-focal`,
    );
    const direct = setFocalAstForCompositionJob(job, { category });
    assert.equal(direct.fixtureTsx, SET_FOCAL_AST_FIXTURES.tsxBefore);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /setFocalAst/);
    }
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.setFocalAst, null, "settings/form job must not bind set-focal AST fixture");
});

bite("denoise packet binds setFocalAst + DDR set-focal", () => {
  const packet = createDesignPacket({
    job: "Usul composition: stamp focal via TSX AST set-focal",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.setFocalAst?.fixtureTsx);
  assert.equal(packet.recommendation.setFocalAst.fixtureTsx, SET_FOCAL_AST_FIXTURES.tsxBefore);
  assert.match(packet.setFocalAst.fixtureTsx, /usul-no-focal\.tsx$/);
  assert.match(packet.setFocalAst.fixtureTsxAst, /usul-no-focal-ast\.tsx$/);
  assert.match(packet.setFocalAst.cropBefore, /usul-focal-tsx-before-crop\.html$/);
  assert.match(packet.setFocalAst.cropAfter, /usul-focal-tsx-after-crop\.html$/);
  assert.match(packet.setFocalAst.helper, /apply-tsx\.mjs$/);
  assert.equal(packet.setFocalAst.mode, "tsx-ast");
  assert.equal(packet.setFocalAst.op, "set-focal");
  assert.match(packet.recommendation.instruction || "", /setFocalAst/);
  assert.equal(packet.ddr.restructureVsRepaint, "restructure");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("set-focal"),
    `DDR ops missing set-focal: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST set-focal stamps worklist / card via TypeScript compiler", () => {
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /countEqualCardsWithoutFocalTsx|collectFocalCandidates/);
  assert.match(applyTsxSrc, /ensureJsxOpenAttrs/);

  const hard = readFileSync(join(ROOT, SET_FOCAL_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countEqualCardsWithoutFocalTsx(hard);
  assert.equal(before.hasFocal, false, "hard fixture must start without focal");
  assert.ok(before.candidates >= 2, `candidates≥2, got ${before.candidates}`);
  assert.ok(before.worklists >= 1, `worklists≥1, got ${before.worklists}`);
  assert.match(hard, /className=\{\s*["']card["']\s*\}/);
  assert.match(hard, /role=\{\s*["']grid["']\s*\}/);
  assert.match(hard, /data-shine-records/);

  const afterSrc = setFocalTsx(hard, { attr: "data-region", value: "focal" });
  const after = countEqualCardsWithoutFocalTsx(afterSrc);
  assert.equal(after.hasFocal, true, "after must stamp focal");
  assert.match(afterSrc, /data-region="focal"/);
  // Prefer worklist (grid-wrap / data-shine-records) over peer cards
  const focalIdx = afterSrc.indexOf('data-region="focal"');
  const recordsIdx = afterSrc.indexOf("data-shine-records");
  assert.ok(focalIdx >= 0 && recordsIdx >= 0, "focal + records present");
  // Focal lands on the worklist open tag near data-shine-records
  assert.ok(Math.abs(focalIdx - recordsIdx) < 120, "focal stamped on worklist host");

  // Golden simple fixture via plan apply (card-only soup)
  const golden = readFileSync(join(ROOT, SET_FOCAL_AST_FIXTURES.tsxBefore), "utf8");
  assert.equal(countEqualCardsWithoutFocalTsx(golden).hasFocal, false);
  const plan = buildRestructurePlan({
    job: "Stamp focal on Usul pipeline",
    category: "queue",
    ops: [{ op: "set-focal", attr: "data-region", value: "focal" }],
  });
  const result = applyTsxRestructure(golden, plan);
  assert.ok(result.applied.includes("set-focal"));
  assert.equal(countEqualCardsWithoutFocalTsx(result.source).hasFocal, true);
  assert.match(result.source, /data-region="focal"/);
});

bite("FAIL→PASS crop pair self-contained (usul-focal-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "usul-focal-tsx");
  assert.ok(pair, "usul-focal-tsx crop pair");
  assert.equal(typeof pair.buildAfter, "function", "buildAfter must be set");
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => {
    const path = join(RECEIPTS, name);
    assert.ok(existsSync(path), `missing crop ${name}`);
    return readFileSync(path, "utf8");
  };
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.match(read("usul-focal-tsx-after-crop.html"), /data-region="focal"/);
  assert.match(read("usul-focal-tsx-before-crop.html"), /data-shine-tsx-ast="before"/);
});

bite("doctor + npm script wire set-focal AST bite", () => {
  assert.match(doctorSrc, /set-focal-ast-bite\.mjs/);
  assert.match(doctorSrc, /set-focal TSX AST|setFocalAst/);
  assert.match(pkg, /"set-focal:ast-bite"/);
});

console.log(`set-focal-ast-bite.mjs: ok (${passed} bites)`);
