#!/bin/bash
# Run a shine hook from the tree this skill actually loaded — never a hardcoded
# ~/Projects/shine* checkout. Cursor/Claude hook commands point at this file via
# the skill symlink (~/.cursor/skills/shine/run-hook.sh).
set -euo pipefail
tool="${1:?usage: run-hook.sh <design-lint.mjs|stop-sweep.mjs|doctor.mjs> [--quiet]}"
shift
root="$(cd "$(dirname "$0")/.." && pwd)"
case "$tool" in
  doctor.mjs)
    exec node "$root/verify/doctor.mjs" "$@"
    ;;
  design-lint.mjs|stop-sweep.mjs)
    exec node "$root/hooks/$tool" "$@"
    ;;
  *)
    echo "shine run-hook: unknown tool $tool" >&2
    exit 2
    ;;
esac
