// Empty-triad detector: empty ≡ filtered-empty ≡ error conflated on Operate →
// fail-closed (empty-filtered-error-conflated).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/empty-filtered-error-conflated.json */
export const EMPTY_TRIAD_ANTI_PATTERN_ID = "empty-filtered-error-conflated";

/** Default filtered-empty instructional copy. */
export const DEFAULT_FILTERED_EMPTY_COPY =
  "No notices match these filters. Clear filters or widen the date range.";

/** Default error instructional copy (distinct from empty). */
export const DEFAULT_ERROR_COPY = "Couldn't load notices. Retry.";

/** Default true-empty instructional copy (no active filters). */
export const DEFAULT_TRUE_EMPTY_COPY = "No notices yet. When new ones arrive, they show up here.";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function emptyTriadGateApplies({
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
    /queue|triage|inbox|catalog|dashboard|app-shell|approval|record|settings/.test(id) ||
    (citeJobs || []).some((j) =>
      /queue|triage|catalog|dashboard|worklist|record|filter|empty/.test(String(j)),
    )
  ) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) return true;
  return false;
}

/**
 * page.evaluate body — detect conflated empty / filtered-empty / error states.
 * Kept inline for Playwright evaluate serialization.
 */
export function evaluateEmptyTriad() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const textOf = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const emptyEls = [
    ...main.querySelectorAll(
      "[data-empty], [data-state='empty'], [data-shine-empty], [data-empty-state], .empty-state",
    ),
  ].filter(vis);
  const filteredEls = [
    ...main.querySelectorAll("[data-filtered-empty], [data-state='filtered-empty']"),
  ].filter(vis);
  const errorEls = [
    ...main.querySelectorAll("[data-error], [data-state='error'], [role='alert']"),
  ].filter(vis);

  const activeFilters = [
    ...main.querySelectorAll(
      "[data-filter-active='true'], [data-shine-filter-active], [aria-pressed='true'], .filter-chip.active, .pill.active, [data-shine-filter-pill][aria-pressed='true']",
    ),
  ].filter(vis);

  const hasClearNear = (el) => {
    const root = el.closest("main, [data-shine-main], body") || main;
    const scope = el.parentElement || root;
    return [...scope.querySelectorAll("button,[role='button'],a,[data-shine-filter-clear-all]")].some(
      (b) => {
        if (!vis(b)) return false;
        const label = (b.getAttribute("aria-label") || textOf(b) || "").toLowerCase();
        return /clear|reset filters|dismiss/.test(label) || b.hasAttribute("data-shine-filter-clear-all");
      },
    );
  };

  const sameNodeConflated = emptyEls.filter(
    (el) =>
      el.hasAttribute("data-error") ||
      el.getAttribute("data-state") === "error" ||
      el.getAttribute("role") === "alert",
  );

  const emptyTexts = emptyEls.map(textOf).filter((t) => t && t.length < 120);
  const errorTexts = errorEls
    .filter((el) => !emptyEls.includes(el))
    .map(textOf)
    .filter((t) => t && t.length < 120);
  const sharedCopy = emptyTexts.filter((t) => errorTexts.includes(t));

  const missingFilteredEmpty =
    activeFilters.length > 0 &&
    emptyEls.length > 0 &&
    filteredEls.length === 0 &&
    emptyEls.some((el) => !hasClearNear(el) || !el.hasAttribute("data-filtered-empty"));

  return {
    emptyCount: emptyEls.length,
    filteredEmptyCount: filteredEls.length,
    errorCount: errorEls.length,
    activeFilterCount: activeFilters.length,
    sameNodeConflatedCount: sameNodeConflated.length,
    sharedCopyCount: sharedCopy.length,
    sharedCopySamples: sharedCopy.slice(0, 3),
    missingFilteredEmpty,
  };
}

export function formatEmptyTriadFailures(state, { gate = false } = {}) {
  if (!gate || !state) return [];
  const failures = [];
  if (state.sameNodeConflatedCount >= 1) {
    failures.push(
      withAntiPatternCite(
        `empty-triad: ${state.sameNodeConflatedCount} empty region(s) also marked error/alert — ` +
          `apply split-empty-triad (distinct empty vs error treatments)`,
        EMPTY_TRIAD_ANTI_PATTERN_ID,
      ),
    );
  }
  if (state.sharedCopyCount >= 1) {
    const sample = (state.sharedCopySamples || []).map((t) => `"${t}"`).join("; ") || "shared";
    failures.push(
      withAntiPatternCite(
        `empty-triad: empty and error share copy ${sample} — ` +
          `apply split-empty-triad (distinct instructional copy)`,
        EMPTY_TRIAD_ANTI_PATTERN_ID,
      ),
    );
  }
  if (state.missingFilteredEmpty) {
    failures.push(
      withAntiPatternCite(
        `empty-triad: active filters with empty state but no filtered-empty treatment — ` +
          `apply split-empty-triad (stamp data-filtered-empty + clear-filters recovery)`,
        EMPTY_TRIAD_ANTI_PATTERN_ID,
      ),
    );
  }
  return failures;
}
