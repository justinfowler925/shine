#!/usr/bin/env node
// cite.mjs — turn a job (in plain words) into a template you can actually see and read.
//
//   node corpus/cite.mjs dashboard
//   node corpus/cite.mjs "settings page"
//   node corpus/cite.mjs queue
//   node corpus/cite.mjs --list
//
// Output per match: the pack screenshot when harvested (read it first — pixels are
// the design), readable source files (registry JSON is extracted to real .tsx on
// the fly), the kit's voice sheet, and the preview URL. No liturgy: the files are
// listed because they are useful, not because reading them is a ritual.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
const CATALOG = join(SHINE, "corpus/templates.json");
const EXTRACT = join(SHINE, "corpus/extracted");
const CODE = /\.(tsx|ts|jsx|js|mdx|html|css)$/;
const SKIP = /(?:^|\/)(?:test|tests|__tests__)|\.test\.|\.spec\.|\.stories\.|-test\./i;
const PREFER =
  /(?:^|\/)(readme|page|layout|app|index|dashboard|data-table|datatable|chat|settings|wizard|profile|shell)/i;
const DEMOTE = /(?:^|\/)(card|badge|accordion|checkbox|calendar|divider)\./i;
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
// shadcn registry items embed TSX as JSON strings with a 28k-char longest line —
// unreadable through any file reader. Extract to real files once, list those.
const listed = [];

const extractRegistryItem = (jsonPath, id) => {
  const outDir = join(EXTRACT, id);
  const item = JSON.parse(readFileSync(jsonPath, "utf8"));
  const files = item.files ?? [];
  if (!files.length) return [jsonPath];
  const out = [];
  for (const f of files) {
    if (!f.path || typeof f.content !== "string") continue;
    const rel = f.path.replace(/^registry\/[^/]+\//, "");
    const dest = join(outDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    // idempotent: rewrite only when stale
    if (!existsSync(dest) || readFileSync(dest, "utf8") !== f.content) writeFileSync(dest, f.content);
    out.push(dest);
  }
  return out.length ? out : [jsonPath];
};

const walk = (dir, acc, depth = 0) => {
  if (acc.length >= 60 || depth > 4) return;
  let ents = [];
  try {
    ents = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  const names = new Set(ents.filter((e) => e.isFile()).map((e) => e.name));
  for (const e of ents) {
    if (!e.isFile() || !CODE.test(e.name) || SKIP.test(e.name) || SKIP.test(join(dir, e.name))) continue;
    if (e.name.endsWith(".js") && names.has(e.name.slice(0, -3) + ".tsx")) continue;
    acc.push(join(dir, e.name));
  }
  const readme = ents.find((e) => e.isFile() && /^readme/i.test(e.name));
  if (readme) acc.push(join(dir, readme.name));
  for (const e of ents.filter(
    (e) => e.isDirectory() && !["node_modules", ".git", "__tests__", "test", "tests"].includes(e.name),
  )) {
    walk(join(dir, e.name), acc, depth + 1);
  }
};

const rank = (p) => {
  const base = p.split("/").pop() || p;
  if (/^readme/i.test(base)) return 1;
  if (/^page\./i.test(base)) return 0;
  if (PREFER.test(base)) return 2;
  if (DEMOTE.test(base)) return 4;
  return 3;
};

const abs = row.path ? join(CORPUS, row.path) : "";
if (row.kind === "source" && abs && existsSync(abs)) {
  if (abs.endsWith(".json")) listed.push(...extractRegistryItem(abs, row.id));
  else if (statSync(abs).isDirectory()) walk(abs, listed);
  else listed.push(abs);
} else if (row.kind === "query-only" && abs) {
  listed.push(abs);
} else if (row.kind === "source" && abs) {
  die(2, `cite: ${row.id} path missing: ${abs}\nrun: corpus/acquire.sh`);
}

const files = [...new Set(listed)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
const show = files.slice(0, 10);
const extra = files.length - show.length;

// ---- pack (harvested pixels) ---------------------------------------------------
const packDir = join(SHINE, "corpus/packs", row.id);
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
  out.push(`Source (readable${files.some((f) => f.startsWith(EXTRACT)) ? ", extracted from registry JSON" : ""}):`);
  for (const f of show) out.push(`  ${f}`);
  if (extra > 0) out.push(`  … ${extra} more — rg under ${abs}`);
}
if (alternates.length) {
  out.push(``);
  out.push(`Also consider:`);
  for (const alt of alternates) out.push(`  ${alt.id} — ${alt.title || alt.screen} (node corpus/cite.mjs ${alt.id})`);
}
out.push(``);
out.push(`Copy the regions from the source; paint with the voice sheet / kit tokens (or house/brand lane). references/voices.md.`);
process.stdout.write(out.join("\n") + "\n");
process.exit(0);
