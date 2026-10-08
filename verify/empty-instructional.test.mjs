#!/usr/bin/env node
/** Copy empty-instructional deepen: rewrite-filler-empty DOM + measure FAIL→PASS. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyRewriteFillerEmpty } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

const before = readFileSync(join(FIX, "queue-empty-instructional-before.html"), "utf8");
const afterDom = applyRewriteFillerEmpty(before);
assert.match(afterDom, /data-shine-empty-rewritten/);
assert.match(afterDom, /No notices match this view/);
assert.doesNotMatch(afterDom, />No data</);
assert.doesNotMatch(afterDom, />N\/A</);
assert.ok((afterDom.match(/data-shine-empty-rewritten/g) || []).length >= 3);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-empty-instructional-before.html"));
assert.ok(
  /copy: empty-instructional/.test(beforeText),
  `before should fail empty-instructional:\n${beforeText.slice(-800)}`,
);

const afterText = measure(join(FIX, "queue-empty-instructional-after.html"));
assert.doesNotMatch(
  afterText,
  /copy: empty-instructional/,
  `after should clear empty-instructional:\n${afterText.slice(-800)}`,
);

console.log("empty-instructional.test.mjs: ok (DOM apply · measure FAIL→PASS)");
