// Filter-reversible detector: active filter chips without dismiss/clear
// affordance on Operate cites → fail-closed (irreversible-filters).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/irreversible-filters.json */
export const FILTER_REVERSIBLE_ANTI_PATTERN_ID = "irreversible-filters";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function filterReversibleGateApplies({
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
  const queueish =
    ["queue", "app-shell", "catalog", "approval", "record", "dashboard"].includes(screen) ||
    /queue|triage|inbox|worklist|catalog/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|worklist|catalog|filter/.test(String(j)));
  if (queueish) return true;
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && isOperateProveScreen(screen)) return true;
  return false;
}

/**
 * page.evaluate body — count active filters lacking dismiss / clear-all.
 */
export function evaluateFilterReversible() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const textOf = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;
  const stacks = [
    ...main.querySelectorAll(
      "[data-shine-filter-stack], .filter-pills, .pill-stack, [role='toolbar'][aria-label*='filter' i], [aria-label*='Filters' i]",
    ),
  ].filter(vis);
  const scope = stacks.length ? stacks : [main];

  const isDismiss = (el) => {
    if (!el || !vis(el)) return false;
    if (el.hasAttribute("data-shine-filter-dismiss")) return true;
    const label = (el.getAttribute("aria-label") || textOf(el) || "").toLowerCase();
    return /clear|remove|dismiss|reset|×|✕|x\b/.test(label);
  };

  let activeCount = 0;
  let irreversible = [];
  let hasClearAll = false;

  for (const root of scope) {
    if (
      root.querySelector("[data-shine-filter-clear-all]") ||
      [...root.querySelectorAll("button,[role=button],a")].some((b) => {
        const label = (b.getAttribute("aria-label") || textOf(b) || "").toLowerCase();
        return /^(clear all filters|clear filters|reset filters)$/.test(label.trim());
      })
    ) {
      hasClearAll = true;
    }

    const actives = [
      ...root.querySelectorAll(
        "[data-filter-active='true'], [data-shine-filter-active], [aria-pressed='true'], .filter-chip.active, .pill.active, [data-shine-filter-pill][aria-pressed='true']",
      ),
    ].filter(vis);

    for (const chip of actives) {
      activeCount += 1;
      const selfDismiss = isDismiss(chip);
      const childDismiss = [...chip.querySelectorAll("button,[role=button],span,[data-shine-filter-dismiss]")].some(
        isDismiss,
      );
      const siblingDismiss = chip.parentElement
        ? [...chip.parentElement.children].some(
            (sib) => sib !== chip && isDismiss(sib) && (sib.previousElementSibling === chip || sib.nextElementSibling === chip),
          )
        : false;
      if (!selfDismiss && !childDismiss && !siblingDismiss && !hasClearAll) {
        irreversible.push(textOf(chip).slice(0, 40) || "unnamed");
      }
    }
  }

  // If clear-all exists, chips are reversible even without per-chip ×.
  if (hasClearAll) irreversible = [];

  return {
    activeFilterCount: activeCount,
    irreversibleCount: irreversible.length,
    irreversibleSamples: irreversible.slice(0, 6),
    hasClearAll,
  };
}

export function formatFilterReversibleFailures(state, { gate = false } = {}) {
  if (!gate || !state) return [];
  if (state.irreversibleCount >= 1) {
    const samples = (state.irreversibleSamples || []).filter(Boolean).join(", ") || "unnamed";
    return [
      withAntiPatternCite(
        `filter-reversible: ${state.irreversibleCount} active filter(s) lack dismiss/clear [${samples}] — ` +
          `apply filter-clearable (per-chip data-shine-filter-dismiss and/or data-shine-filter-clear-all)`,
        FILTER_REVERSIBLE_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}
