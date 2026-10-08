#!/usr/bin/env node
/** Marketing-DNA measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  MARKETING_DNA_ANTI_PATTERN_ID,
  formatMarketingDnaFailures,
  marketingDnaGateApplies,
} from "./marketing-dna.mjs";
import { applyStripMarketingDna } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(MARKETING_DNA_ANTI_PATTERN_ID, "marketing-dna-operate");
assert.equal(
  marketingDnaGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);
assert.equal(
  marketingDnaGateApplies({ lane: "saas", citeId: "shadcn-marketing" }),
  false,
);

const fails = formatMarketingDnaFailures(
  { marketingHits: ["glow utility", "marketing gradient cluster"] },
  { gate: true },
);
assert.ok(
  fails.some((f) => /marketing-dna:/.test(f) && /anti-pattern:marketing-dna-operate/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(formatMarketingDnaFailures({ marketingHits: [] }, { gate: true }), []);

const before = readFileSync(join(FIX, "queue-marketing-dna-before.html"), "utf8");
const afterDom = applyStripMarketingDna(before);
assert.doesNotMatch(afterDom, /from-violet|bg-gradient-to|font-serif|drop-shadow-glow/);
assert.match(afterDom, /data-shine-marketing-stripped/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-marketing-dna-before.html"));
assert.ok(/marketing-dna:/.test(beforeText), `before should fail marketing-dna:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:marketing-dna-operate/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "queue-marketing-dna-after.html"));
assert.doesNotMatch(afterText, /marketing-dna:/, `after should clear marketing-dna:\n${afterText.slice(-800)}`);

console.log("marketing-dna.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
