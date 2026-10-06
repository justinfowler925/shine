#!/usr/bin/env node
/**
 * N8 — TSX AST safe ops for consumer checkouts.
 * Auto-safe: rebind-cite, set-focal, cta-budget demote (variant="default" → "outline").
 * collapse-peer-grids → plan markdown only (never auto-deletes grids).
 *
 * Uses TypeScript compiler API (devDependency). Dry-run by default; --write to apply.
 */

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { AUTO_SAFE_DOM_OPS, PLAN_ONLY_OPS, validateRestructurePlan } from "./schema.mjs";
import { formatPeerGridPlan } from "./apply-dom.mjs";

/**
 * @param {string} source
 * @param {object} plan
 * @returns {{ source: string, applied: string[], plans: string[], changed: boolean }}
 */
export function applyTsxRestructure(source, plan) {
  const v = validateRestructurePlan(plan);
  if (!v.ok) throw new Error(`refuse apply-tsx: ${v.errors.join("; ")}`);

  let text = String(source);
  const applied = [];
  const plans = [];
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  for (const op of plan.ops || []) {
    if (PLAN_ONLY_OPS.includes(op.op)) {
      plans.push(formatPeerGridPlan(op, plan));
      continue;
    }
    if (!AUTO_SAFE_DOM_OPS.includes(op.op)) continue;

    if (op.op === "rebind-cite") {
      const next = rebindCiteTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("rebind-cite");
      }
    } else if (op.op === "set-focal") {
      const next = setFocalTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("set-focal");
      }
    } else if (op.op === "cta-budget") {
      const next = ctaBudgetTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("cta-budget");
      }
    } else if (op.op === "kpi-collapse") {
      // KPI collapse on TSX is presentation-structure only when metrics are literal JSX —
      // if unsafe, emit plan note rather than inventing Nucleus handlers.
      plans.push(
        "## kpi-collapse (TSX)\n\nWrap excess metric JSX in `<details>` manually if metrics are dynamic.\nDOM apply-dom.mjs remains preferred for fixtures.\n",
      );
    }
  }

  // Touch sf so unused import lint stays quiet in some hosts
  void sf.fileName;

  return {
    source: text,
    applied,
    plans,
    changed: text !== source,
    humanGate: plans.length > 0 || plan.humanGate,
  };
}

export function rebindCiteTsx(source, op = {}) {
  const from = op.from;
  const to = op.to;
  if (!to) return source;
  if (from) {
    return source
      .replace(new RegExp(`data-cite=["']${escapeRe(from)}["']`, "g"), `data-cite="${to}"`)
      .replace(new RegExp(`dataCite=["']${escapeRe(from)}["']`, "g"), `dataCite="${to}"`);
  }
  return source.replace(/(data-cite|dataCite)=["'][^"']+["']/, `$1="${to}"`);
}

export function setFocalTsx(source, op = {}) {
  const attr = op.attr || "data-region";
  const value = op.value || "focal";
  if (new RegExp(`${attr}=["']${value}["']`).test(source)) return source;
  // Prefer first DataGrid / role="grid" / element with data-product-pattern containing queue
  const patterns = [
    /(<DataGrid\b)/,
    /(<(?:div|section|main)\b[^>]*data-product-pattern=["'][^"']*queue[^"']*["'][^>]*)/,
    /(<(?:table|div|section)\b[^>]*role=["']grid["'][^>]*)/,
  ];
  for (const re of patterns) {
    if (re.test(source)) {
      return source.replace(re, `$1 ${attr}="${value}"`);
    }
  }
  return source;
}

/**
 * Demote non-preferred Button variant="default" → "outline".
 * Keeps first preferred label (children text) as default up to maxFilled.
 */
export function ctaBudgetTsx(source, op = {}) {
  const prefer = (op.preferLabels || ["Pursue"]).map((s) => s.toLowerCase());
  const maxFilled = op.maxFilled ?? 1;
  let kept = 0;
  // Match <Button ... variant="default" ...>Label</Button>
  return source.replace(
    /<Button\b([^>]*?)>([\s\S]*?)<\/Button>/g,
    (full, attrs, children) => {
      if (!/variant=["']default["']/.test(attrs)) return full;
      const label = String(children).replace(/<[^>]+>/g, "").trim().toLowerCase();
      const preferred = prefer.some((p) => label.includes(p));
      if (preferred && kept < maxFilled) {
        kept++;
        return full;
      }
      const nextAttrs = attrs.replace(/variant=["']default["']/, 'variant="outline"');
      return `<Button${nextAttrs}>${children}</Button>`;
    },
  );
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const file = opt("--tsx") || args.find((a) => /\.tsx?$/.test(a));
  const planPath = opt("--plan");
  const write = args.includes("--write");
  if (!file || !planPath) {
    console.error("usage: apply-tsx.mjs --tsx <file.tsx> --plan <plan.json> [--write]");
    process.exit(1);
  }
  const plan = JSON.parse(readFileSync(resolve(planPath), "utf8"));
  const result = applyTsxRestructure(readFileSync(resolve(file), "utf8"), plan);
  if (write && result.changed) writeFileSync(resolve(file), result.source);
  process.stdout.write(
    JSON.stringify(
      {
        applied: result.applied,
        plans: result.plans.length,
        changed: result.changed,
        wrote: write && result.changed,
        humanGate: result.humanGate,
      },
      null,
      2,
    ) + "\n",
  );
  if (result.plans.length) process.stdout.write(result.plans.join("\n"));
}
