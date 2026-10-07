#!/usr/bin/env node
/**
 * Doctor bite — skill A/B with-vs-without denoise guidance on pinned fixtures.
 * Machine oracles only; no preference / RLAIF data.
 * Cropped receipts tied to Atlas reflexionVerdict (with=done, without=error).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isAtlasReflexionVerdict } from "../core/reflexion.mjs";
import { DEFECT_CROP_PAIRS } from "./restructure/defect-crops.mjs";
import { mintSkillAbCaseReceipt, runSkillAbEval } from "./skill-ab-eval.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const casesPath = join(SHINE, "verify/fixtures/skill-ab/cases.json");
const guidance = join(SHINE, "skill/references/denoise.md");
const RECEIPTS = join(SHINE, "verify/fixtures/denoise/receipts");

assert.ok(existsSync(casesPath), "pinned skill-ab cases.json");
assert.ok(existsSync(guidance), "denoise.md guidance");

const manifest = JSON.parse(readFileSync(casesPath, "utf8"));
assert.equal(manifest.version, 1);
assert.ok(manifest.cases.length >= 6, "at least 6 pinned A/B cases (incl. usul + sled-bloat)");
assert.match(manifest.bar, /no preference/i);
assert.match(manifest.bar, /reflexionVerdict/i);

const cropRequired = [
  "queue-cta",
  "queue-kpi",
  "usul-focal",
  "sources-cite",
  "queue-dual-grid",
  "queue-sled-bloat",
];
for (const id of cropRequired) {
  const c = manifest.cases.find((x) => x.id === id);
  assert.ok(c?.crops?.before && c?.crops?.after, `${id} must pin before/after crop receipts`);
  assert.ok(c?.cropPairId, `${id} must pin cropPairId`);
  assert.ok(existsSync(join(SHINE, c.fixture)), `${id} fixture missing`);
  assert.ok(
    DEFECT_CROP_PAIRS.some((p) => p.id === c.cropPairId),
    `${id} cropPairId ${c.cropPairId} missing from DEFECT_CROP_PAIRS`,
  );
}

assert.ok(
  manifest.cases.find((c) => c.id === "queue-kpi")?.fixture?.includes("queue-kpi-before"),
  "KPI case must use dedicated queue-kpi-before.html",
);
assert.ok(
  manifest.cases.find((c) => c.id === "queue-sled-bloat")?.mustClear?.includes("kpi-soup"),
  "sled-bloat must clear kpi-soup as well as cta-pressure",
);

const report = runSkillAbEval({ runMeasure: false });
assert.equal(report.total, manifest.cases.length);
assert.ok(report.guidance.markersOk, `denoise.md missing markers: ${report.guidance.missing}`);
assert.equal(report.withWins, report.total, JSON.stringify(report.cases.filter((c) => !c.with.pass), null, 2));
assert.equal(report.withoutWins, 0, JSON.stringify(report.cases.filter((c) => c.without.pass), null, 2));
assert.equal(report.deltas, report.total, JSON.stringify(report.cases.filter((c) => !c.deltaOk), null, 2));
assert.equal(report.cropsOk, true, JSON.stringify(report.cropPairs, null, 2));
assert.equal(report.reflexionOk, true, "every arm must stamp Atlas reflexionVerdict");
assert.equal(report.cropsBoundOk, true, "crop receipts must be tied to reflexionVerdict");
assert.equal(report.receiptsOk, true, "receiptsOk requires crops + Atlas stamp binding");
assert.equal(report.meetsFloor, true);
assert.ok(report.failed === 0);

// Every with-arm must emit expected ops; without stays craft-only empty;
// receipts stamp done|error and bind crop paths.
for (const row of report.cases) {
  assert.equal(row.without.craftOnly, true, row.id);
  assert.equal(row.without.opsApplied.length, 0, row.id);
  assert.ok(row.with.expectedHit, `${row.id} expected ops: ${JSON.stringify(row.with)}`);
  assert.equal(row.with.reflexionVerdict, "done", `${row.id} with reflexionVerdict`);
  assert.equal(row.without.reflexionVerdict, "error", `${row.id} without reflexionVerdict`);
  assert.ok(isAtlasReflexionVerdict(row.with.reflexionVerdict), row.id);
  assert.ok(row.receipt?.cropTiedToVerdict, `${row.id} cropTiedToVerdict`);
  assert.ok(row.receipt?.crops?.before && row.receipt?.crops?.after, `${row.id} receipt crop refs`);
  assert.ok(existsSync(join(RECEIPTS, row.receipt.crops.before)), `${row.id} before crop file`);
  assert.ok(existsSync(join(RECEIPTS, row.receipt.crops.after)), `${row.id} after crop file`);
  assert.ok(existsSync(row.receipt.path), `${row.id} receipt json`);
  const disk = JSON.parse(readFileSync(row.receipt.path, "utf8"));
  assert.equal(disk.schema, "shine-skill-ab-receipt/v1");
  assert.equal(disk.with.reflexionVerdict, "done");
  assert.equal(disk.without.reflexionVerdict, "error");
  assert.equal(disk.cropTiedToVerdict, true);
}

// Unit: mintSkillAbCaseReceipt fails closed on missing Atlas stamp path.
const sample = manifest.cases[0];
const minted = mintSkillAbCaseReceipt(
  sample,
  { pass: true, opsApplied: ["cta-budget"], measureCleared: ["cta-pressure"], craftOnly: false },
  { pass: false, opsApplied: [], craftOnly: true },
  { required: true, ok: true, before: sample.crops.before, after: sample.crops.after, defect: sample.crops.defect },
);
assert.equal(minted.with.reflexionVerdict, "done");
assert.equal(minted.without.reflexionVerdict, "error");
assert.equal(minted.cropTiedToVerdict, true);

console.log(
  `skill-ab-eval PASS: ${report.deltas}/${report.total} with>without · crops ${report.cropPairs?.length || 0} · receiptsOk · reflexionVerdict bound · guidance ${report.guidance.hash} · no preference data`,
);
