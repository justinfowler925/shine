#!/usr/bin/env node
/**
 * Atlas-shaped Reflexion stub (enterprise-agent plan §4).
 *
 * One critic call, no tools, ≤400 tokens, low temp.
 * Verdicts: done | partial | blocked | error (unknown → partial).
 * Fire on prove/measure fail or tool-iteration exhaustion.
 * Store lessons only with ddrId after a real prove fail.
 *
 * This module is the contract + local stub. Hosts inject `callCritic` (LLM)
 * when available; without it, a deterministic heuristic critic runs so doctor
 * bites stay offline-green.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

export const VERDICTS = Object.freeze(["done", "partial", "blocked", "error"]);
export const MAX_CRITIC_TOKENS = 400;
export const DEFAULT_TEMPERATURE = 0.2;
/** Bound retries: one extra Actor pass after partial. */
export const MAX_REFLEXION_RETRIES = 1;

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
} = {}) {
  const failList = (failures.length ? failures : ["unspecified measure/prove failure"])
    .slice(0, 8)
    .map((f, i) => `${i + 1}. ${f}`)
    .join("\n");
  const triedList = (tried.length ? tried : ["none recorded"]).slice(0, 6).join("; ");
  const constitution = (constitutionIds || []).slice(0, 8).join(", ") || "prove-mandatory";
  return [
    "You are the Shine design critic. One call. No tools. ≤400 tokens.",
    "Verdict must be exactly one of: done | partial | blocked | error.",
    "done → recommendation is the final reply.",
    "partial → one imperative next step for ONE more Actor pass (do not restart analysis).",
    "blocked → one clarifying question only.",
    "error → critic failure; turn still finalizes.",
    `Constitution IDs to cite when relevant: ${constitution}`,
    ddrId ? `DDR: ${ddrId}` : "DDR: (none)",
    `Goal: ${goal || "(unset)"}`,
    `Failures:\n${failList}`,
    `Tried: ${triedList}`,
    transcript ? `Transcript (compressed):\n${transcript}` : "",
    'Respond as JSON: {"verdict":"partial","recommendation":"...","nextStep":"...","constitutionIds":["cta-pressure"],"lesson":"..."}',
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
      lesson: "Operate main allows exactly one filled primary.",
      source: "heuristic",
    };
  }
  if (/dual-focal|peer.?grid|two (data)?grids/.test(blob)) {
    return {
      verdict: "partial",
      recommendation: "Collapse peer worklists to one focal grid; fold the other as saved-view/XOR (plan only — no silent delete).",
      nextStep: "Emit collapse-peer-grids plan markdown; keep one [role=grid] in the fold; re-measure dual-focal.",
      constitutionIds: ["dual-focal-ban"],
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
      lesson: "Equal Card roots without focal fail composition-slop.",
      source: "heuristic",
    };
  }
  if (/filler|welcome to your dashboard/.test(blob)) {
    return {
      verdict: "partial",
      recommendation: "Replace filler empty copy with job-specific instructional empty state.",
      nextStep: "Rewrite empty-state copy; re-run measure composition-slop filler check.",
      constitutionIds: ["cite-honesty"],
      lesson: "Filler empty phrases fail closed on Operate.",
      source: "heuristic",
    };
  }
  if (/category|ambiguous|ddr|not accepted/.test(blob)) {
    return {
      verdict: "blocked",
      recommendation: null,
      nextStep: null,
      question: "What is the Operate category (queue|settings|catalog|record|dashboard) and Monday job in one sentence?",
      constitutionIds: ["prove-mandatory"],
      lesson: null,
      source: "heuristic",
    };
  }
  return {
    verdict: "partial",
    recommendation: `Clear the named failure then re-prove: ${failures[0]}`,
    nextStep: `Fix the first failure (${String(failures[0]).slice(0, 120)}) and re-run measure/prove — do not restart diagnosis.`,
    constitutionIds: constitutionIds.slice(0, 2),
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
 * Run one critic call. `callCritic` optional: async (prompt) => string.
 * Never raises — verdict=error on failure so the turn finalizes.
 */
export async function runReflexion({
  goal = "",
  failures = [],
  tried = [],
  messages = [],
  constitutionIds = [],
  ddrId = "",
  callCritic = null,
  storeLesson = true,
} = {}) {
  const transcript = compressTranscript(messages);
  const prompt = buildCriticPrompt({
    goal,
    failures,
    tried,
    transcript,
    constitutionIds,
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
      });
      const parsed = parseCriticJson(text);
      if (!parsed) {
        result = {
          verdict: "error",
          recommendation: "Critic returned unparseable output.",
          nextStep: null,
          constitutionIds: [],
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
      lesson: null,
      source: "error",
    };
  }

  result.verdict = normalizeVerdict(result.verdict);
  result.ddrId = ddrId || null;
  result.retryBudget = MAX_REFLEXION_RETRIES;
  result.promptChars = prompt.length;

  // Store linguistic lessons only after real prove/measure fail + ddrId.
  if (storeLesson && ddrId && failures.length && result.lesson && result.verdict !== "error") {
    try {
      result.lessonPath = persistLesson({ ddrId, failures, result, goal });
    } catch (error) {
      result.lessonStoreError = error.message;
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
  const result = await runReflexion({
    goal: opt("--goal") || "Clear measure/prove failures",
    failures: failures.length ? failures : [opt("--fail") || "cta-pressure: 2 filled in main"].filter(Boolean),
    ddrId: opt("--ddr") || "",
    constitutionIds: (opt("--constitution") || "cta-pressure,dual-focal-ban").split(",").filter(Boolean),
  });
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  process.exit(result.verdict === "error" ? 1 : 0);
}
