# shadcn Operate decide queue

Regions, in order. Host: application shell. Density: dense. Paint: `tokens/voices/shadcn-zinc.css`
(Clearspeed Signal Orange on the filled primary when the consumer edition is installed).
Authored source: `corpus/blueprints/shadcn-operate-decide/`.

This is the **decide / worklist** silhouette for Clearspeed Operate (SLED Capture, Nucleus
triage). It is not marketing, not a KPI encyclopedia, and not generic `shadcn-queue`
“open top record” chrome. Cite this when the Monday job is **Decide Pursue / Review /
Dismiss on the next notice**.

`shadcn-queue` remains the general triage grid. Prefer **this** row when Summary lead +
row Decision + overflow are in scope.

## Regions (immutable silhouette)

1. **Masthead** — queue name + freshness. No second page title.
2. **Summary lead** (`data-region="summary-lead"` / `data-summary`) — ≤3 posture chips
   (Open / New / High score). **No `<details>` accordion stack under the lead.** Secondary
   encyclopedia (open-by-state, feed freshness, “how measured”) lives **after** the focal
   worklist or on a secondary tab — never as accordion landfill between lead and queue.
3. **Focal worklist** (`data-region="focal"`) — one DataGrid. Search + reversible filters.
   David’s-10 style saved views are chips/toggles on the toolbar, not a peer grid.
4. **Decision column** — exactly one filled primary (`Pursue`). Review / Dismiss / Copy /
   Assign / Hand-off live in an **attached** overflow (`data-overflow="attached"`) sharing
   the same action cluster as Pursue. Detached / floating `More` (far end of a tab row, or
   orphaned outside the Decision cell) is banned.
5. **Needs attention / secondary** — after the queue, optional. Deferred Usul / Missed stay
   under one disclosure **below** the worklist, never under the Summary lead.

## Do

- Wireframe → lock structure → Build from this cite. Do **not** denoise-stamp the existing
  DOM into “PASS” by parking peers in `<details>` under the lead.
- One filled primary in main. Peers are outline/ghost or inside attached overflow.
- Stamp `data-cite="shadcn-operate-decide"` on the artifact.
- Prove with `verify/measure.mjs` (accordion-under-lead + detached-overflow must be green)
  then usability `search-and-pursue`.

## Do not

- Accordion dump under Summary lead (“More summary figures”, “Open by state”, “Feed
  freshness”, “How each figure is measured” as a stack).
- Floating `More` on the filter/tab row with a huge empty gap.
- Peer filled Review / Dismiss beside Pursue (cta-pressure).
- Dashboard-01 / marketing DNA / KPI soup (≥4 equal cards) on the decide path.
- Treating denoise-loop PASS as wholesale redesign proof when the silhouette still dumps.

## Checklist (agent)

- Summary lead ≤3 chips; zero `details` between lead and focal grid.
- Decision: Pursue filled + More attached in the same action group.
- Focal grid owns the fold; secondary encyclopedia after the queue.
- Cite id is `shadcn-operate-decide` (siblings map points here for decide jobs).

## Source of truth

- Region map: this file.
- Rendered reference: `corpus/blueprints/shadcn-operate-decide/reference.html`.
- Anti-patterns: `accordion-under-lead`, `detached-overflow` in `knowledge/anti-patterns/`.
- Edition sibling: `sled-capture-queue` → preferredCite `shadcn-operate-decide`.
