// Pill / chip filter stack detector: ≥5 equal filter pills above the fold on
// Operate queue cites → fail-closed (chrome outweighing the decide path).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

export const PILL_FILTER_MIN = 5;
export const PILL_FILTER_MAX_VISIBLE = 3;

/** Library id — knowledge/anti-patterns/pill-filter-stack.json */
export const PILL_FILTER_ANTI_PATTERN_ID = "pill-filter-stack";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

/** Queue / triage / catalog Operate — not marketing heroes. */
export function pillFilterGateApplies({
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
  const queueish =
    ["queue", "app-shell", "catalog", "approval", "record"].includes(screen) ||
    /queue|triage|inbox|worklist|catalog/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|worklist|catalog/.test(String(j)));
  if (queueish) return true;
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && isOperateProveScreen(screen)) return true;
  return false;
}

/**
 * page.evaluate body — count above-fold filter pills/chips in main.
 */
export function evaluatePillFilter() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const foldBottom = window.innerHeight || 900;
  const aboveFold = (el) => {
    const r = el.getBoundingClientRect();
    return r.top < foldBottom && r.bottom > 0;
  };
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const stack =
    main.querySelector(
      "[data-shine-filter-stack], .filter-pills, .pill-stack, [role='toolbar'][aria-label*='filter' i], [aria-label*='Filters' i]",
    ) || main;

  const pillSelector =
    "[data-shine-filter-pill], [data-shine-pill], .pill, .chip, [class*='rounded-full'][data-filter], button.pill, [role='button'].chip, [data-slot='badge']";
  const pills = [...stack.querySelectorAll(pillSelector)].filter(
    (el) => vis(el) && aboveFold(el) && !el.closest("details[data-shine-pill-rest]"),
  );

  // Also count peer buttons inside an explicit filter stack marked with data-shine-filter-stack.
  const stackEl = main.querySelector("[data-shine-filter-stack]");
  let stackPills = pills;
  if (stackEl) {
    const peers = [...stackEl.querySelectorAll("button, [role='button'], a.pill, span.pill, [data-slot='badge']")].filter(
      (el) => vis(el) && aboveFold(el) && !el.closest("details[data-shine-pill-rest]") && !el.closest("summary"),
    );
    if (peers.length > stackPills.length) stackPills = peers;
  }

  return {
    pillCount: stackPills.length,
    labels: stackPills.slice(0, 12).map((el) => (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim()).filter(Boolean),
    aboveFold: true,
  };
}

export function formatPillFilterFailures(pill, { gate = false } = {}) {
  if (!gate || !pill) return [];
  if (pill.pillCount >= PILL_FILTER_MIN) {
    return [
      withAntiPatternCite(
        `pill-filter: ${pill.pillCount} above-fold filter pills/chips in main — ` +
          `collapse to ≤${PILL_FILTER_MAX_VISIBLE} visible and park the rest in <details data-shine-pill-rest> (pill-collapse; denoise)`,
        PILL_FILTER_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}
