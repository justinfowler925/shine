#!/usr/bin/env node
// Shared pack payload: readable source + kit tokens next to the harvested shot.
// cite.mjs lists these; materialize-packs.mjs writes them; doctor inspects them.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const CODE = /\.(tsx|ts|jsx|js|mdx|html|css)$/;
const SKIP = /(?:^|\/)(?:test|tests|__tests__)|\.test\.|\.spec\.|-test\./i;
const PREFER =
  /(?:^|\/)(readme|page|layout|app|index|dashboard|data-table|datatable|chat|settings|wizard|profile|shell|blog)/i;
const DEMOTE = /(?:^|\/)(card|badge|accordion|checkbox|calendar|divider)\./i;
export const FULL_PAINT = new Set(["carbon", "shadcn-zinc", "material", "ant"]);
const MIN_SHOT = 30_000;
const MIN_SOURCE_LINES = 30;

export const rankSource = (p) => {
  const base = p.split("/").pop() || p;
  if (/^readme/i.test(base)) return 1;
  if (/^page\./i.test(base)) return 0;
  if (PREFER.test(base)) return 2;
  if (DEMOTE.test(base)) return 4;
  return 3;
};

const extractRegistryItem = (jsonPath, id, extractDir) => {
  const outDir = join(extractDir, id);
  const item = JSON.parse(readFileSync(jsonPath, "utf8"));
  const files = item.files ?? [];
  if (!files.length) return [jsonPath];
  const out = [];
  for (const f of files) {
    if (!f.path || typeof f.content !== "string") continue;
    const rel = f.path.replace(/^registry\/[^/]+\//, "");
    const dest = join(outDir, rel);
    mkdirSync(dirname(dest), { recursive: true });
    if (!existsSync(dest) || readFileSync(dest, "utf8") !== f.content) writeFileSync(dest, f.content);
    out.push(dest);
  }
  return out.length ? out : [jsonPath];
};

const walk = (dir, acc, depth = 0) => {
  if (acc.length >= 200 || depth > 6) return;
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
  const subdirs = ents
    .filter((e) => e.isDirectory() && !["node_modules", ".git", "__tests__", "test", "tests"].includes(e.name))
    .sort((a, b) => {
      const score = (n) =>
        /^(stories|examples|templates|app|pages|src)$/i.test(n) ? 0 : 1;
      return score(a.name) - score(b.name) || a.name.localeCompare(b.name);
    });
  for (const e of subdirs) walk(join(dir, e.name), acc, depth + 1);
};

/** Ranked readable source paths from the pinned corpus (not the pack). */
export function collectCorpusSource(row, { corpus, extractDir }) {
  const listed = [];
  const abs = row.path ? join(corpus, row.path) : "";
  if (row.kind === "source" && abs && existsSync(abs)) {
    if (abs.endsWith(".json")) listed.push(...extractRegistryItem(abs, row.id, extractDir));
    else if (statSync(abs).isDirectory()) walk(abs, listed);
    else listed.push(abs);
  } else if (row.kind === "query-only" && abs && existsSync(abs)) {
    listed.push(abs);
  }
  const files = [...new Set(listed)].sort((a, b) => rankSource(a) - rankSource(b) || a.localeCompare(b));
  const picked = pickMustRead(files);
  return { files: picked.files.length ? picked.files : files, show: picked.show.length ? picked.show : files.slice(0, 3), extra: picked.extra, corpusRoot: abs };
}

export function packSourceFiles(packDir) {
  const dir = join(packDir, "source");
  if (!existsSync(dir)) return [];
  const out = [];
  const walkPack = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walkPack(p);
      else if (e.isFile()) out.push(p);
    }
  };
  walkPack(dir);
  return out.sort((a, b) => rankSource(a) - rankSource(b) || a.localeCompare(b));
}

const JUNK = /CHANGELOG|\.api\.md$|\/etc\//;

const nonemptyLines = (text) => text.split(/\r?\n/).filter((l) => l.trim()).length;

export function pickMustRead(files) {
  const usable = files.filter((p) => {
    if (JUNK.test(p)) return false;
    try {
      return nonemptyLines(readFileSync(p, "utf8")) >= MIN_SOURCE_LINES;
    } catch {
      return false;
    }
  });
  const appPage = files.find((p) => /\/app\/page\.[jt]sx?$/.test(p));
  const composed = files.find((p) =>
    /(?:^|\/)(?:page|blog|index|layout|dashboard)\.[jt]sx?$/i.test(p.split("/").pop() || p),
  );
  const ordered = [];
  for (const p of [appPage, composed, ...usable.sort((a, b) => rankSource(a) - rankSource(b) || a.localeCompare(b))]) {
    if (p && !ordered.includes(p)) ordered.push(p);
  }
  return { show: ordered.slice(0, 3), extra: Math.max(0, ordered.length - 3), files: usable };
}

/** What's wrong with this pack directory. Empty array = shippable. */
export function inspectPack(dir, family = "") {
  const broken = [];
  const shot = join(dir, "shot.png");
  if (!existsSync(shot)) broken.push("no shot.png");
  else {
    const bytes = statSync(shot).size;
    if (bytes < MIN_SHOT) broken.push(`shot.png ${bytes}B — too small to be a real screen`);
  }
  const src = packSourceFiles(dir);
  if (!src.length) broken.push("no source/");
  else if (!src.some((p) => nonemptyLines(readFileSync(p, "utf8")) >= MIN_SOURCE_LINES))
    broken.push(`source/ has no file with ≥${MIN_SOURCE_LINES} readable lines`);
  const tokens = join(dir, "tokens.css");
  if (!existsSync(tokens)) broken.push("no tokens.css");
  else if (FULL_PAINT.has(family)) {
    const n = (readFileSync(tokens, "utf8").match(/--shine-color-/g) || []).length;
    if (n < 5) broken.push(`tokens.css has ${n} --shine-color- (need ≥5 for ${family})`);
  }
  return broken;
}
