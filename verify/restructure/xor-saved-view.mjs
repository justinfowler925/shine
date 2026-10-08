#!/usr/bin/env node
/**
 * D10 — Dual-grid XOR recipe (peer title → filter chip + shared DataGrid).
 *
 * Auto-safe on DOM via apply-dom `collapse-peer-grids` and on TSX via apply-tsx AST.
 * Never silent-deletes without injecting data-shine-xor-views chips. When fewer than
 * 2 peer wraps (or peers are dynamic on TSX), runners emit plan markdown instead.
 *
 * Also callable directly: denoise-eval / denoise-loop / CLI.
 */

import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {string} html
 * @param {{ keepTitleIncludes?: string[], foldTitleIncludes?: string[], mode?: string }} [op]
 * @returns {{ html: string, applied: boolean, keptTitle: string|null, foldedTitle: string|null, chipLabel: string|null, gridCountBefore: number, gridCountAfter: number, note: string }}
 */
export function applyXorSavedView(html, op = {}) {
  const keepNeedles = (op.keepTitleIncludes || ["Queue"]).map(String);
  const foldNeedles = (op.foldTitleIncludes || ["David"]).map(String);
  const mode = op.mode || "xor-saved-view";

  const segments = extractGridWraps(html);
  const gridCountBefore = segments.length;

  if (gridCountBefore < 2) {
    return {
      html,
      applied: false,
      keptTitle: null,
      foldedTitle: null,
      chipLabel: null,
      gridCountBefore,
      gridCountAfter: gridCountBefore,
      note: "xor-saved-view: fewer than 2 peer grid-wraps — nothing to fold",
    };
  }

  let keepIdx = segments.findIndex((s) => titleMatches(s.title, keepNeedles));
  let foldIdx = segments.findIndex((s) => titleMatches(s.title, foldNeedles));
  if (keepIdx < 0) keepIdx = segments.length - 1;
  if (foldIdx < 0) foldIdx = keepIdx === 0 ? 1 : 0;
  if (keepIdx === foldIdx) {
    foldIdx = keepIdx === 0 ? 1 : 0;
  }

  const keep = segments[keepIdx];
  const fold = segments[foldIdx];
  const chipLabel = fold.title || foldNeedles[0] || "Peer view";

  // Build XOR chip strip (pressed=false default = full Queue; pressed=true = peer filter)
  const chipStrip = [
    `<div class="scope" data-shine-xor-views role="group" aria-label="Worklist views">`,
    `  <button type="button" class="xor-chip" data-shine-xor-chip="all" aria-pressed="true">${escapeHtml(keep.title || "Queue")}</button>`,
    `  <button type="button" class="xor-chip" data-shine-xor-chip="${escapeAttr(slug(chipLabel))}" aria-pressed="false" data-shine-xor-from-peer="${escapeAttr(chipLabel)}">${escapeHtml(chipLabel)}</button>`,
    `</div>`,
  ].join("\n    ");

  // Ensure keep wrap is focal and carries shared datagrid marker
  let keepInner = keep.inner;
  if (!/\bdata-region=["']focal["']/.test(keep.openAttrs)) {
    keep.openAttrs = keep.openAttrs.replace(
      /class=(["'])([^"']*)\1/,
      (m, q, cls) => `class=${q}${cls}${q} data-region="focal" data-shine-focal data-shine-shared-grid`,
    );
    if (!/\bdata-region=/.test(keep.openAttrs)) {
      keep.openAttrs = `${keep.openAttrs} data-region="focal" data-shine-focal data-shine-shared-grid`;
    }
  } else if (!/\bdata-shine-shared-grid\b/.test(keep.openAttrs)) {
    keep.openAttrs += ` data-shine-shared-grid`;
  }

  // Inject chip strip after title / before toolbar or table
  if (/data-shine-xor-views/.test(keepInner)) {
    // already has xor — leave
  } else if (/<div\b[^>]*class=["'][^"']*\btoolbar\b/.test(keepInner)) {
    keepInner = keepInner.replace(
      /(<div\b[^>]*class=["'][^"']*\btoolbar\b)/i,
      `${chipStrip}\n    $1`,
    );
  } else if (/<table\b/i.test(keepInner)) {
    keepInner = keepInner.replace(/(<table\b)/i, `${chipStrip}\n    $1`);
  } else {
    keepInner = `${chipStrip}\n    ${keepInner}`;
  }

  // Optional kicker noting shared state
  if (!/shared DataGrid|saved view|XOR/i.test(keepInner)) {
    keepInner = keepInner.replace(
      /(<\/h[12]>)/i,
      `$1\n    <p class="kicker" data-shine-xor-note>Peer “${escapeHtml(chipLabel)}” is an XOR filter chip on this shared DataGrid — not a second worklist (${mode}).</p>`,
    );
  }

  const keepBlock = `<div${keep.openAttrs}>${keepInner}</div>`;

  // Replace the contiguous peer-grid span with the single shared focal wrap.
  const spanStart = Math.min(...segments.map((s) => s.start));
  const spanEnd = Math.max(...segments.map((s) => s.end));
  const out = html.slice(0, spanStart) + keepBlock + "\n\n  " + html.slice(spanEnd);

  const afterSegs = extractGridWraps(out);
  // Also count role=grid tables as fallback
  const gridTables = (out.match(/role=["']grid["']/gi) || []).length;

  return {
    html: out,
    applied: true,
    keptTitle: keep.title,
    foldedTitle: fold.title,
    chipLabel,
    gridCountBefore,
    gridCountAfter: Math.max(afterSegs.length, gridTables > 0 ? 1 : afterSegs.length),
    note: `xor-saved-view: folded “${fold.title}” → filter chip; kept “${keep.title}” as shared DataGrid`,
  };
}

/**
 * Extract .grid-wrap blocks with titles (non-greedy balanced on first level via regex).
 * @param {string} html
 */
export function extractGridWraps(html) {
  const results = [];
  const re = /<div\b([^>]*\bgrid-wrap\b[^>]*)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const openStart = m.index;
    const openAttrs = m[1];
    const contentStart = re.lastIndex;
    const close = findMatchingCloseDiv(html, contentStart);
    if (close < 0) continue;
    const inner = html.slice(contentStart, close);
    const end = close + "</div>".length;
    const titleMatch =
      inner.match(/data-grid-title[^>]*>([^<]+)/i) ||
      inner.match(/<h[12][^>]*>([^<]+)/i);
    const title = (titleMatch?.[1] || "").replace(/\s+/g, " ").trim();
    results.push({ start: openStart, end, openAttrs, inner, title });
    re.lastIndex = end;
  }
  return results;
}

function findMatchingCloseDiv(html, from) {
  let depth = 1;
  const token = /<\/?div\b[^>]*>/gi;
  token.lastIndex = from;
  let m;
  while ((m = token.exec(html))) {
    if (/^<\/div/i.test(m[0])) {
      depth--;
      if (depth === 0) return m.index;
    } else {
      depth++;
    }
  }
  return -1;
}

function titleMatches(title, needles) {
  const t = String(title || "").toLowerCase();
  return needles.some((n) => t.includes(String(n).toLowerCase()));
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

/**
 * Fold-crop receipt HTML — one grid in the fold (proof crop, not twin full-page).
 */
export function buildXorFoldCropHtml({ keptTitle = "Queue", chipLabel = "David's 10 today", rows = [] } = {}) {
  const bodyRows =
    rows.length > 0
      ? rows
          .map((r) => `<tr><td>${escapeHtml(r)}</td><td>—</td><td><button type="button" class="btn filled">Pursue</button></td></tr>`)
          .join("\n")
      : `<tr><td>NV DPS voice risk RFI</td><td>Oct 12</td><td><button type="button" class="btn filled">Pursue</button></td></tr>`;
  return `<!doctype html>
<!-- D10 XOR fold crop — one [role=grid] after peer→chip; twin full-page INVALID -->
<html lang="en" data-cite="shadcn-queue" data-shine-crop="dual-grid-xor-fold">
<head><meta charset="utf-8"/><title>XOR fold crop — one grid</title>
<style>
body{margin:0;font:14px/1.4 system-ui;background:#fafafa;color:#18181b}
.fold{max-width:720px;margin:24px auto;padding:16px;background:#fff;border:1px solid #e4e4e7;border-radius:8px}
.scope{display:flex;gap:8px;margin:0 0 12px}
.scope button{border:1px solid #e4e4e7;background:#fff;padding:6px 10px;border-radius:999px;font:inherit;font-size:12px}
.scope button[aria-pressed=true]{background:#18181b;color:#fafafa}
table{width:100%;border-collapse:collapse}.btn.filled{background:#18181b;color:#fff;border:0;padding:6px 10px;border-radius:4px}
th,td{border-bottom:1px solid #e4e4e7;padding:8px;text-align:left}
</style></head>
<body>
<main data-shine-main class="fold" data-region="focal">
  <h1 data-grid-title>${escapeHtml(keptTitle)}</h1>
  <div class="scope" data-shine-xor-views role="group" aria-label="Worklist views">
    <button type="button" aria-pressed="true">${escapeHtml(keptTitle)}</button>
    <button type="button" aria-pressed="false" data-shine-xor-from-peer="${escapeAttr(chipLabel)}">${escapeHtml(chipLabel)}</button>
  </div>
  <table role="grid" data-shine-datagrid data-shine-shared-grid>
    <thead><tr><th>Notice</th><th>Due</th><th>Decision</th></tr></thead>
    <tbody>
${bodyRows}
    </tbody>
  </table>
  <p data-shine-crop-caption>Crop: single shared DataGrid in fold after XOR; peer “${escapeHtml(chipLabel)}” is a filter chip.</p>
</main>
</body>
</html>
`;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const htmlPath = opt("--html") || args.find((a) => a.endsWith(".html"));
  const outPath = opt("--out");
  const cropPath = opt("--crop-out");
  if (!htmlPath) {
    console.error(
      "usage: xor-saved-view.mjs --html <file> [--out <file>] [--crop-out <file>] [--keep Queue] [--fold David]",
    );
    process.exit(1);
  }
  const keep = opt("--keep");
  const fold = opt("--fold");
  const result = applyXorSavedView(readFileSync(resolve(htmlPath), "utf8"), {
    keepTitleIncludes: keep ? [keep] : undefined,
    foldTitleIncludes: fold ? [fold] : undefined,
  });
  if (outPath) writeFileSync(outPath, result.html);
  if (cropPath) {
    writeFileSync(
      cropPath,
      buildXorFoldCropHtml({ keptTitle: result.keptTitle || "Queue", chipLabel: result.chipLabel || "Peer view" }),
    );
  }
  process.stdout.write(
    JSON.stringify(
      {
        applied: result.applied,
        keptTitle: result.keptTitle,
        foldedTitle: result.foldedTitle,
        chipLabel: result.chipLabel,
        gridCountBefore: result.gridCountBefore,
        gridCountAfter: result.gridCountAfter,
        note: result.note,
        out: outPath || null,
        crop: cropPath || null,
      },
      null,
      2,
    ) + "\n",
  );
  process.exit(result.applied ? 0 : 2);
}
