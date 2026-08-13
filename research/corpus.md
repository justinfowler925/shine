# corpus.md

Acquiring real library source so the agent never invents a prop signature.

Verified 2026-08-04. Sizes are `gh api repos/O/R --jq .size` plus summed blob bytes from the recursive trees API.

---

## Footprint

| Mode | Size |
|---|---|
| Full clones | **~5.1 GB** |
| `--depth 1` shallow | **~1.5 GB** |
| **Sparse — value dirs only** | **~130 MB** |

A 39× reduction. Two repos are 70% of the full total purely in history — Recharts (1.76 GB) and Motion (1.66 GB) — while their checked-out trees are 38 MB and 276 MB.

One anomaly: for `cult-ui`, `--depth 1` (458 MB) is *larger* than a full clone (451 MB), because 225 MB of media sits uncompressed in the packfile. Only sparse helps there.

**shadcn is the standout — don't clone it.** The repo is 67 MB; the actual component set is **372 KB of TSX** for one base, or **~550 KB as registry JSON** including all 27 blocks. The bulk is docs-site assets plus three redundant primitive implementations.

---

## Manifest

| Repo | SPDX | apiKB | Value-bearing paths | Strategy |
|---|---|---|---|---|
| shadcn-ui/ui | MIT | 68,889 | `apps/v4/registry/`, `apps/v4/content/docs/` (305 mdx), `apps/v4/registry.json` | **JSON** + sparse docs |
| airbnb/visx | MIT | 16,763 | `packages/visx-*/src`, `packages/visx-demo` | sparse |
| plouc/nivo | MIT | 81,104 | `packages/`, `website/src/data/components` | sparse |
| d3/d3 | ISC | 59,348 | `docs/` (119 md), `src/` | sparse |
| observablehq/plot | ISC | 97,624 | `docs/` (78 md), `src/` — 85 MB repo, 1.6 MB of value | sparse |
| recharts/recharts | MIT | **1,766,672** | `src/`, `storybook/`, `www/src/docs/` | sparse, mandatory |
| radix-ui/primitives | MIT | 23,763 | `packages/` — its 154 `.md` are **changesets, not docs** | sparse |
| **radix-ui/website** | MIT | 22,821 | `data/` — 137 mdx. **This is where Radix docs actually live** | sparse |
| mui/base-ui | MIT | 42,586 | `packages/react/src`, `docs/src/app/**/page.mdx` (83) | sparse |
| chakra-ui/ark | MIT | 94,387 | `packages/react/src`, `website/src/content` (88 mdx) | sparse |
| TanStack/table | MIT | 50,379 | `packages/`, `docs/` (1,384 md), `examples/` | sparse |
| TanStack/virtual | MIT | 9,545 | `packages/`, `docs/` (70 md), `examples/` | sparse |
| motiondivision/motion | MIT | **1,662,730** | `packages/{framer-motion,motion,motion-dom}/src`, `dev/react` — **no user docs in repo** | sparse, mandatory |
| lucide-icons/lucide | ISC (file) | 21,343 | `icons/`, `docs/` (182 md) | sparse |
| phosphor-icons/core | MIT | 6,541 | `assets/`, `src/icons.ts` — **skip `raw/`**, 5.8 MB duplicate | sparse |
| radix-ui/colors | MIT | 457 | `src/` (5 files) | clone fully |
| tailwindlabs/tailwindcss | MIT | 113,830 | `packages/tailwindcss/{theme.css,preflight.css,src}` | sparse |
| magicuidesign/magicui | MIT | 79,775 | `apps/www/registry/` (247), `apps/www/content/docs` (279 mdx) | sparse |
| nolly-studio/cult-ui | MIT | 218,911 | `apps/www/registry`, `apps/www/content` — **exclude `apps/www/public`, 225 MB** | sparse |
| ibelick/motion-primitives | MIT | 1,580 | `components/`, `app/docs` (35 mdx) | clone fully |
| d3-{scale,shape,force,hierarchy,array,interpolate,color,selection,transition} | ISC | 300–1,940 | `src/`, `README.md` | clone fully |
| d3/d3-geo | ISC (file) | 6,432 | `src/` — 6.3 MB of test topojson otherwise | sparse |
| carbon-design-system/carbon | Apache-2.0 | large | `packages/{react,styles,themes,layout,type,colors}` | sparse |
| ant-design/ant-design | MIT | 276,304 | `components/` | sparse |
| mui/material-ui | MIT | 742,511 | `packages/mui-material`, `packages/mui-system`, `docs/data` | sparse |
| adobe/react-spectrum | Apache-2.0 | 249,686 | `@react-aria`, `@react-spectrum`, `@react-stately`, `react-aria-components`, `dev/docs` | sparse |
| microsoft/fluentui | MIT (file; API NOASSERTION) | 846,170 | `packages/react-components` | sparse |
| w3c/aria-practices | W3C Software and Document License | 38,068 | `content/` | sparse |
| Shopify/polaris | MIT + Shopify integration / visual-distinctness restrictions | — | `polaris-react`, `polaris-tokens`, `documentation` | sparse, **query only** |
| mantinedev/mantine | MIT | — | `packages/@mantine`, `apps/mantine.dev` | sparse |
| chakra-ui/chakra-ui | MIT | — | `packages/react`, `apps/compositions`, `apps/www` | sparse |
| heroui-inc/heroui | Apache-2.0 | — | `packages/react`, `packages/styles`, `apps/docs` | sparse |
| heroui-inc/next-app-template | MIT | — | full app | clone fully |
| tailwindlabs/headlessui | MIT | — | `packages/@headlessui-react` | sparse |
| tremorlabs/tremor | Apache-2.0 | — | `src/` | sparse |
| palantir/blueprint | Apache-2.0 | — | `packages/{core,table,select,datetime2}` | sparse |
| rsuite/rsuite | MIT | — | `src/`, `docs/` | sparse |

| grommet/grommet | Apache-2.0 | — | `src/`, `storybook/` | sparse |
| ant-design/ant-design-pro | MIT | — | `src/`, `config/`, `docs/` | sparse |
| chakra-ui/park-ui | MIT | — | `components/react`, `packages/` | sparse |

**Footprint after 2026-08-12 AdminLTE-list expansion:** ~1.2 GB on disk (was ~690 MB).

**Excluded (no source clone):**
- Haze Dashboard — paid
- PrimeReact v11+ — commercial (query-only PrimeBlocks screenshots)
- MUI Store premium / AdminLTE commercial / Tremor paid blocks — unless Atlas has a license (checked 2026-08-12: none)
- `origin-space/originui` → redirects to `cosscom/coss`, **AGPL-3.0**
- `tailwindlabs/tailwindcss.com` → **no license file**, 964 MB
- Aceternity → no public repo, unverifiable license
- Apple HIG → no clonable SPDX-clean tree; WebFetch protocol only

⚠️ `lucide` and `d3-geo` show `NOASSERTION` in the GitHub API, but both LICENSE files are verbatim **ISC** — GitHub just can't classify them (Lucide's has an added provenance note). Same for Fluent (verbatim MIT) and Polaris (restricted MIT — do not republish components).

---

## Fetch shadcn as JSON, not git

Confirmed working:

- **`https://ui.shadcn.com/r/index.json`** → 200, 57 KB — but it lists **only the 62 `registry:ui` items**, not blocks or charts.
- **The full 411-item manifest** is `raw.githubusercontent.com/shadcn-ui/ui/<sha>/apps/v4/registry.json` — one 153 KB fetch (238 example, 97 block, 54 ui, 13 internal, 5 theme, 2 style, 1 lib, 1 hook).
- **Item endpoint:** `https://ui.shadcn.com/r/styles/{style}/{name}.json`. Styles enumerable at `/r/styles/index.json`. ⚠️ `https://ui.shadcn.com/r/{name}.json` **without the style segment is a 404 serving the SPA shell** — check status codes, not body length.
- **Item JSON embeds full source inline** in `files[].content`. No second fetch. Sizes: button 2.8 KB, card 2.4 KB, chart 11.4 KB, sidebar-07 18.4 KB, dashboard-01 76.8 KB.
- Blocks are individually fetchable even though unindexed.
- Also: `/r/colors/index.json` (58 KB) and `/r/icons/index.json`.

**Total: one 153 KB manifest fetch plus 411 items ≈ 3–4 MB**, versus 68 MB full clone or 18 MB sparse.

**magicui — partially.** `https://magicui.design/r/{name}.json` works, but ⚠️ **`/r/index.json` is a decoy**: it returns 200 with a 315-byte `registry:style` item literally named `"index"`, not a listing. Enumerate from the in-repo `registry.json` (108 KB, 247 items) instead. Since the 279 docs MDX are wanted anyway, sparse-clone is simpler.

---

## Docs: in-repo vs site-only

**Cloneable markdown:** shadcn-ui/ui (305 mdx), d3 (119 md), Observable Plot (78), lucide (182), TanStack table (1,384) and virtual (70), base-ui (83), ark (88), magicui (279), cult-ui (85), motion-primitives (35), **radix-ui/website** (137).

**Site-only — don't waste a sparse path:**
- **Motion** — its 170 in-repo `.md` are agent skills, changelogs and issue templates. User docs live only on motion.dev.
- **Radix primitives** — changesets. Docs are in the separate website repo.
- **Recharts** — `www/src/docs/api` is TypeScript data structures, not markdown.
- **Tailwind** — real docs are in the unlicensed 964 MB site repo. Take `packages/tailwindcss/theme.css` for the tokens instead.
- **visx** — 53 `.md`, package READMEs only. The gallery is `packages/visx-demo`.
- **nivo** — component prose is TypeScript in `website/src/data/components`.

---

## Acquisition script

Read-only against upstream. Re-runnable — updates in place and rewrites the lockfile.

```bash
#!/usr/bin/env bash
# design-corpus.sh — usage: ./design-corpus.sh /path/to/corpus
set -euo pipefail

TARGET="${1:?usage: $0 <target-dir>}"
mkdir -p "$TARGET"; TARGET="$(cd "$TARGET" && pwd)"
LOCK="$TARGET/corpus.lock"; LOCK_TMP="$(mktemp)"
trap 'rm -f "$LOCK_TMP"' EXIT

printf '#name\tmode\turl\tbranch\tsha\tpaths\n' > "$LOCK_TMP"
log(){ printf '\033[1;34m==>\033[0m %s\n' "$*"; }
record(){ printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" "${6:-*}" >> "$LOCK_TMP"; }

sparse_clone(){                     # <name> <owner/repo> <branch> <path...>
  local name="$1" repo="$2" branch="$3"; shift 3
  local dir="$TARGET/$name" url="https://github.com/$repo.git"
  if [ -d "$dir/.git" ]; then
    log "update $name"
    git -C "$dir" fetch --depth 1 origin "$branch" -q
    git -C "$dir" checkout -q FETCH_HEAD 2>/dev/null || git -C "$dir" reset --hard -q FETCH_HEAD
  else
    log "sparse $name  [$*]"
    git clone --filter=blob:none --no-checkout --depth 1 -b "$branch" -q "$url" "$dir"
    git -C "$dir" sparse-checkout init --cone
    # cone mode also pulls files sitting directly in each ancestor dir,
    # so apps/v4/registry.json arrives alongside apps/v4/registry
    git -C "$dir" sparse-checkout set "$@"
    git -C "$dir" checkout -q "$branch"
  fi
  record "$name" sparse "$url" "$branch" "$(git -C "$dir" rev-parse HEAD)" "$*"
}

full_clone(){                       # tiny repos only
  local name="$1" repo="$2" branch="$3"
  local dir="$TARGET/$name" url="https://github.com/$repo.git"
  if [ -d "$dir/.git" ]; then log "update $name"; git -C "$dir" pull --ff-only -q
  else log "clone  $name"; git clone --depth 1 -b "$branch" -q "$url" "$dir"; fi
  record "$name" full "$url" "$branch" "$(git -C "$dir" rev-parse HEAD)"
}

fetch_shadcn(){
  local out="$TARGET/shadcn-registry" style="${SHADCN_STYLE:-new-york-v4}"
  mkdir -p "$out/items"
  local sha; sha=$(git ls-remote https://github.com/shadcn-ui/ui.git refs/heads/main | cut -f1)
  log "shadcn registry @ ${sha:0:8}"
  curl -fsSL --compressed "https://raw.githubusercontent.com/shadcn-ui/ui/$sha/apps/v4/registry.json" -o "$out/registry.json"
  curl -fsSL --compressed "https://ui.shadcn.com/r/colors/index.json" -o "$out/colors.index.json"
  python3 -c "
import json;print('\n'.join(i['name'] for i in json.load(open('$out/registry.json'))['items']))" \
    | xargs -P 8 -I{} sh -c \
      'curl -fsSL --compressed -o "'"$out"'/items/{}.json" \
         "https://ui.shadcn.com/r/styles/'"$style"'/{}.json" || echo "  miss {}" >&2'
  record shadcn-registry json "https://ui.shadcn.com/r/styles/$style/{name}.json" main "$sha" "411 items"
}

fetch_shadcn
sparse_clone shadcn-docs      shadcn-ui/ui          main   apps/v4/content apps/v4/registry

sparse_clone visx             airbnb/visx           master packages
sparse_clone nivo             plouc/nivo            master packages website/src/data
sparse_clone d3               d3/d3                 main   docs src
sparse_clone observable-plot  observablehq/plot     main   docs src
sparse_clone recharts         recharts/recharts     main   src storybook www/src/docs
for m in d3-scale d3-shape d3-force d3-hierarchy d3-array \
         d3-interpolate d3-color d3-selection d3-transition; do
  full_clone "$m" "d3/$m" main
done
sparse_clone d3-geo           d3/d3-geo             main   src

sparse_clone radix-primitives radix-ui/primitives   main   packages
sparse_clone radix-website    radix-ui/website      main   data     # the real Radix docs
sparse_clone base-ui          mui/base-ui           master packages/react/src docs/src/app
sparse_clone ark              chakra-ui/ark         main   packages/react/src website/src

sparse_clone tanstack-table   TanStack/table        main   packages docs examples
sparse_clone tanstack-virtual TanStack/virtual      main   packages docs examples

sparse_clone motion           motiondivision/motion main \
  packages/framer-motion/src packages/motion/src packages/motion-dom/src dev/react
full_clone   motion-primitives ibelick/motion-primitives main

sparse_clone lucide           lucide-icons/lucide   main   icons docs
sparse_clone phosphor-core    phosphor-icons/core   main   assets src   # skip raw/, 5.8MB dup

full_clone   radix-colors     radix-ui/colors       main
sparse_clone tailwindcss      tailwindlabs/tailwindcss main packages/tailwindcss

sparse_clone magicui          magicuidesign/magicui main   apps/www/registry apps/www/content
sparse_clone cult-ui          nolly-studio/cult-ui  main   apps/www/registry apps/www/content

# EXCLUDED ON LICENSE GROUNDS: origin-space/originui (AGPL-3.0 via cosscom/coss),
# tailwindlabs/tailwindcss.com (no license, 964MB), Aceternity (no grant).

mv "$LOCK_TMP" "$LOCK"; trap - EXIT
log "lockfile: $LOCK"
log "on disk:  $(du -sh "$TARGET" | cut -f1)"
```

Restore an exact prior state:

```bash
while IFS=$'\t' read -r name mode url branch sha paths; do
  case "$name" in \#*|"") continue;; esac
  [ "$mode" = json ] && continue
  git -C "$TARGET/$name" fetch --depth 1 origin "$sha" && git -C "$TARGET/$name" checkout -q "$sha"
done < "$TARGET/corpus.lock"
```

---

## Host and query

**Build host:** any machine with enough free disk for sparse clones (~690 MB).

**Query with ripgrep, not embeddings.** The real questions are exact symbol lookups — *"what props does `<XAxis>` accept"* — which `rg` answers in milliseconds with file:line and zero staleness. Curated to source only, the corpus is ~50–150 MB of actual `.ts`/`.tsx`. Semantic search solves a problem that doesn't exist here, and it adds an index that goes stale every time a library ships.

**Serve by `git clone` on each machine.** Native Read/Grep/Glob become the query interface — full local speed, offline. Rejected: network FS mounts, coupling the corpus to an app daemon, and standing up an MCP server just to serve files.

The build host's job is **refreshing** the corpus — a scheduled sparse-checkout, prune, and symbol-index regeneration, pushed to a repo — not serving it.

If semantic search is ever genuinely needed, the proven substrate already on that box is a bge-m3 Qdrant collection at 1024 dimensions. Config-and-run, not a build. Only after ripgrep demonstrably fails.

**Do not fine-tune on this corpus.** The consuming agent is Claude Code, not a local model — a fine-tuned local model is one the agent never calls. Beyond that, fine-tuning teaches a distribution, not facts; the failure mode is confidently inventing a plausible prop that doesn't exist, which is the exact thing the corpus exists to prevent. And it's stale the day a library ships. Retrieval returns exact, citable, current source with file:line, updates with `git pull`, and costs hours instead of a week.
