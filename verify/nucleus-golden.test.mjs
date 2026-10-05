#!/usr/bin/env node
// P4a/P6 — Nucleus golden fixture: seeded bloat fails CTA/composition; after passes measure.
// Proof = fail→pass logs + defect crops (not twin full-page screenshots).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/nucleus-golden");
const RECEIPTS = join(FIX, "receipts");
const measure = join(SHINE, "verify/measure.mjs");

assert.ok(existsSync(join(FIX, "before.html")));
assert.ok(existsSync(join(FIX, "after.html")));
assert.ok(existsSync(join(SHINE, "skill/references/clearspeed/profile-instructions.md")));

function runMeasure(file) {
  return spawnSync(process.execPath, [measure, file, "--cite", "shadcn-catalog", "--lane", "saas"], {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
    timeout: 120_000,
  });
}

mkdirSync(RECEIPTS, { recursive: true });

const before = runMeasure(join(FIX, "before.html"));
const beforeErr = `${before.stderr || ""}\n${before.stdout || ""}`;
writeFileSync(join(RECEIPTS, "before-measure.log"), beforeErr);
assert.notEqual(before.status, 0, "seeded Nucleus bloat must fail measure");
assert.match(beforeErr, /cta-pressure:.*competing filled/, beforeErr.slice(-1200));
assert.match(beforeErr, /composition-slop:/, beforeErr.slice(-1200));

const after = runMeasure(join(FIX, "after.html"));
const afterErr = `${after.stderr || ""}\n${after.stdout || ""}`;
writeFileSync(join(RECEIPTS, "after-measure.log"), afterErr);
assert.equal(after.status, 0, `after must PASS measure:\n${afterErr.slice(-1200)}`);
assert.doesNotMatch(afterErr, /cta-pressure:.*competing filled/);
assert.doesNotMatch(afterErr, /composition-slop:/);
assert.match(afterErr, /MEASURE PASS/);

// Defect crops must exist and differ (fail→pass evidence, not twin full-page shots)
for (const name of ["before-cta-crop.png", "before-cards-crop.png", "after-cta-crop.png"]) {
  assert.ok(existsSync(join(RECEIPTS, name)), `${name} crop required`);
}
const beforeCrop = readFileSync(join(RECEIPTS, "before-cta-crop.png"));
const afterCrop = readFileSync(join(RECEIPTS, "after-cta-crop.png"));
assert.notEqual(beforeCrop.equals(afterCrop), true, "before/after CTA crops must not be identical bytes");

console.log("nucleus-golden PASS: before fails CTA+slop · after measure PASS · distinct defect crops");
