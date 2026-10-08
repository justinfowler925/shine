import assert from "node:assert/strict";
import {
  OPERATE_SLOP_ANTI_PATTERN_IDS,
  antiPatternBansForScreen,
  getAntiPattern,
  loadAntiPatterns,
  loadOperateSlopAntiPatterns,
  loadPrinciples,
  machineDetectableAntiPatterns,
  retrieveAntiPatterns,
  retrievePrinciples,
  validateAntiPattern,
  validatePrinciple,
} from "../knowledge/retrieve.mjs";

const principles = loadPrinciples();
assert.ok(principles.length >= 30, `expected at least 30 seed principles, found ${principles.length}`);
for (const item of principles) assert.deepEqual(validatePrinciple(item), []);

const hits = retrievePrinciples("Alexis chart interrupt selection voice why this");
assert.ok(hits.some((h) => h.id === "shared-selection-for-multimodal"));

const owners = retrievePrinciples("reuse product DataGrid owners before installing a new block");
assert.ok(owners.some((h) => h.id === "product-owners-before-catalog"));

const noChange = retrievePrinciples("healthy queue audit should not invent defects");
assert.ok(noChange.some((h) => h.id === "no-change-when-sound"));

const anti = loadAntiPatterns();
assert.ok(anti.length >= 10, `expected ≥10 anti-patterns, found ${anti.length}`);
for (const item of anti) assert.deepEqual(validateAntiPattern(item), []);

const required = [
  "card-soup",
  "kpi-soup",
  "competing-filled-ctas",
  "dual-focal-grids",
  "marketing-dna-operate",
  "filler-empty-copy",
  "decorative-chart-no-units",
  "empty-filtered-error-conflated",
  "parallel-owned-component",
  "wrong-cite-category",
  "pill-filter-stack",
  "competing-page-titles",
  "dual-chrome-actions",
];
for (const id of required) {
  assert.ok(getAntiPattern(id), `missing anti-pattern ${id}`);
}

const queueBans = antiPatternBansForScreen("queue");
assert.ok(queueBans.length >= 2, JSON.stringify(queueBans));
assert.ok(queueBans.some((b) => /card-soup|kpi-soup|competing-filled|marketing-dna|dual-focal/.test(b)));

const ctaHits = retrieveAntiPatterns("competing filled CTA pressure on operate queue", {
  screen: "queue",
});
assert.ok(ctaHits.some((h) => h.id === "competing-filled-ctas"));

const machine = machineDetectableAntiPatterns();
assert.ok(machine.length >= 6, `expected machine-detectable subset, got ${machine.length}`);
assert.ok(machine.every((item) => item.detector));

const operateSlop = loadOperateSlopAntiPatterns(anti);
assert.equal(operateSlop.length, OPERATE_SLOP_ANTI_PATTERN_IDS.length);
assert.ok(operateSlop.every((item) => (item.tags || []).includes("operate-slop")));

console.log(
  `knowledge.test.mjs: ok (${principles.length} principles · ${anti.length} anti-patterns · ${machine.length} machine · ${operateSlop.length} Operate slop)`,
);
