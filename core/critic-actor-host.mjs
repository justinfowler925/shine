#!/usr/bin/env node
/**
 * Critic ≠ Actor host wiring — strengthens S1 after #137.
 *
 * Thin spots this closes:
 *   1. Protocol was inlined only in denoise-loop (easy to bypass).
 *   2. Host accepted only when critic said `done` mid-fail; after Actor cleared
 *      measure on a `partial` nextStep, hostAccept stayed null (no finalize).
 *   3. No shared fail-closed gate that Actor may proceed only via planActorPass.
 *
 * Host (third principal) is the only acceptor. Critic diagnoses; Actor executes
 * one partial nextStep; Host finalizes `done` or post-clearance.
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_ACTOR_ID,
  DEFAULT_CRITIC_ID,
  DEFAULT_HOST_ID,
  acceptVerdict,
  assertDistinctPrincipals,
  canAcceptVerdict,
  createAgentIdentity,
  planActorPass,
  runCriticTurn,
} from "./reflexion.mjs";

export { DEFAULT_ACTOR_ID, DEFAULT_CRITIC_ID, DEFAULT_HOST_ID };

/**
 * Fail-closed: Actor implement requires a critic `partial` planned by planActorPass.
 */
export function assertActorMayImplement(actorPlan, { action = "implement" } = {}) {
  if (!actorPlan) {
    throw new Error(`Critic≠Actor host: missing actorPlan — refuse ${action}`);
  }
  if (actorPlan.turn?.role !== "actor") {
    throw new Error(`Critic≠Actor host: actorPlan.turn.role must be actor — refuse ${action}`);
  }
  if (!actorPlan.proceed) {
    throw new Error(
      `Critic≠Actor host: Actor may not ${action} (${actorPlan.reason || "proceed=false"})`,
    );
  }
  if (!actorPlan.nextStep) {
    throw new Error(`Critic≠Actor host: Actor ${action} requires nextStep from critic partial`);
  }
  return true;
}

/**
 * Fail-closed: neither Critic nor Actor may accept; Host must.
 */
export function assertHostMayAccept({ reflexion, hostAgentId = DEFAULT_HOST_ID } = {}) {
  const host = String(hostAgentId || "").trim() || DEFAULT_HOST_ID;
  const gate = canAcceptVerdict({ reflexion, acceptorId: host });
  if (!gate.ok) {
    throw new Error(`Critic≠Actor host: cannot accept — ${gate.reason}`);
  }
  // Belt: explicit principal collision check.
  if (reflexion?.criticAgentId && host === reflexion.criticAgentId) {
    throw new Error("Critic≠Actor host: hostAgentId collides with criticAgentId");
  }
  if (reflexion?.actorAgentId && host === reflexion.actorAgentId) {
    throw new Error("Critic≠Actor host: hostAgentId collides with actorAgentId");
  }
  return true;
}

/**
 * One Critic→(Host accept | Actor plan) round. Callers must not skip this for
 * measure/prove fail retries.
 *
 * @returns {Promise<{
 *   disposition: "host-accepted"|"actor-proceed"|"blocked"|"error"|"human-gate",
 *   reflexion: object,
 *   hostAccept: object|null,
 *   actorPlan: object|null,
 *   principals: { criticAgentId, actorAgentId, hostAgentId }
 * }>}
 */
export async function runCriticActorHostRound({
  goal = "",
  failures = [],
  tried = [],
  messages = [],
  constitutionIds = [],
  antiPatternIds = [],
  ddrId = "",
  callCritic = null,
  storeLesson = true,
  criticAgentId = DEFAULT_CRITIC_ID,
  actorAgentId = DEFAULT_ACTOR_ID,
  hostAgentId = DEFAULT_HOST_ID,
  retriesUsed = 0,
} = {}) {
  const critic = createAgentIdentity({ role: "critic", agentId: criticAgentId });
  const actor = createAgentIdentity({ role: "actor", agentId: actorAgentId });
  assertDistinctPrincipals(critic, actor);
  const host = String(hostAgentId || "").trim() || DEFAULT_HOST_ID;
  if (host === critic.agentId || host === actor.agentId) {
    throw new Error("Critic≠Actor host: host must be a third distinct principal");
  }

  const reflexion = await runCriticTurn({
    goal,
    failures,
    tried,
    messages,
    constitutionIds,
    antiPatternIds,
    ddrId,
    callCritic,
    storeLesson,
    criticAgentId: critic.agentId,
    actorAgentId: actor.agentId,
  });

  const principals = {
    criticAgentId: critic.agentId,
    actorAgentId: actor.agentId,
    hostAgentId: host,
  };

  // Self-accept ban proof on the round.
  if (canAcceptVerdict({ reflexion, acceptorId: critic.agentId }).ok) {
    throw new Error("Critic≠Actor invariant broken: critic canAccept returned ok");
  }
  if (canAcceptVerdict({ reflexion, acceptorId: actor.agentId }).ok) {
    throw new Error("Critic≠Actor invariant broken: actor canAccept returned ok");
  }

  if (reflexion.verdict === "done") {
    assertHostMayAccept({ reflexion, hostAgentId: host });
    const hostAccept = acceptVerdict({ reflexion, acceptorId: host });
    if (!hostAccept.accepted) {
      throw new Error(`Critic≠Actor host: accept failed — ${hostAccept.reason}`);
    }
    return {
      disposition: "host-accepted",
      reflexion,
      hostAccept,
      actorPlan: planActorPass(reflexion, { actorAgentId: actor.agentId, retriesUsed }),
      principals,
    };
  }

  if (reflexion.verdict === "blocked" || reflexion.verdict === "error") {
    return {
      disposition: reflexion.verdict === "blocked" ? "blocked" : "error",
      reflexion,
      hostAccept: null,
      actorPlan: planActorPass(reflexion, { actorAgentId: actor.agentId, retriesUsed }),
      principals,
    };
  }

  // partial → Actor may take one nextStep (host does not accept partial).
  const actorPlan = planActorPass(reflexion, {
    actorAgentId: actor.agentId,
    retriesUsed,
  });
  if (!actorPlan.proceed) {
    return {
      disposition: "human-gate",
      reflexion,
      hostAccept: null,
      actorPlan,
      principals,
    };
  }
  assertActorMayImplement(actorPlan);
  return {
    disposition: "actor-proceed",
    reflexion,
    hostAccept: null,
    actorPlan,
    principals,
  };
}

/**
 * After Actor executed a partial nextStep and measure/prove cleared, Host must
 * finalize — closes the #137 thin spot where hostAccept stayed null.
 */
export function hostFinalizeAfterClearance({
  reflexion,
  hostAgentId = DEFAULT_HOST_ID,
  measureStatus = 0,
  note = "Measure cleared after Actor pass — host finalizes",
} = {}) {
  if (measureStatus !== 0) {
    return {
      accepted: false,
      reason: "measure not cleared — host will not finalize",
      verdict: reflexion?.verdict ?? null,
      acceptorId: hostAgentId,
    };
  }
  if (!reflexion) {
    return {
      accepted: false,
      reason: "no critic reflexion to finalize",
      verdict: null,
      acceptorId: hostAgentId,
    };
  }
  // Promote to done for acceptance bookkeeping; keep original nextStep as audit.
  const finalizable = {
    ...reflexion,
    verdict: "done",
    recommendation: reflexion.recommendation || note,
    nextStep: null,
    clearanceNote: note,
    priorVerdict: reflexion.verdict,
  };
  assertHostMayAccept({ reflexion: finalizable, hostAgentId });
  const accepted = acceptVerdict({ reflexion: finalizable, acceptorId: hostAgentId });
  return {
    ...accepted,
    clearanceNote: note,
    priorVerdict: reflexion.verdict,
  };
}

/**
 * Receipt must show host finalized whenever a critic round ran and work cleared.
 */
export function assertHostFinalized(criticActorReceipt, { requireWhenCriticRan = true } = {}) {
  const ran =
    Boolean(criticActorReceipt?.hostAccept) ||
    (Array.isArray(criticActorReceipt?.rounds) &&
      criticActorReceipt.rounds.some((r) => r.reflexion || r.turn === "critic" || r.turn === "actor"));
  if (!requireWhenCriticRan) return true;
  if (!ran) return true; // no critic path (e.g. round-1 apply cleared) — OK
  const cleared = criticActorReceipt?.status === "passed" || criticActorReceipt?.measureCleared;
  if (!cleared) return true; // still failing — host finalize optional until green
  if (!criticActorReceipt?.hostAccept?.accepted) {
    throw new Error(
      "Critic≠Actor host: measure cleared after critic/actor rounds but hostAccept missing — call hostFinalizeAfterClearance",
    );
  }
  const acceptor = criticActorReceipt.hostAccept.acceptorId;
  if (
    acceptor &&
    (acceptor === criticActorReceipt.criticAgentId || acceptor === criticActorReceipt.actorAgentId)
  ) {
    throw new Error("Critic≠Actor host: hostAccept.acceptorId collides with critic/actor");
  }
  return true;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const failures = args.filter((a, i) => args[i - 1] === "--fail");
  const round = await runCriticActorHostRound({
    goal: opt("--goal") || "Clear measure/prove failures",
    failures: failures.length ? failures : [opt("--fail") || "cta-pressure: 2 filled in main"].filter(Boolean),
    ddrId: opt("--ddr") || "",
    constitutionIds: (opt("--constitution") || "cta-pressure").split(",").filter(Boolean),
  });
  process.stdout.write(JSON.stringify(round, null, 2) + "\n");
  process.exit(round.disposition === "error" ? 1 : 0);
}
