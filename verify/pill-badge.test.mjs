#!/usr/bin/env node
/** Pill-filter badge/chip deepen: pill-collapse DOM + measure FAIL→PASS. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyPillCollapse } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

const before = readFileSync(join(FIX, "queue-pill-badge-before.html"), "utf8");
const afterDom = applyPillCollapse(before, { maxVisible: 3 });
assert.match(afterDom, /data-shine-pill-rest/);
const visible = afterDom.replace(/<details[\s\S]*?<\/details>/gi, "");
assert.ok((visible.match(/data-slot=["']badge["']/g) || []).length <= 3);
assert.ok((before.match(/data-slot=["']badge["']/g) || []).length >= 5);

// Classic .pill fixture still collapses (regression).
const classic = readFileSync(join(FIX, "queue-pill-before.html"), "utf8");
assert.match(applyPillCollapse(classic, { maxVisible: 3 }), /data-shine-pill-rest/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-pill-badge-before.html"));
assert.ok(
  /pill-filter:/.test(beforeText),
  `before should fail pill-filter:\n${beforeText.slice(-800)}`,
);

const afterText = measure(join(FIX, "queue-pill-badge-after.html"));
assert.doesNotMatch(
  afterText,
  /pill-filter:/,
  `after should clear pill-filter:\n${afterText.slice(-800)}`,
);

console.log("pill-badge.test.mjs: ok (DOM badge/chip · measure FAIL→PASS)");
