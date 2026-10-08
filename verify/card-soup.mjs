// Card-soup detector: ≥4 equal-weight Card roots without a focal on Operate →
// fail-closed (card-soup).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";
import { CARD_SOUP_MIN } from "./composition-slop.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/card-soup.json */
export const CARD_SOUP_ANTI_PATTERN_ID = "card-soup";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function cardSoupGateApplies({
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
    /queue|triage|inbox|catalog|dashboard|app-shell|approval|record/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|catalog|dashboard|worklist|record/.test(String(j)))
  ) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) return true;
  return false;
}

/**
 * page.evaluate body — equal Card roots without a large enough focal.
 * Kept inline for Playwright evaluate serialization.
 */
export function evaluateCardSoup() {
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
  const cardSelector =
    "[data-slot='card'], [data-shine-card], .card, [class*='Card'], article.card, section.card";
  const cards = [...main.querySelectorAll(cardSelector)]
    .filter(vis)
    .filter((el) => !el.closest("[data-shine-card-rest]") && !el.hasAttribute("data-shine-card-demoted"));
  const areas = cards.map((el) => ({ el, area: areaOf(el) }));
  const maxArea = Math.max(0, ...areas.map((a) => a.area));
  const equalCards = areas.filter((a) => maxArea > 0 && a.area / maxArea >= 0.78);
  const focalCandidates = [
    ...main.querySelectorAll(
      "table, [role='grid'], [data-region='focal'], [data-shine-focal], .data-grid, canvas, svg.chart, [data-chart]",
    ),
  ].filter(vis);
  const hasFocal = focalCandidates.some((el) => areaOf(el) >= maxArea * 1.4);
  return {
    cardCount: cards.length,
    equalCardCount: equalCards.length,
    hasFocal,
  };
}

export function formatCardSoupFailures(state, { gate = false } = {}) {
  if (!gate || !state) return [];
  if (state.equalCardCount >= CARD_SOUP_MIN && !state.hasFocal) {
    return [
      withAntiPatternCite(
        `card-soup: ${state.equalCardCount} equal-weight Card roots in main with no focal region — ` +
          `apply collapse-card-soup (stamp data-region=focal; park peers in details data-shine-card-rest)`,
        CARD_SOUP_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}

export { CARD_SOUP_MIN };
