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
3. **MATCH** — `cite.mjs queue` → **untitled-table** (read
   `corpus/packs/untitled-table/shot.png`: toolbar-first, the table as the focal
   object, visible row actions, one filled primary).
4. **RESTRUCTURE** — page head with the count that matters, toolbar (filter · Export ·
   one filled primary), selection column, sortable headers, visible row actions,
   pagination, real empty/loading/error states.
5. **REPAINT** — `tokens/voices/untitled.css` (Inter, radius 6/8/12, brand-600
   primary, `light-dark()` so dark mode is the kit's own gray-950 ground); every
   value a `var(--shine-*)`.
6. **PROVE** — measure PASS (axe 0, 40 text elements worst 5.00:1, theme switches,
   table contract complete, family checks green under `--cite untitled-table`);
   `compare.mjs` composite beside the harvested Untitled UI shot reads as
   relatives (same type, radius, palette proportions).

Regenerate the artifacts:

```sh
node verify/measure.mjs verify/fixtures/unfucked/before.html --shot /tmp/before.png   # FAILs, by design
node verify/measure.mjs verify/fixtures/unfucked/after.html --shot /tmp/after.png --cite untitled-table
node verify/compare.mjs verify/fixtures/unfucked/after.html --cite untitled-table --out /tmp/compare.png
```

This demo cited Carbon until 2026-08-31. Carbon, MUI and Ant Design Pro were
deleted from the corpus that day (`docs/no-foreign-runtimes.md`), so the page was
re-cited and repainted against `untitled-table` — the table reference a shadcn
consumer can actually build. The before/after job is unchanged.
