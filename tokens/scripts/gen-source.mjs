// One-shot generator for the DTCG 2025.10 token sources.
// Run `node scripts/gen-source.mjs` only when the palette spec below changes;
// the committed src/*.tokens.json files are the source of truth for builds.
//
// This file used to be allowed to fall behind src/, and did: the dataviz `chart`
// and `direction` sets were added straight to src with no spec here, so a plain
// run would have deleted them — a regeneration landing as a silent palette
// removal. The guard below caught it, and both sets are specified here now, so
// `--check` reports zero orphans and the two files genuinely describe each
// other. Keep it that way: a spec that is permitted to disagree with its output
// is a spec nobody can read for the answer.
//
// The guard stays regardless — a run that would DROP an existing token path
// refuses and names it.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const srgb = (hex, alpha = 1) => {
  const n = hex.replace('#', '');
  const components = [0, 1, 2].map((i) => parseInt(n.slice(i * 2, i * 2 + 2), 16) / 255);
  const value = { colorSpace: 'srgb', components, alpha };
  if (alpha === 1) value.hex = hex.toLowerCase();
  return value;
};
const color = (hex, alpha) => ({ $value: srgb(hex, alpha) });
const alias = (ref, light) =>
  light === undefined
    ? { $value: ref }
    : { $value: ref, $extensions: { mode: { light } } };
const dim = (value) => ({ $type: 'dimension', $value: { value, unit: 'px' } });
const rem = (value) => ({ $type: 'dimension', $value: { value, unit: 'rem' } });
const num = (value) => ({ $type: 'number', $value: value });
const px = (value) => ({ value, unit: 'px' });

// One box-shadow layer. Geometry is shared across modes and lanes; only the
// colour changes, which is the whole point of Rule 6's "dark is the same
// geometry at ~4x alpha".
const layer = (hex) => (offsetY, blur, spread, alpha) => ({
  color: srgb(hex, alpha),
  offsetX: px(0),
  offsetY: px(offsetY),
  blur: px(blur),
  spread: px(spread),
});

// The elevation ladder, as geometry only: [offsetY, blur, spread, alphaScale].
// alphaScale is a multiplier on the lane's base alpha so a lane can dial the
// whole ladder without re-deriving four numbers per level.
//
// Every layer blurred >=8px carries spread = -blur/4 (Rule 6). Every overlay
// level opens with a 0/0/0/1 hairline ring, because Rule 7 is "hairline ring +
// blur layers", and a token that omits the ring makes the rule unfollowable by
// the person who reached for the token. sm has no ring: a resting card takes
// `border`, per foundations, and a ring there would double the hairline.
const LADDER = {
  sm: [
    [1, 2, 0, 1],
    [2, 4, 0, 1],
  ],
  md: [
    [0, 0, 1, 1.5],
    [2, 4, 0, 1],
    [8, 16, -4, 1.5],
  ],
  lg: [
    [0, 0, 1, 1.5],
    [4, 8, -2, 1],
    [12, 24, -6, 1.25],
    [24, 48, -12, 1.5],
  ],
};

// base = the top-layer alpha in the lane's default mode. Rule 6 caps it at 6%
// in light mode; dark takes 4x because a black shadow on a near-black surface
// is otherwise invisible, which is how dark UIs end up with no elevation at all.
const ladder = (hex, base) => {
  const l = layer(hex);
  return Object.fromEntries(
    Object.entries(LADDER).map(([name, layers]) => [
      name,
      layers.map(([y, blur, spread, scale]) =>
        l(y, blur, spread, Number((base * scale).toFixed(4))),
      ),
    ]),
  );
};

const shadowSet = (hex, { base, light }) => {
  const dark = ladder(hex, base);
  const lightLadder = light === undefined ? null : ladder(hex, light);
  return {
    $type: 'shadow',
    ...Object.fromEntries(
      Object.keys(LADDER).map((name) => [
        name,
        lightLadder
          ? { $value: dark[name], $extensions: { mode: { light: lightLadder[name] } } }
          : { $value: dark[name] },
      ]),
    ),
  };
};

const shared = {
  radius: { sm: dim(4), md: dim(8), lg: dim(16), xl: dim(24), full: dim(999) },
  space: Object.fromEntries(
    [4, 8, 12, 16, 24, 32, 48, 64].map((v, i) => [String(i + 1), dim(v)]),
  ),
  // Type had no tokens at all until 2026-08-08, which is why every surface grew
  // its own set: one app reached 12/13/14/15/16px in one stylesheet, another
  // used bare rem, and there was nothing to point at when a review asked for the
  // scale. Six sizes, rem so they honour the user's browser text size. Dense
  // enough for a board (xs/sm) without letting 13px and 14px both mean "small".
  text: {
    xs: rem(0.75), // 12px — metadata, uppercase labels, counts
    sm: rem(0.875), // 14px — dense rows, buttons, secondary text
    // 16px, not the 15px this shipped as. sm→base was a 1.071 step: below the
    // ~1.12 band where a size reads as a different size, so the two steps did
    // one job — the exact "13px and 14px both mean small" failure the comment
    // above warns about, in the scale written to prevent it. The composition
    // gate fails a consumer for it — one app had 89 elements at
    // sm and 210 at base, every one of them a correct token reference.
    base: rem(1), // 16px — body
    lg: rem(1.125), // 18px — panel and section headings
    xl: rem(1.375), // 22px — screen title
    '2xl': rem(1.75), // 28px — display
  },
  leading: {
    tight: num(1.2), // headings
    snug: num(1.35), // dense rows
    normal: num(1.5), // body
    relaxed: num(1.65), // long prose
  },
  // Rule 4 is a curve, not a value: tracking crosses negative at 20-24px and
  // keeps going. So the tokens are keyed to the type scale rather than named
  // tight/normal/wide — `tracking-lg` is the one that belongs with `text-lg`,
  // and pairing them wrongly is then visible in a diff. A system where every
  // size has letter-spacing:0 is the tell this exists to remove.
  //
  // rem, not em, for two reasons: DTCG's dimension type admits px and rem only,
  // and the measured curve these come from (Vercel Geist, taste.md) is itself
  // published per-size in rem. The em equivalents are in the comments so the
  // relationship to Rule 4's em figures stays checkable.
  tracking: {
    xs: rem(0.0078), // 12px, +0.010em — small text opens up
    sm: rem(0), // 14px
    base: rem(0), // 16px — the neutral band is 14-16px
    lg: rem(-0.0078), // 18px, -0.007em — crossing negative
    xl: rem(-0.0156), // 22px, -0.011em
    '2xl': rem(-0.0344), // 28px, -0.020em
    // All-caps needs the opposite sign at every size: +0.04 to +0.08em. Sized
    // for text-xs (0.75rem), which is what labels and eyebrows actually use.
    caps: rem(0.0375), // +0.050em at 12px
  },
  duration: {
    $type: 'duration',
    fast: { $value: { value: 150, unit: 'ms' } },
    base: { $value: { value: 200, unit: 'ms' } },
    slow: { $value: { value: 250, unit: 'ms' } },
  },
  easing: {
    standard: { $type: 'cubicBezier', $value: [0.4, 0, 0.2, 1] },
  },
};

// ---------------------------------------------------------------------------
// @shine/personal — dark-first. Palette values are the shipped personal-lane
// hexes verbatim (value-preserving migration); stone.400 is the one addition,
// so fg-muted can pass AA where the legacy --mute (stone.500) does not.
// ---------------------------------------------------------------------------
const personal = {
  color: {
    $type: 'color',
    stone: {
      50: color('#fafaf9'),
      200: color('#e7e5e4'),
      400: color('#a8a29e'),
      500: color('#78716c'),
      600: color('#57534e'),
      700: color('#44403c'),
      800: color('#292524'),
      900: color('#1c1917'),
      950: color('#0c0a09'),
    },
    ember: {
      300: color('#fdba74'),
      400: color('#fb923c'),
      600: color('#ea580c'),
      // 800 exists so accent TEXT has a legal value on a light background.
      // ember-600 reads 3.41:1 on stone-50 — fine for a border or a 24px
      // heading, illegal for the 11–12px labels surfaces actually use it for.
      //
      // 800 rather than 700 because the label is usually on a card, not on the
      // page: 700 clears stone-50 at 4.96:1 and then fails the same text at
      // 4.12:1 one surface up. A colour has to pass on every surface it lands
      // on, and bg-subtle is the darker of the two in light mode.
      700: color('#c2410c'),
      800: color('#9a3412'),
      soft: color('#fb923c', 0.08),
      line: color('#fb923c', 0.2),
    },
    // Each status colour needs two values, because one hue cannot carry text on
    // both a near-black and a near-white background. The bright values are
    // legible on stone-950 (5.25–9.20:1) and illegible on stone-50 (2.06–3.60:1);
    // the 700s invert that. Shipping only the bright ones meant light mode had
    // no status colour at all — it silently reused the dark value.
    status: {
      crit: color('#ef4444'),
      warn: color('#f59e0b'),
      ok: color('#22c55e'),
      'crit-800': color('#991b1b'),
      'warn-800': color('#92400e'),
      'ok-800': color('#166534'),
    },
    // Sentiment of a change, NOT the arrow's direction. Which way is good is a
    // property of the metric (up is bad for churn, DSO, cycle time), so a
    // surface picks good/bad per metric rather than hardcoding up=green. Always
    // pair with a glyph: ~8% of men cannot use the colour channel, and
    // colour-only direction is a WCAG 1.4.1 failure.
    direction: {
      $description:
        "Sentiment of a change, NOT the arrow's direction. Which way is good is a property of the metric (up is bad for churn, DSO, cycle time), so a surface picks good/bad per metric rather than hardcoding up=green. Always pair with a glyph: ~8% of men cannot use the colour channel, and colour-only direction is a WCAG 1.4.1 failure.",
      // Aliased to the semantic pair, not to the raw status palette. These
      // pointed at status.ok / status.crit / stone.400, none of which carry a
      // light override — the overrides live on success/danger one level up — so
      // in light mode a "good" trend arrow rendered at 2.18:1 and a flat one at
      // 2.41:1. Both shipped. The 3:1 gate added alongside this is what found
      // them; reaching past a semantic token to the palette it wraps is the
      // move that loses the mode.
      good: alias('{color.success}'),
      bad: alias('{color.danger}'),
      flat: alias('{color.fg-muted}'),
    },
    // Okabe & Ito (2008), ordered as published. Five of the eight fall below
    // 3:1 on a light canvas, so those carry a light override darkened just far
    // enough to clear the graphical-object threshold; the contrast gate holds
    // all eight to 3.0 in both modes, which is what keeps these values honest.
    chart: {
      $description:
        "Okabe & Ito (2008) colour-universal categorical set, ordered as published. Position 8 substitutes the neutral for Okabe-Ito's black, which is unusable on a dark canvas. Categorical series only — never spend danger/success/warning on an ordinary series, or readers read alarm into it. Beyond 8 categories, use small multiples instead of more hues.",
      1: { ...color('#e69f00'), $extensions: { mode: { light: srgb('#ba8100') } } },
      2: { ...color('#56b4e9'), $extensions: { mode: { light: srgb('#4794bf') } } },
      3: color('#009e73'),
      4: { ...color('#f0e442'), $extensions: { mode: { light: srgb('#968e29') } } },
      5: color('#0072b2'),
      6: color('#d55e00'),
      7: { ...color('#cc79a7'), $extensions: { mode: { light: srgb('#c2739f') } } },
      8: alias('{color.stone.400}', '{color.stone.500}'),
    },
    bg: alias('{color.stone.950}', '{color.stone.50}'),
    'bg-subtle': alias('{color.stone.900}', '{color.stone.200}'),
    fg: alias('{color.stone.50}', '{color.stone.950}'),
    'fg-muted': alias('{color.stone.400}', '{color.stone.600}'),
    border: alias('{color.stone.800}', '{color.stone.200}'),
    primary: alias('{color.ember.400}', '{color.ember.600}'),
    'primary-fg': alias('{color.stone.950}', '{color.stone.950}'), // light stays stone-950: white-on-ember measured 3.41:1 (2026-08-05 measure-loop defect)
    // The accent as TEXT. `primary` is gated at 3.0 because its job is fills,
    // borders and rings; every surface then reached for it to tint a small label
    // and inherited a 3.41:1 word. Two tokens, two contracts, both provable.
    'primary-text': alias('{color.ember.400}', '{color.ember.800}'),
    ring: alias('{color.ember.400}', '{color.ember.600}'),
    danger: alias('{color.status.crit}', '{color.status.crit-800}'),
    success: alias('{color.status.ok}', '{color.status.ok-800}'),
    warning: alias('{color.status.warn}', '{color.status.warn-800}'),
  },
  font: {
    $type: 'fontFamily',
    serif: { $value: ['Fraunces', 'Georgia', 'serif'] },
    sans: { $value: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'] },
    mono: { $value: ['JetBrains Mono', 'Courier New', 'monospace'] },
  },
  // Dark-first, so the default value carries the 4x alpha and light mode is the
  // override. Shipping only the light values is how a dark UI ends up with
  // shadows nobody can see and every overlay reading as flat.
  shadow: shadowSet('#000000', { base: 0.24, light: 0.06 }),
  ...shared,
};

// ---------------------------------------------------------------------------
// @shine/brand — light only. Dark bands are sections built from the
// palette (anchor/navy), not a theme; no dark mode is invented here. Status
// colors are deliberately absent: a brand kit that doesn't define them must
// not have them invented for it.
//
// THE VALUES BELOW ARE PLACEHOLDERS. This is the shape of a brand-locked lane,
// not anybody's brand. Point `SHINE_BRAND_OVERRIDE` at a private JSON file to
// build your real palette — see `brand.local.example.json` and the guard in the
// write phase, which refuses to write real values into this tracked tree.
// ---------------------------------------------------------------------------
const brand = {
  color: {
    $type: 'color',
    brand: {
      canvas: color('#ffffff'),
      'canvas-subtle': color('#f7f7f8'),
      navy: color('#1e2a55'),
      anchor: color('#151d3b'),
      action: color('#4338ca'),
      'action-hover': color('#3730a3'),
      tint: color('#f5f5fb'),
      hairline: color('#ececee'),
      text: color('#111111'),
      'text-muted': color('#54586b'),
    },
    bg: alias('{color.brand.canvas}'),
    'bg-subtle': alias('{color.brand.canvas-subtle}'),
    fg: alias('{color.brand.text}'),
    'fg-muted': alias('{color.brand.text-muted}'),
    border: alias('{color.brand.hairline}'),
    primary: alias('{color.brand.action}'),
    'primary-hover': alias('{color.brand.action-hover}'),
    'primary-fg': alias('{color.brand.canvas}'),
    info: alias('{color.brand.navy}'),
    ring: alias('{color.brand.navy}'),
  },
  // Placeholder families. A real brand lane names its licensed faces here; the
  // fallback chain is the part worth copying.
  font: {
    $type: 'fontFamily',
    display: { $value: ['Brand Display', 'Helvetica Neue', 'Arial', 'sans-serif'] },
    body: { $value: ['Brand Text', 'Helvetica Neue', 'Arial', 'sans-serif'] },
    ui: { $value: ['Brand UI', 'Helvetica Neue', 'Arial', 'sans-serif'] },
  },
  // Light-only lane, and a bordered/flat brand wants a soft navy-tinted shadow
  // where cards need one — so the tint is anchor, not black, and there is no
  // dark override to write.
  shadow: shadowSet('#151d3b', { base: 0.06 }),
  ...shared,
  tracking: {
    ...shared.tracking,
    // A brand whose UI face is set UPPERCASE at ~0.12em lands at 0.09rem at
    // text-xs (0.75rem) — 2.4x the personal lane's caps value, which is a brand
    // decision and not drift. Override it with the palette if yours differs.
    caps: rem(0.09),
  },
};

// ---------------------------------------------------------------------------
// Private brand palettes — never into the tracked tree.
//
// `SHINE_BRAND_OVERRIDE=/path/to/brand.json` deep-merges a real palette over the
// placeholder brand lane above. When it is set, the brand lane is written to
// `tokens/local/` (gitignored) instead of `tokens/src/`, and config.base.mjs
// prefers `local/` automatically. The guard is the point: a brand palette that
// is nobody's business but yours has no path into a public commit, and it does
// not depend on anyone remembering that.
// ---------------------------------------------------------------------------
const merge = (base, over) => {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over ?? base;
  const next = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(over)) next[k] = k in next ? merge(next[k], v) : v;
  return next;
};
// A palette file states hexes and family names, not DTCG nodes — a brand owner
// should not have to learn the spec to change a colour. `{color:{brand:{action:
// "#005555"}}, font:{display:["X","sans-serif"]}}` is the whole contract.
// `//`-prefixed keys are comments. A palette file is the one place a brand owner
// will want to leave a note, and JSON has nowhere else to put one — without this
// they lift into tokens, emit as junk variables, and terrazzo reports them as
// naming-convention warnings that read like a problem with the palette.
const lift = (node) =>
  typeof node === 'string'
    ? color(node)
    : Array.isArray(node)
      ? { $value: node }
      : Object.fromEntries(
          Object.entries(node)
            .filter(([k]) => !k.startsWith('//'))
            .map(([k, v]) => [k, k.startsWith('$') ? v : lift(v)]),
        );

const OVERRIDE = process.env.SHINE_BRAND_OVERRIDE;
let brandTree = brand;
if (OVERRIDE) {
  if (!existsSync(OVERRIDE)) {
    console.error(`SHINE_BRAND_OVERRIDE points at a file that does not exist: ${OVERRIDE}`);
    process.exit(1);
  }
  brandTree = merge(brand, lift(JSON.parse(readFileSync(OVERRIDE, 'utf8'))));
  // The elevation tint is derived, not stated: a brand that overrides `anchor`
  // means its shadows too, and a private palette that had to restate the whole
  // shadow ladder to change one hue would get it wrong. Re-derive from the
  // merged anchor so the ladder geometry stays shared across lanes.
  const anchor = brandTree.color?.brand?.anchor?.$value?.hex;
  if (anchor) brandTree.shadow = shadowSet(anchor, { base: 0.06 });
}

const out = new URL('../src/', import.meta.url);
const localOut = new URL('../local/', import.meta.url);
mkdirSync(out, { recursive: true });
if (OVERRIDE) mkdirSync(localOut, { recursive: true });

// Every token path in a tree, so a regeneration can be checked for removals.
const paths = (node, prefix = [], acc = new Set()) => {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in value) acc.add([...prefix, key].join('.'));
    else if (value && typeof value === 'object') paths(value, [...prefix, key], acc);
  }
  return acc;
};

// The node at a token path, so a regeneration can be checked for changed values
// and not only for removals. Key order is not meaningful in JSON, so compare a
// canonical form.
const at = (node, id) => id.split('.').reduce((n, k) => (n ? n[k] : undefined), node);
const canon = (v) =>
  Array.isArray(v)
    ? v.map(canon)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])]))
      : v;
const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

const CHECK = process.argv.includes('--check');

// Two phases. The single-phase version wrote each file as it validated it, so a
// spec that satisfied brand and not personal left brand regenerated
// and personal untouched — half a palette, reported as a refusal to write.
const plans = [
  ['personal.tokens.json', personal, out],
  ['brand.tokens.json', brandTree, OVERRIDE ? localOut : out],
].map(([name, tree, dir]) => {
  const url = new URL(name, dir);
  const plan = { name, tree, url, dropped: [], drifted: [] };
  if (!existsSync(url)) return plan;
  const src = JSON.parse(readFileSync(url, 'utf8'));
  const existing = paths(src);
  const next = paths(tree);
  plan.dropped = [...existing].filter((id) => !next.has(id));
  plan.drifted = [...next]
    .filter((id) => existing.has(id) && !same(at(src, id), at(tree, id)))
    .map((id) => `${id} (spec ${JSON.stringify(at(tree, id).$value)}, src ${JSON.stringify(at(src, id).$value)})`);
  return plan;
});

const dropped = plans.filter((p) => p.dropped.length);
const drifted = plans.filter((p) => p.drifted.length);

// --check answers "does the spec still describe src?" for every path they share.
// Orphans are a known, documented state (see the header) and do not fail it;
// silent disagreement is the thing worth catching, because a later regeneration
// reverts src to the spec's value with no diff to read at the time it happens.
// text.base sat at 15px here and 15px in src, then moved in one and not the
// other — the emitted 16px would have gone back to 15px on the next run.
if (CHECK) {
  for (const p of drifted) {
    console.error(`${p.name}: ${p.drifted.length} token(s) disagree with this spec`);
    for (const d of p.drifted) console.error(`  ${d}`);
  }
  if (drifted.length) {
    console.error('\nThe next regeneration would overwrite src with the spec value.');
    process.exit(1);
  }
  const orphans = dropped.reduce((n, p) => n + p.dropped.length, 0);
  console.log(`spec agrees with src${orphans ? ` (${orphans} src-only token(s), by design)` : ''}`);
  process.exit(0);
}

if (dropped.length) {
  console.error(
    '\nRefusing to write: regenerating would delete tokens that exist only in src.\n' +
      dropped.map((p) => `  ${p.name}: ${p.dropped.length} token(s) this spec does not define — ${p.dropped.join(', ')}`).join('\n') +
      '\n\nAdd them to the spec in this file, or edit src/ directly and leave this alone.\n',
  );
  process.exit(1);
}

for (const p of plans) writeFileSync(p.url, `${JSON.stringify(p.tree, null, 2)}\n`);
for (const p of plans) console.log(`wrote ${fileURLToPath(p.url)}`);
if (OVERRIDE) {
  console.log(
    `brand lane built from ${OVERRIDE} into tokens/local/ (gitignored) — ` +
      'the tracked placeholder lane in src/ is untouched.',
  );
}
