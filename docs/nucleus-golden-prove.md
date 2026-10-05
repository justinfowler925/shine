# Nucleus golden-path prove (P6)

**Fixture:** `verify/fixtures/nucleus-golden/`  
**Receipts:** `verify/fixtures/nucleus-golden/receipts/`  
**Test:** `node verify/nucleus-golden.test.mjs`

## Fail → pass (logs, not twin full-page shots)

| State | Result | Evidence |
|---|---|---|
| `before.html` | measure **FAIL** | `receipts/before-measure.log` — `cta-pressure` dual filled primaries; `composition-slop` card soup + “Welcome to your dashboard”; KPI equal-card floor |
| `after.html` | measure **PASS** | `receipts/after-measure.log` — single Install primary; focal install list; honest empty copy |
| Defect crops | distinct | `before-cta-crop.png` / `before-cards-crop.png` vs `after-cta-crop.png` |

## What now hard-fails that didn’t before this expert track

1. Operate done without fresh `prove.mjs` completion (P0)
2. >1 filled primary in main on Operate/catalog cites (P1)
3. Card soup / marketing DNA / filler empty on saas Operate (P3)
4. `aria-invalid` without message on form/settings/record (P2)

## Attach

See `docs/nucleus-attach.md` and `skill/references/clearspeed/profile-instructions.md`.
