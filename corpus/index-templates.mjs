#!/usr/bin/env node
// index-templates.mjs — write corpus/templates.json + skill/references/templates.md
// from on-disk corpus, owned/, and query-only/. A new clone that is not in this
// index is invisible to the agent. Run from acquire.sh after pins land.
//
// Rule: every row must earn its place, and every row must be DERIVED here rather
// than hand-written into templates.json. The file is generated; a row that exists
// only in the JSON is destroyed the next time anyone runs this script.
//
// V3 curated by hand because a wildcard index of 141 rows — 71 of them chart demos
// — drowned the composed pages anyone actually needed. That was a retrieval defect
// and it is now fixed at the retrieval layer: art-direction measures near-duplicate
// distance within a scope and draws page and component candidates from separate
// pools. So the shadcn expansion below indexes all 97 of the kit's blocks, by
// declared family rather than by wildcard, and reports anything it cannot classify.
// The doctor checks coverage of requiredScreenTypes.
//
//   node corpus/index-templates.mjs
//   DESIGN_CORPUS=/path node corpus/index-templates.mjs

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));

const REQUIRED = [
  "dashboard",
  "marketing",
  "auth",
  "checkout",
  "app-shell",
  "crud",
  "queue",
  "record",
  "chat",
  "settings",
  "wizard",
  "empty",
  "command-palette",
  "lex-record",
];

// Family only decides which voice sheet to import and which likeness checks apply.
// The adjectives V2 carried here (radius/chroma/elevation as words) transferred
// nothing — real values live in tokens/voices/<family>.css and the kit's own token
// sources in ~/design-corpus.
const KIT_FAMILY = {
  "shadcn-registry": { family: "shadcn-zinc", density: "comfortable" },
  "untitled-ui-react": { family: "untitled", density: "comfortable" },
  tremor: { family: "tremor", density: "comfortable" },
  heroui: { family: "heroui", density: "comfortable" },
  "chakra-ui": { family: "chakra", density: "comfortable" },
  mantine: { family: "mantine", density: "comfortable" },
  fluentui: { family: "fluent", density: "comfortable" },
  "react-spectrum": { family: "spectrum", density: "comfortable" },
  magicui: { family: "magicui", density: "editorial" },
  shine: { family: "shine", density: "dense" },
  slds: { family: "slds", density: "compact" },
};

const SCREEN_JOBS = {
  dashboard: ["dashboard"],
  marketing: ["marketing", "marketing-hero"],
  auth: ["auth", "login", "signin", "signup"],
  checkout: ["checkout"],
  "app-shell": ["app-shell", "shell", "nav", "sidebar"],
  crud: ["crud", "admin"],
  queue: ["queue", "inbox", "worklist", "list"],
  record: ["record", "detail", "profile"],
  chat: ["chat", "assistant"],
  settings: ["settings", "preferences", "account"],
  wizard: ["wizard", "steps", "onboarding"],
  "weekly-board": ["weekly-board", "board", "cadence", "report-out", "standup", "kanban"],
  "ai-generate": ["ai-generate", "prompt", "composer"],
  "marketing-hero": ["marketing-hero", "hero", "landing"],
  empty: ["empty", "empty-state", "zero"],
  blog: ["blog", "article"],
  charts: ["charts", "chart", "dataviz"],
  "command-palette": ["command-palette", "palette", "cmdk"],
  "lex-record": ["lex-record", "lightning", "lwc"],
  "lex-queue": ["lex-queue"],
  "lex-console": ["lex-console"],
  "lex-lwr": ["lex-lwr"],
  "lex-email": ["lex-email", "email"],
  "lex-mobile": ["lex-mobile"],
};

const exists = (rel) => existsSync(join(CORPUS, rel));

// Retirement is a catalog-wide policy decision, not a property of one kit's loop,
// so it is declared here in one place. A retired row stays in the catalog and
// keeps its pack — art-direction skips it for selection but adversarial fixtures
// and provenance still need it. Retiring a row is only safe once another row
// covers the same screen, which is why each reason names its replacement.
//
// Retirement is the soft lane, for a kit whose pack is still worth keeping as a
// fixture. The hard lane is deletion: MUI, Ant Design Pro and Carbon were removed
// from this file, from ~/design-corpus pins, and from disk entirely (2026-08-31,
// docs/no-foreign-runtimes.md). A retired row is still visible in templates.md and
// can still be cited by id; a deleted kit cannot be reached at all. Foreign-runtime
// kits earned the hard lane because a retired row is a row an agent can still read
// and imitate.
const HOUSE_KIT = "shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against";
const RETIRED = {
  "mantine-appshell": `${HOUSE_KIT}; shadcn covers app-shell (shadcn-sidebar-07)`,
  "heroui-next-app": `${HOUSE_KIT}; shadcn covers app-shell (shadcn-sidebar-07)`,
  "tremor-charts": "shadcn is the house kit; shadcn-chart-area-interactive is the chart-led page reference and the corpus carries 70 shadcn chart component packs alongside it",
};

const templates = [];
const push = (row) => {
  if (row.kind === "source" && !exists(row.path)) return;
  if ((row.kind === "query-only" || row.kind === "owned") && !exists(row.path)) return;
  if (!row.dna) row.dna = KIT_FAMILY[row.kit] || KIT_FAMILY.shine;
  if (!row.jobs) row.jobs = SCREEN_JOBS[row.screen] || [row.screen];
  if (!row.scope) row.scope = "page";
  if (RETIRED[row.id]) {
    row.selectable = false;
    row.retiredReason = RETIRED[row.id];
  }
  templates.push(row);
};

// ---- shadcn blocks and cited component sets ---------------------------------
// Hand-picked rows first: these carry a title and rank chosen for the job they
// serve, so they are declared rather than derived. The full block expansion
// below skips any id already pushed here.
for (const t of [
  // Carries crud/queue/records jobs as well as dashboard: it is the composed
  // records reference that replaced the deleted MUI and Ant Design Pro admin
  // pages, so deleting those rows depends on these jobs staying here.
  { name: "dashboard-01", screen: "dashboard", rank: 1, title: "shadcn dashboard-01 (sidebar, cards, chart, table)", required:["navigation","summary","chart","table"], jobs: ["crud","dashboard","inbox","list","queue","records","triage","worklist"] },
  { name: "sidebar-07", screen: "app-shell", rank: 1, title: "shadcn sidebar-07 (collapsible shell)", required:["navigation"] },
  { name: "login-04", screen: "auth", rank: 2, title: "shadcn login-04", required:["form"] },
  { name: "command", screen: "command-palette", rank: 1, title: "shadcn command (palette, keyboard-first, no motion)", scope:"component" },
  { name: "input-group-textarea", screen: "ai-generate", rank: 1, title: "shadcn input-group-textarea (prompt composer + submit addon)", scope:"component" },
  { name: "field-choice-card", screen: "ai-generate", rank: 2, title: "shadcn field-choice-card (option tier as radio cards)", scope:"component" },
  { name: "empty-icon", screen: "empty", rank: 1, title: "shadcn empty-icon (empty / no-result state)", jobs: ["empty", "ai-generate"], scope:"component" },
]) {
  const rel = `shadcn-registry/items/${t.name}.json`;
  if (!exists(rel)) continue;
  push({
    id: `shadcn-${t.name}`,
    screen: t.screen,
    kit: "shadcn-registry",
    title: t.title,
    path: rel,
    // /view/<name> 404s; the view route is style-scoped. Component rows have no
    // view page at all and point at their docs entry instead.
    preview: t.name.includes("-0") ? `https://ui.shadcn.com/view/new-york-v4/${t.name}` : `https://ui.shadcn.com/docs/components/${t.name.split("-")[0]}`,
    license: "MIT",
    kind: "source",
    startFrom: t.rank,
    scope: t.scope || "page",
    ...(t.required ? { reference: { required: t.required } } : {}),
    ...(t.jobs ? { jobs: t.jobs } : {}),
  });
}

// ---- shadcn full block expansion --------------------------------------------
// shadcn publishes exactly 97 blocks and the corpus carries all of them, so the
// catalog indexes all of them. This is a declared classification of the kit's own
// block taxonomy, not a wildcard: each family below names its screen, scope, and
// jobs, and anything the registry adds outside those families is reported rather
// than silently indexed.
//
// The earlier curated-only pass existed because 70 near-identical chart rows and
// 16 sidebars drowned the rows anyone needed. That was a retrieval defect, and it
// has since been fixed at the retrieval layer: art-direction measures
// near-duplicate distance within a scope and draws page and component candidates
// from separate pools, so a full corpus no longer crowds out the composed pages.
//
// Deriving these rows here rather than hand-writing them into templates.json is
// the point. The hand-written version diverged: the generator produced 49 rows
// against the file's 138, so running the documented regenerate command destroyed
// 89 rows, every chart row among them.
const CHART_FAMILIES = ["area", "bar", "line", "pie", "radar", "radial", "tooltip"];
const BLOCK_FAMILIES = [
  {
    match: /^sidebar-\d+$/, screen: "app-shell", scope: "page",
    required: ["navigation"], jobs: ["app-shell", "shell", "nav", "sidebar"],
    title: (name) => `shadcn ${name} (application shell)`,
  },
  {
    match: /^login-\d+$/, screen: "auth", scope: "page",
    required: ["form"], jobs: ["auth", "login", "signin", "signup", "sign-in"],
    title: (name) => `shadcn ${name} (sign-in screen)`,
  },
  {
    match: /^signup-\d+$/, screen: "auth", scope: "page",
    required: ["form"], jobs: ["auth", "login", "signin", "signup", "sign-up"],
    title: (name) => `shadcn ${name} (sign-up screen)`,
  },
  {
    match: new RegExp(`^chart-(${CHART_FAMILIES.join("|")})-`), screen: "charts", scope: "component",
    required: ["chart"],
    jobs: (name) => ["charts", "chart", name.split("-")[1], "analytics"],
    title: (name) => `shadcn ${name} (${name.split("-")[1]} chart block)`,
  },
];
// One chart block is a composed page rather than a single mark: it carries its own
// range control and header, which is the shape a chart-led analytics page needs.
const CHART_PAGE = {
  name: "chart-area-interactive", scope: "page",
  jobs: ["charts", "chart", "area", "dataviz", "trend", "timeseries"],
  title: "shadcn chart-area-interactive (chart-led analytics page)",
};

const shadcnRegistry = join(CORPUS, "shadcn-registry/registry.json");
if (existsSync(shadcnRegistry)) {
  const blocks = (JSON.parse(readFileSync(shadcnRegistry, "utf8")).items ?? [])
    .filter((item) => item.type === "registry:block")
    .map((item) => item.name)
    .sort();
  const unclassified = [];
  for (const name of blocks) {
    const id = `shadcn-${name}`;
    if (templates.some((row) => row.id === id)) continue; // hand-picked above
    const rel = `shadcn-registry/items/${name}.json`;
    if (!exists(rel)) continue;
    const family = BLOCK_FAMILIES.find((f) => f.match.test(name));
    if (!family) {
      if (name !== "dashboard-01") unclassified.push(name);
      continue;
    }
    const page = name === CHART_PAGE.name;
    push({
      id, screen: family.screen, kit: "shadcn-registry",
      title: page ? CHART_PAGE.title : family.title(name),
      path: rel,
      preview: `https://ui.shadcn.com/view/new-york-v4/${name}`,
      license: "MIT", kind: "source", startFrom: 1,
      scope: page ? CHART_PAGE.scope : family.scope,
      reference: { required: family.required },
      jobs: page ? CHART_PAGE.jobs : (typeof family.jobs === "function" ? family.jobs(name) : family.jobs),
    });
  }
  if (unclassified.length) {
    console.warn(`shadcn blocks not classified by BLOCK_FAMILIES (add a family or curate them): ${unclassified.join(", ")}`);
  }
}

// ---- Untitled UI public examples -------------------------------------------
// The exhaustive inventory lives in untitledui-examples.json. These composed
// examples are the primary directions worth putting in template retrieval.
for (const t of [
  {
    id: "untitled-sidebar-navigation", screen: "app-shell", rank: 1,
    title: "Untitled UI sidebar navigation examples",
    path: "untitled-ui-react/components/application/app-navigation/sidebar-navigation.demo.tsx",
    jobs: ["app-shell", "navigation", "sidebar"],
    required: ["navigation"],
  },
  {
    id: "untitled-table", screen: "queue", rank: 1,
    title: "Untitled UI table examples (populated, empty, error, offline)",
    path: "untitled-ui-react/components/application/table/table.demo.tsx",
    jobs: ["queue", "crud", "table", "records", "datagrid"],
    required: ["table"],
  },
  {
    id: "untitled-line-charts", screen: "dashboard", rank: 1,
    title: "Untitled UI line chart examples",
    path: "untitled-ui-react/components/application/charts/line-charts.demo.tsx",
    jobs: ["dashboard", "analytics", "charts", "dataviz"],
    required: ["chart"],
  },
]) {
  push({
    id: t.id, screen: t.screen, kit: "untitled-ui-react", title: t.title,
    path: t.path, preview: "https://www.untitledui.com/react/components",
    license: "MIT", kind: "source", startFrom: t.rank, jobs: t.jobs,
    scope: "component", reference: { required: t.required },
  });
}

// ---- one cite-able page per remaining major kit ------------------------------
const singles = [
  {
    id: "spectrum-ai-chat", screen: "chat", kit: "react-spectrum", rank: 1,
    title: "React Spectrum AI Chat (Thread + PromptField — prompt field is the primary)",
    path: "react-spectrum/packages/@react-spectrum/ai/src",
    preview: "https://react-spectrum.adobe.com",
    license: "Apache-2.0", jobs: ["chat", "assistant"],
  },
  {
    id: "mantine-appshell", screen: "app-shell", kit: "mantine", rank: 5,
    title: "Mantine AppShell full layout",
    path: "mantine/apps/mantine.dev/src/app-shell-examples/examples/FullLayout",
    preview: "https://mantine.dev/app-shell",
    license: "MIT",
  },
  {
    id: "fluent-nav", screen: "settings", kit: "fluentui", rank: 2,
    title: "Fluent UI NavDrawer",
    path: "fluentui/packages/react-components/react-nav",
    preview: "https://react.fluentui.dev",
    license: "MIT", jobs: ["settings"],
  },
  {
    id: "magicui-hero", screen: "marketing-hero", kit: "magicui", rank: 1,
    title: "Magic UI hero (display type, one primary, full-bleed media)",
    path: "magicui/apps/www/registry/magicui/hero-video-dialog.tsx",
    preview: "https://magicui.design",
    license: "MIT", jobs: ["marketing-hero", "hero", "landing"],
  },
  {
    id: "heroui-next-app", screen: "app-shell", kit: "heroui", rank: 6,
    title: "HeroUI Next.js app template",
    path: "heroui-next-app",
    preview: "https://www.heroui.com",
    license: "MIT",
  },
  {
    id: "tremor-charts", screen: "charts", kit: "tremor", rank: 1,
    title: "Tremor chart + KPI blocks (atoms — compose, don't cite as a page)",
    path: "tremor/src/components",
    preview: "https://tremor.so",
    license: "Apache-2.0", jobs: ["charts", "chart", "dataviz"],
  },
];
for (const t of singles) {
  if (!exists(t.path)) continue;
  push({
    id: t.id, screen: t.screen, kit: t.kit, title: t.title, path: t.path,
    preview: t.preview, license: t.license, kind: "source", startFrom: t.rank,
    ...(t.jobs ? { jobs: t.jobs } : {}),
    ...(t.selectable === false ? { selectable: false, retiredReason: t.retiredReason } : {}),
  });
}

// ---- LEX blueprints ----------------------------------------------------------
// No public renderable source exists for Lightning surfaces, so these rows carry
// no corpus path. Structure and org-measured facts live in references/salesforce.md;
// harvest (Phase 2) adds real screenshots to corpus/packs/<id>/shot.png.
for (const t of [
  { id: "lex-record", screen: "lex-record", rank: 1, title: "Lightning record home (highlights, path, detail, related)", jobs: ["lex-record", "record", "detail", "lightning", "lwc"], preview: "https://www.lightningdesignsystem.com/components/page-headers/" },
  { id: "lex-record-narrow", screen: "lex-record", rank: 2, title: "Lightning record LWC at ~494px host (container queries, not @media)", jobs: ["lex-record-narrow", "lex-record"], preview: "https://www.lightningdesignsystem.com/components/page-headers/" },
  { id: "lex-queue", screen: "lex-queue", rank: 1, title: "Lightning list / work queue (lightning-datatable contracts)", jobs: ["lex-queue", "queue"], preview: "https://www.lightningdesignsystem.com/components/data-tables/" },
  { id: "lex-console", screen: "lex-console", rank: 1, title: "Lightning console + utility bar", jobs: ["lex-console"], preview: "https://www.lightningdesignsystem.com/components/tabs/" },
  { id: "lex-lwr", screen: "lex-lwr", rank: 1, title: "Experience Cloud LWR (SLDS 2 unsupported)", jobs: ["lex-lwr"], preview: "https://www.lightningdesignsystem.com/guidelines/overview/" },
  { id: "lex-email", screen: "lex-email", rank: 1, title: "Salesforce HTML email (600px tables)", jobs: ["lex-email", "email"], preview: "https://www.lightningdesignsystem.com/guidelines/email/" },
  { id: "lex-mobile", screen: "lex-mobile", rank: 1, title: "Salesforce mobile (no datatable)", jobs: ["lex-mobile"], preview: "https://www.lightningdesignsystem.com/guidelines/mobile/" },
]) {
  push({
    id: t.id, screen: t.screen, kit: "slds", title: t.title,
    preview: t.preview || "", license: "n/a", kind: "blueprint",
    startFrom: t.rank, jobs: t.jobs, dna: KIT_FAMILY.slds,
    note: "references/salesforce.md is the structure source; no public source exists",
  });
}

// ---- shadcn page blueprints --------------------------------------------------
// shadcn ships 97 blocks: one dashboard, sixteen sidebars, ten auth pages and
// seventy charts. Every one of them is already catalogued, so these screens are
// not a harvest backlog — they are the edge of what shadcn publishes. These rows
// are what a shadcn host gets for a screen the kit does not publish, and since
// the foreign-runtime kits were deleted they are the ONLY thing standing between
// those screens and a catalog hole. Deleting MUI/Ant/Carbon was only safe because
// these landed first.
//
// Four carry authored source in corpus/blueprints/<id>/ because the deleted kit
// reference was structurally misleading anyway (Ant's profile page is a profile,
// its settings page hides section names behind tabs, its step form ships Ant's
// Steps runtime). Checkout, marketing and blog are region maps only: their
// structure is not kit-specific and the estate builds none of them, so authored
// source there would be untested reference code.
for (const t of [
  { id: "shadcn-record", screen: "record", title: "shadcn record detail (identity, facts, decision, evidence)", jobs: ["record", "detail", "account", "opportunity"], required: ["form", "table"] },
  { id: "shadcn-settings", screen: "settings", title: "shadcn settings (visible section nav, per-section save)", jobs: ["settings", "preferences", "account"], required: ["form", "navigation"] },
  { id: "shadcn-wizard", screen: "wizard", title: "shadcn wizard (step list, review before commit)", jobs: ["wizard", "stepper", "multi-step", "onboarding"], required: ["form", "navigation"] },
  { id: "shadcn-checkout", screen: "checkout", title: "shadcn checkout (persistent order summary) — region map only", jobs: ["checkout", "payment"], required: ["form", "summary"] },
  { id: "shadcn-marketing", screen: "marketing", title: "shadcn marketing page (claim, proof, pricing) — region map only", jobs: ["marketing", "landing", "pricing"] },
  // The blog screen had exactly one row, MUI's. Deleting MUI would have deleted
  // the screen, so the region map carries it: an editorial column is measure and
  // rhythm, not kit chrome, and shadcn publishes no block for it.
  { id: "shadcn-blog", screen: "blog", title: "shadcn editorial / article page (measure, rhythm, one figure class) — region map only", jobs: ["blog", "article", "editorial", "post"] },
  // A recurring-meeting board, read in full in a fixed order. Deliberately NOT
  // screen "queue": queue/crud/dashboard demand a grid with search, sort and
  // pagination, and sorting a cadence destroys the meaning while paginating it
  // hides half the agenda. The blueprint states the four conditions that must
  // hold before citing this instead of building the grid.
  { id: "shadcn-weekly-board", screen: "weekly-board", title: "shadcn weekly cadence board (report-out, discuss, up next)", jobs: ["weekly-board", "board", "cadence", "report-out", "standup", "kanban", "elt"], required: ["navigation", "summary"] },
]) {
  // Blueprints live in Shine, not the acquired corpus, so exists() is wrong here.
  const authored = existsSync(join(SHINE, "corpus/blueprints", t.id));
  push({
    id: t.id, screen: t.screen, kit: "shadcn-registry", title: t.title,
    preview: "", license: "MIT", kind: "blueprint", startFrom: 1, jobs: t.jobs,
    dna: KIT_FAMILY["shadcn-registry"],
    ...(t.required ? { reference: { required: t.required } } : {}),
    note: authored
      ? `corpus/blueprints/${t.id}.md is the region map; corpus/blueprints/${t.id}/ is authored shadcn source to copy`
      : `corpus/blueprints/${t.id}.md is the region map; shadcn publishes no block for this screen`,
  });
}

// ---- owned (Atlas-licensed, not republished) --------------------------------
const ownedManifest = join(CORPUS, "owned/manifest.json");
if (existsSync(ownedManifest)) {
  for (const row of JSON.parse(readFileSync(ownedManifest, "utf8")).templates ?? []) {
    push({ ...row, kind: "owned" });
  }
}

// ---- query-only previews (screenshots, no source) --------------------------
const qoManifest = join(SHINE, "corpus/query-only.json");
if (existsSync(qoManifest)) {
  for (const row of JSON.parse(readFileSync(qoManifest, "utf8")).templates ?? []) {
    push({
      ...row,
      kind: "query-only",
      path: row.path || `query-only/${row.id}.png`,
    });
  }
}

templates.sort((a, b) => a.screen.localeCompare(b.screen) || a.startFrom - b.startFrom || a.id.localeCompare(b.id));

const catalog = {
  generated: new Date().toISOString().slice(0, 10),
  corpus: CORPUS,
  requiredScreenTypes: REQUIRED,
  templates,
};

// --check proves the committed catalog is still what this script produces. It is
// the gate on the defect that shipped once already: 94 shadcn rows were hand-added
// to templates.json and never encoded here, so the generator produced 49 rows
// against the file's 138 and the documented regenerate command destroyed 89 rows.
const checkOnly = process.argv.includes("--check");
const jsonPath = join(SHINE, "corpus/templates.json");
const rendered = JSON.stringify(catalog, null, 2) + "\n";
if (checkOnly) {
  const onDisk = existsSync(jsonPath) ? readFileSync(jsonPath, "utf8") : "";
  if (onDisk === rendered) {
    console.log(`templates.json: in sync with the generator (${templates.length} rows)`);
    process.exit(0);
  }
  const diskRows = onDisk ? (JSON.parse(onDisk).templates ?? []) : [];
  const diskIds = new Set(diskRows.map((row) => row.id));
  const madeIds = new Set(templates.map((row) => row.id));
  const orphaned = [...diskIds].filter((id) => !madeIds.has(id));
  const unwritten = [...madeIds].filter((id) => !diskIds.has(id));
  console.error(`templates.json is out of sync with corpus/index-templates.mjs`);
  console.error(`  on disk: ${diskRows.length} rows   generator: ${templates.length} rows`);
  if (orphaned.length) console.error(`  only in the file (hand-edited; a regenerate would destroy these): ${orphaned.join(", ")}`);
  if (unwritten.length) console.error(`  only in the generator (never written): ${unwritten.join(", ")}`);
  if (!orphaned.length && !unwritten.length) console.error(`  same rows, different field values — run the generator to see the diff`);
  console.error(`  fix: encode the change in corpus/index-templates.mjs, then run it without --check`);
  process.exit(1);
}
writeFileSync(jsonPath, rendered);

// ---- templates.md — thin generated index ------------------------------------
const md = [];
md.push("# Templates — start from a real page");
md.push("");
md.push("Run `node corpus/cite.mjs <job>` — it resolves synonyms, extracts readable");
md.push("source, and points at the pack screenshot when one is harvested. No row for");
md.push("your screen → start from the nearest row plus `references/patterns.md`; add a");
md.push("row here (via `corpus/index-templates.mjs`) only after the screen shipped and");
md.push("earned it.");
md.push("");
md.push("Generated from `corpus/templates.json` — do not hand-edit; run `node corpus/index-templates.mjs`.");
md.push("");
md.push("A row marked **retired** is not selectable: `cite.mjs` and the packet skip it,");
md.push("its pack survives only as a regression fixture, and citing it by id is a defect.");
md.push("Reasons are listed under the table.");
md.push("");
md.push("| Screen | Id | Kit | Kind | Status | Jobs |");
md.push("|---|---|---|---|---|---|");
for (const t of templates) {
  const status = t.selectable === false ? "**retired**" : "live";
  md.push(`| ${t.screen} | \`${t.id}\` | ${t.kit} | ${t.kind} | ${status} | ${(t.jobs || []).join(", ")} |`);
}
md.push("");
const retiredRows = templates.filter((t) => t.selectable === false);
md.push(`${templates.length} rows, ${retiredRows.length} of them retired. Required screen coverage: ${REQUIRED.join(", ")}.`);
md.push("");
if (retiredRows.length) {
  md.push("## Retired rows — do not cite");
  md.push("");
  for (const t of retiredRows) md.push(`- \`${t.id}\` — ${t.retiredReason}`);
  md.push("");
}
const mdPath = join(SHINE, "skill/references/templates.md");
writeFileSync(mdPath, md.join("\n") + "\n");

console.log(`templates.json: ${templates.length} rows; templates.md regenerated`);
