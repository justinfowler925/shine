# HeroUI Calendar board (Figma Kit)

Regions. Host: React/Tailwind application shell (house kit). Density: comfortable.
Paint: `tokens/voices/shadcn-zinc.css`. Structure source: Figma `DC4g36xyt4DobtbEa11JFL` node `4208:222`.
Shot: `corpus/packs/figma-heroui-calendar/shot.png`. Prefer cite `shadcn-form` when building — this pack is silhouette evidence, not a foreign runtime.

Figma: https://www.figma.com/design/DC4g36xyt4DobtbEa11JFL?node-id=4208-222
Discovery: Chrome history Justin Design copy / hidden component canvases on alt kit file (2026-10-09).
Deep harvest note: prefer-copy `GAn1SrbKJYiKqz9SmHHCRm` is Welcome+Icons (cover-heavy). Full atom boards live on alt `DC4g36xyt4DobtbEa11JFL` (Radio/Badge/Avatar/Calendar/Progress/Theme + more).

1. **Kit provenance** — name the Figma file and node before citing. Do not invent atoms the board does not show.
2. **Composition job** — one page job; do not turn the gallery into a dashboard of leftovers.
3. **Primary action** — one filled primary in the fold when the screen is interactive.
4. **House paint** — steal regions from this shot; implement with shadcn/Tailwind. Never install HeroUI runtime into Clearspeed consumers.
5. **States** — when the board shows hover/active/disabled/invalid, carry those states into the house component; do not ship half-widgets.

## Contracts

- Structure from this blueprint + shot; paint from the house voice sheet.
- Build cite stamp: `shadcn-form` (or sibling map row in `knowledge/kits/figma-library-map.json`).
- Corpus proxies still apply for full pages: `heroui`, `heroui-next-app` (structure only; house paint).
- Measure must stay green on `accordion-under-lead`, `detached-overflow`, `kpi-soup`, `card-soup`, `kit-silhouette-bypass`.

## Do not

- Cite this pack as an installable kit runtime.
- Expand Nucleus SLED under this import.
- Freestyle a page when the silhouette map already names a cite.
- Ask Justin for a URL when Chrome history + this file already carry the Design fileKey.

## Checklist (agent)

- Open the shot before describing pixels.
- Name preferCite from the kit map.
- Confirm foreign-runtime ban in `docs/no-foreign-runtimes.md`.
- Keep atoms/molecules/pages inventoried in the coverage matrix.
- Re-run `node corpus/index-templates.mjs` after adding rows.
- Re-run `node corpus/materialize-packs.mjs figma-heroui-calendar` so source/ + tokens.css land.

## Regions recap

- One focal composition from the Figma frame.
- One primary when interactive.
- States visible in the kit become first-class in the house component.
- Paint from shadcn-zinc unless the host is Lightning (then SLDS).

## Fail closed

- No shot in the pack: say there is no shot.
- MCP access denied on a community preview key: stop; use Justin Copy fileKeys only.
- A second filled primary is a defect.
- HeroUI chrome installed as a Clearspeed consumer runtime is a defect.
