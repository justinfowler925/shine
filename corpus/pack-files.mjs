#!/usr/bin/env node
// Shared pack payload: readable source + kit tokens next to the harvested shot.
// cite.mjs lists these; materialize-packs.mjs writes them; doctor inspects them.

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");

const CODE = /\.(tsx|ts|jsx|js|mdx|html|css)$/;
const SKIP = /(?:^|\/)(?:test|tests|__tests__)|\.test\.|\.spec\.|-test\./i;
const PREFER =
  /(?:^|\/)(readme|page|layout|app|dashboard|data-table|datatable|chat|settings|wizard|profile|shell|blog|navdrawer|nav-drawer|navbar|hero)/i;
const DEMOTE = /(?:^|\/)(card|badge|accordion|checkbox|calendar|divider|types)\./i;
export const FULL_PAINT = new Set([
  "carbon",
  "shadcn-zinc",
  "material",
  "ant",
  "fluent",
  "mantine",
  "magicui",
  "spectrum",
  "slds",
  "shine",
  "heroui",
  "tremor",
  "untitled",
]);
const MIN_SHOT = 30_000;
// The floor catches a blank or failed render. It was calibrated on full
// application shells; a single chart card or a centred sign-in screen is
// legitimately a fraction of that, so those scopes get a lower floor that still
// rejects an empty render rather than being failed for being small.
const MIN_SHOT_COMPONENT = 8_000;
const MIN_SOURCE_LINES = 30;
const RESOLVE_EXT = ["", ".tsx", ".ts", ".jsx", ".js", ".css", ".json", "/index.tsx", "/index.ts", "/index.jsx", "/index.js"];

const localImports = (text) => [...text.matchAll(/(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)]
  .map((m) => m[1] || m[2]).filter((s) => s?.startsWith("."));

export function dependencyClosure(entrypoints, root, corpusRoot = root) {
  const queue = entrypoints.map((p) => resolve(root, p));
  const seen = new Set();
  const external = new Set();
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`dependency entry missing: ${file}`);
    if (!resolve(file).startsWith(resolve(corpusRoot) + "/")) throw new Error(`dependency escapes corpus: ${file}`);
    seen.add(file);
    if (!CODE.test(file) || extname(file) === ".json") continue;
    const text = readFileSync(file, "utf8");
    for (const spec of localImports(text)) {
      const base = resolve(dirname(file), spec);
      const hit = RESOLVE_EXT.map((x) => base + x).find((p) => existsSync(p) && statSync(p).isFile());
      if (hit) queue.push(hit);
      else external.add(`${relative(corpusRoot, file)} -> ${spec}`);
    }
  }
  return { files: [...seen].sort(), unresolvedLocal: [...external].sort() };
}

export const rankSource = (p) => {
  const base = p.split("/").pop() || p;
  if (/\.types\.tsx?$|\.d\.ts$/i.test(base)) return 6;
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
  let dependencyFiles = null;
  const abs = row.path ? join(corpus, row.path) : "";
  if (row.kind === "source" && abs && existsSync(abs)) {
    if (row.entrypoints?.length && statSync(abs).isDirectory()) {
      const graph = dependencyClosure(row.entrypoints, abs, corpus);
      listed.push(...graph.files);
      dependencyFiles = graph.files;
    } else if (abs.endsWith(".json")) listed.push(...extractRegistryItem(abs, row.id, extractDir));
    else if (statSync(abs).isDirectory()) walk(abs, listed);
    else listed.push(abs);
  } else if (row.kind === "query-only" && abs && existsSync(abs)) {
    listed.push(abs);
  } else if (row.kind === "blueprint") {
    // A blueprint is a region map for a screen with no harvestable upstream. The
    // LEX rows are map-only because no public Lightning source exists to copy.
    // Where the kit's own primitives ARE in the corpus and only the composed page
    // is missing — every shadcn page gap — the blueprint may also carry authored
    // source in a sibling directory, so the reader gets code and not just prose.
    const bp = join(SHINE, "corpus/blueprints", `${row.id}.md`);
    if (existsSync(bp)) listed.push(bp);
    const authored = join(SHINE, "corpus/blueprints", row.id);
    if (existsSync(authored) && statSync(authored).isDirectory()) walk(authored, listed);
  }
  const files = [...new Set(listed)].sort((a, b) => rankSource(a) - rankSource(b) || a.localeCompare(b));
  const picked = pickMustRead(files);
  if (row.entrypoints?.length) {
    const entry = row.entrypoints.map((p) => resolve(abs, p));
    picked.show = [...entry, ...picked.show.filter((p) => !entry.includes(p))].slice(0, 3);
  }
  return { files: dependencyFiles || (picked.files.length ? picked.files : files), show: picked.show.length ? picked.show : files.slice(0, 3), extra: picked.extra, corpusRoot: abs };
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
    /(?:^|\/)(?:page|blog|layout|dashboard|navdrawer|chat)\.[jt]sx?$/i.test(p.split("/").pop() || p),
  );
  const ordered = [];
  for (const p of [appPage, composed, ...usable.sort((a, b) => rankSource(a) - rankSource(b) || a.localeCompare(b))]) {
    if (p && !ordered.includes(p)) ordered.push(p);
  }
  return { show: ordered.slice(0, 3), extra: Math.max(0, ordered.length - 3), files: usable };
}

/** What's wrong with this pack directory. Empty array = shippable. */
export function inspectPack(dir, family = "", row = null) {
  const broken = [];
  const shot = join(dir, "shot.png");
  if (!existsSync(shot)) broken.push("no shot.png");
  else {
    const bytes = statSync(shot).size;
    const floor = (row?.scope === "component" || row?.screen === "auth") ? MIN_SHOT_COMPONENT : MIN_SHOT;
    if (bytes < floor) broken.push(`shot.png ${bytes}B — under the ${floor}B floor for ${row?.scope || "page"} scope`);
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
  const manifestPath = join(dir, "manifest.json");
  if (!existsSync(manifestPath)) broken.push("no manifest.json");
  else {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      if (!Array.isArray(manifest.files) || !manifest.files.length) broken.push("manifest has zero files");
      for (const file of manifest.files || []) {
        const p = join(dir, "source", file.path);
        if (!existsSync(p)) broken.push(`manifest file missing: ${file.path}`);
        else {
          const hash = createHash("sha256").update(readFileSync(p)).digest("hex");
          if (hash !== file.sha256) broken.push(`manifest hash mismatch: ${file.path}`);
        }
      }
      if (row?.kind === "source" && !manifest.upstream?.sha) broken.push("source manifest has no upstream pin");
      if (row?.kind === "query-only" && manifest.files?.length) broken.push("query-only pack must not vendor source");
      if (manifest.structuralSignature && !manifest.structuralSignature.files?.length) broken.push("structural signature has zero files");
    } catch (err) {
      broken.push(`invalid manifest.json: ${err.message}`);
    }
  }
  return broken;
}
