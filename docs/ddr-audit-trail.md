# DDR audit trail

**Bar (enterprise §5):** DDR (`ddrId`) + Action/Observation events + prove
receipt hash; supersede links, don’t rewrite history.  
**Pattern sources:** OpenHands event log · ADR · MS governance.

## Store

Per-DDR JSON under `SHINE_AUDIT_DIR` (default `~/.cache/shine/audit/`):

`{ddrId}.json` · schema `shine-audit/v1`

| Field | Role |
|---|---|
| `ddrId` | Immutable packet id |
| `status` | `active` \| `superseded` |
| `events[]` | Append-only Action / Observation log (`seq` contiguous) |
| `proveReceiptHash` | Tip SHA-256 of linked prove/completion receipt |
| `supersedes` / `supersededBy` | Forward/back links — old events stay intact |

### Event kinds

| Kind | Examples |
|---|---|
| `action` | `mint-ddr`, `accept-ddr`, `refuse-ddr`, `implement`, `measure`, `prove`, `critic`, `reflexion`, `supersede`, `learn-commit` |
| `observation` | `measure-result`, `prove-result`, `critic-verdict`, `receipt-linked`, `superseded`, `error` |

## Decision-path auto-append

Audit events are **not** manual-only. The packet decision path wires
`core/audit-trail.mjs` automatically:

| Decision | Wire | Event |
|---|---|---|
| Accept DDR | `node core/ddr.mjs accept <packet.json>` | `action:accept-ddr` (inits trail if needed) |
| Refuse DDR | `node core/ddr.mjs refuse <packet.json> [--reason …]` | `action:refuse-ddr`; packet `status: refused`, editing blocked |
| Prove completion | `verify/prove.mjs … --ddr <ddrId>` on green | `action:prove` + `observation:receipt-linked` + tip `proveReceiptHash` |

Library helpers: `recordDdrDecision`, `recordProveCompletion`.  
Pin a test/project root with `--audit-dir` (ddr CLI) or `SHINE_AUDIT_DIR`.

## Denoise-loop auto-append (opt-in)

When `SHINE_AUDIT_DIR` is set, `verify/denoise-loop.mjs` auto-appends loop
turns (beyond accept/refuse+prove) — not only manual `npm run audit`:

| Loop turn | Wire | Events |
|---|---|---|
| Measure | after each `measure.mjs` round | `action:measure` + `observation:measure-result` |
| Critic ≠ Actor | after `runCriticActorHostRound` | `action:critic` + `action:reflexion` + `observation:critic-verdict` |

Helpers: `recordMeasureTurn`, `recordCriticReflexionTurn`, `autoAppendDenoiseLoop`
(`shineAuditDirEnabled` is the env gate). Tests may pass `auditDir` to
`runDenoiseLoop` without mutating the env. Fail-closed when the opt-in is on.

## Run

```sh
npm run audit -- init --ddr ddr_example_001
npm run audit -- append --ddr ddr_example_001 --kind action --type accept-ddr \
  --payload '{"status":"accepted"}'
node core/ddr.mjs accept shine-packet.json          # auto-appends accept-ddr
node core/ddr.mjs refuse shine-packet.json --reason "wrong category"
npm run audit -- link-receipt --ddr ddr_example_001 --receipt ~/.cache/shine/last-completion.json
npm run audit -- supersede --from ddr_old --to ddr_new --reason "category clarified"
npm run audit -- show --ddr ddr_example_001
SHINE_AUDIT_DIR=/tmp/shine-audit node verify/denoise-loop.mjs --html verify/fixtures/denoise/queue-cta-before.html
node verify/audit-trail.test.mjs
```

Use `--dir <path>` / `--audit-dir <path>` in tests or to pin a project-local audit root.
Set `SHINE_AUDIT_DIR` to enable denoise-loop measure/critic/reflexion appends.

## Rules

1. **Append-only** — never edit or delete prior `events[]` rows.  
2. **Supersede ≠ edit** — close the old trail (`status: superseded` + `supersededBy`), open a successor with `supersedes`.  
3. **Prove link** — `linkProveReceipt` / `recordProveCompletion` records `observation:receipt-linked` and sets tip `proveReceiptHash` (content-addressed).  
4. **Refuse writes** on superseded trails (append on the successor).  
5. **Refused DDR** — host decision; Actor must not implement; mint a new `ddrId` to revise (do not revive).

## Non-goals

- Full OpenHands runtime / event-sourced harness (plan: after ACI is sharp)  
- Preference / RLAIF labels in the log  
- Rewriting accepted DDR decision fields in place
