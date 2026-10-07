# Buildnext slice — Phase 1/2 kickoff

Extends Phase 0. Work items: `540fff5d-…` (roadmap) / `eba14d23-…` (this slice).

## Delivered

| Item | Evidence |
| --- | --- |
| Judgment-eval harness | `benchmark/judgment-eval.mjs` + 8 variants; machine floor **8/8** |
| Principles | **20** records in `knowledge/principles/` |
| Second adapter | `store-role.mjs` (editor/viewer); viewer save forbidden + explained |
| Browser proof | `verify/records-pilot-browser.mjs` — list/edit/fail/retry + viewer gate |
| Nucleus-shaped consumer | `adapters/nucleus-shaped.mjs` + local `/api/operate/records` harness |
| Consumer E2E | `verify/records-pilot-nucleus-browser.mjs` — list/edit/fail/retry + filter/empty/validation/stale-write |
| Doctor bite | `verify/records-pilot-nucleus-bite.mjs` — FORBIDDEN / SAVE_FAILED / VALIDATION / STALE_WRITE fail-closed |

## Non-claims

- Human Phase 1 review (≥7/8 usable) not run — operator steps in [`HUMAN-REVIEW.md`](./HUMAN-REVIEW.md)
- Authenticated production Nucleus adapter (needs Workspace SSO + checkout) still open — swap `baseUrl` + `credentials: "include"`; drop harness `arm-fail`
- Held-out briefs remain sealed
- Distribution / doctor-full not claimed
