# Changelog

All notable changes to Shine are documented here. Public releases follow [Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [3.0.0] — 2026-09-01

Shine V3 replaces self-attested visual similarity with executable proof: real
template source and screenshots, browser-tested usability contracts, measured
comparison, and editor hooks whose failure paths are themselves verified.

### Removed

- **MUI, Ant Design Pro and IBM Carbon are deleted from the corpus** (see
  [docs/no-foreign-runtimes.md](docs/no-foreign-runtimes.md)). 17 catalog rows,
  15 harvested packs, 4 corpus clones and pins, 3 voice sheets
  (`material.css`, `ant.css`, `carbon.css`), 7 fixture runtime dependencies, and
  every reference that pointed at them. Not retired — gone. Both consumers are
  shadcn/Tailwind repos, so a page on a foreign runtime could only ever teach
  costume. Catalog: 144 rows → 128; kits: 16 → 12.
- `verify/fixtures/integrations` no longer installs `@mui/*`, `@carbon/react`,
  `antd` or Emotion. It builds the two recipes Shine supports — shadcn/TanStack
  and a new `native` semantic-table view — and its lockfile carries 74 packages
  with zero foreign entries.

### Added

- `shadcn-weekly-board` is now a complete authored blueprint pack: copyable
  shadcn source, executable owner/outcome workflow, kit tokens, provenance
  manifest, and a captured reference. Its required `compare.mjs` proof now exits
  zero for a conforming artifact instead of refusing the intentionally absent
  screenshot.
- `corpus/blueprints/shadcn-blog.md` — the blog screen's only row was MUI's;
  deleting MUI would have deleted the screen. Doctor fails if it goes missing.
- `templates.md` marks every retired row **retired** and lists the reasons under
  the table. A retired row used to be indistinguishable from a live one in the
  reference the agent actually reads.
- `verify/art-direction.test.mjs` asserts by name that the 5 deleted kits and 17
  deleted ids never reappear in the catalog.
- `--shine-text-base` / `--shine-text-sm` in `untitled.css` — the one voice sheet
  missing them, so Untitled-painted pages fell back to browser defaults.

### Fixed

- Updated the Cursor SDK and pinned its transitive HTTP client to the patched
  `undici` 6.28.0 release, clearing all three root npm audit findings.
- Compare recognizes compact peer-control navigation such as a weekly owner
  roster, while retaining a width floor that prevents incidental links from
  satisfying a page navigation contract. The proof matrix now carries positive
  `shadcn-weekly-board` and `shadcn-dashboard-01` cases, and the dashboard fixture
  binds its cite and summary at the document contract boundary.
- **Every editor hook was dying at runtime.** `skill/run-hook.sh` resolved its
  root with a logical `cd ..`, and every surface invokes it through a symlink, so
  it walked the *link's* parent: `~/.agents/skills/verify/doctor.mjs`,
  MODULE_NOT_FOUND, on all three surfaces. The doctor read the hook config and
  called the wiring green. It now runs the real command through the real link.
- **Four voice sheets shipped an action colour that failed AA against its own
  label**, found by generalising the contrast test from one sheet to all ten:
  `mantine` 3.56:1 → 5.02:1 (blue[8]), `slds` 2.19:1 dark → 4.67:1
  (`accent-container-1` is the Brand-button fill; `accent-2` is the ink hook),
  `spectrum` 2.19:1 dark → 5.39:1 (indigo-900 in both modes), `tremor` 3.68:1 →
  5.17:1 (blue-600). The test now runs every sheet in every mode it declares and
  asserts a shared core role set.
- `measure.mjs` likeness rules keyed off `family === "carbon"`; they now key off
  the cited row's jobs, so any records/table cite is held to them.
- `integrations-bite.mjs` still scaffolded `mui`/`carbon`/`ant` after those
  recipes were retired on 2026-08-29 — a `doctor:full` check that had been red
  and unreported since.
- Required-screen coverage is computed by job, not by the `screen` field, and the
  shot check now reports which screens are structure-only (region map, no
  harvested pixels): marketing, checkout, wizard.

### Added

- Framework-aware MUI, Carbon, Ant, shadcn/TanStack, native, and LEX integration recipes with installed-kit preservation, API provenance, and executable scaffolding.
- Deterministic template dependency closures with pinned upstream provenance, per-file hashes, structural signatures, and query-only source restrictions; MUI and Ant CRUD packs now carry their real grid pages.
- Executable DataGrid contract: native tables and ARIA grids are discovered automatically, interactive sort/filter/page controls must change rendered state, and every default capability has a seeded fail/pass proof.
- House and kit voices all carry `--shine-color-*` (shine, magicui, spectrum, fluent, mantine, slds, plus heroui and tremor). Doctor fails any colorless sheet, not just the favoured four.
- Harvested shots for `spectrum-ai-chat`, `antd-pro-chatbot`, and the LEX blueprints (SLDS vendor pages). `corpus/blueprints/lex-*.md` is the region map.
- `cite.mjs "lightning record"` resolves to `lex-record`. Doctor asserts it.
- Every required screen type now has a pack shot. Doctor asserts that too.

### Changed

- Magic UI / Tremor / HeroUI harvest URLs are component/docs routes, not marketing homepages.
- Fluent pack source is `NavDrawer.tsx`, not type barrels.
- Public copy no longer says “41 real templates.” `--ci` is 69.

### Added

- Packs carry readable `source/` and kit `tokens.css` next to the harvested shot; `cite.mjs` lists those, not a dump of `~/design-corpus`
- `compare.mjs` exits 1 when measured facts prove the page is not a relative of the cite (attribute-stamp vs carbon-datatable is the seed)
- Compare receipts bind to exact artifact content and template pixels, and are minted only after a passing verdict.
- Stop-sweep cite gate: a UI page written this turn needs `data-cite` (or `<!-- cite: id -->`)
- `skill/run-hook.sh` so Cursor/Claude hooks follow the loaded skill symlink
- Prove receipt: `compare.mjs` writes `last-prove.json`; stop-sweep blocks a cited page with no matching compare this turn
- Zinc-on-carbon fixture: table + `data-cite="carbon-datatable"` + zinc voice — compare exits 1
- Doctor fails if `~/Projects/shine-live` exists (skills load shine-deploy only)
- Phase 4 e2e: live Brutus session before/after under `verify/fixtures/e2e/brutus-session/` (`shadcn-dashboard-01`)

### Changed

- Skill is a loader: parent `Task`s `shine-ux` and does not freelance the loop
- Cite/measure/compare resolve from the loaded skill realpath, not a hardcoded checkout
- Public `--ci` count tracks the `--ci` run (now 76)
- Doctor fails a hardcoded `Projects/shine*` tool path, a skill over 80 lines, deploy drift off `main`, and sessionStart `|| true`
- README install uses `$SHINE` (detached `origin/main` worktree) and a fail-closed doctor
- Stop-sweep no longer fail-opens on a lint crash, a git error, or a missing hook payload

### V3 foundation — 2026-08-21

Shine V3 is the unfuck. An audit (docs/audit-2026-08-21.md) measured V2's retrieval layer
as fiction: the DNA packs were generated placeholder stubs, the critic scored "likeness"
by grepping page source for data-* attributes (a one-button page scored 10/10 against the
Carbon datatable), the voice sheets carried zero colors while the lint banned raw color
values — so kit paint was unexpressible — and the executor hardcoded a stale pre-V2
checkout. V3 deletes the theater and makes retrieval real.

#### Removed

- `verify/critic.mjs` — the regex likeness gate trained attribute-stamping; kept as a
  regression: `verify/fixtures/attribute-stamp.html` must never be blessed by anything
- `corpus/packs/*` stub specimens, `corpus/pack.mjs`, `corpus/dna-families.json`
- `skill/references/inspiration.md` (the mandatory row-authoring detour) and the cite
  liturgy — `images_read`, "naming an id you did not open is inventing", pack-PNG
  instructions for PNGs that never existed
- The 141-row catalog flood: 71 chart demos, wildcard sidebars/logins, and the
  self-citing `lex-*`/`shine-*` rows that pointed at shine's own generated stubs

#### Added

- `corpus/cite.mjs` v2 — plain-words matching ("settings page" resolves), ≤3 results,
  registry JSON auto-extracted to readable `.tsx` under `corpus/extracted/`, pack shots
  and kit token sheets surfaced as they land
- `verify/compare.mjs` — side-by-side composite of your page and the template's
  harvested shot, plus measured facts (fonts, heading sizes, radii, palette). No score,
  no verdict; refuses to run without real pixels
- Doctor: packs must carry real full-page shots (≥30KB) or report honestly as
  unharvested; compare honesty checks; cite synonym checks; no-liturgy invariants

#### Changed

- SKILL.md rewritten around **look → name → match → restructure → repaint → prove**;
  the rendered page is read before it is diagnosed
- Kit paint is legal: values live in custom-property definitions (voice sheets, pack
  `tokens.css`, or the page's token block); usage sites say `var(--…)`
- `verify/measure.mjs` likeness checks key off the `--cite` flag + catalog family,
  never off page attributes; the data-cite attestation failure is gone
- Catalog regenerated: 41 curated rows, every one a real composed screen, component
  set, or an honest `blueprint` row (LEX)
- Slop lists and "2026 defaults" downgraded from bans to lane-relative guidance — the
  template's real pixels are the anti-slop mechanism

### Phase 2 (same day)

- `corpus/harvest.mjs`: 26 packs harvested — full-page screenshots of the REAL screens
  (shadcn /view routes, MUI live templates, Ant Pro preview, Carbon storybook, Magic UI,
  Mantine, Fluent, Tremor, HeroUI), each with `meta.json` provenance. Skips are named,
  never silent (LEX blueprints and Spectrum ai-chat have no public renderable target).
- Voice sheets carry real paint: carbon/shadcn-zinc/material/ant hold the kits' actual
  colors, verified against pinned sources and cited per value; mantine/fluent carry
  verified primaries; slds maps onto org-measured styling hooks.
- Doctor: packs must hold ≥30KB real shots (seeded-violation proven), voice sheets must
  carry ≥5 color tokens for the four full kits (seeded-violation proven), compare's live
  run stays verdict-free even on the attribute-stamp fixture.

## [2.0.0] — 2026-08-21

Shine V2 is a **visual director**, not a completeness-only auditor. V1 could retrieve a catalog id and still paint every screen as the same zinc dashboard. V2 ships DNA packs the agent must open, executable voice CSS, a critic that fails a Carbon cite in Geist chrome, and Salesforce host lanes.

### Added

- Visual DNA packs under `corpus/packs/<id>/` (`dna.json`, `regions.json`, `remap.json`, `notes.md`, `specimen.html`) generated by `corpus/pack.mjs`
- `verify/critic.mjs` — likeness to the pack, named 2026 slop classes; Carbon-as-zinc **fails**
- `tokens/voices/<family>.css` — kit-faithful remaps that actually change `--shine-*`
- `skill/references/direction.md` — lanes, `DESIGN.md`, uniqueness pass
- `skill/references/layout.md` and `interaction.md`
- Lightning catalog rows: `lex-record`, `lex-record-narrow`, console, queue, LWR, email, mobile
- Design-lint family **slop** (cream `#F4F1EA`, indigo defaults, purple glow) that cannot be pragma-exempted
- Measure: walk `shadowRoot`, refuse 0/0; empty `--slds-*` hooks are findings

### Changed

- `/shine` and `shine-ux` require opening pack specimens and reporting `images_read`
- Wireframe lock writes `DESIGN.md` with lane + cite + signature
- `cite.mjs` prints pack paths and voice CSS
- Doctor fails if `startFrom: 1` rows lack packs
- Salesforce reference names the **host**, not only the palette

### Honest limits

- Completeness still beats a Behance poster. Measure stays the compliance gate; critic is the taste/likeness gate.
- SigLIP embeddings are optional (`SHINE_SIGLIP`); the default critic is structural DNA + slop, not a hosted VLM.
- Marketing pipelines stay off Lightning record pages.

[3.0.0]: https://github.com/justinfowler925/shine/releases/tag/v3.0.0
[2.0.0]: https://github.com/justinfowler925/shine/releases/tag/v2.0.0
