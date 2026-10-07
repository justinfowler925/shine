# Repertoire + episodic learn stub

**Bar:** store proven **job→cite→kit** + working `restructureHints`, and linguistic
episodes tied to `ddrId` + prove/measure fail category.  
**Merge gate:** doctor-gated version bump (`doctorBiteOk`).  
**Never:** preference labels, RLAIF rewards, or “looks good” without a machine fail.

## Store

`knowledge/repertoire/repertoire.json` (`shine-repertoire/v1`)

| Field | Role |
|---|---|
| `entries[]` | Proven recipe: job, category, primaryCite, kitRecipe, restructureHints, ddrId, proveFailCategories |
| `episodes[]` | Reflexion lesson after real prove fail: ddrId, failCategory, lesson, verdict |
| `version` | Integer bumped only by successful `commitLearning` with `doctorBiteOk: true` |

## Run

```sh
npm run learn -- match --job "Decide Pursue…" --category queue
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
node verify/learn.test.mjs
```

## Non-goals (v1 stub)

- Preference pairwise ranks / RLAIF / CriticGPT training  
- Auto-merge of skill patches without doctor  
- Replacing cite golden or recommend shortlist (match is stub retrieval only)
