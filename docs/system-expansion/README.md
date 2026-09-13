# Complete application workflows

This expansion adds 13 implementations to the existing 19: 26 blocks and six composed
page templates, separate from the 130 design references.

The new registry items are application-shell, command-palette, multi-select, form-wizard,
activity-feed, comment-thread, attachment-manager, permissions-panel, server-data-grid,
saved-views, csv-import, chart-panel and dashboard-page. The gallery exposes Application
workflows, Remote records and Dashboard alongside the original six examples.

Specialized behavior comes from installed libraries: shadcn/Radix controls and focus,
TanStack manual table state, cmdk filtering/keyboard navigation, Papa Parse CSV handling,
and Recharts plotting. Tailwind supplies token-based styling and responsive layout.
The server grid transfers bounded pages; it does not pretend a partial dataset can be
sorted or counted in the browser. Its HTTP demo has 100,000 fictional records and isolated,
ephemeral edits. It has no product data connection.

The implementation selector resolves product exports before registry blocks and approved
upstream controls. Explicit patterns and remote-table requirements cannot silently fall
back to a client-only grid. Licensed source remains unavailable unless the consumer supplies
an authorized private local source; the public distribution contains no Tailwind Plus code.

The route/state audit combines a Next App Router source census, control ownership,
TypeScript import reachability, browser workflows, source/theme/config fingerprints,
clean Git identity, rendered-build headers and receipt freshness. See
[surface contract](surface-contract.md). Source reachability and ready-state smoke tests
are explicitly distinguished from successful user workflows.

Compatibility checks validate installed packages, aliases and named component exports,
Tailwind prefixes and semantic tokens. Installation manifests retain adapted upstream
baselines. Three-way upgrades preserve local changes, refuse conflicting/incompatible
updates before writing, and restore originals if a write fails.

Nucleus preserves its product-owned patterns and classifies the complete 32-item catalog.
Its existing three installed blocks gain baseline tracking and compatibility checks in
`npm run ui:coverage`, plus `ui:upgrades` and `ui:census`. Its production data and permission
semantics are unchanged; the generic library is not installed beside working product widgets.

Verification commands:

- `node verify/system-tools.test.mjs` checks selection and negative audit/upgrade/compatibility cases.
- `node verify/surface-audit-browser.mjs` executes a real workflow and rejects wrong builds, redirects and dirty source.
- `node verify/system-browser.mjs` exercises new workflows, failed writes and retries, server pagination/filter/sort/edit, saved views, CSV, chart states, accessibility, dark mode and enlarged text.
- `node verify/library-browser.mjs` retains the original 49 gallery checks.
- `node verify/doctor.mjs --ci --full` includes these checks and the existing integration/reference suite.
- `python3 verify/distribution_test.py` rejects stale hosted artifacts and an absent/wrong remote demo backend.

Overall completion remains issued only by `verify/prove.mjs`; distribution is complete only
when all 15 registered destinations match the release, with local and Studio evidence.
