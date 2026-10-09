# Redesign this Operate surface

**Wholesale job redesign** (SLED Capture decide path, Nucleus triage):  
**Wireframe → Build from cite → measure → prove.**

Denoise-loop is for **residual named defects** after the silhouette matches the cite.  
It is **not** permission to park peers in `<details>` under Summary lead and call measure PASS a redesign.

Edition: `clearspeed-operate`. Sibling cites before catalog fashion  
(`knowledge/editions/clearspeed-operate/siblings.json` · [`edition-siblings.md`](./edition-siblings.md)).

## Decide / worklist cite (required for Pursue jobs)

Preferred cite for “Decide Pursue/Review/Dismiss on the next notice”:

**`shadcn-operate-decide`**

Silhouette:

1. Summary lead ≤3 chips — **no accordion landfill under the lead**
2. One focal Open queue DataGrid
3. Decision: one filled **Pursue** + **attached** More overflow (`data-overflow="attached"`)
4. Encyclopedia / “how measured” **after** the queue (or secondary tab)

Anti-patterns that must FAIL measure (cannot PASS as slop):

- `accordion-under-lead`
- `detached-overflow`

Region map + reference: `corpus/blueprints/shadcn-operate-decide.md` ·  
`corpus/blueprints/shadcn-operate-decide/reference.html`.

## Commands

```sh
# 1 Cite — product sibling → preferred cite + kit
node core/edition-siblings.mjs resolve \
  --category queue \
  --job "Decide Pursue/Review/Dismiss on the next notice"
# → preferredCite: shadcn-operate-decide

# 2 Wireframe → lock structure from the cite (wholesale). Do not denoise-stamp DOM.
node core/wireframe-brief.mjs …   # lock regions to shadcn-operate-decide

# 3 Build the product TSX from the cite silhouette (Actor), then measure
node verify/measure.mjs <artifact.html> --cite shadcn-operate-decide --lane saas
# accordion-under-lead + detached-overflow must be green

# 4 Residual denoise only (named defects), then prove
node verify/denoise-loop.mjs \
  --html <artifact.html> [--tsx <file.tsx>] \
  --cite shadcn-operate-decide \
  --edition clearspeed-operate \
  --category queue \
  --job "Decide Pursue/Review/Dismiss on the next notice" \
  --out /tmp/shine-operate-denoise \
  --prove
```

Stop on `status=passed`, `namedDenoiseCleared=true`, `reflexionVerdict=done`, and a FAIL→PASS **crop** (twin full-page shots are invalid). Measure green must include decide-queue gates — a denoise PASS that still dumps accordions under the lead is incomplete.

## What went wrong on SLED (#761 / #766)

Agents cited generic `shadcn-queue`, ran denoise (`kpi-collapse` / park-in-details), and measure PASSed while shipping:

- Accordion stack under Summary lead
- Floating / detached More
- “Quiet decide path” that was still landfill

Root cause in Shine: thin decide cite + constitution text that said “park in details” + no doctor bite for those anti-patterns. Fixed here.

Skill entry: `skill/SKILL.md` · loop detail: `skill/references/denoise.md` · golden: [`denoise-golden-prove.md`](./denoise-golden-prove.md).
