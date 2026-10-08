#!/usr/bin/env node
/**
 * Doctor bite — form-heuristic TSX AST deepen: recommend → packet bind →
 * AST link-field-errors → FAIL→PASS crop. Also proves DENOISE_OP_ORDER sort.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  LINK_FIELD_ERRORS_AST_FIXTURES,
  recommendPattern,
  linkFieldErrorsAstForFormJob,
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
  linkFieldErrorsTsx,
  countFormHeuristicTsx,
} from "./restructure/apply-tsx.mjs";
import { buildRestructurePlan, sortRestructureOps, DENOISE_OP_ORDER } from "./restructure/schema.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RECEIPTS = join(ROOT, "verify/fixtures/denoise/receipts");
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
const applyTsxSrc = readFileSync(join(ROOT, "verify/restructure/apply-tsx.mjs"), "utf8");
const schemaSrc = readFileSync(join(ROOT, "verify/restructure/schema.mjs"), "utf8");

let passed = 0;
const bite = (name, fn) => {
  fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

bite("fixture path constants agree", () => {
  assert.equal(LINK_FIELD_ERRORS_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/form-link-field-errors.tsx");
  assert.equal(LINK_FIELD_ERRORS_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/form-link-field-errors-ast.tsx");
  assert.equal(LINK_FIELD_ERRORS_AST_FIXTURES.cropPairId, "form-link-field-errors-tsx");
  assert.equal(LINK_FIELD_ERRORS_AST_FIXTURES.op, "link-field-errors");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    LINK_FIELD_ERRORS_AST_FIXTURES.tsxBefore,
    LINK_FIELD_ERRORS_AST_FIXTURES.tsxAstHard,
    LINK_FIELD_ERRORS_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits linkFieldErrorsAst for form jobs", () => {
  for (const job of ["invite form aria-invalid field errors", "settings form-heuristic link-field-errors"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "form", limit: 6 });
    assert.ok(rec.linkFieldErrorsAst, `${job}: linkFieldErrorsAst`);
    assert.equal(rec.linkFieldErrorsAst.op, "link-field-errors", job);
    assert.ok((rec.restructureHints || []).some((h) => /link-field-errors/i.test(h)), job);
    assert.equal(
      linkFieldErrorsAstForFormJob(job, { category: "form" }).fixtureTsx,
      LINK_FIELD_ERRORS_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /linkFieldErrorsAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences form labels", {
    lane: "saas",
    category: "settings",
    limit: 6,
  });
  assert.ok(settings.linkFieldErrorsAst, "form/settings should bind link-field-errors AST");
});

bite("denoise packet binds linkFieldErrorsAst + DDR link-field-errors", () => {
  const packet = createDesignPacket({
    job: "Invite form: link aria-invalid field errors via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "form",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.linkFieldErrorsAst?.fixtureTsx);
  assert.match(packet.linkFieldErrorsAst.fixtureTsx, /form-link-field-errors\.tsx$/);
  assert.equal(packet.linkFieldErrorsAst.op, "link-field-errors");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("link-field-errors"),
    `DDR ops missing link-field-errors: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST link-field-errors stamps describedby + alert", () => {
  assert.match(applyTsxSrc, /linkFieldErrorsTsx|countFormHeuristicTsx/);
  const hard = readFileSync(join(ROOT, LINK_FIELD_ERRORS_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countFormHeuristicTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = linkFieldErrorsTsx(hard);
  assert.equal(countFormHeuristicTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /aria-describedby=["']email-error["']/);
  assert.match(afterSrc, /role=["']alert["']/);
  assert.match(afterSrc, /data-shine-field-error-linked/);

  const soup = readFileSync(join(ROOT, LINK_FIELD_ERRORS_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Link field errors",
    category: "form",
    ops: [{ op: "link-field-errors" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("link-field-errors"));
  assert.match(result.source, /aria-describedby=/);
});

bite("DENOISE_OP_ORDER sorts shuffled ops for clean composition", () => {
  assert.match(schemaSrc, /DENOISE_OP_ORDER|sortRestructureOps/);
  const shuffled = [
    { op: "set-focal" },
    { op: "link-field-errors" },
    { op: "god-split" },
    { op: "name-controls" },
    { op: "cta-budget" },
  ];
  const ordered = sortRestructureOps(shuffled).map((o) => o.op);
  assert.deepEqual(ordered, ["cta-budget", "name-controls", "link-field-errors", "set-focal", "god-split"]);
  assert.ok(DENOISE_OP_ORDER.includes("link-field-errors"));
  const plan = buildRestructurePlan({
    job: "compose",
    category: "form",
    ops: shuffled.filter((o) => o.op !== "god-split"),
  });
  assert.deepEqual(
    plan.ops.map((o) => o.op),
    ["cta-budget", "name-controls", "link-field-errors", "set-focal"],
  );
});

bite("FAIL→PASS crop pair self-contained (form-link-field-errors-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "form-link-field-errors-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /link-field-errors-ast-bite\.mjs/);
  assert.match(pkg, /link-field-errors:ast-bite/);
});

console.log(`link-field-errors-ast-bite.mjs: ok (${passed} bites)`);
