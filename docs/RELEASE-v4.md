# Shine V4 — art direction, not component accumulation

V4 turns the lessons from the public audit into enforceable behavior. shadcn remains the
composition foundation. Base UI is the greenfield primitive default; React Aria is the escalation
path for complex, internationalized, or accessibility-heavy interaction. Headless UI is not a
replacement for shadcn because it supplies fewer composed patterns and does not solve art
direction.

## Release contract

- A reference shortlist contains at most one candidate from a visual family in each scope.
- A composed page supplies the region graph; an atom can only fill a named region.
- Every design spec declares an archetype, image strategy, signature moment, and anti-repetition
  constraint before render.
- Open-source systems may contribute licensed source when they fit the consumer runtime, or a
  cited structure-only blueprint when they do not. Foreign runtimes never enter a shadcn repo just
  to imitate paint.
- Web, editable deck, code-first deck, PDF/report, and email work use output-native proof.
- Existing work begins with a screenshot and evidence-backed diagnosis. Completion requires a
  browser workflow, measure output, and a receipt when the selected reference supports compare.

## What the public rebuild tests

The Shine site is the release candidate. Its V3 baseline passed axe and contrast but presented the
product as a narrow technical essay. V4 must preserve those measurable strengths while moving the
real product proof into the hero, showing the before/after at useful size, explaining the open-
source architecture, and making the complete skill available without GitHub.

The artifact pair lives at `site/img/shine-v3-before.png` and `site/img/shine-v4-after.png`.
`shine-diagnosis.json` records the defects that justified the change; `site/shine-usability.json`
records the executable conversion path.
