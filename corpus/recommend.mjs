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
  siblingPrefsFor,
} from "../core/learn.mjs";
import {
  applySiblingToRecommendation,
  editionUsesSiblingMap,
  resolveEditionSibling,
} from "../core/edition-siblings.mjs";

/** Repo-relative shine-tables.json fixture for Operate records/worklist jobs. */
export const RECORDS_WORKLIST_TABLE_FIXTURE = "verify/fixtures/records-worklist/shine-tables.json";

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
    hints.push("restructure: set-focal data-region=focal on the primary worklist");
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
  const learnedBans = citeBansFor(screen).map(
    (b) => `anti-cite: ${b.citeId} (operate-demotion; ${b.failCategory}; ${b.ddrId})`,
  );
  const edition = String(constraints.edition || "").trim().toLowerCase();
  const learnedEdition = edition
    ? editionAntiCitesFor(edition, { category: screen }).map(
        (b) => `anti-cite: ${b.citeId} (edition:${b.edition}; ${b.failCategory}; ${b.ddrId})`,
      )
    : [];
  let rec = {
    primary,
    antiPatterns: [...antiPatterns, ...antiCites, ...learnedBans, ...learnedEdition].slice(0, 10),
    restructureHints: restructureHints(retrieval, primary, job),
    kitRecipe: KIT_RECIPE_BY_SCREEN[screen] || KIT_RECIPE_BY_SCREEN.default,
    confidence: confidenceFor(retrieval, primary),
    shortlist: retrieval.selected.map((c) => ({
      id: c.template.id,
      screen: c.template.screen,
      scope: c.template.scope || "page",
      score: c.score,
    })),
    gaps: retrieval.gaps || [],
    brief: retrieval.brief,
    productSibling: null,
    tableQuality: tableQualityForRecordsJob(job, { category: constraints.category, screen }),
  };
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
  if (!rec?.primary) return "recommendation: none — catalog gap";
  const action = (rec.restructureHints || [])[0]?.startsWith("restructure:")
    ? "restructure"
    : "repaint-ok";
  const table = rec.tableQuality?.fixture
    ? ` · tableQuality ${rec.tableQuality.kind}@${rec.tableQuality.fixture}`
    : "";
  return (
    `recommendation: ${rec.primary.id} (${rec.primary.screen}, ${action}, confidence ${rec.confidence}) — ` +
    `${rec.kitRecipe}${table}`
  );
}
