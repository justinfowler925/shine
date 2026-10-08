// Composition slop detectors beyond hex/Tailwind (expert-track P3).
// DOM-safe subset only — hover-only / toast-only stay agent.
//
//   (a) ≥N equal Card roots in main without a focal region
//   (b) marketing DNA utility clusters on lane=saas Operate cites
//   (c) empty-state copy matching known filler phrases
//
// Failure messages cite knowledge/anti-patterns/*.json ids (S2).

import { OPERATE_PROVE_SCREENS, isOperateProveScreen } from "../hooks/receipt.mjs";
import { isCtaPressureScreen } from "./cta-pressure.mjs";

/** Library ids for machine-readable anti-patterns (knowledge/anti-patterns). */
export const ANTI_PATTERN_IDS = Object.freeze({
  cardSoup: "card-soup",
  marketingDna: "marketing-dna-operate",
  fillerEmpty: "filler-empty-copy",
});

export const CARD_SOUP_MIN = 4;
export const CARD_AREA_EQUALITY_RATIO = 0.78;
export const FOCAL_MIN_RATIO = 1.4;

/** Filler empty-state phrases that must never ship on Operate (N4 deny-list). */
export const FILLER_EMPTY_PHRASES = Object.freeze([
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
]);

/** Marketing DNA class / style tells — illegal on saas Operate chrome. */
export const MARKETING_DNA_PATTERNS = Object.freeze([
  { re: /\b(shadow-\[0_0_\d+px_.*?\]|drop-shadow-glow|animate-pulse-glow)\b/i, label: "glow utility" },
  { re: /\b(bg-gradient-to-[trbl]{1,2}|from-(violet|purple|fuchsia|indigo)-\d{2,3}|to-(violet|purple|fuchsia|indigo)-\d{2,3})\b/i, label: "marketing gradient cluster" },
  { re: /\b(font-(display|serif)|tracking-tighter)\b/i, label: "display/serif marketing type" },
  { re: /box-shadow:\s*[^;]*(0\s+0\s+\d+px|purple|#7[Cc]3[Aa][Ee][Dd]|#6366[Ff]1)/i, label: "glow box-shadow" },
  { re: /background(?:-image)?:\s*linear-gradient\([^)]*(violet|purple|indigo|#7[Cc]3|#6366)/i, label: "purple/indigo gradient fill" },
]);

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function compositionSlopGateApplies({
  lane = "",
  citeScreen = "",
  citeJobs = [],
  isWireframe = false,
  citeId = "",
} = {}) {
  if (isWireframe) return false;
  const id = String(citeId || "").toLowerCase();
  if (/marketing|hero/.test(id)) return false;
  const screen =
    normalizeScreen(citeScreen) ||
    citeJobs.map(normalizeScreen).find((j) => isCtaPressureScreen(j) || isOperateProveScreen(j)) ||
    "";
  if (screen && (isCtaPressureScreen(screen) || isOperateProveScreen(screen))) return true;
  const laneNorm = normalizeScreen(lane);
  if (laneNorm === "saas" || laneNorm === "internal") {
    if (screen && !(isCtaPressureScreen(screen) || isOperateProveScreen(screen))) return false;
    if (citeId || screen) return true;
  }
  return false;
}

/**
 * page.evaluate body — card soup, marketing DNA, filler empty copy.
 */
export function evaluateCompositionSlop() {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const nameOf = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : "") +
    (typeof el.className === "string" && el.className
      ? `.${el.className.split(/\s+/).filter(Boolean)[0] || ""}`
      : "");
  const areaOf = (el) => {
    const r = el.getBoundingClientRect();
    return Math.max(0, r.width * r.height);
  };
  const textOf = (el) => (el?.innerText || el?.textContent || "").replace(/\s+/g, " ").trim();

  const main =
    document.querySelector("main, [role='main'], [data-region='main'], [data-shine-main]") ||
    document.body;

  // (a) Card roots — Card component class, shadcn data-slot, or bordered panel siblings.
  const cardSelector =
    "[data-slot='card'], [data-shine-card], .card, [class*='Card'], article.card, section.card";
  const cards = [...main.querySelectorAll(cardSelector)].filter(vis);
  const areas = cards.map((el) => ({ el, area: areaOf(el), sel: nameOf(el) }));
  const maxArea = Math.max(0, ...areas.map((a) => a.area));
  const equalCards = areas.filter((a) => maxArea > 0 && a.area / maxArea >= 0.78);

  const focalCandidates = [
    ...main.querySelectorAll(
      "table, [role='grid'], [data-region='focal'], [data-shine-focal], .data-grid, canvas, svg.chart, [data-chart]",
    ),
  ].filter(vis);
  const largestCard = maxArea;
  const hasFocal = focalCandidates.some((el) => areaOf(el) >= largestCard * 1.4);

  // (b) Marketing DNA — class names + inline/style tag text.
  const marketingHits = [];
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
  for (const { re, label } of dnaChecks) {
    re.lastIndex = 0;
    if (re.test(classBlob) || re.test(styleBlob)) {
      marketingHits.push(label);
    }
  }

  // (c) Filler empty-state phrases
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
  const fillerHits = [];
  const emptyEls = [
    ...main.querySelectorAll(
      "[data-empty], [data-shine-empty], [data-empty-state], .empty-state, [class*='empty' i], [role='status']",
    ),
  ].filter(vis);
  for (const el of emptyEls) {
    const text = textOf(el);
    if (!text) continue;
    if (fillerRes.some((re) => re.test(text))) {
      fillerHits.push({ sel: nameOf(el), text: text.slice(0, 80) });
    }
  }
  // Also scan short standalone paragraphs that are the only content in a large empty region
  for (const el of [...main.querySelectorAll("p, h2, h3, div")].filter(vis)) {
    const text = textOf(el);
    if (!text || text.length > 80) continue;
    if (fillerRes.some((re) => re.test(text))) {
      if (!fillerHits.some((h) => h.text === text.slice(0, 80))) {
        fillerHits.push({ sel: nameOf(el), text: text.slice(0, 80) });
      }
    }
  }

  return {
    cardCount: cards.length,
    equalCardCount: equalCards.length,
    hasFocal,
    marketingHits: [...new Set(marketingHits)],
    fillerHits: fillerHits.slice(0, 6),
  };
}

export function formatCompositionSlopFailures(slop, { gate = false } = {}) {
  if (!gate || !slop) return [];
  const failures = [];
  if (slop.equalCardCount >= CARD_SOUP_MIN && !slop.hasFocal) {
    failures.push(
      `composition-slop: ${slop.equalCardCount} equal-weight Card roots in main with no focal region — ` +
        `anti-pattern:${ANTI_PATTERN_IDS.cardSoup}; collapse peers or add a table/chart/queue focal ` +
        `(knowledge/anti-patterns/card-soup.json; expert P3)`,
    );
  }
  // Marketing DNA failures emit via verify/marketing-dna.mjs (prefix marketing-dna).
  if (slop.fillerHits?.length) {
    const sample = slop.fillerHits.map((h) => `"${h.text}"`).join("; ");
    failures.push(
      `composition-slop: filler empty-state copy ${sample} — anti-pattern:${ANTI_PATTERN_IDS.fillerEmpty}; ` +
        `replace with job-specific instructional copy (knowledge/anti-patterns/filler-empty-copy.json; expert P3)`,
    );
  }
  return failures;
}

export { OPERATE_PROVE_SCREENS, isOperateProveScreen };
