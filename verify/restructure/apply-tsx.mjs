#!/usr/bin/env node
/**
 * N8 — TSX AST safe ops for consumer checkouts.
 * Auto-safe: rebind-cite (wrong-cite → category truth via TS compiler AST),
 * set-focal (NO-FOCAL / composition-slop → data-region=focal via TS compiler AST),
 * worklist-first (records/worklist before KPI chrome via TS compiler AST),
 * cta-budget demote (maxFilled=1 via TS compiler AST),
 * kpi-collapse (maxVisible=3 → <details data-shine-kpi-rest> via TS compiler AST),
 * pill-collapse (maxVisible=3 → <details data-shine-pill-rest> via TS compiler AST),
 * stamp-page-title (missing title/h1), title-singular (one page title; demote peers to kicker via TS compiler AST),
 * chrome-budget (maxFilledChrome=0 → demote header/nav filled Buttons via TS compiler AST),
 * filter-clearable (active chips → data-shine-filter-dismiss + clear-all via TS compiler AST),
 * strip-marketing-dna (glow/gradient/display-serif className tokens via TS compiler AST),
 * rewrite-filler-empty (filler empty phrases → job copy via TS compiler AST),
 * collapse-card-soup (equal Cards → focal + details data-shine-card-rest via TS compiler AST),
 * split-empty-triad (empty≡error / missing filtered-empty → distinct triad via TS compiler AST),
 * stamp-chart-units (decorative chart → data-unit + baseline via TS compiler AST),
 * bind-product-owner (parallel worklist → reuse-bound owner + demote parallel via TS compiler AST),
 * name-controls (incomplete primitives → aria-label / confirm stamps via TS compiler AST),
 * link-field-errors (aria-invalid → aria-describedby + role=alert via TS compiler AST),
 * collapse-peer-grids (dual-focal ban → XOR chip + shared DataGrid via TS compiler AST).
 * DOM apply-dom still plan-only for collapse-peer-grids (never silent delete).
 * TSX AST applies the XOR recipe (peer title → filter chip); dynamic/mapped peers stay plan-only.
 *
 * Uses TypeScript compiler API (devDependency). Dry-run by default; --write to apply.
 */

import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { AUTO_SAFE_DOM_OPS, PLAN_ONLY_OPS, sortRestructureOps, validateRestructurePlan } from "./schema.mjs";
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
  const orderedOps = sortRestructureOps(plan.ops || []);

  for (const op of orderedOps) {
    // Dual-focal ban: TSX AST XOR recipe when ≥2 literal peer wraps; else plan markdown.
    // DOM apply-dom stays plan-only — this path never silent-deletes without XOR chips.
    if (op.op === "collapse-peer-grids") {
      const next = collapsePeerGridsTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("collapse-peer-grids");
      } else {
        plans.push(formatPeerGridPlan(op, plan));
      }
      continue;
    }
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
    } else if (op.op === "worklist-first") {
      const next = worklistFirstTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("worklist-first");
      } else {
        const census = compositionOrderTsx(text);
        if (census.kpiBeforeWorklist || census.dynamic) {
          plans.push(
            "## worklist-first (TSX)\n\nReorder records/worklist ahead of KPI chrome manually if siblings are dynamic (`.map`, spread).\nStamp `data-region=\"focal\"` on the primary worklist.\n",
          );
        }
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
    } else if (op.op === "pill-collapse") {
      const next = pillCollapseTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("pill-collapse");
      } else {
        const census = countFilterPillsTsx(text);
        const maxVisible = op.maxVisible ?? 3;
        if (census.dynamic || census.pills > maxVisible) {
          plans.push(
            "## pill-collapse (TSX)\n\nWrap excess filter-pill JSX in `<details data-shine-pill-rest>` manually if pills are dynamic (`.map`, spread).\n",
          );
        }
      }
    } else if (op.op === "stamp-page-title") {
      const next = stampPageTitleTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("stamp-page-title");
      } else {
        const census = countMissingPageTitleTsx(text);
        if (census.hits > 0) {
          plans.push(
            "## stamp-page-title (TSX)\n\nStamp a visible h1 (data-page-title) when the surface has no named page title.\n",
          );
        }
      }
    } else if (op.op === "title-singular") {
      const next = titleSingularTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("title-singular");
      } else {
        const census = countPageTitlesTsx(text);
        if (census.dynamic || census.titles > 1) {
          plans.push(
            "## title-singular (TSX)\n\nKeep one page title; demote peer h1 / data-page-title / page-title to `<p className=\"kicker\" data-shine-title-demoted>`.\n",
          );
        }
      }
    } else if (op.op === "chrome-budget") {
      const next = chromeBudgetTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("chrome-budget");
      } else {
        const census = countChromeFilledButtonsTsx(text);
        if (census.dynamic || census.filled > 0) {
          plans.push(
            "## chrome-budget (TSX)\n\nDemote filled Button primaries inside header/nav/aside chrome to outline/ghost; keep the job verb filled in main.\n",
          );
        }
      }
    } else if (op.op === "filter-clearable") {
      const next = filterClearableTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("filter-clearable");
      } else {
        const census = countIrreversibleFiltersTsx(text);
        if (census.dynamic || census.irreversible > 0) {
          plans.push(
            "## filter-clearable (TSX)\n\nStamp data-shine-filter-dismiss on active filter chips and add data-shine-filter-clear-all when dismiss affordances are missing.\n",
          );
        }
      }
    } else if (op.op === "strip-marketing-dna") {
      const next = stripMarketingDnaTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("strip-marketing-dna");
      } else {
        const census = countMarketingDnaTsx(text);
        if (census.dynamic || census.hits > 0) {
          plans.push(
            "## strip-marketing-dna (TSX)\n\nRemove glow/gradient/display-serif className tokens from Operate chrome JSX.\n",
          );
        }
      }
    } else if (op.op === "rewrite-filler-empty") {
      const next = rewriteFillerEmptyTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("rewrite-filler-empty");
      } else {
        const census = countFillerEmptyTsx(text);
        if (census.dynamic || census.hits > 0) {
          plans.push(
            "## rewrite-filler-empty (TSX)\n\nReplace filler empty-state phrases with job-specific instructional copy.\n",
          );
        }
      }
    } else if (op.op === "collapse-card-soup") {
      const next = collapseCardSoupTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("collapse-card-soup");
      } else {
        const census = countCardSoupTsx(text);
        if (census.dynamic || census.cards > (op.maxVisible ?? 1)) {
          plans.push(
            "## collapse-card-soup (TSX)\n\nStamp data-region=focal on one Card; park peers in <details data-shine-card-rest>.\n",
          );
        }
      }
    } else if (op.op === "split-empty-triad") {
      const next = splitEmptyTriadTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("split-empty-triad");
      } else {
        const census = countEmptyTriadTsx(text);
        if (census.hits > 0) {
          plans.push(
            "## split-empty-triad (TSX)\n\nStamp data-filtered-empty; drop alert/error from empty; distinct error sibling.\n",
          );
        }
      }
    } else if (op.op === "stamp-chart-units") {
      const next = stampChartUnitsTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("stamp-chart-units");
      } else {
        const census = countDecorativeChartTsx(text);
        if (census.hits > 0) {
          plans.push(
            "## stamp-chart-units (TSX)\n\nStamp data-unit + data-baseline + data-shine-chart-stamped on chart JSX.\n",
          );
        }
      }
    } else if (op.op === "bind-product-owner") {
      const next = bindProductOwnerTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("bind-product-owner");
      } else {
        const census = countParallelOwnedTsx(text);
        if (census.hits > 0) {
          plans.push(
            "## bind-product-owner (TSX)\n\nStamp data-shine-reuse-bound on product owners; demote parallel worklists into details.\n",
          );
        }
      }
    } else if (op.op === "name-controls") {
      const next = nameControlsTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("name-controls");
      } else {
        const census = countIncompletePrimitivesTsx(text);
        if (census.hits > 0) {
          plans.push(
            "## name-controls (TSX)\n\nStamp aria-label on icon-only / unlabeled controls; data-confirm on destructive verbs.\n",
          );
        }
      }
    } else if (op.op === "link-field-errors") {
      const next = linkFieldErrorsTsx(text, op);
      if (next !== text) {
        text = next;
        applied.push("link-field-errors");
      } else {
        const census = countFormHeuristicTsx(text);
        if (census.hits > 0) {
          plans.push(
            "## link-field-errors (TSX)\n\nStamp aria-describedby + role=alert error sibling on aria-invalid fields.\n",
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

/**
 * Wrong-cite census: static data-cite / dataCite values on JSX (string or {"…"}).
 * Dynamic expressions count as dynamic (caller leaves them alone).
 * @param {string} source
 * @returns {{ cites: string[], dynamic: boolean }}
 */
export function collectCiteAttrsTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const cites = [];
  let dynamic = false;
  const walk = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      for (const name of ["data-cite", "dataCite"]) {
        const attr = findJsxAttr(opening, name, sf);
        if (!attr) continue;
        const val = attrStringValue(attr, sf);
        if (val == null) {
          if (attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
            dynamic = true;
          }
          continue;
        }
        if (val) cites.push(val);
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { cites, dynamic };
}

/**
 * Rebind data-cite / dataCite via TypeScript AST (not regex).
 * Handles data-cite="…", data-cite={"…"}, dataCite="…", dataCite={"…"}.
 * When `from` is set, only matching static values rewrite; otherwise first static cite.
 * Dynamic cite expressions are left alone (unsafe).
 * @param {string} source
 * @param {{ from?: string, to?: string }} op
 */
export function rebindCiteTsx(source, op = {}) {
  const from = op.from ? String(op.from) : "";
  const to = op.to ? String(op.to) : "";
  if (!to) return source;
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, next: string }[]} */
  const edits = [];
  let reboundFirst = false;

  const walk = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      for (const name of ["data-cite", "dataCite"]) {
        const attr = findJsxAttr(opening, name, sf);
        if (!attr?.initializer) continue;
        const val = attrStringValue(attr, sf);
        if (val == null) continue; // dynamic — leave alone
        const match = from ? val === from : !reboundFirst;
        if (!match) continue;
        if (!from) reboundFirst = true;
        // Rewrite initializer only; preserve string vs {"…"} form.
        if (ts.isStringLiteral(attr.initializer)) {
          edits.push({
            start: attr.initializer.getStart(sf),
            end: attr.initializer.getEnd(),
            next: `"${to}"`,
          });
        } else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
          const expr = attr.initializer.expression;
          if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
            const quote = text[expr.getStart(sf)] === "'" ? "'" : '"';
            edits.push({
              start: expr.getStart(sf),
              end: expr.getEnd(),
              next: `${quote}${to}${quote}`,
            });
          }
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  if (!edits.length) return source;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.next + out.slice(e.end);
  }
  return out;
}

/**
 * Census for NO-FOCAL / composition-slop: worklist + equal-card candidates and
 * whether any already carries data-region=focal (string or {"focal"}).
 * @param {string} source
 * @returns {{ candidates: number, worklists: number, cards: number, hasFocal: boolean, dynamic: boolean }}
 */
export function countEqualCardsWithoutFocalTsx(source) {
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const { worklists, cards, hasFocal, dynamic } = collectFocalCandidates(sf);
  return {
    candidates: worklists.length + cards.length,
    worklists: worklists.length,
    cards: cards.length,
    hasFocal,
    dynamic,
  };
}

/**
 * Stamp data-region=focal on the primary work object via TypeScript AST.
 * Prefer worklist (DataGrid / role=grid / queue|worklist|records pattern /
 * data-shine-records); else first equal Card / className card section.
 * Handles string and {"…"} attr forms on siblings; dynamic .map bands stay untouched.
 * @param {string} source
 * @param {{ attr?: string, value?: string }} [op]
 */
export function setFocalTsx(source, op = {}) {
  const attr = op.attr || "data-region";
  const value = op.value || "focal";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const { worklists, cards, hasFocal, dynamic } = collectFocalCandidates(sf, attr, value);
  if (hasFocal) return text;
  if (dynamic && !worklists.length && !cards.length) return text;

  const primary = worklists[0] || cards[0] || null;
  if (!primary) return text;

  const opening = ts.isJsxElement(primary) ? primary.openingElement : primary;
  if (findJsxAttr(opening, attr, sf)) {
    const existing = attrStringValue(findJsxAttr(opening, attr, sf), sf);
    if (existing === value) return text;
    // Rewrite existing attr value (string or {"…"}).
    const a = findJsxAttr(opening, attr, sf);
    if (!a?.initializer) return text;
    if (ts.isStringLiteral(a.initializer)) {
      return (
        text.slice(0, a.initializer.getStart(sf)) +
        `"${value}"` +
        text.slice(a.initializer.getEnd())
      );
    }
    if (ts.isJsxExpression(a.initializer) && a.initializer.expression) {
      const expr = a.initializer.expression;
      if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
        const quote = text[expr.getStart(sf)] === "'" ? "'" : '"';
        return text.slice(0, expr.getStart(sf)) + `${quote}${value}${quote}` + text.slice(expr.getEnd());
      }
    }
    return text;
  }

  const openSrc = text.slice(opening.getStart(sf), opening.getEnd());
  const nextOpen = ensureJsxOpenAttrs(openSrc, { [attr]: value });
  if (nextOpen === openSrc) return text;
  return text.slice(0, opening.getStart(sf)) + nextOpen + text.slice(opening.getEnd());
}

/**
 * @param {ts.SourceFile} sf
 * @param {string} [attr]
 * @param {string} [value]
 */
function collectFocalCandidates(sf, attr = "data-region", value = "focal") {
  /** @type {Array<ts.JsxElement | ts.JsxSelfClosingElement>} */
  const worklists = [];
  /** @type {Array<ts.JsxElement | ts.JsxSelfClosingElement>} */
  const cards = [];
  let hasFocal = false;
  let dynamic = false;

  const walk = (node) => {
    if (ts.isJsxExpression(node) && node.expression) {
      const t = node.expression.getText();
      if (/\.map\s*\(|\.\.\./.test(t)) dynamic = true;
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const region = findJsxAttr(opening, attr, sf);
      const regionVal = attrStringValue(region, sf);
      if (regionVal === value) hasFocal = true;

      if (isWorklistFocalOpening(opening, sf)) {
        worklists.push(node);
      } else if (isEqualCardFocalOpening(opening, sf)) {
        cards.push(node);
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { worklists, cards, hasFocal, dynamic };
}

/**
 * Primary work object: DataGrid, role=grid / {"grid"}, data-shine-records,
 * data-product-pattern queue|worklist|records, className grid-wrap.
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isWorklistFocalOpening(opening, sf) {
  const tag = jsxTagName(opening);
  if (tag === "DataGrid") return true;
  if (findJsxAttr(opening, "data-shine-records", sf)) return true;
  const role = attrStringValue(findJsxAttr(opening, "role", sf), sf);
  if (role === "grid") return true;
  const pattern = attrStringValue(findJsxAttr(opening, "data-product-pattern", sf), sf);
  if (pattern && /queue|worklist|records|triage|inbox/i.test(pattern)) return true;
  if (classNameHasWord(opening, "grid-wrap", sf)) return true;
  return false;
}

/**
 * Equal Card / className card panel (Usul composition soup).
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isEqualCardFocalOpening(opening, sf) {
  const tag = jsxTagName(opening);
  if (tag === "Card") return true;
  if (classNameHasWord(opening, "card", sf)) return true;
  return false;
}

/**
 * Composition census: whether KPI chrome appears before the records/worklist
 * among main's direct children (same AST rules as worklistFirstTsx).
 * @param {string} source
 * @returns {{ kpiBeforeWorklist: boolean, worklistCount: number, kpiCount: number, dynamic: boolean, alreadyOrdered: boolean }}
 */
export function compositionOrderTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const host = findCompositionHost(sf);
  if (!host) {
    return { kpiBeforeWorklist: false, worklistCount: 0, kpiCount: 0, dynamic: false, alreadyOrdered: true };
  }
  const { worklists, kpis, dynamic } = collectCompositionSiblings(host, sf);
  if (!worklists.length || !kpis.length) {
    return {
      kpiBeforeWorklist: false,
      worklistCount: worklists.length,
      kpiCount: kpis.length,
      dynamic,
      alreadyOrdered: true,
    };
  }
  const firstWork = Math.min(...worklists.map((n) => n.getStart(sf)));
  const firstKpi = Math.min(...kpis.map((n) => n.getStart(sf)));
  const kpiBeforeWorklist = firstKpi < firstWork;
  return {
    kpiBeforeWorklist,
    worklistCount: worklists.length,
    kpiCount: kpis.length,
    dynamic,
    alreadyOrdered: !kpiBeforeWorklist,
  };
}

/**
 * Worklist-first composition via TypeScript AST: move records/worklist ahead of
 * KPI chrome among main's direct children, then stamp data-region=focal.
 * Handles:
 * - KPI: className="metrics" / {"metrics"}, data-sled-kpis, aria-label ~ key figures
 * - Worklist: className="grid-wrap" / {"grid-wrap"}, DataGrid, role="grid" / {"grid"},
 *   data-product-pattern queue/worklist/records, data-shine-records
 * Dynamic .map / spread sibling bands stay untouched (caller emits plan note).
 */
export function worklistFirstTsx(source, op = {}) {
  const attr = op.attr || "data-region";
  const value = op.value || "focal";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const host = findCompositionHost(sf);
  if (!host || !ts.isJsxElement(host)) return text;

  const { worklists, kpis, dynamic } = collectCompositionSiblings(host, sf);
  if (dynamic || !worklists.length) return text;

  const primary = pickPrimaryWorklist(worklists, sf);
  if (!primary) return text;

  let out = text;
  const needsReorder =
    kpis.length > 0 && Math.min(...kpis.map((n) => n.getStart(sf))) < primary.getStart(sf);

  if (needsReorder) {
    // Rebuild host children: non-KPI/non-worklist lead-ins, then worklists, then KPIs, then trail.
    const children = [...host.children];
    /** @type {ts.Node[]} */
    const lead = [];
    /** @type {ts.Node[]} */
    const workBand = [];
    /** @type {ts.Node[]} */
    const kpiBand = [];
    /** @type {ts.Node[]} */
    const trail = [];
    let seenWorkOrKpi = false;
    for (const c of children) {
      if (ts.isJsxText(c) && !c.text.trim()) {
        // whitespace — attach with whichever band follows; skip for rebuild
        continue;
      }
      const isWork = worklists.includes(c);
      const isKpi = kpis.includes(c);
      if (isWork) {
        seenWorkOrKpi = true;
        workBand.push(c);
      } else if (isKpi) {
        seenWorkOrKpi = true;
        kpiBand.push(c);
      } else if (!seenWorkOrKpi) {
        lead.push(c);
      } else {
        trail.push(c);
      }
    }
    const indent = indentBefore(text, host.openingElement.getEnd()) || "      ";
    const childIndent = indent.endsWith("  ") ? indent : `${indent}  `;
    const render = (nodes) =>
      nodes
        .map((n) => text.slice(n.getStart(sf), n.getEnd()))
        .join(`\n${childIndent}`);
    const parts = [];
    if (lead.length) parts.push(render(lead));
    if (workBand.length) parts.push(render(workBand));
    if (kpiBand.length) parts.push(render(kpiBand));
    if (trail.length) parts.push(render(trail));
    const openEnd = host.openingElement.getEnd();
    const closeStart = host.closingElement.getStart(sf);
    const closeSrc = text.slice(closeStart, host.closingElement.getEnd());
    const openSrc = text.slice(host.getStart(sf), openEnd);
    const inner = parts.length ? `\n${childIndent}${parts.join(`\n${childIndent}`)}\n${indent}` : "\n";
    out = text.slice(0, host.getStart(sf)) + `${openSrc}${inner}${closeSrc}` + text.slice(host.getEnd());
  }

  // Re-parse after reorder so focal stamp targets the moved primary.
  const sf2 = ts.createSourceFile("surface.tsx", out, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const host2 = findCompositionHost(sf2);
  if (!host2 || !ts.isJsxElement(host2)) return out;
  const { worklists: wl2 } = collectCompositionSiblings(host2, sf2);
  const primary2 = pickPrimaryWorklist(wl2, sf2);
  if (!primary2) return out;
  if (findJsxAttr(primary2.openingElement, attr, sf2)) {
    const existing = attrStringValue(findJsxAttr(primary2.openingElement, attr, sf2), sf2);
    if (existing === value) return out;
  }
  const openSrc = out.slice(primary2.openingElement.getStart(sf2), primary2.openingElement.getEnd());
  const nextOpen = ensureJsxOpenAttrs(openSrc, { [attr]: value });
  if (nextOpen === openSrc) return out;
  return (
    out.slice(0, primary2.openingElement.getStart(sf2)) +
    nextOpen +
    out.slice(primary2.openingElement.getEnd())
  );
}

/**
 * Prefer data-shine-main / main host; else outermost return JSX element.
 * @param {ts.SourceFile} sf
 * @returns {ts.JsxElement | null}
 */
function findCompositionHost(sf) {
  /** @type {ts.JsxElement | null} */
  let main = null;
  /** @type {ts.JsxElement | null} */
  let fallback = null;
  const walk = (node) => {
    if (main) return;
    if (ts.isJsxElement(node)) {
      const opening = node.openingElement;
      const tag = jsxTagName(opening);
      if (findJsxAttr(opening, "data-shine-main", sf) || tag === "main") {
        main = node;
        return;
      }
      if (!fallback) fallback = node;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return main || fallback;
}

/**
 * Direct children of host that are KPI chrome vs records/worklist wraps.
 * @param {ts.JsxElement} host
 * @param {ts.SourceFile} sf
 */
function collectCompositionSiblings(host, sf) {
  /** @type {ts.JsxElement[]} */
  const worklists = [];
  /** @type {ts.JsxElement[]} */
  const kpis = [];
  let dynamic = false;
  for (const c of host.children) {
    if (ts.isJsxText(c)) continue;
    if (ts.isJsxExpression(c) && c.expression) {
      const t = c.expression.getText();
      if (/\.map\s*\(|\.\.\./.test(t)) dynamic = true;
      continue;
    }
    if (!ts.isJsxElement(c) && !ts.isJsxSelfClosingElement(c)) continue;
    if (ts.isJsxSelfClosingElement(c)) {
      if (isWorklistOpening(c, sf) || jsxTagName(c) === "DataGrid") {
        // Promote self-closing DataGrid to "worklist" via a synthetic wrapper check —
        // treat as worklist by wrapping identity; we only reorder JsxElements.
        // Self-closing worklists still count for census via a fake push skip —
        // stamp path needs JsxElement; skip reorder for bare self-closing.
      }
      continue;
    }
    const opening = c.openingElement;
    if (isKpiChromeElement(c, sf)) kpis.push(c);
    else if (isWorklistElement(c, sf)) worklists.push(c);
    else if (jsxTagName(opening) === "DataGrid") worklists.push(c);
  }
  return { worklists, kpis, dynamic };
}

/** @param {ts.JsxElement[]} worklists @param {ts.SourceFile} sf */
function pickPrimaryWorklist(worklists, sf) {
  if (!worklists.length) return null;
  const scored = worklists.map((w) => {
    let score = 0;
    const opening = w.openingElement;
    const pattern = attrStringValue(findJsxAttr(opening, "data-product-pattern", sf), sf) || "";
    if (/queue|worklist|inbox|triage|records/i.test(pattern)) score += 3;
    if (findJsxAttr(opening, "data-shine-records", sf)) score += 3;
    if (classNameHasWord(opening, "grid-wrap", sf) || classNameHasWord(opening, "worklist", sf)) score += 2;
    if (findJsxAttr(opening, "data-region", sf)) score += 1;
    const title = titleFromGridWrap(w, sf);
    if (/queue|records|worklist|inbox/i.test(title)) score += 2;
    return { w, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].w;
}

/**
 * KPI chrome band: metrics container, data-sled-kpis section, or hosts a metrics band.
 * @param {ts.JsxElement} node
 * @param {ts.SourceFile} sf
 */
function isKpiChromeElement(node, sf) {
  const opening = node.openingElement;
  if (isMetricsContainerOpening(opening, sf)) return true;
  if (findJsxAttr(opening, "data-sled-kpis", sf)) return true;
  // Section/div that immediately hosts a metrics container (Usul / dashboard chrome).
  for (const c of node.children) {
    if (ts.isJsxElement(c) && isMetricsContainerOpening(c.openingElement, sf)) return true;
  }
  return false;
}

/**
 * Records/worklist wrap among composition siblings.
 * @param {ts.JsxElement} node
 * @param {ts.SourceFile} sf
 */
function isWorklistElement(node, sf) {
  return isWorklistOpening(node.openingElement, sf) || hostsSingleGridWorklist(node, sf) || isPeerGridWrap(node, sf);
}

/**
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isWorklistOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-records", sf)) return true;
  if (findJsxAttr(opening, "data-shine-worklist", sf)) return true;
  if (classNameHasWord(opening, "grid-wrap", sf)) return true;
  if (classNameHasWord(opening, "worklist", sf)) return true;
  const pattern = attrStringValue(findJsxAttr(opening, "data-product-pattern", sf), sf);
  if (pattern && /queue|worklist|inbox|triage|records/i.test(pattern)) return true;
  const tag = jsxTagName(opening);
  if (tag === "DataGrid") return true;
  const role = attrStringValue(findJsxAttr(opening, "role", sf), sf);
  if (role === "grid" && (tag === "table" || tag === "div" || tag === "section")) return true;
  return false;
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

  // Apply demotions first, then promote if XOR/peer-fold left zero filled primaries.
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  }
  if (kept >= maxFilled) return out;

  const sf2 = ts.createSourceFile("surface.tsx", out, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const promote = [];
  visitButtons(sf2, (opening, node) => {
    if (kept >= maxFilled) return;
    if (isFilledButtonOpening(opening, sf2)) return;
    const label = labelFromJsx(node, sf2);
    if (!prefer.some((p) => label.includes(p))) return;
    const variantAttr = findJsxAttr(opening, "variant", sf2);
    if (variantAttr) {
      promote.push({
        start: variantAttr.getStart(sf2),
        end: variantAttr.getEnd(),
        replacement: `variant="default"`,
      });
    } else {
      const insertAt = opening.tagName.getEnd();
      promote.push({
        start: insertAt,
        end: insertAt,
        replacement: ` variant="default"`,
      });
    }
    kept += 1;
  });
  promote.sort((a, b) => b.start - a.start);
  for (const e of promote) {
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
 * Count peer worklist/grid wraps in TSX (same AST rules as collapsePeerGridsTsx).
 * @param {string} source
 * @returns {{ grids: number, titles: string[], dynamic: boolean, alreadyXor: boolean }}
 */
export function countPeerGridsTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const wraps = collectPeerGridWraps(sf);
  const titles = wraps.map((w) => titleFromGridWrap(w, sf));
  let dynamic = false;
  let alreadyXor = false;
  for (const w of wraps) {
    if (wrapHasDynamicChildren(w)) dynamic = true;
    if (wrapHasXorViews(w, sf)) alreadyXor = true;
  }
  return { grids: wraps.length, titles, dynamic, alreadyXor };
}

/**
 * Dual-focal ban via TypeScript AST: fold peer worklist into XOR filter chip
 * on the kept shared DataGrid (mode xor-saved-view).
 * Handles:
 * - className="grid-wrap" / className={"grid-wrap"}
 * - role="grid" / role={"grid"} / <DataGrid>
 * - data-grid-title="…" / data-grid-title={"…"}
 * Never silent-deletes without injecting data-shine-xor-views chips.
 * Dynamic .map / spread peer bands stay untouched (caller emits plan note).
 */
export function collapsePeerGridsTsx(source, op = {}) {
  const keepNeedles = (op.keepTitleIncludes || ["Queue"]).map(String);
  const foldNeedles = (op.foldTitleIncludes || ["David"]).map(String);
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const wraps = collectPeerGridWraps(sf);
  if (wraps.length < 2) return text;
  if (wraps.some((w) => wrapHasDynamicChildren(w))) return text;
  // Already XOR-collapsed to one shared grid — nothing to do.
  if (wraps.length === 1 && wraps.some((w) => wrapHasXorViews(w, sf))) return text;

  let keepIdx = wraps.findIndex((w) => titleMatchesNeedles(titleFromGridWrap(w, sf), keepNeedles));
  let foldIdx = wraps.findIndex((w) => titleMatchesNeedles(titleFromGridWrap(w, sf), foldNeedles));
  if (keepIdx < 0) keepIdx = wraps.length - 1;
  if (foldIdx < 0) foldIdx = keepIdx === 0 ? 1 : 0;
  if (keepIdx === foldIdx) foldIdx = keepIdx === 0 ? 1 : 0;

  const keep = wraps[keepIdx];
  const fold = wraps[foldIdx];
  const keepTitle = titleFromGridWrap(keep, sf) || keepNeedles[0] || "Queue";
  const foldTitle = titleFromGridWrap(fold, sf) || foldNeedles[0] || "Peer view";

  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];

  // 1) Remove fold wrap entirely (peer → chip; not a second grid).
  edits.push({ start: fold.getStart(sf), end: fold.getEnd(), replacement: "" });

  // 2) Patch keep wrap: focal + shared-grid attrs + XOR chip strip.
  if (!wrapHasXorViews(keep, sf)) {
    const keepOpen = keep.openingElement;
    let openSrc = text.slice(keepOpen.getStart(sf), keepOpen.getEnd());
    openSrc = ensureJsxOpenAttrs(openSrc, {
      "data-region": "focal",
      "data-shine-shared-grid": true,
    });

    const keepInnerStart = keepOpen.getEnd();
    const keepCloseStart = keep.closingElement.getStart(sf);
    const inner = text.slice(keepInnerStart, keepCloseStart);
    const indent = indentBefore(text, keep.getStart(sf)) + "  ";
    const chipStrip = [
      `<div className="scope" data-shine-xor-views role="group" aria-label="Worklist views">`,
      `  <button type="button" aria-pressed={true}>`,
      `    ${escapeJsxText(keepTitle)}`,
      `  </button>`,
      `  <button type="button" aria-pressed={false} data-shine-xor-from-peer="${escapeAttr(foldTitle)}">`,
      `    ${escapeJsxText(foldTitle)}`,
      `  </button>`,
      `</div>`,
    ]
      .map((line, i) => (i === 0 ? `${indent}${line}` : `${indent}${line}`))
      .join("\n");

    let nextInner = inner;
    if (/data-shine-xor-views/.test(nextInner)) {
      /* already */
    } else if (/<h[1-3]\b/i.test(nextInner)) {
      nextInner = nextInner.replace(/(<\/h[1-3]>)/i, `$1\n${chipStrip}`);
    } else {
      nextInner = `\n${chipStrip}${nextInner}`;
    }

    const keepCloseSrc = text.slice(keepCloseStart, keep.closingElement.getEnd());
    edits.push({
      start: keep.getStart(sf),
      end: keep.getEnd(),
      replacement: `${openSrc}${nextInner}${keepCloseSrc}`,
    });
  }

  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) {
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  }
  // Collapse leftover blank lines from fold removal.
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

/**
 * @param {ts.SourceFile} sf
 * @returns {ts.JsxElement[]}
 */
function collectPeerGridWraps(sf) {
  /** @type {ts.JsxElement[]} */
  const wraps = [];
  const walk = (node, insideWrap) => {
    if (ts.isJsxElement(node)) {
      const isWrap = isPeerGridWrap(node, sf);
      if (isWrap && !insideWrap) {
        wraps.push(node);
        return;
      }
      for (const c of node.children) walk(c, insideWrap || isWrap);
      return;
    }
    if (ts.isJsxFragment(node)) {
      for (const c of node.children) walk(c, insideWrap);
      return;
    }
    ts.forEachChild(node, (c) => walk(c, insideWrap));
  };
  walk(sf, false);
  return wraps;
}

/**
 * Peer worklist wrap: className grid-wrap, queue product-pattern host of one
 * DataGrid/role=grid, or a bare DataGrid / role=grid worklist element.
 * Prefer the outer host so fold removes the whole peer panel (not an empty shell).
 * @param {ts.JsxElement} node
 * @param {ts.SourceFile} sf
 */
function isPeerGridWrap(node, sf) {
  const opening = node.openingElement;
  if (classNameHasWord(opening, "grid-wrap", sf)) return true;
  if (findJsxAttr(opening, "data-shine-shared-grid", sf)) return true;
  if (hostsSingleGridWorklist(node, sf)) return true;
  // Bare DataGrid / role=grid when not already hosted by a wrap parent.
  const tag = jsxTagName(opening);
  if (tag === "DataGrid") return true;
  const role = attrStringValue(findJsxAttr(opening, "role", sf), sf);
  if (role === "grid" && (tag === "table" || tag === "div" || tag === "section")) return true;
  return false;
}

/**
 * Queue/worklist host with exactly one DataGrid or role=grid child (Buttons live inside the grid).
 * @param {ts.JsxElement} node
 * @param {ts.SourceFile} sf
 */
function hostsSingleGridWorklist(node, sf) {
  const opening = node.openingElement;
  const pattern = attrStringValue(findJsxAttr(opening, "data-product-pattern", sf), sf);
  const queueish =
    (pattern && /queue|worklist|inbox|triage/i.test(pattern)) ||
    classNameHasWord(opening, "worklist", sf);
  if (!queueish) return false;
  let gridChildren = 0;
  for (const c of node.children) {
    if (ts.isJsxText(c)) {
      if (c.text.trim()) return false;
      continue;
    }
    if (ts.isJsxExpression(c) && c.expression) return false;
    if (ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c)) {
      const op = ts.isJsxElement(c) ? c.openingElement : c;
      const tag = jsxTagName(op);
      const role = attrStringValue(findJsxAttr(op, "role", sf), sf);
      if (tag === "DataGrid" || role === "grid") gridChildren += 1;
      else return false;
    }
  }
  return gridChildren === 1;
}

/** @param {ts.JsxElement} wrap @param {ts.SourceFile} sf */
function titleFromGridWrap(wrap, sf) {
  const onWrap = attrStringValue(findJsxAttr(wrap.openingElement, "data-grid-title", sf), sf);
  if (onWrap) return onWrap.trim();
  let found = "";
  const walk = (node) => {
    if (found) return;
    if (ts.isJsxElement(node)) {
      const opening = node.openingElement;
      const titled = attrStringValue(findJsxAttr(opening, "data-grid-title", sf), sf);
      if (titled) {
        found = titled.trim();
        return;
      }
      const tag = jsxTagName(opening);
      if (/^h[1-3]$/i.test(tag)) {
        found = labelFromJsx(node, sf);
        return;
      }
      for (const c of node.children) walk(c);
    }
  };
  for (const c of wrap.children) walk(c);
  return found;
}

/** @param {ts.JsxElement} wrap @param {ts.SourceFile} sf */
function wrapHasXorViews(wrap, sf) {
  if (findJsxAttr(wrap.openingElement, "data-shine-xor-views", sf)) return true;
  let hit = false;
  const walk = (node) => {
    if (hit) return;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      if (findJsxAttr(opening, "data-shine-xor-views", sf)) {
        hit = true;
        return;
      }
      if (ts.isJsxElement(node)) for (const c of node.children) walk(c);
    }
  };
  for (const c of wrap.children) walk(c);
  return hit;
}

/** @param {ts.JsxElement} wrap */
function wrapHasDynamicChildren(wrap) {
  let unsafe = false;
  const walk = (node) => {
    if (unsafe) return;
    if (ts.isJsxExpression(node) && node.expression) {
      const t = node.expression.getText();
      if (/\.map\s*\(|\.\.\./.test(t)) unsafe = true;
      return;
    }
    if (ts.isJsxElement(node)) {
      for (const c of node.children) walk(c);
    }
  };
  for (const c of wrap.children) walk(c);
  return unsafe;
}

/** @param {string} title @param {string[]} needles */
function titleMatchesNeedles(title, needles) {
  const t = String(title || "").toLowerCase();
  return needles.some((n) => t.includes(String(n).toLowerCase()));
}

/**
 * Ensure static attrs on an opening tag source string.
 * Boolean attrs (value === true) emit bare name; strings emit name="value".
 * @param {string} openSrc
 * @param {Record<string, string|boolean>} attrs
 */
function ensureJsxOpenAttrs(openSrc, attrs) {
  let out = openSrc;
  for (const [name, value] of Object.entries(attrs)) {
    if (new RegExp(`\\b${escapeRe(name)}(\\s|=|/|>)`).test(out)) continue;
    const insertion =
      value === true ? ` ${name}` : ` ${name}="${String(value).replace(/"/g, "&quot;")}"`;
    out = out.replace(/\s*\/?>$/, (m) => `${insertion}${m}`);
  }
  return out;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeJsxText(s) {
  return String(s).replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
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

/**
 * True when className (string / {"…"}) contains a whole-word token.
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {string} token
 * @param {ts.SourceFile} sf
 */
function classNameHasToken(opening, token, sf) {
  const attr = findJsxAttr(opening, "className", sf);
  if (!attr?.initializer) return false;
  const re = new RegExp(`(?:^|\\s)${escapeRe(token)}(?:\\s|$)`);
  if (ts.isStringLiteral(attr.initializer)) return re.test(attr.initializer.text);
  if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
    const expr = attr.initializer.expression;
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      return re.test(expr.text);
    }
  }
  return false;
}

/**
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isFilterStackOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-filter-stack", sf)) return true;
  return classNameHasToken(opening, "filter-pills", sf) || classNameHasToken(opening, "pill-stack", sf);
}

/**
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isFilterPillOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-filter-pill", sf)) return true;
  if (findJsxAttr(opening, "data-shine-pill", sf)) return true;
  if (classNameHasToken(opening, "pill", sf)) return true;
  if (classNameHasToken(opening, "chip", sf)) return true;
  const tag = jsxTagName(opening);
  return tag === "Badge" && classNameHasToken(opening, "rounded-full", sf);
}

/**
 * @param {ts.JsxElement} container
 * @param {ts.SourceFile} sf
 */
function filterPillsInContainer(container, sf) {
  /** @type {ts.JsxElement[]} */
  const pills = [];
  let unsafe = false;
  let alreadyCollapsed = false;
  for (const child of container.children) {
    if (ts.isJsxExpression(child) && child.expression) {
      const t = child.expression.getText(sf);
      if (/\.map\s*\(|\.\.\./.test(t)) unsafe = true;
      continue;
    }
    if (!ts.isJsxElement(child)) continue;
    const open = child.openingElement;
    if (jsxTagName(open) === "details" && findJsxAttr(open, "data-shine-pill-rest", sf)) {
      alreadyCollapsed = true;
      continue;
    }
    if (isFilterPillOpening(open, sf)) pills.push(child);
  }
  return { pills, unsafe, alreadyCollapsed };
}

/**
 * Count literal filter pills in TSX (same AST rules as pillCollapseTsx).
 * @param {string} source
 * @returns {{ pills: number, labels: string[], containers: number, dynamic: boolean }}
 */
export function countFilterPillsTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const labels = [];
  let containers = 0;
  let dynamic = false;
  const walk = (node) => {
    if (ts.isJsxElement(node) && isFilterStackOpening(node.openingElement, sf)) {
      containers += 1;
      const { pills, unsafe } = filterPillsInContainer(node, sf);
      if (unsafe) dynamic = true;
      for (const p of pills) labels.push(labelFromJsx(p, sf));
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { pills: labels.length, labels, containers, dynamic };
}

/**
 * Collapse excess literal filter-pill JSX via TypeScript AST (maxVisible=3).
 * Parks the rest in `<details data-shine-pill-rest>`.
 */
export function pillCollapseTsx(source, op = {}) {
  const maxVisible = op.maxVisible ?? 3;
  const restSummary = op.summary || "More filters";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  const walk = (node) => {
    if (ts.isJsxElement(node) && isFilterStackOpening(node.openingElement, sf)) {
      const { pills, unsafe, alreadyCollapsed } = filterPillsInContainer(node, sf);
      if (unsafe || alreadyCollapsed) return;
      if (pills.length <= maxVisible) return;
      const visible = pills.slice(0, maxVisible);
      const rest = pills.slice(maxVisible);
      const rangeStart = visible[0].getStart(sf);
      const rangeEnd = rest[rest.length - 1].getEnd();
      const indent = indentBefore(text, rangeStart);
      const innerIndent = indent + "  ";
      const visibleSrc = visible.map((t) => text.slice(t.getStart(sf), t.getEnd())).join(`\n${indent}`);
      const restSrc = rest.map((t) => text.slice(t.getStart(sf), t.getEnd())).join(`\n${innerIndent}`);
      const replacement =
        `${visibleSrc}\n${indent}` +
        `<details data-shine-pill-rest>\n${innerIndent}<summary>${restSummary}</summary>\n${innerIndent}` +
        `${restSrc}\n${indent}</details>`;
      edits.push({ start: rangeStart, end: rangeEnd, replacement });
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

/**
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isPageTitleOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-title-demoted", sf)) return false;
  const tag = jsxTagName(opening);
  if (tag === "h1") return true;
  if (findJsxAttr(opening, "data-page-title", sf)) return true;
  if (findJsxAttr(opening, "data-shine-page-title", sf)) return true;
  return classNameHasToken(opening, "page-title", sf);
}

/**
 * Count competing page titles in TSX.
 * @param {string} source
 * @returns {{ titles: number, texts: string[], dynamic: boolean }}
 */
export function countPageTitlesTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const texts = [];
  let dynamic = false;
  const walk = (node) => {
    if (ts.isJsxElement(node) && isPageTitleOpening(node.openingElement, sf)) {
      // Skip titles nested inside another title node
      texts.push(labelFromJsx(node, sf) || "(title)");
      return;
    }
    if (ts.isJsxExpression(node) && node.expression) {
      const t = node.expression.getText(sf);
      if (/\.map\s*\(|\.\.\./.test(t) && /title|h1/i.test(t)) dynamic = true;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { titles: texts.length, texts, dynamic };
}

/**
 * True when a JSX opening is a chrome host (header/nav/aside/sidebar markers).
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isChromeHostOpening(opening, sf) {
  const tag = jsxTagName(opening);
  if (["header", "nav", "aside", "Header", "Nav", "Aside", "Sidebar"].includes(tag)) return true;
  if (findJsxAttr(opening, "data-shine-chrome", sf)) return true;
  if (findJsxAttr(opening, "data-region", sf)) {
    const v = attrStringValue(findJsxAttr(opening, "data-region", sf), sf);
    if (v === "chrome") return true;
  }
  if (findJsxAttr(opening, "data-slot", sf)) {
    const v = attrStringValue(findJsxAttr(opening, "data-slot", sf), sf);
    if (v === "sidebar") return true;
  }
  if (findJsxAttr(opening, "role", sf)) {
    const v = attrStringValue(findJsxAttr(opening, "role", sf), sf);
    if (v === "banner" || v === "navigation") return true;
  }
  return false;
}

/**
 * Walk ancestors: is this node inside a chrome host?
 * @param {ts.Node} node
 * @param {ts.SourceFile} sf
 */
function isInsideChromeHost(node, sf) {
  let cur = node.parent;
  while (cur) {
    if (ts.isJsxElement(cur) && isChromeHostOpening(cur.openingElement, sf)) return true;
    cur = cur.parent;
  }
  return false;
}

/**
 * Count filled Buttons inside chrome hosts.
 * @param {string} source
 * @returns {{ filled: number, labels: string[], dynamic: boolean }}
 */
export function countChromeFilledButtonsTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const labels = [];
  let dynamic = false;
  visitButtons(sf, (opening, node) => {
    if (!isInsideChromeHost(node, sf)) return;
    const variant = findJsxAttr(opening, "variant", sf);
    if (variant?.initializer && ts.isJsxExpression(variant.initializer) && variant.initializer.expression) {
      const expr = variant.initializer.expression;
      if (!ts.isStringLiteral(expr) && !ts.isNoSubstitutionTemplateLiteral(expr)) {
        dynamic = true;
        return;
      }
    }
    if (isFilledButtonOpening(opening, sf)) labels.push(labelFromJsx(node, sf));
  });
  return { filled: labels.length, labels, dynamic };
}

/**
 * Demote filled Button primaries inside chrome hosts to outline (or ghost).
 * Leaves main-region Buttons alone.
 */
export function chromeBudgetTsx(source, op = {}) {
  const demote = op.demotePolicy === "ghost" ? "outline" : op.demotePolicy || "outline";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  visitButtons(sf, (opening, node) => {
    if (!isInsideChromeHost(node, sf)) return;
    if (!isFilledButtonOpening(opening, sf)) return;
    const variant = findJsxAttr(opening, "variant", sf);
    if (variant?.initializer) {
      if (ts.isStringLiteral(variant.initializer)) {
        edits.push({
          start: variant.initializer.getStart(sf),
          end: variant.initializer.getEnd(),
          replacement: `"${demote}"`,
        });
      } else if (ts.isJsxExpression(variant.initializer) && variant.initializer.expression) {
        const expr = variant.initializer.expression;
        if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
          edits.push({
            start: expr.getStart(sf),
            end: expr.getEnd(),
            replacement: `"${demote}"`,
          });
        }
      }
    } else {
      // Missing variant → insert outline
      const openSrc = text.slice(opening.getStart(sf), opening.getEnd());
      const nextOpen = openSrc.replace(/\s*\/?>$/, (m) => ` variant="${demote}"${m}`);
      edits.push({ start: opening.getStart(sf), end: opening.getEnd(), replacement: nextOpen });
    }
    // Drop chrome-filled marker
    const filledAttr = findJsxAttr(opening, "data-shine-chrome-filled", sf);
    if (filledAttr) {
      edits.push({ start: filledAttr.getStart(sf), end: filledAttr.getEnd(), replacement: "" });
    }
  });
  if (!edits.length) return text;
  return applyChromeBudgetEditsClean(text, edits);
}

/**
 * @param {string} text
 * @param {{ start: number, end: number, replacement: string }[]} edits
 */
function applyChromeBudgetEditsClean(text, edits) {
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of sorted) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  // Clean doubled spaces from attr removal only on affected lines lightly
  out = out.replace(/[^\S\n]{2,}/g, " ");
  out = out.replace(/\s+>/g, ">");
  return out;
}




function isCardSoupStackOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-card-stack", sf)) return true;
  return classNameHasToken(opening, "cards", sf);
}

function isCardSoupOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-card", sf)) return true;
  if (findJsxAttr(opening, "data-slot", sf)) {
    const v = attrStringValue(findJsxAttr(opening, "data-slot", sf), sf);
    if (v === "card") return true;
  }
  const tag = jsxTagName(opening);
  if (tag === "Card") return true;
  return classNameHasToken(opening, "card", sf);
}

function cardsInStack(container, sf) {
  /** @type {ts.JsxElement[]} */
  const cards = [];
  let unsafe = false;
  let already = false;
  for (const child of container.children) {
    if (ts.isJsxExpression(child) && child.expression) {
      const t = child.expression.getText(sf);
      if (/\.map\s*\(|\.\.\./.test(t)) unsafe = true;
      continue;
    }
    if (!ts.isJsxElement(child)) continue;
    const open = child.openingElement;
    if (jsxTagName(open) === "details" && findJsxAttr(open, "data-shine-card-rest", sf)) {
      already = true;
      continue;
    }
    if (isCardSoupOpening(open, sf)) cards.push(child);
  }
  return { cards, unsafe, already };
}

/**
 * Count literal Card soup tiles in TSX stacks.
 */
export function countCardSoupTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let cards = 0;
  let dynamic = false;
  const walk = (node) => {
    if (ts.isJsxElement(node) && isCardSoupStackOpening(node.openingElement, sf)) {
      const c = cardsInStack(node, sf);
      if (c.unsafe) dynamic = true;
      cards += c.cards.length;
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { cards, dynamic };
}

/**
 * Collapse equal Card soup via AST: focal on first, peers in details.
 */
export function collapseCardSoupTsx(source, op = {}) {
  const maxVisible = op.maxVisible ?? 1;
  const restSummary = op.summary || "More tools";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  const walk = (node) => {
    if (ts.isJsxElement(node) && isCardSoupStackOpening(node.openingElement, sf)) {
      const { cards, unsafe, already } = cardsInStack(node, sf);
      if (unsafe || already) return;
      if (cards.length <= maxVisible) {
        // still stamp focal on first
        if (cards.length) {
          const primary = cards[0];
          const opening = primary.openingElement;
          if (!findJsxAttr(opening, "data-region", sf)) {
            const openSrc = text.slice(opening.getStart(sf), opening.getEnd());
            const nextOpen = openSrc.replace(/\s*\/?>$/, (m) => ` data-region="focal" data-shine-card-primary${m}`);
            edits.push({ start: opening.getStart(sf), end: opening.getEnd(), replacement: nextOpen });
          }
        }
        return;
      }
      const visible = cards.slice(0, maxVisible);
      const rest = cards.slice(maxVisible);
      // Stamp focal on first visible via rewriting its opening in the slice
      const primary = visible[0];
      let primarySrc = text.slice(primary.getStart(sf), primary.getEnd());
      if (!/data-region=["']focal["']/.test(primarySrc)) {
        primarySrc = primarySrc.replace(
          /^(<[A-Za-z][\w.]*)/,
          `$1 data-region="focal" data-shine-card-primary`,
        );
      }
      const restSrc = rest.map((c) => {
        let src = text.slice(c.getStart(sf), c.getEnd());
        if (!/data-shine-card-demoted/.test(src)) {
          src = src.replace(/^(<[A-Za-z][\w.]*)/, `$1 data-shine-card-demoted`);
        }
        return src;
      });
      const rangeStart = visible[0].getStart(sf);
      const rangeEnd = rest[rest.length - 1].getEnd();
      const indent = indentBefore(text, rangeStart);
      const innerIndent = indent + "  ";
      const visibleRest = visible.slice(1).map((c) => text.slice(c.getStart(sf), c.getEnd()));
      const visibleSrc = [primarySrc, ...visibleRest].join(`\n${indent}`);
      const replacement =
        `${visibleSrc}\n${indent}` +
        `<details data-shine-card-rest>\n${innerIndent}<summary>${restSummary}</summary>\n${innerIndent}` +
        `${restSrc.join(`\n${innerIndent}`)}\n${indent}</details>`;
      edits.push({ start: rangeStart, end: rangeEnd, replacement });
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

const FILLER_EMPTY_TSX_RES = [
  /^welcome to your dashboard\.?$/i,
  /^welcome to .+!$/,
  /^get started with your (new )?dashboard\.?$/i,
  /^this is where .+ will (appear|show|live)\.?$/i,
  /^no data to display\.?$/i,
  /^nothing here yet\.?$/i,
  /^coming soon\.?$/i,
  /^lorem ipsum\b/i,
  /^your (amazing )?content (goes|here)/i,
  /^start building something (amazing|great)\.?$/i,
  /^drop your content here\.?$/i,
  /^placeholder text\.?$/i,
  /^todo:\s*add .+/i,
  /^click here to get started\.?$/i,
];

function isFillerEmptyText(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t || t.length > 80) return false;
  return FILLER_EMPTY_TSX_RES.some((re) => re.test(t));
}

/**
 * Count filler empty phrases in TSX text / {"…"} children.
 */
export function countFillerEmptyTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hits = 0;
  const samples = [];
  const walk = (node) => {
    if (ts.isJsxText(node)) {
      const text = node.getText(sf).replace(/\s+/g, " ").trim();
      if (isFillerEmptyText(text)) {
        hits += 1;
        samples.push(text.slice(0, 40));
      }
    } else if (ts.isJsxExpression(node) && node.expression) {
      const expr = node.expression;
      if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
        if (isFillerEmptyText(expr.text)) {
          hits += 1;
          samples.push(expr.text.slice(0, 40));
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { hits, samples: samples.slice(0, 6), dynamic: false };
}

/**
 * Rewrite filler empty phrases to job-specific copy; stamp data-shine-empty-rewritten.
 */
export function rewriteFillerEmptyTsx(source, op = {}) {
  const replacement =
    op.copy ||
    op.replacement ||
    "No notices match this view. Clear filters or widen the date range.";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];

  const stampHost = (host) => {
    if (!host || !ts.isJsxElement(host)) return;
    const opening = host.openingElement;
    if (findJsxAttr(opening, "data-shine-empty-rewritten", sf)) return;
    const openSrc = text.slice(opening.getStart(sf), opening.getEnd());
    const nextOpen = openSrc.replace(/\s*\/?>$/, (m) => ` data-shine-empty-rewritten${m}`);
    edits.push({ start: opening.getStart(sf), end: opening.getEnd(), replacement: nextOpen });
  };

  const walk = (node) => {
    if (ts.isJsxText(node)) {
      const raw = node.getText(sf);
      const trimmed = raw.replace(/\s+/g, " ").trim();
      if (isFillerEmptyText(trimmed)) {
        edits.push({ start: node.getStart(sf), end: node.getEnd(), replacement: replacement });
        let cur = node.parent;
        while (cur && !ts.isJsxElement(cur)) cur = cur.parent;
        stampHost(cur);
      }
    } else if (ts.isJsxExpression(node) && node.expression) {
      const expr = node.expression;
      if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
        if (isFillerEmptyText(expr.text)) {
          edits.push({
            start: expr.getStart(sf),
            end: expr.getEnd(),
            replacement: `"${replacement.replace(/"/g, '\\"')}"`,
          });
          let cur = node.parent;
          while (cur && !ts.isJsxElement(cur)) cur = cur.parent;
          stampHost(cur);
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (!edits.length) return text;
  const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  const seen = new Set();
  let out = text;
  for (const e of sorted) {
    const key = `${e.start}:${e.end}:${e.replacement}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  }
  return out;
}

const MARKETING_TSX_TOKENS = Object.freeze([
  /^bg-gradient-to-[trbl]{1,2}$/i,
  /^from-(?:violet|purple|fuchsia|indigo)-\d{2,3}$/i,
  /^to-(?:violet|purple|fuchsia|indigo)-\d{2,3}$/i,
  /^drop-shadow-glow$/i,
  /^animate-pulse-glow$/i,
  /^shadow-\[0_0_.+\]$/i,
  /^font-(?:display|serif)$/i,
  /^tracking-tighter$/i,
]);

function isMarketingClassToken(tok) {
  return MARKETING_TSX_TOKENS.some((re) => re.test(tok));
}

function scrubMarketingClassText(cls) {
  const parts = String(cls || "").split(/\s+/).filter(Boolean);
  const kept = parts.filter((t) => !isMarketingClassToken(t));
  return { next: kept.join(" "), removed: parts.length - kept.length };
}

/**
 * Count marketing DNA className tokens in TSX.
 * @param {string} source
 */
export function countMarketingDnaTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hits = 0;
  let dynamic = false;
  const samples = [];
  const walk = (node) => {
    if (ts.isJsxAttribute(node) && (node.name.getText(sf) === "className" || node.name.getText(sf) === "class")) {
      const v = attrStringValue(node, sf);
      if (v == null) {
        if (node.initializer && ts.isJsxExpression(node.initializer)) dynamic = true;
      } else {
        for (const tok of v.split(/\s+/).filter(Boolean)) {
          if (isMarketingClassToken(tok)) {
            hits += 1;
            samples.push(tok);
          }
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { hits, samples: samples.slice(0, 8), dynamic };
}

/**
 * Strip marketing DNA tokens from className / class string attrs in TSX.
 */
export function stripMarketingDnaTsx(source, _op = {}) {
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  const walk = (node) => {
    if (ts.isJsxAttribute(node) && (node.name.getText(sf) === "className" || node.name.getText(sf) === "class")) {
      const init = node.initializer;
      if (!init) return;
      if (ts.isStringLiteral(init)) {
        const { next, removed } = scrubMarketingClassText(init.text);
        if (removed) {
          edits.push({ start: init.getStart(sf), end: init.getEnd(), replacement: `"${next}"` });
        }
      } else if (ts.isJsxExpression(init) && init.expression) {
        const expr = init.expression;
        if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
          const { next, removed } = scrubMarketingClassText(expr.text);
          if (removed) {
            edits.push({ start: expr.getStart(sf), end: expr.getEnd(), replacement: `"${next}"` });
          }
        }
      }
    }
    // data-shine-marketing-dna → stripped marker
    if (ts.isJsxAttribute(node) && node.name.getText(sf) === "data-shine-marketing-dna") {
      edits.push({
        start: node.getStart(sf),
        end: node.getEnd(),
        replacement: "data-shine-marketing-stripped",
      });
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (!edits.length) return text;
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of sorted) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

/**
 * Active filter chip opening?
 * @param {ts.JsxOpeningLikeElement} opening
 * @param {ts.SourceFile} sf
 */
function isActiveFilterOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-filter-active", sf)) return true;
  const pressed = findJsxAttr(opening, "aria-pressed", sf);
  if (pressed) {
    const v = attrStringValue(pressed, sf);
    if (v === "true") return true;
    if (pressed.initializer && ts.isJsxExpression(pressed.initializer)) {
      const expr = pressed.initializer.expression;
      if (expr && expr.kind === ts.SyntaxKind.TrueKeyword) return true;
    }
  }
  const active = findJsxAttr(opening, "data-filter-active", sf);
  if (active) {
    const v = attrStringValue(active, sf);
    if (v === "true" || v === "") return true;
  }
  return false;
}

/**
 * Node subtree already has dismiss marker / clear control.
 * @param {ts.Node} node
 * @param {ts.SourceFile} sf
 */
function hasFilterDismissInTree(node, sf) {
  let found = false;
  const walk = (n) => {
    if (found) return;
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const opening = ts.isJsxElement(n) ? n.openingElement : n;
      if (findJsxAttr(opening, "data-shine-filter-dismiss", sf)) {
        found = true;
        return;
      }
      const label = attrStringValue(findJsxAttr(opening, "aria-label", sf), sf) || "";
      if (/clear|remove|dismiss|reset/i.test(label)) {
        found = true;
        return;
      }
    }
    ts.forEachChild(n, walk);
  };
  walk(node);
  return found;
}

/**
 * Count active filter chips lacking dismiss / clear-all in TSX.
 * @param {string} source
 */
export function countIrreversibleFiltersTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let active = 0;
  let irreversible = 0;
  let hasClearAll = false;
  let dynamic = false;
  const samples = [];
  const walk = (node) => {
    if (ts.isJsxElement(node) && isFilterStackOpening(node.openingElement, sf)) {
      // clear-all in stack?
      const stackWalk = (n) => {
        if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
          const opening = ts.isJsxElement(n) ? n.openingElement : n;
          if (findJsxAttr(opening, "data-shine-filter-clear-all", sf)) hasClearAll = true;
          const label = attrStringValue(findJsxAttr(opening, "aria-label", sf), sf) || "";
          if (/^(clear all filters|clear filters|reset filters)$/i.test(label.trim())) hasClearAll = true;
        }
        ts.forEachChild(n, stackWalk);
      };
      stackWalk(node);
      const chipWalk = (n) => {
        if (ts.isJsxElement(n) && isActiveFilterOpening(n.openingElement, sf)) {
          active += 1;
          if (!hasFilterDismissInTree(n, sf)) {
            irreversible += 1;
            samples.push(labelFromJsx(n, sf).slice(0, 40) || "unnamed");
          }
        } else if (ts.isJsxSelfClosingElement(n) && isActiveFilterOpening(n, sf)) {
          active += 1;
          irreversible += 1;
          samples.push("self-closing");
        }
        // don't descend into nested stacks for chips — still fine
        ts.forEachChild(n, chipWalk);
      };
      for (const child of node.children) chipWalk(child);
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (hasClearAll) irreversible = 0;
  return { active, irreversible, samples, hasClearAll, dynamic };
}

/**
 * Stamp dismiss on active filter chips + append clear-all on filter stacks.
 */
export function filterClearableTsx(source, op = {}) {
  const perChip = op.perChip !== false;
  const clearAll = op.clearAll !== false;
  const clearLabel = op.clearAllLabel || "Clear filters";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];

  const walk = (node) => {
    if (ts.isJsxElement(node) && isFilterStackOpening(node.openingElement, sf)) {
      let stackHasClear = false;
      const scanClear = (n) => {
        if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
          const opening = ts.isJsxElement(n) ? n.openingElement : n;
          if (findJsxAttr(opening, "data-shine-filter-clear-all", sf)) stackHasClear = true;
          const label = attrStringValue(findJsxAttr(opening, "aria-label", sf), sf) || "";
          if (/^(clear all filters|clear filters|reset filters)$/i.test(label.trim())) stackHasClear = true;
        }
        ts.forEachChild(n, scanClear);
      };
      scanClear(node);

      if (perChip) {
        const chipWalk = (n) => {
          if (ts.isJsxElement(n) && isActiveFilterOpening(n.openingElement, sf)) {
            if (!hasFilterDismissInTree(n, sf)) {
              const close = n.closingElement;
              const indent = indentBefore(text, close.getStart(sf));
              const dismiss =
                `\n${indent}  <span data-shine-filter-dismiss aria-label="Clear filter">×</span>`;
              edits.push({
                start: close.getStart(sf),
                end: close.getStart(sf),
                replacement: dismiss + "\n" + indent,
              });
            }
          }
          ts.forEachChild(n, chipWalk);
        };
        for (const child of node.children) chipWalk(child);
      }

      if (clearAll && !stackHasClear) {
        const close = node.closingElement;
        const indent = indentBefore(text, close.getStart(sf));
        const btn =
          `\n${indent}  <button type="button" data-shine-filter-clear-all aria-label="Clear all filters">${clearLabel}</button>\n${indent}`;
        edits.push({ start: close.getStart(sf), end: close.getStart(sf), replacement: btn });
      }
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (!edits.length) return text;
  const sorted = [...edits].sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of sorted) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

/**
 * Count missing/empty page-title anchors in TSX (no named h1 / data-page-title).
 */
export function countMissingPageTitleTsx(source) {
  const census = countPageTitlesTsx(source);
  const named = (census.texts || []).filter((t) => t && t !== "(title)" && String(t).trim());
  // titles counted include empty h1 text as "(title)" via labelFromJsx fallback — treat as missing when no real text.
  const hasReal = (census.texts || []).some((t) => {
    const s = String(t || "").trim();
    return s && s !== "(title)";
  });
  return { hits: hasReal ? 0 : 1, titles: census.titles, named: named.length };
}

/**
 * Stamp a visible h1 page title when none exists (or fill an empty h1).
 */
export function stampPageTitleTsx(source, op = {}) {
  const titleText = String(op.title || op.label || op.pageTitle || op.job || "Operate")
    .split(/[:.·—–|]/)[0]
    .trim()
    .slice(0, 72) || "Operate";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {ts.JsxElement[]} */
  const titles = [];
  /** @type {ts.JsxElement | null} */
  let mainEl = null;
  const walk = (node) => {
    if (ts.isJsxElement(node)) {
      const opening = node.openingElement;
      if (isPageTitleOpening(opening, sf) || jsxTagName(opening) === "h1") {
        titles.push(node);
        return;
      }
      const tag = jsxTagName(opening);
      if (
        !mainEl &&
        (tag === "main" ||
          findJsxAttr(opening, "data-shine-main", sf) ||
          attrStringValue(findJsxAttr(opening, "role", sf), sf) === "main")
      ) {
        mainEl = node;
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  const named = titles.filter((n) => {
    const label = labelFromJsx(n, sf);
    return label && label.trim();
  });
  if (named.length) return text;

  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  const empty = titles.find((n) => !(labelFromJsx(n, sf) || "").trim());
  if (empty) {
    const opening = empty.openingElement;
    let openSrc = text.slice(opening.getStart(sf), opening.getEnd());
    if (!/data-shine-page-title-stamped/.test(openSrc)) {
      openSrc = openSrc.replace(/\s*>$/, " data-shine-page-title-stamped>");
    }
    if (!/data-page-title/.test(openSrc)) {
      openSrc = openSrc.replace(/\s*>$/, " data-page-title>");
    }
    edits.push({
      start: empty.getStart(sf),
      end: empty.getEnd(),
      replacement: `${openSrc}${escapeJsxText(titleText)}</h1>`,
    });
  } else if (mainEl) {
    const openEnd = mainEl.openingElement.getEnd();
    const indent = "\n      ";
    const h1 = `${indent}<h1 data-page-title data-shine-page-title-stamped>${escapeJsxText(titleText)}</h1>`;
    edits.push({ start: openEnd, end: openEnd, replacement: h1 });
  } else {
    return text;
  }

  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

/**
 * Keep first page title; demote peers to `<p className="kicker" data-shine-title-demoted>`.
 */
export function titleSingularTsx(source, _op = {}) {
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {ts.JsxElement[]} */
  const titles = [];
  const walk = (node) => {
    if (ts.isJsxElement(node) && isPageTitleOpening(node.openingElement, sf)) {
      titles.push(node);
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  if (titles.length < 2) return text;
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  for (const peer of titles.slice(1)) {
    const label = labelFromJsx(peer, sf) || "Untitled";
    const indent = indentBefore(text, peer.getStart(sf));
    const replacement = `<p className="kicker" data-shine-title-demoted>${escapeJsxText(label)}</p>`;
    edits.push({ start: peer.getStart(sf), end: peer.getEnd(), replacement: indent ? replacement : replacement });
  }
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

function isEmptyTriadOpening(opening, sf) {
  if (findJsxAttr(opening, "data-empty", sf)) return true;
  if (findJsxAttr(opening, "data-shine-empty", sf)) return true;
  if (findJsxAttr(opening, "data-empty-state", sf)) return true;
  const state = attrStringValue(findJsxAttr(opening, "data-state", sf), sf);
  return state === "empty";
}

function openingHasErrorMarker(opening, sf) {
  if (findJsxAttr(opening, "data-error", sf)) return true;
  const state = attrStringValue(findJsxAttr(opening, "data-state", sf), sf);
  if (state === "error") return true;
  const role = attrStringValue(findJsxAttr(opening, "role", sf), sf);
  return role === "alert";
}

function sourceHasActiveFilters(source) {
  return (
    /aria-pressed=\{?["']true["']\}?/.test(source) ||
    /data-filter-active=["']true["']/.test(source) ||
    /data-shine-filter-active/.test(source)
  );
}

/**
 * Count conflated empty/error nodes in TSX.
 */
export function countEmptyTriadTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hits = 0;
  const walk = (node) => {
    if (ts.isJsxElement(node) && isEmptyTriadOpening(node.openingElement, sf)) {
      if (openingHasErrorMarker(node.openingElement, sf)) hits += 1;
      else if (!findJsxAttr(node.openingElement, "data-filtered-empty", sf) && sourceHasActiveFilters(source)) {
        hits += 1;
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { hits };
}

/**
 * Split empty≡error / missing filtered-empty via AST.
 */
export function splitEmptyTriadTsx(source, op = {}) {
  const filteredCopy =
    op.filteredCopy ||
    op.copy ||
    "No notices match these filters. Clear filters or widen the date range.";
  const errorCopy = op.errorCopy || "Couldn't load notices. Retry.";
  const clearLabel = op.clearAllLabel || "Clear filters";
  const text = String(source);
  const hasFilters = sourceHasActiveFilters(text);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  let needErrorSibling = false;
  let lastEmptyEnd = -1;

  const walk = (node) => {
    if (ts.isJsxElement(node) && isEmptyTriadOpening(node.openingElement, sf)) {
      if (findJsxAttr(node.openingElement, "data-shine-triad-split", sf)) return;
      const opening = node.openingElement;
      const conflated = openingHasErrorMarker(opening, sf);
      const missingFiltered = hasFilters && !findJsxAttr(opening, "data-filtered-empty", sf);
      if (!conflated && !missingFiltered) return;

      let openSrc = text.slice(opening.getStart(sf), opening.getEnd());
      openSrc = openSrc
        .replace(/\s*role=\{?["']alert["']\}?/g, "")
        .replace(/\s*data-error(?:=\{?["'][^"']*["']\}?)?/g, "")
        .replace(/\s*data-state=\{?["']error["']\}?/g, "");
      if (hasFilters && !/data-filtered-empty/.test(openSrc)) {
        openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-filtered-empty${m}`);
      }
      if (!/data-shine-triad-split/.test(openSrc)) {
        openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-shine-triad-split${m}`);
      }

      const close = node.closingElement;
      const innerStart = opening.getEnd();
      const innerEnd = close.getStart(sf);
      let inner = text.slice(innerStart, innerEnd);
      const plain = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      const generic = !plain || /^(no data|nothing here|no results|empty)$/i.test(plain);
      if (generic && hasFilters) {
        const indent = indentBefore(text, node.getStart(sf)) + "  ";
        inner =
          `\n${indent}${filteredCopy}\n${indent}` +
          `<button type="button" data-shine-filter-clear-all aria-label="${clearLabel}">${clearLabel}</button>\n${indent.slice(0, -2)}`;
      }

      let replacement = openSrc + inner + text.slice(close.getStart(sf), close.getEnd());
      if (conflated) {
        const indent = indentBefore(text, node.getStart(sf));
        replacement +=
          `\n${indent}<div data-error role="alert" data-shine-triad-split hidden>${errorCopy}</div>`;
        needErrorSibling = true;
        lastEmptyEnd = node.getEnd();
      }
      edits.push({ start: node.getStart(sf), end: node.getEnd(), replacement });
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);

  // Deduplicate error siblings if multiple empties were conflated.
  if (needErrorSibling) {
    const errRe = /<div data-error role="alert" data-shine-triad-split hidden>[^<]*<\/div>\n?/g;
    const matches = out.match(errRe) || [];
    if (matches.length > 1) {
      let seen = 0;
      out = out.replace(errRe, (m) => {
        seen += 1;
        return seen === 1 ? m : "";
      });
    }
  }
  void lastEmptyEnd;

  if (hasFilters && !/data-shine-filter-clear-all/.test(out)) {
    out = out.replace(
      /(data-shine-filter-stack[^>]*>)/,
      `$1\n        <button type="button" data-shine-filter-clear-all aria-label="${clearLabel}">${clearLabel}</button>`,
    );
  }

  return out;
}

function isChartJsxOpening(opening, sf) {
  const tag = jsxTagName(opening);
  if (tag === "svg" || tag === "canvas" || tag === "Chart" || /Chart$/.test(tag)) {
    if (findJsxAttr(opening, "data-chart", sf) || findJsxAttr(opening, "data-shine-chart", sf)) return true;
    if (classNameHasToken(opening, "chart", sf)) return true;
    const label = attrStringValue(findJsxAttr(opening, "aria-label", sf), sf) || "";
    if (/chart/i.test(label)) return true;
    if (tag === "svg" || tag === "canvas") return true;
  }
  return false;
}

function chartOpeningHasUnits(opening, sf) {
  if (findJsxAttr(opening, "data-shine-chart-stamped", sf)) return true;
  if (findJsxAttr(opening, "data-unit", sf) || findJsxAttr(opening, "data-units", sf)) return true;
  const label = attrStringValue(findJsxAttr(opening, "aria-label", sf), sf) || "";
  return /\b(unit|units|count|%|percent|usd|\$|baseline|vs prior)\b/i.test(label);
}

/**
 * Count decorative charts lacking units in TSX.
 */
export function countDecorativeChartTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hits = 0;
  const walk = (node) => {
    if ((ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node))) {
      const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
      if (isChartJsxOpening(opening, sf) && !chartOpeningHasUnits(opening, sf)) hits += 1;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { hits };
}

/**
 * Count aria-invalid fields lacking linked error messages in TSX.
 */
export function countFormHeuristicTsx(source) {
  const src = String(source);
  const sf = ts.createSourceFile("surface.tsx", src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hits = 0;
  const walk = (node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxElement(node)) {
      const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
      const tag = jsxTagName(opening);
      if (tag === "input" || tag === "Input" || tag === "select" || tag === "textarea" || tag === "Textarea") {
        const invalid = attrStringValue(findJsxAttr(opening, "aria-invalid", sf), sf);
        if (invalid === "true") {
          const described = attrStringValue(findJsxAttr(opening, "aria-describedby", sf), sf) || "";
          const linked =
            described &&
            (new RegExp(`id=["']${described.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(src) ||
              new RegExp(`id=\\{["']${described.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\}`).test(src));
          if (!linked) hits += 1;
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { hits };
}

/**
 * Stamp aria-describedby + role=alert error siblings on aria-invalid fields via AST.
 */
export function linkFieldErrorsTsx(source, op = {}) {
  const defaultMessage = op.message || op.errorMessage || "Enter a valid value.";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  let seq = 0;

  const walk = (node) => {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxElement(node)) {
      const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
      const tag = jsxTagName(opening);
      if (tag === "input" || tag === "Input" || tag === "select" || tag === "textarea" || tag === "Textarea") {
        const invalid = attrStringValue(findJsxAttr(opening, "aria-invalid", sf), sf);
        if (invalid !== "true") {
          ts.forEachChild(node, walk);
          return;
        }
        const described = attrStringValue(findJsxAttr(opening, "aria-describedby", sf), sf) || "";
        const fieldId =
          attrStringValue(findJsxAttr(opening, "id", sf), sf) || `shine-field-${++seq}`;
        const errId = described || `${fieldId}-error`;
        const hasErrorNode =
          new RegExp(`id=["']${errId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(text) ||
          new RegExp(`id=\\{["']${errId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']\\}`).test(text);
        if (described && hasErrorNode) {
          ts.forEachChild(node, walk);
          return;
        }

        let openSrc = text.slice(opening.getStart(sf), opening.getEnd());
        if (!/\bid=/.test(openSrc)) {
          openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` id="${fieldId}"${m}`);
        }
        if (/\baria-describedby=/.test(openSrc)) {
          openSrc = openSrc.replace(
            /\baria-describedby=(?:\{)?(["'])([^"']*)\1(?:\})?/,
            `aria-describedby="${errId}"`,
          );
        } else {
          openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` aria-describedby="${errId}"${m}`);
        }
        if (!/data-shine-field-error-linked/.test(openSrc)) {
          openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-shine-field-error-linked${m}`);
        }

        const errNode = `<p id="${errId}" className="error" role="alert" data-shine-field-error>${defaultMessage}</p>`;
        if (ts.isJsxSelfClosingElement(node)) {
          edits.push({
            start: node.getStart(sf),
            end: node.getEnd(),
            replacement: `${openSrc}\n      ${errNode}`,
          });
        } else {
          edits.push({
            start: opening.getStart(sf),
            end: opening.getEnd(),
            replacement: openSrc,
          });
          if (!hasErrorNode) {
            edits.push({
              start: node.getEnd(),
              end: node.getEnd(),
              replacement: `\n      ${errNode}`,
            });
          }
        }
        return;
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start || b.end - a.end);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

function jsxOwnText(node, sf) {
  if (!ts.isJsxElement(node)) return "";
  const parts = [];
  for (const child of node.children) {
    if (ts.isJsxText(child)) {
      const t = child.getText(sf).replace(/\s+/g, " ").trim();
      if (t) parts.push(t);
    }
  }
  return parts.join(" ").trim();
}

function jsxHasIconChild(node, sf) {
  if (!ts.isJsxElement(node)) return false;
  let found = false;
  const walk = (n) => {
    if (found) return;
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const opening = ts.isJsxElement(n) ? n.openingElement : n;
      const tag = jsxTagName(opening);
      if (tag === "svg" || tag === "img" || tag === "i" || /Icon$/.test(tag)) {
        found = true;
        return;
      }
    }
    ts.forEachChild(n, walk);
  };
  for (const child of node.children) walk(child);
  return found;
}

function openingHasAccessibleName(opening, sf) {
  if (findJsxAttr(opening, "aria-label", sf)) return true;
  if (findJsxAttr(opening, "aria-labelledby", sf)) return true;
  if (findJsxAttr(opening, "title", sf)) return true;
  return false;
}

/**
 * Count incomplete primitives in TSX (icon-only unnamed, unlabeled inputs, destructive).
 */
export function countIncompletePrimitivesTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let iconOnly = 0;
  let unlabeled = 0;
  let destructive = 0;
  const destructiveRe = /\b(delete|destroy|purge|wipe|erase|remove|revoke|unlink)\b/i;
  const walk = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
      const tag = jsxTagName(opening);
      if ((tag === "button" || tag === "Button" || tag === "a") && ts.isJsxElement(node)) {
        const text = jsxOwnText(node, sf);
        if (!text && jsxHasIconChild(node, sf) && !openingHasAccessibleName(opening, sf)) iconOnly += 1;
        if (text && destructiveRe.test(text)) {
          if (
            !findJsxAttr(opening, "data-confirm", sf) &&
            !findJsxAttr(opening, "data-shine-confirm", sf)
          ) {
            const popup = attrStringValue(findJsxAttr(opening, "aria-haspopup", sf), sf) || "";
            if (popup !== "dialog") destructive += 1;
          }
        }
      }
      if (tag === "input" || tag === "Input" || tag === "select" || tag === "textarea") {
        if (!openingHasAccessibleName(opening, sf)) {
          const ph = attrStringValue(findJsxAttr(opening, "placeholder", sf), sf);
          const type = (attrStringValue(findJsxAttr(opening, "type", sf), sf) || "").toLowerCase();
          if (ph && !/^(hidden|submit|button|image|reset)$/.test(type)) unlabeled += 1;
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return { hits: iconOnly + unlabeled + destructive, iconOnly, unlabeled, destructive };
}

/**
 * Stamp accessible names + confirm markers on incomplete primitive JSX via AST.
 */
export function nameControlsTsx(source, op = {}) {
  const defaultIconLabel = op.iconLabel || "More actions";
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  const destructiveRe = /\b(delete|destroy|purge|wipe|erase|remove|revoke|unlink)\b/i;

  const stampOpening = (opening, attrs) => {
    let openSrc = text.slice(opening.getStart(sf), opening.getEnd());
    for (const [name, value] of attrs) {
      if (new RegExp(`\\b${name}\\b`).test(openSrc)) continue;
      if (value === true) {
        openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` ${name}${m}`);
      } else {
        openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` ${name}="${value}"${m}`);
      }
    }
    if (openSrc !== text.slice(opening.getStart(sf), opening.getEnd())) {
      edits.push({ start: opening.getStart(sf), end: opening.getEnd(), replacement: openSrc });
    }
  };

  const walk = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
      const tag = jsxTagName(opening);

      if ((tag === "button" || tag === "Button" || tag === "a") && ts.isJsxElement(node)) {
        const own = jsxOwnText(node, sf);
        if (!own && jsxHasIconChild(node, sf) && !openingHasAccessibleName(opening, sf)) {
          const id = attrStringValue(findJsxAttr(opening, "id", sf), sf) || "";
          const cls = attrStringValue(findJsxAttr(opening, "className", sf), sf) ||
            attrStringValue(findJsxAttr(opening, "class", sf), sf) ||
            "";
          const label =
            /more|menu|kebab|overflow/i.test(id + cls)
              ? "More actions"
              : /filter|search/i.test(id + cls)
                ? "Filter"
                : /settings|gear|cog/i.test(id + cls)
                  ? "Settings"
                  : defaultIconLabel;
          stampOpening(opening, [
            ["aria-label", label],
            ["data-shine-named", true],
          ]);
        } else if (own && destructiveRe.test(own)) {
          const popup = attrStringValue(findJsxAttr(opening, "aria-haspopup", sf), sf) || "";
          if (
            !findJsxAttr(opening, "data-confirm", sf) &&
            !findJsxAttr(opening, "data-shine-confirm", sf) &&
            popup !== "dialog"
          ) {
            stampOpening(opening, [
              ["aria-haspopup", "dialog"],
              ["data-confirm", true],
              ["data-shine-confirm", true],
            ]);
          }
        }
      }

      if (tag === "input" || tag === "Input" || tag === "select" || tag === "textarea") {
        if (!openingHasAccessibleName(opening, sf)) {
          const ph = attrStringValue(findJsxAttr(opening, "placeholder", sf), sf);
          const type = (attrStringValue(findJsxAttr(opening, "type", sf), sf) || "").toLowerCase();
          if (ph && !/^(hidden|submit|button|image|reset)$/.test(type)) {
            stampOpening(opening, [
              ["aria-label", ph],
              ["data-shine-named", true],
            ]);
          }
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

function isOwnedWorklistOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-owner", sf)) return true;
  if (findJsxAttr(opening, "data-shine-reuse-bound", sf)) return true;
  if (findJsxAttr(opening, "data-shine-owner-id", sf)) return true;
  const pattern = attrStringValue(findJsxAttr(opening, "data-product-pattern", sf), sf) || "";
  return /worklist|datagrid|record-table|card-list|action-flow/i.test(pattern);
}

function isParallelWorklistOpening(opening, sf) {
  if (findJsxAttr(opening, "data-shine-parallel-demoted", sf)) return false;
  if (findJsxAttr(opening, "data-shine-parallel-rest", sf)) return false;
  const tag = jsxTagName(opening);
  if (tag === "table" || tag === "Table") return true;
  if (tag === "DataGrid") return true;
  const role = attrStringValue(findJsxAttr(opening, "role", sf), sf);
  if (role === "grid") return true;
  if (findJsxAttr(opening, "data-shine-grid", sf)) return true;
  const slot = attrStringValue(findJsxAttr(opening, "data-slot", sf), sf);
  if (slot === "table") return true;
  return false;
}

/**
 * Count parallel (unowned) worklists beside product owners in TSX.
 */
export function countParallelOwnedTsx(source) {
  const sf = ts.createSourceFile("surface.tsx", String(source), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let owners = 0;
  let parallels = 0;
  const walk = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
      if (isOwnedWorklistOpening(opening, sf)) owners += 1;
      else if (isParallelWorklistOpening(opening, sf)) parallels += 1;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  const hits = owners > 0 && parallels > 0 ? parallels : 0;
  return { hits, owners, parallels };
}

/**
 * Stamp data-shine-reuse-bound on owners; demote parallel worklists via AST.
 */
export function bindProductOwnerTsx(source, op = {}) {
  const ownerId = op.ownerId || op.owner || "nucleus-datagrid";
  const pattern = op.productPattern || op.pattern || "worklist";
  const summary = op.summary || `Use ${ownerId.replace(/-/g, " ")} (product owner)`;
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];

  const walk = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxSelfClosingElement(node) ? node : node.openingElement;
      if (isOwnedWorklistOpening(opening, sf)) {
        if (!findJsxAttr(opening, "data-shine-reuse-bound", sf)) {
          let openSrc = text.slice(opening.getStart(sf), opening.getEnd());
          if (!/data-shine-owner/.test(openSrc)) {
            openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-shine-owner="${ownerId}"${m}`);
          }
          if (!/data-product-pattern/.test(openSrc)) {
            openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-product-pattern="${pattern}"${m}`);
          }
          openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-shine-reuse-bound${m}`);
          edits.push({ start: opening.getStart(sf), end: opening.getEnd(), replacement: openSrc });
        }
      } else if (isParallelWorklistOpening(opening, sf)) {
        // Skip if already inside a demoted details (parent check via text slice).
        const before = text.slice(Math.max(0, node.getStart(sf) - 60), node.getStart(sf));
        if (/data-shine-parallel-rest/.test(before)) return;
        const full = text.slice(node.getStart(sf), node.getEnd());
        if (/data-shine-parallel-demoted/.test(full)) return;
        let openSrc = text.slice(opening.getStart(sf), opening.getEnd());
        if (!/data-shine-parallel-demoted/.test(openSrc)) {
          openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-shine-parallel-demoted${m}`);
        }
        const body = text.slice(opening.getEnd(), node.getEnd());
        // body includes children + closing; for self-closing, body is empty after open.
        const inner = ts.isJsxSelfClosingElement(node)
          ? openSrc
          : openSrc + body;
        const wrapped =
          `<details data-shine-parallel-rest>\n        <summary>${summary}</summary>\n        ${inner}\n      </details>`;
        edits.push({ start: node.getStart(sf), end: node.getEnd(), replacement: wrapped });
        return; // don't descend into wrapped parallel
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);
  return out;
}

/**
 * Stamp data-unit + baseline on chart JSX via AST.
 */
export function stampChartUnitsTsx(source, op = {}) {
  const unit = op.unit || op.dataUnit || "count";
  const baseline = op.baseline || op.dataBaseline || "prior period";
  const label = op.ariaLabel || `Open notices (${unit} vs ${baseline})`;
  const text = String(source);
  const sf = ts.createSourceFile("surface.tsx", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  /** @type {{ start: number, end: number, replacement: string }[]} */
  const edits = [];
  let needLegend = false;

  const stampOpening = (opening) => {
    if (!isChartJsxOpening(opening, sf) || chartOpeningHasUnits(opening, sf)) return;
    let openSrc = text.slice(opening.getStart(sf), opening.getEnd());
    if (!/data-shine-chart(?!-)/.test(openSrc)) {
      openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-shine-chart${m}`);
    }
    openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` data-unit="${unit}" data-baseline="${baseline}" data-shine-chart-stamped${m}`);
    if (/\baria-label=/.test(openSrc)) {
      openSrc = openSrc.replace(/\baria-label=(?:\{)?(["'])([\s\S]*?)\1(?:\})?/, `aria-label="${label}"`);
    } else {
      openSrc = openSrc.replace(/\s*\/?>$/, (m) => ` aria-label="${label}"${m}`);
    }
    edits.push({ start: opening.getStart(sf), end: opening.getEnd(), replacement: openSrc });
    needLegend = true;
  };

  const walk = (node) => {
    if (ts.isJsxSelfClosingElement(node)) {
      stampOpening(node);
      return;
    }
    if (ts.isJsxElement(node)) {
      stampOpening(node.openingElement);
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);

  if (!edits.length) return text;
  edits.sort((a, b) => b.start - a.start);
  let out = text;
  for (const e of edits) out = out.slice(0, e.start) + e.replacement + out.slice(e.end);

  if (needLegend && !/data-shine-chart-legend/.test(out)) {
    // Insert legend after the first full </svg> or self-closing stamped <canvas />.
    let at = -1;
    const svgEnd = out.indexOf("</svg>");
    if (svgEnd >= 0) at = svgEnd + "</svg>".length;
    else {
      const canvasRe = /<canvas\b[^>]*data-shine-chart-stamped[^>]*\/>/;
      const m = out.match(canvasRe);
      if (m) at = out.indexOf(m[0]) + m[0].length;
    }
    if (at > 0) {
      out =
        out.slice(0, at) +
        `\n      <p data-shine-chart-legend>Unit: ${unit} · Baseline: ${baseline}</p>` +
        out.slice(at);
    }
  }

  return out;
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
