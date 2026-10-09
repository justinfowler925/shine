#!/usr/bin/env node
/**
 * Gold-standard truth — fail if gold-standard.json claims packs/health that
 * disk does not have. Stops the "all gold packs pass reference-health" lie.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadClearspeedTwGoldStandard } from "../core/edition-siblings.mjs";
import { referenceHealth } from "../corpus/reference-health.mjs";
import catalog from "../corpus/templates.json" with { type: "json" };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const gold = loadClearspeedTwGoldStandard();
assert.ok(gold, "gold-standard.json required");

const families = gold.families || ["flowbite", "tailadmin", "untitled"];
const counts = gold.counts || {};
const templates = catalog.templates || [];

const problems = [];
let totalOk = 0;

for (const family of families) {
  const rows = templates.filter(
    (t) =>
      t.id.startsWith(`${family}-`) ||
      t.dna?.family === family ||
      (gold.kits || []).includes(t.kit) && t.id.startsWith(`${family}-`),
  );
  // Prefer id-prefix match (canonical for these three kits).
  const byPrefix = templates.filter((t) => t.id.startsWith(`${family}-`));
  const claimed = counts[family];
  if (Number.isFinite(claimed) && byPrefix.length !== claimed) {
    problems.push(`${family}: gold counts.${family}=${claimed} but catalog has ${byPrefix.length} rows`);
  }
  for (const row of byPrefix) {
    const packDir = join(ROOT, "corpus/packs", row.id);
    const shot = join(packDir, "shot.png");
    if (!existsSync(shot)) {
      problems.push(`${row.id}: gold claims usable pack but shot.png missing`);
      continue;
    }
    const health = referenceHealth(ROOT, row.id);
    if (health.status !== "passed") {
      problems.push(`${row.id}: gold claims health pass but referenceHealth=${health.status} (${(health.reasons || []).join("; ")})`);
      continue;
    }
    totalOk += 1;
  }
}

if (counts.requirePackOnDisk !== false && problems.length) {
  assert.fail(`gold-standard drift:\n  ${problems.join("\n  ")}`);
}

const totalClaimed = counts.totalSelectable;
if (Number.isFinite(totalClaimed)) {
  assert.equal(
    totalOk,
    totalClaimed,
    `gold counts.totalSelectable=${totalClaimed} but ${totalOk} packs health-passed on disk`,
  );
}

// notWinner pack counts must not understate tip (stale "4 TailGrids" lies).
for (const [key, meta] of Object.entries(gold.notWinner || {})) {
  if (!Number.isFinite(meta?.packs)) continue;
  const prefix = key.endsWith("-") ? key : `${key}-`;
  const onDisk = templates.filter((t) => t.id.startsWith(prefix)).length;
  assert.equal(
    meta.packs,
    onDisk,
    `gold notWinner.${key}.packs=${meta.packs} but catalog has ${onDisk} rows — update gold-standard.json`,
  );
}

assert.match(
  String(gold.citeUsability || ""),
  /gold-standard-truth|Doctor bite|referenceHealth/,
  "citeUsability must name the doctor truth gate, not a bare 'all packs pass' claim",
);

console.log(
  `gold-standard-truth PASS: ${totalOk}/${counts.totalSelectable || totalOk} TW gold packs on disk + health-passed; notWinner counts match catalog`,
);
