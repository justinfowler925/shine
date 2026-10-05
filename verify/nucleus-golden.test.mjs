#!/usr/bin/env node
// P4a — Nucleus golden fixture: seeded bloat fails CTA/measure gates; after passes CTA.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/nucleus-golden");
const measure = join(SHINE, "verify/measure.mjs");

assert.ok(existsSync(join(FIX, "before.html")), "before.html required");
assert.ok(existsSync(join(FIX, "after.html")), "after.html required");
assert.ok(existsSync(join(FIX, "README.md")), "README.md required");
assert.ok(
  existsSync(join(SHINE, "skill/references/clearspeed/profile-instructions.md")),
  "Clearspeed profile-instructions.md required",
);

function runMeasure(file, extraArgs = []) {
  return spawnSync(process.execPath, [measure, file, ...extraArgs], {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
    timeout: 120_000,
  });
}

const before = runMeasure(join(FIX, "before.html"), ["--cite", "shadcn-catalog", "--lane", "saas"]);
const beforeErr = `${before.stderr || ""}\n${before.stdout || ""}`;
assert.notEqual(before.status, 0, "seeded Nucleus bloat must fail measure");
// Prefer CTA pressure when P1 is on main; fall back to hierarchy / KPI / copy heuristics.
assert.ok(
  /cta-pressure:.*competing filled/.test(beforeErr),
  `before must fail CTA pressure after P1:\n${beforeErr.slice(-1200)}`,
);

const after = runMeasure(join(FIX, "after.html"), ["--cite", "shadcn-catalog", "--lane", "saas"]);
const afterErr = `${after.stderr || ""}\n${after.stdout || ""}`;
assert.doesNotMatch(
  afterErr,
  /cta-pressure:.*competing filled/,
  `after must not have competing CTA pressure:\n${afterErr.slice(-800)}`,
);

console.log("nucleus-golden PASS: before fails known gate · after clears CTA pressure · profile present");
