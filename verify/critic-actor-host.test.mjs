#!/usr/bin/env node
/**
 * Critic≠Actor host orchestrator bites — closes thin wiring after #137.
 */
import assert from "node:assert/strict";
import {
  DEFAULT_ACTOR_ID,
  DEFAULT_CRITIC_ID,
  DEFAULT_HOST_ID,
  assertActorMayImplement,
  assertHostFinalized,
  assertHostMayAccept,
  hostFinalizeAfterClearance,
  runCriticActorHostRound,
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

console.log(
  "critic-actor-host PASS: host round · actor gate · finalize after clearance · self-accept ban",
);
