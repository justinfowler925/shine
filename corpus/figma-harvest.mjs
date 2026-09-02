#!/usr/bin/env node
// figma-harvest.mjs — pixels and tokens from a Figma file.
//
//   node corpus/figma-harvest.mjs --team <team-url|team-id>
//   node corpus/figma-harvest.mjs --list <url|file-key>
//   node corpus/figma-harvest.mjs --shot <url-with-node-id> --id <pack-id> [--scope component]
//   node corpus/figma-harvest.mjs --tokens <url|file-key> --family <name> [--out tokens/voices/<name>.css]
//
// Sibling of harvest.mjs, not a replacement. harvest.mjs drives a browser at a
// public URL; Figma has no public render route, so this calls the REST API with
// a personal access token and renders nodes server-side.
//
// What Figma can and cannot supply for a pack:
//   shot.png     yes — /v1/images renders any frame
//   tokens.css   yes — from local variables, else published styles
//   source/      NO  — Figma holds no code. A Figma-derived pack is therefore
//                kind:"blueprint" with a hand-authored corpus/blueprints/<id>.md,
//                exactly how the seven Lightning packs already work.
//
// The token is never printed and never written to disk. Resolution order:
// FIGMA_TOKEN env, then 1Password.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OP_REF = process.env.FIGMA_TOKEN_OP_REF || "op://Employee/FIGMA_PAT/FIGMA PAT";

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : "");
const has = (name) => args.includes(name);

function token() {
  if (process.env.FIGMA_TOKEN) return process.env.FIGMA_TOKEN.trim();
  try {
    return execFileSync("op", ["read", OP_REF], { encoding: "utf8" }).trim();
  } catch {
    throw new Error(`no Figma token: set FIGMA_TOKEN or make ${OP_REF} readable (op signin)`);
  }
}

/** Accept a team URL or bare team id. */
export function parseTeam(value) {
  const raw = String(value || "").trim();
  const m = raw.match(/figma\.com\/files\/team\/([0-9]+)/) || raw.match(/^([0-9]{6,})$/);
  if (!m) throw new Error(`could not read a team id from ${JSON.stringify(raw)}`);
  return m[1];
}

/**
 * Discover file keys for a team. Figma has no "list my files" endpoint and
 * /v1/teams/:id/projects needs the projects:read scope, which a default PAT does
 * not carry. The published-library endpoints do work under
 * team_library_content:read and every component carries its file_key, so the
 * team's published libraries are discoverable without widening the token.
 * Files that publish nothing stay invisible — that limit is reported, not hidden.
 */
async function team(id, tok) {
  const keys = new Map();
  let cursor = "";
  for (let page = 0; page < 20; page += 1) {
    const qs = `page_size=1000${cursor ? `&after=${encodeURIComponent(cursor)}` : ""}`;
    const body = await figma(`/teams/${id}/components?${qs}`, tok);
    const comps = body.meta?.components || [];
    for (const c of comps) keys.set(c.file_key, (keys.get(c.file_key) || 0) + 1);
    cursor = body.meta?.cursor?.after || "";
    if (!cursor || !comps.length) break;
  }
  if (!keys.size) {
    console.log("no published library components in this team — nothing discoverable without the projects:read scope");
    return;
  }
  console.log(`${keys.size} file(s) publishing components in team ${id}:\n`);
  for (const [key, count] of [...keys].sort((a, b) => b[1] - a[1])) {
    let name = "(metadata unavailable)";
    let modified = "";
    try {
      const meta = await figma(`/files/${key}?depth=1`, tok);
      name = meta.name;
      modified = String(meta.lastModified || "").slice(0, 10);
    } catch { /* keep the key even when metadata is refused */ }
    console.log(`  ${key}  ${String(count).padStart(4)} components  ${modified}  ${name}`);
  }
  console.log(`\nInspect one with:\n  node corpus/figma-harvest.mjs --list <file-key>`);
  console.log("Note: only files that PUBLISH a library appear here. A file with no published");
  console.log("components is invisible to this path — paste its URL directly.");
}

/** Accept a full Figma URL or a bare file key; pull the node id when present. */
export function parseTarget(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("missing Figma url or file key");
  const url = raw.match(/figma\.com\/(?:file|design|board)\/([A-Za-z0-9]+)/);
  const key = url ? url[1] : (/^[A-Za-z0-9]{10,}$/.test(raw) ? raw : "");
  if (!key) throw new Error(`could not read a file key from ${JSON.stringify(raw)}`);
  // Figma writes node ids as 1-234 in URLs and expects 1:234 in the API.
  const node = raw.match(/[?&]node-id=([0-9]+[-:][0-9]+)/);
  return { key, node: node ? node[1].replace("-", ":") : "" };
}

async function figma(path, tok) {
  const response = await fetch(`https://api.figma.com/v1${path}`, { headers: { "X-Figma-Token": tok } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const hint = response.status === 403
      ? " (403: the token lacks access to this file, or local variables need an Enterprise plan)"
      : response.status === 404 ? " (404: wrong file key, or no access)" : "";
    throw new Error(`figma ${path} -> ${response.status}${hint} ${body.err || body.message || ""}`.trim());
  }
  return body;
}

/** Every top-level frame, by page — the candidate list for a pack shot. */
async function list(target, tok) {
  const file = await figma(`/files/${target.key}?depth=2`, tok);
  console.log(`file: ${file.name}  (last modified ${String(file.lastModified).slice(0, 10)})`);
  let frames = 0;
  for (const page of file.document?.children || []) {
    const kids = (page.children || []).filter((n) => ["FRAME", "COMPONENT", "COMPONENT_SET", "SECTION"].includes(n.type));
    if (!kids.length) continue;
    console.log(`\n  ${page.name}`);
    for (const n of kids) {
      frames += 1;
      const box = n.absoluteBoundingBox;
      const size = box ? `${Math.round(box.width)}x${Math.round(box.height)}` : "no bounds";
      console.log(`    ${n.id.padEnd(12)} ${size.padEnd(11)} ${n.type.padEnd(14)} ${n.name}`);
    }
  }
  console.log(`\n${frames} top-level frames. Shot one with:\n  node corpus/figma-harvest.mjs --shot "<url>?node-id=<id>" --id <pack-id>`);
}

/** Render one node to corpus/packs/<id>/shot.png. */
async function shot(target, tok, id, scope) {
  if (!id) throw new Error("--shot needs --id <pack-id>");
  if (!target.node) throw new Error("--shot needs a node: append ?node-id=1-234 (select the frame in Figma and copy the link)");
  const rendered = await figma(`/images/${target.key}?ids=${encodeURIComponent(target.node)}&format=png&scale=2`, tok);
  const href = rendered.images?.[target.node];
  if (!href) throw new Error(`figma returned no image for node ${target.node} (${rendered.err || "unrenderable node"})`);
  const png = Buffer.from(await (await fetch(href)).arrayBuffer());
  const dir = join(SHINE, "corpus/packs", id);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, "shot.png");
  writeFileSync(out, png);
  const bytes = statSync(out).size;
  // Same floors inspectPack applies, so a thin render fails here rather than at
  // materialize time.
  const floor = scope === "component" ? 8_000 : 30_000;
  if (bytes < floor) throw new Error(`shot only ${bytes}B — under the ${floor}B floor for ${scope || "page"} scope`);
  writeFileSync(join(dir, "meta.json"), JSON.stringify({
    id, source: `https://www.figma.com/design/${target.key}?node-id=${target.node.replace(":", "-")}`,
    harvested: new Date().toISOString().slice(0, 10), bytes,
  }, null, 2) + "\n");
  console.log(`ok    ${id}  ${Math.round(bytes / 1024)}KB  figma:${target.key} node ${target.node}`);
  console.log(`      source/ still needed — author corpus/blueprints/${id}.md (≥30 lines) and add a kind:"blueprint" catalog row.`);
}

const HEX = (c) => "#" + ["r", "g", "b"].map((k) => Math.round((c[k] ?? 0) * 255).toString(16).padStart(2, "0")).join("");

/** Variables when the plan exposes them, else published paint styles. */
async function tokens(target, tok, family, outPath) {
  if (!family) throw new Error("--tokens needs --family <name> (the dna.family these packs declare)");
  const colors = [];
  let provenance = "";
  try {
    const vars = await figma(`/files/${target.key}/variables/local`, tok);
    provenance = "local variables";
    for (const v of Object.values(vars.meta?.variables || {})) {
      if (v.resolvedType !== "COLOR") continue;
      const first = Object.values(v.valuesByMode || {})[0];
      if (first && typeof first === "object" && "r" in first) colors.push([v.name, HEX(first)]);
    }
  } catch (error) {
    console.log(`note  local variables unavailable — ${error.message}`);
    const styles = await figma(`/files/${target.key}/styles`, tok);
    provenance = "published styles";
    const fills = (styles.meta?.styles || []).filter((s) => s.style_type === "FILL");
    if (fills.length) {
      const ids = fills.map((s) => s.node_id).join(",");
      const nodes = await figma(`/files/${target.key}/nodes?ids=${encodeURIComponent(ids)}`, tok);
      for (const s of fills) {
        const paint = nodes.nodes?.[s.node_id]?.document?.fills?.find((f) => f.type === "SOLID");
        if (paint?.color) colors.push([s.name, HEX(paint.color)]);
      }
    }
  }
  if (!colors.length) throw new Error("no colours found: the file has no local variables and no published fill styles");
  const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const lines = colors.map(([name, hex]) => `  --shine-color-${slug(name)}: ${hex};   /* ${name} */`);
  const css = [
    `/* shine voice pack — ${family}. Extracted from Figma ${provenance} on`,
    `   ${new Date().toISOString().slice(0, 10)}: file ${target.key}. Role names come from the`,
    `   Figma layer names, so review them before relying on this as a voice sheet. */`,
    `html[data-dna-family="${family}"] {`,
    ...lines,
    `}`,
    ``,
  ].join("\n");
  const out = outPath || join(SHINE, "tokens/voices", `${family}.css`);
  if (existsSync(out) && !has("--force")) throw new Error(`${out} exists — pass --force to overwrite`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, css);
  console.log(`ok    ${out}  ${colors.length} colours from ${provenance}`);
  const painted = (css.match(/--shine-color-/g) || []).length;
  if (painted < 5) console.log(`warn  only ${painted} --shine-color- vars; inspectPack wants ≥5 for a full-paint family`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = has("--team") ? "team" : has("--list") ? "list" : has("--shot") ? "shot" : has("--tokens") ? "tokens" : "";
  if (!mode) {
    console.error(`usage:
  node corpus/figma-harvest.mjs --team <team-url|team-id>
  node corpus/figma-harvest.mjs --list <url|file-key>
  node corpus/figma-harvest.mjs --shot <url-with-node-id> --id <pack-id> [--scope component]
  node corpus/figma-harvest.mjs --tokens <url|file-key> --family <name> [--out <path>] [--force]`);
    process.exit(2);
  }
  try {
    const tok = token();
    if (mode === "team") { await team(parseTeam(opt("--team")), tok); process.exit(0); }
    const target = parseTarget(opt(`--${mode}`));
    if (mode === "list") await list(target, tok);
    if (mode === "shot") await shot(target, tok, opt("--id"), opt("--scope"));
    if (mode === "tokens") await tokens(target, tok, opt("--family"), opt("--out"));
  } catch (error) {
    console.error(`figma-harvest: ${error.message}`);
    process.exit(1);
  }
}
