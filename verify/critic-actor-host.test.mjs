#!/usr/bin/env node
/**
 * Critic≠Actor host orchestrator bites — measure→repair→critic + self-review ban.
 */
import assert from "node:assert/strict";
import {
  DEFAULT_ACTOR_ID,
  DEFAULT_CRITIC_ID,
  DEFAULT_HOST_ID,
  assertActorMayImplement,
  assertHostFinalized,
  assertHostMayAccept,
  assertNoWorkerSelfReview,
  completeAfterRepair,
  hostFinalizeAfterClearance,
  planRepairFromMeasure,
  repairWorkerId,
  runCriticActorHostRound,
  runPostRepairCriticRound,
} from "../core/critic-actor-host.mjs";
import { acceptVerdict, canAcceptVerdict } from "../core/reflexion.mjs";

const partial = await runCriticActorHostRound({
  goal: "Decide Pursue on the next notice",
  failures: ["cta-pressure: 2 filled in main"],
  ddrId: "ddr_host_test",
  constitutionIds: ["cta-pressure"],
});
assert.equal(partial.disposition, "actor-proceed");
assert.equal(partial.reflexion.verdict, "partial");
assert.equal(partial.hostAccept, null);
assertActorMayImplement(partial.actorPlan);
assert.equal(partial.principals.hostAgentId, DEFAULT_HOST_ID);
assert.notEqual(partial.principals.hostAgentId, partial.principals.criticAgentId);
assert.notEqual(partial.principals.hostAgentId, partial.principals.actorAgentId);

// Critic/Actor cannot accept; Host can (on done) / finalize after clearance.
assert.equal(canAcceptVerdict({ reflexion: partial.reflexion, acceptorId: DEFAULT_CRITIC_ID }).ok, false);
assert.equal(canAcceptVerdict({ reflexion: partial.reflexion, acceptorId: DEFAULT_ACTOR_ID }).ok, false);
assert.throws(
  () => assertActorMayImplement({ proceed: false, reason: "budget", turn: { role: "actor" } }),
  /may not implement/,
);

const cleared = hostFinalizeAfterClearance({
  reflexion: partial.reflexion,
  hostAgentId: DEFAULT_HOST_ID,
  measureStatus: 0,
});
assert.equal(cleared.accepted, true);
assert.equal(cleared.verdict, "done");
assert.equal(cleared.priorVerdict, "partial");
assert.equal(cleared.acceptorId, DEFAULT_HOST_ID);

assert.throws(
  () =>
    hostFinalizeAfterClearance({
      reflexion: partial.reflexion,
      hostAgentId: DEFAULT_CRITIC_ID,
      measureStatus: 0,
    }),
  /self-accept|collides|cannot accept/i,
);

const doneRound = await runCriticActorHostRound({
  goal: "ok",
  failures: [],
  ddrId: "ddr_host_done",
});
assert.equal(doneRound.disposition, "host-accepted");
assert.equal(doneRound.hostAccept.accepted, true);
assertHostMayAccept({ reflexion: doneRound.reflexion, hostAgentId: DEFAULT_HOST_ID });

assert.throws(
  () =>
    assertHostFinalized({
      criticAgentId: DEFAULT_CRITIC_ID,
      actorAgentId: DEFAULT_ACTOR_ID,
      hostAccept: null,
      rounds: [{ turn: "actor", reflexion: { verdict: "partial" } }],
      status: "passed",
      measureCleared: true,
    }),
  /hostAccept missing/,
);

assertHostFinalized({
  criticAgentId: DEFAULT_CRITIC_ID,
  actorAgentId: DEFAULT_ACTOR_ID,
  hostAccept: cleared,
  rounds: [{ turn: "actor" }],
  status: "passed",
  measureCleared: true,
});

// Host must be third principal
await assert.rejects(
  () =>
    runCriticActorHostRound({
      failures: ["cta-pressure: x"],
      hostAgentId: DEFAULT_CRITIC_ID,
    }),
  /third distinct principal|host must/,
);

const selfAccept = acceptVerdict({
  reflexion: doneRound.reflexion,
  acceptorId: DEFAULT_CRITIC_ID,
});
assert.equal(selfAccept.accepted, false);

// --- measure→repair→critic + worker self-review fail-closed ---

assertNoWorkerSelfReview({
  workerAgentId: DEFAULT_ACTOR_ID,
  criticAgentId: DEFAULT_CRITIC_ID,
});
assert.throws(
  () =>
    assertNoWorkerSelfReview({
      workerAgentId: "twin-worker",
      criticAgentId: "twin-worker",
    }),
  /worker self-review banned/,
);

const planned = await planRepairFromMeasure({
  goal: "Decide Pursue on the next notice",
  failures: ["cta-pressure: 2 filled in main"],
  ddrId: "ddr_mrc_plan",
  constitutionIds: ["cta-pressure"],
});
assert.equal(planned.phase, "measure-repair-plan");
assert.equal(planned.disposition, "actor-proceed");
const workerId = repairWorkerId(planned.actorPlan);
assert.equal(workerId, DEFAULT_ACTOR_ID);

const afterRepair = completeAfterRepair({
  actorPlan: planned.actorPlan,
  reflexion: planned.reflexion,
  measureStatus: 0,
  hostAgentId: DEFAULT_HOST_ID,
});
assert.equal(afterRepair.phase, "repair-complete");
assert.equal(afterRepair.workerAgentId, DEFAULT_ACTOR_ID);
assert.equal(afterRepair.hostAccept.accepted, true);
assert.equal(afterRepair.measureCleared, true);

assert.throws(
  () =>
    completeAfterRepair({
      actorPlan: planned.actorPlan,
      reflexion: planned.reflexion,
      measureStatus: 0,
      hostAgentId: DEFAULT_ACTOR_ID,
    }),
  /repair worker cannot host-finalize|self-review/,
);

// Post-repair critic must ≠ worker who repaired.
const post = await runPostRepairCriticRound({
  workerAgentId: DEFAULT_ACTOR_ID,
  goal: "still failing",
  failures: ["kpi-soup: 4 equal metrics"],
  ddrId: "ddr_mrc_post",
  constitutionIds: ["kpi-soup-off-path"],
});
assert.equal(post.phase, "post-repair-critic");
assert.equal(post.workerAgentId, DEFAULT_ACTOR_ID);
assert.notEqual(post.reflexion.criticAgentId, post.workerAgentId);
assert.equal(post.disposition, "actor-proceed");

await assert.rejects(
  () =>
    runPostRepairCriticRound({
      workerAgentId: DEFAULT_CRITIC_ID,
      failures: ["cta-pressure: x"],
      criticAgentId: DEFAULT_CRITIC_ID,
    }),
  /worker self-review banned/,
);

// planRepairFromMeasure refuses when lastRepairWorkerId === criticAgentId
await assert.rejects(
  () =>
    planRepairFromMeasure({
      failures: ["cta-pressure: x"],
      lastRepairWorkerId: DEFAULT_CRITIC_ID,
      criticAgentId: DEFAULT_CRITIC_ID,
    }),
  /worker self-review banned/,
);

console.log(
  "critic-actor-host PASS: host round · actor gate · finalize · measure→repair→critic · worker self-review ban",
);
