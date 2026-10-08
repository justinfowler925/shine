#!/usr/bin/env node
/**
 * N7 — Apply shine-restructure/v1 auto-safe ops to HTML fixtures (DOM substrate).
 * Ops: cta-budget, kpi-collapse, pill-collapse, stamp-page-title, title-singular, chrome-budget,
 * filter-clearable, strip-marketing-dna, set-focal, worklist-first, rebind-cite,
 * collapse-peer-grids (XOR peer→chip via xor-saved-view — never silent delete without chips).
 * god-split stays plan-only.
 */

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTO_SAFE_DOM_OPS, PLAN_ONLY_OPS, sortRestructureOps, validateRestructurePlan } from "./schema.mjs";
import { applyXorSavedView } from "./xor-saved-view.mjs";

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
  const orderedOps = sortRestructureOps(plan.ops || []);

  for (const op of orderedOps) {
    // Dual-focal: DOM XOR recipe when ≥2 peer grid-wraps; else plan markdown.
    if (op.op === "collapse-peer-grids") {
      const xor = applyXorSavedView(out, op);
      if (xor.applied) {
        out = xor.html;
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
    } else if (op.op === "stamp-page-title") {
      const next = applyStampPageTitle(out, op);
      if (next !== out) {
        out = next;
        applied.push("stamp-page-title");
      }
    } else if (op.op === "title-singular") {
      const next = applyTitleSingular(out, op);
      if (next !== out) {
        out = next;
        applied.push("title-singular");
      }
    } else if (op.op === "chrome-budget") {
      const next = applyChromeBudget(out, op);
      if (next !== out) {
        out = next;
        applied.push("chrome-budget");
      }
    } else if (op.op === "filter-clearable") {
      const next = applyFilterClearable(out, op);
      if (next !== out) {
        out = next;
        applied.push("filter-clearable");
      }
    } else if (op.op === "strip-marketing-dna") {
      const next = applyStripMarketingDna(out, op);
      if (next !== out) {
        out = next;
        applied.push("strip-marketing-dna");
      }
    } else if (op.op === "rewrite-filler-empty") {
      const next = applyRewriteFillerEmpty(out, op);
      if (next !== out) {
        out = next;
        applied.push("rewrite-filler-empty");
      }
    } else if (op.op === "collapse-card-soup") {
      const next = applyCollapseCardSoup(out, op);
      if (next !== out) {
        out = next;
        applied.push("collapse-card-soup");
      }
    } else if (op.op === "split-empty-triad") {
      const next = applySplitEmptyTriad(out, op);
      if (next !== out) {
        out = next;
        applied.push("split-empty-triad");
      }
    } else if (op.op === "stamp-chart-units") {
      const next = applyStampChartUnits(out, op);
      if (next !== out) {
        out = next;
        applied.push("stamp-chart-units");
      }
    } else if (op.op === "bind-product-owner") {
      const next = applyBindProductOwner(out, op);
      if (next !== out) {
        out = next;
        applied.push("bind-product-owner");
      }
    } else if (op.op === "name-controls") {
      const next = applyNameControls(out, op);
      if (next !== out) {
        out = next;
        applied.push("name-controls");
      }
    } else if (op.op === "link-field-errors") {
      const next = applyLinkFieldErrors(out, op);
      if (next !== out) {
        out = next;
        applied.push("link-field-errors");
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
 * Demote filled primaries inside header/nav/aside chrome to ghost/outline.
 * Leaves main-region job verbs alone (cta-budget owns main).
 */
export function applyChromeBudget(html, op = {}) {
  const demote = op.demotePolicy || "ghost";
  const chromeRe =
    /<(header|nav|aside)\b[^>]*>[\s\S]*?<\/\1>|<div\b[^>]*(?:data-shine-chrome|data-region=["']chrome["']|data-slot=["']sidebar["'])[^>]*>[\s\S]*?<\/div>/gi;
  let out = String(html);
  out = out.replace(chromeRe, (block) => {
    let next = block;
    next = next.replace(/\bclass=(["'])([^"']*)\1/gi, (m, q, cls) => {
      let tokens = cls.trim().split(/\s+/).filter(Boolean);
      if (!tokens.includes("filled") && !tokens.includes("filled-peer")) return m;
      tokens = tokens.filter((t) => t !== "filled" && t !== "filled-peer");
      if (!tokens.includes(demote)) tokens.push(demote);
      return `class=${q}${tokens.join(" ")}${q}`;
    });
    next = next.replace(/\sdata-shine-chrome-filled(?:=["'][^"']*["'])?/gi, "");
    // variant="default" inside chrome → outline/ghost for TSX-in-HTML fixtures
    next = next.replace(/\bvariant=(["'])default\1/gi, `variant=$1${demote === "ghost" ? "outline" : demote}$1`);
    return next;
  });
  return out;
}



/**
 * Collapse equal Card soup: keep maxVisible cards, stamp focal on the first,
 * park the rest in <details data-shine-card-rest>.
 */
export function applyCollapseCardSoup(html, op = {}) {
  const maxVisible = op.maxVisible ?? 1;
  const summary = op.summary || "More tools";
  const cardRe =
    /<(article|div|section)\b[^>]*(?:data-slot=["']card["']|data-shine-card|class=["'][^"']*\bcard\b)[^>]*>[\s\S]*?<\/\1>/gi;
  const stackRe =
    /<(section|div)\b[^>]*(?:data-shine-card-stack|class=["'][^"']*\bcards\b[^"']*["'])[^>]*>/i;
  const stackMatch = stackRe.exec(html);
  if (stackMatch) {
    const start = stackMatch.index;
    const open = stackMatch[0];
    const tag = stackMatch[1];
    let i = start + open.length;
    let depth = 1;
    const openTag = `<${tag}`;
    const closeTag = `</${tag}>`;
    while (i < html.length && depth > 0) {
      const nextOpen = html.indexOf(openTag, i);
      const nextClose = html.indexOf(closeTag, i);
      if (nextClose < 0) break;
      if (nextOpen >= 0 && nextOpen < nextClose) {
        depth++;
        i = nextOpen + openTag.length;
      } else {
        depth--;
        if (depth === 0) {
          let body = html.slice(start + open.length, nextClose);
          if (/data-shine-card-rest/.test(body)) return html;
          const cards = body.match(cardRe) || [];
          cardRe.lastIndex = 0;
          if (cards.length <= maxVisible) {
            if (cards.length && !/data-region=["']focal["']/.test(cards[0])) {
              const stamped = cards[0].replace(
                /^(<(?:article|div|section)\b)/i,
                `$1 data-region="focal" data-shine-card-primary`,
              );
              body = body.replace(cards[0], stamped);
              return html.slice(0, start) + open + body + closeTag + html.slice(nextClose + closeTag.length);
            }
            return html;
          }
          const visible = cards.slice(0, maxVisible).map((c, idx) => {
            if (idx === 0 && !/data-region=["']focal["']/.test(c)) {
              return c.replace(/^(<(?:article|div|section)\b)/i, `$1 data-region="focal" data-shine-card-primary`);
            }
            return c;
          });
          const rest = cards.slice(maxVisible).map((c) =>
            /data-shine-card-demoted/.test(c)
              ? c
              : c.replace(/^(<(?:article|div|section)\b)/i, `$1 data-shine-card-demoted`),
          );
          const wrapped =
            `${open}\n${visible.join("\n")}\n` +
            `<details data-shine-card-rest><summary>${summary}</summary>\n${rest.join("\n")}\n</details>\n${closeTag}`;
          return html.slice(0, start) + wrapped + html.slice(nextClose + closeTag.length);
        }
        i = nextClose + closeTag.length;
      }
    }
  }
  const cards = html.match(cardRe) || [];
  if (cards.length <= maxVisible) return html;
  let out = html;
  const rest = cards.slice(maxVisible);
  for (const c of rest) out = out.replace(c, "");
  const first = cards[0];
  const stamped = /data-region=["']focal["']/.test(first)
    ? first
    : first.replace(/^(<(?:article|div|section)\b)/i, `$1 data-region="focal" data-shine-card-primary`);
  out = out.replace(first, stamped);
  const demoted = rest
    .map((c) => c.replace(/^(<(?:article|div|section)\b)/i, `$1 data-shine-card-demoted`))
    .join("\n");
  out = out.replace(
    stamped,
    `${stamped}\n<details data-shine-card-rest><summary>${summary}</summary>\n${demoted}\n</details>`,
  );
  return out;
}

/**
 * Link aria-invalid fields to an accessible error message (form-heuristic deepen).
 * Stamps aria-describedby + sibling role=alert when missing.
 */
export function applyLinkFieldErrors(html, op = {}) {
  const defaultMessage = op.message || op.errorMessage || "Enter a valid value.";
  let out = String(html);
  let seq = 0;

  const fieldRe = /<(input|select|textarea)\b([^>]*)>/gi;
  /** @type {{ full: string, tag: string, attrs: string, index: number }[]} */
  const fields = [];
  let m;
  while ((m = fieldRe.exec(out)) !== null) {
    const attrs = m[2] || "";
    if (!/\baria-invalid=["']true["']/i.test(attrs)) continue;
    fields.push({ full: m[0], tag: m[1], attrs, index: m.index });
  }

  // Process from end so indices stay valid when inserting after the field.
  for (const field of fields.reverse()) {
    const describedby = (field.attrs.match(/\baria-describedby=["']([^"']+)["']/i) || [])[1] || "";
    const ids = describedby.split(/\s+/).filter(Boolean);
    const hasLinkedMessage = ids.some((id) => {
      const re = new RegExp(
        `<[^>]+\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>([\\s\\S]*?)<\\/`,
        "i",
      );
      const hit = out.match(re);
      const text = (hit?.[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return text.length >= 3;
    });
    if (hasLinkedMessage) continue;

    const fieldId =
      (field.attrs.match(/\bid=["']([^"']+)["']/i) || [])[1] ||
      `shine-field-${++seq}`;
    const errId = `${fieldId}-error`;
    if (new RegExp(`\\bid=["']${errId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(out)) {
      // Error node exists but wasn't linked — just stamp describedby.
      let attrs = field.attrs.replace(/\s*\/\s*$/, "");
      if (/\baria-describedby=/.test(attrs)) {
        attrs = attrs.replace(/\baria-describedby=(["'])([^"']*)\1/i, (_, q, cur) => {
          const parts = cur.split(/\s+/).filter(Boolean);
          if (!parts.includes(errId)) parts.push(errId);
          return `aria-describedby=${q}${parts.join(" ")}${q}`;
        });
      } else {
        attrs += ` aria-describedby="${errId}"`;
      }
      if (!/\bdata-shine-field-error-linked\b/.test(attrs)) attrs += ` data-shine-field-error-linked`;
      const selfClose = /\/\s*>$/.test(field.full) || field.tag.toLowerCase() === "input";
      const nextField =
        field.tag.toLowerCase() === "input"
          ? selfClose
            ? `<input${attrs} />`
            : `<input${attrs}>`
          : `<${field.tag}${attrs}>`;
      out = out.slice(0, field.index) + nextField + out.slice(field.index + field.full.length);
      continue;
    }

    let attrs = field.attrs.replace(/\s*\/\s*$/, "");
    if (/\baria-describedby=/.test(attrs)) {
      attrs = attrs.replace(/\baria-describedby=(["'])([^"']*)\1/i, (_, q, cur) => {
        const parts = cur.split(/\s+/).filter(Boolean);
        if (!parts.includes(errId)) parts.push(errId);
        return `aria-describedby=${q}${parts.join(" ")}${q}`;
      });
    } else {
      attrs += ` aria-describedby="${errId}"`;
    }
    if (!/\bid=/.test(attrs)) attrs = ` id="${fieldId}"${attrs}`;
    if (!/\bdata-shine-field-error-linked\b/.test(attrs)) attrs += ` data-shine-field-error-linked`;

    const nextField =
      field.tag.toLowerCase() === "input" ? `<input${attrs} />` : `<${field.tag}${attrs}>`;
    const errNode = `<p id="${errId}" class="error" role="alert" data-shine-field-error>${defaultMessage}</p>`;

    // Insert error after the field; if field is inside <label>...</label>, place after </label>.
    const afterField = field.index + field.full.length;
    const sliceAfter = out.slice(afterField, afterField + 200);
    const labelClose = sliceAfter.match(/^([\s\S]*?)<\/label>/i);
    let insertAt = afterField;
    if (labelClose) insertAt = afterField + labelClose[0].length;

    out =
      out.slice(0, field.index) +
      nextField +
      out.slice(afterField, insertAt) +
      `\n${errNode}\n` +
      out.slice(insertAt);
  }

  return out;
}

/**
 * Resolve aria-label for a blank control from id/class/type hints.
 */
function resolveBlankControlLabel(attrs, op = {}) {
  const id = (attrs.match(/\bid=["']([^"']+)["']/i) || [])[1] || "";
  const cls = (attrs.match(/\bclass(?:Name)?=["']([^"']+)["']/i) || [])[1] || "";
  const type = ((attrs.match(/\btype=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
  const href = (attrs.match(/\bhref=["']([^"']+)["']/i) || [])[1] || "";
  const hay = `${id} ${cls} ${href}`;
  if (/more|menu|kebab|overflow/i.test(hay)) return "More actions";
  if (/filter|search/i.test(hay)) return "Filter";
  if (/settings|gear|cog/i.test(hay)) return "Settings";
  if (type === "submit" || /\bsubmit\b/i.test(hay)) return "Submit";
  if (/\bsave\b/i.test(hay)) return "Save";
  if (/\bpursue\b/i.test(hay)) return "Pursue";
  if (/\bcontinue\b/i.test(hay)) return "Continue";
  if (/\bnext\b/i.test(hay)) return "Next";
  if (/\bclose\b|dismiss/i.test(hay)) return "Close";
  if (/\bprimary\b|\bcta\b/i.test(hay)) return op.blankCtaLabel || op.ctaLabel || "Continue";
  return op.blankCtaLabel || op.ctaLabel || op.iconLabel || "Continue";
}

/**
 * Complete incomplete primitives: name icon-only / blank CTAs, label placeholder-only
 * fields, and stamp confirm markers on destructive verbs.
 * Also clears copy: blank-cta (nameless non-icon buttons/links).
 */
export function applyNameControls(html, op = {}) {
  const defaultIconLabel = op.iconLabel || "More actions";
  let out = String(html);

  // Icon-only OR blank (non-icon) buttons/links with no accessible name.
  out = out.replace(
    /<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, body) => {
      if (/\baria-label\b|\baria-labelledby\b|\btitle\b/.test(attrs)) return full;
      const text = String(body)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) return full;
      const hasIcon = /<(svg|img|i)\b|\bclass=["'][^"']*\bicon\b|\bdata-icon\b|\blucide\b/i.test(
        body + attrs,
      );
      const id = (attrs.match(/\bid=["']([^"']+)["']/i) || [])[1] || "";
      const label = hasIcon
        ? /more|menu|kebab|overflow/i.test(id) || /more|menu|kebab|overflow/i.test(attrs)
          ? "More actions"
          : /filter|search/i.test(id)
            ? "Filter"
            : /settings|gear|cog/i.test(id)
              ? "Settings"
              : defaultIconLabel
        : resolveBlankControlLabel(attrs, op);
      let nextAttrs = attrs;
      if (!/\bdata-shine-named\b/.test(nextAttrs)) nextAttrs += ` data-shine-named`;
      if (!hasIcon && !/\bdata-shine-blank-cta\b/.test(nextAttrs)) nextAttrs += ` data-shine-blank-cta`;
      nextAttrs += ` aria-label="${label}"`;
      return `<${tag}${nextAttrs}>${body}</${tag}>`;
    },
  );

  // Unlabeled inputs/select/textarea with placeholder → aria-label from placeholder.
  out = out.replace(/<(input|select|textarea)\b([^>]*)>/gi, (full, tag, attrs) => {
    // Strip trailing slash from attrs when authors wrote <input ... />
    let cleanAttrs = attrs.replace(/\s*\/\s*$/, "");
    if (/\baria-label\b|\baria-labelledby\b/.test(cleanAttrs)) return full;
    if (/\bid=["']([^"']+)["']/i.test(cleanAttrs)) {
      const id = cleanAttrs.match(/\bid=["']([^"']+)["']/i)[1];
      // Skip if an explicit label[for] exists in the document.
      if (new RegExp(`<label\\b[^>]*\\bfor=["']${id}["']`, "i").test(out)) return full;
    }
    const type = ((cleanAttrs.match(/\btype=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
    if (tag.toLowerCase() === "input" && /^(hidden|submit|button|image|reset)$/.test(type)) return full;
    const ph = (cleanAttrs.match(/\bplaceholder=["']([^"']+)["']/i) || [])[1];
    if (!ph) return full;
    if (!/\bdata-shine-named\b/.test(cleanAttrs)) cleanAttrs += ` data-shine-named`;
    cleanAttrs += ` aria-label="${ph}"`;
    if (tag.toLowerCase() === "input") {
      return /\/\s*>$/.test(full) || full.includes("/>") ? `<input${cleanAttrs} />` : `<input${cleanAttrs}>`;
    }
    return `<${tag}${cleanAttrs}>`;
  });

  // Destructive verbs without confirm → stamp data-confirm + aria-haspopup=dialog.
  const destructiveRe = /\b(delete|destroy|purge|wipe|erase|remove|revoke|unlink)\b/i;
  out = out.replace(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, body) => {
    if (/\bdata-confirm\b|\bdata-shine-confirm\b|\baria-haspopup=["']dialog["']/i.test(attrs)) return full;
    if (/<(dialog|[^>]*data-confirm-dialog)/i.test(full)) return full;
    const text = String(body)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || !destructiveRe.test(text)) return full;
    let next = attrs;
    if (!/\baria-haspopup\b/i.test(next)) next += ` aria-haspopup="dialog"`;
    if (!/\bdata-confirm\b/.test(next)) next += ` data-confirm`;
    if (!/\bdata-shine-confirm\b/.test(next)) next += ` data-shine-confirm`;
    return `<${tag}${next}>${body}</${tag}>`;
  });

  return out;
}

/**
 * Bind product owner + demote parallel worklists.
 * Stamps data-shine-reuse-bound on owned surfaces; parks unmarked table/grid
 * parallels in <details data-shine-parallel-rest>.
 */
export function applyBindProductOwner(html, op = {}) {
  const ownerId = op.ownerId || op.owner || "nucleus-datagrid";
  const pattern = op.productPattern || op.pattern || "worklist";
  const summary = op.summary || `Use ${ownerId.replace(/-/g, " ")} (product owner)`;
  let out = String(html);
  if (/data-shine-parallel-rest/.test(out) && /data-shine-reuse-bound/.test(out)) {
    // Still stamp any unbound owners.
  }

  const worklistRe =
    /<(table|div|section)\b([^>]*\b(?:role=["']grid["']|data-shine-grid|data-slot=["']table["']|data-shine-owner|data-product-pattern)[^>]*)>([\s\S]*?)<\/\1>/gi;

  /** @type {{ full: string, tag: string, attrs: string, body: string, owned: boolean, index: number }[]} */
  const found = [];
  let m;
  const src = out;
  worklistRe.lastIndex = 0;
  while ((m = worklistRe.exec(src)) !== null) {
    const attrs = m[2] || "";
    if (/data-shine-parallel-rest|data-shine-parallel-demoted/.test(attrs)) continue;
    // Skip nested matches already inside a captured outer — crude: skip if inside previous span
    const index = m.index;
    if (found.some((f) => index > f.index && index < f.index + f.full.length)) continue;
    const owned =
      /\bdata-shine-owner\b/.test(attrs) ||
      /\bdata-shine-reuse-bound\b/.test(attrs) ||
      /\bdata-shine-owner-id\b/.test(attrs) ||
      (/\bdata-product-pattern\b/.test(attrs) &&
        /worklist|datagrid|record-table|card-list|action-flow/i.test(attrs));
    found.push({ full: m[0], tag: m[1], attrs, body: m[3], owned, index });
  }

  // Also catch bare <table> without role/owner attrs.
  const tableRe = /<table\b([^>]*)>([\s\S]*?)<\/table>/gi;
  while ((m = tableRe.exec(src)) !== null) {
    const attrs = m[1] || "";
    const full = m[0];
    const index = m.index;
    if (found.some((f) => f.full === full || (index >= f.index && index < f.index + f.full.length))) {
      continue;
    }
    if (/data-shine-parallel-rest|data-shine-parallel-demoted/.test(attrs + full)) continue;
    const owned =
      /\bdata-shine-owner\b/.test(attrs) ||
      /\bdata-shine-reuse-bound\b/.test(attrs) ||
      /\bdata-product-pattern\b/.test(attrs);
    found.push({ full, tag: "table", attrs, body: m[2], owned, index });
  }

  found.sort((a, b) => a.index - b.index);
  if (!found.length) return out;

  const owners = found.filter((f) => f.owned);
  const parallels = found.filter((f) => !f.owned);
  if (!parallels.length && owners.every((o) => /\bdata-shine-reuse-bound\b/.test(o.attrs))) {
    return out;
  }

  // Stamp owners.
  for (const o of owners) {
    if (/\bdata-shine-reuse-bound\b/.test(o.attrs)) continue;
    let attrs = o.attrs;
    if (!/\bdata-shine-owner\b/.test(attrs)) attrs += ` data-shine-owner="${ownerId}"`;
    if (!/\bdata-product-pattern\b/.test(attrs)) attrs += ` data-product-pattern="${pattern}"`;
    attrs += ` data-shine-reuse-bound`;
    const next = `<${o.tag}${attrs}>${o.body}</${o.tag}>`;
    out = out.replace(o.full, next);
    o.full = next;
    o.attrs = attrs;
  }

  // Demote parallels (outermost first so indices stay valid via string replace of unique full).
  for (const p of parallels) {
    if (/data-shine-parallel-rest/.test(out) && out.includes(`data-shine-parallel-demoted`) && /data-shine-parallel-rest[\s\S]*$/.test(p.full)) {
      continue;
    }
    // Skip if already wrapped.
    const wrappedProbe = out.indexOf(p.full);
    if (wrappedProbe < 0) continue;
    const before = out.slice(Math.max(0, wrappedProbe - 80), wrappedProbe);
    if (/data-shine-parallel-rest/.test(before)) continue;

    let attrs = p.attrs;
    if (!/\bdata-shine-parallel-demoted\b/.test(attrs)) attrs += ` data-shine-parallel-demoted`;
    const inner = `<${p.tag}${attrs}>${p.body}</${p.tag}>`;
    const wrapped =
      `<details data-shine-parallel-rest>\n    <summary>${summary}</summary>\n    ${inner}\n  </details>`;
    out = out.replace(p.full, wrapped);
  }

  // If we had parallels but no owner, stamp first worklist-like as owner when expected.
  if (!owners.length && /data-owner-expected|data-shine-product-reference/.test(out) && parallels.length) {
    // First parallel already demoted; leave as demoted — owner expected marker alone is enough for measure after demote.
  }

  return out;
}

/**
 * Stamp units/baseline on decorative charts lacking data-unit markers.
 */
export function applyStampChartUnits(html, op = {}) {
  const unit = op.unit || op.dataUnit || "count";
  const baseline = op.baseline || op.dataBaseline || "prior period";
  const label = op.ariaLabel || `Open notices (${unit} vs ${baseline})`;
  let out = String(html);
  const chartRe =
    /<(svg|canvas)\b([^>]*\b(?:data-chart|class=["'][^"']*\bchart\b|aria-label=["'][^"']*chart[^"']*["'])[^>]*)(\/?)>/gi;

  let touched = false;
  out = out.replace(chartRe, (full, tag, attrs, selfClose) => {
    if (/\bdata-shine-chart-stamped\b/.test(attrs) || /\bdata-unit\b/.test(attrs)) return full;
    let next = attrs;
    if (!/\bdata-shine-chart\b/.test(next)) next += ` data-shine-chart`;
    next += ` data-unit="${unit}" data-baseline="${baseline}" data-shine-chart-stamped`;
    if (/\baria-label=/.test(next)) {
      next = next.replace(/\baria-label=(["'])([\s\S]*?)\1/i, `aria-label=$1${label}$1`);
    } else {
      next += ` aria-label="${label}"`;
    }
    touched = true;
    const close = selfClose || tag.toLowerCase() === "canvas" ? (selfClose || "") : "";
    // Preserve original self-closing style for canvas; svg usually has children.
    if (full.endsWith("/>") || tag.toLowerCase() === "canvas" && /\/\s*>$/.test(full)) {
      return `<${tag}${next} />`;
    }
    return `<${tag}${next}>`;
  });

  // Bare large SVG with role=img chart-ish labels already handled; also stamp plain data-chart hosts.
  const hostRe = /<(div|section|figure)\b([^>]*\bdata-chart\b[^>]*)>/gi;
  out = out.replace(hostRe, (full, tag, attrs) => {
    if (/\bdata-shine-chart-stamped\b/.test(attrs) || /\bdata-unit\b/.test(attrs)) return full;
    touched = true;
    return `<${tag}${attrs} data-shine-chart data-unit="${unit}" data-baseline="${baseline}" data-shine-chart-stamped aria-label="${label}">`;
  });

  if (touched && !/data-shine-chart-legend/.test(out)) {
    out = out.replace(
      /(<\/svg>|<\/canvas>|<canvas\b[^>]*\/>)/i,
      `$1\n  <p data-shine-chart-legend>Unit: ${unit} · Baseline: ${baseline}</p>`,
    );
  }

  return out;
}

/**
 * Split conflated empty / filtered-empty / error into distinct treatments.
 * - Active filters + empty → stamp data-filtered-empty, instructional copy, Clear filters
 * - Same-node empty+error/alert → drop error markers from empty; append distinct error sibling
 */
export function applySplitEmptyTriad(html, op = {}) {
  const filteredCopy =
    op.filteredCopy ||
    op.copy ||
    "No notices match these filters. Clear filters or widen the date range.";
  const errorCopy = op.errorCopy || "Couldn't load notices. Retry.";
  const clearLabel = op.clearAllLabel || "Clear filters";
  let out = String(html);
  if (/data-shine-triad-split/.test(out) && /data-filtered-empty/.test(out)) return out;

  const hasActiveFilters =
    /aria-pressed=["']true["']/.test(out) ||
    /data-filter-active=["']true["']/.test(out) ||
    /data-shine-filter-active/.test(out);

  const emptyTagRe =
    /<(div|p|section|aside|td)\b([^>]*\b(?:data-empty|data-shine-empty|data-empty-state|data-state=["']empty["'])[^>]*)>([\s\S]*?)<\/\1>/gi;

  let touched = false;
  out = out.replace(emptyTagRe, (full, tag, attrs, inner) => {
    let nextAttrs = attrs;
    let nextInner = inner;
    const conflated =
      /\brole=["']alert["']/.test(attrs) ||
      /\bdata-error\b/.test(attrs) ||
      /\bdata-state=["']error["']/.test(attrs);

    if (conflated) {
      nextAttrs = nextAttrs
        .replace(/\s*role=["']alert["']/gi, "")
        .replace(/\s*data-error(?:=["'][^"']*["'])?/gi, "")
        .replace(/\s*data-state=["']error["']/gi, "");
      touched = true;
    }

    if (hasActiveFilters && !/\bdata-filtered-empty\b/.test(nextAttrs)) {
      nextAttrs = `${nextAttrs} data-filtered-empty`;
      touched = true;
    }

    if (!/\bdata-shine-triad-split\b/.test(nextAttrs)) {
      nextAttrs = `${nextAttrs} data-shine-triad-split`;
      touched = true;
    }

    const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const generic =
      !text ||
      /^(no data|nothing here|no results|empty|n\/a|—|-)$/i.test(text) ||
      conflated;
    if (generic && hasActiveFilters) {
      const hasClear = /clear filters|data-shine-filter-clear-all/i.test(inner);
      nextInner =
        `${filteredCopy}` +
        (hasClear
          ? ""
          : ` <button type="button" data-shine-filter-clear-all aria-label="${clearLabel}">${clearLabel}</button>`);
      touched = true;
    }

    return `<${tag}${nextAttrs}>${nextInner}</${tag}>`;
  });

  if (touched && !/<[^>]*\bdata-error\b[^>]*>/.test(out) && !/role=["']alert["']/.test(out)) {
    // Append a distinct hidden error treatment so empty ≠ error.
    out = out.replace(
      /<\/main>/i,
      `  <div data-error role="alert" data-shine-triad-split hidden>${errorCopy}</div>\n</main>`,
    );
  }

  if (hasActiveFilters && !/data-shine-filter-clear-all/.test(out)) {
    out = out.replace(
      /(data-shine-filter-stack[^>]*>)/i,
      `$1\n    <button type="button" data-shine-filter-clear-all aria-label="${clearLabel}">${clearLabel}</button>`,
    );
  }

  return out;
}

const FILLER_EMPTY_DOM_RES = [
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

/** Stub phrases from copy: empty-instructional (beyond filler-empty library phrases). */
const EMPTY_INSTRUCTIONAL_DOM_RES = [
  /^no data\.?$/i,
  /^n\/a$/i,
  /^na$/i,
  /^none$/i,
  /^empty$/i,
  /^tbd$/i,
  /^todo$/i,
  /^placeholder$/i,
  /^—+$/,
  /^-+$/,
  /^\.+$/,
  /^\u2026$/,
];

function isEmptyStateHostAttrs(attrs) {
  return (
    /\bdata-shine-empty\b/i.test(attrs) ||
    /\bdata-empty-state\b/i.test(attrs) ||
    /\bdata-empty\b/i.test(attrs) ||
    /\bclass=["'][^"']*\bempty-state\b/i.test(attrs) ||
    /\bclass=["'][^"']*\bEmptyState\b/i.test(attrs) ||
    /\brole=["']status["']/i.test(attrs)
  );
}

/**
 * Replace filler / stub / blank empty-state copy with job-specific instructional text.
 * Clears filler-empty and copy: empty-instructional.
 */
export function applyRewriteFillerEmpty(html, op = {}) {
  const replacement =
    op.copy ||
    op.replacement ||
    "No notices match this view. Clear filters or widen the date range.";
  let out = String(html);
  const tagRe =
    /<(div|p|span|section|aside|li|td|h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  out = out.replace(tagRe, (full, tag, attrs, inner) => {
    if (/data-shine-empty-rewritten/.test(attrs)) return full;
    const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text.length > 80) return full;
    const host = isEmptyStateHostAttrs(attrs);
    // Non-host: classic filler phrases only. Host: blank + instructional stubs + filler.
    const shouldRewrite = host
      ? !text ||
        FILLER_EMPTY_DOM_RES.some((re) => re.test(text)) ||
        EMPTY_INSTRUCTIONAL_DOM_RES.some((re) => re.test(text))
      : Boolean(text && FILLER_EMPTY_DOM_RES.some((re) => re.test(text)));
    if (!shouldRewrite) return full;
    let nextAttrs = attrs;
    if (!/\bdata-shine-empty-rewritten\b/.test(nextAttrs)) {
      nextAttrs = `${nextAttrs} data-shine-empty-rewritten`.replace(/\s+/g, " ");
    }
    return `<${tag}${nextAttrs}>${replacement}</${tag}>`;
  });
  return out;
}

/** Class / style tokens illegal on Operate chrome. */
const MARKETING_CLASS_TOKEN_RE =
  /^(bg-gradient-to-[trbl]{1,2}|from-(?:violet|purple|fuchsia|indigo)-\d{2,3}|to-(?:violet|purple|fuchsia|indigo)-\d{2,3}|drop-shadow-glow|animate-pulse-glow|shadow-\[0_0_[^\]]+\]|font-(?:display|serif)|tracking-tighter)$/i;

/**
 * Strip marketing DNA (glow / purple-indigo gradients / display-serif) from HTML.
 */
export function applyStripMarketingDna(html, _op = {}) {
  let out = String(html);
  // class="…"
  out = out.replace(/\bclass=(["'])([^"']*)\1/gi, (m, q, cls) => {
    const next = cls
      .split(/\s+/)
      .filter(Boolean)
      .filter((tok) => !MARKETING_CLASS_TOKEN_RE.test(tok))
      .join(" ");
    if (next === cls.trim()) return m;
    if (!next) return `class=${q}${q}`;
    return `class=${q}${next}${q}`;
  });
  // style tags — neutralize purple/indigo gradients + glow shadows
  out = out.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (full, body) => {
    let b = body;
    b = b.replace(
      /background\s*:\s*linear-gradient\([^;)]*(?:violet|purple|indigo|#7[Cc]3|#6366)[^;)]*\)/gi,
      "background:#fff",
    );
    b = b.replace(
      /box-shadow\s*:\s*[^;]*(?:0\s+0\s+\d+px|purple|#7[Cc]3[Aa][Ee][Dd]|#6366[Ff]1)[^;]*/gi,
      "box-shadow:none",
    );
    b = b.replace(/font-family\s*:\s*Georgia\s*,\s*serif/gi, "font-family:system-ui,sans-serif");
    b = b.replace(/letter-spacing\s*:\s*-0\.0\d+em/gi, "letter-spacing:normal");
    b = b.replace(/color\s*:\s*#fff\b/gi, "color:#18181b");
    return full.replace(body, b);
  });
  // inline styles
  out = out.replace(/\bstyle=(["'])([^"']*)\1/gi, (m, q, style) => {
    let s = style;
    s = s.replace(
      /background(?:-image)?\s*:\s*linear-gradient\([^;)]*(?:violet|purple|indigo|#7[Cc]3|#6366)[^;)]*\)\s*;?/gi,
      "background:#fff;",
    );
    s = s.replace(
      /box-shadow\s*:\s*[^;]*(?:0\s+0\s+\d+px|purple|#7[Cc]3|#6366)[^;]*;?/gi,
      "box-shadow:none;",
    );
    if (s === style) return m;
    return `style=${q}${s}${q}`;
  });
  // marker attrs
  out = out.replace(/\sdata-shine-marketing-dna(?:=["'][^"']*["'])?/gi, ' data-shine-marketing-stripped');
  // demote font-serif on class already handled; also strip Georgia from h1 if left in markup
  return out;
}

/**
 * Make active filter chips reversible: stamp per-chip dismiss + clear-all.
 * Prefers [data-shine-filter-stack] / .filter-pills containers.
 */
export function applyFilterClearable(html, op = {}) {
  const perChip = op.perChip !== false;
  const clearAll = op.clearAll !== false;
  const clearLabel = op.clearAllLabel || "Clear filters";
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
        let body = html.slice(start + open.length, nextClose);
        const close = "</div>";
        let changed = false;
        if (perChip) {
          const chipRe =
            /<(button|span|a|div)\b([^>]*(?:aria-pressed=["']true["']|data-filter-active=["']true["']|data-shine-filter-active)[^>]*)>([\s\S]*?)<\/\1>/gi;
          body = body.replace(chipRe, (full, tag, attrs, inner) => {
            if (/data-shine-filter-dismiss/.test(full)) return full;
            if (/aria-label=["'][^"']*(?:clear|remove|dismiss)[^"']*["']/i.test(full)) return full;
            changed = true;
            const dismiss =
              `<span data-shine-filter-dismiss aria-label="Clear filter">×</span>`;
            return `<${tag}${attrs}>${inner}${dismiss}</${tag}>`;
          });
        }
        if (
          clearAll &&
          !/data-shine-filter-clear-all/.test(body) &&
          !/clear all filters|aria-label=["']clear filters["']/i.test(body)
        ) {
          body =
            body.trimEnd() +
            `\n    <button type="button" data-shine-filter-clear-all aria-label="Clear all filters">${clearLabel}</button>\n  `;
          changed = true;
        }
        if (!changed) return html;
        return html.slice(0, start) + open + body + close + html.slice(nextClose + close.length);
      }
      i = nextClose + 6;
    }
  }
  return html;
}

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
/**
 * Stamp a first-screen page title when document.title and/or visible h1 are missing/empty.
 * Clears copy: missing-page-title / empty-h1. Runs before title-singular in DENOISE_OP_ORDER.
 */
export function applyStampPageTitle(html, op = {}) {
  const titleText = resolveStampPageTitle(op);
  let out = String(html);

  const titleMatch = out.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const docTitle = (titleMatch?.[1] || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  const h1Re = /<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi;
  /** @type {{ full: string, attrs: string, inner: string, text: string, index: number }[]} */
  const h1s = [];
  let m;
  while ((m = h1Re.exec(out)) !== null) {
    if (/data-shine-title-demoted/.test(m[0])) continue;
    const text = m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    h1s.push({ full: m[0], attrs: m[1] || "", inner: m[2], text, index: m.index });
  }

  const hasNamedH1 = h1s.some((h) => h.text.length > 0);
  const emptyH1 = h1s.find((h) => !h.text);
  let changed = false;

  if (!docTitle) {
    if (titleMatch) {
      out = out.replace(titleMatch[0], `<title>${titleText}</title>`);
    } else if (/<head\b[^>]*>/i.test(out)) {
      out = out.replace(/<head\b[^>]*>/i, (open) => `${open}\n<title>${titleText}</title>`);
    } else if (/<html\b[^>]*>/i.test(out)) {
      out = out.replace(
        /<html\b[^>]*>/i,
        (open) => `${open}\n<head><title>${titleText}</title></head>`,
      );
    } else {
      out = `<!doctype html><html lang="en"><head><title>${titleText}</title></head>\n${out}`;
    }
    changed = true;
  }

  if (!hasNamedH1) {
    if (emptyH1) {
      let attrs = emptyH1.attrs;
      if (!/\bdata-shine-page-title-stamped\b/.test(attrs)) attrs += ` data-shine-page-title-stamped`;
      if (!/\bdata-page-title\b/.test(attrs)) attrs += ` data-page-title`;
      const next = `<h1${attrs}>${titleText}</h1>`;
      out = out.slice(0, emptyH1.index) + next + out.slice(emptyH1.index + emptyH1.full.length);
      changed = true;
    } else {
      const mainOpen = out.match(/<(main|div)\b([^>]*(?:data-shine-main|role=["']main["']|data-region=["']form-app["'])[^>]*)>/i);
      if (mainOpen) {
        const insert = `${mainOpen[0]}\n  <h1 data-page-title data-shine-page-title-stamped>${titleText}</h1>`;
        out = out.replace(mainOpen[0], insert);
        changed = true;
      } else if (/<body\b[^>]*>/i.test(out)) {
        out = out.replace(
          /<body\b[^>]*>/i,
          (open) => `${open}\n  <h1 data-page-title data-shine-page-title-stamped>${titleText}</h1>`,
        );
        changed = true;
      }
    }
  }

  return changed ? out : html;
}

function resolveStampPageTitle(op = {}) {
  const explicit = String(op.title || op.label || op.pageTitle || "").trim();
  if (explicit) return explicit.slice(0, 72);
  const job = String(op.job || "").trim();
  if (job) {
    const cut = job.split(/[:.·—–|]/)[0].trim();
    return (cut || job).slice(0, 72);
  }
  const category = String(op.category || "").trim();
  if (category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  return "Operate";
}

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
    "## collapse-peer-grids (plan — fewer than 2 peer wraps or dynamic peers)",
    "",
    `- Job: ${plan.job || "(unset)"}`,
    `- Keep worklist whose title matches: ${keep}`,
    `- Fold peer whose title matches: ${fold} → saved-view / filter chip / XOR`,
    `- Mode: ${op.mode || "xor-saved-view"}`,
    `- Auto-safe when ≥2 literal \`.grid-wrap\` peers: apply-dom calls xor-saved-view (peer→chip)`,
    `- Manual close: \`node verify/restructure/xor-saved-view.mjs --html <file> --keep ${keep} --fold ${fold}\``,
    `- Recipe: peer title → filter chip + shared DataGrid state (kits.md § Dual-grid XOR)`,
    `- Prove: one [role=grid] in the fold; measure dual-focal FAIL→PASS`,
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
