# Shine World-Class Spec

Date: 2026-08-21. Supersedes `research/director-plan.md` for visual quality. Director-plan P0–P2 *prose and shallow gates* shipped; the hard parts that actually change pixels did not. This is the repair.

Repo: [justinfowler925/shine](https://github.com/justinfowler925/shine) @ `3fcd6fd` (live load: `~/Projects/shine-live`).

---

## 0. Verdict

Shine is already a top-tier **SaaS completeness and compliance** agent. It is not a designer.

What it can do today: name a job, retrieve a catalog id, demand table/form/dialog contracts, fail a void, fail a missing empty state, fail undeclared theme, fail a Carbon cite that still has a Geist sidebar, lint raw hex, emit DTCG tokens, wire doctor on both surfaces, and refuse to ship a dashboard nobody will open.

What it cannot do: produce a screen a stranger would screenshot for Behance, Dribbble, or Awwwards — or a Lightning record page that looks like a designed product instead of a themed admin chrome. Those are different jobs. The skill pretends they are the same job by saying “apply DNA.” DNA is seven strings. 102 of 132 catalog rows are identical `shadcn-zinc`. Measure PASSes generic zinc. Vision is a printed URL. Salesforce is a palette transcription guide.

**The public lie:** `site/index.html` says the loop includes “a screenshot critique capped at three passes.” `verify/measure.mjs` writes a PNG. Nothing looks at it. `verification.md` cites a +17.8% literature number as if it were wired.

**Do not grow markdown.** `SKILL.md` already forbids loading all 27 references. Adding a 28th “beauty.md” will not make agents see. The repair is **visual DNA packs, executable voice packs, a mandatory vision critic, surface lanes with different quality bars, and an eval set that fails slop.**

---

## 1. What is already world-class (keep)

Do not rebuild these. They are Shine’s unfair advantage over every community “awwwards skill.”

| Asset | Why it stays |
|---|---|
| Catalog cite as completeness (not optional taste) | Invented pages are a Critical hole. Correct. |
| Contracts MUST (Table/Form/Dialog/Select) | Dribbble tables fail this skill on purpose. Keep. |
| Adoption-before-pixels for internal tools | The 2026-08-08 Brutus lesson. Unique. |
| Measure loop: computed style, axe, per-pixel contrast, voids, hierarchy | Compliance floor. No award skill has this. |
| Doctor that *bites* (feeds known violations) | Prevents silent-pass gates. |
| Dual-surface wiring, no `paths:`/`globs:` | A path-gated authority is an absent authority. |
| Token pipeline (DTCG → CSS / Tailwind / Python / Salesforce spec) | Real design-system engineering. |
| `taste.md` 40 rules + 84 failure taxonomy, measured from 4.5 MB production CSS | Best anti-slop *craft* text in the ecosystem. Keep as house SSOT. |
| `copy.md` Hormozi five beliefs | Copy as argument. Rare. Bind it to visual hierarchy (gap). |
| License hygiene (Polaris query-only, AGPL/Commons-Clause bans, owned.md empty) | Correct. Do not scrape Dribbble. |
| Wireframe → locked brief before Build | Right gate. Incomplete: gray-box strips visual intention. |
| Consumer measure (`measure-consumers`) as `--full` only | Correct: a permanently red doctor gets ignored. |

Director-plan acceptance still stands: **queue cited Carbon and marketing cited Magic UI must be stranger-distinguishable.** Fixtures exist. Craft still cannot pass that test on a real consumer.

---

## 2. Mechanism of failure (why the corpus does not help)

The corpus is an **API cache**, not a visual taste library.

```
49 pins, ~1.2 GB sparse source (Carbon, Ant, MUI, Spectrum, Fluent, shadcn, …)
        ↓ index
132 catalog rows
        ├── 71 charts (54%) — widgets, not pages
        ├── 102 shadcn-zinc DNA (77%) — one blob, copied
        └── 12 unique DNA objects total
        ↓ cite.mjs
7 labels: family / density / type / radius / chroma / elevation / motion
        ↓ agent
“retune shine tokens to Carbon DNA”
        ↓
tokens/ still personal stone+ember or brand navy
measure PASSes if voids/axe/one-primary hold
```

`cite.mjs` then dumps up to 16 source files (Carbon DataTable: a tree, “rg, do not read”) and a Preview URL. There is no doctor fail if the agent never opened the image. There is no token remap table. There is no computed CSS dump of the cited page.

**Likeness gates in `measure.mjs` (~725–757):** Carbon+Geist/sidebar, Carbon table area <6%, marketing-as-appshell, marketing heading <32px, marketing hero <20%. Five heuristics. A pretty zinc dashboard with empty states and one primary **PASS**es.

**Salesforce:** `skill/references/salesforce.md` line 5 — “a constrained palette target, not a design target.” Zero Lightning record / console / related-list / path / datatable / Experience Cloud / email / mobile craft. Zero SLDS pin in `corpus.lock`. Brain rule 80 already holds the *real* Lightning lessons (container queries vs 494px host, undefined `--slds-g-*` hooks, shadowRoot empty walks, datatable synthetic shadow, stale bundle cache). They are not in the skill.

**House gravity:** anti-patterns ban glow, glass, dark-for-its-own-sake. `magicui-hero` DNA is `chroma=high elevation=glow radius=xl`. The anti-slop list fights the marketing lane. Lane-relative rules are missing.

---

## 3. Ranked gaps (visual quality impact)

| # | Gap | Evidence | Repair |
|---:|---|---|---|
| 1 | DNA is 7 labels, not visual packs | 12 unique blobs; 102× identical zinc | Per-cite pack: light+dark PNG, computed tokens, region map, type specimens, remap table |
| 2 | “Retune tokens” is undefined | `voices.md` command only; `tokens/src` is two lanes | Executable voice packs that `gen-source.mjs` actually emits |
| 3 | Vision not in the loop | Preview printed; site claims 3-pass critique; measure only writes PNG | Mandatory `Read` of cite PNG + vision critic JSON before Build paints |
| 4 | Catalog 77% zinc + 54% chart atoms | `templates.json` | Demote charts; index 38 unused pins as pages; add Lightning + empty + pricing + command-palette |
| 5 | Likeness is 5 heuristics | `measure.mjs` | Perceptual + region + DNA-field gates; fail zinc-on-Carbon |
| 6 | No slop-vs-stunning eval | Fixtures catch fake cites, not beauty | Golden set, 20 screens, stranger test + critic scores |
| 7 | No art direction before code | Anthropic `frontend-design` does this in ~100 lines; Shine does not | `direction.md` + DESIGN.md artifact between Wireframe and Build |
| 8 | Voices too thin (3 paints) | house / kit-faithful / brand | Lanes (LEX / SaaS / Marketing / Internal) × voice packs |
| 9 | Salesforce = recolor | `salesforce.md`; no corpus pin | Surface ontology + SLDS 2 pin + container-query + shadow-DOM measure |
| 10 | Layout grammar absent | `patterns.md` is screen recipes | Editorial grid, optical alignment, whitespace-as-meaning, fold choreography |
| 11 | IxD = contracts MUST | No Fitts/Hick/Gestalt/disclosure | `interaction.md` — progressive disclosure, spatial memory, keyboard as spatial |
| 12 | Media systems missing | Stock banned; `imagegen.md` is optional mflux | Illustration/icon/photo direction per lane; signature element required on Marketing |
| 13 | Motion = duration table | `motion.md`, 3 tokens | Choreography: one orchestrated moment, not scattered 150ms |
| 14 | Wireframe strips intention | Gray-box by design | Brief gains DESIGN.md: palette, pairing, signature, density, photography note |
| 15 | Context budget | “Do not load all 27 refs” | SKILL stays the router; packs retrieve; critic is a tool not a essay |

---

## 4. What to steal (ranked)

Do not vendor these as a second skill. Extract the *mechanism*.

### P0 — mechanisms that change output this month

| Source | URL | Steal | Do not steal |
|---|---|---|---|
| **Anthropic `frontend-design`** | [anthropics/skills/skills/frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | Art direction **before** code. Subject-grounded vernacular. One signature element. Two-pass plan (tokens + type + layout ASCII + signature) then uniqueness critique vs the three AI-default clusters (cream+serif+terracotta / black+acid / broadsheet). “Picture is worth 1000 tokens.” Copy as design material. | Aesthetic tourism (brutalist/maximalist) on Salesforce queues. Growing SKILL.md to 600 lines (PR #1364 is the trap Shine already fell into). |
| **Vercel `web-interface-guidelines` AGENTS.md** | [vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | MUST/SHOULD/NEVER always-on: URL state, loading button keeps label, paste never blocked, skeletons match layout, APCA over WCAG 2 where they disagree, compositor-only motion. Compact enough to always-load. | Replacing Shine contracts; Vercel is interaction hygiene, not DNA. |
| **Google Stitch `DESIGN.md`** | Stitch 2026 exports a text design-system artifact | The missing object between Wireframe brief and Build: named hex, type pairing, layout concept, signature. Feed the code agent that, not 27 refs. | Stitch as renderer. Code stays Shine/measure. |
| **Director-plan acceptance** | `research/director-plan.md` | Two screens, same week, stranger-distinguishable. Doctor `--full` asserts it. | More string checks on SKILL.md. |
| **Brain rule 80 Lightning lessons** | fowler-brain `80-design-through-shine.md` | Container queries (494px host), undefined hooks, inheritance, shadowRoot walk, datatable `innerText`, fresh-tab after deploy. | Leaving them in the brain while Shine “does Salesforce.” |
| **Impeccable** | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) · [impeccable.style](https://impeccable.style) Apache-2.0 | **Persuade / Operate / Read / Experience** as the first dimension (maps onto Shine lanes). Command verbs (`bolder`, `quieter`, `distill`). 59 **deterministic** slop detectors — a doctor sibling that needs no LLM. Bounded polish: one inspect, one fix batch, stop. “Refinement preserves; redesign replaces — never split the difference.” | Challenger “worlds” as a 177-system menu. Bounce/elastic easing as a house ban is stealable. |
| **Hallmark** | [nutlope/hallmark](https://github.com/nutlope/hallmark) MIT | **Macrostructure** (layout grammar, not palettes). Consecutive surfaces in one repo **must not** share a macrostructure. Named tells (purple-gradient hero, 3-col feature grid, card-in-card, `#000`/`#fff`, invented “+47%”). Genre-routed nav/footer. Pre-emit 6-axis stamp. Honest copy. | Specimen-as-default (Hallmark’s own failure mode). |

### P1 — retrieval and critique

| Source | URL | Steal |
|---|---|---|
| **ui-ux-pro-max** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Searchable DB pattern: query `style` / `pairing` / `palette` / `stack` instead of loading essays. ~74 font pairings, product-type reasoning. Adapt as `cite.mjs` domains: `dna`, `pairing`, `ixd`, `slds`. | 192 generic palettes. That *is* slop. Our palettes come from cite DNA + brand pack. |
| **UICrit (UIST ’24)** | [google-research-datasets/uicrit](https://github.com/google-research-datasets/uicrit) · [paper](https://arxiv.org/abs/2407.08850) | Critique format: NL finding + bbox + scores (aesthetics 1–10, usability 1–10, learnability, efficiency). Few-shot this into the vision critic. 55% gain reported with visual prompting. | Training on RICO mobile as the SaaS prior. Use the *schema*, label our own golden set. |
| **Antigravity × Gemini vision pipeline** | [antigravitylab.net — UI aesthetic evaluation](https://antigravitylab.net/en/articles/agents/antigravity-gemini-vision-ui-aesthetic-evaluation-agent) | Screenshot → structured JSON scores → fixer agent on axes <7. CI-able. | Letting the critic “fix” brand-locked Clearspeed chrome. |
| **emilkowal.ski / interfaces.rauno.me** | already in `taste.md` Sources | Keep as product-lane always-on. Operationalize as critic checks, not extra prose. | — |
| **Refactoring UI + Butterick + Bringhurst** | already in taste | Keep. | Numeric hue-rotation myths taste.md already corrected. |

### P2 — marketing-lane only (never default on LEX / internal)

| Source | URL | Steal | Ban on LEX/SaaS-admin |
|---|---|---|---|
| **Ga14ctic/awwwards-skill** | [github.com/Ga14ctic/awwwards-skill](https://github.com/Ga14ctic/awwwards-skill) | 9-phase: palette → inspiration → composition → motion calibration → polish. Refuses to run on CRUD. **Steal the refusal.** | GSAP / Three.js / custom cursors / 21st.dev as defaults. |
| **Z4YT0N/awwwards-skill** | [github.com/Z4YT0N/awwwards-skill](https://github.com/Z4YT0N/awwwards-skill) | Local reference-project study commands; anti-slop copy bans. | 257-site clone farm. License. |
| **Awwwards SOTD** | [awwwards.com/about-evaluation](https://www.awwwards.com/about-evaluation/) | Official weights: **Design 40 / Usability 30 / Creativity 20 / Content 10**. Fail Usability <7 even if Design is 9. Creativity only if it serves the concept. | Scoring a `lightning-datatable` as SOTD. |
| **Taste Skill knobs** | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY` 1–10 on the Wireframe brief. | 50-style menus (Glassmorphism as a picker). |
| **Anthropic `canvas-design`** | [anthropics/skills …/canvas-design](https://github.com/anthropics/skills/blob/main/skills/canvas-design/SKILL.md) | Manifesto-before-pixels for **artifacts**. Second pass: cut, don’t add. | Philosophy essays on a LEX queue. |
| **Design2Code self-revision** | [arxiv:2403.03163](https://arxiv.org/abs/2403.03163) · [SALT-NLP/Design2Code](https://huggingface.co/datasets/SALT-NLP/Design2Code) | Render own output → screenshot → revise **once** vs cite still. This is the missing inner loop. | Fine-tuning on WebSight (synthetic Tailwind slop). |
| **ArtifactsBench / WebDev Arena** | [arxiv:2507.04952](https://arxiv.org/abs/2507.04952) | Three temporal shots (before / during / after interaction). Motion timing as a scored dim. | Letting an MLLM replace contrast math. |
| **v0 (steal one rule)** | [How we made v0](https://vercel.com/blog/how-we-made-v0-an-effective-coding-agent) | Screenshot-as-spec path. **Avoid indigo/blue unless asked.** | shadcn as default. Shine already has that disease. |

### Do not steal (or steal only as negative examples)

| Source | Why |
|---|---|
| Community “awwwards-ui” skills that bake GSAP/Lenis/magnetic cursors | That *is* 2026 marketing slop, the sibling of zinc dashboards. |
| v0 / Lovable as the director | v0 is a shadcn renderer. Shine already over-indexes shadcn. Use v0 as a *competitor to beat on likeness*, not a teacher. |
| UI-TARS / OS-Atlas / ShowUI | GUI *operators*, not designers. Optional later for “can a keyboard user finish.” |
| WebSight / Design2Code / Sightseer | Screenshot→HTML. Useful as a Build assist once DESIGN.md+cite PNG exist. Not taste. |
| LAION-Aesthetics / NIMA | Photo aesthetic. Will score a hero photograph, not a DataTable. Do not gate queues on it. |
| Scraped Dribbble/Behance | Site policy is right: posters, not software; copyright. Human mood boards only (`inspiration.md`). |
| Untitled UI / Tailwind Plus / Origin UI / Aceternity source | Paywall or poison license. Query-only if Atlas-owned; still not. |

---

## 5. Model stack

The skill is the specialist. Do not fine-tune until the golden set exists.

| Role | Recommendation | Local? | Notes |
|---|---|---|---|
| **Director LLM** | Claude Opus / Gemini 2.5 Pro with vision. Local fallback: [`Qwen/Qwen3-VL-8B-Instruct`](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct) (Apache-2.0, MLX). Atlas: Qwen3-VL-32B. | Both | Gap is missing images in context, not the base model. **Do not fine-tune on WebSight.** |
| **Vision critic** | Same frontier VLM, UICrit-shaped JSON. Local: Qwen3-VL-8B. | Both | Cite PNG + candidate PNG + DNA + lane + DESIGN.md. |
| **Likeness (must-ship)** | [`google/siglip2-so400m-patch16-naflex`](https://huggingface.co/google/siglip2-so400m-patch16-naflex) Apache-2.0 cosine on full frame **and** `[data-cite]` crops. Fail closed if Carbon cite embeds nearer to a zinc gallery than to the cite. | Mac | This is the defect measure cannot see. Not LAION-aesthetic (photo prior; wrong on DataTables). |
| **Perception (LEX)** | [`microsoft/OmniParser-v2.0`](https://huggingface.co/microsoft/OmniParser-v2.0) or ShowUI-2B for element boxes when DOM is synthetic shadow. | Mac | Grounding, not taste. |
| **Mock generator** | [`black-forest-labs/FLUX.1-schnell`](https://huggingface.co/black-forest-labs/FLUX.1-schnell) via existing mflux + ControlNet canny **from the wireframe shot**. Wireframe exploration only. | Mac | A FLUX mock cannot emit `--shine-text-sm`. Never LEX source of truth. FLUX.1-dev ControlNet is NC unless paid. |
| **Preference / LoRA** | After 50 Justin-labeled pairs. UICrit few-shot until then. VisJudge recipe ([arxiv:2510.22373](https://arxiv.org/html/2510.22373v2)) on **our** labels. | Atlas | Not a download. |
| **GUI operator** | [`ByteDance-Seed/UI-TARS-1.5-7B`](https://huggingface.co/ByteDance-Seed/UI-TARS-1.5-7B) Apache-2.0 — capture / “finish the job” traces only. | Atlas | Click-agent. Useless as a designer. |

**Eval harness (non-negotiable):** 20 golden HTML fixtures.

- 5 slop (zinc dashboard, 3 equal KPIs, Inter, purple glow, cream+serif)
- 5 house-correct (dense editorial, tokens, still not award)
- 5 kit-faithful (Carbon queue, Ant settings, Magic hero, Spectrum chat, MUI marketing)
- 5 Lightning (record in 1280, record in 494 host, console, LWR, email)

Each fixture has: expected lane, cite id, critic floor, measure hard-fails, “stranger-distinguishable from zinc” boolean. Doctor `--full` runs the set. A skill change that makes Carbon look like zinc **fails CI**.

---

## 6. Architecture — Shine v2 “Visual Director”

```
job → lane → cite + DNA pack (vision) → DESIGN.md → (Wireframe|Build)
    → paint via voice pack → measure (compliance) → critic (taste+likeness)
    → ≤3 critic passes → stop
```

### 6.1 Lanes (quality bars are different)

| Lane | When | Quality bar | Banned |
|---|---|---|---|
| **internal** | Cockpit, digest, queue for a ritual | Adoption + contracts + house or kit-faithful density. “Would they open it Monday.” | Marketing theater, WebGL, custom cursors |
| **saas** | Product UI (Brutus, CRO, personal apps) | Linear/Stripe/Attio caliber: type as identity, one accent, empty as brand, keyboard spatial, optical alignment | Three equal KPI cards as the page; Inter-on-zinc; purple glow |
| **lex** | Anything inside Salesforce | Belong, then excel. Cosmos structure. Owned LWC craft. Container queries. Hooks that *resolve*. | Cloning IBM/Linear chrome; org-wide CSS injection; treating SLDS as a canvas |
| **marketing** | Landing, artifact, personal site, Behance-capable piece | Anthropic direction + one signature + Awwwards axes (design/usability/creativity/content) | App-shell + KPI soup; also: unearned GSAP |

Anti-patterns become **lane-relative**. Glow is a Marketing DNA option and a SaaS/LEX fail. Dark-first is house/SaaS default and a LEX “only if the org has SLDS 2 dark.”

### 6.2 DNA pack (the unit that replaces “7 labels”)

Every `startFrom: 1` row (14 today) gets a directory:

```
corpus/packs/<id>/
  preview.light.png
  preview.dark.png
  dna.json          # current 7 fields PLUS pairing, grid, signature, photo, icon-set
  computed.json     # extracted CSS: colors, type ladder px, radii, shadows, density
  regions.json      # name, bbox %, job, primary boolean
  remap.md          # shine semantic token → this DNA value (executable)
  notes.md          # 8–20 lines: what to clone, what not to clone (logos, IBM blue)
```

`cite.mjs` prints the pack paths. **Doctor fails** if a `startFrom: 1` row has no pack. Agent **must `Read` both PNGs** (image) before drawing — not “open the Preview URL.”

`dna.json` schema (additive):

```json
{
  "family": "carbon",
  "density": "dense",
  "type": { "ui": "IBM Plex Sans 14/18", "display": null, "mono": "IBM Plex Mono", "pairing": "plex-sans+plex-mono" },
  "radius": { "control": 0, "card": 0, "sheet": 0, "unit": "px" },
  "chroma": { "accent": 0.08, "fillMax": 0.04, "neutrals": "cool-gray" },
  "elevation": "none-borders",
  "motion": { "modeMs": 110, "enter": "none" },
  "grid": "full-bleed-table, toolbar-first",
  "signature": "batch-actions toolbar, not cards",
  "icon": "carbon-icons",
  "photo": "none",
  "lane": ["internal", "saas"]
}
```

### 6.3 Voice packs (executable)

`tokens/voices/<family>.mjs` (or JSON the generator reads). `gen-source` emits a parallel theme the page opts into via `data-shine-voice` + `data-dna-family`. House remains fallback. Brand lane still sandpapers chrome — it **consumes regions + density, not IBM blue**.

Without this, “kit-faithful” is a slogan.

### 6.4 DESIGN.md (Stitch object, Shine-shaped)

Written at Wireframe lock (new) or Audit start (existing):

```
Lane:
Cite: <id>
Voice: kit-faithful | house | brand
Job: one sentence
Signature: one sentence (Marketing required; LEX usually “none — belong”)
Palette: 4–6 named roles, values from DNA pack or brand pack — not invented hex
Type: display / body / data (paired, licensed or corpus-available)
Layout: ASCII + region list from pack
States: empty / loading / error / dense / sparse
Copy: five beliefs mapped to elements (copy.md) or N/A
Salesforce host: viewport vs component inline-size (if lex)
```

Build may not invent a second DESIGN.md. Unlock structure still required to change regions.

### 6.5 Vision critic (the missing measure half)

New: `verify/critic.mjs <shot> --cite <id> --lane <lane>`.

Inputs: cite pack PNGs, output `--shot`, DESIGN.md, DNA, lane.

Outputs JSON:

```
likeness_to_cite: 1-10     # fail <7 on Build
slop_class: none|zinc|purple-glow|cream-serif|broadsheet|kpi-soup
signature_present: bool    # marketing
awwwards: { design, usability, creativity, content }  # marketing only
saas_craft: { type_identity, density, empty_as_brand, optical }  # saas
lex_belong: { host_density, hook_resolution, no_vendor_chrome }  # lex
findings: [{ severity, bbox, text }]  # UICrit shape
```

Hard-fail Build if `likeness_to_cite < 7` or `slop_class != none` when cite family ≠ shadcn-zinc. Cap 3 passes (make the site claim true). Notes from critic are findings, not “tighten spacing.”

Implementation: Playwright already has the shot; send images to the session model (Cursor/Claude vision) **or** a local VL. Do not block doctor `--ci` on a hosted VLM; `--full` runs critic on fixtures with recorded expected JSON.

### 6.6 Measure stays the compliance floor

Do not weaken voids, axe, contrast, contracts, theme, hierarchy. Add:

- Voice-relative type collision (already skipped for kit-faithful — keep)
- `data-cite` + pack id required on Build
- LEX: fail empty `querySelectorAll` on host (shadowRoot walk) — currently a silent 0/0 PASS
- LEX: fail if `--slds-*` used but `getComputedStyle` returns `""`
- Container: measure the component rect, not `window`

---

## 7. Salesforce lane — first-class, not an appendix

There is no Awwwards Lightning record page. Pick a lane and refuse the other two:

| Lane | What “award-winning” means | Honest cites |
|---|---|---|
| **Host-faithful LEX** | Belong in Cosmos. Density, Path, highlights, related lists. One signature the host does not own (empty state, Path meaning, utility-bar command). | [GridBuddy](https://appexchange.salesforce.com/) — spreadsheet-native, compact, no competing chrome. |
| **Branded Experience Cloud (LWR)** | The only Salesforce surface where Behance energy is legal. Custom CSS exists. SLDS 2 **not planned**. | [Advanced Communities](https://advancedcommunities.com/services/user-experience/), Appfire PRM, Flower Press portals. |
| **Escape hatch** | Linear DNA *beside* the org, not *in* it. | Scratchpad, Weflow, Gearset. Do not Linear-ize an LWC and call it a redesign. |

`salesforce.md` keeps the token-architecture truth (r-tier only, no org-wide CSS, Experience Cloud ≠ LEX, `--fix` deletes `--slds-c-*`). Add a **surface ontology** and corpus. AppExchange listing is a **third product**: slot 1 is a screenshot of the actual UI in a device frame, never a logo slide.

### 7.1 Surfaces (catalog rows, required)

| id | Host | Job | DNA source |
|---|---|---|---|
| `lex-record` | Lightning record page | Highlights + path + dynamic forms + related | SLDS 2 record blueprint + owned LWC |
| `lex-record-narrow` | Same, ~494px inline | Collapse rails; table must not clip | Container queries (rule 80) |
| `lex-console` | Console / workspace tabs | Utility bar, subtabs, density | Console IA, not a dashboard |
| `lex-queue` | List / work queue | Toolbar, bulk, empty, datatable | Carbon density **mapped** to `lightning-datatable` contracts |
| `lex-lwr` | Experience Cloud LWR | Marketing-capable, SLDS 2 **unsupported** | Separate kit; do not pretend Cosmos |
| `lex-email` | HTML email | 600px, no flex, no web fonts lie | Existing email emit target + craft |
| `lex-mobile` | Salesforce mobile / Mini | SLDS 2 unsupported | HIG-adjacent; do not use desktop density |

### 7.2 Corpus pins to add

- `@salesforce-ux/design-system` (summer-26 / SLDS 2 CSS modular)
- `@salesforce-ux/design-tokens` (already used by emitter — pin the package)
- `lightning-base-components` recipes / LWC recipes (SPDX-clean)
- W3C APG already pinned — keep for datatable keyboard vs synthetic shadow

No SLDS Figma clone. Docs + CSS + recipes.

### 7.3 Craft rules unique to LEX (from lived failures)

1. **Belong first.** Circular Cosmos motifs, density, type — do not Linear-ize a record page.
2. **Measure the host, not the window.** `container-type: inline-size` on `:host`; `@media` is a lie inside App Builder.
3. **Walk `shadowRoot`.** A probe that starts at host and reports 0/0 is a fail.
4. **`innerText` + datatable `data`/`columns`** — `childNodes` cannot see cells.
5. **Read hooks live.** `getComputedStyle(document.documentElement).getPropertyValue('--slds-g-color-border-base-1') === ""` is a finding. Write the *measured* value as fallback.
6. **Color on `:host`.** Unstyled `strong`/`td` inherit LEX navy that is not your navy.
7. **Fresh tab after deploy.** Reload is not proof.
8. **Themes and Branding spec is the org-wide output.** Per-LWC CSS is the component output. Never `document.head`.
9. **Awards on LEX** mean: AppExchange screenshot a designer would keep, not a Dribbble shot of a fake Salesforce. Density, scan, one primary, empty states, no clipped tables, copy that is the UI. Logo-off test: one named moment.
10. **Record home is five regions.** Highlights (hero, ≤4 fields) · Path (plot) · Dynamic Forms (body) · Related (index, tabs not 14 API columns) · Activity (log). Compact layouts vs Dynamic Highlights as two sources of truth is a craft bug.
11. **`lightning-datatable` is not mobile.** Separate Lightning page for Mini. Custom types need `data-navigation="enable"` all the way down.
12. **Console vs standard.** A console LWC that paints a second sidebar is a defect. Utility bar is Raycast-scale: one job, keyboard, no page.

---

## 8. Skill rewrite (files, not more words)

Keep `SKILL.md` ≤ current length. It becomes a **router**.

| File | Role |
|---|---|
| `SKILL.md` | Lane picker, loop, non-negotiables, reference map. No new craft essays. |
| `agents/shine-ux.md` | Same loop; **must Read pack PNGs**; must write DESIGN.md; must run critic |
| `references/direction.md` | **New.** Anthropic frontend-design distilled: subject, signature, two-pass plan, three AI clusters, Chanel pass. Lane-aware. |
| `references/interaction.md` | **New.** Fitts/Hick/Gestalt as checkable; progressive disclosure; URL as state (Vercel MUST) |
| `references/layout.md` | **New.** Grid, optical alignment, fold, whitespace as information |
| `references/salesforce.md` | Keep architecture; append surface ontology + rule 80 lessons |
| `references/voices.md` | Point at `tokens/voices/*` remap; stop saying “retune” without a file |
| `references/anti-patterns.md` | Split by lane |
| `taste.md` / `contracts.md` / `adoption.md` / `copy.md` | Keep |
| `corpus/cite.mjs` | Emit pack paths; fail if pack missing; `--domain pairing` later |
| `verify/critic.mjs` | **New** |
| `verify/measure.mjs` | LEX shadow walk; hook resolution; keep heuristics as backup |
| `verify/golden/` | 20 fixtures |
| Drop from always-consider | Chart pins as `startFrom` |

**Do not load all refs.** Cite pack + `direction.md` + one lane file (`salesforce.md` or `patterns.md` or `copy.md`).

---

## 9. Corpus policy (stop adding the wrong pins)

Director-plan was right: do not add pins until unused ones are citeable pages.

1. Index full pages from Carbon, Ant Pro, Mantine, Magic UI, Fluent, Spectrum, HeroUI (the 38 pins with no catalog kit row).
2. Demote 71 chart rows off `startFrom`; keep as `cite.mjs chart <lib>`.
3. Build DNA packs for the 14 `startFrom: 1` rows **before** any new kit.
4. Add LEX surfaces (7.1). Pin SLDS 2.
5. Add first-class: `empty`, `pricing`, `command-palette`, `onboarding`, `404` — one pack each, SPDX-clean.
6. Query-only production shots (fair-use, not clone): Linear app, Stripe Dashboard, Vercel, Attio, Raycast — **likeness targets**, same legal posture as Haze PNGs. DNA extracted as computed.json, not source.
7. Still no Dribbble scrape. Mood stays human + `inspiration.md`.

---

## 10. Implementation sequence

### P0 — make the lie true (1 week)

Biggest delta per hour is **zero new models**: put the cite PNG in the director context.

- DNA packs for: `carbon-datatable`, `magicui-hero`, `shadcn-dashboard-01`, `antd-pro-settings`, `mui-marketing-page` (preview PNG + `remap.md` even if computed.json is thin).
- `cite.mjs` lists pack PNGs; doctor fails missing packs for those five.
- `shine-ux.md`: **must `Read` the PNG**; report field `images_read: [...]`.
- `verify/critic.mjs`: SigLIP-2 cosine first (local, Apache). VLM JSON second. Fixtures `carbon-as-shadcn` / `marketing-as-appshell` get a likeness floor.
- After first emit: one Design2Code-style self-revision (shot vs cite still), then existing `measure.mjs`.
- `direction.md` (~150 lines): Anthropic uniqueness pass + Hallmark three-look hex fingerprints + Impeccable Persuade/Operate. DESIGN.md at Wireframe lock.
- Named 2026 slop as a **lint family that cannot be pragma-exempted** (cream `#F4F1EA`+serif+terracotta, OLED+acid, broadsheet, indigo default, 3-col feature grid).
- Salesforce: move rule 80 Lightning bullets into `salesforce.md`; add `lex-record-narrow`; name the host (LEX standard / console / LWR / email / mobile / listing) or fail.

**Done when:** an agent that cites Carbon and paints zinc fails critic, not just a Geist-sidebar heuristic. Site screenshot-critique sentence is implemented.

### P1 — executable voices + golden set (2 weeks)

- `tokens/voices/carbon.mjs`, `material.mjs`, `magicui.mjs` actually change emitted values.
- 20 golden fixtures; `doctor --full` runs critic expected JSON.
- Demote chart `startFrom`.
- `interaction.md` + Vercel MUST subset always-on in SKILL (not a new 2k-word file in the always-load path — 30 lines).
- LEX measure: shadowRoot walk refuse-on-empty; hook resolution probe.

**Done when:** the two-screen stranger test is CI, not a hope.

### P2 — Salesforce surfaces + remaining packs (2–3 weeks)

- Packs for remaining `startFrom: 1`.
- LEX catalog rows + SLDS 2 pin + container-query fixture at 494px.
- `slds-linter` in doctor `--full` for LEX consumers.
- Empty/pricing/command-palette packs.

**Done when:** a PM Tracker-class LWC cannot ship a clipped table in a 494px host and call it PASS.

### P3 — marketing ceiling (optional, after P1)

- Awwwards axes on Marketing lane only.
- mflux + ControlNet from Wireframe regions.
- Signature-element gate.
- Refusal to run Marketing pipeline on LEX/internal (steal from Ga14ctic).

**Done when:** `justinfowler.com` or a Shine explainer page is a piece you would post, and a Carbon queue still looks like a queue.

### Explicit non-goals

- Another 10k words of craft.
- Fine-tuning a design LLM before 50 labeled pairs.
- Making doctor greener by skipping consumers.
- Cloning Linear/IBM on Clearspeed.
- Becoming an Awwwards landing-page generator that cannot ship a DataTable.

---

## 11. Definition of “top 1%” (falsifiable)

Shine is world-class when **all** of these are true:

1. **Compliance:** current doctor + measure still pass (do not trade a11y for glow).
2. **Likeness:** Carbon cite cannot ship as zinc; marketing cite cannot ship as app-shell; critic `likeness_to_cite ≥ 7`.
3. **Distinctiveness (Marketing/SaaS):** DESIGN.md names a signature; critic `slop_class = none`; two products in the same week are not siblings.
4. **Salesforce:** LEX screens belong in Cosmos, work at 494px, resolve every hook they name, walk shadow DOM, and would survive an AppExchange listing screenshot.
5. **Use:** Adoption metrics still apply to internal tools. A beautiful unused cockpit is still a defect.
6. **Awards:** Marketing artifacts are *eligible* for Behance/Dribbble/Godly — not because we scraped those sites, but because direction + signature + craft + real states coexist. LEX/SaaS are eligible for “best product UI” not “best poster.”

If (1) holds and (2)–(4) fail, Shine is what it is today: the best linter that thinks it is a designer.

---

## 12. Field sources (2026-08-21 fan-out)

Internal gap analysis, GitHub skills, Hugging Face models, and Salesforce craft were researched in parallel. The spec above is the synthesis. Do not treat the following as a second skill to install.

| Track | Keep |
|---|---|
| Skills | Anthropic frontend-design + canvas-design; Impeccable detectors + modes; Hallmark macrostructure + honest copy; Stitch DESIGN.md; Vercel AGENTS.md; ui-ux-pro-max *pairing CSV only*; Awwwards 40/30/20/10 on marketing/LWR |
| Models | Frontier VLM director; SigLIP-2 likeness; Qwen3-VL-8B local critic; OmniParser for shadow DOM; FLUX schnell wireframe-only; UI-TARS for traces not taste |
| Salesforce | GridBuddy (LEX); Advanced Communities (LWR); Scratchpad/Weflow (escape hatch); listing slot-1; five-region record home; datatable ≠ mobile |
| Datasets | Own catalog shots primary. UICrit schema. `ronantakizawa/webui` for Carbon/Awwwards splits if license-clean. **No** WebSight taste training. **No** Dribbble scrape. Lightning shots: capture the org. |
