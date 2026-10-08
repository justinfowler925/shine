# Denoise — cleanup mode (N0)

One cleanup path for bloated Operate surfaces: **cite → measure → denoise-loop → prove**.  
No craft polish until `primaryTaskCheck` is green. Prove is mandatory for Operate cites.

Load this file when the user says **redesign this Operate surface**, “denoise”, Sled-class cleanup, or the packet has `--mode denoise`. Do **not** treat `verify/denoise-loop.mjs` as a secret test harness — it is the default agent runner.

## Default agent path (Operate queues)

Edition `clearspeed-operate`. Resolve sibling cite first (`core/edition-siblings.mjs` / `docs/edition-siblings.md`), then:

```sh
# Cite → measure → denoise-loop → prove
node "$ROOT/core/edition-siblings.mjs" resolve \
  --category queue --job "<Monday job in one sentence>"
node "$ROOT/verify/measure.mjs" <artifact.html> --cite <preferredCite> --lane saas
node "$ROOT/verify/denoise-loop.mjs" \
  --html <artifact.html> [--tsx <file.tsx>] \
  --cite <preferredCite> \
  --edition clearspeed-operate \
  --category queue \
  --job "<Monday job in one sentence>" \
  --out /tmp/shine-operate-denoise \
  --prove
```

The loop hosts packet → static → diagnose → apply (cta-budget / kpi-collapse / collapse-peer-grids / set-focal / rebind-cite) → measure ≤3 → Critic≠Actor → prove. Stop on named denoise cleared + `reflexionVerdict=done` + FAIL→PASS crop. One-pager: `docs/operate-redesign.md`.

## Packet-only start (when not using the loop CLI)

```sh
node "$ROOT/core/design-packet.mjs" \
  --job "<Monday job in one sentence>" \
  --lane saas \
  --mode denoise \
  --category <queue|settings|catalog|record|dashboard|datagrid|form|…> \
  --project "$PWD"
```

Ambiguous jobs **refuse** without `--category`. Do not guess dashboard.

Accept the Design Decision Record before Actor implement (auto-appends audit
`accept-ddr`). Host may refuse a proposal (`refuse-ddr` + `status: refused`):

```sh
node "$ROOT/core/design-packet.mjs" … --accept
# or accept a written packet: node "$ROOT/core/ddr.mjs" accept shine-packet.json
# or refuse: node "$ROOT/core/ddr.mjs" refuse shine-packet.json --reason "…"
```

`editing.allowed` stays false while `ddr.status !== "accepted"`. Supersede; do not rewrite history. Green `prove.mjs --ddr` auto-links the completion receipt on the audit trail. Set `SHINE_AUDIT_DIR` so `denoise-loop.mjs` also auto-appends measure/critic/reflexion Actions (not only accept/refuse+prove).

## Diagnose order (Operate — locked)

1. Primary job (`primaryTaskCheck`) — stranger names and starts it in ~3s  
2. Competing CTA (`competingCtaCheck` / measure `cta-pressure`)  
3. Empty / error / loading triad  
4. Composition (dual-focal, KPI soup, card soup, wrong cite)  
5. Craft (tokens, glow, density)

Craft-only Operate packets fail presence checks. If usability/completeness is highest severity → **restructure**, then repaint.

## Ambiguous → decision table

| Ambiguous signal | Decision | Op / gate |
|---|---|---|
| Dashboard chrome on a Monday triage job | Worklist, not dashboard. Cite `shadcn-queue` (or settings/record), never chart/dashboard page lead. Consumer TSX: `apply-tsx` AST `worklist-first` (records/worklist before KPI chrome + `data-region=focal`); copy FAIL→PASS crops from `recommendation.worklistFirstAst.cropBefore/cropAfter` | `worklist-first` AST · `dashboard→worklist` · `queue-worklist-first-tsx-*` |
| Records list→detail without `shine-tables.json` | Write `kind: worklist` contract (search, rowAction, loading/empty/filtered-empty); copy from `recommendation.tableQuality.fixture` | `verify/fixtures/records-worklist/shine-tables.json` |
| Two DataGrids / two worklists same route | One grid. Peer title → filter chip + shared DataGrid (XOR). Consumer TSX: `apply-tsx` AST `collapse-peer-grids` (xor-saved-view); copy FAIL→PASS crops from `recommendation.dualFocalAst.cropBefore/cropAfter` (HTML XOR: `recommendation.xorSavedView`) | `collapse-peer-grids` AST · D10 XOR · `dual-focal` · `queue-dual-grid-tsx-*` |
| ≥2 filled primaries in main | CTA budget = 1. Prefer job verb; peers outline/ghost. Consumer TSX: `apply-tsx` AST `cta-budget` (maxFilled=1); copy FAIL→PASS crops from `recommendation.ctaPressureAst.cropBefore/cropAfter` | `cta-budget` · `cta-pressure` · `queue-cta-tsx-*` |
| ≥4 equal KPI tiles vs work object | Collapse to ≤3 chips; rest `<details data-shine-kpi-rest>`. Consumer TSX: `apply-tsx` AST `kpi-collapse` (maxVisible=3); copy FAIL→PASS crops from `recommendation.kpiSoupAst.cropBefore/cropAfter` | `kpi-collapse` · `kpi-soup` · `queue-kpi-tsx-*` |
| ≥5 above-fold filter pills/chips | Collapse to ≤3 visible; rest `<details data-shine-pill-rest>`. Consumer TSX: `apply-tsx` AST `pill-collapse` (maxVisible=3); copy FAIL→PASS crops from `recommendation.pillFilterAst.cropBefore/cropAfter` | `pill-collapse` · `pill-filter` · `queue-pill-tsx-*` |
| ≥2 competing page titles in main | Keep one title; demote peers to kicker. Consumer TSX: `apply-tsx` AST `title-singular`; copy FAIL→PASS crops from `recommendation.pageTitleAst.cropBefore/cropAfter` | `title-singular` · `page-title` · `queue-titles-tsx-*` |
| Glow / purple-indigo gradient / display-serif on Operate | Scrub illegal class/style tokens (`strip-marketing-dna`). Consumer TSX: `apply-tsx` AST `strip-marketing-dna`; copy FAIL→PASS crops from `recommendation.marketingDnaAst.cropBefore/cropAfter` | `strip-marketing-dna` · `marketing-dna` · `queue-marketing-dna-tsx-*` |
| Active filters with no dismiss/clear | Stamp per-chip dismiss + clear-all (`filter-clearable`). Consumer TSX: `apply-tsx` AST `filter-clearable`; copy FAIL→PASS crops from `recommendation.filterReversibleAst.cropBefore/cropAfter` | `filter-clearable` · `filter-reversible` · `queue-filters-tsx-*` |
| Filled Export/New/Save in header/nav chrome | Demote chrome to outline/ghost (`chrome-budget` maxFilledChrome=0); keep job verb filled in main. Consumer TSX: `apply-tsx` AST `chrome-budget`; copy FAIL→PASS crops from `recommendation.chromePressureAst.cropBefore/cropAfter` | `chrome-budget` · `chrome-pressure` · `queue-chrome-tsx-*` |
| Settings job with queue cite | Rebind cite to category truth. Consumer TSX: `apply-tsx` AST `rebind-cite` (`data-cite` / `dataCite` string + `{"…"}`); refuse paint until rebound; copy FAIL→PASS crops from `recommendation.wrongCiteAst.cropBefore/cropAfter` | `rebind-cite` AST · `wrong-cite` · `sources-cite-tsx-*` |
| Equal Card roots, no focal | One `data-region="focal"`. Consumer TSX: `apply-tsx` AST `set-focal`; copy FAIL→PASS crops from `recommendation.setFocalAst.cropBefore/cropAfter` | `set-focal` AST · `composition-slop` · `usul-focal-tsx-*` |
| Can’t name category in one sentence | **Stop.** Refuse until `--category` | packet gate |
| Craft ranked above usability | Out of order. Restructure before repaint | `restructureRequired` |

## Kill list (fail closed when machine-detectable)

- Dual filled primaries in main  
- Dual peer worklists / grids (`dual-focal`)  
- KPI soup on queue/triage (≥4 equal metrics ahead of work object)  
- Pill/chip filter stacks above the fold (`pill-filter`, ≥5 chips)  
- Competing page titles in main (`page-title`, ≥2)  
- Filled chrome actions in header/nav/aside (`chrome-pressure`)  
- Card soup without focal  
- Wrong cite (settings job + queue cite)  
- Filler copy (“Welcome to your dashboard”, …)  
- Marketing DNA on Operate chrome  
- Paint while `recommendation.restructureHints` still start with `restructure:` and primaryTask is red  

## Loop (fail→pass, no green theater)

```
1 packet     --mode denoise --category <…> --job "…"  → accept DDR
2 static     vibe / preflight-slop / Card·Badge counts
3 cite       shot + restructureHints[]
4 diagnose   shine-diagnosis.json + shine-restructure.json   ← Critic turn
5 apply      DOM/AST auto-safe ops (verify/restructure/*) — TSX `cta-budget` via TypeScript AST (maxFilled=1; variant default / {"default"} / missing); TSX `kpi-collapse` via TypeScript AST (maxVisible=3; className metric / {"metric"} / data-shine-kpi); TSX `pill-collapse` via TypeScript AST (maxVisible=3; className pill / {"pill"} / data-shine-filter-pill / Badge); TSX `title-singular` via TypeScript AST (one h1 / data-page-title; demote peers to kicker); TSX `chrome-budget` via TypeScript AST (maxFilledChrome=0; demote header/nav/aside filled Buttons); TSX `filter-clearable` via TypeScript AST (dismiss + clear-all on active filter chips); TSX `strip-marketing-dna` via TypeScript AST (scrub glow/gradient/display-serif className tokens); TSX `collapse-peer-grids` via TypeScript AST (XOR peer→chip; className grid-wrap / {"grid-wrap"} / role={"grid"}); TSX `worklist-first` via TypeScript AST (records/worklist before KPI chrome + focal); TSX `rebind-cite` via TypeScript AST (wrong-cite → category truth; data-cite / dataCite string + {"…"}; refuse paint until rebound)     ← Actor turn
6 agent      humanGate ops — dual-grid XOR via `xor-saved-view.mjs` (peer→chip + shared grid); god-split checklist. Never silent grid delete in apply-tsx/apply-dom
7 measure    FAIL→PASS on named defects; crop the defect (twin full-page INVALID). Dual-grid crop: one [role=grid] in fold
8 critic     reflexion on fail (diagnose only) → Actor nextStep OR host accept done
9 usability  primary-job flow + prove.mjs completion (links ddrId + constitutionIds + reflexionVerdict)
10 stop-sweep Operate cannot finish on compare alone
```

### Critic ≠ Actor (S1)

Diagnose/critic and implement are **separate turns** with distinct principals.
Host orchestration lives in `core/critic-actor-host.mjs` (do not inline accept/plan
in callers — denoise-loop uses `planRepairFromMeasure` / `completeAfterRepair`).

**Cycle:** `measure → repair (Actor) → critic (≠ worker)`. After a repair, the next
Critic turn fail-closes if `criticAgentId === lastRepairWorkerId`
(`assertNoWorkerSelfReview`).

| Role | Identity (default) | May |
|---|---|---|
| **Critic** | `shine-critic` | One call, no tools, ≤400 tokens; emit Atlas verdict `done\|partial\|blocked\|error` |
| **Actor** | `shine-actor` | Execute one `partial` nextStep via `planActorPass`; never accepts the review |
| **Host** | `shine-host` | Accepts `done`; finalizes after Actor clears measure (`hostFinalizeAfterClearance`); third principal only |

**Self-accept ban:** Critic cannot accept its own verdict; Actor/worker cannot accept the critic verdict on its own work. Unknown verdict → `partial`.

**Worker self-review ban:** the agent id that performed the last Actor repair cannot
act as Critic (or Host finalize) on that work — fail-closed.

**Host finalize:** when measure goes green after a Critic→Actor `partial` pass, Host
must call `hostFinalizeAfterClearance` / `completeAfterRepair` — `hostAccept` must not
stay null on a cleared receipt (`assertHostFinalized`).

**Atlas stop stamp:** green `prove.mjs` completions and `denoise-loop` stop receipts
must carry `reflexionVerdict` ∈ `done|partial|blocked|error` (cleared → `done`).
Operate stop-sweep + mint **fail-closed** if missing. Helpers:
`resolveStopReflexionVerdict` / `assertAtlasReflexionVerdict` in `core/reflexion.mjs`.

### Structure lock (wireframe brief → denoise-loop)

Once primary job + regions are locked (LOCKED `shine-wireframe/<slug>.brief.md`, or
auto-lock from the emitted `shine-restructure.json`), **REPAINT that changes structure
is refuse-closed** without a RESTRUCTURE packet:

- Gate: `gateDenoiseStructureChange` / `assertRepaintPreservesStructure` in
  `core/wireframe-brief.mjs`
- Structural apply in the loop uses `phase=RESTRUCTURE` + the plan
- Craft-only REPAINT (same primary/regions) stays allowed
- Receipt: `structureLock: { locked, primaryAction, regions, repaintStructureRefuse }`
- Optional: `--wireframe-brief path` on `denoise-loop.mjs`

Max **3** measure rounds per surface. Each round clears a **named** defect.

Impeccable `distill` / `quieter` and Snapline adapters are **opt-in after** cite locked + CTA/focal ops. They never override `data-cite`. See adapters in `verify/adapters/`.

```sh
node "$ROOT/verify/preflight-slop.mjs" <artifact.html>          # N2 vibe signals
node "$ROOT/verify/adapters/snapline.mjs" stop.json             # N3 opt-in
node "$ROOT/verify/adapters/impeccable.mjs" --mode distill --structure-green --cite <id>
node "$ROOT/core/reflexion.mjs" --fail "cta-pressure: …" --ddr <ddrId>   # Critic turn
```

## Constitution IDs (critic must cite)

Packet `ddr.constitutionIds` + numbered `ddr.constitution[]` from the ClearSpeed
Operate edition catalog (`knowledge/constitutions/clearspeed-operate.json`).
Critic **must** cite ≥1 principle (by `id` or number `n`) on every `partial` /
`blocked` turn — fail-closed in `core/reflexion.mjs`.

| # | ID | Rule |
|---|---|---|
| 1 | `cta-pressure` | Exactly one filled primary in main |
| 2 | `dual-focal-ban` | No peer worklists/grids for the same job |
| 3 | `kpi-soup-off-path` | KPI encyclopedia off the decide path |
| 4 | `primary-task-3s` | Stranger starts the job in ~3s |
| 5 | `cite-honesty` | Page cite matches category (no queue-on-settings lie) |
| 6 | `prove-mandatory` | Fresh prove.mjs receipt; compare alone insufficient |
| 7 | `restructure-before-repaint` | No polish while structure red |

See `docs/operate-constitution.md`.

## Proof bar

Every gate bite is **measure/prove FAIL→PASS** with a **cropped defect receipt**.  
Identical full-page “twin” screenshots are invalid proof.

Pinned crop pairs (HTML crops under `verify/fixtures/denoise/receipts/`):

| Defect | Before → after crop |
|---|---|
| `cta-pressure` | `queue-cta-{before,after}-crop.html` |
| `cta-pressure` (TSX AST) | `queue-cta-tsx-{before,after}-crop.html` |
| `kpi-soup` | `queue-kpi-{before,after}-crop.html` |
| wrong-cite | `sources-cite-{before,after}-crop.html` |
| wrong-cite (TSX AST) | `sources-cite-tsx-{before,after}-crop.html` |
| `dual-focal` / XOR | `queue-dual-grid-before-crop.html` → `queue-dual-grid-fold-crop.html` |
| `dual-focal` (TSX AST) | `queue-dual-grid-tsx-{before,after}-crop.html` |
| composition / worklist-first (TSX AST) | `queue-worklist-first-tsx-{before,after}-crop.html` |
| composition / `set-focal` | `usul-focal-{before,after}-crop.html` · TSX AST `usul-focal-tsx-{before,after}-crop.html` |
| CTA + KPI stacked | `queue-sled-bloat-{before,after}-crop.html` |

Harness: `npm run denoise:eval` → `verify/denoise-eval.mjs` (dual-grid = detect → XOR after PASS; crop pairs required).  
Skill A/B (Salesforce DI-style, machine oracles only — **no preference data**):  
`npm run skill:ab` → `verify/skill-ab-eval.mjs` on pinned `verify/fixtures/skill-ab/cases.json`  
(with denoise guidance vs craft-only baseline; doctor requires with>without + crop pairs  
**tied to Atlas `reflexionVerdict`** — with=`done`, without=`error`, `cropTiedToVerdict` on  
`shine-skill-ab-receipt/v1`).  
Builders: `verify/restructure/defect-crops.mjs` · bite `verify/defect-crops.test.mjs` ·  
`verify/skill-ab-eval.test.mjs`.  
Full loop: `npm run denoise:loop -- --html verify/fixtures/denoise/queue-cta-before.html`.  
E2E (measure→AST repair→Critic≠Actor→prove + FAIL→PASS crop):  
`npm run denoise:loop-e2e` → `verify/denoise-loop-e2e-bite.mjs`  
(`--tsx` / `tsxPath` Actor AST ops; `--prove` stamps `reflexionVerdict`+`constitutionIds`; `--crop queue-cta-tsx`).  
XOR recipe: `npm run restructure:xor -- --html verify/fixtures/denoise/queue-dual-grid-before.html --out /tmp/xor.html`.  
TSX (consumer): `npm run restructure:tsx -- --tsx <file> --plan shine-restructure.json` (dry-run; add `--write`). `cta-budget` is TypeScript AST (maxFilled=1); `collapse-peer-grids` is TypeScript AST XOR on TSX (DOM stays plan-only); `worklist-first` is TypeScript AST (records/worklist before KPI chrome); `rebind-cite` is TypeScript AST (wrong-cite → category truth; refuse paint until rebound).  
CTA AST bite: `npm run cta-pressure:ast-bite`. KPI soup AST bite: `npm run kpi-soup:ast-bite`. Dual-focal AST bite: `npm run dual-focal:ast-bite`. Worklist-first AST bite: `npm run worklist-first:ast-bite`. Wrong-cite AST bite: `npm run wrong-cite:ast-bite`. Kit: `kits.md` § Denoise-loop e2e · CTA pressure TSX AST · KPI soup TSX AST · Dual-focal ban TSX AST · Worklist-first TSX AST · Wrong-cite / rebind-cite TSX AST · Dual-grid XOR (D10).

## Related

- Playbook (human 30–60 min): Project `docs/ui-denoise-playbook.md`  
- Expert gates: P0 prove · P1 CTA · P3 composition · P5 cite v2 · P6 golden  
- Restructure schema: `verify/restructure/schema.mjs` · `shine-restructure/v1`
