# SaaS E2E proof fixture — Operate revenue exceptions desk

Real Operate-lane dashboard used to prove Shine’s post–M0–M6 SaaS UX diagnosis gates end-to-end.

## Surface

- Cite: `windmill-dashboard` (Operate page scope — cite bias demotes chart atoms)
- Lane: `saas`
- Shell + KPI stamps (`data-shine-kpi`) + focal chart + static exception table
- Usability contract + layout contract + diagnosis product-UX checks

## Intentional defect

`before.html` ships an icon-only toolbar overflow control **without** an accessible name.
Gates that bite:

- `incomplete-primitive: icon-only-unnamed`
- axe `button-name`

`after.html` adds `aria-label="Open overflow actions"` → measure + prove green.

## Replay (from repo root)

```sh
export SHINE=$PWD DESIGN_CORPUS=${DESIGN_CORPUS:-$HOME/design-corpus}
FIX=verify/fixtures/saas-e2e

node corpus/cite.mjs "dense revenue dashboard" --lane saas
node verify/measure.mjs $FIX/before.html --cite windmill-dashboard --lane saas   # FAIL incomplete-primitive
node verify/measure.mjs $FIX/after.html  --cite windmill-dashboard --lane saas   # PASS
node core/diagnosis.mjs check --file $FIX/shine-diagnosis.after.json --lane saas
node verify/usability.mjs $FIX/after.html --contract $FIX/shine-usability.json --cite windmill-dashboard
node verify/compare.mjs $FIX/after.html --cite windmill-dashboard --lane saas --brief "revenue exceptions desk"
node verify/prove.mjs $FIX/after.html --cite windmill-dashboard --lane saas \
  --brief "revenue exceptions desk" \
  --usability $FIX/shine-usability.json --layout $FIX/shine-layout.json \
  --diagnosis $FIX/shine-diagnosis.after.json --receipt /tmp/saas-e2e-receipt.json
```

## Files

| File | Role |
|---|---|
| `before.html` / `after.html` | Defective / fixed Operate dashboard |
| `shine-usability.json` | Operate usability contract (≥3-step flow) |
| `shine-layout.json` | Viewport layout prove contract |
| `shine-tables.json` | Static table exemption for the exception queue |
| `shine-diagnosis.before.json` | SaaS product-UX checks + defect |
| `shine-diagnosis.after.json` | SaaS product-UX checks + no-change |
