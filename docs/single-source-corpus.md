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

## Corpus coverage (closed)

`corpus.lock` pinned the shadcn registry at **411/411 items**, already downloaded
to `~/design-corpus/shadcn-registry/items`, while the corpus had promoted **three**
of its **97 `registry:block`** entries. All 94 remaining blocks are now
catalogued, harvested and materialized — **shadcn goes from 8 usable templates to
101**:

| Family | Blocks available | Promoted before | Promoted now |
| --- | --- | --- | --- |
| `sidebar-01…16` (app-shell) | 16 | 1 | 16 |
| `chart-*` (charts) | 70 | 0 | 70 |
| `login-01…05`, `signup-01…05` (auth) | 10 | 1 | 10 |
| `dashboard-01` | 1 | 1 | 1 |

Page-scope coverage for **app-shell (16) and auth (10) is now entirely shadcn**,
where each previously offered one shadcn pack against MUI/Ant/Carbon. The 70
chart blocks are component-scope — they are section-level cards, not pages — so
they surface as component references on dashboard and charts briefs. The `charts`
*page* screen still resolves to Tremor until a composed shadcn charts page is
authored.

`harvest.mjs` now derives shadcn targets from each catalog row's own `preview`
URL, so adding a block is a data change rather than a new `TARGETS` entry.

## Screens shadcn genuinely cannot cover yet

shadcn ships no page block for these, so they still resolve to a foreign kit,
now explicitly flagged port-not-copy. Each needs a **composed** shadcn pack
authored from primitives — real design work, not a harvest:

`record` · `settings` · `wizard` · `checkout` · `blog` · `chat` ·
`marketing` · `marketing-hero`

Until then the packet tells the truth about what it is handing over, which is the
point of a single source: it names what it does not have instead of substituting
something the consumer cannot build.

## Figma

`corpus/figma-harvest.mjs` is the Figma sibling of `harvest.mjs` — Figma has no
public render route, so it calls the REST API with a personal access token and
renders nodes server-side. The token is read from `FIGMA_TOKEN` or 1Password
(`op://Employee/FIGMA_PAT/FIGMA PAT`), is never printed and never written to disk.

```sh
node corpus/figma-harvest.mjs --team <team-url|team-id>                 # discover file keys
node corpus/figma-harvest.mjs --list <url|file-key>                     # every top-level frame, by page
node corpus/figma-harvest.mjs --shot <url?node-id=1-234> --id <pack-id> # render one frame to shot.png
node corpus/figma-harvest.mjs --tokens <url> --family <name>            # voice sheet from variables/styles
```

What Figma can and cannot supply for a pack:

| Requirement | From Figma |
| --- | --- |
| `shot.png` | yes — `/v1/images` renders any frame at 2x |
| `tokens.css` | yes — local variables, falling back to published fill styles |
| `source/` | **no** — Figma holds no code |

Because `inspectPack` requires a `source/` file of at least 30 readable lines, a
Figma-derived pack is `kind: "blueprint"` with a hand-authored
`corpus/blueprints/<id>.md` — exactly how the seven Lightning packs already work
(`lex-queue.md` is 46 lines). That makes Figma the right way to close the eight
screens shadcn has no block for, and the authoritative source for a
brand voice sheet.

Discovery: Figma has no "list my files" endpoint, and `/v1/teams/:id/projects`
needs the `projects:read` scope a default PAT lacks. `--team` works around that
through the published-library endpoints (`team_library_content:read`), since every
published component carries its `file_key`. **A file that publishes no library is
invisible to this path** — that limit is printed, not hidden.

Local variables (`/v1/files/:key/variables/local`) need the `file_variables:read`
scope; the tool names the missing scope and falls back to published fill styles
rather than failing.

## Test status

All 12 suites pass in an installed release. `compare-proof` and `usability` were
failing on `origin/main` and now pass. `untitledui` fails only in a dev checkout
whose `node_modules` lacks `untitledui`; it is declared at 0.1.64 and present in
the release.
