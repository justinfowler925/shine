#!/usr/bin/env node
/**
 * Doctor bite — marketing-dna-operate TSX AST deepen: recommend → packet bind →
 * AST strip-marketing-dna → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  MARKETING_DNA_AST_FIXTURES,
  recommendPattern,
  marketingDnaAstForQueueJob,
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
  stripMarketingDnaTsx,
  countMarketingDnaTsx,
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
  assert.equal(MARKETING_DNA_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-marketing-dna.tsx");
  assert.equal(MARKETING_DNA_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-marketing-dna-ast.tsx");
  assert.equal(MARKETING_DNA_AST_FIXTURES.cropPairId, "queue-marketing-dna-tsx");
  assert.equal(MARKETING_DNA_AST_FIXTURES.op, "strip-marketing-dna");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    MARKETING_DNA_AST_FIXTURES.tsxBefore,
    MARKETING_DNA_AST_FIXTURES.tsxAstHard,
    MARKETING_DNA_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits marketingDnaAst for queue jobs", () => {
  for (const job of ["work queue triage inbox", "queue strip-marketing-dna glow gradient"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.marketingDnaAst, `${job}: marketingDnaAst`);
    assert.equal(rec.marketingDnaAst.op, "strip-marketing-dna", job);
    assert.ok((rec.restructureHints || []).some((h) => /strip-marketing-dna/i.test(h)), job);
    assert.equal(
      marketingDnaAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      MARKETING_DNA_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /marketingDnaAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.marketingDnaAst, null, "settings/form must not bind marketing AST");
});

bite("denoise packet binds marketingDnaAst + DDR strip-marketing-dna", () => {
  const packet = createDesignPacket({
    job: "Queue triage: strip marketing DNA via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.marketingDnaAst?.fixtureTsx);
  assert.match(packet.marketingDnaAst.fixtureTsx, /queue-marketing-dna\.tsx$/);
  assert.equal(packet.marketingDnaAst.op, "strip-marketing-dna");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("strip-marketing-dna"),
    `DDR ops missing strip-marketing-dna: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST strip-marketing-dna scrubs illegal className tokens", () => {
  assert.match(applyTsxSrc, /stripMarketingDnaTsx|countMarketingDnaTsx/);
  const hard = readFileSync(join(ROOT, MARKETING_DNA_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countMarketingDnaTsx(hard);
  assert.ok(before.hits >= 4, `hard hits≥4, got ${before.hits}`);
  const afterSrc = stripMarketingDnaTsx(hard);
  assert.equal(countMarketingDnaTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-shine-marketing-stripped/);

  const soup = readFileSync(join(ROOT, MARKETING_DNA_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Strip DNA",
    category: "queue",
    ops: [{ op: "strip-marketing-dna" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("strip-marketing-dna"));
  assert.equal(countMarketingDnaTsx(result.source).hits, 0);
});

bite("FAIL→PASS crop pair self-contained (queue-marketing-dna-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-marketing-dna-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /strip-marketing-dna-ast-bite\.mjs/);
  assert.match(pkg, /strip-marketing-dna:ast-bite/);
});

console.log(`strip-marketing-dna-ast-bite.mjs: ok (${passed} bites)`);
