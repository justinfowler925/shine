// N6 — KPI soup detector: ≥4 equal metrics competing with the work object on
// queue/triage cites → fail-closed (dashboard KPI floor stays in kpi.mjs).

import { isOperateProveScreen } from "../hooks/receipt.mjs";

export const KPI_SOUP_MIN = 4;

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

/** Queue / triage / app-shell Operate — not pure dashboard cites (those use kpi.mjs). */
export function kpiSoupGateApplies({
  lane = "",
  citeScreen = "",
  citeJobs = [],
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  const screen = normalizeScreen(citeScreen);
  const id = String(citeId || "").toLowerCase();
  if (/marketing|hero/.test(id)) return false;
  if (screen === "dashboard") return false; // kpi.mjs owns dashboard equal-card floor
  const queueish =
    ["queue", "app-shell", "settings", "record", "form", "catalog"].includes(screen) ||
    /queue|triage|inbox|worklist/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|worklist/.test(String(j)));
  if (queueish) return true;
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && isOperateProveScreen(screen)) return true;
  return false;
}

/**
 * page.evaluate body — count equal metric tiles in main.
 */
export function evaluateKpiSoup() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const areaOf = (el) => {
    const r = el.getBoundingClientRect();
    return Math.max(0, r.width * r.height);
  };
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const metrics = [
    ...main.querySelectorAll(
      ".metric, [data-shine-kpi], [data-kpi], .metrics > *, [aria-label*='key figures' i] > *",
    ),
  ].filter(vis);

  const areas = metrics.map((el) => areaOf(el));
  const maxArea = Math.max(0, ...areas);
  const equal = metrics.filter((_, i) => maxArea > 0 && areas[i] / maxArea >= 0.78);

  const workObject = main.querySelector(
    "table[role='grid'], [role='grid'], [data-region='focal'], [data-shine-worklist]",
  );
  const workArea = workObject && vis(workObject) ? areaOf(workObject) : 0;
  const metricBandArea = equal.reduce((s, el) => s + areaOf(el), 0);

  return {
    metricCount: metrics.length,
    equalMetricCount: equal.length,
    workArea,
    metricBandArea,
    competingWithWork: workArea > 0 && equal.length >= 4,
  };
}

export function formatKpiSoupFailures(soup, { gate = false } = {}) {
  if (!gate || !soup) return [];
  if (soup.equalMetricCount >= KPI_SOUP_MIN) {
    return [
      `kpi-soup: ${soup.equalMetricCount} equal metric tiles in main — ` +
        `collapse to ≤3 chips and park the rest in <details> (kpi-collapse; denoise N6)`,
    ];
  }
  return [];
}
