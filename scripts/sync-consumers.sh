#!/usr/bin/env bash
# Re-vendor shine token layers into consumer apps.
#
# Public default: no private app paths. Point this at your own checkouts via
# consumers.local (gitignored) — see consumers.example.
#
# Usage:
#   scripts/sync-consumers.sh           # build + vendor
#   scripts/sync-consumers.sh --check   # exit 1 if any configured copy is stale
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOME_DIR="${HOME}"
MODE="${1:-}"
CHECK=0
[[ "$MODE" == "--check" ]] && CHECK=1

fail=0
ok() { echo "OK  $1 — $2"; }
bad() { echo "FAIL  $1 — $2" >&2; fail=1; }

if [[ "$CHECK" -eq 0 ]]; then
  echo "building shine tokens…" >&2
  ( cd "$ROOT/tokens" && npm run --silent build >&2 )
fi

PERSONAL_ARTIFACT="$ROOT/tokens/dist/personal/artifact.css"
PERSONAL_SITE="$ROOT/tokens/dist/personal/personal-site.css"
CS_ARTIFACT="$ROOT/tokens/dist/brand/artifact.css"
CS_THEME="$ROOT/tokens/dist/brand/theme.css"
CS_TOKENS="$ROOT/tokens/dist/brand/tokens.css"

for f in "$PERSONAL_ARTIFACT" "$PERSONAL_SITE" "$CS_ARTIFACT" "$CS_THEME" "$CS_TOKENS"; do
  [[ -f "$f" ]] || { echo "missing $f — run: (cd tokens && npm run build)" >&2; exit 1; }
done

vendor_css() {
  local name="$1" src="$2" dest="$3"
  mkdir -p "$(dirname "$dest")"
  local tmp header
  tmp="$(mktemp)"
  header="/* Vendored from shine. DO NOT EDIT. Re-vendor: npm run sync-consumers */"
  {
    printf '%s\n' "$header"
    awk 'BEGIN{s=0} s==1{print} /^ \* -+ \*\/$/{if(s==0){s=1}}' "$src" | sed '/./,$!d'
  } > "$tmp"
  if [[ "$CHECK" -eq 1 ]]; then
    if [[ -f "$dest" ]] && diff -q "$tmp" "$dest" >/dev/null 2>&1; then
      ok "$name" "$(basename "$dest") in sync"
    else
      bad "$name" "$(basename "$dest") stale or missing"
    fi
  else
    cp "$tmp" "$dest"
    ok "$name" "vendored → $dest"
  fi
  rm -f "$tmp"
}

# Optional local map: one "name|src_key|dest" line per consumer.
# src_key: personal-artifact | personal-site | brand-artifact | brand-theme | brand-tokens
LOCAL="$ROOT/consumers.local"
EXAMPLE="$ROOT/consumers.example"
if [[ ! -f "$LOCAL" ]]; then
  echo "no consumers.local — copy consumers.example and edit paths for your apps" >&2
  echo "dist is built; nothing to vendor." >&2
  exit 0
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" || "$line" =~ ^# ]] && continue
  IFS='|' read -r name key dest <<<"$line"
  dest="${dest/#\~/$HOME_DIR}"
  case "$key" in
    personal-artifact) src="$PERSONAL_ARTIFACT" ;;
    personal-site) src="$PERSONAL_SITE" ;;
    # The brand lane was called "clearspeed" before it was generalised. A local
    # consumers file written under the old names silently hit the *) branch below and
    # never vendored at all — four consumers sat unsynced that way, reported only by a
    # script nobody ran, while the doctor exited 0. Accept both spellings rather than
    # break configs on a rename; brand-* stays canonical.
    brand-artifact|clearspeed-artifact) src="$CS_ARTIFACT" ;;
    brand-theme|clearspeed-theme) src="$CS_THEME" ;;
    brand-tokens|clearspeed-tokens) src="$CS_TOKENS" ;;
    *) bad "$name" "unknown src_key '$key'"; continue ;;
  esac
  if [[ ! -d "$(dirname "$dest")" ]]; then
    bad "$name" "dest dir missing: $(dirname "$dest")"
    continue
  fi
  vendor_css "$name" "$src" "$dest"
done < "$LOCAL"

if [[ "$fail" -ne 0 ]]; then
  echo "one or more consumers out of sync" >&2
  exit 1
fi
echo "all configured consumers in sync"
[[ -f "$EXAMPLE" ]] || true
