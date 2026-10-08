#!/usr/bin/env node
/** Copy-heuristic deepen: stamp-page-title DOM apply + measure FAIL→PASS. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyStampPageTitle } from "./restructure/apply-dom.mjs";
import { sortRestructureOps, DENOISE_OP_ORDER } from "./restructure/schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

const before = readFileSync(join(FIX, "queue-missing-page-title-before.html"), "utf8");
const afterDom = applyStampPageTitle(before, { title: "Queue" });
assert.match(afterDom, /<title>Queue<\/title>/i);
assert.match(afterDom, /<h1\b[^>]*data-shine-page-title-stamped[^>]*>Queue<\/h1>/i);
assert.match(afterDom, /data-page-title/);

const ordered = sortRestructureOps([
  { op: "title-singular" },
  { op: "stamp-page-title" },
  { op: "cta-budget" },
]).map((o) => o.op);
assert.deepEqual(ordered, ["cta-budget", "stamp-page-title", "title-singular"]);
assert.ok(DENOISE_OP_ORDER.indexOf("stamp-page-title") < DENOISE_OP_ORDER.indexOf("title-singular"));

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-missing-page-title-before.html"));
assert.ok(
  /copy: missing-page-title/.test(beforeText),
  `before should fail missing-page-title:\n${beforeText.slice(-800)}`,
);

const afterText = measure(join(FIX, "queue-missing-page-title-after.html"));
assert.doesNotMatch(
  afterText,
  /copy: missing-page-title|copy: empty-h1/,
  `after should clear missing-page-title:\n${afterText.slice(-800)}`,
);

console.log("stamp-page-title.test.mjs: ok (DOM apply · op-order · measure FAIL→PASS)");
