# Phase 0 — Definition of Done

Work item: `540fff5d-9b21-4aef-9fb4-3eaac06e9183`  
Scope: establish truth, freeze tests, declare boundary, select pilots, land scaffolding.  
Not in scope: distribution 15/15 release DoD (`docs/distribution-dod.md`), Phase 1–5 product qualification.

## Exit probes

| # | Probe | Denominator | Pass criteria | Status |
| --- | --- | --- | --- | --- |
| 1 | Catalog classified | 32 catalog entries | Every entry has id, kind, family, source status in ledger | **PASS** — 32/32 runnable |
| 2 | Examples classified separately | 30 examples | Marked composed-example, not registry templates | **PASS** — 30/30 |
| 3 | Tool inventory | required core tools | Exists + role noted; adapter-only / design.json-only labeled | **PASS** — see ledger `tools` + baseline |
| 4 | Release identity reconciled | install, origin/main, worktree | Same SHA or divergence explained | **PASS** — all `12dd271` |
| 5 | Destination map | 15 required destinations | Listed without claiming verify receipt | **PASS** — listed; verify **not** claimed |
| 6 | Support boundary declared | v1 stacks + deferred + consumer owns | Written and machine-readable | **PASS** — SUPPORT.md + ledger |
| 7 | Expert briefs frozen | 12 learning + 8 held-out | File present; held-out `sealedUntil: phase-5`; validate-briefs ok | **PASS** |
| 8 | Pilots selected | 1 conventional + 1 Alexis | Acceptance sketches written | **PASS** |
| 9 | Baseline + known failures | reproducible receipt | Agent limits and contract test recorded; missing evidence visible | **PASS** — `baseline.json` |
| 10 | Case schema | unit tests | `verify/case.test.mjs` exit 0 | **PASS** |
| 11 | Knowledge seed | ≥12 principles + retrieve test | `verify/knowledge.test.mjs` exit 0 | **PASS** |
| 12 | Records pilot store | fail/retry | `verify/records-pilot-store.test.mjs` exit 0 | **PASS** |
| 13 | Doctor wires new tests | doctor invokes case/knowledge/records-pilot | Source contains the checks | **PASS** |
| 14 | Case↔knowledge flow | `verify/case-flow.test.mjs` | Pilot case opens at choose with principles | **PASS** |
| 15 | Records pilot UI fixture | `benchmark/records-pilot/index.html` | List/edit/save/fail/retry against store | **PASS** (fixture; not browser CI yet) |
| 16 | Branch commit | feat branch | Changes committed on `feat/shine-expert-agent-phase0` | **PASS** (this slice) |
| 17 | Full doctor / distribution verify | release DoD | Out of Phase 0 scope | **N/A** — not claimed |

## Explicit non-claims

- No `delivered` / distribution complete claim.
- No Phase 1 judgment-eval pass.
- No real consumer E2E persist proof beyond the in-memory pilot store.
- No Alexis multimodal runtime.
- `shine-native-core` remains non-authority.

## Continue-after-DoD

Next authorized slice: Phase 1/2 kickoff — wire case+knowledge into the operating loop, grow principles, build records pilot UI against the store, keep held-out briefs sealed.
