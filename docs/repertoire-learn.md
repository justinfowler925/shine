# Repertoire + episodic + cite-ban learn

**Bar:** store proven **job→cite→kit** + working `restructureHints`, linguistic
episodes tied to `ddrId` + prove/measure fail category, and **cite bans /
edition anti-cites** written only after real cite-related prove fails.  
**Merge gate:** doctor-gated version bump (`doctorBiteOk`).  
**Never:** preference labels, RLAIF rewards, or “looks good” without a machine fail.

## Store

`knowledge/repertoire/repertoire.json` (`shine-repertoire/v1`)

| Field | Role |
|---|---|
| `entries[]` | Proven recipe: job, category, primaryCite, kitRecipe, restructureHints, ddrId, proveFailCategories |
| `episodes[]` | Reflexion lesson after real prove fail: ddrId, failCategory, lesson, verdict |
| `citeBans[]` | Operate demotions (`kind: operate-demotion`) after cite-honesty / wrong-cite prove fails |
| `editionAntiCites[]` | Edition-scoped anti-cites (e.g. `clearspeed`) after the same prove fails |
| `version` | Integer bumped only by successful `commitLearning` with `doctorBiteOk: true` |

Cite-related fail categories: `cite-honesty` · `wrong-cite` · `cite` · `rebind-cite` · `category-honesty`.

## Run

```sh
npm run learn -- match --job "Decide Pursue…" --category queue
npm run learn -- bans --category queue --edition clearspeed
node core/learn.mjs commit \
  --job "Decide Pursue on the next notice" \
  --category queue \
  --cite shadcn-queue \
  --kit "shadcn-queue / DataGrid recipe" \
  --hints "restructure:cta-budget|restructure:set-focal" \
  --ddr ddr_example_001 \
  --fail-category cta-pressure \
  --lesson "One filled Pursue; demote Assign before paint." \
  --doctor-ok
# After a real cite prove fail (tied to ddrId):
node core/learn.mjs commit-prove-fail \
  --ddr ddr_example_001 \
  --fail-category cite-honesty \
  --ban-cite shadcn-dashboard-01 \
  --expected shadcn-queue \
  --category queue \
  --edition clearspeed \
  --doctor-ok
node verify/learn.test.mjs
```

## Hooks

- `inferCiteBansFromProveFail` — builds ban payloads only when failures are cite-related + `ddrId` + observed cite.
- `commitCiteBansFromProveFail` — doctor-gated write of operate demotion and optional edition anti-cite.
- `core/reflexion.mjs` — after prove/measure fail, attaches inferred bans; commits when `doctorBiteOk` + `observedCite` are passed.
- `corpus/recommend.mjs` — surfaces learned bans as `anti-cite:` strings (cite golden consumers).

## Non-goals

- Preference pairwise ranks / RLAIF / CriticGPT training  
- Auto-merge of skill patches without doctor  
- Writing bans on non-cite fails (cta-pressure, dual-focal, … stay episodic-only)
