# Wireframe — interactive discovery before Build

Default for a **new** surface with no existing UI. Explicit triggers: “wireframe”,
“sketch”, “low-fi”, “discover the layout”, “new screen”.

Wireframe discovers **structure** with the user by picking a catalog template, then
citing kits. It emits a gray-box HTML artifact whose regions come from that template,
then a **locked brief**. Build applies cite DNA and does not invent a
competing IA unless the user says `unlock structure`.

Wireframe is a **procedure phase**, not a packet `--mode`. Use
`design-packet.mjs --mode new` after the brief locks; see `SKILL.md` / README § Modes
for the phase → packet map. Polish / Copy / Adoption are sibling phases, not packet modes.

**Not Wireframe:** craft (chroma, tracking, shadows), brand paint, real charts, or
shipping React. Craft hard-fails in `measure.mjs` wait until Build.

---

## When to enter / skip

| Enter | Skip |
|---|---|
| New screen/page/tool, no UI yet | Polish/Audit of an existing surface |
| User says wireframe / sketch / low-fi | Locked brief already exists and user wants paint only |
| Redesign-from-scratch where structure is undecided | Tiny component stub inside a known shell |

---

## Discovery script

**One question per turn** (or one tight cluster). Always end with **2–3 options + a
recommendation** (mandatory default + cite). Max **~8 discovery turns**, then force a
draft gray-box — do not interview to death.

### Turn budget

| Turns | Goal |
|---|---|
| 1–2 | Intent: job of the screen; who opens it; ritual if internal (`adoption.md` lite) |
| 2–3 | **Catalog pick** — `node corpus/cite.mjs <screen>` (default start-from) + pattern from `patterns.md`. Open the files it lists. |
| 3–6 | Structure forks still undecided after the template (nav collapse, states) |
| ≤8 | Emit/update gray-box; keep iterating on the HTML |
| Lock | Write `*.brief.md`; hand off to Build |

### Every suggestion must cite

| Kind | Form |
|---|---|
| Catalog template | `templates.md` id — **required on every region** |
| Pattern | `patterns.md` § name |
| Kit recipe | `kits.md` + `~/design-corpus/…` `file:line` |
| Technique | `techniques.md` § + product |
| Novel only | nearest catalog row + `patterns.md` principle — name both |

Banned: “we could do a sidebar” with no source. Gray-box regions come from the
chosen template, not from anonymous layout ideas. `data-cite` on every region
includes the `templates.json` id.

### Recommendation format (every fork)

```
Recommend: <option B>
Why: <kit/product cite — one line>
Options:
  A — … (cite)
  B — … (cite)  ← default
  C — … (cite)
```

### Structure forks (ask only what is undecided)

- Nav: sidebar vs top vs none — admin density (`untitled-table`, Polaris query-only) vs marketing hero budget
- Focal object: what is the one thing this page is about (`patterns.md` dashboard / queue)
- Primary action: one filled control (techniques.md §Hierarchy)
- Supporting regions: filters, KPI row, queue, detail pane — name jobs
- States: empty / loading / filtered-empty / error as labeled placeholders
- Mobile: collapse nav to drawer/sheet or single column

Internal tools: confirm ritual + persona asymmetry before locking (`adoption.md`).

---

## Gray-box artifact contract

### Paths

```
shine-wireframe/<slug>.html
shine-wireframe/<slug>.brief.md
```

Or a path the user names. Keep HTML + brief adjacent.

### Markup requirements

- Root: `data-shine-wireframe` on a wrapper (or `<body>`).
- `color-scheme: light` on `:root` / `<html>` (declared single mode).
- Do **not** set `data-shine-probe="app-shell"` (density gate is for Build app shells).
  Wireframe pages also skip the saas/internal shell density floor until Build.
- Regions: `.wf-region` with `data-label`, `data-job`, `data-cite`.
- Exactly **one** control with `data-primary` (filled primary).
- States as `.wf-state` text: `[empty]`, `[loading]`, `[error]`, `[filtered-empty]`.
- No imagery, no accent chroma, no real chart ink — blocks and labels only.
- CSS: link or inline from `skill/assets/wireframe.css` (copy into the artifact so it
  opens without a server dependency on the skill path when needed).

### Minimal skeleton

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Wireframe — <name></title>
  <style>/* paste skill/assets/wireframe.css */</style>
</head>
<body>
  <div data-shine-wireframe>
    <div class="wf-shell">
      <aside class="wf-region wf-nav" data-label="nav" data-job="…" data-cite="kits.md App shell">…</aside>
      <main class="wf-main">
        <header class="wf-region wf-header" data-label="page-header" data-job="…" data-cite="templates.md shadcn-dashboard-01">
          <div>
            <h1 class="wf-title">…</h1>
            <p class="wf-desc">…</p>
          </div>
          <button type="button" class="wf-btn" data-primary>Primary</button>
        </header>
        <section class="wf-region wf-focal" data-label="focal" data-job="…" data-cite="…">
          <span class="wf-state">[empty]</span>
        </section>
      </main>
    </div>
    <p class="wf-meta">Wireframe · cites in data-cite · lock via companion .brief.md</p>
  </div>
</body>
</html>
```

### Structural checks (Wireframe, not full measure)

Before lock, confirm:

1. `data-shine-wireframe` present
2. One `[data-primary]`
3. Every major region has `data-job` + `data-cite`
4. No large empty `.wf-region` without a `.wf-state` or content label
5. Pattern + kit named in the meta or brief

Do **not** require craft measure PASS on the gray-box.

---

## Locked brief

Write `shine-wireframe/<slug>.brief.md` **and** `DESIGN.md` on lock (`direction.md`).
**Machine lock** (enterprise plan §3): `node core/wireframe-brief.mjs` owns Status.
Structure fields are immutable while `Status: LOCKED` until the user says
`unlock structure`.

```markdown
# Wireframe brief: <name>
Status: LOCKED
Lane: internal | saas | lex | marketing
Pattern: <patterns.md section>
Template: <templates.md id> via `node corpus/cite.mjs <id>`
Opened: <source paths + shot from cite.mjs>
Primary action: <label>
Regions:
- nav — job — templates.md <id>
- page-header — …
- focal — …
States: empty / loading / error / …
Kit recipe: <kits.md name> + corpus paths
Techniques: <techniques.md rows used>
Adoption: ritual / persona / path (or n/a)
HTML: shine-wireframe/<slug>.html
DESIGN.md: shine-wireframe/<slug>.DESIGN.md
Unlock: only if user says "unlock structure"
```

```sh
# Draft → lock (refuses incomplete briefs)
node "$ROOT/core/wireframe-brief.mjs" write --slug <slug> --title "…" --primary "Pursue" …
node "$ROOT/core/wireframe-brief.mjs" lock shine-wireframe/<slug>.brief.md

# Packet for new surface binds the brief; Build refuses unlock/DRAFT
node "$ROOT/core/design-packet.mjs" --mode new --job "…" --slug <slug> --require-wireframe-lock

# Structure change — user must say the phrase
node "$ROOT/core/wireframe-brief.mjs" unlock shine-wireframe/<slug>.brief.md --phrase "unlock structure"
# …edit regions/primary/kit… then re-lock before paint
node "$ROOT/core/wireframe-brief.mjs" lock shine-wireframe/<slug>.brief.md
node "$ROOT/core/wireframe-brief.mjs" check shine-wireframe/<slug>.brief.md --paint
```

`ddr.wireframeBrief` on mode=`new` packets records `{ path, status, structureLocked }`.
`assertStructureLocked` / `assertBuildMayPaint` / `assertNewSurfaceBrief` are fail-closed.

### Denoise structure lock (REPAINT vs RESTRUCTURE)

Once primary job + regions are LOCKED (wireframe brief **or** denoise-loop lock from
`shine-restructure.json`), **REPAINT must not change structure**. Structural edits
require phase=`RESTRUCTURE` + a valid `shine-restructure/v1` packet:

```sh
# Gate used by verify/denoise-loop.mjs — refuse REPAINT that mutates primary/regions
node -e '
  import { gateDenoiseStructureChange, createStructureLockFromPlan } from "./core/wireframe-brief.mjs";
  import { buildRestructurePlan } from "./verify/restructure/schema.mjs";
  // …assertRepaintPreservesStructure / gateDenoiseStructureChange
'
```

| Intent | Structure changes? | Packet | Result |
|---|---|---|---|
| REPAINT | no | — | allow (craft) |
| REPAINT | yes | missing | **refuse** |
| RESTRUCTURE | yes | `shine-restructure/v1` | allow |
| RESTRUCTURE | yes | missing/invalid | **refuse** |

Receipt: `structureLock.locked` + `repaintStructureRefuse: true`. Doctor:
`verify/wireframe-brief.test.mjs`.

`DESIGN.md` names: lane, cite, voice, job, signature, palette (from pack), type pairing, layout ASCII, Salesforce host width if lex.

### Build handoff rules

1. Read the brief before any paint (`wireframe-brief.mjs check --paint`).
2. Honour regions, primary, and kit recipe — do not invent competing IA while LOCKED.
3. Upgrade placeholders to contract MUST states.
4. Remeasure with `measure.mjs` after paint.
5. If the brief is missing or `Status` is not `LOCKED`, do not invent IA — return to Wireframe.
6. Unlock only when the user says `unlock structure`; re-lock before paint.

---

## Pattern → first kit suggestion

| Pattern (`patterns.md`) | Lead with |
|---|---|
| App shell | `templates.md` `shadcn-sidebar-07` |
| Dashboard / metrics | `templates.md` `shadcn-dashboard-01` (Tremor when pinned) |
| Insight stream / queue | ranked rows; start from app-shell template chrome |
| Data table | `templates.md` `untitled-table` |
| Form / settings | `templates.md` `shadcn-settings` on the cited shell |
| Landing / marketing | `templates.md` `shadcn-marketing` |
| AI surface | `ai-surfaces.md` topology first — then an app-shell template |
| Dialog / sheet | Base UI / Radix + APG |

See `templates.md` for the ranked catalog. `kits.md` is behavior, not a substitute page.
