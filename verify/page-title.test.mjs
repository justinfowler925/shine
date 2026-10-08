#!/usr/bin/env node
/**
 * Competing page-titles measure + DOM apply: before fails, after clears.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  PAGE_TITLE_ANTI_PATTERN_ID,
  formatPageTitleFailures,
  pageTitleGateApplies,
} from "./page-title.mjs";
import { applyTitleSingular } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

assert.equal(PAGE_TITLE_ANTI_PATTERN_ID, "competing-page-titles");
assert.equal(
  pageTitleGateApplies({ lane: "saas", citeScreen: "queue", citeId: "shadcn-queue" }),
  true,
);

const fails = formatPageTitleFailures(
  { titleCount: 3, texts: ["Queue", "Triage inbox", "Notice worklist"] },
  { gate: true },
);
assert.ok(fails.some((f) => /page-title:/.test(f) && /anti-pattern:competing-page-titles/.test(f)), fails.join("\n"));
assert.deepEqual(formatPageTitleFailures({ titleCount: 1, texts: ["Queue"] }, { gate: true }), []);

const before = readFileSync(join(FIX, "queue-titles-before.html"), "utf8");
const afterDom = applyTitleSingular(before, {});
assert.match(afterDom, /data-shine-title-demoted/);
assert.equal((afterDom.match(/<h1\b/gi) || []).length, 1);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  const text = `${run.stderr || ""}\n${run.stdout || ""}`;
  return { status: run.status, text };
}

const beforeRun = measure(join(FIX, "queue-titles-before.html"));
assert.ok(/page-title:/.test(beforeRun.text), `before should fail page-title:\n${beforeRun.text.slice(-800)}`);
assert.ok(/anti-pattern:competing-page-titles/.test(beforeRun.text), beforeRun.text.slice(-400));

const afterRun = measure(join(FIX, "queue-titles-after.html"));
assert.doesNotMatch(afterRun.text, /page-title:/, `after should clear page-title:\n${afterRun.text.slice(-800)}`);

console.log("page-title.test.mjs: ok (gate · formatter · DOM apply · measure FAIL→PASS)");
