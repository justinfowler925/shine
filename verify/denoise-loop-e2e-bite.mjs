#!/usr/bin/env node
/**
 * Doctor bite — denoise-loop e2e on a fixture queue:
 * measure → repair (AST ops) → Critic≠Actor → prove (reflexionVerdict + constitutionIds)
 * with a FAIL→PASS crop receipt (not twin full-page).
 */
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_ACTOR_ID, DEFAULT_CRITIC_ID, DEFAULT_HOST_ID } from "../core/critic-actor-host.mjs";
import { countFilledButtonsTsx } from "./restructure/apply-tsx.mjs";
import {
  DEFECT_CROP_PAIRS,
  assertCropPairOk,
  ensureDefectCropReceipts,
} from "./restructure/defect-crops.mjs";
import { runDenoiseLoop } from "./denoise-loop.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");
const RECEIPTS = join(FIX, "receipts");
const HTML_BEFORE = join(FIX, "queue-cta-before.html");
const TSX_AST = join(FIX, "tsx/queue-dual-cta-ast.tsx");
const CROP_PAIR_ID = "queue-cta-tsx";

const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
const loopSrc = readFileSync(join(ROOT, "verify/denoise-loop.mjs"), "utf8");

let passed = 0;
const bite = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

await bite("fixture queue + AST + crop pair exist", () => {
  assert.ok(existsSync(HTML_BEFORE), "queue-cta-before.html");
  assert.ok(existsSync(TSX_AST), "queue-dual-cta-ast.tsx");
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === CROP_PAIR_ID);
  assert.ok(pair, "queue-cta-tsx crop pair");
  assert.equal(typeof pair.buildAfter, "function");
  ensureDefectCropReceipts(RECEIPTS);
  assert.ok(existsSync(join(RECEIPTS, pair.beforeCrop)));
  assert.ok(existsSync(join(RECEIPTS, pair.afterCrop)));
});

await bite("loop source wires AST repair + prove + crop", () => {
  assert.match(loopSrc, /applyTsxRestructure/);
  assert.match(loopSrc, /writeCompletionProveReceipt/);
  assert.match(loopSrc, /assertCropPairOk|DEFECT_CROP_PAIRS/);
  assert.match(loopSrc, /opsAppliedAst/);
  assert.match(loopSrc, /mintProve/);
  assert.match(loopSrc, /cropPairId/);
  assert.match(loopSrc, /measure→repair→critic/);
});

await bite("e2e measure→AST repair→Critic≠Actor→prove + FAIL→PASS crop", async () => {
  const out = mkdtempSync(join(tmpdir(), "shine-denoise-loop-e2e-"));
  const completionStore = join(out, "last-completion.json");
  try {
    const beforeTsx = readFileSync(TSX_AST, "utf8");
    const beforeFilled = countFilledButtonsTsx(beforeTsx);
    assert.ok(
      beforeFilled.filled >= 2,
      `fixture queue TSX must start with ≥2 filled, got ${beforeFilled.filled}`,
    );

    const receipt = await runDenoiseLoop({
      htmlPath: HTML_BEFORE,
      tsxPath: TSX_AST,
      job: "Decide Pursue/Review/Dismiss on the next notice",
      category: "queue",
      cite: "shadcn-queue",
      outDir: out,
      mintProve: true,
      cropPairId: CROP_PAIR_ID,
      completionReceiptPath: completionStore,
    });

    // Named denoise defects cleared on fixture queue (FAIL→PASS bar)
    assert.equal(receipt.status, "passed", `loop status: ${receipt.status}; remaining=${JSON.stringify(receipt.namedDenoiseRemaining)}`);
    assert.equal(receipt.measureCleared, true);
    assert.equal(receipt.namedDenoiseCleared, true);
    assert.deepEqual(receipt.namedDenoiseRemaining || [], []);
    assert.equal(receipt.repairSubstrate, "ast+dom");
    assert.ok(receipt.opsApplied.includes("cta-budget"), `DOM ops: ${receipt.opsApplied}`);
    assert.ok(
      receipt.opsAppliedAst.includes("cta-budget"),
      `AST ops missing cta-budget: ${JSON.stringify(receipt.opsAppliedAst)}`,
    );

    // AST artifact actually demoted peers
    assert.ok(receipt.tsxArtifact && existsSync(receipt.tsxArtifact), "tsx artifact");
    const afterTsx = readFileSync(receipt.tsxArtifact, "utf8");
    const afterFilled = countFilledButtonsTsx(afterTsx);
    assert.equal(
      afterFilled.filled,
      1,
      `AST repair must leave 1 filled, got ${afterFilled.filled}: ${afterFilled.labels.join(",")}`,
    );
    assert.notEqual(beforeTsx, afterTsx, "AST repair must rewrite TSX");

    // Critic≠Actor principals + cycle
    assert.equal(receipt.criticActor?.cycle, "measure→repair→critic");
    assert.equal(receipt.criticActor?.selfAcceptBanned, true);
    assert.equal(receipt.criticActor?.workerSelfReviewBanned, true);
    assert.equal(receipt.criticActor?.criticAgentId, DEFAULT_CRITIC_ID);
    assert.equal(receipt.criticActor?.actorAgentId, DEFAULT_ACTOR_ID);
    assert.equal(receipt.criticActor?.hostAgentId, DEFAULT_HOST_ID);
    assert.notEqual(receipt.criticActor.criticAgentId, receipt.criticActor.actorAgentId);
    assert.notEqual(receipt.criticActor.hostAgentId, receipt.criticActor.criticAgentId);
    assert.notEqual(receipt.criticActor.hostAgentId, receipt.criticActor.actorAgentId);
    if (receipt.criticActor.lastRepairWorkerId) {
      assert.notEqual(
        receipt.criticActor.criticAgentId,
        receipt.criticActor.lastRepairWorkerId,
        "Critic must ≠ repair worker",
      );
      assert.notEqual(
        receipt.criticActor.hostAccept?.acceptorId,
        receipt.criticActor.lastRepairWorkerId,
        "Host finalize must ≠ repair worker",
      );
    }

    // Atlas stop + constitution on loop receipt
    assert.equal(receipt.reflexionVerdict, "done");
    assert.ok(Array.isArray(receipt.constitutionIds) && receipt.constitutionIds.length >= 7);
    assert.ok(receipt.constitutionIds.includes("cta-pressure"));
    assert.ok(receipt.constitutionIds.includes("prove-mandatory"));
    assert.ok(receipt.ddrId?.startsWith("ddr_"));

    // Prove completion stamps reflexionVerdict + constitutionIds
    assert.ok(receipt.prove, "prove receipt required");
    assert.equal(receipt.prove.tool, "prove.mjs");
    assert.equal(receipt.prove.verdict, "passed");
    assert.equal(receipt.prove.reflexionVerdict, "done");
    assert.equal(receipt.prove.ddrId, receipt.ddrId);
    assert.deepEqual(receipt.prove.constitutionIds, receipt.constitutionIds);
    assert.equal(receipt.prove.constitutionLinked, true);
    assert.ok(existsSync(completionStore), "completion store written");
    const store = JSON.parse(readFileSync(completionStore, "utf8"));
    assert.equal(store.version, 1);
    assert.ok(store.receipts?.some((r) => r.ddrId === receipt.ddrId && r.reflexionVerdict === "done"));

    // FAIL→PASS crop — not twins
    assert.ok(receipt.crop?.ok, "crop receipt required");
    assert.equal(receipt.crop.pairId, CROP_PAIR_ID);
    assert.match(receipt.crop.proof || "", /FAIL→PASS/);
    const pair = DEFECT_CROP_PAIRS.find((p) => p.id === CROP_PAIR_ID);
    const read = (name) => readFileSync(join(RECEIPTS, name), "utf8");
    const cropCheck = assertCropPairOk(pair, read);
    assert.equal(cropCheck.ok, true, cropCheck.errors.join("; "));
    assert.notEqual(read(pair.beforeCrop), read(pair.afterCrop), "crop twins banned");

    assert.ok(existsSync(join(out, "denoise-loop-receipt.json")));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

await bite("doctor + npm wire this bite", () => {
  assert.match(doctorSrc, /denoise-loop-e2e-bite\.mjs/);
  assert.match(pkg, /denoise-loop-e2e-bite|denoise:loop-e2e/);
  assert.match(pkg, /"denoise:loop"/);
});

console.log(`denoise-loop-e2e-bite.mjs: ok (${passed} bites)`);
