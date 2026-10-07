#!/usr/bin/env node
/**
 * Design knowledge retrieval — Phase 1 scaffolding.
 * Principles are small source-backed records; retrieval is task/constraint keyed.
 * Anti-patterns (S2) are Nucleus-weighted bloat tells next to principles/.
 */
import {existsSync, readdirSync, readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const text = (value) => String(value || "").trim();

export const principleKinds = new Set([
  "accessibility-requirement",
  "strong-default",
  "product-convention",
  "experimental-hypothesis",
]);

export const antiPatternKinds = new Set([
  "operate-bloat",
  "craft-slop",
  "interaction-fail",
]);

/** Nucleus Operate slop quartet — dual-focal, KPI soup, CTA pressure, wrong cite. */
export const OPERATE_SLOP_ANTI_PATTERN_IDS = Object.freeze([
  "dual-focal-grids",
  "kpi-soup",
  "competing-filled-ctas",
  "wrong-cite-category",
]);

export function validatePrinciple(value) {
  const errors = [];
  if (value?.version !== 1) errors.push("version must be 1");
  if (text(value?.id).length < 3) errors.push("id is missing");
  if (text(value?.title).length < 8) errors.push("title is missing");
  if (!principleKinds.has(value?.kind)) errors.push("kind is invalid");
  if (!Array.isArray(value?.domains) || value.domains.length < 1) errors.push("domains required");
  if (text(value?.problemCues).length < 12) errors.push("problemCues missing");
  if (text(value?.preconditions).length < 8) errors.push("preconditions missing");
  if (text(value?.decision).length < 12) errors.push("decision missing");
  if (text(value?.tradeoffs).length < 8) errors.push("tradeoffs missing");
  if (text(value?.exceptions).length < 8) errors.push("exceptions missing");
  if (text(value?.source).length < 4) errors.push("source missing");
  if (text(value?.validatedBy).length < 8) errors.push("validatedBy missing");
  return errors;
}

export function validateAntiPattern(value) {
  const errors = [];
  if (value?.version !== 1) errors.push("version must be 1");
  if (text(value?.id).length < 3) errors.push("id is missing");
  if (text(value?.title).length < 8) errors.push("title is missing");
  if (!antiPatternKinds.has(value?.kind)) errors.push("kind is invalid");
  if (!Array.isArray(value?.domains) || value.domains.length < 1) errors.push("domains required");
  if (!Array.isArray(value?.screens) || value.screens.length < 1) errors.push("screens required");
  if (text(value?.cues).length < 12) errors.push("cues missing");
  if (text(value?.ban).length < 12) errors.push("ban missing");
  if (text(value?.remediation).length < 12) errors.push("remediation missing");
  if (text(value?.source).length < 4) errors.push("source missing");
  if (text(value?.validatedBy).length < 4) errors.push("validatedBy missing");
  if (!["critical", "major", "minor"].includes(value?.severity)) {
    errors.push("severity must be critical|major|minor");
  }
  // Expanded Operate-slop records: when fixtures are present, require both paths.
  if (value?.fixtures != null) {
    if (typeof value.fixtures !== "object") errors.push("fixtures must be an object");
    else {
      if (text(value.fixtures.before).length < 8) errors.push("fixtures.before missing");
      if (text(value.fixtures.after).length < 8) errors.push("fixtures.after missing");
    }
  }
  if (value?.aliases != null && !Array.isArray(value.aliases)) {
    errors.push("aliases must be an array");
  }
  if (value?.examples != null && !Array.isArray(value.examples)) {
    errors.push("examples must be an array");
  }
  if (value?.restructureOps != null && !Array.isArray(value.restructureOps)) {
    errors.push("restructureOps must be an array");
  }
  return errors;
}

export function loadPrinciples(dir = join(ROOT, "knowledge/principles")) {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
  return files.map((name) => {
    const value = JSON.parse(readFileSync(join(dir, name), "utf8"));
    const errors = validatePrinciple(value);
    if (errors.length) throw new Error(`${name}: ${errors.join("; ")}`);
    return value;
  });
}

export function loadAntiPatterns(dir = join(ROOT, "knowledge/anti-patterns")) {
  if (!existsSync(dir)) return [];
  const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
  return files.map((name) => {
    const value = JSON.parse(readFileSync(join(dir, name), "utf8"));
    const errors = validateAntiPattern(value);
    if (errors.length) throw new Error(`${name}: ${errors.join("; ")}`);
    return value;
  });
}

export function retrievePrinciples(job, {limit = 6, principles = null} = {}) {
  const corpus = principles || loadPrinciples();
  const hay = text(job).toLowerCase();
  const scored = corpus.map((item) => {
    const cues = `${item.problemCues} ${(item.tags || []).join(" ")} ${item.title}`.toLowerCase();
    let score = 0;
    for (const token of cues.split(/[^a-z0-9+]+/).filter((t) => t.length > 3)) {
      if (hay.includes(token)) score += 1;
    }
    for (const tag of item.tags || []) {
      if (hay.includes(String(tag).toLowerCase())) score += 2;
    }
    return {score, item};
  }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  return scored.slice(0, limit).map((row) => ({
    id: row.item.id,
    title: row.item.title,
    kind: row.item.kind,
    score: row.score,
    decision: row.item.decision,
    exceptions: row.item.exceptions,
    source: row.item.source,
  }));
}

/**
 * Retrieve Nucleus-weighted anti-patterns for a job / screen.
 * Prefer screen match; fall back to cue/tag scoring.
 */
export function retrieveAntiPatterns(job, {limit = 8, screen = "", antiPatterns = null} = {}) {
  const corpus = antiPatterns || loadAntiPatterns();
  const hay = text(job).toLowerCase();
  const screenNorm = text(screen).toLowerCase();
  const scored = corpus.map((item) => {
    let score = 0;
    if (screenNorm && (item.screens || []).map((s) => String(s).toLowerCase()).includes(screenNorm)) {
      score += 5;
    }
    const cues = `${item.cues} ${(item.tags || []).join(" ")} ${item.title} ${item.ban}`.toLowerCase();
    for (const token of cues.split(/[^a-z0-9+]+/).filter((t) => t.length > 3)) {
      if (hay.includes(token)) score += 1;
    }
    for (const tag of item.tags || []) {
      if (hay.includes(String(tag).toLowerCase())) score += 2;
    }
    return {score, item};
  }).filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
  return scored.slice(0, limit).map((row) => ({
    id: row.item.id,
    title: row.item.title,
    kind: row.item.kind,
    score: row.score,
    ban: row.item.ban,
    remediation: row.item.remediation,
    detector: row.item.detector,
    measureFailurePrefix: row.item.measureFailurePrefix,
    constitutionIds: row.item.constitutionIds || [],
    severity: row.item.severity,
    source: row.item.source,
  }));
}

/** Anti-pattern ids that have a machine detector (measure / cite / diagnosis). */
export function machineDetectableAntiPatterns(antiPatterns = null) {
  return (antiPatterns || loadAntiPatterns()).filter((item) => item.detector);
}

/** Lookup by id. */
export function getAntiPattern(id, antiPatterns = null) {
  const want = text(id);
  return (antiPatterns || loadAntiPatterns()).find((item) => item.id === want) || null;
}

/**
 * Operate slop quartet loaded from knowledge/anti-patterns/*.json.
 * Fail-closed if any required id is missing from the on-disk library.
 */
export function loadOperateSlopAntiPatterns(antiPatterns = null) {
  const corpus = antiPatterns || loadAntiPatterns();
  const byId = new Map(corpus.map((item) => [item.id, item]));
  const missing = OPERATE_SLOP_ANTI_PATTERN_IDS.filter((id) => !byId.has(id));
  if (missing.length) {
    throw new Error(`Operate slop anti-patterns missing: ${missing.join(", ")}`);
  }
  return OPERATE_SLOP_ANTI_PATTERN_IDS.map((id) => byId.get(id));
}

/** Stable `anti-pattern:<id>` token for measure / composition failure lines. */
export function formatAntiPatternCite(id) {
  const want = text(id);
  if (!want) throw new Error("formatAntiPatternCite requires id");
  return `anti-pattern:${want}`;
}

/**
 * Append library cite to a measure failure line when the anti-pattern exists.
 * Keeps the detector prefix intact for denoise/skill-ab parsers.
 */
export function withAntiPatternCite(failureLine, antiPatternId) {
  const line = text(failureLine);
  const cite = formatAntiPatternCite(antiPatternId);
  if (!line) return cite;
  if (line.includes(cite)) return line;
  return `${line} — ${cite} (knowledge/anti-patterns/${antiPatternId}.json)`;
}

/**
 * Resolve library row by id or alias (e.g. cta-pressure → competing-filled-ctas).
 */
export function resolveAntiPattern(idOrAlias, antiPatterns = null) {
  const want = text(idOrAlias).toLowerCase();
  if (!want) return null;
  const corpus = antiPatterns || loadAntiPatterns();
  const direct = corpus.find((item) => item.id === want);
  if (direct) return direct;
  return (
    corpus.find((item) =>
      (item.aliases || []).map((a) => String(a).toLowerCase()).includes(want),
    ) || null
  );
}

/**
 * Format a cite-honesty / wrong-cite failure that cites the library row.
 * Used by doctor bites and diagnosis/learn when category truth breaks.
 */
export function formatWrongCiteFailures({
  citeId = "",
  category = "",
  note = "",
  gate = true,
} = {}) {
  if (!gate) return [];
  const row = getAntiPattern("wrong-cite-category");
  const cite = citeId || "unknown-cite";
  const cat = category || "unknown-category";
  const detail = text(note) || `page cite ${cite} does not match category ${cat}`;
  const prefix = row?.measureFailurePrefix || "cite-honesty";
  return [
    withAntiPatternCite(
      `${prefix}: ${detail} — rebind cite / fix packet --category`,
      "wrong-cite-category",
    ),
  ];
}

/** Match `anti-pattern:<id>` tokens in measure / composition failure lines. */
const ANTI_PATTERN_CITE_RE = /anti-pattern:([a-z0-9][a-z0-9-]*)/gi;

/**
 * Prefix → catalog id for Operate slop measure defects (dual-focal, kpi-soup,
 * cta-pressure, cite-honesty). Built from on-disk library rows.
 */
export function operateDefectPrefixToAntiPatternId(antiPatterns = null) {
  const map = new Map();
  for (const row of loadOperateSlopAntiPatterns(antiPatterns)) {
    const prefix = text(row.measureFailurePrefix);
    if (prefix) map.set(prefix, row.id);
  }
  return map;
}

/**
 * Extract `anti-pattern:<id>` ids cited in a failure line.
 */
export function extractAntiPatternCites(failureLine) {
  const raw = String(failureLine || "");
  const ids = [];
  for (const match of raw.matchAll(ANTI_PATTERN_CITE_RE)) {
    ids.push(String(match[1]).toLowerCase());
  }
  return ids;
}

/**
 * Fail-closed gate for measure: when an Operate slop defect fires, the failure
 * line must cite the matching `anti-pattern:<id>` from knowledge/anti-patterns.
 * Returns additional failure strings (never mutates the input array).
 *
 * Meta-failures use prefix `anti-pattern-cite:` so they do not re-trigger.
 */
export function enforceOperateAntiPatternCites(failures, { antiPatterns = null } = {}) {
  const corpus = antiPatterns || loadAntiPatterns();
  const catalogIds = new Set(corpus.map((item) => item.id));
  const prefixToId = operateDefectPrefixToAntiPatternId(corpus);
  const extras = [];

  for (const line of failures || []) {
    const raw = String(line || "");
    if (raw.startsWith("anti-pattern-cite:")) continue;

    let matchedPrefix = null;
    let expectedId = null;
    for (const [prefix, id] of prefixToId) {
      if (raw.startsWith(`${prefix}:`)) {
        matchedPrefix = prefix;
        expectedId = id;
        break;
      }
    }
    if (!matchedPrefix || !expectedId) continue;

    const cites = extractAntiPatternCites(raw);
    if (!cites.length) {
      extras.push(
        `anti-pattern-cite: ${matchedPrefix} defect fired without citing ` +
          `anti-pattern:${expectedId} (knowledge/anti-patterns/${expectedId}.json) — fail-closed`,
      );
      continue;
    }
    if (!cites.includes(expectedId)) {
      extras.push(
        `anti-pattern-cite: ${matchedPrefix} defect cited anti-pattern:${cites[0]} ` +
          `but matching catalog id is anti-pattern:${expectedId} — fail-closed`,
      );
      continue;
    }
    if (!catalogIds.has(expectedId)) {
      extras.push(
        `anti-pattern-cite: anti-pattern:${expectedId} missing from knowledge catalog — fail-closed`,
      );
    }
  }

  return extras;
}

/** Screen-keyed ban strings for recommend / packet antiPatterns[]. */
export function antiPatternBansForScreen(screen, {limit = 6, antiPatterns = null} = {}) {
  const corpus = antiPatterns || loadAntiPatterns();
  const screenNorm = text(screen).toLowerCase() || "default";
  const hits = corpus.filter((item) =>
    (item.screens || []).map((s) => String(s).toLowerCase()).includes(screenNorm),
  );
  const pool = hits.length ? hits : corpus.filter((item) => item.id === "marketing-dna-operate" || item.id === "wrong-cite-category" || item.id === "competing-filled-ctas");
  return pool
    .slice(0, limit)
    .map((item) => `${item.id}: ${item.ban}`);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const mode = args[0] === "--anti" ? "anti" : "principles";
  const job = (mode === "anti" ? args.slice(1) : args).join(" ") || "records queue edit persist draft retry";
  if (mode === "anti") {
    console.log(JSON.stringify({
      count: loadAntiPatterns().length,
      hits: retrieveAntiPatterns(job),
    }, null, 2));
  } else {
    console.log(JSON.stringify({count: loadPrinciples().length, hits: retrievePrinciples(job)}, null, 2));
  }
}
