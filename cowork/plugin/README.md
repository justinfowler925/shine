# Shine for Claude Cowork

A UI/UX design authority, packaged as a Cowork plugin. When you ask Claude for any
interface work — a dashboard, a data table, a form, a landing page, an HTML report, a
  prototype, a deck, a PDF, a design review — this skill makes it:

- **Start from a real template**, not an invented layout: a 128-row catalog of shadcn
  blocks, Untitled UI demos, and authored blueprints (records, settings, wizards,
  weekly boards, marketing, checkout, Salesforce Lightning).
- **Ship complete components**: every data table gets search, sort, filters, pagination,
  selection, row actions, and loading/empty/filtered-empty/error states; forms and
  dialogs get their full interaction contract.
- **Follow measured craft rules** extracted from 18 shipped products (accent chroma,
  surface separation, type ratios, tracking curves, shadow anatomy, motion timing) —
  the specific numbers that separate real product UI from the generic "AI look."
- **Prove the result in a browser**: render, screenshot, walk the primary workflow, and
  check contrast before claiming anything is done.

## How to use it

Just ask for UI work in a Cowork session — the skill triggers on design, UI, UX,
dashboard, table, form, landing page, wireframe, audit, polish, and similar requests.
You can also invoke it explicitly: "use shine to…".

Useful phrases:

- "Wireframe a \<screen\> for \<audience\>" — interactive discovery → gray-box → locked brief
- "Build \<surface\> from the locked brief"
- "Polish this page" / "make this table production-grade"
- "Audit this UI — don't change anything" — scored report with severities and fixes
- "Review the copy on this page" — presentation-as-argument pass
- "Would anyone actually open this tool?" — adoption pass for internal tools

## Provenance

Adapted from the Shine design system, v4.0 — https://github.com/justinfowler925/shine
(MIT). The full repo additionally carries the token pipeline, the deterministic
measure/compare verifiers, enforcement hooks for Codex/Cursor, and a ~1.2 GB pinned
design corpus; this plugin carries the complete design knowledge and workflow, with
proof adapted to run in Cowork's browser. Template and catalog work stands on
shadcn/ui by shadcn (MIT).
