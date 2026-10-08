// N6 / D10 — Dual-focal detector: ≥2 peer worklists/grids in main → fail-closed.
// collapse-peer-grids auto-applies XOR on DOM (xor-saved-view) + TSX AST.

import { OPERATE_PROVE_SCREENS, isOperateProveScreen } from "../hooks/receipt.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";

/** Library id — knowledge/anti-patterns/dual-focal-grids.json */
export const DUAL_FOCAL_ANTI_PATTERN_ID = "dual-focal-grids";

export const DUAL_FOCAL_MIN_GRIDS = 2;

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function dualFocalGateApplies({
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
  if (screen && (isOperateProveScreen(screen) || isCtaPressureScreen(screen) || screen === "queue")) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) {
    if (screen && !isOperateProveScreen(screen) && screen !== "catalog") return false;
    return true;
  }
  return false;
}

/**
 * page.evaluate body — count peer worklist/grid focals in main.
 */
export function evaluateDualFocal() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  // Peer worklist regions (Sled dual queue) — prefer wrappers over raw tables so
  // data-product-pattern*='queue' on a wrap is not double-counted with its table.
  const wraps = [...main.querySelectorAll(".grid-wrap, [data-shine-grid], [data-region='worklist'], [data-shine-worklist]")].filter(
    (el) => vis(el) && el.querySelector("table, [role='grid'], .data-grid"),
  );

  // Standalone grids not already inside a counted wrap.
  const tables = [...main.querySelectorAll("table[role='grid'], [role='grid'], .data-grid, [data-slot='data-grid']")].filter(
    (el) => vis(el) && !wraps.some((w) => w.contains(el)),
  );

  const peerCount = wraps.length + tables.length;
  const titles = [...wraps, ...tables]
    .map((w) => (w.querySelector?.("h2, h3, [data-grid-title]")?.textContent || w.getAttribute?.("aria-label") || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 4);

  const explicitFocals = [...main.querySelectorAll("[data-region='focal']")].filter(vis).length;

  return {
    peerGridCount: peerCount,
    gridCount: tables.length,
    wrapCount: wraps.length,
    titles,
    explicitFocals,
  };
}

export function formatDualFocalFailures(dual, { gate = false } = {}) {
  if (!gate || !dual) return [];
  if (dual.peerGridCount >= DUAL_FOCAL_MIN_GRIDS) {
    const titles = (dual.titles || []).join(" + ") || "unnamed peers";
    return [
      withAntiPatternCite(
        `dual-focal: ${dual.peerGridCount} peer worklists/grids in main [${titles}] — ` +
          `Operate triage allows one focal work object; fold peers as saved-view/XOR (collapse-peer-grids plan; expert N6)`,
        DUAL_FOCAL_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}

export { OPERATE_PROVE_SCREENS, isOperateProveScreen };
