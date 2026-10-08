// Pattern recommender (cite v2 / art-direction) — expert-track P5.
// Emits a typed recommendation: primary page cite, anti-cites, restructure vs
// repaint hints, kit recipe, and confidence — not just a shortlist.
// Anti-pattern strings prefer knowledge/anti-patterns/*.json (S2).

import { retrieveDirections, operatePageIntent } from "./art-direction.mjs";
import { antiPatternBansForScreen } from "../knowledge/retrieve.mjs";
import {
  citeBansFor,
  commitSiblingLearnFromResolve,
  editionAntiCitesFor,
  enforceCiteBansOnRecommendation,
  siblingPrefsFor,
} from "../core/learn.mjs";
import {
  applySiblingToRecommendation,
  editionUsesSiblingMap,
  resolveEditionSibling,
} from "../core/edition-siblings.mjs";

/** Repo-relative shine-tables.json fixture for Operate records/worklist jobs. */
export const RECORDS_WORKLIST_TABLE_FIXTURE = "verify/fixtures/records-worklist/shine-tables.json";

/** Repo-relative D10 dual-grid XOR FAIL→PASS fixtures (queue peer worklists). */
export const DUAL_GRID_XOR_FIXTURES = Object.freeze({
  before: "verify/fixtures/denoise/queue-dual-grid-before.html",
  after: "verify/fixtures/denoise/queue-dual-grid-after.html",
  cropBefore: "verify/fixtures/denoise/receipts/queue-dual-grid-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-dual-grid-fold-crop.html",
  helper: "verify/restructure/xor-saved-view.mjs",
  cropPairId: "queue-dual-grid",
});

/** Repo-relative CTA pressure TSX AST FAIL→PASS fixtures (maxFilled=1). */
export const CTA_PRESSURE_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/queue-dual-cta.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/queue-dual-cta-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/queue-cta-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-cta-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "queue-cta-tsx",
  op: "cta-budget",
  maxFilled: 1,
});

/** Repo-relative KPI soup TSX AST FAIL→PASS fixtures (maxVisible=3). */
export const KPI_SOUP_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/queue-kpi-soup.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/queue-kpi-soup-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/queue-kpi-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-kpi-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "queue-kpi-tsx",
  op: "kpi-collapse",
  maxVisible: 3,
});

/** Repo-relative dual-focal ban TSX AST FAIL→PASS fixtures (XOR peer→chip). */
export const DUAL_FOCAL_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/queue-dual-grid.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/queue-dual-grid-ast.tsx",
  tsxAfter: "verify/fixtures/denoise/tsx/queue-dual-xor-after.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/queue-dual-grid-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-dual-grid-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "queue-dual-grid-tsx",
  op: "collapse-peer-grids",
  mode: "xor-saved-view",
});

/** Repo-relative worklist-first composition TSX AST FAIL→PASS fixtures (KPI chrome → after worklist). */
export const WORKLIST_FIRST_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/queue-kpi-chrome-first.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/queue-worklist-first-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/queue-worklist-first-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-worklist-first-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "queue-worklist-first-tsx",
  op: "worklist-first",
});

/** Repo-relative wrong-cite / rebind-cite TSX AST FAIL→PASS fixtures (queue stamp → settings). */
export const WRONG_CITE_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/settings-wrong-cite.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/settings-wrong-cite-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/sources-cite-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/sources-cite-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "sources-cite-tsx",
  op: "rebind-cite",
  from: "shadcn-queue",
  to: "shadcn-settings",
});

/** Repo-relative set-focal / NO-FOCAL TSX AST FAIL→PASS fixtures (equal Card soup → focal). */
export const SET_FOCAL_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/usul-no-focal.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/usul-no-focal-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/usul-focal-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/usul-focal-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "usul-focal-tsx",
  op: "set-focal",
  attr: "data-region",
  value: "focal",
});

/** Repo-relative pill-filter-stack TSX AST FAIL→PASS fixtures (maxVisible=3). */
export const PILL_FILTER_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/queue-pill-stack.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/queue-pill-stack-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/queue-pill-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-pill-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "queue-pill-tsx",
  op: "pill-collapse",
  maxVisible: 3,
});

/** Repo-relative competing-page-titles TSX AST FAIL→PASS fixtures (title-singular). */
export const PAGE_TITLE_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/queue-competing-titles.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/queue-competing-titles-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/queue-titles-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-titles-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "queue-titles-tsx",
  op: "title-singular",
});

/** Repo-relative dual-chrome-actions TSX AST FAIL→PASS fixtures (chrome-budget). */
export const CHROME_PRESSURE_AST_FIXTURES = Object.freeze({
  tsxBefore: "verify/fixtures/denoise/tsx/queue-chrome-actions.tsx",
  tsxAstHard: "verify/fixtures/denoise/tsx/queue-chrome-actions-ast.tsx",
  cropBefore: "verify/fixtures/denoise/receipts/queue-chrome-tsx-before-crop.html",
  cropAfter: "verify/fixtures/denoise/receipts/queue-chrome-tsx-after-crop.html",
  helper: "verify/restructure/apply-tsx.mjs",
  cropPairId: "queue-chrome-tsx",
  op: "chrome-budget",
  maxFilledChrome: 0,
});

/** Fallback prose when the JSON library is unavailable (tests may stub). */
const ANTI_BY_SCREEN_FALLBACK = {
  catalog: [
    "table/datagrid cite on a card catalog (Company Tools lesson)",
    "equal-weight Card soup without a focal search+list region",
    "competing filled Install/Export primaries",
  ],
  queue: [
    "chart atom as the page cite",
    "KPI soup replacing the triage grid",
    "marketing glow/gradient DNA on Operate chrome",
  ],
  settings: [
    "tabs that hide section names",
    "dual filled Save/Export primaries in main",
    "craft-only polish before the save job works",
  ],
  form: [
    "wizard cite for a single-page form-app",
    "aria-invalid without an accessible message",
    "placeholder-as-label",
  ],
  record: [
    "dashboard cite for a single record",
    "parallel DataGrid instead of the product owner",
    "empty decision region with no next action",
  ],
  dashboard: [
    "≥3 equal KPI cards with no focal chart/table",
    "chart atom forced when the job is a queue",
    "Welcome to your dashboard filler empty copy",
  ],
  "weekly-board": [
    "queue/datagrid cite that sorts a cadence out of order",
    "paginating a fixed agenda",
  ],
  approval: [
    "settings cite for an approval inbox",
    "competing Approve/Reject filled at equal weight without a primary path",
  ],
  default: [
    "chart atom as the Operate page cite",
    "marketing DNA (glow, display serif, purple gradient) on saas chrome",
    "paint before the primary job is reachable",
  ],
};

function antiPatternsForScreen(screen) {
  try {
    const fromLib = antiPatternBansForScreen(screen, { limit: 4 });
    if (fromLib.length) return fromLib;
  } catch {
    /* fall through */
  }
  return ANTI_BY_SCREEN_FALLBACK[screen] || ANTI_BY_SCREEN_FALLBACK.default;
}

const KIT_RECIPE_BY_SCREEN = {
  catalog: "shadcn-catalog + search/filter contracts; product Company Tools sibling wins",
  queue: "shadcn-queue / DataGrid recipe; TanStack state; table-quality contracts",
  settings: "shadcn-settings (+ notifications/billing/members variants); contracts.md Form MUST",
  form: "shadcn-form / shadcn-form-invite; label + aria-invalid message heuristics",
  record: "shadcn-record / shadcn-record-account; product RecordDialog when owned",
  dashboard: "shadcn-dashboard-01 or dense Windmill/Flowbite; data-shine-kpi attrs",
  "weekly-board": "shadcn-weekly-board; do not force queue semantics",
  approval: "shadcn-queue with approval actions; one filled primary path",
  "app-shell": "shadcn sidebar recipe; density floor ≥28% content",
  default: "house shadcn page cite; kits.md decision table",
};

function screenOf(retrieval, job) {
  const primary = retrieval.selected[0]?.template;
  return (
    primary?.screen ||
    retrieval.brief?.operatePage ||
    operatePageIntent({ text: job }).screen ||
    "default"
  );
}

function confidenceFor(retrieval, primary) {
  if (!primary) return 0;
  const score = retrieval.selected[0]?.score ?? 0;
  const page = (primary.scope || "page") === "page";
  const operate = retrieval.brief?.operatePage;
  let c = 0.55;
  if (page) c += 0.2;
  if (operate && primary.screen === operate) c += 0.15;
  if (score >= 8) c += 0.05;
  if ((retrieval.gaps || []).length) c -= 0.05 * Math.min(3, retrieval.gaps.length);
  if (primary.screen === "charts") c = Math.min(c, 0.35);
  return Math.max(0.1, Math.min(0.98, +c.toFixed(2)));
}

function restructureHints(retrieval, primary, job) {
  const hints = [];
  const screen = primary?.screen || "";
  const intent = retrieval.brief?.operatePage || "";
  if (intent && screen && intent !== screen) {
    hints.push(`restructure: job intent is ${intent} but primary cite screen is ${screen} — change cite/category before paint`);
  }
  if (primary && (primary.scope || "page") !== "page") {
    hints.push("restructure: primary is not scope:page — promote a composed page cite before editing regions");
  }
  if (/catalog|company tools|card catalog/i.test(job) && screen === "queue") {
    hints.push("restructure: catalog job retrieved a queue/table cite — switch to catalog category");
  }
  if (/queue|triage|inbox/i.test(job) && screen === "charts") {
    hints.push("restructure: queue job retrieved a chart atom — demote charts; pick a page cite");
  }
  // N10 — cite v2 restructureHints[] emit concrete ops when Operate triage language is present.
  const triageJob = /queue|triage|inbox|pursue|worklist|decide|dismiss|notice/i.test(job);
  if (triageJob || screen === "queue" || intent === "queue") {
    hints.push("restructure: cta-budget maxFilled=1 (prefer job verb; demote peer filled)");
    hints.push("restructure: collapse-peer-grids xor-saved-view when dual worklists share the route");
    hints.push("restructure: kpi-collapse maxVisible=3 when ≥4 equal metrics compete with the work object");
    hints.push("restructure: pill-collapse maxVisible=3 when ≥5 above-fold filter pills crowd the decide path");
    hints.push("restructure: title-singular — one page title; demote peer h1 / page-title to kicker");
    hints.push("restructure: chrome-budget maxFilledChrome=0 — demote filled header/nav/aside peers to outline/ghost");
    hints.push("restructure: worklist-first — records/worklist before KPI chrome; stamp data-region=focal");
    hints.push("restructure: set-focal data-region=focal on the primary worklist");
  }
  if (
    /usul|card soup|equal cards?|composition[- ]?slop|no[- ]?focal|set[- ]?focal|focal region/i.test(job) &&
    !(triageJob || screen === "queue" || intent === "queue")
  ) {
    hints.push("restructure: set-focal data-region=focal on the primary work object");
  }
  if (/settings|sources|recipes|preferences/i.test(job) && screen === "queue") {
    hints.push("restructure: rebind-cite shadcn-queue → shadcn-settings (category honesty)");
  }
  if (/dashboard|cockpit|kpi/i.test(job) && /queue|triage|inbox|pursue/i.test(job)) {
    hints.push("restructure: dashboard→worklist — demote health/KPI chrome; cite shadcn-queue not dashboard-01");
  }
  if (!hints.length) {
    hints.push("repaint-ok: primary page cite matches Operate intent — fix named defects only; polish after usability");
  }
  // Denoise refuses paint while any restructure: hint remains and primaryTask is red.
  return hints;
}

/**
 * Table-quality fixture binding for Operate records / worklist jobs.
 * Denoise recommend must emit a concrete shine-tables.json path — not only prose.
 */
export function tableQualityForRecordsJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const text = String(job || "");
  const recordsJob =
    ["record", "datagrid", "queue", "worklist", "triage"].includes(category) ||
    ["record", "queue"].includes(screen) ||
    /\b(records?|worklist|inspect\s*→\s*edit|list\s*→\s*detail|datagrid|data grid)\b/i.test(text);
  if (!recordsJob) return null;
  const fullGrid = /\b(sort|pagination|column visibility|tanstack|datagrid|data grid)\b/i.test(text);
  return {
    contract: "shine-tables.json",
    fixture: RECORDS_WORKLIST_TABLE_FIXTURE,
    kind: fullGrid ? "records" : "worklist",
    reference: "skill/references/table-quality.md",
    pilotCompanion: "benchmark/records-pilot/shine-tables.json",
    instruction: fullGrid
      ? "Full DataGrid: write shine-tables.json with kind=records (shared source + required cases). Worklist fixture is the Operate list→detail starter."
      : "Operate list→detail: write shine-tables.json with kind=worklist (search, rowAction, loading, empty, filteredEmpty). Copy from recommendation.tableQuality.fixture; full kind=records stays on the product DataGrid owner.",
  };
}

/**
 * Dual-chrome-actions TSX AST fixture binding for Operate queue / shell jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx chrome-budget (maxFilledChrome=0).
 */
export function chromePressureAstForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const queueJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval", "catalog", "app-shell"].includes(
      category,
    ) ||
    ["queue", "approval", "catalog", "app-shell"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|chrome[- ]?budget|chrome[- ]?pressure|nav[- ]?chrome|dual[- ]?chrome)\b/i.test(
      text,
    );
  if (!queueJob) return null;
  return {
    mode: "tsx-ast",
    op: CHROME_PRESSURE_AST_FIXTURES.op,
    maxFilledChrome: CHROME_PRESSURE_AST_FIXTURES.maxFilledChrome,
    demotePolicy: "outline",
    scope: "chrome",
    fixtureTsx: CHROME_PRESSURE_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: CHROME_PRESSURE_AST_FIXTURES.tsxAstHard,
    cropBefore: CHROME_PRESSURE_AST_FIXTURES.cropBefore,
    cropAfter: CHROME_PRESSURE_AST_FIXTURES.cropAfter,
    cropPairId: CHROME_PRESSURE_AST_FIXTURES.cropPairId,
    helper: CHROME_PRESSURE_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "Filled Export/New/Save peers in header/nav/aside chrome: apply verify/restructure/apply-tsx.mjs chrome-budget (TypeScript AST, maxFilledChrome=0; demote chrome Buttons to outline). Leaves the main job verb filled. Handles variant=\"default\", variant={\"default\"}, and missing variant inside chrome hosts. Copy FAIL→PASS crop paths from recommendation.chromePressureAst.cropBefore/cropAfter; prove chrome-pressure clears with 0 filled chrome treatments.",
  };
}

/**
 * Pill-filter-stack TSX AST fixture binding for Operate queue / triage jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx pill-collapse (maxVisible=3).
 */
export function pillFilterAstForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const queueJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval", "catalog"].includes(category) ||
    ["queue", "approval", "catalog"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|pill[- ]?filter|pill[- ]?collapse|filter[- ]?stack|chip spam)\b/i.test(
      text,
    );
  if (!queueJob) return null;
  return {
    mode: "tsx-ast",
    op: PILL_FILTER_AST_FIXTURES.op,
    maxVisible: PILL_FILTER_AST_FIXTURES.maxVisible,
    rest: "details",
    fixtureTsx: PILL_FILTER_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: PILL_FILTER_AST_FIXTURES.tsxAstHard,
    cropBefore: PILL_FILTER_AST_FIXTURES.cropBefore,
    cropAfter: PILL_FILTER_AST_FIXTURES.cropAfter,
    cropPairId: PILL_FILTER_AST_FIXTURES.cropPairId,
    helper: PILL_FILTER_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "Above-fold pill/chip filter encyclopedia in consumer TSX: apply verify/restructure/apply-tsx.mjs pill-collapse (TypeScript AST, maxVisible=3; park rest in <details data-shine-pill-rest>). Handles className=\"pill\", className={\"pill\"}, data-shine-filter-pill, and Badge pills. Copy FAIL→PASS crop paths from recommendation.pillFilterAst.cropBefore/cropAfter; prove pill-filter clears with ≤3 visible chips.",
  };
}

/**
 * Competing page-titles TSX AST fixture binding for Operate jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx title-singular.
 */
export function pageTitleAstForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const operateJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval", "settings", "form", "catalog"].includes(
      category,
    ) ||
    ["queue", "approval", "settings", "form", "catalog"].includes(screen) ||
    intent === "queue" ||
    intent === "settings" ||
    /\b(queue|triage|inbox|settings|title[- ]?singular|competing[- ]?title|page[- ]?title|dual[- ]?h1)\b/i.test(
      text,
    );
  if (!operateJob) return null;
  return {
    mode: "tsx-ast",
    op: PAGE_TITLE_AST_FIXTURES.op,
    demote: "kicker",
    fixtureTsx: PAGE_TITLE_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: PAGE_TITLE_AST_FIXTURES.tsxAstHard,
    cropBefore: PAGE_TITLE_AST_FIXTURES.cropBefore,
    cropAfter: PAGE_TITLE_AST_FIXTURES.cropAfter,
    cropPairId: PAGE_TITLE_AST_FIXTURES.cropPairId,
    helper: PAGE_TITLE_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "Competing page titles in consumer TSX: apply verify/restructure/apply-tsx.mjs title-singular (TypeScript AST; keep one h1 / data-page-title; demote peers to <p className=\"kicker\" data-shine-title-demoted>). Handles h1, data-page-title={\"…\"}, and className={\"page-title\"}. Copy FAIL→PASS crop paths from recommendation.pageTitleAst.cropBefore/cropAfter; prove page-title clears with exactly one title.",
  };
}

/**
 * KPI soup TSX AST fixture binding for Operate queue / triage jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx kpi-collapse (maxVisible=3) — not only the prose restructure hint.
 */
export function kpiSoupAstForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const queueJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval"].includes(category) ||
    ["queue", "approval"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|kpi[- ]?soup|kpi[- ]?collapse|metric soup|equal metrics?)\b/i.test(
      text,
    );
  if (!queueJob) return null;
  return {
    mode: "tsx-ast",
    op: KPI_SOUP_AST_FIXTURES.op,
    maxVisible: KPI_SOUP_AST_FIXTURES.maxVisible,
    rest: "details",
    fixtureTsx: KPI_SOUP_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: KPI_SOUP_AST_FIXTURES.tsxAstHard,
    cropBefore: KPI_SOUP_AST_FIXTURES.cropBefore,
    cropAfter: KPI_SOUP_AST_FIXTURES.cropAfter,
    cropPairId: KPI_SOUP_AST_FIXTURES.cropPairId,
    helper: KPI_SOUP_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "KPI encyclopedia on a decide path in consumer TSX: apply verify/restructure/apply-tsx.mjs kpi-collapse (TypeScript AST, maxVisible=3; park rest in <details data-shine-kpi-rest>). Handles className=\"metric\", className={\"metric\"}, and data-shine-kpi / data-kpi markers. Copy FAIL→PASS crop paths from recommendation.kpiSoupAst.cropBefore/cropAfter; prove kpi-soup clears with ≤3 visible tiles.",
  };
}

/**
 * CTA pressure TSX AST fixture binding for Operate queue / triage jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx cta-budget (maxFilled=1) — not only the prose restructure hint.
 */
export function ctaPressureAstForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const queueJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval"].includes(category) ||
    ["queue", "approval"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|cta[- ]?budget|cta[- ]?pressure|filled primar|competing cta)\b/i.test(
      text,
    );
  if (!queueJob) return null;
  return {
    mode: "tsx-ast",
    op: CTA_PRESSURE_AST_FIXTURES.op,
    maxFilled: CTA_PRESSURE_AST_FIXTURES.maxFilled,
    preferLabels: ["Pursue"],
    demotePolicy: "outline",
    fixtureTsx: CTA_PRESSURE_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: CTA_PRESSURE_AST_FIXTURES.tsxAstHard,
    cropBefore: CTA_PRESSURE_AST_FIXTURES.cropBefore,
    cropAfter: CTA_PRESSURE_AST_FIXTURES.cropAfter,
    cropPairId: CTA_PRESSURE_AST_FIXTURES.cropPairId,
    helper: CTA_PRESSURE_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "Competing filled Button primaries in consumer TSX: apply verify/restructure/apply-tsx.mjs cta-budget (TypeScript AST, maxFilled=1; prefer job verb; demote peers to outline). Handles variant=\"default\", variant={\"default\"}, and missing variant. Copy FAIL→PASS crop paths from recommendation.ctaPressureAst.cropBefore/cropAfter; prove cta-pressure clears with exactly one filled primary.",
  };
}

/**
 * Wrong-cite / rebind-cite TSX AST fixture binding for Operate settings / sources / form jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx rebind-cite (category honesty) — and refuse paint while the stamp is wrong.
 * Also attaches when cite-ban fail-close refuses a banned primary (recommend refuse path).
 */
export function wrongCiteAstForSettingsJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const forceRefuse = Boolean(constraints.citeBanRefuse || constraints.forceWrongCiteAst);
  const settingsJob =
    forceRefuse ||
    ["settings", "form", "sources", "preferences"].includes(category) ||
    ["settings", "form"].includes(screen) ||
    intent === "settings" ||
    /\b(settings|sources|recipes|preferences|account|rebind[- ]?cite|wrong[- ]?cite|cite[- ]?honesty|category[- ]?honesty)\b/i.test(
      text,
    );
  if (!settingsJob) return null;
  return {
    mode: "tsx-ast",
    op: WRONG_CITE_AST_FIXTURES.op,
    from: WRONG_CITE_AST_FIXTURES.from,
    to: WRONG_CITE_AST_FIXTURES.to,
    refusePaintUntilRebound: true,
    fixtureTsx: WRONG_CITE_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: WRONG_CITE_AST_FIXTURES.tsxAstHard,
    cropBefore: WRONG_CITE_AST_FIXTURES.cropBefore,
    cropAfter: WRONG_CITE_AST_FIXTURES.cropAfter,
    cropPairId: WRONG_CITE_AST_FIXTURES.cropPairId,
    helper: WRONG_CITE_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "Wrong category stamp on a settings/sources job in consumer TSX: refuse paint until rebound. Apply verify/restructure/apply-tsx.mjs rebind-cite (TypeScript AST; from shadcn-queue → to shadcn-settings). Handles data-cite=\"…\", data-cite={\"…\"}, dataCite=\"…\", and dataCite={\"…\"}. Copy FAIL→PASS crop paths from recommendation.wrongCiteAst.cropBefore/cropAfter; prove cite-honesty clears with category-truth stamp. Learned cite-ban fail-close also binds this fixture on refuse.",
  };
}

/**
 * set-focal / NO-FOCAL TSX AST fixture binding for Operate composition jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx set-focal (stamp data-region=focal on primary work object) — not only prose.
 */
export function setFocalAstForCompositionJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  // Settings/form stay on wrong-cite path — do not bind Usul focal fixture.
  if (["settings", "form", "sources", "preferences"].includes(category)) return null;
  const compositionJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval", "record", "records", "dashboard"].includes(
      category,
    ) ||
    ["queue", "approval", "record", "dashboard"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|records?|usul|set[- ]?focal|no[- ]?focal|composition[- ]?slop|card soup|equal cards?|focal region|data-region)\b/i.test(
      text,
    );
  if (!compositionJob) return null;
  return {
    mode: "tsx-ast",
    op: SET_FOCAL_AST_FIXTURES.op,
    attr: SET_FOCAL_AST_FIXTURES.attr,
    value: SET_FOCAL_AST_FIXTURES.value,
    on: "primary-work-object",
    fixtureTsx: SET_FOCAL_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: SET_FOCAL_AST_FIXTURES.tsxAstHard,
    cropBefore: SET_FOCAL_AST_FIXTURES.cropBefore,
    cropAfter: SET_FOCAL_AST_FIXTURES.cropAfter,
    cropPairId: SET_FOCAL_AST_FIXTURES.cropPairId,
    helper: SET_FOCAL_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "Equal Card / worklist roots with no data-region=focal in consumer TSX: apply verify/restructure/apply-tsx.mjs set-focal (TypeScript AST; stamp data-region=\"focal\" on the primary work object). Prefers DataGrid / role=\"grid\" / {\"grid\"} / data-shine-records / data-product-pattern queue|worklist|records / className grid-wrap; else first Card / className=\"card\" / {\"card\"}. Copy FAIL→PASS crop paths from recommendation.setFocalAst.cropBefore/cropAfter; prove composition-slop clears with one focal.",
  };
}

/**
 * Worklist-first composition TSX AST fixture binding for Operate queue / records jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx worklist-first (records/worklist before KPI chrome) — not only prose.
 */
export function worklistFirstAstForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const queueJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval", "record", "records"].includes(
      category,
    ) ||
    ["queue", "approval", "record"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|records?|kpi[- ]?chrome|worklist[- ]?first|composition[- ]?slop|dashboard chrome)\b/i.test(
      text,
    );
  if (!queueJob) return null;
  return {
    mode: "tsx-ast",
    op: WORKLIST_FIRST_AST_FIXTURES.op,
    attr: "data-region",
    value: "focal",
    on: "primary-worklist",
    fixtureTsx: WORKLIST_FIRST_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: WORKLIST_FIRST_AST_FIXTURES.tsxAstHard,
    cropBefore: WORKLIST_FIRST_AST_FIXTURES.cropBefore,
    cropAfter: WORKLIST_FIRST_AST_FIXTURES.cropAfter,
    cropPairId: WORKLIST_FIRST_AST_FIXTURES.cropPairId,
    helper: WORKLIST_FIRST_AST_FIXTURES.helper,
    reference: "skill/references/kits.md#worklist-first-operate-triage--n9",
    instruction:
      "KPI/dashboard chrome ahead of the Monday work object in consumer TSX: apply verify/restructure/apply-tsx.mjs worklist-first (TypeScript AST; reorder records/worklist before KPI chrome; stamp data-region=\"focal\"). Handles className=\"metrics\" / {\"metrics\"}, data-sled-kpis, className=\"grid-wrap\" / {\"grid-wrap\"}, role=\"grid\" / {\"grid\"}, data-shine-records, and data-product-pattern queue/worklist/records. Dynamic .map siblings stay plan-only. Copy FAIL→PASS crop paths from recommendation.worklistFirstAst.cropBefore/cropAfter; prove composition with worklist focal first.",
  };
}

/**
 * Dual-focal ban TSX AST fixture binding for Operate queue / triage jobs.
 * Denoise recommend must emit concrete TSX + FAIL→PASS crop paths for
 * apply-tsx collapse-peer-grids (XOR peer→chip) — not only the prose hint.
 */
export function dualFocalAstForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const queueJob =
    ["queue", "triage", "inbox", "worklist", "datagrid", "approval"].includes(category) ||
    ["queue", "approval"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|dual[- ]?grid|dual[- ]?focal|collapse[- ]?peer|xor[- ]?saved[- ]?view|peer grids?)\b/i.test(
      text,
    );
  if (!queueJob) return null;
  return {
    mode: "tsx-ast",
    op: DUAL_FOCAL_AST_FIXTURES.op,
    xorMode: DUAL_FOCAL_AST_FIXTURES.mode,
    keepTitleIncludes: ["Queue"],
    foldTitleIncludes: ["David"],
    fixtureTsx: DUAL_FOCAL_AST_FIXTURES.tsxBefore,
    fixtureTsxAst: DUAL_FOCAL_AST_FIXTURES.tsxAstHard,
    fixtureTsxAfter: DUAL_FOCAL_AST_FIXTURES.tsxAfter,
    cropBefore: DUAL_FOCAL_AST_FIXTURES.cropBefore,
    cropAfter: DUAL_FOCAL_AST_FIXTURES.cropAfter,
    cropPairId: DUAL_FOCAL_AST_FIXTURES.cropPairId,
    helper: DUAL_FOCAL_AST_FIXTURES.helper,
    reference: "skill/references/denoise.md",
    instruction:
      "Dual peer worklists in consumer TSX: apply verify/restructure/apply-tsx.mjs collapse-peer-grids (TypeScript AST, mode xor-saved-view; peer title → data-shine-xor-views chip + one shared DataGrid). Handles className=\"grid-wrap\", className={\"grid-wrap\"}, role=\"grid\" / role={\"grid\"}, and data-grid-title markers. Never silent-deletes without XOR chips; dynamic .map peers stay plan-only. Copy FAIL→PASS crop paths from recommendation.dualFocalAst.cropBefore/cropAfter; prove dual-focal clears with exactly one grid.",
  };
}

/**
 * D10 XOR dual-grid fixture binding for Operate queue / triage jobs.
 * Denoise recommend must emit concrete before/after + FAIL→PASS crop paths —
 * not only the prose `collapse-peer-grids xor-saved-view` hint.
 */
export function xorSavedViewForQueueJob(job, constraints = {}) {
  const category = String(constraints.category || "").toLowerCase();
  const screen = String(constraints.screen || "").toLowerCase();
  const intent = String(constraints.intent || "").toLowerCase();
  const text = String(job || "");
  const queueJob =
    ["queue", "triage", "inbox", "worklist", "datagrid"].includes(category) ||
    ["queue"].includes(screen) ||
    intent === "queue" ||
    /\b(queue|triage|inbox|pursue|worklist|dual[- ]?grid|dual[- ]?focal|xor[- ]?saved[- ]?view|peer grids?)\b/i.test(
      text,
    );
  if (!queueJob) return null;
  return {
    mode: "xor-saved-view",
    op: "collapse-peer-grids",
    keepTitleIncludes: ["Queue"],
    foldTitleIncludes: ["David"],
    fixtureBefore: DUAL_GRID_XOR_FIXTURES.before,
    fixtureAfter: DUAL_GRID_XOR_FIXTURES.after,
    cropBefore: DUAL_GRID_XOR_FIXTURES.cropBefore,
    cropAfter: DUAL_GRID_XOR_FIXTURES.cropAfter,
    cropPairId: DUAL_GRID_XOR_FIXTURES.cropPairId,
    helper: DUAL_GRID_XOR_FIXTURES.helper,
    reference: "skill/references/kits.md#dual-grid-xor-d10--agent-assisted-close",
    instruction:
      "Dual peer worklists on one route: plan collapse-peer-grids (mode xor-saved-view), then apply verify/restructure/xor-saved-view.mjs (humanGate — never silent delete in apply-dom/tsx). Copy FAIL→PASS crop paths from recommendation.xorSavedView.cropBefore/cropAfter; prove dual-focal clears with one shared DataGrid + filter chip.",
  };
}

/**
 * @param {object[]} templates
 * @param {string} job
 * @param {object} [constraints]
 * @returns {{ primary: object, antiPatterns: string[], restructureHints: string[], kitRecipe: string, confidence: number, shortlist: object[], gaps: string[] }}
 */
export function recommendPattern(templates, job, constraints = {}) {
  const retrieval = retrieveDirections(templates, job, { limit: constraints.limit || 6, ...constraints });
  const primaryCandidate = retrieval.selected[0] || null;
  const primary = primaryCandidate
    ? {
        id: primaryCandidate.template.id,
        screen: primaryCandidate.template.screen,
        scope: primaryCandidate.template.scope || "page",
        title: primaryCandidate.template.title,
        kit: primaryCandidate.template.kit,
        score: primaryCandidate.score,
        matches: primaryCandidate.matches || [],
      }
    : null;
  const screen = screenOf(retrieval, job);
  const antiPatterns = antiPatternsForScreen(screen);
  // Also surface excluded chart atoms as anti-cites when Operate intent is set.
  const antiCites = (retrieval.exclusions || [])
    .filter((e) => e.template?.screen === "charts")
    .slice(0, 3)
    .map((e) => `anti-cite: ${e.template.id} (${(e.reasons || []).join("; ") || "excluded"})`);
  // Learned Operate demotions + edition anti-cites (doctor-gated prove-fail commits).
  const learnOpts = {
    storePath: constraints.learnStorePath,
    store: constraints.learnStore,
  };
  const banCategory = constraints.category || screen;
  const learnedBans = citeBansFor(banCategory, learnOpts).map(
    (b) => `anti-cite: ${b.citeId} (operate-demotion; ${b.failCategory}; ${b.ddrId})`,
  );
  const edition = String(constraints.edition || "").trim().toLowerCase();
  const learnedEdition = edition
    ? editionAntiCitesFor(edition, { category: banCategory, ...learnOpts }).map(
        (b) => `anti-cite: ${b.citeId} (edition:${b.edition}; ${b.failCategory}; ${b.ddrId})`,
      )
    : [];
  const shortlist = retrieval.selected.map((c) => ({
    id: c.template.id,
    screen: c.template.screen,
    scope: c.template.scope || "page",
    score: c.score,
    title: c.template.title,
    kit: c.template.kit,
    matches: c.matches || [],
  }));
  let rec = {
    primary,
    antiPatterns: [...antiPatterns, ...antiCites, ...learnedBans, ...learnedEdition].slice(0, 10),
    restructureHints: restructureHints(retrieval, primary, job),
    kitRecipe: KIT_RECIPE_BY_SCREEN[screen] || KIT_RECIPE_BY_SCREEN.default,
    confidence: confidenceFor(retrieval, primary),
    shortlist,
    gaps: retrieval.gaps || [],
    brief: retrieval.brief,
    productSibling: null,
    tableQuality: tableQualityForRecordsJob(job, { category: constraints.category, screen }),
    ctaPressureAst: ctaPressureAstForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    kpiSoupAst: kpiSoupAstForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    pillFilterAst: pillFilterAstForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    pageTitleAst: pageTitleAstForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    chromePressureAst: chromePressureAstForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    dualFocalAst: dualFocalAstForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    worklistFirstAst: worklistFirstAstForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    setFocalAst: setFocalAstForCompositionJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    wrongCiteAst: wrongCiteAstForSettingsJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    xorSavedView: xorSavedViewForQueueJob(job, {
      category: constraints.category,
      screen,
      intent: retrieval.brief?.operatePage || "",
    }),
    citeBanFailClosed: null,
  };
  // Wrong-cite episodic bans persist → fail-close recommend when primary is banned.
  const enforced = enforceCiteBansOnRecommendation(rec, {
    category: banCategory,
    screen,
    edition,
    shortlist,
    ...learnOpts,
  });
  rec = enforced.recommendation;
  if (enforced.citeBanFailClosed) {
    // Recommend refuse path: bind wrong-cite AST fixtures even when primary is null
    // (no non-banned alt) so Actor has the rebind-cite FAIL→PASS crop recipe.
    if (!rec.wrongCiteAst) {
      rec.wrongCiteAst = wrongCiteAstForSettingsJob(job, {
        category: constraints.category || banCategory,
        screen: rec.primary?.screen || screen,
        intent: retrieval.brief?.operatePage || "",
        citeBanRefuse: true,
      });
    }
    if (rec.primary) {
      rec.kitRecipe =
        KIT_RECIPE_BY_SCREEN[rec.primary.screen] || rec.kitRecipe || KIT_RECIPE_BY_SCREEN.default;
      rec.restructureHints = restructureHints(
        retrieval,
        {
          id: rec.primary.id,
          screen: rec.primary.screen,
          score: rec.primary.score,
        },
        job,
      );
    }
    if (!rec.restructureHints.some((h) => /rebind-cite/i.test(String(h)))) {
      rec.restructureHints = ["restructure:rebind-cite", ...rec.restructureHints];
    }
  }
  // Enterprise §4 — edition sibling map: product sibling first → kit → cite.
  // Opt-in via edition=clearspeed|clearspeed-operate (design-packet saas passes this).
  // Learned siblingPrefs boost proven mappings on the next packet.
  if (editionUsesSiblingMap(edition)) {
    const editionId = edition === "clearspeed" ? "clearspeed-operate" : edition;
    const category = constraints.category || screen;
    const learnedHits = siblingPrefsFor(category, {
      edition: editionId,
      job,
      storePath: constraints.learnStorePath,
      store: constraints.learnStore,
    });
    const learnedPrefs = learnedHits.map((h) => h.pref);
    const resolved = resolveEditionSibling({
      category,
      screen,
      job,
      editionId,
      learnedPrefs,
    });
    rec = applySiblingToRecommendation(rec, resolved, { templates });
    if (resolved.learnedPrefer) {
      rec.learnedSiblingPrefer = {
        siblingId: resolved.learnedPrefer.siblingId,
        preferredCite: resolved.learnedPrefer.preferredCite,
        ddrId: resolved.learnedPrefer.ddrId,
        reason: resolved.reason,
      };
    }
    // Persist episodic sibling prefer when cite/kit resolved via edition siblings
    // (doctor-gated; next packet resolve boosts this mapping).
    if (
      constraints.doctorBiteOk &&
      constraints.ddrId &&
      resolved?.sibling &&
      resolved.preferredCite &&
      resolved.kitRecipe
    ) {
      try {
        rec.siblingLearn = commitSiblingLearnFromResolve({
          storePath: constraints.learnStorePath,
          store: constraints.learnStore,
          doctorBiteOk: true,
          ddrId: constraints.ddrId,
          edition: editionId,
          category,
          job,
          resolved,
        });
      } catch (error) {
        rec.siblingLearnError = error.message;
      }
    }
  }
  return rec;
}

export function formatRecommendationSummary(rec) {
  const wrongCite = rec?.wrongCiteAst?.fixtureTsx
    ? ` · wrongCiteAst ${rec.wrongCiteAst.mode}@${rec.wrongCiteAst.cropPairId}`
    : "";
  if (!rec?.primary) {
    if (rec?.citeBanFailClosed?.failClosed) {
      return (
        `recommendation: none — cite-ban fail-closed (${rec.citeBanFailClosed.bannedCite})` +
        wrongCite
      );
    }
    return "recommendation: none — catalog gap";
  }
  const action = (rec.restructureHints || [])[0]?.startsWith("restructure:")
    ? "restructure"
    : "repaint-ok";
  const table = rec.tableQuality?.fixture
    ? ` · tableQuality ${rec.tableQuality.kind}@${rec.tableQuality.fixture}`
    : "";
  const cta = rec.ctaPressureAst?.fixtureTsx
    ? ` · ctaPressureAst ${rec.ctaPressureAst.mode}@${rec.ctaPressureAst.cropPairId}`
    : "";
  const kpi = rec.kpiSoupAst?.fixtureTsx
    ? ` · kpiSoupAst ${rec.kpiSoupAst.mode}@${rec.kpiSoupAst.cropPairId}`
    : "";
  const pill = rec.pillFilterAst?.fixtureTsx
    ? ` · pillFilterAst ${rec.pillFilterAst.mode}@${rec.pillFilterAst.cropPairId}`
    : "";
  const pageTitle = rec.pageTitleAst?.fixtureTsx
    ? ` · pageTitleAst ${rec.pageTitleAst.mode}@${rec.pageTitleAst.cropPairId}`
    : "";
  const chrome = rec.chromePressureAst?.fixtureTsx
    ? ` · chromePressureAst ${rec.chromePressureAst.mode}@${rec.chromePressureAst.cropPairId}`
    : "";
  const dual = rec.dualFocalAst?.fixtureTsx
    ? ` · dualFocalAst ${rec.dualFocalAst.mode}@${rec.dualFocalAst.cropPairId}`
    : "";
  const worklist = rec.worklistFirstAst?.fixtureTsx
    ? ` · worklistFirstAst ${rec.worklistFirstAst.mode}@${rec.worklistFirstAst.cropPairId}`
    : "";
  const setFocal = rec.setFocalAst?.fixtureTsx
    ? ` · setFocalAst ${rec.setFocalAst.mode}@${rec.setFocalAst.cropPairId}`
    : "";
  const xor = rec.xorSavedView?.fixtureBefore
    ? ` · xorSavedView ${rec.xorSavedView.mode}@${rec.xorSavedView.cropPairId}`
    : "";
  const ban = rec.citeBanFailClosed?.failClosed
    ? ` · cite-ban demote ${rec.citeBanFailClosed.bannedCite}→${rec.primary.id}`
    : "";
  return (
    `recommendation: ${rec.primary.id} (${rec.primary.screen}, ${action}, confidence ${rec.confidence}) — ` +
    `${rec.kitRecipe}${table}${cta}${kpi}${pill}${pageTitle}${chrome}${dual}${worklist}${setFocal}${wrongCite}${xor}${ban}`
  );
}
