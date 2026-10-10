#!/usr/bin/env node
/**
 * Patch corpus/templates.json for HeroUI retirements + navbar jobs without a
 * full design-corpus reindex (Studio offline / public clone).
 * Mirrors index-kit-walk.mjs retirement policy.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(SHINE, "corpus/templates.json");
const catalog = JSON.parse(readFileSync(path, "utf8"));
const templates = catalog.templates || [];

const PRICING_GAP_REASON =
  "no public HeroUI pricing page (heroui.com/pricing → 404); honest named-kit gap until a real page exists";

const ALIAS = {
  "heroui-menu": "heroui-dropdown",
  "heroui-menu-item": "heroui-dropdown",
  "heroui-menu-section": "heroui-dropdown",
  "heroui-list-box-item": "heroui-list-box",
  "heroui-list-box-section": "heroui-list-box",
  "heroui-tag": "heroui-chip",
  "heroui-switch-group": "heroui-switch",
  "heroui-calendar-year-picker": "heroui-calendar",
  "heroui-color-input-group": "heroui-color-field",
  "heroui-date-input-group": "heroui-date-field",
};

// home/about/docs un-retired after page-true harvest; pricing stays gap.
const PAGE_TRUE_PREVIEWS = {
  "heroui-home": "https://www.heroui.com/",
  "heroui-about": "https://www.heroui.com/about",
  "heroui-docs": "https://www.heroui.com/docs",
  "heroui-blog": "https://www.heroui.com/blog",
};

let n = 0;
for (const row of templates) {
  if (row.id === "heroui-pricing") {
    row.selectable = false;
    row.retiredReason = PRICING_GAP_REASON;
    row.note = PRICING_GAP_REASON;
    row.preview = "https://www.heroui.com/pricing";
    n++;
    continue;
  }
  if (PAGE_TRUE_PREVIEWS[row.id]) {
    row.preview = PAGE_TRUE_PREVIEWS[row.id];
    delete row.selectable;
    delete row.retiredReason;
    row.note = `Page-true HeroUI harvest from ${PAGE_TRUE_PREVIEWS[row.id]}`;
    n++;
    continue;
  }
  if (ALIAS[row.id]) {
    row.selectable = false;
    row.retiredReason = `alias of ${ALIAS[row.id]} — shared parent docs demo shot; cite ${ALIAS[row.id]} instead`;
    row.note = `Retired alias — shared demo with ${ALIAS[row.id]}; do not cite as a distinct pack`;
    n++;
    continue;
  }
  if (row.id === "heroui-empty-state") {
    row.selectable = false;
    row.retiredReason =
      row.retiredReason ||
      "no public HeroUI docs page to harvest a real shot; use parent heroui-* or figma-heroui-*";
    n++;
    continue;
  }
  if (row.id === "heroui-header") {
    const jobs = new Set([...(row.jobs || []), "navbar", "nav", "header"]);
    row.jobs = [...jobs];
    n++;
  }
  if (row.id === "figma-tailgrids-form-elements") {
    const jobs = new Set([...(row.jobs || []), "forms", "form", "form-elements"]);
    row.jobs = [...jobs];
    n++;
  }
}

writeFileSync(path, JSON.stringify({ ...catalog, templates }, null, 2) + "\n");
console.log(`patch-heroui-catalog-retire: updated ${n} rows`);
