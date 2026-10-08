#!/usr/bin/env node
/** Form-heuristic deepen: link-field-errors DOM apply + measure FAIL→PASS. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyLinkFieldErrors } from "./restructure/apply-dom.mjs";
import { sortRestructureOps, DENOISE_OP_ORDER } from "./restructure/schema.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");

const before = readFileSync(join(FIX, "form-link-field-errors-before.html"), "utf8");
const afterDom = applyLinkFieldErrors(before);
assert.match(afterDom, /aria-describedby=["']email-error["']/);
assert.match(afterDom, /aria-describedby=["']name-error["']/);
assert.match(afterDom, /role=["']alert["']/);
assert.match(afterDom, /data-shine-field-error-linked/);
assert.match(afterDom, /data-shine-field-error/);

// Canonical op order: name-controls before link-field-errors; set-focal after both.
const shuffled = [
  { op: "set-focal" },
  { op: "link-field-errors" },
  { op: "name-controls" },
  { op: "cta-budget" },
];
const ordered = sortRestructureOps(shuffled).map((o) => o.op);
assert.deepEqual(ordered, ["cta-budget", "name-controls", "link-field-errors", "set-focal"]);
assert.ok(DENOISE_OP_ORDER.indexOf("name-controls") < DENOISE_OP_ORDER.indexOf("link-field-errors"));
assert.ok(DENOISE_OP_ORDER.indexOf("link-field-errors") < DENOISE_OP_ORDER.indexOf("set-focal"));

function measure(file) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", "shadcn-form-invite", "--lane", "saas"],
    { encoding: "utf8", cwd: ROOT, env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") }, timeout: 120_000 },
  );
  return `${run.stderr || ""}\n${run.stdout || ""}`;
}

const beforeText = measure(join(FIX, "form-link-field-errors-before.html"));
assert.ok(
  /form-heuristic:/.test(beforeText),
  `before should fail form-heuristic:\n${beforeText.slice(-800)}`,
);

const afterText = measure(join(FIX, "form-link-field-errors-after.html"));
assert.doesNotMatch(
  afterText,
  /form-heuristic:/,
  `after should clear form-heuristic:\n${afterText.slice(-800)}`,
);

console.log("link-field-errors.test.mjs: ok (DOM apply · op-order · measure FAIL→PASS)");
