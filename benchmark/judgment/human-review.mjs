#!/usr/bin/env node
/**
 * Validate human-review sheets against the Phase 1 rubric.
 *
 * Usage:
 *   node benchmark/judgment/human-review.mjs
 *     → print rubric pass rule
 *   node benchmark/judgment/human-review.mjs --validate sheet-a.json sheet-b.json
 *     → validate sheets + summarize usable floor
 */
import {readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const scores = new Set(["usable", "needs-minor-revision", "major-redesign", "critical-fail"]);

export function loadRubric(path = join(ROOT, "benchmark/judgment/human-review-rubric.json")) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function validateReviewSheet(sheet, rubric = loadRubric()) {
  const errors = [];
  if (sheet?.version !== 1) errors.push("version must be 1");
  if (!sheet?.reviewerId) errors.push("reviewerId required");
  if (!Array.isArray(sheet?.reviews) || sheet.reviews.length !== rubric.passRule.variants) {
    errors.push(`expected ${rubric.passRule.variants} reviews`);
  }
  const dimIds = new Set((rubric.dimensions || []).map((d) => d.id));
  for (const review of sheet.reviews || []) {
    if (!review.variantId) errors.push("review.variantId required");
    if (!scores.has(review.overall)) errors.push(`invalid overall ${review.overall}`);
    const dims = review.dimensions || {};
    for (const id of dimIds) {
      if (!scores.has(dims[id])) errors.push(`${review.variantId||"?"} missing dimension ${id}`);
    }
    if (dims.accessibility === "critical-fail" || dims.control === "critical-fail") {
      if (review.overall !== "critical-fail") {
        errors.push(`${review.variantId} critical a11y/control must mark overall critical-fail`);
      }
    }
  }
  return errors;
}

export function summarizeReviews(sheets, rubric = loadRubric()) {
  const byVariant = new Map();
  for (const sheet of sheets) {
    for (const review of sheet.reviews) {
      const list = byVariant.get(review.variantId) || [];
      list.push({...review, reviewerId: sheet.reviewerId});
      byVariant.set(review.variantId, list);
    }
  }
  const usable = [...byVariant.entries()].filter(([, reviews]) => {
    return reviews.every((review) => {
      const dims = review.dimensions || {};
      if (dims.accessibility === "critical-fail" || dims.control === "critical-fail") return false;
      return review.overall === "usable" || review.overall === "needs-minor-revision";
    });
  }).map(([id]) => id);

  const disagreements = [];
  for (const [variantId, reviews] of byVariant) {
    if (reviews.length < 2) continue;
    const overalls = new Set(reviews.map((r) => r.overall));
    if (overalls.size > 1) {
      disagreements.push({
        variantId,
        overalls: [...overalls],
        reviewerIds: reviews.map((r) => r.reviewerId),
      });
    }
  }

  return {
    variants: byVariant.size,
    usableCount: usable.length,
    usableIds: usable,
    meetsHumanFloor: usable.length >= rubric.passRule.minimumUsableWithoutMajorRedesign,
    disagreements,
  };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const rubric = loadRubric();
  const validateAt = process.argv.indexOf("--validate");
  if (validateAt !== -1) {
    const paths = process.argv.slice(validateAt + 1).filter((arg) => !arg.startsWith("--"));
    if (paths.length < 1) {
      console.error("usage: node benchmark/judgment/human-review.mjs --validate sheet.json [sheet2.json …]");
      process.exit(2);
    }
    const sheets = [];
    const allErrors = [];
    for (const path of paths) {
      const sheet = JSON.parse(readFileSync(resolve(path), "utf8"));
      const errors = validateReviewSheet(sheet, rubric);
      if (errors.length) allErrors.push({path, errors});
      sheets.push(sheet);
    }
    if (allErrors.length) {
      console.error(JSON.stringify({ok: false, allErrors}, null, 2));
      process.exit(1);
    }
    const summary = summarizeReviews(sheets, rubric);
    console.log(JSON.stringify({
      ok: true,
      reviewers: sheets.map((s) => s.reviewerId),
      ...summary,
    }, null, 2));
    process.exit(summary.meetsHumanFloor ? 0 : 1);
  }
  console.log(JSON.stringify({dimensions: rubric.dimensions.length, passRule: rubric.passRule}, null, 2));
}
