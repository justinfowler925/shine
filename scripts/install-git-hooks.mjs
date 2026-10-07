#!/usr/bin/env node
// Wire the skill-listing pre-commit bite into .git/hooks/pre-commit.
// Idempotent. Safe to run from npm prepare (including CI checkouts).
//
// Does not overwrite an unrelated existing pre-commit unless it already points
// at our hook (or is missing). Agents and humans who already have a custom
// pre-commit keep it; they can still run: npm run skill-listing -- --check

import { existsSync, lstatSync, mkdirSync, readFileSync, symlinkSync, unlinkSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOOK_SRC = join(ROOT, "hooks/git-pre-commit-skill-listing.sh");
const GIT_DIR = join(ROOT, ".git");
const HOOK_DST = join(GIT_DIR, "hooks/pre-commit");

if (!existsSync(GIT_DIR) || !existsSync(HOOK_SRC)) process.exit(0);
if (!lstatSync(GIT_DIR).isDirectory()) process.exit(0); // worktree gitfile — skip

mkdirSync(dirname(HOOK_DST), { recursive: true });

const marker = "git-pre-commit-skill-listing.sh";
if (existsSync(HOOK_DST)) {
  try {
    const body = readFileSync(HOOK_DST, "utf8");
    if (!body.includes(marker)) {
      console.log("install-git-hooks: existing .git/hooks/pre-commit left alone (not ours)");
      process.exit(0);
    }
    unlinkSync(HOOK_DST);
  } catch {
    process.exit(0);
  }
}

const rel = relative(dirname(HOOK_DST), HOOK_SRC);
symlinkSync(rel, HOOK_DST);
console.log(`install-git-hooks: pre-commit → ${rel}`);
