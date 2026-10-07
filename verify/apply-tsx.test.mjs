#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyTsxRestructure,
  collapsePeerGridsTsx,
  countFilledButtonsTsx,
  countMetricTilesTsx,
  countPeerGridsTsx,
  ctaBudgetTsx,
  kpiCollapseTsx,
  rebindCiteTsx,
  setFocalTsx,
} from "./restructure/apply-tsx.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";

const FIX = join(dirname(fileURLToPath(import.meta.url)), "fixtures/denoise/tsx");
const dual = readFileSync(join(FIX, "queue-dual-cta.tsx"), "utf8");
const hard = readFileSync(join(FIX, "queue-dual-cta-ast.tsx"), "utf8");
const settings = readFileSync(join(FIX, "settings-wrong-cite.tsx"), "utf8");
const kpiSoup = readFileSync(join(FIX, "queue-kpi-soup.tsx"), "utf8");
const kpiHard = readFileSync(join(FIX, "queue-kpi-soup-ast.tsx"), "utf8");
const dualGrid = readFileSync(join(FIX, "queue-dual-grid.tsx"), "utf8");
const dualGridHard = readFileSync(join(FIX, "queue-dual-grid-ast.tsx"), "utf8");

const cta = ctaBudgetTsx(dual, { maxFilled: 1, preferLabels: ["Pursue"] });
assert.match(cta, /variant="default">Pursue/);
assert.match(cta, /variant="outline">Assign lead/);
assert.equal(countFilledButtonsTsx(cta).filled, 1);

// AST harden: expression variant, nested span, missing variant
const beforeHard = countFilledButtonsTsx(hard);
assert.ok(beforeHard.filled >= 3, JSON.stringify(beforeHard));
const hardAfter = ctaBudgetTsx(hard, { maxFilled: 1, preferLabels: ["Pursue"] });
assert.equal(countFilledButtonsTsx(hardAfter).filled, 1);
assert.match(hardAfter, /variant=\{\s*["']default["']\s*\}/);
assert.match(hardAfter, /variant="outline"/);
assert.match(hardAfter, /<Button\s+variant="outline"[^>]*className="peer-action"/);

const rebound = rebindCiteTsx(settings, { from: "shadcn-queue", to: "shadcn-settings" });
assert.match(rebound, /data-cite="shadcn-settings"/);

const focal = setFocalTsx(dual, {});
assert.match(focal, /data-region="focal"/);

const plan = buildRestructurePlan({
  job: "Decide Pursue",
  category: "queue",
  ops: [
    { op: "cta-budget", maxFilled: 1, preferLabels: ["Pursue"] },
    { op: "set-focal" },
    { op: "collapse-peer-grids", mode: "xor-saved-view" },
  ],
});
const result = applyTsxRestructure(dual, plan);
assert.ok(result.applied.includes("cta-budget"));
assert.ok(result.applied.includes("set-focal"));
// queue-dual-cta.tsx has two peer DataGrid hosts → AST XOR applies (not silent delete).
assert.ok(result.applied.includes("collapse-peer-grids"));
assert.equal(countPeerGridsTsx(result.source).grids, 1);
assert.match(result.source, /data-shine-xor-views/);
assert.ok(!/delete|removeChild|Dangerously/i.test(result.source));

// Single-grid surface: collapse-peer-grids stays plan-only (nothing to fold).
const singleGrid = `export function One() {\n  return (\n    <main data-shine-main>\n      <div className="grid-wrap" data-product-pattern="paged-notice-queue">\n        <h2 data-grid-title="Queue">Queue</h2>\n        <DataGrid role="grid" />\n      </div>\n    </main>\n  );\n}\n`;
const singlePlan = buildRestructurePlan({
  job: "Single grid no peer",
  category: "queue",
  ops: [{ op: "collapse-peer-grids", mode: "xor-saved-view" }],
});
const singleResult = applyTsxRestructure(singleGrid, singlePlan);
assert.ok(singleResult.plans.length >= 1, "single-grid must keep collapse-peer-grids plan-only");
assert.ok(!singleResult.applied.includes("collapse-peer-grids"));
assert.match(singleResult.plans[0], /collapse-peer-grids/);

const settingsPlan = buildRestructurePlan({
  job: "Fix or pause a matching recipe",
  category: "settings",
  citePrimary: "shadcn-settings",
  ops: [{ op: "rebind-cite", from: "shadcn-queue", to: "shadcn-settings" }],
});
const settingsResult = applyTsxRestructure(settings, settingsPlan);
assert.ok(settingsResult.applied.includes("rebind-cite"));

// KPI soup AST: literal + expression className / data-shine-kpi
const beforeKpi = countMetricTilesTsx(kpiSoup);
assert.ok(beforeKpi.tiles >= 6, JSON.stringify(beforeKpi));
const kpiAfter = kpiCollapseTsx(kpiSoup, { maxVisible: 3 });
assert.equal(countMetricTilesTsx(kpiAfter).tiles, 3);
assert.match(kpiAfter, /data-shine-kpi-rest/);
const beforeKpiHard = countMetricTilesTsx(kpiHard);
assert.ok(beforeKpiHard.tiles >= 6, JSON.stringify(beforeKpiHard));
const kpiHardAfter = kpiCollapseTsx(kpiHard, { maxVisible: 3 });
assert.equal(countMetricTilesTsx(kpiHardAfter).tiles, 3);
assert.match(kpiHardAfter, /className=\{\s*["']metrics["']\s*\}/);
assert.match(kpiHardAfter, /data-shine-kpi-rest/);
const kpiPlan = buildRestructurePlan({
  job: "Collapse KPI soup",
  category: "queue",
  ops: [{ op: "kpi-collapse", maxVisible: 3, rest: "details" }],
});
const kpiResult = applyTsxRestructure(kpiHard, kpiPlan);
assert.ok(kpiResult.applied.includes("kpi-collapse"));

// Dual-focal ban AST: peer grid-wrap → XOR chip + one shared grid
const beforeDual = countPeerGridsTsx(dualGrid);
assert.ok(beforeDual.grids >= 2, JSON.stringify(beforeDual));
const dualAfter = collapsePeerGridsTsx(dualGrid, {
  keepTitleIncludes: ["Queue"],
  foldTitleIncludes: ["David"],
});
assert.equal(countPeerGridsTsx(dualAfter).grids, 1);
assert.match(dualAfter, /data-shine-xor-views/);
assert.match(dualAfter, /data-shine-xor-from-peer=/);
const beforeDualHard = countPeerGridsTsx(dualGridHard);
assert.ok(beforeDualHard.grids >= 2, JSON.stringify(beforeDualHard));
const dualHardAfter = collapsePeerGridsTsx(dualGridHard, {
  keepTitleIncludes: ["Queue"],
  foldTitleIncludes: ["David"],
});
assert.equal(countPeerGridsTsx(dualHardAfter).grids, 1);
assert.match(dualHardAfter, /className=\{\s*["']grid-wrap["']\s*\}/);
assert.match(dualHardAfter, /data-shine-xor-views/);
const dualPlan = buildRestructurePlan({
  job: "Collapse peer grids",
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
const dualResult = applyTsxRestructure(dualGrid, dualPlan);
assert.ok(dualResult.applied.includes("collapse-peer-grids"));
assert.equal(countPeerGridsTsx(dualResult.source).grids, 1);
assert.equal(dualResult.plans.length, 0, "literal peer grids should AST-apply, not plan-only");

console.log(
  "apply-tsx PASS: cta-budget AST · kpi-collapse AST · collapse-peer-grids AST · set-focal · rebind-cite · single-grid plan-only",
);
