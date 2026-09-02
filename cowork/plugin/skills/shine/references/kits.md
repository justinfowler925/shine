# Kits — which library to reach for, and worked recipes

Kits supply **behavior, completeness, structure, and — under kit-faithful — visual DNA**.
House style is the fallback voice (`voices.md`). Brand lane: kit structure yes, kit
chrome no.

**Do clone structure and DNA** from a `templates.md` catalog row. Inventing a page is a
Critical hole (`diagnose.md` §0). Kits are not a substitute for a catalog id.

Before using any library API: read the library's official docs or source — fetch them if
needed. Never invent a prop, an option, or a component name from memory. Cite what you
read in the fix.

When working inside an existing repo, detect what is already installed (read
`package.json`) and use that system. **Never introduce a second design system** into a
project that already has one.

## Decision table

| Need | Primary kit | Also | Avoid |
|---|---|---|---|
| Headless primitives (dialog, menu, popover, tabs) | **Base UI** or **Radix** (website docs) | React Aria for complex a11y | Inventing focus traps |
| Shadcn-shaped React components | **shadcn** registry (`ui.shadcn.com`) | Base UI underneath | Thin demos without contract states |
| Data table / virtualized list | **TanStack Table ^8** + **TanStack Virtual** | `untitled-table` for chrome density | TanStack Table v9 |
| Charts | **Recharts** (React) + **D3** (math/SSR) | Observable Plot for grammar | nivo (drifting), visx except custom |
| Motion primitives (MIT) | **motion** + **motion-primitives** | — | GSAP, Aceternity, Animate UI |
| Marketing blocks (MIT) | **magicui** / **cult-ui** | — | Origin UI (AGPL) |
| Form/table completeness matrices | **`contracts.md`** (the MUST lists) | Untitled UI demos | A matrix read off an unvetted kit |
| Interaction/a11y SSOT | **react-spectrum** (`@react-aria`, RAC) + **WAI-ARIA APG** | Radix website | Skipping APG for custom widgets |
| Fluent patterns | **fluentui** `react-components` | — | Fluent brand paint |
| Admin / settings grammar | **Polaris** (query only — look, never copy) | — | Republishing Polaris components |
| Icons | **lucide** (default) / **phosphor** | — | Mixing two sets |
| Native Apple patterns | Apple HIG (fetch it) | — | Inventing UIKit APIs |

## Wireframe → recipe

When Wireframe (`wireframe.md`) matches a screen type, open the matched `templates.md`
row's source — then confirm kit behavior against official docs before locking the brief.

| Wireframe pattern | Catalog default | Lead kit / recipe |
|---|---|---|
| App shell | `shadcn-sidebar-07` | shadcn sidebar — § App shell |
| Dashboard | `shadcn-dashboard-01` | Recharts/D3 + `dashboards.md` |
| Queue / insight stream | `untitled-table` | toolbar, batch, empty/loading/error |
| Data table | `untitled-table` / `shadcn-dashboard-01` | § DataGrid |
| Form / settings | `shadcn-settings` | `contracts.md` completeness; Polaris query-only |
| Landing | `shadcn-marketing` | hero budget; `magicui-hero` for marketing-hero |
| Editorial / article | `shadcn-blog` | measure 60–75ch; region map only |
| AI surface | `ai-surfaces.md` topology first | chat is usually wrong |
| Dialog | — (component, not a page) | § Dialog / sheet |

## Worked recipes

### DataGrid (app)

1. **Behavior:** TanStack Table ^8 — sort, filter, pagination, selection, column
   visibility. Confirm APIs against the official TanStack docs.
2. **Chrome:** shadcn table / data-table registry item as structure; upgrade to full
   `contracts.md` Table MUST (toolbar, sticky header, empty/loading/error, keyboard).
3. **Density / filters:** read `untitled-table`'s public demo for toolbar layout, batch
   actions and the four table states — re-skin with the project's tokens.
4. **Virtualize** when rows ≫ viewport — TanStack Virtual examples.
5. Cite: TanStack docs + `untitled-table` pattern + contracts Table MUST.

### Dialog / sheet

1. Base UI or Radix Dialog — focus trap, restore, Escape, portal (their official docs).
2. WAI-ARIA APG dialog pattern if behavior is non-standard.
3. Motion: enter ~150–250ms ease-out from scale 0.95; exit faster; `prefers-reduced-motion`.
4. Contract: title, description, primary + secondary, destructive confirm separate.

### Form

1. Completeness from `contracts.md` § Form and the `shadcn-settings` blueprint —
   labels, helper, error association, disabled semantics.
2. Implement with the project's inputs + Base UI where needed.
3. Never placeholder-only labels; never disable submit before interaction without inline errors.

### App shell

1. shadcn sidebar blocks for structure; Polaris (query-only) for admin nav density cues.
2. Active state, mobile drawer, page header (title, description, one primary).
3. Adoption pass if internal (`adoption.md`).

### Dashboard

1. Structure from `patterns.md` / `dashboards.md` — context bar, KPI row, **one focal
   object**, queue.
2. Charts: Recharts + `dataviz.md` encoding rules; D3 for custom/SSR.
3. KPI decidability over decoration.

### Marketing hero

1. Hero budget from `patterns.md` — brand, one headline, one line, CTA, one full-bleed visual.
2. Motion: motion-primitives MIT only.
3. No equal three-card feature grid as the whole page (taste failure 28–29).

### Custom widget (combobox, grid, tree)

1. Start at the **WAI-ARIA APG** pattern for roles/keyboard.
2. Prefer **React Aria** components/hooks over hand-rolled.
3. Only then skin.

## License reminders (hard)

| Kit | Copy source into your work? |
|---|---|
| shadcn, Radix, Base UI, Ark, TanStack, D3, Recharts, motion, magicui, cult-ui, lucide, phosphor, Untitled UI (open set), React Spectrum, Fluent, APG | Yes if SPDX allows (usually MIT/Apache) — still prefer depend, don't vendor wholesale |
| MUI, Ant Design (+ Pro), IBM Carbon | **No** — they carry their own runtime and theming; nothing built on another stack can reproduce what their pages show |
| **Polaris** | **No** — query only; Shopify visual-distinctness clause |
| Origin UI | **No** — AGPL |
| Aceternity / React Bits / Animate UI / GSAP | **No** — missing license or Commons Clause / no redistribution |

## Citation form

```
Kit: Untitled UI table batch-actions layout (untitledui.com table demo)
Mapped to: toolbar + destructive behind menu (contracts Table SHOULD)
```
