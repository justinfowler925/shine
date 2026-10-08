#!/usr/bin/env node
/** Empty-triad measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  EMPTY_TRIAD_ANTI_PATTERN_ID,
  formatEmptyTriadFailures,
  emptyTriadGateApplies,
} from "./empty-triad.mjs";
import { applySplitEmptyTriad } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(EMPTY_TRIAD_ANTI_PATTERN_ID, "empty-filtered-error-conflated");
assert.equal(
  emptyTriadGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);

const fails = formatEmptyTriadFailures(
  {
    sameNodeConflatedCount: 1,
    sharedCopyCount: 0,
    missingFilteredEmpty: true,
  },
  { gate: true },
);
assert.ok(
  fails.some((f) => /empty-triad:/.test(f) && /anti-pattern:empty-filtered-error-conflated/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(
  formatEmptyTriadFailures(
    {
      sameNodeConflatedCount: 0,
      sharedCopyCount: 0,
      missingFilteredEmpty: false,
    },
    { gate: true },
  ),
  [],
);

const before = readFileSync(join(FIX, "queue-empty-triad-before.html"), "utf8");
const afterDom = applySplitEmptyTriad(before);
assert.match(afterDom, /data-filtered-empty/);
assert.match(afterDom, /data-shine-triad-split/);
assert.doesNotMatch(afterDom, /data-empty[^>]*role=["']alert["']/);
assert.match(afterDom, /data-shine-filter-clear-all|Clear filters/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-empty-triad-before.html"));
assert.ok(/empty-triad:/.test(beforeText), `before should fail empty-triad:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:empty-filtered-error-conflated/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "queue-empty-triad-after.html"));
assert.doesNotMatch(afterText, /empty-triad:/, `after should clear empty-triad:\n${afterText.slice(-800)}`);

console.log("empty-triad.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
