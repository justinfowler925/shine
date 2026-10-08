#!/usr/bin/env node
/**
 * Empty peer/insight shells — gate, formatter cite, DOM collapse, fixture FAIL→PASS.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  EMPTY_INSIGHT_SHELLS_ANTI_PATTERN_ID,
  emptyInsightShellsGateApplies,
  formatEmptyInsightShellFailures,
} from "./empty-insight-shells.mjs";
import { applyCollapseEmptyShells, applyDomRestructure } from "./restructure/apply-dom.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";
import { getAntiPattern } from "../knowledge/retrieve.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(SHINE, "verify/fixtures/denoise");

assert.equal(EMPTY_INSIGHT_SHELLS_ANTI_PATTERN_ID, "empty-insight-shells");
const row = getAntiPattern("empty-insight-shells");
assert.ok(row, "library row");
assert.equal(row.detector, "empty-insight-shells");
assert.deepEqual(row.restructureOps, ["collapse-empty-shells"]);
assert.ok(existsSync(join(SHINE, row.fixtures.before)));
assert.ok(existsSync(join(SHINE, row.fixtures.after)));

assert.equal(
  emptyInsightShellsGateApplies({ citeScreen: "queue", lane: "saas" }),
  true,
);
assert.equal(
  emptyInsightShellsGateApplies({ citeId: "magicui-hero", isWireframe: false }),
  false,
);

const fails = formatEmptyInsightShellFailures(
  {
    hasFocal: true,
    emptyShellCount: 2,
    titles: ["Active in Usul", "Missed awards"],
  },
  { gate: true },
);
assert.ok(
  fails.some((f) => /empty-insight-shells:/.test(f) && /anti-pattern:empty-insight-shells/.test(f)),
  fails.join("\n"),
);
assert.deepEqual(
  formatEmptyInsightShellFailures({ hasFocal: false, emptyShellCount: 2, titles: ["x"] }, { gate: true }),
  [],
  "no fail without focal",
);

const before = readFileSync(join(FIX, "queue-empty-shells-before.html"), "utf8");
assert.match(before, /Active in Usul/);
assert.match(before, /Missed awards/);
assert.match(before, /Needs attention/);
const collapsed = applyCollapseEmptyShells(before, { mode: "remove" });
assert.doesNotMatch(collapsed, /aria-label=["']Active in Usul["']/);
assert.doesNotMatch(collapsed, /aria-label=["']Missed awards["']/);
assert.doesNotMatch(collapsed, /data-shine-insight[\s=]/);
assert.match(collapsed, /Needs attention/);
assert.match(collapsed, /Open card/);
assert.match(collapsed, /data-region="focal"/);
// KPI tile label may still say "Active in Usul" inside details — that is not a shell.
assert.match(collapsed, /data-shine-kpi-rest/);

const plan = buildRestructurePlan({
  job: "Collapse empty insight shells",
  category: "queue",
  ops: [{ op: "collapse-empty-shells", mode: "remove" }],
});
const applied = applyDomRestructure(before, plan);
assert.ok(applied.applied.includes("collapse-empty-shells"));
assert.doesNotMatch(applied.html, /data-shine-insight[\s=]/);

// Browser measure FAIL→PASS on dedicated fixtures
const measure = (html) =>
  spawnSync(
    process.execPath,
    [join(SHINE, "verify/measure.mjs"), html, "--cite", "shadcn-queue", "--lane", "saas"],
    { encoding: "utf8", cwd: SHINE },
  );

const beforeRun = measure(join(FIX, "queue-empty-shells-before.html"));
assert.notEqual(beforeRun.status, 0, "before must fail measure");
assert.match(
  `${beforeRun.stdout}\n${beforeRun.stderr}`,
  /empty-insight-shells:/,
  "before must name empty-insight-shells",
);

const afterRun = measure(join(FIX, "queue-empty-shells-after.html"));
const afterLog = `${afterRun.stdout}\n${afterRun.stderr}`;
assert.ok(
  !/empty-insight-shells:/.test(afterLog),
  `after must clear empty-insight-shells: ${afterLog.slice(0, 800)}`,
);

console.log(
  "empty-insight-shells.test.mjs: ok (library · gate · DOM collapse · measure FAIL→PASS)",
);
