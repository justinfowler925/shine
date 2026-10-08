// Parallel-owned detector: homemade worklist beside a product owner →
// fail-closed (parallel-owned-component).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/parallel-owned-component.json */
export const PARALLEL_OWNED_ANTI_PATTERN_ID = "parallel-owned-component";

/** Default owner id stamped by bind-product-owner. */
export const DEFAULT_PRODUCT_OWNER_ID = "nucleus-datagrid";

/** Default product pattern stamped by bind-product-owner. */
export const DEFAULT_PRODUCT_PATTERN = "worklist";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function parallelOwnedGateApplies({
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
    /queue|triage|inbox|catalog|dashboard|app-shell|approval|record|datagrid|worklist/.test(id) ||
    (citeJobs || []).some((j) =>
      /queue|triage|catalog|dashboard|worklist|datagrid|reuse|sibling|owner/.test(String(j)),
    )
  ) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) return true;
  return false;
}

/**
 * page.evaluate body — find product owners vs parallel worklist inventions.
 * Kept inline for Playwright evaluate serialization.
 */
export function evaluateParallelOwned() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const isOwned = (el) =>
    el.hasAttribute("data-shine-owner") ||
    el.hasAttribute("data-shine-reuse-bound") ||
    el.hasAttribute("data-shine-owner-id") ||
    (el.hasAttribute("data-product-pattern") &&
      /worklist|datagrid|record-table|card-list|action-flow/i.test(
        el.getAttribute("data-product-pattern") || "",
      ));

  const isWorklistLike = (el) => {
    if (el.closest("[data-shine-parallel-rest], details[data-shine-parallel-rest]")) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === "table") return true;
    if (el.getAttribute("role") === "grid") return true;
    if (el.hasAttribute("data-shine-grid") || el.hasAttribute("data-slot") && el.getAttribute("data-slot") === "table") {
      return true;
    }
    if (el.hasAttribute("data-shine-owner") || el.hasAttribute("data-product-pattern")) return true;
    return false;
  };

  const candidates = [
    ...main.querySelectorAll(
      "table, [role='grid'], [data-shine-grid], [data-slot='table'], [data-shine-owner], [data-product-pattern]",
    ),
  ].filter(vis).filter(isWorklistLike);

  // Prefer outermost worklist hosts (skip nested table inside owned grid).
  const roots = candidates.filter((el) => {
    const parent = el.parentElement?.closest(
      "table, [role='grid'], [data-shine-grid], [data-shine-owner], [data-product-pattern]",
    );
    return !parent || parent === el;
  });

  const owners = roots.filter(isOwned);
  const parallels = roots.filter((el) => !isOwned(el));
  const expected =
    main.getAttribute("data-owner-expected") ||
    main.getAttribute("data-shine-product-reference") ||
    document.documentElement.getAttribute("data-owner-expected") ||
    "";

  return {
    ownerCount: owners.length,
    parallelCount: parallels.length,
    ownerExpected: Boolean(expected) || owners.length > 0,
    ownerSamples: owners.slice(0, 4).map((el) => {
      const id =
        el.getAttribute("data-shine-owner") ||
        el.getAttribute("data-shine-owner-id") ||
        el.getAttribute("data-product-pattern") ||
        el.tagName.toLowerCase();
      return id.slice(0, 40);
    }),
    parallelSamples: parallels.slice(0, 4).map((el) => {
      const tag = el.tagName.toLowerCase();
      const cls = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean)[0] || "";
      return cls ? `${tag}.${cls}` : tag;
    }),
  };
}

export function formatParallelOwnedFailures(state, { gate = false } = {}) {
  if (!gate || !state) return [];
  const parallels = state.parallelCount || 0;
  if (parallels < 1) return [];
  // Fail when parallels invent beside an owner, or when owner is declared/expected.
  if (!state.ownerExpected && (state.ownerCount || 0) < 1) return [];
  const samples = (state.parallelSamples || []).filter(Boolean).join(", ") || "table";
  const owners = (state.ownerSamples || []).filter(Boolean).join(", ") || "product-owner";
  return [
    withAntiPatternCite(
      `parallel-owned: ${parallels} parallel worklist(s) beside product owner [${owners}] — ` +
        `invented [${samples}]; apply bind-product-owner (data-shine-reuse-bound + demote parallel)`,
      PARALLEL_OWNED_ANTI_PATTERN_ID,
    ),
  ];
}
