#!/usr/bin/env node
/**
 * Doctor bite — empty-filtered-error-conflated TSX AST deepen: recommend → packet bind →
 * AST split-empty-triad → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  EMPTY_TRIAD_AST_FIXTURES,
  recommendPattern,
  emptyTriadAstForQueueJob,
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
  splitEmptyTriadTsx,
  countEmptyTriadTsx,
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
  assert.equal(EMPTY_TRIAD_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-empty-triad.tsx");
  assert.equal(EMPTY_TRIAD_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-empty-triad-ast.tsx");
  assert.equal(EMPTY_TRIAD_AST_FIXTURES.cropPairId, "queue-empty-triad-tsx");
  assert.equal(EMPTY_TRIAD_AST_FIXTURES.op, "split-empty-triad");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    EMPTY_TRIAD_AST_FIXTURES.tsxBefore,
    EMPTY_TRIAD_AST_FIXTURES.tsxAstHard,
    EMPTY_TRIAD_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits emptyTriadAst for queue jobs", () => {
  for (const job of ["queue triage empty triad filtered empty", "queue split-empty-triad no data alert"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.emptyTriadAst, `${job}: emptyTriadAst`);
    assert.equal(rec.emptyTriadAst.op, "split-empty-triad", job);
    assert.ok((rec.restructureHints || []).some((h) => /split-empty-triad/i.test(h)), job);
    assert.equal(
      emptyTriadAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      EMPTY_TRIAD_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /emptyTriadAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.emptyTriadAst, null, "settings/form must not bind empty-triad AST");
});

bite("denoise packet binds emptyTriadAst + DDR split-empty-triad", () => {
  const packet = createDesignPacket({
    job: "Queue triage: split empty triad via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.emptyTriadAst?.fixtureTsx);
  assert.match(packet.emptyTriadAst.fixtureTsx, /queue-empty-triad\.tsx$/);
  assert.equal(packet.emptyTriadAst.op, "split-empty-triad");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("split-empty-triad"),
    `DDR ops missing split-empty-triad: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST split-empty-triad stamps filtered-empty + distinct error", () => {
  assert.match(applyTsxSrc, /splitEmptyTriadTsx|countEmptyTriadTsx/);
  const hard = readFileSync(join(ROOT, EMPTY_TRIAD_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countEmptyTriadTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = splitEmptyTriadTsx(hard);
  assert.equal(countEmptyTriadTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-filtered-empty/);
  assert.match(afterSrc, /data-shine-triad-split/);
  assert.match(afterSrc, /data-error/);
  assert.doesNotMatch(afterSrc, /data-empty[^>]*role=\{?["']alert["']/);

  const soup = readFileSync(join(ROOT, EMPTY_TRIAD_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Split triad",
    category: "queue",
    ops: [{ op: "split-empty-triad" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("split-empty-triad"));
  assert.match(result.source, /data-filtered-empty/);
});

bite("FAIL→PASS crop pair self-contained (queue-empty-triad-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-empty-triad-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /split-empty-triad-ast-bite\.mjs/);
  assert.match(pkg, /split-empty-triad:ast-bite/);
});

console.log(`split-empty-triad-ast-bite.mjs: ok (${passed} bites)`);
