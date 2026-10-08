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
  collectCiteAttrsTsx,
  setFocalTsx,
  countEqualCardsWithoutFocalTsx,
  compositionOrderTsx,
  worklistFirstTsx,
  pillCollapseTsx,
  countFilterPillsTsx,
  titleSingularTsx,
  countPageTitlesTsx,
} from "./restructure/apply-tsx.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";

const FIX = join(dirname(fileURLToPath(import.meta.url)), "fixtures/denoise/tsx");
const dual = readFileSync(join(FIX, "queue-dual-cta.tsx"), "utf8");
const hard = readFileSync(join(FIX, "queue-dual-cta-ast.tsx"), "utf8");
const settings = readFileSync(join(FIX, "settings-wrong-cite.tsx"), "utf8");
const settingsHard = readFileSync(join(FIX, "settings-wrong-cite-ast.tsx"), "utf8");
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
const usul = readFileSync(join(FIX, "usul-no-focal.tsx"), "utf8");
const usulHard = readFileSync(join(FIX, "usul-no-focal-ast.tsx"), "utf8");
assert.equal(countEqualCardsWithoutFocalTsx(usul).hasFocal, false);
assert.equal(countEqualCardsWithoutFocalTsx(usulHard).hasFocal, false);
const usulAfter = setFocalTsx(usul, {});
assert.equal(countEqualCardsWithoutFocalTsx(usulAfter).hasFocal, true);
assert.match(usulAfter, /data-region="focal"/);
const usulHardAfter = setFocalTsx(usulHard, {});
assert.equal(countEqualCardsWithoutFocalTsx(usulHardAfter).hasFocal, true);
assert.match(usulHardAfter, /data-region="focal"/);
assert.match(usulHardAfter, /className=\{\s*["']grid-wrap["']\s*\}/);
assert.match(usulHardAfter, /data-shine-records/);

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
assert.ok(collectCiteAttrsTsx(settingsResult.source).cites.includes("shadcn-settings"));
// Wrong-cite AST harden: data-cite={"…"} + dataCite=
assert.ok(collectCiteAttrsTsx(settingsHard).cites.includes("shadcn-queue"));
const settingsHardAfter = rebindCiteTsx(settingsHard, {
  from: "shadcn-queue",
  to: "shadcn-settings",
});
assert.ok(collectCiteAttrsTsx(settingsHardAfter).cites.every((c) => c === "shadcn-settings"));
assert.match(settingsHardAfter, /data-cite=\{\s*["']shadcn-settings["']\s*\}/);
assert.match(settingsHardAfter, /dataCite=["']shadcn-settings["']/);
const settingsHardPlan = buildRestructurePlan({
  job: "Rebind wrong cite AST",
  category: "settings",
  ops: [{ op: "rebind-cite", from: "shadcn-queue", to: "shadcn-settings" }],
});
assert.ok(applyTsxRestructure(settingsHard, settingsHardPlan).applied.includes("rebind-cite"));

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


const kpiChromeFirst = readFileSync(join(FIX, "queue-kpi-chrome-first.tsx"), "utf8");
const worklistHard = readFileSync(join(FIX, "queue-worklist-first-ast.tsx"), "utf8");
assert.equal(compositionOrderTsx(kpiChromeFirst).kpiBeforeWorklist, true);
const wlAfter = worklistFirstTsx(kpiChromeFirst, {});
assert.equal(compositionOrderTsx(wlAfter).kpiBeforeWorklist, false);
assert.match(wlAfter, /data-region="focal"/);
assert.equal(compositionOrderTsx(worklistHard).kpiBeforeWorklist, true);
const wlHardAfter = worklistFirstTsx(worklistHard, {});
assert.equal(compositionOrderTsx(wlHardAfter).kpiBeforeWorklist, false);
assert.match(wlHardAfter, /className=\{\s*["']grid-wrap["']\s*\}/);
assert.match(wlHardAfter, /data-region="focal"/);
const wlPlan = buildRestructurePlan({
  job: "Worklist before KPI",
  category: "queue",
  ops: [{ op: "worklist-first" }],
});
const wlResult = applyTsxRestructure(worklistHard, wlPlan);
assert.ok(wlResult.applied.includes("worklist-first"));

// Pill-filter AST
const pillSoup = readFileSync(join(FIX, "queue-pill-stack.tsx"), "utf8");
const pillHard = readFileSync(join(FIX, "queue-pill-stack-ast.tsx"), "utf8");
assert.ok(countFilterPillsTsx(pillSoup).pills >= 6);
const pillAfter = pillCollapseTsx(pillSoup, { maxVisible: 3 });
assert.equal(countFilterPillsTsx(pillAfter).pills, 3);
assert.match(pillAfter, /data-shine-pill-rest/);
assert.ok(countFilterPillsTsx(pillHard).pills >= 6);
const pillHardAfter = pillCollapseTsx(pillHard, { maxVisible: 3 });
assert.equal(countFilterPillsTsx(pillHardAfter).pills, 3);
assert.match(pillHardAfter, /className=\{\s*["']filter-pills["']\s*\}/);
const pillPlan = buildRestructurePlan({
  job: "Collapse pill stack",
  category: "queue",
  ops: [{ op: "pill-collapse", maxVisible: 3 }],
});
assert.ok(applyTsxRestructure(pillHard, pillPlan).applied.includes("pill-collapse"));

// Competing page-titles AST
const titleSoup = readFileSync(join(FIX, "queue-competing-titles.tsx"), "utf8");
const titleHard = readFileSync(join(FIX, "queue-competing-titles-ast.tsx"), "utf8");
assert.ok(countPageTitlesTsx(titleSoup).titles >= 3);
const titleAfter = titleSingularTsx(titleSoup, {});
assert.equal(countPageTitlesTsx(titleAfter).titles, 1);
assert.match(titleAfter, /data-shine-title-demoted/);
assert.ok(countPageTitlesTsx(titleHard).titles >= 3);
const titleHardAfter = titleSingularTsx(titleHard, {});
assert.equal(countPageTitlesTsx(titleHardAfter).titles, 1);
assert.match(titleHardAfter, /data-shine-title-demoted/);
const titlePlan = buildRestructurePlan({
  job: "Singularize titles",
  category: "queue",
  ops: [{ op: "title-singular" }],
});
assert.ok(applyTsxRestructure(titleHard, titlePlan).applied.includes("title-singular"));

console.log(
  "apply-tsx PASS: cta-budget AST · kpi-collapse AST · pill-collapse AST · title-singular AST · collapse-peer-grids AST · worklist-first AST · rebind-cite AST · set-focal AST · single-grid plan-only",
);
