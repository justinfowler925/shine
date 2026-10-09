# ClearSpeed Operate edition sibling map (enterprise §4)

Machine-readable map from ClearSpeed Operate jobs to **Nucleus / Sled Capture**
product siblings used for cite + kit selection.

## Catalog

`knowledge/editions/clearspeed-operate/siblings.json` — edition id
`clearspeed-operate`.

Matching order (plan §3): **product sibling first → kit recipe → cite shot**.

**TW gold:** Flowbite / TailAdmin / Untitled — `gold-standard.json`. Cite:
`node corpus/cite.mjs --edition clearspeed-operate "<job>"`.

| Sibling id | Route | Preferred cite (TW gold) | Kit |
|---|---|---|---|
| `sled-capture-queue` | `/revops/sled` | `tailadmin-tables` | worklist-first DataGrid (N9) |
| `sled-capture-sources` | `?sledTab=sources` | `flowbite-settings` | settings / Form MUST |
| `sled-capture-usul` | `?sledTab=usul` | `flowbite-dashboard` | gap worklist focal |
| `sled-capture-signals` | `?sledTab=signals` | `untitled-table` | read-only feed grid |
| `sled-capture-record` | Capture detail / Pursue | `tailadmin-profile` | RecordDialog |
| `sled-capture-goals` | `?sledTab=goals` | `tailadmin-dashboard` | KPI attrs (not triage) |
| `nucleus-company-tools` | `/company-tools` | `flowbite-products` | Company Tools wins |
| `nucleus-admin-adoption` | Admin Adoption | `flowbite-dashboard` | table-summary |
| `sled-agent-guide` | `/company-tools/sled-agent` | `flowbite-products` | install → one state |
| `sled-agent-overview` | `…/overview` | `shadcn-blog` | reference, not Operate |

Shared owners: `nucleus-datagrid`, `nucleus-record-dialog`, `table-summary`.

Ambiguous dashboard jobs **without** job cues resolve to `null` — record why
before inventing chrome. Queue / settings / catalog / record have Operate defaults.

## API

```sh
node core/edition-siblings.mjs list
node core/edition-siblings.mjs resolve \
  --category queue \
  --job "Decide Pursue/Review/Dismiss on the next notice"
```

`resolveEditionSibling` → `{ sibling, preferredCite, kitRecipe, antiCites, owners, reason, learnedPrefer }`.

Optional `learnedPrefs` (from repertoire `siblingPrefs[]`) boost proven sibling
ids so the **next packet** prefers a mapping that already resolved cite/kit.

`recommendPattern(…, { edition: "clearspeed-operate" })` applies the map:
`productSibling`, kit override, sibling anti-cites, promote preferred cite when it
is already on the shortlist, and attaches `learnedSiblingPrefer` when repertoire
boosted the pick.

SaaS design packets attach `packet.editionSibling` and set `ddr.productSibling`
when `--product-reference` is omitted. With `doctorBiteOk`, packet mint also
calls `commitSiblingLearnFromResolve` (episodic + `siblingPrefs`) — see
`docs/repertoire-learn.md`.

## Edition verify / doctor

`verify/edition.mjs` → `verifyEditionSiblingMap()` fails closed if the JSON is
missing or invalid. Doctor bite: `verify/edition-siblings.test.mjs`.

```sh
node verify/edition-siblings.test.mjs
```

## Related

- Operate redesign path (cite → measure → denoise-loop → prove): `docs/operate-redesign.md`
- Enterprise plan §4 — Edition profile (constitution IDs, tokens, **sibling map**)
- `docs/operate-constitution.md` (enterprise §3)
- `skill/references/clearspeed/profile-instructions.md`
- Principle `sibling-before-catalog`
