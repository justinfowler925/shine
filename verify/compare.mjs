#!/usr/bin/env node
// compare.mjs — side-by-side pixels + measured facts. No verdict, no score.
//
//   node verify/compare.mjs <page.html|url> --cite <id> [--out /tmp/compare.png]
//
// Renders the page, composites it beside the cited template's harvested shot
// (corpus/packs/<id>/shot.png), and prints measured facts: computed fonts, heading
// sizes, control radii, and the dominant palette of each image. The judgment is
// made by whoever looks at the composite — this tool only makes looking cheap and
// the facts checkable.
//
// It REFUSES to run without the template's real shot (exit 2). Its predecessor
// (critic.mjs) scored "likeness" by grepping the page source for data-* attributes:
// a one-button page with three attributes scored 10/10 against the Carbon datatable.
// A comparison that never looks at pixels trains attribute-stamping, so this tool
// does not exist until the pixels do.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import { load } from "./deps.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};
const target = args.find((a, i) => !a.startsWith("-") && (i === 0 || !args[i - 1].startsWith("--")));
const citeId = opt("--cite");
const outPath = opt("--out") || "/tmp/shine-compare.png";

if (!target || !citeId) {
  console.error("usage: node verify/compare.mjs <page.html|url> --cite <id> [--out out.png]");
  process.exit(2);
}

const shotPath = join(SHINE, "corpus/packs", citeId, "shot.png");
if (!existsSync(shotPath)) {
  console.error(
    `compare: no harvested shot for ${citeId} (${shotPath} missing).\n` +
      `Refusing to compare against nothing — a comparison without pixels is the old lie.\n` +
      `Harvest first (corpus/harvest.mjs), or open the row's preview URL and judge by eye.`,
  );
  process.exit(2);
}

const { chromium } = load("playwright");
const sharp = load("sharp");

const url = /^https?:/.test(target) ? target : pathToFileURL(resolve(target)).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts?.ready);

const facts = await page.evaluate(() => {
  const style = (el) => getComputedStyle(el);
  const body = style(document.body);
  const headings = [...document.querySelectorAll("h1,h2,h3")].map((h) => ({
    tag: h.tagName.toLowerCase(),
    px: parseFloat(style(h).fontSize),
    weight: style(h).fontWeight,
    tracking: style(h).letterSpacing,
  }));
  const controls = [...document.querySelectorAll("button, [role=button], input, select")]
    .slice(0, 12)
    .map((el) => ({ radius: style(el).borderRadius, bg: style(el).backgroundColor }));
  return {
    bodyFont: body.fontFamily,
    bodySize: body.fontSize,
    bodyBg: body.backgroundColor,
    bodyColor: body.color,
    headings: headings.slice(0, 6),
    controls,
  };
});

const pageShotBuf = await page.screenshot({ fullPage: true });
await browser.close();

// dominant palette: downsample hard, count quantized colors
const palette = async (buf) => {
  const { data, info } = await sharp(buf).resize(64, 64, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  const counts = new Map();
  for (let i = 0; i + 2 < data.length; i += info.channels) {
    const key = [data[i], data[i + 1], data[i + 2]].map((c) => Math.round(c / 24) * 24).join(",");
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([rgb, n]) => ({ rgb: `rgb(${rgb})`, pct: Math.round((n / total) * 100) }));
};

const templateBuf = readFileSync(shotPath);
const [pagePal, tmplPal] = await Promise.all([palette(pageShotBuf), palette(templateBuf)]);

// composite side by side at equal widths
const W = 800;
const a = await sharp(pageShotBuf).resize({ width: W }).png().toBuffer();
const b = await sharp(templateBuf).resize({ width: W }).png().toBuffer();
const [ma, mb] = await Promise.all([sharp(a).metadata(), sharp(b).metadata()]);
const H = Math.max(ma.height, mb.height);
await sharp({ create: { width: W * 2 + 24, height: H, channels: 3, background: { r: 24, g: 24, b: 24 } } })
  .composite([
    { input: a, left: 0, top: 0 },
    { input: b, left: W + 24, top: 0 },
  ])
  .png()
  .toFile(outPath);

const fmtPal = (p) => p.map((c) => `${c.rgb} ${c.pct}%`).join("  ");
console.log(`compare: ${outPath}   (left: your page — right: ${citeId})`);
console.log(`page   font: ${facts.bodyFont} @ ${facts.bodySize}   bg ${facts.bodyBg}   fg ${facts.bodyColor}`);
for (const h of facts.headings) console.log(`page   ${h.tag}: ${h.px}px w${h.weight} tracking ${h.tracking}`);
if (facts.controls.length) {
  const radii = [...new Set(facts.controls.map((c) => c.radius))].slice(0, 4).join(", ");
  console.log(`page   control radii: ${radii}`);
}
console.log(`page   palette: ${fmtPal(pagePal)}`);
console.log(`template palette: ${fmtPal(tmplPal)}`);
console.log(`Read the composite. If the two sides do not read as relatives, the retrieve or the paint is wrong.`);
