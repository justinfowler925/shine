// Operate decide-queue silhouette gates.
// Bites the SLED accordion landfill + floating More failure mode that still
// measured PASS under generic shadcn-queue / denoise park-in-details.
//
//   (a) accordion-under-lead — ≥2 <details> between Summary lead and focal grid
//   (b) detached-overflow — More control not attached to the primary action cluster

import { OPERATE_PROVE_SCREENS, isOperateProveScreen } from "../hooks/receipt.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";

export const ACCORDION_UNDER_LEAD_ID = "accordion-under-lead";
export const DETACHED_OVERFLOW_ID = "detached-overflow";

/** Max gap (px) between filled primary and More before overflow is "detached". */
export const ATTACHED_OVERFLOW_MAX_GAP_PX = 48;

/** ≥ this many details between lead and focal → fail. */
export const ACCORDION_UNDER_LEAD_MIN = 2;

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function decideQueueSlopGateApplies({
  lane = "",
  citeScreen = "",
  citeJobs = [],
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  const id = String(citeId || "").toLowerCase();
  if (/marketing|hero/.test(id)) return false;
  if (/operate-decide|decide-queue|sled/.test(id)) return true;
  const screen = normalizeScreen(citeScreen);
  const queueish =
    screen === "queue" ||
    (citeJobs || []).some((j) => /queue|triage|worklist|decide|inbox/.test(String(j))) ||
    /queue|triage|worklist|decide/.test(id);
  if (queueish) return true;
  if (screen && (isOperateProveScreen(screen) || isCtaPressureScreen(screen))) {
    return screen === "queue" || OPERATE_PROVE_SCREENS.includes(screen);
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && queueish) return true;
  return false;
}

/**
 * page.evaluate body — accordion under lead + detached overflow census.
 */
export function evaluateDecideQueueSlop() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  const lead =
    main.querySelector(
      "[data-region='summary-lead'], [data-summary], [data-sled-decide-lead], [data-testid='summary-lead']",
    ) || null;

  const focal =
    main.querySelector(
      "[data-region='focal'], [data-shine-focal], .grid-wrap, [data-grid], table[role='table'], table[role='grid'], [role='grid']",
    ) || null;

  let detailsBetween = 0;
  const detailLabels = [];
  if (lead && focal && lead !== focal) {
    const all = [...main.querySelectorAll("details")].filter(vis);
    for (const d of all) {
      // Between lead and focal in document order, not inside lead or focal.
      if (lead.contains(d) || focal.contains(d)) continue;
      const afterLead = !!(lead.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_FOLLOWING);
      const beforeFocal = !!(focal.compareDocumentPosition(d) & Node.DOCUMENT_POSITION_PRECEDING);
      if (afterLead && beforeFocal) {
        detailsBetween += 1;
        const label = (d.querySelector("summary")?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 48);
        if (label) detailLabels.push(label);
      }
    }
  }

  // Lead itself hosting a details stack is also landfill.
  let detailsInLead = 0;
  if (lead) {
    detailsInLead = [...lead.querySelectorAll("details")].filter(vis).length;
  }

  const moreControls = [...main.querySelectorAll("button, a, [role='button']")]
    .filter(vis)
    .filter((el) => {
      const t = (el.innerText || el.textContent || el.getAttribute("aria-label") || "")
        .replace(/\s+/g, " ")
        .trim();
      if (/^more(\s+actions)?$/i.test(t)) return true;
      if (/^\.\.\.\s*more$/i.test(t)) return true;
      if (/^more filters$/i.test(t)) return true;
      if (el.getAttribute("data-testid") === "more-attached") return true;
      return false;
    });

  const detached = [];
  for (const more of moreControls) {
    if (more.closest("[data-overflow='attached']")) continue;
    const cluster =
      more.closest("[data-decide-path], [data-overflow], td, .actions, [data-testid='decide-actions']") ||
      more.parentElement;
    const primary =
      cluster?.querySelector?.(
        "button.filled, .btn.filled, [data-primary], button[class*='bg-primary'], [class*='variant-default']",
      ) || null;
    // Prefer a filled sibling in the same cluster.
    let filled = primary;
    if (!filled && cluster) {
      filled = [...cluster.querySelectorAll("button, [role='button']")].find((b) => {
        if (b === more || !vis(b)) return false;
        const cs = getComputedStyle(b);
        const bg = cs.backgroundColor;
        // crude filled: not transparent / white-ish like outline peers
        return bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent" && !/^rgb\(255,\s*255,\s*255\)$/.test(bg);
      });
    }
    const moreRect = more.getBoundingClientRect();
    if (filled) {
      const pRect = filled.getBoundingClientRect();
      const gap = Math.max(0, moreRect.left - pRect.right, pRect.left - moreRect.right);
      // Same row vertically?
      const sameRow = Math.abs(moreRect.top - pRect.top) < Math.max(moreRect.height, pRect.height);
      if (!sameRow || gap > 48) {
        detached.push({
          kind: "gap-from-primary",
          gap: Math.round(gap),
          label: (more.innerText || "").trim().slice(0, 24),
        });
      }
      continue;
    }
    // No primary in cluster — floating filter More on a full-width tab row.
    const row = more.closest(".tabs, [role='tablist'], .toolbar, header, [data-region='queue-toolbar']") || more.parentElement;
    if (row) {
      const rowRect = row.getBoundingClientRect();
      const trailingSlack = rowRect.right - moreRect.right;
      const leadingSlack = moreRect.left - rowRect.left;
      // Far-right orphan on a wide row with no co-located primary.
      if (leadingSlack > 200 && trailingSlack < 40) {
        detached.push({
          kind: "floating-tab-more",
          leadingSlack: Math.round(leadingSlack),
          label: (more.innerText || "").trim().slice(0, 24),
        });
      } else if (!more.closest("td, [data-decide-path], [data-overflow]")) {
        detached.push({
          kind: "orphan-more",
          label: (more.innerText || "").trim().slice(0, 24),
        });
      }
    }
  }

  return {
    hasLead: !!lead,
    hasFocal: !!focal,
    detailsBetweenLeadAndFocal: detailsBetween,
    detailsInLead,
    detailLabels: detailLabels.slice(0, 6),
    moreCount: moreControls.length,
    detachedOverflow: detached,
  };
}

export function formatDecideQueueSlopFailures(result, { gate = false } = {}) {
  if (!gate || !result) return [];
  const out = [];
  const accordionCount = (result.detailsBetweenLeadAndFocal || 0) + (result.detailsInLead || 0);
  if (result.hasLead && result.hasFocal && accordionCount >= ACCORDION_UNDER_LEAD_MIN) {
    const labels = (result.detailLabels || []).join("; ") || `${accordionCount} disclosures`;
    out.push(
      withAntiPatternCite(
        ACCORDION_UNDER_LEAD_ID,
        `accordion-under-lead: ${accordionCount} <details> under/between Summary lead and focal worklist (${labels}) — park encyclopedia after the queue, not as accordion landfill`,
      ),
    );
  }
  if ((result.detachedOverflow || []).length) {
    const sample = result.detachedOverflow
      .slice(0, 3)
      .map((d) => d.kind + (d.gap != null ? `@${d.gap}px` : "") + (d.label ? `:${d.label}` : ""))
      .join(", ");
    out.push(
      withAntiPatternCite(
        DETACHED_OVERFLOW_ID,
        `detached-overflow: More/overflow not attached to the primary decision action (${sample}) — keep overflow in the same action cluster (data-overflow=attached)`,
      ),
    );
  }
  return out;
}
