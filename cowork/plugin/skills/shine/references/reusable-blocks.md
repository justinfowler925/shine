# Reuse working blocks before composing controls

The template catalog supplies page structure. The block registry supplies working React implementations. Do not treat a screenshot, blueprint, or TanStack adapter as an installed block.

Run `node integrations/blocks.mjs --project <consumer> --category <packet-category>` before adding components. The design packet includes the same result under `reusableBlocks`.

1. When a candidate exists, import that exact source. Extend it once for a demonstrated missing capability. Do not install Shine's version beside a working product component.
2. When no product implementation exists and the page needs the object, install the named registry block with the consumer's shadcn CLI and existing configuration. For example: `npx shadcn@latest add https://shine-blond.vercel.app/r/data-grid.json`. Inspect the proposed dependencies; preserve installed primitives, aliases, Tailwind version/prefix, and tokens. Never use `--overwrite` to replace existing controls. Installation of a block does not require Shine's base/theme.
3. Configure data, columns, labels, validation and real callbacks. Do not copy the block's implementation into each page. A callback must resolve only after the actual write; errors must reject. Keep business authorization in the consumer.
4. Bind source reuse and exercise each instance in the product browser. A tested library does not certify its integration.

## Fourteen workflow blocks and five finished page templates

- `data-grid`: complete client-side TanStack v8 grid. Requires full dataset, stable row ids, column definitions, column labels, row labels, open action, retry action and empty copy. Optional exact-match column filters and asynchronous bulk action. A failed bulk action retains selection. Sorting, search, column visibility, pagination and row actions use the same implementation everywhere. A server-paged dataset must use the product's server grid; this block must not imply that one fetched page is the full dataset.
- `collection`: meaningful summary plus adjacent persistent detail region. Counts the full dataset, collapses above ten, preserves mounted child state. Supply a changed `revealKey` when a summary drill-down opens filtered details. Unknown/loading counts expose recovery instead of concealing it.
- `record-editor`: required/custom/email validation, real asynchronous save, double-submit lock, failed draft retention, discard confirmation, scrollable fields and fixed footer. Mount with `key=record.id`. Supply `returnFocus` when the original opener is removed (for example, moving from a sheet into an editor). Use the product's richer editor for field types this block does not support.
- `detail-sheet`: installed Sheet primitive with title/description, scrolling content and persistent footer actions.
- `workspace-tabs`: installed Tabs primitive owns keyboard and accessibility. Inactive panels remain mounted and hidden; draft state survives navigation. Product route navigation remains links, not fake tabs.
- `async-state`: distinct loading, empty, filtered-empty and error states with required recovery callbacks where applicable.

## Additional workflow blocks

- `application-nav`: real route links, current-page state, skip navigation and wrapping actions.
- `filter-bar`: controlled search, option filters, clear callback and an announced result count. Existing grids retain their own integrated controls.
- `date-range`: calendar dates, invalid/reversed range feedback, asynchronous apply and retained failed values.
- `form-panel`: text, email, date, number, select, textarea and checkbox fields; required/custom validation, linked errors, failed draft retention, per-form save, double-submit protection and confirmed reset.
- `file-upload`: input and drop, file-type/size feedback, remove, progress, cancellation and retry. The callback must honor AbortSignal; stopping locally does not prove a server write was undone. Server authorization and content validation remain mandatory product behavior.
- `notification-center`: Sheet-based inbox, unread counts, persisted mark-read callbacks and retry. It does not replace transient save toasts.
- `calendar-agenda`: seven-day agenda, explicit timezone, event selection and week navigation. Reuse a product scheduling calendar for conflict detection, attendee permissions or provider writes.
- `kanban-board`: card columns and accessible move controls. The async callback owns the transition; failed moves retain the existing column. It is not a drag-and-drop-only board.

## Finished pages

- `record-list-page`: shared DataGrid, DetailSheet and RecordEditor implement list → inspect → edit → save.
- `record-detail-page`: identity, facts, activity and persistent edit form behind WorkspaceTabs.
- `settings-page`: named sections with independent FormPanel saves and retained inactive drafts.
- `report-page`: validated date range, metrics, evidence DataGrid and methodology.
- `approval-page`: evidence queue, required explanation, explicit confirmation and asynchronous decision persistence.

These pages are configurable React implementations, not screenshots. Their props supply actual records, labels, values and real callbacks; authorization stays in the consumer. Keep mounted forms keyed by record identity. Use product formatting and timezone choices for dates and amounts.

The interactive library at https://shine-blond.vercel.app/library/ imports the generated registry sources with real shadcn primitives. Its examples use fictional in-memory records and a clearly labeled failure simulator. `verify/library-browser.mjs` exercises all five page workflows and the new blocks at desktop and phone widths; `verify/blocks-browser.mjs` retains the original six-block regression suite.

## Coverage before generation

`node integrations/coverage.mjs --project <consumer>` reports reference counts separately from 26 finished blocks and six finished pages, plus an AST census of raw forms, files, dates, searches, navigation and tables. Do not report the reference count as installable coverage.

Classify every registry pattern in `shine-coverage.json` with `decision: reuse`, actual exported source, importing entrypoints, named executable proof files and a product rationale. Use `decision: not-needed` only when the workflow is absent; existing matching implementations and raw upload/search/navigation controls cannot be declared absent. An `install` or missing decision is unfinished. The packet requires `--coverage shine-coverage.json` in completion. Source binding and proof locations do not replace running the browser tests.

## Source binding

Write `shine-reuse.json`:

```json
{"version":1,"bindings":[{"block":"data-grid","source":"src/components/ui/data-grid.tsx","export":"DataGrid","entries":["src/app/accounts/page.tsx","src/app/owners/page.tsx"]}]}
```

`node integrations/blocks.mjs --project <consumer> --contract shine-reuse.json` checks actual exported sources and TypeScript-resolved import graphs. Competing named implementations fail unless `exceptions` names the different source and a concrete different user job. This source check detects known recurring components; it cannot infer that arbitrarily named code is behaviorally equivalent. Include the packet's `--reuse` argument in aggregate completion so this check is required there.

The browser suite imports generated registry file bodies and real upstream shadcn primitives. It does not use lookalike demo controls. Run `node verify/blocks-browser.mjs` and the consumer's affected workflows after changes. Failed or unrun consumer states remain incomplete.
