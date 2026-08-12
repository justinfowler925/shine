// Contrast gate: WCAG 2 AA is the hard gate; APCA (chroma-js contrastAPCA,
// APCA-1.0.98G) is reported as advisory only — it is NOT the WCAG 3 algorithm.
// Status colors are advisory: they are indicators that foundations.md already
// requires to be paired with text/icon, and their values are shipped.
import { readFileSync, existsSync } from 'node:fs';
import chroma from 'chroma-js';

const LANES = {
  personal: {
    modes: ['.', 'light'],
    gates: [
      ['color.fg', 'color.bg', 4.5],
      ['color.fg-muted', 'color.bg', 4.5],
      ['color.fg', 'color.bg-subtle', 4.5],
      // 4.5, not 3.0: buttons render this pair at 14px — normal-text AA applies.
      // Proven by the measure loop: stone-50 on ember-600 read 3.41:1 per-pixel.
      // Both lanes hold this pair at 4.5, and a brand lane that lowers it owes
      // the measurements and an assertion — see the note on the brand gate
      // below. The distinction that matters is who owns the value: this lane's
      // primary is shine's to move, and it was moved until it passed. A brand
      // constant is not, which is the only case where the argument gets hard.
      ['color.primary-fg', 'color.primary', 4.5],
      // `primary` stays at 3.0 because it is a fill/border/ring colour. Accent
      // TEXT uses primary-text, which is held to the text threshold in both
      // modes — otherwise the 3.0 pass reads as a licence to tint small labels.
      ['color.primary', 'color.bg', 3.0],
      ['color.ring', 'color.bg', 3.0],
      // Against bg-subtle as well as bg. Text sits on cards and panels far more
      // often than on the bare page, and checking only the page let a value
      // through that passed at 4.96:1 on bg and failed at 4.12:1 on a card —
      // which is where every label using it actually was.
      ['color.primary-text', 'color.bg', 4.5],
      ['color.primary-text', 'color.bg-subtle', 4.5],
      // Status colours were advisory — printed, never failed — on the argument
      // that they are always paired with a word rather than being the word.
      // Nothing checked that, and the word ended up wearing the colour: an 11px
      // "blocked" flag at 1.71:1 in light mode. They are gated now, which they
      // pass in both modes only because light finally has its own values.
      ['color.danger', 'color.bg', 4.5],
      ['color.warning', 'color.bg', 4.5],
      ['color.success', 'color.bg', 4.5],
      ['color.danger', 'color.bg-subtle', 4.5],
      ['color.warning', 'color.bg-subtle', 4.5],
      ['color.success', 'color.bg-subtle', 4.5],
      // The chart ramp and the direction set are graphical objects (WCAG 1.4.11
      // 3:1), and the light overrides on five of the eight Okabe-Ito hexes exist
      // for exactly this reason — while nothing checked it. A derived value with
      // no gate behind it is one careless edit from silently regressing, and the
      // failure mode is a series nobody can see rather than an error.
      ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => [`color.chart.${i}`, 'color.bg', 3.0]),
      ['color.direction.good', 'color.bg', 3.0],
      ['color.direction.bad', 'color.bg', 3.0],
      ['color.direction.flat', 'color.bg', 3.0],
    ],
    advisory: [],
  },
  brand: {
    modes: ['.'],
    gates: [
      ['color.fg', 'color.bg', 4.5],
      ['color.fg-muted', 'color.bg', 4.5],
      ['color.fg', 'color.bg-subtle', 4.5],
      // 4.5, same as the personal lane: a button label is normal text at the
      // size buttons actually render. The placeholder palette clears it easily,
      // which is the point — a lane shipping placeholder values must not also
      // ship a lowered gate, or every brand that overrides it inherits an
      // exception nobody argued for.
      //
      // A real brand lane may genuinely need 3.0 here. The case is narrow: the
      // fill is fixed by a brand book that is not shine's to change, AND both
      // ways out (a dark label, a darker fill) measure worse than the shortfall.
      // If you lower it, the rules are: state the measurements in this file,
      // state the residual risk in the same breath, and add an `assertions`
      // entry below that fails when the premise stops holding. An exception with
      // nothing asserting its premise is an excuse with a comment on it.
      ['color.primary-fg', 'color.primary', 4.5],
      // The hover value is shine's own in every lane — a brand book that fixes
      // an action colour almost never defines its hover — so it is held to AA
      // rather than inheriting whatever the fill got away with. This pair had no
      // gate at all until 2026-08-11, and was missing 4.5 by 0.07 at the time.
      ['color.primary-fg', 'color.primary-hover', 4.5],
      ['color.info', 'color.bg', 4.5],
      ['color.ring', 'color.bg', 3.0],
    ],
    advisory: [['color.primary', 'color.bg']],
    assertions: [
      {
        label: 'primary-fg beats the dark alternatives on primary (APCA)',
        why: 'a light label on a brand fill is only right while it is the most legible option',
        check: (get) => {
          const bg = get('color.primary');
          const fg = Math.abs(chroma.contrastAPCA(get('color.primary-fg'), bg));
          const rivals = ['color.brand.anchor', 'color.fg'].map((id) => ({
            id,
            lc: Math.abs(chroma.contrastAPCA(get(id), bg)),
          }));
          const beaten = rivals.filter((r) => fg > r.lc);
          return {
            ok: beaten.length === rivals.length,
            detail: `primary-fg ${fg.toFixed(1)} vs ${rivals.map((r) => `${r.id} ${r.lc.toFixed(1)}`).join(', ')}`,
          };
        },
      },
    ],
  },
};

function flatten(node, path = [], out = {}) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in value) {
      out[[...path, key].join('.')] = value;
    } else if (value && typeof value === 'object') {
      flatten(value, [...path, key], out);
    }
  }
  return out;
}

function resolve(tokens, id, mode) {
  const token = tokens[id];
  if (!token) throw new Error(`unknown token ${id}`);
  let value = token.$value;
  if (mode !== '.' && token.$extensions?.mode?.[mode] !== undefined) {
    value = token.$extensions.mode[mode];
  }
  if (typeof value === 'string' && value.startsWith('{')) {
    return resolve(tokens, value.slice(1, -1), mode);
  }
  return value;
}

const toChroma = (v) => chroma.rgb(...v.components.map((c) => c * 255)).alpha(v.alpha ?? 1);

let failures = 0;
for (const [lane, { modes, gates, advisory, assertions = [] }] of Object.entries(LANES)) {
  // Read the lane that was actually BUILT. This hardcoded `src/` until a private
  // brand lane existed, at which point it would have gated the placeholder
  // palette forever and printed PASS over a palette it never opened — a gate
  // measuring a file nobody ships. config.base.mjs makes the same choice.
  const localSrc = new URL(`../local/${lane}.tokens.json`, import.meta.url);
  const src = existsSync(localSrc) ? localSrc : new URL(`../src/${lane}.tokens.json`, import.meta.url);
  if (existsSync(localSrc)) console.log(`[${lane}] gating the private lane (tokens/local/)`);
  const tokens = flatten(JSON.parse(readFileSync(src, 'utf8')));
  for (const mode of modes) {
    const label = mode === '.' ? 'default' : mode;
    for (const [fgId, bgId, min] of gates) {
      const fg = toChroma(resolve(tokens, fgId, mode));
      const bg = toChroma(resolve(tokens, bgId, mode));
      const wcag = chroma.contrast(fg, bg);
      const apca = chroma.contrastAPCA(fg, bg);
      const ok = wcag >= min;
      if (!ok) failures++;
      console.log(
        `${ok ? 'PASS' : 'FAIL'} [${lane}/${label}] ${fgId} on ${bgId}: ${wcag.toFixed(2)}:1 (gate ${min}) | APCA ${apca.toFixed(1)}`,
      );
    }
    for (const [fgId, bgId] of advisory) {
      const fg = toChroma(resolve(tokens, fgId, mode));
      const bg = toChroma(resolve(tokens, bgId, mode));
      console.log(
        `note [${lane}/${label}] ${fgId} on ${bgId}: ${chroma.contrast(fg, bg).toFixed(2)}:1 | APCA ${chroma.contrastAPCA(fg, bg).toFixed(1)} (advisory)`,
      );
    }
    // Assertions guard the premise behind a lowered gate, so a documented
    // exception cannot outlive the reason it was granted.
    for (const { label: name, why, check } of assertions) {
      const { ok, detail } = check((id) => toChroma(resolve(tokens, id, mode)));
      if (!ok) failures++;
      console.log(
        `${ok ? 'PASS' : 'FAIL'} [${lane}/${label}] ${name}: ${detail}${ok ? '' : `\n       premise broken — ${why}`}`,
      );
    }
  }
}
if (failures) {
  console.error(`\n${failures} contrast gate(s) failed.`);
  process.exit(1);
}
console.log('\nAll contrast gates pass.');
