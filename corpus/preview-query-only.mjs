#!/usr/bin/env node
// preview-query-only.mjs — screenshot public store/gallery pages into
// ~/design-corpus/query-only/. Agents may cite these for layout; they may not
// copy source. Paid kits without an Atlas license live here.
//
//   node corpus/preview-query-only.mjs

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { load } from "../verify/deps.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
const OUT = join(CORPUS, "query-only");
const manifest = JSON.parse(readFileSync(join(SHINE, "corpus/query-only.json"), "utf8"));

mkdirSync(OUT, { recursive: true });

const { chromium } = load("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const results = [];
for (const row of manifest.templates) {
  const dest = join(CORPUS, row.path);
  try {
    await page.goto(row.preview, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: dest, fullPage: false });
    results.push({ id: row.id, ok: true, dest });
    console.log(`ok  ${row.id}  ${row.preview}`);
  } catch (e) {
    results.push({ id: row.id, ok: false, error: String(e.message || e) });
    console.error(`fail ${row.id}  ${e.message || e}`);
  }
}

await browser.close();
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ generated: new Date().toISOString(), results }, null, 2) + "\n");
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`${failed.length} of ${results.length} previews failed`);
  process.exit(1);
}
console.log(`query-only: ${results.length} screenshots → ${OUT}`);
