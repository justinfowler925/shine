import { existsSync } from 'node:fs';
import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwindBridge from './plugins/tailwind-bridge.mjs';
import artifact from './plugins/artifact.mjs';
import python from './plugins/python.mjs';
import sitecss from './plugins/sitecss.mjs';
import email from './plugins/email.mjs';
import gdocs from './plugins/gdocs.mjs';
import office from './plugins/office.mjs';
import salesforce from './plugins/salesforce.mjs';

// Raw layer is prefixed --shine-* so the Tailwind bridge can map
// --color-bg -> var(--shine-color-bg) without self-reference.
// NB: plugin-css@2.5.0 passes a token *object* (README shows a string — stale)
// and expects the full name including the -- prefix.
export const variableName = (idOrToken) =>
  `--shine-${(typeof idOrToken === 'string' ? idOrToken : idOrToken.id).replace(/\./g, '-')}`;

export const LANES = {
  personal: {
    modes: [{ mode: 'light', selectors: ['[data-theme="light"]'] }],
    modeAttr: 'light',
  },
  brand: {
    modes: [],
    modeAttr: null,
  },
};

export function makeConfig(lane, { outDir } = {}) {
  const { modes, modeAttr } = LANES[lane];
  const plugins = [
    css({
      filename: 'tokens.css',
      variableName,
      ...(modes.length ? { modeSelectors: modes } : {}),
    }),
    tailwindBridge({ filename: 'theme.css', lane, modeAttr }),
    artifact({ filename: 'artifact.css', lane, modes }),
    python({ filename: 'tokens.py', lane, modes }),
    email({ jsonFile: 'email.json', htmlFile: 'email.html', lane }),
    gdocs({ filename: 'docs.gs', lane }),
  ];
  if (lane === 'brand') {
    // Constrained-renderer targets: brand writers + the Salesforce spec.
    plugins.push(
      office({ filename: 'office.json', lane }),
      salesforce({
        mdFile: 'salesforce.md',
        cssFile: 'salesforce.css',
        jsonFile: 'salesforce.json',
        lane,
        seedToken: 'color.primary',
      }),
    );
  }
  if (lane === 'personal') {
    // personal-site emit: canonical vars + legacy alias names for migrated sites.
    plugins.push(
      sitecss({
        filename: 'personal-site.css',
        aliases: {
          ink: 'color.stone.950',
          'ink-2': 'color.stone.900',
          'ink-3': 'color.stone.800',
          'ink-4': 'color.stone.700',
          paper: 'color.stone.50',
          'paper-2': 'color.stone.200',
          mute: 'color.stone.500',
          'mute-2': 'color.stone.600',
          accent: 'color.ember.400',
          'accent-2': 'color.ember.300',
          'accent-3': 'color.ember.600',
          'accent-soft': 'color.ember.soft',
          'accent-line': 'color.ember.line',
          crit: 'color.status.crit',
          warn: 'color.status.warn',
          ok: 'color.status.ok',
          hair: 'color.stone.800',
          serif: 'font.serif',
          sans: 'font.sans',
          mono: 'font.mono',
        },
      }),
    );
  }
  // A private palette built through SHINE_BRAND_OVERRIDE lands in `local/`,
  // which is gitignored, and its build output goes with it. Prefer it silently
  // when it exists so one `npm run build` serves both the public placeholder
  // lane and a real brand without a flag to remember — and so a real palette can
  // never be written into the tracked tree. See gen-source.mjs's write phase.
  const localSrc = new URL(`./local/${lane}.tokens.json`, import.meta.url);
  const private_ = existsSync(localSrc);
  return defineConfig({
    tokens: [private_ ? `./local/${lane}.tokens.json` : `./src/${lane}.tokens.json`],
    outDir: outDir ?? (private_ ? `./local/dist/${lane}/` : `./dist/${lane}/`),
    plugins,
  });
}
