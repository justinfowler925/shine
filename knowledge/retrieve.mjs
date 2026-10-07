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
