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

| Case | Defect / op |
|---|---|
| `queue-cta` | `cta-pressure` / `cta-budget` |
| `queue-kpi` | `kpi-soup` / `kpi-collapse` |
| `usul-focal` | composition / `set-focal` |
| `sources-cite` | cite honesty / `rebind-cite` |
| `queue-dual-grid` | `dual-focal` / XOR |

## Floor

`meetsFloor` when:

1. `denoise.md` still carries the decision-table markers  
2. **with** wins every case  
3. **without** wins zero cases  

Doctor bite: `verify/skill-ab-eval.test.mjs`.

## Non-goals (v1)

- Preference pairwise ranks  
- Model A/B across providers  
- Training CriticGPT / RLAIF  
- Overfitting a live agent transcript corpus
