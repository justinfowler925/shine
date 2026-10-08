#!/usr/bin/env node
/**
 * Residual hardening from denoise gap analysis:
 * diagnosis → shine-restructure.json, preflight-in-measure, refuse-paint, kits table.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  assertDenoisePaintAllowed,
  deriveRestructureOps,
  emitRestructureFromDiagnosis,
  seedDiagnosis,
  saasRestructureCheckKeys,
} from "../core/diagnosis.mjs";
import { validateRestructurePlan } from "./restructure/schema.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");

const seed = seedDiagnosis({
  job: "Decide Pursue/Review/Dismiss on the next notice",
  category: "datagrid",
  lane: "saas",
});
for (const key of saasRestructureCheckKeys) {
  assert.deepEqual(seed[key], { ok: false, note: "" }, key);
}
assert.equal(seed.restructureRequired, false);
assert.ok(Array.isArray(seed.restructureOps));

const diagnosis = {
  ...seed,
  primaryTask: "Decide Pursue on the next notice",
  primaryTaskCheck: { ok: false, note: "Primary job buried under KPI soup and dual grids" },
  emptyErrorTriadCheck: { ok: true, note: "Triad covered on queue fixture" },
  competingCtaCheck: { ok: false, note: "Pursue and Assign lead both filled in main" },
  dualFocalCheck: { ok: false, note: "David's 10 and Queue are peer worklists" },
  kpiSoupCheck: { ok: false, note: "Ten equal metric tiles compete with the work object" },
  emptyInsightShellCheck: { ok: false, note: "Active in Usul / Missed awards blank insight shells" },
  citeHonestyCheck: { ok: true, note: "Cite is shadcn-queue for triage" },
  copyHeadlineCheck: { ok: true, note: "Title names Capture queue" },
  copyBeliefCheck: { ok: true, note: "Beliefs mapped or N/A for Operate" },
  copyInstructionalCheck: { ok: true, note: "Row actions are verb + outcome" },
  adoptionRitualCheck: { ok: true, note: "Monday triage ritual named" },
  adoptionPrivateWinCheck: { ok: true, note: "Private win is deciding one notice" },
  adoptionAbsenceCheck: { ok: true, note: "Absence leaves notices undecided" },
  restructureRequired: true,
};

const ops = deriveRestructureOps(diagnosis);
assert.ok(ops.some((o) => o.op === "cta-budget"));
assert.ok(ops.some((o) => o.op === "collapse-peer-grids"));
assert.ok(ops.some((o) => o.op === "kpi-collapse"));
assert.ok(ops.some((o) => o.op === "collapse-empty-shells"));
assert.ok(ops.some((o) => o.op === "set-focal"));

const plan = emitRestructureFromDiagnosis(diagnosis, { citePrimary: "shadcn-queue" });
assert.equal(validateRestructurePlan(plan).ok, true);
assert.equal(plan.restructureRequired, true);

assert.throws(() => assertDenoisePaintAllowed(diagnosis), /refuse paint/);
assertDenoisePaintAllowed({
  ...diagnosis,
  primaryTaskCheck: { ok: true, note: "Primary job reachable in 3s after restructure" },
  restructureRequired: false,
  competingCtaCheck: { ok: true, note: "One filled Pursue" },
  dualFocalCheck: { ok: true, note: "One focal grid" },
  kpiSoupCheck: { ok: true, note: "KPI collapsed" },
  emptyInsightShellCheck: { ok: true, note: "Empty insight shells removed" },
  restructureOps: [],
});

const dir = mkdtempSync(join(tmpdir(), "shine-emit-restructure-"));
try {
  const diagPath = join(dir, "shine-diagnosis.json");
  const outPath = join(dir, "shine-restructure.json");
  writeFileSync(diagPath, JSON.stringify(diagnosis, null, 2));
  const run = spawnSync(
    process.execPath,
    [join(SHINE, "core/diagnosis.mjs"), "emit-restructure", "--file", diagPath, "--out", outPath, "--write-diagnosis"],
    { encoding: "utf8" },
  );
  assert.equal(run.status, 0, run.stderr);
  const emitted = JSON.parse(readFileSync(outPath, "utf8"));
  assert.equal(emitted.$schema, "shine-restructure/v1");
  assert.ok(emitted.ops.length >= 2);
  const rewritten = JSON.parse(readFileSync(diagPath, "utf8"));
  assert.equal(rewritten.restructureRequired, true);
  assert.ok(Array.isArray(rewritten.restructureOps) && rewritten.restructureOps.length >= 1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// Preflight wired into measure for local HTML
const measure = spawnSync(
  process.execPath,
  [
    join(SHINE, "verify/measure.mjs"),
    join(SHINE, "verify/fixtures/denoise/queue-cta-before.html"),
    "--cite",
    "shadcn-queue",
    "--lane",
    "saas",
  ],
  {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
    timeout: 120_000,
  },
);
assert.notEqual(measure.status, 0);
assert.match(`${measure.stderr}\n${measure.stdout}`, /preflight-slop:.*ai-slop-cta-mania|preflight-slop:.*cta-mania/);

const kits = readFileSync(join(SHINE, "skill/references/kits.md"), "utf8");
assert.match(kits, /Queue \/ insight stream \|\s*`shadcn-queue`/);

console.log(
  "denoise-residuals PASS: diagnosis emit-restructure · refuse-paint · preflight-in-measure · kits queue→shadcn-queue",
);
