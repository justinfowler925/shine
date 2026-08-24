#!/usr/bin/env node
// stop-sweep.mjs — shine enforcement on turn end, wired on BOTH surfaces:
// Claude Code `Stop` and Cursor `stop`.
//
// The per-edit lint catches Edit/Write. This catches everything else — files
// written via Bash (heredocs, sed, generators) — by sweeping
// `git status --porcelain` for modified design files when the agent stops.

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { isDesignCandidate } from "./design-lint.mjs";
import { citeGaps, CITE_EXEMPT } from "./cite-gate.mjs";
import { artifactClaim, citeIdsIn, proveGaps } from "./receipt.mjs";

const LINT = join(dirname(fileURLToPath(import.meta.url)), "design-lint.mjs");

// Claude Code sends hook_event_name "Stop" and a stop_hook_active flag; Cursor sends
// "stop" plus its own conversation fields and has neither.
const isCursor = (event) =>
  event?.hook_event_name === "stop" || (!("stop_hook_active" in (event || {})) && Boolean(event?.conversation_id));

const failClosed = (reason, event) => {
  if (isCursor(event)) {
    process.stderr.write(`${reason}\n`);
    process.exit(2);
  }
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
};

const stdinGuard = setTimeout(() => {
  failClosed("shine stop-sweep: no hook payload in 5s — refusing to fail open", {});
}, 5000);
let input = "";
process.stdin.on("data", (c) => (input += c));
process.stdin.on("end", () => {
  clearTimeout(stdinGuard);
  let event = {};
  try {
    event = JSON.parse(input);
  } catch {
    failClosed("shine stop-sweep: hook payload is not JSON — refusing to fail open", {});
  }
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
  } catch (e) {
    const msg = `${e.stderr || e.message || e}`;
    if (/not a git repository/i.test(msg)) process.exit(0);
    failClosed(`shine stop-sweep: git status failed — ${msg.split("\n")[0]}`, event);
  }
  if (!changed.length) process.exit(0);

  const res = spawnSync("node", [LINT, ...changed], { encoding: "utf8" });
  if (res.status !== 0 && res.status !== 1) {
    failClosed(`shine stop-sweep: design-lint exited ${res.status} — refusing to fail open`, event);
  }
  if (res.status === 1) {
    const found = res.stderr
      .split("\n")
      .filter((l) => l.startsWith("BLOCK"))
      .slice(0, 12)
      .join("\n");
    failClosed(
      "shine design-lint (stop sweep): files modified this turn carry off-token values:\n" +
        found +
        "\nFix them before finishing (tokens: var(--shine-*) / token utilities).",
      event,
    );
  }

  const gaps = citeGaps(changed);
  if (gaps.length) {
    failClosed(
      "shine cite (stop sweep): UI written this turn has no catalog cite (`data-cite` or `<!-- cite: id -->`):\n" +
        gaps.slice(0, 8).join("\n") +
        "\nLaunch shine-ux; do not freelance the page.",
      event,
    );
  }

  const claims = [];
  for (const f of changed) {
    if (CITE_EXEMPT.test(f.replace(/\\/g, "/"))) continue;
    try {
      const ids = citeIdsIn(readFileSync(f, "utf8"));
      claims.push(...ids.map((id) => artifactClaim(f, id)));
    } catch {
      /* unreadable */
    }
  }
  const missingProve = proveGaps(claims);
  if (missingProve.length) {
    failClosed(
      "shine prove (stop sweep): UI cited this turn was not run through compare.mjs:\n" +
        missingProve.join("\n") +
        "\nProve with verify/compare.mjs --cite <id> before finishing.",
      event,
    );
  }
  process.exit(0);
});
