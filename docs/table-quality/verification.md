# Executable table-quality gate

The old verifier accepted a `full-table.html` fixture whose row actions were inert,
whose pagination appended text to a name, and whose four state labels coexisted.
That fixture and the legacy queue are now required rejection cases.

The replacement is invoked by both `measure.mjs` and `compare.mjs`. A discovered record
table without its executable `shine-tables.json` contract fails; compare does not issue
a receipt. The bounded skill loader and design packet point directly to the contract
reference and runnable example. Doctor runs the regression matrix in its default CI lane.

## Verification

- `node verify/table-quality.test.mjs`: 29 positive and rejection cases pass, including
  the real measurement CLI, a working shared table, valid one-page pagination, installed
  TanStack resolution through a TypeScript alias/re-export, and source hash evidence.
- Mutants rejected: sort arrows without sorted records, decorative row actions, inert
  search/filters/pagination/column controls/retry, hidden loading/error states, custom
  cell styling, hidden toolbar, missing scenario/source/selection, a static exemption
  on interactive records, and headings masquerading as record assertions.
- `node verify/compare-proof.test.mjs`: receipt rejection and positive non-table proof
  paths pass. Visually improved but untested table examples now fail instead of minting
  an unsupported success receipt.
- `node verify/design-packet.test.mjs` and `node verify/workflow-contract.test.mjs`: pass.
- `node verify/doctor.mjs --ci --full`: full browser, integration build/runtime/compiler,
  comparison, corpus, skill distribution and consumer verification run before release.
  The designated consumer is now the functioning shared table, served over local HTTP
  so modules, data requests, and fault-injection scenarios actually execute.

## Boundaries

This verifies the declared source dependency, scoped sibling pattern at two widths,
and executed browser outcomes. It is not a universal aesthetic score, an AST proof that
an imported component renders, or a claim that every business workflow was tested.
Those are why source evidence, rendered comparison, and exact outcomes are all required.
The reference and representative task expectations must come from the real product;
an agent must not fabricate a second reference just to match its output.

The native fixture is deliberately framework-free. React consumers must use their
installed table-state package and shared product component. Its mechanism tests do not
claim to have re-reviewed Nucleus in authenticated production or changed any user access.
