#!/usr/bin/env node
// cite.mjs — turn a job (in plain words) into a template you can actually see and read.
//
//   node corpus/cite.mjs dashboard
//   node corpus/cite.mjs "settings page"
//   node corpus/cite.mjs queue
//   node corpus/cite.mjs --list
//
// Output per match: the pack screenshot (read it first — pixels are the design),
// readable source files vendored in the pack (registry JSON is extracted if the
// pack is missing), the kit token sheet, and the preview URL.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { collectCorpusSource, packSourceFiles } from "./pack-files.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
const CATALOG = join(SHINE, "corpus/templates.json");
const EXTRACT = join(SHINE, "corpus/extracted");
const STOP = new Set(["a", "an", "the", "page", "screen", "view", "ui", "for", "of", "my", "our", "new"]);

const die = (code, msg) => {
  process.stderr.write(msg.endsWith("\n") ? msg : msg + "\n");
  process.exit(code);
};

if (!existsSync(CATALOG)) die(2, `cite: missing ${CATALOG}`);
const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
const templates = catalog.templates ?? [];

const arg = process.argv.slice(2).filter((a) => !a.startsWith("-")).join(" ").trim();
if (process.argv.includes("--list")) {
  process.stdout.write("screen\tid\tkind\tjobs\n");
  for (const t of templates) process.stdout.write(`${t.screen}\t${t.id}\t${t.kind}\t${(t.jobs || []).join(",")}\n`);
  process.exit(0);
}
if (!arg) {
  die(1, `usage: node corpus/cite.mjs <job, in plain words>\n       node corpus/cite.mjs --list`);
}

// ---- match: exact id/screen/job first, then token overlap --------------------
const tokens = arg
  .toLowerCase()
  .split(/[^a-z0-9]+/)
  .filter((t) => t && !STOP.has(t));

const score = (t) => {
  const jobs = (t.jobs ?? []).map((j) => j.toLowerCase());
  const words = new Set(
    [t.id, t.screen, ...jobs, ...(t.title || "").toLowerCase().split(/[^a-z0-9]+/)].flatMap((w) =>
      String(w).toLowerCase().split(/[^a-z0-9]+/),
    ),
  );
  let s = 0;
  const q = tokens.join("-");
  if (t.id === q || t.id === arg) s += 100;
  if (t.screen === q) s += 60;
  if (jobs.includes(q)) s += 60;
  for (const tok of tokens) {
    if (t.screen === tok) s += 40;
    if (jobs.includes(tok)) s += 40;
    else if (words.has(tok)) s += 10;
  }
  // "lightning record" used to tie lex-record (jobs: lightning+record = 80) with
  // antd-pro-profile (screen===record + jobs.record = 80); localeCompare then
  // preferred Ant. Host hints must beat a generic record screen.
  const HOST = new Set(["lightning", "lwc", "lex", "slds", "salesforce", "console"]);
  if (tokens.some((tok) => HOST.has(tok)) && (t.id.startsWith("lex-") || t.kit === "slds")) s += 80;
  if (tokens.some((tok) => HOST.has(tok)) && !t.id.startsWith("lex-") && t.kit !== "slds") s -= 20;
  const TABLE_JOB = new Set([
    "table",
    "datagrid",
    "datatable",
    "grid",
    "queue",
    "crud",
    "admin",
    "rows",
    "sources",
    "remainder",
  ]);
  if (tokens.some((tok) => TABLE_JOB.has(tok))) {
    if (t.screen === "crud" || t.screen === "queue" || /datatable|crud|datagrid/.test(t.id)) s += 50;
    if (t.screen === "app-shell" || t.screen === "dashboard" || t.screen === "list") s -= 25;
  }
  return s;
};

// Threshold 40 = at least one screen/job/id hit. Title-word overlap alone (10/token)
// must not resolve — "definitely-not-a-template" once matched a row via the word
// "template" in a title, which is how garbage queries get confident answers.
const ranked = templates
  .map((t) => ({ t, s: score(t) }))
  .filter((r) => r.s >= 40)
  .sort((a, b) => b.s - a.s || (a.t.startFrom ?? 99) - (b.t.startFrom ?? 99) || a.t.id.localeCompare(b.t.id));

if (!ranked.length) {
  const jobs = [...new Set(templates.flatMap((t) => t.jobs ?? []))].sort().join(", ");
  die(
    1,
    `cite: nothing matches ${JSON.stringify(arg)}\nknown jobs: ${jobs}\n` +
      `No row for this screen? Start from the nearest row + references/patterns.md; ` +
      `add a row (corpus/index-templates.mjs) after the screen ships, if it earned it.`,
  );
}

const row = ranked[0].t;
const alternates = ranked.slice(1, 3).map((r) => r.t).filter((t) => t.id !== row.id);

// ---- collect readable source --------------------------------------------------
// Prefer the vendored pack (shot + source/ + tokens.css). Fall back to the pinned
// corpus so materialize and a fresh clone without packs still work.
const packDir = join(SHINE, "corpus/packs", row.id);
const packSrc = packSourceFiles(packDir);
let files = packSrc;
let show = packSrc.slice(0, 3);
let extra = Math.max(0, packSrc.length - show.length);
let fromPack = packSrc.length > 0;

if (!fromPack) {
  const abs = row.path ? join(CORPUS, row.path) : "";
  if (row.kind === "source" && abs && !existsSync(abs)) {
    die(2, `cite: ${row.id} path missing: ${abs}\nrun: corpus/acquire.sh`);
  }
  const collected = collectCorpusSource(row, { corpus: CORPUS, extractDir: EXTRACT });
  files = collected.files;
  show = collected.show;
  extra = collected.extra;
}

// ---- pack (harvested pixels) ---------------------------------------------------
const shot = join(packDir, "shot.png");
const packTokens = join(packDir, "tokens.css");
const family = row.dna?.family || "shine";
const voiceCss = join(SHINE, "tokens/voices", `${family}.css`);

const out = [];
out.push(`Template: ${row.id} — ${row.title || ""}`);
out.push(`Kit: ${row.kit}   Kind: ${row.kind}   License: ${row.license || ""}`);
out.push(`Jobs: ${(row.jobs || []).join(", ")}`);
if (existsSync(shot)) {
  out.push(`Shot: ${shot}   ← read this image first; the pixels are the design`);
} else if (row.preview) {
  out.push(`Shot: none harvested yet — preview: ${row.preview}`);
} else if (row.kind === "blueprint") {
  out.push(`Shot: none — blueprint row; structure lives in ${row.note || "references/salesforce.md"}`);
}
if (existsSync(packTokens)) out.push(`Kit tokens: ${packTokens}`);
if (existsSync(voiceCss)) out.push(`Voice sheet: tokens/voices/${family}.css (import when kit-faithful)`);
out.push(`Family: ${family}   Density: ${row.dna?.density || ""}`);
if (show.length) {
  out.push(``);
  const srcKind = fromPack
    ? ", in the pack"
    : files.some((f) => f.startsWith(EXTRACT))
      ? ", extracted from registry JSON"
      : "";
  out.push(`Source (readable${srcKind}):`);
  for (const f of show) out.push(`  ${f}`);
  if (extra > 0) out.push(`  … ${extra} more in ${fromPack ? join(packDir, "source") : row.path || "the corpus"}`);
}
if (alternates.length) {
  out.push(``);
  out.push(`Also consider:`);
  for (const alt of alternates) out.push(`  ${alt.id} — ${alt.title || alt.screen} (node corpus/cite.mjs ${alt.id})`);
}
out.push(``);
out.push(`Copy the regions from the source; paint with the voice sheet / kit tokens (or house/brand lane). references/voices.md.`);
out.push(`Integration: node ${join(SHINE, "integrations/resolve.mjs")} --project <consumer-root> --kit ${family === "material" ? "mui" : family === "ant" ? "ant" : family === "carbon" ? "carbon" : family === "shadcn-zinc" ? "shadcn-tanstack" : "native"}`);
out.push(`Scaffold: node ${join(SHINE, "integrations/scaffold.mjs")} --project <consumer-root> --out <destination>`);
process.stdout.write(out.join("\n") + "\n");
process.exit(0);
