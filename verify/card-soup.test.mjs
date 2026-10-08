#!/usr/bin/env node
/** Card-soup measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  CARD_SOUP_ANTI_PATTERN_ID,
  formatCardSoupFailures,
  cardSoupGateApplies,
} from "./card-soup.mjs";
import { applyCollapseCardSoup } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(CARD_SOUP_ANTI_PATTERN_ID, "card-soup");
assert.equal(
  cardSoupGateApplies({ lane: "saas", citeScreen: "catalog", citeId: "shadcn-catalog" }),
  true,
);

const fails = formatCardSoupFailures(
  { equalCardCount: 4, hasFocal: false },
  { gate: true },
);
assert.ok(
  fails.some((f) => /card-soup:/.test(f) && /anti-pattern:card-soup/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(
  formatCardSoupFailures({ equalCardCount: 4, hasFocal: true }, { gate: true }),
  [],
);

const before = readFileSync(join(FIX, "catalog-card-soup-before.html"), "utf8");
const afterDom = applyCollapseCardSoup(before, { maxVisible: 1 });
assert.match(afterDom, /data-region=["']focal["']/);
assert.match(afterDom, /data-shine-card-rest/);
assert.match(afterDom, /data-shine-card-demoted/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-catalog", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "catalog-card-soup-before.html"));
assert.ok(/card-soup:/.test(beforeText), `before should fail card-soup:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:card-soup/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "catalog-card-soup-after.html"));
assert.doesNotMatch(afterText, /card-soup:/, `after should clear card-soup:\n${afterText.slice(-800)}`);

console.log("card-soup.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
