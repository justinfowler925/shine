# The unfuck demo — the loop, end to end

`before.html` is a deliberately fucked internal queue — the exact page class the skill
exists to rescue: greeting hero with an emoji, three equal glow-pill CTAs, card soup for
tabular data, hover-only row actions, serif body for numbers, half the viewport empty.

Measured (2026-08-21): axe 13 serious contrast violations + missing landmarks; button
contrast 3.68:1; **7 distinct font sizes**; **13 distinct off-scale spacing values**;
theme does not switch; 3 competing filled primaries; no empty/loading/error state; the
job (work the queue) is not performable without hovering every card.

`after.html` is the same job through the loop:

1. **LOOK** — `measure.mjs before.html --shot` and read the screenshot.
2. **NAME** — queue rendered as card soup; no focal object; contract absent; craft slop.
3. **MATCH** — `cite.mjs queue` → **carbon-datatable** (read
   `corpus/packs/carbon-datatable/shot.png`: toolbar-first, batch actions, full-bleed
   dense table, one filled primary).
4. **RESTRUCTURE** — page head with the count that matters, toolbar (filter · Export ·
   one filled primary), selection column, sortable headers, visible row actions,
   pagination, real empty/loading/error states.
5. **REPAINT** — `tokens/voices/carbon.css` (IBM Plex, radius 0, blue-60 primary,
   `light-dark()` so dark mode is g100); every value a `var(--shine-*)`.
6. **PROVE** — measure PASS (axe 0, 40 text elements worst 5.00:1, theme switches,
   table contract complete, family checks green under `--cite carbon-datatable`);
   `compare.mjs` composite beside the harvested Carbon shot reads as relatives
   (same type, radius, palette proportions).

Regenerate the artifacts:

```sh
node verify/measure.mjs verify/fixtures/unfucked/before.html --shot /tmp/before.png   # FAILs, by design
node verify/measure.mjs verify/fixtures/unfucked/after.html --shot /tmp/after.png --cite carbon-datatable
node verify/compare.mjs verify/fixtures/unfucked/after.html --cite carbon-datatable --out /tmp/compare.png
```
