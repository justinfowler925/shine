// Which colour tokens are unsafe to use as TEXT, derived from the emitted palette.
//
// Why this exists: design-lint checked that you used *a token* and never whether the
// token you chose produces legible text. `--mute` is stone.500 at 4.02:1 and `--mute-2`
// is stone.600 at 2.59:1 against the dark ground — both fail WCAG AA for normal text,
// both are legal tokens, and both linted clean. 130 declarations shipped across a
// consumer site that way while the doctor read 43/43 and every page failed AA.
//
// The set is COMPUTED from tokens/dist, never hand-listed, so adding or repointing a
// token updates the rule automatically. A hand-maintained list would drift the same way
// the site's file listing did.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const AA_NORMAL = 4.5; // WCAG 2 AA, text under 24px (or under 18.66px bold)
const AA_LARGE = 3.0;

const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const parse = (v) => {
  let m = v.match(/rgb\(\s*([\d.]+)%\s+([\d.]+)%\s+([\d.]+)%/);
  if (m) return m.slice(1, 4).map((x) => Number(x) / 100);
  m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  return null;
};

function palette(lane) {
  const css = readFileSync(join(ROOT, `tokens/dist/${lane}/${lane}-site.css`), "utf8");
  const raw = new Map([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
  const resolve = (name, depth = 0) => {
    const v = raw.get(name);
    if (v == null || depth > 8) return null;
    const ref = v.match(/^var\(--([\w-]+)\)$/);
    return ref ? resolve(ref[1], depth + 1) : v;
  };
  const rgb = new Map();
  for (const name of raw.keys()) {
    const c = parse(resolve(name) ?? "");
    if (c) rgb.set(name, c);
  }
  return rgb;
}

/**
 * Tokens that fail AA as normal text on the lane's page background, each with the
 * closest-in-appearance token that passes — so the message can name the fix, not just
 * the problem. A lint that says "this is wrong" without "use this instead" gets ignored.
 */
export function unsafeTextTokens(lane = "personal") {
  let rgb;
  try {
    rgb = palette(lane);
  } catch {
    return new Map(); // tokens not built — the token gates cover that separately
  }
  const ground = rgb.get("ink") ?? rgb.get("bg") ?? rgb.get("shine-color-bg");
  if (!ground) return new Map();

  // Candidates are the short site aliases a consumer actually types.
  const aliases = [...rgb.keys()].filter((k) => !k.startsWith("shine-") && !/^(ink|bg)/.test(k));

  // The replacement must be NEUTRAL, and neutrality is decided by WHITELIST, not by
  // excluding suspicious names. Blacklisting missed `--shine-color-direction-bad`, which
  // reads neutral and resolves to the danger red — it was suggested for muted body text
  // and would have turned every caption red. Name-based exclusion fails on aliases; the
  // grey ramp and the fg tokens are the only things guaranteed to carry no meaning.
  const NEUTRAL = /^shine-color-(stone-\d+|fg(-muted)?)$/;
  const neutralSafe = [...rgb.keys()]
    .filter((k) => NEUTRAL.test(k))
    .map((k) => [k, contrast(rgb.get(k), ground), luminance(rgb.get(k))])
    .filter(([, r]) => r >= AA_NORMAL);

  const out = new Map();
  for (const k of aliases) {
    const ratio = contrast(rgb.get(k), ground);
    if (ratio >= AA_NORMAL) continue;
    // Closest in luminance to what the author reached for, so the fix preserves intent:
    // a dim caption stays dim, just legibly so.
    const lum = luminance(rgb.get(k));
    const better = neutralSafe.slice().sort((a, b) => Math.abs(a[2] - lum) - Math.abs(b[2] - lum))[0];
    out.set(k, {
      ratio: Math.round(ratio * 100) / 100,
      largeOnly: ratio >= AA_LARGE,
      use: better?.[0] ?? "shine-color-fg-muted",
      useRatio: better ? Math.round(better[1] * 100) / 100 : null,
    });
  }
  return out;
}
