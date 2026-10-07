#!/usr/bin/env node
/**
 * Doctor bite — skill A/B with-vs-without denoise guidance on pinned fixtures.
 * Machine oracles only; no preference / RLAIF data.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runSkillAbEval } from "./skill-ab-eval.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const casesPath = join(SHINE, "verify/fixtures/skill-ab/cases.json");
const guidance = join(SHINE, "skill/references/denoise.md");

assert.ok(existsSync(casesPath), "pinned skill-ab cases.json");
assert.ok(existsSync(guidance), "denoise.md guidance");

const manifest = JSON.parse(readFileSync(casesPath, "utf8"));
assert.equal(manifest.version, 1);
assert.ok(manifest.cases.length >= 5, "at least 5 pinned A/B cases");
assert.match(manifest.bar, /no preference/i);

const cropRequired = ["queue-cta", "queue-kpi", "sources-cite", "queue-dual-grid"];
for (const id of cropRequired) {
  const c = manifest.cases.find((x) => x.id === id);
  assert.ok(c?.crops?.before && c?.crops?.after, `${id} must pin before/after crop receipts`);
  assert.ok(existsSync(join(SHINE, c.fixture)), `${id} fixture missing`);
}

assert.ok(
  manifest.cases.find((c) => c.id === "queue-kpi")?.fixture?.includes("queue-kpi-before"),
  "KPI case must use dedicated queue-kpi-before.html",
);

const report = runSkillAbEval({ runMeasure: false });
assert.equal(report.total, manifest.cases.length);
assert.ok(report.guidance.markersOk, `denoise.md missing markers: ${report.guidance.missing}`);
assert.equal(report.withWins, report.total, JSON.stringify(report.cases.filter((c) => !c.with.pass), null, 2));
assert.equal(report.withoutWins, 0, JSON.stringify(report.cases.filter((c) => c.without.pass), null, 2));
assert.equal(report.deltas, report.total, JSON.stringify(report.cases.filter((c) => !c.deltaOk), null, 2));
assert.equal(report.cropsOk, true, JSON.stringify(report.cropPairs, null, 2));
assert.equal(report.meetsFloor, true);
assert.ok(report.failed === 0);

// Every with-arm must emit expected ops; without stays craft-only empty.
for (const row of report.cases) {
  assert.equal(row.without.craftOnly, true, row.id);
  assert.equal(row.without.opsApplied.length, 0, row.id);
  assert.ok(row.with.expectedHit, `${row.id} expected ops: ${JSON.stringify(row.with)}`);
  if (cropRequired.includes(row.id)) {
    assert.equal(row.crops.ok, true, `${row.id} crops: ${JSON.stringify(row.crops.errors)}`);
  }
}

console.log(
  `skill-ab-eval PASS: ${report.deltas}/${report.total} with>without · crops ${report.cropPairs?.length || 0} · guidance ${report.guidance.hash} · no preference data`,
);
