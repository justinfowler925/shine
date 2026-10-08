#!/usr/bin/env node
/** Chrome-pressure measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  CHROME_PRESSURE_ANTI_PATTERN_ID,
  formatChromePressureFailures,
  chromePressureGateApplies,
} from "./chrome-pressure.mjs";
import { applyChromeBudget } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(CHROME_PRESSURE_ANTI_PATTERN_ID, "dual-chrome-actions");
assert.equal(
  chromePressureGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);

const fails = formatChromePressureFailures(
  { chromeFilledCount: 2, chromeFilledSamples: ["Export", "New"] },
  { gate: true },
);
assert.ok(
  fails.some((f) => /chrome-pressure:/.test(f) && /anti-pattern:dual-chrome-actions/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(formatChromePressureFailures({ chromeFilledCount: 0 }, { gate: true }), []);

const before = readFileSync(join(FIX, "queue-chrome-before.html"), "utf8");
const afterDom = applyChromeBudget(before, { demotePolicy: "ghost" });
assert.match(afterDom, /class="btn ghost"/);
assert.doesNotMatch(afterDom, /data-shine-chrome-filled/);
assert.match(afterDom, /class="btn filled">Pursue/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-chrome-before.html"));
assert.ok(/chrome-pressure:/.test(beforeText), `before should fail chrome-pressure:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:dual-chrome-actions/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "queue-chrome-after.html"));
assert.doesNotMatch(afterText, /chrome-pressure:/, `after should clear chrome-pressure:\n${afterText.slice(-800)}`);

console.log("chrome-pressure.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
