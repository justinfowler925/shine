#!/usr/bin/env node
/** Decorative-chart measure + DOM apply: before fails, after clears. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  DECORATIVE_CHART_ANTI_PATTERN_ID,
  formatDecorativeChartFailures,
  decorativeChartGateApplies,
} from "./decorative-chart.mjs";
import { applyStampChartUnits } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(DECORATIVE_CHART_ANTI_PATTERN_ID, "decorative-chart-no-units");
assert.equal(
  decorativeChartGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);

const fails = formatDecorativeChartFailures(
  { unmarkedCount: 1, unmarkedSamples: ["svg[Activity chart]"] },
  { gate: true },
);
assert.ok(
  fails.some((f) => /decorative-chart:/.test(f) && /anti-pattern:decorative-chart-no-units/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(formatDecorativeChartFailures({ unmarkedCount: 0 }, { gate: true }), []);

const before = readFileSync(join(FIX, "queue-decorative-chart-before.html"), "utf8");
const afterDom = applyStampChartUnits(before);
assert.match(afterDom, /data-unit=["']count["']/);
assert.match(afterDom, /data-shine-chart-stamped/);
assert.match(afterDom, /data-shine-chart-legend/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-decorative-chart-before.html"));
assert.ok(/decorative-chart:/.test(beforeText), `before should fail decorative-chart:\n${beforeText.slice(-800)}`);
assert.ok(/anti-pattern:decorative-chart-no-units/.test(beforeText), beforeText.slice(-400));

const afterText = measure(join(FIX, "queue-decorative-chart-after.html"));
assert.doesNotMatch(afterText, /decorative-chart:/, `after should clear decorative-chart:\n${afterText.slice(-800)}`);

console.log("decorative-chart.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
