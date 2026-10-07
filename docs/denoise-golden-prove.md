# Denoise golden prove path (N11)

**Bar:** measure/prove **FAIL→PASS** with named defect clearance — not twin full-page screenshots.

## Run

```sh
npm run denoise:loop -- --html verify/fixtures/denoise/queue-cta-before.html
npm run denoise:loop-e2e
npm run denoise:eval
node verify/denoise-loop.test.mjs
```

## Loop

1. Packet `--mode denoise --category queue --accept` → DDR  
2. Preflight-slop `ai-slop-*`  
3. Cite + `restructureHints[]` (N10)  
4. `shine-restructure.json` → `apply-dom` (+ TSX AST Actor repair when `--tsx` / `tsxPath`)  
5. Agent humanGate for dual-grid XOR (`npm run restructure:xor` / `xor-saved-view.mjs`) — peer title → filter chip + shared DataGrid; never silent delete in apply-tsx  
6. Measure rounds (≤3) with Critic≠Actor host — named denoise defects must clear (cta/dual/kpi/…)  
7. Prove receipt links `ddrId` + `constitutionIds` + `reflexionVerdict` (`--prove` / `mintProve`); FAIL→PASS crop required (`--crop queue-cta-tsx`) — twin full-page INVALID  
8. E2E doctor: `npm run denoise:loop-e2e` (fixture queue HTML+TSX AST+crop)

## Fixtures

| Pair | Defects | Cropped receipts |
|---|---|---|
| `queue-cta-{before,after}` | cta-pressure | `receipts/queue-cta-{before,after}-crop.html` |
| `queue-kpi-{before,after}` | kpi-soup | `receipts/queue-kpi-{before,after}-crop.html` |
| `queue-dual-grid-{before,after}` | dual-focal → XOR after PASS (D10) | `receipts/queue-dual-grid-before-crop.html` + `queue-dual-grid-fold-crop.html` |
| `sources-cite-{before,after}` | wrong-cite / rebind-cite | `receipts/sources-cite-{before,after}-crop.html` |
| `usul-*-{before,after}` | set-focal / composition | `receipts/usul-focal-{before,after}-crop.html` |
| skill-ab `queue-sled-bloat` | cta-pressure + kpi-soup | `receipts/queue-sled-bloat-{before,after}-crop.html` |

Crop builders: `verify/restructure/defect-crops.mjs` · doctor bite `verify/defect-crops.test.mjs`.  
Twin full-page before/after screenshots are **invalid** proof.

## Proof artifacts

`verify/fixtures/denoise/.loop/denoise-loop-receipt.json` (local) and CI via
`verify/denoise-loop.test.mjs` — status + cleared defect IDs + `reflexionVerdict`, not identical screenshots.
Skill A/B pins the same crop pairs in `verify/fixtures/skill-ab/cases.json` and binds them to
Atlas `reflexionVerdict` on per-case receipts (`shine-skill-ab-receipt/v1`).
