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
| `action` | `mint-ddr`, `accept-ddr`, `implement`, `measure`, `prove`, `critic`, `reflexion`, `supersede`, `learn-commit` |
| `observation` | `measure-result`, `prove-result`, `critic-verdict`, `receipt-linked`, `superseded`, `error` |

## Run

```sh
npm run audit -- init --ddr ddr_example_001
npm run audit -- append --ddr ddr_example_001 --kind action --type accept-ddr \
  --payload '{"status":"accepted"}'
npm run audit -- link-receipt --ddr ddr_example_001 --receipt ~/.cache/shine/last-completion.json
npm run audit -- supersede --from ddr_old --to ddr_new --reason "category clarified"
npm run audit -- show --ddr ddr_example_001
node verify/audit-trail.test.mjs
```

Use `--dir <path>` in tests or to pin a project-local audit root.

## Rules

1. **Append-only** — never edit or delete prior `events[]` rows.  
2. **Supersede ≠ edit** — close the old trail (`status: superseded` + `supersededBy`), open a successor with `supersedes`.  
3. **Prove link** — `linkProveReceipt` records `observation:receipt-linked` and sets tip `proveReceiptHash` (content-addressed).  
4. **Refuse writes** on superseded trails (append on the successor).

## Non-goals

- Full OpenHands runtime / event-sourced harness (plan: after ACI is sharp)  
- Preference / RLAIF labels in the log  
- Rewriting accepted DDR decision fields in place
