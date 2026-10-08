#!/usr/bin/env node
/** Dual-focal deepen: collapse-peer-grids DOM XOR apply + measure FAIL→PASS. */
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyDomRestructure } from "./restructure/apply-dom.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

const before = readFileSync(join(FIX, "queue-dual-grid-before.html"), "utf8");
const plan = buildRestructurePlan({
  job: "Decide Pursue on the next notice",
  category: "queue",
  ops: [
    {
      op: "collapse-peer-grids",
      mode: "xor-saved-view",
      keepTitleIncludes: ["Queue"],
      foldTitleIncludes: ["David"],
    },
  ],
});
const applied = applyDomRestructure(before, plan);
assert.ok(applied.applied.includes("collapse-peer-grids"));
assert.match(applied.html, /data-shine-xor-views/);
assert.match(applied.html, /data-shine-shared-grid/);
assert.equal((applied.html.match(/role=["']grid["']/gi) || []).length, 1);
assert.doesNotMatch(applied.html, /data-grid-title>David/);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const afterPath = join(FIX, ".tmp-collapse-peer-grids-dom-after.html");
writeFileSync(afterPath, applied.html);

const beforeText = measure(join(FIX, "queue-dual-grid-before.html"));
assert.ok(
  /dual-focal/.test(beforeText),
  `before should fail dual-focal:\n${beforeText.slice(-800)}`,
);

const afterText = measure(afterPath);
assert.doesNotMatch(
  afterText,
  /dual-focal/,
  `after DOM XOR should clear dual-focal:\n${afterText.slice(-800)}`,
);

console.log("collapse-peer-grids-dom.test.mjs: ok (DOM XOR · measure FAIL→PASS)");
