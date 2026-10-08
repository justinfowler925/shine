#!/usr/bin/env node
/**
 * Doctor bite — parallel-owned-component TSX AST deepen: recommend → packet bind →
 * AST bind-product-owner → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  PARALLEL_OWNED_AST_FIXTURES,
  recommendPattern,
  parallelOwnedAstForQueueJob,
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
  bindProductOwnerTsx,
  countParallelOwnedTsx,
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
  assert.equal(PARALLEL_OWNED_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/queue-parallel-owned.tsx");
  assert.equal(PARALLEL_OWNED_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/queue-parallel-owned-ast.tsx");
  assert.equal(PARALLEL_OWNED_AST_FIXTURES.cropPairId, "queue-parallel-owned-tsx");
  assert.equal(PARALLEL_OWNED_AST_FIXTURES.op, "bind-product-owner");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    PARALLEL_OWNED_AST_FIXTURES.tsxBefore,
    PARALLEL_OWNED_AST_FIXTURES.tsxAstHard,
    PARALLEL_OWNED_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits parallelOwnedAst for queue jobs", () => {
  for (const job of ["queue triage parallel owned datagrid", "queue bind-product-owner nucleus datagrid"]) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category: "queue", limit: 6 });
    assert.ok(rec.parallelOwnedAst, `${job}: parallelOwnedAst`);
    assert.equal(rec.parallelOwnedAst.op, "bind-product-owner", job);
    assert.ok((rec.restructureHints || []).some((h) => /bind-product-owner/i.test(h)), job);
    assert.equal(
      parallelOwnedAstForQueueJob(job, { category: "queue" }).fixtureTsx,
      PARALLEL_OWNED_AST_FIXTURES.tsxBefore,
    );
    if (rec.primary) assert.match(formatRecommendationSummary(rec), /parallelOwnedAst/);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.parallelOwnedAst, null, "settings/form must not bind parallel-owned AST");
});

bite("denoise packet binds parallelOwnedAst + DDR bind-product-owner", () => {
  const packet = createDesignPacket({
    job: "Queue triage: bind product owner via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "queue",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.parallelOwnedAst?.fixtureTsx);
  assert.match(packet.parallelOwnedAst.fixtureTsx, /queue-parallel-owned\.tsx$/);
  assert.equal(packet.parallelOwnedAst.op, "bind-product-owner");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("bind-product-owner"),
    `DDR ops missing bind-product-owner: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST bind-product-owner stamps reuse-bound + demotes parallel", () => {
  assert.match(applyTsxSrc, /bindProductOwnerTsx|countParallelOwnedTsx/);
  const hard = readFileSync(join(ROOT, PARALLEL_OWNED_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countParallelOwnedTsx(hard);
  assert.ok(before.hits >= 1, `hard hits≥1, got ${before.hits}`);
  const afterSrc = bindProductOwnerTsx(hard);
  assert.equal(countParallelOwnedTsx(afterSrc).hits, 0);
  assert.match(afterSrc, /data-shine-reuse-bound/);
  assert.match(afterSrc, /data-shine-parallel-rest/);
  assert.match(afterSrc, /data-shine-parallel-demoted/);

  const soup = readFileSync(join(ROOT, PARALLEL_OWNED_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Bind product owner",
    category: "queue",
    ops: [{ op: "bind-product-owner" }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("bind-product-owner"));
  assert.match(result.source, /data-shine-reuse-bound/);
});

bite("FAIL→PASS crop pair self-contained (queue-parallel-owned-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "queue-parallel-owned-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /bind-product-owner-ast-bite\.mjs/);
  assert.match(pkg, /bind-product-owner:ast-bite/);
});

console.log(`bind-product-owner-ast-bite.mjs: ok (${passed} bites)`);
