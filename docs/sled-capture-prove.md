# SLED Capture real-surface prove (S4)

**When:** Nucleus checkout (`justin-fowler_cspd/nucleus`) or Workspace SSO is unavailable.  
**Fixture:** `verify/fixtures/sled-capture-prove/`  
**Test:** `node verify/sled-capture-prove.test.mjs`  
**Provenance:** Project store `internal/sled-audit-fixtures/` + `internal/sled-source-dump/` (`SledCapture`). No auth bypass.

## Fail → pass (logs + defect crops)

| State | Result | Evidence |
|---|---|---|
| `before.html` | measure **FAIL** | `receipts/before-measure.log` — `cta-pressure` competing filled; `dual-focal` peer grids; KPI soup |
| `after.html` | measure **PASS** | `receipts/after-measure.log` — single Pursue primary; one focal queue |
| Operable job | usability **PASS** | `receipts/after-usability.log` — filter → select → pursue |
| Defect crops | distinct | `before-cta-crop.png` / `before-kpi-crop.png` vs `after-cta-crop.png` |

## Attach / honesty

- Prefer a live authenticated Nucleus `/revops/sled` page when Justin’s machine has SSO + checkout.
- This fixture is the Cloud Agent substitute: real-surface-shaped DOM from the sled dump, not production credentials.
- Golden catalog prove remains at `docs/nucleus-golden-prove.md` (Company Tools–shaped).

## Related

- Cleanup wave precedent: Nucleus #631 · Project `docs/sled-cleanup-proof.md`
- Nucleus attach: `docs/nucleus-attach.md`
