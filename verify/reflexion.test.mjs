#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DEFAULT_ACTOR_ID,
  DEFAULT_CRITIC_ID,
  DEFAULT_HOST_ID,
  VERDICTS,
  acceptVerdict,
  assertAtlasReflexionVerdict,
  assertDistinctPrincipals,
  canAcceptVerdict,
  compressTranscript,
  createAgentIdentity,
  heuristicCritic,
  isAtlasReflexionVerdict,
  normalizeVerdict,
  planActorPass,
  resolveStopReflexionVerdict,
  runCriticTurn,
  runReflexion,
  shouldRetry,
} from "../core/reflexion.mjs";

assert.deepEqual(VERDICTS, ["done", "partial", "blocked", "error"]);
assert.equal(normalizeVerdict("PARTIAL"), "partial");
assert.equal(normalizeVerdict("unknown"), "partial");
assert.equal(isAtlasReflexionVerdict("done"), true);
assert.equal(isAtlasReflexionVerdict("passed"), false);
assert.equal(assertAtlasReflexionVerdict("DONE"), "done");
assert.throws(() => assertAtlasReflexionVerdict(""), /missing/);
assert.throws(() => assertAtlasReflexionVerdict("passed"), /done\|partial\|blocked\|error/);
assert.equal(resolveStopReflexionVerdict({ cleared: true }), "done");
assert.equal(resolveStopReflexionVerdict({ hostAccepted: true }), "done");
assert.equal(
  resolveStopReflexionVerdict({ cleared: false, reflexion: { verdict: "blocked" } }),
  "blocked",
);
assert.equal(resolveStopReflexionVerdict({ cleared: false, reflexion: null }), "error");

const critic = createAgentIdentity({ role: "critic", agentId: DEFAULT_CRITIC_ID });
const actor = createAgentIdentity({ role: "actor", agentId: DEFAULT_ACTOR_ID });
assertDistinctPrincipals(critic, actor);
assert.throws(
  () =>
    assertDistinctPrincipals(
      createAgentIdentity({ role: "critic", agentId: "same" }),
      createAgentIdentity({ role: "actor", agentId: "same" }),
    ),
  /Critic ≠ Actor/,
);

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
assert.ok(cta.antiPatternIds?.includes("competing-filled-ctas"));
assert.ok(cta.constitutionIds?.includes("cta-pressure"));

const blocked = heuristicCritic({ failures: ["denoise refuses without --category"] });
assert.equal(blocked.verdict, "blocked");
assert.ok(blocked.question);

const dir = mkdtempSync(join(tmpdir(), "shine-reflexion-"));
process.env.SHINE_REFLEXION_DIR = dir;
try {
  const result = await runCriticTurn({
    goal: "Decide Pursue on the next notice",
    failures: ["cta-pressure: 2 filled primaries in main"],
    ddrId: "ddr_test_abc",
    constitutionIds: ["cta-pressure"],
  });
  assert.equal(result.verdict, "partial");
  assert.equal(result.ddrId, "ddr_test_abc");
  assert.equal(result.turn.role, "critic");
  assert.equal(result.turn.implements, false);
  assert.ok(result.lessonPath);
  assert.equal(result.selfAcceptBanned, true);
  assert.equal(result.acceptByCritic.ok, false);
  assert.equal(result.acceptByActor.ok, false);
  assert.match(result.acceptByCritic.reason, /self-accept/i);
  assert.match(result.acceptByActor.reason, /Actor\/worker cannot accept/);

  const selfAccept = acceptVerdict({ reflexion: result, acceptorId: result.criticAgentId });
  assert.equal(selfAccept.accepted, false);

  const actorAccept = acceptVerdict({ reflexion: result, acceptorId: result.actorAgentId });
  assert.equal(actorAccept.accepted, false);

  const hostAccept = acceptVerdict({ reflexion: result, acceptorId: DEFAULT_HOST_ID });
  assert.equal(hostAccept.accepted, true);

  const actorPlan = planActorPass(result, { actorAgentId: DEFAULT_ACTOR_ID, retriesUsed: 0 });
  assert.equal(actorPlan.proceed, true);
  assert.equal(actorPlan.turn.role, "actor");
  assert.match(actorPlan.nextStep, /cta-budget/);

  assert.equal(shouldRetry(result, { retriesUsed: 0 }), true);
  assert.equal(shouldRetry(result, { retriesUsed: 1 }), false);

  const done = await runReflexion({ goal: "ok", failures: [], ddrId: "ddr_test_abc" });
  assert.equal(done.verdict, "done");
  assert.equal(canAcceptVerdict({ reflexion: done, acceptorId: DEFAULT_CRITIC_ID }).ok, false);
  assert.equal(canAcceptVerdict({ reflexion: done, acceptorId: DEFAULT_HOST_ID }).ok, true);

  const collided = await runReflexion({
    failures: ["cta-pressure: x"],
    criticAgentId: "twin",
    actorAgentId: "twin",
  });
  assert.equal(collided.verdict, "error");
  assert.match(collided.recommendation, /Critic ≠ Actor/);

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

console.log(
  "reflexion PASS: Atlas verdicts · stop stamp · Critic≠Actor · self-accept ban · host accept · bound retry",
);
