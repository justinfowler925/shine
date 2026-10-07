# Skill A/B eval (Salesforce DI-style)

**Bar:** denoise guidance **with** clears pinned defects; **without** (craft-first) does not.  
Machine oracles only — measure/preflight/structural clears + expected ops.  
**No preference labels, no RLAIF, no LLM judge.**

## Run

```sh
npm run skill:ab                 # structural / preflight (doctor-safe)
npm run skill:ab -- --measure    # optional live Chromium measure
node verify/skill-ab-eval.test.mjs
```

## Arms

| Arm | Behavior |
|---|---|
| **with** | Load denoise decision path: diagnosis checks → `deriveRestructureOps` → DOM apply (+ XOR when dual-grid) |
| **without** | Craft-only baseline: no restructure ops (simulates agent without `denoise.md`) |

## Pinned cases

`verify/fixtures/skill-ab/cases.json` → Sled-class fixtures under `verify/fixtures/denoise/`:

| Case | Defect / op | Cropped FAIL→PASS |
|---|---|---|
| `queue-cta` | `cta-pressure` / `cta-budget` | `queue-cta-{before,after}-crop.html` |
| `queue-kpi` | `kpi-soup` / `kpi-collapse` | `queue-kpi-{before,after}-crop.html` (dedicated `queue-kpi-before.html`) |
| `usul-focal` | composition / `set-focal` | — |
| `sources-cite` | wrong-cite / `rebind-cite` | `sources-cite-{before,after}-crop.html` |
| `queue-dual-grid` | `dual-focal` / XOR | `queue-dual-grid-before-crop.html` + fold crop |

Crops live in `verify/fixtures/denoise/receipts/` (builders in `verify/restructure/defect-crops.mjs`).

## Floor

`meetsFloor` when:

1. `denoise.md` still carries the decision-table markers  
2. **with** wins every case  
3. **without** wins zero cases  
4. Cropped receipts for CTA / KPI / wrong-cite / dual-grid exist, match markers, and are not twin full-pages  

Doctor bites: `verify/skill-ab-eval.test.mjs` · `verify/defect-crops.test.mjs`.

## Non-goals (v1)

- Preference pairwise ranks  
- Model A/B across providers  
- Training CriticGPT / RLAIF  
- Overfitting a live agent transcript corpus
