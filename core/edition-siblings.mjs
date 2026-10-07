#!/usr/bin/env node
/**
 * ClearSpeed Operate edition sibling map — Nucleus / Sled Capture surfaces
 * for cite + kit selection (enterprise plan §4 Edition profile).
 *
 * Matching order: product sibling first → kit recipe → cite shot.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EDITIONS_DIR = join(ROOT, "knowledge/editions");
export const DEFAULT_OPERATE_SIBLING_EDITION = "clearspeed-operate";

const text = (value) => String(value || "").trim();
const lower = (value) => text(value).toLowerCase();

/** Normalize packet / denoise category aliases onto map categories. */
export function normalizeSiblingCategory(category = "") {
  const raw = lower(category);
  if (!raw) return "";
  if (["queue", "worklist", "triage", "datagrid", "inbox"].includes(raw)) return "queue";
  if (["settings", "preferences", "form"].includes(raw)) return "settings";
  if (["catalog", "catalogue"].includes(raw)) return "catalog";
  if (["record", "detail"].includes(raw)) return "record";
  if (["dashboard", "cockpit", "analytics"].includes(raw)) return "dashboard";
  if (["editorial", "blog"].includes(raw)) return "editorial";
  return raw;
}

export function validateEditionSiblingMap(doc) {
  const errors = [];
  if (doc?.version !== 1) errors.push("version must be 1");
  if (text(doc?.id).length < 3) errors.push("id missing");
  if (text(doc?.edition).length < 2) errors.push("edition missing");
  if (text(doc?.editionId).length < 3) errors.push("editionId missing");
  if (!Array.isArray(doc?.owners)) errors.push("owners required");
  if (!Array.isArray(doc?.siblings) || doc.siblings.length < 1) {
    errors.push("siblings required");
  } else {
    const seen = new Set();
    const ownerIds = new Set((doc.owners || []).map((o) => o.id));
    for (const s of doc.siblings) {
      if (text(s?.id).length < 3) errors.push("sibling id missing");
      if (seen.has(s.id)) errors.push(`duplicate sibling id=${s.id}`);
      seen.add(s.id);
      if (text(s?.name).length < 4) errors.push(`${s.id}: name missing`);
      if (!Array.isArray(s?.categories) || !s.categories.length) {
        errors.push(`${s.id}: categories required`);
      }
      if (!Array.isArray(s?.screens) || !s.screens.length) {
        errors.push(`${s.id}: screens required`);
      }
      if (text(s?.preferredCite).length < 3) errors.push(`${s.id}: preferredCite missing`);
      if (text(s?.kitRecipe).length < 12) errors.push(`${s.id}: kitRecipe missing`);
      if (!Array.isArray(s?.antiCites)) errors.push(`${s.id}: antiCites must be array`);
      if (!Array.isArray(s?.owners)) errors.push(`${s.id}: owners must be array`);
      else {
        for (const oid of s.owners) {
          if (!ownerIds.has(oid)) errors.push(`${s.id}: unknown owner ${oid}`);
        }
      }
      if (s.nullWhy != null && text(s.nullWhy).length < 8) {
        errors.push(`${s.id}: nullWhy must be null or ≥8 chars`);
      }
    }
  }
  for (const o of doc?.owners || []) {
    if (text(o?.id).length < 3) errors.push("owner id missing");
    if (text(o?.name).length < 4) errors.push(`${o?.id}: owner name missing`);
  }
  return errors;
}

export function loadEditionSiblingMap(
  editionId = DEFAULT_OPERATE_SIBLING_EDITION,
  dir = EDITIONS_DIR,
) {
  const path = join(dir, editionId, "siblings.json");
  if (!existsSync(path)) throw new Error(`edition sibling map missing: ${path}`);
  const doc = JSON.parse(readFileSync(path, "utf8"));
  const errors = validateEditionSiblingMap(doc);
  if (errors.length) throw new Error(`${editionId}: ${errors.join("; ")}`);
  return Object.freeze({
    ...doc,
    owners: Object.freeze((doc.owners || []).map((o) => Object.freeze({ ...o }))),
    siblings: Object.freeze(doc.siblings.map((s) => Object.freeze({
      ...s,
      categories: Object.freeze([...s.categories]),
      screens: Object.freeze([...s.screens]),
      jobCues: Object.freeze([...(s.jobCues || [])]),
      antiCites: Object.freeze([...(s.antiCites || [])]),
      owners: Object.freeze([...(s.owners || [])]),
    }))),
  });
}

export function listEditionSiblingMaps(dir = EDITIONS_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => existsSync(join(dir, name, "siblings.json")))
    .sort()
    .map((name) => loadEditionSiblingMap(name, dir));
}

function cueScore(job, cues = []) {
  const hay = lower(job);
  if (!hay) return 0;
  let score = 0;
  for (const cue of cues) {
    const c = lower(cue);
    if (c && hay.includes(c)) score += c.length >= 12 ? 3 : 2;
  }
  return score;
}

/**
 * Resolve the best Nucleus/Sled sibling for cite + kit selection.
 * Optional `learnedPrefs` (from repertoire siblingPrefs) boost proven mappings
 * so the next packet prefers a sibling that already resolved cite/kit.
 * @returns {{ sibling: object|null, preferredCite: string|null, kitRecipe: string|null, antiCites: string[], owners: string[], reason: string, learnedPrefer: object|null }}
 */
export function resolveEditionSibling({
  category = "",
  screen = "",
  job = "",
  editionId = DEFAULT_OPERATE_SIBLING_EDITION,
  map = null,
  learnedPrefs = [],
} = {}) {
  const doc = map || loadEditionSiblingMap(editionId);
  const cat = normalizeSiblingCategory(category);
  const scr = lower(screen);
  const prefs = Array.isArray(learnedPrefs) ? learnedPrefs : [];
  const preferBoost = (siblingId) => {
    const hit = prefs.find((p) => text(p?.siblingId) === text(siblingId));
    return hit ? 8 : 0;
  };
  const scored = doc.siblings.map((s) => {
    let score = 0;
    if (cat && s.categories.map(normalizeSiblingCategory).includes(cat)) score += 6;
    if (scr && s.screens.map(lower).includes(scr)) score += 4;
    score += cueScore(job, s.jobCues);
    // Prefer Capture Queue over Signals when both are queue-ish and no cue wins.
    if (s.id === "sled-capture-queue" && (cat === "queue" || scr === "queue") && cueScore(job, s.jobCues) === 0) {
      score += 1;
    }
    score += preferBoost(s.id);
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score || a.s.id.localeCompare(b.s.id));
  const best = scored[0];
  if (!best || best.score < 4) {
    return {
      sibling: null,
      preferredCite: null,
      kitRecipe: null,
      antiCites: [],
      owners: [],
      reason: "no sibling matched — record null + why before inventing chrome",
      learnedPrefer: null,
    };
  }
  const tied = scored.filter((row) => row.score === best.score);
  const cueBest = Math.max(...tied.map((row) => cueScore(job, row.s.jobCues)));
  let pick = best;
  if (tied.length > 1 && cueBest === 0) {
    // Learned sibling prefer breaks Operate-default ambiguity when present.
    const learnedHit = tied.find((row) => preferBoost(row.s.id) > 0);
    if (learnedHit) {
      pick = learnedHit;
    } else {
      // Ambiguous category without job cues — use Operate defaults; else refuse.
      const defaults = {
        queue: "sled-capture-queue",
        settings: "sled-capture-sources",
        catalog: "nucleus-company-tools",
        record: "sled-capture-record",
      };
      const defId = defaults[cat];
      const def = defId && tied.find((row) => row.s.id === defId);
      if (!def) {
        return {
          sibling: null,
          preferredCite: null,
          kitRecipe: null,
          antiCites: [],
          owners: [],
          reason: `ambiguous siblings (${tied.map((t) => t.s.id).join(", ")}) — add job cues or --product-reference`,
          learnedPrefer: null,
        };
      }
      pick = def;
    }
  }
  const learnedPrefer =
    prefs.find((p) => text(p?.siblingId) === text(pick.s.id)) || null;
  const preferNote = learnedPrefer
    ? `; repertoire sibling prefer ${learnedPrefer.siblingId}`
    : "";
  return {
    sibling: pick.s,
    preferredCite: pick.s.preferredCite,
    kitRecipe: pick.s.kitRecipe,
    antiCites: [...pick.s.antiCites],
    owners: [...pick.s.owners],
    reason: `matched ${pick.s.id} (score ${pick.score})${preferNote}`,
    learnedPrefer,
  };
}

/**
 * Apply sibling map onto a cite-v2 recommendation (product sibling first).
 * Promotes preferredCite when it already appears in the shortlist.
 */
export function applySiblingToRecommendation(rec, resolved, { templates = [] } = {}) {
  if (!rec || !resolved?.sibling) return rec;
  const out = { ...rec };
  out.productSibling = {
    id: resolved.sibling.id,
    name: resolved.sibling.name,
    route: resolved.sibling.route || null,
    file: resolved.sibling.file || null,
    owners: resolved.owners,
    reason: resolved.reason,
  };
  if (resolved.kitRecipe) out.kitRecipe = resolved.kitRecipe;
  const anti = (resolved.antiCites || []).map((id) => `anti-cite: ${id} (edition-sibling:${resolved.sibling.id})`);
  out.antiPatterns = [...(out.antiPatterns || []), ...anti].slice(0, 12);
  const preferred = resolved.preferredCite;
  if (preferred) {
    const short = out.shortlist || [];
    const hit = short.find((row) => row.id === preferred);
    if (hit && out.primary?.id !== preferred) {
      out.primary = {
        ...(out.primary || {}),
        id: preferred,
        screen: hit.screen || out.primary?.screen,
        scope: hit.scope || "page",
        title: out.primary?.title,
        kit: out.primary?.kit,
        score: hit.score ?? out.primary?.score,
        matches: [...(out.primary?.matches || []), "edition-sibling"],
      };
      out.restructureHints = [
        `restructure: edition sibling ${resolved.sibling.id} prefers cite ${preferred}`,
        ...(out.restructureHints || []),
      ];
    } else if (out.primary && out.primary.id !== preferred) {
      const known = templates.some((t) => t.id === preferred);
      out.restructureHints = [
        `restructure: edition sibling ${resolved.sibling.id} prefers cite ${preferred}` +
          (known ? "" : " (confirm catalog row)"),
        ...(out.restructureHints || []),
      ];
    }
  }
  return out;
}

/** Edition ids / aliases that load the ClearSpeed Operate sibling map. */
export function editionUsesSiblingMap(edition = "") {
  const e = lower(edition);
  return e === "clearspeed" || e === "clearspeed-operate" || e === DEFAULT_OPERATE_SIBLING_EDITION;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("edition-siblings.mjs")) {
  const args = process.argv.slice(2);
  try {
    if (args[0] === "list" || args.length === 0) {
      const maps = listEditionSiblingMaps();
      process.stdout.write(
        JSON.stringify(
          maps.map((m) => ({
            editionId: m.editionId,
            siblings: m.siblings.length,
            owners: m.owners.length,
          })),
          null,
          2,
        ) + "\n",
      );
    } else if (args[0] === "resolve") {
      const opts = {};
      for (let i = 1; i < args.length; i++) {
        if (args[i] === "--category") opts.category = args[++i];
        else if (args[i] === "--screen") opts.screen = args[++i];
        else if (args[i] === "--job") opts.job = args[++i];
        else if (args[i] === "--edition") opts.editionId = args[++i];
      }
      process.stdout.write(JSON.stringify(resolveEditionSibling(opts), null, 2) + "\n");
    } else {
      throw new Error("usage: edition-siblings.mjs [list|resolve --category … --job …]");
    }
  } catch (error) {
    console.error(`shine edition-siblings: ${error.message}`);
    process.exit(1);
  }
}
