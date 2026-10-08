// Empty peer / insight shells under a queue focal — title+kicker Card shells
// with no list/table/metrics/action after structure (dual-focal / KPI / CTA) is green.

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/empty-insight-shells.json */
export const EMPTY_INSIGHT_SHELLS_ANTI_PATTERN_ID = "empty-insight-shells";

/** Fail when ≥1 empty non-focal shell remains beside a worklist/focal. */
export const EMPTY_INSIGHT_SHELLS_MIN = 1;

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

/** Queue / triage / app-shell Operate — empty shells beside a focal are slop. */
export function emptyInsightShellsGateApplies({
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
    ["queue", "app-shell", "weekly-board", "dashboard", "record", "catalog"].includes(screen) ||
    /queue|triage|inbox|worklist|sled|usul/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|worklist|insight/.test(String(j)));
  if (queueish) return true;
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && isOperateProveScreen(screen)) return true;
  return false;
}

/**
 * page.evaluate body — count empty peer/insight Card shells under a focal/worklist.
 * Empty = heading + optional kicker/short prose only; no table/list/grid/metrics/actions.
 */
export function evaluateEmptyInsightShells() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const focal = main.querySelector(
    "[data-region='focal'], [data-shine-focal], [data-shine-worklist], [data-shine-shared-grid], .grid-wrap[data-region], table[role='grid'], [role='grid']",
  );
  const hasFocal = Boolean(focal && vis(focal));

  const cardSelector =
    "[data-slot='card'], [data-shine-card], [data-shine-insight], .card, section.card, article.card, [class*='Card']";
  const cards = [...main.querySelectorAll(cardSelector)].filter(vis);

  const substantiveSelector =
    "table, [role='grid'], [role='list'], ul, ol, .metric, [data-shine-kpi], [data-kpi], button, a[href], input, select, textarea, canvas, svg.chart, [data-chart], img, video, [data-shine-records]";

  const isKicker = (el) => {
    const cls = typeof el.className === "string" ? el.className : "";
    return /\bkicker\b/i.test(cls) || el.getAttribute("data-shine-kicker") != null;
  };

  const shells = [];
  for (const card of cards) {
    if (card.getAttribute("data-region") === "focal") continue;
    if (card.getAttribute("data-shine-deferred-shell") != null) continue;
    if (card.closest("details[data-shine-deferred-shell]")) continue;
    if (focal && (card === focal || card.contains(focal) || focal.contains(card))) continue;
    if (card.querySelector(substantiveSelector)) continue;

    const headings = [...card.querySelectorAll("h1,h2,h3,h4,h5,h6,[role='heading']")];
    if (!headings.length) continue;

    // Remaining visible text nodes: only kickers / short diagnostic prose allowed for "empty".
    const clone = card.cloneNode(true);
    for (const h of clone.querySelectorAll("h1,h2,h3,h4,h5,h6,[role='heading']")) h.remove();
    for (const k of clone.querySelectorAll(".kicker, [data-shine-kicker], p.kicker")) k.remove();
    const rest = (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim();
    // Anything beyond a short diagnostic line means real deferred content — still a shell if no controls.
    const title =
      (card.getAttribute("aria-label") || headings[0]?.textContent || "")
        .replace(/\s+/g, " ")
        .trim() || "(untitled)";
    if (rest.length > 120) continue; // rich body — not an empty shell
    shells.push({
      title,
      restLen: rest.length,
      sel:
        card.tagName.toLowerCase() +
        (card.id ? `#${card.id}` : "") +
        (typeof card.className === "string" && card.className
          ? `.${card.className.split(/\s+/).filter(Boolean)[0] || ""}`
          : ""),
    });
  }

  return {
    hasFocal,
    cardCount: cards.length,
    emptyShellCount: shells.length,
    titles: shells.map((s) => s.title),
    shells,
  };
}

export function formatEmptyInsightShellFailures(census, { gate = false } = {}) {
  if (!gate || !census) return [];
  // Only fail when structure has a focal/worklist — empty shells after structure green.
  if (!census.hasFocal) return [];
  if (census.emptyShellCount >= EMPTY_INSIGHT_SHELLS_MIN) {
    const titles = (census.titles || []).slice(0, 4).join(", ") || "(untitled)";
    return [
      withAntiPatternCite(
        `empty-insight-shells: ${census.emptyShellCount} empty peer/insight Card shell(s) under a queue focal [${titles}] — ` +
          `remove title+kicker-only non-focal shells or park deferred insight in <details data-shine-deferred-shell> (collapse-empty-shells; denoise)`,
        EMPTY_INSIGHT_SHELLS_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}
