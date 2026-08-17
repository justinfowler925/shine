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

const REQUIRED = ["dashboard", "marketing", "auth", "checkout", "app-shell", "crud"];

const exists = (rel) => existsSync(join(CORPUS, rel));

const templates = [];
const push = (row) => {
  if (row.kind === "source" && !exists(row.path) && !existsSync(join(SHINE, row.path))) return;
  if ((row.kind === "query-only" || row.kind === "owned") && !exists(row.path)) return;
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
    if (name.startsWith("chart-")) return { screen: "charts", rank: 2, title: `shadcn ${name}` };
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
  { name: "empty-icon", rank: 3, title: "shadcn empty-icon (no-result / failure state)" },
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
  });
}

// ---- kits added in the AdminLTE-list expansion (index if present) ----------
if (exists("tremor/src")) {
  push({
    id: "tremor-dashboard",
    screen: "dashboard",
    kit: "tremor",
    title: "Tremor dashboard / KPI blocks",
    path: "tremor/src/components",
    preview: "https://tremor.so",
    license: "Apache-2.0",
    kind: "source",
    startFrom: 1,
  });
  // Tremor is the analytics default; demote shadcn dashboard-01.
  const shadcnDash = templates.find((t) => t.id === "shadcn-dashboard-01");
  if (shadcnDash) shadcnDash.startFrom = 3;
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
md.push("Run `node corpus/cite.mjs <screen|id>`, open every file it lists, copy structure, shine-paint.");
md.push("Naming an id without opening those files is inventing. Never clone vendor pixels.");
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
md.push("First match by `startFrom` wins unless the user names another id.");
md.push("");
md.push("## How to cite");
md.push("");
md.push("```sh");
md.push("node ~/Projects/shine/corpus/cite.mjs mui-crud-dashboard");
md.push("```");
md.push("");
md.push("Open every file it prints. Then:");
md.push("");
md.push("```");
md.push("Template: mui-crud-dashboard");
md.push("Path: mui-material/docs/data/material/getting-started/templates/crud-dashboard");
md.push("Opened: ~/design-corpus/…/Dashboard.tsx (and the rest cite.mjs listed)");
md.push("Paint: shine tokens. Structure cloned; Material purple is not.");
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
console.log(`templates: ${templates.length} rows → ${jsonPath}`);
console.log(`markdown:  ${mdPath}`);
if (missing.length) {
  console.error(`MISSING required screens: ${missing.join(", ")}`);
  process.exit(1);
}
