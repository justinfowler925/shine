# Diagnose — how to find what is wrong

This is the procedure. Rules and thresholds live elsewhere; this file is the order of
operations so every fix starts from a named defect and ends with a citation.

Load this before editing UI in Build or Polish. Audit-only stops after the report;
Audit-that-fixes continues through Cite → Apply → Remeasure.

## 0. New surface? Wireframe first

If there is **no existing UI** to polish or audit (new screen/page/tool), **stop** and run
`references/wireframe.md` before this inventory. Explicit “wireframe” / “sketch” /
“low-fi” also routes there.

If a `shine-wireframe/<slug>.brief.md` exists with `Status: LOCKED`, read it and treat
structure as given — do not invent a competing IA unless the user says `unlock structure`.

## 0.5 Catalog cite required

A new page without a `templates.md` / `corpus/templates.json` id is a **Critical
completeness hole** — ranked with missing a11y, not with craft. Run
`node corpus/cite.mjs <screen|id>` and **read every file it lists** from
`~/design-corpus`. Copy structure, shine-paint. Naming an id you did not open is
inventing. A page with no template cite is incomplete, same as a table with no empty state.

No row → `inspiration.md` (add a row) then cite. Do not invent.

---

## 1. Name the surface

| Kind | Signals | First refs |
|---|---|---|
| Internal tool / cockpit / digest | Auth'd app, queues, metrics for a ritual | `adoption.md` **before** pixels |
| Product app shell | Nav, tables, forms, settings | `patterns.md`, `contracts.md` |
| Dashboard / forecast | KPIs, charts, "what needs me" | `dashboards.md`, `dataviz.md` |
| AI / agent surface | Model does work a human owns | `ai-surfaces.md` |
| Marketing / landing | Hero, CTA, persuasion | `patterns.md` (hero budget), `copy.md` |
| brand-locked | Client-facing or brand lock | `brand.md` + brand checker |
| Speaks or listens | TTS, mic, read-aloud | `voice.md` |
| Native / macOS / iOS shaped | Desktop chrome, HIG language | Apple HIG via WebFetch (not corpus) |

If two kinds apply, run the stricter first (adoption before craft; contracts before polish).

## 2. Inventory defects at three layers

Walk the live surface (browser, screenshot, or HTML artifact). Write defects into one of
three buckets — do not mix:

### A. Completeness (contracts)

- Named control below MUST (bare `<table>`, unlabeled icon button, placeholder-only label)
- Missing states: loading / empty / filtered-empty / error triad collapsed
- Hover-only actions; no keyboard path; destructive without confirm
- ASK features present without need (noise)

Ref: `contracts.md`, incomplete-primitive list in `audit.md`.

### B. Composition (relationships the per-element gate cannot see)

- **Scan order** — in 3 seconds, what do you read? Is that the job of the screen?
- **Weight budget** — one primary, few secondary, everything else tertiary. Count filled
  controls; count equal-weight peers.
- **Focal object** — dashboards need one; six equal modules is an index.
- **Chrome vs content** — nav/toolbars eating the viewport; largest region empty.
- **Section jobs** — each section one purpose, one headline, usually one supporting line.
- **Path length** — notification → committed change: where does the user invent the next step?
- **Collisions** — one token, two meanings; type steps that are not distinguishable.

Ref: `anti-patterns.md` (composition fails), `patterns.md`, `adoption.md`.

### C. Craft (tokens, type, motion, depth)

- Raw hex / off-scale spacing / ad-hoc shadow / tracking 0 on display
- Accent chroma outside OKLCH 0.13–0.24; adjacent surfaces ΔL ≥6pp
- Theme undeclared or non-switching; contrast fails
- Motion `transition: all`, layout properties animated, >300ms hover

Ref: SKILL ten rules, `taste.md`, `color-type.md`, `motion.md`, `foundations.md`.

## 3. Prioritize

1. Completeness Critical — including **a page with no template cite** (a11y blockers, data triad, wrong primary, invented layout)
2. Composition that causes wrong actions or abandonment (void, no primary, path dead-ends)
3. Adoption blockers on internal tools (no ritual, persona clone, push with nowhere to act)
4. Craft that reads as slop (chroma, Inter+tracking-0, purple gradient, equal cards)
5. Polish (density, optical alignment, micro-motion)

Never spend a pass on craft while a Critical completeness hole is open.

## 4. Cite before edit

Every material fix names a source. Acceptable citations:

| Kind | Form | Example |
|---|---|---|
| Catalog template | `templates.md` id + path | "mui-crud-dashboard — copy sidebar+header+grid, shine-paint" |
| Corpus kit pattern | path + file:line from `~/design-corpus` | `carbon/.../DataTable.tsx:120` filter chrome |
| Contract / APG | `contracts.md` or `aria-practices/content/...` | Dialog focus restore |
| Apple HIG | URL + principle name | HIG Layout → alignment |
| House rule | SKILL / foundations rule number | "Rule 8 nested radius" |
| Locked wireframe | `shine-wireframe/<slug>.brief.md` | Honour LOCKED regions/primary |

**Banned:** "tighten spacing", "make it cleaner", "more modern", threshold-only prose with
no product or kit named.

If diagnose cannot cite a catalog row, run `inspiration.md` and **add the row** before
building. Technique cites in `techniques.md` do not skip the catalog.

## 5. Apply

Map the cited **template structure** onto **shine tokens and house style**. Clone
layout regions; never clone brand pixels from Linear/Stripe/Carbon/Material.
Completeness and interaction come from kits; chroma, type curve, shadows, radii
come from shine.

Upgrade stubs to the contract ladder. Prefer one composition change over ten craft tweaks.

## 6. Remeasure

```sh
cd ~/Projects/shine && node verify/measure.mjs /abs/path/or/http-url --shot /tmp/shine-shot.png
```

Hard fails block. Notes do not. Report catalog id, `--shot` path, and before/after
numbers for every Critical/Major you claimed to fix. Fail the build if the screenshot
is not derived from the cited template (missing regions, invented equal-card hero,
competing primaries the template does not have).

## Quick defect → next file

| You see… | Open |
|---|---|
| No UI yet / need a sketch | `wireframe.md` + `templates.md` |
| Invented page / no catalog id | `templates.md` — pick a row; do not draw |
| Nobody will open this | `adoption.md` |
| Table/form missing states | `contracts.md` |
| Wrong hierarchy / equal peers | `techniques.md` §Hierarchy, `kits.md` |
| Numbers undecidable | `dashboards.md` |
| Chart encoding smell | `dataviz.md` |
| AI chat as default shell | `ai-surfaces.md` |
| Words don't persuade | `copy.md` |
| Raw values / tokens | foundations + color-type |
| Need a library API | `corpus.md` then `rg` |
| Novel pattern, no cite | `inspiration.md` protocol |
