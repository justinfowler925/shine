#!/usr/bin/env node
/**
 * Doctor bite — measure.mjs fail-closed when Operate defects fire without
 * citing matching anti-pattern:<id> from knowledge/anti-patterns.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  OPERATE_SLOP_ANTI_PATTERN_IDS,
  enforceOperateAntiPatternCites,
  extractAntiPatternCites,
  formatWrongCiteFailures,
  loadAntiPatterns,
  loadOperateSlopAntiPatterns,
  operateDefectPrefixToAntiPatternId,
  withAntiPatternCite,
} from "../knowledge/retrieve.mjs";
import { formatCtaPressureFailures } from "./cta-pressure.mjs";
import { formatDualFocalFailures } from "./dual-focal.mjs";
import { formatKpiSoupFailures } from "./kpi-soup.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const corpus = loadAntiPatterns(join(SHINE, "knowledge/anti-patterns"));
const operateSlop = loadOperateSlopAntiPatterns(corpus);
assert.equal(operateSlop.length, OPERATE_SLOP_ANTI_PATTERN_IDS.length);

const prefixMap = operateDefectPrefixToAntiPatternId(corpus);
assert.equal(prefixMap.get("dual-focal"), "dual-focal-grids");
assert.equal(prefixMap.get("kpi-soup"), "kpi-soup");
assert.equal(prefixMap.get("cta-pressure"), "competing-filled-ctas");
assert.equal(prefixMap.get("cite-honesty"), "wrong-cite-category");

// Green path: formatter cites → no meta-failures
const dualOk = formatDualFocalFailures(
  { peerGridCount: 2, titles: ["David's 10", "Queue"] },
  { gate: true },
);
const kpiOk = formatKpiSoupFailures({ equalMetricCount: 10 }, { gate: true });
const ctaOk = formatCtaPressureFailures(
  { mainControlCount: 3, mainFilledCount: 2, mainFilledSamples: ["Pursue", "Assign lead"] },
  { gate: true },
);
const citeOk = formatWrongCiteFailures({
  citeId: "shadcn-queue",
  category: "settings",
  note: "data-cite=shadcn-queue on a Sources/settings job",
});
const green = [...dualOk, ...kpiOk, ...ctaOk, ...citeOk];
assert.equal(enforceOperateAntiPatternCites(green, { antiPatterns: corpus }).length, 0);
for (const line of green) {
  const cites = extractAntiPatternCites(line);
  assert.ok(cites.length >= 1, line);
}

// Bite: bare Operate defect prefix without anti-pattern:<id>
const bare = [
  "dual-focal: 2 peer worklists/grids in main — fold peers as saved-view/XOR",
  "kpi-soup: 8 equal metric tiles in main — collapse to ≤3 chips",
  "cta-pressure: 2 competing filled treatments in main — one filled primary",
  "cite-honesty: page cite shadcn-queue does not match category settings",
];
const bareExtras = enforceOperateAntiPatternCites(bare, { antiPatterns: corpus });
assert.equal(bareExtras.length, 4, bareExtras.join("\n"));
for (const line of bareExtras) {
  assert.match(line, /^anti-pattern-cite:/);
  assert.match(line, /fail-closed/);
}
assert.ok(bareExtras.some((f) => /anti-pattern:dual-focal-grids/.test(f)));
assert.ok(bareExtras.some((f) => /anti-pattern:kpi-soup/.test(f)));
assert.ok(bareExtras.some((f) => /anti-pattern:competing-filled-ctas/.test(f)));
assert.ok(bareExtras.some((f) => /anti-pattern:wrong-cite-category/.test(f)));

// Bite: wrong catalog id on a matching prefix
const wrongId = [
  withAntiPatternCite("dual-focal: peers", "kpi-soup"), // wrong id for prefix
];
const wrongExtras = enforceOperateAntiPatternCites(wrongId, { antiPatterns: corpus });
assert.equal(wrongExtras.length, 1);
assert.match(wrongExtras[0], /cited anti-pattern:kpi-soup/);
assert.match(wrongExtras[0], /anti-pattern:dual-focal-grids/);

// Meta-failures do not re-trigger
assert.equal(
  enforceOperateAntiPatternCites(bareExtras, { antiPatterns: corpus }).length,
  0,
);

// Non-Operate failure lines are ignored
assert.equal(
  enforceOperateAntiPatternCites(
    ["axe: color-contrast", "contrast: <p> text p5 3.2:1 < 4.5:1"],
    { antiPatterns: corpus },
  ).length,
  0,
);

// measure.mjs wires the gate
const measureSrc = readFileSync(join(SHINE, "verify/measure.mjs"), "utf8");
assert.match(measureSrc, /enforceOperateAntiPatternCites/);
assert.match(measureSrc, /from ["']\.\.\/knowledge\/retrieve\.mjs["']/);

console.log(
  `measure-anti-pattern-cite.test.mjs: ok (prefix map · green cites · bare/wrong bite · measure.mjs wired)`,
);
