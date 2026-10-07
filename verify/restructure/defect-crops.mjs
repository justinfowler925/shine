#!/usr/bin/env node
/**
 * Cropped defect receipts for denoise-eval / skill-ab FAIL→PASS pairs.
 * Twin full-page screenshots are INVALID — each bite crops the named defect.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildXorFoldCropHtml } from "./xor-saved-view.mjs";

const SHELL = `body{margin:0;font:14px/1.4 system-ui;background:#fafafa;color:#18181b}
.fold{max-width:720px;margin:24px auto;padding:16px;background:#fff;border:1px solid #e4e4e7;border-radius:8px}
.btn{border:1px solid #e4e4e7;background:#fff;padding:6px 10px;border-radius:4px;font:inherit;font-size:12px;margin:0 4px 4px 0}
.btn.filled{background:#18181b;color:#fff;border-color:#18181b;font-weight:600}
.btn.filled-peer{background:#3f3f46;color:#fff;border-color:#3f3f46;font-weight:600}
.btn.ghost{border-color:transparent;background:transparent}
table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #e4e4e7;padding:8px;text-align:left}
.metrics{display:flex;flex-wrap:wrap;gap:12px;margin:12px 0}
.metric{flex:1 1 9rem;padding:12px;border:1px solid #e4e4e7;border-radius:8px;min-height:72px}
.metric span{display:block;font-size:12px;color:#71717a}.metric strong{font-size:20px}
.cite{display:inline-block;border:1px solid #e4e4e7;border-radius:6px;padding:4px 8px;font:12px/1.2 ui-monospace,monospace;background:#f4f4f5}
.cite.bad{border-color:#b91c1c;color:#b91c1c}.cite.ok{border-color:#15803d;color:#15803d}
.grid-wrap{border:1px solid #e4e4e7;border-radius:8px;padding:12px;margin:0 0 12px}
.kicker{color:#71717a;font-size:12px;margin:0 0 8px}
caption-note,p[data-shine-crop-caption]{font-size:12px;color:#52525b;margin:12px 0 0}`;

function wrap({ title, cropId, cite, body, caption }) {
  return `<!doctype html>
<!-- Denoise defect crop — twin full-page INVALID -->
<html lang="en" data-cite="${cite}" data-shine-crop="${cropId}">
<head><meta charset="utf-8"/><title>${title}</title>
<style>
${SHELL}
</style></head>
<body>
<main data-shine-main class="fold">
${body}
  <p data-shine-crop-caption>${caption}</p>
</main>
</body>
</html>
`;
}

/** CTA pressure: two filled primaries in the decision cell. */
export function buildCtaBeforeCropHtml() {
  return wrap({
    title: "CTA crop FAIL — dual filled",
    cropId: "cta-pressure-before",
    cite: "shadcn-queue",
    caption: "Crop FAIL: Pursue and Assign lead both filled in main — cta-pressure.",
    body: `  <h1>Queue · decision cell</h1>
  <table role="grid" data-shine-datagrid>
    <thead><tr><th>Notice</th><th>Decision</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>NV DPS voice risk RFI</strong></td>
        <td>
          <button type="button" class="btn filled">Pursue</button>
          <button type="button" class="btn">Review</button>
          <button type="button" class="btn">Dismiss</button>
          <button type="button" class="btn filled-peer">Assign lead</button>
        </td>
      </tr>
    </tbody>
  </table>`,
  });
}

/** CTA after: one filled primary; peer demoted to ghost/outline. */
export function buildCtaAfterCropHtml() {
  return wrap({
    title: "CTA crop PASS — one filled",
    cropId: "cta-pressure-after",
    cite: "shadcn-queue",
    caption: "Crop PASS: single filled Pursue; Assign lead demoted — cta-budget.",
    body: `  <h1>Queue · decision cell</h1>
  <table role="grid" data-shine-datagrid data-region="focal">
    <thead><tr><th>Notice</th><th>Decision</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>NV DPS voice risk RFI</strong></td>
        <td>
          <button type="button" class="btn filled">Pursue</button>
          <button type="button" class="btn">Review</button>
          <button type="button" class="btn">Dismiss</button>
          <button type="button" class="btn ghost">Assign lead</button>
        </td>
      </tr>
    </tbody>
  </table>`,
  });
}

/** KPI soup: ten equal metric tiles on a triage job. */
export function buildKpiBeforeCropHtml() {
  const tiles = [
    ["Open queue", "214"],
    ["New", "12 / 41"],
    ["High score", "33"],
    ["Due soon", "27"],
    ["Decisions 7d", "48"],
    ["Decisions 30d", "161"],
    ["Median", "4 d"],
    ["Coverage", "31 / 50"],
    ["Usul", "22"],
    ["Missed", "9"],
  ]
    .map(
      ([label, value]) =>
        `<div class="metric" data-kpi="${label}"><span>${label}</span><strong>${value}</strong></div>`,
    )
    .join("\n        ");
  return wrap({
    title: "KPI crop FAIL — ten equal tiles",
    cropId: "kpi-soup-before",
    cite: "shadcn-queue",
    caption: "Crop FAIL: ten equal metric tiles compete with the work object — kpi-soup.",
    body: `  <h1>Summary · KPI soup</h1>
  <p class="kicker">Dashboard DNA on a triage decide path</p>
  <div class="metrics" aria-label="SLED Capture key figures" data-sled-kpis>
        ${tiles}
  </div>`,
  });
}

/** KPI after: ≤3 visible + rest in details. */
export function buildKpiAfterCropHtml() {
  return wrap({
    title: "KPI crop PASS — collapsed",
    cropId: "kpi-soup-after",
    cite: "shadcn-queue",
    caption: "Crop PASS: three visible metrics; remainder in details — kpi-collapse.",
    body: `  <h1>Summary · collapsed</h1>
  <p class="kicker">Decide-path metrics only</p>
  <div class="metrics" aria-label="SLED Capture key figures" data-sled-kpis>
        <div class="metric" data-kpi="Open queue"><span>Open queue</span><strong>214</strong></div>
        <div class="metric" data-kpi="New"><span>New</span><strong>12 / 41</strong></div>
        <div class="metric" data-kpi="High score"><span>High score</span><strong>33</strong></div>
        <details data-shine-kpi-rest><summary>More metrics</summary>
          <div class="metric" data-kpi="Due soon"><span>Due soon</span><strong>27</strong></div>
          <div class="metric" data-kpi="Missed"><span>Missed</span><strong>9</strong></div>
        </details>
  </div>`,
  });
}

/** Wrong cite: settings job stamped shadcn-queue. */
export function buildWrongCiteBeforeCropHtml() {
  return wrap({
    title: "Cite crop FAIL — queue on settings",
    cropId: "wrong-cite-before",
    cite: "shadcn-queue",
    caption: "Crop FAIL: data-cite=shadcn-queue on a Sources/settings job — cite-honesty.",
    body: `  <h1>Sources &amp; recipes</h1>
  <p class="kicker">Settings job · wrong pattern stamp</p>
  <p><span class="cite bad" data-cite-chip>data-cite="shadcn-queue"</span></p>
  <section class="grid-wrap">
    <h2>Source directory</h2>
    <p>Collection results and recipe packs — not a notice queue.</p>
    <button type="button" class="btn filled">Add source</button>
  </section>`,
  });
}

/** Cite after: rebound to shadcn-settings. */
export function buildWrongCiteAfterCropHtml() {
  return wrap({
    title: "Cite crop PASS — settings",
    cropId: "wrong-cite-after",
    cite: "shadcn-settings",
    caption: "Crop PASS: data-cite=shadcn-settings matches Sources job — rebind-cite.",
    body: `  <h1>Sources &amp; recipes</h1>
  <p class="kicker">Settings job · honest pattern stamp</p>
  <p><span class="cite ok" data-cite-chip>data-cite="shadcn-settings"</span></p>
  <section class="grid-wrap">
    <h2>Source directory</h2>
    <p>Collection results and recipe packs.</p>
    <button type="button" class="btn filled">Add source</button>
  </section>`,
  });
}

/** Dual-grid before: two peer worklists in the fold. */
export function buildDualGridBeforeCropHtml() {
  return wrap({
    title: "Dual-grid crop FAIL — peer worklists",
    cropId: "dual-focal-before",
    cite: "shadcn-queue",
    caption: "Crop FAIL: David's 10 and Queue are peer [role=grid] worklists — dual-focal.",
    body: `  <h1>Fold · two worklists</h1>
  <div class="grid-wrap">
    <h2 data-grid-title>David's 10 today</h2>
    <table role="grid"><thead><tr><th>Notice</th><th>Due</th></tr></thead>
      <tbody><tr><td>NV DPS voice risk RFI</td><td>Oct 12</td></tr></tbody>
    </table>
  </div>
  <div class="grid-wrap">
    <h2 data-grid-title>Queue</h2>
    <table role="grid"><thead><tr><th>Notice</th><th>Due</th></tr></thead>
      <tbody><tr><td>CO DOC screening SOW</td><td>Oct 9</td></tr></tbody>
    </table>
  </div>`,
  });
}

/** Usul composition: equal card soup, no focal region. */
export function buildUsulFocalBeforeCropHtml() {
  return wrap({
    title: "Usul crop FAIL — card soup",
    cropId: "composition-slop-before",
    cite: "shadcn-dashboard-01",
    caption: "Crop FAIL: equal Card panels, no data-region=focal — composition-slop.",
    body: `  <h1>Usul &amp; coverage · fold</h1>
  <p class="kicker">Dashboard card soup — no primary work object</p>
  <section class="grid-wrap card"><h2>Usul pipeline</h2><p>Equal panel</p></section>
  <section class="grid-wrap card"><h2>By week</h2><p>Equal panel</p></section>
  <section class="grid-wrap card"><h2>Coverage lift</h2><p>Equal panel</p></section>`,
  });
}

/** Usul after: first card stamped focal. */
export function buildUsulFocalAfterCropHtml() {
  return wrap({
    title: "Usul crop PASS — focal set",
    cropId: "composition-slop-after",
    cite: "shadcn-dashboard-01",
    caption: "Crop PASS: Usul pipeline stamped data-region=focal — set-focal.",
    body: `  <h1>Usul &amp; coverage · fold</h1>
  <p class="kicker">Primary work object marked</p>
  <section class="grid-wrap card" data-region="focal"><h2>Usul pipeline</h2>
    <table><thead><tr><th>Record</th><th>Stage</th></tr></thead>
      <tbody><tr><td>NV DPS</td><td>In Review</td></tr></tbody>
    </table>
  </section>
  <section class="grid-wrap card"><h2>By week</h2><p>Demoted peer</p></section>`,
  });
}

/** Stacked Sled bloat: dual filled CTA + KPI encyclopedia in one crop. */
export function buildSledBloatBeforeCropHtml() {
  return wrap({
    title: "Sled-bloat crop FAIL — CTA + KPI",
    cropId: "sled-bloat-before",
    cite: "shadcn-queue",
    caption: "Crop FAIL: dual filled CTA + ten KPI tiles on decide path — cta-pressure + kpi-soup.",
    body: `  <h1>Queue · stacked defects</h1>
  <table role="grid" data-shine-datagrid>
    <thead><tr><th>Notice</th><th>Decision</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>NV DPS voice risk RFI</strong></td>
        <td>
          <button type="button" class="btn filled">Pursue</button>
          <button type="button" class="btn">Review</button>
          <button type="button" class="btn filled-peer">Assign lead</button>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="metrics" aria-label="SLED Capture key figures" data-sled-kpis>
        <div class="metric" data-kpi="Open queue"><span>Open queue</span><strong>214</strong></div>
        <div class="metric" data-kpi="New"><span>New</span><strong>12</strong></div>
        <div class="metric" data-kpi="High score"><span>High score</span><strong>33</strong></div>
        <div class="metric" data-kpi="Due soon"><span>Due soon</span><strong>27</strong></div>
        <div class="metric" data-kpi="Decisions 7d"><span>Decisions 7d</span><strong>48</strong></div>
        <div class="metric" data-kpi="Decisions 30d"><span>Decisions 30d</span><strong>161</strong></div>
        <div class="metric" data-kpi="Median"><span>Median</span><strong>4 d</strong></div>
        <div class="metric" data-kpi="Coverage"><span>Coverage</span><strong>31</strong></div>
        <div class="metric" data-kpi="Usul"><span>Usul</span><strong>22</strong></div>
        <div class="metric" data-kpi="Missed"><span>Missed</span><strong>9</strong></div>
  </div>`,
  });
}

/** Stacked after: one filled CTA + KPI collapse. */
export function buildSledBloatAfterCropHtml() {
  return wrap({
    title: "Sled-bloat crop PASS — CTA + KPI cleared",
    cropId: "sled-bloat-after",
    cite: "shadcn-queue",
    caption: "Crop PASS: single filled Pursue + ≤3 KPIs with details — cta-budget + kpi-collapse.",
    body: `  <h1>Queue · stacked cleared</h1>
  <table role="grid" data-shine-datagrid data-region="focal">
    <thead><tr><th>Notice</th><th>Decision</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>NV DPS voice risk RFI</strong></td>
        <td>
          <button type="button" class="btn filled">Pursue</button>
          <button type="button" class="btn">Review</button>
          <button type="button" class="btn ghost">Assign lead</button>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="metrics" aria-label="SLED Capture key figures" data-sled-kpis>
        <div class="metric" data-kpi="Open queue"><span>Open queue</span><strong>214</strong></div>
        <div class="metric" data-kpi="New"><span>New</span><strong>12</strong></div>
        <div class="metric" data-kpi="High score"><span>High score</span><strong>33</strong></div>
        <details data-shine-kpi-rest><summary>More metrics</summary>
          <div class="metric" data-kpi="Missed"><span>Missed</span><strong>9</strong></div>
        </details>
  </div>`,
  });
}

/** Manifest of pinned crop pairs required by denoise-eval / skill-ab. */
export const DEFECT_CROP_PAIRS = [
  {
    id: "queue-cta",
    defect: "cta-pressure",
    beforeCrop: "queue-cta-before-crop.html",
    afterCrop: "queue-cta-after-crop.html",
    buildBefore: buildCtaBeforeCropHtml,
    buildAfter: buildCtaAfterCropHtml,
    beforeMust: [/filled-peer|btn filled">Pursue[\s\S]*filled-peer|class="btn filled"/, /Assign lead/],
    afterMust: [/btn filled">Pursue/, /ghost|outline/i],
    afterMustNot: [/class="btn filled-peer"/],
  },
  {
    id: "queue-kpi",
    defect: "kpi-soup",
    beforeCrop: "queue-kpi-before-crop.html",
    afterCrop: "queue-kpi-after-crop.html",
    buildBefore: buildKpiBeforeCropHtml,
    buildAfter: buildKpiAfterCropHtml,
    beforeMust: [/data-kpi=/, /Open queue/],
    afterMust: [/data-shine-kpi-rest/, /More metrics/],
  },
  {
    id: "sources-cite",
    defect: "wrong-cite",
    beforeCrop: "sources-cite-before-crop.html",
    afterCrop: "sources-cite-after-crop.html",
    buildBefore: buildWrongCiteBeforeCropHtml,
    buildAfter: buildWrongCiteAfterCropHtml,
    beforeMust: [/shadcn-queue/, /Sources/],
    afterMust: [/shadcn-settings/, /Sources/],
    afterMustNot: [/data-cite="shadcn-queue"/],
  },
  {
    id: "queue-dual-grid",
    defect: "dual-focal",
    beforeCrop: "queue-dual-grid-before-crop.html",
    afterCrop: "queue-dual-grid-fold-crop.html",
    buildBefore: buildDualGridBeforeCropHtml,
    // Self-contained FAIL→PASS: default fold crop from XOR helper.
    // Callers may still override via ensureDefectCropReceipts({ xorAfterHtml }) for titled eval crops.
    buildAfter: () =>
      buildXorFoldCropHtml({ keptTitle: "Queue", chipLabel: "David's 10 today" }),
    beforeMust: [/role=["']grid["']/, /David/, /Queue/],
    afterMust: [/data-shine-xor-views|data-shine-xor-from-peer/, /role=["']grid["']/],
  },
  {
    id: "usul-focal",
    defect: "composition-slop",
    beforeCrop: "usul-focal-before-crop.html",
    afterCrop: "usul-focal-after-crop.html",
    buildBefore: buildUsulFocalBeforeCropHtml,
    buildAfter: buildUsulFocalAfterCropHtml,
    beforeMust: [/class="[^"]*\bcard\b/, /Usul pipeline/],
    afterMust: [/data-region=["']focal["']/, /Usul pipeline/],
    beforeMustNot: [/data-region=["']focal["']/],
  },
  {
    id: "queue-sled-bloat",
    defect: "cta-pressure+kpi-soup",
    beforeCrop: "queue-sled-bloat-before-crop.html",
    afterCrop: "queue-sled-bloat-after-crop.html",
    buildBefore: buildSledBloatBeforeCropHtml,
    buildAfter: buildSledBloatAfterCropHtml,
    beforeMust: [/filled-peer/, /data-kpi=/, /Assign lead/],
    afterMust: [/btn filled">Pursue/, /ghost|outline/i, /data-shine-kpi-rest/, /More metrics/],
    afterMustNot: [/class="btn filled-peer"/],
  },
];

/**
 * Write all pinned crop HTML receipts into receiptsDir.
 * `xorAfterHtml` overrides the queue-dual-grid after crop when callers have
 * titled fold crops from applyXorSavedView (denoise-eval / skill-ab).
 * @returns {{ written: string[], pairs: typeof DEFECT_CROP_PAIRS }}
 */
export function ensureDefectCropReceipts(receiptsDir, { xorAfterHtml } = {}) {
  mkdirSync(receiptsDir, { recursive: true });
  const written = [];
  for (const pair of DEFECT_CROP_PAIRS) {
    if (pair.buildBefore) {
      const path = join(receiptsDir, pair.beforeCrop);
      writeFileSync(path, pair.buildBefore());
      written.push(pair.beforeCrop);
    }
    if (!pair.afterCrop) continue;
    let afterHtml = null;
    if (xorAfterHtml && pair.id === "queue-dual-grid") {
      afterHtml = xorAfterHtml;
    } else if (pair.buildAfter) {
      afterHtml = pair.buildAfter();
    }
    if (afterHtml) {
      const path = join(receiptsDir, pair.afterCrop);
      writeFileSync(path, afterHtml);
      written.push(pair.afterCrop);
    }
  }
  return { written, pairs: DEFECT_CROP_PAIRS };
}

/**
 * Structural checks that before/after crops exist, match markers, and are not twins.
 * @param {string} receiptsDir
 * @param {(name: string) => string} read
 */
export function assertCropPairOk(pair, read) {
  const before = read(pair.beforeCrop);
  const after = read(pair.afterCrop);
  const errors = [];
  if (!before) errors.push(`missing ${pair.beforeCrop}`);
  if (!after) errors.push(`missing ${pair.afterCrop}`);
  if (before && after && before === after) errors.push(`${pair.id}: before/after crops are identical twins`);
  for (const re of pair.beforeMust || []) {
    if (before && !re.test(before)) errors.push(`${pair.id} before missing ${re}`);
  }
  for (const re of pair.afterMust || []) {
    if (after && !re.test(after)) errors.push(`${pair.id} after missing ${re}`);
  }
  for (const re of pair.afterMustNot || []) {
    if (after && re.test(after)) errors.push(`${pair.id} after still has ${re}`);
  }
  for (const re of pair.beforeMustNot || []) {
    if (before && re.test(before)) errors.push(`${pair.id} before still has ${re}`);
  }
  // Dual-grid after must keep exactly one grid
  if (pair.id === "queue-dual-grid" && after) {
    const grids = (after.match(/role=["']grid["']/gi) || []).length;
    if (grids !== 1) errors.push(`${pair.id} after must have exactly 1 grid, got ${grids}`);
  }
  // KPI before should show many tiles; after collapses
  if ((pair.id === "queue-kpi" || pair.id === "queue-sled-bloat") && before && after) {
    const beforeTiles = (before.match(/data-kpi=/g) || []).length;
    if (beforeTiles < 8) errors.push(`${pair.id} before needs ≥8 kpi tiles, got ${beforeTiles}`);
    if (!/data-shine-kpi-rest/.test(after)) errors.push(`${pair.id} after needs kpi-rest details`);
  }
  // Usul after must stamp focal; before must not
  if (pair.id === "usul-focal" && before && after) {
    if (/data-region=["']focal["']/.test(before)) errors.push(`${pair.id} before must not already be focal`);
    if (!/data-region=["']focal["']/.test(after)) errors.push(`${pair.id} after must stamp data-region=focal`);
  }
  return { ok: errors.length === 0, errors };
}
