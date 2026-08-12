# @shine/tokens

One DTCG source → nine emit targets across two lanes. The token layer SHINE's
README calls "the only step that blocks anything downstream."

## Layout

```
src/*.tokens.json      DTCG 2025.10 sources — personal + brand lanes
scripts/gen-source.mjs regenerates src/ from the palette spec (rarely needed)
config.base.mjs        lane config factory; --shine-* variable naming
plugins/               custom emitters (tailwind bridge, artifact, python, sitecss)
scripts/               contrast gate, propagation verify, site migration + diff
dist/<lane>/           committed build output
```

## Targets

| File | Target | Notes |
|---|---|---|
| `tokens.css` | CSS custom properties | `--shine-*`; light mode via `[data-theme="light"]` (personal is dark-first) |
| `theme.css` | Tailwind v4 | `@theme { --color-*: initial }` wipe + `@theme inline` var() bridge |
| `artifact.css` | CSP-locked artifacts | self-contained literals, paste into `<style>` |
| `tokens.py` | Python constants | aliases resolved to hex/rgba literals |
| `personal-site.css` | personal lane site emit | canonical layer + legacy `--ink`/`--paper`/… aliases |
| `email.json` + `email.html` | Email | literal inliner map + bulletproof 600px table starter; the plugin asserts zero `var()`, zero custom props, zero flex/grid |
| `docs.gs` | Google Docs | Apps Script applying token attributes to the named styles (TITLE, HEADING1–3, NORMAL). Fonts + colors only — the lanes carry no type-scale tokens, and inventing one in an emitter would paper over a token gap |
| `office.json` | Office writers (brand only) | OOXML theme slots (dk1/lt1/dk2/lt2/accent/hlink) + full literal map — the seam the docx/pptx/xlsx brand writers read instead of hardcoded hexes |
| `salesforce.md` / `.css` / `.json` | Salesforce (brand only) | brand-palette spec an admin transcribes (SLDS 2 has no org-wide CSS injection point) + `:host` fallback block for owned LWCs. Authority is `@salesforce-ux/design-tokens` flat.json: the 17 `--slds-r-color-brand-*` steps keep Cosmos's OKLCH lightness ladder, re-seeded from `color.primary`; 23 derived g-hooks resolved from the authority file's own `var()` chains |

## Private brand lanes

**The committed `brand` lane is placeholder values on purpose.** It is the shape of
a brand-locked lane — light-only, no invented status colors, accent used for action
only — and it is nobody's actual brand. A real palette never enters this tree:

```sh
cp tokens/brand.local.example.json ~/private/brand.json   # fill in real values
SHINE_BRAND_OVERRIDE=~/private/brand.json node tokens/scripts/gen-source.mjs
npm run build
```

The override deep-merges over the placeholder lane and writes to `tokens/local/`
(gitignored). `config.base.mjs` then prefers `local/<lane>.tokens.json` and emits to
`local/dist/<lane>/` automatically, so `npm run build` serves both the public lane and
a private brand with no flag to remember. `sync-consumers` prefers `local/dist` when
it exists.

The guard is the point: **there is no code path that writes a real brand palette into
`src/` or `dist/`.** It does not depend on anyone remembering the rule at commit time.

Distributing a private lane to teammates means shipping three small files — the palette
JSON, a brand-specific twin of `skill/references/brand.md`, and the built
`artifact.css` — not a fork of this repo. A fork goes stale the week you make it.

## Commands

```
npm run build     # both lanes + WCAG AA contrast gate (APCA advisory)
npm run verify    # mutate one token -> assert all 7 personal-lane targets change, by computed values (email.html is rendered, not grepped)
npm run sitediff  # screenshot-diff two site checkouts, per page
```

`verify` and `sitediff` resolve Playwright/sharp via `verify/deps.mjs` (shine root
`npm install` first; sibling checkout is fallback only).
— zero new browser deps here.

## Verified findings (2026-08-05)

- `@terrazzo/plugin-tailwind@2.5.0` substitutes **literal** values into a `@tz`
  template — it cannot emit a runtime-switchable theme. Hence the custom
  `plugins/tailwind-bridge.mjs` (`@theme inline` + `var()` refs).
- `@terrazzo/plugin-css@2.5.0`'s `variableName` receives a token **object** and
  must return the full `--`-prefixed name; the README showing `(id) => …` is stale.
- Emitted `rgb(% % %)` round-trips to the exact source hex at 8-bit — proven by
  computed values and by pixel-diffing all 15 site pages.
- Two harness artifacts to remember: `page.setContent` pages live on
  `about:blank` and silently can't load `file://` stylesheets (probe real
  `file://` pages); and a page that renders `location.href` diffs across
  screenshot servers on different ports (serve both sides on the same port).
