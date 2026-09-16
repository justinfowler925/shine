# Audit pass: Nucleus Company Tools, 2026-09-16

The first real Shine pass on the release that removed the invented-defect quota and
added the composed-page kits. Audit mode, against the Nucleus main checkout's
Company Tools page served by the visual fixture (`/company-tools-fixture` on 3198).
Nothing in the product was edited.

| Step | Result |
| --- | --- |
| Packet (`--mode audit --category datagrid`) | selected `tailadmin-tables` (TailAdmin family, capture `passed`); page shortlist `tailadmin-tables`, `windmill-tables`, `shadcn-queue`; component `untitled-table`; `editing.allowed: false`; no completion command |
| measure | axe 0 violations; 26 text elements, worst contrast 6.02:1; one likeness failure (cite expects a table as the focal object; the page is a five-card catalog) |
| usability | two flows passed on the live page: search narrows 5→1 and Clear filters restores 5; Cursor filter shows the two Cursor packages and All restores 5 |
| diagnosis | verdict `defects`, three minor findings, every one quoting a measure line: accent used as non-interactive state on labels and badges; one marked section without a heading; the `All` filter toggle at 32px wide |

Files: [`packet-summary.json`](./2026-09-16-nucleus-company-tools/packet-summary.json),
[`measure.txt`](./2026-09-16-nucleus-company-tools/measure.txt),
[`shine-usability.json`](./2026-09-16-nucleus-company-tools/shine-usability.json),
[`usability.txt`](./2026-09-16-nucleus-company-tools/usability.txt),
[`shine-diagnosis.json`](./2026-09-16-nucleus-company-tools/shine-diagnosis.json),
[`before.png`](./2026-09-16-nucleus-company-tools/before.png).

## What the pass exposed in Shine

- `measure.mjs` sampled text inside a closed `<details>` and reported 1.10:1 for legible
  `#111` on `#fff`. Collapsed content is painted over. Fixed in the same release with a
  regression test.
- The category list has no home for a card catalog. `datagrid` produces a table cite, and
  the likeness check then asks where the table is. A five-item card list sits under the
  ten-row grid threshold and is a legitimate static presentation; the packet's category
  set should say so rather than force a grid comparison. Open.

## What it did not do

This was an audit. The three findings are recorded, not fixed; fixing them is a separate,
explicit request in `existing` mode against the Nucleus repository.
