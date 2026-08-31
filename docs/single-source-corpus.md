# Single-source corpus: shadcn is the house kit

## The defect this closes

The consumer's installed kit chose the *build recipe* but had no say in which
*page reference* won. A Next + shadcn/TanStack repo asking for a records surface
was handed an Ant Design Pro page to copy, alongside a shadcn recipe — two
contradictory instructions in one packet. `untitled-table` and `antd-pro-list`
both scored 122 and the tie broke alphabetically.

## The policy

**shadcn is the house kit** for every non-Lightning lane. SLDS is retained for
the `lex` lane because Lightning is a different platform, not a competing taste,
and the lane is already hard-separated in scoring. Untitled UI React is retained
as a buildable sibling: it is Tailwind-token based like shadcn, so its structure
ports without importing a foreign runtime (`RECIPE_KITS` in
`integrations/resolve.mjs` encodes exactly which kits a recipe can build).

MUI, Ant Design Pro, Carbon, Mantine and HeroUI carry their own runtime and
theming. They cannot be copied into a shadcn repo, so they are no longer offered
where shadcn covers the screen.

## What changed

**Retired** (`selectable: false` + `retiredReason`, the mechanism already used
for Carbon's table pack — the packs stay on disk as regression fixtures):

| Pack | Screen | Replaced by |
| --- | --- | --- |
| `mui-dashboard`, `antd-pro-app`, `carbon-uishell`, `mantine-appshell`, `heroui-next-app` | app-shell | `shadcn-sidebar-07` |
| `mui-sign-in-side` | auth | `shadcn-login-04` |
| `antd-pro-list` | queue | `shadcn-dashboard-01` |
| `antd-pro-crud`, `mui-crud-dashboard` | crud | `shadcn-dashboard-01` |

**Extended:** `shadcn-dashboard-01` now carries the records jobs (queue, crud,
list, inbox, records, triage, worklist). This is honest rather than a stretch —
its reference contract already requires navigation + summary + chart + **table**,
and it is the reference the CRO merged morning page proved against.

**Kit affinity** orders candidates so a buildable reference wins, and never
eliminates the only reference for a screen. A cross-kit page reference is
flagged `port: true` with a `portNote`, so the packet says "port this structure"
instead of implying "copy this source".

## What this costs, stated plainly

- **Cross-kit rotation is gone.** Shine used to rotate among kits to keep
  successive surfaces from looking identical. With one house kit, every app-shell
  cites the same pack. For an internal estate that is the goal; for a
  differentiated marketing site it is a real loss.
- **Records briefs now return one candidate, not three.** The thinness is
  reported as a `diversity:` gap rather than padded with an unbuildable kit.

## The gap that matters, and why it is not a config fix

`corpus.lock` pins the shadcn registry at **411/411 items**, already downloaded
to `~/design-corpus/shadcn-registry/items`. Of its **97 `registry:block`**
entries the corpus has promoted **three** page packs. The rest are unharvested:

| Available locally | Blocks | Promoted |
| --- | --- | --- |
| `chart-*` | 70 | 0 (the chart reference is still Tremor) |
| `sidebar-01…16` | 16 | 1 (`sidebar-07`) |
| `login-01…05`, `signup-01…05` | 10 | 1 (`login-04`) |
| `dashboard-01` | 1 | 1 |

Promoting a block is not a catalog edit: `harvest.mjs` needs one network render
per pack to produce `shot.png`, which `compare.mjs` composites against and the
doctor rejects if missing. That is the "add more later" work, in priority order:

1. **Charts** — 70 shadcn chart blocks sit unused while `charts` still resolves
   to Tremor. Highest ratio of available material to captured coverage.
2. **Sidebars** — 15 more app-shell variants, so app-shell has real choice again
   within the house kit rather than one pack.
3. **Auth** — 9 more login/signup variants.

## Screens shadcn genuinely cannot cover yet

shadcn ships no page block for these, so they still resolve to a foreign kit,
now explicitly flagged port-not-copy. Each needs a **composed** shadcn pack
authored from primitives — real design work, not a harvest:

`record` · `settings` · `wizard` · `checkout` · `blog` · `chat` ·
`marketing` · `marketing-hero`

Until then the packet tells the truth about what it is handing over, which is the
point of a single source: it names what it does not have instead of substituting
something the consumer cannot build.

## Pre-existing failures (not introduced here)

`verify/compare-proof.test.mjs`, `verify/untitledui.test.mjs` and
`verify/usability.test.mjs` fail on `origin/main` before any change in this
branch. They need separate attention.
