// Filler-empty detector: belief-free empty-state phrases on Operate cites →
// fail-closed (filler-empty-copy).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";
import { FILLER_EMPTY_PHRASES } from "./composition-slop.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/filler-empty-copy.json */
export const FILLER_EMPTY_ANTI_PATTERN_ID = "filler-empty-copy";

/** Default Monday-job empty copy written by rewrite-filler-empty. */
export const DEFAULT_OPERATE_EMPTY_COPY =
  "No notices match this view. Clear filters or widen the date range.";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function fillerEmptyGateApplies({
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
    /queue|triage|inbox|app-shell|catalog|settings|dashboard|record/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|worklist|catalog|settings|dashboard|record/.test(String(j)))
  ) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) return true;
  return false;
}

/**
 * page.evaluate body — find filler empty-state phrases.
 * Kept inline for Playwright evaluate serialization.
 */
export function evaluateFillerEmpty() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const textOf = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();
  const nameOf = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : "") +
    (typeof el.className === "string" && el.className
      ? `.${el.className.split(/\s+/).filter(Boolean)[0] || ""}`
      : "");
  const fillerRes = [
    /^welcome to your dashboard\.?$/i,
    /^welcome to .+!$/,
    /^get started with your (new )?dashboard\.?$/i,
    /^this is where .+ will (appear|show|live)\.?$/i,
    /^no data to display\.?$/i,
    /^nothing here yet\.?$/i,
    /^coming soon\.?$/i,
    /^lorem ipsum\b/i,
    /^your (amazing )?content (goes|here)/i,
    /^start building something (amazing|great)\.?$/i,
    /^drop your content here\.?$/i,
    /^placeholder text\.?$/i,
    /^todo:\s*add .+/i,
    /^click here to get started\.?$/i,
  ];
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;
  const fillerHits = [];
  const emptyEls = [
    ...main.querySelectorAll(
      "[data-empty], [data-shine-empty], [data-empty-state], .empty-state, .empty, [class*='empty' i], [role='status']",
    ),
  ].filter(vis);
  for (const el of emptyEls) {
    if (el.hasAttribute("data-shine-empty-rewritten")) continue;
    const text = textOf(el);
    if (!text) continue;
    if (fillerRes.some((re) => re.test(text))) {
      fillerHits.push({ sel: nameOf(el), text: text.slice(0, 80) });
    }
  }
  for (const el of [...main.querySelectorAll("p, h2, h3, div")].filter(vis)) {
    if (el.hasAttribute("data-shine-empty-rewritten")) continue;
    const text = textOf(el);
    if (!text || text.length > 80) continue;
    if (fillerRes.some((re) => re.test(text))) {
      if (!fillerHits.some((h) => h.text === text.slice(0, 80))) {
        fillerHits.push({ sel: nameOf(el), text: text.slice(0, 80) });
      }
    }
  }
  return { fillerHits: fillerHits.slice(0, 6), fillerCount: fillerHits.length };
}

export function formatFillerEmptyFailures(state, { gate = false } = {}) {
  if (!gate || !state) return [];
  const hits = state.fillerHits || [];
  if (!hits.length) return [];
  const sample = hits.map((h) => `"${h.text}"`).join("; ");
  return [
    withAntiPatternCite(
      `filler-empty: filler empty-state copy ${sample} — ` +
        `apply rewrite-filler-empty (job-specific instructional copy; data-shine-empty-rewritten)`,
      FILLER_EMPTY_ANTI_PATTERN_ID,
    ),
  ];
}

export { FILLER_EMPTY_PHRASES };
