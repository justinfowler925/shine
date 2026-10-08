#!/usr/bin/env node
/**
 * Doctor bite — card-soup TSX AST deepen: recommend → packet bind →
 * AST collapse-card-soup → FAIL→PASS crop.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  CARD_SOUP_AST_FIXTURES,
  recommendPattern,
  cardSoupAstForCatalogJob,
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
  collapseCardSoupTsx,
  countCardSoupTsx,
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
  assert.equal(CARD_SOUP_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/catalog-card-soup.tsx");
  assert.equal(CARD_SOUP_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/catalog-card-soup-ast.tsx");
  assert.equal(CARD_SOUP_AST_FIXTURES.cropPairId, "catalog-card-soup-tsx");
  assert.equal(CARD_SOUP_AST_FIXTURES.op, "collapse-card-soup");
  assert.equal(CARD_SOUP_AST_FIXTURES.maxVisible, 1);
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    CARD_SOUP_AST_FIXTURES.tsxBefore,
    CARD_SOUP_AST_FIXTURES.tsxAstHard,
    CARD_SOUP_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits cardSoupAst for catalog/queue jobs", () => {
  const catalogJob = "catalog tools card soup equal cards";
  const catalogRec = recommendPattern(catalog.templates, catalogJob, {
    lane: "saas",
    category: "catalog",
    limit: 6,
  });
  assert.ok(catalogRec.cardSoupAst, `${catalogJob}: cardSoupAst`);
  assert.equal(catalogRec.cardSoupAst.op, "collapse-card-soup", catalogJob);
  assert.ok((catalogRec.restructureHints || []).some((h) => /collapse-card-soup/i.test(h)), catalogJob);
  assert.equal(
    cardSoupAstForCatalogJob(catalogJob, { category: "catalog" }).fixtureTsx,
    CARD_SOUP_AST_FIXTURES.tsxBefore,
  );
  if (catalogRec.primary) assert.match(formatRecommendationSummary(catalogRec), /cardSoupAst/);

  const queueJob = "queue triage collapse-card-soup no-focal";
  const queueRec = recommendPattern(catalog.templates, queueJob, {
    lane: "saas",
    category: "queue",
    limit: 6,
  });
  assert.ok(queueRec.cardSoupAst, `${queueJob}: cardSoupAst`);
  assert.equal(queueRec.cardSoupAst.op, "collapse-card-soup", queueJob);
  assert.ok((queueRec.restructureHints || []).some((h) => /collapse-card-soup/i.test(h)), queueJob);

  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.cardSoupAst, null, "settings/form must not bind card-soup AST");
});

bite("denoise packet binds cardSoupAst + DDR collapse-card-soup", () => {
  const packet = createDesignPacket({
    job: "Catalog tools: collapse card soup via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "catalog",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.cardSoupAst?.fixtureTsx);
  assert.match(packet.cardSoupAst.fixtureTsx, /catalog-card-soup\.tsx$/);
  assert.equal(packet.cardSoupAst.op, "collapse-card-soup");
  assert.ok(
    (packet.ddr.restructureOps || []).includes("collapse-card-soup"),
    `DDR ops missing collapse-card-soup: ${JSON.stringify(packet.ddr.restructureOps)}`,
  );
});

bite("AST collapse-card-soup stamps focal + parks peers", () => {
  assert.match(applyTsxSrc, /collapseCardSoupTsx|countCardSoupTsx/);
  const hard = readFileSync(join(ROOT, CARD_SOUP_AST_FIXTURES.tsxAstHard), "utf8");
  const before = countCardSoupTsx(hard);
  assert.ok(before.cards >= 4, `hard cards≥4, got ${before.cards}`);
  const afterSrc = collapseCardSoupTsx(hard, { maxVisible: 1 });
  assert.match(afterSrc, /data-region=["']focal["']/);
  assert.match(afterSrc, /data-shine-card-rest/);
  assert.match(afterSrc, /data-shine-card-demoted/);
  // Visible cards outside rest should be ≤1 primary
  assert.ok(
    !/data-shine-card-rest[\s\S]*data-region=["']focal["']/.test(afterSrc) ||
      /data-region=["']focal["'][\s\S]*data-shine-card-rest/.test(afterSrc),
  );

  const soup = readFileSync(join(ROOT, CARD_SOUP_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Collapse cards",
    category: "catalog",
    ops: [{ op: "collapse-card-soup", maxVisible: 1 }],
  });
  const result = applyTsxRestructure(soup, plan);
  assert.ok(result.applied.includes("collapse-card-soup"));
  assert.match(result.source, /data-shine-card-rest/);
});

bite("FAIL→PASS crop pair self-contained (catalog-card-soup-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "catalog-card-soup-tsx");
  assert.ok(pair);
  ensureDefectCropReceipts(RECEIPTS);
  const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, result.errors.join("; "));
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /collapse-card-soup-ast-bite\.mjs/);
  assert.match(pkg, /collapse-card-soup:ast-bite/);
});

console.log(`collapse-card-soup-ast-bite.mjs: ok (${passed} bites)`);
