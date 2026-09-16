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
import {hash,inspectReferencePage} from './reference-health.mjs';
import { load } from "../verify/deps.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = join(SHINE, "corpus/packs");
const MIN_BYTES = 30_000;
const MIN_BYTES_COMPONENT = 8_000;

// mode: "full" = full-page (capped), "viewport" = first screen only (marketing heroes).
// expect: a selector that must exist, or the shot is a 404/consent-wall in disguise.
const TARGETS = {
  "shadcn-dashboard-01": { url: "https://ui.shadcn.com/view/new-york-v4/dashboard-01", mode: "full", expect: "table, [data-slot=sidebar]" },
  "shadcn-sidebar-07": { url: "https://ui.shadcn.com/view/new-york-v4/sidebar-07", mode: "full", expect: "[data-slot=sidebar], aside" },
  "shadcn-login-04": { url: "https://ui.shadcn.com/view/new-york-v4/login-04", mode: "full", expect: "input" },
  "shadcn-command": { url: "https://ui.shadcn.com/docs/components/command", mode: "full", expect: "[cmdk-root], main" },
  "shadcn-input-group-textarea": { url: "https://ui.shadcn.com/docs/components/input-group", mode: "full", expect: "textarea, main" },
  "shadcn-field-choice-card": { url: "https://ui.shadcn.com/docs/components/field", mode: "full", expect: "[data-slot=field], [role=radiogroup], main", expectedText: "Field" },
  "shadcn-empty-icon": { url: "https://ui.shadcn.com/docs/components/empty", mode: "full", expect: "[data-slot=empty], main", expectedText: "Empty" },
  "mantine-appshell": { url: "https://mantine.dev/app-shell/?e=FullLayout", mode: "viewport", expect: "a", expectedText: "AppShell" },
  "fluent-nav": { url: "https://react.fluentui.dev/?path=/docs/components-navdrawer--docs", mode: "full", expect: "iframe, #storybook-root, main" },
  "magicui-hero": { url: "https://magicui.design/docs/components/hero-video-dialog", mode: "full", expect: "pre, h1", expectedText: "Hero Video Dialog" },
  "tremor-charts": { url: "https://blocks.tremor.so/blocks", mode: "full", expect: "h1, main, [class*='tremor']" },
  "heroui-next-app": { url: "https://www.heroui.com/docs/components/navbar", mode: "full", expect: "nav, header, main" },
  "spectrum-ai-chat": { url: "https://react-spectrum.adobe.com/s2/index.html", mode: "full", expect: "main, h1, nav", expectedText: "Spectrum" },
  "lex-record": { url: "https://www.lightningdesignsystem.com/components/page-headers/", mode: "full", expect: "h1, main, .slds-page-header, article", expectedText: "Page Header" },
  "lex-record-narrow": { url: "https://www.lightningdesignsystem.com/components/page-headers/", mode: "viewport", expect: "h1, main, .slds-page-header, article", expectedText: "Page Header", viewport: { width: 494, height: 900 } },
  "lex-queue": { url: "https://www.lightningdesignsystem.com/components/data-tables/", mode: "full", expect: "h1, table, main", expectedText: "Data Table" },
  "lex-console": { url: "https://www.lightningdesignsystem.com/components/tabs/", mode: "full", expect: "h1, main", expectedText: "Tabs" },
  "lex-email": { // SLDS 2 dropped the email guideline page; Salesforce Help's Lightning email
  // template article is the remaining public reference for the 600px-table shape.
  url: "https://help.salesforce.com/s/articleView?id=sf.email_templates_lightning.htm&type=5", mode: "full", waitUntil: "load", settleMs: 9_000, expect: "h1, main, article", expectedText: "Email" },
  "lex-mobile": { url: "https://www.lightningdesignsystem.com/2e1ef8501/p/391e54-mobile-design", mode: "viewport", waitUntil: "load", expect: "h1, main, article", expectedText: "Mobile", viewport: { width: 390, height: 844 } },
  "lex-lwr": { url: "https://www.lightningdesignsystem.com/2e1ef8501/p/355656-patterns", mode: "full", expect: "h1, main, article", expectedText: "Lightning" },
};

// shadcn blocks are harvested from their own standalone preview route rather
// than 97 hand-written TARGETS entries: the catalog row already carries the
// canonical URL, so the mapping is data, not a table to maintain.
const shadcnTarget = (row) => (
  row.kit === "shadcn-registry" && /^https:\/\/ui\.shadcn\.com\/view\//.test(row.preview || "")
    // A bare `body` proves nothing (captureHealth rejects it, which is why every
    // shadcn pack stayed a legacy capture): name the block's rendered control.
    ? { url: row.preview, mode: "full", expect: /^chart-/.test(row.id.slice("shadcn-".length)) ? "svg.recharts-surface, [data-chart], svg" : /^(login|signup)-/.test(row.id.slice("shadcn-".length)) ? "form input, input" : "[data-slot=sidebar], aside, [data-slot]" }
    : null
);

// Untitled UI, Magic UI and cult-ui rows carry their public component page as
// `preview`, so like shadcn they are mapped from data rather than a table. Each
// page renders the row's examples; the selector names the rendered-examples
// region so a 404, consent wall or rate-limit page cannot pass as a reference.
const kitTarget = (row) => {
  const url = row.preview || "";
  if (row.kit === "untitled-ui-react" && /^https:\/\/www\.untitledui\.com\/react\/components\/[a-z0-9-]+$/.test(url))
    // Every component page anchors its sections (h2[id]); the examples heading's id
    // varies by page, so the anchored heading is the stable, semantic expectation.
    return { url, mode: "full", expect: "main h2[id], h2[id]" };
  if (row.kit === "magicui" && /^https:\/\/magicui\.design\/docs\/components\/[a-z0-9-]+$/.test(url))
    return { url, mode: "full", expect: "pre" };
  if (row.kit === "cult-ui" && /^https:\/\/www\.cult-ui\.com\/docs\/components\/[a-z0-9-]+$/.test(url))
    return { url, mode: "full", expect: "pre" };
  return null;
};

// Sites rate-limit bursts (cult-ui answers 429 to curl-speed traffic). Space the
// requests and retry a non-2xx or network failure with backoff before recording
// a failed review.
const PAUSE_MS = Number(process.env.SHINE_HARVEST_PAUSE_MS || 1500);
const ATTEMPTS = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const t = TARGETS[row.id] || shadcnTarget(row) || kitTarget(row);
  if (!t) {
    if (row.kind !== "query-only") skipped.push(`${row.id} (${row.kind}${row.kind === "blueprint" ? ": no public renderable target" : ": no harvest target mapped"})`);
    continue;
  }
  const dir = join(PACKS, row.id);
  const shot = join(dir, "shot.png");
  try {
    let page, response, capture, lastError;
    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
      page = await ctx.newPage();
      if (t.viewport) await page.setViewportSize(t.viewport);
      try {
        // zeroheight pages keep a websocket open, so networkidle never arrives; a
        // target may name a lighter load state.
        response = await page.goto(t.url, { waitUntil: t.waitUntil || "networkidle", timeout: 45_000 });
        await page.waitForTimeout(t.settleMs || 1_200); // let charts/fonts (or a slow SPA) settle
        capture = await inspectReferencePage(page, response, { url: t.url, expect: t.expect, expectedText: t.expectedText });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        await page.close();
        // Only transport failures are worth a retry; a missing selector is the same
        // answer every time.
        if (attempt === ATTEMPTS || !/HTTP \d|timeout|net::|navigation|challenge|just a moment/i.test(error.message)) throw error;
        console.warn(`retry ${row.id} (${attempt}/${ATTEMPTS}): ${error.message.split("\n")[0]}`);
        await sleep(PAUSE_MS * attempt * 4);
      }
    }
    if (lastError) throw lastError;
    const found = await page.locator(t.expect).first().count();
    if (!found) throw new Error(`expected selector ${JSON.stringify(t.expect)} not found — wrong page?`);
    // kill animations so the shot is stable
    await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
    mkdirSync(dir, { recursive: true });
    if (t.frame) {
      const frame = page.locator("iframe").first();
      await frame.waitFor({ state: "visible", timeout: 15_000 });
      await frame.screenshot({ path: shot });
    } else if (t.mode === "viewport") {
      await page.screenshot({ path: shot });
    } else {
      await page.screenshot({ path: shot, fullPage: true });
    }
    await page.close();
    const bytes = statSync(shot).size;
    const floor = (row.scope === "component" || row.screen === "auth") ? MIN_BYTES_COMPONENT : MIN_BYTES;
    if (bytes < floor) {
      rmSync(shot);
      throw new Error(`shot only ${bytes}B — under the ${floor}B floor for ${row.scope || "page"} scope, not a real screen`);
    }
    writeFileSync(
      join(dir, "meta.json"),
      JSON.stringify({ id: row.id, source: t.url, harvested: new Date().toISOString().slice(0, 10), bytes, capture:{...capture,shotSha256:hash(readFileSync(shot))} }, null, 2) + "\n",
    );
    harvested.push(`${row.id} (${Math.round(bytes / 1024)}KB)`);
    console.log(`ok    ${row.id}  ${Math.round(bytes / 1024)}KB  ${t.url}`);
    await sleep(PAUSE_MS);
  } catch (e) {
    mkdirSync(dir,{recursive:true});
    const metaPath=join(dir,'meta.json');
    const prior=existsSync(metaPath)?JSON.parse(readFileSync(metaPath,'utf8')):{};
    writeFileSync(metaPath,JSON.stringify({...prior,review:{status:'failed',reason:e.message.split('\n')[0],at:new Date().toISOString()}},null,2)+'\n');
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
