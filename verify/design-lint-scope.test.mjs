#!/usr/bin/env node
// The per-edit lint blocks on the lines a change touched, not on every legacy
// value in the file. Whole-file blocking made "change one label" into "repaint
// the stylesheet" — the mechanism behind unrequested restyles. Untracked files
// and fresh repos still lint whole, and --all-lines restores the old scope.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { changedLines, scopeFindings } from "../hooks/design-lint.mjs";

const lint = join(dirname(fileURLToPath(import.meta.url)), "../hooks/design-lint.mjs");
const dir = mkdtempSync(join(tmpdir(), "shine-lint-scope-"));
const git = (...a) => spawnSync("git", a, { cwd: dir, encoding: "utf8" });
const run = (...args) => spawnSync(process.execPath, [lint, ...args], { encoding: "utf8", env: { ...process.env, SHINE_LINT_SCOPE: "" } });
const hook = (file) => spawnSync(process.execPath, [lint], { encoding: "utf8", env: { ...process.env, SHINE_LINT_SCOPE: "" }, input: JSON.stringify({ hook_event_name: "PostToolUse", tool_input: { file_path: file } }) });
const css = join(dir, "legacy.css");
const legacy = ".a{color:#ff0044}\n.b{padding:13px}\n";

try {
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  writeFileSync(css, legacy);

  // 1. Before the first commit everything is new: the legacy hex blocks.
  assert.equal(changedLines(css), null, "no HEAD yet means whole-file scope");
  assert.equal(run(css).status, 1, "a fresh repo lints whole");
  git("add", "-A");
  git("commit", "-qm", "legacy");

  // 2. Unchanged tracked file: nothing in scope, nothing to block.
  assert.equal(changedLines(css).size, 0);
  assert.equal(run(css).status, 0, "an untouched file must not block");

  // 3. A clean line appended: the legacy hex stays, as a note, not a block.
  writeFileSync(css, legacy + ".c{color:var(--shine-color-fg)}\n");
  assert.deepEqual([...changedLines(css)], [3]);
  const clean = run(css);
  assert.equal(clean.status, 0, `touching one clean line must not repaint the file: ${clean.stderr}`);
  assert.match(clean.stderr, /pre-existing off-token value/, "legacy values are reported, not enforced");
  assert.doesNotMatch(clean.stderr, /BLOCK/);
  const hooked = hook(css);
  assert.doesNotMatch(hooked.stdout, /"decision":\s*"block"/, "hook mode must not block on legacy lines");
  assert.match(hooked.stdout, /pre-existing/);

  // 4. A new off-token line blocks, and only that line is named.
  writeFileSync(css, legacy + ".c{color:#00ff00}\n");
  const dirty = run(css);
  assert.equal(dirty.status, 1);
  assert.match(dirty.stderr, /legacy\.css:3 .*raw hex/);
  assert.doesNotMatch(dirty.stderr, /BLOCK .*legacy\.css:1 /, "the untouched legacy line must not be in the block list");
  assert.match(hook(css).stdout, /"decision":\s*"block"/);

  // 5. --all-lines and SHINE_LINT_SCOPE=file restore whole-file blocking.
  writeFileSync(css, legacy + ".c{color:var(--shine-color-fg)}\n");
  assert.equal(run("--all-lines", css).status, 1, "--all-lines must lint the whole file");
  assert.equal(spawnSync(process.execPath, [lint, css], { encoding: "utf8", env: { ...process.env, SHINE_LINT_SCOPE: "file" } }).status, 1);

  // 6. Untracked files are all new.
  const fresh = join(dir, "fresh.css");
  writeFileSync(fresh, ".z{color:#123456}\n");
  assert.equal(changedLines(fresh), null);
  assert.equal(run(fresh).status, 1, "an untracked file lints whole");

  // 7. Session baseline: a mid-turn commit must not launder this turn's values into
  //    "pre-existing". With a session id the diff runs against the commit the session
  //    started from; without one it runs against HEAD as before.
  const state = join(dir, "lint-state");
  const sessionEnv = { ...process.env, SHINE_LINT_SCOPE: "", SHINE_LINT_SESSION: "test-session", SHINE_LINT_STATE_DIR: state };
  writeFileSync(css, legacy + ".c{color:var(--shine-color-fg)}\n");
  const first = spawnSync(process.execPath, [lint, css], { encoding: "utf8", env: sessionEnv });
  assert.equal(first.status, 0, "clean edit under a session must not block");
  writeFileSync(css, legacy + ".c{color:var(--shine-color-fg)}\n.d{color:#abcdef}\n");
  git("add", "-A");
  git("commit", "-qm", "mid-turn commit carrying a violation");
  assert.equal(run(css).status, 0, "against HEAD the committed violation is invisible (the gap the baseline closes)");
  const afterCommit = spawnSync(process.execPath, [lint, css], { encoding: "utf8", env: sessionEnv });
  assert.equal(afterCommit.status, 1, "the session baseline still sees the committed violation");
  assert.match(afterCommit.stderr, /legacy\.css:4 .*raw hex/);
  const hookedSession = spawnSync(process.execPath, [lint], { encoding: "utf8", env: { ...process.env, SHINE_LINT_SCOPE: "", SHINE_LINT_STATE_DIR: state }, input: JSON.stringify({ hook_event_name: "PostToolUse", session_id: "test-session", tool_input: { file_path: css } }) });
  assert.match(hookedSession.stdout, /"decision":\s*"block"/, "hook mode derives the session from the event");
  // A baseline that is no longer an ancestor falls back to HEAD instead of erroring.
  writeFileSync(join(state, "orphan"), "");
  const orphanEnv = { ...sessionEnv, SHINE_LINT_SESSION: "orphan-session" };
  spawnSync(process.execPath, [lint, css], { encoding: "utf8", env: orphanEnv });
  git("checkout", "-q", "--orphan", "elsewhere");
  git("commit", "-qm", "unrelated history");
  writeFileSync(css, ".z{color:var(--shine-color-fg)}\n");
  assert.equal(spawnSync(process.execPath, [lint, css], { encoding: "utf8", env: orphanEnv }).status, 0, "a non-ancestor baseline falls back to HEAD");
  git("checkout", "-q", "-");
  git("checkout", "-q", "--", "legacy.css");

  // 8. Cursor contract: top-level file_path, exit 2 blocks, clean edits exit 0.
  writeFileSync(css, readFileSync(css, "utf8") + ".e{color:var(--shine-color-fg)}\n");
  const cursorClean = spawnSync(process.execPath, [lint], { encoding: "utf8", env: { ...process.env, SHINE_LINT_SCOPE: "" }, input: JSON.stringify({ hook_event_name: "afterFileEdit", conversation_id: "cursor-1", file_path: css }) });
  assert.equal(cursorClean.status, 0, `Cursor clean edit must not block: ${cursorClean.stderr}`);
  writeFileSync(css, readFileSync(css, "utf8") + ".f{color:#00ff00}\n");
  const cursorDirty = spawnSync(process.execPath, [lint], { encoding: "utf8", env: { ...process.env, SHINE_LINT_SCOPE: "" }, input: JSON.stringify({ hook_event_name: "afterFileEdit", conversation_id: "cursor-1", file_path: css }) });
  assert.equal(cursorDirty.status, 2, "Cursor blocks with exit 2");
  assert.match(cursorDirty.stderr, /raw hex/);

  // 9. scopeFindings keeps line-less findings (frontmatter, slop summaries).
  const scoped = scopeFindings("/x/a.css", { hard: ["/x/a.css:1  raw hex", "/x/a.css:9  raw hex", "/x/a.css  file-level"], soft: [] }, new Set([9]));
  assert.deepEqual(scoped.hard, ["/x/a.css:9  raw hex", "/x/a.css  file-level"]);
  assert.equal(scoped.preExisting, 1);

  console.log("design-lint scope PASS: touched lines block · legacy lines note · session baseline survives mid-turn commits · Cursor contract · untracked/fresh/--all-lines lint whole");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
