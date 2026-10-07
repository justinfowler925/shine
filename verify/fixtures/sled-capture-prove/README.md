# SLED Capture prove fixture (S4 real-surface-shaped)

Distilled from Project store `internal/sled-audit-fixtures/` + `internal/sled-source-dump/`
(`SledCapture` / Nucleus `/revops/sled`). Used when `justin-fowler_cspd/nucleus` checkout
or Workspace SSO is unavailable — **no auth bypass**.

## Files

| Path | Intent |
|---|---|
| `before.html` | Dual/triple filled CTAs + dual-focal + KPI soup (audit tip bloat) |
| `after.html` | Single Pursue primary, one focal queue, operable search→pursue |
| `shine-tables.json` | Static notice table (actions live on the page primary) |
| `shine-usability.json` | Operate flow: filter → select → pursue |
| `receipts/*` | Fail→pass measure logs + distinct CTA crops |

## Scripted path

```sh
node verify/measure.mjs verify/fixtures/sled-capture-prove/before.html --cite shadcn-queue --lane saas
node verify/measure.mjs verify/fixtures/sled-capture-prove/after.html --cite shadcn-queue --lane saas
node verify/usability.mjs verify/fixtures/sled-capture-prove/after.html \
  --contract verify/fixtures/sled-capture-prove/shine-usability.json --cite shadcn-queue
node verify/sled-capture-prove.test.mjs
```

See `docs/sled-capture-prove.md`.
