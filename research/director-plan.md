# Director plan — shine as a UI/UX agent

Date: 2026-08-19. Companion to the 2026-08-19 agent audit. Do not add more corpus pins until cite can use the 39 that already have no catalog row.

**Thesis:** Shine is a painter with a catalog. It should be a **director**: name the job, diagnose usability, retrieve a real corpus page, apply that page’s structure **and** visual DNA, prove completeness and likeness.

**Stop this sentence first.** Every cite still prints “Paint: shine tokens. Structure cloned; vendor pixels are not.” House style stays a lane (personal / brand-locked). It is no longer the only legal paint.

---

## Target loop

Today: cite default template → shine-paint → measure craft.

Tomorrow: job → diagnose → retrieve → apply DNA → prove. Wireframe stays the new-surface gate. Adoption still runs first on internal tools.

| Step | Question | Tool | Fail if |
| --- | --- | --- | --- |
| 1. Job | What is this screen for, who, under what ritual? | `adoption.md` (internal) or a one-line job in the brief | Pixels before the job is named |
| 2. Diagnose | Can they finish the job? What is missing, competing, empty? | `diagnose.md` with a new usability layer | Craft notes without a usability or completeness defect |
| 3. Retrieve | Which corpus page/kit/technique solves that defect? | `cite.mjs <job\|id>` + `rg ~/design-corpus` | A default dashboard when the job is a queue, detail, or settings |
| 4. Apply | Clone regions and visual DNA; map onto tokens that express that DNA | Opened corpus files + DNA block from cite | House style overwriting Carbon density or MUI marketing type |
| 5. Prove | Does it work, look like the cite, and still pass a11y? | `measure.mjs`: contracts + likeness + craft | Pretty empty table, or a Carbon cite that looks like shadcn zinc |

---

## Three voices

One agent, three legal paints. Pick from the job, not from habit.

| Voice | When | Paint |
| --- | --- | --- |
| **house** (fallback) | No cite DNA, or the user asks for shine-native | Current personal/brand tokens. Dark, one accent, dense editorial |
| **kit-faithful** (new default) | A catalog row or kit page was cited | Cite carries type, radius, density, chroma, elevation, motion. Tokens retuned to that DNA. Linear/IBM logos still not cloned; density and type pairing are |
| **brand** (locked) | Clearspeed or any brand pack | Kit structure yes, kit chrome no. The only lane that still sandpapers vendor paint — on purpose |

---

## Diagnosis: usability as layer 0

Completeness, composition, and craft already exist. They fire in the wrong order and skip the user’s job.

| Layer | Ask | Corpus hit |
| --- | --- | --- |
| 0 Usability | Primary action in 3s? Path length? Empty/error/loading as real states? Competing CTAs? Hover-only actions? Can a keyboard user finish? | `techniques.md` + APG + Polar/Carbon admin patterns |
| 1 Completeness | Named Table/Form/Dialog has MUST states | `contracts.md` + kit `file:line` (TanStack, Ant Form, Carbon DataTable) |
| 2 Composition | One focal object, density, voids, scan order | Cited template regions + `patterns.md` |
| 3 Craft | Type, chroma, motion — of the chosen voice, not always house | `taste.md` as measurement SSOT; DNA overrides house |

---

## P0 — Stop the sanding (this week)

Instruction and default cite. No new corpus. Highest leverage.

| Change | File | Done when |
| --- | --- | --- |
| Replace shine-paint with voice + DNA. House is fallback. | `skill/SKILL.md`, `agents/shine-ux.md`, `corpus/cite.mjs` banner | `cite.mjs` no longer prints “vendor pixels are not” as the law |
| Always load contracts when the surface names Table/Form/Dialog/Select | `SKILL.md`, `shine-ux.md` | Agent report includes MUST checklist or a measure fail |
| Default dashboard cite → `shadcn-dashboard-01` (full page), not Tremor atoms | `corpus/index-templates.mjs`, `templates.json` | `cite.mjs dashboard` lists a composed `page.tsx`, not `Card.tsx` |
| Fix doc drift: Mantine not in catalog; `kits.md` vs `templates.md` defaults | `site/index.html`, `kits.md` | Site and kits match `templates.json` |
| Doctor fails if the old paint sentence returns | `verify/doctor.mjs` | Revert the SKILL line, doctor goes red |

---

## P1 — Retrieval, not defaults (next)

| Change | File | Done when |
| --- | --- | --- |
| `cite.mjs <job>` — queue, settings, detail, chat, empty, marketing-hero — not only screen enums | `corpus/cite.mjs`, `templates.json` schema | `cite.mjs queue` returns a queue page, not `sidebar-07` |
| Visual DNA on every catalog row: family, density, type, radius, chroma, elevation, motion | `templates.json` + index script | cite prints a DNA block the agent must apply |
| Index the 39 unused pins as real pages (Carbon, Ant, Mantine, Magic UI, Fluent, Spectrum, HeroUI) | `index-templates.mjs`, acquire paths | At least one cite-able full page per major kit, not just `kits.md` recipes |
| Demote 70 chart widgets off default start-from; keep them as chart cites only | `index-templates.mjs` | `cite.mjs dashboard` does not return a Recharts wrapper |
| Missing screens: queue, record, chat, settings, wizard | `templates.json` `requiredScreenTypes` | Doctor fails if any of those have zero `startFrom: 1` |

---

## P2 — Prove likeness and completeness

| Change | File | Done when |
| --- | --- | --- |
| Contract gates in measure: named table without sort/page/empty/loading/error fails | `verify/measure.mjs` + fixtures | Pretty-empty-table FAIL; full-table PASS. Gate observed failing. |
| Likeness gate: `--shot` vs cited preview (region occupancy + primary count, not pixel-perfect) | `verify/measure.mjs` | Carbon cite that renders shadcn zinc sidebar FAIL |
| Cite attestation: `data-cite` on regions + opened-file list in report | wireframe/build contract, doctor | Naming an id without `data-cite` fails doctor/measure |
| Stop punishing Linear/Stripe DNA: 14/15 type and marketing voids are voice-relative | `measure.mjs` compose rules | A kit-faithful Linear-like type ladder PASSes when DNA says so; house lane still tight |
| Chroma: enforce as DNA range, or drop the global 0.13–0.24 prose that nothing runs | `taste.md` + measure or delete the lie | Either a chroma check exists or SKILL stops claiming one |

---

## P3 — Director agent

| Change | File | Done when |
| --- | --- | --- |
| Rewrite shine-ux as director: job → diagnose 0–3 → retrieve → apply voice → prove | `agents/shine-ux.md` | A table audit report leads with missing empty state, then a Carbon/Ant cite, then the patch |
| `diagnose.md` usability layer + defect→cite map | `skill/references/diagnose.md` | Each Critical/Major names a catalog id or kit `file:line` |
| Open the template preview (URL or PNG) before drawing — vision is part of cite | `cite.mjs` prints preview; agent must read it | Query-only Haze/Prime shots are actually looked at, or those ids are not used |
| Do not grow `SKILL.md`. Move house rules into voice packs. Keep SKILL under ~2k words. | `SKILL.md`, new `references/voices.md` | `wc -w SKILL.md` does not go up; doctor still maps every reference |

---

## Acceptance — two screens, one agent

If these two still look like siblings, the plan failed.

Same agent, same week:

1. **Internal queue** cited from Carbon or Ant Pro — dense, toolbar, empty/loading/error, batch actions.
2. **Marketing page** cited from MUI marketing or Magic UI — type as identity, hero budget, not an app shell.

Screenshots must be distinguishable by a stranger. Measure: queue fails without empty state; marketing fails if it is a sidebar + KPI cards.

---

## What we will not do

| Temptation | Why not |
| --- | --- |
| Pin Untitled UI / Tailwind Plus / Origin UI / Aceternity | Paywall or poison licenses. Query-only shots only if you own them in Atlas. |
| Clone Linear/IBM/Shopify pixels on brand-locked Clearspeed work | Brand lane still forbids vendor chrome. Kit-faithful is for personal and unlabeled product UI. |
| Add another 10k words of craft rules | Sameness already always-loads. Completeness and retrieval are the missing muscles. |
| Make doctor greener with more string checks | Doctor must watch gates fail on fixtures, then pass. String presence is how the current lie survived. |

---

## File map

| Path | Role |
| --- | --- |
| `skill/SKILL.md` | Paint law, load contracts on named components, voice picker |
| `agents/shine-ux.md` | Director loop, report shape |
| `corpus/cite.mjs` | DNA block, job retrieval, preview URL, no sanding banner |
| `corpus/index-templates.mjs` + `templates.json` | DNA fields, unused pins, screen types, dashboard default |
| `skill/references/diagnose.md` | Usability layer 0 |
| `skill/references/voices.md` | New; house / kit-faithful / brand |
| `skill/references/kits.md` + `templates.md` + site | Stop lying |
| `verify/measure.mjs` | Contracts + likeness + voice-relative craft |
| `verify/doctor.mjs` | Fixtures that fail, then pass |
| `verify/fixtures/` | pretty-empty-table, carbon-as-shadcn, tremor-atoms |
| `hooks/design-lint.mjs` | Allow DNA tokens; still block raw hex |
| `tokens/` | Optional voice packs later; P0 does not require new palettes if DNA maps onto existing semantic tokens |

---

## Start

P0 only until the paint sentence is dead, dashboard cite is a real page, and doctor bites a revert. Then P1 retrieval. Do not start P3 agent prose until measure can fail a fake cite.
