#!/usr/bin/env node
/** Parallel-owned measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  PARALLEL_OWNED_ANTI_PATTERN_ID,
  formatParallelOwnedFailures,
  parallelOwnedGateApplies,
} from "./parallel-owned.mjs";
import { applyBindProductOwner } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(PARALLEL_OWNED_ANTI_PATTERN_ID, "parallel-owned-component");
assert.equal(
  parallelOwnedGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);

const fails = formatParallelOwnedFailures(
  {
    parallelCount: 1,
    ownerCount: 1,
    ownerExpected: true,
    parallelSamples: ["table.homemade-grid"],
    ownerSamples: ["nucleus-datagrid"],
  },
  { gate: true },
);
assert.ok(
  fails.some((f) => /parallel-owned:/.test(f) && /anti-pattern:parallel-owned-component/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(
  formatParallelOwnedFailures({ parallelCount: 0, ownerCount: 1, ownerExpected: true }, { gate: true }),
  [],
);

const before = readFileSync(join(FIX, "queue-parallel-owned-before.html"), "utf8");
const afterDom = applyBindProductOwner(before);
assert.match(afterDom, /data-shine-reuse-bound/);
assert.match(afterDom, /data-shine-parallel-rest/);
assert.match(afterDom, /data-shine-parallel-demoted/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-parallel-owned-before.html"));
assert.ok(/parallel-owned:/.test(beforeText), `before should fail parallel-owned:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:parallel-owned-component/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "queue-parallel-owned-after.html"));
assert.doesNotMatch(afterText, /parallel-owned:/, `after should clear parallel-owned:\n${afterText.slice(-800)}`);

console.log("parallel-owned.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
