# Clearspeed / Nucleus profile

Use this profile whenever the host product is **Nucleus** (Clearspeed Operate UI) or
another Clearspeed application shell. It overlays the base Shine skill — never a
separate design system.

## What Nucleus is

- Product UI at `justin-fowler_cspd/nucleus` · live `https://nucleus-clearspeed.vercel.app`
- Shine attaches as a **Company Tools** package (`distribution.json` → `consumers.nucleus`)
- House kit: **shadcn / Tailwind** + living TanStack DataGrid — not Mantine/HeroUI
- Default lane: **`saas`** (or `internal` for dense cockpits). Marketing DNA is wrong here.
- Brand accent: **Signal Orange `#ED5925`** (hover `#D24A1B`) from `brand.json` in this
  profile — the edition materializes brand tokens; never use placeholder indigo.

## Attach path (repeatable)

1. Open the Nucleus checkout (or use the golden fixture when checkout is absent).
2. Load this Clearspeed edition profile with the Shine skill.
3. Run a bounded packet against the surface:

```sh
node core/design-packet.mjs \
  --job "Company Tools catalog: find and install a package" \
  --lane saas --mode existing|audit \
  --category catalog \
  --project /path/to/nucleus
```

4. Prefer `--product-reference` when Nucleus already owns the object (DataGrid,
   RecordDialog, Admin Adoption KPI+collapsed table). Sibling inventory wins over
   catalog fashion.
5. Contracts live next to the surface (`shine-usability.json`, `shine-layout.json`,
   `shine-tables.json`, diagnosis). Operate completion requires fresh `prove.mjs`
   (mandatory prove) — compare alone does not clear stop-sweep.

### Local consumer map

Copy `consumers.example` → `consumers.local` and point a row at the Nucleus token
vendor path when you want `npm run sync-consumers` / `measure-consumers` on Justin's
machine. This VM often has no `consumers.local`; doctor notes consumers unconfigured.

### Golden fixture (no checkout required)

`verify/fixtures/nucleus-golden/`:

| File | Role |
|---|---|
| `before.html` | Seeded bloat: dual filled CTAs + equal KPI cards + filler empty copy |
| `after.html` | Expert pass: one primary, catalog focal, reversible search, real empty copy |
| `README.md` | Scripted audit → diagnosis → prove path |

Run `node verify/nucleus-golden.test.mjs` for fail→pass measure bites (logs, not twin
full-page screenshots).

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
