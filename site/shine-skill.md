---
name: shine
description: >-
  Design, build, or audit interfaces using real template structure, complete interaction
  contracts, measured craft rules, and browser proof. Use for any UI or UX work: web pages,
  dashboards, tables, forms, landing pages, charts, HTML artifacts, email, Salesforce
  Lightning, prototypes, mockups, wireframes, design reviews, or visual polish.
---

# Shine — self-contained design authority

All 30 Shine references are inlined below. Nothing to install, no corpus to
clone, no other file to open. Adapted from Shine v4.0
(github.com/justinfowler925/shine, MIT).

**Not in this file:** the 14 blueprint region maps (records, settings, wizards, marketing,
checkout, blog, and the Salesforce Lightning set) and their four authored `page.tsx`
sources. Rows marked *blueprint* in the template catalog name a real screen, but you build
from the catalog row and the rules here rather than a bundled region map. Those files ship
in the plugin bundle at github.com/justinfowler925/shine.

## Contents

- [The loop — how to find what is wrong](#the-loop-how-to-find-what-is-wrong)
- [Wireframe — discovery before build](#wireframe-discovery-before-build)
- [Direction — art direction before code](#direction-art-direction-before-code)
- [Templates — start from a real page](#templates-start-from-a-real-page)
- [Component contracts — what every named control owes](#component-contracts-what-every-named-control-owes)
- [Foundations — tokens, states, accessibility floor](#foundations-tokens-states-accessibility-floor)
- [Taste — measured thresholds and failure tells](#taste-measured-thresholds-and-failure-tells)
- [Color and type — the method](#color-and-type-the-method)
- [Motion — durations, easing, reduced motion](#motion-durations-easing-reduced-motion)
- [Layout — structure as information](#layout-structure-as-information)
- [Patterns — screen archetypes](#patterns-screen-archetypes)
- [Techniques — craft transfer](#techniques-craft-transfer)
- [Interaction — keyboard and pointer behavior](#interaction-keyboard-and-pointer-behavior)
- [Anti-patterns — lane-relative](#anti-patterns-lane-relative)
- [Voices — three legal paints](#voices-three-legal-paints)
- [Kits — which library, and worked recipes](#kits-which-library-and-worked-recipes)
- [Dashboards — surfaces that answer questions](#dashboards-surfaces-that-answer-questions)
- [Data visualization — encoding rules](#data-visualization-encoding-rules)
- [AI surfaces — topologies](#ai-surfaces-topologies)
- [Copy — the presentation layer as an argument](#copy-the-presentation-layer-as-an-argument)
- [Adoption — will anyone open it](#adoption-will-anyone-open-it)
- [Voice — surfaces that speak or listen](#voice-surfaces-that-speak-or-listen)
- [Brand mode — the adapter](#brand-mode-the-adapter)
- [Salesforce — Lightning and SLDS 2](#salesforce-lightning-and-slds-2)
- [Performance — budgets and thresholds](#performance-budgets-and-thresholds)
- [Imagery — anti-stock rules](#imagery-anti-stock-rules)
- [Ecosystem — libraries, licenses, maintenance](#ecosystem-libraries-licenses-maintenance)
- [Cross-media — decks, PDFs, reports, and email](#cross-media-decks-pdfs-reports-and-email)
- [Usability proof — executable, not inferred](#usability-proof-executable-not-inferred)
- [Audit — rubric and report template](#audit-rubric-and-report-template)

Shine is a design authority: it replaces invented layouts, remembered APIs, and
"looks good to me" with real template structure, explicit contracts, measured craft
thresholds, and proof in a rendered browser. Build the interface directly in the current
task; the sections below decide, you supply brief-specific judgment.

## Non-negotiables

1. **Render before opining.** Never diagnose, praise, or fix a screen you have not seen
   rendered in a browser. Screenshot it and read the screenshot.
2. **Match a template, never invent a page.** Every known job (dashboard, queue, record,
   settings, auth, checkout, landing, wizard…) has a row in [§ Templates](#templates-start-from-a-real-page).
   Clone the selected row's regions; put its id on the artifact as `data-cite`.
3. **Named controls owe their contract.** A data table, form, dialog, or select gets the
   full MUST list from [§ Component contracts](#component-contracts-what-every-named-control-owes). Every data grid includes search,
   sorting, filters, column visibility, pagination, selection, row actions, and
   loading/empty/filtered-empty/error states. A hand-built `<table>` is allowed only for
   static presentation.
4. **Tokens, not raw values.** Declare colors, radii, shadows, tracking once as custom
   properties; usage sites say `var()`. In an existing repo, use the project's installed
   design system and tokens — never introduce a second one.
5. **One primary action per view.** Count the filled controls; more than one is a
   hierarchy defect.
6. **Usability is executable, not inferred from craft.** The primary job must be
   walkable in the browser and change observable state ([§ Usability proof](#usability-proof-executable-not-inferred)).
7. **Never invent a library API.** Fetch the official docs or read the installed source
   before writing a prop or component name.
8. **Direction is a contract.** Before paint, name the composition archetype, image
   strategy, signature moment, and the prior family or silhouette this output must not repeat.

## Route the request

| Situation | Mode | Start at |
|---|---|---|
| New surface, no UI yet (or user says wireframe/sketch/low-fi) | **Wireframe** | [§ Wireframe](#wireframe-discovery-before-build) — discovery → gray-box → locked brief |
| Locked brief exists, or building from an existing shell | **Build** | [§ Direction](#direction-art-direction-before-code), then build |
| Existing surface, upgrade in place | **Polish** | [§ The loop](#the-loop-how-to-find-what-is-wrong) |
| "Review / audit / what's wrong" — change nothing unless asked | **Audit** | [§ Audit](#audit-rubric-and-report-template) |
| Persuasive or instructional words are the problem | **Copy** | [§ Copy](#copy-the-presentation-layer-as-an-argument) |
| Internal tool nobody opens | **Adoption** | [§ Adoption](#adoption-will-anyone-open-it) |

Default: Wireframe if new; otherwise Build unless the ask is clearly a review.

## The loop (Build / Polish)

**LOOK → NAME → MATCH → RESTRUCTURE → REPAINT → PROVE** — the full procedure is
[§ The loop](#the-loop-how-to-find-what-is-wrong).

- LOOK: render, screenshot, read it. Identify the surface kind and lane
  (internal / saas / lex / marketing).
- NAME: 3–8 evidence-backed defects across usability, completeness, composition, craft —
  fix in that priority order. Never paint while a usability or completeness hole is open.
- MATCH: pick the [§ Templates](#templates-start-from-a-real-page) row for the job; open its real source
  (public shadcn registry, bundled blueprint region map, or public demo).
- DIRECT: declare the archetype, image strategy, signature moment, and anti-repetition rule.
  Cap the page shortlist at one candidate per visual family; pages outrank component demos.
- RESTRUCTURE: clone the template's regions, keep the focal object focal.
- REPAINT: pick the voice ([§ Voices](#voices-three-legal-paints)) — kit-faithful by default, house as
  fallback, brand when locked ([§ Brand mode](#brand-mode-the-adapter)).
- PROVE: see below.

For a new standalone surface, write the information hierarchy and primary workflow down
(a short `DESIGN.md`, per [§ Direction](#direction-art-direction-before-code)) before building. Ask discovery
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

Full evidence and the 90 failure tells: [§ Taste](#taste-measured-thresholds-and-failure-tells).

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

---

## The loop — how to find what is wrong

The loop's procedure. Thresholds live in [§ Taste](#taste-measured-thresholds-and-failure-tells)/SKILL; this file is the order of
operations so every fix starts from a named defect and ends with a source.

#### 0. Route first

- **No existing UI** (new screen/page/tool), or the user said wireframe/sketch/low-fi →
  [§ Wireframe](#wireframe-discovery-before-build) before anything here.
- A `shine-wireframe/<slug>.brief.md` with `Status: LOCKED` → structure is given; do not
  invent a competing IA unless the user says `unlock structure`.
- **Internal tool / cockpit / digest** → [§ Adoption](#adoption-will-anyone-open-it) before pixels. A surface nobody
  opens is a design defect, not a training problem.

#### 1. LOOK — render before opining

Render the page in a real browser and **take a screenshot, then read it**. For an HTML
file, open it directly; for an app, run it and navigate to the surface. A page you have
not seen gets no opinions. Note what you actually see — not what the source suggests.

| Kind | Signals | First refs |
|---|---|---|
| Internal tool / cockpit | Auth'd app, queues, metrics for a ritual | [§ Adoption](#adoption-will-anyone-open-it) first |
| Product app shell | Nav, tables, forms, settings | [§ Patterns](#patterns-screen-archetypes), [§ Component contracts](#component-contracts-what-every-named-control-owes) |
| Dashboard / forecast | KPIs, charts, "what needs me" | [§ Dashboards](#dashboards-surfaces-that-answer-questions), [§ Data visualization](#data-visualization-encoding-rules) |
| AI / agent surface | Model does work a human owns | [§ AI surfaces](#ai-surfaces-topologies) |
| Marketing / landing | Hero, CTA, persuasion | [§ Patterns](#patterns-screen-archetypes) (hero budget), [§ Copy](#copy-the-presentation-layer-as-an-argument) |
| Brand-locked | Client-facing or brand lock | [§ Brand mode](#brand-mode-the-adapter) |
| Speaks or listens | TTS, mic, read-aloud | [§ Voice](#voice-surfaces-that-speak-or-listen) |
| Native / macOS / iOS | Desktop chrome, HIG language | Apple HIG (fetch it) |
| Lightning / LWC | Record page, console, datatable | [§ Salesforce](#salesforce-lightning-and-slds-2) |

Two kinds → run the stricter first (adoption before craft; contracts before polish).

#### 2. NAME — four buckets, usability first

Write 3–6 defects, each in one bucket. Craft without a usability or completeness defect
above it is the wrong pass.

##### Usability (can they finish the job?)
- Primary action visible in ~3 seconds? Competing CTAs?
- Path: notification → committed change — where does the user invent the next step?
- Empty / error / loading as real states, not voids?
- Hover-only actions; no keyboard path to finish?
- The job of the screen vs what the layout actually offers.

##### Completeness (contracts)
Named Table / Form / Dialog / Select loads [§ Component contracts](#component-contracts-what-every-named-control-owes) MUST **in this pass**.
- A `<table>` with two or more header cells **is** a named Table. Missing
  `data-shine-contract="table"` does not exempt it. Only `data-shine-contract="layout"`
  (or `role="presentation"`) opts out.
- Named control below MUST (bare `<table>`, unlabeled icon button, placeholder-as-label)
- Missing states: loading / empty / filtered-empty / error
- Destructive without confirm; double-submit; toast-only errors

##### Composition (what per-element gates cannot see)
- **Scan order** — in 3 seconds, what do you read? Is that the job?
- **Weight budget** — one primary, few secondary. Count filled controls.
- **Focal object** — dashboards need one; six equal modules is an index.
- **Chrome vs content**; largest region empty; sections with three jobs.
- **Collisions** — one token two meanings; type steps that aren't distinguishable.

##### Craft (of the chosen voice)
- Raw values at usage sites; off-scale spacing; tracking 0 on display type
- House accent chroma outside 0.13–0.24; kit-faithful drifting back to house paint
- Theme undeclared or non-switching; contrast fails; `transition: all`
- Refs: SKILL ten rules, [§ Taste](#taste-measured-thresholds-and-failure-tells), [§ Color and type](#color-and-type-the-method), [§ Motion](#motion-durations-easing-reduced-motion), [§ Foundations](#foundations-tokens-states-accessibility-floor)

#### 3. Prioritize

1. Usability — they cannot finish the job
2. Completeness Critical — a11y blockers, data-state triad, wrong primary
3. Composition that causes wrong actions or abandonment
4. Adoption blockers on internal tools
5. Craft that reads as slop for the chosen voice
6. Polish (density, optical alignment, micro-motion)

Never spend a pass on craft while a Critical completeness hole is open.

#### 4. MATCH — a template, not a vibe

Open [§ Templates](#templates-start-from-a-real-page), find the rows whose Jobs match the screen's job in plain words,
read the selected row's real structure (registry source, bundled blueprint, or public
demo), pick one of the best 2–3 matches and say why. A page with no template cite is
incomplete for a *known* job — dashboards, queues, records, settings, auth, checkout
all have rows. No matching row → nearest row + [§ Patterns](#patterns-screen-archetypes), and say so. Technique
cites ([§ Techniques](#techniques-craft-transfer)) are for craft transfer; they don't replace a structural match.
A record list (queue, remainder, sources, admin rows) cites a DataGrid row
(`untitled-table`, or `shadcn-dashboard-01` for the composed records page). A
list/dashboard/app-shell cite is the wrong match for a record list even if it looks
closer — re-check the datagrid rows.

#### 5. RESTRUCTURE + REPAINT

Clone the template's regions from its source; keep the focal object focal. Then paint by
voice ([§ Voices](#voices-three-legal-paints)): kit-faithful uses the kit's real token values; house uses a dark-first
single-accent editorial system; brand keeps regions and drops vendor chrome.
Upgrade stubs to the contract ladder. Prefer one composition change over ten craft tweaks.

#### 6. PROVE

Render the result in a real browser and:

1. Screenshot before and after, and read both.
2. Walk the primary workflow yourself (click, fill, submit) — the DOM must visibly change.
3. Check contrast on every suspect text/background pair (compute it, don't eyeball it —
   text ≥4.5:1, non-text UI ≥3:1).
4. Compare the after-shot to the cited template's structure — the two should read as
   relatives. If they don't, the match or the paint is wrong.

Report before/after evidence for every Critical/Major you claimed to fix, plus the shot
paths. Never claim a defect fixed without having looked at the rendered result.

#### Quick defect → next file

| You see… | Open |
|---|---|
| No UI yet / need a sketch | [§ Wireframe](#wireframe-discovery-before-build) |
| Known job, invented layout | [§ Templates](#templates-start-from-a-real-page) — match a row |
| Nobody will open this | [§ Adoption](#adoption-will-anyone-open-it) |
| Table/form missing states | [§ Component contracts](#component-contracts-what-every-named-control-owes) |
| Queue / batch / empty | [§ Templates](#templates-start-from-a-real-page) `untitled-table` |
| Wrong hierarchy / equal peers | [§ Techniques](#techniques-craft-transfer) §Hierarchy, [§ Kits](#kits-which-library-and-worked-recipes) |
| Numbers undecidable | [§ Dashboards](#dashboards-surfaces-that-answer-questions) |
| Chart encoding smell | [§ Data visualization](#data-visualization-encoding-rules) |
| AI chat as default shell | [§ AI surfaces](#ai-surfaces-topologies) |
| Words don't persuade | [§ Copy](#copy-the-presentation-layer-as-an-argument) |
| Raw values / tokens | [§ Foundations](#foundations-tokens-states-accessibility-floor), [§ Color and type](#color-and-type-the-method) |
| Need a library API | fetch the library's official docs — never invent an API |
| Lightning host quirks | [§ Salesforce](#salesforce-lightning-and-slds-2) |

---

## Wireframe — discovery before build

Default for a **new** surface with no existing UI. Explicit triggers: “wireframe”,
“sketch”, “low-fi”, “discover the layout”, “new screen”.

Wireframe discovers **structure** with the user by picking a catalog template
([§ Templates](#templates-start-from-a-real-page)), then citing kits. It emits a gray-box HTML artifact whose regions come
from that template, then a **locked brief**. Build applies the cited template's DNA and
does not invent a competing IA unless the user says `unlock structure`.

**Not Wireframe:** craft (chroma, tracking, shadows), brand paint, real charts, or
shipping React. Craft judgments wait until Build.

---

#### When to enter / skip

| Enter | Skip |
|---|---|
| New screen/page/tool, no UI yet | Polish/Audit of an existing surface |
| User says wireframe / sketch / low-fi | Locked brief already exists and user wants paint only |
| Redesign-from-scratch where structure is undecided | Tiny component stub inside a known shell |

---

#### Discovery script

**One question per turn** (or one tight cluster). Always end with **2–3 options + a
recommendation** (mandatory default + cite). Max **~8 discovery turns**, then force a
draft gray-box — do not interview to death.

##### Turn budget

| Turns | Goal |
|---|---|
| 1–2 | Intent: job of the screen; who opens it; ritual if internal ([§ Adoption](#adoption-will-anyone-open-it) lite) |
| 2–3 | **Catalog pick** — match the job to a [§ Templates](#templates-start-from-a-real-page) row (default start-from) + pattern from [§ Patterns](#patterns-screen-archetypes). Open the row's source (registry item, bundled blueprint, or public demo). |
| 3–6 | Structure forks still undecided after the template (nav collapse, states) |
| ≤8 | Emit/update gray-box; keep iterating on the HTML |
| Lock | Write `*.brief.md`; hand off to Build |

##### Every suggestion must cite

| Kind | Form |
|---|---|
| Catalog template | [§ Templates](#templates-start-from-a-real-page) id — **required on every region** |
| Pattern | [§ Patterns](#patterns-screen-archetypes) § name |
| Kit recipe | [§ Kits](#kits-which-library-and-worked-recipes) recipe + the kit's official docs |
| Technique | [§ Techniques](#techniques-craft-transfer) § + product |
| Novel only | nearest catalog row + [§ Patterns](#patterns-screen-archetypes) principle — name both |

Banned: “we could do a sidebar” with no source. Gray-box regions come from the
chosen template, not from anonymous layout ideas. `data-cite` on every region
includes the [§ Templates](#templates-start-from-a-real-page) id.

##### Recommendation format (every fork)

```
Recommend: <option B>
Why: <kit/product cite — one line>
Options:
  A — … (cite)
  B — … (cite)  ← default
  C — … (cite)
```

##### Structure forks (ask only what is undecided)

- Nav: sidebar vs top vs none — admin density (`untitled-table`, Polaris query-only) vs marketing hero budget
- Focal object: what is the one thing this page is about ([§ Patterns](#patterns-screen-archetypes) dashboard / queue)
- Primary action: one filled control (techniques.md §Hierarchy)
- Supporting regions: filters, KPI row, queue, detail pane — name jobs
- States: empty / loading / filtered-empty / error as labeled placeholders
- Mobile: collapse nav to drawer/sheet or single column

Internal tools: confirm ritual + persona asymmetry before locking ([§ Adoption](#adoption-will-anyone-open-it)).

---

#### Gray-box artifact contract

##### Paths

```
shine-wireframe/<slug>.html
shine-wireframe/<slug>.brief.md
```

Or a path the user names. Keep HTML + brief adjacent.

##### Markup requirements

- Root: `data-shine-wireframe` on a wrapper (or `<body>`).
- `color-scheme: light` on `:root` / `<html>` (declared single mode).
- Regions: `.wf-region` with `data-label`, `data-job`, `data-cite`.
- Exactly **one** control with `data-primary` (filled primary).
- States as `.wf-state` text: `[empty]`, `[loading]`, `[error]`, `[filtered-empty]`.
- No imagery, no accent chroma, no real chart ink — blocks and labels only.
- CSS: paste `assets/wireframe.css` (bundled with this skill) inline so the artifact
  opens standalone.

##### Minimal skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Wireframe — <name></title>
  <style>/* paste assets/wireframe.css */</style>
</head>
<body>
  <div data-shine-wireframe>
    <div class="wf-shell">
      <aside class="wf-region wf-nav" data-label="nav" data-job="…" data-cite="templates.md shadcn-sidebar-07">…</aside>
      <main class="wf-main">
        <header class="wf-region wf-header" data-label="page-header" data-job="…" data-cite="templates.md shadcn-dashboard-01">
          <div>
            <h1 class="wf-title">…</h1>
            <p class="wf-desc">…</p>
          </div>
          <button type="button" class="wf-btn" data-primary>Primary</button>
        </header>
        <section class="wf-region wf-focal" data-label="focal" data-job="…" data-cite="…">
          <span class="wf-state">[empty]</span>
        </section>
      </main>
    </div>
    <p class="wf-meta">Wireframe · cites in data-cite · lock via companion .brief.md</p>
  </div>
</body>
</html>
```

##### Structural checks (Wireframe, not full craft)

Before lock, confirm:

1. `data-shine-wireframe` present
2. One `[data-primary]`
3. Every major region has `data-job` + `data-cite`
4. No large empty `.wf-region` without a `.wf-state` or content label
5. Pattern + kit named in the meta or brief

Do **not** apply craft thresholds to the gray-box.

---

#### Locked brief

Write `shine-wireframe/<slug>.brief.md` on lock, and a short `DESIGN.md` beside it
([§ Direction](#direction-art-direction-before-code) names its contents):

```markdown
### Wireframe brief: <name>
Status: LOCKED
Lane: internal | saas | lex | marketing
Pattern: <patterns.md section>
Template: <templates.md id>
Opened: <source you actually read — registry JSON, blueprint file, or demo URL>
Primary action: <label>
Regions:
- nav — job — templates.md <id>
- page-header — …
- focal — …
States: empty / loading / error / …
Kit recipe: <kits.md name> + official docs consulted
Techniques: <techniques.md rows used>
Adoption: ritual / persona / path (or n/a)
HTML: shine-wireframe/<slug>.html
DESIGN.md: shine-wireframe/<slug>.DESIGN.md
Unlock: only if user says "unlock structure"
```

`DESIGN.md` names: lane, cite, voice, job, signature, palette, type pairing, layout
ASCII, Salesforce host width if lex.

##### Build handoff rules

1. Read the brief before any paint.
2. Honour regions, primary, and kit recipe.
3. Upgrade placeholders to contract MUST states.
4. Re-render and re-screenshot after paint.
5. If the brief is missing or `Status` is not `LOCKED`, do not invent IA — return to Wireframe.

---

#### Pattern → first kit suggestion

| Pattern ([§ Patterns](#patterns-screen-archetypes)) | Lead with |
|---|---|
| App shell | [§ Templates](#templates-start-from-a-real-page) `shadcn-sidebar-07` |
| Dashboard / metrics | [§ Templates](#templates-start-from-a-real-page) `shadcn-dashboard-01` |
| Insight stream / queue | ranked rows; start from app-shell template chrome |
| Data table | [§ Templates](#templates-start-from-a-real-page) `untitled-table` |
| Form / settings | [§ Templates](#templates-start-from-a-real-page) `shadcn-settings` on the cited shell |
| Landing / marketing | [§ Templates](#templates-start-from-a-real-page) `shadcn-marketing` |
| AI surface | [§ AI surfaces](#ai-surfaces-topologies) topology first — then an app-shell template |
| Dialog / sheet | Base UI / Radix + APG |

See [§ Templates](#templates-start-from-a-real-page) for the ranked catalog. [§ Kits](#kits-which-library-and-worked-recipes) is behavior, not a substitute page.

---

## Direction — art direction before code

Load this after the catalog cite, **before** writing CSS. Lanes: `internal` / `saas` /
`lex` / `marketing`. Marketing gets a signature. LEX usually gets **none — belong**.

A plan that would be emitted for any similar brief is not a plan. Revise it.

#### Lanes

| Lane | Quality bar | Banned |
|---|---|---|
| **internal** | Adoption + contracts + density. Would they open it Monday? | Marketing theater, WebGL, custom cursors |
| **saas** | Type as identity, one accent, empty as brand, keyboard spatial | Three equal KPI cards as the page; Inter-on-zinc; purple glow |
| **lex** | Belong in Cosmos, then one owned moment | Cloning Linear/IBM chrome; org-wide CSS; `@media` for component width |
| **marketing** | One signature + Awwwards-shaped score (design 40 / usability 30 / creativity 20 / content 10) | App-shell + KPI soup; unearned GSAP |

Anti-patterns are **lane-relative**. Glow is a marketing DNA option and a saas/lex fail.

#### Two-pass plan (write `DESIGN.md`)

1. **Ground the subject.** One concrete subject, audience, single job of the page.
2. **Match.** Pick the [§ Templates](#templates-start-from-a-real-page) row from the job in plain words — lane, audience,
   density, information shape, brand, interaction, tone. Read the row's real structure
   before drawing. Candidates must differ by at least three semantic axes; never shuffle.
   Project history is only the final tie-break among equal matches.
3. **Token plan.** 4–6 named roles from the kit's tokens or brand pack — declared as
   custom properties, never invented hex at usage sites.
4. **Type.** Display / body / data pairing from the kit. LEX: Salesforce Sans only.
5. **Layout.** ASCII regions cloned from the template's source.
6. **Image strategy.** State whether the focal evidence is product capture, editorial
   imagery, illustration, data, or deliberately image-free. Name the source and rights.
7. **Signature.** One sentence. Marketing required. LEX: empty state, Path, or
   utility-bar command — not a custom nav.
8. **Anti-repetition.** Name the previous family, hero silhouette, section rhythm, or
   signature device that must not repeat without job-specific evidence.
9. **Uniqueness pass.** Replay a similar brief in your head. A plan that would be emitted
   for any similar brief is not a plan — find the axis this brief actually pins.
10. **Chanel.** Remove one accessory. Spend boldness in one place.

Then build. Do not invent a second DESIGN.md. Unlock structure to change regions.

#### Defaults are hypotheses, not choices

Cream+serif+terracotta, OLED+acid-green, broadsheet hairlines, and indigo-on-zinc are
the four looks a model reaches for unprompted. Any of them can be right **when the brief
pins it**; reaching for one because the axis was free is not a decision. The real
anti-slop mechanism is the template: match a real screen and follow its DNA.
Bento, glassmorphism, gradient, neon and purple are likewise refused as unstated
defaults. Naming one in the brief makes it an explicit demand, not a random style
lottery. If the requested axis has no catalog row, report the gap instead of quietly
substituting the nearest generic SaaS look.

#### Modes (Impeccable)

**Persuade** (marketing) · **Operate** (saas / lex / internal queues) · **Read** (docs,
briefs) · **Experience** (voice, artifact). Operate is density and scan. Persuade is art
direction. Do not run the marketing pipeline on a Lightning record page.

#### After first paint

1. Render in the browser, screenshot, and read the shot.
2. Put the after-shot beside the cited template's reference — the two should read as
   relatives. If they don't, fix the match or the paint. SaaS/marketing mark one visible
   owned moment; a structural clone of a sibling brief is a fail. LEX and explicit
   brand-locked adaptations belong instead of performing originality.

Banned report language: "tighten spacing", "more modern", "shine-paint".

---

## Templates — start from a real page

Run `node corpus/cite.mjs <job>` — it resolves synonyms, extracts readable
source, and points at the pack screenshot when one is harvested. No row for
your screen → start from the nearest row plus [§ Patterns](#patterns-screen-archetypes); add a
row here (via `corpus/index-templates.mjs`) only after the screen shipped and
earned it.

Generated from `corpus/templates.json` — do not hand-edit; run `node corpus/index-templates.mjs`.

A row marked **retired** is not selectable: `cite.mjs` and the packet skip it,
its pack survives only as a regression fixture, and citing it by id is a defect.
Reasons are listed under the table.

| Screen | Id | Kit | Kind | Status | Jobs |
|---|---|---|---|---|---|
| ai-generate | `shadcn-input-group-textarea` | shadcn-registry | source | live | ai-generate, prompt, composer |
| ai-generate | `shadcn-field-choice-card` | shadcn-registry | source | live | ai-generate, prompt, composer |
| app-shell | `shadcn-sidebar-01` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-02` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-03` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-04` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-05` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-06` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-07` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-08` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-09` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-10` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-11` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-12` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-13` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-14` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-15` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `shadcn-sidebar-16` | shadcn-registry | source | live | app-shell, shell, nav, sidebar |
| app-shell | `untitled-sidebar-navigation` | untitled-ui-react | source | live | app-shell, navigation, sidebar |
| app-shell | `mantine-appshell` | mantine | source | **retired** | app-shell, shell, nav, sidebar |
| app-shell | `heroui-next-app` | heroui | source | **retired** | app-shell, shell, nav, sidebar |
| app-shell | `query-adminlte` | adminlte | query-only | live | app-shell, shell, nav, sidebar |
| app-shell | `query-primeblocks` | primeblocks | query-only | live | app-shell, shell, nav, sidebar |
| auth | `shadcn-login-01` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-login-02` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-login-03` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-login-05` | shadcn-registry | source | live | auth, login, signin, signup, sign-in |
| auth | `shadcn-signup-01` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-02` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-03` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-04` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-signup-05` | shadcn-registry | source | live | auth, login, signin, signup, sign-up |
| auth | `shadcn-login-04` | shadcn-registry | source | live | auth, login, signin, signup |
| blog | `shadcn-blog` | shadcn-registry | blueprint | live | blog, article, editorial, post |
| charts | `shadcn-chart-area-axes` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-default` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-gradient` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-icons` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-interactive` | shadcn-registry | source | live | charts, chart, area, dataviz, trend, timeseries |
| charts | `shadcn-chart-area-legend` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-linear` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-stacked` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-stacked-expand` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-area-step` | shadcn-registry | source | live | charts, chart, area, analytics |
| charts | `shadcn-chart-bar-active` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-default` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-horizontal` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-interactive` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-label` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-label-custom` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-mixed` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-multiple` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-negative` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-bar-stacked` | shadcn-registry | source | live | charts, chart, bar, analytics |
| charts | `shadcn-chart-line-default` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-dots` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-dots-colors` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-dots-custom` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-interactive` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-label` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-label-custom` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-linear` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-multiple` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-line-step` | shadcn-registry | source | live | charts, chart, line, analytics |
| charts | `shadcn-chart-pie-donut` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-donut-active` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-donut-text` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-interactive` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-label` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-label-custom` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-label-list` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-legend` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-separator-none` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-simple` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-pie-stacked` | shadcn-registry | source | live | charts, chart, pie, analytics |
| charts | `shadcn-chart-radar-default` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-dots` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-circle` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-circle-fill` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-circle-no-lines` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-custom` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-fill` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-grid-none` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-icons` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-label-custom` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-legend` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-lines-only` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-multiple` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radar-radius` | shadcn-registry | source | live | charts, chart, radar, analytics |
| charts | `shadcn-chart-radial-grid` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-label` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-shape` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-simple` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-stacked` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-radial-text` | shadcn-registry | source | live | charts, chart, radial, analytics |
| charts | `shadcn-chart-tooltip-advanced` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-default` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-formatter` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-icons` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-indicator-line` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-indicator-none` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-label-custom` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-label-formatter` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `shadcn-chart-tooltip-label-none` | shadcn-registry | source | live | charts, chart, tooltip, analytics |
| charts | `tremor-charts` | tremor | source | **retired** | charts, chart, dataviz |
| chat | `spectrum-ai-chat` | react-spectrum | source | live | chat, assistant |
| checkout | `shadcn-checkout` | shadcn-registry | blueprint | live | checkout, payment |
| command-palette | `shadcn-command` | shadcn-registry | source | live | command-palette, palette, cmdk |
| dashboard | `shadcn-dashboard-01` | shadcn-registry | source | live | crud, dashboard, list, records |
| dashboard | `untitled-line-charts` | untitled-ui-react | source | live | dashboard, analytics, charts, dataviz |
| dashboard | `query-shadcn-blocks` | shadcn-registry | query-only | live | dashboard |
| dashboard | `query-haze` | haze | query-only | live | dashboard |
| empty | `shadcn-empty-icon` | shadcn-registry | source | live | empty, ai-generate |
| lex-console | `lex-console` | slds | blueprint | live | lex-console |
| lex-email | `lex-email` | slds | blueprint | live | lex-email, email |
| lex-lwr | `lex-lwr` | slds | blueprint | live | lex-lwr |
| lex-mobile | `lex-mobile` | slds | blueprint | live | lex-mobile |
| lex-queue | `lex-queue` | slds | blueprint | live | lex-queue, queue |
| lex-record | `lex-record` | slds | blueprint | live | lex-record, record, detail, lightning, lwc |
| lex-record | `lex-record-narrow` | slds | blueprint | live | lex-record-narrow, lex-record |
| marketing | `shadcn-marketing` | shadcn-registry | blueprint | live | marketing, landing, pricing |
| marketing-hero | `magicui-hero` | magicui | source | live | marketing-hero, hero, landing |
| queue | `untitled-table` | untitled-ui-react | source | live | queue, crud, table, records, datagrid |
| queue | `shadcn-queue` | shadcn-registry | blueprint | live | queue, worklist, triage, inbox, datagrid |
| record | `shadcn-record` | shadcn-registry | blueprint | live | record, detail, account, opportunity |
| settings | `shadcn-settings` | shadcn-registry | blueprint | live | settings, preferences, account |
| settings | `fluent-nav` | fluentui | source | live | settings |
| weekly-board | `shadcn-weekly-board` | shadcn-registry | blueprint | live | weekly-board, board, cadence, report-out, standup, kanban, elt |
| wizard | `shadcn-wizard` | shadcn-registry | blueprint | live | wizard, stepper, multi-step, onboarding |

129 rows, 3 of them retired. Required screen coverage: dashboard, marketing, auth, checkout, app-shell, crud, queue, record, chat, settings, wizard, empty, command-palette, lex-record.

#### Retired rows — do not cite

- `mantine-appshell` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `heroui-next-app` — shadcn is the house source: both Clearspeed consumers are shadcn/Tailwind repos, so a reference on another kit's runtime cannot be built against; shadcn covers app-shell (shadcn-sidebar-07)
- `tremor-charts` — shadcn is the house kit; shadcn-chart-area-interactive is the chart-led page reference and the corpus carries 70 shadcn chart component packs alongside it

---

## Component contracts — what every named control owes

SSOT for what a named component includes. The MUST/SHOULD lists below were distilled in 2026 from MUI X, Ant Design, IBM Carbon, React Aria/Spectrum, shadcn/Radix (+ TanStack), Untitled UI/Plus UI visual matrices, and OpenAI Apps SDK UI (chat). That sentence is provenance, not a pointer: MUI, Ant and Carbon were deleted from the corpus on 2026-08-31 (`docs/no-foreign-runtimes.md`) and are not there to read. The distilled requirements stayed — a completeness ladder is a fact about tables, not about a vendor.

**Rule:** implement MUST always. For app/admin surfaces, also SHOULD. ASK before building ASK items. Opt-out only when user says simple/static/presentation/minimal.

---

#### Universal (every interactive control)

**MUST**
- Accessible name (visible label or `aria-label` / `aria-labelledby`)
- States: default, hover, focus-visible, active/pressed, disabled
- Keyboard operable per WAI-ARIA APG; focus never trapped accidentally
- Disabled: announced, non-activating, visually distinct
- Hit target ≥40–44px for pointer controls
- Controlled and uncontrolled value patterns where applicable

**SHOULD**
- Loading/pending where async (`aria-busy`, preserve layout width)
- Tooltip or visible label for icon-only controls
- i18n-ready strings; RTL-safe layout

---

#### Button / ButtonGroup / IconButton / SplitButton

**MUST**
- Variants: primary, secondary (outline/tonal), ghost/text, destructive
- Sizes: sm, md, lg
- States: default, hover, focus-visible, pressed, disabled, loading (spinner + disable + keep width)
- Content: label; optional leading/trailing icon
- Icon-only → required accessible name
- Correct `type` (`button` | `submit` | `reset`)
- ButtonGroup: attached/segmented; roving tabindex; exclusive or independent
- SplitButton: primary action + menu chevron; `aria-haspopup` / `aria-expanded`; keyboard menu

**ASK:** long-press, async confirmation beyond loading

---

#### Link

**MUST**
- Semantic `<a href>` (or router Link that renders anchor)
- Focus-visible + hover affordance
- External: `rel="noopener noreferrer"` when `target="_blank"`; optional external indicator
- Do not fake navigation with buttons (or actions with links)

---

#### Input / Search / NumberInput / Password / Textarea

**MUST**
- Visible label (placeholder is never the sole label)
- Helper text + error text (swap, not duplicate); `aria-invalid` + `aria-describedby`
- Required indicator + form-level explanation of required marks
- States: default, hover, focus, filled, error, disabled, read-only
- Correct `type` / `inputMode` / `autocomplete`
- Prefix/suffix or leading/trailing icon slots when pattern needs them
- **Password:** show/hide toggle with accessible name
- **Number:** min/max/step; keyboard-friendly; reject invalid commit
- **Textarea:** label, helper/error, resize policy (vertical|none), min rows; scroll or auto-grow
- **Search:** clear affordance when value present; submit via Enter

**SHOULD**
- Character count when maxLength is meaningful
- Debounced search for remote queries

---

#### Select / Combobox / Autocomplete / MultiSelect

**MUST — Select**
- Trigger shows value or placeholder; listbox popup
- Keyboard: arrows, Home/End, Enter, Escape; typeahead; focus restore
- Disabled options; empty options state; form value sync

**MUST — Combobox / Autocomplete**
- Editable input + popup; filter-as-you-type
- `aria-expanded` / `aria-controls` / activedescendant (or focus move)
- Loading suggestions; no-results; allow/deny custom values (explicit)

**MUST — MultiSelect**
- Selected as chips/tags with remove; keyboard remove
- Keep popup open on select (usual); count summary

**SHOULD**
- Combobox instead of native select when options are long
- Grouped options; async debounce for remote lists
- Select-all when finite multi list

---

#### Checkbox / Radio / Switch / Slider

**MUST**
- **Checkbox:** checked / unchecked / indeterminate; label clickable; Space toggles
- **Radio:** group semantics; one tab stop; arrows change; required group error
- **Switch:** clear on/off meaning; not for ternary choices
- **Slider:** min/max/step; visible value; keyboard arrows/Page; dual-thumb if range
- Group helper + error association

---

#### DatePicker / TimePicker / DateRangePicker

**MUST**
- Text entry + picker popup (or segmented fields)
- Locale-aware format; min/max; disabled dates; clear
- Parse/format errors as field errors
- Range: end ≥ start; incomplete range state
- Time: 12/24h per locale

**SHOULD**
- Today shortcut; mobile sheet/native when appropriate

---

#### Form — CRITICAL

**MUST**
- Every field: `name`, label, description/helper, error, required, disabled, read-only as needed
- Layout: consistent vertical (default) or horizontal; responsive single-column collapse
- Field grouping with section headers or fieldset/legend
- Actions: primary submit; secondary cancel/reset; destructive separated
- Validate on submit always; don’t shout required-empty on first keystroke
- Field errors with `aria-invalid` + `aria-describedby`
- On fail: scroll/focus first invalid field; keep values
- Submit states: idle → submitting (`aria-busy`, disable submit, show progress) → success or fail
- Native Enter submit in text inputs

**SHOULD**
- Top error summary with links to fields (WCAG-aligned enterprise default)
- Dirty / unsaved navigate guard when editing
- Async field validation (unique email) with pending state
- Disable submit while invalid (product choice — support the pattern)

**ASK:** multi-step wizard persistence strategy, draft autosave cadence

---

#### Table / DataGrid — CRITICAL

A “table” in an app is a **DataGrid-class surface**, not bare `<table>` markup — unless user says simple/static/presentation.

A `<table>` with two or more header cells is a named Table whether or not it carries
`data-shine-contract="table"`. That attribute documents; it does not opt in.
Opt out with `data-shine-contract="layout"` or `role="presentation"`. An unmarked data
table still owes the full contract.

##### Anatomy (enterprise data table)
1. Title + optional description  
2. Toolbar (global actions)  
3. Column headers  
4. Rows  
5. Pagination bar (or virtualized scroll end)

##### MUST
- **Chrome:** title (or page-level title); toolbar with search and/or filters; sticky header; horizontal scroll when needed; lead/primary column visually distinct
- **Sort:** per-column asc/desc/unsorted; header indicator; header is a button
- **Filter:** column filters and/or toolbar global search; clear path; filtered-empty distinct from true-empty
- **Pagination** (page size, range text, total or equivalent) **or** virtualized scroll for large sets — pick one and complete it
- **Column resize** (drag; keyboard when using Aria-style grid)
- **Row actions:** inline if &lt;3 actions, else overflow menu; not hover-only (persist on touch)
- **States:** loading/skeleton (keep header); empty + CTA; filtered-empty; error + retry
- **A11y:** consistent table or grid semantics; selection announced if present; keyboard path complete for chosen model
- Client vs server mode for sort/filter/page made explicit when data is remote

##### SHOULD (app/admin default)
- Row selection: none / single / multi; header select-all with **page vs all-filtered defined**; selected count; **batch action bar**
- Column visibility menu (persist if app has prefs)
- Density: compact / default / comfortable
- Active filter chips + Clear all
- Sticky first/lead column when horizontal scroll is heavy
- Server-side hooks: total count, debounce, race-safe fetches

##### ASK (never silent)
- Cell editing, tree/hierarchical rows, row expand detail panels
- Column pin, drag-reorder rows/columns, multi-sort
- Grouping, aggregation, pivot
- Excel/CSV export, realtime push updates
- Virtualization thresholds / infinite query design details

##### Presentation table (only when user opts out)
- Semantic table, clear headers, responsive overflow, empty state — no fake toolbar chrome

---

#### List / Virtualized list

**MUST**
- Stable keys; loading / empty / error
- Selection model if selectable; keyboard operable

**SHOULD**
- Virtualize when N is large; infinite load with sentinel + busy + end
- Typeahead for long selectable lists

---

#### Tabs / Accordion / Disclosure

**MUST — Tabs**
- Tablist + tab + tabpanel; one selected; arrows + Home/End; manual or automatic activation
- Disabled tabs; associated panels

**MUST — Accordion**
- `aria-expanded` / `aria-controls`; Enter/Space; single or multi expand explicit

**SHOULD**
- Tabs overflow (scroll or “more”); deep-linkable selected value

---

#### Menu / Dropdown / Context menu / Command palette

**MUST — Menu / Dropdown**
- Trigger + portal; focus inside; Escape + outside dismiss; restore focus
- Items: icons, shortcuts, separators, disabled, destructive styling, submenus
- Typeahead; roving focus; `aria-haspopup` / `aria-expanded`

**MUST — Context menu**
- Secondary-click / long-press; position near pointer; same item model

**MUST — Command palette**
- Global shortcut (⌘K / Ctrl+K); fuzzy search; grouped commands; keyboard-only complete path; empty + loading states

---

#### Navigation: Sidebar / TopNav / Breadcrumbs / Pagination / Stepper

**MUST — Sidebar**
- Active route; nested sections; expand/collapse; icon+label; keyboard; mobile drawer variant

**MUST — TopNav**
- Brand, primary links, utilities; active state; overflow strategy

**MUST — Breadcrumbs**
- Hierarchy links; current page non-link; collapse middle when long

**MUST — Pagination (standalone)**
- Page size, range text, disabled edges; compact on mobile

**MUST — Stepper**
- States: complete / current / upcoming / error; linear vs optional explicit

---

#### Dialog / Modal / Drawer / Sheet / Popover / Tooltip / Toast

**MUST — Dialog / Modal**
- Role dialog; labelled title; focus trap; initial focus; Escape; restore focus
- Explicit close; footer primary/secondary; scrollable body when needed
- Scrim click: block or warn if dirty/destructive

**MUST — Drawer / Sheet**
- Same focus rules; edge anchor; mobile dismiss pattern

**MUST — Popover**
- Anchored; dismissable; don’t steal focus for pure info

**MUST — Tooltip**
- Hover/focus only; delay; never required info; no interactive content (use Popover)

**MUST — Toast**
- Short message; optional action; auto-dismiss + pause on hover/focus; `aria-live` by severity
- Never the only channel for blocking errors

---

#### Card / Panel / Section header

**MUST**
- Title; optional description; optional actions; content slot
- If clickable: one clear target (whole card **or** nested buttons — not both competing)

**SHOULD**
- Section header aligned to page grid with consistent action placement

---

#### Toolbar / Action bar / Filter bar / Batch bar

**MUST**
- Clear grouping: left = title/search/filters; right = primary actions
- Overflow when actions &gt; ~5
- Batch bar when selection &gt; 0: count + actions + clear selection

**SHOULD**
- Sticky under page header when content scrolls
- Active filters as dismissible chips + Clear all

---

#### Avatar / Badge / Chip / Status

**MUST**
- **Avatar:** image / initials / icon fallback; sizes
- **Badge:** numeric or dot; max (“99+”); never color-only meaning
- **Chip/Tag:** label; dismissible when removable; selected state when toggles
- **Status:** color **and** text/icon; semantic mapping (success/warn/error/info/neutral)

---

#### Progress / Spinner / Skeleton

**MUST**
- Determinate vs indeterminate clear; labeled when meaningful
- Skeleton mirrors layout; region `aria-busy`
- Prefer skeleton for content panels; spinner for actions/buttons

---

#### Empty / Error / Alert / Banner

**MUST**
- **Empty:** title, body, primary CTA (and optional secondary)
- **Error:** what failed, retry/support; visually ≠ empty
- **Alert:** severity, in-context, optional dismiss
- **Banner:** page-level; critical banners not casually dismissible

---

#### File upload

**MUST**
- Click + drag-drop; accept types; max size/count; multiple when needed
- Per-file progress, cancel, remove; errors per file
- Keyboard-operable drop zone

**SHOULD**
- Image preview; retry failed files; paste support where relevant

---

#### Charts / metric cards

**MUST**
- Title, units, legend as needed; loading / empty / error
- Tooltip or focus access to values; not color-only encoding
- Metric card: value, context/period; optional delta

**SHOULD**
- Responsive container; tabular/summary fallback when chart is dense

---

#### Chat / composer (OpenAI Apps SDK–informed)

**MUST**
- Composer always reachable in immersive views
- Auto-grow textarea; send disabled when empty or streaming
- Message list with roles; streaming state; failed-turn retry
- Empty conversation state
- Attachments affordance when product supports files
- Markdown/code rendering with copy for code blocks when shown

**SHOULD**
- Stop/regenerate; virtualized history; attachment preview/progress

**ASK:** retention, model picker, tool-call UX specifics

---

#### Authority cheat-sheet

| Need | Reference model |
|---|---|
| Interaction/a11y | React Aria + WAI-ARIA APG |
| Enterprise form/table API | this file's § Form and § Table MUST lists |
| Product table anatomy | this file's § Anatomy, proven by `untitled-table` |
| React DataGrid batteries | TanStack Table ^8 |
| Composable React stack | shadcn + Radix + TanStack Table/Form |
| Visual variants | Untitled UI / Plus UI |
| Chat embeds | OpenAI Apps SDK UI |

---

## Foundations — tokens, states, accessibility floor

Visual and interaction floor for every UI. Behavior completeness lives in [§ Component contracts](#component-contracts-what-every-named-control-owes). Brand tokens override the neutrals in brand mode ([§ Brand mode](#brand-mode-the-adapter)).

#### Tokens

Prefer semantic CSS variables over scattered hex/Tailwind literals:

```css
:root {
  --bg: /* canvas */;
  --bg-subtle: /* sections, zebra */;
  --fg: /* primary text */;
  --fg-muted: /* secondary text */;
  --border: /* dividers, inputs */;
  --primary: /* brand / main action */;
  --primary-fg: /* on primary */;
  --danger: /* destructive */;
  --success: /* positive */;
  --warning: /* caution */;
  --info: /* informational */;
  --ring: /* focus ring */;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 999px;
  --shadow-sm: /* raised tile — 2 layers, no ring */;
  --shadow-md: /* dropdown, popover, toast */;
  --shadow-lg: /* modal, command palette */;
  --space-1: 4px;  /* 8pt rhythm: 4/8/12/16/24/32/48/64 */
}
```

- Map project brand colors into these semantics; don’t invent a second palette mid-feature.
- Support light (default) and dark only if the product already has dark — don’t add dark “for free.”
- **One token, one meaning.** An accent that also marks the active filter, or a status color
  spent on a categorical chart series, is a vocabulary collapse that every per-element gate
  passes. If two things need to look different, they need two tokens.

##### Direction and data tokens

```css
--direction-good  /* sentiment, not arrow direction */
--direction-bad
--direction-flat
--chart-1 … --chart-8  /* Okabe–Ito colour-universal categorical set */
```

- **Which way is good is a property of the metric, not the palette.** Up is bad for churn,
  DSO, cycle time, cost per lead, backlog. Every metric declares its own `goodDirection`
  and the *sentiment* gets the color — never hardcode up=green.
- **Colour never carries direction alone.** ~8% of men have a red/green deficiency, and
  colour-only meaning is a WCAG 1.4.1 failure. Pair with a glyph (▲ ▼) and a word where
  space allows.
- **Chart series are categorical, not semantic.** Never spend danger/success/warning on an
  ordinary series — readers will read alarm into it. Beyond 8 categories, use small
  multiples rather than more hues.
- The `personal` lane ships light-mode variants for the chart ramp, because five of the
  eight published Okabe–Ito hexes fall below 3:1 on a light canvas. **The `brand`
  lane has no chart ramp** — that is an open token gap needing brand approval, not a
  licence to invent hexes.

##### Elevation tokens

```css
--shadow-sm  /* 2 layers, no ring — a raised tile */
--shadow-md  /* hairline ring + 2 blur layers — dropdown, popover, toast */
--shadow-lg  /* hairline ring + 3 blur layers — modal, command palette */
```

- Each level **is** Rules 6 and 7, pre-satisfied: ≥2 layers, every layer blurred ≥8px carries
  `spread = −blur/4`, and `md`/`lg` open with the `0 0 0 1px` hairline ring so a token user
  cannot ship the mushy edge a bare drop shadow gives.
- **`sm` has no ring on purpose.** A resting card takes `--border`; a ring there doubles the
  hairline. Flat-with-a-border stays the default in product UI — reach for `md`/`lg` when
  something genuinely floats.
- The `personal` lane is dark-first, so the default value carries **4× the light alpha** (24%
  top layer vs 6%). Ship only the light values into a dark UI and every overlay reads flat.
- The `brand` lane tints the shadow **anchor navy**, not black, per brand — and has no
  dark variant, because the lane has no dark mode.
- Never hand-roll a `box-shadow` at a usage site. A focus ring (`0 0 0 Npx`) and an
  `inset` highlight are not elevation and are fine.

##### Tracking tokens

```css
--tracking-xs   /*  0.0078rem, +0.010em at 12px */
--tracking-sm   /*  0                           */
--tracking-base /*  0            — the neutral band is 14–16px */
--tracking-lg   /* -0.0078rem                   */
--tracking-xl   /* -0.0156rem                   */
--tracking-2xl  /* -0.0344rem, −0.020em at 28px */
--tracking-caps /* +0.050em at 12px — all-caps labels (a brand whose UI face is uppercase may want 0.12em) */
```

- **Keyed to the type scale, not named tight/normal/wide.** Rule 4 is a curve, so
  `tracking-lg` is the one that belongs with `text-lg`, and a mismatched pair is visible in
  a diff. `letter-spacing: 0` at every size is the tell this exists to remove.
- `rem`, not `em`: DTCG's dimension type admits `px` and `rem` only, and the measured curve
  these come from is itself published per-size in rem. The em equivalents are in the
  comments so the tie back to Rule 4's figures stays checkable.
- Never write a literal `letter-spacing` at a usage site. `normal`, `var()` and `calc()` are fine.

##### Known token gaps — say so, don't hardcode around them

| Gap | Consequence |
|---|---|
| **No chart ramp in the `brand` lane** | The eight-series categorical set exists in `personal` only. A branded chart needs approved hues; inventing them here would be the vocabulary collapse this file warns about one section up. Say the gap out loud and ask. |

Shadow, tracking and the `text-sm`/`text-base` collision were all on this list until
2026-08-09. Two of them mattered more than they read: **a missing token manufactures the
escape hatch that blinds the gate.** With no shadow token, shipping any shadow meant a raw
`rgba()` at the usage site, so the only route was ignoring the rules entirely —
and once one rule is being ignored, colour and type discipline go with it. The gap did not just leave one
rule unenforced; it taught people to disable the rest. Fill the gap at the token layer
instead — that is the other half of the same fix.

#### Typography

- Define roles: display, title, body, label, caption, mono.
- One UI sans for product chrome unless brand specifies otherwise.
- Avoid Inter/Roboto/Arial as *expressive* marketing display when no brand is set — pick a distinctive pair. (Exception: a brand that licenses those faces — see brand.md.)
- Body ~16px, line-height ~1.5–1.6; tight tracking on large display only.
- Don’t size meaning with color alone; weight and size establish hierarchy.

#### Spacing & layout

- **8pt rhythm** (4px half-step allowed).
- Page: consistent max-width or full-bleed app shell — don’t mix randomly.
- Section gaps larger than component gaps (e.g. 48–96px marketing sections; 16–24px app content stacks).
- Align columns to a grid; avoid one-off magic margins.
- Density: comfortable for marketing; compact available for data-heavy app views.

#### Hierarchy

- One primary action per view (or per obvious region).
- Progressive disclosure for density — hide advanced filters until needed.
- Title → supporting → content → actions reading order.
- Don’t compete: hero CTA vs five equal buttons = broken hierarchy.

#### Elevation & surfaces

- Flat by default; shadow only for overlays (menus, dialogs, popovers) or true floating panels.
- Borders (`--border`) preferred over heavy shadows for cards/tables in product UI.
- Overlay → `--shadow-md`, modal → `--shadow-lg`. Both already carry the hairline ring, so
  do not add a second `border` on top of them.
- Z-index ladder: base → sticky → dropdown → modal → toast. Document in code if non-obvious.

#### Motion

- 150–250ms, `cubic-bezier(0.4, 0, 0.2, 1)` (or equivalent ease-out).
- Purposeful only: open/close overlays, expand/collapse, feedback.
- No bounce spam, no layout thrash, no decorative infinite motion on product chrome.
- Respect `prefers-reduced-motion`.

#### State matrix (visual)

Every interactive surface should show:

| State | Requirement |
|---|---|
| Default | Rest styles |
| Hover | Clear affordance (not color-only if critical) |
| Focus-visible | Ring using `--ring`; never remove without replacement |
| Active/pressed | Immediate feedback |
| Disabled | Reduced contrast + not activatable |
| Loading | Spinner/skeleton + `aria-busy` |
| Error | Token + text |
| Success | Token + text when needed |

#### Accessibility floor

- Contrast: text ≥4.5:1 (WCAG 1.4.3); **non-text graphical objects and UI components ≥3:1**
  against their background *and* against adjacent objects (WCAG 1.4.11) — this covers chart
  marks, series lines, focus rings, borders that carry meaning, and icon glyphs. Text
  *inside* a chart (axis ticks, labels, legends) is text and needs the full 4.5:1; this is
  the most commonly missed contrast requirement on data surfaces.
- Focus order matches reading order.
- Don’t disable zoom / don’t trap scroll under modals incorrectly.
- Status never color-only (pair icon or text).
- Live regions for toasts and async results that aren’t focus-moving.

#### Icons

- One family per product (Lucide is a solid default).
- Stroke weight consistent (~1.5–2px at 16–24px).
- Icon-only controls require accessible names (+ tooltip or sr-only text).

#### Imagery & texture

- Real product/context imagery beats abstract gradients as the main idea.
- Decorative gradients are atmosphere, not the hero concept.
- Marketing: full-bleed hero as dominant plane when a hero exists (see [§ Patterns](#patterns-screen-archetypes)).

---

## Taste — measured thresholds and failure tells

Measured, not asserted. Production CSS from 18 shipped products was fetched, extracted and analysed (~4.5 MB). Where a claim comes from measurement it says so. Where it comes from published literature it says that instead.

The point of this file: every existing rule set answers *"does this violate a rule?"* This one answers *"is this good?"* — in terms a program can check.

---

#### Part 1 — Reference token values

Measured directly from shipped stylesheets.

##### Linear
- **Type:** Inter Variable (UI), Tiempos Headline (serif display), Berkeley Mono
- **Weights:** 300 / 400 / **510** / **590** / **680** — non-round variable instances
- **Body:** 15px, line-height 1.6, tracking −0.011em
- **Scale:** 10, 12, 13, 14, 15, 17, 18, 20, 24, 32, 40, 48, 56, 64, 72
- **Tracking curve:** −0.012em at 17–24px → −0.022em at 32px+
- **Leading curve:** 1.6 @15 · 1.4 @17 · 1.33 @20–24 · 1.125 @32 · 1.1 @40 · 1.0 @48 · 1.06 @64
- **Radius:** 4, 6, 8, 12, 16, 24, 32, 9999 — only 7 distinct px values
- **Dark surfaces:** `#08090a #0f1011 #141516 #191a1b` — hue 210° throughout, ΔL = +2.7, +2.0, +2.0
- **Accent:** `#7170ff` = OKLCH(62.3%, 0.207, 279°)
- **Motion:** 0.1s quick, 0.25s regular, 0.15s fade-out
- **Widths:** page 1024px, **prose 624px**, homepage 1344px
- **Other:** explicit 17-step z-index ladder; `--min-tap-size: 44px`; hairline 1px → 0.5px at 2dppx

##### Vercel / Geist
- **Grays are chroma exactly 0** — `hsl(0, 0%, L)`. A deliberate counterexample to "grays must be tinted."
- Parallel **alpha ramp** (4%…91%) for overlaying on unknown backgrounds
- Palette authored natively in OKLCH — 173 declarations
- **Shadow ladder:** `2xs 0 1px 1px #0000000a` (4%) → `2xl` three layers at 2/4/6%. Dark mode is identical geometry at **4× alpha**
- **Composite elevation:** hairline ring + shadow + background-colored outer ring. Overlays never get a bare drop shadow
- Focus: `0 0 0 2px var(--background), 0 0 0 4px var(--focus)`
- Durations 0.15s (37×), 0.2s (37×), 0.25s (20×) · `:where()` 566× · `focus-visible` 259×

##### Notion
- **Warm grays:** hue 26–60°, saturation 2–10%
- **Line-heights ARE the spacing tokens** — `--font-line-height-200: var(--dimension-spacing-24)`. 100% land on the 4px grid
- **Tracking curve:** +0.0078rem @12px → 0 @14–16 → −0.0078 @18–20 → −0.0156 @22 → −0.047 @32 → −0.156 @76 → −0.2875 @96
- **At the same size, regular takes ~1.6× more negative tracking than bold** (32px: −0.0625rem vs −0.046875rem)
- `font-feature-settings` referenced **1,519 times**, per type role
- `--shadow-200` = 4 layers, offsets/blurs growing ×2.3–2.8, alpha growing linearly 1.3% → 4%

##### Others, in brief
- **Stripe:** headings ship at `font-weight: 300`. Radius 2, 4, 6, 16, 32 — **no 8px**. Border widths 1px, **1.25px**, 2px. Ships `calc(radius - 1px)` for nesting. 68 `prefers-reduced-motion` blocks, the most in the set. Measure capped in `ch`.
- **Clerk:** 1,193 `color-mix(in oklab, …)` — the palette is derived, not picked. Shadows are hue-tinted `#212126`, not black.
- **Liveblocks:** one base radius, everything else derived — `calc(.5 * r)`, `calc(.675 * r)`, `calc(r - .75 * 4px)`. `:where()` 770×.
- **Raycast:** greys at hue 180–240° with **saturation rising 0% → 17.6% as lightness falls**. Heaviest shadow layering measured (mean 5.7).
- **Superhuman:** `light-dark()` 101×, relative color syntax 106×. Dark background is a brand-tinted black, never `#000`.
- **Things 3:** `em`-based radii, so radius scales with type size. "Grays" are translucent navies.

---

#### Part 2 — 40 checkable rules

##### Color & surface
1. **Gray ramps must be hue-monotone.** Every step within ~35° of every other; saturation ≤12% or chroma ≤0.05. Either commit to a hue family or commit to chroma-0. Mixed-sign hue across a ramp is the defect.
2. **Adjacent surfaces differ 1.6–4 percentage points of lightness, mode ≈2.0.** ≥6pp is a smell. Borders carry separation.
3. **In a tinted dark ramp, saturation rises as lightness falls.** A linearly-desaturating ramp reads dead.
4. **Accent chroma lands in OKLCH 0.13–0.24 at L 55–65%.** Tailwind's `-600` row is 0.245–0.288 — above the entire reference set.
5. **Derive the palette, don't hand-pick it.** Ten hand-picked hexes won't stay in relationship; a `color-mix()` formula will.

##### Type
6. **The scale is two ratios.** ~1.10–1.15 in the UI band (11–24px), ~1.20–1.25 display.
7. **Line-height is a monotonically decreasing function of size, peaking at body size** — and it falls going smaller too.
8. **Floor: ≥1.33 at 12px, ≥1.40 at 14–15px.** Dense UIs cut padding, not leading.
9. **Tracking is a function of size AND weight.** Regular needs ~1.6× more negative tracking than bold at the same size.
10. **Display crosses to negative tracking at 20–24px, reaching −0.02 to −0.035em by 48px.**
11. **Use non-round variable weights** — 450, 510, 590, 680 — where the face supports them.
12. **One custom or licensed face, minimum.** 11 of 13 measured products use a non-Google face.
13. **Set `font-feature-settings` per role, not globally.** `tabular-nums` on every numeric column is a hard requirement.

##### Shape
14. **`child radius = parent radius − padding`, never child > parent.** Ships as literal `calc()` in production.
15. **Radius scales with element size.** Controls 4–6px, cards 10–12px, sheets 16–20px, pills full. One value everywhere is the tell.
16. **Consider deriving all radii from one base.**

##### Depth
17. **≥2 layers; overlays 3–5.**
18. **Offsets and blurs grow geometrically (×2–2.8 per layer); alpha grows linearly and stays low.**
19. **Top-layer alpha ≤6% in light mode.** Tailwind's `shadow-lg` is 10% on both layers.
20. **Any layer with blur ≥8px carries negative spread ≈ −blur/4 to −blur/2.** Without it the shadow haloes past the silhouette.
21. **Elevation = hairline ring + blur layers + background ring.**
22. **Dark mode: raise the surface and add a 1px top inner highlight.** Don't reuse the light shadow. Where dark shadows are used, alpha ≈4× light.
23. **Hairlines below 1px are real** — 847 occurrences of `0.5px` across the set.
24. **Separation preference order: spacing > background > shadow > border.**

##### Motion
25. **Duration mode across 4.5 MB is 150ms.** Plus a distinct 50/75/80ms micro-feedback band.
26. **By role:** 100–150 micro · 150–250 standard · 200–300 overlays. **Exits ~20% faster than entrances.** Match duration to distance.
27. **By role, easing:** entering/exiting → ease-out · moving on screen → ease-in-out · hover → ease · constant motion → linear (the one legitimate use).
28. **Press feedback is `scale(0.96–0.99)`.** Hover transforms are tiny — 2–3px.
29. **Never start an entrance at `scale(0)`.** 0.93–0.95; dialogs from ~0.8.
30. **Don't animate high-frequency keyboard-driven surfaces at all.** Command palettes, context menus, theme toggles.

##### Layout
31. **Optical alignment is real and shipped** — sub-pixel nudges appear throughout production CSS.
32. **Spacing is a 4px-base non-linear scale that goes coarse at the top.**
33. **Optionally snap line-height to the spacing grid.** Notion does this literally; its vertical rhythm is provably tighter.
34. **Prose caps at 45–75ch** — the intersection of Bringhurst (45–75) and Butterick (45–90). Vary content width by role.
35. **Ship an explicit z-index token ladder.** Ad-hoc `9999` is the alternative.

##### Interaction hygiene
36. **`focus-visible` + `outline-offset`, not `outline: none`.** Modern browsers respect `border-radius` on `outline` — this corrects older advice to use `box-shadow` instead.
37. **Guard hover behind `@media (hover: hover)`.**
38. **`prefers-reduced-motion` is table stakes** — present in 11 of 13.
39. **`text-wrap: balance` on headings, `pretty` on body.**
40. **Name your transition properties.** Never `transition: all`.

---

#### Part 3 — Failure taxonomy

Each written so it can be detected. The tell → the fix.

##### Color
1. `linear-gradient(135deg, …)` purple→blue → single flat surface, or same-hue with ΔL ≤12%
2. Computed color exactly equals a Tailwind default with no `@theme` override → override at minimum the accent ramp
3. `#000` on `#fff` → `oklch(21% .006 286)` on `oklch(98.5% 0 0)`
4. Accent chroma >0.24 as a large fill → ≤0.08 for large fills; reserve >0.2 for under 5% of pixels
5. Chroma-0 neutrals beside a chromatic accent → be consistent in either direction
6. `background-clip: text` gradient on an h1 → solid. If kept, you must unset the gradient on `::selection`
7. Shadow colored with the accent hue → tinted black, ambient + direct
8. Semantic colors picked ad hoc → use a documented 12-step family
9. Status by color alone → icon + text label
10. Large dark gradient banding → radial gradients, never a scaled/blurred filled rect
11. `:hover` computed color equals base color → every state must increase contrast

##### Type
12. Inter with zero tracking and zero feature settings → the single loudest AI signal
13. `letter-spacing: 0` at ≥36px → −0.025em at 36–48, −0.05em above 60
14. `line-height ≥1.4` at ≥30px → 0.95–1.1 display
15. Everything at 1rem → ≥3 roles with size, weight and color changing together
16. Hierarchy from size alone → change three axes at once
17. Weight jumping 400→700 → 500–600 for medium headings
18. Any weight below 400 in UI → floor at 400
19. `text-transform: uppercase` with tracking 0 → +0.025 to +0.1em
20. Measure >75ch → ~65ch
21. `text-align: center` on a paragraph >2 lines → left-align
22. `font-weight` change on hover → causes reflow; change color or add a ring
23. Literal `...` and straight quotes → `…` and curly quotes
24. Numeric columns without `tabular-nums`
25. Headings without `text-wrap: balance`
26. `<input>` font-size <16px on mobile → iOS zooms on focus and it feels broken

##### Layout
27. `max-width: 1200px; margin: 0 auto` as the only layout decision → differentiate by content role
28. Three identical `grid-cols-3` feature cards → the universal AI landing page
29. Hero → 3 cards → CTA → footer, nothing else → lead with the actual artifact above the fold
30. One gap value used for >80% of gaps → three tiers: 8 intra-component, 16 intra-group, 64–96 inter-section
31. Any margin or padding not ≡ 0 mod 4px
32. Icon+label row with `items-center` and no optical nudge
33. Everything centered → left-align content-dense sections
34. Nothing happens above 1200px
35. Horizontal scrollbar leak → usually a flex child missing `min-w-0`
36. Interactive target <24px (mobile <44px) → expand hit area with a pseudo-element

##### Shape & depth
37. `border-radius: 8px` on every element regardless of size
38. `child_radius ≥ parent_radius` → corners visibly don't run parallel
39. Computed shadow exactly equals unmodified `shadow-lg` → author your own alphas
40. Single-layer shadow at large blur → no real object casts one shadow
41. Pure-black shadow on a hued background
42. `border: 1px solid rgba(0,0,0,0.1)` everywhere → muddy, and invisible in dark mode
43. `backdrop-filter: blur()` on anything not genuinely over content
44. Focus indicator that squares off a rounded element

##### Motion
45. `transition: all`
46. Animating `top`/`left`/`width`/`height`/`margin`/`padding` → transform and opacity only
47. `linear` on a transform, or shipping Tailwind's default easing on an entrance
48. Duration >300ms on hover or active
49. Entrance and exit at identical duration
50. `scale(0)` → `scale(1)` entrance
51. Default `transform-origin` on a popover → set it to the trigger
52. Keyframes where a transition would do → keyframes can't be interrupted mid-flight
53. No `prefers-reduced-motion` anywhere in the bundle
54. Hover that changes box dimensions → neighbors shift, pointer flickers out
55. Spring physics on discrete state changes → springs are for gesture-driven surfaces

##### Icons, imagery & content
56. Emoji inside a button or heading → renders per-OS, can't inherit `currentColor`
57. Two icon libraries in one bundle → detect via mixed viewBox conventions
58. Inconsistent `stroke-width` across icons
59. Icon sized to cap-height, dominating its label → icon box ≈1em, glyph ≈0.85em
60. **Stock photography.** Uniformity tell of exactly the same kind as default tokens. Use real product surfaces, generated texture, data as ornament, or typographic covers.
61. A "Trusted by" row of invented logos → fabricated social proof, an integrity problem
62. Blurred gradient mesh blob behind the hero → and if kept, it must have `pointer-events: none`
63. ✨ 🎉 🔥 in headings, buttons or badges → the most reliable generated-content marker
64. Badges on elements with no state to communicate
65. Vague button labels — "Continue", "Learn More", three "Get Started" on one page
66. Error message stating a problem with no next step

##### State
67. Click handler with no `:hover` rule
68. `outline: none` with no replacement
69. Disabled = `opacity: 0.5` and nothing else → usually drops below contrast minimums. And disabled buttons must not carry tooltips; they're unreachable
70. Submit disabled before the user has typed → hides which field is wrong
71. Loading button that replaces its label with a spinner → width jumps, verb lost
72. No empty state — a zero-row table renders as a bare header
73. Spinner where a skeleton belongs, or a skeleton whose shape doesn't match the loaded content
74. Corner toast for a local action → inline checkmark at the trigger
75. Destructive action fires immediately → confirmation or an undo window
76. State held only in component state, never in the URL

##### Dark mode
77. Dark palette produced by inverting light → hue relationships invert too
78. `background: #000` → OLED smearing, and elevation becomes inexpressible
79. `color: #fff` body text on dark → halation. Reserve pure white for one element
80. Light-mode shadows reused in dark → invisible on a near-black surface
81. Accent carried into dark at identical chroma → saturated hues bloom on dark
82. **Missing `color-scheme: dark` on `<html>`** → the most common visible dark-mode defect. Scrollbars, native `<select>`, date pickers and autofill all render light
83. Theme toggle animating every element → suppress transitions for one frame during the swap
84. Contrast verified only in light mode

---

#### Sources

Measured: production CSS from Linear, Stripe, Vercel, Notion, Raycast, Clerk, Resend, Superhuman, Things, Liveblocks, Dia, Observable, Val Town.

Published, verified: Refactoring UI (Wathan/Schoger) · Practical Typography (Butterick) · Elements of Typographic Style (Bringhurst) · Material 3 token files · IBM Carbon · Apple HIG · `vercel-labs/web-interface-guidelines/AGENTS.md` · `interfaces.rauno.me` · `emilkowal.ski/ui/agents-with-taste`.

Two corrections worth carrying: the widely-cited "Bringhurst says 1.5× leading" is not his — those are Rutter's web-era figures. And Refactoring UI's free color chapter explicitly denies a numeric hue-rotation rule.

---

## Color and type — the method

Color, typography and icons. Verified 2026-08-04.

---

#### Color

##### Platform

| Feature | Baseline | Since |
|---|---|---|
| `oklch()` / `oklab()` | **Widely** | widely 2025-11 |
| `color-mix()` | **Widely** | widely 2025-11 |
| Relative color syntax | Newly | 2024-09 |
| `light-dark()` | Newly | 2024-05 |
| Gradient interpolation `in oklch` | Newly | 2024-06 |

All four are production-safe. Tailwind v4's default palette is already OKLCH.

##### Method — one brand color to an accessible perceptual ramp

Anchor in OKLCH with a fixed lightness ladder and chroma tapering at both ends. Derive states with relative color syntax so there's no rebuild step. Collapse both themes with `light-dark()`.

```css
:root {
  --brand-h: 256;
  --brand-c: 0.19;
  --brand-1:  oklch(0.985 calc(var(--brand-c) * 0.10) var(--brand-h));
  --brand-9:  oklch(0.620 var(--brand-c)              var(--brand-h));
  --brand-12: oklch(0.280 calc(var(--brand-c) * 0.55) var(--brand-h));
}
.btn:hover { background: oklch(from var(--brand-9) calc(l - 0.05) c h); }
.surface   { background: light-dark(var(--brand-1), var(--brand-12)); }
```

Gamut-clamp at build time:

```js
import { converter, clampChroma, formatCss } from 'culori';
const oklch = converter('oklch');
const step = (base, L) => formatCss(clampChroma({ ...oklch(base), l: L }, 'oklch', 'rgb'));
```

**Gotcha:** `@supports` with a custom property in the test **always returns true**. Feature-detect with a literal: `@supports (color: oklch(from red l c calc(h + 180)))`.

##### Contrast policy — gate on WCAG 2 AA, report APCA as advisory

**APCA is not the WCAG 3 algorithm.** It was pulled from the WCAG 3 Working Draft in **July 2023** for failing to gain working-group support, and the April 2026 editor's draft states the contrast algorithm is **yet to be determined**. WCAG 3 won't reach Recommendation before ~2028–2030.

Library facts that are widely misreported:
- **`culori@4.0.2` has no APCA.** Verified by grepping the entrypoint — zero hits. This claim is repeated constantly and is false. It does have `wcagContrast`, `clampChroma`, `toGamut`.
- **`chroma-js@3.2.0` has a real `contrastAPCA()`** — APCA-1.0.98G constants, auto alpha-blending. One dependency, both algorithms. Its own header calls it beta.
- **`colorjs.io@0.7.1`** exports six contrast algorithms but is still 0.x, so the API isn't frozen.
- **`apca-w3@0.1.9` is frozen since 2022-07 and is licensed "Limited W3 License," not MIT.** A genuine legal flag for commercial use. Only reach for it if you need `fontLookupAPCA`.
- **`@texel/color`** — MIT, ~3.5 KB, gamut mapping 69–132× faster than culori. The right pick for per-frame color.

**`@radix-ui/colors` is still 3.0.0 from October 2023** — repo alive but feature-frozen and pre-OKLCH. The 12-step mental model remains the standard; the package doesn't. OKLCH alternatives copying the structure: `@strum/colors`, `tailwindcss-radix-colors`.

Tooling: **Harmonizer** (Evil Martians) generates OKLCH scales at constant chroma/contrast. `apcach` gives "most saturated color at a given contrast" but **npm is stale at 0.6.4 while the repo was pushed 2025-02** — take it from source.

---

#### Typography

##### The scale is a token. Use it.

Type had no tokens at all until 2026-08-08, and every surface answered that by inventing
its own: one product board reached 12/13/14/15/16px in one stylesheet; another screen used
bare rem, and a review asking "what's the scale?" had nothing to point at. Six sizes now
ship on every target — CSS vars, Tailwind `text-*`, artifact CSS, Python:

| Token | Value | For |
|---|---|---|
| `--shine-text-xs` | 0.75rem / 12px | metadata, uppercase labels, counts |
| `--shine-text-sm` | 0.875rem / 14px | dense rows, buttons, secondary text |
| `--shine-text-base` | 0.9375rem / 15px | body |
| `--shine-text-lg` | 1.125rem / 18px | panel and section headings |
| `--shine-text-xl` | 1.375rem / 22px | screen title |
| `--shine-text-2xl` | 1.75rem / 28px | display |

Line height rides along: `--shine-leading-tight` 1.2 (headings), `snug` 1.35 (dense rows),
`normal` 1.5 (body), `relaxed` 1.65 (long prose). Tailwind's own `--text-*` scale is wiped
the same way its palette is, so `text-4xl` is not reachable — an off-system size has to be
argued for, not typed by habit.

`rem`, deliberately: a px type scale ignores the browser text size the reader chose. Fluid
display type still uses `clamp()` (below) — the tokens are the discrete UI scale, not a
replacement for it.

##### What separates expensive from amateur — measurable properties only

1. **Optical size.** `font-optical-sizing` is Baseline Widely since 2020. Inter's variable font has `opsz 14–32`. Using it is the single biggest "designed, not defaulted" signal.
2. **Size-inverse tracking.** −0.02 to −0.03em above 60px · −0.01 to −0.02em for large headings · 0 at body · +0.04 to +0.08em for all-caps. Always in `em`. **A system where every size has `letter-spacing: 0` is the tell.**
3. **Weight also drives tracking.** At the same size, regular needs ~1.6× more negative tracking than bold — lighter strokes leave more apparent counter-space.
4. **Line-height is a ratio, not a constant.** ~1.5–1.6 body, ~1.1–1.2 display, and it must vary with size.
5. **Tabular figures in tables.** `font-variant-numeric: tabular-nums`. Numbers that jitter column-to-column read as broken.
6. **Leading trim.** `text-box-trim` / `text-box-edge` is Chrome 133 + Safari 18.2, **no Firefox** — progressive enhancement only, but it's what makes headings sit optically flush instead of floating.

```css
:root { font-optical-sizing: auto; font-variant-numeric: tabular-nums lining-nums; }
h1 {
  font-size: clamp(2.28rem, 1.79rem + 2.44vw, 3.82rem);
  font-variation-settings: "opsz" 32;
  letter-spacing: -0.022em;
  line-height: 1.05;
  text-wrap: balance;
}
p { max-inline-size: 68ch; line-height: 1.6; text-wrap: pretty; }
@supports (text-box: trim-both cap alphabetic) { h1 { text-box: trim-both cap alphabetic; } }
```

##### Fluid scales

**Utopia** (`utopia-core@1.6.0`) — two viewport poles plus two ratios generate a `clamp()` per step. `calculateTypeScale`, `calculateSpaceScale`, `calculateClamps`; returns a `wcagViolation` flag per step.

Why it beats hand-rolled `clamp()`: the *ratio itself* widens with the viewport, so hierarchy tightens on mobile and opens on desktop. That's what makes responsive type feel designed rather than merely scaled.

##### Typefaces that read premium (all free, verified on Fontsource 5.3.0)

- **Inter** — the only one here with a true `opsz` axis. Best default.
- **Geist / Geist Mono** (Vercel) — closest free Söhne substitute; rational, tight.
- **Instrument Sans + Instrument Serif** — the pair that most reliably reads editorial-expensive.
- **Fraunces, Newsreader, Literata, Source Serif 4** — serif display with real optical axes.
- **Mono:** Geist Mono, JetBrains Mono, Commit Mono.

Self-host via `@fontsource-variable/*`. Note the unscoped `fontsource` package is a security placeholder — the real ones are `@fontsource/*` and `@fontsource-variable/*`.

---

#### Icons

| Library | Version | Count | License | Grid | Stroke |
|---|---|---|---|---|---|
| `lucide-react` | 1.28.0 | 1,756 | ISC | 24 | **2**, round |
| `@tabler/icons-react` | 3.46.0 | 6,184 | MIT | 24 | 2, round |
| `iconoir-react` | 7.11.1 | 1,671 | MIT | 24 | **1.5**, round |
| `@phosphor-icons/react` | 2.1.10 (2025-05) | 1,512 × 6 weights | MIT | **256** | filled paths |
| `@radix-ui/react-icons` | 1.3.2 (2024-11) | 332 | MIT | **15** | filled |

**The property that determines "expensive" is stroke-to-grid ratio.** 1.5/24 (0.0625) reads refined; **2.0/24 (0.083) reads utilitarian** — the developer-tool weight. Secondary: round terminals, restrained corner radii, and a *smaller curated set* (sprawl guarantees long-tail inconsistency).

- **Iconoir** is the best fit — the only actively maintained library whose *default* is 1.5/24 round. Zero tuning.
- **Phosphor `light`** gives the strongest editorial-luxury look, plus `duotone` as an accent register. Cost: React package 14 months stale, weight fixed at import, and a 256 viewBox mixes awkwardly with 24-grid sets.
- **Lucide at `strokeWidth={1.5}`** mostly works and is the best-maintained choice, but the geometry was drawn for stroke 2, so some joins go optically loose when thinned.

Lucide hit 1.0 in March 2026 and is now on a weekly cadence. **Radix Icons is not deprecated and was not merged into Radix Themes** — both claims are false — but it is feature-frozen at November 2024.

---

#### Imagery

**Stock photography is a uniformity tell of exactly the same kind as default tokens.** Everyone licenses from the same three libraries, so everyone's "team collaborating" shot is interchangeable. Banned outright.

What to use instead, in preference order:
1. **Real product surfaces** — actual screenshots, actual data, cropped hard and treated as texture rather than documentation.
2. **Generated fields** — gradient meshes, grain, dithering, flow fields. Procedural, ownable, and infinitely variable. See [§ Motion](#motion-durations-easing-reduced-motion) for the technique hierarchy.
3. **Data as ornament** — a real chart rendered large and abstracted. Earns its place twice.
4. **Typographic covers** — set the title enormous and let the type be the image.

If a photograph is genuinely required, it must be commissioned, taken in-house, or a specific documented artifact. Never a search result.

---

#### Modern CSS layout — Baseline status

| Feature | Baseline | Became |
|---|---|---|
| `@layer` | **Widely** | 2024-09 |
| Container queries (size) | **Widely** | 2025-08 |
| Subgrid | **Widely** | 2026-03 |
| CSS nesting | **Widely** | 2026-06 |
| `:has()` | **Widely** | 2026-06 |
| `text-wrap: balance` | Newly | 2024-05 |
| Container **style** queries | Newly | 2026-05 — **custom properties only** |
| `field-sizing: content` | Newly | 2026-06 |
| Anchor positioning | see note | — |
| `text-wrap: pretty` | **Limited** | no Firefox |
| Scroll-state queries | **Limited** | Chromium only |

**Three of these crossed to Widely in the last five months.** If your mental model says subgrid, nesting or `:has()` are still risky, that's stale.

**Anchor positioning is genuinely tri-engine, not Chromium-only** — Chrome 125, Firefox 147, Safari 26, ~82% coverage. Baseline says "limited" because Chrome and Safari are flagged partial on `position-anchor`'s *initial value*. Operational rule: always set `position-anchor` explicitly and gate on `@supports`.

**Nesting has a version trap.** Bare type selectors need `CSSNestedDeclarations`: Chrome 130 / Firefox 132 / Safari 18.2. In Chrome 120–129 and Safari 17.2–18.1, declarations appearing *after* a nested rule are **silently dropped**.

---

#### Design tokens

**DTCG published `2025.10` as a Final Community Group Report on 2025-10-28** — explicitly "considered stable." If anything says perpetual editor's draft, that's stale.

⚠️ `tr.designtokens.org/format/` **redirects to a living preview stamped "Do not attempt to implement this version."** Use `designtokens.org/tr/2025.10/`.

⚠️ **A bare hex string is no longer a valid color** — verified against the official JSON Schema:

```json
{ "Hot pink": { "$type": "color",
  "$value": { "colorSpace": "srgb", "components": [1,0,1], "alpha": 1, "hex": "#ff00ff" } } }
```

`colorSpace` + `components` required; `hex` is a **fallback hint, not the value**. 14 legal color spaces including `oklch`. `dimension` is likewise `{value, unit}` with unit enum **only `px | rem`**.

**Use Terrazzo, not Style Dictionary.** `@terrazzo/cli@2.5.0` has resolvers, modes, and the only first-party Tailwind v4 `@theme` emitter. `style-dictionary@5.5.0`'s own docs say 2025.10 "does not have full support yet," and it has no resolver. Pick Style Dictionary only if you later need iOS/Android/Compose targets.

⚠️ **Verify before relying on it:** whether `@terrazzo/plugin-tailwind` emits `@theme` or `@theme inline`. Documented output shows plain `@theme` with literal values, which would **not** support runtime theme switching.

**The `@theme` vs `@theme inline` distinction is the #1 cause of "dark mode doesn't switch" in Tailwind v4:**

```css
:root             { --brand-500: oklch(0.62 0.19 256); }
[data-theme=dark] { --brand-500: oklch(0.72 0.16 256); }
@theme inline     { --color-brand-500: var(--brand-500); }
@custom-variant dark (&:where([data-theme=dark] *));
```

Plain `@theme` only for values that never change per context.

---

## Motion — durations, easing, reduced motion

Nothing in shadcn, visx, nivo or D3 animates. This is the gap that has to be filled by hand.

Verified 2026-08-04 against npm, GitHub, and the Web Platform Status API.

---

#### The token set

Rules encoded: exits faster than entrances; distance and surface area drive duration, not importance; decelerate entering, accelerate leaving; springs only where motion is interruptible or gestural.

```css
:root {
  /* Easing */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);      /* M3 standard. Default for ~80%. */
  --ease-out:      cubic-bezier(0, 0, 0, 1);         /* Entering: fast start, soft landing */
  --ease-in:       cubic-bezier(0.3, 0, 1, 1);       /* Leaving */
  --ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);   /* Symmetric moves A→B on screen */
  --ease-spring: linear(
    0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%,
    0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50.1%, 1.015 60%, 1.006 76.2%, 1
  );                                                  /* ≈ bounce 0.2, runs off main thread */

  /* Duration */
  --dur-instant: 100ms;  /* hover, focus ring, checkbox, color change */
  --dur-fast:    150ms;  /* press, tooltip, small icon state */
  --dur-base:    200ms;  /* DEFAULT — dropdown, popover, menu */
  --dur-slow:    300ms;  /* modal, drawer, accordion, layout shift */
  --dur-slower:  400ms;  /* bottom sheet, full panel, route transition */
  --dur-crawl:   600ms;  /* full-screen hero / choreographed sequence ONLY */

  --dur-exit-base: 150ms;  /* ~0.75× the matching entrance */
  --dur-exit-slow: 200ms;
}
```

| Interaction | Duration | Easing |
|---|---|---|
| Hover, focus ring | instant | standard |
| Button press | fast | out |
| Tooltip | fast | out |
| Dropdown / menu / popover | base | out in, in out |
| Modal / dialog | slow | out in, in out |
| Bottom sheet / drawer | slower | spring (gestural, interruptible) |
| Accordion / expand | slow | standard |
| Layout shift (FLIP) | slow | standard |
| Toast | base / exit-base | out / in |
| Route transition | slower | standard |
| Skeleton / progress loop | 1000–1500ms | linear |

**Two opinions worth stating.** `--dur-base: 200ms` is the correct default — reach for it and move on. And use `--ease-standard` for ~80% of motion: curve variety is where design systems go to die, and consistency reads as expensive far more reliably than expressiveness does.

**Empirical backing.** NN/g: 100–500ms for most animation, ~100ms for simple feedback, 200–300ms for substantial screen changes. Their line worth internalising — *"It is far more common for animations to be too long than too short."* Material's `extra-long` tokens reach 1000ms, which NN/g would call far too slow for anything but a full-screen hero.

---

#### Material 3's actual published values

Pulled from Google's generated token file, not the docs site.

**Easing:** `emphasized` `(0.2,0,0,1)` · `emphasized-accelerate` `(0.3,0,0.8,0.15)` · `emphasized-decelerate` `(0.05,0.7,0.1,1)` · `standard` `(0.2,0,0,1)` · `standard-accelerate` `(0.3,0,1,1)` · `standard-decelerate` `(0,0,0,1)` · `legacy` `(0.4,0,0.2,1)`

> **`emphasized` and `standard` are byte-identical in the web token export.** M3's spec describes emphasized as a two-part spline that a single cubic-bezier cannot represent, and the export flattens it. Anyone quoting a distinct emphasized bezier is quoting an approximation. To get the real feel, express it as `linear()`.

**Duration (ms):** short 50/100/150/200 · medium 250/300/350/400 · long 450/500/550/600 · extra-long 700/800/900/1000

**State layers:** hover **0.08**, focus **0.12**, pressed **0.12**, dragged **0.16**. (Focus is 12%, not 10%; hover and pressed differ.)

**IBM Carbon durations (ms):** fast-01 70 · fast-02 110 · moderate-01 150 · moderate-02 240 · slow-01 400 · slow-02 700. Its easings split productive vs expressive, and **entrance eases out while exit eases in**.

---

#### Library state

| Library | Version | License | min+gzip | Verdict |
|---|---|---|---|---|
| `motion` | 12.43.0 | MIT | 44.2 KB | **The 2026 React default** |
| `gsap` | 3.15.0 | Custom, **not OSI** | 26.7 KB | Free now, but no forking/redistribution |
| `@react-spring/web` | 10.1.2 | MIT | 19.6 KB | Lightest real option |
| `animejs` | 4.5.0 | MIT | 39.3 KB | Lightweight middle, non-React friendly |
| `@formkit/auto-animate` | 0.10.0 | MIT | 3.2 KB | List reordering only, perfect at it |
| `@theatre/core` | 0.7.2 | Apache-2.0 | — | **Dormant** — no public commit since Aug 2024 |

**The Motion rename is misleading.** `motion` depends on `framer-motion`; both publish in lockstep at the same version. The rename is a thin re-export over the still-live implementation package. So seeing `framer-motion` in your lockfile is correct, not a bug — don't add resolutions to strip it, and don't let a "remove deprecated package" lint rule fire on it.

**Prefer `visualDuration` + `bounce` over `stiffness`/`damping`.** From Motion's source: `dampingRatio = 1 - bounce`. So bounce 0 is critically damped, 0.3 gives ratio 0.7. `visualDuration` is when the animation *appears* to arrive — settling happens after — which finally lets a spring be time-coordinated with a CSS transition.

```jsx
import { motion, AnimatePresence, MotionConfig } from "motion/react"

<MotionConfig reducedMotion="user">
  <AnimatePresence mode="popLayout">
    {open && <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: "spring", visualDuration: 0.28, bounce: 0.18 }} />}
  </AnimatePresence>
</MotionConfig>
```

Trim the bundle with `import * as m from "motion/react-m"` + `<LazyMotion features={domAnimation}>` → ~4.6 KB + 15 KB.

**GSAP's licence, precisely.** Free for commercial use since April 2025, all former Club plugins included. But it is **not OSI-approved**: IP remains Webflow's, you may not fork or redistribute it, and it bars use in tools that let users build visual animations without code. Irrelevant for product work; fatal to an "OSI-approved licences only" policy. Flag it early, not at release review.

---

#### Platform motion — what needs no JS

| Feature | Baseline | Chrome | Safari | Firefox | Verdict |
|---|---|---|---|---|---|
| `linear()` easing | **widely** (2023-12) | 113 | 17.2 | 112 | **Ship it** |
| Web Animations API | **widely** (2020) | 84 | 14 | 75 | **Ship it** |
| `@starting-style` | newly (2024-08) | 117 | 17.5 | 129 | **Ship it** |
| `transition-behavior: allow-discrete` | newly (2024-08) | 117 | 17.4 | 129 | **Ship it** |
| View Transitions (same-doc) | newly (2025-10) | 111 | 18 | **144** | **Ship it** |
| View Transitions (cross-doc) | limited | 126 | 18.2 | none | Progressive enhancement |
| Scroll-driven animations | limited | 115 | **26** | none | Enhancement only |
| `interpolate-size` / `calc-size()` | limited | 129 | none | none | Chromium only |

**Same-document View Transitions went Baseline when Firefox 144 shipped, October 2025.** If your model says "View Transitions are a Chrome thing," that expired.

**`@starting-style` + `allow-discrete` is why a React app can skip a motion library.** Two years Baseline, and it finally makes CSS-only enter *and* exit animation work for `dialog`, `popover`, and any `display: none` toggle:

```css
.popover {
  opacity: 0; translate: 0 6px;
  transition: opacity 200ms ease, translate 200ms ease,
              display 200ms allow-discrete, overlay 200ms allow-discrete;
}
.popover:popover-open { opacity: 1; translate: 0 0; }
@starting-style { .popover:popover-open { opacity: 0; translate: 0 6px; } }
```

**`linear()` gives you springs with zero runtime.** It's a piecewise-linear lookup table, so it expresses overshoot that `cubic-bezier` mathematically cannot. Motion's `spring()` will emit the string for you; Jake Archibald's generator is the other route. Runs off the main thread.

**Height-to-auto is still not portable.** `interpolate-size` is Chromium-only two years on. Use the Baseline-safe alternative:

```css
.accordion { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 300ms ease; }
.accordion[open] { grid-template-rows: 1fr; }
.accordion > div { overflow: hidden; min-height: 0; }
```

**Scroll-driven animations need the element visible by default.** Firefox has nothing, so if you write `opacity: 0` outside the `@supports` block, Firefox users get invisible content.

**React's `<ViewTransition>` is not stable** — canary/experimental only. Use `document.startViewTransition()` directly.

---

#### Reduced motion — reduced, not none

The nuke pattern is wrong:

```css
/* DON'T */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

Three reasons. It **breaks functionality** — `allow-discrete` exit transitions get cancelled, so elements vanish abruptly or stick in the top layer. It **removes useful signal** — without a cross-fade users lose the cue that anything changed, a usability regression for the same people. And it **over-corrects** — opacity and color changes don't trigger vestibular responses.

The real distinction is **vestibular-triggering vs not**, not motion vs no motion.

- **Triggers:** large-area movement, parallax, scaling, rotation, sustained or looping motion, anything the user didn't initiate, anything crossing a large portion of the viewport.
- **Harmless:** opacity, color, movement under ~10px, border and shadow changes, short cross-fades.

Treat full motion as the enhancement, so the safe experience is the default:

```css
.card { transition: opacity 150ms ease, background-color 150ms ease; }

@media (prefers-reduced-motion: no-preference) {
  .card { transition: opacity 200ms var(--ease-out), translate 200ms var(--ease-out),
                      scale 200ms var(--ease-out), background-color 150ms ease; }
  .card:hover { translate: 0 -4px; scale: 1.02; }
}
```

For View Transitions, kill the animation but keep the transition so DOM swapping and top-layer handling still work:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```

**What should still animate:** shortened cross-fades (~100ms), color and border changes, **focus indicators — never suppress these**, loading and progress indicators (a frozen spinner reads as a hung app), shifts under 10px.

**Offer an in-app override.** OS preference should be a default, not a ceiling — users on shared or managed machines often can't change it.

`prefers-reduced-motion` has been Baseline since January 2020. There is no support excuse.

---

#### Atmosphere

**Hierarchy: CSS-only by default (0 KB) → shaders when you need per-pixel procedural behaviour → R3F only when there is actual 3D.** Using R3F to render one fullscreen quad is the classic overspend.

**`@property` is what makes gradient angles animatable at all.** Without the declaration it snaps instead of interpolating — that's the whole trick:

```css
@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
.aurora { background: conic-gradient(from var(--angle), oklch(.6 .2 260), oklch(.75 .18 160), oklch(.6 .2 260));
          animation: spin 12s linear infinite; }
@keyframes spin { to { --angle: 360deg; } }
```

**Interpolate gradients in oklab**, not sRGB — `linear-gradient(in oklab, …)`. sRGB interpolation produces the muddy grey midpoint that makes gradients look cheap. This single change does more for perceived quality than any library.

**Grain is the highest value-per-byte technique available** — an feTurbulence tile costs ~912 bytes base64 and is what makes a flat gradient look expensive. Two rules: keep the filter on a small repeating tile, never a full-viewport element, and **never animate `baseFrequency`**. If it profiles hot, pre-render to a small WebP.

**`@paper-design/shaders-react`** (Apache-2.0, zero dependencies, no three.js) is the standout for procedural backgrounds — 29 shaders including mesh gradient, dithering, metaballs, god rays. **Pin the exact version**; the README states breaking changes ship under 0.0.x.

**three.js r185 / R3F 9.7.0** are healthy; **drei is the weak link** — zero commits in eight weeks, no stable release since 2025-11. Pin it and minimise surface area. WebGPU is at ~83.6% support and shippable *with* a WebGL2 fallback, which three.js gives you free — but for a gradient background it buys nothing. Write new shaders in **TSL**; it transpiles to both WGSL and GLSL.

**Reads dated:** particles.js constellation networks (the strongest 2016 tell), scroll-jacking, blob SVG shapes, long-scroll parallax, unmotivated glassmorphism, sRGB gradients with grey midpoints, spinning 3D logos, letter-by-letter hero reveals.

**Reads current:** grain over gradient, oklch with oklab interpolation, shaders drifting almost imperceptibly (speed ≈0.1–0.2), motion that responds to input rather than autoplaying, generous stillness, View-Transition route continuity, dithering as texture.

The through-line, and the part worth defending: **expensive-looking work uses less motion, more precisely.** Amplitude is the tell. Two moving elements at 200ms on one shared curve beats eight at 600ms on six curves, every time.

---

## Layout — structure as information

Craft thresholds live in [§ Taste](#taste-measured-thresholds-and-failure-tells). This file is **composition**: grid, optical
alignment, whitespace as meaning, fold choreography. Load after the template is
chosen.

#### Grammar

- **One focal object.** Dashboards, queues, records, heroes. Six equal modules is an index.
- **Regions come from the cite.** Copy region occupancy from the cited template or blueprint. Inventing a region is inventing a page.
- **Whitespace is information.** Three gap tiers: 8 intra-component, 16 intra-group, 64–96 inter-section (marketing). Dense UIs cut padding, never leading.
- **Measure in `ch` for prose** (45–75). Linear’s reading column is 624px. App tables are full-bleed.
- **Optical alignment.** Icon+label rows need a 1px nudge more often than geometry admits. `items-center` is a start, not a finish.
- **Nested radius** = parent − padding. LEX and dense enterprise chrome: radius none or host tokens — do not round a DataTable.
- **Fold.** Above the fold is the job of the screen, not a widget gallery.

#### Host width ≠ viewport

A Lightning record LWC is often **~494px** inside a 1280 window. `@media` asks the window. Use `container-type: inline-size` on `:host` and `@container`. Measure `getBoundingClientRect` on the component.

Consecutive surfaces in one product **must not** share a macrostructure (Hallmark). A queue and a marketing page that are siblings have failed retrieve.

#### Fail

- `max-width: 1200px; margin: auto` as the only layout decision
- Three identical `grid-cols-3` feature cards as the page
- Hero as sidebar + KPI cards
- Related lists as 14 API-name columns
- Chrome > content on an app-shell (`data-shine-probe="app-shell"`)

---

## Patterns — screen archetypes

Compose [§ Component contracts](#component-contracts-what-every-named-control-owes) into full screens. Apply [§ Foundations](#foundations-tokens-states-accessibility-floor) for visual system.

#### App shell

**Structure:** Sidebar and/or TopNav → main content → optional utility drawer.

**Must**
- Active nav state; nested sections when needed
- Mobile: collapse sidebar to drawer/sheet
- Content region with consistent page header (title, description, primary action)
- User/account menu with keyboard menu contract

**Avoid:** orphan pages with no way back; duplicate titles in nav and H1 fighting each other.

---

#### Dashboard / metrics

Full treatment in [§ Dashboards](#dashboards-surfaces-that-answer-questions) — metric anatomy, direction semantics,
drill-down models, forecast uncertainty, queue design. The screen-level shape:

**Structure:** context bar → KPI row (3–6) → **one focal object** → supporting modules →
what-needs-me queue.

**Must**
- Every metric answers all four: what is it (with units), compared to what, which way is
  good, how sure are we. A number with no comparison is decoration
- **One focal object** — the chart or table the page is actually about. Six equal modules
  is an index, not a dashboard
- Context bar carries scope, time range and freshness, and stays visible
- Active filters shown as chips with `Clear all`
- Every metric drills through to the rows behind it
- Direction encoded by glyph + sentiment token, never colour alone — and per-metric, since
  up is bad for churn, DSO and cycle time
- Loading skeletons matching final layout; empty and error per the triad below

**Avoid:** wall of equal cards; decorative charts with no units/labels; KPI soup above the
fold with no focal object; dual y-axes; a bare delta with no named baseline; red/green as
the only direction channel.

---

#### Insight stream / next-action queue

The surface that answers *"what needs me"*. Consistently outperforms the dashboard beside
it, because "how are we doing" is a question the reader must convert into this one anyway.

**Structure:** count + scope line → ranked rows (subject, rationale, age, action) →
overflow with total.

**Must**
- **Every row states its rationale** — "no activity 21d, close date inside 14", not "at
  risk". An unexplained alert cannot be disagreed with, and cannot be reported as a false
  positive
- One primary action per row, reachable without opening the row
- Age or deadline on every item; sort by urgency, and say what the sort is
- **Empty is a success state** — "Nothing needs you", styled as an achievement, never as a
  broken panel
- Bounded list with a total (`showing 5 of 57`); an unbounded attention queue is
  unactionable
- Dismiss/snooze that captures a reason

**Avoid:** severity inflation (everything P1); alerts with no owner; colour-only urgency;
a queue that never reaches zero.

---

#### Review / approval gate

Anything where a model or an automation proposes and a human commits. See
[§ AI surfaces](#ai-surfaces-topologies).

**Must**
- **Diff, not a summary of the diff**
- Per-item accept/reject, and partial acceptance of a multi-part change
- Rejection captures a reason in one click
- Items ranked by model uncertainty, so attention lands where it pays
- Destructive confirms name the blast radius — "Delete 25 records", not "Are you sure?"
- The inputs the model was given are inspectable

**Avoid:** bulk-approve with no per-item view — oversight theatre; approve cheaper than
reject; fabricated confidence percentages; losing the queue position on reject.

---

#### Data table page

**Structure:** Page header (title, description, primary CTA) → DataGrid surface (full table contract).

**Must** — entire Table/DataGrid MUST + SHOULD from contracts:
- Toolbar search/filters, sort, pagination or virtualize, sticky header, column resize/visibility, row actions, selection + batch bar when bulk actions exist
- Empty / filtered-empty / loading / error

**Mobile:** table → card list or horizontal scroll with sticky lead column; filters in sheet.

---

#### Forms / settings

**Structure:** Page or modal/drawer → grouped fields → sticky or end actions.

**Must** — Form MUST + SHOULD:
- Labels, helpers, errors, submit busy, focus first error
- Settings: save affordance clear (explicit Save vs autosave — pick one and label it)
- Dangerous zones separated (delete account, revoke)

**Wizards:** Stepper contract; back preserves values; review step before commit when high-stakes.

---

#### Auth / onboarding

**Must**
- Email/password or SSO buttons with loading and error inline
- Password show/hide; autocomplete attributes
- Onboarding: short steps, skip where safe, progress indicator
- Empty first-run state with one clear CTA into product

**Avoid:** multi-field walls before value; legal walls without scannable summary.

---

#### Detail / record view

**Structure:** Header (title, status, actions) → summary → tabs or sections → related table.

**Must**
- Status chip per contracts; primary/secondary/destructive actions
- Edit in place or Edit → form (consistent)
- Related data uses DataGrid contract, not mini bare tables

---

#### Search / filter patterns

**Must**
- Global or page search with clear, debounce when remote, no-results state
- Filters: visible active chips; Clear all; Apply vs instant — be consistent
- Advanced filters behind disclosure

---

#### Marketing / landing

**Hero budget (first viewport):** brand, one headline, one short supporting sentence, one CTA group, one dominant full-bleed visual. Stop there.

**Must**
- Brand-first: product/brand name is hero-level, not only nav text
- One composition — not a dashboard of widgets
- Full-bleed hero plane (not inset card, side panel, collage, or floating media block) unless existing DS requires otherwise
- No detached badges/stickers/chips on hero media
- Sections: one job, one headline, one short support line
- Pricing / social proof / CTA band as later sections
- Interactive bits (nav, forms, dialogs) still meet contracts

**Avoid:** card soup, pill clusters, stat strips, icon-feature rows, emoji, purple-glow AI cliché (see [§ Anti-patterns](#anti-patterns-lane-relative)).

**Rhythm:** alternate words and evidence — each plate sits beside the step it
proves (directions flipping), never more than two consecutive images, never a
text wall after an image stack. Gate it: fail any run of three plates
(2026-08-05, the review brief).

---

#### Empty, loading, error (cross-cutting)

Every list/table/panel:

| State | Pattern |
|---|---|
| Loading | Skeleton matching final layout |
| Empty | Title + body + primary CTA |
| Filtered empty | “No matches” + Clear filters |
| Error | Message + Retry |

Never reuse empty for loading or error.

---

#### Chat / assistant surfaces

**Chat is one AI topology out of ten, and usually the wrong one** — it is linear,
unstructured, undiffable, and its record is a transcript nobody rereads. Before building
chat, check [§ AI surfaces](#ai-surfaces-topologies) for whether a sidecar, inbox, review gate or
instrumented session fits the work better.

**Must** — Chat/composer contract:
- Persistent composer; streaming state; retry; markdown/code copy
- Keep system chrome (nav) stable while messages stream
- **Named steps over spinners** — "Reading 12 files" beats "Thinking…"
- Stop that actually stops, and preserves partial output
- Input survives an error; never lose a typed message
- Past 10s, the work must be leavable — it survives tab close, and says so

**Fullscreen / sheet:** composer remains available (OpenAI Apps SDK pattern).

---

#### Pattern → contract checklist

| Screen | Primary contracts | Also read |
|---|---|---|
| App shell | Sidebar, TopNav, Menu, Breadcrumbs | — |
| Dashboard | Metric cards, Charts, optional Table | [§ Dashboards](#dashboards-surfaces-that-answer-questions), [§ Data visualization](#data-visualization-encoding-rules), [§ Performance](#performance-budgets-and-thresholds) |
| Index/list | Table/DataGrid, Toolbar, Filter bar, Pagination | [§ Performance](#performance-budgets-and-thresholds) (virtualization) |
| Settings | Form, Tabs, Banner/Alert | — |
| Auth | Form, Button, Alert | — |
| Landing | Link, Button, optional Form; craft rules above | [§ Copy](#copy-the-presentation-layer-as-an-argument) |
| Chat | Composer, List, Markdown, Empty | [§ AI surfaces](#ai-surfaces-topologies) |
| Insight stream / queue | List, Badge, Menu, Empty | [§ Dashboards](#dashboards-surfaces-that-answer-questions) |
| Review gate | Diff, Button group, Dialog, Empty | [§ AI surfaces](#ai-surfaces-topologies) |

---

## Techniques — craft transfer

[§ Taste](#taste-measured-thresholds-and-failure-tells) Part 1 is the measurement SSOT. This file is the **transfer** layer: symptom →
named technique → how to apply under shine tokens → how to verify.

Every material craft fix should cite a row here (or a kit recipe in [§ Kits](#kits-which-library-and-worked-recipes)). Do not
collapse these back into anonymous thresholds in the report.

Sources: production CSS inventories in [§ Taste](#taste-measured-thresholds-and-failure-tells) (Linear, Vercel/Geist, Notion, Stripe,
Clerk, Liveblocks, Raycast, Superhuman, Things, and the wider set).

---

#### Hierarchy & density

| Symptom | Technique | Source | Apply under shine | Verify |
|---|---|---|---|---|
| Everything same weight; no obvious next action | **One filled primary per view**; peers are ghost/outline | Linear app chrome; foundations Hierarchy | `bg-primary text-primary-fg` once; secondary `variant=outline` / muted | `measure` filledCount = 1 (or 0 only if no controls) |
| 14px and 15px both used heavily | **Two-ratio type scale** — drop one step; UI band ~1.12 | Linear scale 10…72 with clear steps | Use only `--shine-text-*` steps; never invent 14+15 | type-step collision hard-fail gone |
| Dense UI feels cramped via leading | **Cut padding, never leading** below floor | Linear / taste rule 8 | Keep `--shine-leading-*`; reduce gap/padding tokens | leading ≥1.33 @12 / ≥1.40 @14–15 |
| Page feels sparse / hobby | **Instrumental density** — 8 intra, 16 group, coarse section gaps | Linear product density | 4px scale; avoid one gap value for >80% of gaps | composition notes; visual census |
| Prose line too long | **Role-based measure** — prose ~624px / 45–75ch | Linear prose 624px | `max-w-prose` / `65ch` on reading columns | measure width in ch |

#### Type

| Symptom | Technique | Source | Apply under shine | Verify |
|---|---|---|---|---|
| Display type looks default / AI | **Tracking = f(size, weight)**; negative by 20–24px | Notion tracking curve; Linear −0.022 @32+ | `tracking-*` paired to `text-*`; regular more negative than bold | computed letter-spacing ≠ 0 at ≥24px |
| Vertical rhythm uneven | **Line-height as spacing tokens** (snap to 4px grid) | Notion `--font-line-height-*` → spacing | Prefer shine leading tokens that land on 4px | padding+line boxes on grid |
| Weights look like Google defaults | **Non-round variable instances** 510/590/680 | Linear Inter Variable | Where face supports, use 510–590 for UI medium | font-weight not only 400/700 |
| Numerics dance in columns | **`tabular-nums` + mono for metrics** | House style; Linear Berkeley Mono for nums | `font-variant-numeric: tabular-nums`; mono token on KPI | every numeric column |
| Headings wrap ugly | **`text-wrap: balance` / `pretty`** | Rule 10 / taste 39 | headings balance; body pretty | computed text-wrap |

#### Color & surface

| Symptom | Technique | Source | Apply under shine | Verify |
|---|---|---|---|---|
| AI purple / loud accent | **Accent chroma OKLCH 0.13–0.24 @ L55–65** | Entire measured set vs Tailwind −600 | shine accent tokens only; fill chroma ≤0.08 on large areas | chroma gate / contrast-gate |
| Card stack of different greys | **Adjacent surfaces ΔL ≈2pp**; borders separate | Linear dark ramp +2.0–2.7pp | `surface` / `surface-2` with hairline border, not fill jumps | ΔL 1.6–4pp |
| Dead dark greys | **Saturation rises as lightness falls** in tinted ramps | Raycast | personal lane OKLCH cast toward accent | ramp inspection |
| Palette won't stay related | **Derive with `color-mix` / OKLCH formulas** | Clerk 1,193× `color-mix` | derive tokens with formulas, not hand hex | no raw hex in UI |
| Neutrals fight the accent | **Hue-monotone greys OR chroma-0** — pick one | Vercel chroma-0 vs Linear hue-210 | house: slight cast toward accent | taste rule 1 |
| Dark mode #000 void | **Brand-tinted black + raised surfaces** | Superhuman; taste 78 | never `#000` body; elevate panels | dark screenshot |

#### Depth & shape

| Symptom | Technique | Source | Apply under shine | Verify |
|---|---|---|---|---|
| Mushy floating cards | **Composite elevation**: hairline + blur layers + bg ring | Vercel/Geist | `--shine-shadow-sm\|md\|lg` only | no hand-rolled box-shadow |
| Tailwind `shadow-lg` look | **Top-layer alpha ≤6% light; ≥2 layers; −spread on blur≥8** | Vercel ladder; taste 17–20 | same tokens | lint blocks raw shadow |
| Nested radius looks wrong | **`child = parent − padding`** (`calc`) | Stripe, Liveblocks | `rounded-[calc(var(--radius)-theme(spacing…))]` or token nest | visual corner parallel |
| One radius everywhere | **Radius scales with element size** | Linear 4…32 ladder | controls 4–6, cards 10–12, sheets 16–20 | taste 15 |
| Radius ignores type size | **`em`-based radii** on text-tied chips | Things 3 | rare; prefer token ladder unless chip scales with type | — |
| Dark shadows invisible | **Dark: ~4× alpha + 1px top inner highlight** | Vercel dark | theme tokens already; don't reuse light shadow | dark mode measure |

#### Motion

| Symptom | Technique | Source | Apply under shine | Verify |
|---|---|---|---|---|
| Sluggish or flashy UI | **150ms mode**; micro 100–150; overlays 200–300; exit −20% | Linear + set mode | `--shine-duration-*` | no >300ms hover |
| Janky transitions | **Never `transition: all`**; transform/opacity only | taste 45–46 | name properties | lint / review |
| Dialog pops from nothing | **Enter from scale ~0.8–0.95, not 0** | taste 29 | motion tokens | — |
| Reduced-motion ignored | **`prefers-reduced-motion` blocks** | Stripe 68× | motion.md recipe | media query present |

#### Theme & platform

| Symptom | Technique | Source | Apply under shine | Verify |
|---|---|---|---|---|
| Native controls wrong in dark | **`color-scheme` on `<html>`** | Superhuman `light-dark()`; taste 82 | `color-scheme: dark` / light | measure theme hard-fail |
| Theme doesn't switch | **Semantic tokens via `@theme inline`** | SKILL non-negotiable 3 | `bg-surface` not raw palette utils | light≠dark bodyBg |
| Overlay on unknown bg | **Alpha ramp parallel to solid greys** | Vercel alpha 4%…91% | overlay tokens | — |

#### Interaction hygiene

| Symptom | Technique | Source | Apply under shine | Verify |
|---|---|---|---|---|
| Focus ring squares off | **`focus-visible` + outline-offset** (outline follows radius) | Vercel focus double-ring | foundations focus tokens | axe + visual |
| Tap targets tiny | **`--min-tap-size: 44px`** | Linear | min 40px compose note; 44 mobile | compose smalls |
| z-index chaos | **Explicit z-index ladder** | Linear 17-step | foundations z tokens | no 9999 |

---

#### How to cite in a report

```
Fix: collapsed 14/15px → text-sm/text-base (Linear two-ratio scale; techniques.md §Type).
Before: 14px×42, 15px×38, ratio 1.071. After: 14px×80 — collision fail cleared.
```

Thresholds without a product or kit name are incomplete.

---

## Interaction — keyboard and pointer behavior

Contracts ([§ Component contracts](#component-contracts-what-every-named-control-owes)) say what a named Table/Form/Dialog includes. This file is
**whether a person can finish**: keyboard as spatial, disclosure, URL as state.
Always-on subset from [Vercel web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines).

#### MUST

- Full keyboard path per APG. Visible `:focus-visible`. Sticky chrome never covers focus.
- Hit target ≥24px (mobile ≥44px). Expand the hit area if the glyph is smaller.
- Loading buttons keep the original label and add a spinner — width must not jump.
- Keep submit enabled until the request starts; then disable. Do not disable before the user has typed.
- Errors inline next to fields; on submit, focus the first error.
- URL reflects filters, tabs, pagination, expanded panels.
- Links are links (`<a href>`). Buttons are actions.
- Confirm destructive actions or provide Undo.
- Skeletons match the loaded layout (no CLS).
- Empty ≠ filtered-empty ≠ error ≠ loading — four states, copy + one action each.
- `prefers-reduced-motion`. Animate `transform`/`opacity` only. Never `transition: all`.
- Command palettes, context menus, theme toggles: **no motion**.
- Locale-aware numbers and dates. `tabular-nums` on comparisons.
- Status is never colour-only.

#### LEX specifics

- `lightning-datatable` has keyboard nav/action modes — do not invent a third. Unsupported on Salesforce mobile; ship a separate page.
- Utility bar is one job, keyboard, no page (Raycast-scale).
- Walk `shadowRoot`. A probe that reports 0/0 is broken, not clean.
- Custom cell types: `data-navigation="enable"` all the way down.

#### Fitts / Hick / Gestalt (checkable)

- **Fitts:** the next action is large and near the thing that named the problem. Inline on the card, not “open the record, find the field.”
- **Hick:** one primary per view. Competing filled treatments fail measure.
- **Gestalt:** proximity groups one job. A toolbar that mixes nav, filters, and destructive peers is three groups pretending to be one.

#### Fail

- Hover-only row actions
- Fake navigation (`<div onClick>`)
- Paste blocked on codes / passwords
- `outline: none` with no replacement
- Toast as the only error channel for a submit failure

---

## Anti-patterns — lane-relative

Hard bans and common failures. Hitting these is an audit fail (Critical/Major for incomplete components; Minor/Major for visual slop depending on severity).

#### Incomplete components (functional)

- Bare tables without toolbar/sort/page/states when DataGrid applies
- “Forms” that are unlabeled inputs + a button
- Icon-only controls with no accessible name
- Dialogs without title, focus trap, Escape, or focus restore
- Menus that work only with mouse
- Toast as the only error channel for submit failures
- Loading UI that is blank (looks empty)
- Hover-only row actions (break on touch)
- Placeholder-as-label
- Color-only status (no text/icon)
- Disabled buttons used instead of explaining why action is blocked (prefer helper text)
- Fake links (`<div onClick>`) for navigation

#### Lane-relative craft

Glow, large display type, and full-bleed media are **marketing DNA** (`magicui-hero`). They are a fail on `lex` and `internal` queues. Inverse: an enterprise queue's radius-none, tabular density on a marketing hero is a fail. Load [§ Direction](#direction-art-direction-before-code) before applying this list.

#### AI visual slop (marketing + generic UI)

Do **not** default to these looks — reach for them only when the brief pins them:

1. Purple-on-white or purple→indigo glow gradients
2. Warm cream canvas (~#F4F1EA) + high-contrast serif display + terracotta accent
3. Broadsheet: hairline rules, zero radius, dense newspaper columns
4. Dark mode for its own sake
5. Glow effects, glassmorphism stacks, multi-layer showy shadows
6. Rounded-full pill clusters and chip spam
7. Emoji as UI decoration
8. Card soup — cards everywhere including hero
9. Stat strips / icon-feature rows / “this week” clutter in the first viewport
10. Inset hero, side-panel hero, collage tiles, floating media cards on landings
11. Detached badges/stickers/promo chips overlaid on hero media
12. Inter/Roboto/Arial as expressive marketing display when no brand specifies (product UI may use a neutral sans; a brand`s own licensed faces are the exception)

#### Composition fails

- First viewport reads as a dashboard of widgets (unless it *is* a dashboard)
- Brand/name only in nav — fails brand test after removing nav
- Multiple competing CTAs of equal weight
- Sections with three jobs and three headlines
- Decorative gradient as the only visual idea (no real product/context anchor)

#### Interaction fails

- Focus outlines removed and not replaced
- Hit targets &lt;40px for primary controls
- Motion that bounces, loops, or delays task completion
- Confirm-less destructive actions
- Double-submit (no loading/disable on async)
- Select-all that silently means “page” when user thinks “all filtered”

#### Data UX fails

- Empty vs filtered-empty vs error conflated
- Sort without indicator
- Pagination without range/total context
- Wide tables clipped with no scroll affordance
- Server tables that re-fetch without busy state or race handling

#### Composition fails a per-element check cannot see

These pass every token, contrast and axe check — composition has to be judged from the
rendered screenshot. All of them were found on a surface that scored
zero violations on everything else:

- **A large region with no content and no empty state.** The biggest element on the screen
  being a void is the most visible defect there is and the least detectable — gates measure
  elements that exist, never the one that is missing
- **No primary action, or several.** A screen where every button is styled the same has
  delegated prioritisation to the reader
- **A destructive action rendered at peer weight with ordinary actions**, especially
  repeated per-row — 25 always-visible `Delete` buttons is 25 chances to lose data
- **One colour carrying two meanings** — the accent doubling as an active-filter state, or
  a status colour spent on a categorical chart series. Every token is valid; the vocabulary
  still collapsed
- **Two type steps doing one job** — 14px and 15px in the same view. Cardinality is within
  budget and the scale is still broken
- **Light and dark rendering identically** — a theme that never switches passes every
  per-element check in whichever mode it is stuck in
- **Chrome outweighing content** — three rows of filters, search and tabs above one visible
  item
- **Hit targets under 40px on primary controls** (see Interaction fails — stated for years,
  never checked until the gate existed)

#### Dashboard / data fails

- **A number with no comparison.** No target, no prior period, no benchmark — unactionable
  by construction
- **Direction by colour alone**, and direction hardcoded up=good when the metric is churn,
  DSO, or cycle time
- **Dual y-axis** — the crossing point is an artefact of scale choice and readers infer
  causation from it
- **Truncated y-axis on bars** — bars encode length; truncation makes the length a lie
- **Gauges, radar/spider charts, 3D charts, donuts with a KPI in the hole**
- **Rainbow / jet colormaps** — perceptually non-uniform, invents boundaries in the data
- **Legend-only series identification** where direct labels would fit
- **Tooltip as the only carrier of a value** — unreachable by keyboard and touch, invisible
  in an export
- **Rendering unknown as `0`** — a data-integrity failure wearing a formatting costume
- **Mixed abbreviation rules** in one view (`1.2M` beside `1,240,000`)
- **A metric with no drill-through** — it will be disbelieved the first time it surprises
  someone
- **Unbounded attention queues** and severity inflation (everything P1)
- **Peer-ranked leaderboards with no visible behaviour behind the rank** — drives gaming
  and sandbagging, and holds people to numbers they cannot move

#### AI surface fails

- **Chat as the interface for structured, reviewable work** — the default because it is
  easiest to build, not because it works
- **Bulk-approve with no per-item diff** — oversight theatre
- **Fabricated confidence percentages** — precise, unfalsifiable, and readers anchor on them
- **Anthropomorphic status theatre** ("Thinking…", "Pondering…") in place of the real step
- **A stop button that does not stop**
- **Losing the user's input on error**
- **Streaming as decoration** — token-by-token rendering of JSON or a diff
- **Identical retry** as the only recovery
- **Autonomy with no published error rate**
- **Post-hoc self-explanation** presented as provenance — show the inputs, not a generated
  rationale

#### When brand mode applies

Brand-specific visual bans (a logo gradient applied to chrome, the accent used as a body fill, emoji, retired product names) live in that brand`s own kit and copy checker — still flag them in audits on brand-locked surfaces.

---

## Voices — three legal paints

Structure comes from the cited template; paint comes from the voice. Pick the voice from
the **job**, not habit.

| Voice | When | Paint |
|---|---|---|
| **kit-faithful** (default) | A kit template was cited | The kit's own values — type pairing, radii, density, motion, **and colors**. |
| **house** (fallback) | No kit cite, or the user asked for shine-native | Dark-first, one accent, dense editorial. Stone neutrals, ember accent, chroma 0.13–0.24. |
| **brand** (locked) | Clearspeed or any brand pack | Kit **structure** yes, kit **chrome** no — [§ Brand mode](#brand-mode-the-adapter) / the private brand pack. |

#### How kit paint works

Raw values belong in **custom-property definitions**, never at **usage sites** — the
token layer is where raw values are supposed to live. So kit paint is one block plus
`var()` everywhere else:

1. Take the kit's real colors from its own published token sources — the shadcn theme
   CSS in registry items, Untitled UI's theme, Spectrum and Fluent token files — and
   declare them **once** as custom properties in the page/app token layer.
2. Every usage site says `var(--…)`. No hex, no `rgb()`, no Tailwind palette literal at
   a usage site.
3. In an existing repo, use the tokens the project already defines before declaring new
   ones.

Do not overwrite a kit's density or its marketing type with house style; do not leave a
Magic UI hero in house grays. Put your after-screenshot beside the cited template: an
`untitled-table` cite beside your page should read as relatives.

#### House (when it is the voice)

House is a deliberate system, not an absence of choice: dark-first stone neutrals with a
single warm ember accent, borders over fills for separation, editorial type discipline.
Declare it as a token block at the top of the artifact; do not leave color roles
undefined and hope the page invents hex.

#### Brand lane

Keep the cited template's regions; replace chroma, type family, and logos with the brand
pack. Do not import a vendor voice onto Clearspeed. Vendor logos are never cloned in any
voice; density and type pairing are.

#### Fail if

- A kit cite still ships in house paint (or shadcn zinc when the cite is another family).
- Brand-locked work clones IBM/Linear/Shopify chrome.
- Kit colors are typed as raw values at usage sites instead of declared once as tokens.

---

## Kits — which library, and worked recipes

Kits supply **behavior, completeness, structure, and — under kit-faithful — visual DNA**.
House style is the fallback voice ([§ Voices](#voices-three-legal-paints)). Brand lane: kit structure yes, kit
chrome no.

**Do clone structure and DNA** from a [§ Templates](#templates-start-from-a-real-page) catalog row. Inventing a page is a
Critical hole ([§ The loop](#the-loop-how-to-find-what-is-wrong) §0). Kits are not a substitute for a catalog id.

Before using any library API: read the library's official docs or source — fetch them if
needed. Never invent a prop, an option, or a component name from memory. Cite what you
read in the fix.

When working inside an existing repo, detect what is already installed (read
`package.json`) and use that system. **Never introduce a second design system** into a
project that already has one.

#### Decision table

| Need | Primary kit | Also | Avoid |
|---|---|---|---|
| Headless primitives (dialog, menu, popover, tabs) | **Base UI** or **Radix** (website docs) | React Aria for complex a11y | Inventing focus traps |
| Shadcn-shaped React components | **shadcn** registry (`ui.shadcn.com`) | Base UI underneath | Thin demos without contract states |
| Data table / virtualized list | **TanStack Table ^8** + **TanStack Virtual** | `untitled-table` for chrome density | TanStack Table v9 |
| Charts | **Recharts** (React) + **D3** (math/SSR) | Observable Plot for grammar | nivo (drifting), visx except custom |
| Motion primitives (MIT) | **motion** + **motion-primitives** | — | GSAP, Aceternity, Animate UI |
| Marketing blocks (MIT) | **magicui** / **cult-ui** | — | Origin UI (AGPL) |
| Form/table completeness matrices | **[§ Component contracts](#component-contracts-what-every-named-control-owes)** (the MUST lists) | Untitled UI demos | A matrix read off an unvetted kit |
| Interaction/a11y SSOT | **react-spectrum** (`@react-aria`, RAC) + **WAI-ARIA APG** | Radix website | Skipping APG for custom widgets |
| Fluent patterns | **fluentui** `react-components` | — | Fluent brand paint |
| Admin / settings grammar | **Polaris** (query only — look, never copy) | — | Republishing Polaris components |
| Icons | **lucide** (default) / **phosphor** | — | Mixing two sets |
| Native Apple patterns | Apple HIG (fetch it) | — | Inventing UIKit APIs |

#### Wireframe → recipe

When Wireframe ([§ Wireframe](#wireframe-discovery-before-build)) matches a screen type, open the matched [§ Templates](#templates-start-from-a-real-page)
row's source — then confirm kit behavior against official docs before locking the brief.

| Wireframe pattern | Catalog default | Lead kit / recipe |
|---|---|---|
| App shell | `shadcn-sidebar-07` | shadcn sidebar — § App shell |
| Dashboard | `shadcn-dashboard-01` | Recharts/D3 + [§ Dashboards](#dashboards-surfaces-that-answer-questions) |
| Queue / insight stream | `untitled-table` | toolbar, batch, empty/loading/error |
| Data table | `untitled-table` / `shadcn-dashboard-01` | § DataGrid |
| Form / settings | `shadcn-settings` | [§ Component contracts](#component-contracts-what-every-named-control-owes) completeness; Polaris query-only |
| Landing | `shadcn-marketing` | hero budget; `magicui-hero` for marketing-hero |
| Editorial / article | `shadcn-blog` | measure 60–75ch; region map only |
| AI surface | [§ AI surfaces](#ai-surfaces-topologies) topology first | chat is usually wrong |
| Dialog | — (component, not a page) | § Dialog / sheet |

#### Worked recipes

##### DataGrid (app)

1. **Behavior:** TanStack Table ^8 — sort, filter, pagination, selection, column
   visibility. Confirm APIs against the official TanStack docs.
2. **Chrome:** shadcn table / data-table registry item as structure; upgrade to full
   [§ Component contracts](#component-contracts-what-every-named-control-owes) Table MUST (toolbar, sticky header, empty/loading/error, keyboard).
3. **Density / filters:** read `untitled-table`'s public demo for toolbar layout, batch
   actions and the four table states — re-skin with the project's tokens.
4. **Virtualize** when rows ≫ viewport — TanStack Virtual examples.
5. Cite: TanStack docs + `untitled-table` pattern + contracts Table MUST.

##### Dialog / sheet

1. Base UI or Radix Dialog — focus trap, restore, Escape, portal (their official docs).
2. WAI-ARIA APG dialog pattern if behavior is non-standard.
3. Motion: enter ~150–250ms ease-out from scale 0.95; exit faster; `prefers-reduced-motion`.
4. Contract: title, description, primary + secondary, destructive confirm separate.

##### Form

1. Completeness from [§ Component contracts](#component-contracts-what-every-named-control-owes) § Form and the `shadcn-settings` blueprint —
   labels, helper, error association, disabled semantics.
2. Implement with the project's inputs + Base UI where needed.
3. Never placeholder-only labels; never disable submit before interaction without inline errors.

##### App shell

1. shadcn sidebar blocks for structure; Polaris (query-only) for admin nav density cues.
2. Active state, mobile drawer, page header (title, description, one primary).
3. Adoption pass if internal ([§ Adoption](#adoption-will-anyone-open-it)).

##### Dashboard

1. Structure from [§ Patterns](#patterns-screen-archetypes) / [§ Dashboards](#dashboards-surfaces-that-answer-questions) — context bar, KPI row, **one focal
   object**, queue.
2. Charts: Recharts + [§ Data visualization](#data-visualization-encoding-rules) encoding rules; D3 for custom/SSR.
3. KPI decidability over decoration.

##### Marketing hero

1. Hero budget from [§ Patterns](#patterns-screen-archetypes) — brand, one headline, one line, CTA, one full-bleed visual.
2. Motion: motion-primitives MIT only.
3. No equal three-card feature grid as the whole page (taste failure 28–29).

##### Custom widget (combobox, grid, tree)

1. Start at the **WAI-ARIA APG** pattern for roles/keyboard.
2. Prefer **React Aria** components/hooks over hand-rolled.
3. Only then skin.

#### License reminders (hard)

| Kit | Copy source into your work? |
|---|---|
| shadcn, Radix, Base UI, Ark, TanStack, D3, Recharts, motion, magicui, cult-ui, lucide, phosphor, Untitled UI (open set), React Spectrum, Fluent, APG | Yes if SPDX allows (usually MIT/Apache) — still prefer depend, don't vendor wholesale |
| MUI, Ant Design (+ Pro), IBM Carbon | **No** — they carry their own runtime and theming; nothing built on another stack can reproduce what their pages show |
| **Polaris** | **No** — query only; Shopify visual-distinctness clause |
| Origin UI | **No** — AGPL |
| Aceternity / React Bits / Animate UI / GSAP | **No** — missing license or Commons Clause / no redistribution |

#### Citation form

```
Kit: Untitled UI table batch-actions layout (untitledui.com table demo)
Mapped to: toolbar + destructive behind menu (contracts Table SHOULD)
```

---

## Dashboards — surfaces that answer questions

For any surface whose job is *"what is happening, and what do I do about it"* — executive
dashboards, revenue cockpits, rep scorecards, ops consoles, daily briefs.

The governing failure, found in every exemplar reviewed and in every internal surface
audited: **the number is readable but not checkable.** A figure renders in beautiful
tabular numerals and the viewer cannot tell whether it is good, whether it moved, what it
is measured against, or what to do. Legibility is table stakes and gets all the attention;
*decidability* is the actual job and gets none.

Every rule below is a way of making a number checkable.

#### The four questions every metric must answer

A metric that cannot answer all four is decoration. This is the single highest-yield
checklist in this file.

| Question | Carried by |
|---|---|
| **What is it?** | Label with units, and the grain (`ARR`, not `Revenue`; `net new` vs `gross`) |
| **Compared to what?** | Target, prior period, or benchmark — *in the same visual unit* |
| **Which way is good?** | Direction semantics, never bare colour (see below) |
| **How sure are we?** | Sample size, freshness, or an interval when the number is a projection |

"Compared to what?" is the one that gets dropped. A delta chip (`+12%`) is not a
comparison unless it says *against what and over what window* — `+12% vs. last 30d` is a
comparison; `+12%` is a rumour.

#### Metric card anatomy

Reading order, top to bottom. Deviating from it costs comprehension for no gain:

1. **Label** — noun phrase, units explicit, ≤ 4 words
2. **Value** — the largest thing in the card, `tabular-nums`, abbreviated on a consistent
   rule (see number formatting)
3. **Comparison** — delta with its baseline named, and the direction encoded by more than
   colour
4. **Context** — sparkline, target bar, or range. One, not three
5. **Provenance** — `as of <time>` when the data can be stale; nothing when it is live

**Rules**

- **3–6 metric cards, maximum, above the primary content.** Beyond that no card is
  primary and the row becomes wallpaper. This is a hierarchy limit, not a memory limit
  (see the Miller's-Law myth below).
- **A card is a link.** Every metric drills to the rows behind it. A number the viewer
  cannot get behind will be disbelieved the first time it surprises them, and the whole
  surface loses credibility at once.
- **Never a bare number with no comparison.** If there is genuinely nothing to compare to,
  say so (`no prior period`) rather than leaving the slot empty.
- **Delta and value must not be the same size.** The value dominates; the delta is
  secondary type with an icon.

#### Direction is not colour

Green-up/red-down is wrong in three separate ways and it is the most common defect in
revenue surfaces:

- **~8% of men** have a red/green colour vision deficiency. Colour-only direction is
  unreadable to them, and this is a WCAG 1.4.1 failure ("use of colour").
- **Up is not always good.** Churn, DSO, cycle time, cost per lead, support backlog — up
  is bad. A palette that hardcodes up=green silently lies on half a revenue cockpit.
- **Red/green is not culturally universal** — red is positive in several East Asian
  markets.

**The rule:** every metric declares its own `goodDirection` (`up` | `down` | `neutral`),
and the *sentiment* is what gets coloured — never the arrow's direction. Pair colour with
a glyph (▲ ▼) and, where space allows, a word. See the `direction-*` tokens in
[§ Foundations](#foundations-tokens-states-accessibility-floor).

#### Page architecture

**Top to bottom, and the order is load-bearing:**

```
context bar     what am I looking at — scope, time range, freshness, filters in effect
headline row    3–6 metric cards, the decisions this page exists to support
focal object    ONE primary chart or table — the thing the page is actually about
supporting      breakdowns, secondary series, related modules
actions/queue   what needs a human, and the way to do it
```

- **One focal object per page.** A dashboard with six equal-weight modules is an index,
  not a dashboard. If everything is equally prominent, the reader does the prioritising
  work the surface was supposed to do.
- **The context bar is not chrome.** Time range, scope and "as of" are the difference
  between a number and a claim. Keep them visible while scrolling, or repeat them at the
  point of export.
- **Filter state must be visible as chips, and reversible.** A filtered dashboard that
  looks like an unfiltered one produces confident wrong decisions. Include a `Clear all`.
- **Time range belongs in one place and applies globally**, with per-module overrides
  marked explicitly on the module. Two competing time controls is a bug factory.

#### Density

Data-heavy surfaces need a real density switch, not a single compromise spacing:

| Mode | Row height | Use |
|---|---|---|
| Comfortable | 48px | Default, exploratory, touch |
| Compact | 36px | Analyst views, long sessions |
| Dense | 28px | Monitoring walls, power users only |

Cut **padding** between modes; never cut line-height below 1.33 (SKILL.md rule 5). The
common mistake is squeezing leading, which destroys scannability while saving almost
nothing.

#### Change over time

- **Sparklines** for shape without precision — no axes, no gridlines, one series, ≥ 20
  points or don't bother.
- **Waterfall** for "how did we get from A to B" — the only chart that answers
  attribution of a change, and the correct default for pipeline movement (created,
  advanced, slipped, closed, lost).
- **Period-over-period overlays** beat two side-by-side charts. Align on the x-axis or
  the comparison is manual work.
- **Never a dual y-axis.** The crossing point is an artefact of the two scales chosen and
  readers reliably read causation into it. Use two stacked panels sharing an x-axis.

#### Forecast and uncertainty

Any projected number carries an obligation to show that it is projected:

- **Show the interval, not just the point.** A fan band or a range bar. A single forecast
  number rendered identically to an actual is a lie of typography.
- **Distinguish actual / committed / projected** by fill treatment (solid / hatched /
  outlined), not by colour alone.
- **Name the model in one line** — "weighted by stage" vs "rep-committed" vs "AI-scored"
  are wildly different claims and the viewer must know which they are reading.
- **Coverage ratios need their target.** `3.2x` means nothing without `target 3.0x`
  beside it.

#### Drill-down

Three models, in descending order of how well they work:

1. **In-place expansion** — row expands to detail. Preserves context perfectly. Best for
   ≤ 2 levels.
2. **Side panel / sidecar** — detail opens beside the list, list stays visible and
   navigable. Best for triage where the next item matters.
3. **Full navigation** — new page. Only when the detail is genuinely a different task.
   Requires breadcrumbs and a working back that restores scroll and filter state.

**Never a modal for drill-down.** It hides the context that gave the number meaning and
cannot be compared against a sibling.

#### The queue, not the dashboard

The highest-value pattern in every exemplar: a surface that answers *"what needs me"*
outperforms one that answers *"how are we doing"*, because the second is a question the
reader has to convert into the first themselves.

- Lead with the **exception list**: what is off-target, blocked, stale, or awaiting a
  decision. Ranked, with a reason and an action per row.
- **Every alert states its rationale.** "Deal at risk" is noise; "no activity in 21 days,
  close date inside 14" is checkable, and the reader can disagree with it. A rationale is
  also what makes a false positive *reportable* rather than merely annoying.
- **Empty is a success state.** "Nothing needs you" should look like an achievement, not
  a broken panel.
- **Cap the queue.** An unbounded list of things needing attention is an unactionable
  list. Show the top N with a count, and make the ranking rule visible.

##### Alarm fatigue is the failure mode

From incident-management practice (PagerDuty, incident.io, Datadog):

- **Every alert must be actionable by its recipient.** An alert with no action is a log
  line and belongs in a log.
- **Measure the ignore rate.** An alert class ignored > 50% of the time is worse than no
  alert — it trains dismissal of the whole channel.
- **Severity must be scarce.** If everything is P1, nothing is. Budget the top severity.
- **Route to a person, not a channel.** Unowned alerts are ignored alerts.

#### Accountability surfaces, carefully

Rep scorecards and leaderboards are requested constantly and reliably backfire when built
naively. The research is consistent and uncomfortable:

- **Rank alone drives gaming, sandbagging and attrition** among the bottom half, and adds
  nothing for the top. If a leaderboard exists, show the *behaviour* that produced the
  rank, not just the rank.
- **Prefer personal-best and pace-to-target over peer rank.** Self-comparison sustains
  effort; peer rank sustains it only for people already winning.
- **Never surface an individual's ranking to peers by default.** Manager-visible,
  self-visible, opt-in for public.
- **Show the input metrics the rep controls** (activity, coverage, hygiene) beside the
  outcome metrics they only partly control (bookings). Holding someone to a number they
  cannot move is what makes a scorecard feel like surveillance.
- **Every number on a scorecard must be disputable** — click through to the rows, and an
  obvious way to flag "this is wrong". Data quality on rep-level metrics is always worse
  than leadership believes, and an undisputable wrong number destroys trust in the
  system permanently.

#### Myths this file deliberately contradicts

Each of these is widely repeated in dashboard writing and does not survive contact with
its primary source:

| Claim | Reality |
|---|---|
| "Users decide in 5 seconds" | No primary source. Traceable only to blog restatement. |
| "Nothing below the fold gets seen" | False. Scrolling is universal; NN/g finds attention *concentrated* above the fold, not confined to it. Prioritise, don't cram. |
| "Miller's 7±2 limits dashboard items" | Misapplication. Miller (1956) is short-term recall of unrelated items, not simultaneous visual comparison. The real limit on cards is hierarchy, not memory. |
| "Maximise data-ink; remove all chartjunk" | Overapplied. Bateman et al. (2010) found embellished charts equalled plain ones on comprehension and *beat* them on long-term recall. Remove ink that competes; keep ink that labels. |
| "Pie charts are always wrong" | Overstated. Fine for part-to-whole with ≤ 5 slices and no close comparisons. Cleveland & McGill rank angle poorly — poorly is not uselessly. |
| "The 3-click rule" | Debunked (UIE, 2003). Click *count* does not predict success; per-step certainty does. |
| "F-pattern reading" | One pattern among several, and NN/g describes it as a *symptom of unformatted text*, not a layout target. |
| "Dark mode is easier on the eyes" | Contested. The positive-polarity advantage (dark text on light) is well replicated for acuity and sustained reading. Dark mode is a legitimate aesthetic and low-light choice, not an ergonomic fact. |

Rainbow colormaps genuinely are bad, and that one is well sourced (Borland & Taylor,
2007) — perceptual non-uniformity creates boundaries in the data that do not exist.

#### Cross-references

- Chart selection, encoding accuracy, number and colour formatting → [§ Data visualization](#data-visualization-encoding-rules)
- Render budgets, virtualization thresholds, Core Web Vitals → [§ Performance](#performance-budgets-and-thresholds)
- Streaming, agent output, approval gates → [§ AI surfaces](#ai-surfaces-topologies)
- Table/metric/filter component baselines → [§ Component contracts](#component-contracts-what-every-named-control-owes)
- Screen composition → [§ Patterns](#patterns-screen-archetypes)

---

## Data visualization — encoding rules

Chart selection, encoding, and the formatting rules that make a number comparable. Screen
composition is in [§ Dashboards](#dashboards-surfaces-that-answer-questions); render cost is in [§ Performance](#performance-budgets-and-thresholds).

#### Encoding accuracy — the ranking everything else derives from

Cleveland & McGill (1984), replicated by Heer & Bostock (2010) on Mechanical Turk. Ordered
by measured accuracy of quantitative judgement:

1. **Position on a common scale** — bar, dot plot, line on shared axis
2. **Position on non-aligned scales** — small multiples
3. **Length** — stacked bar segments, bullet graphs
4. **Angle / slope** — pie, donut, slope graph
5. **Area** — bubble, treemap
6. **Volume / curvature** — 3D anything
7. **Colour saturation / density** — heatmap, choropleth

**The operative rule: encode the value the reader must judge most precisely using the
highest-ranked channel available.** Almost every bad chart is a precise question asked
through a channel from the bottom half of this list.

Note what the ranking *is*: accuracy of extracting a magnitude. It is not a ranking of
usefulness. A heatmap is rank 7 and is the right chart for spotting a pattern across 500
cells, because the question is "where is it hot", not "what is this cell's value".

#### Chart selection

| Question | Chart | Notes |
|---|---|---|
| Compare across categories | Horizontal bar | Sort by value, not alphabetically, unless the category order is meaningful |
| Change over time | Line | ≤ 5 series; label at the line end, not in a legend |
| Part-to-whole, few parts | Stacked bar (single) or pie ≤ 5 | Only the first and last segment of a stack are readable |
| Part-to-whole over time | Stacked area, or 100% stacked bar | Only if the total is meaningful |
| Attribution of a change | **Waterfall** | The most under-used chart in revenue work |
| Distribution | Histogram, box plot, or strip plot | Never a bar of averages — it hides the distribution that matters |
| Correlation | Scatter | Add the trend line only with the n and the fit stated |
| Value vs. target | **Bullet graph** (Few) | Beats a gauge in a fraction of the space |
| Rank change over time | Slope graph or bump chart | Two periods → slope; many → bump |
| Progress to a deadline | Pacing line vs. elapsed-time line | "Ahead/behind" needs the time axis, not a percentage |

##### Denylist, with the perceptual reason

- **Dual y-axis** — the crossing point is an artefact of scale choice; readers infer
  causation from it. Use two stacked panels sharing an x-axis.
- **3D anything** — rank 6 encoding, plus occlusion and foreshortening error.
- **Donut with a KPI in the hole** — the number in the hole is doing the work; the ring is
  decoration competing with it.
- **Radar / spider** — area scales with the square of the values, the shape depends
  entirely on axis order, and axes are non-aligned.
- **Gauge / speedometer** — enormous area for one number and one threshold. Bullet graph.
- **Rainbow / jet colormap** — perceptually non-uniform; invents boundaries in continuous
  data (Borland & Taylor 2007). Use a perceptually uniform ramp (viridis, magma, or an
  OKLCH ramp of your own).
- **Pie with > 5 slices, or two pies compared** — angle comparison across charts is the
  worst case of a rank-4 channel.
- **Truncated y-axis on a bar chart** — bars encode by length; truncating makes the length
  a lie. Lines may be truncated (they encode position), *with the axis clearly marked*.

#### Colour

- **Categorical: ≤ 8 hues, and design for deuteranopia.** Check the palette through a
  simulator, or use a known-safe set (Okabe–Ito is the standard 8-colour safe palette).
- **Sequential** for magnitude, **diverging** for deviation around a meaningful midpoint
  (target, zero, average). A diverging ramp with an arbitrary midpoint is a lie.
- **Colour is the last channel to reach for.** Position, length, and ordering solve most
  problems. A chart that needs 12 colours needs small multiples instead.
- **Semantic colours are reserved.** Never spend the danger/success/warning tokens on
  ordinary categorical series — the moment a series is red, readers read alarm. This is
  the same collision as an accent doing double duty as a status.
- **WCAG applies to charts.** Non-text graphical objects need **3:1** against their
  background and against adjacent objects (WCAG 1.4.11). Text in a chart — labels, axis
  ticks, legends — needs the full **4.5:1**. Chart labels are where this is missed most.

#### Non-negotiables for every chart

- **Direct-label the series.** Legends force a lookup for every read. Label at the end of
  the line, inside the bar, or beside the point.
- **Axis with units.** `$M`, `%`, `days`. A bare axis of numbers is unfinished.
- **Bars start at zero.** Always.
- **State n.** A percentage with no denominator invites over-reading a sample of 4.
- **Never colour alone.** Pattern, shape, position, or a direct label must carry the same
  information.
- **A chart needs a text equivalent.** A `<table>` behind a disclosure, or a one-line
  prose summary of the finding. This satisfies screen readers *and* is the thing most
  readers actually want. Writing it is also the fastest way to discover the chart has no
  finding in it.
- **The title states the finding, not the fields.** "Pipeline coverage fell below 3x in
  EMEA" beats "Coverage by region". If no finding can be written, question the chart.

#### Number formatting

Consistency here does more for perceived quality than any visual treatment:

- **`tabular-nums` everywhere a number can be compared vertically.** Non-tabular figures
  in a column make comparison physically impossible.
- **Align numerals right, labels left.** Decimal-align when precision varies.
- **One abbreviation rule per surface**, applied everywhere: `1.2K` / `1.2M` / `1.2B`, or
  full figures with thousands separators. Never mixed in one view.
- **Significant digits by magnitude, not by default float.** `$1.2M` not `$1,234,567.89`;
  `3.2x` not `3.21759x`. Precision beyond decision-relevance is noise that costs scanning
  speed.
- **Percentages: state the base.** "Up 12%" vs "up 12 points" are different claims and are
  confused constantly. Use `pp` for point differences.
- **Zero, empty, and unknown are three different things.** `0`, `—`, and `n/a` must be
  visually distinct and used consistently. Rendering unknown as `0` is a data-integrity
  failure wearing a formatting costume.
- **Currency: symbol and code when multi-currency is possible.** `$1.2M USD`.
- **Dates: unambiguous.** `2026-08-08` or `8 Aug 2026`, never `08/08/26`. Relative time
  (`4h ago`) for recency, absolute on hover or beside it for the record.

#### Interaction

- **Tooltip is an enhancement, never the only carrier of a value.** It is unreachable by
  keyboard and touch users and invisible in a screenshot or an export.
- **Hover reveals detail; click commits.** Never make hover the only path to a value.
- **Brush-and-link over cross-filtering everything** — linked highlighting keeps the
  reader oriented; a global cross-filter silently changes every other number on the page.
- **Every chart needs an underlying-data escape hatch** — view as table, copy, export.

#### Cross-references

- Page composition, metric cards, direction semantics → [§ Dashboards](#dashboards-surfaces-that-answer-questions)
- Mark-count thresholds, SVG vs canvas, render budgets → [§ Performance](#performance-budgets-and-thresholds)
- Library choice and maintenance status → [§ Ecosystem](#ecosystem-libraries-licenses-maintenance)
- Contrast policy and OKLCH ramp construction → [§ Color and type](#color-and-type-the-method)

---

## AI surfaces — topologies

Any interface where a model does work a human is accountable for. Chat is one topology
among ten and usually the wrong one.

The governing principle: **the interface's job is to make the model's work reviewable at
the speed it is produced.** A surface that generates faster than a human can verify has
moved the bottleneck rather than removed it, and it converts the human into a rubber
stamp — which is exactly the failure mode that makes AI output untrustworthy in
aggregate.

#### Choose the topology before the components

| Topology | Shape | Use when |
|---|---|---|
| **Inline / ghost** | Suggestion appears in place, Tab to accept | The output is small, local, and instantly verifiable |
| **Sidecar** | Panel beside the artefact, both visible | The human keeps authorship; the model advises |
| **Canvas** | Model and human edit a shared document | Output is long-form and iterated |
| **Instrumented session** | A live run with visible steps, logs, interruptibility | Multi-step work the human must be able to stop |
| **Inbox** | Completed work queued for review | Async, batchable, many small items |
| **Shared timeline** | Append-only record of actions by both parties | Auditability matters more than speed |
| **Review gate** | Diff + approve/reject before anything commits | The action is irreversible or expensive |
| **Supervised autonomy** | Runs alone; escalates by exception | High volume, well-bounded, measurable error rate |
| **Provenance-first** | Every claim carries its source inline | The output is a set of factual assertions |
| **Evaluation console** | Runs, scores, regressions across a suite | Building the thing that does the work |

**Chat is the default only because it is the easiest to build.** It is the worst topology
for anything reviewable: linear, unstructured, no diff, no state, and the record of what
happened is a transcript nobody rereads. Reach for chat when the interaction genuinely is
open-ended dialogue, and for almost nothing else.

#### Streaming and progress

- **Stream tokens only where reading-as-produced has value** — prose. Streaming a JSON
  blob or a diff is animated noise; render it complete.
- **Show the step, not a spinner.** "Reading 12 files" → "Drafting" → "Checking" is
  orders of magnitude better than an indeterminate bar, and it costs nothing but honesty
  about your own pipeline.
- **Latency thresholds** (Miller 1968; Card, Robertson & Mackinlay 1991 — the actual
  sources behind the numbers everyone quotes):
  - **0.1s** — feels instantaneous; no indicator needed
  - **1s** — flow preserved; indicator unnecessary but harmless
  - **10s** — the limit of attention. Past this the human context-switches, and the
    surface owes them a progress signal they can leave and return to
- **Past 10s, make the work leavable.** A notification, a persistent run record, a URL
  that survives a refresh. Anything that dies on tab-close will be babysat, which is the
  most expensive possible use of the human.
- **Never let output reflow the page under the reader.** Reserve the space, or append
  below the fold-line of what has already been read. This is a CLS problem and a
  comprehension problem at once.
- **Stopping must be instant and must be honoured.** A stop button that finishes the
  current step first is a lie; say "finishing current step" if that is what it does.

#### Steerability

- **Let the human correct mid-flight**, not only at the end. The cheapest correction is
  the earliest one.
- **Make the plan editable before execution** for anything multi-step. A visible plan is
  also the best available explanation of what the model is about to do.
- **Scope is a control, not a setting buried in a menu** — which files, which records,
  which date range. Show it where the run starts.
- **Re-run with a modification** must be one action, preserving the prior result for
  comparison. Regenerating destructively is how people lose good output.

#### Review and approval

The highest-leverage surface in the whole category, and consistently the least designed.

- **Diff, always.** Before/after with changes highlighted. A summary of changes is not a
  diff and cannot be checked.
- **Approve must be more expensive than reject.** Bulk-approve with no per-item view is a
  rubber stamp with a progress bar — it manufactures the appearance of oversight while
  removing it.
- **Partial acceptance.** Accept 4 of 7 changes. All-or-nothing forces a bad choice and
  usually gets "all".
- **Show what the model was uncertain about** and route the human's attention there
  first. Ranking a review queue by model confidence is the single biggest multiplier on
  human review throughput.
- **Reject must capture why**, in one click from a short list. This is the only training
  signal the system will ever get for free.
- **Irreversible actions get a confirm that names the blast radius** — "Delete 25
  records" not "Are you sure?". Destructive scale must appear in the confirm text.

#### Trust and provenance

- **Cite at the claim, not at the bottom.** A footnote list is unverifiable in practice;
  a source on the sentence is checkable in one glance.
- **Distinguish retrieved from generated.** Different visual treatments, always. This is
  the single most useful trust affordance available and it is nearly free.
- **Never render a confidence percentage you cannot defend.** A fabricated "94% confident"
  is worse than no number: it is precise, unfalsifiable, and readers anchor on it. Prefer
  a coarse band or the evidence itself.
- **Show freshness.** "Data as of" on anything retrieved.
- **Make the prompt/inputs inspectable.** "Why did it say that" is answered by showing
  what it was given, not by generating an explanation of itself — a post-hoc rationale
  from the same model is not evidence of its reasoning.

#### Failure UX

Failure is a design surface, not an exception path, and it is where trust is actually
won:

- **Distinguish the four failure types** — refusal, timeout, tool error, low-quality
  output — because the human's next action differs for each. A single "Something went
  wrong" forces a guess.
- **Preserve the input.** Losing a user's prompt or a half-reviewed edit on failure is
  unforgivable and extremely common.
- **Partial output is valuable — keep it**, marked as partial.
- **Retry must be able to differ**: retry, retry with more context, retry with a
  different approach. An identical retry is often just a slower failure.
- **Say what the model cannot do**, once, at the boundary — rather than letting it
  attempt and fail. A model narrating an action it has no means to take is the worst
  possible outcome and the surface can prevent it by showing which tools are actually
  attached.
- **Never a toast as the only error channel.** It disappears, it is unreachable by
  keyboard, and it cannot hold a diagnosis.

#### Handoff

- **Hand off with state, not a summary.** The human should land in the work, with what
  was done, what is left, and what the model was unsure about.
- **Name the confidence boundary explicitly** — "verified X, did not verify Y". The
  single most valuable sentence any AI surface can produce.
- **The escalation must be a person, not a queue** for anything time-sensitive.

#### Multi-agent

- **A tree, not a chat log.** Parallel work needs a structure that shows what is running,
  what finished, and what depends on what.
- **One accountable surface.** N agents must not produce N notification streams; converge
  to one queue the human owns.
- **Show cost and elapsed time per branch.** Runaway parallel work is invisible without
  it.

#### Anti-patterns

- **Chat as the interface for structured work** — the default that survives because it is
  easy to build, not because it works
- **Rubber-stamp approval** — bulk accept with no diff
- **Fabricated confidence numbers**
- **Anthropomorphic status theatre** — "Thinking…", "Pondering…" in place of the real
  step name. It is charming once and obstructive thereafter, and it hides genuinely
  useful progress information
- **Sycophantic acknowledgement** in a work surface — "Great question!" costs a line of
  screen and a unit of credibility
- **Infinite regeneration with no diff between attempts** — the human cannot tell whether
  anything changed
- **Hiding the model's inputs** while claiming explainability
- **Streaming as decoration** — token-by-token rendering of content nobody reads linearly
- **A stop button that does not stop**
- **Losing user input on error**
- **Autonomy without an error rate.** Any surface that acts unsupervised must publish how
  often it is wrong, measured — or it is asking for trust it has not earned

#### Cross-references

- Composer, streaming and chat component baselines → [§ Component contracts](#component-contracts-what-every-named-control-owes)
- Review queues, exception lists, alert rationale → [§ Dashboards](#dashboards-surfaces-that-answer-questions)
- Spoken and listening surfaces → [§ Voice](#voice-surfaces-that-speak-or-listen)
- Perceived-performance techniques → [§ Performance](#performance-budgets-and-thresholds)

---

## Copy — the presentation layer as an argument

Read this before shipping any surface a user, buyer, or consumer *reads* — a landing
page, a dashboard, a pricing section, an email, an artifact, a deck, an empty state.
The visual audit checks whether the surface is well built; this pass checks whether it
**answers the questions in the reader's head**, in the order they ask them, at the
place their eyes land. Language, layout order, and the artifacts themselves are one
presentation layer — tune them together.

**The law: every surface is an argument. The reader arrives with questions; each
element either answers one or costs attention. An element that answers no question is
decoration; a question with no answering element is a copy gap — same status as a
token gap. Say so; never pad around it.**

---

#### First principle — the five beliefs (Hormozi)

From the value equation in *$100M Offers* — Value = (Dream Outcome × Perceived
Likelihood of Achievement) ÷ (Time Delay × Effort & Sacrifice) — rendered as what a
buyer must actually feel before they act:

| # | Belief | The question in their head | What carries it |
|---|---|---|---|
| 1 | **It gets me the outcome I care about** | "Will this make/save me money (or time, or standing)?" | Headline + hero. Outcome named in the reader's units, not the product's features. |
| 2 | **It will work for *me*** | "People like me, in situations like mine, succeed with this?" | Proof adjacent to the claim: named results, numbers, the demo itself working. |
| 3 | **I'll see results soon** | "How long until it pays off?" | Time-to-value stated: "live in an afternoon", "first brief in 5 minutes". |
| 4 | **It's easy to implement** | "What will this cost me in effort and change?" | The on-ramp shown: steps count, what it plugs into, what it replaces vs. what it doesn't touch. |
| 5 | **It's worth it, and I trust who's behind it** | "Is the value obviously bigger than the price — and who says so?" | Price anchored against the outcome, risk reversal, and trust signals near the ask. |

Run the pass literally: for each belief, point at the element on the surface that
carries it. State it like a measurement — "belief 3 is carried by the subhead's
'first kit in five minutes'; belief 5 has no carrying element." Feelings scale with
proof shown, not claims made.

#### Sequence — the reader's questions are the layout

Order is copy. The eye answers questions in a fixed sequence, and each section gets
one job (patterns.md already budgets the hero — this is why):

1. **What is this?** — answered in the first heading, in plain words. If a visitor
   can't say what the product is after the first screen, nothing below matters
   (Miller: *if you confuse, you lose*; Krug: self-evident beats self-explanatory).
2. **Is it for me?** — the named situation or job. Readers self-select on recognition
   of their problem, not on category jargon (JTBD: name the job it's hired for).
3. **Why this over what I do today?** — position against the *real* alternative,
   which is usually a spreadsheet, an intern, or doing nothing — not the competitor
   you fear (Dunford). "Better" only means something once the alternative is named.
4. **Will it work for me?** — proof, placed here, not ghettoized in a logo row.
5. **What exactly do I do next, and what happens when I do?** — one primary CTA.

Match depth to **stage of awareness** (Schwartz): a problem-aware reader needs the
problem named; a solution-aware reader needs differentiation; a product-aware reader
needs the offer and the risk reversal. Writing most-aware copy for a least-aware
reader is the commonest landing-page failure — it reads as "features for strangers."

#### Checkable rules from the canon

Distilled to what can be verified on the surface, not vibes:

- **The headline does 80% of the work** (Ogilvy). It gets a real draft count —
  write 10+, ship the one a customer could have said. Specifics beat superlatives:
  "cuts screening from 3 weeks to 48 hours" outsells "revolutionary speed."
- **The customer is the hero; the product is the guide** (Miller). Count sentence
  subjects: "you/your" should dominate "we/our/[product]". A surface that narrates
  itself is a mirror, not a window.
- **Copy is found, not written** (Wiebe). The best lines are voice-of-customer —
  what users say in calls, tickets, reviews. If a headline couldn't come out of a
  customer's mouth, keep digging.
- **Concrete beats abstract; one number beats three adjectives** (Heath, *Made to
  Stick*). Every abstract claim gets asked: "can I picture it? can I check it?"
- **Proof sits next to the claim it supports** (Cialdini). A testimonial about ease
  belongs beside the implementation section, not in a carousel at the footer.
  Authority, social proof, and scarcity only work in context — and only honest.
- **Sell the user's competence, not the product's features** (Sierra). "You'll walk
  in knowing their org chart" beats "AI-powered org-chart analysis." Feature lists
  answer questions nobody asked yet; capabilities become *their* superpowers.
- **Front-load every heading, link, and button** (Krug / NN/g). Readers scan the
  first two words. "Pricing that scales" scans; "A flexible approach to pricing"
  doesn't. Same for CTA labels: verb + outcome ("Get the brief"), never "Submit."
- **Address the anxiety at the point of action** (JTBD/Moesta). Every CTA has a
  silent "…and then what happens?" Answer it within 20px: "No card required",
  "Takes 2 minutes", "You can delete everything after."

#### Copy slop tells

The linguistic twin of the 12 visual tells in anti-patterns.md. Any of these is a
flag; three or more means the copy was generated and never reflected on:

1. Unquantified power adjectives: *seamless, powerful, robust, effortless,
   cutting-edge, world-class, next-generation, game-changing*.
2. *Unlock / unleash / supercharge / elevate / empower / transform* as verbs.
3. "Whether you're X or Y" constructions trying to be for everyone.
4. Benefit triads with identical rhythm ("Faster. Smarter. Better.").
5. A headline that could sit on any competitor's site unchanged — the swap test.
6. Feature names Title-Cased As If Trademarked when they're just functions.
7. "We believe…" openings — the reader didn't ask for a creed.
8. Colon headlines restating themselves: "Speed: get results faster."
9. Exclamation marks doing the enthusiasm the evidence should.
10. Jargon naming the category instead of the outcome ("conversational
    intelligence platform").

#### Element checklist

| Element | Its one job | Check |
|---|---|---|
| Headline | Answer "what is this / what do I get" | Swap test; a customer could say it; carries belief 1 |
| Subhead | Qualify who it's for and how fast | Names the job or the time-to-value |
| Primary CTA | Say what happens next | Verb + outcome; anxiety answered adjacent; one per screen |
| Proof | Make belief 2 concrete | Named, numbered, adjacent to its claim |
| Pricing | Anchor cost against outcome | Reader can compute their own ROI from what's on the page |
| Section order | Match the question sequence | No answer appears before its question would arise |
| Empty state | Sell the first action | Says what will be here and how to cause it — never just "No data" |
| Error / microcopy | Say what to do next | Names the fix, not the fault |
| Chart / artifact titles | State the finding, not the topic | "Churn halves after onboarding call" not "Churn rates" |
| Buttons & labels | Front-loaded, outcome-voiced | First two words carry the meaning |

#### Process

1. Name the reader (buyer, end user, exec skimming) and their awareness stage.
2. Read the surface top-to-bottom **as that reader**, writing down each question as
   it arises and whether the next element answers it.
3. Map the five beliefs to carrying elements. List the gaps.
4. Run the slop-tell scan and the element checklist.
5. Rewrite worst-first: gaps before wording, headlines before body, CTAs before
   microcopy. Keep layout changes on the table — moving proof next to its claim is
   a copy fix.
6. Report before/after lines side by side, and which belief or rule each change
   serves. "Tightened the copy" is not a report, same as "improved the spacing."

#### Severity

| Level | Meaning |
|---|---|
| **Critical** | A belief with no carrying element; a first screen that fails "what is this"; a CTA that doesn't say what happens |
| **Major** | Proof detached from its claim; feature-voice where outcome-voice belongs; section order that answers questions out of sequence |
| **Minor** | Slop tells, word economy, front-loading polish |

#### Mode notes

- Runs as part of **Audit** whenever the surface carries persuasive or instructional
  copy; standalone when asked to "review the copy", "tighten the messaging", or
  "does this land?"
- **Brand-locked surfaces:** this pass governs the persuasion architecture; brand
  voice and terminology compliance still go through the brand`s own kit. Both must
  pass — on-brand copy that answers no question is still a fail here.
- This pass changes words and element order. It does not restructure components —
  that's Build/Polish territory under contracts.md.

---

## Adoption — will anyone open it

For an internal tool, the dominant failure mode is not ugliness. It is a well-built,
well-tokenised, accessible surface that nobody opens. That outcome is decided before
layout, by four questions, and it is a **design** defect — not a training problem, not a
change-management problem, and never something a launch email fixes.

Everything here applies to internal and workflow surfaces: dashboards, cockpits, consoles,
admin tools, review queues, digests. Marketing surfaces are governed by
[§ Copy](#copy-the-presentation-layer-as-an-argument); this file is about the thing someone has to open on a Tuesday.

#### The four gates — answer before you draw anything

| Gate | The question | Fail state |
|---|---|---|
| **Ritual** | Which recurring meeting or moment does this surface run? | A tool with no meeting is a hobby. |
| **Private win** | Per persona, what one fact does this give them that they cannot get by asking a person? | A reporting burden with a UI. |
| **Shortest path** | Is this the fastest route to something they already had to do, with no step where they must work out where to go? | A tax, paid in junk data. |
| **Absence** | What breaks if nobody opens it for a week? | "Nothing" — so nobody will. |

Write the four answers down. If any is weak, the fix is upstream of the design, and the
honest report says so and names whose decision it is.

#### 1. Ritual — attach every surface to a recurring meeting

Adoption is downstream of ritual. If the forecast is read off your screen in the Monday
call, every manager updates their deals before Monday — not because the UI is good, but
because being wrong in public is expensive.

- **Design backwards from the agenda.** Screen order matches the order items are
  discussed. The first thing on screen is the first thing said out loud.
- **Whoever's screen is projected owns the narrative.** Pick that screen deliberately.
- **The artifact must regenerate itself.** If anyone rebuilds the same numbers in a
  spreadsheet the night before, your surface already lost — the spreadsheet is the real
  tool and it will win every week.
- **Name the human who is embarrassed when it is wrong.** A surface with no owner degrades
  to decoration in about three weeks.
- **One question per surface.** Two surfaces answering the same question get neither
  adoption nor trust; people pick the one their boss quoted last.

#### 2. Persona asymmetry — each role needs a different product

Same data, three different questions. This is where most multi-persona tools die: the
second persona's view is the first persona's view with a filter, so the second persona
never opens it.

**Checkable:** if two persona views share more than ~80% of their fields, columns and
actions, it is a filter, not a product. Split the question or drop the view.

| Persona | The question they actually have | What earns the open |
|---|---|---|
| Individual contributor | "What is about to embarrass me?" | Early warning — the thing their manager will raise, before it is raised. |
| Manager | "Where do I spend the next hour?" | A ranked short list, with the reason for the rank. |
| Exec | "What number can I defend, and why?" | A figure that drills to the records behind it. |

- Lead the IC view with **exposure avoidance, not a score.** "Your manager will ask about
  these three on Monday" is a service. "You are at 62%" is a verdict.
- The exec number must be traceable in one click to the rows that produced it, or it will
  be re-derived by hand and the surface is bypassed.
- If a persona's only interaction is being measured, expect minimum-compliance data.

#### 3. Shortest path — compliance is a byproduct, never the ask

Nobody logs a call to be compliant. They log it if logging it is how the follow-up gets
drafted.

- **Walk the path from notification to committed change and count the steps where the user
  has to work out where to go next.** Those are the ones that cost. Raw click count does not
  predict success — the 3-click rule is debunked (UIE, 2003; see the myth table in
  [§ Dashboards](#dashboards-surfaces-that-answer-questions)) — but a step whose next move is not obvious is where people leave.
- **The fix happens where the problem is named.** Inline edit on the card that flagged it.
  "Open the record, find the field, save" hides a search inside step two, and a search is
  where the session ends.
- **Every required field owes the user something inside the same session.** A field that
  only feeds someone else's report is a tax, and taxes are paid in fiction.
- **Never ask for what the system already knows.** Prefill, then let them correct.

#### 4. Push and pull — consume in push, act in pull

Executives and reps consume in **push** (email digest, Slack, the meeting artifact) and act
in **pull** (one record, one decision). Build both halves; a surface that only exists as a
destination depends on memory, and memory loses to an inbox.

- A push message links to **a record or a filtered queue with the filter already applied** —
  never to a dashboard home. A landing page is where intent goes to die.
- **Push arrives before the ritual, not after.** A digest that lands after the meeting is a
  newsletter.
- **Content is the delta since last time**, not the standing state. A message that restates
  what the reader already knows trains them to skip the next one.
- **One digest per persona per cadence.** A second daily notification roughly halves the
  first one's open rate.
- Two channels max, and the same deep link in both. Slack for the people who live there,
  email for everyone else.

#### 5. Visibility, and the shame trap

People fight to use surfaces where their work becomes visible upward. They quietly sabotage
surfaces whose only function is to expose them.

- **Show effort and improvement, not only shortfall.** Rank on inputs the user controls.
- **Public shortfall belongs in a 1:1**, not a leaderboard. A board that only lists who is
  behind produces data entry theatre within two cycles. The mechanics of doing a scorecard
  without backfire — personal-best over peer rank, disputable numbers, manager-visible by
  default — are in [§ Dashboards](#dashboards-surfaces-that-answer-questions) § Accountability surfaces.
- Make the *good* path visible: the rep who cleared their queue should be legible to their
  manager without asking. That, not the scorecard, is what gets it opened daily.

#### Measuring adoption — metrics that can fail

State these as numbers, per the reporting rule. Every one of them can come back bad.

| Metric | Definition |
|---|---|
| **Weekly active named users** | distinct eligible humans, not events, not page views |
| **Time to first action** | grant of access → first committed change through the surface |
| **Pushed-item completion** | items resolved / items pushed, per cadence |
| **Ritual traceability** | share of the meeting's decisions that came off the surface |
| **The honest one** | turn it off for a week — count who complains |

Vanity, do not report: page views, "engagement", cards generated, sessions, deploys,
number of dashboards shipped.

**Rollout is gated on evidence, not calendar.** Do not widen access until at least one
ritual has actually been run off the surface and pushed-item completion is non-zero for the
pilot cohort. Widening a permset over a cohort with zero actions multiplies zero.

#### Adoption slop — the failure taxonomy

1. Wall of KPI cards with no next action.
2. A "Reports" tab.
3. Persona views one filter apart.
4. A notification restating what the user already knew.
5. A link to a home page instead of a record.
6. Required fields that pay nothing back in-session.
7. A dashboard with no owner and no meeting.
8. A leaderboard that shows only shortfall.
9. The same numbers rebuilt by hand in a spreadsheet every week.
10. Access widened before a single user resolved a pushed item.
11. Two surfaces answering the same question.
12. "We'll do a training" as the adoption plan.
13. Stub routes shipped alongside live ones — one dead link teaches people the whole tool is
    unfinished.
14. An empty state that explains the feature instead of doing the first useful thing.

#### Cross-references

This file is about whether the surface is opened. Once someone is looking at it:

- What goes on the screen, queue design, alert rationale, scorecards without backfire → [§ Dashboards](#dashboards-surfaces-that-answer-questions)
- Screen composition → [§ Patterns](#patterns-screen-archetypes) · component baselines → [§ Component contracts](#component-contracts-what-every-named-control-owes)
- The words on it → [§ Copy](#copy-the-presentation-layer-as-an-argument)

#### Reporting an adoption finding

Same bar as every other shine claim: the numbers, and what you did not do. Name the ritual,
the persona, the measured step count, and the current active-user figure. If the blocker is
organizational — no meeting owns this screen — say that plainly rather than shipping another
tab and calling it done.

---

## Voice — surfaces that speak or listen

Read this when a project adds any of: text-to-speech, a read-aloud mode, a spoken
summary layer, voice commands, dictation. Every rule below was earned on
2026-08-05 building two of them in one day (the Stop-hook speaker and the
Meeting Recon voice mode); the incidents are cited inline.

**The law: a voice layer is a summarizer with manners, never a screen reader.**
Nothing leaves the speaker that a colleague wouldn't say across a desk, and
nothing the mic hears steers the app unless a human meant it to.

---

#### Output — write for the mouth, not the eye

- **Never read UI or agent text verbatim.** Summarize to one or two spoken
  sentences: what happened, what needs the listener. "Nothing needs you" is a
  valid and excellent ending.
- **Ban from speech** — things no human says aloud: file paths, commit hashes,
  URLs, version strings, branch names, markdown syntax, emoji, code
  identifiers, raw ISO dates. If the fact matters, translate it ("the deploy
  finished", not "d-p-l underscore three-V-one…").
- **Homographs get rephrased, not trusted.** *live* → "deployed and running" /
  "up". Watch *read, lead, close, record, present, tear, wound* — a TTS engine
  picks the wrong one exactly when it's funniest. Incident: "Live." opened a
  status report and the voice said /lɪv/.
- **Numbers are rounded and spoken with units.** "Contrast about twelve and a
  half to one", never "12.49:1". Four digits max out loud.
- **Month abbreviations become month names before the mouth.** A TTS engine
  reads "Jul" as *Jewel* and "Aug" as a word. Expand Jan–Dec, speak ISO dates
  as dates, expand $1.2M-style suffixes, read ratios as "4.5 to 1". Ship it as
  a deterministic speechify() pass with unit tests — no model needed between
  the page and the voice.
- **Strip eye-chrome at the DOM, not with regex.** Chips, status labels,
  citations and icons are for the eye; clone the row and remove them by class
  before extracting a word. And join sibling text blocks with a real space —
  textContent fuses "DDQ?" and "4 of 47" into one token. Incident: the brief
  read every tag on the bottom of the ticket.
- **Sentence case, no lists.** Speech has no bullets; if the summary needs a
  list, it isn't a summary yet.
- **The browser's speechSynthesis default is never the product's voice.** If a
  surface owns a voice, the product serves the audio: a server-side TTS proxy,
  key never in the client, gated to a verified session so it can't be farmed.
  Web Speech synthesis is only the fallback for when the proxy can't answer.
  Incident: the kit brief shipped on the OS robot lady while the brand voice
  sat one API call away.

#### The summarizer harness (LLM → TTS)

- System role in one breath: *you are the spoken-voice layer; reply with one or
  two short spoken sentences, casual, like a colleague leaning over; output
  only the sentences.* Put the write-for-the-mouth bans in the prompt.
- **Disable reasoning traces.** Thinking-mode models leak deliberation as plain
  prose, not tags — `chat_template_kwargs: {enable_thinking: false}` for
  Qwen-class; `/no_think` in the prompt does NOT reliably work through a
  router. Incident: three minutes of chain-of-thought narrated through
  ElevenLabs in a warm baritone.
- **Cap twice.** `max_tokens` ≈ 220 at the model AND a character truncation
  (~500) after extraction — the second cap is what saves you when the first
  lies.
- **Timeout every leg** (LLM call, TTS call, playback) and run the whole thing
  async. A voice layer never blocks and never fails the host turn: log and go
  silent, don't throw.
- **Kill switch is a file** (`touch …/voice.off`), not a setting behind a UI.
- **Latency budget: first audio under ~8s.** Fast TTS tier for summaries
  (`eleven_flash_v2_5`-class); premium voices are for produced content, not
  turn chatter.

#### Input — recognition

- **Grammar over dictation.** Word-boundary regexes against a small command
  set; echo what was heard into the status live region so misses are visible.
- **Playback-scoped grammar.** While TTS is speaking, honor ONLY the transport
  family — stop/mute/quiet/cancel · pause/hold on · resume/continue — and
  ignore everything else. The synthesized voice can pronounce your own nav
  keywords; without the scope, a brief that says "board" navigates mid-read.
- **Keep the ear hot while speaking.** Engines end after one result; re-arm in
  `onend` while playback is live so "stop" always lands, and null the
  recognizer ref when it winds down or the next arm silently no-ops.
- **A command with no target takes the obvious default.** "Brief me" with
  nothing open opens the first item and starts; voice users want motion, not a
  form error telling them to click something first.
- **Accept synonyms.** stop = mute = quiet = cancel; pause = hold on;
  resume = continue = keep going.

#### UI sync — the contract

One control, three states, words at every step:

```
idle       mic icon        aria-label "Voice commands"    aria-pressed false
listening  mic, live fill  status: "Listening…"           aria-pressed true
speaking   STOP square     aria-label "Stop reading"      aria-pressed true
```

- **The same button stops everything at every stage.** Never make a listener
  hunt for a second control while the thing is talking at them.
- State is carried by icon shape + label + a `role="status"` region — never by
  color alone.
- **Route change cancels speech and clears the speaking state**, or the stop
  button orphans on a page that isn't reading.
- No Web Speech support → render nothing. A disabled mic is furniture.
- First audio follows a user gesture. Never speak on page load.
- **Teach the control with motion, not a scene.** A page that explains a
  voice feature shows the CONTROL cycling its states — a tight looping strip
  of idle → listening → reading captured from the running app — beside three
  numbered steps. A full-app screenshot "showing voice" teaches nothing;
  reviewers said so in exactly those words (2026-08-05).

#### Test harness traps

- Plain assignment to `window.speechSynthesis` silently loses to the native
  object — mock with `Object.defineProperty` (and mock the Utterance class too,
  or native `speak()` type-rejects yours).
- Host "voice modes" may be input-only — Claude Code ships zero TTS; the
  robotic readback people complain about is the OS spoken-content layer. Build
  the speaker, then have the user turn the OS one off, or they duet.
- Playback time counts against hook/harness timeouts — bound the utterance
  length, not the player.

---

## Brand mode — the adapter

> **A private brand pack may install `brand.local.md` beside this file.** It is
> gitignored, and it wins: read it instead of this one, which is the generic
> adapter. Installing a real brand must never mean editing a tracked file — that
> is how a brand value ends up in a public diff.

Activate when the user names a brand, says "on-brand", or the work is clearly
brand-facing (marketing site, demos, client decks-as-web, product UI carrying a
company's identity).

**A brand lane is a token override plus a small set of bans — not a second design
system.** Everything in [§ Component contracts](#component-contracts-what-every-named-control-owes), [§ Patterns](#patterns-screen-archetypes), [§ Taste](#taste-measured-thresholds-and-failure-tells) and
[§ Component contracts](#component-contracts-what-every-named-control-owes) still applies. This file is the adapter: what a brand
kit has to tell you, and what changes once it has.

#### Load order

1. **Read the brand's own kit before writing anything.** A brand skill, a PDF, a
   Figma export, a `colors_and_type.css` — whatever exists. Name the file you
   read. A remembered palette is a guess, and a guess in brand work is the one
   error a client always catches.
2. **Build the tokens, don't transcribe them.** Declare the brand palette once
   as custom properties in a single token block and reference it with `var()`
   everywhere else. Keep brand values out of public trees and shared examples.
   Hand-copied hexes are how five surfaces end up with five slightly different
   navies.
3. **Copy and terminology go to the brand's own voice authority**, if it has one.
   This skill owns layout, interaction, and component completeness. Don't fork
   messaging rules in here.
4. **Check the live site before shipping visuals.** WebFetch the brand's
   homepage. A kit describes intent; the site is what your work sits next to.

#### What the kit must specify — and what to do when it doesn't

| Needed | If absent |
|---|---|
| Canvas + one dark anchor | Derive from the primary's hue at fixed lightness; never invent a second accent |
| Action color, and whether it may fill | Assume **action-only**. An accent used as a body fill at scale is the loudest off-brand tell |
| Type roles: display / body / UI | Use the kit's faces only. No substituting Inter/Roboto/Arial for a licensed display face |
| Case and tracking rules per role | UPPERCASE UI faces usually want positive tracking (~0.1em); read [§ Color and type](#color-and-type-the-method) |
| Radii ladder | `child = parent − padding`; pick one ladder and hold it |
| Motion | Cap at ~200ms, standard ease, no bounce |
| Icon family + stroke | One family. Match stroke to the type weight; no emoji |
| Logo misuse bans | Treat any logo gradient/lockup as **wordmark only** unless the kit explicitly permits it on chrome |
| Status colors | **If the kit doesn't define them, the lane doesn't have them.** Borrow neutrals from the base lane rather than inventing brand-adjacent reds and greens |

Anything the kit leaves silent is a decision you are making on the brand's
behalf — say so in the handoff rather than leaving it implied.

#### Marketing surfaces

- Anchor sections in the brand's dark value; textures on dark only, low opacity
- Any signal/pattern motif fades or bleeds — never hard-cut
- Primary button: the action color, solid, in the brand's UI face
- Secondary: outline in the brand's primary (inverted on dark)
- Composition follows [§ Patterns](#patterns-screen-archetypes)'s marketing hero budget and
  brand-first test

#### Product / app surfaces

Same tokens and type roles, adapted for density:

- No marketing hero inside a dashboard
- Action color stays action-only — buttons, link emphasis, connectors; not fills
- Tables/forms/menus keep the full [§ Component contracts](#component-contracts-what-every-named-control-owes)
  contract (a brand admin table is DataGrid-class)
- Prefer bordered/flat elevation; a soft primary-tinted shadow only where brand
  cards call for one
- Motifs stay in settings/marketing chrome, not every app panel
- If an uppercase display face harms scanability in data-dense views, move dense
  labels to the body face and keep CTAs on-brand

#### Completeness still applies

Brand mode never excuses stubs. A branded admin table still gets toolbar, sort,
filter, pagination, sticky header, empty/loading/error states, and a11y.

#### Private brand lanes

A real brand lane lives outside any public tree: the palette source + this
file's brand-specific twin, distributed privately to the people who need it.
Never let real brand values enter a public repo or a shared example.

---

## Salesforce — Lightning and SLDS 2

Verified 2026-08-04 against live docs and by inspecting the shipping npm artifacts.

**Verdict up front: a constrained palette target, not a design target.** Budget for "our brand colors on Salesforce's design system," not "our design system on Salesforce." That's achievable, durable, officially supported, and roughly a day of emitter work.

---

#### Status

**SLDS 2** is the design system. **Cosmos** is the first *theme* built on it — the two are not synonyms and are often conflated.

| Release | Event |
|---|---|
| Winter '25 | Beta, as "Enhanced Lightning User Interface" |
| Spring '25 | Renamed SLDS 2 (beta). `lightningdesignsystem.com` now serves SLDS 2; SLDS 1 moved to `v1.lightningdesignsystem.com` |
| **Winter '26** | **GA, all editions** |
| Summer '26 (current) | Dark mode broadened; Themes and Branding UI expanded to typography, shadows, sizing, spacing |
| Winter '27 | Group-based SLDS 2 activation *(roadmap preview, non-binding)* |

**SLDS 1 is not deprecated and has no announced retirement date.** SLDS 2 is default for **new orgs only**; existing orgs opt in via Themes and Branding.

**No SLDS 2 support planned** for: Salesforce mobile app, Flow Builder, Lightning App Builder, Lightning Out, **Experience Cloud**.

**What *is* formally deprecated: SLDS 1 design tokens (`--lwc-*`).** The doc page title literally carries "(Deprecated)" — they still work in SLDS 1 themes but are **not included in SLDS 2 themes**.

npm ships both in parallel — `@salesforce-ux/design-system` dist-tags: `summer-26: 2.30.4`, `winter-27: 2.264.0-beta.3`.

---

#### The token architecture

`--sds-*` is dead legacy. Live namespace is `--slds-` with a **tier letter** as the second segment. Counts extracted from `@salesforce-ux/design-tokens@4.1.0` (install it and read `flat.json` for the authoritative list):

| Tier | Prefix | Count | Status for us |
|---|---|---:|---|
| **Reference** | `--slds-r-*` | **85** | **The only sanctioned override surface** |
| Global | `--slds-g-*` | 524 | Consume only — **overriding is explicitly prohibited** |
| Shared | `--slds-s-*` | 107 | Classified **private**, prohibited |
| Component | `--slds-c-*` | — | Officially unsupported in SLDS 2 |
| Private | `--_slds-*` | — | Prohibited |

Cosmos theme total: **717 tokens** (524 global + 107 shared + 85 reference + 1 config flag), 42 flagged deprecated.

The chain resolves `r → g → s → c`:

```css
--slds-g-color-accent-1: var(--slds-r-color-brand-50);
--slds-g-color-accent-2: light-dark(var(--slds-r-color-brand-40), var(--slds-r-color-brand-70));
```

**This is the leverage point.** Because of that chain, overriding **17 `--slds-r-color-brand-*` steps recolors the entire accent system across every component.** The emitter's whole job for Salesforce is mapping a brand ramp onto ~85 reference tokens.

##### Shine's slds voice sheet is derived from this package

Any SLDS fallback values you write must come from the package's own resolved values,
re-checked against the installed `@salesforce-ux/design-tokens` version — never from memory.

It has to be checked rather than trusted, because the sheet was previously written from values
read off one rendered org. That org was still on SLDS 1, so every fallback was wrong — a font
family of `"Salesforce Sans"` against SLDS 2's system stack, SLDS 1's `#0176d3` brand blue,
`#ba0517` error, `#2e844a` success — and a measured value is indistinguishable from a correct
one by inspection.

**The trap worth naming: SLDS 2 numbers its text hooks by weight, not by importance.**
`--slds-g-color-on-surface-1` is the *lightest* ink (body copy, placeholders, field labels) and
`--slds-g-color-on-surface-3` is the *darkest* (titles). The old sheet mapped Shine's primary ink
to `on-surface-1` and its muted ink to `on-surface-3` — exactly inverted. Both pairs pass a
contrast check, which is why the test asserts the mapping directly.

The prohibition, verbatim from *New Global Styling Hooks Guidance*:

> "We don't support overriding the values of global styling hooks in your customizations."
> "Re-assigning a new value to a global styling hook inside your component is prohibited. You will be subject to test failures and future breaking changes."

⚠️ Note a genuine contradiction: the token package README documents `--slds-s-*` as a normal public scope, while the guidance page classifies it as private and prohibits consumption. The package emits them; the guidance forbids using them. **Treat the guidance as controlling.**

---

#### The token contract is first-class — better than most design systems ship

`@salesforce-ux/design-tokens@4.1.0` (2026-08-08) ships per theme:

- `*.global.tokens.raw.json` — DTCG-faithful (`$value`, `$type`, `$description`, `$extensions`)
- `*.global.tokens.flat.json` — **717 entries, consumer-oriented**
- `*.{global,reference,shared}.tokens.css`
- iOS Swift + Android Kotlin outputs
- `*.deprecated.tokens.raw.json`

Every flat entry carries `name`, `value`, `originalValue`, `type`, `syntax`, `category`, `scope`, `namespace`, `description`, `inherits`, `themeOwned`, `darkValue`, `deprecated`, and **`cssProperties`** — the allowlist of CSS properties the hook is legal on. 628 of 717 are `themeOwned`; 287 carry a distinct `darkValue`.

Built with Style Dictionary v5, with a dedicated `validate:dtcg` compliance check. Dark mode lives in `$extensions["com.salesforce-ux.mode"].dark`.

**OKLCH is authoring-only.** README: *"Palette aliases defined in OKLCH perceptual color space, converted to hex for compatibility."* Grepping the shipped CSS: **zero** `oklch()`, `color-mix()` or P3 — 506 hex literals. Do not hand SLDS an OKLCH value and expect it to work. It does use **`light-dark()`** heavily — 302 occurrences in the Cosmos global file.

**SLDS 2 decouples structure from style.** Confirmed in `@salesforce-ux/design-system-2@2.264.0`: `css/modular/slds2.base.css` (structure, no theme values) ships separately from `css/modular/slds2.theme.cosmos.css` (token values only), so themes swap by changing one `<link href>`.

---

#### Override mechanics are unusually permissive

All token declarations sit in:

```css
@layer theme { :where(html) { /* … */ } }
```

`:where()` is zero-specificity **and** layered CSS loses to unlayered author CSS. So any custom property you set wins trivially — **no `!important`, no specificity fights.** That's a real gift and rare.

**Custom properties pierce shadow boundaries** — they're inherited properties, so synthetic vs native shadow doesn't matter here. Synthetic remains the LEX default; native is per-component opt-in via `shadowSupportMode = 'native'`, still Beta, no announced date for flipping the default.

---

#### The blunt part: you cannot deliver the overrides

**There is no supported org-wide CSS injection point in internal Lightning Experience.**

- `loadStyle` from `lightning/platformResourceLoader` is **scoped to the calling component**.
- Experience Cloud has a real Custom CSS panel in Experience Builder. **Internal LEX has nothing equivalent.**
- Appending `<style>` to `document.head` from an LWC is undocumented, unsupported, and will break.
- The only sanctioned global path is **Themes and Branding — a human clicking in Setup.**

So the realistic Salesforce output of a token system is **not a stylesheet**. It's:

1. A **brand palette spec** an admin transcribes into Themes and Branding, and
2. **Per-component CSS** for LWCs you own.

If the architecture assumes "emit a file, load it, done," Salesforce breaks that assumption. This is the same tier as the email target — constrained by the renderer, not by the design.

LWC CSS limits: `:host` works; ID selectors, `:host-context()` and `::part` are unsupported; you cannot style a child component's internals — custom properties are the documented cross-boundary mechanism.

---

#### What you can and cannot control

**Can:** brand color ramps · typography, spacing, sizing, shadows, radius and illustration color via Summer '26 Themes and Branding · light/dark pairs free through `light-dark()` · full CSS inside LWCs you author.

**Cannot:** layout · spacing rhythm · component structure · iconography · border treatments · the Cosmos circular-motif visual language · anything in Flow Builder, App Builder, mobile or Experience Cloud · any managed-package component.

---

#### Tooling

**SLDS Linter** — `@salesforce-ux/slds-linter@1.2.1` (2026-03-05). Plain npm CLI, ESLint-based (migrated off Stylelint), SARIF or CSV output, and integrated into Salesforce Code Analyzer. **Runs headless in CI.**

```bash
npx @salesforce-ux/slds-linter@latest lint
npx @salesforce-ux/slds-linter@latest lint --fix
npx @salesforce-ux/slds-linter@latest report
```

Relevant rules: `no-hardcoded-values-slds2`, `no-slds-var-without-fallback`, `lwc-token-to-slds-hook`, `no-unsupported-hooks-slds2`, `enforce-component-hook-naming-convention`, `no-slds-private-var`, `no-deprecated-classes-slds2`.

**`--fix` is a genuine codemod.** It rewrites `--lwc-*` → `--slds-g-*` keeping the old value as a CSS fallback, wraps hardcoded values as `var(--slds-g-*, <original>)`, fixes BEM syntax, and renames malformed hooks.

⚠️ **But for `no-unsupported-hooks-slds2` the "fix" is deletion** — unsupported `--slds-c-*` hooks are removed, because there is nothing to remap them to. Read the diff before accepting it.

The **SLDS Validator** VS Code extension (v2.0.8) is a separate thing; its SLDS2 rules are beta and off by default.

There is **no product called "SLDS Migration Assistant."** It doesn't exist.

---

#### Component hooks: docs are lagging the code

Official line, unchanged since Spring '25: *"Component styling hooks aren't currently supported in SLDS 2… we recommend that you keep your org on SLDS 1 themes for now."* No committed date.

**But the shipping artifact says otherwise.** The `@salesforce-ux/design-system-2` changelog shows active per-component re-opening through 2026 — *"open component hook API on accordion,"* *"open hook API on trees,"* *"open color hook API on tile"* — plus a new Storybook Component Hooks addon and a HookAPI doc block.

Measured in the shipped CSS: of **275 unique `--slds-c-*` names referenced, 90 are now declared**, and **35 of 89 components** have a migrated `themes/cosmos.css` layer. The blanket "not supported" is stale, but there's no roadmap commitment to cite.

---

#### Audit the target org before scoping anything

Every org is different, and the inventory decides the plan. Run it first — it is
20 minutes of grep against the metadata repo, and it changes the answer:

| Count | Why it matters |
|---|---|
| LWC components, and how many carry CSS | The real surface area |
| Hex + `rgb()` literals | The migration bill, and the argument for tokens |
| `px`/`rem` literals | Spacing is usually ~100% hardcoded — confirm before promising a scale |
| Hand-authored styling hooks, by tier | `--slds-c-*` is unsupported in SLDS 2; `slds-linter --fix` will **delete** them |
| Global `--slds-g-*` hooks | Overriding these is explicitly prohibited — any count above zero is a finding |
| `loadStyle` usage | The only component-scoped CSS path; none means nothing is themed today |
| Private variable namespaces | Competing conventions for one concept are the real defect, not the count |
| Vendored SLDS static resources | Read the version numbering — a `2.0.x` resource is SLDS **1** |
| Nested projects with their own `sfdx-project.json` | Live or abandoned changes the scope materially |

Two failure shapes worth naming, because both are common and neither surfaces in
a token audit: **a design system delivered through an iframe** — a static-resource
stylesheet an LWC points an iframe at, whose tokens reach nothing outside the
frame — and **an SLDS styling hook fed a hardcoded brand hex**, which is the whole
problem in one line.

---

#### The plan for any target

1. **Emit a brand-palette spec**, not a stylesheet — the ~17 `--slds-r-color-brand-*` steps plus the Themes-and-Branding-settable values, as a document an admin transcribes once.
2. **Emit per-component CSS** for LWCs you own, using `var(--slds-g-x, var(--lwc-y, literal))` so it degrades cleanly on SLDS 1 orgs.
3. **Wire `slds-linter` into CI** with SARIF output. This is free, official, and immediately useful regardless of anything else here.
4. **Do not migrate the literals as a project.** Fix them opportunistically as components are touched, starting with hardcoded brand hexes — those are pure duplication of tokens that already exist.
5. **Consume `flat.json` as the authority** for what tokens exist. Do not hand-maintain a mapping table.

#### The emitter exists

When emitting brand values for Salesforce, produce three things: the admin
transcription spec (for the Themes & Branding UI), the LWC `:host` fallback block,
and a machine-readable ramp. Authority is `@salesforce-ux/design-tokens` flat.json.
Never hand-maintain a hook mapping; re-derive after upgrading the package.

---

#### Surface ontology — name the host or fail

Palette mapping is necessary and **not sufficient**. Lightning is a family of hosts
with different density, CSS, and owned chrome. Cite `lex-*` packs, not a SaaS dashboard.

| Host | Catalog | Density | Notes |
|---|---|---|---|
| LEX standard | `lex-record`, `lex-record-narrow` | compact | Record home = highlights (≤4 fields) + Path + Dynamic Forms + related as tabs + activity. Component width is often **~494px**. `@container` on `:host`, never `@media` for that width. |
| LEX console | `lex-console` | compact | Utility bar is one job, keyboard, no page. Do not paint a second sidebar. |
| LEX list | `lex-queue` | dense | `lightning-datatable` contracts; **unsupported on Salesforce mobile**. |
| LWR / Experience | `lex-lwr` | editorial | SLDS 2 unsupported on Experience Cloud. Behance-legal only here, not on LEX. |
| Email | `lex-email` | 600px tables | `tokens/dist/*/email.*`. |
| Mobile / Mini | `lex-mobile` | compact | No datatable. Separate page. |

**Belong first.** Clone GridBuddy-shaped density, then one owned empty state or utility-bar command. Do not Linear-ize an LWC.

**Walk `shadowRoot`.** A probe that reports 0/0 is broken. `getComputedStyle` empty string on a `--slds-*` hook is a finding — write the fallback. Custom datatable cells: `data-navigation="enable"` all the way down.

**Stale bundles** cache CSS. After token emit, hard-refresh / bump static resource, not “it looks like the old theme.”

**slds-linter** in `doctor --full` for LEX consumers when `slds-linter` is on PATH. Do not invent a second linter.

---

## Performance — budgets and thresholds

Numeric budgets and the fixes that actually move them. Performance is a design property:
past a threshold, a slow interface is a *wrong* interface, because the user's model of
what they clicked has already decayed.

#### Budgets

**Core Web Vitals** — the threshold is the **75th percentile** of real users, not your
laptop:

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| **LCP** — largest contentful paint | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **INP** — interaction to next paint | ≤ 200ms | ≤ 500ms | > 500ms |
| **CLS** — cumulative layout shift | ≤ 0.1 | ≤ 0.25 | > 0.25 |

INP replaced FID in March 2024 and is much harder to pass — it measures every
interaction's full latency to the next paint, not just the first input's delay. Most
dashboards fail INP, not LCP, and they fail it on filter and sort.

**Human thresholds** (Miller 1968; Card et al. 1991):

| Budget | Meaning |
|---|---|
| **100ms** | Feels instant. Direct-manipulation feedback must land here — hover, selection, toggle |
| **1s** | Thought flow preserved. Navigation and filtering should land here |
| **10s** | Attention limit. Past this the user leaves; the work must survive their leaving |

**Asset budgets** for a data-heavy app on a mid-tier device:

- **JS ≤ ~170KB compressed** on the critical path. A charting library alone can exceed
  this — check before choosing ([§ Ecosystem](#ecosystem-libraries-licenses-maintenance)).
- **Fonts: ≤ 2 families, ≤ 4 weights**, `font-display: swap`, subset and preload. Variable
  fonts pay for themselves at 3+ weights.
- **Never ship a full icon font.** Per-icon SVG or a tree-shaken set.

#### Rendering thresholds

Where the technique has to change, not merely be tuned:

| Scale | Technique |
|---|---|
| < 1,000 marks | SVG. Full DOM, styleable, accessible, easy |
| 1,000 – 10,000 | Canvas 2D. SVG node count starts costing layout and memory badly |
| > 10,000 | WebGL, or aggregate server-side first — usually the right answer |
| Tables > ~100 rows | Virtualize |
| Tables > ~10,000 rows | Server-side pagination and sorting; virtualization alone stops being enough |

**Aggregate before you send.** The most effective dashboard optimisation by a wide margin
is not shipping row-level data to the browser at all. A cockpit that transfers 50,000 rows
to compute six numbers has a data-architecture problem that no amount of front-end
technique will fix.

#### The playbook, in order of yield

1. **Server-side aggregation.** Send the six numbers, not the rows behind them. Fetch rows
   on drill-down.
2. **`content-visibility: auto` on below-fold modules.** The single highest
   effort-to-payoff CSS change available for long dashboards — the browser skips layout
   and paint for off-screen subtrees entirely. Always pair with `contain-intrinsic-size`
   to give the skipped element a placeholder height, or the scrollbar jumps as content
   comes into view.

   ```css
   .panel { content-visibility: auto; contain-intrinsic-size: auto 480px; }
   ```

   Caveat worth knowing: skipped subtrees are still exposed to the accessibility tree and
   are findable by in-page search, so this is not a correctness risk — but do not use it
   on anything that must animate as it enters.
3. **Virtualize long lists** (`react-window`, TanStack Virtual). Keep the sticky header
   and preserve keyboard navigation across the virtual boundary — the usual bug is that
   Tab escapes the list.
4. **Stale-while-revalidate.** Render cached numbers instantly with an "as of" stamp, then
   update. Perceived performance beats actual, and the stamp keeps it honest.
5. **Break up long tasks.** Anything > 50ms blocks input and shows up directly in INP.
   `await scheduler.yield()` between chunks where available; `setTimeout(0)` otherwise.
6. **Debounce remote, not local.** Filtering in memory should be immediate; a remote query
   gets ~300ms and a visible busy state.
7. **Memoize the expensive derivation, not the component tree.** Most React memoisation is
   cargo cult; profile first.

#### Perceived performance

- **Skeletons that match the final layout.** A skeleton with different geometry causes a
  visible reflow and is worse than a spinner.
- **Reserve space for everything async** — images with `width`/`height` or
  `aspect-ratio`, chart containers with a fixed height. This is the whole of CLS.
- **Optimistic UI where the failure is recoverable and rare**, with a clear rollback.
  Never optimistic for anything destructive or financial.
- **Progressive disclosure of data**: headline numbers first, chart second, table last.
  Match the loading order to the reading order.
- **Instant feedback on every interaction, even if the result is slow.** The button must
  respond in 100ms even when the work takes 3s.

#### Measuring

- **Lab (Lighthouse, Playwright) proves a change; field (RUM/CrUX) proves the experience.**
  Lab numbers on a fast machine on a warm cache mean approximately nothing on their own.
- **Throttle deliberately.** 4× CPU slowdown and Slow 4G is roughly a real mid-tier
  device; unthrottled localhost is not a test.
- **Measure INP by interacting**, not by loading. A page-load audit never touches the
  metric most dashboards fail.
- **Track the 75th percentile.** Means hide the tail that defines the reputation.
- **Budget in CI and fail the build.** A budget nobody enforces is a wish.

#### Accessibility interactions

- `prefers-reduced-motion` must disable transitions and any auto-advancing content —
  including streaming animation and live-updating charts.
- Live-updating regions need `aria-live` politeness chosen deliberately: `polite` for
  metrics, and **never** `assertive` for anything that updates on a timer.
- Virtualized lists must expose position — `aria-setsize` and `aria-posinset`, since the
  DOM no longer carries the real count.

#### Cross-references

- Chart mark counts and library weight → [§ Data visualization](#data-visualization-encoding-rules), [§ Ecosystem](#ecosystem-libraries-licenses-maintenance)
- Streaming and latency masking for model output → [§ AI surfaces](#ai-surfaces-topologies)
- Motion durations and reduced-motion → [§ Motion](#motion-durations-easing-reduced-motion)

---

## Imagery — anti-stock rules

Ask the human **high / medium / low** quality. Never ask them to pick a model,
quantize level, or step count — map the tier yourself.

Default if they don’t say: **medium**. If they say “final”, “hero”, “ship it”,
“stunning”, or “print” → **high**. If they say “sketch”, “rough”, “try a few”,
or “quick” → **low**.

#### Quality tiers (what you ask)

| They pick | Feel | Typical wait @1024² | Use for |
|---|---|---|---|
| **low** | Fast draft, soft detail, faces/hands soft | ~20s | Composition, layout tests, many variants |
| **medium** | Good enough to judge; not final | ~1–2 min | Most “make me an image” asks |
| **high** | Final art | several minutes | Heroes, avatars, anything that ships |

Always confirm the tier once (“Medium — about a minute?”) unless they already named it.

#### What you run (do not show them this)

Host must have `mflux` on `PATH` (`export PATH="$HOME/.local/bin:/opt/homebrew/bin:$PATH"`).
Configure the generation host yourself — shine ships no SSH targets.

Always pass `--seed` (reproducible). Default size 1024×1024 unless they ask otherwise.

```bash
### LOW — draft
mflux-generate \
  --model dhairyashil/FLUX.1-schnell-mflux-4bit --base-model schnell \
  --steps 4 --seed <N> --height 1024 --width 1024 \
  --prompt "..." --output out.png

### MEDIUM — default
mflux-generate \
  --model dhairyashil/FLUX.1-schnell-mflux-4bit --base-model schnell \
  --steps 8 --seed <N> --height 1024 --width 1024 \
  --prompt "..." --output out.png

### HIGH — final (dev, not distilled)
mflux-generate \
  --model dhairyashil/FLUX.1-dev-mflux-8bit --base-model dev \
  --steps 28 --guidance 3.5 --seed <N> --height 1024 --width 1024 \
  --prompt "..." --output out.png
```

Upgrade path: show 2–3 **low** seeds → they pick a direction → one **high** with that seed.

#### Faces & wardrobe

FLUX is strong on faces; wardrobe/framing often needs a second pass. After a **high**
face you like: `mflux-generate-qwen-edit` (or Gemini image edit) with
*”keep the FACE exactly as it is, change only X”*. Don’t make the human manage that
split — just do it when the brief needs it.

#### After generate

- Anti-stock: real product/texture/typo covers beat Unsplash clones ([§ Taste](#taste-measured-thresholds-and-failure-tells)).
- Grade into the brand family if the surface is branded (hue/sat check, archive raw in `assets-src/`).
- Report: tier used, seed, path to the file — not model IDs unless they ask.

---

## Ecosystem — libraries, licenses, maintenance

What exists, what's maintained, what's safe to build on. Verified 2026-08-04.

---

#### License status — the section that matters

Harvesting into a registry you publish is **redistribution**. Using something in your own app is not. Several of the most popular kits are widely assumed MIT and are not.

| Source | Actual position |
|---|---|
| **Aceternity UI** | **No license at all.** No public repo, no LICENSE file. `/licence` covers Pro only and is proprietary; `/terms` claims ownership of all material and prohibits republishing. Secondary blogs claiming "the free tier is MIT" are unsourced. The risk is the *absence* of a grant. |
| **React Bits** (44.8k★), **Animate UI** | **MIT + Commons Clause** — verbatim: *"so long as you do not sell, sublicense, or redistribute the components themselves — whether alone, in a bundle, or as a ported version."* Using them in a product is fine; harvesting them is a direct violation. |
| **Origin UI** | Gone. Transferred to `cosscom/coss` (Cal.com) and relicensed **AGPL-3.0**, with `apps/ui/` and `apps/origin/` carved out MIT. Components safe, surrounding monorepo not. |
| **ReUI** | Repo MIT, but the **hosted registry is freemium** — some items return 401 "Provide your license key." |
| **Skiper UI** | No license statement; $129/$549 tiers. |
| **GSAP** | Free for commercial use, but **not OSI**. No forking, no redistribution, bars competing visual-animation tools. |
| **Cosmograph** | **CC-BY-NC-4.0 — non-commercial.** Disqualifying for client work. The underlying engine `cosmograph-org/cosmos` is MIT; use that or Sigma.js. |
| **OpenStatus** | AGPL-3.0. |
| **`tailwindlabs/tailwindcss.com`** | No license file, 964 MB. Skip. |
| **Apple HIG** | Copyrighted, no grant. Read, never copy. |

**Clean to harvest (MIT/Apache/ISC):** shadcn/ui, Radix, Base UI, Ark, React Aria, D3, Recharts, visx, nivo, Observable Plot, Magic UI, Motion Primitives, Kibo, cult/ui, Kokonut, Eldora, Fancy Components, Intent UI, Dice UI, Plate, assistant-ui, prompt-kit, Neobrutalism, 8bitcn, SVGL, Tremor (Apache-2.0).

---

#### The shadcn registry ecosystem

`https://ui.shadcn.com/r/registries.json` lists **504 built-in registry namespaces** — installable as `npx shadcn add @namespace/component` with zero config. Browse at registry.directory.

**shadcn now supports three first-class primitive bases.** Base UI became the **default on 2026-07-03**; React Aria was added the same month.

```bash
npx shadcn@latest init --base base    # @base-ui/react 1.7.0 — default
npx shadcn@latest init --base radix   # radix-ui 1.4.3
npx shadcn@latest init --base aria    # react-aria-components 1.20.0
```

⚠️ **Package rename:** `@base-ui-components/react` is deprecated and pinned at `1.0.0-rc.0`. The live package is **`@base-ui/react`**.

**"Radix is dying" is false** — 95 commits in 30 days, published July 2026, WorkOS-owned. Slower than Base UI, actively maintained.

**Strongest foundation:** Base UI, for most cases — built by the original Radix authors, WAI-ARIA conformant, and what shadcn and Cal.com now build on. **React Aria is the accessibility ceiling** — 50+ components, 30+ translations, 13 calendar systems, RTL, and explicit normalisation of assistive-tech differences. Choose it when WCAG conformance is contractual.

**Notable third-party registries, all MIT:** Magic UI (247 items), Motion Primitives (~110), Kibo UI (41 — Gantt, Kanban, Dropzone, Editor), cult/ui, Kokonut (40), Eldora (115), Fancy Components (158), Intent UI (570, React Aria-based), Dice UI.

**First-party vendor registries are the real trend** — Supabase UI (60), Vercel AI Elements (136), LiveKit `@agents-ui` (17), plus Clerk, Auth0, Algolia, Paddle, Neon.

**AI-UI specific and directly relevant:** `assistant-ui` (11.4k★ MIT), `prompt-kit` (MIT), `Plate` (16.5k★ MIT, rich text). shadcn itself now ships AI chat primitives — `attachment`, `bubble`, `marker`, `message`, `message-scroller` — undocumented in the main nav, only visible in `/r/index.json`.

**21st.dev** — 12,000+ components, 700+ authors, unified MCP via `npx @21st-dev/cli@latest init --client claude`. ⚠️ Per-author licensing is undocumented; treat as unlicensed for redistribution.

##### The highest-leverage find

**shadcn ships its own MIT-licensed Agent Skill** at `github.com/shadcn-ui/ui/skills/shadcn/` — `SKILL.md` plus `rules/{styling,forms,composition,icons,chat,base-vs-radix}.md`, all written as Incorrect/Correct code pairs. Enforced rules include: no `space-x-*`, use `flex gap-*`; `size-*` over `w-`/`h-` when equal; no manual `dark:` overrides; no manual z-index on overlays; forms use `FieldGroup` + `Field`.

Directly adoptable, correctly licensed, and exactly the shape this project is building toward. There's also a `migrate-radix-to-base` skill.

---

#### Charting — maintenance reality

| Library | Latest | Released | State |
|---|---|---|---|
| visx | 4.0.0 | 2026-06-11 | Modernisation release — **zero new packages**. One Airbnb engineer wrote 56 of the last 100 commits, then 43 days silent. `@visx/theme`, `@visx/a11y`, `@visx/kernel` are versioned in the monorepo but **were never published to npm**. |
| nivo | 0.99.0 | 2025-05-23 | 24 unreleased commits. No `next`/`beta` dist-tag. Fixes land, never ship. |
| D3 | 7.9.0 | 2024-03-12 | Frozen because finished — it's math. `@types/d3` is **33 months stale**, which costs more day to day than the runtime. |
| Observable Plot | 0.6.17 | 2025-02-14 | 42 unreleased commits. **A merge-clean 0.6.18 PR has sat untouched since 2026-04-13 with the changelog already written.** No milestones; the 1.0 tracking issue is 23 months stale. Meanwhile downloads grew **7.4× in 12 months**. Observable's engineering has moved to notebook-kit, which doesn't depend on Plot. |
| **Recharts** | 3.10.1 | 2026-07-25 | **55M downloads/week** (~100× visx), commits landing daily, React 19 supported, **and it's what shadcn's charts wrap**. |

**visx and nivo occupy the same slot.** Owning both buys two theming systems and two bundles.

**Decision: D3 (math + SSR) + Recharts (React). Hold visx for genuinely custom work.** Vendor all of them for reference — vendoring is not depending.

##### Theming capability, ranked
**nivo** (a real, complete theme object with deep-merge) > **visx-xychart** (narrow theme, and only for `xychart` — the primitives have none) > **Plot** (CSS-first, no theme API; `--plot-background` is its only custom property and is **undocumented but load-bearing — override it or tips render white-on-white in dark mode**) > **D3** (nothing; build it yourself).

##### Bundle, min+gzip
`d3-selection` 4.0 · `d3-shape` 5.5 · `@visx/shape` 10.5 · `d3-scale` 15.6 · `@visx/xychart` 48.8 · `@nivo/bar` 78.1 · `@nivo/line` 90.2 · `d3` full 89.8 · `@observablehq/plot` **125.0**

Plot depends on the **monolithic `d3` meta-package**, and `d3-geo` (84 KB) plus `d3-scale-chromatic` (49 KB) are unavoidable even for a bar chart. But 125 KB is a **flat fee** — best amortisation for a dashboard with many chart types. nivo is the worst case there: five chart families is realistically 250–400 KB.

##### Server-side rendering
**D3's pure-math modules are the strongest path** — no DOM, no jsdom, deterministic, ~21 KB. `d3-scale` computes, `d3-shape` emits a path string, you template the SVG.

**Plot is second** and has a documented `document` option. Two traps: it returns a `<figure>` rather than an `<svg>` the moment you add a title, caption or **any legend** — use `figure: false`. And raster marks plus **continuous (ramp) color legends** both need `npm i canvas` or they throw.

Plot **never measures text** — it uses a static width table — so Node output is byte-identical to the browser. Genuinely deterministic, but equally approximate everywhere: change to a wide brand font and wrapping math is wrong in *both* environments.

**Nothing here converts SVG to PNG.** That's `@resvg/resvg-js` or `sharp`, and you must load fonts explicitly — the most common cause of wrong-looking server-rendered charts.

##### What's missing from the four
- **Dense time-series** — all four are SVG-first and die at 10–20k nodes. **uPlot** (21 KB, zero deps, 100k+ points) or **Lightweight Charts** (Apache-2.0, real financial semantics from TradingView).
- **Graph/network at scale** — **Sigma.js** (MIT) with graphology.
- **Geospatial at scale** — **deck.gl**.
- **Plot ergonomics over huge data** — **Mosaic / `@uwdata/vgplot`**, a Plot-like API backed by DuckDB with linked cross-filtering. The most actively developed thing in the Observable orbit.
- **Declarative JSON charts** — **Vega-Lite**, when a config file or an LLM needs to emit a valid spec without writing code.
- ⚠️ **Tremor** — do not adopt as a dependency. Last npm release 2025-01, repo last pushed 2025-10; they pivoted to the copy-paste model. The package is a dead end.

---

#### Full-fat libraries worth mining

| Library | Better than shadcn at |
|---|---|
| **Mantine** 9.5.1 | Spotlight, notification system, rich hooks, real date/time pickers |
| **Chakra v3** 3.36.1 | Recipe/slot theming — the token system is genuinely better designed |
| **Fluent 2** 9.74.5 | Enterprise density, virtualisation, rigorous flat token set |

⚠️ **Shopify Polaris React is deprecated** — repo description says so, replaced by Polaris Web Components Oct 2025, no npm publish since 2025-03. Note the name trap: `Shopify/polaris` and `Shopify/polaris-react` are the same repo, and its active push date reflects the tokens monorepo, not React maintenance.

---

#### Design systems ranked by density of actionable numeric rules

The numbers live in **token repos, not prose pages** — most doc sites are unfetchable SPAs.

| Rank | System | Tokens | License |
|---|---|---|---|
| 1 | **GitHub Primer** | `@primer/primitives` | **MIT** |
| 2 | **Adobe Spectrum 2** | `adobe/spectrum-design-data` | Apache-2.0 |
| 3 | **Fluent 2** | `@fluentui/tokens` | MIT |
| 4 | **Atlassian** | `@atlaskit/tokens` | ⚠️ Apache npm, restrictive docs site |
| 5 | **USWDS** | `@uswds/uswds` | **CC0 — public domain** |
| — | **Apple HIG** | none | ⚠️ Copyrighted, no grant |

**Two verified highlights.**

**Primer ships rules written for an LLM** — `$extensions["org.primer.llm"]`, with explicit negatives:
> `control.minTarget.auto` → *"Use as minimum size for interactive elements on desktop/mouse interfaces… **Do NOT use for touch/mobile contexts.**"*

Steal its `size-fine` / `size-coarse` split — pointer type as a first-class token dimension.

**Extraction order: Primer → Spectrum → Fluent → USWDS.** That is ~90% of a rigorous
numeric corpus with zero licensing ambiguity, and every one of them is a *token*
source rather than a component runtime — which is the distinction that decided the
2026-08-31 deletion. A published duration scale costs nothing to adopt; a component
library costs its whole runtime.

---

#### shadcn platform notes

- **CLI 4.16.1.** Tailwind v4 is the default; set `tailwind.config: ""`. `@import "shadcn/tailwind.css"` is new — `shadcn` is now a *runtime* dependency shipping shared variants. `npx shadcn eject` inlines it, irreversibly.
- **The radius scale is derived, not enumerated** — one `--radius` drives seven steps. Good precedent.
- **Base colors:** neutral, stone, zinc, plus new mauve, olive, mist, taupe. `baseColor` and `cssVariables` are **immutable after init**.
- **8 named styles** (Vega, Nova, Maia, Lyra, Mira, Luma, Sera, Rhea) swap radii, heights, borders, shadows and focus rings via one variable mode.
- **Presets** are bit-packed base62 codes capturing an entire design language: `npx shadcn@latest apply a2r6bw`, `--only theme`, `preset decode`. Parallel mechanism to registries — presets are a fixed enum you *select* from; `registry:base` is open-ended. For owning a design language, `registry:base` is the right substrate.
- **62 `registry:ui` items, 27 installable blocks.** `toast` is deprecated in favour of `sonner` and 404s.
- **Migrations available:** `migrate radix` (to the unified package), `migrate icons --from lucide --to phosphor`, `migrate rtl` (physical → logical properties).

---

## Cross-media — decks, PDFs, reports, and email

Keep the audience, decision, evidence, hierarchy, and signature moment. Change the production
contract to fit the medium.

- **Application or web page:** use the installed component system. shadcn is the composition
  layer; Base UI is the greenfield primitive default and React Aria is the accessibility ceiling.
- **Editable PowerPoint:** use PptxGenJS, a theme and master, editable native shapes, controlled
  crops, speaker notes, and overflow checks. Never rasterize the whole slide.
- **Code-first presentation:** use Slidev when versioned Markdown, live code, or web delivery
  matters more than PowerPoint editing.
- **PDF/report:** semantic HTML, print CSS, controlled page breaks, repeated headers, figure
  captions, links, and selectable text.
- **Email:** conservative table-safe HTML, inline styles, preheader, plain-text alternative, one
  primary action, and no interaction required to reveal content.

Before building, name the composition archetype, image strategy and rights, signature moment,
anti-repetition constraint, and output-native proof. A website screenshot pasted onto a slide is
not a deck.

---

## Usability proof — executable, not inferred

Visual similarity and accessibility are necessary but do not establish that a person can
complete a job. Every existing or new product surface therefore carries a small
`shine-usability.json` beside its design diagnosis/spec, and the flows in it are proved
in a real browser.

```json
{
  "version": 1,
  "cite": "untitled-table",
  "objects": [
    {"id":"queue","selector":"[data-testid=queue]","referenceRole":"table","purpose":"See work needing a decision"},
    {"id":"capture","selector":"[data-testid=capture]","referenceRole":"command","purpose":"Add work without leaving the queue"}
  ],
  "flows": [{"id":"capture-work","userJob":"Capture work and see it enter the queue","steps":[
    {"action":"fill","selector":"[data-testid=capture]","value":"Call Acme"},
    {"action":"press","selector":"[data-testid=capture]","value":"Enter"},
    {"action":"text","selector":"[data-testid=queue]","value":"Call Acme"}
  ]}]
}
```

- `cite` is the selected [§ Templates](#templates-start-from-a-real-page) reference. Structural resemblance proves the page
  shape; this contract proves the selected reference objects exist and work for this
  product's job.
- Each object has a stable selector, the reference role it implements, and a user-facing
  purpose. All required roles from the reference template must be present.
- Each flow has at least three observable steps and at least one real user action
  (`click`, `fill`, or `press`). Screenshot-only, assertion-only, and invented-object
  flows fail.
- Valid actions: `click`, `fill`, `press`, `visible`, `hidden`, `text`, and `value`.

#### Proving it in Cowork

Execute the contract yourself in the browser, after the visual pass and before calling
the work done:

1. Render the page (open the file, or run the app and navigate to the surface).
2. For each object: confirm the selector resolves and the element is present **at page
   load** — hover-only objects fail.
3. For each flow: perform the steps in order — click/fill/press for real, then verify
   the assertion steps (`text`, `visible`, `value`) against the live DOM, not the source.
4. Screenshot the end state and report which flows passed, step by step.

A static dashboard, a decorative capture control, or a flow that does not change
observable state fails. Do not claim a screen is usable because it passes contrast, an
accessibility scan, or a visual comparison. If the product cannot declare its primary
job in executable steps, do not polish it. Resolve the workflow first.

---

## Audit — rubric and report template

Score against [§ Component contracts](#component-contracts-what-every-named-control-owes), [§ Foundations](#foundations-tokens-states-accessibility-floor), [§ Patterns](#patterns-screen-archetypes), [§ Anti-patterns](#anti-patterns-lane-relative),
[§ Techniques](#techniques-craft-transfer), and [§ Kits](#kits-which-library-and-worked-recipes). Do not rewrite unless asked — report first.

#### Severity

| Level | Meaning |
|---|---|
| **Critical** | Below MUST for a named/shipped control; a11y blocker; broken hierarchy that causes wrong actions; data triad failure (loading looks like empty) |
| **Major** | App/admin surface missing SHOULD; incomplete DataGrid/form; hover-only actions; toast-only errors; composition fails (void, no primary, colliding type steps) |
| **Minor** | Craft/density/spacing polish; visual anti-pattern without functional break |

#### Process

1. Identify surface type (marketing / product / brand-locked / AI / voice) — [§ The loop](#the-loop-how-to-find-what-is-wrong) §1.
2. Inventory components and screens under review.
3. For each: check contract ladder (MUST → SHOULD → ASK leakage).
4. Check composition (scan order, weight budget, focal object, voids) before craft.
5. Check foundations (tokens, type, spacing, focus, motion).
6. Flag anti-patterns.
7. If the surface carries persuasive or instructional copy, run the copy pass ([§ Copy](#copy-the-presentation-layer-as-an-argument)).
8. Internal tools: adoption pass ([§ Adoption](#adoption-will-anyone-open-it)) — ritual, persona, path, push/pull.
9. Produce the report template below. Every Critical/Major row needs a **technique or kit
   citation** (or a [§ Patterns](#patterns-screen-archetypes) principle) and, if fixes were applied, **remeasure
   before/after numbers**. Prioritize completeness before cosmetic tweaks.

#### Incomplete-primitive fails (always flag)

- Bare `<table>` / static grid where DataGrid contract applies
- Icon buttons without accessible names
- Inputs with placeholder-only labels
- Red borders without linked error text / `aria-invalid`
- Loading indistinguishable from empty
- Filter-empty conflated with true empty
- Menus/dialogs missing keyboard, focus trap, or focus restore
- Hover-only row actions
- Missing sticky header / horizontal overflow affordance on wide tables
- Double-submit (no busy/disabled on async buttons)
- Destructive actions without confirm
- Status/meaning by color alone

#### Report template

```markdown
### UI/UX Audit: [surface name]

#### Verdict
ship | polish | redesign

#### Summary
1–2 sentences on the main gap (completeness vs craft).

#### Top issues
| # | Severity | Issue | Contract/rule | Citation (technique/kit) | Fix | Remeasure |
|---|---|---|---|---|---|---|
| 1 | Critical | … | Table MUST / a11y | `untitled-table`… / techniques.md §… | … | before → after |

#### Completeness
- Components below MUST: …
- App surfaces missing SHOULD: …
- ASK features present without need: …

#### Composition & hierarchy
Score 1–5 + notes (focal action, density, section jobs, scan order).

#### States coverage
| View | Loading | Empty | Filtered-empty | Error | Notes |
|---|---|---|---|---|---|
| … | pass/fail | … | … | … | … |

#### Accessibility blockers
- …

#### Anti-patterns hit
- …

#### Prioritized fix list
1. [Critical] … — cite: … — measure: …
2. [Major] …
3. [Minor] …

#### Out of scope / deferred
…
```

Citation column is required for Critical/Major. Threshold-only rows are incomplete.

#### Mode notes

- **Audit only:** stop after the report.
- **Polish after audit:** work the prioritized list top-down; upgrade stubs to contracts;
  cite before each edit; remeasure; avoid unrelated redesign.
- **Brand-locked:** also check copy and tokens against the brand pack; UI
  completeness still uses this rubric.
