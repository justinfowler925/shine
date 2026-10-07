# Denoise — cleanup mode (N0)

One cleanup path for bloated Operate surfaces: **triage → structure decisions → restructure → prove**.  
No craft polish until `primaryTaskCheck` is green. Prove is mandatory for Operate cites.

Load this file when the packet has `--mode denoise`, the user says “denoise”, or a Sled-class cleanup is requested.

## Start

```sh
node "$ROOT/core/design-packet.mjs" \
  --job "<Monday job in one sentence>" \
  --lane saas \
  --mode denoise \
  --category <queue|settings|catalog|record|dashboard|datagrid|form|…> \
  --project "$PWD"
```

Ambiguous jobs **refuse** without `--category`. Do not guess dashboard.

Accept the Design Decision Record before Actor implement:

```sh
node "$ROOT/core/design-packet.mjs" … --accept
# or accept a written packet: node "$ROOT/core/ddr.mjs" accept shine-packet.json
```

`editing.allowed` stays false while `ddr.status !== "accepted"`. Supersede; do not rewrite history.

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
| Dashboard chrome on a Monday triage job | Worklist, not dashboard. Cite `shadcn-queue` (or settings/record), never chart/dashboard page lead | `dashboard→worklist` · anti-dashboard |
| Two DataGrids / two worklists same route | One grid. Peer title → filter chip + shared DataGrid (XOR) | `collapse-peer-grids` plan → D10 XOR recipe · `dual-focal` |
| ≥2 filled primaries in main | CTA budget = 1. Prefer job verb; peers outline/ghost | `cta-budget` · `cta-pressure` |
| ≥4 equal KPI tiles vs work object | Collapse to ≤3 chips; rest `<details>` | `kpi-collapse` · `kpi-soup` |
| Settings job with queue cite | Rebind cite to category truth | `rebind-cite` |
| Equal Card roots, no focal | One `data-region="focal"` | `set-focal` · `composition-slop` |
| Can’t name category in one sentence | **Stop.** Refuse until `--category` | packet gate |
| Craft ranked above usability | Out of order. Restructure before repaint | `restructureRequired` |

## Kill list (fail closed when machine-detectable)

- Dual filled primaries in main  
- Dual peer worklists / grids (`dual-focal`)  
- KPI soup on queue/triage (≥4 equal metrics ahead of work object)  
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
5 apply      DOM/AST auto-safe ops (verify/restructure/*)     ← Actor turn
6 agent      humanGate ops — dual-grid XOR via `xor-saved-view.mjs` (peer→chip + shared grid); god-split checklist. Never silent grid delete in apply-tsx/apply-dom
7 measure    FAIL→PASS on named defects; crop the defect (twin full-page INVALID). Dual-grid crop: one [role=grid] in fold
8 critic     reflexion on fail (diagnose only) → Actor nextStep OR host accept done
9 usability  primary-job flow + prove.mjs completion (links ddrId + constitutionIds)
10 stop-sweep Operate cannot finish on compare alone
```

### Critic ≠ Actor (S1)

Diagnose/critic and implement are **separate turns** with distinct principals.
Host orchestration lives in `core/critic-actor-host.mjs` (do not inline accept/plan
in callers — denoise-loop uses `runCriticActorHostRound`).

| Role | Identity (default) | May |
|---|---|---|
| **Critic** | `shine-critic` | One call, no tools, ≤400 tokens; emit Atlas verdict `done\|partial\|blocked\|error` |
| **Actor** | `shine-actor` | Execute one `partial` nextStep via `planActorPass`; never accepts the review |
| **Host** | `shine-host` | Accepts `done`; finalizes after Actor clears measure (`hostFinalizeAfterClearance`); third principal only |

**Self-accept ban:** Critic cannot accept its own verdict; Actor/worker cannot accept the critic verdict on its own work. Unknown verdict → `partial`.

**Host finalize:** when measure goes green after a Critic→Actor `partial` pass, Host
must call `hostFinalizeAfterClearance` — `hostAccept` must not stay null on a cleared
receipt (`assertHostFinalized`).

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

Harness: `npm run denoise:eval` → `verify/denoise-eval.mjs` (dual-grid = detect → XOR after PASS).  
Skill A/B (Salesforce DI-style, machine oracles only — **no preference data**):  
`npm run skill:ab` → `verify/skill-ab-eval.mjs` on pinned `verify/fixtures/skill-ab/cases.json`  
(with denoise guidance vs craft-only baseline; doctor requires with>without on every case).  
Full loop: `npm run denoise:loop -- --html verify/fixtures/denoise/queue-cta-before.html`.  
XOR recipe: `npm run restructure:xor -- --html verify/fixtures/denoise/queue-dual-grid-before.html --out /tmp/xor.html`.  
TSX (consumer): `npm run restructure:tsx -- --tsx <file> --plan shine-restructure.json` (dry-run; add `--write`). AST stays plan-only for `collapse-peer-grids`.  
Kit: `kits.md` § Dual-grid XOR (D10).

## Related

- Playbook (human 30–60 min): Project `docs/ui-denoise-playbook.md`  
- Expert gates: P0 prove · P1 CTA · P3 composition · P5 cite v2 · P6 golden  
- Restructure schema: `verify/restructure/schema.mjs` · `shine-restructure/v1`
