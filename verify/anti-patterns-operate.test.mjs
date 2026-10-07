#!/usr/bin/env node
/**
 * Doctor bite — Operate slop anti-patterns library.
 * Loads knowledge/anti-patterns/*.json, requires the dual-focal / KPI soup /
 * CTA pressure / wrong-cite quartet, and checks measure formatters cite
 * anti-pattern:<id>.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  OPERATE_SLOP_ANTI_PATTERN_IDS,
  formatAntiPatternCite,
  formatWrongCiteFailures,
  getAntiPattern,
  loadAntiPatterns,
  loadOperateSlopAntiPatterns,
  resolveAntiPattern,
  retrieveAntiPatterns,
  validateAntiPattern,
  withAntiPatternCite,
} from "../knowledge/retrieve.mjs";
import { formatCtaPressureFailures } from "./cta-pressure.mjs";
import { formatDualFocalFailures } from "./dual-focal.mjs";
import { formatKpiSoupFailures } from "./kpi-soup.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const corpus = loadAntiPatterns(join(SHINE, "knowledge/anti-patterns"));
assert.ok(corpus.length >= 12, `expected ≥12 anti-patterns, found ${corpus.length}`);
for (const item of corpus) {
  assert.deepEqual(validateAntiPattern(item), [], `${item.id}: ${validateAntiPattern(item).join("; ")}`);
}

const operateSlop = loadOperateSlopAntiPatterns(corpus);
assert.equal(operateSlop.length, OPERATE_SLOP_ANTI_PATTERN_IDS.length);

const expected = {
  "dual-focal-grids": {
    detector: "dual-focal",
    measureFailurePrefix: "dual-focal",
    alias: "dual-focal",
    restructureOps: ["collapse-peer-grids"],
    cropPairId: "queue-dual-grid",
  },
  "kpi-soup": {
    detector: "kpi-soup",
    measureFailurePrefix: "kpi-soup",
    alias: "kpi-soup",
    restructureOps: ["kpi-collapse"],
    cropPairId: "queue-kpi",
  },
  "competing-filled-ctas": {
    detector: "cta-pressure",
    measureFailurePrefix: "cta-pressure",
    alias: "cta-pressure",
    restructureOps: ["cta-budget"],
    cropPairId: "queue-cta",
  },
  "wrong-cite-category": {
    detector: "cite-operate",
    measureFailurePrefix: "cite-honesty",
    alias: "wrong-cite",
    restructureOps: ["rebind-cite"],
    cropPairId: "sources-cite",
  },
};

for (const id of OPERATE_SLOP_ANTI_PATTERN_IDS) {
  const row = getAntiPattern(id, corpus);
  assert.ok(row, `missing ${id}`);
  const want = expected[id];
  assert.equal(row.detector, want.detector, id);
  assert.equal(row.measureFailurePrefix, want.measureFailurePrefix, id);
  assert.ok((row.tags || []).includes("operate-slop"), `${id} missing operate-slop tag`);
  assert.ok(Array.isArray(row.aliases) && row.aliases.includes(want.alias), `${id} aliases`);
  assert.ok(Array.isArray(row.examples) && row.examples.length >= 1, `${id} examples`);
  assert.deepEqual(row.restructureOps, want.restructureOps, id);
  assert.equal(row.cropPairId, want.cropPairId, id);
  assert.ok(row.fixtures?.before && row.fixtures?.after, `${id} fixtures`);
  for (const key of ["before", "after", "cropBefore", "cropAfter"]) {
    const rel = row.fixtures[key];
    assert.ok(rel, `${id}.fixtures.${key}`);
    assert.ok(existsSync(join(SHINE, rel)), `${id} missing on disk: ${rel}`);
  }
  assert.ok(resolveAntiPattern(want.alias, corpus)?.id === id, `alias ${want.alias} → ${id}`);
}

// Retrieval hits for Operate jobs
const dualHits = retrieveAntiPatterns("peer DataGrids dual focal saved-view XOR on queue triage", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(dualHits.some((h) => h.id === "dual-focal-grids"), JSON.stringify(dualHits.map((h) => h.id)));

const kpiHits = retrieveAntiPatterns("equal KPI metric soup encyclopedia on decide path", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(kpiHits.some((h) => h.id === "kpi-soup"), JSON.stringify(kpiHits.map((h) => h.id)));

const ctaHits = retrieveAntiPatterns("competing filled CTA pressure Pursue Assign lead", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(ctaHits.some((h) => h.id === "competing-filled-ctas"), JSON.stringify(ctaHits.map((h) => h.id)));

const citeHits = retrieveAntiPatterns("wrong cite settings Sources with queue category", {
  screen: "settings",
  antiPatterns: corpus,
});
assert.ok(citeHits.some((h) => h.id === "wrong-cite-category"), JSON.stringify(citeHits.map((h) => h.id)));

// Measure formatters cite anti-pattern:<id>
const dualFails = formatDualFocalFailures(
  { peerGridCount: 2, titles: ["David's 10", "Queue"] },
  { gate: true },
);
assert.ok(dualFails.some((f) => /dual-focal:/.test(f) && /anti-pattern:dual-focal-grids/.test(f)), dualFails.join("\n"));

const kpiFails = formatKpiSoupFailures({ equalMetricCount: 10 }, { gate: true });
assert.ok(kpiFails.some((f) => /kpi-soup:/.test(f) && /anti-pattern:kpi-soup/.test(f)), kpiFails.join("\n"));

const ctaFails = formatCtaPressureFailures(
  { mainControlCount: 3, mainFilledCount: 2, mainFilledSamples: ["Pursue", "Assign lead"] },
  { gate: true },
);
assert.ok(
  ctaFails.some((f) => /cta-pressure:.*competing filled/.test(f) && /anti-pattern:competing-filled-ctas/.test(f)),
  ctaFails.join("\n"),
);

const wrongFails = formatWrongCiteFailures({
  citeId: "shadcn-queue",
  category: "settings",
  note: "data-cite=shadcn-queue on a Sources/settings job",
});
assert.ok(
  wrongFails.some((f) => /cite-honesty:/.test(f) && /anti-pattern:wrong-cite-category/.test(f)),
  wrongFails.join("\n"),
);

assert.equal(formatAntiPatternCite("kpi-soup"), "anti-pattern:kpi-soup");
assert.match(withAntiPatternCite("kpi-soup: tiles", "kpi-soup"), /anti-pattern:kpi-soup/);

console.log(
  `anti-patterns-operate.test.mjs: ok (${operateSlop.length} Operate slop · ${corpus.length} library · formatters cite anti-pattern:<id>)`,
);
