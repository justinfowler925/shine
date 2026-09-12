# Reuse working blocks before composing controls

The template catalog supplies page structure. The block registry supplies working React implementations. Do not treat a screenshot, blueprint, or TanStack adapter as an installed block.

Run `node integrations/blocks.mjs --project <consumer> --category <packet-category>` before adding components. The design packet includes the same result under `reusableBlocks`.

1. When a candidate exists, import that exact source. Extend it once for a demonstrated missing capability. Do not install Shine's version beside a working product component.
2. When no product implementation exists and the page needs the object, install the named registry block with the consumer's shadcn CLI and existing configuration. For example: `npx shadcn@latest add https://shine-blond.vercel.app/r/data-grid.json`. Inspect the proposed dependencies; preserve installed primitives, aliases, Tailwind version/prefix, and tokens. Never use `--overwrite` to replace existing controls. Installation of a block does not require Shine's base/theme.
3. Configure data, columns, labels, validation and real callbacks. Do not copy the block's implementation into each page. A callback must resolve only after the actual write; errors must reject. Keep business authorization in the consumer.
4. Bind source reuse and exercise each instance in the product browser. A tested library does not certify its integration.

## Six blocks

- `data-grid`: complete client-side TanStack v8 grid. Requires full dataset, stable row ids, column definitions, column labels, row labels, open action, retry action and empty copy. Optional exact-match column filters and asynchronous bulk action. A failed bulk action retains selection. Sorting, search, column visibility, pagination and row actions use the same implementation everywhere. A server-paged dataset must use the product's server grid; this block must not imply that one fetched page is the full dataset.
- `collection`: meaningful summary plus adjacent persistent detail region. Counts the full dataset, collapses above ten, preserves mounted child state. Supply a changed `revealKey` when a summary drill-down opens filtered details. Unknown/loading counts expose recovery instead of concealing it.
- `record-editor`: required/custom/email validation, real asynchronous save, double-submit lock, failed draft retention, discard confirmation, scrollable fields and fixed footer. Mount with `key=record.id`. Supply `returnFocus` when the original opener is removed (for example, moving from a sheet into an editor). Use the product's richer editor for field types this block does not support.
- `detail-sheet`: installed Sheet primitive with title/description, scrolling content and persistent footer actions.
- `workspace-tabs`: installed Tabs primitive owns keyboard and accessibility. Inactive panels remain mounted and hidden; draft state survives navigation. Product route navigation remains links, not fake tabs.
- `async-state`: distinct loading, empty, filtered-empty and error states with required recovery callbacks where applicable.

## Source binding

Write `shine-reuse.json`:

```json
{"version":1,"bindings":[{"block":"data-grid","source":"src/components/ui/data-grid.tsx","export":"DataGrid","entries":["src/app/accounts/page.tsx","src/app/owners/page.tsx"]}]}
```

`node integrations/blocks.mjs --project <consumer> --contract shine-reuse.json` checks actual exported sources and TypeScript-resolved import graphs. Competing named implementations fail unless `exceptions` names the different source and a concrete different user job. This source check detects known recurring components; it cannot infer that arbitrarily named code is behaviorally equivalent. Include the packet's `--reuse` argument in aggregate completion so this check is required there.

The browser suite imports generated registry file bodies and real upstream shadcn primitives. It does not use lookalike demo controls. Run `node verify/blocks-browser.mjs` and the consumer's affected workflows after changes. Failed or unrun consumer states remain incomplete.
