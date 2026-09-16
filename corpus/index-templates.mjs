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

import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
// Test seams: where owned manifests are read from and where the catalog files are
// written. Defaults are the real locations; verify/catalog.test.mjs points both at
// temp directories so it can exercise the owned lane without touching the repo.
const OWNED_DIR = resolve(process.env.SHINE_OWNED_DIR || join(CORPUS, "owned"));
const OUT_DIR = resolve(process.env.SHINE_CATALOG_OUT || join(SHINE, "corpus"));

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
  // cult-ui is shadcn-registry-compatible (Tailwind + shadcn primitives + motion),
  // so unlike Mantine/HeroUI it can be built in the consumers. It exists in the
  // catalog for the marketing and onboarding silhouettes shadcn does not publish.
  // Profile deliberately differs from magicui on density, tone and type: identical
  // profiles made every cult row a near-duplicate of the Magic UI row for the same
  // screen, so the second family never reached the shortlist.
  "cult-ui": { family: "cult", density: "comfortable" },
  // Composed application pages on plain Tailwind. Each is its own family so the
  // shortlist can hold three application silhouettes instead of one.
  "tailadmin-react": { family: "tailadmin", density: "comfortable" },
  "windmill-react": { family: "windmill", density: "comfortable" },
  "flowbite-admin": { family: "flowbite", density: "compact" },
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
  // Component screens that had no home: retrieval could only reach these via
  // untitled:search, never via cite, so the packet could not hand them over.
  tabs: ["tabs", "sections", "segmented", "workspace-tabs", "section-tabs"],
  pagination: ["pagination", "paging", "page-size", "pager"],
  form: ["form", "input", "date", "date-range", "upload", "attachments"],
  "async-state": ["loading", "spinner", "pending", "async", "skeleton"],
  carousel: ["carousel", "gallery", "slides", "slideshow"],
  onboarding: ["onboarding", "first-run", "tour", "intro", "whats-new", "feature-announcement"],
  calendar: ["calendar", "schedule", "events", "agenda", "month-view"],
  // Deliberately no "list", "records" or "table": measure's queue likeness rule keys
  // on those jobs and would demand a table where cards are the right presentation.
  catalog: ["catalog", "cards", "library", "packages", "directory", "gallery", "showcase", "tools"],
  pricing: ["pricing", "plans", "tiers", "marketing", "landing"],
  // The marketing lane. Until 2026-09-16 it was two rows (one hero component and a
  // region map), so every landing page came out of the same silhouette. These
  // screens split a landing page into the regions a marketer actually briefs,
  // each with its own signature so the shortlist can hold three distinct looks.
  "marketing-features": ["marketing", "features", "feature-grid", "capabilities", "landing", "benefits"],
  "marketing-proof": ["marketing", "logos", "testimonials", "social-proof", "customers", "landing", "trust"],
  "marketing-metrics": ["marketing", "stats", "metrics", "counters", "landing", "outcomes"],
  "marketing-mockup": ["marketing", "screenshot", "device", "mockup", "product-shot", "landing", "demo"],
  "marketing-developer": ["marketing", "developer", "docs", "code", "terminal", "landing", "api"],
  "marketing-integrations": ["marketing", "integrations", "ecosystem", "network", "global", "landing", "connectors"],
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
  // Carries crud/records jobs as well as dashboard: it is the composed records
  // reference that replaced the deleted MUI and Ant Design Pro admin pages, so
  // deleting those rows depended on these jobs landing somewhere. The
  // queue-family jobs (queue/triage/worklist/inbox) moved to shadcn-queue on
  // 2026-09-01 — this row requires a chart, and handing a chartless triage grid
  // a chart-bearing cite forced consumers to split their measure and usability
  // declarations across two references. One home per job.
  { name: "dashboard-01", screen: "dashboard", rank: 1, title: "shadcn dashboard-01 (sidebar, cards, chart, table)", required:["navigation","summary","chart","table"], jobs: ["crud","dashboard","list","records"] },
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
// The exhaustive inventory lives in untitledui-examples.json (392 exports across 36
// demo files). Until 2026-09-16 exactly three of those files were cite-able rows,
// so the "buildable sibling" contributed one table, one sidebar and one line chart
// to retrieval and nothing else: header navigation, bar/pie/radar charts, gauges,
// tabs, pagination, date pickers, file upload and loading states were reachable
// only through untitled:search, which the packet never consults for a cite.
//
// Rows are derived from the shipped examples catalog by declared demo file, the
// same shape as BLOCK_FAMILIES: a demo file the catalog knows but this table does
// not classify is reported, never silently indexed. Ranks keep the three original
// rows as the defaults their screens already pin (art-direction.test asserts
// untitled-table is the default table reference); the new chart rows sit on the
// "charts" screen, not "dashboard", so they cannot displace the composed dashboard
// page or the line-chart component the packet test expects.
const UNTITLED_DEMOS = {
  "application/app-navigation/sidebar-navigation.demo.tsx": {
    id: "untitled-sidebar-navigation", preview: "https://www.untitledui.com/react/components/sidebar-navigations", screen: "app-shell", rank: 1,
    title: "Untitled UI sidebar navigation examples",
    jobs: ["app-shell", "navigation", "sidebar"], required: ["navigation"],
  },
  "application/app-navigation/header-navigation.demo.tsx": {
    id: "untitled-header-navigation", preview: "https://www.untitledui.com/react/components/header-navigations", screen: "app-shell", rank: 2,
    title: "Untitled UI header navigation (top bar, no rail)",
    jobs: ["app-shell", "navigation", "header", "topbar", "horizontal-nav"], required: ["navigation"],
  },
  "application/app-navigation/base-components/featured-cards.demo.tsx": {
    id: "untitled-featured-cards", preview: "https://www.untitledui.com/react/components/sidebar-navigations", screen: "app-shell", rank: 3,
    title: "Untitled UI sidebar featured cards (usage, upgrade and onboarding prompts)",
    jobs: ["app-shell", "navigation", "featured", "usage", "upgrade-prompt"], required: ["navigation"],
  },
  "application/table/table.demo.tsx": {
    id: "untitled-table", preview: "https://www.untitledui.com/react/components/tables", screen: "queue", rank: 1,
    title: "Untitled UI table examples (populated, empty, error, offline)",
    jobs: ["queue", "crud", "table", "records", "datagrid"], required: ["table"],
  },
  "application/charts/line-charts.demo.tsx": {
    id: "untitled-line-charts", preview: "https://www.untitledui.com/react/components/line-bar-charts", screen: "dashboard", rank: 1,
    title: "Untitled UI line chart examples",
    jobs: ["dashboard", "analytics", "charts", "dataviz"], required: ["chart"],
  },
  "application/charts/bar-charts.demo.tsx": {
    id: "untitled-bar-charts", preview: "https://www.untitledui.com/react/components/line-bar-charts", screen: "charts", rank: 2,
    title: "Untitled UI bar chart examples (grouped, stacked, horizontal)",
    jobs: ["charts", "chart", "bar", "comparison", "analytics", "dataviz"], required: ["chart"],
  },
  "application/charts/pie-charts.demo.tsx": {
    id: "untitled-pie-charts", preview: "https://www.untitledui.com/react/components/pie-charts", screen: "charts", rank: 2,
    title: "Untitled UI pie and donut chart examples",
    jobs: ["charts", "chart", "pie", "donut", "share", "breakdown", "dataviz"], required: ["chart"],
  },
  "application/charts/radar-charts.demo.tsx": {
    id: "untitled-radar-charts", preview: "https://www.untitledui.com/react/components/radar-charts", screen: "charts", rank: 2,
    title: "Untitled UI radar chart examples",
    jobs: ["charts", "chart", "radar", "profile", "comparison", "dataviz"], required: ["chart"],
  },
  "application/charts/activity-gauges.demo.tsx": {
    id: "untitled-activity-gauges", preview: "https://www.untitledui.com/react/components/activity-gauges", screen: "charts", rank: 2,
    title: "Untitled UI activity gauge examples",
    jobs: ["charts", "chart", "gauge", "kpi", "target", "dataviz"], required: ["chart"],
  },
  "application/charts/progress-circles.demo.tsx": {
    id: "untitled-progress-circles", preview: "https://www.untitledui.com/react/components/progress-indicators", screen: "charts", rank: 2,
    title: "Untitled UI progress circle examples",
    jobs: ["charts", "chart", "progress", "completion", "kpi", "dataviz"], required: ["chart"],
  },
  "application/tabs/tabs.demo.tsx": {
    id: "untitled-tabs", preview: "https://www.untitledui.com/react/components/tabs", screen: "tabs", rank: 1,
    title: "Untitled UI tabs (underline, button, vertical, with badges)",
    jobs: SCREEN_JOBS.tabs,
  },
  "application/pagination/pagination.demo.tsx": {
    id: "untitled-pagination", preview: "https://www.untitledui.com/react/components/pagination", screen: "pagination", rank: 1,
    title: "Untitled UI pagination (page numbers, dots, line, minimal)",
    jobs: SCREEN_JOBS.pagination,
  },
  "application/date-picker/date-picker.demo.tsx": {
    id: "untitled-date-picker", preview: "https://www.untitledui.com/react/components/date-pickers", screen: "form", rank: 1,
    title: "Untitled UI date picker and date range picker",
    jobs: ["form", "input", "date", "date-range", "calendar", "picker"], required: ["form"],
  },
  "application/file-upload/file-upload.demo.tsx": {
    id: "untitled-file-upload", preview: "https://www.untitledui.com/react/components/file-uploaders", screen: "form", rank: 2,
    title: "Untitled UI file upload (dropzone, progress, failed items)",
    jobs: ["form", "input", "upload", "attachments", "dropzone", "files"], required: ["form"],
  },
  "application/loading-indicator/loading-indicator.demo.tsx": {
    id: "untitled-loading-indicator", preview: "https://www.untitledui.com/react/components/loading-indicators", screen: "async-state", rank: 1,
    title: "Untitled UI loading indicators (line, dots, spinner, with label)",
    jobs: SCREEN_JOBS["async-state"],
  },
  "application/carousel/carousel.demo.tsx": {
    id: "untitled-carousel", preview: "https://www.untitledui.com/react/components/carousels", screen: "carousel", rank: 1,
    title: "Untitled UI carousel (indicators, arrows, autoplay)",
    jobs: SCREEN_JOBS.carousel,
  },
};
const untitledCatalog = join(SHINE, "corpus/untitledui-examples.json");
if (existsSync(untitledCatalog)) {
  const examples = JSON.parse(readFileSync(untitledCatalog, "utf8")).examples ?? [];
  const demoFiles = [...new Set(examples.map((item) => item.sourceFile.replace(/^untitled-ui-react\/components\//, "")))].sort();
  const unclassified = [];
  for (const rel of demoFiles) {
    const t = UNTITLED_DEMOS[rel];
    if (!t) {
      // base/ atoms and foundations are components a page region imports, not
      // starting points; they stay reachable through untitled:search.
      if (rel.startsWith("application/")) unclassified.push(rel);
      continue;
    }
    push({
      id: t.id, screen: t.screen, kit: "untitled-ui-react", title: t.title,
      path: `untitled-ui-react/components/${rel}`,
      // Each row names the public page that renders its examples so harvest.mjs can
      // capture real pixels; the generic components index proves nothing.
      preview: t.preview || "https://www.untitledui.com/react/components",
      license: "MIT", kind: "source", startFrom: t.rank, jobs: t.jobs,
      scope: "component", ...(t.required ? { reference: { required: t.required } } : {}),
    });
  }
  if (unclassified.length) {
    console.warn(`Untitled UI application demos not classified by UNTITLED_DEMOS (add a row or say why not): ${unclassified.join(", ")}`);
  }
}

// ---- Magic UI marketing examples ---------------------------------------------
// Magic UI is Tailwind + shadcn + motion, installable through the shadcn registry,
// so its examples can be built in the consumers. The registry publishes 168
// examples; most are decorative (background patterns, text effects, buttons,
// confetti, cursors) and are declared as such below rather than indexed. The
// rest are the composed marketing regions a landing page is briefed in, and they
// are the second visual family the marketing lane has ever had.
const MAGICUI_FAMILIES = [
  { match: /^hero-video-dialog-demo/, screen: "marketing-hero", rank: 2, jobs: ["marketing-hero", "hero", "landing", "video", "launch"], title: (n) => `Magic UI ${n} (hero with product video)` },
  { match: /^bento-demo/, screen: "marketing-features", rank: 1, jobs: SCREEN_JOBS["marketing-features"], title: (n) => `Magic UI ${n} (feature grid with live previews)` },
  { match: /^(marquee-logos|marquee-demo|marquee-demo-vertical|marquee-3d|avatar-circles-demo|tweet-card-demo|tweet-card-images|tweet-card-meta-preview)$/, screen: "marketing-proof", rank: 1, jobs: SCREEN_JOBS["marketing-proof"], title: (n) => `Magic UI ${n} (social proof)` },
  { match: /^(number-ticker-demo|number-ticker-demo-2|number-ticker-decimal-demo|animated-circular-progress-bar-demo)$/, screen: "marketing-metrics", rank: 1, jobs: SCREEN_JOBS["marketing-metrics"], title: (n) => `Magic UI ${n} (outcome metrics)` },
  { match: /^(safari-demo|iphone-demo|android-demo)(-\d)?$/, screen: "marketing-mockup", rank: 1, jobs: SCREEN_JOBS["marketing-mockup"], title: (n) => `Magic UI ${n} (product screenshot in device frame)` },
  { match: /^(terminal-demo(-\d)?|code-comparison-demo|file-tree-demo)$/, screen: "marketing-developer", rank: 1, jobs: SCREEN_JOBS["marketing-developer"], title: (n) => `Magic UI ${n} (developer-facing proof)` },
  { match: /^(globe-demo|orbiting-circles-demo|icon-cloud-demo(-\d)?|animated-beam-(demo|unidirectional|bidirectional|multiple-inputs|multiple-outputs)|dotted-map-demo(-\d)?)$/, screen: "marketing-integrations", rank: 1, jobs: SCREEN_JOBS["marketing-integrations"], title: (n) => `Magic UI ${n} (integrations and reach)` },
];
const MAGICUI_DECORATIVE = /pattern|grid|text|button|confetti|cursor|pointer|lens|blur|border-beam|shine-border|ripple|meteors|particles|warp|backlight|light-rays|noise|glare|magic-card|neon|theme-toggler|scroll|dock|animated-list|pixel-image|highlighter|glyph|morphing|aurora|hyper|word-rotate|typing|sparkles|spinning|comic|kinetic|video|cool-mode|retro/;
const magicRegistry = join(CORPUS, "magicui/apps/www/registry.json");
if (existsSync(magicRegistry)) {
  const items = (JSON.parse(readFileSync(magicRegistry, "utf8")).items ?? []).filter((item) => item.type === "registry:example");
  const unclassified = [];
  for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
    const family = MAGICUI_FAMILIES.find((f) => f.match.test(item.name));
    if (!family) {
      if (!MAGICUI_DECORATIVE.test(item.name)) unclassified.push(item.name);
      continue;
    }
    const file = item.files?.find((f) => f.type === "registry:example")?.path;
    if (!file) continue;
    // Prefer the dependency that has a docs page (client-tweet-card has none; tweet-card does).
    const deps = (item.registryDependencies ?? []).filter((dep) => dep.startsWith("@magicui/")).map((dep) => dep.slice("@magicui/".length));
    const component = deps.find((dep) => exists(`magicui/apps/www/content/docs/components/${dep}.mdx`)) || deps[0];
    // The example file is a few lines that mount the component; the component itself
    // is the readable source, so both go into the pack.
    const sources = deps.map((dep) => `magicui/apps/www/registry/magicui/${dep}.tsx`).filter((rel) => exists(rel));
    push({
      id: `magicui-${item.name}`, screen: family.screen, kit: "magicui", title: family.title(item.name),
      path: `magicui/apps/www/${file}`, ...(sources.length ? { sources } : {}),
      preview: component ? `https://magicui.design/docs/components/${component}` : "https://magicui.design",
      license: "MIT", kind: "source", startFrom: family.rank, jobs: family.jobs, scope: "component",
    });
  }
  if (unclassified.length) {
    console.warn(`Magic UI examples neither classified nor declared decorative: ${unclassified.join(", ")}`);
  }
}

// ---- cult-ui marketing and onboarding components ------------------------------
// Declared singles: cult-ui publishes no example pages, so each row points at the
// component source and carries its own jobs. Five hero treatments give the
// marketing-hero screen a third family beside Magic UI and the shadcn region map.
for (const t of [
  { name: "hero-color-panel", docs: "hero-color-panels", screen: "marketing-hero", rank: 3, title: "cult-ui hero with color panel (split hero, solid product panel)", jobs: ["marketing-hero", "hero", "landing", "split", "panel"] },
  { name: "hero-dithering", screen: "marketing-hero", rank: 3, title: "cult-ui hero with dithered texture", jobs: ["marketing-hero", "hero", "landing", "texture", "editorial"] },
  { name: "hero-heatmap", screen: "marketing-hero", rank: 3, title: "cult-ui hero with data heatmap backdrop", jobs: ["marketing-hero", "hero", "landing", "data", "heatmap"] },
  { name: "hero-liquid-metal", screen: "marketing-hero", rank: 3, title: "cult-ui hero with liquid metal shader", jobs: ["marketing-hero", "hero", "landing", "shader", "premium"] },
  { name: "hero-static-radial-gradient", screen: "marketing-hero", rank: 3, title: "cult-ui hero with static radial backdrop", jobs: ["marketing-hero", "hero", "landing", "radial", "minimal"] },
  { name: "logo-carousel", screen: "marketing-proof", rank: 2, title: "cult-ui logo carousel (customer logos, cycling)", jobs: ["marketing", "logos", "customers", "social-proof", "carousel", "landing"] },
  { name: "feature-carousel", screen: "marketing-features", rank: 2, title: "cult-ui feature carousel (stepped feature walkthrough)", jobs: ["marketing", "features", "carousel", "capabilities", "walkthrough", "landing"] },
  { name: "animated-number", screen: "marketing-metrics", rank: 2, title: "cult-ui animated number (metric counter)", jobs: ["marketing", "stats", "metrics", "counters", "landing"] },
  { name: "onboarding", screen: "onboarding", rank: 1, title: "cult-ui onboarding flow (stepped first-run with media)", jobs: ["onboarding", "first-run", "tour", "intro", "steps"] },
  { name: "intro-disclosure", screen: "onboarding", rank: 2, title: "cult-ui intro disclosure (feature announcement, dismissible)", jobs: ["onboarding", "intro", "whats-new", "feature-announcement", "disclosure"] },
  { name: "three-d-carousel", screen: "carousel", rank: 2, title: "cult-ui 3D carousel (media gallery)", jobs: ["carousel", "gallery", "slides", "media", "3d"] },
]) {
  const rel = `cult-ui/apps/www/registry/default/ui/${t.name}.tsx`;
  if (!exists(rel)) continue;
  push({
    id: `cult-${t.name}`, screen: t.screen, kit: "cult-ui", title: t.title, path: rel,
    // The docs slug occasionally differs from the component file name.
    preview: `https://www.cult-ui.com/docs/components/${t.docs || t.name}`,
    license: "MIT", kind: "source", startFrom: t.rank, jobs: t.jobs, scope: "component",
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

// ---- composed application pages from Tailwind kits ---------------------------
// Until 2026-09-16 every page-scope reference for an application surface was
// shadcn: the dashboard, all sixteen sidebars, all ten auth pages. The family cap
// could not produce a second look because there was none. These MIT kits publish
// whole pages on plain Tailwind with distinct paint and composition, and their
// live demos are the harvest targets. Structure ports; the runtime is Tailwind.
const TAILWIND_PAGES = [
  // TailAdmin (React + Tailwind v4, MIT). Soft, card-heavy, blue accent.
  { id: "tailadmin-dashboard", kit: "tailadmin-react", screen: "dashboard", rank: 2, path: "tailadmin-react/src/pages/Dashboard/Ecommerce.tsx", preview: "https://free-react-demo.tailadmin.com/", title: "TailAdmin ecommerce dashboard (metrics, charts, recent orders)", jobs: ["dashboard", "analytics", "kpi", "ecommerce", "metrics"], required: ["navigation", "summary", "chart", "table"] },
  { id: "tailadmin-tables", kit: "tailadmin-react", screen: "queue", rank: 3, path: "tailadmin-react/src/pages/Tables/BasicTables.tsx", preview: "https://free-react-demo.tailadmin.com/basic-tables", title: "TailAdmin basic tables page", jobs: ["queue", "crud", "table", "records", "datagrid"], required: ["navigation", "table"] },
  { id: "tailadmin-form-elements", kit: "tailadmin-react", screen: "form", rank: 2, path: "tailadmin-react/src/pages/Forms/FormElements.tsx", preview: "https://free-react-demo.tailadmin.com/form-elements", title: "TailAdmin form elements page (grouped inputs, selects, toggles, uploads)", jobs: ["form", "input", "fields", "controls"], required: ["navigation", "form"] },
  { id: "tailadmin-signin", kit: "tailadmin-react", screen: "auth", rank: 3, path: "tailadmin-react/src/pages/AuthPages/SignIn.tsx", preview: "https://free-react-demo.tailadmin.com/signin", title: "TailAdmin sign-in (split layout, brand panel)", jobs: ["auth", "login", "signin", "sign-in"], required: ["form"] },
  { id: "tailadmin-profile", kit: "tailadmin-react", screen: "record", rank: 2, path: "tailadmin-react/src/pages/UserProfiles.tsx", preview: "https://free-react-demo.tailadmin.com/profile", title: "TailAdmin user profile (identity card, info sections, address)", jobs: ["record", "profile", "detail", "account", "user"], required: ["navigation"] },
  { id: "tailadmin-calendar", kit: "tailadmin-react", screen: "calendar", rank: 1, path: "tailadmin-react/src/pages/Calendar.tsx", preview: "https://free-react-demo.tailadmin.com/calendar", title: "TailAdmin calendar (month grid, event dialog)", jobs: SCREEN_JOBS.calendar, required: ["navigation"] },
  // Windmill (React + Tailwind, MIT). Purple accent, dense cards, dark mode.
  { id: "windmill-dashboard", kit: "windmill-react", screen: "dashboard", rank: 3, path: "windmill-react/src/pages/Dashboard.js", preview: "https://windmill-dashboard-react.vercel.app/app/dashboard", title: "Windmill dashboard (info cards, client table, charts)", jobs: ["dashboard", "analytics", "kpi", "metrics"], required: ["navigation", "summary", "chart", "table"] },
  { id: "windmill-tables", kit: "windmill-react", screen: "queue", rank: 4, path: "windmill-react/src/pages/Tables.js", preview: "https://windmill-dashboard-react.vercel.app/app/tables", title: "Windmill tables (paginated client tables with actions)", jobs: ["queue", "crud", "table", "records", "datagrid"], required: ["navigation", "table"] },
  { id: "windmill-forms", kit: "windmill-react", screen: "form", rank: 3, path: "windmill-react/src/pages/Forms.js", preview: "https://windmill-dashboard-react.vercel.app/app/forms", title: "Windmill forms page (labelled fields, validation states)", jobs: ["form", "input", "fields", "validation"], required: ["navigation", "form"] },
  { id: "windmill-charts", kit: "windmill-react", screen: "charts", rank: 3, path: "windmill-react/src/pages/Charts.js", preview: "https://windmill-dashboard-react.vercel.app/app/charts", title: "Windmill charts page (doughnut, line, bar cards)", jobs: ["charts", "chart", "analytics", "dataviz"], required: ["navigation", "chart"] },
  { id: "windmill-login", kit: "windmill-react", screen: "auth", rank: 4, path: "windmill-react/src/pages/Login.js", preview: "https://windmill-dashboard-react.vercel.app/login", title: "Windmill login (split image, social sign-in)", jobs: ["auth", "login", "signin", "sign-in"], required: ["form"] },
  { id: "windmill-create-account", kit: "windmill-react", screen: "auth", rank: 5, path: "windmill-react/src/pages/CreateAccount.js", preview: "https://windmill-dashboard-react.vercel.app/create-account", title: "Windmill create account", jobs: ["auth", "signup", "sign-up", "register"], required: ["form"] },
  // Flowbite admin (HTML + Tailwind, MIT). Gray/blue, dense tables, stacked layouts.
  { id: "flowbite-dashboard", kit: "flowbite-admin", screen: "dashboard", rank: 4, path: "flowbite-admin/content/_index.html", preview: "https://flowbite-admin-dashboard.vercel.app/", title: "Flowbite admin dashboard (sales chart, stats, latest transactions)", jobs: ["dashboard", "analytics", "kpi", "metrics", "sales"], required: ["navigation", "summary", "chart", "table"] },
  { id: "flowbite-users", kit: "flowbite-admin", screen: "queue", rank: 5, path: "flowbite-admin/content/crud/users.html", preview: "https://flowbite-admin-dashboard.vercel.app/crud/users/", title: "Flowbite users list (search, bulk select, edit/delete modals)", jobs: ["queue", "crud", "table", "records", "users", "admin"], required: ["navigation", "table"] },
  { id: "flowbite-products", kit: "flowbite-admin", screen: "queue", rank: 6, path: "flowbite-admin/content/crud/products.html", preview: "https://flowbite-admin-dashboard.vercel.app/crud/products/", title: "Flowbite products list (catalog table with drawers)", jobs: ["queue", "crud", "table", "products", "inventory", "catalog"], required: ["navigation", "table"] },
  { id: "flowbite-settings", kit: "flowbite-admin", screen: "settings", rank: 3, path: "flowbite-admin/content/settings.html", preview: "https://flowbite-admin-dashboard.vercel.app/settings/", title: "Flowbite settings (profile, sessions, notifications, password)", jobs: ["settings", "preferences", "account", "profile"], required: ["navigation", "form"] },
  { id: "flowbite-sign-in", kit: "flowbite-admin", screen: "auth", rank: 6, path: "flowbite-admin/content/authentication/sign-in.html", preview: "https://flowbite-admin-dashboard.vercel.app/authentication/sign-in/", title: "Flowbite sign-in (centered card)", jobs: ["auth", "login", "signin", "sign-in"], required: ["form"] },
  { id: "flowbite-pricing", kit: "flowbite-admin", screen: "pricing", rank: 1, path: "flowbite-admin/content/pages/pricing.html", preview: "https://flowbite-admin-dashboard.vercel.app/pages/pricing/", title: "Flowbite pricing page (three tiers, FAQ)", jobs: SCREEN_JOBS.pricing, required: ["navigation"] },
];
// A page file in these kits is often a thin wrapper that mounts components (TailAdmin's
// SignIn is 17 lines importing SignInForm). The pack needs the components too, so a
// row carries its page's direct imports — "@/x" (kit src alias) and relative paths —
// as companion sources when they resolve to files on disk.
const companionSources = (rel) => {
  const kit = rel.split("/")[0];
  const abs = join(CORPUS, rel);
  if (!existsSync(abs)) return [];
  const source = readFileSync(abs, "utf8");
  const out = [];
  for (const m of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    const spec = m[1];
    let base;
    if (spec.startsWith("@/")) base = join(CORPUS, kit, "src", spec.slice(2));
    else if (spec.startsWith(".")) base = resolve(dirname(abs), spec);
    else continue;
    const candidate = [base, ...[".tsx", ".ts", ".jsx", ".js"].map((ext) => base + ext), ...["index.tsx", "index.jsx", "index.js"].map((name) => join(base, name))]
      .find((path) => existsSync(path) && statSync(path).isFile());
    if (candidate) out.push(relative(CORPUS, candidate));
  }
  return [...new Set(out)];
};
for (const t of TAILWIND_PAGES) {
  if (!exists(t.path)) continue;
  const sources = companionSources(t.path);
  push({
    id: t.id, screen: t.screen, kit: t.kit, title: t.title, path: t.path, preview: t.preview,
    ...(sources.length ? { sources } : {}),
    license: "MIT", kind: "source", startFrom: t.rank, jobs: t.jobs, scope: "page",
    ...(t.required ? { reference: { required: t.required } } : {}),
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
  { id: "shadcn-record", screen: "record", title: "shadcn record detail (identity, facts, decision, evidence)", jobs: ["record", "detail", "account", "opportunity"], required: ["form", "table"], captureExpect: '[data-region="record-decision"] textarea', note: "corpus/blueprints/shadcn-record.md is the region map; corpus/blueprints/shadcn-record/ is authored shadcn source to copy, and reference.html is that source rendered at rest for capture" },
  // captureExpect and the note were hand-edited into templates.json on the release
  // machine and never encoded here, so the first regenerate anywhere else dropped
  // them and reference-contract failed. Declared now, where --check can see them.
  { id: "shadcn-settings", screen: "settings", title: "shadcn settings (visible section nav, per-section save)", jobs: ["settings", "preferences", "account"], required: ["form", "navigation"], captureExpect: 'nav[aria-label="Settings sections"] a', note: "corpus/blueprints/shadcn-settings.md is the region map; corpus/blueprints/shadcn-settings/ is authored shadcn source to copy, and reference.html is that source rendered at rest for capture" },
  { id: "shadcn-wizard", screen: "wizard", title: "shadcn wizard (step list, review before commit)", jobs: ["wizard", "stepper", "multi-step", "onboarding"], required: ["form", "navigation"], captureExpect: '[data-region="wizard"] form input[name="account"]' },
  // Checkout and marketing were region maps with no pixels: compare had nothing to
  // hold a consumer to and completion could never cite them. reference.html renders
  // each region map at rest; the estate still builds neither, so there is no TSX.
  { id: "shadcn-checkout", screen: "checkout", title: "shadcn checkout (persistent order summary, step body, cost breakdown)", jobs: ["checkout", "payment"], required: ["form", "summary"], captureExpect: '[data-region="order-summary"] dl', note: "corpus/blueprints/shadcn-checkout.md is the region map; reference.html renders it at rest for capture; no consumer TSX is authored because the estate builds no checkout" },
  { id: "shadcn-marketing", screen: "marketing", title: "shadcn marketing page (claim, proof, capabilities, pricing, close)", jobs: ["marketing", "landing", "pricing"], captureExpect: '[data-region="pricing"] .tier', note: "corpus/blueprints/shadcn-marketing.md is the region map; reference.html renders it at rest for capture; no consumer TSX is authored because the estate builds no marketing page" },
  // The blog screen had exactly one row, MUI's. Deleting MUI would have deleted
  // the screen, so the region map carries it: an editorial column is measure and
  // rhythm, not kit chrome, and shadcn publishes no block for it.
  { id: "shadcn-blog", screen: "blog", title: "Editorial publication with source attribution and natural text flow", jobs: ["blog", "article", "editorial", "post"], captureExpect: "article details", note: "Authored editorial blueprint with captured source in corpus/blueprints/shadcn-blog/" },
  // A recurring-meeting board, read in full in a fixed order. Deliberately NOT
  // screen "queue": queue/crud/dashboard demand a grid with search, sort and
  // pagination, and sorting a cadence destroys the meaning while paginating it
  // hides half the agenda. The blueprint states the four conditions that must
  // hold before citing this instead of building the grid.
  { id: "shadcn-weekly-board", screen: "weekly-board", title: "shadcn weekly cadence board (report-out, discuss, up next)", jobs: ["weekly-board", "board", "cadence", "report-out", "standup", "kanban", "elt"], required: ["navigation", "summary"], captureExpect: '[data-region="weekly-summary"]' },
  // The chartless work queue. shadcn-dashboard-01 was the only shadcn row
  // carrying the queue-family jobs, and its reference roles require a chart —
  // so a shadcn triage grid (cro-suite's gov page) could not declare one cite
  // that satisfied both measure (shadcn DNA) and usability (queue demands).
  // Requires navigation+table only; summary is welcome but not demanded.
  // startFrom 2 is deliberate: on a kit-neutral cite this row ties
  // untitled-table on score, and untitled-table must stay the default table
  // reference (pinned by art-direction.test) — kit affinity, not raw score, is
  // what should hand a shadcn host this row.
  // A card catalog: search, a few filters, a count, and one rich card per record with
  // its own actions and disclosure. The Nucleus Company Tools audit (docs/audits) showed
  // the packet had no home for this shape and forced a table comparison onto five cards.
  { id: "shadcn-catalog", screen: "catalog", title: "shadcn card catalog (search, filters, count, one card per record with actions and disclosure)", jobs: SCREEN_JOBS.catalog, required: ["form"], captureExpect: '[data-region="catalog-cards"] article', note: "corpus/blueprints/shadcn-catalog.md is the region map; reference.html renders it at rest for capture" },
  { id: "shadcn-queue", screen: "queue", title: "shadcn work queue (triage grid, no chart)", jobs: ["queue", "worklist", "triage", "inbox", "datagrid"], required: ["navigation", "table"], captureExpect: '[data-region="queue-grid"]', startFrom: 2 },
]) {
  // Blueprints live in Shine, not the acquired corpus, so exists() is wrong here.
  const authored = existsSync(join(SHINE, "corpus/blueprints", t.id));
  push({
    id: t.id, screen: t.screen, kit: "shadcn-registry", title: t.title,
    preview: "", license: "MIT", kind: "blueprint", startFrom: t.startFrom ?? 1, jobs: t.jobs,
    dna: KIT_FAMILY["shadcn-registry"],
    ...((t.required || t.captureExpect) ? { reference: { ...(t.required ? { required: t.required } : {}), ...(t.captureExpect ? { captureExpect: t.captureExpect } : {}) } } : {}),
    note: t.note ?? (authored
      ? `corpus/blueprints/${t.id}.md is the region map; corpus/blueprints/${t.id}/ is authored shadcn source to copy`
      : `corpus/blueprints/${t.id}.md is the region map; shadcn publishes no block for this screen`),
  });
}

// Native media blueprint must survive catalog regeneration.
push({
  id: "shadcn-broadcast", screen: "broadcast", kit: "shadcn-registry",
  title: "Broadcast player with aspect-ratio frame and adjacent source context",
  preview: "", license: "MIT", kind: "blueprint", startFrom: 1,
  jobs: ["broadcast", "video", "media", "player", "television", "presenter"],
  dna: KIT_FAMILY["shadcn-registry"],
  reference: { required: ["navigation"], captureExpect: "video" },
  note: "Authored native HTML media blueprint compatible with shadcn; not an upstream block.",
  scope: "page",
});

// ---- owned (licensed, never republished) -------------------------------------
// Licensed kits — Tailwind Plus, Untitled UI PRO, a purchased Figma file — may be
// used in the consumers' end products but not redistributed. Shine is a public
// repository with a public registry and site, so their rows cannot live in the
// committed catalog either: templates.json is generated on whatever machine runs
// this script and checked with --check on every other one, and a row whose source
// exists on one laptop is a hand-edit everywhere else.
//
// So owned kits are indexed into corpus/templates.owned.json — gitignored, never
// packaged (the Nucleus archive is `git archive`), merged at read time by
// corpus/catalog.mjs. Each kit is a directory under ~/design-corpus/owned/<kit>/
// with a manifest.json declaring `templates`; see corpus/owned/README.md.
const ownedRows = [];
const ownedDir = OWNED_DIR;
const ownedManifests = [];
if (existsSync(join(ownedDir, "manifest.json"))) ownedManifests.push(join(ownedDir, "manifest.json"));
if (existsSync(ownedDir)) {
  for (const entry of readdirSync(ownedDir).sort()) {
    const manifest = join(ownedDir, entry, "manifest.json");
    if (statSync(join(ownedDir, entry)).isDirectory() && existsSync(manifest)) ownedManifests.push(manifest);
  }
}
for (const manifestPath of ownedManifests) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const kit = manifest.kit || manifest.id || "owned";
  for (const row of manifest.templates ?? []) {
    const problems = [];
    for (const key of ["id", "screen", "title", "path"]) if (!row[key]) problems.push(`missing ${key}`);
    if (row.path && !exists(row.path) && !existsSync(resolve(ownedDir, "..", row.path))) problems.push(`path not on disk: ${row.path}`);
    if (templates.some((t) => t.id === row.id) || ownedRows.some((t) => t.id === row.id)) problems.push("id collides with a catalog row");
    if (problems.length) {
      console.warn(`owned row ${row.id || "?"} in ${manifestPath} skipped: ${problems.join("; ")}`);
      continue;
    }
    ownedRows.push({
      ...row,
      kit: row.kit || kit,
      kind: "owned",
      license: row.license || manifest.license || "proprietary",
      publication: "private-reference-only",
      startFrom: row.startFrom ?? 1,
      scope: row.scope || "page",
      dna: row.dna || KIT_FAMILY[row.kit || kit] || { family: manifest.family || kit, density: manifest.density || "comfortable" },
      jobs: row.jobs || SCREEN_JOBS[row.screen] || [row.screen],
    });
  }
}
const ownedPath = join(OUT_DIR, "templates.owned.json");

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
const jsonPath = join(OUT_DIR, "templates.json");
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
if (ownedRows.length) {
  writeFileSync(ownedPath, JSON.stringify({ generated: catalog.generated, corpus: CORPUS, publication: "private-reference-only", templates: ownedRows }, null, 2) + "\n");
} else if (existsSync(ownedPath)) {
  rmSync(ownedPath);
}

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
const mdPath = process.env.SHINE_CATALOG_OUT ? join(OUT_DIR, "templates.md") : join(SHINE, "skill/references/templates.md");
writeFileSync(mdPath, md.join("\n") + "\n");

console.log(`templates.json: ${templates.length} rows; templates.md regenerated${ownedRows.length ? `; templates.owned.json: ${ownedRows.length} private rows` : ""}`);
