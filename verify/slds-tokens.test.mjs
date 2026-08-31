#!/usr/bin/env node
// slds-tokens.test.mjs — tokens/voices/slds.css is derived from Salesforce's own
// published SLDS 2 tokens, not read off a rendered org.
//
// Why this test exists: the sheet used to carry values measured from one org.
// That org was on SLDS 1, so every fallback disagreed with SLDS 2 — a font
// family of "Salesforce Sans" against SLDS 2's system stack, SLDS 1's #0176d3
// brand blue, and the primary/muted foregrounds mapped to each other's hooks.
// Nothing caught it, because a measured value looks exactly like a correct one.
//
// The authority is @salesforce-ux/design-tokens, theme `cosmos`, acquired by
// corpus/acquire.sh (fetch_slds_tokens) into ~/design-corpus/slds-tokens.
//
//   node verify/slds-tokens.test.mjs
//
// Skips with a NOTE when the corpus is absent, the same way the other
// corpus-dependent checks do — a missing clone is not a failing sheet.

import assert from "node:assert";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
const THEME = join(CORPUS, "slds-tokens/dist/themes/cosmos");
const SHEET = join(SHINE, "tokens/voices/slds.css");

if (!existsSync(THEME)) {
  console.log(`slds tokens NOTE: no ${THEME} — run corpus/acquire.sh (this is not a pass)`);
  process.exit(0);
}

/** Every --slds-* declaration the cosmos theme publishes, name → value. */
function officialTokens() {
  const out = new Map();
  for (const file of readdirSync(THEME).filter((f) => f.endsWith(".css")).sort()) {
    const text = readFileSync(join(THEME, file), "utf8");
    for (const m of text.matchAll(/(--slds-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      // First definition wins, matching cascade order across the sorted files.
      if (!out.has(m[1])) out.set(m[1], m[2].split("/*")[0].trim());
    }
  }
  return out;
}

/** Resolve a value that may reference other --slds-* tokens, so a fallback can
 *  be compared against a literal. light-dark() is preserved as written. */
function resolveValue(value, official, seen = new Set()) {
  return value.replace(/var\(\s*(--slds-[a-z0-9-]+)\s*\)/g, (whole, name) => {
    if (seen.has(name)) return whole;
    seen.add(name);
    const target = official.get(name);
    return target ? resolveValue(target, official, seen) : whole;
  });
}

const norm = (value) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/'/g, '"')
    .trim()
    .toLowerCase();

/** #fff and #ffffff are the same colour; compare colours by expansion. */
const expandHex = (value) =>
  value.replace(/#([0-9a-f])([0-9a-f])([0-9a-f])\b/gi, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);

const official = officialTokens();
assert(official.size > 500, `cosmos should publish 500+ tokens, found ${official.size}`);

const sheet = readFileSync(SHEET, "utf8");

// Every var(--slds-*, fallback) in the sheet: the hook must exist in cosmos, and
// the fallback must equal what cosmos resolves that hook to.
const refs = [...sheet.matchAll(/var\(\s*(--slds-[a-z0-9-]+)\s*,\s*((?:[^()]|\([^()]*\))*)\)/g)]
  .map((m) => ({ hook: m[1], fallback: m[2].trim() }));

assert(refs.length >= 15, `expected the sheet to cite 15+ SLDS hooks, found ${refs.length}`);

const unknown = refs.filter((r) => !official.has(r.hook));
assert.deepEqual(unknown.map((r) => r.hook), [], "sheet cites hooks that SLDS 2 does not publish");

const wrong = [];
for (const { hook, fallback } of refs) {
  const want = resolveValue(official.get(hook), official);
  // A font stack may be trimmed to its leading faces; the rest is the same list.
  const isStack = hook.includes("font-family");
  const a = expandHex(norm(fallback));
  const b = expandHex(norm(want));
  const ok = isStack ? b.startsWith(a.replace(/,?$/, "")) || a.startsWith(b) : a === b;
  if (!ok) wrong.push(`${hook}\n      sheet:    ${fallback}\n      SLDS 2:   ${want}`);
}
assert.deepEqual(wrong, [], `fallbacks disagree with SLDS 2:\n    ${wrong.join("\n    ")}`);

// The semantic trap that shipped: SLDS 2 names text hooks by weight, not
// importance. on-surface-1 is the LIGHTEST ink and on-surface-3 the darkest, so
// primary ink is on-surface-3 and muted ink is on-surface-1. Getting these
// backwards still passes a contrast check — both pairs are legible — which is
// exactly why it needs asserting rather than eyeballing.
const mapped = (property) =>
  (sheet.match(new RegExp(`${property}:\\s*var\\(\\s*(--slds-[a-z0-9-]+)`)) || [])[1];
assert.equal(mapped("--shine-color-fg"), "--slds-g-color-on-surface-3",
  "primary ink must be SLDS 2's darkest text hook");
assert.equal(mapped("--shine-color-fg-muted"), "--slds-g-color-on-surface-1",
  "muted ink must be SLDS 2's lightest text hook");
assert.equal(mapped("--shine-color-bg"), "--slds-g-color-surface-1");

// SLDS 1 values that must never reappear as SLDS 2 fallbacks. Comments are
// stripped first: the sheet names the retired values in prose to explain why
// they are retired, and that documentation is not a regression.
const declarations = sheet.replace(/\/\*[\s\S]*?\*\//g, "");
for (const [dead, why] of [
  ["#0176d3", "SLDS 1 brand blue; SLDS 2 accent-2 resolves to #0250d9 / #7cb1fe"],
  ["Salesforce Sans", "SLDS 2 sets font-family-base to the system stack"],
  ["#ba0517", "SLDS 1 error red; SLDS 2 error-1 resolves to #b60554 / #fe8aa7"],
  ["#2e844a", "SLDS 1 success green; SLDS 2 success-1 resolves to #056764 / #01c3b3"],
]) {
  assert(!declarations.includes(dead), `slds.css still carries ${dead} — ${why}`);
}

const version = JSON.parse(readFileSync(join(CORPUS, "slds-tokens/package.json"), "utf8")).version;
console.log(`slds tokens PASS: ${refs.length} hooks derived from @salesforce-ux/design-tokens@${version} cosmos (${official.size} published) · ink weights asserted · no SLDS 1 values`);
