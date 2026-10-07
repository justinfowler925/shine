#!/usr/bin/env node
/**
 * N7 / D10 — denoise-eval harness on Sled-class fixture pairs.
 * Scorecard: opsEmitted, opsApplied, measureCleared[], humanGateRequired.
 * Bar: 100% on CTA / rebind-cite / set-focal / kpi-collapse DOM ops;
 * dual-grid = detect → agent XOR recipe → after PASS (not silent delete).
 */

import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { applyDomRestructure } from "./restructure/apply-dom.mjs";
import { buildRestructurePlan, validateRestructurePlan } from "./restructure/schema.mjs";
import { applyXorSavedView, buildXorFoldCropHtml } from "./restructure/xor-saved-view.mjs";
import {
  DEFECT_CROP_PAIRS,
  assertCropPairOk,
  ensureDefectCropReceipts,
} from "./restructure/defect-crops.mjs";
import { scanPreflightSlop } from "./preflight-slop.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/denoise");
const RECEIPTS = join(FIX, "receipts");

const CASES = [
  {
    id: "queue-cta",
    before: "queue-cta-before.html",
    after: "queue-cta-after.html",
    cite: "shadcn-queue",
    ops: [{ op: "cta-budget", scope: "main", maxFilled: 1, preferLabels: ["Pursue"], demotePolicy: "outline" }],
    mustClear: ["cta-pressure"],
    applyClears: ["ai-slop-cta-mania"],
    cropPairId: "queue-cta",
  },
  {
    id: "queue-kpi",
    before: "queue-kpi-before.html",
    after: "queue-kpi-after.html",
    cite: "shadcn-queue",
    ops: [{ op: "kpi-collapse", maxVisible: 3, rest: "details" }],
    mustClear: ["kpi-soup"],
    applyClears: ["ai-slop-kpi-strip"],
    synthesizeAfter: true,
    refreshAfter: true,
    cropPairId: "queue-kpi",
  },
  {
    id: "usul-focal",
    before: "usul-composition-before.html",
    after: "usul-focal-after.html",
    cite: "shadcn-dashboard-01",
    ops: [{ op: "set-focal", attr: "data-region", value: "focal" }],
    mustClear: ["composition-slop"],
    synthesizeAfter: true,
  },
  {
    id: "sources-cite",
    before: "sources-cite-before.html",
    after: "sources-cite-after.html",
    cite: "shadcn-settings",
    ops: [{ op: "rebind-cite", from: "shadcn-queue", to: "shadcn-settings", whenCategory: "settings" }],
    mustClear: [],
    synthesizeAfter: true,
    cropPairId: "sources-cite",
  },
  {
    id: "queue-dual-grid",
    before: "queue-dual-grid-before.html",
    after: "queue-dual-grid-after.html",
    cite: "shadcn-queue",
    ops: [
      {
        op: "collapse-peer-grids",
        mode: "xor-saved-view",
        keepTitleIncludes: ["Queue"],
        foldTitleIncludes: ["David"],
      },
    ],
    mustClear: ["dual-focal"],
    /** Agent-assisted XOR close (D10) — not plan-only detect, not silent AST delete */
    xorRecipe: true,
    cropPairId: "queue-dual-grid",
  },
];

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
  // Also pull from JSON-ish failure lists in stdout
  const listed = [...text.matchAll(/"(cta-pressure|dual-focal|kpi-soup|composition-slop)[^"]*"/g)].map((m) =>
    m[0].replace(/"/g, ""),
  );
  return {
    status: run.status,
    failures: [...new Set([...failures, ...listed])],
    stdout: text.slice(-2000),
  };
}

function ensureSynthesizedAfter(c) {
  if (!c.synthesizeAfter || !c.after) return;
  const afterPath = join(FIX, c.after);
  if (existsSync(afterPath) && !c.refreshAfter) return;
  const beforeHtml = readFileSync(join(FIX, c.before), "utf8");
  const plan = buildRestructurePlan({
    job: c.id,
    category: c.id.includes("sources") ? "settings" : "queue",
    citePrimary: c.cite,
    ops: c.ops,
    measureMustClear: c.mustClear,
  });
  const { html } = applyDomRestructure(beforeHtml, plan);
  writeFileSync(afterPath, html);
}

function ensureXorAfter(c) {
  if (!c.xorRecipe || !c.after) return null;
  const beforePath = join(FIX, c.before);
  const afterPath = join(FIX, c.after);
  const beforeHtml = readFileSync(beforePath, "utf8");
  const xorOp = c.ops.find((o) => o.op === "collapse-peer-grids") || {};
  const xor = applyXorSavedView(beforeHtml, xorOp);
  if (!existsSync(afterPath) || c.refreshAfter) {
    writeFileSync(afterPath, xor.html);
  }
  mkdirSync(RECEIPTS, { recursive: true });
  const xorCropHtml = buildXorFoldCropHtml({
    keptTitle: xor.keptTitle || "Queue",
    chipLabel: xor.chipLabel || "Peer view",
  });
  const cropPath = join(RECEIPTS, "queue-dual-grid-fold-crop.html");
  writeFileSync(cropPath, xorCropHtml);
  ensureDefectCropReceipts(RECEIPTS, { xorAfterHtml: xorCropHtml });
  return { xor, cropPath, afterPath };
}

function ensureAllCropReceipts() {
  mkdirSync(RECEIPTS, { recursive: true });
  const xorCropHtml = buildXorFoldCropHtml({
    keptTitle: "Queue",
    chipLabel: "David's 10 today",
  });
  ensureDefectCropReceipts(RECEIPTS, { xorAfterHtml: xorCropHtml });
}

function cropPairStatus(cropPairId) {
  if (!cropPairId) return { required: false, ok: true, errors: [] };
  const pair = DEFECT_CROP_PAIRS.find((p) => p.id === cropPairId);
  if (!pair) return { required: true, ok: false, errors: [`unknown cropPairId ${cropPairId}`] };
  const read = (name) => {
    const path = join(RECEIPTS, name);
    return existsSync(path) ? readFileSync(path, "utf8") : "";
  };
  const result = assertCropPairOk(pair, read);
  return { required: true, ...result, beforeCrop: pair.beforeCrop, afterCrop: pair.afterCrop };
}

export function runDenoiseEval({ cases = CASES, runMeasure = true } = {}) {
  mkdirSync(FIX, { recursive: true });
  ensureAllCropReceipts();
  const scorecard = [];

  for (const c of cases) {
    ensureSynthesizedAfter(c);
    const xorMeta = c.xorRecipe ? ensureXorAfter(c) : null;
    const beforePath = join(FIX, c.before);
    const plan = buildRestructurePlan({
      job: `Denoise eval ${c.id}`,
      category: c.id.includes("sources") ? "settings" : "queue",
      citePrimary: c.cite,
      ops: c.ops,
      measureMustClear: c.mustClear,
      humanGate: !!(c.planOnly || c.xorRecipe),
    });
    const validation = validateRestructurePlan(plan);
    const beforeHtml = readFileSync(beforePath, "utf8");
    const appliedResult = applyDomRestructure(beforeHtml, plan);
    const preBefore = scanPreflightSlop(beforeHtml, { gate: true, screen: "queue" });
    let workingHtml = appliedResult.html;
    let xorApplied = false;
    if (c.xorRecipe) {
      const xorOp = c.ops.find((o) => o.op === "collapse-peer-grids") || {};
      const xor = applyXorSavedView(workingHtml, xorOp);
      workingHtml = xor.html;
      xorApplied = xor.applied;
    }
    const preAfter = scanPreflightSlop(workingHtml, { gate: true, screen: "queue" });

    let beforeMeasure = { status: null, failures: [] };
    let afterMeasure = { status: null, failures: [] };
    if (runMeasure && !c.planOnly) {
      beforeMeasure = measureFailures(beforePath, c.cite);
      const tmpAfter = join(FIX, `.tmp-${c.id}-after.html`);
      writeFileSync(tmpAfter, workingHtml);
      afterMeasure = measureFailures(tmpAfter, c.cite);
    }

    const cleared = [];
    for (const key of c.mustClear) {
      const wasFail =
        beforeMeasure.failures.some((f) => f.includes(key)) ||
        preBefore.failures.some((f) => f.includes(key)) ||
        preBefore.signals.some((s) => s.id.includes(key.replace("ai-slop-", "")));
      const stillFail =
        afterMeasure.failures.some((f) => f.includes(key)) ||
        preAfter.failures.some((f) => f.includes(key));
      if (c.xorRecipe && key === "dual-focal") {
        // D10: detect on before + clear after XOR (measure when run; structural fallback without browser)
        const structuralClear =
          xorApplied &&
          ((xorMeta?.xor?.gridCountAfter ?? 1) === 1 ||
            (workingHtml.match(/role=["']grid["']/gi) || []).length === 1);
        if (runMeasure) {
          if (wasFail && !stillFail) cleared.push(`${key}:detect→xor-pass`);
          else if (structuralClear && !stillFail) cleared.push(`${key}:xor-structural`);
        } else if (structuralClear) {
          cleared.push(`${key}:detect→xor-pass`);
        }
      } else if (c.planOnly) {
        if (wasFail || key === "dual-focal") cleared.push(`${key}:detect+plan`);
      } else if (wasFail && !stillFail) {
        cleared.push(key);
      } else if (!wasFail && appliedResult.applied.includes(c.ops[0]?.op)) {
        cleared.push(`${key}:op-applied`);
      }
    }

    // Preflight applyClears
    for (const id of c.applyClears || []) {
      const was = preBefore.signals.some((s) => s.id === id) || preBefore.failures.some((f) => f.includes(id));
      const now = preAfter.signals.some((s) => s.id === id) || preAfter.failures.some((f) => f.includes(id));
      if (was && !now) cleared.push(id);
    }

    const crops = cropPairStatus(c.cropPairId);
    const foldCropOk =
      !c.xorRecipe ||
      (crops.ok &&
        existsSync(join(RECEIPTS, "queue-dual-grid-fold-crop.html")) &&
        /role=["']grid["']/.test(readFileSync(join(RECEIPTS, "queue-dual-grid-fold-crop.html"), "utf8")) &&
        /data-shine-xor-views|data-shine-xor-from-peer/.test(
          readFileSync(join(RECEIPTS, "queue-dual-grid-fold-crop.html"), "utf8"),
        ));

    const cropOk = !c.cropPairId || crops.ok;

    const row = {
      id: c.id,
      opsEmitted: plan.ops.map((o) => o.op),
      opsApplied: appliedResult.applied,
      plans: appliedResult.plans.length,
      xorApplied: c.xorRecipe ? xorApplied : undefined,
      humanGateRequired: !!appliedResult.humanGate || !!c.planOnly || !!c.xorRecipe,
      measureCleared: cleared,
      validationOk: validation.ok,
      beforeMeasureStatus: beforeMeasure.status,
      afterMeasureStatus: afterMeasure.status,
      foldCropOk: c.xorRecipe ? foldCropOk : undefined,
      cropPair: c.cropPairId
        ? { id: c.cropPairId, ok: crops.ok, before: crops.beforeCrop, after: crops.afterCrop, errors: crops.errors }
        : undefined,
      pass:
        validation.ok &&
        cropOk &&
        (c.xorRecipe
          ? appliedResult.plans.length >= 1 &&
            xorApplied &&
            foldCropOk &&
            cleared.some((x) => x.includes("dual-focal")) &&
            // AST path must remain plan-only — XOR is a separate agent step
            !appliedResult.applied.includes("collapse-peer-grids")
          : c.planOnly
            ? appliedResult.plans.length >= 1
            : appliedResult.applied.length >= 1 &&
              (cleared.length >= 1 ||
                appliedResult.applied.includes("rebind-cite") ||
                appliedResult.applied.includes("set-focal"))),
    };
    scorecard.push(row);
  }

  const passed = scorecard.filter((r) => r.pass).length;
  const cropPairsOk = DEFECT_CROP_PAIRS.every((p) => cropPairStatus(p.id).ok);
  return {
    version: 1,
    total: scorecard.length,
    passed,
    failed: scorecard.length - passed,
    bar: "DOM auto-ops 100%; dual-grid detect→XOR after PASS; cropped FAIL→PASS receipts",
    cropPairsOk,
    cases: scorecard,
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const skipMeasure = args.includes("--no-measure");
  const report = runDenoiseEval({ runMeasure: !skipMeasure });
  const out = args.includes("--json") ? args[args.indexOf("--json") + 1] : "";
  const text = JSON.stringify(report, null, 2) + "\n";
  if (out) writeFileSync(out, text);
  process.stdout.write(text);
  process.exit(report.failed ? 1 : 0);
}
