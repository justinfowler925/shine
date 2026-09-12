# Finished blocks and complete reuse

Work item: 2964e0ab-3950-4850-8987-763973972b76
Source: current main 7baf789; isolated codex/finished-blocks.

Outcome: agents configure tested blocks and reuse installed product components instead of repeatedly reconstructing them. Nucleus must retain its business workflows and brand while using one implementation per recurring object.

Measured baseline: 130 catalog entries, 71 chart examples; registry has four entries (base, two themes, swatch), zero application blocks. The existing scaffold explicitly produces only an adapter. Workflow preflight rejects controls that appear after opening a dialog or selecting a tab.

Scope: six installable blocks (async state, collection disclosure, data grid, record editor, detail sheet, tabbed workspace); component adoption resolver and source checks; deferred/multipage workflow proof; Nucleus route/state inventory and integration. Reuse existing consumer components before installing new blocks. Never reset consumer themes or upgrade libraries as a side effect.

Acceptance: actual React browser fixture imports the distributed sources and upstream shadcn controls; exercise table sort/search/filter/visibility/pagination/selection/actions/loading/empty/error/retry, disclosure retention and dataset threshold, tab keyboard and panel state, editor validation/error retry/draft/discard/double-submit/focus, sheet close/focus; inspect narrow and wide captures. Negative controls must reject duplicate implementation and unexercised deferred objects. Distribution 15/15 (including all six hosted block bodies) plus current Nucleus route/state verification required for completion.

Delivery: full doctor and distribution tests; merge source; immutable release; local skill links; hosted Shine and portfolio; Nucleus current main package and UI; Studio hosted verification plus local-link receipt. No real business sends or destructive test writes.
