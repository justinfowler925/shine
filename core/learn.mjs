#!/usr/bin/env node
/**
 * Repertoire + episodic + cite-ban + sibling-prefer learn
 * (enterprise-agent plan §4 "commit learning").
 *
 * Stores:
 *   - Repertoire — proven job→cite→kit + working restructureHints
 *   - Episodes — linguistic lessons tied to ddrId + prove fail category
 *   - Cite bans — Operate demotions after real prove fails (tied to ddrId)
 *   - Edition anti-cites — ClearSpeed (etc.) edition bans after prove fails
 *   - Sibling prefs — proven edition-sibling → cite/kit mappings (next packet prefer)
 *
 * Merge gate: doctor-gated version bump. Refuse commit unless doctorBiteOk.
 * Never store preference / RLAIF labels or "looks good" without a machine fail.
 *
 * Usage:
 *   node core/learn.mjs match --job "Decide Pursue…" [--category queue]
 *   node core/learn.mjs bans --category queue [--edition clearspeed]
 *   node core/learn.mjs sibling-prefs --category queue [--edition clearspeed-operate]
 *   node core/learn.mjs commit --job … --cite … --kit … --hints … \
 *     --ddr ddr_… --fail-category cta-pressure --lesson "…" --doctor-ok
 *   node core/learn.mjs commit-cite-ban --ddr ddr_… --fail-category cite-honesty \
 *     --ban-cite shadcn-dashboard-01 --category queue --doctor-ok
 *   node core/learn.mjs commit-edition-anti --ddr ddr_… --edition clearspeed \
 *     --ban-cite magicui-* --fail-category cite-honesty --doctor-ok
 *   node core/learn.mjs commit-sibling --ddr ddr_… --sibling sled-capture-queue \
 *     --cite shadcn-queue --kit "…" --category queue --edition clearspeed-operate --doctor-ok
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeSiblingCategory } from "./edition-siblings.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REPERTOIRE_SCHEMA = "shine-repertoire/v1";
export const DEFAULT_STORE = join(ROOT, "knowledge/repertoire/repertoire.json");

/** Fail categories that may produce cite bans / edition anti-cites. */
export const CITE_FAIL_CATEGORIES = Object.freeze([
  "cite-honesty",
  "wrong-cite",
  "cite",
  "rebind-cite",
  "category-honesty",
]);

const text = (value) => String(value || "").trim();

/** Banned preference / RLAIF payload keys — machine oracles only. */
export const PREFERENCE_KEYS = Object.freeze([
  "preferenceLabels",
  "preferenceRank",
  "rlaif",
  "rlaifReward",
  "humanPreference",
  "pairwiseRank",
  "criticGptLabel",
]);

/** Episode / sibling-pref fail category for edition-sibling resolve lessons. */
export const SIBLING_LEARN_FAIL_CATEGORY = "edition-sibling";

export function emptyStore() {
  return {
    $schema: REPERTOIRE_SCHEMA,
    version: 1,
    bar: "machine prove/measure only — no preference / RLAIF",
    entries: [],
    episodes: [],
    citeBans: [],
    editionAntiCites: [],
    siblingPrefs: [],
  };
}

export function loadRepertoire(storePath = DEFAULT_STORE) {
  if (!existsSync(storePath)) return emptyStore();
  const raw = JSON.parse(readFileSync(storePath, "utf8"));
  // Additive fields for pre-cite-ban / pre-sibling-pref seeds.
  if (!Array.isArray(raw.citeBans)) raw.citeBans = [];
  if (!Array.isArray(raw.editionAntiCites)) raw.editionAntiCites = [];
  if (!Array.isArray(raw.siblingPrefs)) raw.siblingPrefs = [];
  const errors = validateStore(raw);
  if (errors.length) throw new Error(`repertoire invalid: ${errors.join("; ")}`);
  return raw;
}

export function validateStore(store) {
  const errors = [];
  if (store?.$schema !== REPERTOIRE_SCHEMA) errors.push(`$schema must be ${REPERTOIRE_SCHEMA}`);
  if (!Number.isInteger(store?.version) || store.version < 1) errors.push("version must be ≥1 int");
  if (!/no preference/i.test(store?.bar || "")) errors.push("bar must ban preference / RLAIF");
  if (!Array.isArray(store?.entries)) errors.push("entries must be an array");
  if (!Array.isArray(store?.episodes)) errors.push("episodes must be an array");
  if (store?.citeBans != null && !Array.isArray(store.citeBans)) {
    errors.push("citeBans must be an array");
  }
  if (store?.editionAntiCites != null && !Array.isArray(store.editionAntiCites)) {
    errors.push("editionAntiCites must be an array");
  }
  if (store?.siblingPrefs != null && !Array.isArray(store.siblingPrefs)) {
    errors.push("siblingPrefs must be an array");
  }
  for (const [i, e] of (store?.entries || []).entries()) {
    for (const err of validateRepertoireEntry(e)) errors.push(`entries[${i}]: ${err}`);
  }
  for (const [i, e] of (store?.episodes || []).entries()) {
    for (const err of validateEpisode(e)) errors.push(`episodes[${i}]: ${err}`);
  }
  for (const [i, e] of (store?.citeBans || []).entries()) {
    for (const err of validateCiteBan(e)) errors.push(`citeBans[${i}]: ${err}`);
  }
  for (const [i, e] of (store?.editionAntiCites || []).entries()) {
    for (const err of validateEditionAntiCite(e)) {
      errors.push(`editionAntiCites[${i}]: ${err}`);
    }
  }
  for (const [i, e] of (store?.siblingPrefs || []).entries()) {
    for (const err of validateSiblingPref(e)) errors.push(`siblingPrefs[${i}]: ${err}`);
  }
  return errors;
}

/** Cite id or family wildcard (magicui-*). */
export function looksLikeCiteId(id, { allowWildcard = false } = {}) {
  const s = text(id);
  if (!s) return false;
  if (allowWildcard && /^[a-z0-9][a-z0-9._-]*\*$/i.test(s)) return true;
  return /^[a-z0-9][a-z0-9._-]+$/i.test(s);
}

export function validateRepertoireEntry(entry) {
  const errors = [];
  if (text(entry?.id).length < 4) errors.push("id missing");
  if (text(entry?.job).length < 8) errors.push("job missing");
  if (text(entry?.category).length < 2) errors.push("category missing");
  if (text(entry?.primaryCite).length < 4) errors.push("primaryCite missing");
  if (!looksLikeCiteId(entry?.primaryCite)) {
    errors.push("primaryCite must look like a cite id (cite golden)");
  }
  if (text(entry?.kitRecipe).length < 8) errors.push("kitRecipe missing");
  if (!Array.isArray(entry?.restructureHints) || entry.restructureHints.length < 1) {
    errors.push("restructureHints required (working hints)");
  }
  if (text(entry?.ddrId).length < 8 || !String(entry.ddrId).startsWith("ddr_")) {
    errors.push("ddrId required (ddr_…)");
  }
  if (!Array.isArray(entry?.proveFailCategories) || entry.proveFailCategories.length < 1) {
    errors.push("proveFailCategories required (machine fail only)");
  }
  if (text(entry?.validatedBy).length < 4) errors.push("validatedBy missing");
  for (const key of PREFERENCE_KEYS) {
    if (entry?.[key] != null) errors.push(`refuse preference field ${key}`);
  }
  return errors;
}

export function validateEpisode(episode) {
  const errors = [];
  if (text(episode?.ddrId).length < 8 || !String(episode.ddrId).startsWith("ddr_")) {
    errors.push("ddrId required");
  }
  if (text(episode?.failCategory).length < 3) {
    errors.push("failCategory required (prove/measure fail category)");
  }
  if (text(episode?.lesson).length < 8) errors.push("lesson missing");
  if (!["done", "partial", "blocked", "error"].includes(episode?.verdict)) {
    errors.push("verdict must be done|partial|blocked|error");
  }
  for (const key of PREFERENCE_KEYS) {
    if (episode?.[key] != null) errors.push(`refuse preference field ${key}`);
  }
  // Ban "looks good" self-refine without a machine fail category.
  if (/looks\s*good/i.test(episode?.lesson || "") && !episode?.failCategory) {
    errors.push("refuse looks-good lesson without machine fail");
  }
  return errors;
}

/** Operate demotion: ban a cite for a category after prove fail. */
export function validateCiteBan(ban) {
  const errors = [];
  if (text(ban?.id).length < 4) errors.push("id missing");
  if (ban?.kind !== "operate-demotion") {
    errors.push("kind must be operate-demotion");
  }
  if (!looksLikeCiteId(ban?.citeId, { allowWildcard: true })) {
    errors.push("citeId must look like a cite id (optional family *)");
  }
  if (text(ban?.category).length < 2) errors.push("category missing");
  if (text(ban?.reason).length < 8) errors.push("reason missing");
  if (text(ban?.failCategory).length < 3) {
    errors.push("failCategory required (prove/measure fail)");
  }
  if (!isCiteFailCategory(ban?.failCategory)) {
    errors.push(
      `failCategory must be cite-related (${CITE_FAIL_CATEGORIES.join("|")})`,
    );
  }
  if (text(ban?.ddrId).length < 8 || !String(ban.ddrId).startsWith("ddr_")) {
    errors.push("ddrId required (tied to real prove fail)");
  }
  for (const key of PREFERENCE_KEYS) {
    if (ban?.[key] != null) errors.push(`refuse preference field ${key}`);
  }
  return errors;
}

/** Edition-scoped anti-cite after prove fail. */
export function validateEditionAntiCite(ban) {
  const errors = [];
  if (text(ban?.id).length < 4) errors.push("id missing");
  if (text(ban?.edition).length < 3) errors.push("edition missing (e.g. clearspeed)");
  if (!looksLikeCiteId(ban?.citeId, { allowWildcard: true })) {
    errors.push("citeId must look like a cite id (optional family *)");
  }
  if (text(ban?.reason).length < 8) errors.push("reason missing");
  if (text(ban?.failCategory).length < 3) {
    errors.push("failCategory required (prove/measure fail)");
  }
  if (!isCiteFailCategory(ban?.failCategory)) {
    errors.push(
      `failCategory must be cite-related (${CITE_FAIL_CATEGORIES.join("|")})`,
    );
  }
  if (text(ban?.ddrId).length < 8 || !String(ban.ddrId).startsWith("ddr_")) {
    errors.push("ddrId required (tied to real prove fail)");
  }
  for (const key of PREFERENCE_KEYS) {
    if (ban?.[key] != null) errors.push(`refuse preference field ${key}`);
  }
  return errors;
}

/**
 * Proven edition-sibling → cite/kit mapping (machine resolve evidence + ddrId).
 * Written when cite/kit resolves via edition siblings; next packet prefer.
 */
export function validateSiblingPref(pref) {
  const errors = [];
  if (text(pref?.id).length < 4) errors.push("id missing");
  if (text(pref?.edition).length < 3) {
    errors.push("edition missing (e.g. clearspeed-operate)");
  }
  if (text(pref?.category).length < 2) errors.push("category missing");
  if (text(pref?.siblingId).length < 3) errors.push("siblingId missing");
  if (!looksLikeCiteId(pref?.preferredCite)) {
    errors.push("preferredCite must look like a cite id");
  }
  if (text(pref?.kitRecipe).length < 8) errors.push("kitRecipe missing");
  if (text(pref?.ddrId).length < 8 || !String(pref.ddrId).startsWith("ddr_")) {
    errors.push("ddrId required (tied to real sibling resolve / packet)");
  }
  if (text(pref?.reason).length < 8) errors.push("reason missing");
  for (const key of PREFERENCE_KEYS) {
    if (pref?.[key] != null) errors.push(`refuse preference field ${key}`);
  }
  return errors;
}

export function isCiteFailCategory(failCategory) {
  const f = text(failCategory).toLowerCase();
  if (!f) return false;
  return CITE_FAIL_CATEGORIES.some((c) => f === c || f.startsWith(`${c}:`) || f.includes(c));
}

function entryId({ job, primaryCite, kitRecipe, ddrId }) {
  return createHash("sha256")
    .update([job, primaryCite, kitRecipe, ddrId].join("\0"))
    .digest("hex")
    .slice(0, 12);
}

function episodeId({ ddrId, failCategory, lesson }) {
  return createHash("sha256")
    .update([ddrId, failCategory, lesson].join("\0"))
    .digest("hex")
    .slice(0, 12);
}

function citeBanId({ citeId, category, ddrId, failCategory }) {
  return createHash("sha256")
    .update(["operate-demotion", citeId, category, ddrId, failCategory].join("\0"))
    .digest("hex")
    .slice(0, 12);
}

function editionAntiCiteId({ edition, citeId, ddrId, failCategory, category = "" }) {
  return createHash("sha256")
    .update(["edition-anti-cite", edition, citeId, category, ddrId, failCategory].join("\0"))
    .digest("hex")
    .slice(0, 12);
}

function siblingPrefId({ edition, category, siblingId, preferredCite, ddrId }) {
  return createHash("sha256")
    .update(["sibling-pref", edition, category, siblingId, preferredCite, ddrId].join("\0"))
    .digest("hex")
    .slice(0, 12);
}

function refusePreferenceKeys(obj, label) {
  for (const key of PREFERENCE_KEYS) {
    if (obj?.[key] != null) {
      throw new Error(`refuse preference / RLAIF field ${key}${label ? ` on ${label}` : ""}`);
    }
  }
}

/**
 * Fail-closed commit. Version bumps only when doctorBiteOk and payload validates.
 * @returns {{ store, bumped, version, entry?, episode?, citeBan?, editionAntiCite?, siblingPref?, path }}
 */
export function commitLearning(opts = {}) {
  const {
    storePath = DEFAULT_STORE,
    store = null,
    entry = null,
    episode = null,
    citeBan = null,
    editionAntiCite = null,
    siblingPref = null,
    doctorBiteOk = false,
    at = null,
  } = opts;
  if (!doctorBiteOk) {
    throw new Error(
      "refuse learn commit — doctorBiteOk required (doctor-gated version bump)",
    );
  }
  if (!entry && !episode && !citeBan && !editionAntiCite && !siblingPref) {
    throw new Error(
      "refuse learn commit — provide repertoire entry, episode, citeBan, editionAntiCite, and/or siblingPref",
    );
  }

  refusePreferenceKeys(opts, "commit envelope");

  const current = store ? structuredClone(store) : loadRepertoire(storePath);
  if (!Array.isArray(current.citeBans)) current.citeBans = [];
  if (!Array.isArray(current.editionAntiCites)) current.editionAntiCites = [];
  if (!Array.isArray(current.siblingPrefs)) current.siblingPrefs = [];
  const stamp = at || new Date().toISOString();
  let wroteEntry = null;
  let wroteEpisode = null;
  let wroteCiteBan = null;
  let wroteEditionAnti = null;
  let wroteSiblingPref = null;

  if (entry) {
    refusePreferenceKeys(entry, "entry");
    const normalized = {
      id: entry.id || entryId(entry),
      job: text(entry.job),
      category: text(entry.category),
      primaryCite: text(entry.primaryCite),
      kitRecipe: text(entry.kitRecipe),
      restructureHints: [...(entry.restructureHints || [])],
      ddrId: text(entry.ddrId),
      proveFailCategories: [...(entry.proveFailCategories || [])],
      validatedBy: text(entry.validatedBy) || "measure+prove",
      at: stamp,
    };
    const errors = validateRepertoireEntry(normalized);
    if (errors.length) throw new Error(`refuse repertoire entry: ${errors.join("; ")}`);
    const idx = current.entries.findIndex((e) => e.id === normalized.id);
    if (idx >= 0) current.entries[idx] = normalized;
    else current.entries.push(normalized);
    wroteEntry = normalized;
  }

  if (episode) {
    refusePreferenceKeys(episode, "episode");
    const normalized = {
      id: episode.id || episodeId(episode),
      ddrId: text(episode.ddrId),
      failCategory: text(episode.failCategory),
      lesson: text(episode.lesson),
      verdict: text(episode.verdict) || "partial",
      nextStep: text(episode.nextStep) || null,
      at: stamp,
    };
    const errors = validateEpisode(normalized);
    if (errors.length) throw new Error(`refuse episode: ${errors.join("; ")}`);
    const idx = current.episodes.findIndex((e) => e.id === normalized.id);
    if (idx >= 0) current.episodes[idx] = normalized;
    else current.episodes.push(normalized);
    wroteEpisode = normalized;
  }

  if (citeBan) {
    refusePreferenceKeys(citeBan, "citeBan");
    const normalized = {
      id: citeBan.id || citeBanId(citeBan),
      kind: "operate-demotion",
      citeId: text(citeBan.citeId),
      category: text(citeBan.category),
      reason: text(citeBan.reason),
      failCategory: text(citeBan.failCategory),
      ddrId: text(citeBan.ddrId),
      observedCite: text(citeBan.observedCite) || text(citeBan.citeId),
      expectedCite: text(citeBan.expectedCite) || null,
      at: stamp,
    };
    const errors = validateCiteBan(normalized);
    if (errors.length) throw new Error(`refuse cite ban: ${errors.join("; ")}`);
    const idx = current.citeBans.findIndex((e) => e.id === normalized.id);
    if (idx >= 0) current.citeBans[idx] = normalized;
    else current.citeBans.push(normalized);
    wroteCiteBan = normalized;
  }

  if (editionAntiCite) {
    refusePreferenceKeys(editionAntiCite, "editionAntiCite");
    const normalized = {
      id: editionAntiCite.id || editionAntiCiteId(editionAntiCite),
      edition: text(editionAntiCite.edition).toLowerCase(),
      citeId: text(editionAntiCite.citeId),
      category: text(editionAntiCite.category) || null,
      reason: text(editionAntiCite.reason),
      failCategory: text(editionAntiCite.failCategory),
      ddrId: text(editionAntiCite.ddrId),
      observedCite: text(editionAntiCite.observedCite) || text(editionAntiCite.citeId),
      at: stamp,
    };
    const errors = validateEditionAntiCite(normalized);
    if (errors.length) throw new Error(`refuse edition anti-cite: ${errors.join("; ")}`);
    const idx = current.editionAntiCites.findIndex((e) => e.id === normalized.id);
    if (idx >= 0) current.editionAntiCites[idx] = normalized;
    else current.editionAntiCites.push(normalized);
    wroteEditionAnti = normalized;
  }

  if (siblingPref) {
    refusePreferenceKeys(siblingPref, "siblingPref");
    const normalized = {
      id: siblingPref.id || siblingPrefId(siblingPref),
      edition: text(siblingPref.edition).toLowerCase(),
      category:
        normalizeSiblingCategory(siblingPref.category) ||
        text(siblingPref.category).toLowerCase(),
      siblingId: text(siblingPref.siblingId),
      preferredCite: text(siblingPref.preferredCite),
      kitRecipe: text(siblingPref.kitRecipe),
      job: text(siblingPref.job) || null,
      ddrId: text(siblingPref.ddrId),
      reason: text(siblingPref.reason),
      resolveReason: text(siblingPref.resolveReason) || null,
      at: stamp,
    };
    const errors = validateSiblingPref(normalized);
    if (errors.length) throw new Error(`refuse sibling pref: ${errors.join("; ")}`);
    const idx = current.siblingPrefs.findIndex((e) => e.id === normalized.id);
    if (idx >= 0) current.siblingPrefs[idx] = normalized;
    else current.siblingPrefs.push(normalized);
    wroteSiblingPref = normalized;
  }

  const prevVersion = current.version;
  current.version = prevVersion + 1;
  current.bar = current.bar || "machine prove/measure only — no preference / RLAIF";
  current.$schema = REPERTOIRE_SCHEMA;

  const errors = validateStore(current);
  if (errors.length) throw new Error(`refuse store write: ${errors.join("; ")}`);

  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(current, null, 2) + "\n");

  return {
    store: current,
    bumped: true,
    version: current.version,
    previousVersion: prevVersion,
    entry: wroteEntry,
    episode: wroteEpisode,
    citeBan: wroteCiteBan,
    editionAntiCite: wroteEditionAnti,
    siblingPref: wroteSiblingPref,
    path: storePath,
  };
}

/** Simple job/category match against proven repertoire (stub retrieval). */
export function matchRepertoire(job, { category = "", storePath = DEFAULT_STORE, store = null } = {}) {
  const current = store || loadRepertoire(storePath);
  const jobL = text(job).toLowerCase();
  const cat = text(category).toLowerCase();
  const scored = current.entries
    .map((e) => {
      let score = 0;
      if (cat && e.category === cat) score += 3;
      const ej = e.job.toLowerCase();
      if (jobL && ej === jobL) score += 5;
      else if (jobL && (ej.includes(jobL) || jobL.includes(ej.slice(0, 24)))) score += 2;
      for (const token of jobL.split(/\W+/).filter((t) => t.length > 4)) {
        if (ej.includes(token)) score += 0.5;
      }
      return { entry: e, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

/** Episodes for a DDR (prove-fail lessons only). */
export function episodesForDdr(ddrId, { storePath = DEFAULT_STORE, store = null } = {}) {
  const id = text(ddrId);
  if (!id) return [];
  const current = store || loadRepertoire(storePath);
  return current.episodes.filter((e) => e.ddrId === id);
}

/** Operate demotion bans for a category (cite golden / recommend consumers). */
export function citeBansFor(category, { storePath = DEFAULT_STORE, store = null } = {}) {
  const cat = text(category).toLowerCase();
  const current = store || loadRepertoire(storePath);
  return (current.citeBans || []).filter((b) => !cat || text(b.category).toLowerCase() === cat);
}

/** Edition anti-cites for an edition (+ optional category). */
export function editionAntiCitesFor(
  edition,
  { category = "", storePath = DEFAULT_STORE, store = null } = {},
) {
  const ed = text(edition).toLowerCase();
  if (!ed) return [];
  const cat = text(category).toLowerCase();
  const current = store || loadRepertoire(storePath);
  return (current.editionAntiCites || []).filter((b) => {
    if (text(b.edition).toLowerCase() !== ed) return false;
    if (cat && b.category && text(b.category).toLowerCase() !== cat) return false;
    return true;
  });
}

/**
 * Infer cite-ban / edition anti-cite payloads from a real prove/measure fail.
 * Returns nulls when the fail is not cite-related or evidence is incomplete.
 */
export function inferCiteBansFromProveFail({
  ddrId = "",
  failures = [],
  observedCite = "",
  expectedCite = "",
  category = "",
  edition = "",
  reason = "",
} = {}) {
  const id = text(ddrId);
  if (!id.startsWith("ddr_")) {
    return { citeBan: null, editionAntiCite: null, refused: "ddrId required" };
  }
  const failList = (failures || []).map((f) => text(f)).filter(Boolean);
  if (!failList.length) {
    return { citeBan: null, editionAntiCite: null, refused: "real prove fail required" };
  }
  const citeFail = failList.find((f) => isCiteFailCategory(f));
  if (!citeFail) {
    return { citeBan: null, editionAntiCite: null, refused: "fail not cite-related" };
  }
  const failCategory =
    CITE_FAIL_CATEGORIES.find((c) => citeFail.toLowerCase().includes(c)) || "cite-honesty";
  const banned = text(observedCite);
  if (!banned || !looksLikeCiteId(banned, { allowWildcard: true })) {
    return {
      citeBan: null,
      editionAntiCite: null,
      refused: "observedCite required (wrong cite that failed prove)",
    };
  }
  const cat = text(category) || "queue";
  const why =
    text(reason) ||
    `Prove fail ${failCategory}: demote ${banned}` +
      (text(expectedCite) ? ` (expected ${text(expectedCite)})` : "");

  const citeBan = {
    kind: "operate-demotion",
    citeId: banned,
    category: cat,
    reason: why,
    failCategory,
    ddrId: id,
    observedCite: banned,
    expectedCite: text(expectedCite) || null,
  };

  let editionAntiCite = null;
  const ed = text(edition).toLowerCase();
  if (ed) {
    editionAntiCite = {
      edition: ed,
      citeId: banned,
      category: cat,
      reason: `Edition ${ed} anti-cite after prove fail: ${why}`,
      failCategory,
      ddrId: id,
      observedCite: banned,
    };
  }

  return { citeBan, editionAntiCite, refused: null, failCategory };
}

/**
 * Proven sibling prefs for a category (+ optional edition / job match).
 * Used by edition-siblings resolve to boost proven mappings on the next packet.
 */
export function siblingPrefsFor(
  category,
  { edition = "", job = "", storePath = DEFAULT_STORE, store = null } = {},
) {
  const cat = normalizeSiblingCategory(category) || text(category).toLowerCase();
  const ed = text(edition).toLowerCase();
  const jobL = text(job).toLowerCase();
  const current = store || loadRepertoire(storePath);
  const scored = (current.siblingPrefs || [])
    .map((pref) => {
      let score = 0;
      const prefCat =
        normalizeSiblingCategory(pref.category) || text(pref.category).toLowerCase();
      if (cat && prefCat === cat) score += 4;
      if (ed) {
        const pe = text(pref.edition).toLowerCase();
        if (pe === ed) score += 3;
        else if (
          (pe === "clearspeed" && ed === "clearspeed-operate") ||
          (pe === "clearspeed-operate" && ed === "clearspeed")
        ) {
          score += 2;
        } else return { pref, score: 0 };
      }
      if (jobL && pref.job) {
        const pj = text(pref.job).toLowerCase();
        if (pj === jobL) score += 5;
        else if (pj.includes(jobL) || jobL.includes(pj.slice(0, 24))) score += 2;
        for (const token of jobL.split(/\W+/).filter((t) => t.length > 4)) {
          if (pj.includes(token)) score += 0.5;
        }
      }
      return { pref, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored;
}

/**
 * Infer sibling-pref + episodic lesson from a successful edition-sibling cite/kit resolve.
 * Returns refused when sibling/cite/kit/ddr evidence is incomplete.
 */
export function inferSiblingLearnFromResolve({
  ddrId = "",
  edition = "",
  category = "",
  job = "",
  siblingId = "",
  preferredCite = "",
  kitRecipe = "",
  reason = "",
  resolveReason = "",
} = {}) {
  const id = text(ddrId);
  if (!id.startsWith("ddr_")) {
    return { siblingPref: null, episode: null, refused: "ddrId required" };
  }
  const sib = text(siblingId);
  const cite = text(preferredCite);
  const kit = text(kitRecipe);
  if (!sib) {
    return { siblingPref: null, episode: null, refused: "siblingId required (resolved sibling)" };
  }
  if (!looksLikeCiteId(cite)) {
    return { siblingPref: null, episode: null, refused: "preferredCite required" };
  }
  if (kit.length < 8) {
    return { siblingPref: null, episode: null, refused: "kitRecipe required" };
  }
  const ed = text(edition).toLowerCase() || "clearspeed-operate";
  const cat =
    normalizeSiblingCategory(category) || text(category).toLowerCase() || "queue";
  const why =
    text(reason) ||
    `Cite/kit resolved via edition sibling ${sib} → ${cite}; prefer on next packet`;
  const siblingPref = {
    edition: ed,
    category: cat,
    siblingId: sib,
    preferredCite: cite,
    kitRecipe: kit,
    job: text(job) || null,
    ddrId: id,
    reason: why,
    resolveReason: text(resolveReason) || null,
  };
  const episode = {
    ddrId: id,
    failCategory: SIBLING_LEARN_FAIL_CATEGORY,
    lesson: why,
    verdict: "done",
    nextStep: `Prefer sibling ${sib} (cite ${cite}) on next ${cat} packet`,
  };
  return { siblingPref, episode, refused: null };
}

/**
 * Learn hook: persist sibling prefer + episodic lesson after cite/kit resolves
 * via edition siblings. Doctor-gated. Next resolve/recommend boosts the mapping.
 */
export function commitSiblingLearnFromResolve(opts = {}) {
  const {
    storePath = DEFAULT_STORE,
    store = null,
    doctorBiteOk = false,
    at = null,
    resolved = null,
    ...inferOpts
  } = opts;

  if (!doctorBiteOk) {
    throw new Error(
      "refuse sibling learn — doctorBiteOk required (doctor-gated version bump)",
    );
  }
  refusePreferenceKeys(opts, "sibling-learn hook");

  const fromResolved = resolved?.sibling
    ? {
        siblingId: resolved.sibling.id || resolved.siblingId,
        preferredCite: resolved.preferredCite,
        kitRecipe: resolved.kitRecipe,
        resolveReason: resolved.reason,
      }
    : {};

  const inferred = inferSiblingLearnFromResolve({ ...fromResolved, ...inferOpts });
  if (inferred.refused || !inferred.siblingPref) {
    return {
      skipped: true,
      reason: inferred.refused || "nothing to prefer",
      siblingPref: null,
      episode: null,
      bumped: false,
    };
  }

  const result = commitLearning({
    storePath,
    store,
    doctorBiteOk: true,
    at,
    siblingPref: inferred.siblingPref,
    episode: inferred.episode,
  });

  return {
    skipped: false,
    reason: null,
    ...result,
  };
}

/**
 * Learn hook: write cite-ban / edition anti-cite after a real prove fail.
 * Doctor-gated. No-op (returns skipped) when fail is not cite-related.
 */
export function commitCiteBansFromProveFail(opts = {}) {
  const {
    storePath = DEFAULT_STORE,
    store = null,
    doctorBiteOk = false,
    at = null,
    ...inferOpts
  } = opts;

  if (!doctorBiteOk) {
    throw new Error(
      "refuse cite-ban learn — doctorBiteOk required (doctor-gated version bump)",
    );
  }
  refusePreferenceKeys(opts, "cite-ban hook");

  const inferred = inferCiteBansFromProveFail(inferOpts);
  if (inferred.refused || (!inferred.citeBan && !inferred.editionAntiCite)) {
    return {
      skipped: true,
      reason: inferred.refused || "nothing to ban",
      citeBan: null,
      editionAntiCite: null,
      bumped: false,
    };
  }

  const result = commitLearning({
    storePath,
    store,
    doctorBiteOk: true,
    at,
    citeBan: inferred.citeBan,
    editionAntiCite: inferred.editionAntiCite,
  });

  return {
    skipped: false,
    reason: null,
    ...result,
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const cmd = args[0] || "match";
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const flags = new Set(args.filter((a) => a.startsWith("--")));

  if (cmd === "match") {
    const hits = matchRepertoire(opt("--job") || args[1] || "", {
      category: opt("--category"),
      storePath: opt("--store") || DEFAULT_STORE,
    });
    process.stdout.write(JSON.stringify({ hits }, null, 2) + "\n");
    process.exit(0);
  }

  if (cmd === "bans") {
    const storePath = opt("--store") || DEFAULT_STORE;
    const category = opt("--category");
    const edition = opt("--edition");
    process.stdout.write(
      JSON.stringify(
        {
          citeBans: citeBansFor(category, { storePath }),
          editionAntiCites: edition
            ? editionAntiCitesFor(edition, { category, storePath })
            : [],
        },
        null,
        2,
      ) + "\n",
    );
    process.exit(0);
  }

  if (cmd === "sibling-prefs") {
    const hits = siblingPrefsFor(opt("--category") || args[1] || "", {
      edition: opt("--edition") || "clearspeed-operate",
      job: opt("--job") || "",
      storePath: opt("--store") || DEFAULT_STORE,
    });
    process.stdout.write(JSON.stringify({ hits }, null, 2) + "\n");
    process.exit(0);
  }

  if (cmd === "commit-sibling") {
    const result = commitSiblingLearnFromResolve({
      storePath: opt("--store") || DEFAULT_STORE,
      doctorBiteOk: flags.has("--doctor-ok"),
      ddrId: opt("--ddr"),
      edition: opt("--edition") || "clearspeed-operate",
      category: opt("--category") || "queue",
      job: opt("--job") || "",
      siblingId: opt("--sibling"),
      preferredCite: opt("--cite") || opt("--ban-cite") || "",
      kitRecipe: opt("--kit") || "",
      reason: opt("--reason") || "",
      resolveReason: opt("--resolve-reason") || "",
    });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.skipped && result.reason ? 1 : 0);
  }

  if (cmd === "commit-cite-ban" || cmd === "commit-edition-anti" || cmd === "commit-prove-fail") {
    const result = commitCiteBansFromProveFail({
      storePath: opt("--store") || DEFAULT_STORE,
      doctorBiteOk: flags.has("--doctor-ok"),
      ddrId: opt("--ddr"),
      failures: [opt("--fail-category") || opt("--fail") || ""].filter(Boolean),
      observedCite: opt("--ban-cite") || opt("--observed") || "",
      expectedCite: opt("--expected") || "",
      category: opt("--category") || "queue",
      edition:
        cmd === "commit-edition-anti"
          ? opt("--edition") || "clearspeed"
          : opt("--edition") || "",
      reason: opt("--reason") || "",
    });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.skipped && result.reason ? 1 : 0);
  }

  if (cmd === "commit") {
    const hints = (opt("--hints") || "")
      .split("|")
      .map((h) => h.trim())
      .filter(Boolean);
    const fails = (opt("--fail-category") || opt("--fail") || "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    const result = commitLearning({
      storePath: opt("--store") || DEFAULT_STORE,
      doctorBiteOk: flags.has("--doctor-ok"),
      entry:
        opt("--job") && opt("--cite") && opt("--kit")
          ? {
              job: opt("--job"),
              category: opt("--category") || "queue",
              primaryCite: opt("--cite"),
              kitRecipe: opt("--kit"),
              restructureHints: hints.length ? hints : ["restructure:cta-budget"],
              ddrId: opt("--ddr"),
              proveFailCategories: fails.length ? fails : ["cta-pressure"],
              validatedBy: opt("--validated-by") || "measure+prove",
            }
          : null,
      episode: opt("--lesson")
        ? {
            ddrId: opt("--ddr"),
            failCategory: fails[0] || "",
            lesson: opt("--lesson"),
            verdict: opt("--verdict") || "partial",
            nextStep: opt("--next") || "",
          }
        : null,
      citeBan: opt("--ban-cite")
        ? {
            citeId: opt("--ban-cite"),
            category: opt("--category") || "queue",
            reason: opt("--reason") || `Operate demotion of ${opt("--ban-cite")}`,
            failCategory: fails[0] || "cite-honesty",
            ddrId: opt("--ddr"),
            expectedCite: opt("--expected") || "",
          }
        : null,
      editionAntiCite: opt("--edition") && opt("--ban-cite")
        ? {
            edition: opt("--edition"),
            citeId: opt("--ban-cite"),
            category: opt("--category") || "",
            reason:
              opt("--reason") ||
              `Edition ${opt("--edition")} anti-cite: ${opt("--ban-cite")}`,
            failCategory: fails[0] || "cite-honesty",
            ddrId: opt("--ddr"),
          }
        : null,
    });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(0);
  }

  process.stderr.write(
    "Usage: learn.mjs match|bans|sibling-prefs|commit|commit-sibling|commit-cite-ban|commit-edition-anti|commit-prove-fail [flags]\n",
  );
  process.exit(2);
}
