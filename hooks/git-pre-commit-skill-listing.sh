#!/usr/bin/env bash
# Pre-commit bite: skill homepage listing + public SKILL.md must match disk.
#
# AST / skill-doc PRs have landed STALE when Mac doctor was still queued and
# merges used --admin. This hook fails the commit when the skill tree (or the
# listing surfaces) are staged while site/scripts/skill-listing.mjs --check
# would exit 1. Fix in the same commit: npm run skill-listing -- --write
#
# Installed by: node scripts/install-git-hooks.mjs  (also via npm prepare)

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$ROOT"

# Only bite when the commit touches the skill tree or the derived listing.
if ! git diff --cached --name-only --diff-filter=ACMR | grep -qE \
  '^(skill/|site/index\.html|site/SKILL\.md|cowork/plugin/skills/shine/(SKILL\.md|references/))'; then
  exit 0
fi

if ! node site/scripts/skill-listing.mjs --check; then
  echo >&2 "pre-commit: skill-listing STALE — refresh in this commit:"
  echo >&2 "  npm run skill-listing -- --write && git add site/index.html site/SKILL.md"
  exit 1
fi
