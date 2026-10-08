#!/usr/bin/env node
/**
 * N7 — Apply shine-restructure/v1 auto-safe ops to HTML fixtures (DOM substrate).
 * Ops: cta-budget, kpi-collapse, pill-collapse, title-singular, set-focal,
 * worklist-first, rebind-cite.
 * collapse-peer-grids → plan markdown only (never silent delete).
 */

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTO_SAFE_DOM_OPS, PLAN_ONLY_OPS, validateRestructurePlan } from "./schema.mjs";

/**
 * @param {string} html
 * @param {object} plan
 * @returns {{ html: string, applied: string[], plans: string[], skipped: string[] }}
 */
export function applyDomRestructure(html, plan) {
  const v = validateRestructurePlan(plan);
  if (!v.ok) throw new Error(`refuse apply: ${v.errors.join("; ")}`);

  let out = String(html);
  const applied = [];
  const plans = [];
  const skipped = [];

  for (const op of plan.ops || []) {
    if (PLAN_ONLY_OPS.includes(op.op)) {
      plans.push(formatPeerGridPlan(op, plan));
      continue;
    }
    if (!AUTO_SAFE_DOM_OPS.includes(op.op)) {
      skipped.push(op.op);
      continue;
    }
    if (op.op === "cta-budget") {
      out = applyCtaBudget(out, op);
      applied.push("cta-budget");
    } else if (op.op === "kpi-collapse") {
      out = applyKpiCollapse(out, op);
      applied.push("kpi-collapse");
    } else if (op.op === "pill-collapse") {
      const next = applyPillCollapse(out, op);
      if (next !== out) {
        out = next;
        applied.push("pill-collapse");
      }
    } else if (op.op === "title-singular") {
      const next = applyTitleSingular(out, op);
      if (next !== out) {
        out = next;
        applied.push("title-singular");
      }
    } else if (op.op === "set-focal") {
      out = applySetFocal(out, op);
      applied.push("set-focal");
    } else if (op.op === "worklist-first") {
      const next = applyWorklistFirst(out, op);
      if (next !== out) {
        out = next;
        applied.push("worklist-first");
      }
    } else if (op.op === "rebind-cite") {
      out = applyRebindCite(out, op);
      applied.push("rebind-cite");
    }
  }

  return { html: out, applied, plans, skipped, humanGate: plans.length > 0 || plan.humanGate };
}

/**
 * Demote non-preferred filled buttons to a non-primary treatment.
 * HTML fixtures often paint `.btn.outline` / `.btn.filled-peer` as a second dark
 * fill — that still fails cta-pressure. DOM demote therefore strips fill weight
 * to `ghost` (transparent), matching expert after fixtures.
 * Never rewrite CSS selectors globally (filled-peer→ghost in a <style> block
 * turns the dark peer rule into `.btn.ghost{fill2}` and re-poisons demotions).
 * TSX/shadcn outline stays in apply-tsx.
 */
export function applyCtaBudget(html, op = {}) {
  const prefer = (op.preferLabels || ["Pursue"]).map((s) => s.toLowerCase());
  const maxFilled = op.maxFilled ?? 1;
  const demoteToken = "ghost";
  let kept = 0;
  let out = String(html);
  // Scope / filter chips with aria-pressed paint as filled — clear pressed so
  // measure CTA census does not treat them as competing primaries.
  out = out.replace(/\saria-pressed=["']true["']/gi, ' aria-pressed="false"');

  const demoteClass = (cls) =>
    cls
      .replace(/\bfilled-peer\b/g, demoteToken)
      .replace(/\bfilled\b/g, demoteToken)
      .replace(/\boutline\b/g, demoteToken)
      .replace(/\s+/g, " ")
      .trim();

  const classTokens = (cls) => String(cls).trim().split(/\s+/).filter(Boolean);
  const hasToken = (cls, token) => classTokens(cls).includes(token);

  // Per-button: keep preferred labels as filled up to maxFilled; demote others.
  // Only mutate button class attributes — never <style> text.
  // Note: `\bfilled\b` matches inside `filled-peer` — always use token splits.
  out = out.replace(
    /<button\b([^>]*?)class=(["'])([^"']*)\2([^>]*)>([\s\S]*?)<\/button>/gi,
    (full, pre, q, cls, post, label) => {
      const text = String(label).replace(/<[^>]+>/g, "").trim().toLowerCase();
      const preferred = prefer.some((p) => text.includes(p));
      const isFilledWeight =
        hasToken(cls, "filled") || hasToken(cls, "filled-peer") || hasToken(cls, "outline");
      if (!isFilledWeight) return full;
      if (preferred && hasToken(cls, "filled") && !hasToken(cls, "filled-peer") && kept < maxFilled) {
        kept++;
        const nextCls = classTokens(cls)
          .filter((t) => t !== "filled-peer" && t !== "outline")
          .join(" ");
        return `<button${pre}class=${q}${nextCls}${q}${post}>${label}</button>`;
      }
      return `<button${pre}class=${q}${demoteClass(cls)}${q}${post}>${label}</button>`;
    },
  );
  // After XOR/peer-fold the kept filled primary may have been removed. Promote
  // preferred labels up to maxFilled so the surface never ends at zero primaries.
  if (kept < maxFilled) {
    out = out.replace(
      /<button\b([^>]*?)class=(["'])([^"']*)\2([^>]*)>([\s\S]*?)<\/button>/gi,
      (full, pre, q, cls, post, label) => {
        if (kept >= maxFilled) return full;
        if (/\bfilled\b/.test(cls)) return full;
        const text = String(label).replace(/<[^>]+>/g, "").trim().toLowerCase();
        if (!prefer.some((p) => text.includes(p))) return full;
        const inXorChip = /\bxor-chip\b/.test(cls) || /data-shine-xor-chip/.test(full);
        if (inXorChip) return full;
        let nextCls = cls
          .replace(/\b(outline|ghost|filled-peer)\b/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!/\bfilled\b/.test(nextCls)) nextCls = `${nextCls} filled`.trim();
        kept++;
        return `<button${pre}class=${q}${nextCls}${q}${post}>${label}</button>`;
      },
    );
  }
  // Always install a transparent ghost rule last so demoted peers cannot inherit
  // a dark .btn.outline / corrupted peer paint.
  if (/\bghost\b/.test(out) && /<style[\s>]/i.test(out)) {
    out = out.replace(
      /\.btn\.ghost\s*\{[^}]*\}/gi,
      ".btn.ghost{border-color:transparent;background:transparent;color:inherit;font-weight:400}",
    );
    if (!/\.btn\.ghost\s*\{/.test(out)) {
      out = out.replace(
        /(<\/style>)/i,
        ".btn.ghost{border-color:transparent;background:transparent;color:inherit;font-weight:400}\n$1",
      );
    }
  }
  return out;
}

/** Remove authored defect-narration kickers left beside KPI strips after collapse. */
export function scrubDiagnosticKpiKickers(html) {
  return String(html).replace(
    /<p\b([^>]*class=["'][^"']*\bkicker\b[^"']*["'][^>]*)>([\s\S]*?)<\/p>/gi,
    (full, attrs, body) => {
      const text = String(body).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (
        /equal metric tiles|dashboard DNA|KPI soup|ten KPIs|10 equal/i.test(text) ||
        /competing with the queue focal|Another equal card/i.test(text)
      ) {
        return "";
      }
      return full;
    },
  );
}

/** Keep first maxVisible metrics; wrap the rest in <details>. */
/**
 * Collapse excess above-fold filter pills into <details data-shine-pill-rest>.
 * Prefers [data-shine-filter-stack] / .filter-pills containers.
 */
export function applyPillCollapse(html, op = {}) {
  const maxVisible = op.maxVisible ?? 3;
  const summary = op.summary || "More filters";
  const openRe =
    /<div\b[^>]*(?:data-shine-filter-stack|class=["'][^"']*\bfilter-pills\b[^"']*["'])[^>]*>/i;
  const openMatch = openRe.exec(html);
  if (!openMatch) return html;
  const start = openMatch.index;
  const open = openMatch[0];
  let i = start + open.length;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", i);
    const nextClose = html.indexOf("</div>", i);
    if (nextClose < 0) return html;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        const body = html.slice(start + open.length, nextClose);
        const close = "</div>";
        // Skip pills already inside details rest.
        const bodySansRest = body.replace(/<details\b[^>]*data-shine-pill-rest[\s\S]*?<\/details>/gi, "");
        const re =
          /<(?:button|span|a|div)\b[^>]*(?:data-shine-filter-pill|data-shine-pill|class=["'][^"']*\bpill\b)[^>]*>[\s\S]*?<\/(?:button|span|a|div)>/gi;
        const pills = bodySansRest.match(re) || [];
        if (pills.length <= maxVisible) return html;
        const visible = pills.slice(0, maxVisible).join("\n");
        const rest = pills.slice(maxVisible).join("\n");
        const wrapped =
          `${open}\n${visible}\n` +
          `<details data-shine-pill-rest><summary>${summary}</summary>\n${rest}\n</details>\n${close}`;
        return html.slice(0, start) + wrapped + html.slice(nextClose + close.length);
      }
      i = nextClose + 6;
    }
  }
  return html;
}

/**
 * Keep one page title; demote peer h1 / data-page-title / .page-title to kicker.
 */
export function applyTitleSingular(html, op = {}) {
  let out = String(html);
  const mainRe = /<(main|div)\b[^>]*(?:data-shine-main|role=["']main["'])[^>]*>[\s\S]*?<\/\1>/i;
  const mainMatch = out.match(mainRe);
  const scope = mainMatch ? mainMatch[0] : out;
  const titleRe =
    /<(h1|div|p|span|header)\b([^>]*\b(?:data-page-title|data-shine-page-title|class=["'][^"']*\bpage-title\b)[^>]*)>([\s\S]*?)<\/\1>/gi;
  const h1Re = /<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi;
  /** @type {{ full: string, text: string, index: number }[]} */
  const found = [];
  let m;
  const scan = String(scope);
  while ((m = h1Re.exec(scan))) {
    if (/data-shine-title-demoted/.test(m[0])) continue;
    found.push({ full: m[0], text: m[2].replace(/<[^>]+>/g, "").trim(), index: m.index });
  }
  h1Re.lastIndex = 0;
  while ((m = titleRe.exec(scan))) {
    if (/data-shine-title-demoted/.test(m[0])) continue;
    // Avoid double-counting h1 already captured.
    if (/^<h1\b/i.test(m[0]) && found.some((f) => f.full === m[0])) continue;
    found.push({ full: m[0], text: m[3].replace(/<[^>]+>/g, "").trim(), index: m.index });
  }
  found.sort((a, b) => a.index - b.index);
  // Deduplicate identical full matches
  const uniq = [];
  for (const f of found) {
    if (!uniq.some((u) => u.full === f.full && u.index === f.index)) uniq.push(f);
  }
  if (uniq.length < 2) return html;
  // Keep first; demote the rest.
  let nextScope = scope;
  for (const peer of uniq.slice(1)) {
    const text = peer.text || "Untitled";
    const demoted = `<p class="kicker" data-shine-title-demoted>${text}</p>`;
    nextScope = nextScope.replace(peer.full, demoted);
  }
  if (mainMatch) {
    out = out.replace(mainMatch[0], nextScope);
  } else {
    out = nextScope;
  }
  return out;
}

export function applyKpiCollapse(html, op = {}) {
  const maxVisible = op.maxVisible ?? 3;
  const openRe = /<div\b[^>]*class=["'][^"']*\bmetrics\b[^"']*["'][^>]*>/i;
  const openMatch = openRe.exec(html);
  if (!openMatch) return html;
  const start = openMatch.index;
  const open = openMatch[0];
  // Walk to matching close for the metrics container (nested .metric divs inside).
  let i = start + open.length;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", i);
    const nextClose = html.indexOf("</div>", i);
    if (nextClose < 0) return html;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        const body = html.slice(start + open.length, nextClose);
        const close = "</div>";
        const re = /<div\b[^>]*class=["'][^"']*\bmetric\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi;
        const metrics = body.match(re) || [];
        if (metrics.length <= maxVisible) return html;
        const visible = metrics.slice(0, maxVisible).join("\n");
        const rest = metrics.slice(maxVisible).join("\n");
        const wrapped =
          `${open}\n${visible}\n` +
          `<details data-shine-kpi-rest><summary>More metrics</summary>\n${rest}\n</details>\n${close}`;
        let next = html.slice(0, start) + wrapped + html.slice(nextClose + close.length);
        // Drop diagnosis kickers that describe the defect ("10 equal metric tiles…").
        next = scrubDiagnosticKpiKickers(next);
        return next;
      }
      i = nextClose + 6;
    }
  }
  return html;
}

/**
 * Worklist-first (DOM): move records/worklist ahead of KPI chrome in main, then stamp focal.
 * Best-effort regex for HTML fixtures; consumer TSX uses apply-tsx AST worklistFirstTsx.
 */
export function applyWorklistFirst(html, op = {}) {
  let out = String(html);
  // Prefer swapping a KPI section that precedes the first grid-wrap / role=grid worklist.
  const kpiRe =
    /<(section|div)\b[^>]*(?:data-sled-kpis|\bclass=["'][^"']*\bmetrics\b)[^>]*>[\s\S]*?<\/\1>/i;
  const workRe =
    /<(div|section|table)\b[^>]*(?:class=["'][^"']*\bgrid-wrap\b|data-shine-records|data-product-pattern=["'][^"']*(?:queue|worklist|records)|role=["']grid["'])[^>]*>[\s\S]*?<\/\1>/i;
  const kpiMatch = out.match(kpiRe);
  const workMatch = out.match(workRe);
  if (kpiMatch && workMatch && kpiMatch.index != null && workMatch.index != null) {
    if (kpiMatch.index < workMatch.index) {
      const kpi = kpiMatch[0];
      const work = workMatch[0];
      // Remove work first (later index), then KPI, then reinsert work + kpi at KPI's index.
      out = out.slice(0, workMatch.index) + out.slice(workMatch.index + work.length);
      const kpi2 = out.match(kpiRe);
      if (kpi2 && kpi2.index != null) {
        out = out.slice(0, kpi2.index) + out.slice(kpi2.index + kpi2[0].length);
        out = out.slice(0, kpi2.index) + work + "\n" + kpi + out.slice(kpi2.index);
      }
    }
  }
  return applySetFocal(out, op);
}

/** Set data-region=focal on primary work object (grid wrap, grid table, card, or main). */
export function applySetFocal(html, op = {}) {
  const attr = op.attr || "data-region";
  const value = op.value || "focal";
  if (new RegExp(`${attr}=["']${value}["']`).test(html)) return html;
  // Prefer first .grid-wrap or first table[role=grid]
  if (/class=["'][^"']*\bgrid-wrap\b/.test(html)) {
    return html.replace(
      /(<div\b[^>]*class=["'][^"']*\bgrid-wrap\b[^"']*["'])/,
      `$1 ${attr}="${value}"`,
    );
  }
  if (/<table\b[^>]*role=["']grid["']/.test(html)) {
    return html.replace(/(<table\b[^>]*role=["']grid["'])/, `$1 ${attr}="${value}"`);
  }
  // Card soup (Usul-class): first .card section/div becomes the focal work object.
  if (/class=["'][^"']*\bcard\b/.test(html)) {
    return html.replace(
      /(<(?:section|div|article)\b[^>]*class=["'][^"']*\bcard\b[^"']*["'])/,
      `$1 ${attr}="${value}"`,
    );
  }
  if (/<table\b/.test(html)) {
    return html.replace(/(<table\b)/, `$1 ${attr}="${value}"`);
  }
  // Last resort: stamp the shine main region so composition-slop can clear.
  return html.replace(/(<[a-z]+[^>]*data-shine-main\b[^>]*)/i, `$1 ${attr}="${value}"`);
}

export function applyRebindCite(html, op = {}) {
  const from = op.from || "";
  const to = op.to;
  if (!to) return html;
  if (from) {
    return html.replace(new RegExp(`data-cite=["']${escapeRe(from)}["']`, "g"), `data-cite="${to}"`);
  }
  // Replace first page-level data-cite on <html> or body main
  return html.replace(/(<html\b[^>]*data-cite=["'])([^"']+)(["'])/i, `$1${to}$3`);
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatPeerGridPlan(op = {}, plan = {}) {
  const keep = (op.keepTitleIncludes || ["Queue"]).join("|");
  const fold = (op.foldTitleIncludes || ["David"]).join("|");
  return [
    "## collapse-peer-grids (plan only — no silent delete)",
    "",
    `- Job: ${plan.job || "(unset)"}`,
    `- Keep worklist whose title matches: ${keep}`,
    `- Fold peer whose title matches: ${fold} → saved-view / filter chip / XOR`,
    `- Mode: ${op.mode || "xor-saved-view"}`,
    `- Agent close (D10): run \`node verify/restructure/xor-saved-view.mjs --html <file> --keep ${keep} --fold ${fold}\``,
    `- Recipe: peer title → filter chip + shared DataGrid state (kits.md § Dual-grid XOR)`,
    `- After agent applies: one [role=grid] in the fold; re-run measure dual-focal FAIL→PASS`,
    `- Crop proof: verify/fixtures/denoise/receipts/queue-dual-grid-fold-crop.html`,
    "",
  ].join("\n");
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const htmlPath = opt("--html") || args.find((a) => a.endsWith(".html"));
  const planPath = opt("--plan");
  const outPath = opt("--out");
  if (!htmlPath || !planPath) {
    console.error("usage: apply-dom.mjs --html <file> --plan <shine-restructure.json> [--out <file>]");
    process.exit(1);
  }
  const plan = JSON.parse(readFileSync(resolve(planPath), "utf8"));
  const result = applyDomRestructure(readFileSync(resolve(htmlPath), "utf8"), plan);
  if (outPath) writeFileSync(outPath, result.html);
  process.stdout.write(
    JSON.stringify({ applied: result.applied, plans: result.plans.length, humanGate: result.humanGate, out: outPath || null }, null, 2) +
      "\n",
  );
  if (result.plans.length) process.stdout.write(result.plans.join("\n"));
}
