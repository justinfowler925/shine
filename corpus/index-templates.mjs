#!/usr/bin/env node
// index-templates.mjs — write corpus/templates.json + skill/references/templates.md
// from on-disk corpus, owned/, and query-only/. A new clone that is not in this
// index is invisible to the agent. Run from acquire.sh after pins land.
//
//   node corpus/index-templates.mjs
//   DESIGN_CORPUS=/path node corpus/index-templates.mjs

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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
  "lex-record-narrow",
];

const KIT_DNA = {
  "shadcn-registry": {
    family: "shadcn-zinc",
    density: "comfortable",
    type: "geist 14/16",
    radius: "lg",
    chroma: "low",
    elevation: "hairline+soft",
    motion: "150ms",
  },
  "mui-material": {
    family: "material",
    density: "comfortable",
    type: "roboto 14/16",
    radius: "md",
    chroma: "medium",
    elevation: "shadow-2",
    motion: "200ms",
  },
  tremor: {
    family: "tremor",
    density: "comfortable",
    type: "inter 14",
    radius: "md",
    chroma: "medium",
    elevation: "card",
    motion: "150ms",
  },
  "ant-design-pro": {
    family: "ant",
    density: "dense",
    type: "system 14",
    radius: "sm",
    chroma: "medium",
    elevation: "border",
    motion: "200ms",
  },
  "ant-design": {
    family: "ant",
    density: "dense",
    type: "system 14",
    radius: "sm",
    chroma: "medium",
    elevation: "border",
    motion: "200ms",
  },
  heroui: {
    family: "heroui",
    density: "comfortable",
    type: "inter 14",
    radius: "lg",
    chroma: "medium",
    elevation: "soft",
    motion: "200ms",
  },
  "chakra-ui": {
    family: "chakra",
    density: "comfortable",
    type: "inter 16",
    radius: "md",
    chroma: "medium",
    elevation: "shadow",
    motion: "200ms",
  },
  carbon: {
    family: "carbon",
    density: "dense",
    type: "ibm-plex 14",
    radius: "none",
    chroma: "low",
    elevation: "none",
    motion: "110ms",
  },
  mantine: {
    family: "mantine",
    density: "comfortable",
    type: "system 16",
    radius: "sm",
    chroma: "medium",
    elevation: "shadow",
    motion: "200ms",
  },
  fluentui: {
    family: "fluent",
    density: "comfortable",
    type: "segoe 14",
    radius: "md",
    chroma: "medium",
    elevation: "card",
    motion: "150ms",
  },
  "react-spectrum": {
    family: "spectrum",
    density: "comfortable",
    type: "adobe-clean 14",
    radius: "md",
    chroma: "medium",
    elevation: "well",
    motion: "200ms",
  },
  magicui: {
    family: "magicui",
    density: "editorial",
    type: "display",
    radius: "xl",
    chroma: "high",
    elevation: "glow",
    motion: "300ms",
  },
  shine: {
    family: "shine",
    density: "dense",
    type: "editorial 14/15",
    radius: "sm",
    chroma: "0.13-0.24",
    elevation: "hairline",
    motion: "150ms",
  },
  slds: {
    family: "slds",
    density: "compact",
    type: "salesforce-sans 13",
    radius: "sm",
    chroma: "medium",
    elevation: "slds-card",
    motion: "150ms",
  },
};

const SCREEN_JOBS = {
  dashboard: ["dashboard"],
  marketing: ["marketing", "marketing-hero"],
  auth: ["auth"],
  checkout: ["checkout", "wizard"],
  "app-shell": ["app-shell"],
  crud: ["crud", "queue"],
  queue: ["queue"],
  record: ["record", "detail"],
  chat: ["chat"],
  settings: ["settings"],
  wizard: ["wizard"],
  "ai-generate": ["ai-generate"],
  "marketing-hero": ["marketing-hero", "marketing"],
  empty: ["empty"],
  charts: ["charts"],
  "command-palette": ["command-palette"],
  "lex-record": ["lex-record", "record", "detail"],
  "lex-record-narrow": ["lex-record-narrow", "lex-record"],
  "lex-console": ["lex-console"],
  "lex-queue": ["lex-queue", "queue"],
  "lex-lwr": ["lex-lwr", "marketing"],
  "lex-email": ["lex-email", "email"],
  "lex-mobile": ["lex-mobile"],
};

const exists = (rel) => existsSync(join(CORPUS, rel));

const templates = [];
const push = (row) => {
  if (row.kind === "source" && !exists(row.path) && !existsSync(join(SHINE, row.path))) return;
  if ((row.kind === "query-only" || row.kind === "owned") && !exists(row.path)) return;
  if (!row.dna) row.dna = KIT_DNA[row.kit] || KIT_DNA.shine;
  if (!row.jobs) row.jobs = SCREEN_JOBS[row.screen] || [row.screen];
  templates.push(row);
};

// ---- MUI free templates (already in mui-material docs/data) ----------------
const muiBase = "mui-material/docs/data/material/getting-started/templates";
const muiPreview = "https://mui.com/material-ui/getting-started/templates/";
for (const t of [
  { id: "mui-crud-dashboard", screen: "crud", dir: "crud-dashboard", rank: 1, title: "MUI CRUD dashboard" },
  { id: "mui-dashboard", screen: "app-shell", dir: "dashboard", rank: 2, title: "MUI dashboard" },
  { id: "mui-dashboard-analytics", screen: "dashboard", dir: "dashboard", rank: 2, title: "MUI dashboard (analytics fallback)" },
  { id: "mui-marketing-page", screen: "marketing", dir: "marketing-page", rank: 1, title: "MUI marketing page" },
  { id: "mui-checkout", screen: "checkout", dir: "checkout", rank: 1, title: "MUI checkout" },
  { id: "mui-blog", screen: "blog", dir: "blog", rank: 1, title: "MUI blog" },
  { id: "mui-sign-in-side", screen: "auth", dir: "sign-in-side", rank: 1, title: "MUI sign-in (split)" },
  { id: "mui-sign-in", screen: "auth", dir: "sign-in", rank: 3, title: "MUI sign-in" },
  { id: "mui-sign-up", screen: "auth", dir: "sign-up", rank: 4, title: "MUI sign-up" },
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
  });
}

// ---- shadcn blocks ---------------------------------------------------------
const shadcnReg = join(CORPUS, "shadcn-registry/registry.json");
if (existsSync(shadcnReg)) {
  const items = JSON.parse(readFileSync(shadcnReg, "utf8")).items ?? [];
  const classify = (name) => {
    if (name === "dashboard-01") return { screen: "dashboard", rank: 1, title: "shadcn dashboard-01" };
    if (name === "sidebar-07") return { screen: "app-shell", rank: 1, title: "shadcn sidebar-07" };
    if (/^sidebar-\d+$/.test(name)) {
      const n = Number(name.split("-")[1]);
      return { screen: "app-shell", rank: 10 + n, title: `shadcn ${name}` };
    }
    if (name === "login-04") return { screen: "auth", rank: 2, title: "shadcn login-04" };
    if (/^login-\d+$/.test(name)) return { screen: "auth", rank: 10, title: `shadcn ${name}` };
    if (/^signup-\d+$/.test(name)) return { screen: "auth", rank: 11, title: `shadcn ${name}` };
    if (name.startsWith("chart-")) return { screen: "charts", rank: 80, title: `shadcn ${name}` };
    return null;
  };
  for (const item of items) {
    if (item.type !== "registry:block") continue;
    const c = classify(item.name);
    if (!c) continue;
    push({
      id: `shadcn-${item.name}`,
      screen: c.screen,
      kit: "shadcn-registry",
      title: c.title,
      path: `shadcn-registry/items/${item.name}.json`,
      preview: "https://ui.shadcn.com/blocks",
      license: "MIT",
      kind: "source",
      startFrom: c.rank,
    });
  }
}

// ---- ai-generate: prompt → run → review a produced artefact ----------------
// No single block covers this screen. The regions come from four shadcn examples
// (all registry:example, so the block loop above skips them). Cite the set, not one.
// Topology per ai-surfaces.md: instrumented session + inbox, never chat.
for (const t of [
  { name: "input-group-textarea", rank: 1, title: "shadcn input-group-textarea (prompt composer + submit addon)" },
  { name: "field-choice-card", rank: 2, title: "shadcn field-choice-card (quality tier as radio cards)" },
  { name: "empty-icon", rank: 3, title: "shadcn empty-icon (no-result / failure state)", jobs: ["empty", "ai-generate"] },
  { name: "item-image", rank: 4, title: "shadcn item-image (history strip row)" },
]) {
  push({
    id: `shadcn-${t.name}`,
    screen: "ai-generate",
    kit: "shadcn-registry",
    title: t.title,
    path: `shadcn-registry/items/${t.name}.json`,
    preview: "https://ui.shadcn.com/docs/components/input-group",
    license: "MIT",
    kind: "source",
    startFrom: t.rank,
    ...(t.jobs ? { jobs: t.jobs } : {}),
  });
}

// ---- kits added in the AdminLTE-list expansion (index if present) ----------
if (exists("tremor/src")) {
  // Atoms, not a page. Keep as a chart cite only — never the dashboard default.
  push({
    id: "tremor-dashboard",
    screen: "charts",
    kit: "tremor",
    title: "Tremor KPI / chart blocks",
    path: "tremor/src/components",
    preview: "https://tremor.so",
    license: "Apache-2.0",
    kind: "source",
    startFrom: 80,
    jobs: ["charts"],
  });
}

if (exists("ant-design-pro/src")) {
  push({
    id: "antd-pro-app",
    screen: "app-shell",
    kit: "ant-design-pro",
    title: "Ant Design Pro admin app",
    path: "ant-design-pro/src",
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: 3,
  });
  push({
    id: "antd-pro-crud",
    screen: "crud",
    kit: "ant-design-pro",
    title: "Ant Design Pro pages",
    path: "ant-design-pro/src/pages",
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: 2,
  });
}

if (exists("heroui-next-app/app")) {
  push({
    id: "heroui-next-app",
    screen: "app-shell",
    kit: "heroui",
    title: "HeroUI Next.js app template",
    path: "heroui-next-app",
    preview: "https://www.heroui.com",
    license: "MIT",
    kind: "source",
    startFrom: 4,
  });
}

if (exists("chakra-ui/apps/compositions")) {
  push({
    id: "chakra-compositions",
    screen: "app-shell",
    kit: "chakra-ui",
    title: "Chakra UI compositions",
    path: "chakra-ui/apps/compositions",
    preview: "https://chakra-ui.com",
    license: "MIT",
    kind: "source",
    startFrom: 5,
  });
}

// ---- previously unused pins: one cite-able full page per major kit ----------
if (exists("carbon/packages/react/src/components/DataTable")) {
  push({
    id: "carbon-datatable",
    screen: "queue",
    kit: "carbon",
    title: "Carbon DataTable (toolbar, batch, empty)",
    path: "carbon/packages/react/src/components/DataTable",
    preview: "https://carbondesignsystem.com/components/data-table/usage/",
    license: "Apache-2.0",
    kind: "source",
    startFrom: 1,
    jobs: ["queue"],
  });
}
if (exists("carbon/packages/react/src/components/UIShell")) {
  push({
    id: "carbon-uishell",
    screen: "app-shell",
    kit: "carbon",
    title: "Carbon UIShell",
    path: "carbon/packages/react/src/components/UIShell",
    preview: "https://carbondesignsystem.com/components/UI-shell-header/usage/",
    license: "Apache-2.0",
    kind: "source",
    startFrom: 7,
  });
}
if (exists("ant-design-pro/src/pages/list")) {
  push({
    id: "antd-pro-list",
    screen: "queue",
    kit: "ant-design-pro",
    title: "Ant Design Pro list / queue pages",
    path: "ant-design-pro/src/pages/list",
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: 2,
    jobs: ["queue"],
  });
}
if (exists("ant-design-pro/src/pages/profile")) {
  push({
    id: "antd-pro-profile",
    screen: "record",
    kit: "ant-design-pro",
    title: "Ant Design Pro profile / record",
    path: "ant-design-pro/src/pages/profile",
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: 1,
    jobs: ["record", "detail"],
  });
}
if (exists("ant-design-pro/src/pages/account/settings")) {
  push({
    id: "antd-pro-settings",
    screen: "settings",
    kit: "ant-design-pro",
    title: "Ant Design Pro account settings",
    path: "ant-design-pro/src/pages/account/settings",
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: 1,
    jobs: ["settings"],
  });
}
if (exists("ant-design-pro/src/pages/form/step-form")) {
  push({
    id: "antd-pro-step-form",
    screen: "wizard",
    kit: "ant-design-pro",
    title: "Ant Design Pro step form",
    path: "ant-design-pro/src/pages/form/step-form",
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: 1,
    jobs: ["wizard"],
  });
}
if (exists("ant-design-pro/src/pages/chatbot")) {
  push({
    id: "antd-pro-chatbot",
    screen: "chat",
    kit: "ant-design-pro",
    title: "Ant Design Pro chatbot page",
    path: "ant-design-pro/src/pages/chatbot",
    preview: "https://preview.pro.ant.design",
    license: "MIT",
    kind: "source",
    startFrom: 2,
    jobs: ["chat"],
  });
}
if (exists("react-spectrum/packages/@react-spectrum/ai/src")) {
  push({
    id: "spectrum-ai-chat",
    screen: "chat",
    kit: "react-spectrum",
    title: "React Spectrum AI Chat (Thread + PromptField)",
    path: "react-spectrum/packages/@react-spectrum/ai/src",
    preview: "https://react-spectrum.adobe.com",
    license: "Apache-2.0",
    kind: "source",
    startFrom: 1,
    jobs: ["chat"],
  });
}
if (exists("mantine/apps/mantine.dev/src/app-shell-examples/examples/FullLayout")) {
  push({
    id: "mantine-appshell",
    screen: "app-shell",
    kit: "mantine",
    title: "Mantine AppShell full layout",
    path: "mantine/apps/mantine.dev/src/app-shell-examples/examples/FullLayout",
    preview: "https://mantine.dev/app-shell",
    license: "MIT",
    kind: "source",
    startFrom: 6,
  });
}
if (exists("fluentui/packages/react-components/react-nav")) {
  push({
    id: "fluent-nav",
    screen: "settings",
    kit: "fluentui",
    title: "Fluent UI NavDrawer",
    path: "fluentui/packages/react-components/react-nav",
    preview: "https://react.fluentui.dev",
    license: "MIT",
    kind: "source",
    startFrom: 2,
    jobs: ["settings"],
  });
}
if (exists("magicui/apps/www/registry/magicui/hero-video-dialog.tsx")) {
  push({
    id: "magicui-hero",
    screen: "marketing-hero",
    kit: "magicui",
    title: "Magic UI hero (video dialog)",
    path: "magicui/apps/www/registry/magicui/hero-video-dialog.tsx",
    preview: "https://magicui.design",
    license: "MIT",
    kind: "source",
    startFrom: 1,
    jobs: ["marketing-hero"],
  });
}

// ---- in-repo DNA packs (no design-corpus path required) --------------------
for (const t of [
  {
    id: "shine-empty",
    screen: "empty",
    kit: "slds",
    title: "Empty state as a designed success",
    jobs: ["empty"],
    dna: KIT_DNA.slds,
  },
  {
    id: "shine-command-palette",
    screen: "command-palette",
    kit: "shadcn-registry",
    title: "Command palette (no motion, keyboard)",
    jobs: ["command-palette"],
    dna: KIT_DNA["shadcn-registry"],
  },
  {
    id: "lex-record",
    screen: "lex-record",
    kit: "slds",
    title: "Lightning record home (highlights, path, detail, related)",
    jobs: ["lex-record", "record", "detail"],
  },
  {
    id: "lex-record-narrow",
    screen: "lex-record-narrow",
    kit: "slds",
    title: "Lightning record LWC at ~494px host",
    jobs: ["lex-record-narrow", "lex-record"],
  },
  {
    id: "lex-console",
    screen: "lex-console",
    kit: "slds",
    title: "Lightning console + utility bar",
    startFrom: 1,
  },
  {
    id: "lex-queue",
    screen: "lex-queue",
    kit: "slds",
    title: "Lightning list / work queue (datatable contracts)",
    startFrom: 1,
  },
  {
    id: "lex-lwr",
    screen: "lex-lwr",
    kit: "slds",
    title: "Experience Cloud LWR (SLDS 2 unsupported)",
    startFrom: 1,
  },
  {
    id: "lex-email",
    screen: "lex-email",
    kit: "slds",
    title: "Salesforce HTML email (600px tables)",
    startFrom: 1,
  },
  {
    id: "lex-mobile",
    screen: "lex-mobile",
    kit: "slds",
    title: "Salesforce mobile / Mini (no datatable)",
    startFrom: 1,
  },
]) {
  push({
    id: t.id,
    screen: t.screen,
    kit: t.kit || "slds",
    title: t.title,
    path: `corpus/packs/${t.id}`,
    preview: "",
    license: "MIT",
    kind: "pack",
    startFrom: t.startFrom ?? 1,
    jobs: t.jobs || SCREEN_JOBS[t.screen],
    dna: t.dna || KIT_DNA.slds,
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

const defaults = REQUIRED.map((screen) => {
  const row = templates.filter((t) => t.screen === screen).sort((a, b) => a.startFrom - b.startFrom)[0];
  return { screen, row };
});

const md = [];
md.push("# Templates — start from a real page");
md.push("");
md.push("**catalog cite required.** Inventing a page is a Critical completeness hole.");
md.push("Run `node corpus/cite.mjs <job|screen|id>`, open every file it lists **and the Preview**,");
md.push("clone structure **and** visual DNA. Voice is kit-faithful unless house or brand — `voices.md`.");
md.push("Generated from `corpus/templates.json` — do not hand-edit; run `node corpus/index-templates.mjs`.");
md.push("");
md.push("## Default start-from");
md.push("");
md.push("| Screen | Id | Kit | Path |");
md.push("|---|---|---|---|");
for (const { screen, row } of defaults) {
  if (!row) md.push(`| ${screen} | MISSING | — | add a row |`);
  else md.push(`| ${screen} | \`${row.id}\` | ${row.kit} | \`${row.path}\` |`);
}
md.push("");
md.push("First match by `startFrom` wins unless the user names another id. Jobs (`queue`, `settings`, `chat`, …) resolve the same way.");
md.push("");
md.push("## How to cite");
md.push("");
md.push("```sh");
md.push("node ~/Projects/shine/corpus/cite.mjs queue");
md.push("```");
md.push("");
md.push("Open every file it prints, and the Preview. Then:");
md.push("");
md.push("```");
md.push("Template: carbon-datatable");
md.push("Voice: kit-faithful");
md.push("DNA: family=carbon density=dense type=ibm-plex 14 radius=none …");
md.push("Opened: ~/design-corpus/carbon/…/DataTable.tsx (and the rest cite.mjs listed)");
md.push("```");
md.push("");
md.push("Naming the id without running `cite.mjs` is not a cite. No row for this screen → `inspiration.md` (fill the catalog) then cite. Do not invent.");
md.push("");
md.push("## Full catalog");
md.push("");
md.push("| Id | Screen | Rank | Kit | Kind | Path |");
md.push("|---|---|---|---|---|---|");
for (const t of templates) {
  md.push(`| \`${t.id}\` | ${t.screen} | ${t.startFrom} | ${t.kit} | ${t.kind} | \`${t.path}\` |`);
}
md.push("");
md.push(`Indexed ${templates.length} templates from ${CORPUS}.`);
md.push("");

const mdPath = join(SHINE, "skill/references/templates.md");
writeFileSync(mdPath, md.join("\n"));

const missing = REQUIRED.filter((s) => !templates.some((t) => t.screen === s));
const missingDefault = REQUIRED.filter((s) => !templates.some((t) => t.screen === s && t.startFrom === 1));
console.log(`templates: ${templates.length} rows → ${jsonPath}`);
console.log(`markdown:  ${mdPath}`);
if (missing.length) {
  console.error(`MISSING required screens: ${missing.join(", ")}`);
  process.exit(1);
}
if (missingDefault.length) {
  console.error(`MISSING startFrom:1 for: ${missingDefault.join(", ")}`);
  process.exit(1);
}
