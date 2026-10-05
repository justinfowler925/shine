// Dashboard / KPI decidability floor for measure (M5).
// Opt-in DOM convention = machine; decidability narrative = agent (dashboards.md).
//
//   (a) ≥3 equal-weight summary cards with no focal region → hard-fail on dashboard
//       cite screen or data-shine-probe="dashboard"
//   (b) [data-shine-kpi] missing required unit/baseline attrs → hard-fail wherever
//       the attribute is adopted (packet/skill require it on dashboard recipes)
//   Without data-shine-kpi → skill agent checklist only for units/baselines.

export const KPI_EQUAL_CARD_MIN = 3;
/** Sibling cards whose areas fall within this ratio of the cluster max are "equal-weight". */
export const KPI_AREA_EQUALITY_RATIO = 0.78;
/** Focal chart/table must be at least this multiple of the largest summary card. */
export const KPI_FOCAL_MIN_RATIO = 1.35;
export const KPI_REQUIRED_ATTRS = ["data-unit", "data-baseline"];

export function normalizeScreen(value) {
  return String(value || "").trim().toLowerCase();
}

export function isDashboardScreen(screenOrKind) {
  return normalizeScreen(screenOrKind) === "dashboard";
}

function shellHintFromJobs(jobs = []) {
  for (const job of jobs) {
    if (isDashboardScreen(job)) return "dashboard";
  }
  return "";
}

/**
 * Whether the equal-weight summary-card floor (a) applies.
 * Cite screen/kind/jobs = dashboard, or data-shine-probe="dashboard".
 * Wireframes skip. Non-dashboard surfaces stay note/agent-only for (a).
 */
export function kpiDashboardGateApplies({
  citeScreen = "",
  citeKind = "",
  citeJobs = [],
  dashboardProbe = false,
  isWireframe = false,
} = {}) {
  if (isWireframe) return false;
  if (dashboardProbe) return true;
  const screen = normalizeScreen(citeScreen) || shellHintFromJobs(citeJobs);
  const kind = normalizeScreen(citeKind);
  return isDashboardScreen(screen) || isDashboardScreen(kind);
}

/**
 * page.evaluate body — collect summary cards, focal regions, and opted-in KPI attrs.
 * @returns {object}
 */
export function evaluateKpiFloor() {
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
  const hasMetricNumber = (el) => {
    const text = (el.innerText || "").replace(/\s+/g, " ").trim();
    // Currency / compact / plain counts — enough to distinguish a KPI from a nav link.
    return /(?:[$€£¥]|[±+\-]?\d[\d,]*(?:\.\d+)?\s*(?:%|[KkMmBb]|x|X)?)/.test(text);
  };

  const dashboardProbe =
    document.documentElement.getAttribute("data-shine-probe") === "dashboard" ||
    document.body?.getAttribute("data-shine-probe") === "dashboard";

  // Opted-in KPI markers — always audited for required attrs when present.
  const marked = [...document.querySelectorAll("[data-shine-kpi]")].filter(vis);
  const missingAttrs = [];
  for (const el of marked) {
    const missing = [];
    for (const attr of ["data-unit", "data-baseline"]) {
      if (!(el.getAttribute(attr) || "").trim()) missing.push(attr);
    }
    if (missing.length) {
      missingAttrs.push({ sel: nameOf(el), missing, text: (el.innerText || "").trim().slice(0, 40) });
    }
  }

  // Summary-card candidates for equal-weight detection.
  const candidateSet = new Set();
  for (const el of marked) candidateSet.add(el);

  const regionRoots = [
    ...document.querySelectorAll(
      "[data-summary],[data-region*='summary' i],[data-region*='kpi' i],[aria-label*='metric' i],[aria-label*='kpi' i],.metrics,.kpi-row,[data-product-pattern='dashboard-page'] dl",
    ),
  ].filter(vis);

  for (const root of regionRoots) {
    const kids = [...root.children].filter(vis);
    for (const kid of kids) {
      if (hasMetricNumber(kid) || kid.hasAttribute("data-shine-kpi") || kid.hasAttribute("data-metric")) {
        candidateSet.add(kid);
      }
    }
  }

  // Heuristic: flex/grid rows of ≥3 similar siblings that each look like a metric card.
  const containers = [
    ...document.querySelectorAll("main section, main div, [role='main'] section, [role='main'] div, article"),
  ].filter(vis);
  for (const container of containers) {
    const cs = getComputedStyle(container);
    const display = cs.display || "";
    if (!/grid|flex/.test(display)) continue;
    const kids = [...container.children].filter(vis);
    if (kids.length < 3) continue;
    const metricKids = kids.filter(
      (k) =>
        hasMetricNumber(k) &&
        areaOf(k) >= 80 * 60 &&
        !k.closest("nav,aside,header,[role='navigation'],table,[role='grid']"),
    );
    if (metricKids.length >= 3) {
      for (const k of metricKids) candidateSet.add(k);
    }
  }

  const cards = [...candidateSet]
    .filter((el) => vis(el) && !el.closest("nav,aside,[role='navigation']"))
    .map((el) => ({ sel: nameOf(el), area: +areaOf(el).toFixed(1), marked: el.hasAttribute("data-shine-kpi") }))
    .filter((c) => c.area > 0);

  // Cluster equal-weight cards: sort by area, grow clusters where min/max ≥ equality ratio.
  const sorted = [...cards].sort((a, b) => b.area - a.area);
  let equalWeightCount = 0;
  let equalWeightMaxArea = 0;
  if (sorted.length >= 3) {
    for (let i = 0; i < sorted.length; i++) {
      const seed = sorted[i].area;
      if (seed <= 0) continue;
      const cluster = sorted.filter(
        (c) => c.area >= seed * 0.78 && c.area <= seed / 0.78,
      );
      if (cluster.length > equalWeightCount) {
        equalWeightCount = cluster.length;
        equalWeightMaxArea = Math.max(...cluster.map((c) => c.area));
      }
    }
  }

  // Focal region beyond the KPI row — marked focal, or a chart/table substantially larger.
  const focalMarked = [
    ...document.querySelectorAll(
      "[data-region='focal'],[data-focal],[data-shine-focal],[data-region*='chart' i],[data-region*='queue' i]",
    ),
  ].filter(vis);
  const chartLike = [
    ...document.querySelectorAll("svg,canvas,[data-chart],[role='img'][aria-label*='chart' i]"),
  ].filter((el) => {
    if (!vis(el)) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 180 && r.height >= 100;
  });
  const tableLike = [
    ...document.querySelectorAll("table,[role='grid'],[data-shine-datagrid]"),
  ].filter((el) => {
    if (!vis(el)) return false;
    // Skip layout tables
    const c = el.getAttribute("data-shine-contract") || el.getAttribute("data-contract") || "";
    if (c === "layout" || c === "presentation") return false;
    const role = el.getAttribute("role");
    if (role === "presentation" || role === "none") return false;
    const r = el.getBoundingClientRect();
    return r.width * r.height >= 120 * 80;
  });

  const focalCandidates = [...focalMarked, ...chartLike, ...tableLike];
  let focalMaxArea = 0;
  let focalSel = "";
  for (const el of focalCandidates) {
    // Don't treat a KPI sparkline svg inside a card as the page focal.
    if (el.closest("[data-shine-kpi],[data-metric],[data-summary] > *")) continue;
    const a = areaOf(el);
    if (a > focalMaxArea) {
      focalMaxArea = a;
      focalSel = nameOf(el);
    }
  }

  const hasFocalBeyondCards =
    equalWeightMaxArea > 0
      ? focalMaxArea >= equalWeightMaxArea * 1.35
      : focalMaxArea > 0;

  return {
    dashboardProbe,
    cardCount: cards.length,
    equalWeightCount,
    equalWeightMaxArea: +equalWeightMaxArea.toFixed(1),
    hasFocalBeyondCards,
    focalMaxArea: +focalMaxArea.toFixed(1),
    focalSel,
    markedCount: marked.length,
    missingAttrs,
    cards: cards.slice(0, 12),
  };
}

/**
 * Turn evaluateKpiFloor result into measure failure strings.
 * @param {object} result
 * @param {{ dashboardGate?: boolean }} opts
 */
export function formatKpiFailures(result, { dashboardGate = false } = {}) {
  const failures = [];
  const r = result || {};

  // (b) Opt-in attribute — bites whenever present, independent of dashboard gate.
  for (const m of r.missingAttrs || []) {
    failures.push(
      `kpi: ${m.sel} opts into data-shine-kpi but lacks ${m.missing.join(" + ")} — ` +
        `unit and baseline markers are required (dashboards.md § metric card anatomy)`,
    );
  }

  // (a) Equal-weight summary cards as the page — dashboard cite/probe only.
  if (
    dashboardGate &&
    (r.equalWeightCount || 0) >= 3 &&
    !r.hasFocalBeyondCards
  ) {
    failures.push(
      `kpi: ${r.equalWeightCount} equal-weight summary cards with no focal region ` +
        `(largest card ~${Math.round(r.equalWeightMaxArea || 0)}px², focal ~${Math.round(r.focalMaxArea || 0)}px²) — ` +
        `a dashboard needs one primary chart/table/queue beyond the KPI row (dashboards.md § page architecture)`,
    );
  }

  return failures;
}

export function kpiFailureNotes(result, { dashboardGate = false } = {}) {
  const notes = [];
  const r = result || {};
  if (dashboardGate && (r.cardCount || 0) > 0) {
    notes.push(
      `kpi: ${r.cardCount} summary-card candidate(s), ${r.equalWeightCount} equal-weight` +
        (r.hasFocalBeyondCards ? `, focal ${r.focalSel || "region"}` : ", no focal beyond cards") +
        (r.markedCount ? `, ${r.markedCount} data-shine-kpi` : ", no data-shine-kpi (agent checklist)"),
    );
  } else if ((r.markedCount || 0) > 0) {
    notes.push(`kpi: ${r.markedCount} data-shine-kpi marker(s) (attr floor active)`);
  }
  return notes;
}
