# Skill A/B eval (Salesforce DI-style)

**Bar:** denoise guidance **with** clears pinned defects; **without** (craft-first) does not.  
Machine oracles only — measure/preflight/structural clears + expected ops.  
**No preference labels, no RLAIF, no LLM judge.**

Cropped FAIL→PASS receipts are **tied to Atlas `reflexionVerdict`**: with-arm stamps `done`, without stamps `error`, and each case receipt lists crop paths (`shine-skill-ab-receipt/v1`).

## Run

```sh
npm run skill:ab                 # structural / preflight (doctor-safe)
npm run skill:ab -- --measure    # optional live Chromium measure
node verify/skill-ab-eval.test.mjs
```

## Arms

| Arm | Behavior |
|---|---|
| **with** | Load denoise decision path: diagnosis checks → `deriveRestructureOps` → DOM apply (+ XOR when dual-grid) → `reflexionVerdict: done` |
| **without** | Craft-only baseline: no restructure ops (simulates agent without `denoise.md`) → `reflexionVerdict: error` |

## Pinned cases

`verify/fixtures/skill-ab/cases.json` → Sled-class fixtures under `verify/fixtures/denoise/`:

| Case | Defect / op | Cropped FAIL→PASS |
|---|---|---|
| `queue-cta` | `cta-pressure` / `cta-budget` | `queue-cta-{before,after}-crop.html` |
| `queue-kpi` | `kpi-soup` / `kpi-collapse` | `queue-kpi-{before,after}-crop.html` |
| `usul-focal` | composition / `set-focal` | `usul-focal-{before,after}-crop.html` |
| `sources-cite` | wrong-cite / `rebind-cite` | `sources-cite-{before,after}-crop.html` |
| `queue-dual-grid` | `dual-focal` / XOR | `queue-dual-grid-before-crop.html` + fold crop |
| `queue-sled-bloat` | CTA + KPI stacked | `queue-sled-bloat-{before,after}-crop.html` |

Crops live in `verify/fixtures/denoise/receipts/` (builders in `verify/restructure/defect-crops.mjs`).  
Per-case receipts (local): `verify/fixtures/skill-ab/.work/<id>-receipt.json`.

## Floor

`meetsFloor` when:

1. `denoise.md` still carries the decision-table markers  
2. **with** wins every case (`reflexionVerdict: done`)  
3. **without** wins zero cases (`reflexionVerdict: error`)  
4. Cropped receipts for every pinned case exist, match markers, are not twin full-pages  
5. `cropTiedToVerdict` — crop paths bound on the Atlas receipt stamp (`receiptsOk`)

Doctor bites: `verify/skill-ab-eval.test.mjs` · `verify/defect-crops.test.mjs`.

## Non-goals (v1)

- Preference pairwise ranks  
- Model A/B across providers  
- Training CriticGPT / RLAIF  
- Overfitting a live agent transcript corpus
