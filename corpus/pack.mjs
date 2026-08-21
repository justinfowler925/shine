#!/usr/bin/env node
// pack.mjs — emit visual DNA packs + executable voice CSS from templates.json
// and dna-families.json. A catalog row without a pack is a label, not DNA.
//
//   node corpus/pack.mjs
//   node corpus/pack.mjs --check   exit 1 if startFrom:1 packs are missing/stale

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = join(SHINE, "corpus/templates.json");
const FAMILIES = join(SHINE, "corpus/dna-families.json");
const PACKS = join(SHINE, "corpus/packs");
const VOICES = join(SHINE, "tokens/voices");
const CHECK = process.argv.includes("--check");

const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
const families = JSON.parse(readFileSync(FAMILIES, "utf8"));
const templates = catalog.templates ?? [];

const expand = (row) => {
  const kit = families[row.dna?.family] || families.shine;
  const dna = {
    ...kit,
    family: row.dna?.family || kit.family,
    density: row.dna?.density || kit.density,
    // keep string type for cite one-liner compatibility
    typeLabel: row.dna?.type || kit.type?.ui,
  };
  return dna;
};

const specimen = (row, dna) => {
  const r = dna.radius?.control ?? 4;
  const radius = `${r}px`;
  const font = (dna.css && dna.css["--shine-font-sans"]) || "system-ui, sans-serif";
  const duration = dna.motion?.modeMs ?? 150;
  const dense = dna.density === "dense";
  const hero = /marketing|hero/i.test(row.screen) || dna.family === "magicui";
  const table = /queue|crud|lex-queue/.test(row.screen) || dna.family === "carbon";
  const lex = dna.family === "slds" || /^lex-/.test(row.id);
  return `<!DOCTYPE html>
<!-- shine-lint: off color type shadow spacing — DNA specimen: pack paint, not house tokens. -->
<html lang="en" data-cite="${row.id}" data-dna-family="${dna.family}" data-dna-chroma="${dna.chroma?.accent >= 0.16 ? "high" : "low"}" data-shine-voice="kit-faithful"${lex ? ' data-shine-lane="lex"' : ""}${hero ? "" : table ? "" : ""}>
<head>
<meta charset="utf-8">
<title>${row.title || row.id} — shine DNA specimen</title>
<style>
  :root { color-scheme: ${hero ? "dark" : "light"}; }
  html, body { margin: 0; font-family: ${font}; font-size: ${dense ? "14px" : "16px"}; line-height: 1.4; }
  body { background: ${hero ? "#0a0a0a" : lex ? "#f3f3f3" : "#f4f4f4"}; color: ${hero ? "#fafafa" : "#161616"}; }
  * { box-sizing: border-box; border-radius: ${dna.family === "carbon" || lex ? "0" : radius}; }
  header.toolbar { display: flex; gap: 8px; align-items: center; padding: ${dense ? "8px 12px" : "12px 16px"}; border-bottom: 1px solid ${hero ? "#222" : "#e0e0e0"}; background: ${hero ? "#111" : "#fff"}; }
  h1 { font-size: ${hero ? "48px" : dense ? "18px" : "24px"}; letter-spacing: ${hero ? "-0.03em" : "0"}; margin: 0; font-weight: ${hero ? "500" : "600"}; }
  .hero { min-height: 40vh; display: grid; place-items: center; padding: 48px 24px; }
  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  th, td { text-align: left; padding: ${dense ? "6px 12px" : "10px 16px"}; border-bottom: 1px solid ${lex ? "#c9c9c9" : "#e0e0e0"}; }
  button[data-primary] { background: ${hero ? "#fff" : lex ? "#0176d3" : "#161616"}; color: ${hero ? "#111" : "#fff"}; border: 0; padding: 8px 14px; font: inherit; }
  .empty { padding: 48px 24px; text-align: left; }
  .record { display: grid; gap: 12px; padding: 16px; }
  .hl { background: #fff; padding: 12px; border: 1px solid #c9c9c9; }
</style>
</head>
<body>
${
  table
    ? `<header class="toolbar" data-cite="${row.id}"><strong>Queue</strong><button type="button">Filter</button><button type="button" data-primary>Batch</button></header>
<table data-cite="${row.id}"><thead><tr><th>Subject</th><th>Age</th><th>Action</th></tr></thead>
<tbody><tr><td>Acme stalled 21d</td><td>21d</td><td><button type="button" data-primary>Open</button></td></tr>
<tr><td>Globex close inside 14</td><td>3d</td><td><button type="button" data-primary>Open</button></td></tr></tbody></table>
<p class="empty" data-state="empty" hidden>Nothing needs you.</p>`
    : hero
      ? `<section class="hero" data-cite="${row.id}"><div><p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">Hero</p><h1>${row.title || "Display type is identity"}</h1><p>One line. One primary. Full-bleed visual.</p><p><button type="button" data-primary>Start</button></p></div></section>`
      : lex
        ? `<div class="record" data-cite="${row.id}">
  <div class="hl" data-region="highlights"><h1>Account · Acme</h1><p>ARR $120k · Owner you</p><button type="button" data-primary>Log activity</button></div>
  <div class="hl" data-region="path">Prospecting → Discovery → Proposal</div>
  <div class="hl" data-region="detail">Industry · Employees · Next step</div>
  <div class="hl" data-region="related">Opportunities (3) · Contacts (8)</div>
</div>`
        : `<header class="toolbar" data-cite="${row.id}"><h1>${row.title || row.id}</h1><button type="button" data-primary>Primary</button></header>
<main style="padding:24px" data-cite="${row.id}"><p>${dna.signature}</p><p>Density ${dna.density}. Motion ${duration}ms. Family ${dna.family}.</p></main>`
}
</body>
</html>
`;
};

const notes = (row, dna) => `# ${row.id}

Clone: ${dna.grid}. Signature: ${dna.signature}.
Do not clone: vendor logos, IBM blue / Material purple / Salesforce cloud as brand paint.
Voice: kit-faithful. Brand lane keeps regions, drops chrome.
Lanes: ${(dna.lane || []).join(", ")}.
Preview: ${row.preview || "(specimen only)"}.
`;

const regions = (row, dna) => {
  if (/queue|crud/.test(row.screen) || dna.family === "carbon") {
    return [
      { name: "toolbar", job: "filter, batch, primary", primary: true, pct: 8 },
      { name: "table", job: "ranked rows", primary: false, pct: 70 },
      { name: "empty", job: "success when zero", primary: false, pct: 0 },
    ];
  }
  if (/marketing|hero/.test(row.screen) || dna.family === "magicui") {
    return [
      { name: "hero", job: "thesis + one CTA + media", primary: true, pct: 55 },
      { name: "proof", job: "one supporting band", primary: false, pct: 25 },
    ];
  }
  if (/^lex-/.test(row.id) || dna.family === "slds") {
    return [
      { name: "highlights", job: "identity + one primary", primary: true, pct: 18 },
      { name: "path", job: "plot of the process", primary: false, pct: 8 },
      { name: "detail", job: "body fields", primary: false, pct: 40 },
      { name: "related", job: "index, not 14 API columns", primary: false, pct: 25 },
    ];
  }
  return [
    { name: "header", job: "title + one primary", primary: true, pct: 12 },
    { name: "focal", job: dna.signature, primary: false, pct: 60 },
  ];
};

const needPack = (t) =>
  t.startFrom === 1 ||
  t.kind === "pack" ||
  /^lex-/.test(t.id) ||
  ["empty", "pricing", "command-palette", "onboarding"].includes(t.screen);

const targets = templates.filter(needPack);
mkdirSync(PACKS, { recursive: true });
mkdirSync(VOICES, { recursive: true });

const missing = [];
const written = [];

for (const row of targets) {
  const dna = expand(row);
  const dir = join(PACKS, row.id);
  const files = {
    "dna.json": JSON.stringify(dna, null, 2) + "\n",
    "remap.json": JSON.stringify({ cite: row.id, css: dna.css || {} }, null, 2) + "\n",
    "regions.json": JSON.stringify(regions(row, dna), null, 2) + "\n",
    "notes.md": notes(row, dna),
    "specimen.html": specimen(row, dna),
  };
  if (CHECK) {
    if (!existsSync(dir)) {
      missing.push(`${row.id} (no pack dir)`);
      continue;
    }
    for (const [name, body] of Object.entries(files)) {
      const p = join(dir, name);
      if (!existsSync(p)) missing.push(`${row.id}/${name}`);
      else if (readFileSync(p, "utf8") !== body) missing.push(`${row.id}/${name} stale`);
    }
    continue;
  }
  mkdirSync(dir, { recursive: true });
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  written.push(row.id);
}

if (!CHECK) {
  for (const [family, spec] of Object.entries(families)) {
    const css = spec.css || {};
    const lines = [
      `/* GENERATED BY shine corpus/pack.mjs — voice pack ${family}. DO NOT EDIT. */`,
      `html[data-dna-family="${family}"], html[data-shine-voice="kit-faithful"][data-dna-family="${family}"] {`,
      ...Object.entries(css).map(([k, v]) => `  ${k}: ${v};`),
      `}`,
      "",
    ];
    writeFileSync(join(VOICES, `${family}.css`), lines.join("\n"));
  }
}

if (CHECK) {
  const extra = existsSync(PACKS)
    ? readdirSync(PACKS).filter((id) => !targets.some((t) => t.id === id) && !id.startsWith("."))
    : [];
  if (missing.length) {
    console.error(`pack --check: ${missing.slice(0, 8).join("; ")}${missing.length > 8 ? ` (+${missing.length - 8})` : ""}`);
    process.exit(1);
  }
  console.log(`pack --check: ${targets.length} packs current` + (extra.length ? `; extra dirs ${extra.join(",")}` : ""));
  process.exit(0);
}

console.log(`packs: ${written.length} → ${PACKS}`);
console.log(`voices: ${Object.keys(families).length} → ${VOICES}`);
