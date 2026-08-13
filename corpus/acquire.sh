#!/usr/bin/env bash
# acquire.sh — build or refresh the shine design corpus.
#
#   ./acquire.sh <target-dir>            acquire/update everything, rewrite corpus.lock
#   ./acquire.sh --restore <target-dir>  pin every repo to the SHA in corpus.lock
#
# Read-only against upstream. Re-runnable: updates in place.
# Manifest, sizes, and license audit: research/corpus.md in the shine repo.
# Branches verified against upstream HEADs 2026-08-05.
#
# EXCLUDED ON LICENSE GROUNDS: origin-space/originui (AGPL-3.0 via cosscom/coss),
# tailwindlabs/tailwindcss.com (no license file, 964MB), Aceternity (no public repo),
# React Bits / Animate UI (Commons Clause), GSAP (no redistribution).
# Apple HIG: no clonable SPDX-clean tree — WebFetch developer.apple.com only.
# Polaris: pinned for query; LICENSE restricts Shopify-lookalikes — do not republish.
set -euo pipefail

MODE=acquire
if [ "${1:-}" = "--restore" ]; then MODE=restore; shift; fi
TARGET="${1:?usage: $0 [--restore] <target-dir>}"
mkdir -p "$TARGET"; TARGET="$(cd "$TARGET" && pwd)"
LOCK="$TARGET/corpus.lock"

log(){ printf '\033[1;34m==>\033[0m %s\n' "$*"; }

# ---------------------------------------------------------------- restore ---
if [ "$MODE" = restore ]; then
  [ -f "$LOCK" ] || { echo "no lockfile at $LOCK" >&2; exit 1; }
  while IFS=$'\t' read -r name mode url branch sha paths; do
    case "$name" in \#*|"") continue;; esac
    [ "$mode" = json ] && { log "skip $name (json snapshot, not restorable by sha)"; continue; }
    log "pin $name @ ${sha:0:8}"
    git -C "$TARGET/$name" fetch -q --depth 1 origin "$sha"
    git -C "$TARGET/$name" checkout -q "$sha"
  done < "$LOCK"
  log "restored to $LOCK"
  exit 0
fi

# ---------------------------------------------------------------- acquire ---
LOCK_TMP="$(mktemp)"
trap 'rm -f "$LOCK_TMP"' EXIT
printf '#name\tmode\turl\tbranch\tsha\tpaths\n' > "$LOCK_TMP"
record(){ printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" "${6:-*}" >> "$LOCK_TMP"; }

sparse_clone(){                     # <name> <owner/repo> <branch> <path...>
  local name="$1" repo="$2" branch="$3"; shift 3
  local dir="$TARGET/$name" url="https://github.com/$repo.git"
  if [ -d "$dir/.git" ]; then
    log "update $name"
    git -C "$dir" fetch -q --depth 1 origin "$branch"
    git -C "$dir" sparse-checkout set "$@"
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

full_clone(){                       # tiny repos only: <name> <owner/repo> <branch>
  local name="$1" repo="$2" branch="$3"
  local dir="$TARGET/$name" url="https://github.com/$repo.git"
  if [ -d "$dir/.git" ]; then
    log "update $name"
    git -C "$dir" fetch -q --depth 1 origin "$branch"
    git -C "$dir" reset --hard -q FETCH_HEAD
  else
    log "clone  $name"
    git clone --depth 1 -b "$branch" -q "$url" "$dir"
  fi
  record "$name" full "$url" "$branch" "$(git -C "$dir" rev-parse HEAD)"
}

fetch_shadcn(){
  # Don't clone shadcn for components: item JSON embeds full source in files[].content.
  # /r/index.json lists only the 62 registry:ui items; the full manifest is in-repo.
  # /r/{name}.json WITHOUT the style segment is a 404 serving the SPA shell.
  local out="$TARGET/shadcn-registry" style="${SHADCN_STYLE:-new-york-v4}"
  mkdir -p "$out/items"
  local sha; sha=$(git ls-remote https://github.com/shadcn-ui/ui.git refs/heads/main | cut -f1)
  log "shadcn registry @ ${sha:0:8}"
  curl -fsSL --compressed --retry 3 \
    "https://raw.githubusercontent.com/shadcn-ui/ui/$sha/apps/v4/registry.json" -o "$out/registry.json"
  curl -fsSL --compressed --retry 3 \
    "https://ui.shadcn.com/r/colors/index.json" -o "$out/colors.index.json"
  # python3, not xargs -I: BSD xargs caps -I replacement at 255 bytes and the
  # assembled command with an absolute target path exceeds it silently-fatally.
  local counts; counts=$(python3 - "$out" "$style" <<'PY'
import json, sys, urllib.request, concurrent.futures, os
out, style = sys.argv[1], sys.argv[2]
names = [i["name"] for i in json.load(open(f"{out}/registry.json"))["items"]]
def fetch(name):
    # some items (the *-form recipes) exist only under the older styles
    last = None
    for s in (style, "new-york", "default"):
        url = f"https://ui.shadcn.com/r/styles/{s}/{name}.json"
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                body = r.read()
            json.loads(body)  # a 404 here serves the SPA shell with status 200-ish paths; refuse non-JSON
            with open(f"{out}/items/{name}.json", "wb") as f:
                f.write(body)
            return None
        except Exception as e:
            last = e
    return f"  miss {name}: {last}"
with concurrent.futures.ThreadPoolExecutor(8) as ex:
    misses = [m for m in ex.map(fetch, names) if m]
for m in misses:
    print(m, file=sys.stderr)
print(f"{len(names)-len(misses)}/{len(names)}")
PY
)
  log "shadcn items: $counts fetched (style: $style)"
  record shadcn-registry json "https://ui.shadcn.com/r/styles/$style/{name}.json" main "$sha" "$counts items"
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

# Vendor design systems — behavior/completeness reference; shine tokens stay the visual system.
# Polaris LICENSE is MIT with Shopify-integration + visual-distinctness restrictions — query only,
# do not harvest into a published registry.
sparse_clone carbon           carbon-design-system/carbon main \
  packages/react packages/styles packages/themes packages/layout packages/type packages/colors
sparse_clone ant-design       ant-design/ant-design      master components
sparse_clone mui-material     mui/material-ui            master \
  packages/mui-material packages/mui-system docs/data
sparse_clone react-spectrum   adobe/react-spectrum       main \
  packages/@react-aria packages/@react-spectrum packages/@react-stately \
  packages/react-aria-components packages/dev/docs
sparse_clone fluentui         microsoft/fluentui         master \
  packages/react-components
sparse_clone aria-practices   w3c/aria-practices         main   content
sparse_clone polaris          Shopify/polaris            main \
  polaris-react polaris-tokens documentation

# AdminLTE-list expansion 2026-08-12 — SPDX-clean source; shine tokens stay the paint.
# No source clone: Haze (paid), PrimeReact v11+ (commercial), MUI Store premium,
# AdminLTE commercial, Tremor paid blocks. Those are query-only screenshots.
sparse_clone mantine          mantinedev/mantine         master \
  packages/@mantine apps/mantine.dev
sparse_clone chakra-ui        chakra-ui/chakra-ui        main \
  packages/react apps/compositions apps/www
sparse_clone heroui           heroui-inc/heroui          v3 \
  packages/react packages/styles apps/docs
full_clone   heroui-next-app  heroui-inc/next-app-template main
sparse_clone headlessui       tailwindlabs/headlessui    main \
  packages/@headlessui-react
sparse_clone tremor           tremorlabs/tremor          main   src
sparse_clone blueprint        palantir/blueprint         develop \
  packages/core packages/table packages/select packages/datetime2
sparse_clone park-ui          chakra-ui/park-ui          main \
  components/react packages
sparse_clone rsuite           rsuite/rsuite              main   src docs
sparse_clone grommet          grommet/grommet            master src storybook
sparse_clone ant-design-pro   ant-design/ant-design-pro  master src config docs

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mv "$LOCK_TMP" "$LOCK"; trap - EXIT
cp "$LOCK" "$ROOT/corpus/corpus.lock"
log "lockfile: $LOCK"
log "repo pin: $ROOT/corpus/corpus.lock"
node "$ROOT/corpus/index-templates.mjs"
log "on disk:  $(du -sh "$TARGET" | cut -f1)"
