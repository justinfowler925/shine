#!/usr/bin/env node
/**
 * Doctor bite — incomplete-primitives TSX AST deepen: recommend → packet bind →
 * AST name-controls → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  NAME_CONTROLS_AST_FIXTURES,
  recommendPattern,
  nameControlsAstForQueueJob,
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
  nameControlsTsx,
  countIncompletePrimitivesTsx,
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
  assert.equal(NAME_CONTROLS_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-name-controls.tsx");
  assert.equal(NAME_CONTROLS_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-name-controls-ast.tsx");
  assert.equal(NAME_CONTROLS_AST_FIXTURES.cropPairId, "queue-name-controls-tsx");
  assert.equal(NAME_CONTROLS_AST_FIXTURES.op, "name-controls");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    NAME_CONTROLS_AST_FIXTURES.tsxBefore,
    NAME_CONTROLS_AST_FIXTURES.tsxAstHard,
    NAME_CONTROLS_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits nameControlsAst for Operate jobs", () => {
  for (const job of ["queue triage name-controls icon-only", "queue incomplete-primitive unlabeled delete"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.nameControlsAst, `${job}: nameControlsAst`);
    assert.equal(rec.nameControlsAst.op, "name-controls", job);
    assert.ok((rec.restructureHints || []).some((h) => /name-controls/i.test(h)), job);
    assert.equal(
      nameControlsAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      NAME_CONTROLS_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /nameControlsAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences form labels", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.ok(settings.nameControlsAst, "form/settings should bind name-controls AST");
});

bite("denoise packet binds nameControlsAst + DDR name-controls", () => {
  const packet = createDesignPacket({
    job: "Queue triage: name incomplete controls via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.nameControlsAst?.fixtureTsx);
  assert.match(packet.nameControlsAst.fixtureTsx, /queue-name-controls\.tsx$/);
  assert.equal(packet.nameControlsAst.op, "name-controls");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("name-controls"),
    `DDR ops missing name-controls: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST name-controls stamps names + confirm", () => {
  assert.match(applyTsxSrc, /nameControlsTsx|countIncompletePrimitivesTsx/);
  const hard = readFileSync(join(ROOT, NAME_CONTROLS_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countIncompletePrimitivesTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = nameControlsTsx(hard);
  assert.equal(countIncompletePrimitivesTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /aria-label=["']More actions["']/);
  assert.match(afterSrc, /data-confirm/);
  assert.match(afterSrc, /data-shine-named/);

  const soup = readFileSync(join(ROOT, NAME_CONTROLS_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Name controls",
    category: "queue",
    ops: [{ op: "name-controls" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("name-controls"));
  assert.match(result.source, /aria-label=/);
});

bite("FAIL→PASS crop pair self-contained (queue-name-controls-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-name-controls-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /name-controls-ast-bite\.mjs/);
  assert.match(pkg, /name-controls:ast-bite/);
});

console.log(`name-controls-ast-bite.mjs: ok (${passed} bites)`);
