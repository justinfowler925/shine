# Figma kits → Shine silhouettes (brand-agnostic)

Stop inventing accordion landfill. Justin's Figma libraries + Studio design-corpus
already solved buttons, forms, queues, nav, and overlays. **Steal structure; paint
with the house kit** (shadcn/Tailwind). Foreign runtimes (HeroUI build, Material
chrome, Bootstrap CSS) stay out of consumers — see `docs/no-foreign-runtimes.md`.

SSOT inventory + library keys: `knowledge/kits/figma-library-map.json`.

## Before Wireframe→Build

1. Open the kit map. Match the job to a `silhouetteMap` row.
2. Lock the brief to `preferCite` (not a dashboard atom, not a chart pack).
3. Open the matching example under `corpus/blueprints/figma-kit-silhouettes/`.
4. Confirm kit behavior with corpus `file:line` / Figma primitive names in the map.
5. Build. Measure must stay green on `accordion-under-lead`, `detached-overflow`,
   `kpi-soup`, `card-soup`, and `kit-silhouette-bypass`.

## What is subscribed on Clearspeed Product Team

| Library | Key (prefix) | Steal for |
|---|---|---|
| Clearspeed Design System | `lk-04d3…` | CTAs — one filled primary |
| UI Prep Data Tables | `lk-aa3b…` | Worklist columns, sort, attached More |
| Simple Design System | `lk-e0ff…` | Buttons, fields, table, sidebar, dialog, tabs |
| Material 3 (team + community) | `lk-0ed4…` / `lk-5a31…` | Nav rail / dialog anatomy only |
| iOS 18 | `lk-df32…` | Native only — not Operate |

Named by Justin but **not** published as team libraries: HeroUI, original Tailwind,
Bootstrap. **MUI / Material** is subscribed (Material 3 libraryKeys + team file
`f4TUS9BWk2rSH8Dqrp5Mon`) — Justin’s “Minor UI” was a mishear for MUI; do not hunt
Minimals/MiniKIT. Design fileKeys + harvest packs live in the kit map
(`designFiles`, `figma-harvest-packs.json`, `corpusProxy`). Closest subscribed
stand-in for Tailwind/HeroUI gallery density: **Simple Design System**.

HeroUI prefer-copy `GAn1SrbKJYiKqz9SmHHCRm` is the full 38-page kit (use_figma
`figma.root.children`; MCP get_metadata without nodeId falsely shows Welcome+Icons).
All component/Theme/Brand/Icons Example frames land as `figma-heroui-*` packs.
Alt `DC4g36…` is an optional duplicate. Tailwind/Bootstrap/M3 Justin copies:
TailGrids `DUN5Dvd…`, Myna `4SbNh8…`, Bootstrap `p8B6SU…`, Material 3 `f4TUS9…`.

## Job → cite (do not freestyle)

| Job | Cite | Example |
|---|---|---|
| Decide / worklist | `shadcn-operate-decide` | `figma-kit-silhouettes/worklist.html` |
| Generic triage grid | `shadcn-queue` | same worklist, drop Decision column |
| Form create/edit | `shadcn-form` | `figma-kit-silhouettes/form-stack.html` |
| Settings | `shadcn-settings` | form-stack + section nav |
| App shell | `shadcn-sidebar-07` | `figma-kit-silhouettes/app-shell.html` |
| Admin dashboard (non-Operate) | `flowbite-dashboard` | Flowbite pack — not decide path |
| Overlay | kits.md Dialog recipe | SDS Dialog max-width 600 |

## Primitive completeness (from SDS + UI Prep)

Copy these states into house components — do not invent half-widgets:

- **Button** — default / danger / icon / group; one filled peer in a cluster
- **Fields** — Input, Select, Textarea, Checkbox, Radio, Switch, Search, Date; label + helper + error
- **Table** — header sort, checkbox column, row More attached to the action cell
- **Nav** — Sidebar + pill/button lists with active state
- **Overlay** — Dialog + Dialog Body; scrim; primary + secondary; destructive separate

## Anti-patterns (machine + critic)

- `kit-silhouette-bypass` — freestyle page when the map already names a cite
- `accordion-under-lead` — encyclopedia dump under Summary lead
- `detached-overflow` — floating More away from Pursue
- `kpi-soup` / `card-soup` — equal card walls instead of worklist-first

## Do not

- Publish a second design system into Nucleus because a Figma kit looks pretty
- Cite Material / HeroUI / Bootstrap as build targets
- Ask Justin for a URL when `get_libraries` + this map already cover the plan
- Expand Nucleus SLED churn under this import
