# shadcn card catalog

Regions, in order. Host: application shell (`shadcn-sidebar-*` supplies the frame). Density: comfortable. Paint: `tokens/voices/shadcn-zinc.css`. Rendered at rest: `corpus/blueprints/shadcn-catalog/reference.html`.

A catalog is a handful of rich records — packages, skills, templates, tools — each with its own actions and its own detail. It is not a queue: nobody triages it, nobody sorts it, and under the ten-row threshold a table would hide exactly the copy a reader came for. The first audit against Nucleus's Company Tools page (`docs/audits/2026-09-16-nucleus-company-tools.md`) had no category for this shape; `datagrid` chose a table reference and the likeness check then asked where the table was.

1. **Context header** — what this library is and who approved it, with the two counts that size it (records, contents). One `h1`.
2. **Search and filter bar** — a labelled search input, a small set of type filters as a toggle group with `All`, and a visible `Clear filters` action. Filters narrow the same list in place; the URL may carry them.
3. **Result count** — the number of records the filters leave, in a `role="status"` region so a search that empties the list is announced.
4. **Card list** — one `article` per record: type badges, release and status, the record's name as `h2`, a one-sentence summary, then two labelled columns for *when to use it* and *before you start*. Cards are equal siblings; no card is featured.
5. **Card actions** — one filled primary action per card (install, copy, open) plus outline secondaries. The action belongs on the card, not in a detail page.
6. **Card detail disclosure** — setup steps and manual install under `details`, collapsed at rest. Collapsed content is not measured for contrast and is not part of the first read.
7. **Empty and filtered-empty states** — a real region with the search term echoed and a `Clear filters` action, never a blank gap.

## Host facts the region map cannot show

- Accent means "act here": eyebrow labels and status badges use muted tokens, not the primary accent, so the primary action on each card is the only accent on the card.
- Every filter toggle is at least 40px in both dimensions; `All` gets the same min-width as its siblings.
- Each card is a labelled region (`aria-labelledby` its `h2`); the disclosure's summary is a real `summary` so it is keyboard operable at rest.
- More than ten records means this is no longer a catalog: switch to `shadcn-queue` or `untitled-table` and the DataGrid contract.

## Do not

- A data table. Rows cannot carry the when-to-use / before-you-start copy that makes a catalog usable.
- A featured or hero card. Records are peers.
- Hover-only actions; every card action is visible at rest.
- Collapsed content coloured like body text and left unlabelled; the summary names what it opens.

## Checklist (agent)

- One `h1`; one `h2` per card.
- Search, type filters, `All`, `Clear filters` and the result count are present at load.
- Exactly one filled action per card.
- `data-cite="shadcn-catalog"` on the artifact.
- Prove with `verify/measure.mjs`, then `verify/usability.mjs` with a contract that searches, filters and clears, then `verify/compare.mjs`.

## Source of truth

- The regions above are the structure. They are not optional.
- `reference.html` is the region map rendered at rest; its capture is the pack shot `verify/compare.mjs` composites against.
- Paint comes from `tokens/voices/shadcn-zinc.css`.
