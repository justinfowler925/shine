#!/usr/bin/env node
// The per-edit lint blocks on the lines a change touched, not on every legacy
// value in the file. Whole-file blocking made "change one label" into "repaint
// the stylesheet" — the mechanism behind unrequested restyles. Untracked files
// and fresh repos still lint whole, and --all-lines restores the old scope.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

  // 7. scopeFindings keeps line-less findings (frontmatter, slop summaries).
  const scoped = scopeFindings("/x/a.css", { hard: ["/x/a.css:1  raw hex", "/x/a.css:9  raw hex", "/x/a.css  file-level"], soft: [] }, new Set([9]));
  assert.deepEqual(scoped.hard, ["/x/a.css:9  raw hex", "/x/a.css  file-level"]);
  assert.equal(scoped.preExisting, 1);

  console.log("design-lint scope PASS: touched lines block · legacy lines note · untracked/fresh/--all-lines lint whole");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
