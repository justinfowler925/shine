# Polish — upgrade in place after the job works

Polish is a **procedure phase**, not a packet `--mode`. Run it with
`design-packet.mjs --mode existing` after usability and completeness are sound.
It upgrades stubs, density, and optical craft **in place**; it does not invent IA,
restyle the product, or open a greenfield Wireframe.

**Not Polish:** discovery (`wireframe.md`), full Build from a locked brief, Audit-only
reporting (`audit.md`), persuasion copy (`copy.md`), or “will they open it?”
(`adoption.md`). Those are sibling procedure phases — see the mode map in
`SKILL.md` / README § Modes.

**Gate:** agent judgment. Measure still hard-fails craft floors (axe, contrast,
voids, hierarchy, theme). Optical alignment and micro-motion taste stay agent —
no polish-specific prove category in v1.

---

## Enter / skip

| Enter when | Skip / escalate when |
|---|---|
| Primary job works; contracts cover named controls | Usability or Critical completeness still open → Build / `contracts.md` first |
| Diagnosis names craft, density, or stub-upgrade defects | No UI yet → `wireframe.md` |
| Audit report says “polish” / stubs remain after a pass | Adoption ritual missing on an internal tool → `adoption.md` before pixels |
| User asked to tighten spacing, optical alignment, or motion | Words don't persuade → `copy.md` (this file does not rewrite the argument) |

Never spend a Polish pass on craft while a Critical completeness hole is open
(`diagnose.md` § Prioritize).

---

## Loop (cite → upgrade → remeasure)

1. **Cite** — keep or refresh `data-cite` for the page; do not swap families for a
   spacing tweak. Read the harvested shot before editing.
2. **Upgrade stubs** — named Table / Form / Dialog / Select / etc. climb the
   MUST ladder in `contracts.md` (and `table-quality.md` / `usability.md` where
   applicable). A stub that only looks finished is still a completeness defect.
3. **Density** — chrome vs content, instrumental gaps, compact vs comfortable for
   the lane (`techniques.md` § Hierarchy & density, `dashboards.md`,
   `direction.md` Operate). Prefer cutting padding over leading; one gap value for
   most of the page is a smell.
4. **Optical** — alignment of columns/baselines, nested radius
   (`child = parent − padding`), equal peers that should not be, tracking on
   display type, hairline borders vs fill jumps (`techniques.md`, `taste.md`).
5. **Micro-motion** — only after density/optical; 150ms mode, named properties,
   reduced-motion (`motion.md`). Never `transition: all`.
6. **Remeasure** — `node verify/measure.mjs <path> --shot /tmp/after.png --cite <id>`,
   then usability/compare/prove via the packet when the job requires completion.
   Report before/after for every Critical/Major you claimed to fix.

Banned report language: "tighten spacing", "more modern", "shine-paint" without a
technique cite (`direction.md`).

---

## What machine proof covers (and what it does not)

| Concern | Machine today | Polish role |
|---|---|---|
| Axe / contrast / voids / hierarchy / theme | measure hard-fail | Clear these if still red |
| App-shell content share | measure when shell rules apply | Density pass must not dodge shell grammar |
| Table / usability / layout contracts | fail closed when written | Upgrade stubs so contracts are real |
| Optical alignment / micro-motion taste | none | Agent checklist only |
| Copy beliefs / adoption ritual | diagnosis buckets; no prove categories | Out of scope here — use `copy.md` / `adoption.md` |

**No new prove categories for copy or adoption in v1.** Polish completion uses the
existing packet proof path (`measure` → usability → compare → `prove`).

---

## Cross-references

| Need | Open |
|---|---|
| Order of operations / severity | `diagnose.md` |
| Audit report → prioritized list | `audit.md` |
| MUST ladder for named controls | `contracts.md` |
| Technique → token transfer | `techniques.md`, `taste.md` |
| Motion budgets | `motion.md` |
| Remeasure semantics | `verification.md` |
| Wireframe lock before first paint | `wireframe.md` |
| Persuasion / instructional words | `copy.md` |
| Ritual / persona / path | `adoption.md` |
