# ClearSpeed Operate constitution (enterprise §3)

Numbered edition principles that ride on every SaaS / denoise Design Decision
Record. The critic must cite them.

## Catalog

`knowledge/constitutions/clearspeed-operate.json` — edition id `clearspeed-operate`.

| # | ID | Rule |
|---|---|---|
| 1 | `cta-pressure` | Exactly one filled primary in main |
| 2 | `dual-focal-ban` | No peer worklists for one job |
| 3 | `kpi-soup-off-path` | KPI encyclopedia off the decide path |
| 4 | `primary-task-3s` | Stranger starts the job in ~3s |
| 5 | `cite-honesty` | Page cite matches category |
| 6 | `prove-mandatory` | Fresh prove receipt linked to `ddrId` |
| 7 | `restructure-before-repaint` | No polish while structure red |

Anti-pattern library rows (`knowledge/anti-patterns/*.json`) point back via
`constitutionIds`.

## Packet / DDR

`core/ddr.mjs` → `buildDdr` resolves the edition through `core/constitution.mjs`:

```json
{
  "constitutionEdition": "clearspeed-operate",
  "constitutionIds": ["cta-pressure", "dual-focal-ban", "…"],
  "constitution": [
    { "n": 1, "id": "cta-pressure", "title": "…", "rule": "…" }
  ]
}
```

## Critic cite gate

`core/reflexion.mjs` prompts with the numbered list and **fail-closes** when a
`partial` / `blocked` turn cites none of the packet ids (id or principle number).
Host wiring: `core/critic-actor-host.mjs` + `verify/denoise-loop.mjs` pass
`packet.ddr.constitution`.

## Prove receipts

`verify/prove.mjs` stamps `constitutionIds` + `constitutionEdition` onto the
completion receipt (`hooks/receipt.mjs`) alongside `ddrId`, plus the Atlas
`reflexionVerdict` (`done|partial|blocked|error`). Green prove completions stamp
`reflexionVerdict: "done"`. SaaS / denoise defaults to the full ClearSpeed Operate
catalog when `--constitution-ids` is omitted. Operate stop-sweep gaps if a
completion receipt omits the catalog ids **or** the Atlas verdict.

```sh
node verify/prove.mjs <artifact> --cite shadcn-queue --lane saas --ddr <ddrId>
# optional override:
#   --constitution-ids cta-pressure,dual-focal-ban,…
#   --constitution-edition clearspeed-operate
```

## Atlas reflexion stop stamp

`core/reflexion.mjs` → `resolveStopReflexionVerdict` / `assertAtlasReflexionVerdict`.

| Surface | Stamp |
|---|---|
| Green `prove.mjs` completion | `reflexionVerdict: "done"` |
| `denoise-loop.mjs` stop receipt | cleared → `done`; else last critic verdict; missing → `error` |

Mint and Operate gaps **fail-closed** when the field is missing or not one of
`done|partial|blocked|error`. Doctor: `verify/reflexion.test.mjs` ·
`verify/operate-prove-mandatory.test.mjs` · `verify/denoise-loop.test.mjs`.

## Edition verify bite

`verify/edition.mjs` → `verifyOperateDdrConstitution(ddr)` fails closed when a
DDR omits any catalog id (empty or partial). Doctor: `verify/constitution.test.mjs`.

```sh
node core/constitution.mjs
node verify/constitution.test.mjs
```

## Related

- Enterprise plan §3 Decision compiler — `constitutionIds[]`
- `docs/edition-siblings.md` (enterprise §4 Edition profile sibling map)
- `docs/ddr-audit-trail.md` (enterprise §5)
- `skill/references/denoise.md` · Constitution IDs
