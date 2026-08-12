import { cssTransforms, HEADER } from './lib.mjs';

// Tailwind v4 theme bridge. Two non-negotiables from the SHINE spec:
//   1. `@theme { --color-*: initial; }` wipes Tailwind's default palette —
//      there is no off-system color to reach for.
//   2. The bridge is `@theme inline` with var() references to the raw
//      --shine-* layer, so runtime mode switching works. (Verified 2026-08-05:
//      @terrazzo/plugin-tailwind substitutes *literal* values into a @tz
//      template, which cannot switch at runtime — hence this custom plugin.)
const NAMESPACE = [
  { prefix: 'color.', tw: '--color-' },
  { prefix: 'font.', tw: '--font-' },
  { prefix: 'radius.', tw: '--radius-' },
  { prefix: 'space.', tw: '--spacing-' },
  { prefix: 'easing.', tw: '--ease-' },
  { prefix: 'text.', tw: '--text-' },
  { prefix: 'leading.', tw: '--leading-' },
  { prefix: 'tracking.', tw: '--tracking-' },
  { prefix: 'shadow.', tw: '--shadow-' },
];

// Namespaces whose Tailwind defaults are wiped, so there is no off-system value
// to reach for. Type joined color once type tokens existed (2026-08-08): leaving
// Tailwind's own scale in place would have kept `text-4xl` reachable and silently
// off-system, which is how five surfaces ended up with five type scales.
//
// Shadow and tracking joined on 2026-08-09 with their tokens. Tailwind's own
// `shadow-lg` is the exact value Rule 6 names as the counter-example — 10% alpha
// on both layers, no negative spread — so leaving it reachable would have
// shipped the anti-pattern under a token-shaped name.
const WIPED = ['--color-*', '--text-*', '--tracking-*', '--shadow-*'];

export default function tailwindBridge({ filename, lane, modeAttr }) {
  return {
    name: 'shine:tailwind-bridge',
    enforce: 'post',
    async build({ getTransforms, outputFile }) {
      const lines = [];
      for (const t of cssTransforms(getTransforms)) {
        const ns = NAMESPACE.find((n) => t.id.startsWith(n.prefix));
        if (!ns) continue; // durations stay reachable as raw --shine-* vars
        const rest = t.id.slice(ns.prefix.length).replace(/\./g, '-');
        lines.push(`  ${ns.tw}${rest}: var(${t.localID});`);
      }
      const variant = modeAttr
        ? `\n@custom-variant ${modeAttr} (&:where([data-theme="${modeAttr}"], [data-theme="${modeAttr}"] *));\n`
        : '';
      outputFile(
        filename,
        `${HEADER(`@shine/${lane} — Tailwind v4 theme`)}
@import './tokens.css';

@theme {
${WIPED.map((w) => `  ${w}: initial;`).join('\n')}
}

@theme inline {
${lines.join('\n')}
}
${variant}`,
      );
    },
  };
}
