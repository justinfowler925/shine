#!/usr/bin/env node
/**
 * N7 — Apply shine-restructure/v1 auto-safe ops to HTML fixtures (DOM substrate).
 * Ops: cta-budget, kpi-collapse, set-focal, rebind-cite.
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
    } else if (op.op === "set-focal") {
      out = applySetFocal(out, op);
      applied.push("set-focal");
    } else if (op.op === "rebind-cite") {
      out = applyRebindCite(out, op);
      applied.push("rebind-cite");
    }
  }

  return { html: out, applied, plans, skipped, humanGate: plans.length > 0 || plan.humanGate };
}

/** Demote non-preferred filled buttons to outline (class swap). */
export function applyCtaBudget(html, op = {}) {
  const prefer = (op.preferLabels || ["Pursue"]).map((s) => s.toLowerCase());
  const maxFilled = op.maxFilled ?? 1;
  let kept = 0;
  // filled-peer → outline first
  let out = html.replace(/\bfilled-peer\b/g, "outline");
  // Per-button: keep preferred labels as filled up to maxFilled; demote others
  out = out.replace(
    /<button\b([^>]*?)class=(["'])([^"']*)\2([^>]*)>([\s\S]*?)<\/button>/gi,
    (full, pre, q, cls, post, label) => {
      if (!/\bfilled\b/.test(cls)) return full;
      const text = String(label).replace(/<[^>]+>/g, "").trim().toLowerCase();
      const preferred = prefer.some((p) => text.includes(p));
      if (preferred && kept < maxFilled) {
        kept++;
        return full;
      }
      const nextCls = cls
        .replace(/\bfilled\b/g, "outline")
        .replace(/\s+/g, " ")
        .trim();
      return `<button${pre}class=${q}${nextCls}${q}${post}>${label}</button>`;
    },
  );
  return out;
}

/** Keep first maxVisible metrics; wrap the rest in <details>. */
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
        return html.slice(0, start) + wrapped + html.slice(nextClose + close.length);
      }
      i = nextClose + 6;
    }
  }
  return html;
}

/** Set data-region=focal on primary worklist (first role=grid wrap or table). */
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
  return html.replace(/(<table\b[^>]*role=["']grid["'])/, `$1 ${attr}="${value}"`);
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
    `- After agent applies: one [role=grid] in the fold; re-run measure dual-focal`,
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
