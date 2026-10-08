/**
 * shine-restructure/v1 — typed ops emitted by diagnose / cite recommender.
 */

export const RESTRUCTURE_SCHEMA = "shine-restructure/v1";

export const AUTO_SAFE_DOM_OPS = Object.freeze([
  "cta-budget",
  "kpi-collapse",
  "pill-collapse",
  "title-singular",
  "chrome-budget",
  "filter-clearable",
  "strip-marketing-dna",
  "rewrite-filler-empty",
  "collapse-card-soup",
  "split-empty-triad",
  "stamp-chart-units",
  "bind-product-owner",
  "set-focal",
  "worklist-first",
  "rebind-cite",
]);

export const PLAN_ONLY_OPS = Object.freeze(["collapse-peer-grids", "god-split"]);

export const ALL_OPS = Object.freeze([...AUTO_SAFE_DOM_OPS, ...PLAN_ONLY_OPS]);

/**
 * @param {object} plan
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateRestructurePlan(plan) {
  const errors = [];
  if (!plan || typeof plan !== "object") return { ok: false, errors: ["plan missing"] };
  if (plan.$schema !== RESTRUCTURE_SCHEMA) {
    errors.push(`$schema must be ${RESTRUCTURE_SCHEMA}`);
  }
  if (!plan.job || typeof plan.job !== "string") errors.push("job required");
  if (!plan.category || typeof plan.category !== "string") errors.push("category required");
  if (!plan.cite || typeof plan.cite.primary !== "string") errors.push("cite.primary required");
  if (!Array.isArray(plan.ops)) errors.push("ops[] required");
  else {
    for (const [i, op] of plan.ops.entries()) {
      if (!op?.op || !ALL_OPS.includes(op.op)) {
        errors.push(`ops[${i}].op unknown: ${op?.op}`);
      }
    }
  }
  if (!plan.acceptance || typeof plan.acceptance !== "object") {
    errors.push("acceptance required");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Build a minimal valid plan from diagnosis-ish inputs.
 */
export function buildRestructurePlan({
  job,
  category = "queue",
  lane = "saas",
  citePrimary = "shadcn-queue",
  antiCites = ["shadcn-dashboard-01"],
  ops = [],
  measureMustClear = [],
  usabilityFlow = "",
  confidence = 0.7,
  humanGate = false,
} = {}) {
  const plan = {
    $schema: RESTRUCTURE_SCHEMA,
    job,
    category,
    lane,
    cite: {
      primary: citePrimary,
      antiCites,
      productPattern: category === "queue" ? "sled-capture" : null,
    },
    regions: {
      focal: { role: "worklist", selectorHint: "[data-shine-main] [role=grid], main [role=grid]" },
      demote: ["health-dashboard", "kpi-strip", "peer-grid"],
    },
    ops: ops.length
      ? ops
      : [
          { op: "cta-budget", scope: "main", maxFilled: 1, preferLabels: ["Pursue"], demotePolicy: "outline" },
          { op: "kpi-collapse", maxVisible: 3, rest: "details", selector: ".metrics .metric, [data-shine-kpi]" },
          { op: "pill-collapse", maxVisible: 3, rest: "details", selector: "[data-shine-filter-stack] .pill, [data-shine-filter-pill]" },
          { op: "title-singular", on: "primary-title", demote: "kicker" },
          { op: "chrome-budget", maxFilledChrome: 0, demotePolicy: "ghost", scope: "chrome" },
          { op: "filter-clearable", perChip: true, clearAll: true },
          { op: "strip-marketing-dna" },
          { op: "rewrite-filler-empty" },
          { op: "collapse-card-soup", maxVisible: 1 },
          { op: "split-empty-triad" },
          { op: "stamp-chart-units" },
          { op: "bind-product-owner" },
          { op: "worklist-first", attr: "data-region", value: "focal", on: "primary-worklist" },
          { op: "set-focal", attr: "data-region", value: "focal", on: "primary-worklist" },
        ],
    acceptance: {
      measureMustClear: measureMustClear.length
        ? measureMustClear
        : ["cta-pressure", "dual-focal", "kpi-soup", "pill-filter", "page-title", "chrome-pressure", "filter-reversible", "marketing-dna", "filler-empty", "card-soup", "empty-triad", "decorative-chart", "parallel-owned", "composition-slop"],
      usabilityFlow: usabilityFlow || "flow:decide-notice",
      proveRequired: true,
    },
    confidence,
    humanGate: humanGate || ops.some((o) => PLAN_ONLY_OPS.includes(o.op)),
  };
  const v = validateRestructurePlan(plan);
  if (!v.ok) throw new Error(`invalid restructure plan: ${v.errors.join("; ")}`);
  return plan;
}
