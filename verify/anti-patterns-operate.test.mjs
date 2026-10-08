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
import { formatPillFilterFailures } from "./pill-filter.mjs";
import { formatPageTitleFailures } from "./page-title.mjs";
import { formatChromePressureFailures } from "./chrome-pressure.mjs";
import { formatFilterReversibleFailures } from "./filter-reversible.mjs";
import { formatMarketingDnaFailures } from "./marketing-dna.mjs";
import { formatFillerEmptyFailures } from "./filler-empty.mjs";
import { formatCardSoupFailures } from "./card-soup.mjs";
import { formatEmptyTriadFailures } from "./empty-triad.mjs";

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
  "pill-filter-stack": {
    detector: "pill-filter",
    measureFailurePrefix: "pill-filter",
    alias: "pill-filter",
    restructureOps: ["pill-collapse"],
    cropPairId: "queue-pill",
  },
  "competing-page-titles": {
    detector: "page-title",
    measureFailurePrefix: "page-title",
    alias: "page-title",
    restructureOps: ["title-singular"],
    cropPairId: "queue-titles",
  },
  "dual-chrome-actions": {
    detector: "chrome-pressure",
    measureFailurePrefix: "chrome-pressure",
    alias: "chrome-pressure",
    restructureOps: ["chrome-budget"],
    cropPairId: "queue-chrome",
  },
  "irreversible-filters": {
    detector: "filter-reversible",
    measureFailurePrefix: "filter-reversible",
    alias: "filter-reversible",
    restructureOps: ["filter-clearable"],
    cropPairId: "queue-filters",
  },
  "marketing-dna-operate": {
    detector: "marketing-dna",
    measureFailurePrefix: "marketing-dna",
    alias: "marketing-dna",
    restructureOps: ["strip-marketing-dna"],
    cropPairId: "queue-marketing-dna",
  },
  "filler-empty-copy": {
    detector: "filler-empty",
    measureFailurePrefix: "filler-empty",
    alias: "filler-empty",
    restructureOps: ["rewrite-filler-empty"],
    cropPairId: "queue-filler-empty",
  },
  "card-soup": {
    detector: "card-soup",
    measureFailurePrefix: "card-soup",
    alias: "card-soup",
    restructureOps: ["collapse-card-soup"],
    cropPairId: "catalog-card-soup",
  },
  "empty-filtered-error-conflated": {
    detector: "empty-triad",
    measureFailurePrefix: "empty-triad",
    alias: "empty-triad",
    restructureOps: ["split-empty-triad"],
    cropPairId: "queue-empty-triad",
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

const pillHits = retrieveAntiPatterns("pill filter chip stack above fold crowding queue triage", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(pillHits.some((h) => h.id === "pill-filter-stack"), JSON.stringify(pillHits.map((h) => h.id)));

const titleHits = retrieveAntiPatterns("competing page titles dual h1 title stack on queue", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(titleHits.some((h) => h.id === "competing-page-titles"), JSON.stringify(titleHits.map((h) => h.id)));

const chromeHits = retrieveAntiPatterns("nav chrome Export New filled header competing with Pursue", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(chromeHits.some((h) => h.id === "dual-chrome-actions"), JSON.stringify(chromeHits.map((h) => h.id)));

const filterHits = retrieveAntiPatterns("irreversible filters stuck chips no clear dismiss queue", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(filterHits.some((h) => h.id === "irreversible-filters"), JSON.stringify(filterHits.map((h) => h.id)));

const dnaHits = retrieveAntiPatterns("marketing DNA glow purple gradient display serif on queue operate", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(dnaHits.some((h) => h.id === "marketing-dna-operate"), JSON.stringify(dnaHits.map((h) => h.id)));

const fillerHits = retrieveAntiPatterns("filler empty welcome dashboard coming soon nothing here yet", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(fillerHits.some((h) => h.id === "filler-empty-copy"), JSON.stringify(fillerHits.map((h) => h.id)));

const cardSoupHits = retrieveAntiPatterns("equal Card soup no focal collapse-card-soup catalog tools", {
  screen: "catalog",
  antiPatterns: corpus,
});
assert.ok(cardSoupHits.some((h) => h.id === "card-soup"), JSON.stringify(cardSoupHits.map((h) => h.id)));

const emptyTriadHits = retrieveAntiPatterns("empty filtered error conflated triad no data alert queue", {
  screen: "queue",
  antiPatterns: corpus,
});
assert.ok(emptyTriadHits.some((h) => h.id === "empty-filtered-error-conflated"), JSON.stringify(emptyTriadHits.map((h) => h.id)));

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

const pillFails = formatPillFilterFailures({ pillCount: 7, labels: ["Status"] }, { gate: true });
assert.ok(
  pillFails.some((f) => /pill-filter:/.test(f) && /anti-pattern:pill-filter-stack/.test(f)),
  pillFails.join("\n"),
);

const titleFails = formatPageTitleFailures(
  { titleCount: 3, texts: ["Queue", "Triage", "Worklist"] },
  { gate: true },
);
assert.ok(
  titleFails.some((f) => /page-title:/.test(f) && /anti-pattern:competing-page-titles/.test(f)),
  titleFails.join("\n"),
);

const chromeFails = formatChromePressureFailures(
  { chromeFilledCount: 2, chromeFilledSamples: ["Export", "New"] },
  { gate: true },
);
assert.ok(
  chromeFails.some((f) => /chrome-pressure:/.test(f) && /anti-pattern:dual-chrome-actions/.test(f)),
  chromeFails.join("\n"),
);

const filterFails = formatFilterReversibleFailures(
  { irreversibleCount: 2, irreversibleSamples: ["Status: Open", "Owner: Me"] },
  { gate: true },
);
assert.ok(
  filterFails.some((f) => /filter-reversible:/.test(f) && /anti-pattern:irreversible-filters/.test(f)),
  filterFails.join("\n"),
);

const dnaFails = formatMarketingDnaFailures(
  { marketingHits: ["glow utility", "marketing gradient cluster"] },
  { gate: true },
);
assert.ok(
  dnaFails.some((f) => /marketing-dna:/.test(f) && /anti-pattern:marketing-dna-operate/.test(f)),
  dnaFails.join("\n"),
);

const fillerFails = formatFillerEmptyFailures(
  { fillerHits: [{ text: "Welcome to your dashboard" }] },
  { gate: true },
);
assert.ok(
  fillerFails.some((f) => /filler-empty:/.test(f) && /anti-pattern:filler-empty-copy/.test(f)),
  fillerFails.join("\n"),
);

const cardSoupFails = formatCardSoupFailures(
  { equalCardCount: 4, hasFocal: false },
  { gate: true },
);
assert.ok(
  cardSoupFails.some((f) => /card-soup:/.test(f) && /anti-pattern:card-soup/.test(f)),
  cardSoupFails.join("\n"),
);

const emptyTriadFails = formatEmptyTriadFailures(
  { sameNodeConflatedCount: 1, sharedCopyCount: 0, missingFilteredEmpty: true },
  { gate: true },
);
assert.ok(
  emptyTriadFails.some((f) => /empty-triad:/.test(f) && /anti-pattern:empty-filtered-error-conflated/.test(f)),
  emptyTriadFails.join("\n"),
);

assert.equal(formatAntiPatternCite("kpi-soup"), "anti-pattern:kpi-soup");
assert.match(withAntiPatternCite("kpi-soup: tiles", "kpi-soup"), /anti-pattern:kpi-soup/);

console.log(
  `anti-patterns-operate.test.mjs: ok (${operateSlop.length} Operate slop · ${corpus.length} library · formatters cite anti-pattern:<id>)`,
);
