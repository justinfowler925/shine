# The unfuck plan (2026-08-21)

Companion to `docs/audit-2026-08-21.md`. Goal, in Justin's words: **deep UX skill that can
look at a fucked-up page and apply the principles and templates from the design kits to
make it shine.** Keep templates, design kits, and actual usable UI examples. Remove the
ceremony.

## The one-line design change

Today the loop polices *whether the agent performed a ritual* (opened files, stamped
attributes, reported `images_read`). The rebuilt loop hands the agent **real pixels, real
source, and real paint** — and verifies **the rendered page**, not the ritual. When the
payload is good, the ceremony that existed to police a garbage payload collapses.

## The new loop (what SKILL.md becomes)

1. **LOOK** — render the page (`measure.mjs --shot`), read the screenshot. Existing UI
   always gets looked at before it gets opinions.
2. **NAME** — 3–6 defects in UX terms: job-to-be-done, hierarchy (one primary, one focal
   object), flow/steps, density, states (empty/loading/error), copy, a11y. Principles in
   `ux.md`; craft numbers in `craft.md`.
3. **MATCH** — `cite.mjs <job>` returns ≤3 templates, each with a **real full-page
   screenshot**, extracted readable source, and the kit's real token sheet. Read the
   shots, pick one, say why.
4. **RESTRUCTURE** — regions from the template's actual source.
5. **REPAINT** — import the kit sheet (real colors/type/space/shadows mapped onto
   `--shine-*`) or the house/brand lane. Kit paint becomes *legal*, not a pragma crime.
6. **PROVE** — `measure.mjs` (axe, contrast, composition) + `compare.mjs` renders
   before | after | template side-by-side into one image; the agent reads it and states
   the numbers. No self-scored "likeness" integer.

Wireframe mode survives for new surfaces (gray-box → locked brief), simplified.
Adoption-first for internal tools survives. Both earned their place.

## Phase 0 — stop the bleeding (this PR)

- Save the audit + this plan.
- Repoint every hardcoded `~/Projects/shine` in `agents/shine-ux.md` and `SKILL.md` to
  `~/Projects/shine-live` — today the executor runs a pre-V2 checkout with no critic and
  a contradictory catalog (audit finding 7).
- Same surgical path fix in fowler-brain's shine rule so cross-repo sessions stop citing
  the stale checkout.

**Accept:** `node ~/Projects/shine-live/corpus/cite.mjs dashboard` is what the agent file
says to run; the brain rule names the live path.

## Phase 1 — demolition

Delete or gut, in one PR, so the skill stops actively lying:

| Kill | Why (audit §) |
|---|---|
| `verify/critic.mjs` regex likeness score + the `likeness < 7` gate | Measures self-labeling; blank page scored 10/10 (§4) |
| Generated `corpus/packs/*` specimens, `regions.json`, `remap.json`, `notes.md` stubs; `pack.mjs` specimen generator | Placeholders wearing load-bearing names (§1) |
| `dna-families.json` adjective blocks + the DNA vocabulary ("hairline+soft", chroma decimals) | Adjectives transfer nothing; real paint replaces them (§5) |
| `images_read` reporting, `data-cite`-as-evidence, "naming an id you did not open is inventing" liturgy | Unverifiable self-report; the payload becomes self-evidently worth opening (§3) |
| `inspiration.md` mandatory row-authoring detour | No row → proceed from principles + nearest kit; optionally add a row *after* shipping |
| Slop classes + `direction.md` "2026 defaults" bans as blocks | They ban the model's strongest priors with no replacement; template pixels are the real anti-slop (§8) |
| The self-citing `lex-*`/`shine-*` catalog rows (`kind: pack`) and the 71 `charts` demo rows | Self-reference and inventory noise (§6) |
| `~/Projects/shine` stale worktree (after Phase 0 lands) | Split brain (§7) |

**Deviation recorded during execution (2026-08-21):** reading the references proved the
library itself is earned, measured content — the bullshit was the mandatory-path ceremony
(cite liturgy, packs, critic), not the on-demand files. So the ceremony died completely,
diagnose/voices/direction were rewritten, inspiration.md deleted — and taste/color-type/
motion/foundations/layout/interaction/audit/anti-patterns/etc. were kept intact rather
than blended into fewer, blurrier files. Original intent for the record: collapse 31
files → ~15. Merge diagnose+audit+patterns+layout+interaction →
`ux.md`; color-type+motion+foundations+taste numbers → `craft.md`; voices → `paint.md`;
techniques/kits/ecosystem essentials fold into `corpus.md` and SKILL.md. Keep intact:
`contracts.md`, `adoption.md`, `salesforce.md`, `dataviz.md`, `wireframe.md` (trimmed),
`brand.md`, `copy.md`, `corpus.md`, `voice.md`, `imagegen.md`, `ai-surfaces.md` (on-demand
library, not mandatory path). SKILL.md target: **≤ 8KB**, mandatory pre-draw reading
**≤ ~8k tokens**.

**Accept:** no tool in the repo emits a "likeness" number derived from source regex; the
one-button attribute-stamped page from the audit is committed as a fixture and passes
**no** gate; SKILL.md ≤ 8KB.

## Phase 2 — harvest real examples (the core build)

`corpus/harvest.mjs`, run locally (network once), producing for every kept catalog row:

```
corpus/packs/<id>/
  shot.png        full-page screenshot of the REAL screen (≥30KB, both themes where they exist)
  source/         extracted, readable files (TSX unescaped from registry JSON, or HTML)
  tokens.css      the kit's real tokens mapped onto --shine-* names
  meta.json       id, kit, jobs, license, source URL, harvest date
```

Sources per kit — all screenshottable today:

- **shadcn blocks** — `ui.shadcn.com/view/<name>` iframe routes; source extracted from
  the registry JSON already pinned in `~/design-corpus/shadcn-registry/items/`.
- **MUI templates** — live previews under `mui.com/material-ui/getting-started/templates/`;
  source pinned in `mui-material`.
- **Ant Design Pro** — `preview.pro.ant.design` pages; source pinned in `ant-design-pro`.
- **Carbon** — React Storybook (`react.carbondesignsystem.com`) stories; source pinned in `carbon`.
- **Magic UI / Tremor / Park / HeroUI / Spectrum chat** — their template/doc previews.
- **LEX** — SLDS blueprint pages on `lightningdesignsystem.com` (real vendor pixels replace
  the self-citing stubs).

Kit token sheets generated from sources already in the corpus: shadcn new-york-v4 CSS
vars + Tailwind zinc ramp, `@carbon/themes` (g10/g100), MUI default palette, Ant seed
tokens, Magic UI gradient/glow recipes. Each sheet carries **colors, type scale, spacing,
shadows, motion** — audit found the current sheets carry zero colors. Raw values are legal
inside generated sheets (existing header-marker exemption); pages keep saying
`var(--shine-*)`, so the lint needs no loosening.

Catalog cut: 141 rows → **~35–40**, every row earning its place with a real shot + source
+ paint. Coverage: dashboard, queue/table, record/detail, settings, form/wizard, auth,
empty state, marketing hero/landing, pricing, chat/AI, checkout, email, command palette,
~5 chart archetypes, LEX set.

**Accept:** doctor gains per-pack checks that bite — shot.png exists and ≥30KB, `source/`
has ≥1 file ≥30 readable lines, tokens.css has ≥10 color declarations — each proven by
seeding a violation and watching it fail. A kit-faithful Carbon build renders IBM Plex and
`#0f62fe` (verified via `getComputedStyle`, not source grep) with **zero pragmas**.

## Phase 3 — rewrite the loop

- **`cite.mjs` v2** — synonym matching ("settings page" → settings), ≤3 rows, output is
  the pack paths + a 5-line summary. No liturgy.
- **`ux.md`** — the deep-UX diagnosis core: what to look for in a screenshot, in priority
  order, with the vocabulary to name it. This is the skill's actual brain; written from
  the existing measured research (`research/`, `taste.md`) plus contracts/adoption.
- **`verify/compare.mjs`** — composites before | after | template shots into one PNG
  (sharp, already a dep) and reports measured facts: computed font stacks, radius samples,
  palette histogram distance vs the kit sheet. Reports numbers; the model and Justin judge
  the pixels. Nothing gameable by attributes.
- **`agents/shine-ux.md`** rewritten to the new loop; wireframe + adoption gates kept.

**Accept:** `cite.mjs "settings page"` returns a usable row. End-to-end on a fixture:
deliberately fucked page in `verify/fixtures/unfucked/` → agent produces before/after/template
comparison + measure PASS, no step erroring on a missing artifact.

## Phase 4 — prove and propagate

- End-to-end demo on a real surface (a Brutus screen or a Clearspeed demo page),
  before/after shots in the PR.
- Regression fixtures: attribute-stamp page (must fail), pragma-free kit paint (must pass),
  0-of-0 denominators fail everywhere.
- Update the public site copy against the new reality (public copy is a claim — grep the
  page against the shipped skill, per the existing rule).
- Rewrite fowler-brain's "Interface work goes through shine" rule to match V3 mechanics;
  `brain-build --write`; both surfaces re-verified with `doctor`.
- Consolidate checkouts: `shine-live` becomes the only local checkout (worktree cleanup).

**Accept:** doctor green on both surfaces; site copy greps clean against SKILL.md;
brain rule names the shipped loop; demo before/after committed.

## What survives untouched

`measure.mjs` (axe, per-pixel contrast, composition/void checks), the token pipeline and
house/brand lanes, design-lint + stop-sweep + doctor wiring, the corpus pins and
`acquire.sh`, contracts/adoption/salesforce doctrine, the self-hosted CI runner.

## Decisions taken (veto anytime)

- Packs live in the shine repo (~35 shots ≈ 7MB), versioned with the catalog — not in
  `~/design-corpus`.
- "Likeness" as a gated integer is dead; likeness judgment moves to eyes-on-pixels
  (agent + human) over a side-by-side composite. Gates only ever block on measured facts.
- House style remains the fallback voice; the craft-number rules bind house only.
- Phase order is 0→4 strictly; demolition ships before harvest so no one builds on stubs.
