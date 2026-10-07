#!/usr/bin/env node
/**
 * Repertoire + episodic learn stub (enterprise-agent plan §4 "commit learning").
 *
 * Stores:
 *   - Repertoire — proven job→cite→kit + working restructureHints
 *   - Episodes — linguistic lessons tied to ddrId + prove fail category
 *
 * Merge gate: doctor-gated version bump. Refuse commit unless doctorBiteOk.
 * Never store preference / RLAIF labels or "looks good" without a machine fail.
 *
 * Usage:
 *   node core/learn.mjs match --job "Decide Pursue…" [--category queue]
 *   node core/learn.mjs commit --job … --cite … --kit … --hints … \
 *     --ddr ddr_… --fail-category cta-pressure --lesson "…" --doctor-ok
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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REPERTOIRE_SCHEMA = "shine-repertoire/v1";
export const DEFAULT_STORE = join(ROOT, "knowledge/repertoire/repertoire.json");

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

export function emptyStore() {
  return {
    $schema: REPERTOIRE_SCHEMA,
    version: 1,
    bar: "machine prove/measure only — no preference / RLAIF",
    entries: [],
    episodes: [],
  };
}

export function loadRepertoire(storePath = DEFAULT_STORE) {
  if (!existsSync(storePath)) return emptyStore();
  const raw = JSON.parse(readFileSync(storePath, "utf8"));
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
  for (const [i, e] of (store?.entries || []).entries()) {
    for (const err of validateRepertoireEntry(e)) errors.push(`entries[${i}]: ${err}`);
  }
  for (const [i, e] of (store?.episodes || []).entries()) {
    for (const err of validateEpisode(e)) errors.push(`episodes[${i}]: ${err}`);
  }
  return errors;
}

export function validateRepertoireEntry(entry) {
  const errors = [];
  if (text(entry?.id).length < 4) errors.push("id missing");
  if (text(entry?.job).length < 8) errors.push("job missing");
  if (text(entry?.category).length < 2) errors.push("category missing");
  if (text(entry?.primaryCite).length < 4) errors.push("primaryCite missing");
  if (!/^[a-z0-9][a-z0-9._-]+$/i.test(text(entry?.primaryCite))) {
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

/**
 * Fail-closed commit. Version bumps only when doctorBiteOk and payload validates.
 * @returns {{ store, bumped, version, entry?, episode?, path }}
 */
export function commitLearning(opts = {}) {
  const {
    storePath = DEFAULT_STORE,
    store = null,
    entry = null,
    episode = null,
    doctorBiteOk = false,
    at = null,
  } = opts;
  if (!doctorBiteOk) {
    throw new Error(
      "refuse learn commit — doctorBiteOk required (doctor-gated version bump)",
    );
  }
  if (!entry && !episode) {
    throw new Error("refuse learn commit — provide repertoire entry and/or episode");
  }

  // Reject preference payloads parked on the commit envelope itself.
  for (const key of PREFERENCE_KEYS) {
    if (opts[key] != null) {
      throw new Error(`refuse preference / RLAIF field ${key}`);
    }
  }

  const current = store ? structuredClone(store) : loadRepertoire(storePath);
  const stamp = at || new Date().toISOString();
  let wroteEntry = null;
  let wroteEpisode = null;

  if (entry) {
    // Preference / RLAIF keys must be refused on the raw payload (normalize drops them).
    for (const key of PREFERENCE_KEYS) {
      if (entry[key] != null) throw new Error(`refuse preference / RLAIF field ${key}`);
    }
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
    for (const key of PREFERENCE_KEYS) {
      if (episode[key] != null) throw new Error(`refuse preference / RLAIF field ${key}`);
    }
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
    });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(0);
  }

  process.stderr.write("Usage: learn.mjs match|commit [flags]\n");
  process.exit(2);
}
