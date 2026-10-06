#!/usr/bin/env node
/**
 * Canonical ClearSpeed / Nucleus Shine edition installer.
 *
 * Builds a private overlay under ~/.local/share/shine/editions/<baseSha>-clearspeed-<profileHash>/
 * that keeps the skill name `shine`, injects Clearspeed profile instructions into SKILL.md,
 * validates with verify/edition.mjs, then points Cursor / Claude / Codex skill symlinks at
 * the edition (agent aliases stay on the base release runtime).
 *
 * Usage:
 *   node scripts/install-clearspeed-edition.mjs
 *   node scripts/install-clearspeed-edition.mjs --base ~/.local/share/shine/current
 *   node scripts/install-clearspeed-edition.mjs --root ~/.local/share/shine --link --hooks
 *   node scripts/install-clearspeed-edition.mjs --no-link   # materialize only
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
  lstatSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { homedir } from "node:os";
import { execFileSync, spawnSync } from "node:child_process";

const SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
const flag = (n) => args.includes(n);

const HOME = homedir();
const root = resolve(opt("--root") || join(HOME, ".local/share/shine"));
const baseArg = opt("--base");
const doLink = !flag("--no-link");
const doHooks = flag("--hooks") || (!flag("--no-hooks") && doLink);
const profileVersion = opt("--profile-version") || "1";

function loadEditionApi(base) {
  const editionPath = join(base, "verify/edition.mjs");
  if (!existsSync(editionPath)) {
    throw new Error(`edition validator missing at ${editionPath}`);
  }
  return import(pathToFileURL(editionPath).href);
}

function resolveBase() {
  if (baseArg) return realpathSync(resolve(baseArg));
  const current = join(root, "current");
  if (existsSync(current)) return realpathSync(current);
  // Dev fallback: install against this checkout (still writes edition under --root).
  if (existsSync(join(SOURCE, "skill/SKILL.md"))) return SOURCE;
  throw new Error("No Shine base release. Run node scripts/release.mjs first, or pass --base.");
}

function baseReleaseId(base) {
  const release = join(base, "release.json");
  if (existsSync(release)) {
    const sha = JSON.parse(readFileSync(release, "utf8")).sha;
    if (sha) return sha;
  }
  if (existsSync(join(base, ".git"))) {
    return execFileSync("git", ["-C", base, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  }
  return base.split("/").filter(Boolean).at(-1);
}

function linkOrReplace(path, target) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path) || (lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink())) {
    if (!lstatSync(path).isSymbolicLink()) {
      throw new Error(`refusing to replace a real path: ${path}`);
    }
  }
  const tmp = `${path}.edition-next.${process.pid}`;
  rmSync(tmp, { force: true });
  symlinkSync(target, tmp);
  renameSync(tmp, path);
}

function mergeHookEntries(existing, entries) {
  const list = Array.isArray(existing) ? existing : [];
  const blob = JSON.stringify(list);
  const next = [...list];
  for (const entry of entries) {
    const needle = entry._needle || entry.command || entry.hooks?.[0]?.command || "";
    if (needle && (blob.includes(needle) || blob.includes(String(needle).replaceAll("$HOME", HOME)))) continue;
    const { _needle, ...clean } = entry;
    next.push(clean);
  }
  return next;
}

function mergeHooks(file, shape, { cursorTopLevel = false } = {}) {
  mkdirSync(dirname(file), { recursive: true });
  let conf = {};
  if (existsSync(file)) conf = JSON.parse(readFileSync(file, "utf8"));
  if (!conf.hooks || typeof conf.hooks !== "object") conf.hooks = {};
  for (const [key, entries] of Object.entries(shape)) {
    conf.hooks[key] = mergeHookEntries(conf.hooks[key], entries);
    // Cursor reads top-level afterFileEdit/stop/sessionStart; doctor also checks hooks.*.
    if (cursorTopLevel) conf[key] = mergeHookEntries(conf[key], entries);
  }
  writeFileSync(file, JSON.stringify(conf, null, 2) + "\n");
}

function cursorHookShape() {
  const cmd = (tool) => `$HOME/.cursor/skills/shine/run-hook.sh ${tool}`;
  return {
    afterFileEdit: [{ command: cmd("design-lint.mjs"), timeout: 15, _needle: "design-lint.mjs" }],
    stop: [{ command: cmd("stop-sweep.mjs"), timeout: 30, _needle: "stop-sweep.mjs" }],
    sessionStart: [{ command: cmd("doctor.mjs --quiet"), timeout: 30, _needle: "doctor.mjs" }],
  };
}

function codexHookShape() {
  const cmd = (tool) => `$HOME/.agents/skills/shine/run-hook.sh ${tool}`;
  return {
    PostToolUse: [
      {
        matcher: "Edit|Write|MultiEdit",
        hooks: [
          {
            type: "command",
            command: cmd("design-lint.mjs"),
            timeout: 15,
            statusMessage: "shine design-lint",
          },
        ],
        _needle: "design-lint.mjs",
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command: cmd("stop-sweep.mjs"),
            timeout: 20,
            statusMessage: "shine stop sweep",
          },
        ],
        _needle: "stop-sweep.mjs",
      },
    ],
    SessionStart: [
      {
        hooks: [
          {
            type: "command",
            command: cmd("doctor.mjs --quiet"),
            timeout: 30,
            statusMessage: "shine doctor",
          },
        ],
        _needle: "doctor.mjs",
      },
    ],
  };
}

function claudeHookShape() {
  const cmd = (tool) => `$HOME/.claude/skills/shine/run-hook.sh ${tool}`;
  return {
    PostToolUse: [
      {
        matcher: "Edit|Write|MultiEdit",
        hooks: [
          {
            type: "command",
            command: cmd("design-lint.mjs"),
            timeout: 15,
            statusMessage: "shine design-lint",
          },
        ],
        _needle: "shine/run-hook.sh design-lint",
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command: cmd("stop-sweep.mjs"),
            timeout: 20,
            statusMessage: "shine stop sweep",
          },
        ],
        _needle: "shine/run-hook.sh stop-sweep",
      },
    ],
    SessionStart: [
      {
        hooks: [
          {
            type: "command",
            command: cmd("doctor.mjs --quiet"),
            timeout: 30,
            statusMessage: "shine doctor",
          },
        ],
        _needle: "shine/run-hook.sh doctor",
      },
    ],
  };
}

async function main() {
  const base = resolveBase();
  const { profileDigest, editionSkill, verifySkillDeployment } = await loadEditionApi(base);
  const sha = baseReleaseId(base);
  const profileSrc = join(base, "skill/references/clearspeed");
  if (!existsSync(join(profileSrc, "profile-instructions.md"))) {
    throw new Error(`Clearspeed profile missing at ${profileSrc}/profile-instructions.md`);
  }
  const profileHash = profileDigest(profileSrc);
  const editionName = `${sha}-clearspeed-${profileHash.slice(0, 12)}`;
  const editionsRoot = join(root, "editions");
  const edition = join(editionsRoot, editionName);
  const stage = join(editionsRoot, `.${editionName}.${process.pid}`);

  mkdirSync(editionsRoot, { recursive: true });
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(stage, { recursive: true });

  const brandJson = join(profileSrc, "brand.json");
  const hasBrandOverlay = existsSync(brandJson);

  // Runtime entries (everything except skill) must resolve to the base release,
  // except tokens when the Clearspeed profile owns a brand.json overlay.
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (entry.name === "skill") continue;
    if (entry.name === "tokens" && hasBrandOverlay) {
      cpSync(join(base, entry.name), join(stage, entry.name), { recursive: true, dereference: true });
      continue;
    }
    if (entry.name === "node_modules" || entry.name === ".git") {
      // Prefer symlink to keep edition light; doctor/verify still resolve through base.
      symlinkSync(join(base, entry.name), join(stage, entry.name));
      continue;
    }
    symlinkSync(join(base, entry.name), join(stage, entry.name));
  }

  // Skill tree: inherit base bytes, then replace SKILL.md with the edition loader.
  cpSync(join(base, "skill"), join(stage, "skill"), { recursive: true });
  writeFileSync(join(stage, "skill/SKILL.md"), editionSkill(base, profileSrc));

  if (hasBrandOverlay) {
    const apply = spawnSync(
      process.execPath,
      [
        join(SOURCE, "scripts/apply-clearspeed-brand.mjs"),
        "--tokens",
        join(stage, "tokens"),
        "--brand",
        brandJson,
      ],
      { encoding: "utf8", cwd: SOURCE },
    );
    if (apply.status !== 0) {
      rmSync(stage, { recursive: true, force: true });
      throw new Error(apply.stderr || apply.stdout || "Clearspeed brand apply failed");
    }
  }

  const manifest = {
    skill: "shine",
    profile: "clearspeed",
    profileVersion,
    baseRelease: sha,
    profileHash,
    brandAccent: hasBrandOverlay ? "#ED5925" : null,
    createdAt: new Date().toISOString(),
    sourceBase: base,
  };
  writeFileSync(join(stage, "clearspeed-edition.json"), JSON.stringify(manifest, null, 2) + "\n");

  const check = verifySkillDeployment(join(stage, "skill"), base);
  if (check.status !== "passed") {
    rmSync(stage, { recursive: true, force: true });
    throw new Error(`edition validation failed: ${check.reason}`);
  }

  rmSync(edition, { recursive: true, force: true });
  renameSync(stage, edition);

  // Convenience pointer for "latest clearspeed edition on this machine".
  const latest = join(editionsRoot, "clearspeed-current");
  rmSync(latest, { force: true });
  symlinkSync(edition, latest);

  const skillPath = join(edition, "skill");
  const links = {};
  if (doLink) {
    for (const [name, path] of [
      ["cursor", join(HOME, ".cursor/skills/shine")],
      ["claude", join(HOME, ".claude/skills/shine")],
      ["codex", join(HOME, ".agents/skills/shine")],
    ]) {
      linkOrReplace(path, skillPath);
      links[name] = { path, target: realpathSync(path) };
    }
    // Agent aliases always resolve through the edition runtime → base agents.
    for (const [name, path] of [
      ["cursor-agent", join(HOME, ".cursor/agents/shine-ux.md")],
      ["codex-agent", join(HOME, ".Codex/agents/shine-ux.md")],
      ["claude-agent", join(HOME, ".claude/agents/shine-ux.md")],
      ["agents-agent", join(HOME, ".agents/agents/shine-ux.md")],
    ]) {
      linkOrReplace(path, join(edition, "agents/shine-ux.md"));
      links[name] = { path, target: realpathSync(path) };
    }
  }

  if (doHooks) {
    mergeHooks(join(HOME, ".cursor/hooks.json"), cursorHookShape(), { cursorTopLevel: true });
    mergeHooks(join(HOME, ".Codex/hooks.json"), codexHookShape());
    mergeHooks(join(HOME, ".claude/settings.json"), claudeHookShape());
  }

  const final = verifySkillDeployment(skillPath, base);
  const report = {
    status: final.status,
    kind: final.kind,
    edition,
    base,
    baseRelease: sha,
    profileHash,
    profileVersion,
    links,
    hooks: doHooks,
  };
  console.log(JSON.stringify(report, null, 2));
  if (final.status !== "passed") process.exit(1);
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
