# No foreign runtimes: deleting MUI, Ant Design Pro and Carbon

**2026-08-31.** Fifteen harvested packs, four corpus clones, three voice sheets,
seventeen catalog rows and every reference that pointed at them are gone from
disk. This is the note that says why, what it cost, and what the deletion caught
on the way out.

## The defect

Shine's whole claim is that an agent should start from a page that already solved
the job — open it, read its regions, keep its structure, paint with its tokens.
That claim holds only if the page can actually be built in the repo the agent is
standing in.

Both consumers of this skill are shadcn/Tailwind repos. MUI, Ant Design Pro and
IBM Carbon each carry their own runtime, their own theming layer and their own
component APIs. Their pages cannot be built in either consumer. So every time the
catalog handed one of them over, the only thing an agent could take was the look:
copy the appearance, skip the mechanism. That is the definition of costume, and
costume is the failure the loop exists to stop. The catalog was teaching the thing
the doctor fails.

The single-source-corpus change on 2026-08-31 morning (`docs/single-source-corpus.md`)
made shadcn the house kit and marked nine of those rows `selectable: false`. That
was the soft lane, and it was not enough. A retired row is still a row: it is
printed in `templates.md`, an agent reading the table can still see
`mui-dashboard` under app-shell, and nothing stops it citing the id by hand. The
retirement mechanism is right for a pack worth keeping as a regression fixture. It
is the wrong mechanism for a kit that should never be reachable.

## What was deleted

| Kind | Count | What |
| --- | --- | --- |
| Catalog rows | 17 | 8 MUI (6 source + 2 query-only), 7 Ant Design Pro, 2 Carbon |
| Harvested packs | 15 | shots, vendored source, kit tokens, provenance manifests |
| Corpus clones | 4 | `mui-material`, `ant-design`, `ant-design-pro`, `carbon` — unpinned in `corpus.lock`, unclone in `acquire.sh` |
| Voice sheets | 3 | `material.css`, `ant.css`, `carbon.css` |
| Runtime deps | 7 | `@mui/material`, `@mui/x-data-grid`, `@carbon/react`, `@ant-design/pro-components`, `antd`, and the two Emotion packages they pulled |

The catalog went from 144 rows to 128, and from 16 kits to 12. The integration
fixture that used to install four production libraries now installs one, and
proves the two recipes Shine actually supports — shadcn/TanStack and native.

`base-ui` stays, and the distinction matters: it is headless, it is what shadcn
builds on since 2026-07, and it ships no paint. The rule is not "nothing from a
big vendor". The rule is **no foreign runtime**.

## What it cost, stated plainly

- **Three required screens lost their pixels.** marketing, checkout and wizard
  were covered by `mui-marketing-page`, `mui-checkout` and `antd-pro-step-form`.
  They are now region maps: structure, host facts, and a do-not list, with no
  harvested shot to compare against. `verify/doctor.mjs` names them as
  structure-only on every run rather than passing them quietly, and
  `verify/compare.mjs` has nothing to compare, which the blueprints say out loud
  instead of reporting a likeness number.
- **The blog screen nearly disappeared.** `mui-blog` was its only row. A screen
  with no row is the catalog hole `references/diagnose.md` rates Critical — the
  condition under which an agent invents a page. `corpus/blueprints/shadcn-blog.md`
  now carries it, and a doctor check fails if the row goes missing again.
- **Dependency-closure coverage thinned.** The two packs that exercised the
  closure walker on real multi-file React trees were MUI's and Ant's.
  `untitled-table` is the remaining entrypoint-declared source pack; the walker's
  cycle and missing-entrypoint behaviour is still proven synthetically.
- **This site changed clothes.** The public page cited `mui-blog` and painted
  Material. A page may not cite a row that does not exist, so it was re-cited to
  `shadcn-blog` and repainted from the zinc ramp. The demo pair was re-rendered:
  the "directed" screenshot now cites `untitled-table`.

## What the deletion caught

Every check written *around* these kits had to be re-pointed, and several turned
out to be anecdotes wearing a check's clothes.

**The contrast law was proven on one sheet.** `verify/voice-contrast.test.mjs`
read exactly one file — `ant.css` — and asserted three hand-written facts about
Ant's palette. Deleting Ant took the test with it. Rewritten to run over every
voice sheet on disk, in every mode a sheet declares, it immediately failed four
sheets that had nothing to do with the deletion:

| Sheet | Was | Measured | Now |
| --- | --- | --- | --- |
| `mantine.css` | blue[6] `#228be6` | **3.56:1** | blue[8] `#1971c2` — 5.02:1, same ramp |
| `slds.css` | `accent-2` fill + `on-accent-1` ink | **2.19:1** dark | `accent-container-1` `#066afe` — 4.67:1 |
| `spectrum.css` | indigo-500 `#52b7ff` dark fill | **2.19:1** dark | indigo-900 `#0265dc` — 5.39:1 |
| `tremor.css` | blue-500 `#3b82f6` | **3.68:1** | blue-600 `#2563eb` — 5.17:1 |

The SLDS one is the instructive failure. Salesforce's own token file documents
`accent-2` as "emphasis color for text, links, and icon color fills" and
`accent-container-1` as "background fill for ... Brand buttons. **Always pair with
on-accent-1**". The sheet filled a button with the ink token and wrote the
on-accent ink on top of it. In light mode it looked fine. In dark mode
`accent-2` resolves to brand-70 `#7cb1fe`, and white-on-light-blue measures
2.19:1. It shipped yesterday, in the change that made SLDS 2 authoritative.

**A likeness rule was keyed to a vendor name.** `measure.mjs` failed a page whose
`family === "carbon"` rendered shadcn chrome, or whose table covered less than 6%
of the viewport. Both are real rules and neither is about IBM: they now key off
the cited row's jobs, so any records/table cite is held to them.

**Voice sheets disagreed about which roles exist.** `untitled.css` was missing
`--shine-text-base` and `--shine-text-sm` — every other sheet has them — so a page
painted Untitled fell back to browser defaults for its base text. The contrast
test now asserts a core role set across every sheet.

**A full-mode check had been red since 2026-08-29.** `integrations-bite.mjs` still
scaffolded `mui`, `carbon` and `ant`, which `integrations/resolve.mjs` had stopped
supporting when the recipes were retired. It only runs under `doctor:full`, so
nothing said so.

## The rule, going forward

A kit earns a row in this corpus when a consumer can build what its page shows.
Retirement (`selectable: false`) is for a pack worth keeping as a fixture —
`tremor-charts`, `mantine-appshell`, `heroui-next-app` are retired and still on
disk. Deletion is for a kit that should never be reachable, and it means the
clone, the packs, the voice sheet, the rows and the prose all go.

`verify/art-direction.test.mjs` holds the line: it asserts by name that none of
the five deleted kits and none of the seventeen deleted ids ever reappear in the
catalog. A row an agent can read is a row an agent can imitate.
