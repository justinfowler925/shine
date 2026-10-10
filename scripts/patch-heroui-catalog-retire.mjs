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

const CLONE_REASON =
  "homepage clone theater — docs/home/about/pricing shared one heroui.com PNG; retired until page-true unique shots are harvested";

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

const CLONES = new Set(["heroui-home", "heroui-about", "heroui-docs", "heroui-pricing"]);

let n = 0;
for (const row of templates) {
  if (CLONES.has(row.id)) {
    row.selectable = false;
    row.retiredReason = CLONE_REASON;
    row.note = CLONE_REASON;
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
