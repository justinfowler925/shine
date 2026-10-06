# Denoise golden prove path (N11)

**Bar:** measure/prove **FAIL→PASS** with named defect clearance — not twin full-page screenshots.

## Run

```sh
npm run denoise:loop -- --html verify/fixtures/denoise/queue-cta-before.html
npm run denoise:eval
node verify/denoise-loop.test.mjs
```

## Loop

1. Packet `--mode denoise --category queue --accept` → DDR  
2. Preflight-slop `ai-slop-*`  
3. Cite + `restructureHints[]` (N10)  
4. `shine-restructure.json` → `apply-dom` (+ TSX dry-run for consumer sources)  
5. Agent humanGate for dual-grid XOR  
6. Measure rounds (≤3) with Reflexion on fail  
7. Prove receipt links `ddrId`

## Fixtures

| Pair | Defects |
|---|---|
| `queue-cta-{before,after}` | cta-pressure |
| `queue-cta-before` → loop apply | dual-focal, kpi-soup |
| `sources-cite-{before,after}` | rebind-cite |
| `usul-*-{before,after}` | set-focal / composition |

## Proof artifacts

`verify/fixtures/denoise/.loop/denoise-loop-receipt.json` (local) and CI via
`verify/denoise-loop.test.mjs` — status + cleared defect IDs, not identical screenshots.
