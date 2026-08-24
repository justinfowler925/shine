---
name: shine
description: >
  Deep UX skill for any interface, artifact, or visual output. Looks at the actual page
  (screenshot first), names defects in UX terms — hierarchy, flow, states, density, copy,
  a11y — then applies the structure and paint of real templates from pinned design kits
  (shadcn, MUI, Ant Pro, Carbon, Fluent, Spectrum, Magic UI, SLDS) to make it shine.
  Use when building or reviewing any UI, dashboard, landing page, table, form, chart,
  email, or Lightning/LWC surface; when asked to "make this look better", "polish",
  "audit", "wireframe", or "design a page"; when choosing colors, type, spacing, motion,
  or icons; when a surface speaks or listens; when writing UI copy; and for brand-locked
  work. New surface with no UI → Wireframe first. Existing UI → the loop:
  look → name → match → restructure → repaint → prove.
---

# SHINE

> Frontmatter stays `name` + `description` only — `paths:`/`globs:` scope the skill to
> matching files and Cursor then withholds it everywhere else. A Python-served UI once
> collected 56 raw hex values with the design authority one glob away.

You are not the director. **`shine-ux` is.** Any UI, artifact, chart, email, or visual
output: `Task` with `subagent_type: "shine-ux"`. Do not freelance the loop in the parent
turn — that is how zinc clones ship with this skill sitting unread.

**Catalog cite required.** The subagent runs `corpus/cite.mjs` from the tree this skill
loaded from, then proves with `verify/measure.mjs` and `verify/compare.mjs`. `data-cite`
is not a prove receipt — stop-sweep requires `compare.mjs` to have written
`last-prove.json` this turn. Do not hardcode a `Projects/shine*` checkout.

**Record list → DataGrid.** Rows of records (queue, remainder, sources, admin) cite
`carbon-datatable` / `mui-crud-dashboard` / `antd-pro-crud`, not a list or dashboard
shell. `measure.mjs` fails any data `<table>` (2+ header cells) that is not
contract-complete. Opt out with `data-shine-contract="layout"`. Wrapping `<table>` in
JS is not a DataGrid.

## Dispatch

1. Name the **lane** (`internal` / `saas` / `lex` / `marketing`) and the job, one line each.
2. Launch **shine-ux**. New surface / no UI → Wireframe. Existing → LOOK → NAME → MATCH →
   RESTRUCTURE → REPAINT → PROVE.
3. Stop. Do not edit the surface in this turn.

## Tools

```sh
SKILL=$(realpath "${HOME}/.cursor/skills/shine" 2>/dev/null || realpath "${HOME}/.claude/skills/shine")
ROOT="$(dirname "$SKILL")"
node "$ROOT/corpus/cite.mjs" "<job in plain words>"
node "$ROOT/verify/measure.mjs" <path> --shot /tmp/shine.png --cite <id>
node "$ROOT/verify/compare.mjs" <path> --cite <id>
```

`shine-ux` reads `references/direction.md` and the rest on demand. The parent does not.
