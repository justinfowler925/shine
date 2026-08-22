#!/usr/bin/env node
// shine-lint: off color — this file is the measuring instrument: the literals are canvas
// primers and sentinel values for PARSING page colors, never colors it ships.
// verify/measure.mjs — the shine measure loop.
//
//   node verify/measure.mjs <url|file.html> [--dark] [--json out.json] [--shot out.png]
//
// render    Playwright, resolved through verify/deps.mjs
// measure   getComputedStyle + getBoundingClientRect, after document.fonts.ready
// a11y      axe-core injected offline
// contrast  per-pixel worst-case + p5 for every visible text element
//           (axe returns `incomplete` for text over gradients/images — this answers it)
// lint      scale/cardinality assertions on COMPUTED values, not source strings
//
// Exit 1 if any hard failure: axe violations, contrast < 4.5:1 worst-case on
// body text (3:1 for >=24px), off-scale spacing, font-size cardinality > 6.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve as presolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { load, pathTo } from "./deps.mjs";

const SHINE = presolve(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = load("playwright");
const AXE_PATH = pathTo("axe-core/axe.min.js");

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith("--"));
if (!target) {
  console.error("usage: node verify/measure.mjs <url|file.html> [--dark] [--json out] [--shot out] [--cite id]");
  process.exit(2);
}
const dark = args.includes("--dark");
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const citeWant = opt("--cite");
const url = /^https?:/.test(target) ? target : pathToFileURL(target).href;

const SPACE_SCALE = [0, 1, 2, 4, 8, 12, 16, 24, 32, 48, 64];
const onScale = (px) => SPACE_SCALE.some((s) => Math.abs(px - s) < 0.51) || px % 4 < 0.51 || px % 4 > 3.49;

const browser = await chromium.launch();
const page = await browser.newPage({ colorScheme: dark ? "dark" : "light", viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
if (dark) await page.evaluate(() => document.documentElement.classList.add("dark"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(120); // let any entrance transitions settle
// freeze motion: `transition-all` on a component would otherwise turn the
// contrast pass's color swap into a 150ms fade the screenshot catches mid-flight
await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });

// ---- measure: computed tokens + boxes --------------------------------------
const measured = await page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  const tokens = {};
  for (const name of [
    "--background",
    "--foreground",
    "--primary",
    "--border",
    "--ring",
    "--radius",
    "--shine-color-bg",
    "--shine-color-fg",
    "--shine-color-primary",
    "--shine-color-border",
    "--shine-color-ring",
  ])
    tokens[name] = root.getPropertyValue(name).trim() || null;

  const els = [...document.querySelectorAll("body *")].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  });

  const fontSizes = new Map();
  const offScale = [];
  const radii = new Map();
  for (const el of els) {
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (el.textContent?.trim()) fontSizes.set(fs, (fontSizes.get(fs) ?? 0) + 1);
    for (const prop of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
      const v = parseFloat(cs[prop]);
      if (!Number.isFinite(v) || v === 0) continue;
      // <=2px matches design-lint's soft-note threshold. The two gates were disagreeing
      // about the same fact — a 2px inline-code padding was a hard failure here and not
      // even a note there — and a system whose gates contradict each other gets the
      // inconvenient one switched off.
      if (v > 2 && v % 4 > 0.51 && v % 4 < 3.49)
        offScale.push({ el: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""), prop, px: v });
    }
    const br = parseFloat(cs.borderTopLeftRadius);
    if (br > 0 && br < 500) radii.set(br, (radii.get(br) ?? 0) + 1);
  }
  return {
    tokens,
    bodyBg: body.backgroundColor,
    bodyColor: body.color,
    bodyFont: body.fontFamily,
    fontSizes: [...fontSizes.entries()].sort((a, b) => a[0] - b[0]),
    offScale: offScale.slice(0, 20),
    offScaleCount: offScale.length,
    // Distinct values, with how often each is used. Instance count punishes reuse, which
    // is backwards: one value used 16 times is a decision, sixteen values used once each
    // is the absence of one. An app that invents five near-step font sizes is the failure this has to catch.
    offScaleValues: [...offScale.reduce((m, o) => m.set(o.px, (m.get(o.px) ?? 0) + 1), new Map())]
      .sort((a, b) => a[0] - b[0]),
    radii: [...radii.entries()].sort((a, b) => a[0] - b[0]),
  };
});

// ---- a11y: axe-core, injected offline ---------------------------------------
await page.addScriptTag({ path: AXE_PATH });
const axe = await page.evaluate(async () => {
  const r = await window.axe.run(document, { resultTypes: ["violations", "incomplete"] });
  const brief = (xs) => xs.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  return { violations: brief(r.violations), incomplete: brief(r.incomplete) };
});

// ---- contrast: per-pixel worst-case for visible text elements ----------------
// Method (research/verification.md): read color, hide the text, screenshot the
// box, decode in-page, contrast text color against EVERY background pixel.
// Report worst-case and p5, never the mean.
// Defined once on the page so the rect pass and the screenshot pass compute the
// SAME box. They run seconds apart, and a live surface re-renders in between —
// which is how a span of stone-50 on stone-900 (about 15:1) reported 2.17:1:
// the clip was accurate for where that text had been.
await page.evaluate(() => {
  window.__shineGlyphRect = (el) => {
    // Range over this element's OWN text nodes, never selectNodeContents: that
    // includes child elements, so a flex header <h2>Queue <span/><span/></h2>
    // returns one line box spanning the whole row — 1038x43 of mostly
    // background — and reports 1.11:1 for legible stone-400 text. p5 does not
    // save it, because the background IS the majority of those pixels. Each
    // child is measured on its own pass anyway.
    const runs = [];
    for (const n of el.childNodes) {
      if (n.nodeType !== 3) continue;
      const s = n.textContent;
      const from = s.length - s.trimStart().length;
      const to = s.trimEnd().length; // the space between two inline runs is not a glyph
      if (to <= from) continue;
      const range = document.createRange();
      range.setStart(n, from);
      range.setEnd(n, to);
      runs.push(...[...range.getClientRects()].filter((r) => r.width >= 2 && r.height >= 2));
    }
    if (!runs.length) return null;
    // Clip every run to what is actually PAINTED. A range's client rects report
    // the full text extent even when the element truncates it: a 260px cell of
    // `text-overflow: ellipsis` returns 565px, so the box ran off the card, over
    // the page background and across a neighbour's white and ember glyphs — 36
    // and 26 pixels of another element's text, sampled as if they were this
    // element's background. That is where `worst 1.00` came from, on text that
    // measures about 15:1.
    const clips = [el.getBoundingClientRect()];
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const ocs = getComputedStyle(n);
      if (/(auto|scroll|hidden|clip)/.test(`${ocs.overflowX} ${ocs.overflowY}`)) clips.push(n.getBoundingClientRect());
    }
    const visible = runs
      .map((r) => {
        let { left, right, top, bottom } = r;
        for (const c of clips) {
          left = Math.max(left, c.left);
          right = Math.min(right, c.right);
          top = Math.max(top, c.top);
          bottom = Math.min(bottom, c.bottom);
        }
        return { x: left, y: top, width: right - left, height: bottom - top };
      })
      .filter((r) => r.width >= 2 && r.height >= 2);
    if (!visible.length) return null;
    // Largest run, by area: the most glyph pixels, and never a union box.
    const tr = visible.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
    if (tr.width < 2 || tr.height < 2) return null;
    // Inset past border/AA so a rounded button's corner doesn't sample the page.
    const inset = Math.min(2, Math.floor(Math.min(tr.width, tr.height) / 4));
    return { x: tr.x + inset, y: tr.y + inset, w: tr.width - inset * 2, h: tr.height - inset * 2 };
  };
});

const textTargets = await page.evaluate(() => {
  const out = [];
  const seen = new Set();
  const isOverflowClipped = (el) => {
    const r = el.getBoundingClientRect();
    let n = el.parentElement;
    while (n && n !== document.documentElement) {
      const ocs = getComputedStyle(n);
      if (/(auto|scroll|hidden|clip)/.test(`${ocs.overflowX} ${ocs.overflowY}`)) {
        const cr = n.getBoundingClientRect();
        if (r.bottom <= cr.top + 1 || r.top >= cr.bottom - 1 || r.right <= cr.left + 1 || r.left >= cr.right - 1) {
          return true;
        }
        const visibleH = Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top);
        const visibleW = Math.min(r.right, cr.right) - Math.max(r.left, cr.left);
        if (visibleH < r.height * 0.6 || visibleW < r.width * 0.6) return true;
      }
      n = n.parentElement;
    }
    return false;
  };
  for (const el of document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,button,span,li,code,label,td,th")) {
    const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!text) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) continue;
    if (isOverflowClipped(el)) continue;
    const key = `${Math.round(r.x)},${Math.round(r.y)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const cs = getComputedStyle(el);
    // clip to the GLYPH box, not the element box: a rounded button's corners
    // expose the page behind it — pixels the text never sits on
    const rect = window.__shineGlyphRect(el);
    if (!rect) continue;
    el.dataset.shineIdx = String(out.length);
    out.push({
      idx: out.length,
      tag: el.tagName.toLowerCase(),
      text: el.textContent.trim().slice(0, 40),
      color: cs.color,
      fontSize: parseFloat(cs.fontSize),
      rect,
    });
    if (out.length >= 40) break;
  }
  return out;
});

const contrast = [];
for (const t of textTargets) {
  // hide the GLYPHS ONLY (color: transparent) — visibility:hidden would remove
  // the element's own background, and text would be measured against whatever
  // sits behind the element (the 1.00:1 false reading this harness first produced)
  // Re-read the box now, not the one measured in the pass above: on a surface
  // that re-renders (a live queue, a stream, a poll) the element has moved, and
  // a clip taken from the stale rect samples whatever occupies that space now.
  // The reading is plausible and wrong, and it changes between runs — which is
  // what makes it read as a real defect rather than as a broken probe.
  const fresh = await page.evaluate((idx) => {
    const el = document.querySelector(`[data-shine-idx="${idx}"]`);
    if (!el) return null;
    const r = window.__shineGlyphRect(el);
    if (!r || r.y + r.h < 0 || r.y > innerHeight) return null;
    el.dataset.shinePrevColor = el.style.color || "";
    el.style.color = "transparent";
    return r;
  }, t.idx);
  if (!fresh) continue; // element re-rendered away between passes — measure nothing rather than guess
  let buf;
  try {
    buf = await page.screenshot({ clip: { x: Math.max(0, fresh.x), y: Math.max(0, fresh.y), width: Math.max(1, Math.min(fresh.w, 1280 - fresh.x)), height: Math.max(1, fresh.h) } });
  } catch {
    buf = null;
  }
  await page.evaluate((idx) => {
    const el = document.querySelector(`[data-shine-idx="${idx}"]`);
    if (!el) return;
    el.style.color = el.dataset.shinePrevColor;
    delete el.dataset.shinePrevColor;
  }, t.idx);
  if (!buf) continue;

  const stats = await page.evaluate(
    async ({ b64, color }) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
      await img.decode();
      const c = new OffscreenCanvas(img.width, img.height);
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, img.width, img.height);
      // Resolve the text colour by PAINTING it, not by parsing it. This was
      // `color.match(/rgba?\(...)/)`, and Chrome returns `getComputedStyle().color` in
      // the author's colour space — so every page written in OKLCH returned null here,
      // every element was skipped by a silent `continue`, and the run printed
      // "0 text elements measured, worst Infinity:1" and PASSED. OKLCH is the colour
      // space this skill's first measured rule is about, so the contrast gate was off
      // for exactly the pages built to shine's own method, including shine's own site.
      // Painting also puts the text colour in the same sRGB device space as the
      // screenshot pixels it is compared against, which a parser cannot guarantee.
      const swatch = new OffscreenCanvas(1, 1);
      const sctx = swatch.getContext("2d");
      sctx.fillStyle = "#000";
      sctx.fillRect(0, 0, 1, 1);
      sctx.fillStyle = color;
      sctx.fillRect(0, 0, 1, 1);
      const [tr, tg, tb, ta] = sctx.getImageData(0, 0, 1, 1).data;
      // An unparseable colour leaves fillStyle at the previous value; opaque black on
      // black is indistinguishable from a real black, so guard on alpha instead.
      if (ta === 0) return null;
      const lum = (r, g, b) => {
        const f = (v) => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const tl = lum(tr, tg, tb);
      const ratios = [];
      for (let i = 0; i < data.length; i += 16) {
        // stride 4px for speed
        const bl = lum(data[i], data[i + 1], data[i + 2]);
        const [hi, lo] = tl > bl ? [tl, bl] : [bl, tl];
        ratios.push((hi + 0.05) / (lo + 0.05));
      }
      ratios.sort((a, b) => a - b);
      return { worst: ratios[0], p5: ratios[Math.floor(ratios.length * 0.05)] };
    },
    { b64: buf.toString("base64"), color: t.color },
  );
  if (stats) contrast.push({ ...t, rect: undefined, idx: undefined, ...stats });
}

// ---- composition: the defects a per-element check cannot see ----------------
// Everything above answers "is this value from the system?" — token, ratio, scale,
// cardinality, axe rule. All of them are per-element property checks, and a screen can
// pass every one of them while being unusable.
//
// A prior audit proved it: doctor checks green, axe 0 violations, worst contrast 6.85:1,
// spacing on scale, 4 font sizes — on a screen whose largest region was an empty void
// with no empty state, whose 14px and 15px steps were indistinguishable, that rendered
// identically in light and dark, and that carried 25 always-visible Delete buttons at
// peer weight with Edit.
//
// These checks are about relationships, absences and counts. The hard ones are
// unambiguous; the judgement ones print every run as notes and never block, because a
// gate with false positives is a gate someone switches off.
const compose = await page.evaluate(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
  };
  const walk = (root, acc = []) => {
    const nodes = root.querySelectorAll("*");
    for (const el of nodes) {
      acc.push(el);
      if (el.shadowRoot) walk(el.shadowRoot, acc);
    }
    return acc;
  };
  const start = document.body || document.documentElement;
  const walked = walk(start);
  const all = walked.filter(vis);
  const emptyWalk = walked.length === 0;
  const viewport = innerWidth * innerHeight;
  const name = (el) =>
    el.tagName.toLowerCase() +
    (el.id ? `#${el.id}` : "") +
    (typeof el.className === "string" && el.className ? `.${el.className.split(" ")[0]}` : "");

  // 1. Void regions. Gates measure elements that exist; the biggest defect on a screen
  // is often the one that is missing. A large region with no text, no media and no
  // children has no empty state — the single most visible failure there is.
  // A media element is content, not a void — it just has no text and no children. Left
  // out on the first pass, this flagged shine's own site screenshots as empty regions.
  const MEDIA = /^(img|svg|canvas|video|picture|iframe|input|textarea|hr|object|embed|map)$/;
  const voids = [];
  for (const el of all) {
    if (MEDIA.test(el.tagName.toLowerCase())) continue;
    if (el.getAttribute("role") === "img" || el.getAttribute("aria-hidden") === "true") continue;
    const r = el.getBoundingClientRect();
    const pct = ((r.width * r.height) / viewport) * 100;
    if (pct < 15) continue;
    if (el.innerText?.trim()) continue;
    if (el.querySelector("img,svg,canvas,video,picture,iframe,input,textarea")) continue;
    const cs = getComputedStyle(el);
    if (cs.backgroundImage !== "none") continue;
    // Only the innermost such element — a chain of empty wrappers is one defect.
    if ([...el.children].some((c) => vis(c) && !c.innerText?.trim())) continue;
    voids.push({ sel: name(el), pct: +pct.toFixed(1), w: Math.round(r.width), h: Math.round(r.height) });
  }

  // 2. Type steps too close to distinguish. Cardinality is not scale conformance:
  // 12/14/15/18 is four sizes (inside the budget of six) and still broken, because
  // 14 → 15 is a 1.071 step against the ~1.12 UI band in SKILL.md rule 3.
  const counts = new Map();
  for (const el of all) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    counts.set(fs, (counts.get(fs) ?? 0) + 1);
  }
  const steps = [...counts.entries()].sort((a, b) => a[0] - b[0]);
  const collisions = [];
  for (let i = 1; i < steps.length; i++) {
    const [lo, nLo] = steps[i - 1];
    const [hi, nHi] = steps[i];
    const ratio = hi / lo;
    if (ratio < 1.1 && nLo >= 5 && nHi >= 5)
      collisions.push({ lo, hi, ratio: +ratio.toFixed(3), nLo, nHi });
  }

  // 3. Button treatment census — is there a primary, and how many peers dilute it?
  // Paint the colour, don't parse it. Chrome returns getComputedStyle in the author's
  // space (oklch on this skill's own pages); slicing numbers out of `oklch(0.22 …)`
  // and treating them as sRGB made a dark-on-light filled CTA look identical to the
  // page (channel delta 0.8, threshold 60) and hard-failed shine's explainer.
  const paintRgb = (css) => {
    const c = new OffscreenCanvas(1, 1);
    const ctx = c.getContext("2d");
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data];
  };
  const pageBg = getComputedStyle(document.body).backgroundColor;
  const treatments = new Map();
  const controls = [...document.querySelectorAll("button,[role=button],a.btn,input[type=submit]")].filter(vis);
  for (const b of controls) {
    const cs = getComputedStyle(b);
    const key = `${cs.backgroundColor}|${cs.borderColor}|${cs.fontWeight}`;
    const entry = treatments.get(key) ?? { bg: cs.backgroundColor, border: cs.borderColor, weight: cs.fontWeight, n: 0, sample: [] };
    entry.n++;
    if (entry.sample.length < 4) entry.sample.push(b.innerText.trim().slice(0, 14).replace(/\s+/g, " "));
    treatments.set(key, entry);
  }
  // A "filled" treatment paints a background meaningfully different from the page.
  const filled = [...treatments.values()].filter((t) => {
    if (t.bg === "rgba(0, 0, 0, 0)" || t.bg === "transparent") return false;
    const [r, g, bl, a] = paintRgb(t.bg);
    const [pr, pg, pb] = paintRgb(pageBg);
    if (a < 16) return false;
    return Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(bl - pb) > 60;
  });

  // 4. Destructive controls rendered always-visible at peer weight. Red-dominant fill
  // or text is the tell; the count is what matters.
  // Red, not merely warm. An amber accent (251,146,60) clears "r dominates g and b" easily
  // — it flagged Send/Add/FOCUS as destructive on the first run. What separates danger red
  // from orange is that red's green and blue channels are near-equal (239,68,68 → g/b 1.0)
  // while orange's green runs well ahead of its blue (g/b 2.4).
  const reddish = (s) => {
    const [r, g, b, a] = paintRgb(s);
    if (a < 16 || r <= 100) return false;
    if (r < g * 1.8 || r < b * 1.8) return false;
    const gb = g / Math.max(b, 1);
    return gb < 1.35;
  };
  const destructive = controls.filter((b) => {
    const cs = getComputedStyle(b);
    return reddish(cs.backgroundColor) || reddish(cs.color) || reddish(cs.borderColor);
  });

  // 5. Hit targets. anti-patterns.md has banned sub-40px primary controls for as long as
  // it has existed, and nothing ever checked it.
  const smalls = [];
  for (const el of controls.concat([...document.querySelectorAll("input,select,textarea")].filter(vis))) {
    const r = el.getBoundingClientRect();
    if (r.height < 40 || r.width < 40)
      smalls.push({ tag: el.tagName.toLowerCase(), text: (el.innerText || el.value || el.type || "").trim().slice(0, 16), w: Math.round(r.width), h: Math.round(r.height) });
  }

  // 6. One token, two meanings. An accent that also marks a non-interactive state is a
  // vocabulary collapse every per-element gate passes: both uses are legal tokens.
  const accentBgs = new Set(filled.map((t) => t.bg));
  const accentAlsoState = [];
  for (const el of all) {
    if (controls.includes(el)) continue;
    if (!el.innerText?.trim() || el.children.length) continue;
    const cs = getComputedStyle(el);
    for (const bg of accentBgs) {
      if (cs.color === bg) accentAlsoState.push({ text: el.innerText.trim().slice(0, 20), color: cs.color });
    }
  }

  // 7. Density / chrome share. Count leaf text/media boxes only — summing ancestors
  // double-counts and made an empty main report 73% "content". Chrome = nav/aside/header
  // top boxes. Marketing heroes are mostly image — never hard-fail those. App shells opt
  // in with data-shine-probe="app-shell" (doctor fixture).
  let contentArea = 0;
  let chromeArea = 0;
  for (const el of all) {
    const r = el.getBoundingClientRect();
    const area = r.width * r.height;
    const tag = el.tagName.toLowerCase();
    if (/^(nav|aside|header)$/.test(tag) || el.getAttribute("role") === "navigation") {
      chromeArea += area;
      continue;
    }
    if (el.closest("nav,aside,header,[role=navigation]")) continue;
    const isMedia = /^(img|svg|canvas|video|table)$/.test(tag);
    const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!isMedia && !hasOwnText) continue;
    contentArea += area;
  }
  const contentShare = viewport ? Math.min(contentArea / viewport, 1) : 0;
  const chromeShare = viewport ? Math.min(chromeArea / viewport, 1) : 0;
  const appShellProbe = document.documentElement.getAttribute("data-shine-probe") === "app-shell";

  // 8. Section job census — sections without a heading. Note only until fixture-stable.
  const sections = [...document.querySelectorAll("section,[data-section]")].filter(vis);
  const sectionJobs = sections.map((s) => {
    const h = s.querySelector("h1,h2,h3,h4,h5,h6");
    const text = (s.innerText || "").trim();
    const sentences = text.split(/[.!?]\s+/).filter((x) => x.length > 20);
    return { hasHeading: !!h, supportLines: sentences.length, sel: name(s) };
  });
  const sectionsMissingJob = sectionJobs.filter((s) => !s.hasHeading);

  const namedTable = document.querySelector('[data-shine-contract="table"], [data-contract="table"], [role="grid"]');
  const tableRect = namedTable?.getBoundingClientRect();
  const tableAreaPct = namedTable && viewport ? +((tableRect.width * tableRect.height) / viewport).toFixed(3) : 0;
  const hero = document.querySelector("[data-region='hero']");
  const heroRect = hero?.getBoundingClientRect();
  const heroAreaPct = hero && viewport ? +((heroRect.width * heroRect.height) / viewport).toFixed(3) : 0;
  let maxHeadingPx = 0;
  for (const h of document.querySelectorAll("h1,h2")) {
    const px = parseFloat(getComputedStyle(h).fontSize);
    if (px > maxHeadingPx) maxHeadingPx = px;
  }
  const accentEl = document.querySelector("[data-primary]");
  const accentRgb = accentEl ? paintRgb(getComputedStyle(accentEl).backgroundColor) : null;
  const dnaChroma = document.documentElement.getAttribute("data-dna-chroma");
  const chromaCheck = document.documentElement.hasAttribute("data-chroma-check");
  const tableContract = namedTable
    ? {
        sort: !!(
          namedTable.querySelector("[aria-sort], [data-sort], thead button, thead [role='button']") ||
          document.querySelector("[data-sort]")
        ),
        page: !!document.querySelector('[data-pagination], nav[aria-label*="page" i], [aria-label*="pagination" i]'),
        empty: !!document.querySelector('[data-empty], [data-state="empty"]'),
        loading: !!document.querySelector('[data-loading], [aria-busy="true"], [data-state="loading"]'),
        error: !!document.querySelector('[data-error], [role="alert"], [data-state="error"]'),
      }
    : null;

  const citeEls = [...document.querySelectorAll("[data-cite]")];
  const citeId =
    document.documentElement.getAttribute("data-cite") ||
    document.body.getAttribute("data-cite") ||
    citeEls[0]?.getAttribute("data-cite") ||
    null;
  const dnaFamily =
    document.documentElement.getAttribute("data-dna-family") ||
    document.body.getAttribute("data-dna-family") ||
    null;
  const voice =
    document.documentElement.getAttribute("data-shine-voice") ||
    document.body.getAttribute("data-shine-voice") ||
    "house";
  const slotSidebar = !!document.querySelector("[data-slot='sidebar']");
  const bodyFont = getComputedStyle(document.body).fontFamily;

  const hookMisses = [];
  const blob =
    [...document.querySelectorAll("style")].map((s) => s.textContent || "").join("\n") +
    [...document.querySelectorAll("[style]")].map((el) => el.getAttribute("style") || "").join(";");
  for (const h of new Set([...blob.matchAll(/--slds-[a-z0-9-]+/g)].map((m) => m[0]))) {
    if (!getComputedStyle(document.documentElement).getPropertyValue(h).trim()) hookMisses.push(h);
  }

  return {
    voids: voids.sort((a, b) => b.pct - a.pct),
    collisions,
    treatments: [...treatments.values()].sort((a, b) => b.n - a.n),
    filledCount: filled.length,
    controlCount: controls.length,
    destructive: destructive.length,
    destructiveSample: destructive.slice(0, 3).map((b) => b.innerText.trim().slice(0, 14)),
    smalls,
    accentAlsoState: [...new Map(accentAlsoState.map((a) => [a.text, a])).values()].slice(0, 6),
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    contentShare: +contentShare.toFixed(3),
    chromeShare: +chromeShare.toFixed(3),
    appShellProbe,
    sectionsMissingJob: sectionsMissingJob.slice(0, 8),
    sectionCount: sections.length,
    tableContract,
    tableAreaPct,
    heroAreaPct,
    maxHeadingPx,
    accentRgb,
    dnaChroma,
    chromaCheck,
    citeId,
    dnaFamily,
    voice,
    slotSidebar,
    bodyFont,
    regionCiteCount: citeEls.length,
    emptyWalk,
    hookMisses,
  };
});

// 7. Does the theme actually switch? A page stuck in one mode passes every per-element
// check in whichever mode it is stuck in, and this harness would cheerfully print
// "mode=light" over a black page — which is exactly what it did before this existed.
const otherPage = await browser.newPage({ colorScheme: dark ? "light" : "dark", viewport: { width: 1280, height: 900 } });
await otherPage.goto(url, { waitUntil: "networkidle" });
if (!dark) await otherPage.evaluate(() => document.documentElement.classList.add("dark"));
await otherPage.evaluate(() => document.fonts.ready);
const otherBg = await otherPage.evaluate(() => getComputedStyle(document.body).backgroundColor);
await otherPage.close();
const themeSwitches = otherBg !== compose.bodyBg;
// A single-mode design is legitimate when it is *declared* — rule 10 requires
// `color-scheme` on <html> anyway. Undeclared and unswitching is a broken theme.
const themeDeclaredSingle = /^(dark|light)$/.test((compose.colorScheme || "").trim());

// Wireframe gray-boxes are structural only — craft hard-fails (contrast, axe colour,
// type/spacing cardinality, theme) do not apply until Build. Structure still does:
// hierarchy (one primary), voids. Detected by data-shine-wireframe (skill contract).
const isWireframe = await page.evaluate(
  () => !!document.querySelector("[data-shine-wireframe]"),
);

const shot = opt("--shot");
if (shot) await page.screenshot({ path: shot, fullPage: true });
await browser.close();

// ---- verdicts ----------------------------------------------------------------
const failures = [];
// A gate that measured nothing must never report a pass. Three `continue` paths in the
// contrast loop are silent by design (an element that re-rendered away, a screenshot that
// would not clip, an unresolvable colour), and when one of them fired for *every* target
// the run printed "0 text elements measured, worst Infinity:1" above a green PASS. That
// is how the OKLCH bug survived: the gate was not failing, it was absent.
if (!isWireframe && textTargets.length && !contrast.length) {
  failures.push(
    `contrast: ${textTargets.length} text elements found and 0 measured — the contrast gate did ` +
      `not run. Not a pass. Check the colour space, the clip, and whether the page re-renders.`,
  );
}
if (axe.violations.length) {
  const relevant = isWireframe
    ? axe.violations.filter((v) => !/color-contrast|region/.test(v.id))
    : axe.violations;
  if (relevant.length) {
    failures.push(`axe: ${relevant.map((v) => `${v.id}(${v.impact},${v.nodes})`).join(", ")}`);
  } else if (isWireframe && axe.violations.length) {
    console.log(
      `  note: wireframe — skipping craft axe (${axe.violations.map((v) => v.id).join(", ")})`,
    );
  }
}
if (!isWireframe) for (const c of contrast) {
  const min = c.fontSize >= 24 ? 3 : 4.5;
  // Gate on p5, not worst. worst≪p5 means the sampler hit non-glyph pixels
  // (clip, AA fringe, sibling paint inside a union box) — see brain contrast-probe rule.
  if (c.p5 < min) {
    failures.push(`contrast: <${c.tag}> "${c.text}" p5 ${c.p5.toFixed(2)}:1 < ${min}:1 (worst ${c.worst.toFixed(2)})`);
  } else if (c.worst < min) {
    console.log(`  note: <${c.tag}> "${c.text}" worst ${c.worst.toFixed(2)}:1 but p5 ${c.p5.toFixed(2)}:1 clears — treating as sampling fringe`);
  }
} else if (contrast.length) {
  console.log(`  note: wireframe — skipping ${contrast.length} craft contrast hard-fails`);
}
// Six is the size of the token scale (text-xs…2xl), and that scale stops at 28px because
// SKILL.md sanctions clamp() for fluid display type above it. Counting every size against
// one cap of 6 therefore made the system's own sanctioned usage unreachable: a page using
// all six steps plus one display size renders 7 and could never pass. shine's own site was
// failing on exactly that, which is the shadow-gap shape again — a rule that cannot be
// satisfied teaches people to ignore it. So: the UI band is capped at the scale, and
// display sizes are counted separately, with a ceiling that still catches sprawl.
if (!isWireframe) {
  const UI_BAND = 32;
  const ui = measured.fontSizes.filter(([s]) => s < UI_BAND);
  const display = measured.fontSizes.filter(([s]) => s >= UI_BAND);
  if (ui.length > 6)
    failures.push(
      `type scale: ${ui.length} distinct font sizes under ${UI_BAND}px (max 6, the token scale): ` +
        ui.map(([s]) => s).join(", "),
    );
  if (display.length > 2)
    failures.push(
      `type scale: ${display.length} distinct display sizes >=${UI_BAND}px (max 2): ` +
        display.map(([s]) => s).join(", "),
    );
}
if (!isWireframe && measured.offScaleValues.length > 3) {
  failures.push(
    `spacing: ${measured.offScaleValues.length} distinct off-scale values (max 3) — ` +
      measured.offScaleValues.map(([px, n]) => `${px}px×${n}`).join(", ") +
      `; e.g. ${measured.offScale.slice(0, 3).map((o) => `${o.el} ${o.prop}`).join("; ")}`,
  );
} else if (!isWireframe && measured.offScaleCount > 0) {
  console.log(
    `  note: ${measured.offScaleValues.length} off-scale spacing value(s), ` +
      `${measured.offScaleValues.map(([px, n]) => `${px}px×${n}`).join(", ")} — em-derived is fine, ad-hoc is not`,
  );
}

// composition — hard (structure applies to wireframes; craft collisions/theme do not)
for (const v of compose.voids) {
  failures.push(
    `composition: ${v.sel} is ${v.pct}% of the viewport (${v.w}×${v.h}) with no content and no empty state — ` +
      `give it a title, a line of body and one action, per patterns.md`,
  );
}
if (!isWireframe) for (const c of compose.collisions) {
  if (compose.voice && compose.voice !== "house") {
    console.log(
      `  note: type scale ${c.lo}px/${c.hi}px collision skipped — kit-faithful DNA (${compose.voice}); house lane still tight`,
    );
    continue;
  }
  failures.push(
    `type scale: ${c.lo}px and ${c.hi}px are a ${c.ratio} step (used ${c.nLo}× and ${c.nHi}×) — below the ~1.12 UI band, ` +
      `so two steps are doing one job. Cardinality passing is not the scale being right`,
  );
}
if (!isWireframe && !themeSwitches && !themeDeclaredSingle) {
  failures.push(
    `theme: light and dark both render ${compose.bodyBg}, and <html> declares no color-scheme — ` +
      `either wire the theme or declare \`color-scheme: dark\` so the single mode is a stated choice`,
  );
}
// Hierarchy — promoted from notes after an app shipped dozens of peer Deletes and zero primary.
// Controls with no filled treatment: nothing reads as the next action.
// More than two filled treatments: competing primaries dilute the job.
if (compose.emptyWalk) {
  failures.push(
    `walk: 0 nodes from host — start at shadowRoot and refuse 0/0 (LEX synthetic shadow). A probe that measures nothing is broken, not clean`,
  );
}
if ((compose.hookMisses || []).length) {
  failures.push(
    `hooks: ${compose.hookMisses.slice(0, 5).join(", ")} resolve to empty on :root — read getComputedStyle and write the measured fallback`,
  );
}
if (compose.controlCount > 0 && compose.filledCount === 0) {
  failures.push(
    `hierarchy: ${compose.controlCount} controls and 0 filled (primary-looking) treatments — ` +
      `nothing reads as the primary action (techniques.md §Hierarchy; foundations Hierarchy)`,
  );
}
if (compose.filledCount > 2) {
  failures.push(
    `hierarchy: ${compose.filledCount} competing filled treatments — one primary per view ` +
      `(techniques.md §Hierarchy; foundations Hierarchy)`,
  );
}
// Density hard-fail only when the page opts into the app-shell probe — marketing heroes
// are mostly media and would false-fail a global content-share floor.
if (compose.appShellProbe && compose.contentShare < 0.28) {
  failures.push(
    `density: app-shell content share ${(compose.contentShare * 100).toFixed(1)}% of viewport ` +
      `(chrome ${(compose.chromeShare * 100).toFixed(1)}%) — content is losing to chrome; ` +
      `raise the main region's job or collapse nav (techniques.md §Hierarchy & density)`,
  );
}

if (compose.tableContract) {
  for (const k of ["sort", "page", "empty", "loading", "error"]) {
    if (!compose.tableContract[k]) {
      failures.push(`contract: named table missing ${k} (contracts.md Table MUST)`);
    }
  }
}

// Likeness checks key off the --cite FLAG, never off page attributes. The old
// attestation ("--cite X but page data-cite is Y") measured self-labeling: a page
// could satisfy it by stamping three attributes and fail it while being a perfect
// clone. The flag is the agent's claim; these checks measure the rendered page
// against the claimed template's family.
const citeRow = (() => {
  if (!citeWant) return null;
  try {
    const cat = JSON.parse(readFileSync(join(SHINE, "corpus/templates.json"), "utf8"));
    return (cat.templates ?? []).find((t) => t.id === citeWant) || null;
  } catch {
    return null;
  }
})();
const family = (citeRow?.dna?.family || compose.dnaFamily || "").toLowerCase();
const font = compose.bodyFont || "";
const shadcnChrome = compose.slotSidebar || /Geist|ui-sans-serif/i.test(font);
if (family === "carbon" && shadcnChrome) {
  failures.push(
    `likeness: carbon cite rendered shadcn chrome (sidebar slot or Geist) — apply cite DNA, not house style`,
  );
}
if (family === "carbon" && (compose.tableAreaPct || 0) < 0.06) {
  failures.push(
    `likeness: carbon/queue cite table occupies ${((compose.tableAreaPct || 0) * 100).toFixed(1)}% of viewport — DataTable is the focal object (overview.mdx Batch Actions / Toolbar)`,
  );
}
const marketingCite = /marketing|hero/i.test(citeWant || compose.citeId || "");
if (marketingCite && compose.appShellProbe) {
  failures.push(
    `likeness: marketing cite is an app-shell — hero budget, not sidebar + KPI cards`,
  );
}
if (marketingCite) {
  if (compose.tableContract) {
    failures.push(`likeness: marketing cite shipped a data table — hero budget, not a queue`);
  }
  if ((compose.maxHeadingPx || 0) < 32) {
    failures.push(
      `likeness: marketing heading ${(compose.maxHeadingPx || 0).toFixed(0)}px — type is identity (DNA type=display)`,
    );
  }
  if ((compose.heroAreaPct || 0) < 0.2) {
    failures.push(
      `likeness: marketing hero occupies ${((compose.heroAreaPct || 0) * 100).toFixed(1)}% — media/hero region missing (magicui HeroVideoDialog)`,
    );
  }
}

const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const accentC = (() => {
  const rgb = compose.accentRgb;
  if (!rgb || rgb.length < 3) return null;
  const [r, g, b] = rgb;
  const lr = lin(r), lg = lin(g), lb = lin(b);
  const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l = Math.cbrt(l_), m = Math.cbrt(m_), s = Math.cbrt(s_);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return Math.hypot(a, bb);
})();
if (compose.chromaCheck && compose.voice === "house" && accentC != null) {
  if (accentC < 0.13 || accentC > 0.24) {
    failures.push(
      `chroma: house accent C=${accentC.toFixed(3)} outside 0.13–0.24 (SKILL house band) — data-chroma-check`,
    );
  }
}
if (compose.voice === "kit-faithful" && compose.dnaChroma && accentC != null) {
  const band = compose.dnaChroma;
  if (band === "low" && accentC > 0.16) {
    failures.push(`chroma: kit-faithful DNA chroma=low but C=${accentC.toFixed(3)} (>0.16)`);
  }
  if (band === "high" && accentC < 0.16) {
    failures.push(`chroma: kit-faithful DNA chroma=high but C=${accentC.toFixed(3)} (<0.16)`);
  }
}

const report = { url, mode: dark ? "dark" : "light", measured, axe, contrast, compose, themeSwitches, failures };
const jsonOut = opt("--json"); // written once at the end, after notes are attached

console.log(`mode=${report.mode}  bodyBg=${measured.bodyBg}  bodyColor=${measured.bodyColor}`);
console.log(`tokens: ${JSON.stringify(measured.tokens)}`);
console.log(`fontSizes: ${measured.fontSizes.map(([s, n]) => `${s}px×${n}`).join("  ")}`);
console.log(`axe: ${axe.violations.length} violations, ${axe.incomplete.length} incomplete`);
console.log(`contrast: ${contrast.length} text elements measured, worst ${Math.min(...contrast.map((c) => c.worst), Infinity).toFixed(2)}:1`);
console.log(
  `theme: ${dark ? "dark" : "light"} ${compose.bodyBg} / other ${otherBg} — ` +
    `${themeSwitches ? "switches" : themeDeclaredSingle ? `single mode, declared color-scheme:${compose.colorScheme}` : "DOES NOT SWITCH"}`,
);

// ---- composition notes: judgement calls, printed every run, never blocking -----
// Hard-failing these would produce false positives, and a gate with false positives is
// a gate someone switches off — which is how a blanket `shine-lint: off` pragma ended
// up disabling colour and type checking on a whole stylesheet.
const notes = [];
if (compose.controlCount) {
  const peers = compose.treatments[0];
  notes.push(
    `${compose.controlCount} controls in ${compose.treatments.length} visual treatments; ` +
      `${compose.filledCount} filled (primary-looking). Largest group: ${peers.n}× ${peers.bg} [${peers.sample.join(", ")}]`,
  );
}
notes.push(
  `density: content~${(compose.contentShare * 100).toFixed(0)}% chrome~${(compose.chromeShare * 100).toFixed(0)}% of viewport` +
    (compose.appShellProbe ? " (app-shell probe)" : ""),
);
if (compose.sectionCount) {
  notes.push(
    `sections: ${compose.sectionCount} marked; ${compose.sectionsMissingJob.length} missing a heading` +
      (compose.sectionsMissingJob.length
        ? ` (${compose.sectionsMissingJob.map((s) => s.sel).join(", ")})`
        : ""),
  );
}
if (compose.destructive > 3)
  notes.push(
    `${compose.destructive} destructive controls rendered at once (${compose.destructiveSample.join(", ")}) — ` +
      `per-row destructive actions at peer weight are N chances to lose data; move them behind a menu and name the blast radius in the confirm`,
  );
if (compose.smalls.length)
  notes.push(
    `${compose.smalls.length} controls under 40px: ` +
      compose.smalls.slice(0, 5).map((s) => `${s.tag}"${s.text}" ${s.w}×${s.h}`).join(", ") +
      (compose.smalls.length > 5 ? ` …+${compose.smalls.length - 5}` : ""),
  );
if (compose.accentAlsoState.length)
  notes.push(
    `accent colour also used as non-interactive state on ${compose.accentAlsoState.map((a) => `"${a.text}"`).join(", ")} — ` +
      `one token, two meanings: every use is a legal token and the vocabulary still collapsed`,
  );
if (notes.length) {
  console.log("\ncomposition notes (judgement, not blocking):");
  notes.forEach((n) => console.log("  • " + n));
}
report.notes = notes;
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(report, null, 2));

if (failures.length) {
  console.error("\nFAIL");
  failures.forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
console.log(
  "\nPASS — text ≥ threshold, spacing on scale, axe clean, no void regions, type steps distinct, hierarchy ok, theme accounted for",
);
