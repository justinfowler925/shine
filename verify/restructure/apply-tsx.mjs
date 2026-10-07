#!/usr/bin/env node
/**
 * N8 — TSX AST safe ops for consumer checkouts.
 * Auto-safe: rebind-cite, set-focal, cta-budget demote (maxFilled=1 via TS compiler AST),
 * kpi-collapse (maxVisible=3 → <details data-shine-kpi-rest> via TS compiler AST).
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
      const next = kpiCollapseTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("kpi-collapse");
      } else {
        // Plan-only when soup remains (dynamic .map / spread) — not when already ≤maxVisible.
        const census = countMetricTilesTsx(text);
        const maxVisible = op.maxVisible ?? 3;
        if (census.dynamic || census.tiles > maxVisible) {
          plans.push(
            "## kpi-collapse (TSX)\n\nWrap excess metric JSX in `<details data-shine-kpi-rest>` manually if metrics are dynamic (`.map`, spread).\nDOM apply-dom.mjs remains preferred for HTML fixtures.\n",
          );
        }
      }
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
 * Count literal metric tiles in TSX (same AST rules as kpiCollapseTsx).
 * @param {string} source
 * @returns {{ tiles: number, labels: string[], containers: number, dynamic: boolean }}
 */
export function countMetricTilesTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const labels = [];
  let containers = 0;
  let dynamic = false;
  visitMetricContainers(sf, (opening, node) => {
    containers += 1;
    const { tiles, unsafe } = metricTilesInContainer(node, sf);
    if (unsafe) dynamic = true;
    for (const t of tiles) labels.push(labelFromJsx(t, sf));
  });
  return { tiles: labels.length, labels, containers, dynamic };
}

/**
 * Collapse excess literal metric JSX via TypeScript AST (maxVisible=3).
 * Keeps the first maxVisible peer tiles; wraps the rest in
 * `<details data-shine-kpi-rest><summary>More metrics</summary>…</details>`.
 * Handles:
 * - className="metric" / className={"metric"} / className={'metric foo'}
 * - data-shine-kpi / data-kpi markers without className
 * - multiline attrs + nested text children
 * Skips containers with dynamic children (.map / spreads) — caller emits plan note.
 * Never invents Nucleus handlers or deletes the work object.
 */
export function kpiCollapseTsx(source, op = {}) {
  const maxVisible = op.maxVisible ?? 3;
  const restSummary = op.summary || "More metrics";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];

  visitMetricContainers(sf, (_opening, node) => {
    if (!ts.isJsxElement(node)) return;
    const { tiles, unsafe, alreadyCollapsed } = metricTilesInContainer(node, sf);
    if (unsafe || alreadyCollapsed) return;
    if (tiles.length <= maxVisible) return;

    const visible = tiles.slice(0, maxVisible);
    const rest = tiles.slice(maxVisible);
    // Replace from first tile start through last tile end with visible + details.
    const rangeStart = visible[0].getStart(sf);
    const rangeEnd = rest[rest.length - 1].getEnd();
    const indent = indentBefore(text, rangeStart);
    const innerIndent = indent + "  ";
    const visibleSrc = visible.map((t) => text.slice(t.getStart(sf), t.getEnd())).join(`\n${indent}`);
    const restSrc = rest
      .map((t) => text.slice(t.getStart(sf), t.getEnd()))
      .join(`\n${innerIndent}`);
    const replacement =
      `${visibleSrc}\n${indent}` +
      `<details data-shine-kpi-rest>\n${innerIndent}<summary>${restSummary}</summary>\n${innerIndent}` +
      `${restSrc}\n${indent}</details>`;
    edits.push({ start: rangeStart, end: rangeEnd, replacement });
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
function visitMetricContainers(root, fn) {
  const walk = (node) => {
    if (ts.isJsxElement(node) && isMetricsContainerOpening(node.openingElement, sfOf(node))) {
      fn(node.openingElement, node);
    } else if (ts.isJsxSelfClosingElement(node) && isMetricsContainerOpening(node, sfOf(node))) {
      fn(node, node);
    }
    ts.forEachChild(node, walk);
  };
  // SourceFile is always the root we walk; capture via getSourceFile.
  walk(root);
}

/** @param {ts.Node} node */
function sfOf(node) {
  return node.getSourceFile();
}

/**
 * Metrics band: className contains word "metrics", or aria-label ~ key figures,
 * or data-region / data-sled-kpis markers.
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isMetricsContainerOpening(opening, sf) {
  if (classNameHasWord(opening, "metrics", sf)) return true;
  const aria = findJsxAttr(opening, "aria-label", sf);
  const ariaText = attrStringValue(aria, sf);
  if (ariaText && /key figures|metrics|kpi/i.test(ariaText)) return true;
  if (findJsxAttr(opening, "data-sled-kpis", sf)) return true;
  const region = findJsxAttr(opening, "data-region", sf);
  const regionText = attrStringValue(region, sf);
  if (regionText && /kpi|metrics|summary/i.test(regionText)) return true;
  return false;
}

/**
 * @param {ts.JsxElement} container
 * @param {ts.SourceFile} sf
 * @returns {{ tiles: Array<ts.JsxElement | ts.JsxSelfClosingElement>, unsafe: boolean, alreadyCollapsed: boolean }}
 */
function metricTilesInContainer(container, sf) {
  /** @type {Array<ts.JsxElement | ts.JsxSelfClosingElement>} */
  const tiles = [];
  let unsafe = false;
  let alreadyCollapsed = false;
  if (!ts.isJsxElement(container)) return { tiles, unsafe: true, alreadyCollapsed };

  for (const child of container.children) {
    if (ts.isJsxText(child)) {
      if (child.text.trim()) {
        /* ignore whitespace-only */
      }
      continue;
    }
    if (ts.isJsxExpression(child)) {
      // `{items.map(...)}` / spreads — not auto-safe.
      if (child.expression) unsafe = true;
      continue;
    }
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
      const opening = ts.isJsxElement(child) ? child.openingElement : child;
      const tag = jsxTagName(opening);
      if (tag === "details" && findJsxAttr(opening, "data-shine-kpi-rest", sf)) {
        alreadyCollapsed = true;
        continue;
      }
      if (isMetricTileOpening(opening, sf)) {
        tiles.push(child);
      }
    }
  }
  return { tiles, unsafe, alreadyCollapsed };
}

/**
 * Metric tile: className word "metric" (after stripping "metrics"), or data-shine-kpi / data-kpi.
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isMetricTileOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-kpi", sf)) return true;
  if (findJsxAttr(opening, "data-kpi", sf)) return true;
  const cn = classNameText(opening, sf);
  if (!cn) return false;
  // "metrics" container class must not count as a tile; strip then look for "metric".
  return /\bmetric\b/.test(cn.replace(/\bmetrics\b/g, " "));
}

/**
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {string} word
 * @param {ts.SourceFile} sf
 */
function classNameHasWord(opening, word, sf) {
  const cn = classNameText(opening, sf);
  if (!cn) return false;
  return new RegExp(`\\b${escapeRe(word)}\\b`).test(cn);
}

/**
 * Resolve static className string from attr (string / {"…"} / {'…'} / `…`).
 * Dynamic expressions return null (caller treats as non-match / unsafe elsewhere).
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function classNameText(opening, sf) {
  const attr = findJsxAttr(opening, "className", sf) || findJsxAttr(opening, "class", sf);
  return attrStringValue(attr, sf);
}

/**
 * @param {ts.JsxAttribute | null} attr
 * @param {ts.SourceFile} sf
 */
function attrStringValue(attr, sf) {
  if (!attr?.initializer) {
    // Boolean JSX attr present with no value (data-shine-kpi) — signal emptiness via "".
    if (attr && !attr.initializer) return "";
    return null;
  }
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  if (ts.isJsxExpression(attr.initializer)) {
    const expr = attr.initializer.expression;
    if (!expr) return null;
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
    return null;
  }
  return null;
}

/** Indentation (spaces/tabs) preceding `pos` on its line. */
function indentBefore(text, pos) {
  let i = pos - 1;
  while (i >= 0 && text[i] !== "\n") i -= 1;
  const lineStart = i + 1;
  const m = /^[ \t]*/.exec(text.slice(lineStart, pos));
  return m ? m[0] : "";
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
