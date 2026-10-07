#!/usr/bin/env node
/**
 * ClearSpeed Operate constitution — numbered edition principles for DDR + critic.
 * Enterprise plan §3: packet.ddr.constitutionIds[] carries edition principle ids;
 * critic must cite at least one on every partial/blocked turn.
 */

import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONSTITUTION_DIR = join(ROOT, "knowledge/constitutions");

export const DEFAULT_OPERATE_CONSTITUTION_ID = "clearspeed-operate";

const text = (value) => String(value || "").trim();

export function validateConstitution(doc) {
  const errors = [];
  if (doc?.version !== 1) errors.push("version must be 1");
  if (text(doc?.id).length < 3) errors.push("id missing");
  if (text(doc?.edition).length < 2) errors.push("edition missing");
  if (!Array.isArray(doc?.principles) || doc.principles.length < 1) {
    errors.push("principles required");
  } else {
    const seenN = new Set();
    const seenId = new Set();
    for (const p of doc.principles) {
      if (!Number.isInteger(p?.n) || p.n < 1) errors.push(`principle n invalid (${p?.id || "?"})`);
      if (seenN.has(p.n)) errors.push(`duplicate principle n=${p.n}`);
      seenN.add(p.n);
      if (text(p?.id).length < 3) errors.push(`principle id missing at n=${p?.n}`);
      if (seenId.has(p.id)) errors.push(`duplicate principle id=${p.id}`);
      seenId.add(p.id);
      if (text(p?.title).length < 8) errors.push(`${p.id}: title missing`);
      if (text(p?.rule).length < 12) errors.push(`${p.id}: rule missing`);
    }
  }
  return errors;
}

export function loadConstitution(
  id = DEFAULT_OPERATE_CONSTITUTION_ID,
  dir = CONSTITUTION_DIR,
) {
  const path = join(dir, `${id}.json`);
  if (!existsSync(path)) throw new Error(`constitution missing: ${path}`);
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const errors = validateConstitution(doc);
  if (errors.length) throw new Error(`${id}: ${errors.join("; ")}`);
  return Object.freeze({
    ...doc,
    principles: Object.freeze(doc.principles.map((p) => Object.freeze({ ...p }))),
  });
}

export function listConstitutions(dir = CONSTITUTION_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => loadConstitution(name.replace(/\.json$/, ""), dir));
}

/** Default Operate denoise constitution ids (order = principle numbers). */
export function operateConstitutionIds(doc = null) {
  const constitution = doc || loadConstitution();
  return constitution.principles.map((p) => p.id);
}

/**
 * Resolve numbered principle rows for a packet.
 * @returns {{ editionId: string, principles: object[], constitutionIds: string[] }}
 */
export function resolveOperateConstitution({
  lane = "saas",
  mode = "existing",
  constitutionIds = null,
  editionId = DEFAULT_OPERATE_CONSTITUTION_ID,
} = {}) {
  const operate = lane === "saas" || mode === "denoise";
  if (!operate) {
    const fallback = [{ n: 1, id: "prove-mandatory", title: "Prove when shipping", rule: "Ship with a prove receipt when the lane requires it." }];
    return {
      editionId: null,
      principles: fallback,
      constitutionIds: constitutionIds?.length ? [...constitutionIds] : ["prove-mandatory"],
    };
  }
  const doc = loadConstitution(editionId);
  const wanted = constitutionIds?.length ? constitutionIds : doc.principles.map((p) => p.id);
  const byId = new Map(doc.principles.map((p) => [p.id, p]));
  const principles = wanted.map((id, i) => {
    const row = byId.get(id);
    if (row) return { n: row.n, id: row.id, title: row.title, rule: row.rule };
    return { n: i + 1, id, title: id, rule: `Edition principle ${id}` };
  });
  // Keep catalog order when using full defaults.
  const ordered =
    !constitutionIds?.length
      ? doc.principles.map((p) => ({ n: p.n, id: p.id, title: p.title, rule: p.rule }))
      : principles.sort((a, b) => a.n - b.n);
  return {
    editionId: doc.id,
    principles: ordered,
    constitutionIds: ordered.map((p) => p.id),
  };
}

/** Numbered list for critic prompts. */
export function formatNumberedConstitution(principles = []) {
  if (!principles.length) return "(none)";
  return principles
    .map((p) => `${p.n}. \`${p.id}\` — ${p.rule || p.title}`)
    .join("\n");
}

/**
 * Extract cited constitution ids from critic output (ids + principle numbers).
 */
export function extractConstitutionCitations(
  result = {},
  { principles = [], constitutionIds = [] } = {},
) {
  const allowed = new Set(
    (constitutionIds.length ? constitutionIds : principles.map((p) => p.id)).filter(Boolean),
  );
  const byN = new Map(principles.map((p) => [p.n, p.id]));
  const found = new Set();

  for (const raw of result.constitutionIds || []) {
    const id = text(raw);
    if (allowed.has(id)) found.add(id);
    const asNum = Number(id);
    if (Number.isInteger(asNum) && byN.has(asNum)) found.add(byN.get(asNum));
  }

  const blob = [
    result.recommendation,
    result.nextStep,
    result.question,
    result.lesson,
    ...(result.constitutionIds || []),
  ]
    .filter(Boolean)
    .join("\n");

  for (const id of allowed) {
    if (new RegExp(`\\b${id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`).test(blob)) {
      found.add(id);
    }
  }
  for (const [n, id] of byN) {
    if (new RegExp(`(?:^|\\b)(?:P|#)?${n}\\b`).test(blob) && allowed.has(id)) {
      found.add(id);
    }
  }
  return [...found];
}

/**
 * Fail-closed: critic partial/blocked turns must cite ≥1 packet constitution id.
 * @returns {{ ok: boolean, reason?: string, cited: string[] }}
 */
export function assertCriticCitesConstitution(
  result,
  {
    constitutionIds = [],
    principles = [],
    requiredVerdicts = ["partial", "blocked"],
  } = {},
) {
  const cited = extractConstitutionCitations(result, { principles, constitutionIds });
  const verdict = text(result?.verdict).toLowerCase();
  if (!constitutionIds.length) {
    return { ok: true, cited, reason: "no constitutionIds required" };
  }
  if (!requiredVerdicts.includes(verdict)) {
    return { ok: true, cited, reason: `citation optional for verdict=${verdict || "missing"}` };
  }
  if (cited.length >= 1) return { ok: true, cited };
  return {
    ok: false,
    cited,
    reason:
      "Critic must cite ≥1 ddr.constitutionIds principle (id or number) on partial/blocked turns",
  };
}

/**
 * Enforce citation: attach normalized cited ids, or mark verdict=error when missing.
 */
export function enforceCriticConstitutionCitation(
  result,
  { constitutionIds = [], principles = [] } = {},
) {
  const gate = assertCriticCitesConstitution(result, { constitutionIds, principles });
  const next = { ...result, constitutionCited: gate.cited };
  if (gate.ok) {
    if (gate.cited.length) next.constitutionIds = gate.cited;
    return next;
  }
  return {
    ...next,
    verdict: "error",
    recommendation: gate.reason,
    nextStep: null,
    constitutionIds: [],
    constitutionCited: [],
    citationError: gate.reason,
    source: result?.source || "citation-gate",
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  try {
    if (args[0] === "list") {
      process.stdout.write(
        JSON.stringify(
          listConstitutions().map((c) => ({
            id: c.id,
            edition: c.edition,
            count: c.principles.length,
            ids: c.principles.map((p) => `${p.n}:${p.id}`),
          })),
          null,
          2,
        ) + "\n",
      );
    } else {
      const resolved = resolveOperateConstitution({
        lane: "saas",
        mode: "denoise",
        editionId: args[0] || DEFAULT_OPERATE_CONSTITUTION_ID,
      });
      process.stdout.write(
        JSON.stringify(
          {
            editionId: resolved.editionId,
            constitutionIds: resolved.constitutionIds,
            numbered: formatNumberedConstitution(resolved.principles),
          },
          null,
          2,
        ) + "\n",
      );
    }
  } catch (error) {
    console.error(`shine constitution: ${error.message}`);
    process.exit(1);
  }
}
