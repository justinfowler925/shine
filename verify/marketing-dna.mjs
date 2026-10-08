// Marketing-DNA detector: glow / purple-indigo gradients / display-serif on
// Operate cites → fail-closed (marketing-dna-operate).

import { isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";
import { MARKETING_DNA_PATTERNS } from "./composition-slop.mjs";
import { withAntiPatternCite } from "../knowledge/retrieve.mjs";

/** Library id — knowledge/anti-patterns/marketing-dna-operate.json */
export const MARKETING_DNA_ANTI_PATTERN_ID = "marketing-dna-operate";

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function marketingDnaGateApplies({
  lane = "",
  citeScreen = "",
  citeJobs = [],
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  const id = String(citeId || "").toLowerCase();
  // Marketing / hero cites may legally carry marketing DNA.
  if (/marketing|hero/.test(id)) return false;
  const screen = normalizeScreen(citeScreen);
  if (screen && (isCtaPressureScreen(screen) || isOperateProveScreen(screen))) return true;
  if (
    /queue|triage|inbox|app-shell|catalog|settings|dashboard/.test(id) ||
    (citeJobs || []).some((j) => /queue|triage|worklist|catalog|settings|dashboard/.test(String(j)))
  ) {
    return true;
  }
  const laneNorm = normalizeScreen(lane);
  if ((laneNorm === "saas" || laneNorm === "internal") && (citeId || screen)) return true;
  return false;
}

/**
 * page.evaluate body — detect marketing DNA class/style clusters.
 * Kept inline (no imports) for Playwright evaluate serialization.
 */
export function evaluateMarketingDna() {
  const classBlob = [...document.querySelectorAll("[class]")].map((el) => el.className).join(" ");
  const styleBlob =
    [...document.querySelectorAll("style")].map((s) => s.textContent || "").join("\n") +
    [...document.querySelectorAll("[style]")].map((el) => el.getAttribute("style") || "").join(";");
  const dnaChecks = [
    { re: /\b(shadow-\[0_0_\d+px_.*?\]|drop-shadow-glow|animate-pulse-glow)\b/i, label: "glow utility" },
    {
      re: /\b(bg-gradient-to-[trbl]{1,2}|from-(violet|purple|fuchsia|indigo)-\d{2,3}|to-(violet|purple|fuchsia|indigo)-\d{2,3})\b/i,
      label: "marketing gradient cluster",
    },
    { re: /\b(font-(display|serif)|tracking-tighter)\b/i, label: "display/serif marketing type" },
    {
      re: /box-shadow:\s*[^;]*(0\s+0\s+\d+px|purple|#7[Cc]3[Aa][Ee][Dd]|#6366[Ff]1)/i,
      label: "glow box-shadow",
    },
    {
      re: /background(?:-image)?:\s*linear-gradient\([^)]*(violet|purple|indigo|#7[Cc]3|#6366)/i,
      label: "purple/indigo gradient fill",
    },
  ];
  const hits = [];
  for (const { re, label } of dnaChecks) {
    re.lastIndex = 0;
    if (re.test(classBlob) || re.test(styleBlob)) hits.push(label);
  }
  return { marketingHits: [...new Set(hits)], hitCount: hits.length };
}

export function formatMarketingDnaFailures(state, { gate = false } = {}) {
  if (!gate || !state) return [];
  const hits = state.marketingHits || [];
  if (!hits.length) return [];
  return [
    withAntiPatternCite(
      `marketing-dna: marketing DNA on saas Operate surface (${hits.join(", ")}) — ` +
        `apply strip-marketing-dna (remove glow/gradient/display-serif; keep product tokens)`,
      MARKETING_DNA_ANTI_PATTERN_ID,
    ),
  ];
}

export { MARKETING_DNA_PATTERNS };
