# Phase 0 — support boundary and identity

Work item: `540fff5d-9b21-4aef-9fb4-3eaac06e9183`  
Roadmap: Fowler Brain `strategy/plans/2026-09-22-shine-expert-saas-system-roadmap.md`  
Machine ledger: [`capability-ledger.json`](./capability-ledger.json)

## Identity (observed)

| Fact | Value |
| --- | --- |
| Package | `4.0.2` |
| Installed release SHA | `12dd2714a3de0ad40b96922a985bf05f68493021` |
| `origin/main` | same SHA — install matches main |
| Clearspeed edition | present under `~/.local/share/shine/editions/12dd271…-clearspeed-…` |
| Catalog | **32** entries (26 blocks + 6 pages), all source-present |
| Examples | **30** composed examples (not extra registry templates) |
| Corpus templates | **216** rows |
| Distribution destinations | **15** required |
| Not release authority | `~/Projects/shine-native-core` on `fix/shine-native-core` |

Doctor, full browser suites, and distribution readback were **not** re-run as release proof. Counts come from source inspection; contract tests in `baseline.json` used a worktree `node_modules` symlink to the installed release.

Phase 0 DoD: [`DOD.md`](./DOD.md). Baseline receipt: [`baseline.json`](./baseline.json).

## V1 support boundary

**In scope:** React/TypeScript web apps using the consumer’s existing shadcn-compatible controls and Tailwind setup.

**Deferred at current level only:** Lightning/lex, native, other stacks — do not multiply stacks before reliable delivery on one.

**Consumer owns behind adapters:** auth, billing, databases, business policy, provider media pipelines.

**Shine owns:** task understanding, design judgment, pattern/component selection, implementation inside the product architecture, verification, upgrade tracking, delivery evidence.

## Eight workflow families

| Family | Catalog coverage (entries) |
| --- | ---: |
| workspace-navigation | 4 |
| records-search | 10 |
| forms-validation | 5 |
| approvals-async | 4 |
| imports-files-media | 3 |
| reporting-drilldown | 4 |
| membership-settings | 1 |
| ai-collaboration | 1 |

Coverage here means catalog presence, not end-to-end “complete” packs with adapters, proofs, and upgrade baselines.

## What already exists (extend, do not recreate)

- Design packet, diagnosis, design-spec/render-spec
- resolve / library-select / blocks / readiness / coverage / compatibility / upgrade
- measure / usability / compare / prove / doctor / completion receipts
- surface-audit, scaffold (**adapter-only**)
- agent-production benchmark (**design.json-only** — not real feature delivery)
- `benchmark/briefs.json` — 24 design-spec briefs (separate from the expert 12+8 set)

## Blocking gaps for the upgrade

1. ~~No `knowledge/` principle-record system~~ → seed present (grow toward 30–40 in Phase 1)
2. ~~No resumable implementation **case** schema~~ → `core/case.mjs` present; packet integration still thin
3. Agent benchmark cannot edit a real consumer app (**still blocking**)
4. ~~Expert brief set not frozen~~ → `benchmark/expert-briefs.json` sealed
5. Alexis shared multimodal state contracts not in core (**still later**)
6. Records pilot UI / product consumer E2E not built (**next slice**)

## Pilot tasks (selected)

| Role | Id | Acceptance sketch |
| --- | --- | --- |
| Conventional | `records-inspect-edit-persist` | List → open → edit → save through a real adapter; failed save retains draft; retry works |
| Alexis multimodal | `alexis-chart-why-this` | Ask → chart+sources → click point → “why this?” → interrupt → edit filter → type → retry → resume without lost draft |

See [`pilot-tasks.md`](./pilot-tasks.md) and [`../benchmark/expert-briefs.json`](../../benchmark/expert-briefs.json).
