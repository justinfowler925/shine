// Chrome-pressure detector: filled primaries in header/nav/aside chrome on
// Operate cites → fail-closed (nav chrome must not compete with the Monday job).
// Main-region CTA budget stays in cta-pressure.mjs (chrome is excluded there).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/dual-chrome-actions.json */
export const CHROME_PRESSURE_ANTI_PATTERN_ID = "dual-chrome-actions";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function chromePressureGateApplies({
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
    /queue|triage|inbox|app-shell|catalog|settings/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|worklist|catalog|settings/.test(String(j)))
  ) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) return true;
  return false;
}

/**
 * page.evaluate body — count filled treatments inside chrome regions only.
 * Markers: .filled / .filled-peer / data-shine-chrome-filled, or contrast-filled
 * buttons inside header/nav/aside chrome hosts.
 */
export function evaluateChromePressure() {
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
  const chromeRoots = [
    ...document.querySelectorAll(
      "header, nav, aside, [data-slot='sidebar'], [data-region='chrome'], [data-shine-chrome], [role='banner']",
    ),
  ];
  if (!chromeRoots.length) {
    return { chromeFilledCount: 0, chromeControlCount: 0, chromeFilledSamples: [] };
  }
  const pageBg = getComputedStyle(document.body).backgroundColor;
  const controls = [];
  for (const root of chromeRoots) {
    for (const el of root.querySelectorAll("button,[role=button],a.btn,input[type=submit]")) {
      if (vis(el)) controls.push(el);
    }
  }
  const uniq = [...new Set(controls)];
  const samples = [];
  for (const b of uniq) {
    const label = (b.innerText || b.value || "").trim().slice(0, 24).replace(/\s+/g, " ");
    if (
      b.classList.contains("filled") ||
      b.classList.contains("filled-peer") ||
      b.getAttribute("data-shine-chrome-filled") === "true"
    ) {
      samples.push(label || "unnamed");
      continue;
    }
    if (b.classList.contains("ghost") || b.classList.contains("outline")) continue;
    const cs = getComputedStyle(b);
    const bg = cs.backgroundColor;
    if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") continue;
    const [r, g, bl, a] = paintRgb(bg);
    const [pr, pg, pb] = paintRgb(pageBg);
    if (a < 16) continue;
    if (Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(bl - pb) > 60) {
      samples.push(label || "unnamed");
    }
  }
  return {
    chromeFilledCount: samples.length,
    chromeControlCount: uniq.length,
    chromeFilledSamples: samples.slice(0, 6),
  };
}

export function formatChromePressureFailures(chrome, { gate = false } = {}) {
  if (!gate || !chrome) return [];
  if (chrome.chromeFilledCount >= 1) {
    const samples = (chrome.chromeFilledSamples || []).filter(Boolean).join(", ") || "unnamed";
    return [
      withAntiPatternCite(
        `chrome-pressure: ${chrome.chromeFilledCount} filled primary treatment(s) in header/nav/aside chrome [${samples}] — ` +
          `chrome must stay outline/ghost; demote via chrome-budget (maxFilledChrome=0); keep the job verb filled in main`,
        CHROME_PRESSURE_ANTI_PATTERN_ID,
      ),
    ];
  }
  return [];
}
