# Clearspeed / Nucleus profile

Use this profile whenever the host product is **Nucleus** (Clearspeed Operate UI) or
another Clearspeed application shell. It overlays the base Shine skill — never a
separate design system.

## What Nucleus is

- Product UI at `justin-fowler_cspd/nucleus` · live `https://nucleus-clearspeed.vercel.app`
- Shine attaches as a **Company Tools** package (`distribution.json` → `consumers.nucleus`)
- **Cite gold standard:** Flowbite / TailAdmin / Untitled (Tailwind SaaS density) —
  `knowledge/editions/clearspeed-operate/gold-standard.json`. Not HeroUI/M3 landfill.
  `node corpus/cite.mjs --edition clearspeed-operate "<job>"` must return those packs.
- Build kit: **shadcn / Tailwind** + living TanStack DataGrid (port structure from TW gold;
  paint with Clearspeed brand). Not Mantine/HeroUI as Operate primary.
- Default lane: **`saas`** (or `internal` for dense cockpits). Marketing DNA is wrong here.
- Brand accent: **Signal Orange `#ED5925`** (hover `#D24A1B`) from `brand.json` in this
  profile — the edition materializes brand tokens; never use placeholder indigo.

## Attach path (repeatable)

1. Open the Nucleus checkout (or use the golden fixture when checkout is absent).
2. Load this Clearspeed edition profile with the Shine skill.
3. **Redesign / denoise an Operate queue** (default): cite → measure → denoise-loop → prove.
   Edition `clearspeed-operate`; sibling cites before catalog. Do not open an audit pack.

```sh
node corpus/cite.mjs --edition clearspeed-operate \
  "Decide Pursue/Review/Dismiss on the next notice"
# → Template: tailadmin-tables (TW gold) + Clearspeed brand paint
node core/edition-siblings.mjs resolve \
  --category queue --job "Decide Pursue/Review/Dismiss on the next notice"
# → preferredCite tailadmin-tables
node verify/measure.mjs <artifact.html> --cite tailadmin-tables --lane saas
# accordion-under-lead + detached-overflow must FAIL until silhouette matches
node verify/denoise-loop.mjs \
  --html <artifact.html> [--tsx src/components/revops/SledCapture.tsx] \
  --cite tailadmin-tables --edition clearspeed-operate \
  --category queue --job "Decide Pursue/Review/Dismiss on the next notice" \
  --out /tmp/shine-operate-denoise --prove
```

   See `docs/operate-redesign.md` · `skill/references/denoise.md`.

4. **Net-new / audit-only / non-queue** — bounded packet:

```sh
node core/design-packet.mjs \
  --job "Company Tools catalog: find and install a package" \
  --lane saas --mode existing|audit \
  --category catalog \
  --project /path/to/nucleus
```

5. Prefer `--product-reference` when Nucleus already owns the object (DataGrid,
   RecordDialog, Admin Adoption KPI+collapsed table). Sibling inventory wins over
   catalog fashion.
6. Contracts live next to the surface (`shine-usability.json`, `shine-layout.json`,
   `shine-tables.json`, diagnosis). Operate completion requires fresh `prove.mjs`
   (mandatory prove) — compare alone does not clear stop-sweep.

### Local consumer map

Copy `consumers.example` → `consumers.local` and point a row at the Nucleus token
vendor path when you want `npm run sync-consumers` / `measure-consumers` on Justin's
machine. This VM often has no `consumers.local`; doctor notes consumers unconfigured.

### `@shadcn/lint` (Nucleus CI)

Primary Tailwind design-system lint for Operate components. Recipe + Clearspeed
token map: `skill/references/clearspeed/shadcn-lint.md`. Install
`@shadcn/lint@0.2.0` in Nucleus; warn on `src/components/**`; do not triple-stack
Oxlint/Biome TW plugins. Changed-line `ui:clearspeed` remains the hex/font/motion
diff gate — not a second TW DS linter.

### Golden fixture (no checkout required)

`verify/fixtures/nucleus-golden/`:

| File | Role |
|---|---|
| `before.html` | Seeded bloat: dual filled CTAs + equal KPI cards + filler empty copy |
| `after.html` | Expert pass: one primary, catalog focal, reversible search, real empty copy |
| `shine-usability.json` | Operable search → install |
| `README.md` | Scripted audit → diagnosis → prove path |

Run `node verify/nucleus-golden.test.mjs` for fail→pass measure + usability bites (logs, not twin
full-page screenshots).

### Real-surface substitute (SLED Capture, no SSO)

When Nucleus checkout/SSO is unavailable, use `verify/fixtures/sled-capture-prove/`
(distilled from the Project sled dump). Run `node verify/sled-capture-prove.test.mjs`.
Do not invent Workspace auth bypasses.

## Operate constitution (numbered — critic must cite)

SaaS / denoise packets emit `ddr.constitutionIds` from
`knowledge/constitutions/clearspeed-operate.json` (n=1…7: `cta-pressure` …
`restructure-before-repaint`). Critic partial/blocked turns must cite ≥1 id or
number. Prove completion receipts stamp the same catalog ids; edition verify
fails if a DDR omits any — see `docs/operate-constitution.md`.

## Diagnosis order (hard)

1. Primary job reachable in ~3s (`primaryTaskCheck`)
2. Competing CTAs (`competingCtaCheck` + CTA pressure machine)
3. Empty / error / filtered-empty triad
4. Composition (card soup, density, wrong cite silhouette)
5. Craft last — never polish a broken job

If the highest severity is usability or completeness, polish/craft PRs are out of order.
Restructure (regions / IA / cite / contracts) before repaint.

## Product owners to prefer

- Nucleus DataGrid / table-summary patterns (not a parallel grid)
- Company Tools catalog category (`catalog`, not `datagrid`) — lesson from
  `docs/audits/2026-09-16-nucleus-company-tools.md`
- Admin Adoption: KPI strip with a collapsed table focal, not six equal cards

## Edition sibling map (cite + kit)

Machine map: `knowledge/editions/clearspeed-operate/siblings.json` (enterprise §4).
Resolve with `node core/edition-siblings.mjs resolve --category queue --job "…"`.
SaaS packets attach `editionSibling` + `ddr.productSibling`; recommend with
`edition=clearspeed-operate` prefers sibling kit / cite over catalog fashion.
When cite/kit resolves via the map, repertoire `siblingPrefs` (doctor-gated learn)
boost that sibling on the next packet — `npm run learn -- sibling-prefs`.
See `docs/edition-siblings.md` · `docs/repertoire-learn.md`.
