---
name: shine
description: >-
  Design, build, or audit interfaces using real template structure, the consumer's installed
  component system, complete interaction contracts, and browser proof. Use for UI, UX,
  dashboards, tables, forms, landing pages, charts, email, Lightning, decks, PDFs, or visual polish.
---
# Shine
Build the interface directly in the current Codex task. Do not delegate to a second design agent. Shine's deterministic tools choose and verify; you supply brief-specific design judgment.
## Start with one bounded packet
Resolve this installed tree, then create the packet before planning or editing:
```sh
SKILL=$(realpath "${HOME}/.agents/skills/shine" 2>/dev/null || realpath "${HOME}/.cursor/skills/shine")
ROOT=${SHINE_ROOT:-$(dirname "$SKILL")}
node "$ROOT/core/design-packet.mjs" --job "<plain-language job>" --lane <internal|saas|lex|marketing> --mode <existing|new> --project "$PWD"
```
If the packet refuses an ambiguous job, supply the real interface category with `--category`; never accept a guessed
dashboard. Read the selected page screenshot and source, then its separate component references and matched Untitled UI
source excerpts. A component demo supplies a component, never the page structure. Do not reopen their files or load the full reference library. The packet owns the region graph, controls, states, integration, provenance and proof commands.
For new media/editorial surfaces, build from the selected source in the installed components; the spec renderer does not support these categories.
For other new standalone surfaces, put brief-specific design judgment in a small `design.json` using
`core/design-spec.mjs`, then run `node "$ROOT/core/render-spec.mjs" design.json index.html`. Every spec names a composition archetype, image strategy, signature moment, and anti-repetition
constraint. The signature must express this product's job, never generic design decoration.
For an existing product, render its real components and read `references/diagnose.md`. Complete the packet's
`shine-diagnosis.json` before editing: primary task, before artifact + screenshot, and 3–8 evidence-backed defects
across usability, completeness, composition, craft, or adoption. Preserve the product architecture.
## Product precedent outranks the catalog
For an existing product, inventory shipped sibling surfaces before accepting the external reference. Find the closest page presenting the same information object or supporting the same user job. If one exists, rerun the packet with `--product-reference <page-or-url> --product-reference-name <name>`.
The sibling owns product conventions; the catalog may fill a gap but must not replace working card anatomy, toolbar behavior, expansion, actions, states, terminology, or responsive behavior. Name the sibling and every justified divergence in the diagnosis.
Reuse or extract its component and CSS vocabulary; never create a parallel component for the same object. Mark shared shells with stable `data-product-pattern` values and run the packet's product-compare command.
Every visible icon needs a distinct semantic job: state, action, object type, or direction. If nearby text already supplies all meaning, remove it; decoration is not semantics.
## Build
- Existing surface: fix defects in diagnosis priority order; do not paint before usability and completeness are sound.
- New surface: state the information hierarchy and primary workflow in the design spec, then build; ask discovery
  questions only when missing product decisions would materially change the result.
- Preserve the consumer's installed design system. Run `integrations/resolve.mjs` before imports; follow `references/component-layers.md`: Tailwind owns styling/layout, shadcn owns controls, TanStack owns table state. Detect each independently; reuse product components.
- Use the packet’s `reusableBlocks` plan and `references/reusable-blocks.md`. Import existing product blocks first; otherwise install the matching finished registry block. Bind actual imports in `shine-reuse.json`; include its check in completion. Do not reconstruct a matching block from primitives.
- Use the packet's `implementationSelection`: inspect matching product exports first, then finished Shine blocks, then available upstream controls. Use `integrations/library-select.mjs --project <path> --job <job>` for a narrower region. Unavailable licensed source is a gap, never permission to copy or a promised installation.
- For a whole-site audit, run `integrations/surface-audit.mjs --project <path>` before reviewing pages. Write `shine-surfaces.json` covering every discovered route, control owner and required workflow state; prove it with `--contract <file> --run <base-url> --storage-state <private-file> --out <private-receipt>`. Pass `--surface-contract` and `--surface-receipt` to completion. Route readiness is baseline evidence only; declare and exercise interaction, error and recovery states for the workflows under review. Missing, stale, disconnected or wrong-build evidence fails.
- Track installed registry blocks using `integrations/upgrade.mjs --project <path> --track <block-id> --path <installed-source>`. Review upgrades without `--apply`; applying checks compatibility and performs a three-way merge. Conflicts leave all sources unchanged. Run `integrations/compatibility.mjs --project <path> <installed-sources>` for aliases, dependency, named-export, Tailwind prefix and token checks, then verify actual rendered themes.
- Read the packet's separate reference, finished-block and finished-page counts. Classify every finished pattern in `shine-coverage.json` using `integrations/coverage.mjs`; bind existing product sources or explain an absent workflow. Include the packet's `--coverage` flag in completion. Raw control census is review evidence, not automatic behavioral proof.
- For a new list, detail, settings, report or approval page, install the matching finished page template and supply its data/callback contract. Use the working examples at `https://shine-blond.vercel.app/library/`; preserve an existing product page when it already owns the job.
- For tables with **more than 10 total rows**, keep meaningful KPIs or an infographic above an adjacent collapsed detail table. Count the full dataset, not the visible page. Follow `references/table-summary.md` for state, accessibility and drill-down.
- Use `server-data-grid` for partial remote datasets, `saved-views` for URL/named views and `csv-import` for validated imports. The client grid never sorts or counts a partial server page as the full population. Use `chart-panel` and `dashboard-page` for units, legends, read states and source drill-down.
- For record data, reuse the product's shared DataGrid and installed table-state engine.
  Read `references/table-quality.md` and write `shine-tables.json`: shared source, approved
  sibling table, and executable scenarios. Measure and compare both enforce it, including
  tables nested in dashboards. Primitives, hidden state markers, and changed sort arrows
  are not proof. Search, sort, filters, columns, pagination, actions, states, and keyboard
  must work; bulk actions also require selection. Static presentation needs an explicit reason.
- Use the selected template's region structure, not its sample copy. Make the decision data,
  content, and interaction specific to this job.
- Cap a shortlist at one page per visual family. Pages outrank atoms: component demos may fill
  a named region, but they never supply the page silhouette. Use citation history to avoid
  repeating the previous output's family or signature device.
- Put the selected id on the artifact as `data-cite`. Use existing tokens; fill genuine token gaps
  in Shine's source rather than hardcoding around them.
For decks, PDFs, reports, and email, read `references/cross-media.md` and choose the output-native
lane. Preserve the hierarchy and evidence; a website screenshot pasted onto a slide is not a deck.
Only when the packet cannot answer a genuinely advanced requirement, read one focused reference:
`references/contracts.md`, `references/interaction.md`, `references/adoption.md`,
`references/cross-media.md`, or `references/salesforce.md`. Ordinary tables, forms, and page
structures need none of them.
## Prove
Exercise the primary workflow in the rendered product. Run the packet's measure command until it
exits zero, run product compare when the packet names a product precedent, then run catalog compare. These are partial checks; finish with the packet’s completion command. A receipt is generated only by the verifier;
never create or edit one. Report the selected template, component implementation, workflow result,
measure facts, screenshot, receipt, and anything not completed.
Use the packet's exact `verify/measure.mjs` and `verify/compare.mjs` invocations; do not rebuild flags.
After choosing the reference template, read `references/usability.md`. Before painting, write
`shine-usability.json` beside the surface: map each user-facing object to the selected reference
role and express the primary job as browser steps. Run `node verify/usability.mjs <url|page>
--contract shine-usability.json --cite <selected-template>` after measure and before compare.
Do not claim usability from contrast, axe or visual comparison. Static dashboards, decorative controls and flows without observable changes fail.
## Layout and completion proof
For broadcast/video use media; for publications use editorial. A chat demo cannot supply TV structure. Reject quarantined references; legacy `not_tested` captures need validated recapture, never manual relabeling. Read `references/media-layout-proof.md`; write `shine-layout.json` for narrow through wide widths, long content, missing images, loaded media and enlarged text. Measure frame, caption, controls and unused space together; media never exempts its wrapper.
Bind critical/major diagnosis defects to executable layout assertion ids or `flow:<id>`. Run the packet’s completion command. Only `verify/prove.mjs` issues overall completion proof: every required category must pass; `not_tested` is incomplete. Browser proof requires a clean source commit and matching rendered commit/build identity.
Inspect narrow and wide screenshots. Synthetic loading proves geometry, not provider playback or script quality. Separately review spoken summaries for complete sentences, source fidelity and distinction from written coverage; report limitations.
Skill changes must satisfy `references/distribution-dod.md` and every destination in `../distribution.json`; source merge or local install alone is not delivery.


This guidance download does not include Node tools. Executable verifiers require the full repository install. Never claim executable completion from this file alone.
