---
name: shine
description: >-
  Design, build, or audit interfaces using real template structure, complete interaction
  contracts, measured craft rules, and browser proof. Use for any UI or UX work: web pages,
  dashboards, tables, forms, landing pages, charts, HTML artifacts, email, Salesforce
  Lightning, decks, PDFs, prototypes, mockups, wireframes, design reviews, or visual polish.
---

# Shine

Shine is a design authority: it replaces invented layouts, remembered APIs, and
"looks good to me" with real template structure, explicit contracts, measured craft
thresholds, and proof in a rendered browser. Build the interface directly in the current
task; the references in this skill decide, you supply brief-specific judgment.

## Non-negotiables

1. **Render before opining.** Never diagnose, praise, or fix a screen you have not seen
   rendered in a browser. Screenshot it and read the screenshot.
2. **Match a template, never invent a page.** Every known job (dashboard, queue, record,
   settings, auth, checkout, landing, wizard…) has a row in `references/templates.md`.
   Clone the selected row's regions; put its id on the artifact as `data-cite`.
3. **Named controls owe their contract.** A data table, form, dialog, or select gets the
   full MUST list from `references/contracts.md`. Every data grid includes search,
   sorting, filters, column visibility, pagination, selection, row actions, and
   loading/empty/filtered-empty/error states. A hand-built `<table>` is allowed only for
   static presentation.
4. **Tokens, not raw values.** Declare colors, radii, shadows, tracking once as custom
   properties; usage sites say `var()`. In an existing repo, use the project's installed
   design system and tokens — never introduce a second one.
5. **One primary action per view.** Count the filled controls; more than one is a
   hierarchy defect.
6. **Usability is executable, not inferred from craft.** The primary job must be
   walkable in the browser and change observable state (`references/usability.md`).
7. **Never invent a library API.** Fetch the official docs or read the installed source
   before writing a prop or component name.
8. **Direction is a contract.** Before paint, name the composition archetype, image
   strategy, signature moment, and the prior family or silhouette this output must not repeat.

## Route the request

| Situation | Mode | Start at |
|---|---|---|
| New surface, no UI yet (or user says wireframe/sketch/low-fi) | **Wireframe** | `references/wireframe.md` — discovery → gray-box → locked brief |
| Locked brief exists, or building from an existing shell | **Build** | `references/direction.md`, then build |
| Existing surface, upgrade in place | **Polish** | `references/diagnose.md` |
| "Review / audit / what's wrong" — change nothing unless asked | **Audit** | `references/audit.md` |
| Persuasive or instructional words are the problem | **Copy** | `references/copy.md` |
| Internal tool nobody opens | **Adoption** | `references/adoption.md` |

Default: Wireframe if new; otherwise Build unless the ask is clearly a review.

## The loop (Build / Polish)

**LOOK → NAME → MATCH → RESTRUCTURE → REPAINT → PROVE** — the full procedure is
`references/diagnose.md`.

- LOOK: render, screenshot, read it. Identify the surface kind and lane
  (internal / saas / lex / marketing).
- NAME: 3–8 evidence-backed defects across usability, completeness, composition, craft —
  fix in that priority order. Never paint while a usability or completeness hole is open.
- MATCH: pick the `references/templates.md` row for the job; open its real source
  (public shadcn registry, bundled blueprint in `references/blueprints/`, or public demo).
- DIRECT: declare the archetype, image strategy, signature moment, and anti-repetition rule.
  Cap the page shortlist at one candidate per visual family; pages outrank component demos.
- RESTRUCTURE: clone the template's regions, keep the focal object focal.
- REPAINT: pick the voice (`references/voices.md`) — kit-faithful by default, house as
  fallback, brand when locked (`references/brand.md`).
- PROVE: see below.

For a new standalone surface, write the information hierarchy and primary workflow down
(a short `DESIGN.md`, per `references/direction.md`) before building. Ask discovery
questions only when missing product decisions would materially change the result.

## Prove — before claiming anything is done

1. Render the result in a real browser (open the HTML file, or run the app).
2. Screenshot and **read** the screenshot — before/after for fixes.
3. Exercise the primary workflow yourself: click, fill, submit. The DOM must visibly
   change. A static dashboard, a decorative control, or a flow that changes nothing fails.
4. Check contrast by computing it on suspect pairs: text ≥4.5:1, non-text UI parts ≥3:1
   (WCAG 1.4.3 / 1.4.11). Text over gradients or imagery gets checked against its
   worst-case pixel, not the average.
5. Compare the result against the cited template — they should read as relatives.
6. Report: the selected template id, workflow result, contrast findings, screenshot
   paths, and anything not completed. Report failures plainly; never claim an unrendered
   or unexercised surface works.

## Ten craft rules (measured, not asserted)

Full evidence and the 90 failure tells: `references/taste.md`.

1. Accent chroma OKLCH 0.13–0.24 at L 55–65; large-area fills ≤0.08. (Tailwind's `-600`
   row at 0.245–0.288 is the "AI look" tell.)
2. Adjacent surfaces differ ~2pp lightness; borders carry separation, not fill jumps.
   ≥6pp is a smell.
3. Two type ratios: ~1.12 for the UI band, ~1.22 for display. One ratio is why generated
   scales feel wrong.
4. Tracking depends on size *and* weight: 0 in the 14–16px band, crossing negative at
   20–24px, −0.02 to −0.035em by 48px; all-caps labels +0.05em.
5. Line-height peaks at body (~1.5 @16px) and falls both directions; floor 1.33. Dense
   UIs cut padding, never leading.
6. Shadows: ≥2 layers, top-layer alpha ≤6% light (~4× in dark), blur ≥8px carries spread
   ≈ −blur/4. Overlays open with a `0 0 0 1px` hairline ring.
7. Flat-with-border is the default in product UI; shadow only for things that float.
8. Radii nest: `child = parent − padding`. Enterprise/LEX data surfaces: radius none or
   host tokens.
9. Motion: 100–150ms micro, 150–250ms standard, 200–300ms overlays; exits ~20% faster;
   ease-out; honor `prefers-reduced-motion`. Never `transition: all`.
10. Dark mode is never `#000`; tinted near-black with raised surfaces. Neutrals are
    hue-consistent: either chroma-0 or a slight consistent cast — never mixed.

## References — open on demand, one at a time

| Need | File |
|---|---|
| Order of operations for fixing a screen | `references/diagnose.md` |
| Template catalog + how to fetch each source | `references/templates.md` |
| Region maps for records, settings, wizards, marketing, checkout, blog, LEX | `references/blueprints/` |
| Component MUST/SHOULD lists (tables, forms, dialogs…) | `references/contracts.md` |
| Token architecture, states, a11y floor | `references/foundations.md` |
| Measured thresholds + 90 failure tells | `references/taste.md` |
| Art direction, lanes, DESIGN.md | `references/direction.md` |
| Which library + worked recipes (DataGrid, dialog, form…) | `references/kits.md` |
| Layout & composition | `references/layout.md` |
| Screen archetypes (hero budget, dashboard anatomy…) | `references/patterns.md` |
| Color & type method (OKLCH, pairing, contrast policy) | `references/color-type.md` |
| Motion tokens and easing | `references/motion.md` |
| Dashboards that answer questions | `references/dashboards.md` |
| Chart encoding rules | `references/dataviz.md` |
| Interaction & keyboard behavior | `references/interaction.md` |
| AI/agent surface topologies | `references/ai-surfaces.md` |
| Copy as argument (five beliefs, slop tells) | `references/copy.md` |
| Will anyone open it (internal tools) | `references/adoption.md` |
| Brand-locked work | `references/brand.md` |
| Salesforce Lightning / SLDS 2 | `references/salesforce.md` |
| Voice/TTS surfaces | `references/voice.md` |
| Performance budgets | `references/performance.md` |
| Anti-pattern list (lane-relative) | `references/anti-patterns.md` |
| Executable usability proof | `references/usability.md` |
| Audit rubric + report template | `references/audit.md` |
| Imagery rules (anti-stock) | `references/imagegen.md` |
| Library licensing & maintenance status | `references/ecosystem.md` |
| Deck, PDF, report, and email production | `references/cross-media.md` |

Ordinary tables, forms, and page structures need only `diagnose.md`, `templates.md`, and
`contracts.md`. Do not load the whole reference set.
