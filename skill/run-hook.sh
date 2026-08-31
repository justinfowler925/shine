#!/bin/bash
# Run a shine hook from the tree this skill actually loaded — never a hardcoded
# ~/Projects/shine* checkout. Cursor/Claude hook commands point at this file via
# the skill symlink (~/.cursor/skills/shine/run-hook.sh).
set -euo pipefail
tool="${1:?usage: run-hook.sh <design-lint.mjs|stop-sweep.mjs|doctor.mjs> [--quiet]}"
shift
# -P resolves symlinks. Every surface invokes this file THROUGH a symlink
# (~/.cursor/skills/shine, ~/.agents/skills/shine, ~/.claude/skills/shine), and
# a logical `cd ..` from a symlinked directory walks the LINK's parent — so this
# resolved to ~/.agents/skills and every hook died with MODULE_NOT_FOUND on
# .../skills/verify/doctor.mjs. The physical parent is the tree that owns the hook.
here="$(cd -P "$(dirname "$0")" && pwd)"
root="$(cd -P "$here/.." && pwd)"
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
