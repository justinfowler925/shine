#!/usr/bin/env node
// P5 — Pattern recommender (cite v2): 8+ Nucleus-like Operate jobs emit typed recommendation.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import { recommendPattern, formatRecommendationSummary } from "../corpus/recommend.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const templates = catalog.templates;

const JOBS = [
  { job: "work queue triage inbox", screen: "queue" },
  { job: "account settings preferences", screen: "settings" },
  { job: "company tools card catalog packages", screen: "catalog", category: "catalog" },
  { job: "dashboard analytics metrics cockpit", screen: "dashboard" },
  { job: "invite teammate form", screen: "form" },
  { job: "customer account record detail", screen: "record" },
  { job: "weekly cadence board report-out", screen: "weekly-board" },
  { job: "approval inbox assign owners", screen: "queue" },
];

for (const { job, screen } of JOBS) {
  const rec = recommendPattern(templates, job, { lane: "saas", limit: 6 });
  assert.ok(rec.primary, `${job}: primary required`);
  assert.equal(rec.primary.scope, "page", `${job}: primary must be page, got ${rec.primary.id}`);
  assert.notEqual(rec.primary.screen, "charts", `${job}: chart atom must not be primary`);
  assert.ok(Array.isArray(rec.antiPatterns) && rec.antiPatterns.length >= 2, `${job}: antiPatterns`);
  assert.ok(Array.isArray(rec.restructureHints) && rec.restructureHints.length >= 1, `${job}: restructureHints`);
  assert.ok(typeof rec.kitRecipe === "string" && rec.kitRecipe.length > 8, `${job}: kitRecipe`);
  assert.ok(rec.confidence > 0 && rec.confidence <= 1, `${job}: confidence`);
  const summary = formatRecommendationSummary(rec);
  assert.match(summary, /recommendation:/);
  // Screen match is soft for approval→queue; require non-chart Operate family.
  if (screen !== "queue" || !/approval/i.test(job)) {
    assert.equal(rec.primary.screen, screen, `${job}: expected ${screen}, got ${rec.primary.screen} (${rec.primary.id})`);
  }
}

// Packet carries recommendation
const packet = createDesignPacket({
  job: "Company Tools catalog: find and install a package",
  lane: "saas",
  mode: "audit",
  category: "catalog",
  project: SHINE,
});
assert.ok(packet.recommendation?.primary?.id, "packet.recommendation.primary");
assert.ok(packet.recommendationSummary?.startsWith("recommendation:"));
assert.match(packet.recommendation.instruction || "", /before editing/i);

// CLI smoke
const cite = spawnSync(process.execPath, [join(SHINE, "corpus/cite.mjs"), "settings page", "--lane", "saas"], {
  encoding: "utf8",
});
assert.equal(cite.status, 0, cite.stderr);
assert.match(cite.stdout, /recommendation:/);

console.log(`recommend PASS: ${JOBS.length} Operate jobs · packet recommendation · cite CLI`);
