---
name: shine
description: >-
  Design, build, or audit interfaces using real template structure, the consumer's installed
  component system, complete interaction contracts, and browser proof. Use for UI, UX,
  dashboards, tables, forms, landing pages, charts, email, Lightning, or visual polish.
---

# Shine

Build the interface directly in the current Codex task. Do not delegate to a second design
agent. Shine's deterministic tools choose and verify; you supply brief-specific design judgment.

## Start with one bounded packet

Resolve this installed tree, then create the packet before planning or editing:

```sh
SKILL=$(realpath "${HOME}/.agents/skills/shine" 2>/dev/null || realpath "${HOME}/.cursor/skills/shine")
ROOT=${SHINE_ROOT:-$(dirname "$SKILL")}
node "$ROOT/core/design-packet.mjs" --job "<plain-language job>" --lane <internal|saas|lex|marketing> --mode <existing|new> --project "$PWD"
```

If the packet refuses an ambiguous job, supply the real interface category with `--category`; never accept a guessed
dashboard. Read the selected page screenshot and source, then its separate component references and matched Untitled UI
source excerpts. A component demo supplies a component, never the page structure. Do not reopen their files
or load the full reference library. The packet is authoritative for the region graph, controls, states,
integration, provenance, and proof commands.
For a new standalone surface, put brief-specific design judgment in a small `design.json` using
`core/design-spec.mjs`, then run `node "$ROOT/core/render-spec.mjs" design.json index.html`.
The renderer owns repeated contract mechanics; the spec owns hierarchy, copy, data, and direction.
For an existing product, render its real components and read `references/diagnose.md`. Complete the packet's
`shine-diagnosis.json` before editing: primary task, before artifact + screenshot, and 3–8 evidence-backed defects
across usability, completeness, composition, craft, or adoption. Preserve the product architecture.

## Build

- Existing surface: fix defects in diagnosis priority order; do not paint before usability and completeness are sound.
- New surface: state the information hierarchy and primary workflow in the design spec, then build; ask discovery
  questions only when missing product decisions would materially change the result.
- Preserve the consumer's installed design system. Run `integrations/resolve.mjs` before imports.
- For record data, use the resolved production DataGrid recipe. Every data grid includes search,
  sorting, filters, column visibility, pagination, selection, row actions, and loading/empty/error
  states. A hand-built table is allowed only for static presentation or a framework-free page.
- Use the selected template's region structure, not its sample copy. Make the decision data,
  content, and interaction specific to this job.
- Put the selected id on the artifact as `data-cite`. Use existing tokens; fill genuine token gaps
  in Shine's source rather than hardcoding around them.

Only when the packet cannot answer a genuinely advanced requirement, read one focused reference:
`references/contracts.md`, `references/interaction.md`, `references/adoption.md`, or
`references/salesforce.md`. Ordinary tables, forms, and page structures need none of them.

## Prove

Exercise the primary workflow in the rendered product. Run the packet's measure command until it
exits zero, then run compare as the final write. A receipt is generated only by the verifier;
never create or edit one. Report the selected template, component implementation, workflow result,
measure facts, screenshot, receipt, and anything not completed.

The packet supplies the exact invocations of `verify/measure.mjs` and `verify/compare.mjs` for
its selected template; use those commands rather than reconstructing their flags.

## Usability is executable, not inferred from craft

After choosing the reference template, read `references/usability.md`. Before painting, write
`shine-usability.json` beside the surface: map each user-facing object to the selected reference
role and express the primary job as browser steps. Run `node verify/usability.mjs <url|page>
--contract shine-usability.json --cite <selected-template>` after measure and before compare.
Do not claim a screen is usable because it passes contrast, axe, or a visual comparison. A static
dashboard, a decorative capture control, or a flow that does not change observable state fails.
