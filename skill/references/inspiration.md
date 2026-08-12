# Inspiration & Research

Contracts, techniques, and kits are SSOT. External galleries are for **novel patterns**
when diagnose cannot cite a product technique (`techniques.md`) or corpus kit (`kits.md`).

## When research is required

Run this protocol when **any** of these is true — not only when the user asks for
inspiration:

1. Diagnose named a defect and no row in `techniques.md` / recipe in `kits.md` covers it.
2. Corpus `rg` found no analogous pattern in pinned kits.
3. The user explicitly asks for inspiration or competitive UI research.

If a citation already exists, skip galleries and apply the cite → fix → remeasure loop.

## Platform map

| Source | Use for | Do not use for |
|---|---|---|
| **Untitled UI / Plus UI** | Visual grammar, density, component variant matrices, token→Tailwind mapping | Interaction SSOT (pair with contracts) |
| **Mobbin / Refero / SaaSFrame** | Real product flows: onboarding, settings, empty states, table chrome | Blind visual copy |
| **Land-book / SaaS Landing Page** | Marketing heroes, pricing, CTA bands | App DataGrid behavior |
| **Awwwards / Godly** | Motion/craft ceiling, distinctive marketing | Default product chrome |
| **Dribbble / Behance** | Mood exploration | Completeness, a11y, states — concepts often skip them |
| **Corpus vendor docs** (Carbon / Ant / MUI / Spectrum / Fluent / Polaris / APG) | Behavior and API completeness — prefer disk over web | Pixel brand |
| **Apple HIG** (WebFetch only) | Native/macOS/iOS layout and interaction principles | Web component APIs |
| **shadcn/ui + TanStack** | Implementation recipes agents ship | Blindly accepting thin demos — extend to contracts |
| **OpenAI Apps SDK UI** | Chat/composer, card-in-chat density | Full enterprise DataGrid |

## Research protocol

1. Name the **screen type** (e.g. “billing settings”, “filtered empty table”).
2. Pick **one** primary source from the map above (prefer corpus vendor docs before
   paywalled galleries).
3. WebFetch or browse 2–3 examples max — or `rg` corpus for the same pattern.
4. Extract **principles** (hierarchy, density, state handling) — do not clone styling.
5. Map principles onto `contracts.md` + `foundations.md` + a new cite string you will
   put in the report.
6. Implement; do not leave “inspired by X” half-finished stubs.
7. Remeasure.

## Completeness still wins

A beautiful Dribbble table missing sort, filter, pagination, and empty states **fails**
this skill. Upgrade the pattern to the contract ladder before shipping.

## Paywalls

Mobbin and some galleries are subscription-gated. Do not block work on access — fall back
to corpus (Carbon/Ant/MUI/Spectrum/APG) + shadcn recipes + `techniques.md`.
