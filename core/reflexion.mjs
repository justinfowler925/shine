#!/usr/bin/env node
/**
 * Atlas-shaped Reflexion (enterprise-agent plan §4) + Critic ≠ Actor turns (S1).
 *
 * One critic call, no tools, ≤400 tokens, low temp.
 * Verdicts: done | partial | blocked | error (unknown → partial).
 * Fire on prove/measure fail or tool-iteration exhaustion.
 * Store lessons only with ddrId after a real prove fail.
 *
 * Critic ≠ Actor:
 *   - Diagnose/critic pass is a separate turn from Actor implement.
 *   - Critic and Actor must be distinct principals.
 *   - Neither Critic nor Actor may accept the critic verdict (self-accept ban).
 *   - Host/owner accepts `done` / finalizes; Actor only executes `partial` nextStep.
 *
 * Hosts inject `callCritic` (LLM) when available; without it, a deterministic
 * heuristic critic runs so doctor bites stay offline-green.
 */

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import {
  commitCiteBansFromProveFail,
  inferCiteBansFromProveFail,
  isCiteFailCategory,
} from "./learn.mjs";

export const VERDICTS = Object.freeze(["done", "partial", "blocked", "error"]);
export const TURN_ROLES = Object.freeze(["critic", "actor"]);
export const MAX_CRITIC_TOKENS = 400;
export const DEFAULT_TEMPERATURE = 0.2;
/** Bound retries: one extra Actor pass after partial. */
export const MAX_REFLEXION_RETRIES = 1;

/** Default offline identities when hosts do not inject principals. */
export const DEFAULT_CRITIC_ID = "shine-critic";
export const DEFAULT_ACTOR_ID = "shine-actor";
export const DEFAULT_HOST_ID = "shine-host";

const LESSON_DIR = () =>
  process.env.SHINE_REFLEXION_DIR || join(homedir(), ".cache/shine/reflexion");

export function normalizeVerdict(raw) {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (VERDICTS.includes(v)) return v;
  return "partial";
}

/**
 * @param {{ role: "critic"|"actor", agentId: string }} identity
 */
export function createAgentIdentity({ role, agentId } = {}) {
  if (!TURN_ROLES.includes(role)) {
    throw new Error(`role must be critic|actor, got ${role}`);
  }
  const id = String(agentId || "").trim();
  if (id.length < 2) throw new Error("agentId required");
  return Object.freeze({ role, agentId: id });
}

/**
 * Critic and Actor must be distinct principals (Atlas / studio-agents rule).
 */
export function assertDistinctPrincipals(critic, actor) {
  if (!critic?.agentId || critic.role !== "critic") {
    throw new Error("critic identity required (role=critic)");
  }
  if (!actor?.agentId || actor.role !== "actor") {
    throw new Error("actor identity required (role=actor)");
  }
  if (critic.agentId === actor.agentId) {
    throw new Error(
      "Critic ≠ Actor: critic and actor must be distinct principals (self-review banned)",
    );
  }
}

/**
 * Self-accept ban: Critic cannot accept its own verdict; Actor/worker cannot
 * accept the critic verdict on its own work. Host/owner (third principal) accepts.
 */
export function canAcceptVerdict({ reflexion, acceptorId } = {}) {
  if (!reflexion) return { ok: false, reason: "missing reflexion" };
  const acceptor = String(acceptorId || "").trim();
  if (!acceptor) return { ok: false, reason: "acceptorId required" };
  if (reflexion.criticAgentId && acceptor === reflexion.criticAgentId) {
    return { ok: false, reason: "Critic cannot self-accept its own verdict" };
  }
  if (reflexion.actorAgentId && acceptor === reflexion.actorAgentId) {
    return {
      ok: false,
      reason: "Actor/worker cannot accept the critic verdict on its own work",
    };
  }
  return { ok: true, reason: null };
}

export function acceptVerdict({ reflexion, acceptorId } = {}) {
  const gate = canAcceptVerdict({ reflexion, acceptorId });
  if (!gate.ok) {
    return {
      accepted: false,
      reason: gate.reason,
      verdict: reflexion?.verdict ?? null,
      acceptorId: acceptorId || null,
    };
  }
  return {
    accepted: true,
    reason: null,
    verdict: reflexion.verdict,
    recommendation: reflexion.recommendation ?? null,
    nextStep: reflexion.nextStep ?? null,
    question: reflexion.question ?? null,
    acceptorId,
    criticAgentId: reflexion.criticAgentId || null,
    actorAgentId: reflexion.actorAgentId || null,
  };
}

/**
 * Compress transcript for critic input — truncate tool bodies, drop system msgs.
 * @param {Array<{role?:string, content?:string, tool?:string}>} messages
 */
export function compressTranscript(messages = [], { maxChars = 2400 } = {}) {
  const parts = [];
  for (const m of messages) {
    if (!m || m.role === "system") continue;
    const role = m.role || (m.tool ? "tool" : "user");
    let content = String(m.content || "").replace(/\s+/g, " ").trim();
    if (m.tool) content = `[tool:${m.tool}] ${content.slice(0, 200)}`;
    if (content.length > 400) content = content.slice(0, 400) + "…";
    parts.push(`${role}: ${content}`);
  }
  let out = parts.join("\n");
  if (out.length > maxChars) out = out.slice(-maxChars);
  return out;
}

export function buildCriticPrompt({
  goal = "",
  failures = [],
  tried = [],
  transcript = "",
  constitutionIds = [],
  ddrId = "",
  antiPatternIds = [],
} = {}) {
  const failList = (failures.length ? failures : ["unspecified measure/prove failure"])
    .slice(0, 8)
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");
  const triedList = (tried.length ? tried : ["none recorded"]).slice(0, 6).join("; ");
  const constitution = (constitutionIds || []).slice(0, 8).join(", ") || "prove-mandatory";
  const anti = (antiPatternIds || []).slice(0, 8).join(", ") || "(none)";
  return [
    "You are the Shine design critic. One call. No tools. ≤400 tokens.",
    "You diagnose only — you do not implement. Critic ≠ Actor.",
    "Verdict must be exactly one of: done | partial | blocked | error.",
    "done → recommendation is the final reply (host accepts; you cannot self-accept).",
    "partial → one imperative next step for ONE more Actor pass (do not restart analysis).",
    "blocked → one clarifying question only.",
    "error → critic failure; turn still finalizes.",
    `Constitution IDs to cite when relevant: ${constitution}`,
    `Anti-pattern IDs (knowledge/anti-patterns): ${anti}`,
    ddrId ? `DDR: ${ddrId}` : "DDR: (none)",
    `Goal: ${goal || "(unset)"}`,
    `Failures:\n${failList}`,
    `Tried: ${triedList}`,
    transcript ? `Transcript (compressed):\n${transcript}` : "",
    'Respond as JSON: {"verdict":"partial","recommendation":"...","nextStep":"...","constitutionIds":["cta-pressure"],"antiPatternIds":["competing-filled-ctas"],"lesson":"..."}',
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Deterministic offline critic — used when no LLM `callCritic` is injected.
 * Maps known measure failure prefixes to one next op.
 */
export function heuristicCritic({ failures = [], goal = "", constitutionIds = [] } = {}) {
  const blob = failures.join("\n").toLowerCase();
  if (!failures.length) {
    return {
      verdict: "done",
      recommendation: "No measure/prove failures remain — stop.",
      nextStep: null,
      constitutionIds: constitutionIds.slice(0, 3),
      antiPatternIds: [],
      lesson: null,
      source: "heuristic",
    };
  }
  if (/cta-pressure|competing.?cta|filled primary/.test(blob)) {
    return {
      verdict: "partial",
      recommendation: "Demote peer filled CTAs in main to outline/ghost; keep one job verb filled.",
      nextStep: "Apply op cta-budget (maxFilled:1) then re-run measure on the cropped main region.",
      constitutionIds: ["cta-pressure"],
      antiPatternIds: ["competing-filled-ctas"],
      lesson: "Operate main allows exactly one filled primary.",
      source: "heuristic",
    };
  }
  if (/dual-focal|peer.?grid|two (data)?grids/.test(blob)) {
    return {
      verdict: "partial",
      recommendation:
        "Collapse peer worklists to one focal grid; fold the other as saved-view/XOR (plan only — no silent delete).",
      nextStep:
        "Emit collapse-peer-grids plan markdown; keep one [role=grid] in the fold; re-measure dual-focal.",
      constitutionIds: ["dual-focal-ban"],
      antiPatternIds: ["dual-focal-grids"],
      lesson: "Two peer grids on one triage job is dual-focal.",
      source: "heuristic",
    };
  }
  if (/kpi-soup|equal.?kpi|metric/.test(blob)) {
    return {
      verdict: "partial",
      recommendation: "Collapse KPI soup to ≤3 chips; park the rest in <details>.",
      nextStep: "Apply op kpi-collapse (maxVisible:3) then re-run measure.",
      constitutionIds: ["kpi-soup-off-path"],
      antiPatternIds: ["kpi-soup"],
      lesson: "KPI encyclopedia must not own the decide path.",
      source: "heuristic",
    };
  }
  if (/composition-slop|card soup|no focal/.test(blob)) {
    return {
      verdict: "partial",
      recommendation: "Set one data-region=focal on the primary work object; demote equal Card peers.",
      nextStep: "Apply op set-focal then re-run measure.",
      constitutionIds: ["primary-task-3s"],
      antiPatternIds: ["card-soup"],
      lesson: "Equal Card roots without focal fail composition-slop.",
      source: "heuristic",
    };
  }
  if (/marketing dna|glow|gradient|display.?serif/.test(blob)) {
    return {
      verdict: "partial",
      recommendation: "Strip marketing DNA (glow/gradient/display-serif) from Operate chrome.",
      nextStep: "Remove marketing utility clusters; re-run composition-slop.",
      constitutionIds: ["cite-honesty"],
      antiPatternIds: ["marketing-dna-operate"],
      lesson: "Marketing DNA is illegal on saas Operate chrome.",
      source: "heuristic",
    };
  }
  if (/filler|welcome to your dashboard/.test(blob)) {
    return {
      verdict: "partial",
      recommendation: "Replace filler empty copy with job-specific instructional empty state.",
      nextStep: "Rewrite empty-state copy; re-run measure composition-slop filler check.",
      constitutionIds: ["cite-honesty"],
      antiPatternIds: ["filler-empty-copy"],
      lesson: "Filler empty phrases fail closed on Operate.",
      source: "heuristic",
    };
  }
  if (/category|ambiguous|ddr|not accepted/.test(blob)) {
    return {
      verdict: "blocked",
      recommendation: null,
      nextStep: null,
      question:
        "What is the Operate category (queue|settings|catalog|record|dashboard) and Monday job in one sentence?",
      constitutionIds: ["prove-mandatory"],
      antiPatternIds: [],
      lesson: null,
      source: "heuristic",
    };
  }
  return {
    verdict: "partial",
    recommendation: `Clear the named failure then re-prove: ${failures[0]}`,
    nextStep: `Fix the first failure (${String(failures[0]).slice(0, 120)}) and re-run measure/prove — do not restart diagnosis.`,
    constitutionIds: constitutionIds.slice(0, 2),
    antiPatternIds: [],
    lesson: goal ? `Toward: ${goal.slice(0, 120)}` : null,
    source: "heuristic",
  };
}

function parseCriticJson(text) {
  const raw = String(text || "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Critic turn — diagnose only. Never implements. Distinct from Actor.
 * @returns {Promise<object>} reflexion result with turn metadata
 */
export async function runCriticTurn(options = {}) {
  const critic = createAgentIdentity({
    role: "critic",
    agentId: options.criticAgentId || DEFAULT_CRITIC_ID,
  });
  const actor = createAgentIdentity({
    role: "actor",
    agentId: options.actorAgentId || DEFAULT_ACTOR_ID,
  });
  assertDistinctPrincipals(critic, actor);
  // Pass-through includes doctorBiteOk + cite evidence for learn hooks.
  const result = await runReflexion({
    ...options,
    criticAgentId: critic.agentId,
    actorAgentId: actor.agentId,
  });
  result.turn = {
    role: "critic",
    agentId: critic.agentId,
    kind: "diagnose",
    implements: false,
  };
  return result;
}

/**
 * Plan one Actor implement pass from a critic `partial` verdict.
 * Refuses when critic says done/blocked/error or when principals collide.
 */
export function planActorPass(reflexion, { actorAgentId = DEFAULT_ACTOR_ID, retriesUsed = 0 } = {}) {
  if (!reflexion) throw new Error("reflexion required");
  if (reflexion.criticAgentId && reflexion.criticAgentId === actorAgentId) {
    throw new Error("Critic ≠ Actor: actorAgentId collides with criticAgentId");
  }
  if (reflexion.verdict !== "partial") {
    return {
      proceed: false,
      reason: `Actor pass only on partial (got ${reflexion.verdict})`,
      nextStep: null,
      turn: { role: "actor", agentId: actorAgentId, kind: "implement" },
    };
  }
  if (!shouldRetry(reflexion, { retriesUsed })) {
    return {
      proceed: false,
      reason: "retry budget exhausted — humanGate",
      nextStep: null,
      turn: { role: "actor", agentId: actorAgentId, kind: "implement" },
    };
  }
  return {
    proceed: true,
    reason: null,
    nextStep: reflexion.nextStep || reflexion.recommendation,
    turn: { role: "actor", agentId: actorAgentId, kind: "implement" },
  };
}

/**
 * Run one critic call. `callCritic` optional: async (prompt) => string.
 * Never raises — verdict=error on failure so the turn finalizes.
 */
export async function runReflexion({
  goal = "",
  failures = [],
  tried = [],
  messages = [],
  constitutionIds = [],
  antiPatternIds = [],
  ddrId = "",
  callCritic = null,
  storeLesson = true,
  /** When true, cite-related prove fails also doctor-gate commit cite bans / edition anti-cites. */
  doctorBiteOk = false,
  observedCite = "",
  expectedCite = "",
  category = "",
  edition = "",
  learnStorePath = undefined,
  criticAgentId = DEFAULT_CRITIC_ID,
  actorAgentId = DEFAULT_ACTOR_ID,
} = {}) {
  const critic = createAgentIdentity({ role: "critic", agentId: criticAgentId });
  const actor = createAgentIdentity({ role: "actor", agentId: actorAgentId });
  try {
    assertDistinctPrincipals(critic, actor);
  } catch (error) {
    return {
      verdict: "error",
      recommendation: error.message,
      nextStep: null,
      constitutionIds: [],
      antiPatternIds: [],
      lesson: null,
      source: "error",
      criticAgentId: critic.agentId,
      actorAgentId: actor.agentId,
      ddrId: ddrId || null,
      retryBudget: MAX_REFLEXION_RETRIES,
      selfAcceptBanned: true,
    };
  }

  const transcript = compressTranscript(messages);
  const prompt = buildCriticPrompt({
    goal,
    failures,
    tried,
    transcript,
    constitutionIds,
    antiPatternIds,
    ddrId,
  });
  let result;
  try {
    if (typeof callCritic === "function") {
      const text = await callCritic({
        prompt,
        maxTokens: MAX_CRITIC_TOKENS,
        temperature: DEFAULT_TEMPERATURE,
        tools: false,
        role: "critic",
        agentId: critic.agentId,
      });
      const parsed = parseCriticJson(text);
      if (!parsed) {
        result = {
          verdict: "error",
          recommendation: "Critic returned unparseable output.",
          nextStep: null,
          constitutionIds: [],
          antiPatternIds: [],
          lesson: null,
          source: "llm",
        };
      } else {
        result = {
          verdict: normalizeVerdict(parsed.verdict),
          recommendation: parsed.recommendation || null,
          nextStep: parsed.nextStep || null,
          question: parsed.question || null,
          constitutionIds: Array.isArray(parsed.constitutionIds) ? parsed.constitutionIds : [],
          antiPatternIds: Array.isArray(parsed.antiPatternIds)
            ? parsed.antiPatternIds
            : antiPatternIds.slice(0, 4),
          lesson: parsed.lesson || null,
          source: "llm",
        };
      }
    } else {
      result = heuristicCritic({ failures, goal, constitutionIds });
    }
  } catch (error) {
    result = {
      verdict: "error",
      recommendation: `Critic error: ${error.message}`,
      nextStep: null,
      constitutionIds: [],
      antiPatternIds: [],
      lesson: null,
      source: "error",
    };
  }

  result.verdict = normalizeVerdict(result.verdict);
  result.ddrId = ddrId || null;
  result.retryBudget = MAX_REFLEXION_RETRIES;
  result.promptChars = prompt.length;
  result.criticAgentId = critic.agentId;
  result.actorAgentId = actor.agentId;
  result.selfAcceptBanned = true;
  // Convenience: prove neither principal can accept.
  result.acceptByCritic = canAcceptVerdict({ reflexion: result, acceptorId: critic.agentId });
  result.acceptByActor = canAcceptVerdict({ reflexion: result, acceptorId: actor.agentId });

  // Store linguistic lessons only after real prove/measure fail + ddrId.
  if (storeLesson && ddrId && failures.length && result.lesson && result.verdict !== "error") {
    try {
      result.lessonPath = persistLesson({ ddrId, failures, result, goal });
    } catch (error) {
      result.lessonStoreError = error.message;
    }
  }

  // Cite-ban / edition anti-cite learn hooks — only after real prove fail + ddrId.
  // Persist to repertoire when doctorBiteOk (doctor-gated); never preference/RLAIF.
  if (ddrId && failures.length && failures.some((f) => isCiteFailCategory(f))) {
    const inferred = inferCiteBansFromProveFail({
      ddrId,
      failures,
      observedCite,
      expectedCite,
      category,
      edition,
      reason: result.lesson || result.recommendation || "",
    });
    result.inferredCiteBan = inferred.citeBan;
    result.inferredEditionAntiCite = inferred.editionAntiCite;
    if (doctorBiteOk && observedCite && !inferred.refused) {
      try {
        result.citeBanLearn = commitCiteBansFromProveFail({
          storePath: learnStorePath,
          doctorBiteOk: true,
          ddrId,
          failures,
          observedCite,
          expectedCite,
          category,
          edition,
          reason: result.lesson || result.recommendation || "",
        });
      } catch (error) {
        result.citeBanLearnError = error.message;
      }
    }
  }

  return result;
}

export function persistLesson({ ddrId, failures, result, goal }) {
  if (!ddrId) throw new Error("refuse lesson store without ddrId");
  const dir = LESSON_DIR();
  mkdirSync(dir, { recursive: true });
  const id = createHash("sha256")
    .update([ddrId, failures[0] || "", result.lesson || ""].join("\0"))
    .digest("hex")
    .slice(0, 12);
  const path = join(dir, `${ddrId}_${id}.json`);
  const record = {
    ddrId,
    at: new Date().toISOString(),
    goal,
    failures: failures.slice(0, 8),
    verdict: result.verdict,
    lesson: result.lesson,
    nextStep: result.nextStep,
    constitutionIds: result.constitutionIds || [],
    antiPatternIds: result.antiPatternIds || [],
    criticAgentId: result.criticAgentId || null,
    actorAgentId: result.actorAgentId || null,
  };
  writeFileSync(path, JSON.stringify(record, null, 2) + "\n");
  return path;
}

/** Wire helper: should Actor take one more pass? */
export function shouldRetry(reflexion, { retriesUsed = 0 } = {}) {
  return reflexion?.verdict === "partial" && retriesUsed < MAX_REFLEXION_RETRIES;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const failures = args.filter((a, i) => args[i - 1] === "--fail");
  const result = await runCriticTurn({
    goal: opt("--goal") || "Clear measure/prove failures",
    failures: failures.length
      ? failures
      : [opt("--fail") || "cta-pressure: 2 filled in main"].filter(Boolean),
    ddrId: opt("--ddr") || "",
    constitutionIds: (opt("--constitution") || "cta-pressure,dual-focal-ban")
      .split(",")
      .filter(Boolean),
    criticAgentId: opt("--critic") || DEFAULT_CRITIC_ID,
    actorAgentId: opt("--actor") || DEFAULT_ACTOR_ID,
  });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.verdict === "error" ? 1 : 0);
}
