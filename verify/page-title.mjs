// Competing page titles detector: ≥2 peer page titles in main on Operate
// cites → fail-closed (one job name, one title).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

export const PAGE_TITLE_MIN = 2;

/** Library id — knowledge/anti-patterns/competing-page-titles.json */
export const PAGE_TITLE_ANTI_PATTERN_ID = "competing-page-titles";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

/** Operate page cites — not marketing heroes. */
export function pageTitleGateApplies({
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
  const operateish =
    ["queue", "app-shell", "settings", "form", "catalog", "record", "approval", "dashboard"].includes(
      screen,
    ) ||
    /queue|triage|inbox|settings|sources|catalog/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|settings|catalog|worklist/.test(String(j)));
  if (operateish) return true;
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && isOperateProveScreen(screen)) return true;
  return false;
}

/**
 * page.evaluate body — count competing page titles in main.
 * Demoted kickers (data-shine-title-demoted) do not count.
 */
export function evaluatePageTitle() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const textOf = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const titleSelector = "h1, [data-page-title], [data-shine-page-title], .page-title";
  const titles = [...main.querySelectorAll(titleSelector)].filter(
    (el) =>
      vis(el) &&
      !el.hasAttribute("data-shine-title-demoted") &&
      !el.closest("[data-shine-title-demoted]") &&
      textOf(el).length > 0,
  );

  // Deduplicate nested (h1.page-title counted once).
  const roots = titles.filter((el) => !titles.some((other) => other !== el && other.contains(el)));

  return {
    titleCount: roots.length,
    texts: roots.slice(0, 6).map((el) => textOf(el).slice(0, 80)),
  };
}

export function formatPageTitleFailures(titles, { gate = false } = {}) {
  if (!gate || !titles) return [];
  if (titles.titleCount >= PAGE_TITLE_MIN) {
    const sample = (titles.texts || []).map((t) => `"${t}"`).join(", ");
    return [
      withAntiPatternCite(
        `page-title: ${titles.titleCount} competing page titles in main${sample ? ` (${sample})` : ""} — ` +
          `keep one title; demote peers to kicker (title-singular; denoise)`,
        PAGE_TITLE_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}
