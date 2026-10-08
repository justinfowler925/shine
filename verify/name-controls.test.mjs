#!/usr/bin/env node
/** Incomplete-primitives deepen: name-controls DOM apply + measure FAIL→PASS. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyNameControls } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

const before = readFileSync(join(FIX, "queue-name-controls-before.html"), "utf8");
const afterDom = applyNameControls(before);
assert.match(afterDom, /aria-label=["']More actions["']/);
assert.match(afterDom, /aria-label=["']Filter by email["']/);
assert.match(afterDom, /data-confirm/);
assert.match(afterDom, /data-shine-named/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-name-controls-before.html"));
assert.ok(
  /incomplete-primitive:/.test(beforeText),
  `before should fail incomplete-primitive:\n${beforeText.slice(-800)}`,
);

const afterText = measure(join(FIX, "queue-name-controls-after.html"));
assert.doesNotMatch(
  afterText,
  /incomplete-primitive:/,
  `after should clear incomplete-primitive:\n${afterText.slice(-800)}`,
);

console.log("name-controls.test.mjs: ok (DOM apply · measure FAIL→PASS)");
