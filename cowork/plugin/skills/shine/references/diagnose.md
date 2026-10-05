# Diagnose — how to find what is wrong

The loop's procedure. Thresholds live in `taste.md`/SKILL; this file is the order of
operations so every fix starts from a named defect and ends with a source.

## 0. Route first

- **No existing UI** (new screen/page/tool), or the user said wireframe/sketch/low-fi →
  `wireframe.md` before anything here.
- A `shine-wireframe/<slug>.brief.md` with `Status: LOCKED` → structure is given; do not
  invent a competing IA unless the user says `unlock structure`.
- **Internal tool / cockpit / digest** → `adoption.md` before pixels. A surface nobody
  opens is a design defect, not a training problem.

## 1. LOOK — render before opining

`node verify/measure.mjs <path> --shot /tmp/before.png`, then **read the screenshot**.
The measure output is a findings list; the screenshot is the diagnosis surface. A page
you have not seen gets no opinions.

| Kind | Signals | First refs |
|---|---|---|
| Internal tool / cockpit | Auth'd app, queues, metrics for a ritual | `adoption.md` first |
| Product app shell | Nav, tables, forms, settings | `patterns.md`, `contracts.md` |
| Dashboard / forecast | KPIs, charts, "what needs me" | `dashboards.md`, `dataviz.md` |
| AI / agent surface | Model does work a human owns | `ai-surfaces.md` |
| Marketing / landing | Hero, CTA, persuasion | `patterns.md` (hero budget), `copy.md` |
| Brand-locked | Client-facing or brand lock | `brand.md` + brand checker |
| Speaks or listens | TTS, mic, read-aloud | `voice.md` |
| Native / macOS / iOS | Desktop chrome, HIG language | Apple HIG via WebFetch |
| Lightning / LWC | Record page, console, datatable | `salesforce.md` |

Two kinds → run the stricter first (adoption before craft; contracts before polish).

## 2. NAME — four buckets, usability first

Write only the defects you can evidence, each in one bucket — one is enough, eight is the
cap. Craft without a usability or completeness defect above it is the wrong pass. If nothing
survives the screenshot and the measure output, the diagnosis is `verdict: no-change`: say what
you exercised in `verdictEvidence`, list every bucket in `checked`, and stop. A pass that
invents findings to fill a count is a defect in the reviewer, not in the surface. In audit mode
this file is the deliverable; nothing gets edited.

### SaaS product-UX checks (lane=saas Operate pages)

For `lane=saas` and page categories `datagrid|dashboard|form|record|lex`, the diagnosis
schema requires three structured fields — **presence** is machine-gated; **honesty of the
note** stays agent judgment. No screenshot OCR. Marketing / media / voice / editorial do not
need these fields.

| Field | Ask | When `ok: true` means |
|---|---|---|
| `primaryTaskCheck` | Can a new operator name and start the primary job in ~3s from the first viewport? | The primary task is legible and reachable without hunting |
| `emptyErrorTriadCheck` | Do loading / empty / error (and filtered-empty when filters exist) read as distinct states on **non-table** surfaces too? | Triad is covered or honestly N/A with why |
| `competingCtaCheck` | Is there one filled primary, or do peer CTAs compete for the same job? | Weight budget matches the job; competitors named or cleared |

**Machine pressure (P1):** for Operate page cites, `measure` hard-fails when **more than one**
distinct filled treatment appears in `main` (`verify/cta-pressure.mjs`). Sidebar/nav filled
controls do not count. If you set `competingCtaCheck.ok: false`, bind a critical/major defect
to a `flow:` that demotes or removes the peer — prove fails closed without that binding.

### SaaS copy checks (lane=saas Operate + marketing/catalog)

For `lane=saas` and categories `datagrid|dashboard|form|record|lex|marketing|catalog`, fill
three copy fields (see `copy.md`). Presence is machine-gated; belief honesty stays agent.
Measure also hard-fails missing `document.title`+H1 and stub empty-state copy when the copy
heuristic gate applies — not a full NLP critic.

| Field | Ask | When `ok: true` means |
|---|---|---|
| `copyHeadlineCheck` | Does the first screen answer “what is this / what do I get”? | Title or H1 carries belief 1 in the reader’s words |
| `copyBeliefCheck` | Are the five Hormozi beliefs mapped to carrying elements (or gaps named)? | Each belief has an element or an honest gap |
| `copyInstructionalCheck` | Do empty / error / CTA microcopy say what happens next? | No “No data” stubs; CTAs are verb + outcome |

### SaaS adoption checks (lane=saas Operate pages)

Same Operate categories as product-UX. Four gates in `adoption.md`; three fields are required
in the diagnosis so agents cannot skip the bucket. Ritual honesty stays agent.

| Field | Ask | When `ok: true` means |
|---|---|---|
| `adoptionRitualCheck` | Which recurring meeting or moment runs this surface? | Ritual named with owner |
| `adoptionPrivateWinCheck` | Per persona, what one fact can’t they get by asking a person? | Private win stated |
| `adoptionAbsenceCheck` | What breaks if nobody opens it for a week? | Absence cost named (not “nothing”) |

Fill each as `{ "ok": boolean, "note": "…" }` (note ≥8 characters). On `verdict: defects`, still
fill the checks — a craft-only defect list that skips product UX / copy / adoption is incomplete
for SaaS. On `verdict: no-change`, the checks plus full `checked` buckets are how you prove you
looked. `prove` surfaces `copyAdoption` for these fields and binds critical/major defects
(including `adoption` bucket) to assertion ids.

Primary-task and adoption defects bind to executable proof. Example for an Operate queue:

```json
{
  "id": "primary-assign-owner",
  "bucket": "usability",
  "severity": "critical",
  "assertions": ["flow:assign-owner"],
  "problem": "Operators cannot assign an owner from the first viewport.",
  "evidence": "Assign control is below the fold at 1280; no keyboard path reaches it in three steps.",
  "expectedEffect": "Assign-owner flow completes from the queue without scrolling past chrome."
}
```

`flow:assign-owner` must match an id in `shine-usability.json`. Critical/major usability **and
adoption** defects without assertion ids fail `prove` `defectAssertions` — do not leave
`assertions: []`.

### Usability (can they finish the job?)
- Primary action visible in ~3 seconds? Competing CTAs? → also `primaryTaskCheck` / `competingCtaCheck`
- Path: notification → committed change — where does the user invent the next step?
- Empty / error / loading as real states, not voids? → also `emptyErrorTriadCheck`
- Hover-only actions; no keyboard path to finish?
- The job of the screen vs what the layout actually offers.

### Completeness (contracts)
Named Table / Form / Dialog / Select loads `contracts.md` MUST **in this pass**.
- A `<table>` with two or more header cells **is** a named Table. Missing
  `data-shine-contract="table"` does not exempt it. A layout or presentation attribute cannot exempt record data. Static presentation
  requires the documented purpose and noninteractive checks in `table-quality.md`.
- Named control below MUST (bare `<table>`, unlabeled icon button, placeholder-as-label)
- Missing states: loading / empty / filtered-empty / error
- Destructive without confirm; double-submit; toast-only errors

### Composition (what per-element gates cannot see)
- **Scan order** — in 3 seconds, what do you read? Is that the job?
- **Weight budget** — one primary, few secondary. Count filled controls.
- **Focal object** — dashboards need one; six equal modules is an index.
- **Chrome vs content**; largest region empty; sections with three jobs.
- **Collisions** — one token two meanings; type steps that aren't distinguishable.

### Craft (of the chosen voice)
- Raw values at usage sites; off-scale spacing; tracking 0 on display type
- House accent chroma outside 0.13–0.24; kit-faithful drifting back to house paint
- Theme undeclared or non-switching; contrast fails; `transition: all`
- Refs: SKILL ten rules, `taste.md`, `color-type.md`, `motion.md`, `foundations.md`

## 3. Prioritize

1. Usability — they cannot finish the job
2. Completeness Critical — a11y blockers, data-state triad, wrong primary
3. Composition that causes wrong actions or abandonment
4. Adoption blockers on internal tools
5. Craft that reads as slop for the chosen voice
6. Polish (density, optical alignment, micro-motion) — `polish.md`

Never spend a pass on craft while a Critical completeness hole is open.

## 4. MATCH — a template, not a vibe

`node corpus/cite.mjs "<job in plain words>"`. Read the harvested shot (or preview),
skim the source's regions, pick one of the ≤3 matches and say why. A page with no
template cite is incomplete for a *known* job — dashboards, queues, records, settings,
auth, checkout all have rows. No matching row → nearest row + `patterns.md`, and add a
catalog row **after** the screen ships if it earned one. Technique cites
(`techniques.md`) are for craft transfer; they don't replace a structural match.
A record list (queue, remainder, sources, admin rows) cites a DataGrid row
(`untitled-table`, or `shadcn-dashboard-01` for the composed records page). A
list/dashboard/app-shell cite is the wrong match even if `cite.mjs` ranked it
first — re-query with `datagrid`.

## 5. RESTRUCTURE + REPAINT

Clone the template's regions from its source; keep the focal object focal. Then paint by
voice (`voices.md`): kit-faithful imports the voice sheet and the kit's real token
values; house uses the shine lanes; brand keeps regions and drops vendor chrome.
Upgrade stubs to the contract ladder. Prefer one composition change over ten craft tweaks.

## 6. PROVE

```sh
node verify/measure.mjs <path> --shot /tmp/after.png --cite <id>
node verify/compare.mjs <path> --cite <id>    # when the template has a harvested shot
```

Hard fails block; notes don't. Report before/after numbers for every Critical/Major you
claimed to fix, plus the shot paths. Read the compare composite — if the two sides don't
read as relatives, the match or the paint is wrong.

## Quick defect → next file

| You see… | Open |
|---|---|
| No UI yet / need a sketch | `wireframe.md` |
| Known job, invented layout | `corpus/cite.mjs <job>` — match a row |
| Nobody will open this | `adoption.md` |
| Table/form missing states | `contracts.md` |
| Job works; stubs / density / optical | `polish.md` |
| Queue / batch / empty | `cite.mjs queue` → `untitled-table` |
| Wrong hierarchy / equal peers | `techniques.md` §Hierarchy, `kits.md` |
| Numbers undecidable | `dashboards.md` |
| Chart encoding smell | `dataviz.md` |
| AI chat as default shell | `ai-surfaces.md` |
| Words don't persuade | `copy.md` |
| Raw values / tokens | `foundations.md`, `color-type.md` |
| Need a library API | `corpus.md` then `rg` |
| Lightning host quirks | `salesforce.md` |
