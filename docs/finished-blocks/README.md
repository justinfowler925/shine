# Reuse finished application blocks

The previous public registry shipped only a base, two themes and a swatch. Consumers still had to assemble common application behavior from primitives. Six registry blocks now supply that behavior; the design packet inventories installed product components before recommending any new source.

The blocks compose upstream shadcn controls (Radix in the fixture), Tailwind utilities and TanStack Table v8. No block installs a theme. Existing product components remain authoritative. `shine-reuse.json` binds exported sources and consumer import graphs, rejects competing named implementations without a concrete different-job exception, and participates in aggregate completion.

The workflow verifier now supports controls that appear later, same-origin flow paths, reset/reload, native confirmation accept/dismiss, selection and observable assertions. Deferred controls must be exercised by the named flow; unknown flows, external paths and action-only flows fail.

## Browser evidence

`npm run blocks:test` compiles the actual generated registry file bodies with the upstream primitive sources. It exercises 26 workflow/layout checks across all six blocks: record sorting, search, filters, columns, pagination, selection failure/success, loading/error/empty recovery, disclosure state, the ten-row threshold, tab keyboard/draft state, drawer focus return, editor validation, failed-save draft retention, discard/keep editing, one successful write, narrow dialog footer, usable search width and enlarged text. Screenshots in `browser/` use synthetic fixture records.

Visual inspection caught a narrow search field that overflow-only tests missed. A focus assertion caught row action components being recreated when a drawer opened; stable renderers now preserve the opener. Both have executable regressions.

The suite establishes library behavior. Every consumer still needs its own workflow and content-state proof; this report is not a full-site Nucleus completion receipt.

## Release requirements

The distribution inventory now has 15 destinations. The new hosted-block destination checks all six published block bodies and their registry entries against canonical source. Missing or altered blocks fail. The five local links and ten remote/source checks must all refer to the same release before delivery is reported.
