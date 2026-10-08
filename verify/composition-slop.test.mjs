#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "./deps.mjs";
import {
  CARD_SOUP_MIN,
  compositionSlopGateApplies,
  evaluateCompositionSlop,
  formatCompositionSlopFailures,
} from "./composition-slop.mjs";
import { formatMarketingDnaFailures } from "./marketing-dna.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/composition-slop");
const measure = join(SHINE, "verify/measure.mjs");
const { chromium } = load("playwright");

assert.equal(CARD_SOUP_MIN, 4);
assert.equal(compositionSlopGateApplies({ citeScreen: "settings", lane: "saas" }), true);
assert.equal(compositionSlopGateApplies({ isWireframe: true, citeScreen: "settings" }), false);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  await page.goto(pathToFileURL(join(FIX, "card-soup.html")).href, { waitUntil: "load" });
  const soup = await page.evaluate(evaluateCompositionSlop);
  assert.ok(soup.equalCardCount >= 4, JSON.stringify(soup));
  assert.equal(soup.hasFocal, false);
  assert.ok(
    formatCompositionSlopFailures(soup, { gate: true }).some(
      (f) => /anti-pattern:card-soup/.test(f) && /equal-weight Card/.test(f),
    ),
  );

  await page.goto(pathToFileURL(join(FIX, "marketing-dna.html")).href, { waitUntil: "load" });
  const dna = await page.evaluate(evaluateCompositionSlop);
  assert.ok(dna.marketingHits.length, JSON.stringify(dna));
  assert.ok(
    formatMarketingDnaFailures(dna, { gate: true }).some(
      (f) => /anti-pattern:marketing-dna-operate/.test(f) && /marketing-dna:/.test(f),
    ),
  );

  await page.goto(pathToFileURL(join(FIX, "filler-empty.html")).href, { waitUntil: "load" });
  const filler = await page.evaluate(evaluateCompositionSlop);
  assert.ok(filler.fillerHits.length, JSON.stringify(filler));
  assert.ok(
    formatCompositionSlopFailures(filler, { gate: true }).some(
      (f) => /anti-pattern:filler-empty-copy/.test(f) && /filler empty/.test(f),
    ),
  );

  await page.goto(pathToFileURL(join(FIX, "clean-settings.html")).href, { waitUntil: "load" });
  const clean = await page.evaluate(evaluateCompositionSlop);
  assert.equal(formatCompositionSlopFailures(clean, { gate: true }).length, 0, JSON.stringify(clean));
} finally {
  await browser.close();
}

function run(file, cite) {
  return spawnSync(process.execPath, [measure, file, "--cite", cite, "--lane", "saas"], {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
    timeout: 120_000,
  });
}

const soupRun = run(join(FIX, "card-soup.html"), "shadcn-catalog");
assert.notEqual(soupRun.status, 0);
assert.match(`${soupRun.stderr}\n${soupRun.stdout}`, /composition-slop:.*Card roots|equal-weight Card/);

const dnaRun = run(join(FIX, "marketing-dna.html"), "shadcn-settings");
assert.notEqual(dnaRun.status, 0);
assert.match(`${dnaRun.stderr}\n${dnaRun.stdout}`, /marketing-dna:.*marketing DNA/);

const fillerRun = run(join(FIX, "filler-empty.html"), "shadcn-dashboard-01");
assert.notEqual(fillerRun.status, 0);
assert.match(`${fillerRun.stderr}\n${fillerRun.stdout}`, /composition-slop:.*filler empty/);

console.log("composition-slop PASS: card soup · marketing DNA · filler empty · clean passes");
