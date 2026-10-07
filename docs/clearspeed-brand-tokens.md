# ClearSpeed brand tokens (S7)

## Authority chain

| Layer | Role |
| --- | --- |
| **Claude Design** | Narrative / visual SSOT — [design project](https://claude.ai/design/p/555a765e-34c0-4b2c-acae-a9ba7e577005?via=share) (auth-gated) |
| **clearspeed-brand plugin** | Cowork / Cursor skill snapshots (`refresh.sh`); not a git repo |
| **`skill/references/clearspeed/brand.json`** | Shine-owned ClearSpeed **machine** seam (edition overlay, `#ED5925`) |
| **`skill/references/clearspeed/brand-tokens.json`** | Generated kit for writers / drift — emit via `scripts/sync-tokens.mjs` |

Public Shine `tokens/dist/brand/` stays the **placeholder** indigo lane (`#4338ca`) on purpose. Only the private ClearSpeed edition is recolored (`docs/clearspeed-edition.md`).

## Retired generator

The old `~/Projects/clearspeed-brand/sync-tokens.mjs` (unguarded copy also lived only in fowler-brain `scripts/session-2026-08-31/`) pointed at:

- `$HOME/Projects/shine/tokens/dist/clearspeed/office.json` — checkout name + lane **do not exist**
- `$HOME/Projects/shine-native-core/tokens/dist/clearspeed/office.json` — same missing lane

It treated Shine tokens as machine authority. That premise is **retired**. Do **not** recreate `tokens/dist/clearspeed/office.json`, and do **not** feed `tokens/dist/brand/office.json` into any brand kit (placeholder indigo).

## Shine command

```sh
node scripts/sync-tokens.mjs           # emit brand-tokens.json from brand.json
node scripts/sync-tokens.mjs --check   # fail if committed kit drifts
```

Optional plugin refresh when a local plugin tree exists:

```sh
CLEARSPEED_BRAND_ROOT=~/Projects/clearspeed-brand node scripts/sync-tokens.mjs
# or default auto-detect of ~/Projects/clearspeed-brand
```

Doctor bite: `npm run sync-tokens:test`.
