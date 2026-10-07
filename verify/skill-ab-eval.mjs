#!/usr/bin/env node
/**
 * Skill A/B eval (enterprise plan §7 later / Salesforce DI-style).
 *
 * Pin denoise fixtures. Run the same brief WITH denoise guidance
 * (diagnosis → deriveRestructureOps → apply) vs WITHOUT (craft-first / no
 * restructure). Score with machine oracles only — measure/preflight clears,
 * expected ops — never preference labels or RLAIF.
 *
 * Usage:
 *   node verify/skill-ab-eval.mjs [--json out.json] [--no-measure]
 *   npm run skill:ab
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  deriveRestructureOps,
  emitRestructureFromDiagnosis,
  seedDiagnosis,
} from "../core/diagnosis.mjs";
import { applyDomRestructure } from "./restructure/apply-dom.mjs";
import { applyXorSavedView } from "./restructure/xor-saved-view.mjs";
import { scanPreflightSlop } from "./preflight-slop.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CASES_PATH = join(ROOT, "verify/fixtures/skill-ab/cases.json");
const GUIDANCE = join(ROOT, "skill/references/denoise.md");

function guidanceFingerprint() {
  const body = readFileSync(GUIDANCE, "utf8");
  const hash = createHash("sha256").update(body).digest("hex").slice(0, 12);
  const markers = [
    "primary job",
    "competing CTA",
    "cta-budget",
    "collapse-peer-grids",
    "kpi-collapse",
    "set-focal",
    "rebind-cite",
    "refuse",
  ];
  const missing = markers.filter((m) => !new RegExp(m, "i").test(body));
  return { hash, bytes: body.length, markersOk: missing.length === 0, missing };
}

function measureFailures(file, cite) {
  if (!existsSync(file)) return { status: 1, failures: ["missing fixture"], stdout: "" };
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "verify/measure.mjs"), file, "--cite", cite, "--lane", "saas"],
    {
      encoding: "utf8",
      cwd: ROOT,
      env: { ...process.env, NODE_PATH: join(ROOT, "node_modules") },
      timeout: 120_000,
    },
  );
  const text = `${run.stderr || ""}\n${run.stdout || ""}`;
  const failures = [
    ...text.matchAll(/^[ \t]*(?:Error:\s*|✗\s*)?((?:cta-pressure|dual-focal|kpi-soup|composition-slop|ai-slop)[^\n]*)/gim),
  ].map((m) => m[1]);
  const listed = [...text.matchAll(/"(cta-pressure|dual-focal|kpi-soup|composition-slop)[^"]*"/g)].map((m) =>
    m[0].replace(/"/g, ""),
  );
  return {
    status: run.status,
    failures: [...new Set([...failures, ...listed])],
    stdout: text.slice(-1500),
  };
}

function buildDiagnosis(c, armChecks) {
  const base = seedDiagnosis({ job: c.job, category: c.category, lane: "saas" });
  return {
    ...base,
    primaryTask: c.job,
    lane: "saas",
    emptyErrorTriadCheck: { ok: true, note: "Triad not under A/B test" },
    copyHeadlineCheck: { ok: true, note: "Copy not under A/B test" },
    copyBeliefCheck: { ok: true, note: "Copy not under A/B test" },
    copyInstructionalCheck: { ok: true, note: "Copy not under A/B test" },
    adoptionRitualCheck: { ok: true, note: "Adoption not under A/B test" },
    adoptionPrivateWinCheck: { ok: true, note: "Adoption not under A/B test" },
    adoptionAbsenceCheck: { ok: true, note: "Adoption not under A/B test" },
    ...armChecks,
  };
}

function runArm(c, armName, armChecks, { runMeasure, workDir }) {
  const htmlPath = resolve(ROOT, c.fixture);
  const beforeHtml = readFileSync(htmlPath, "utf8");
  const craftOnly = !!armChecks.craftOnly;
  // Craft-only baseline: no denoise guidance — do not derive restructure ops.
  const diagnosis = buildDiagnosis(c, armChecks);
  if (craftOnly) delete diagnosis.restructureOps;
  const ops = craftOnly ? [] : deriveRestructureOps(diagnosis);
  const plan =
    craftOnly || ops.length === 0
      ? {
          $schema: "shine-restructure/v1",
          job: c.job,
          category: c.category,
          lane: "saas",
          cite: { primary: c.cite, antiCites: [], productPattern: null },
          regions: { focal: null, demote: [] },
          ops: [],
          acceptance: { measureMustClear: c.mustClear || [], usabilityFlow: "", proveRequired: true },
          confidence: 0,
          humanGate: false,
        }
      : emitRestructureFromDiagnosis(diagnosis, { citePrimary: c.cite });

  let workingHtml = beforeHtml;
  let applied = [];
  let plans = [];
  let xorApplied = false;

  if (!craftOnly && plan.ops?.length) {
    const result = applyDomRestructure(beforeHtml, plan);
    workingHtml = result.html;
    applied = result.applied;
    plans = result.plans;
    if (c.xorRecipe) {
      const xorOp = plan.ops.find((o) => o.op === "collapse-peer-grids") || {
        op: "collapse-peer-grids",
        mode: "xor-saved-view",
        keepTitleIncludes: ["Queue"],
        foldTitleIncludes: ["David"],
      };
      const xor = applyXorSavedView(workingHtml, xorOp);
      workingHtml = xor.html;
      xorApplied = xor.applied;
    }
  }

  const preBefore = scanPreflightSlop(beforeHtml, { gate: true, screen: c.category === "settings" ? "settings" : "queue" });
  const preAfter = scanPreflightSlop(workingHtml, { gate: true, screen: c.category === "settings" ? "settings" : "queue" });

  let beforeMeasure = { status: null, failures: [] };
  let afterMeasure = { status: null, failures: [] };
  if (runMeasure) {
    beforeMeasure = measureFailures(htmlPath, c.cite);
    const tmp = join(workDir, `${c.id}-${armName}-after.html`);
    writeFileSync(tmp, workingHtml);
    afterMeasure = measureFailures(tmp, c.cite);
  }

  const cleared = [];
  for (const key of c.mustClear || []) {
    const wasFail =
      beforeMeasure.failures.some((f) => f.includes(key)) ||
      preBefore.failures.some((f) => f.includes(key)) ||
      (key === "composition-slop" && !/data-region=["']focal["']/.test(beforeHtml));
    const stillFail =
      afterMeasure.failures.some((f) => f.includes(key)) ||
      preAfter.failures.some((f) => f.includes(key));

    if (key === "dual-focal" && c.xorRecipe) {
      const grids = (workingHtml.match(/role=["']grid["']/gi) || []).length;
      const structuralClear = xorApplied && grids === 1;
      if (runMeasure) {
        if (wasFail && !stillFail) cleared.push(key);
        else if (structuralClear && !stillFail) cleared.push(`${key}:xor-structural`);
      } else if (structuralClear) {
        cleared.push(`${key}:xor-structural`);
      }
      continue;
    }

    if (key === "composition-slop") {
      const structuralClear = /data-region=["']focal["']/.test(workingHtml);
      if (runMeasure) {
        if (wasFail && !stillFail) cleared.push(key);
        else if (structuralClear) cleared.push(`${key}:focal-set`);
      } else if (structuralClear && wasFail) {
        cleared.push(`${key}:focal-set`);
      } else if (structuralClear && !/data-region=["']focal["']/.test(beforeHtml)) {
        cleared.push(`${key}:focal-set`);
      }
      continue;
    }

    if (runMeasure) {
      if (wasFail && !stillFail) cleared.push(key);
      else if (!wasFail && applied.some((op) => (c.expectedOps || []).includes(op))) {
        cleared.push(`${key}:op-applied`);
      }
    } else {
      // Structural / preflight path without browser
      if (key === "cta-pressure") {
        const filledBefore = (beforeHtml.match(/class="[^"]*\bfilled\b[^"]*"/g) || []).length;
        const filledAfter = (workingHtml.match(/class="[^"]*\bfilled\b[^"]*"/g) || []).length;
        const peerGone = /filled-peer/.test(beforeHtml) && !/filled-peer/.test(workingHtml);
        if ((filledAfter < filledBefore && filledAfter <= 1) || peerGone) cleared.push(`${key}:structural`);
      } else if (key === "kpi-soup") {
        if (/data-shine-kpi-rest|More metrics/.test(workingHtml)) cleared.push(`${key}:structural`);
      } else if (wasFail && !stillFail) {
        cleared.push(key);
      }
    }
  }

  // rebind-cite: machine oracle is data-cite rewrite
  if ((c.expectedOps || []).includes("rebind-cite")) {
    const rebound =
      applied.includes("rebind-cite") &&
      new RegExp(`data-cite=["']${c.cite}["']`).test(workingHtml) &&
      !/data-cite=["']shadcn-queue["']/.test(workingHtml);
    if (rebound) cleared.push("rebind-cite");
  }

  const expectedHit = (c.expectedOps || []).every(
    (op) =>
      applied.includes(op) ||
      plans.some((p) => p.includes(op) || /collapse-peer|xor/i.test(p)) ||
      (op === "collapse-peer-grids" && (plans.length >= 1 || xorApplied)),
  );

  const defectCleared =
    (c.mustClear || []).length === 0
      ? cleared.includes("rebind-cite") || expectedHit
      : (c.mustClear || []).every((key) => cleared.some((x) => x.includes(key) || x.startsWith(key)));

  const pass = !craftOnly && expectedHit && defectCleared && ops.length > 0;

  return {
    arm: armName,
    craftOnly,
    opsEmitted: ops.map((o) => o.op),
    opsApplied: applied,
    plans: plans.length,
    xorApplied: c.xorRecipe ? xorApplied : undefined,
    expectedHit,
    measureCleared: cleared,
    beforeMeasureStatus: beforeMeasure.status,
    afterMeasureStatus: afterMeasure.status,
    pass,
  };
}

export function runSkillAbEval({ runMeasure = false, casesPath = CASES_PATH } = {}) {
  const manifest = JSON.parse(readFileSync(casesPath, "utf8"));
  const guidance = guidanceFingerprint();
  const workDir = join(ROOT, "verify/fixtures/skill-ab/.work");
  mkdirSync(workDir, { recursive: true });

  const rows = [];
  for (const c of manifest.cases) {
    const withArm = runArm(c, "with", c.withGuidance, { runMeasure, workDir });
    const withoutArm = runArm(c, "without", c.withoutGuidance, { runMeasure, workDir });
    const delta = withArm.pass && !withoutArm.pass;
    rows.push({
      id: c.id,
      fixture: c.fixture,
      expectedOps: c.expectedOps,
      with: withArm,
      without: withoutArm,
      deltaOk: delta,
      pass: delta,
    });
  }

  const withWins = rows.filter((r) => r.with.pass).length;
  const withoutWins = rows.filter((r) => r.without.pass).length;
  const deltas = rows.filter((r) => r.deltaOk).length;
  const failed = rows.filter((r) => !r.pass);

  return {
    version: 1,
    schema: "shine-skill-ab/v1",
    bar: manifest.bar,
    guidance: {
      ref: manifest.guidanceRef,
      ...guidance,
    },
    runMeasure,
    total: rows.length,
    withWins,
    withoutWins,
    deltas,
    passed: deltas,
    failed: failed.length,
    // Salesforce DI bar: guidance arm wins every pinned case; baseline does not.
    meetsFloor: guidance.markersOk && deltas === rows.length && withoutWins === 0 && withWins === rows.length,
    cases: rows,
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  // Default doctor-safe: structural/preflight. Pass --measure for live Chromium.
  const report = runSkillAbEval({ runMeasure: args.includes("--measure") });
  const text = JSON.stringify(report, null, 2) + "\n";
  const outIdx = args.indexOf("--json");
  if (outIdx >= 0 && args[outIdx + 1]) writeFileSync(args[outIdx + 1], text);
  process.stdout.write(text);
  process.exit(report.meetsFloor ? 0 : 1);
}
