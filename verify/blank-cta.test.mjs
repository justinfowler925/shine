#!/usr/bin/env node
/** Copy blank-cta deepen: name-controls DOM apply + measure FAIL→PASS. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyNameControls } from "./restructure/apply-dom.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

const before = readFileSync(join(FIX, "queue-blank-cta-before.html"), "utf8");
const afterDom = applyNameControls(before);
assert.match(afterDom, /data-shine-blank-cta/);
assert.match(afterDom, /aria-label=["']Pursue["']/);
assert.match(afterDom, /aria-label=["']Submit["']/);
assert.match(afterDom, /aria-label=["']Next["']/);
assert.ok((afterDom.match(/data-shine-blank-cta/g) || []).length >= 3);

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "queue-blank-cta-before.html"));
assert.ok(
  /copy: blank-cta/.test(beforeText),
  `before should fail blank-cta:\n${beforeText.slice(-800)}`,
);

const afterText = measure(join(FIX, "queue-blank-cta-after.html"));
assert.doesNotMatch(
  afterText,
  /copy: blank-cta/,
  `after should clear blank-cta:\n${afterText.slice(-800)}`,
);

console.log("blank-cta.test.mjs: ok (DOM apply · measure FAIL→PASS)");
