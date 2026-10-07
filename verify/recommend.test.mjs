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

// Records / worklist jobs bind shine-tables.json fixture into recommend + denoise packet
const recordsRec = recommendPattern(templates, "records inspect edit persist worklist", {
  lane: "saas",
  category: "record",
  limit: 6,
});
assert.ok(recordsRec.tableQuality?.fixture, "records job tableQuality.fixture");
assert.match(recordsRec.tableQuality.fixture, /records-worklist\/shine-tables\.json$/);
assert.match(formatRecommendationSummary(recordsRec), /tableQuality/);
const denoiseRecords = createDesignPacket({
  job: "Records inspect → edit → persist",
  lane: "saas",
  mode: "denoise",
  category: "record",
  project: SHINE,
  accept: true,
});
assert.match(denoiseRecords.tableQuality.example, /records-worklist\/shine-tables\.json$/);

// Queue / triage jobs bind D10 XOR dual-grid FAIL→PASS fixtures into recommend + denoise packet
const queueRec = recommendPattern(templates, "work queue triage inbox", {
  lane: "saas",
  category: "queue",
  limit: 6,
});
assert.ok(queueRec.xorSavedView?.fixtureBefore, "queue job xorSavedView.fixtureBefore");
assert.match(queueRec.xorSavedView.fixtureBefore, /queue-dual-grid-before\.html$/);
assert.match(queueRec.xorSavedView.cropAfter, /queue-dual-grid-fold-crop\.html$/);
assert.match(formatRecommendationSummary(queueRec), /xorSavedView/);
assert.ok(queueRec.ctaPressureAst?.fixtureTsx, "queue job ctaPressureAst.fixtureTsx");
assert.match(queueRec.ctaPressureAst.fixtureTsx, /queue-dual-cta\.tsx$/);
assert.match(queueRec.ctaPressureAst.cropAfter, /queue-cta-tsx-after-crop\.html$/);
assert.match(formatRecommendationSummary(queueRec), /ctaPressureAst/);
assert.ok(queueRec.kpiSoupAst?.fixtureTsx, "queue job kpiSoupAst.fixtureTsx");
assert.match(queueRec.kpiSoupAst.fixtureTsx, /queue-kpi-soup\.tsx$/);
assert.match(queueRec.kpiSoupAst.cropAfter, /queue-kpi-tsx-after-crop\.html$/);
assert.match(formatRecommendationSummary(queueRec), /kpiSoupAst/);
assert.equal(queueRec.kpiSoupAst.maxVisible, 3);
assert.ok(queueRec.dualFocalAst?.fixtureTsx, "queue job dualFocalAst.fixtureTsx");
assert.match(queueRec.dualFocalAst.fixtureTsx, /queue-dual-grid\.tsx$/);
assert.match(queueRec.dualFocalAst.cropAfter, /queue-dual-grid-tsx-after-crop\.html$/);
assert.match(formatRecommendationSummary(queueRec), /dualFocalAst/);
assert.equal(queueRec.dualFocalAst.op, "collapse-peer-grids");
assert.ok(queueRec.worklistFirstAst?.fixtureTsx, "queue job worklistFirstAst.fixtureTsx");
assert.match(queueRec.worklistFirstAst.fixtureTsx, /queue-kpi-chrome-first\.tsx$/);
assert.match(queueRec.worklistFirstAst.cropAfter, /queue-worklist-first-tsx-after-crop\.html$/);
assert.match(formatRecommendationSummary(queueRec), /worklistFirstAst/);
assert.equal(queueRec.worklistFirstAst.op, "worklist-first");
assert.ok(queueRec.setFocalAst?.fixtureTsx, "queue job setFocalAst.fixtureTsx");
assert.match(queueRec.setFocalAst.fixtureTsx, /usul-no-focal\.tsx$/);
assert.match(queueRec.setFocalAst.cropAfter, /usul-focal-tsx-after-crop\.html$/);
assert.match(formatRecommendationSummary(queueRec), /setFocalAst/);
assert.equal(queueRec.setFocalAst.op, "set-focal");
assert.equal(queueRec.wrongCiteAst, null, "queue job must not bind wrongCiteAst");
const settingsRec = recommendPattern(catalog.templates, "account settings preferences", {
  lane: "saas",
  category: "settings",
  limit: 6,
});
assert.ok(settingsRec.wrongCiteAst?.fixtureTsx, "settings job wrongCiteAst.fixtureTsx");
assert.match(settingsRec.wrongCiteAst.fixtureTsx, /settings-wrong-cite\.tsx$/);
assert.match(settingsRec.wrongCiteAst.cropAfter, /sources-cite-tsx-after-crop\.html$/);
assert.match(formatRecommendationSummary(settingsRec), /wrongCiteAst/);
assert.equal(settingsRec.wrongCiteAst.op, "rebind-cite");
assert.equal(settingsRec.wrongCiteAst.refusePaintUntilRebound, true);
const denoiseQueue = createDesignPacket({
  job: "Queue triage dual worklist XOR saved-view",
  lane: "saas",
  mode: "denoise",
  category: "queue",
  project: SHINE,
  accept: true,
});
assert.match(denoiseQueue.xorSavedView.cropAfter, /queue-dual-grid-fold-crop\.html$/);
assert.ok((denoiseQueue.ddr.restructureOps || []).includes("collapse-peer-grids"));
assert.match(denoiseQueue.ctaPressureAst.cropAfter, /queue-cta-tsx-after-crop\.html$/);
assert.ok((denoiseQueue.ddr.restructureOps || []).includes("cta-budget"));
assert.equal(denoiseQueue.ctaPressureAst.maxFilled, 1);
assert.match(denoiseQueue.kpiSoupAst.cropAfter, /queue-kpi-tsx-after-crop\.html$/);
assert.ok((denoiseQueue.ddr.restructureOps || []).includes("kpi-collapse"));
assert.equal(denoiseQueue.kpiSoupAst.maxVisible, 3);
assert.match(denoiseQueue.dualFocalAst.cropAfter, /queue-dual-grid-tsx-after-crop\.html$/);
assert.equal(denoiseQueue.dualFocalAst.xorMode, "xor-saved-view");
assert.match(denoiseQueue.worklistFirstAst.cropAfter, /queue-worklist-first-tsx-after-crop\.html$/);
assert.equal(denoiseQueue.worklistFirstAst.op, "worklist-first");
assert.match(denoiseQueue.setFocalAst.cropAfter, /usul-focal-tsx-after-crop\.html$/);
assert.equal(denoiseQueue.setFocalAst.op, "set-focal");
assert.ok((denoiseQueue.ddr.restructureOps || []).includes("set-focal"));
assert.equal(denoiseQueue.wrongCiteAst, undefined, "queue packet must not bind wrongCiteAst");
const denoiseSettings = createDesignPacket({
  job: "Sources & recipes settings wrong-cite AST",
  lane: "saas",
  mode: "denoise",
  category: "settings",
  project: SHINE,
  accept: true,
});
assert.match(denoiseSettings.wrongCiteAst.cropAfter, /sources-cite-tsx-after-crop\.html$/);
assert.equal(denoiseSettings.wrongCiteAst.op, "rebind-cite");
assert.equal(denoiseSettings.wrongCiteAst.refusePaintUntilRebound, true);
assert.equal(denoiseSettings.setFocalAst, undefined, "settings packet must not bind setFocalAst");

// CLI smoke
const cite = spawnSync(process.execPath, [join(SHINE, "corpus/cite.mjs"), "settings page", "--lane", "saas"], {
  encoding: "utf8",
});
assert.equal(cite.status, 0, cite.stderr);
assert.match(cite.stdout, /recommendation:/);

console.log(
  `recommend PASS: ${JOBS.length} Operate jobs · packet recommendation · cite CLI · xorSavedView · ctaPressureAst · kpiSoupAst · dualFocalAst · worklistFirstAst · setFocalAst · wrongCiteAst`,
);
