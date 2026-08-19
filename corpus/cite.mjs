#!/usr/bin/env node
// cite.mjs — turn a job, screen type, or catalog id into files the agent must open.
//
// Naming an id is not a cite. This command is. Draw after reading what it lists
// AND after opening the Preview (URL or PNG). Apply the DNA block — house style
// is the fallback voice, not the paint law.
//
//   node corpus/cite.mjs dashboard
//   node corpus/cite.mjs queue
//   node corpus/cite.mjs mui-blog
//   node corpus/cite.mjs --list

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
const CATALOG = join(SHINE, "corpus/templates.json");
const CODE = /\.(tsx|ts|jsx|js|mdx)$/;
const SKIP = /(?:^|\/)(?:test|tests|__tests__)|\.test\.|\.spec\.|\.stories\.|-test\./i;
const PREFER =
  /(?:^|\/)(readme|page|layout|app|index|dashboard|data-table|datatable|chat|settings|wizard|profile|shell)/i;
const DEMOTE = /(?:^|\/)(card|badge|accordion|checkbox|calendar|divider)\./i;

const HOUSE_DNA = {
  family: "shine",
  density: "dense",
  type: "editorial 14/15",
  radius: "sm",
  chroma: "0.13-0.24",
  elevation: "hairline",
  motion: "150ms",
};

const ALIAS = {
  detail: "record",
  hero: "marketing-hero",
  "empty-state": "empty",
};

const die = (code, msg) => {
  process.stderr.write(msg.endsWith("\n") ? msg : msg + "\n");
  process.exit(code);
};

if (!existsSync(CATALOG)) die(2, `cite: missing ${CATALOG}`);
const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
const templates = catalog.templates ?? [];

const arg = process.argv[2];
if (!arg || arg === "-h" || arg === "--help") {
  die(
    1,
    `usage: node corpus/cite.mjs <job|screen|id>\n       node corpus/cite.mjs --list\n\nOpen every file this prints, and the Preview, before drawing. Naming an id is not a cite.`,
  );
}

if (arg === "--list") {
  const rows = templates
    .filter((t) => t.startFrom === 1)
    .sort((a, b) => a.screen.localeCompare(b.screen));
  process.stdout.write("screen\t\tid\tjobs\n");
  for (const t of rows) process.stdout.write(`${t.screen}\t${t.id}\t${(t.jobs || []).join(",")}\n`);
  process.exit(0);
}

const byStart = (a, b) => (a.startFrom ?? 99) - (b.startFrom ?? 99) || a.id.localeCompare(b.id);

const resolveRow = (key, seen = new Set()) => {
  if (seen.has(key)) return null;
  seen.add(key);
  const byId = templates.find((t) => t.id === key);
  if (byId) return byId;
  const byScreen = templates.filter((t) => t.screen === key).sort(byStart);
  if (byScreen[0]) return byScreen[0];
  const byJob = templates.filter((t) => (t.jobs ?? []).includes(key)).sort(byStart);
  if (byJob[0]) return byJob[0];
  const aliased = ALIAS[key];
  if (aliased) return resolveRow(aliased, seen);
  return null;
};

const row = resolveRow(arg);
if (!row) {
  const screens = [...new Set(templates.map((t) => t.screen))].sort().join(", ");
  const jobs = [...new Set(templates.flatMap((t) => t.jobs ?? []))].sort().join(", ");
  die(
    1,
    `cite: unknown ${JSON.stringify(arg)}\nknown screens: ${screens}\nknown jobs: ${jobs}\nids: node corpus/cite.mjs --list, or pick from skill/references/templates.md`,
  );
}

const abs = join(CORPUS, row.path);
const listed = [];

const walk = (dir, acc, depth = 0) => {
  if (acc.length >= 80 || depth > 4) return;
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
    (e) =>
      e.isDirectory() &&
      e.name !== "node_modules" &&
      e.name !== ".git" &&
      e.name !== "__tests__" &&
      e.name !== "test" &&
      e.name !== "tests",
  )) {
    walk(join(dir, e.name), acc, depth + 1);
  }
};

const rank = (p) => {
  const base = p.split("/").pop() || p;
  const rest = p.includes("#") ? p.split("#")[1] : p;
  if (/^readme/i.test(base)) return 0;
  if (/(?:^|\/)page\.(tsx|ts|jsx|js)$/i.test(rest) || /^page\./i.test(base)) return 1;
  if (PREFER.test(base)) return 2;
  if (DEMOTE.test(rest) || DEMOTE.test(base)) return 4;
  return 3;
};

if (row.kind === "query-only") {
  listed.push(abs);
} else if (existsSync(abs) && abs.endsWith(".json")) {
  const item = JSON.parse(readFileSync(abs, "utf8"));
  listed.push(abs);
  for (const f of item.files ?? []) {
    if (f.path) listed.push(`${abs}#${f.path}`);
  }
} else if (existsSync(abs) && statSync(abs).isDirectory()) {
  walk(abs, listed);
} else if (existsSync(abs)) {
  listed.push(abs);
}

if (row.kind === "source" && !existsSync(abs)) {
  die(2, `cite: ${row.id} path missing: ${abs}\nrun: corpus/acquire.sh`);
}

const files = [...new Set(listed)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
const extra = files.length > 16 ? files.length - 16 : 0;
const show = files.slice(0, 16);
const dna = { ...HOUSE_DNA, ...(row.dna || {}) };
const dnaLine = ["family", "density", "type", "radius", "chroma", "elevation", "motion"]
  .map((k) => `${k}=${dna[k]}`)
  .join(" ");

process.stdout.write(`Template: ${row.id}
Screen: ${row.screen}
Kit: ${row.kit}
Kind: ${row.kind}
Jobs: ${(row.jobs || []).join(", ") || "(none)"}
Path: ${abs}
Preview: ${row.preview || ""}
License: ${row.license || ""}
Voice: kit-faithful (default). House is fallback. Brand sandpapers chrome — references/voices.md
DNA: ${dnaLine}
Apply this DNA. Retune shine tokens to it. Do not overwrite with house style unless the user asked for shine-native or the lane is brand.

Open the Preview (URL or PNG) before drawing — vision is part of the cite.

Read these files before drawing:
`);
for (const f of show) process.stdout.write(`  ${f}\n`);
if (extra) process.stdout.write(`  … ${extra} more under ${abs} — rg, do not read the tree\n`);
if (row.kind === "query-only") {
  process.stdout.write("\nQuery-only: screenshot gallery. Copy regions from the shot; do not clone vendor source.\n");
} else if (!files.length) {
  process.stdout.write("\nNo files listed — rg that path, then draw from what you open.\n");
}
process.stdout.write("\nDo not draw until every listed file has been opened.\n");
process.exit(0);
