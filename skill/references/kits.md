# Kits — when to pull which corpus, and worked recipes

Shine tokens are the semantic system. Kits supply **behavior, completeness, structure, and — under kit-faithful — visual DNA**. House style is the fallback voice (`voices.md`). Brand lane: kit structure yes, kit chrome no.

**Do clone structure and DNA** from a `templates.md` catalog row. Inventing a
page is a Critical hole (`diagnose.md` §0.5). Kits are not a substitute for a catalog id.

Before any library API: `rg` the corpus (`corpus.md`). Cite `file:line` in the fix.

Run `integrations/resolve.mjs --project <consumer-root>` before choosing implementation
code. It detects React/Next/Vite/LEX/native, the package manager, and installed kits;
it refuses a second design system and verifies every recipe API against the pinned pack.
`integrations/scaffold.mjs` writes the verified adapter plus its provenance receipt.

## Decision table

| Need | Primary kit | Also | Avoid |
|---|---|---|---|
| Headless primitives (dialog, menu, popover, tabs) | **Base UI** or **Radix** (website docs) | React Aria for complex a11y | Inventing focus traps |
| Shadcn-shaped React components | **shadcn-registry** JSON | Base UI underneath | Thin demos without contract states |
| Data table / virtualized list | **TanStack Table ^8** + **TanStack Virtual** | `untitled-table` for chrome density | TanStack Table v9 |
| Charts | **Recharts** (React) + **D3** (math/SSR) | Observable Plot for grammar | nivo (drifting), visx except custom |
| Motion primitives (MIT) | **motion** + **motion-primitives** | — | GSAP, Aceternity, Animate UI |
| Marketing blocks (MIT) | **magicui** / **cult-ui** | — | Origin UI (AGPL) |
| Form/table completeness matrices | **`contracts.md`** (the MUST lists) | `untitled-ui-react` demos | A matrix read off a kit Shine no longer carries |
| Interaction/a11y SSOT | **react-spectrum** (`@react-aria`, RAC) + **aria-practices** | Radix website | Skipping APG for custom widgets |
| Fluent patterns | **fluentui** `react-components` | — | Fluent brand paint |
| Admin / settings grammar | **Polaris** (query only) | — | Republishing Polaris components |
| Icons | **lucide** (default) / **phosphor** | — | Mixing two sets |
| Native Apple patterns | WebFetch **Apple HIG** | — | Inventing UIKit APIs |

## Wireframe → recipe

When Wireframe (`wireframe.md`) matches a screen type, run `node corpus/cite.mjs <screen>`
and open the files it lists — then confirm kit behavior with corpus `file:line`
before locking the brief.

| Wireframe pattern | Catalog default | Lead kit / recipe |
|---|---|---|
| App shell | `shadcn-sidebar-07` | shadcn sidebar — § App shell |
| Dashboard | `shadcn-dashboard-01` | Recharts/D3 + `dashboards.md` — not Tremor atoms |
| Queue / insight stream | `shadcn-queue` | worklist-first (§ Worklist-first); TanStack + table-quality; `untitled-table` chrome only |
| Data table | `untitled-table` / `shadcn-dashboard-01` | § DataGrid |
| Form / settings | `shadcn-settings` | `contracts.md` completeness; Polaris query-only |
| Landing | `shadcn-marketing` | hero budget; `magicui-hero` for marketing-hero |
| Editorial / article | `shadcn-blog` | measure 60–75ch; region map only |
| AI surface | `cite.mjs chat` or ai-generate | `ai-surfaces.md` first; chat is usually wrong |
| Dialog | — (component, not a page) | § Dialog / sheet |

## Worked recipes

### DataGrid (app)

1. **Behavior:** TanStack Table ^8 — sort, filter, pagination, selection, column visibility.
   Confirm APIs in `~/design-corpus/tanstack-table`.
2. **Chrome:** shadcn table / data-table registry item as structure; upgrade to full
   `contracts.md` Table MUST (toolbar, sticky header, empty/loading/error, keyboard).
3. **Density / filters:** read `untitled-table`'s harvested source and shot for toolbar
   layout, batch actions and the four table states — re-skin with shine tokens.
4. **Virtualize** when rows ≫ viewport — TanStack Virtual examples.
5. Cite: tanstack file:line + `untitled-table` pattern + contracts Table MUST.

### Dialog / sheet

1. Base UI or Radix Dialog — focus trap, restore, Escape, portal (`radix-website/data` or
   `base-ui/.../dialog`).
2. APG dialog pattern in `aria-practices/content` if behavior is non-standard.
3. Motion: enter ~150–250ms ease-out from scale 0.95; exit faster; `prefers-reduced-motion`.
4. Contract: title, description, primary + secondary, destructive confirm separate.

### Form

1. Completeness from `contracts.md` § Form and the `shadcn-settings` blueprint —
   labels, helper, error association, disabled semantics.
2. Implement with shine inputs + Base UI where needed.
3. Never placeholder-only labels; never disable submit before interaction without inline errors.

### App shell

1. shadcn sidebar blocks for structure; Polaris (query-only) for admin nav density cues.
2. Active state, mobile drawer, page header (title, description, one primary).
3. Adoption pass if internal (`adoption.md`).

### Worklist-first (Operate triage) — N9

Installable first-viewport recipe for Monday decide jobs (Sled Capture class). Prefer this
over dashboard chrome when the job is triage / queue / inbox.

1. **One work object in the fold** — `data-region="focal"` on a single DataGrid / worklist.
   Consumer TSX: when KPI/dashboard chrome precedes the work object, `apply-tsx` AST
   `worklist-first` reorders records/worklist first + stamps focal (see § Worklist-first TSX AST).
2. **CTA budget = 1** — one filled job verb (e.g. Pursue); peers outline/ghost/segmented.
3. **KPI encyclopedia off-path** — ≤3 summary chips; rest in `<details data-shine-kpi-rest>`.
4. **No peer grids** — second ranking (e.g. “David’s 10”) is a saved-view / filter XOR, never
   a second `role="grid"` peer. Detect: `dual-focal`; consumer TSX: `apply-tsx` AST
   `collapse-peer-grids` (XOR); DOM stays plan-only. Agent close: § Dual-grid XOR / TSX AST below.
5. **Cite** — `shadcn-queue` (or product sibling). Anti-cites: `shadcn-dashboard-01` as page
   lead, chart atoms, magicui. Packet `recommendation.restructureHints` must clear before polish.
6. **Golden fixture** — `verify/fixtures/denoise/queue-cta-{before,after}.html` +
   `queue-dual-grid-{before,after}.html` + `npm run denoise:eval`. Doctor bites dual-CTA,
   dual-grid XOR, worklist-first AST, and card/KPI soup.

Kit recipe string (cite v2): `shadcn-queue / DataGrid recipe; TanStack state; table-quality contracts`.

### Dual-grid XOR (D10) — agent-assisted close

Close the dual-focal loop: **detect → plan → XOR recipe → prove**. Consumer **TSX**
`collapse-peer-grids` is TypeScript AST (peer title → XOR chip + shared DataGrid). DOM
`apply-dom` stays plan-only — never silent dual-grid delete without XOR chips.

1. **Detect** — `dual-focal` when ≥2 peer `.grid-wrap` / `[role=grid]` worklists share main.
2. **Plan** — emit `collapse-peer-grids` with `mode: "xor-saved-view"`,
   `keepTitleIncludes` (e.g. `["Queue"]`), `foldTitleIncludes` (e.g. `["David"]`).
3. **Peer title → filter chip** — fold the peer’s `data-grid-title` into a
   `data-shine-xor-views` chip (`aria-pressed` XOR). Default pressed = kept worklist;
   peer chip pressed = filtered view. Do **not** leave a second `role="grid"`.
4. **Shared DataGrid state** — one table / `DataGrid` (`data-shine-shared-grid`) owns rows.
   Chip toggles the same row model (TanStack `columnFilters` / URL via `saved-views` block /
   product filter state). Reuse `blocks/saved-views.tsx` + `blocks/filter-bar.tsx` patterns;
   do not fork a second grid component.
5. **Focal** — `data-region="focal"` on the remaining wrap.
6. **Apply helper** — `node verify/restructure/xor-saved-view.mjs --html <file> --keep Queue --fold David`
   (also used by `denoise:eval` / `denoise:loop`). HumanGate stays true on the plan.
7. **Prove** — measure `dual-focal` FAIL→PASS; crop the fold so one grid is visible
   (`verify/fixtures/denoise/receipts/queue-dual-grid-fold-crop.html`). Twin full-page shots invalid.

Fixtures: `verify/fixtures/denoise/queue-dual-grid-{before,after}.html`.
Denoise recommend emits typed `recommendation.xorSavedView` (fixture + crop paths) for
queue/triage jobs — copy those paths; denoise packets bind `packet.xorSavedView` and DDR
`restructureOps` includes `collapse-peer-grids`. Doctor: `verify/xor-saved-view-recommend-bite.mjs`.

### CTA pressure TSX AST (N8 deepen) — maxFilled=1

Competing filled `Button` primaries in consumer TSX are demoted by **TypeScript AST**
(not regex): `verify/restructure/apply-tsx.mjs` `cta-budget`.

1. **Detect** — measure `cta-pressure` when ≥2 filled primaries in main.
2. **Recommend** — typed `recommendation.ctaPressureAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Keeps preferred job verb (e.g. Pursue) up to `maxFilled=1`; demotes peers to `outline`.  
   Handles `variant="default"`, `variant={"default"}`, and **missing variant** (shadcn default).
4. **Prove** — crop pair `queue-cta-tsx` (`queue-cta-tsx-{before,after}-crop.html`). Twin full-page invalid.

Fixtures: `verify/fixtures/denoise/tsx/queue-dual-cta{,-ast}.tsx`.  
Doctor: `verify/cta-pressure-ast-bite.mjs` / `npm run cta-pressure:ast-bite`.

### KPI soup TSX AST (N8 deepen) — maxVisible=3

Equal metric tiles competing with the work object in consumer TSX are collapsed by
**TypeScript AST** (not regex): `verify/restructure/apply-tsx.mjs` `kpi-collapse`.

1. **Detect** — measure `kpi-soup` when ≥4 equal metrics on queue/triage cites.
2. **Recommend** — typed `recommendation.kpiSoupAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Keeps first `maxVisible=3` peer tiles; wraps the rest in
   `<details data-shine-kpi-rest><summary>More metrics</summary>…</details>`.  
   Handles `className="metric"`, `className={"metric"}`, and **`data-shine-kpi` /
   `data-kpi`** markers. Dynamic `.map` bands stay plan-only.
4. **Prove** — crop pair `queue-kpi-tsx` (`queue-kpi-tsx-{before,after}-crop.html`). Twin full-page invalid.

Fixtures: `verify/fixtures/denoise/tsx/queue-kpi-soup{,-ast}.tsx`.  
Doctor: `verify/kpi-soup-ast-bite.mjs` / `npm run kpi-soup:ast-bite`.

### Pill-filter-stack TSX AST — maxVisible=3

Above-fold pill/chip filter encyclopedias in consumer TSX are collapsed by
**TypeScript AST** (not regex): `verify/restructure/apply-tsx.mjs` `pill-collapse`.

1. **Detect** — measure `pill-filter` when ≥5 above-fold filter pills on queue/catalog cites.
2. **Recommend** — typed `recommendation.pillFilterAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Keeps first `maxVisible=3` pills; wraps the rest in
   `<details data-shine-pill-rest><summary>More filters</summary>…</details>`.  
   Handles `className="pill"`, `className={"pill"}`, **`data-shine-filter-pill` /
   `data-shine-pill`**, and Badge pills. Dynamic `.map` bands stay plan-only.
4. **Prove** — crop pair `queue-pill-tsx` (`queue-pill-tsx-{before,after}-crop.html`). Twin full-page invalid.

Fixtures: `verify/fixtures/denoise/tsx/queue-pill-stack{,-ast}.tsx`.  
Doctor: `verify/pill-filter-ast-bite.mjs` / `npm run pill-filter:ast-bite`.

### Competing page-titles TSX AST — title-singular

Multiple peer page titles in consumer TSX are singularized by
**TypeScript AST** (not regex): `verify/restructure/apply-tsx.mjs` `title-singular`.

1. **Detect** — measure `page-title` when ≥2 competing titles (`h1` / `data-page-title` / `.page-title`) in main.
2. **Recommend** — typed `recommendation.pageTitleAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Keeps the first page title; demotes peers to
   `<p className="kicker" data-shine-title-demoted>…</p>`.  
   Handles `h1`, `data-page-title={"…"}`, and `className={"page-title"}`.
4. **Prove** — crop pair `queue-titles-tsx` (`queue-titles-tsx-{before,after}-crop.html`). Twin full-page invalid.

Fixtures: `verify/fixtures/denoise/tsx/queue-competing-titles{,-ast}.tsx`.  
Doctor: `verify/page-title-ast-bite.mjs` / `npm run page-title:ast-bite`.

### Dual-focal ban TSX AST (N8 deepen) — XOR peer→chip

Peer worklists / DataGrids on one triage job in consumer TSX are collapsed by
**TypeScript AST** (not regex): `verify/restructure/apply-tsx.mjs` `collapse-peer-grids`.

1. **Detect** — measure `dual-focal` when ≥2 peer `.grid-wrap` / `[role=grid]` worklists share main.
2. **Recommend** — typed `recommendation.dualFocalAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Keeps the worklist matching `keepTitleIncludes` (e.g. Queue); folds the peer
   (`foldTitleIncludes`, e.g. David) into a `data-shine-xor-views` chip on one
   `data-shine-shared-grid` + `data-region="focal"`.  
   Handles `className="grid-wrap"`, `className={"grid-wrap"}`, `role="grid"` /
   `role={"grid"}`, and **`data-grid-title`** markers. Dynamic `.map` peers stay plan-only.
   DOM `apply-dom` remains plan-only (use `xor-saved-view.mjs` for HTML).
4. **Prove** — crop pair `queue-dual-grid-tsx` (`queue-dual-grid-tsx-{before,after}-crop.html`). Twin full-page invalid.

Fixtures: `verify/fixtures/denoise/tsx/queue-dual-grid{,-ast}.tsx` (+ `queue-dual-xor-after.tsx` shape).  
Doctor: `verify/dual-focal-ast-bite.mjs` / `npm run dual-focal:ast-bite`.

### Worklist-first TSX AST (N9 deepen) — records/worklist before KPI chrome

KPI/dashboard chrome ahead of the Monday work object in consumer TSX is reordered by
**TypeScript AST** (not regex): `verify/restructure/apply-tsx.mjs` `worklist-first`.

1. **Detect** — composition when a metrics / `data-sled-kpis` band precedes the
   records/worklist among `main` / `data-shine-main` children.
2. **Recommend** — typed `recommendation.worklistFirstAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Moves the primary worklist (queue/records/`grid-wrap`/`DataGrid`/`role=grid`) ahead of
   KPI chrome; stamps `data-region="focal"`.  
   Handles `className="metrics"` / `{"metrics"}`, `data-sled-kpis`,
   `className="grid-wrap"` / `{"grid-wrap"}`, `role="grid"` / `{"grid"}`,
   `data-shine-records`, and `data-product-pattern` queue/worklist/records.
   Dynamic `.map` siblings stay plan-only.
4. **Prove** — crop pair `queue-worklist-first-tsx`
   (`queue-worklist-first-tsx-{before,after}-crop.html`). Twin full-page invalid.

Fixtures: `verify/fixtures/denoise/tsx/queue-kpi-chrome-first.tsx` ·
`queue-worklist-first-ast.tsx`.  
Doctor: `verify/worklist-first-ast-bite.mjs` / `npm run worklist-first:ast-bite`.

### set-focal TSX AST (NO-FOCAL / composition-slop deepen)

Equal Card / worklist roots with no `data-region="focal"` in consumer TSX are stamped by
**TypeScript AST** (not regex): `verify/restructure/apply-tsx.mjs` `set-focal`.

1. **Detect** — composition-slop / NO-FOCAL when ≥2 equal Card / worklist hosts lack focal.
2. **Recommend** — typed `recommendation.setFocalAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Prefers DataGrid / `role="grid"` / `{"grid"}` / `data-shine-records` /
   `data-product-pattern` queue|worklist|records / `className` grid-wrap; else first
   Card / `className="card"` / `{"card"}`.
4. **Prove** — crop pair `usul-focal-tsx` (`usul-focal-tsx-{before,after}-crop.html`).
   Twin full-page invalid. DOM Usul crop `usul-focal` remains the HTML companion.

Fixtures: `verify/fixtures/denoise/tsx/usul-no-focal.tsx` · `usul-no-focal-ast.tsx`.  
Doctor: `verify/set-focal-ast-bite.mjs` / `npm run set-focal:ast-bite`.

### Denoise-loop e2e — measure→AST repair→Critic≠Actor→prove

Fixture-queue doctor bite for the full denoise agent cycle (not twin screenshots):

1. **Measure** — `queue-cta-before.html` fails named denoise defects (cta-pressure / dual / kpi).
2. **Repair (AST)** — Actor applies `apply-tsx` ops on `queue-dual-cta-ast.tsx` (`tsxPath`);
   DOM continuum keeps measure HTML in sync.
3. **Critic≠Actor** — host cycle `measure→repair→critic`; worker self-review banned.
4. **Prove** — `mintProve` stamps completion with Atlas `reflexionVerdict` + `constitutionIds`
   linked to `ddrId`.
5. **Crop** — FAIL→PASS pair `queue-cta-tsx` required (`cropPairId`); twins banned.

Doctor: `verify/denoise-loop-e2e-bite.mjs` / `npm run denoise:loop-e2e`.  
CLI: `npm run denoise:loop -- --html … --tsx … --prove --crop queue-cta-tsx`.

### Wrong-cite / rebind-cite TSX AST (N8 deepen) — refuse until rebound

Settings/sources jobs stamped with a queue (or other wrong-category) cite in consumer
TSX are rebound by **TypeScript AST** (not regex): `verify/restructure/apply-tsx.mjs`
`rebind-cite`. Recommend **refuses paint** until the stamp matches category truth
(`refusePaintUntilRebound`); learned cite-ban fail-close also binds this fixture.

1. **Detect** — measure `cite-honesty` / wrong-cite when `data-cite` disagrees with job category.
2. **Recommend** — typed `recommendation.wrongCiteAst` (TSX fixtures + FAIL→PASS crops).
3. **Apply** — `npm run restructure:tsx -- --tsx <file> --plan <plan.json> [--write]`  
   Rewrites `from` → `to` (default `shadcn-queue` → `shadcn-settings`).  
   Handles `data-cite="…"`, `data-cite={"…"}`, `dataCite="…"`, and `dataCite={"…"}`.
   Dynamic cite expressions stay untouched.
4. **Prove** — crop pair `sources-cite-tsx` (`sources-cite-tsx-{before,after}-crop.html`).
   Twin full-page invalid. Packet refuse path keeps `editing.allowed=false` until rebound.

Fixtures: `verify/fixtures/denoise/tsx/settings-wrong-cite{,-ast}.tsx`.  
Doctor: `verify/wrong-cite-ast-bite.mjs` / `npm run wrong-cite:ast-bite`.

### Dashboard

1. Structure from `patterns.md` / `dashboards.md` — context bar, KPI row, **one focal
   object**, queue.
2. Charts: Recharts + `dataviz.md` encoding rules; D3 for custom/SSR.
3. KPI decidability over decoration.
4. **Require** `data-shine-kpi` on every metric card with non-empty `data-unit` and
   `data-baseline` (optional `data-good-direction`). Mark the primary chart/table
   `data-region="focal"`. Measure hard-fails equal-weight KPI soup without a focal on
   dashboard cites / `data-shine-probe="dashboard"` — see `dashboards.md` § Machine floor.
   The `dashboard-page` block ships this convention.

### Marketing hero

1. Hero budget from `patterns.md` — brand, one headline, one line, CTA, one full-bleed visual.
2. Motion: motion-primitives MIT only; grain technique from research/motion if needed.
3. No equal three-card feature grid as the whole page (taste failure 28–29).

### Custom widget (combobox, grid, tree)

1. Start at **aria-practices** content for roles/keyboard.
2. Prefer **React Aria** components/hooks over hand-rolled.
3. Only then skin with shine.

## License reminders (hard)

| Kit | Redistribute into registry? |
|---|---|
| shadcn, Radix, Base UI, Ark, TanStack, D3, Recharts, motion, magicui, cult-ui, lucide, phosphor, Untitled UI, React Spectrum, Fluent, APG | Yes if SPDX allows (usually MIT/Apache) — still prefer depend, don't vendor wholesale |
| MUI, Ant Design (+ Pro), IBM Carbon | **No** — deleted from the corpus 2026-08-31. Not a licensing call: they carry their own runtime and theming, so nothing here can build what their pages show |
| **Polaris** | **No** — query only; Shopify visual-distinctness clause |
| Origin UI | **No** — AGPL |
| Aceternity / React Bits / Animate UI / GSAP | **No** — missing or Commons Clause / no redistribution |

## Citation form

```
Kit: Untitled UI table batch-actions layout (corpus/packs/untitled-table/source/table.demo.tsx:LINE)
Mapped to: shine toolbar + destructive behind menu (contracts Table SHOULD)
```

## Operate settings / forms (P2)

| Job | Primary cite |
|---|---|
| Account / profile settings | `shadcn-settings` |
| Notification preferences | `shadcn-settings-notifications` |
| Billing / seats | `shadcn-settings-billing` |
| Member policy | `shadcn-settings-members` |
| Invite teammate | `shadcn-form-invite` |
| Account record | `shadcn-record-account` |

Form MUST: associated labels; `aria-invalid="true"` needs an accessible message (`verify/form-heuristics.mjs`).
