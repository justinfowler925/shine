# ClearSpeed Operate edition sibling map (enterprise §4)

Machine-readable map from ClearSpeed Operate jobs to **Nucleus / Sled Capture**
product siblings used for cite + kit selection.

## Catalog

`knowledge/editions/clearspeed-operate/siblings.json` — edition id
`clearspeed-operate`.

Matching order (plan §3): **product sibling first → kit recipe → cite shot**.

| Sibling id | Route | Preferred cite | Kit |
|---|---|---|---|
| `sled-capture-queue` | `/revops/sled` | `shadcn-queue` | worklist-first DataGrid (N9) |
| `sled-capture-sources` | `?sledTab=sources` | `shadcn-settings` | settings / Form MUST |
| `sled-capture-usul` | `?sledTab=usul` | `shadcn-dashboard-01` | gap worklist focal |
| `sled-capture-signals` | `?sledTab=signals` | `shadcn-queue` | read-only feed grid |
| `sled-capture-record` | Capture detail / Pursue | `shadcn-record` | RecordDialog |
| `sled-capture-goals` | `?sledTab=goals` | `shadcn-dashboard-01` | KPI attrs (not triage) |
| `nucleus-company-tools` | `/company-tools` | `shadcn-catalog` | Company Tools wins |
| `nucleus-admin-adoption` | Admin Adoption | `shadcn-dashboard-01` | table-summary |
| `sled-agent-guide` | `/company-tools/sled-agent` | `shadcn-catalog` | install → one state |
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

- Enterprise plan §4 — Edition profile (constitution IDs, tokens, **sibling map**)
- `docs/operate-constitution.md` (enterprise §3)
- `skill/references/clearspeed/profile-instructions.md`
- Principle `sibling-before-catalog`
