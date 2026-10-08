// Decorative-chart detector: chart/SVG without units on Operate →
// fail-closed (decorative-chart-no-units).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/decorative-chart-no-units.json */
export const DECORATIVE_CHART_ANTI_PATTERN_ID = "decorative-chart-no-units";

/** Default unit stamped by stamp-chart-units. */
export const DEFAULT_CHART_UNIT = "count";

/** Default baseline stamped by stamp-chart-units. */
export const DEFAULT_CHART_BASELINE = "prior period";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function decorativeChartGateApplies({
  lane = "",
  citeScreen = "",
  citeJobs = [],
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  const id = String(citeId || "").toLowerCase();
  if (/marketing|hero/.test(id)) return false;
  const screen = normalizeScreen(citeScreen);
  if (screen && (isCtaPressureScreen(screen) || isOperateProveScreen(screen))) return true;
  if (
    /queue|triage|inbox|catalog|dashboard|app-shell|approval|record|chart/.test(id) ||
    (citeJobs || []).some((j) =>
      /queue|triage|catalog|dashboard|worklist|chart|kpi|dataviz/.test(String(j)),
    )
  ) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) return true;
  return false;
}

/**
 * page.evaluate body — find chart-like nodes lacking unit/baseline markers.
 * Kept inline for Playwright evaluate serialization.
 */
export function evaluateDecorativeChart() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const textOf = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const charts = [
    ...main.querySelectorAll(
      "svg[data-chart], canvas[data-chart], [data-chart], [data-shine-chart], svg.recharts-surface, .recharts-wrapper, [class*='Chart'] svg, svg[aria-label*='chart' i], canvas[aria-label*='chart' i], [role='img'][aria-label*='chart' i], svg.chart, canvas.chart",
    ),
  ].filter(vis);

  // Also catch bare large SVG/canvas used as decorative charts (common AI slop).
  for (const el of [...main.querySelectorAll("svg, canvas")].filter(vis)) {
    if (charts.includes(el)) continue;
    if (el.closest("[data-shine-chart-rest], details[data-shine-chart-rest]")) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= 160 && r.height >= 80) charts.push(el);
  }

  const unitRe = /\b(unit|units|count|%|percent|usd|\$|arr|baseline|vs prior|per day|n=)\b/i;
  const hasUnits = (el) => {
    if (el.hasAttribute("data-shine-chart-stamped")) return true;
    if (el.hasAttribute("data-unit") || el.hasAttribute("data-units")) return true;
    if (el.getAttribute("data-shine-unit")) return true;
    const label = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || "";
    if (unitRe.test(label)) return true;
    const host = el.closest("figure, [data-chart], [data-shine-chart], section, article") || el.parentElement;
    if (host) {
      if (host.hasAttribute("data-unit") || host.hasAttribute("data-shine-chart-stamped")) return true;
      if (host.querySelector("[data-unit], [data-shine-chart-legend], [data-shine-kpi][data-unit]")) return true;
      if (unitRe.test(textOf(host).slice(0, 160))) return true;
    }
    return false;
  };

  const unmarked = charts.filter((el) => !hasUnits(el) && !el.closest("[data-shine-chart-rest]"));
  return {
    chartCount: charts.length,
    unmarkedCount: unmarked.length,
    unmarkedSamples: unmarked.slice(0, 4).map((el) => {
      const tag = el.tagName.toLowerCase();
      const label = (el.getAttribute("aria-label") || "").slice(0, 40);
      return label ? `${tag}[${label}]` : tag;
    }),
  };
}

export function formatDecorativeChartFailures(state, { gate = false } = {}) {
  if (!gate || !state) return [];
  if ((state.unmarkedCount || 0) < 1) return [];
  const samples = (state.unmarkedSamples || []).filter(Boolean).join(", ") || "chart";
  return [
    withAntiPatternCite(
      `decorative-chart: ${state.unmarkedCount} chart(s) lack units/baseline [${samples}] — ` +
        `apply stamp-chart-units (data-unit + data-baseline + data-shine-chart-stamped)`,
      DECORATIVE_CHART_ANTI_PATTERN_ID,
    ),
  ];
}
