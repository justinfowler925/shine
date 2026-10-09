# Material 3 — Badges (Figma / MUI target)

Regions. Host: React/Tailwind application shell (house kit). Density: comfortable.
Paint: `tokens/voices/shadcn-zinc.css`. Structure source: Figma `f4TUS9BWk2rSH8Dqrp5Mon` node `51592:4755`.
Shot: `corpus/packs/figma-m3-badges/shot.png`. Prefer cite `shadcn-form` when building — this pack is silhouette evidence, not a foreign runtime.

Figma: https://www.figma.com/design/f4TUS9BWk2rSH8Dqrp5Mon?node-id=51592-4755
Discovery: Material 3 Design Kit Design file (Chrome + MCP). Justin correction 2026-10-09: kit target is **MUI / Material UI / Material 3**, not "Minor UI".

1. **Kit provenance** — name the Figma file and node before citing. Do not invent atoms the board does not show.
2. **Composition job** — one page job; do not turn the gallery into a dashboard of leftovers.
3. **Primary action** — one filled primary in the fold when the screen is interactive.
4. **House paint** — steal regions from this shot; implement with shadcn/Tailwind. Never install Material/MUI runtimes into Clearspeed consumers (`docs/no-foreign-runtimes.md`).
5. **States** — when the board shows hover/active/disabled/error, carry those states into the house component; do not ship half-widgets.
6. **MUI mapping** — board `Badges` maps to MUI/M3 anatomy; structure cites may also consult on-disk design-corpus `mui-material` (unpinned / not installable runtime).
7. **Library keys** — subscribed Material 3 Design Kit libraryKeys live in `knowledge/kits/figma-library-map.json` for primitive search.

## Contracts

- Structure from this blueprint + shot; paint from the house voice sheet.
- Build cite stamp: `shadcn-form` (or sibling map row in `knowledge/kits/figma-library-map.json`).
- Corpus proxy for React source shape (structure only): `mui-material` under `~/design-corpus` — never `@mui/material` in consumers.
- Measure must stay green on `accordion-under-lead`, `detached-overflow`, `kpi-soup`, `card-soup`, `kit-silhouette-bypass`.

## Do not

- Cite this pack as an installable Material/MUI runtime.
- Expand Nucleus SLED under this import.
- Freestyle a page when the silhouette map already names a cite.
- Confuse this kit with cancelled "Minor UI" / Minimals / MiniKIT / Mobile DS stand-in hunts.

## Checklist (agent)

- Open the shot before describing pixels.
- Name preferCite from the kit map.
- Confirm foreign-runtime ban in `docs/no-foreign-runtimes.md`.
- Keep atoms/molecules/pages inventoried in the coverage matrix.
- Re-run `node corpus/index-templates.mjs` after adding rows.
- Re-run `node corpus/materialize-packs.mjs <id>` so source/ + tokens.css land.

## Regions recap

- One focal composition from the Figma frame (Badges).
- One primary when interactive.
- States visible in the kit become first-class in the house component.
- Paint from shadcn-zinc unless the host is Lightning (then SLDS).

## Fail closed

- No shot in the pack: say there is no shot.
- MCP access denied: stop; use accessible Design fileKeys only.
- A second filled primary is a defect.
- Material/Bootstrap chrome in a Clearspeed consumer is a defect.
