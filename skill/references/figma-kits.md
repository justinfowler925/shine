# Figma kits → Shine structure cites (brand-agnostic)

Stop inventing accordion landfill. Justin's Figma libraries + full-kit ingest packs
already cover buttons, forms, queues, nav, and overlays. **Cite the pack shot +
blueprint; paint with the house kit** (shadcn/Tailwind). Foreign runtimes (HeroUI
build, Material chrome, Bootstrap CSS) stay out of consumers — see
`docs/no-foreign-runtimes.md`.

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
All component/Theme/Brand/Icons Example frames land as `figma-heroui-*` packs
(**46**, referenceHealth-stamped, cite-selectable). Alt `DC4g36…` optional.

Full-kit ingest (not silhouette samples) — packs on tip:

| Kit | fileKey | Before | After | Inventory note |
|---|---|---:|---:|---|
| HeroUI | `GAn1Srb…` | 46 thin | **46** health-pass | 38 pages via use_figma |
| Material 3 | `f4TUS9…` | 38 retired | **38** selectable | 3 pages / 38 boards |
| TailGrids | `DUN5Dvd…` | 4 | **83** | Full ingest; cite-selectable structure packs |
| Myna | `4SbNh8…` | 1 | **102** | App + marketing boards (404 Block intentional) |
| Bootstrap 5 | `p8B6SU…` | 3 | **40** | Full ingest; structure-only |

Explicit kit jobs (`heroui-figma`, `material-figma`, `tailwind-figma` / `tailgrids` /
`myna`, `bootstrap-figma`) prefer that family's `figma-*` packs. Clearspeed Operate
edition still prefers TW gold (Flowbite/TailAdmin/Untitled).

## Job → cite (do not freestyle)

**Clearspeed Operate gold:** Flowbite / TailAdmin / Untitled — see
`knowledge/editions/clearspeed-operate/gold-standard.json`. Cite with
`--edition clearspeed-operate`. HeroUI/M3 secondary only.

| Job | Cite (Clearspeed TW gold) | Example |
|---|---|---|
| Decide / worklist | `tailadmin-tables` | pack shot + operate worklist-first rules |
| Generic triage grid | `untitled-table` / `flowbite-users` | same table density |
| Form create/edit | `tailadmin-form-elements` | `figma-kit-silhouettes/form-stack.html` |
| Settings | `flowbite-settings` | section nav + Form MUST |
| App shell | `untitled-sidebar-navigation` | `figma-kit-silhouettes/app-shell.html` |
| Admin dashboard | `flowbite-dashboard` | TW gold — not HeroUI landfill |
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
