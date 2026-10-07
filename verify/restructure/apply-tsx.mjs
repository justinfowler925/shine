#!/usr/bin/env node
/**
 * N8 — TSX AST safe ops for consumer checkouts.
 * Auto-safe: rebind-cite, set-focal, cta-budget demote (maxFilled=1 via TS compiler AST).
 * collapse-peer-grids → plan markdown only (never auto-deletes grids).
 *
 * Uses TypeScript compiler API (devDependency). Dry-run by default; --write to apply.
 */

import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { AUTO_SAFE_DOM_OPS, PLAN_ONLY_OPS, validateRestructurePlan } from "./schema.mjs";
import { formatPeerGridPlan } from "./apply-dom.mjs";

/**
 * @param {string} source
 * @param {object} plan
 * @returns {{ source: string, applied: string[], plans: string[], changed: boolean, humanGate: boolean }}
 */
export function applyTsxRestructure(source, plan) {
  const v = validateRestructurePlan(plan);
  if (!v.ok) throw new Error(`refuse apply-tsx: ${v.errors.join("; ")}`);

  let text = String(source);
  const applied = [];
  const plans = [];

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
 * Count filled Button primaries in TSX (variant default / missing variant).
 * Uses the same AST rules as ctaBudgetTsx.
 * @param {string} source
 * @returns {{ filled: number, labels: string[] }}
 */
export function countFilledButtonsTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const labels = [];
  visitButtons(sf, (opening, node) => {
    if (!isFilledButtonOpening(opening, sf)) return;
    labels.push(labelFromJsx(node, sf));
  });
  return { filled: labels.length, labels };
}

/**
 * Demote non-preferred filled Button primaries via TypeScript AST (maxFilled=1).
 * Handles:
 * - variant="default" / 'default'
 * - variant={"default"} / {'default'}
 * - missing variant (shadcn default = filled)
 * - multiline attrs + nested text children
 * Keeps preferred labels (children text) as filled up to maxFilled; demotes peers
 * to outline (or demotePolicy). Never invents handlers/permissions.
 */
export function ctaBudgetTsx(source, op = {}) {
  const prefer = (op.preferLabels || ["Pursue"]).map((s) => String(s).toLowerCase());
  const maxFilled = op.maxFilled ?? 1;
  const demoteTo = op.demotePolicy === "ghost" ? "ghost" : "outline";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  let kept = 0;

  visitButtons(sf, (opening, node) => {
    if (!isFilledButtonOpening(opening, sf)) return;
    const label = labelFromJsx(node, sf);
    const preferred = prefer.some((p) => label.includes(p));
    if (preferred && kept < maxFilled) {
      kept += 1;
      return;
    }
    const variantAttr = findJsxAttr(opening, "variant", sf);
    if (variantAttr) {
      edits.push({
        start: variantAttr.getStart(sf),
        end: variantAttr.getEnd(),
        replacement: `variant="${demoteTo}"`,
      });
    } else {
      // Insert after tag name: <Button → <Button variant="outline"
      const insertAt = opening.tagName.getEnd();
      edits.push({
        start: insertAt,
        end: insertAt,
        replacement: ` variant="${demoteTo}"`,
      });
    }
  });

  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  }
  return out;
}

/**
 * @param {ts.Node} root
 * @param {(opening: ts.JsxOpeningLikeElement, node: ts.JsxElement | ts.JsxSelfClosingElement) => void} fn
 */
function visitButtons(root, fn) {
  const walk = (node) => {
    if (ts.isJsxElement(node) && jsxTagName(node.openingElement) === "Button") {
      fn(node.openingElement, node);
    } else if (ts.isJsxSelfClosingElement(node) && jsxTagName(node) === "Button") {
      fn(node, node);
    }
    ts.forEachChild(node, walk);
  };
  walk(root);
}

/** @param {ts.JsxOpeningLikeElement} opening */
function jsxTagName(opening) {
  return opening.tagName.getText();
}

/**
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {string} name
 * @param {ts.SourceFile} sf
 */
function findJsxAttr(opening, name, sf) {
  for (const prop of opening.attributes.properties) {
    if (!ts.isJsxAttribute(prop)) continue;
    if (prop.name.getText(sf) === name) return prop;
  }
  return null;
}

/**
 * Filled primary = variant default (string / {"default"}) OR missing variant
 * (shadcn Button default). Dynamic variant expressions are left alone (unsafe).
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isFilledButtonOpening(opening, sf) {
  const attr = findJsxAttr(opening, "variant", sf);
  if (!attr) return true;
  if (!attr.initializer) return true;
  if (ts.isStringLiteral(attr.initializer)) {
    return attr.initializer.text === "default";
  }
  if (ts.isJsxExpression(attr.initializer)) {
    const expr = attr.initializer.expression;
    if (!expr) return false;
    if (ts.isStringLiteral(expr)) return expr.text === "default";
    if (ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text === "default";
    return false;
  }
  return false;
}

/**
 * @param {ts.JsxElement | ts.JsxSelfClosingElement} node
 * @param {ts.SourceFile} sf
 */
function labelFromJsx(node, sf) {
  if (ts.isJsxSelfClosingElement(node)) {
    const aria = findJsxAttr(node, "aria-label", sf);
    if (aria?.initializer && ts.isStringLiteral(aria.initializer)) {
      return aria.initializer.text.trim().toLowerCase();
    }
    return "";
  }
  let text = "";
  const walk = (n) => {
    if (ts.isJsxText(n)) {
      text += n.text;
      return;
    }
    if (ts.isJsxExpression(n) && n.expression) {
      if (ts.isStringLiteral(n.expression) || ts.isNoSubstitutionTemplateLiteral(n.expression)) {
        text += n.expression.text;
      }
      return;
    }
    if (ts.isJsxElement(n)) {
      for (const c of n.children) walk(c);
      return;
    }
    if (ts.isJsxSelfClosingElement(n)) return;
  };
  for (const c of node.children) walk(c);
  return text.replace(/\s+/g, " ").trim().toLowerCase();
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
