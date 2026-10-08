#!/usr/bin/env node
/** Filter-reversible measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  FILTER_REVERSIBLE_ANTI_PATTERN_ID,
  formatFilterReversibleFailures,
  filterReversibleGateApplies,
} from "./filter-reversible.mjs";
import { applyFilterClearable } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(FILTER_REVERSIBLE_ANTI_PATTERN_ID, "irreversible-filters");
assert.equal(
  filterReversibleGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);

const fails = formatFilterReversibleFailures(
  { irreversibleCount: 2, irreversibleSamples: ["Status: Open", "Owner: Me"] },
  { gate: true },
);
assert.ok(
  fails.some((f) => /filter-reversible:/.test(f) && /anti-pattern:irreversible-filters/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(formatFilterReversibleFailures({ irreversibleCount: 0 }, { gate: true }), []);

const before = readFileSync(join(FIX, "queue-filters-before.html"), "utf8");
const afterDom = applyFilterClearable(before, { perChip: true, clearAll: true });
assert.match(afterDom, /data-shine-filter-dismiss/);
assert.match(afterDom, /data-shine-filter-clear-all/);
assert.match(afterDom, /Clear filters/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-filters-before.html"));
assert.ok(/filter-reversible:/.test(beforeText), `before should fail filter-reversible:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:irreversible-filters/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "queue-filters-after.html"));
assert.doesNotMatch(afterText, /filter-reversible:/, `after should clear filter-reversible:\n${afterText.slice(-800)}`);

console.log("filter-reversible.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
