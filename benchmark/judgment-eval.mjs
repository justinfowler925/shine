#!/usr/bin/env node
/**
 * Phase 1 judgment-eval harness.
 * Produces structured recommendations from knowledge retrieval + light heuristics,
 * then scores them against expected principle/modality/verdict gates.
 * Human review remains authoritative for the Phase 1 exit gate; this is the machine rubric.
 */
import {readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {retrievePrinciples} from "../knowledge/retrieve.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const text = (value) => String(value || "").trim();

export function loadJudgmentCases(path = join(ROOT, "benchmark/judgment/cases.json")) {
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(data.variants) || data.variants.length !== 8) {
    throw new Error(`expected 8 judgment variants, found ${data.variants?.length}`);
  }
  return data;
}

export function recommend(job, {limit = 6} = {}) {
  const principles = retrievePrinciples(job, {limit});
  const lower = text(job).toLowerCase();
  const noChange = /\bhealthy\b/.test(lower)
    && /\b(already meets|no-change|recommend changes only if evidenced)\b/.test(lower);
  const multimodal = /\balexis\b|\bvoice\b|\binterrupt\b|\bavatar\b|\bwhy this\b|\bmultimodal\b/.test(lower);
  const aiCollab = /\bai proposes\b|\baccepts or rejects\b|\bagent action/.test(lower) || multimodal;
  let modality = "ui";
  if (multimodal) modality = "multimodal";
  else if (aiCollab) modality = "ai-collaboration";

  const claims = [];
  if (/\bchat sidebar\b|\bchat-only\b/.test(lower) && multimodal) claims.push("chat-sidebar-only");
  if (/\breplace datagrid\b|\bnew grid library\b/.test(lower)) claims.push("replace-datagrid");

  const patterns = [];
  if (/\bqueue\b|\btriage\b|\bdatagrid\b|\bticket/.test(lower)) patterns.push("datagrid", "queue");
  if (/\breport\b|\bdrill/.test(lower)) patterns.push("summary-table", "report");
  if (/\bpersist\b|\bedit\b|\brecord/.test(lower)) patterns.push("record-editor", "form");
  if (/\bpermission\b|\bmembership\b|\brole\b/.test(lower)) patterns.push("settings", "permissions");

  return {
    version: 1,
    job: text(job),
    verdict: noChange ? "no-change" : "change",
    modality,
    patterns: [...new Set(patterns)],
    principles: principles.map((item) => item.id),
    principleDetails: principles,
    claims,
    uncertainty: /\bambiguous\b|\bwhether\b|\bdiagnose\b/.test(lower)
      ? "Primary surface is uncertain until product inventory is inspected."
      : "",
    rationale: noChange
      ? "Surface reads as sound; prefer no-change unless evidence appears."
      : `Retrieved ${principles.length} principle(s); apply task-specific judgment before editing.`,
  };
}

export function scoreRecommendation(recommendation, expected) {
  const failures = [];
  if (recommendation.verdict !== expected.verdict) {
    failures.push(`verdict ${recommendation.verdict} !== ${expected.verdict}`);
  }
  if (expected.modality && recommendation.modality !== expected.modality) {
    failures.push(`modality ${recommendation.modality} !== ${expected.modality}`);
  }
  for (const id of expected.mustHitPrincipleIds || []) {
    if (!recommendation.principles?.includes(id)) failures.push(`missing principle ${id}`);
  }
  for (const claim of expected.mustNotClaim || []) {
    if (recommendation.claims?.includes(claim)) failures.push(`forbidden claim ${claim}`);
  }
  if (expected.requireUncertainty && text(recommendation.uncertainty).length < 12) {
    failures.push("expected uncertainty note");
  }
  if (Array.isArray(expected.preferredPatterns) && expected.preferredPatterns.length) {
    const hit = expected.preferredPatterns.some((pattern) => recommendation.patterns?.includes(pattern));
    if (!hit) failures.push(`missing preferred pattern among ${expected.preferredPatterns.join("|")}`);
  }
  return {ok: failures.length === 0, failures};
}

export function evaluateJudgment({casesPath} = {}) {
  const data = loadJudgmentCases(casesPath);
  const results = data.variants.map((variant) => {
    const recommendation = recommend(variant.job);
    const score = scoreRecommendation(recommendation, variant.expected);
    return {
      id: variant.id,
      ok: score.ok,
      failures: score.failures,
      verdict: recommendation.verdict,
      modality: recommendation.modality,
      principles: recommendation.principles,
    };
  });
  const passed = results.filter((row) => row.ok).length;
  return {
    total: results.length,
    passed,
    // Phase 1 human gate target is ≥7/8; machine rubric aims for the same floor.
    meetsMachineFloor: passed >= 7,
    results,
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const report = evaluateJudgment();
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.meetsMachineFloor ? 0 : 1);
}
