# Nucleus golden fixture

Distilled Company Tools / Operate shell for expert-track P4a/P6/S4.

## Files

| Path | Intent |
|---|---|
| `before.html` | Dual filled primaries + KPI/card soup + “Welcome to your dashboard” |
| `after.html` | Single Install primary, focal install list, searchable catalog, honest empty |
| `shine-usability.json` | Operable search → install prove |
| `receipts/before-measure.log` | Fail log (cta-pressure + composition-slop + kpi) |
| `receipts/after-measure.log` | Pass log |
| `receipts/after-usability.log` | Usability pass |
| `receipts/*-crop.png` | Defect crops — not twin full-page screenshots |

## Scripted path

```sh
node verify/measure.mjs verify/fixtures/nucleus-golden/before.html --cite shadcn-catalog --lane saas
node verify/measure.mjs verify/fixtures/nucleus-golden/after.html --cite shadcn-catalog --lane saas
node verify/usability.mjs verify/fixtures/nucleus-golden/after.html \
  --contract verify/fixtures/nucleus-golden/shine-usability.json --cite shadcn-catalog
node verify/nucleus-golden.test.mjs
```

Real-surface substitute without SSO: `docs/sled-capture-prove.md`.
See `docs/nucleus-golden-prove.md`.
