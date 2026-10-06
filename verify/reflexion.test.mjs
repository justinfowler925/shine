#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  compressTranscript,
  heuristicCritic,
  normalizeVerdict,
  runReflexion,
  shouldRetry,
  VERDICTS,
} from "../core/reflexion.mjs";

assert.deepEqual(VERDICTS, ["done", "partial", "blocked", "error"]);
assert.equal(normalizeVerdict("PARTIAL"), "partial");
assert.equal(normalizeVerdict("unknown"), "partial");

const compressed = compressTranscript([
  { role: "system", content: "ignore me" },
  { role: "user", content: "denoise the queue" },
  { role: "assistant", content: "x".repeat(800), tool: "measure" },
]);
assert.ok(!/ignore me/.test(compressed));
assert.ok(compressed.length < 600);

const cta = heuristicCritic({ failures: ["cta-pressure: 2 filled in main"] });
assert.equal(cta.verdict, "partial");
assert.match(cta.nextStep, /cta-budget/);

const blocked = heuristicCritic({ failures: ["denoise refuses without --category"] });
assert.equal(blocked.verdict, "blocked");
assert.ok(blocked.question);

const dir = mkdtempSync(join(tmpdir(), "shine-reflexion-"));
process.env.SHINE_REFLEXION_DIR = dir;
try {
  const result = await runReflexion({
    goal: "Decide Pursue on the next notice",
    failures: ["cta-pressure: 2 filled primaries in main"],
    ddrId: "ddr_test_abc",
    constitutionIds: ["cta-pressure"],
  });
  assert.equal(result.verdict, "partial");
  assert.equal(result.ddrId, "ddr_test_abc");
  assert.ok(result.lessonPath);
  assert.equal(shouldRetry(result, { retriesUsed: 0 }), true);
  assert.equal(shouldRetry(result, { retriesUsed: 1 }), false);

  const done = await runReflexion({ goal: "ok", failures: [], ddrId: "ddr_test_abc" });
  assert.equal(done.verdict, "done");

  const errored = await runReflexion({
    failures: ["cta-pressure: x"],
    callCritic: async () => {
      throw new Error("boom");
    },
  });
  assert.equal(errored.verdict, "error");
} finally {
  rmSync(dir, { recursive: true, force: true });
  delete process.env.SHINE_REFLEXION_DIR;
}

console.log("reflexion PASS: Atlas verdicts · heuristic next ops · ddrId lesson store · bound retry");
