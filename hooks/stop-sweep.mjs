#!/usr/bin/env node
// stop-sweep.mjs — shine enforcement on turn end, wired on BOTH surfaces:
// Claude Code `Stop` and Cursor `stop`.
//
// The per-edit lint catches Edit/Write. This catches everything else — files
// written via Bash (heredocs, sed, generators) — by sweeping
// `git status --porcelain` for modified design files when the agent stops.

import { execSync } from "node:child_process";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { isDesignCandidate } from "./design-lint.mjs";

const LINT = join(dirname(fileURLToPath(import.meta.url)), "design-lint.mjs");

// Claude Code sends hook_event_name "Stop" and a stop_hook_active flag; Cursor sends
// "stop" plus its own conversation fields and has neither.
const isCursor = (event) =>
  event?.hook_event_name === "stop" || (!("stop_hook_active" in (event || {})) && Boolean(event?.conversation_id));

const stdinGuard = setTimeout(() => process.exit(0), 5000);
let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  clearTimeout(stdinGuard);
  let event = {};
  try {
    event = JSON.parse(input);
  } catch {}
  // don't loop: if a previous Stop block already fired, let the turn end
  if (event.stop_hook_active) process.exit(0);

  const cwd = event.cwd || process.cwd();
  let changed = [];
  try {
    changed = execSync("git status --porcelain", { cwd, encoding: "utf8" })
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith(" D") && !l.startsWith("D "))
      .map((l) => join(cwd, l.slice(3).trim()))
      // One shared predicate with the per-edit lint, so the two gates cannot
      // disagree about what counts as UI.
      .filter((f) => isDesignCandidate(f));
  } catch {
    process.exit(0); // not a git repo — nothing to sweep
  }
  if (!changed.length) process.exit(0);

  const res = spawnSync("node", [LINT, ...changed], { encoding: "utf8" });
  if (res.status !== 1) process.exit(0);

  const found = res.stderr
    .split("\n")
    .filter((l) => l.startsWith("BLOCK"))
    .slice(0, 12)
    .join("\n");
  const reason =
    "shine design-lint (stop sweep): files modified this turn carry off-token values:\n" +
    found +
    "\nFix them before finishing (tokens: var(--shine-*) / token utilities).";

  // Cursor blocks on exit code 2 and reads stderr; Claude Code blocks with a JSON
  // decision on stdout. Same sweep, two contracts — wiring only one is how Cursor
  // ran with no shine enforcement at all until 2026-08-08.
  if (isCursor(event)) {
    process.stderr.write(`${reason}\n`);
    process.exit(2);
  }
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
});
