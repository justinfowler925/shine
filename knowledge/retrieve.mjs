#!/usr/bin/env node
/**
 * Design knowledge retrieval — Phase 1 scaffolding.
 * Principles are small source-backed records; retrieval is task/constraint keyed.
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

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const job = process.argv.slice(2).join(" ") || "records queue edit persist draft retry";
  console.log(JSON.stringify({count: loadPrinciples().length, hits: retrievePrinciples(job)}, null, 2));
}
