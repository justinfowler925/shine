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

/**
 * TSX AST CTA pressure FAIL crop — mirrors queue-dual-cta-ast.tsx
 * (variant={"default"}, nested span, missing variant) before apply-tsx.
 */
export function buildCtaAstBeforeCropHtml() {
  return wrap({
    title: "CTA AST crop FAIL — dual/triple filled",
    cropId: "cta-pressure-tsx-before",
    cite: "shadcn-queue",
    caption:
      "Crop FAIL: Pursue + Assign lead + Open queue all filled in TSX (variant default / missing) — cta-pressure; apply-tsx AST cta-budget.",
    body: `  <h1>Queue · TSX decision cell</h1>
  <p class="kicker" data-shine-tsx-fixture="queue-dual-cta-ast.tsx">Before apply-tsx cta-budget (maxFilled=1)</p>
  <table role="grid" data-shine-datagrid data-shine-tsx-ast="before">
    <thead><tr><th>Notice</th><th>Decision</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>NV DPS voice risk RFI</strong></td>
        <td>
          <button type="button" class="btn filled" data-tsx-variant="default-expr">Pursue</button>
          <button type="button" class="btn filled-peer" data-tsx-variant="default">Assign lead</button>
          <button type="button" class="btn filled-peer" data-tsx-variant="missing">Open queue</button>
          <button type="button" class="btn">Review</button>
        </td>
      </tr>
    </tbody>
  </table>`,
  });
}

/**
 * TSX AST CTA pressure PASS crop — after apply-tsx keeps Pursue only.
 */
export function buildCtaAstAfterCropHtml() {
  return wrap({
    title: "CTA AST crop PASS — one filled",
    cropId: "cta-pressure-tsx-after",
    cite: "shadcn-queue",
    caption:
      "Crop PASS: single filled Pursue; Assign lead + Open queue demoted via TSX AST cta-budget maxFilled=1.",
    body: `  <h1>Queue · TSX decision cell</h1>
  <p class="kicker" data-shine-tsx-fixture="queue-dual-cta-ast.tsx">After apply-tsx cta-budget (maxFilled=1)</p>
  <table role="grid" data-shine-datagrid data-region="focal" data-shine-tsx-ast="after">
    <thead><tr><th>Notice</th><th>Decision</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>NV DPS voice risk RFI</strong></td>
        <td>
          <button type="button" class="btn filled" data-tsx-variant="default-expr">Pursue</button>
          <button type="button" class="btn outline" data-tsx-variant="outline">Assign lead</button>
          <button type="button" class="btn outline" data-tsx-variant="outline">Open queue</button>
          <button type="button" class="btn">Review</button>
        </td>
      </tr>
    </tbody>
  </table>`,
  });
}

/**
 * TSX AST KPI soup FAIL crop — mirrors queue-kpi-soup-ast.tsx
 * (className={"metrics"}, className={"metric"}, data-shine-kpi) before apply-tsx.
 */
export function buildKpiAstBeforeCropHtml() {
  const tiles = [
    ["Open queue", "214", "metric"],
    ["New", "12 / 41", "metric-expr"],
    ["High score", "33", "data-shine-kpi"],
    ["Due soon", "27", "metric"],
    ["Decisions 7d", "48", "metric-expr"],
    ["Coverage", "31 / 50", "metric"],
    ["Usul", "22", "data-shine-kpi"],
    ["Missed", "9", "metric"],
  ]
    .map(
      ([label, value, kind]) =>
        `<div class="metric" data-kpi="${label}" data-tsx-metric="${kind}"><span>${label}</span><strong>${value}</strong></div>`,
    )
    .join("\n        ");
  return wrap({
    title: "KPI AST crop FAIL — eight equal tiles",
    cropId: "kpi-soup-tsx-before",
    cite: "shadcn-queue",
    caption:
      "Crop FAIL: eight equal metric tiles in TSX (className metric / {\"metric\"} / data-shine-kpi) — kpi-soup; apply-tsx AST kpi-collapse.",
    body: `  <h1>Summary · TSX KPI soup</h1>
  <p class="kicker" data-shine-tsx-fixture="queue-kpi-soup-ast.tsx">Before apply-tsx kpi-collapse (maxVisible=3)</p>
  <div class="metrics" aria-label="SLED Capture key figures" data-sled-kpis data-shine-tsx-ast="before">
        ${tiles}
  </div>`,
  });
}

/**
 * TSX AST KPI soup PASS crop — after apply-tsx keeps ≤3 visible + details.
 */
export function buildKpiAstAfterCropHtml() {
  return wrap({
    title: "KPI AST crop PASS — collapsed",
    cropId: "kpi-soup-tsx-after",
    cite: "shadcn-queue",
    caption:
      "Crop PASS: three visible metrics; remainder in details via TSX AST kpi-collapse maxVisible=3.",
    body: `  <h1>Summary · TSX collapsed</h1>
  <p class="kicker" data-shine-tsx-fixture="queue-kpi-soup-ast.tsx">After apply-tsx kpi-collapse (maxVisible=3)</p>
  <div class="metrics" aria-label="SLED Capture key figures" data-sled-kpis data-shine-tsx-ast="after">
        <div class="metric" data-kpi="Open queue" data-tsx-metric="metric"><span>Open queue</span><strong>214</strong></div>
        <div class="metric" data-kpi="New" data-tsx-metric="metric-expr"><span>New</span><strong>12 / 41</strong></div>
        <div class="metric" data-kpi="High score" data-tsx-metric="data-shine-kpi"><span>High score</span><strong>33</strong></div>
        <details data-shine-kpi-rest><summary>More metrics</summary>
          <div class="metric" data-kpi="Due soon"><span>Due soon</span><strong>27</strong></div>
          <div class="metric" data-kpi="Missed"><span>Missed</span><strong>9</strong></div>
        </details>
  </div>`,
  });
}

/**
 * TSX AST dual-focal FAIL crop — mirrors queue-dual-grid-ast.tsx
 * (className={"grid-wrap"}, role={"grid"}, data-grid-title={"…"}) before apply-tsx.
 */
export function buildDualFocalAstBeforeCropHtml() {
  return wrap({
    title: "Dual-focal AST crop FAIL — peer grids",
    cropId: "dual-focal-tsx-before",
    cite: "shadcn-queue",
    caption:
      "Crop FAIL: David's 10 and Queue are peer worklists in TSX (className grid-wrap / {\"grid-wrap\"} / role={\"grid\"}) — dual-focal; apply-tsx AST collapse-peer-grids.",
    body: `  <h1>Queue · TSX peer worklists</h1>
  <p class="kicker" data-shine-tsx-fixture="queue-dual-grid-ast.tsx">Before apply-tsx collapse-peer-grids (xor-saved-view)</p>
  <div class="grid-wrap" data-product-pattern="paged-notice-queue" data-shine-tsx-ast="before" data-tsx-grid-wrap="expr">
    <h2 data-grid-title="David's 10 today">David's 10 today</h2>
    <table role="grid" data-tsx-role="expr"><thead><tr><th>Notice</th></tr></thead><tbody><tr><td>NV DPS</td></tr></tbody></table>
  </div>
  <div class="grid-wrap" data-product-pattern="paged-notice-queue" data-tsx-grid-wrap="expr">
    <h2 data-grid-title="Queue">Queue</h2>
    <table role="grid" data-tsx-role="expr"><thead><tr><th>Notice</th></tr></thead><tbody><tr><td>CO DOC</td></tr></tbody></table>
  </div>`,
  });
}

/**
 * TSX AST dual-focal PASS crop — after apply-tsx keeps one shared grid + XOR chip.
 */
export function buildDualFocalAstAfterCropHtml() {
  return wrap({
    title: "Dual-focal AST crop PASS — XOR chip",
    cropId: "dual-focal-tsx-after",
    cite: "shadcn-queue",
    caption:
      "Crop PASS: single shared DataGrid; David's 10 today is an XOR filter chip via TSX AST collapse-peer-grids.",
    body: `  <h1>Queue · TSX XOR worklist</h1>
  <p class="kicker" data-shine-tsx-fixture="queue-dual-grid-ast.tsx">After apply-tsx collapse-peer-grids (xor-saved-view)</p>
  <div class="grid-wrap" data-region="focal" data-shine-shared-grid data-product-pattern="paged-notice-queue" data-shine-tsx-ast="after">
    <h2 data-grid-title="Queue">Queue</h2>
    <div class="scope" data-shine-xor-views role="group" aria-label="Worklist views">
      <button type="button" aria-pressed="true">Queue</button>
      <button type="button" aria-pressed="false" data-shine-xor-from-peer="David's 10 today">David's 10 today</button>
    </div>
    <table role="grid" data-tsx-role="expr"><thead><tr><th>Notice</th></tr></thead><tbody><tr><td>CO DOC</td></tr></tbody></table>
  </div>`,
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
    id: "queue-cta-tsx",
    defect: "cta-pressure",
    beforeCrop: "queue-cta-tsx-before-crop.html",
    afterCrop: "queue-cta-tsx-after-crop.html",
    buildBefore: buildCtaAstBeforeCropHtml,
    buildAfter: buildCtaAstAfterCropHtml,
    beforeMust: [/data-shine-tsx-ast="before"/, /filled-peer/, /Assign lead/, /Open queue/],
    afterMust: [/data-shine-tsx-ast="after"/, /btn filled"[^>]*>Pursue/, /outline/i],
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
    id: "queue-kpi-tsx",
    defect: "kpi-soup",
    beforeCrop: "queue-kpi-tsx-before-crop.html",
    afterCrop: "queue-kpi-tsx-after-crop.html",
    buildBefore: buildKpiAstBeforeCropHtml,
    buildAfter: buildKpiAstAfterCropHtml,
    beforeMust: [/data-shine-tsx-ast="before"/, /data-kpi=/, /Open queue/, /data-tsx-metric/],
    afterMust: [/data-shine-tsx-ast="after"/, /data-shine-kpi-rest/, /More metrics/],
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
    id: "queue-dual-grid-tsx",
    defect: "dual-focal",
    beforeCrop: "queue-dual-grid-tsx-before-crop.html",
    afterCrop: "queue-dual-grid-tsx-after-crop.html",
    buildBefore: buildDualFocalAstBeforeCropHtml,
    buildAfter: buildDualFocalAstAfterCropHtml,
    beforeMust: [/data-shine-tsx-ast="before"/, /role=["']grid["']/, /David/, /Queue/, /data-tsx-grid-wrap/],
    afterMust: [/data-shine-tsx-ast="after"/, /data-shine-xor-views/, /data-shine-xor-from-peer/, /data-region=["']focal["']/],
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
  if ((pair.id === "queue-dual-grid" || pair.id === "queue-dual-grid-tsx") && after) {
    const grids = (after.match(/role=["']grid["']/gi) || []).length;
    if (grids !== 1) errors.push(`${pair.id} after must have exactly 1 grid, got ${grids}`);
  }
  // TSX AST dual-focal before: ≥2 peer grids
  if (pair.id === "queue-dual-grid-tsx" && before) {
    const beforeGrids = (before.match(/role=["']grid["']/gi) || []).length;
    if (beforeGrids < 2) errors.push(`${pair.id} before needs ≥2 grids, got ${beforeGrids}`);
  }
  // KPI before should show many tiles; after collapses
  if ((pair.id === "queue-kpi" || pair.id === "queue-kpi-tsx" || pair.id === "queue-sled-bloat") && before && after) {
    const beforeTiles = (before.match(/data-kpi=/g) || []).length;
    if (beforeTiles < 8) errors.push(`${pair.id} before needs ≥8 kpi tiles, got ${beforeTiles}`);
    if (!/data-shine-kpi-rest/.test(after)) errors.push(`${pair.id} after needs kpi-rest details`);
  }
  // TSX AST KPI after: ≤3 visible tiles outside details
  if (pair.id === "queue-kpi-tsx" && before && after) {
    const afterVisible = after.replace(/<details[\s\S]*?<\/details>/gi, "");
    const visibleTiles = (afterVisible.match(/data-kpi=/g) || []).length;
    if (visibleTiles > 3) errors.push(`${pair.id} after visible tiles must be ≤3, got ${visibleTiles}`);
  }
  // Usul after must stamp focal; before must not
  if (pair.id === "usul-focal" && before && after) {
    if (/data-region=["']focal["']/.test(before)) errors.push(`${pair.id} before must not already be focal`);
    if (!/data-region=["']focal["']/.test(after)) errors.push(`${pair.id} after must stamp data-region=focal`);
  }
  // TSX AST CTA after: exactly one filled primary in the decision cell
  if (pair.id === "queue-cta-tsx" && before && after) {
    const beforeFilled = (before.match(/class="btn filled/g) || []).length;
    const afterFilled = (after.match(/class="btn filled"/g) || []).length;
    if (beforeFilled < 2) errors.push(`${pair.id} before needs ≥2 filled, got ${beforeFilled}`);
    if (afterFilled !== 1) errors.push(`${pair.id} after must have exactly 1 filled, got ${afterFilled}`);
  }
  return { ok: errors.length === 0, errors };
}
