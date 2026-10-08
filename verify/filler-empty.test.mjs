#!/usr/bin/env node
/** Filler-empty measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  FILLER_EMPTY_ANTI_PATTERN_ID,
  formatFillerEmptyFailures,
  fillerEmptyGateApplies,
} from "./filler-empty.mjs";
import { applyRewriteFillerEmpty } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(FILLER_EMPTY_ANTI_PATTERN_ID, "filler-empty-copy");
assert.equal(
  fillerEmptyGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);

const fails = formatFillerEmptyFailures(
  { fillerHits: [{ text: "Welcome to your dashboard" }] },
  { gate: true },
);
assert.ok(
  fails.some((f) => /filler-empty:/.test(f) && /anti-pattern:filler-empty-copy/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(formatFillerEmptyFailures({ fillerHits: [] }, { gate: true }), []);

const before = readFileSync(join(FIX, "queue-filler-empty-before.html"), "utf8");
const afterDom = applyRewriteFillerEmpty(before);
assert.doesNotMatch(afterDom, /Welcome to your dashboard|Nothing here yet/);
assert.match(afterDom, /data-shine-empty-rewritten/);
assert.match(afterDom, /No notices match this view/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-filler-empty-before.html"));
assert.ok(/filler-empty:/.test(beforeText), `before should fail filler-empty:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:filler-empty-copy/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "queue-filler-empty-after.html"));
assert.doesNotMatch(afterText, /filler-empty:/, `after should clear filler-empty:\n${afterText.slice(-800)}`);

console.log("filler-empty.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
