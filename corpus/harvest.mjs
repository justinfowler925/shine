#!/usr/bin/env node
// harvest.mjs — real pixels for the catalog. Phase 2 of docs/unfuck-plan.md.
//
//   node corpus/harvest.mjs             # harvest everything with a target
//   node corpus/harvest.mjs <id> [...]  # just these rows
//
// For each catalog row with a harvest target this renders the REAL screen —
// the live template preview, the kit's own demo — and stores a full-page
// screenshot in corpus/packs/<id>/shot.png plus meta.json (source URL, date,
// bytes). cite.mjs surfaces the shot; compare.mjs composites against it; the
// doctor fails any pack whose shot is missing or too small to be a real screen.
//
// Needs network once. Rows with no public renderable target (LEX blueprints,
// packages with no hosted demo) are SKIPPED AND NAMED — a silent cap reads as
// "covered everything" when it didn't.

import { existsSync, mkdirSync, statSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { load } from "../verify/deps.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = join(SHINE, "corpus/packs");
const MIN_BYTES = 30_000;

// mode: "full" = full-page (capped), "viewport" = first screen only (marketing heroes).
// expect: a selector that must exist, or the shot is a 404/consent-wall in disguise.
const TARGETS = {
  "shadcn-dashboard-01": { url: "https://ui.shadcn.com/view/new-york-v4/dashboard-01", mode: "full", expect: "table, [data-slot=sidebar]" },
  "shadcn-sidebar-07": { url: "https://ui.shadcn.com/view/new-york-v4/sidebar-07", mode: "full", expect: "[data-slot=sidebar], aside" },
  "shadcn-login-04": { url: "https://ui.shadcn.com/view/new-york-v4/login-04", mode: "full", expect: "input" },
  "shadcn-command": { url: "https://ui.shadcn.com/docs/components/command", mode: "full", expect: "[cmdk-root], main" },
  "shadcn-input-group-textarea": { url: "https://ui.shadcn.com/docs/components/input-group", mode: "full", expect: "textarea, main" },
  "shadcn-field-choice-card": { url: "https://ui.shadcn.com/docs/components/field", mode: "full", expect: "main" },
  "shadcn-empty-icon": { url: "https://ui.shadcn.com/docs/components/empty", mode: "full", expect: "main" },
  "mui-crud-dashboard": { url: "https://mui.com/material-ui/getting-started/templates/crud-dashboard/", mode: "full", expect: "main, .MuiBox-root" },
  "mui-dashboard": { url: "https://mui.com/material-ui/getting-started/templates/dashboard/", mode: "full", expect: "main, .MuiBox-root" },
  "mui-marketing-page": { url: "https://mui.com/material-ui/getting-started/templates/marketing-page/", mode: "full", expect: "main, .MuiBox-root" },
  "mui-checkout": { url: "https://mui.com/material-ui/getting-started/templates/checkout/", mode: "full", expect: "main, .MuiBox-root" },
  "mui-blog": { url: "https://mui.com/material-ui/getting-started/templates/blog/", mode: "full", expect: "main, .MuiBox-root" },
  "mui-sign-in-side": { url: "https://mui.com/material-ui/getting-started/templates/sign-in-side/", mode: "full", expect: "input" },
  "antd-pro-app": { url: "https://preview.pro.ant.design/dashboard/analysis", mode: "full", expect: ".ant-pro-layout, .ant-layout" },
  "antd-pro-list": { url: "https://preview.pro.ant.design/list/table-list", mode: "full", expect: ".ant-table, .ant-pro-table" },
  "antd-pro-crud": { url: "https://preview.pro.ant.design/list/table-list", mode: "full", expect: ".ant-table, .ant-pro-table" },
  "antd-pro-profile": { url: "https://preview.pro.ant.design/profile/basic", mode: "full", expect: ".ant-descriptions, .ant-layout" },
  "antd-pro-settings": { url: "https://preview.pro.ant.design/account/settings", mode: "full", expect: ".ant-layout" },
  "antd-pro-step-form": { url: "https://preview.pro.ant.design/form/step-form", mode: "full", expect: ".ant-steps, .ant-layout" },
  "carbon-datatable": { url: "https://react.carbondesignsystem.com/iframe.html?id=components-datatable-batch-actions--default&viewMode=story", mode: "full", expect: "table" },
  "carbon-uishell": { url: "https://react.carbondesignsystem.com/iframe.html?id=components-ui-shell-header--header-w-navigation&viewMode=story", mode: "viewport", expect: "header" },
  "mantine-appshell": { url: "https://mantine.dev/app-shell/?e=FullLayout", mode: "viewport", expect: "a" },
  "fluent-nav": { url: "https://react.fluentui.dev/?path=/docs/components-navdrawer--docs", mode: "viewport", expect: "iframe" },
  "magicui-hero": { url: "https://magicui.design", mode: "viewport", expect: "h1" },
  "tremor-charts": { url: "https://tremor.so", mode: "viewport", expect: "h1" },
  "heroui-next-app": { url: "https://www.heroui.com", mode: "viewport", expect: "h1" },
};

const catalog = JSON.parse(readFileSync(join(SHINE, "corpus/templates.json"), "utf8"));
const rows = catalog.templates ?? [];
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const wanted = rows.filter((r) => (only.length ? only.includes(r.id) : true));

const { chromium } = load("playwright");
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});

const harvested = [];
const skipped = [];
const failed = [];

for (const row of wanted) {
  const t = TARGETS[row.id];
  if (!t) {
    if (row.kind !== "query-only") skipped.push(`${row.id} (${row.kind}${row.kind === "blueprint" ? ": no public renderable target" : ": no harvest target mapped"})`);
    continue;
  }
  const dir = join(PACKS, row.id);
  const shot = join(dir, "shot.png");
  try {
    const page = await ctx.newPage();
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(1_200); // let charts/fonts settle
    const found = await page.locator(t.expect).first().count();
    if (!found) throw new Error(`expected selector ${JSON.stringify(t.expect)} not found — wrong page?`);
    // kill animations so the shot is stable
    await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
    mkdirSync(dir, { recursive: true });
    if (t.mode === "viewport") {
      await page.screenshot({ path: shot });
    } else {
      await page.screenshot({ path: shot, fullPage: true });
    }
    await page.close();
    const bytes = statSync(shot).size;
    if (bytes < MIN_BYTES) {
      rmSync(shot);
      throw new Error(`shot only ${bytes}B — not a real screen`);
    }
    writeFileSync(
      join(dir, "meta.json"),
      JSON.stringify({ id: row.id, source: t.url, harvested: new Date().toISOString().slice(0, 10), bytes }, null, 2) + "\n",
    );
    harvested.push(`${row.id} (${Math.round(bytes / 1024)}KB)`);
    console.log(`ok    ${row.id}  ${Math.round(bytes / 1024)}KB  ${t.url}`);
  } catch (e) {
    failed.push(`${row.id}: ${e.message.split("\n")[0]}`);
    console.error(`FAIL  ${row.id}  ${e.message.split("\n")[0]}`);
  }
}

await browser.close();

console.log(`\nharvest: ${harvested.length} harvested, ${skipped.length} skipped, ${failed.length} failed`);
if (skipped.length) console.log(`skipped (named, not silent):\n  ${skipped.join("\n  ")}`);
if (failed.length) {
  console.error(`failed:\n  ${failed.join("\n  ")}`);
  process.exit(1);
}
