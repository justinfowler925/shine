# Direction — art direction before code

Load this after the catalog cite, **before** writing CSS. Lanes: `internal` / `saas` /
`lex` / `marketing`. Marketing gets a signature. LEX usually gets **none — belong**.

A plan that would be emitted for any similar brief is not a plan. Revise it.

## Lanes

| Lane | Quality bar | Banned |
|---|---|---|
| **internal** | Adoption + contracts + density. Would they open it Monday? | Marketing theater, WebGL, custom cursors |
| **saas** | Type as identity, one accent, empty as brand, keyboard spatial | Three equal KPI cards as the page; Inter-on-zinc; purple glow |
| **lex** | Belong in Cosmos, then one owned moment | Cloning Linear/IBM chrome; org-wide CSS; `@media` for component width |
| **marketing** | One signature + Awwwards-shaped score (design 40 / usability 30 / creativity 20 / content 10) | App-shell + KPI soup; unearned GSAP |

Anti-patterns are **lane-relative**. Glow is a marketing DNA option and a saas/lex fail.

## Two-pass plan (write `DESIGN.md`)

1. **Ground the subject.** One concrete subject, audience, single job of the page.
2. **Cite.** `node corpus/cite.mjs <job>` — **Read both pack PNGs / `specimen.html`** before drawing. Report `images_read`.
3. **Token plan.** 4–6 named roles from the DNA pack or brand pack — not invented hex.
4. **Type.** Display / body / data pairing from the pack. LEX: Salesforce Sans only.
5. **Layout.** ASCII + pack `regions.json`.
6. **Signature.** One sentence. Marketing required. LEX: empty state, Path, or utility-bar command — not a custom nav.
7. **Uniqueness pass.** Replay a similar brief in your head. If the plan matches cream `#F4F1EA` + serif + terracotta, OLED + acid-green, broadsheet hairlines, or indigo-on-zinc, revise that axis.
8. **Chanel.** Remove one accessory. Spend boldness in one place.

Then build. Do not invent a second DESIGN.md. Unlock structure to change regions.

## 2026 defaults (not choices)

These are legitimate for some briefs and illegal as unexamined defaults:

1. Warm cream canvas (`#F4F1EA`) + high-contrast serif + terracotta
2. Near-black + single acid-green or vermilion
3. Broadsheet: hairline rules, zero radius, dense newspaper columns
4. Indigo/violet gradient hero, Inter everywhere, 3-column feature grid

Where the brief pins a look, follow it. Where it leaves an axis free, do not spend that freedom on (1)–(4).

## Modes (Impeccable)

**Persuade** (marketing) · **Operate** (saas / lex / internal queues) · **Read** (docs, briefs) · **Experience** (voice, artifact). Operate is density and scan. Persuade is art direction. Do not run the marketing pipeline on a Lightning record page.

## After first paint

1. `node verify/measure.mjs <path> --shot out.png --cite <id>`
2. `node verify/critic.mjs <path> --cite <id> --lane <lane>`
3. If critic likeness < 7, revise **once** against the pack specimen, then remeasure. Cap three critic passes.

Banned report language: "tighten spacing", "more modern", "shine-paint".
