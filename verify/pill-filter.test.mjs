#!/usr/bin/env node
/**
 * Pill-filter-stack measure + DOM apply: before fails, after clears.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  PILL_FILTER_ANTI_PATTERN_ID,
  formatPillFilterFailures,
  pillFilterGateApplies,
} from "./pill-filter.mjs";
import { applyPillCollapse } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(PILL_FILTER_ANTI_PATTERN_ID, "pill-filter-stack");
assert.equal(
  pillFilterGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);
assert.equal(pillFilterGateApplies({ lane: "saas", citeId: "magicui-hero", isWireframe: false }), false);

const fails = formatPillFilterFailures({ pillCount: 7, labels: ["Status"] }, { gate: true });
assert.ok(fails.some((f) => /pill-filter:/.test(f) && /anti-pattern:pill-filter-stack/.test(f)), fails.join("\n"));
assert.deepEqual(formatPillFilterFailures({ pillCount: 2 }, { gate: true }), []);

const before = readFileSync(join(FIX, "queue-pill-before.html"), "utf8");
const afterDom = applyPillCollapse(before, { maxVisible: 3 });
assert.match(afterDom, /data-shine-pill-rest/);
const visible = afterDom.replace(/<details[\s\S]*?<\/details>/gi, "");
assert.ok((visible.match(/data-shine-filter-pill/g) || []).length <= 3);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  const text = `${run.stderr || ""}\n${run.stdout || ""}`;
  return { status: run.status, text };
}

const beforeRun = measure(join(FIX, "queue-pill-before.html"));
assert.ok(/pill-filter:/.test(beforeRun.text), `before should fail pill-filter:\n${beforeRun.text.slice(-800)}`);
assert.ok(/anti-pattern:pill-filter-stack/.test(beforeRun.text), beforeRun.text.slice(-400));

const afterRun = measure(join(FIX, "queue-pill-after.html"));
assert.doesNotMatch(afterRun.text, /pill-filter:/, `after should clear pill-filter:\n${afterRun.text.slice(-800)}`);

console.log("pill-filter.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
