#!/usr/bin/env node
// index-templates.mjs — write corpus/templates.json + skill/references/templates.md
// from on-disk corpus, owned/, and query-only/. A new clone that is not in this
// index is invisible to the agent. Run from acquire.sh after pins land.
//
// V3 rule: every row must earn its place. A row is a real, composed screen (or a
// deliberately-cited component set), never an inventory dump. The V2 catalog reached
// 141 rows — 71 of them chart demos — because wildcards indexed whatever the kits
// shipped. Curate by hand; the doctor checks coverage of requiredScreenTypes.
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
  "mui-material": { family: "material", density: "comfortable" },
  tremor: { family: "tremor", density: "comfortable" },
  "ant-design-pro": { family: "ant", density: "dense" },
  "ant-design": { family: "ant", density: "dense" },
  heroui: { family: "heroui", density: "comfortable" },
  "chakra-ui": { family: "chakra", density: "comfortable" },
  carbon: { family: "carbon", density: "dense" },
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

const templates = [];
const push = (row) => {
  if (row.kind === "source" && !exists(row.path)) return;
  if ((row.kind === "query-only" || row.kind === "owned") && !exists(row.path)) return;
  if (!row.dna) row.dna = KIT_FAMILY[row.kit] || KIT_FAMILY.shine;
  if (!row.jobs) row.jobs = SCREEN_JOBS[row.screen] || [row.screen];
  if (!row.scope) row.scope = "page";
  templates.push(row);
};

// ---- MUI free templates (real composed pages, in mui-material docs/data) ---
const muiBase = "mui-material/docs/data/material/getting-started/templates";
const muiPreview = "https://mui.com/material-ui/getting-started/templates/";
for (const t of [
  { id: "mui-crud-dashboard", screen: "crud", dir: "crud-dashboard", rank: 1, title: "MUI CRUD dashboard", entrypoints: ["CrudDashboard.tsx"] },
  { id: "mui-dashboard", screen: "app-shell", dir: "dashboard", rank: 2, title: "MUI dashboard shell" },
  { id: "mui-marketing-page", screen: "marketing", dir: "marketing-page", rank: 1, title: "MUI marketing page" },
  { id: "mui-checkout", screen: "checkout", dir: "checkout", rank: 1, title: "MUI checkout" },
  { id: "mui-blog", screen: "blog", dir: "blog", rank: 1, title: "MUI blog" },
  { id: "mui-sign-in-side", screen: "auth", dir: "sign-in-side", rank: 1, title: "MUI sign-in (split)" },
]) {
  push({
    id: t.id,
    screen: t.screen,
    kit: "mui-material",
    title: t.title,
    path: `${muiBase}/${t.dir}`,
    preview: muiPreview,
    license: "MIT",
    kind: "source",
    startFrom: t.rank,
    ...(t.entrypoints ? { entrypoints: t.entrypoints } : {}),
  });
}

// ---- shadcn blocks and cited component sets ---------------------------------
// Curated, never wildcarded: the wildcard version indexed 70 chart demos and a
// dozen near-identical sidebars, drowning the rows anyone actually needs.
for (const t of [
  { name: "dashboard-01", screen: "dashboard", rank: 1, title: "shadcn dashboard-01 (sidebar, cards, chart, table)", required:["navigation","summary","chart","table"] },
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
    preview: t.name.includes("-0") ? `https://ui.shadcn.com/view/${t.name}` : `https://ui.shadcn.com/docs/components/${t.name.split("-")[0]}`,
    license: "MIT",
    kind: "source",
    startFrom: t.rank,
    scope: t.scope || "page",
    ...(t.required ? { reference: { required: t.required } } : {}),
    ...(t.jobs ? { jobs: t.jobs } : {}),
  });
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

// ---- Ant Design Pro — the densest real admin pages in the corpus ------------
for (const t of [
  { id: "antd-pro-list", screen: "queue", dir: "src/pages/list", rank: 2, title: "Ant Design Pro list / queue pages", jobs: ["queue", "list", "inbox"] },
  { id: "antd-pro-profile", screen: "record", dir: "src/pages/profile", rank: 1, title: "Ant Design Pro profile / record", jobs: ["record", "detail", "profile"] },
  { id: "antd-pro-settings", screen: "settings", dir: "src/pages/account/settings", rank: 1, title: "Ant Design Pro account settings", jobs: ["settings", "preferences", "account"] },
  { id: "antd-pro-step-form", screen: "wizard", dir: "src/pages/form/step-form", rank: 1, title: "Ant Design Pro step form", jobs: ["wizard", "steps", "onboarding"] },
  { id: "antd-pro-chatbot", screen: "chat", dir: "src/pages/chatbot", rank: 2, title: "Ant Design Pro chatbot page", jobs: ["chat"] },
  { id: "antd-pro-crud", screen: "crud", dir: "src/pages/table-list", rank: 2, title: "Ant Design Pro ProTable CRUD page", entrypoints: ["index.tsx"] },
  { id: "antd-pro-app", screen: "app-shell", dir: "src", rank: 3, title: "Ant Design Pro admin app" },
]) {
  if (!exists(`ant-design-pro/${t.dir}`)) continue;
  push({
    id: t.id,
    screen: t.screen,
    kit: "ant-design-pro",
    title: t.title,
    path: `ant-design-pro/${t.dir}`,
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: t.rank,
    ...(t.entrypoints ? { entrypoints: t.entrypoints } : {}),
    ...(t.jobs ? { jobs: t.jobs } : {}),
  });
}

// ---- one cite-able page per remaining major kit ------------------------------
const singles = [
  {
    id: "carbon-datatable", screen: "queue", kit: "carbon", rank: 1,
    title: "Carbon DataTable (toolbar-first, batch actions, dense)",
    path: "carbon/packages/react/src/components/DataTable",
    preview: "https://carbondesignsystem.com/components/data-table/usage/",
    license: "Apache-2.0", jobs: ["queue", "list", "inbox"], selectable: false,
    retiredReason: "Untitled UI replaced Carbon as Shine's table reference; retain this pack only for adversarial regression fixtures",
  },
  {
    id: "carbon-uishell", screen: "app-shell", kit: "carbon", rank: 4,
    title: "Carbon UIShell",
    path: "carbon/packages/react/src/components/UIShell",
    preview: "https://carbondesignsystem.com/components/UI-shell-header/usage/",
    license: "Apache-2.0",
  },
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

const jsonPath = join(SHINE, "corpus/templates.json");
writeFileSync(jsonPath, JSON.stringify(catalog, null, 2) + "\n");

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
md.push("| Screen | Id | Kit | Kind | Jobs |");
md.push("|---|---|---|---|---|");
for (const t of templates) {
  md.push(`| ${t.screen} | \`${t.id}\` | ${t.kit} | ${t.kind} | ${(t.jobs || []).join(", ")} |`);
}
md.push("");
md.push(`${templates.length} rows. Required screen coverage: ${REQUIRED.join(", ")}.`);
md.push("");
const mdPath = join(SHINE, "skill/references/templates.md");
writeFileSync(mdPath, md.join("\n") + "\n");

console.log(`templates.json: ${templates.length} rows; templates.md regenerated`);
