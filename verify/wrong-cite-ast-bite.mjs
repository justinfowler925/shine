#!/usr/bin/env node
/**
 * Doctor bite — wrong-cite / rebind-cite TSX AST deepen: recommend → packet bind →
 * AST rebind-cite → FAIL→PASS crop + recommend refuse path (cite-ban fail-close).
 * Mirrors worklist-first-ast-bite / dual-focal-ast-bite: typed fixture on denoise
 * recommend, packet.wrongCiteAst paths, DDR rebind-cite, self-contained crop pair.
 */
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  WRONG_CITE_AST_FIXTURES,
  recommendPattern,
  wrongCiteAstForSettingsJob,
  formatRecommendationSummary,
} from "../corpus/recommend.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";
import { loadRepertoire } from "../core/learn.mjs";
import {
  DEFECT_CROP_PAIRS,
  assertCropPairOk,
  ensureDefectCropReceipts,
} from "./restructure/defect-crops.mjs";
import {
  applyTsxRestructure,
  rebindCiteTsx,
  collectCiteAttrsTsx,
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
  assert.equal(WRONG_CITE_AST_FIXTURES.tsxBefore, "verify/fixtures/denoise/tsx/settings-wrong-cite.tsx");
  assert.equal(WRONG_CITE_AST_FIXTURES.tsxAstHard, "verify/fixtures/denoise/tsx/settings-wrong-cite-ast.tsx");
  assert.equal(
    WRONG_CITE_AST_FIXTURES.cropAfter,
    "verify/fixtures/denoise/receipts/sources-cite-tsx-after-crop.html",
  );
  assert.equal(WRONG_CITE_AST_FIXTURES.cropPairId, "sources-cite-tsx");
  assert.equal(WRONG_CITE_AST_FIXTURES.helper, "verify/restructure/apply-tsx.mjs");
  assert.equal(WRONG_CITE_AST_FIXTURES.op, "rebind-cite");
  assert.equal(WRONG_CITE_AST_FIXTURES.from, "shadcn-queue");
  assert.equal(WRONG_CITE_AST_FIXTURES.to, "shadcn-settings");
});

bite("golden TSX fixtures + helper exist", () => {
  for (const rel of [
    WRONG_CITE_AST_FIXTURES.tsxBefore,
    WRONG_CITE_AST_FIXTURES.tsxAstHard,
    WRONG_CITE_AST_FIXTURES.helper,
  ]) {
    assert.ok(existsSync(join(ROOT, rel)), rel);
  }
});

bite("recommend emits wrongCiteAst for settings/sources jobs", () => {
  const jobs = [
    { job: "account settings preferences save", category: "settings" },
    { job: "Sources & recipes fix or pause", category: "settings" },
    { job: "form preferences profile", category: "form" },
    { job: "wrong-cite rebind-cite category honesty settings", category: "settings" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.wrongCiteAst, `${job}: wrongCiteAst`);
    assert.equal(rec.wrongCiteAst.mode, "tsx-ast", job);
    assert.equal(rec.wrongCiteAst.op, "rebind-cite", job);
    assert.equal(rec.wrongCiteAst.from, "shadcn-queue", job);
    assert.equal(rec.wrongCiteAst.to, "shadcn-settings", job);
    assert.equal(rec.wrongCiteAst.refusePaintUntilRebound, true, job);
    assert.equal(rec.wrongCiteAst.fixtureTsx, WRONG_CITE_AST_FIXTURES.tsxBefore, job);
    assert.equal(rec.wrongCiteAst.cropAfter, WRONG_CITE_AST_FIXTURES.cropAfter, job);
    assert.equal(rec.wrongCiteAst.cropPairId, "sources-cite-tsx", job);
    assert.match(rec.wrongCiteAst.instruction || "", /apply-tsx|rebind-cite|FAIL→PASS|refuse/i);
    const direct = wrongCiteAstForSettingsJob(job, { category });
    assert.equal(direct.fixtureTsx, WRONG_CITE_AST_FIXTURES.tsxBefore);
    if (rec.primary) {
      assert.match(formatRecommendationSummary(rec), /wrongCiteAst/);
    }
  }
  const queue = recommendPattern(catalog.templates, "Decide Pursue on the next notice", {
    lane: "saas",
    category: "queue",
    limit: 6,
  });
  assert.equal(queue.wrongCiteAst, null, "queue triage job must not bind wrong-cite AST fixture");
});

bite("denoise packet binds wrongCiteAst + DDR rebind-cite on refuse path", () => {
  const packet = createDesignPacket({
    job: "Sources & recipes: rebind wrong queue cite via TSX AST",
    lane: "saas",
    mode: "denoise",
    category: "settings",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.wrongCiteAst?.fixtureTsx);
  assert.equal(packet.recommendation.wrongCiteAst.fixtureTsx, WRONG_CITE_AST_FIXTURES.tsxBefore);
  assert.match(packet.wrongCiteAst.fixtureTsx, /settings-wrong-cite\.tsx$/);
  assert.match(packet.wrongCiteAst.fixtureTsxAst, /settings-wrong-cite-ast\.tsx$/);
  assert.match(packet.wrongCiteAst.cropBefore, /sources-cite-tsx-before-crop\.html$/);
  assert.match(packet.wrongCiteAst.cropAfter, /sources-cite-tsx-after-crop\.html$/);
  assert.match(packet.wrongCiteAst.helper, /apply-tsx\.mjs$/);
  assert.equal(packet.wrongCiteAst.mode, "tsx-ast");
  assert.equal(packet.wrongCiteAst.op, "rebind-cite");
  assert.equal(packet.wrongCiteAst.refusePaintUntilRebound, true);
  assert.match(packet.recommendation.instruction || "", /wrongCiteAst/);

  // Cite-ban refuse path: ban the house settings cite with no alt → editing refused + AST bound.
  const dir = mkdtempSync(join(tmpdir(), "shine-wrong-cite-refuse-"));
  const storePath = join(dir, "repertoire.json");
  const store = loadRepertoire();
  store.citeBans = [
    ...(store.citeBans || []),
    {
      id: "test-ban-settings-refuse-ast",
      kind: "operate-demotion",
      citeId: "shadcn-settings",
      category: "settings",
      reason: "Test refuse paint + wrongCiteAst bind",
      failCategory: "wrong-cite",
      ddrId: "ddr_test_wrong_cite_ast_refuse",
      observedCite: "shadcn-settings",
      expectedCite: "shadcn-form",
      at: "2026-10-07T21:30:00.000Z",
    },
  ];
  // Also ban common alts so packet must refuse rather than demote.
  for (const id of ["shadcn-form", "shadcn-form-invite", "shadcn-settings-notifications"]) {
    store.citeBans.push({
      id: `test-ban-${id}`,
      kind: "operate-demotion",
      citeId: id,
      category: "settings",
      reason: "Block alt for refuse path",
      failCategory: "wrong-cite",
      ddrId: "ddr_test_wrong_cite_ast_refuse",
      observedCite: id,
      at: "2026-10-07T21:30:00.000Z",
    });
  }
  writeFileSync(storePath, JSON.stringify(store, null, 2) + "\n");
  const refuse = createDesignPacket({
    job: "Account settings preferences save profile",
    lane: "saas",
    mode: "denoise",
    category: "settings",
    project: ROOT,
    accept: true,
    learnStorePath: storePath,
  });
  assert.ok(refuse.recommendation?.wrongCiteAst?.fixtureTsx, "refuse path still binds wrongCiteAst");
  assert.ok(refuse.wrongCiteAst?.fixtureTsx);
  if (refuse.citeBanFailClosed?.failClosed && !refuse.citeBanFailClosed.replacedWith) {
    assert.equal(refuse.editing?.allowed, false);
    assert.match(refuse.editing.instruction || "", /Refuse paint|rebind-cite|wrongCiteAst|FAIL→PASS/i);
    assert.equal(refuse.ddr.restructureVsRepaint, "restructure");
    assert.ok((refuse.ddr.restructureOps || []).includes("rebind-cite"));
  }
  rmSync(dir, { recursive: true, force: true });
});

bite("AST rebind-cite rewrites expression + dataCite forms (regex-unsafe)", () => {
  assert.match(applyTsxSrc, /createSourceFile/);
  assert.match(applyTsxSrc, /rebindCiteTsx|collectCiteAttrsTsx/);
  assert.match(applyTsxSrc, /data-cite|dataCite/);

  const hard = readFileSync(join(ROOT, WRONG_CITE_AST_FIXTURES.tsxAstHard), "utf8");
  const before = collectCiteAttrsTsx(hard);
  assert.ok(before.cites.includes("shadcn-queue"), `hard cites: ${before.cites.join(",")}`);
  assert.match(hard, /data-cite=\{\s*["']shadcn-queue["']\s*\}/);
  assert.match(hard, /dataCite=["']shadcn-queue["']/);

  const afterSrc = rebindCiteTsx(hard, { from: "shadcn-queue", to: "shadcn-settings" });
  const after = collectCiteAttrsTsx(afterSrc);
  assert.ok(after.cites.every((c) => c === "shadcn-settings"), `after cites: ${after.cites.join(",")}`);
  assert.ok(!after.cites.includes("shadcn-queue"));
  assert.match(afterSrc, /data-cite=\{\s*["']shadcn-settings["']\s*\}/);
  assert.match(afterSrc, /dataCite=["']shadcn-settings["']/);
  // Expression form preserved on main
  assert.match(afterSrc, /data-cite=\{\s*["']shadcn-settings["']\s*\}/);

  const golden = readFileSync(join(ROOT, WRONG_CITE_AST_FIXTURES.tsxBefore), "utf8");
  const plan = buildRestructurePlan({
    job: "Rebind wrong cite",
    category: "settings",
    ops: [{ op: "rebind-cite", from: "shadcn-queue", to: "shadcn-settings" }],
  });
  const result = applyTsxRestructure(golden, plan);
  assert.ok(result.applied.includes("rebind-cite"));
  assert.ok(collectCiteAttrsTsx(result.source).cites.includes("shadcn-settings"));
  assert.ok(!collectCiteAttrsTsx(result.source).cites.includes("shadcn-queue"));
});

bite("FAIL→PASS crop pair self-contained (sources-cite-tsx)", () => {
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === "sources-cite-tsx");
  assert.ok(pair, "sources-cite-tsx crop pair");
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
  assert.match(before, /data-shine-tsx-ast="before"/);
  assert.match(before, /shadcn-queue/);
  assert.match(after, /shadcn-settings/);
  assert.match(after, /data-shine-tsx-ast="after"/);
  assert.ok(!/shadcn-queue/.test(after), "after crop must not keep queue cite");
});

bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /wrong-cite-ast-bite\.mjs/);
  assert.match(pkg, /wrong-cite-ast-bite/);
  assert.match(pkg, /"restructure:tsx"/);
});

console.log(`wrong-cite-ast-bite.mjs: ok (${passed} bites)`);
