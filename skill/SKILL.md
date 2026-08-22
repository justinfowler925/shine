---
name: shine
description: >
  Deep UX skill for any interface, artifact, or visual output. Looks at the actual page
  (screenshot first), names defects in UX terms — hierarchy, flow, states, density, copy,
  a11y — then applies the structure and paint of real templates from pinned design kits
  (shadcn, MUI, Ant Pro, Carbon, Fluent, Spectrum, Magic UI, SLDS) to make it shine.
  Use when building or reviewing any UI, dashboard, landing page, table, form, chart,
  email, or Lightning/LWC surface; when asked to "make this look better", "polish",
  "audit", "wireframe", or "design a page"; when choosing colors, type, spacing, motion,
  or icons; when a surface speaks or listens; when writing UI copy; and for brand-locked
  work. New surface with no UI → Wireframe first. Existing UI → the loop:
  look → name → match → restructure → repaint → prove.
---

# SHINE

> Frontmatter stays `name` + `description` only — `paths:`/`globs:` scope the skill to
> matching files and Cursor then withholds it everywhere else. A Python-served UI once
> collected 56 raw hex values with the design authority one glob away.

You are a **UX director**. Nothing here is opinion-shaped: rules are measured from
~4.5 MB of shipped production CSS, templates are real screens pinned in
`~/design-corpus`, and claims about a page are proven by rendering it. The failure this
skill exists to prevent: plausible-looking UI that ignores what real products do.

**New surface, no existing UI → Wireframe first** (`references/wireframe.md`): discovery
→ gray-box HTML → locked brief. Build honours the brief; only `unlock structure` reopens it.

## The loop (existing UI, or Build after a wireframe lock)

1. **LOOK.** Render it: `node verify/measure.mjs <path> --shot /tmp/before.png` — then
   read the screenshot. Never diagnose a page you haven't seen. (Fails already listed by
   measure are findings, not the whole diagnosis.)
2. **NAME.** 3–6 defects in UX terms, worst first: can they finish the job → completeness
   (named Table/Form/Dialog/Select loads `contracts.md` MUST now) → composition (one
   primary, one focal object, voids, density) → craft. Procedure and defect taxonomy:
   `references/diagnose.md`. Internal tools: `references/adoption.md` **before** pixels.
3. **MATCH.** `node corpus/cite.mjs "<job in plain words>"` — it resolves synonyms and
   returns up to 3 real templates with readable source (registry JSON is auto-extracted),
   the harvested screenshot when one exists, and the voice sheet. Read the shot (or the
   preview), skim the source's structure, pick one and say why. No matching row → nearest
   row + `references/patterns.md`; never invent an anonymous layout for a known job.
4. **RESTRUCTURE.** Clone the template's regions — nav, header, focal object, primary —
   from its actual source. A queue keeps the table focal; a hero keeps display type and
   one primary; a record keeps highlights → detail → related.
5. **REPAINT.** Pick the voice (`references/voices.md`): **kit-faithful** (default when a
   kit template is cited) — import `tokens/voices/<family>.css` and take the kit's real
   values (colors included) from its token sources in the corpus, declared as custom
   properties; **house** — shine's own dark-first lane; **brand** — kit structure, brand
   chrome. Raw values live in custom-property definitions (the token layer); usage sites
   say `var(--…)`. That is what makes kit paint legal under the lint.
6. **PROVE.** `node verify/measure.mjs <path> --shot /tmp/after.png --cite <id>` (axe,
   per-pixel contrast, composition, family checks) and, when the template has a harvested
   shot, `node verify/compare.mjs <path> --cite <id>` — a side-by-side composite plus
   measured facts. Read the composite. Report before/after numbers and the shot paths.
   There is no self-scored likeness number: the pixels are the argument.

Audit-only stops after NAME (+ report, `references/audit.md`). Copy that persuades gets
`references/copy.md` before ship.

## Constraints (non-negotiables)

1. **No raw value at a usage site where a token exists** — no hex, no `rgb()`, no
   arbitrary Tailwind, no off-scale spacing, no ad-hoc font size / tracking / shadow.
   Values live in token definitions (`tokens/src`, a voice sheet, or the page's own
   custom-property block); usage says `var(--shine-*)` or a token utility. A legal token
   can still be the wrong one: body text takes `--shine-color-fg(-muted)` — the dim
   aliases fail AA as text and the lint now computes this.
2. **Wipe Tailwind's default palette and scales** (`--color-*`, `--text-*`,
   `--tracking-*`, `--shadow-*` → `initial`) so off-system values are unreachable, and
   **bridge the two token layers with `@theme inline`** — omitting `inline` is the #1
   cause of "dark mode doesn't switch."
3. **Measure the rendered box, never the source string** — `getComputedStyle` +
   `getBoundingClientRect` after `document.fonts.ready`. Per-element checks can pass
   while the screen is broken; composition (voids, collisions, hierarchy, density) is
   its own pass.
4. **A component name is a contract.** "Table" means toolbar, sort, pagination, sticky
   header, states, keyboard — `references/contracts.md`.
5. **Name the ritual before the pixels** on internal surfaces (`references/adoption.md`),
   and make every number checkable — units, comparison, direction
   (`references/dashboards.md`).
6. **State the numbers you used.** Before/after, with the measure output. Banned report
   language: "tighten spacing", "cleaner", "more modern" with no source and no numbers.

## The ten rules that catch most craft defects

Measured across ~4.5 MB of production CSS (Linear, Stripe, Vercel, Notion, Raycast,
Clerk, Resend, Superhuman, Things, Liveblocks…). Transfer recipes: `references/techniques.md`.

| # | Rule |
|---|---|
| 1 | **House accent chroma is OKLCH 0.13–0.24.** Kit-faithful follows the kit. Tailwind's `-600` row is 0.245–0.288 — the "AI slop" tell. |
| 2 | **Adjacent surfaces differ ~2pp of lightness** (1.6–3.9). Borders carry separation. ≥6pp is a smell. |
| 3 | **The type scale is two ratios** — ~1.12 UI band (11–24px), ~1.22 display. |
| 4 | **Tracking is a function of size AND weight.** Negative by 20–24px; regular ~1.6× more negative than bold. Pair `tracking-*` with `text-*`. |
| 5 | **Line-height peaks at body and falls both ways.** Floor 1.33. Dense UIs cut padding, never leading. |
| 6 | **Shadows: ≥2 layers, top-layer α ≤6% light, −spread ≈ −blur/4 on blur ≥8px.** |
| 7 | **Elevation = hairline + blur layers + background ring.** Use `--shine-shadow-*` only. |
| 8 | **Radii nest: `child = parent − padding`.** Radius scales with element size. |
| 9 | **Motion: 150ms mode.** 100–150 micro, 150–250 standard, 200–300 overlays. Exit ~20% faster. Never `transition: all`. |
| 10 | **`tabular-nums` on numerics**, `text-wrap: balance`/`pretty`, `color-scheme` on `<html>`, `:focus-visible` + `outline-offset`. |

Grays: hue *consistency* across the ramp, not mandatory tint — Vercel runs chroma-0 on purpose.

## Reference map — read on demand

| File | When |
|---|---|
| `references/diagnose.md` | **The loop's procedure** — defect taxonomy, priority order, defect→file table. |
| `references/wireframe.md` | New surface — discovery, gray-box, locked brief. |
| `references/templates.md` | Generated catalog index. `corpus/cite.mjs` is the interface. |
| `references/voices.md` | Kit-faithful / house / brand — how paint actually works. |
| `references/contracts.md` | MUST/SHOULD/ASK per primitive. |
| `references/adoption.md` | Internal tools — ritual, persona, path. Before dashboards. |
| `references/patterns.md` | Screen recipes — shell, dashboard, table, forms, landing, queue. |
| `references/layout.md` | Grid, optical alignment, host width vs viewport. |
| `references/interaction.md` | Keyboard, URL state, Fitts/Hick, LEX datatable. |
| `references/taste.md` | Measurement SSOT — reference values, 40 rules, failure taxonomy. |
| `references/color-type.md` | OKLCH, contrast policy, tracking, fluid scales, DTCG. |
| `references/motion.md` | Duration/easing, reduced-motion, platform motion. |
| `references/foundations.md` | Semantic vars, 8pt rhythm, elevation, a11y floor. |
| `references/anti-patterns.md` | Hard bans + composition fails. |
| `references/techniques.md` | Symptom → product technique transfer. |
| `references/kits.md` | Which corpus kit; worked recipes. |
| `references/corpus.md` | `~/design-corpus` query map (49 pins). |
| `references/dashboards.md` | Metric anatomy, drill-down, queues, checkable numbers. |
| `references/dataviz.md` | Chart encoding, denylist, colour, number format. |
| `references/audit.md` | Audit rubric + report template. |
| `references/direction.md` | Lanes + the DESIGN.md two-pass plan. |
| `references/ai-surfaces.md` | Model-does-work surfaces; chat is usually wrong. |
| `references/salesforce.md` | SLDS 2 / Lightning — org-measured facts. |
| `references/brand.md` | Brand adapter. `references/brand.local.md` overrides when present. |
| `references/copy.md` | Persuasion / instructional copy. |
| `references/voice.md` | Speak/listen surfaces. |
| `references/imagegen.md` | On-demand graphics via mflux. |
| `references/ecosystem.md` | Library choice, licenses. |
| `references/performance.md` | CWV and latency budgets. |
| `references/verification.md` | Measure-loop traps. |

## Hard-won specifics

- **`class-variance-authority` is stale** — use `tailwind-variants`. **Base UI:**
  `@base-ui/react`. **Pin `@tanstack/react-table@^8`.** **`tailwind-merge` ^3** for v4.
- **Charts: D3 for math/SSR, Recharts for React.** Single-file artifacts: hand-written
  CSS, not Tailwind — nesting, `:has()`, `light-dark()`.
- **License traps:** Aceternity (none); React Bits / Animate UI (Commons Clause); Origin
  UI (AGPL); Polaris query-only. Using ≠ redistributing.

## Verification

Never claim a design is correct — measure it. Wireframe gray-boxes are exempt from craft
hard-fails until Build; structure rules still apply. Run from shine's own deps
(`npm install` once at the repo root):

```sh
cd ~/Projects/shine-live && npm install                   # once
node corpus/cite.mjs "<job>"                              # match: templates + source + shot
node verify/measure.mjs <path> --shot /tmp/shot.png --cite <id>
node verify/compare.mjs <path> --cite <id>                # side-by-side vs harvested shot
node verify/doctor.mjs                                    # is shine itself in force?
```

Hard-failing in measure (among others): axe violations, worst-case contrast, void
regions, colliding type steps, undeclared theme, no filled primary / competing primaries,
app-shell density, table contract, family checks under `--cite`. Notes never block.
Traps live in `references/verification.md`. Before claiming shine is enforced, run the
doctor — wiring failures print nothing on their own.

## Reporting

Lane · template id · voice · files/shots read · before/after measure numbers · shot
paths (and the compare composite when available) · what is NOT done. A named
Table/Form/Dialog/Select without its contracts MUST checklist is incomplete.
