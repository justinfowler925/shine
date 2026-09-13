Historical baseline from the first interface-library release. The current expansion is documented in [system expansion](../system-expansion/surface-contract.md); the live catalog now has 26 blocks and 6 page templates.

Shine now supplies 14 workflow blocks and 5 page templates. These 19 implementations are separate from the 130 design references. The working gallery is built from the exact registry bodies; browser tests reject stale published JavaScript, CSS or HTML.

Nucleus reuses 17 product implementations and explicitly records two absent workflows: a persistent notification inbox and a card board with column transitions. It installs the missing filter bar, date range and upload blocks. Existing navigation, calendars, record pages, settings and approval workflows remain product-owned. Source coverage verifies complete classification, exports, import reachability, competing implementations and proof locations. It does not infer behavioral equivalence from a raw element census.

Validation: `node verify/library-browser.mjs` exercises 49 browser assertions, all five page templates, failure/retry/cancellation, retained drafts, loading/empty states, three widths and WCAG A/AA accessibility. `node verify/blocks-browser.mjs` checks the six original workflow blocks. `node verify/coverage.test.mjs` contains negative controls for missing patterns, false absence, disconnected source and missing proof files. Full doctor and distribution tests remain release requirements.

The public distribution probe verifies every registry item and all three working-gallery assets by hash. Only the aggregate verifier can issue an overall UI completion receipt; these tests are bounded technical evidence, not that receipt.
