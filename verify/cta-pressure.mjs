// Primary-job CTA pressure for Operate SaaS (expert-track P1).
// Machine: >1 distinct filled primary treatment in the main content region
// hard-fails for Operate page cites. Diagnosis competingCtaCheck.ok === false
// must bind a flow: assertion (prove) so agents cannot acknowledge peers and skip.
//
// Global hierarchy still fails at >2 filled treatments (any surface). This module
// tightens Operate to a single filled primary in main.

import { OPERATE_PROVE_SCREENS, isOperateProveScreen } from "../hooks/receipt.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

export { OPERATE_PROVE_SCREENS, isOperateProveScreen };

/** Library id — knowledge/anti-patterns/competing-filled-ctas.json */
export const CTA_PRESSURE_ANTI_PATTERN_ID = "competing-filled-ctas";

/** Screens that get main-region CTA pressure. Includes catalog (Company Tools). */
export const CTA_PRESSURE_SCREENS = Object.freeze([
  ...OPERATE_PROVE_SCREENS,
  "catalog",
]);

export function isCtaPressureScreen(screen) {
  return CTA_PRESSURE_SCREENS.includes(String(screen || "").trim().toLowerCase());
}

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

function shellHintFromJobs(jobs = []) {
  for (const job of jobs) {
    if (isCtaPressureScreen(job)) return normalizeScreen(job);
  }
  return "";
}

/**
 * Whether Operate main-region CTA pressure applies.
 * Wireframes and marketing cites skip. Operate screen cite / jobs / lane=saas|internal
 * with unresolved screen fail closed when a page cite is present.
 */
export function ctaPressureGateApplies({
  lane = "",
  citeScreen = "",
  citeJobs = [],
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  const id = String(citeId || "").toLowerCase();
  if (/marketing|hero/.test(id)) return false;

  const screen = normalizeScreen(citeScreen) || shellHintFromJobs(citeJobs);
  if (screen && isCtaPressureScreen(screen)) return true;

  const laneNorm = normalizeScreen(lane);
  if (laneNorm === "saas" || laneNorm === "internal") {
    // Operate lane + any non-marketing cite id that looks like a page packet.
    if (screen && !isCtaPressureScreen(screen)) return false;
    if (citeId || screen) return true;
  }
  return false;
}

/**
 * page.evaluate body — census filled treatments inside main content only.
 * Sidebar / nav / aside filled controls do not count toward the primary budget.
 * @returns {{ mainFilledCount: number, mainControlCount: number, mainFilledSamples: string[], mainRegion: string }}
 */
export function evaluateMainCtaPressure() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const paintRgb = (css) => {
    const c = new OffscreenCanvas(1, 1);
    const ctx = c.getContext("2d");
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };

  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;
  const inChrome = (el) =>
    !!el.closest("aside, nav, [data-slot='sidebar'], [data-region='chrome'], header[data-chrome]");

  const pageBg = getComputedStyle(document.body).backgroundColor;
  const controls = [...main.querySelectorAll("button,[role=button],a.btn,input[type=submit]")].filter(
    (el) => vis(el) && !inChrome(el),
  );

  const treatments = new Map();
  for (const b of controls) {
    const cs = getComputedStyle(b);
    const key = `${cs.backgroundColor}|${cs.borderColor}|${cs.fontWeight}`;
    const entry =
      treatments.get(key) ?? {
        bg: cs.backgroundColor,
        border: cs.borderColor,
        weight: cs.fontWeight,
        n: 0,
        sample: [],
      };
    entry.n++;
    if (entry.sample.length < 4) {
      entry.sample.push((b.innerText || b.value || "").trim().slice(0, 14).replace(/\s+/g, " "));
    }
    treatments.set(key, entry);
  }

  const filled = [...treatments.values()].filter((t) => {
    if (t.bg === "rgba(0, 0, 0, 0)" || t.bg === "transparent") return false;
    const [r, g, bl, a] = paintRgb(t.bg);
    const [pr, pg, pb] = paintRgb(pageBg);
    if (a < 16) return false;
    return Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(bl - pb) > 60;
  });

  return {
    mainFilledCount: filled.length,
    mainControlCount: controls.length,
    mainFilledSamples: filled.flatMap((t) => t.sample).slice(0, 6),
    mainRegion: main === document.body ? "body" : main.tagName.toLowerCase(),
  };
}

export function formatCtaPressureFailures(cta, { gate = false } = {}) {
  if (!gate || !cta) return [];
  if (cta.mainControlCount > 0 && cta.mainFilledCount === 0) {
    return [
      withAntiPatternCite(
        `cta-pressure: ${cta.mainControlCount} controls in main and 0 filled primary treatments — ` +
          `nothing reads as the primary job action (diagnose.md competingCtaCheck; techniques.md §Hierarchy)`,
        CTA_PRESSURE_ANTI_PATTERN_ID,
      ),
    ];
  }
  if (cta.mainFilledCount > 1) {
    const samples = (cta.mainFilledSamples || []).filter(Boolean).join(", ") || "unnamed";
    return [
      withAntiPatternCite(
        `cta-pressure: ${cta.mainFilledCount} competing filled treatments in main [${samples}] — ` +
          `Operate pages allow one filled primary; demote peers to outline/ghost or bind competingCtaCheck.ok=false to a flow: (expert P1)`,
        CTA_PRESSURE_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}

/**
 * When diagnosis.competingCtaCheck.ok === false, a critical/major defect must bind flow:.
 * Presence of the check field is already schema-gated for saas Operate.
 */
export function checkCompetingCtaFlowBinding(diagnosis) {
  const check = diagnosis?.competingCtaCheck;
  if (!check || typeof check !== "object") {
    return { status: "passed", reason: "competingCtaCheck not present" };
  }
  if (check.ok !== false) {
    return { status: "passed", ok: check.ok === true };
  }
  const defects = Array.isArray(diagnosis.defects) ? diagnosis.defects : [];
  const bound = defects.some(
    (d) =>
      ["critical", "major"].includes(d.severity) &&
      Array.isArray(d.assertions) &&
      d.assertions.some((a) => String(a).startsWith("flow:")),
  );
  if (!bound) {
    return {
      status: "failed",
      failures: [
        "competingCtaCheck.ok is false but no critical/major defect binds a flow: assertion that demotes/removes peer CTAs",
      ],
    };
  }
  return { status: "passed", ok: false, bound: true };
}
