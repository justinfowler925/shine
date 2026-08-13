# Inspiration & Research

Visual identity always starts from the **template catalog** (`templates.md` /
`corpus/templates.json`). Technique cites in `techniques.md` are for craft
(tracking, elevation, chroma). They do not skip the catalog and they do not
authorize inventing a page.

## When research is required

Run this protocol when **any** of these is true:

1. No catalog row covers this screen type — **add a row** before building.
2. The cited template is query-only (screenshot/URL) and you need a second
   example to lock regions.
3. The user explicitly asks for inspiration or competitive UI research.

Do **not** skip galleries because a Linear/Vercel technique cite exists. That
cite is paint. Structure still comes from a catalog id.

## Platform map

| Source | Use for | Do not use for |
|---|---|---|
| **`templates.md` catalog** | Default start-from for every new page | Skipping it |
| **Query-only previews** (`~/design-corpus/query-only/`) | Layout ideas from paid stores | Copying source you do not own |
| **Untitled UI / Plus UI** | Visual grammar, density, variant matrices | Interaction SSOT (pair with contracts) |
| **Mobbin / Refero / SaaSFrame** | Real product flows | Blind visual copy |
| **Land-book / SaaS Landing Page** | Marketing heroes, pricing, CTA bands | App DataGrid behavior |
| **Awwwards / Godly** | Motion/craft ceiling, distinctive marketing | Default product chrome |
| **Dribbble / Behance** | Mood exploration | Completeness, a11y, states |
| **Corpus vendor docs** | Behavior and API completeness | Pixel brand |
| **Apple HIG** (WebFetch only) | Native layout and interaction | Web component APIs |
| **shadcn/ui + TanStack** | Implementation recipes | Thin demos without contracts |

## Research protocol (missing catalog row)

1. Name the **screen type**.
2. Find 2–3 real pages (catalog kit, query-only preview, or one gallery).
3. Extract **regions** (nav, header, focal, primary) — do not clone styling.
4. Add a row to `corpus/templates.json` via `index-templates.mjs` (or a
   query-only screenshot) so the next session can cite it.
5. Cite the new id; copy structure; shine-paint; remeasure with `--shot`.

## Completeness still wins

A beautiful Dribbble table missing sort, filter, pagination, and empty states
**fails** this skill. Upgrade the pattern to the contract ladder before shipping.

## Paywalls

Mobbin and store templates are subscription-gated. Do not block on access —
fall back to SPDX-clean catalog rows (MUI free templates, shadcn blocks) plus
query-only screenshots. Never copy paid source without an Atlas-owned license.
