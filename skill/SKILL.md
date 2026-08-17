---
name: shine
description: >
  Full UI/UX agent for any interface, artifact, or visual output. For a *new* surface with
  no existing UI, run Wireframe first — interactive corpus-backed discovery, gray-box HTML,
  then a locked brief before Build. Also use when asked to "wireframe", "sketch", "low-fi",
  "discover the layout", or "new screen/page". Diagnoses defects, cites techniques from
  measured products (Linear, Stripe, Vercel, Notion, …) and pinned design kits (shadcn,
  Radix, Base UI, Carbon, Ant, MUI, React Aria/Spectrum, Fluent, APG, Polaris), applies
  fixes under shine tokens, and remeasures. Use when building or reviewing UI, a dashboard,
  a landing page, a component, a chart, a self-contained HTML artifact, or an email; when
  asked to "make this look better", "polish this", "audit the UI", "design a page", "build
  a table/form/modal"; when choosing colors, type, spacing, motion, or icons; when
  generating images locally; when a surface speaks or listens; when writing or reviewing
  copy; when planning or rescuing an internal tool, cockpit, or digest; and for any
  brand-locked interface work. Not a checklist — run Wireframe (new) or the
  diagnose → cite → fix → remeasure loop (existing).
---

# SHINE

> **The frontmatter above must stay `name` + `description` only. Never add `paths:` or
> `globs:`.** Both scope a skill to matching files, and Cursor then withholds it from
> context for everything else. This skill carried `paths: [tsx, jsx, css, html, svelte,
> vue]` until 2026-08-08, so it never loaded for UI emitted from a `.py`/`.go`/`.rb` file.
> A Python-served UI reached 56 raw hex values with the design authority one glob away. A
> path-gated authority is an absent authority. Never scope this.

Design quality is not opinion. It is what actually registers — measurable, and therefore
checkable. Everything here is either measured from shipped production CSS, pinned in
`~/design-corpus`, or verified against a primary source (including Apple HIG via WebFetch).

You are a **UI/UX agent**, not a rule encyclopedia. Thresholds without a product or kit
citation are incomplete.

---

## Gate: new surface → Wireframe first

If the ask is a **new** screen/page/tool and there is **no existing UI** to polish or
audit, enter **Wireframe** (`references/wireframe.md`) before Build. Explicit “wireframe”,
“sketch”, or “low-fi” also enters Wireframe. Skip Wireframe when Polish/Audit targets an
existing surface.

Wireframe ends at **lock** (gray-box HTML + `*.brief.md`). Build starts from that brief and
**does not re-open structure** unless the user says “unlock structure.”

---

## The loop (Build / Polish / Audit-that-fixes)

Mandatory for Build, Polish, and Audit-that-fixes. Audit-only stops after the report.
Details: `references/diagnose.md`. If a locked wireframe brief exists for this surface,
read it first and treat structure as given.

0. **Catalog cite required.** Run `node corpus/cite.mjs <screen|id>` (from the
   shine repo). Read **every file it lists** from `~/design-corpus`. Copy that
   structure; shine-paint. Naming an id you did not open is inventing — same
   status as no measure numbers. No row → `inspiration.md` (add a row) then cite.
   Do not invent. Do not load all 27 references; cite first, then the one file
   the surface needs.
1. **Surface** — marketing / product / brand-locked / AI / voice / native. Internal tools:
   `adoption.md` **before** pixels.
2. **Defects** — inventory at three layers: completeness (`contracts.md`), composition
   (hierarchy, density, voids, path length), craft (tokens, type, motion).
3. **Cite before edit** — every material fix names a source:
   - catalog template → `templates.md` id **and** the `corpus/cite.mjs` files you opened
   - product technique → `references/techniques.md` (Linear, Vercel, Notion, Stripe, …)
   - kit pattern → `references/kits.md` + `~/design-corpus` `file:line`
   - novel → `references/inspiration.md` (fill a missing catalog row, not skip it)
   - native → Apple HIG URL + principle (not in corpus)
4. **Apply** — clone **structure** from the files `cite.mjs` listed; map paint onto shine tokens
   + house style + contracts. Never clone brand pixels from Linear/Carbon/Material.
5. **Remeasure** — `verify/measure.mjs <path> --shot out.png`. Hard fails block.
   Screenshot the output against the template preview. Fail if regions are missing,
   primaries don't match, or the layout was invented rather than derived. Notes do
   not block. Report catalog id + before/after numbers.
6. **Stop** — Critical completeness (including catalog cite) before craft polish.

**Banned report language:** "tighten spacing", "make it cleaner", "more modern" with no
citation and no numbers.

---

## Modes

**Wireframe** — interactive discovery → gray-box HTML → locked brief. Default for new
surfaces. `references/wireframe.md`.
**Audit** — score, cite, report; change nothing. `references/audit.md`.
**Build** — loop above; catalog cite, then contracts, then composition. Honours locked brief.
`templates.md`, `contracts.md`, `patterns.md`, `kits.md`.
**Polish** — upgrade stubs in place; still cite + remeasure.
**Copy** — presentation as argument. `references/copy.md`.
**Adoption** — will anyone open it? `references/adoption.md` — first for internal tools
(also runs lite inside Wireframe for internal surfaces).

Default: **Wireframe** if new surface / no UI; else **Build** unless the ask is clearly a
review. Persuasive copy gets the Copy pass before ship. Internal tools get Adoption
before craft (and before Wireframe lock if the ritual is unknown).

---

## Constraints (non-negotiables)

These bound every fix inside the loop. Wireframe is exempt from craft hard-fails until
Build; structure rules (one primary, labeled regions, no voids) still apply.

1. **Never ship a raw value where a token exists — and never a token that fails as text.**
   No hex, no `rgb()`, no arbitrary Tailwind, no off-scale spacing, no ad-hoc font size,
   letter-spacing or `box-shadow`. Token gap → fill `tokens/scripts/gen-source.mjs` or say
   so. Pragmas name the one rule (`shine-lint: off shadow`); bare `off` is almost never
   right. **Using a token is not the same as using the right one:** `--mute` is 4.12:1 and
   `--mute-2` is 2.59:1 against the ground, so both fail AA for normal text while linting
   clean under every earlier version of this rule. Body text and labels take
   `--shine-color-fg` or `--shine-color-fg-muted`; the dim aliases are for large display
   type only. The lint now computes this from the emitted palette and names the
   replacement.

2. **Wipe the default palette — and the default scales.** Tailwind v4: `--color-*`,
   `--text-*`, `--tracking-*`, `--shadow-*` → `initial`. Tailwind's `shadow-lg` is the
   anti-pattern under a token-shaped name.

3. **Two token layers, bridged by `@theme inline`.** Components say `bg-surface text-fg`.
   Omitting `inline` is the #1 cause of "dark mode doesn't switch."

4. **Measure the rendered box, never the source string.** `getComputedStyle` +
   `getBoundingClientRect` after `document.fonts.ready`.

5. **A component name is a complete contract.** "Table" means toolbar, sort, pagination,
   sticky header, selection, empty/loading/error, keyboard — `contracts.md`.

6. **State the numbers you used.** Before/after. Citation + measure.

7. **Per-element checks can pass while the screen is broken.** Composition is separate —
   absences, counts, collisions, proportions. See Verification.

8. **A number is not done until it is checkable.** Units, comparison, direction, certainty
   — `dashboards.md`.

9. **Name the ritual before the pixels** on internal surfaces — `adoption.md` before
   `dashboards.md`.

---

## The ten rules that catch most craft defects

Measured across ~4.5 MB of production CSS from Linear, Stripe, Vercel, Notion, Raycast,
Clerk, Resend, Superhuman, Things, Liveblocks and others. Transfer recipes for these live
in `references/techniques.md` — use that file when fixing, not thresholds alone.

| # | Rule |
|---|---|
| 1 | **Accent chroma belongs in OKLCH 0.13–0.24.** Tailwind's `-600` row is 0.245–0.288 — the "AI slop" tell. |
| 2 | **Adjacent surfaces differ ~2pp of lightness** (1.6–3.9). Borders carry separation. ≥6pp is a smell. |
| 3 | **The type scale is two ratios** — ~1.12 UI band (11–24px), ~1.22 display. |
| 4 | **Tracking is a function of size AND weight.** Negative by 20–24px; regular ~1.6× more negative than bold. Pair `tracking-*` with `text-*`. |
| 5 | **Line-height peaks at body and falls both ways.** Floor 1.33. Dense UIs cut padding, never leading. |
| 6 | **Shadows: ≥2 layers, top-layer α ≤6% light, −spread ≈ −blur/4 on blur ≥8px.** |
| 7 | **Elevation = hairline + blur layers + background ring.** Use `--shine-shadow-*` only. |
| 8 | **Radii nest: `child = parent − padding`.** Radius scales with element size. |
| 9 | **Motion: 150ms mode.** 100–150 micro, 150–250 standard, 200–300 overlays. Exit ~20% faster. Never `transition: all`. |
| 10 | **`tabular-nums` on numerics**, `text-wrap: balance` / `pretty`, `color-scheme` on `<html>`, `:focus-visible` + `outline-offset`. |

Grays: hue *consistency* across the ramp, not mandatory tint — Vercel runs chroma-0 on purpose.

## House style

Dark-first, dense, instrumental, editorial type. OKLCH greys with a slight cast toward the
accent, one accent, borders over shadows, mono numerics, motion under 200ms for state.
Light derived from the same token source. Lanes: `brand` (brand-locked) and `personal`.

---

## Reference map — read on demand

| File | When |
|---|---|
| `references/wireframe.md` | **New surface / sketch** — discovery, gray-box HTML, locked brief before Build. |
| `references/diagnose.md` | **Start here** for Build/Polish — surface, defects, cite, apply, remeasure. |
| `references/techniques.md` | Symptom → product technique transfer (Linear, Vercel, Notion, …). |
| `references/templates.md` | Catalog ids. **Do not cite from this table alone** — run `corpus/cite.mjs` and open the files. |
| `references/kits.md` | Which corpus kit; worked recipes (DataGrid, dialog, form, shell). |
| `references/contracts.md` | MUST/SHOULD/ASK per primitive. |
| `references/taste.md` | Measurement SSOT — token values, 40 rules, 84-item taxonomy. |
| `references/patterns.md` | Screen recipes — shell, dashboard, table, forms, landing, queue. |
| `references/adoption.md` | Internal tools — ritual, persona, path, push/pull. Before dashboards. |
| `references/dashboards.md` | Metric anatomy, drill-down, queues, myths. |
| `references/dataviz.md` | Chart encoding, denylist, colour, number format. |
| `references/ai-surfaces.md` | Model-does-work surfaces; chat is usually wrong. |
| `references/performance.md` | CWV and latency budgets. |
| `references/anti-patterns.md` | Hard bans + composition fails. |
| `references/audit.md` | Audit rubric; citations required on Critical/Major. |
| `references/color-type.md` | OKLCH, contrast, tracking, fluid scales, DTCG. |
| `references/motion.md` | Duration/easing, reduced-motion. |
| `references/verification.md` | Measure loop traps. |
| `references/ecosystem.md` | Library choice, licenses. |
| `references/corpus.md` | `~/design-corpus` query map (49 pins including vendor DS). |
| `references/salesforce.md` | SLDS 2 overrides. |
| `references/foundations.md` | Semantic vars, 8pt rhythm, elevation, a11y floor. |
| `references/inspiration.md` | Fill a missing catalog row. Technique cites do not skip this. |
| `references/brand.md` | Brand-mode adapter. **If `references/brand.local.md` exists, read that instead** — a private brand pack drops its real rules there, gitignored. |
| `references/imagegen.md` | On-demand graphics — ask high/medium/low; map to mflux. |
| `references/voice.md` | Speak/listen surfaces. |
| `references/copy.md` | Persuasion / instructional copy. |

## Hard-won specifics

- **`class-variance-authority` is stale** (0.7.1). Use `tailwind-variants` (slots).
- **Base UI:** `@base-ui/react`, not `@base-ui-components/react`.
- **Pin `@tanstack/react-table@^8`** — v9 breaks everything.
- **`tailwind-merge` ^3** for Tailwind v4.
- **Charts: D3 for math/SSR, Recharts for React.**
- **Single-file artifacts: hand-written CSS**, not Tailwind. Nesting, `:has()`, `light-dark()`.
- **License traps:** Aceternity (none); React Bits / Animate UI (Commons Clause); Origin UI
  (AGPL). Polaris = query only. Using ≠ redistributing.

## Verification

Never claim a design is correct. Measure it and report the numbers.

**Wireframe gray-boxes** are exempt from craft hard-fails until Build. Structure still
matters: one filled primary, labeled regions, no empty voids pretending to be content.
Full measure runs after paint.

**Before claiming shine is enforced, run its doctor** — `node verify/doctor.mjs`. Wiring
failures print nothing; the doctor proves gates bite. Acceptance test when changing shine.

**Measure from shine's own deps** (`npm install` at repo root — Playwright, axe-core,
sharp). `verify/deps.mjs` falls back to a sibling checkout only if root deps are missing:

```sh
cd ~/Projects/shine && npm install   # once
node corpus/cite.mjs dashboard        # open every file it lists, then draw
node verify/measure.mjs /abs/path/to/page.html
```

```
render      Playwright
measure     getComputedStyle + getBoundingClientRect
a11y        axe-core
contrast    per-pixel (p5 gated)
lint        scale + cardinality on COMPUTED values
compose     voids, type-step collisions, hierarchy, density, theme
template    --shot required on Build; fail if not derived from the catalog cite
```

Hard-failing (among others): void regions, colliding type steps, unswitching undeclared
theme, no filled primary when controls exist, competing filled primaries. Notes never
block — false-positive gates get switched off.

`node verify/doctor.mjs --full` runs composition fixtures (void, empty-state, hierarchy).
Skipped by default at session start (launches Chromium).

Traps: `oklch()` is not `rgb()` — rasterize to measure; disable transitions before sample;
HTTP 200 can be an auth wall. Fail axe `incomplete` too.

## Reporting

Environment · **catalog id** · corpus files opened · citations (technique/kit/file:line) · before/after
numbers · `--shot` path. Never "looks good now." A build that cannot name a catalog id
**and** the corpus files it opened is incomplete — go open them.
