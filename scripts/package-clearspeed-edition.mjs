#!/usr/bin/env node
/**
 * Package a portable ClearSpeed Shine edition for offline laptop install.
 *
 * Produces:
 *   ~/.local/share/shine/dist/shine-clearspeed-<sha7>-<profileHash12>.tgz
 *
 * The archive contains a full base release tree (with node_modules when present),
 * a pre-built edition overlay, install.mjs (offline), and receipt.json.
 *
 * Offline install (no network):
 *   tar -xzf shine-clearspeed-….tgz
 *   node shine-clearspeed-…/install.mjs
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
  chmodSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
const HOME = homedir();
const root = resolve(opt("--root") || join(HOME, ".local/share/shine"));
const outDir = resolve(opt("--out") || join(root, "dist"));
const mirror = opt("--mirror") || join(HOME, "Projects/shine-dist");

function sha256File(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

async function main() {
  const current = join(root, "current");
  if (!existsSync(current)) throw new Error(`missing base release at ${current}; run release.mjs first`);
  const base = realpathSync(current);
  const release = JSON.parse(readFileSync(join(base, "release.json"), "utf8"));
  const sha = release.sha;
  if (!sha) throw new Error("release.json missing sha");

  // Ensure edition exists for this base.
  const install = spawnSync(process.execPath, [join(SOURCE, "scripts/install-clearspeed-edition.mjs"), "--root", root, "--base", base, "--no-link", "--no-hooks"], {
    encoding: "utf8",
    cwd: SOURCE,
  });
  if (install.status !== 0) {
    throw new Error(install.stderr || install.stdout || "edition install failed");
  }
  const editionReport = JSON.parse(install.stdout);
  const edition = editionReport.edition;
  const profileHash = editionReport.profileHash;
  const short = `${sha.slice(0, 7)}-${profileHash.slice(0, 12)}`;
  const pkgName = `shine-clearspeed-${short}`;
  const stage = join(outDir, `.${pkgName}.${process.pid}`);
  const tgz = join(outDir, `${pkgName}.tgz`);

  mkdirSync(outDir, { recursive: true });
  rmSync(stage, { recursive: true, force: true });
  mkdirSync(join(stage, "release"), { recursive: true });
  mkdirSync(join(stage, "edition"), { recursive: true });

  // Copy release tree. Follow symlinks so the laptop gets real files.
  cpSync(base, join(stage, "release"), { recursive: true, dereference: true });
  // Edition: copy skill + manifest; runtime dirs are rewritten to point at packaged release on install.
  cpSync(join(edition, "skill"), join(stage, "edition/skill"), { recursive: true, dereference: true });
  cpSync(join(edition, "clearspeed-edition.json"), join(stage, "edition/clearspeed-edition.json"));

  const receipt = {
    version: 1,
    skill: "shine",
    profile: "clearspeed",
    sourceRevision: sha,
    skillSha256: release.skillSha256,
    profileHash,
    profileVersion: editionReport.profileVersion || "1",
    packagedAt: new Date().toISOString(),
    dependenciesInstalled: Boolean(release.dependenciesInstalled),
    package: pkgName,
  };
  writeFileSync(join(stage, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n");

  // Self-contained offline installer (does not import from SOURCE).
  const installer = `#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync, realpathSync, lstatSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const root = resolve(process.env.SHINE_ROOT || join(HOME, ".local/share/shine"));
const receipt = JSON.parse(readFileSync(join(HERE, "receipt.json"), "utf8"));
const sha = receipt.sourceRevision;
const profileHash = receipt.profileHash;
const releaseSrc = join(HERE, "release");
const editionSrc = join(HERE, "edition");

function linkOrReplace(path, target) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path) && !lstatSync(path).isSymbolicLink()) throw new Error("refusing to replace real path: " + path);
  const tmp = path + ".next." + process.pid;
  rmSync(tmp, { force: true });
  symlinkSync(target, tmp);
  renameSync(tmp, path);
}

function mergeHookEntries(existing, entries) {
  const list = Array.isArray(existing) ? existing : [];
  const blob = JSON.stringify(list);
  const next = [...list];
  for (const entry of entries) {
    const needle = entry._needle || entry.command || "";
    if (needle && blob.includes(needle)) continue;
    const { _needle, ...clean } = entry;
    next.push(clean);
  }
  return next;
}

function mergeHooks(file, shape, cursorTopLevel = false) {
  mkdirSync(dirname(file), { recursive: true });
  let conf = {};
  if (existsSync(file)) conf = JSON.parse(readFileSync(file, "utf8"));
  if (!conf.hooks || typeof conf.hooks !== "object") conf.hooks = {};
  for (const [key, entries] of Object.entries(shape)) {
    conf.hooks[key] = mergeHookEntries(conf.hooks[key], entries);
    if (cursorTopLevel) conf[key] = mergeHookEntries(conf[key], entries);
  }
  writeFileSync(file, JSON.stringify(conf, null, 2) + "\\n");
}

const release = join(root, "releases", sha);
const stageRelease = join(root, "releases", "." + sha + "." + process.pid);
mkdirSync(join(root, "releases"), { recursive: true });
if (!existsSync(release)) {
  rmSync(stageRelease, { recursive: true, force: true });
  cpSync(releaseSrc, stageRelease, { recursive: true });
  renameSync(stageRelease, release);
}
const current = join(root, "current");
const next = join(root, ".current." + process.pid);
rmSync(next, { force: true });
symlinkSync(release, next);
renameSync(next, current);

const editionName = sha + "-clearspeed-" + profileHash.slice(0, 12);
const edition = join(root, "editions", editionName);
const stageEd = join(root, "editions", "." + editionName + "." + process.pid);
mkdirSync(join(root, "editions"), { recursive: true });
rmSync(stageEd, { recursive: true, force: true });
mkdirSync(stageEd, { recursive: true });
for (const entry of readdirSync(release, { withFileTypes: true })) {
  if (entry.name === "skill") continue;
  symlinkSync(join(release, entry.name), join(stageEd, entry.name));
}
cpSync(join(editionSrc, "skill"), join(stageEd, "skill"), { recursive: true });
cpSync(join(editionSrc, "clearspeed-edition.json"), join(stageEd, "clearspeed-edition.json"));
// Rebind baseRelease identity to this machine's release sha (already matched).
const manifest = JSON.parse(readFileSync(join(stageEd, "clearspeed-edition.json"), "utf8"));
manifest.baseRelease = sha;
manifest.installedAt = new Date().toISOString();
writeFileSync(join(stageEd, "clearspeed-edition.json"), JSON.stringify(manifest, null, 2) + "\\n");

const { verifySkillDeployment } = await import(pathToFileURL(join(release, "verify/edition.mjs")).href);
const check = verifySkillDeployment(join(stageEd, "skill"), release);
if (check.status !== "passed") {
  rmSync(stageEd, { recursive: true, force: true });
  throw new Error("edition validation failed: " + check.reason);
}
rmSync(edition, { recursive: true, force: true });
renameSync(stageEd, edition);
const latest = join(root, "editions/clearspeed-current");
rmSync(latest, { force: true });
symlinkSync(edition, latest);

const skill = join(edition, "skill");
for (const path of [join(HOME, ".cursor/skills/shine"), join(HOME, ".claude/skills/shine"), join(HOME, ".agents/skills/shine")]) {
  linkOrReplace(path, skill);
}
for (const path of [
  join(HOME, ".cursor/agents/shine-ux.md"),
  join(HOME, ".Codex/agents/shine-ux.md"),
  join(HOME, ".claude/agents/shine-ux.md"),
  join(HOME, ".agents/agents/shine-ux.md"),
]) {
  linkOrReplace(path, join(edition, "agents/shine-ux.md"));
}

mergeHooks(join(HOME, ".cursor/hooks.json"), {
  afterFileEdit: [{ command: "$HOME/.cursor/skills/shine/run-hook.sh design-lint.mjs", timeout: 15, _needle: "design-lint.mjs" }],
  stop: [{ command: "$HOME/.cursor/skills/shine/run-hook.sh stop-sweep.mjs", timeout: 30, _needle: "stop-sweep.mjs" }],
  sessionStart: [{ command: "$HOME/.cursor/skills/shine/run-hook.sh doctor.mjs --quiet", timeout: 30, _needle: "doctor.mjs" }],
}, true);
mergeHooks(join(HOME, ".Codex/hooks.json"), {
  PostToolUse: [{ matcher: "Edit|Write|MultiEdit", hooks: [{ type: "command", command: "$HOME/.agents/skills/shine/run-hook.sh design-lint.mjs", timeout: 15, statusMessage: "shine design-lint" }], _needle: "design-lint.mjs" }],
  Stop: [{ hooks: [{ type: "command", command: "$HOME/.agents/skills/shine/run-hook.sh stop-sweep.mjs", timeout: 20, statusMessage: "shine stop sweep" }], _needle: "stop-sweep.mjs" }],
  SessionStart: [{ hooks: [{ type: "command", command: "$HOME/.agents/skills/shine/run-hook.sh doctor.mjs --quiet", timeout: 30, statusMessage: "shine doctor" }], _needle: "doctor.mjs" }],
});
mergeHooks(join(HOME, ".claude/settings.json"), {
  PostToolUse: [{ matcher: "Edit|Write|MultiEdit", hooks: [{ type: "command", command: "$HOME/.claude/skills/shine/run-hook.sh design-lint.mjs", timeout: 15, statusMessage: "shine design-lint" }], _needle: "shine/run-hook.sh design-lint" }],
  Stop: [{ hooks: [{ type: "command", command: "$HOME/.claude/skills/shine/run-hook.sh stop-sweep.mjs", timeout: 20, statusMessage: "shine stop sweep" }], _needle: "shine/run-hook.sh stop-sweep" }],
  SessionStart: [{ hooks: [{ type: "command", command: "$HOME/.claude/skills/shine/run-hook.sh doctor.mjs --quiet", timeout: 30, statusMessage: "shine doctor" }], _needle: "shine/run-hook.sh doctor" }],
});

const doctor = spawnSync(process.execPath, [join(release, "verify/doctor.mjs"), "--quiet"], { encoding: "utf8", cwd: release, timeout: 120000 });
const final = verifySkillDeployment(skill, release);
const report = {
  status: final.status,
  kind: final.kind,
  baseRelease: sha,
  profileHash,
  edition,
  skill: realpathSync(skill),
  doctorExit: doctor.status,
  receipt,
};
console.log(JSON.stringify(report, null, 2));
if (final.status !== "passed") process.exit(1);
`;
  writeFileSync(join(stage, "install.mjs"), installer);
  chmodSync(join(stage, "install.mjs"), 0o755);
  writeFileSync(
    join(stage, "README.md"),
    `# ClearSpeed Shine edition (${short})

Offline install (no network required):

\`\`\`sh
tar -xzf ${pkgName}.tgz
node ${pkgName}/install.mjs
\`\`\`

This installs the immutable base release, builds/links the ClearSpeed edition under
\`~/.local/share/shine/editions/\`, points Cursor / Claude / Codex skill symlinks at the
edition skill, merges hooks, and runs \`verify/edition.mjs\`.

Identity: base \`${sha}\` · profileHash \`${profileHash}\`
`,
  );

  const named = join(outDir, pkgName);
  rmSync(named, { recursive: true, force: true });
  renameSync(stage, named);

  // First pass receipt without archive hash; second pass after tar.
  writeFileSync(join(named, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
  rmSync(tgz, { force: true });
  const tar1 = spawnSync("tar", ["-czf", tgz, "-C", outDir, pkgName], { encoding: "utf8" });
  if (tar1.status !== 0) throw new Error(tar1.stderr || "tar failed");
  receipt.archiveSha256 = sha256File(tgz);
  receipt.archiveBytes = readFileSync(tgz).byteLength;
  writeFileSync(join(named, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n");
  const tar2 = spawnSync("tar", ["-czf", tgz, "-C", outDir, pkgName], { encoding: "utf8" });
  if (tar2.status !== 0) throw new Error(tar2.stderr || "tar rebuild failed");
  receipt.archiveSha256 = sha256File(tgz);
  receipt.archiveBytes = readFileSync(tgz).byteLength;
  writeFileSync(join(outDir, `${pkgName}.receipt.json`), JSON.stringify(receipt, null, 2) + "\n");
  writeFileSync(join(named, "receipt.json"), JSON.stringify(receipt, null, 2) + "\n");

  mkdirSync(mirror, { recursive: true });
  cpSync(tgz, join(mirror, basename(tgz)));
  cpSync(join(outDir, `${pkgName}.receipt.json`), join(mirror, `${pkgName}.receipt.json`));
  writeFileSync(join(mirror, "LATEST"), `${basename(tgz)}\n`);

  console.log(
    JSON.stringify(
      {
        tgz,
        mirror: join(mirror, basename(tgz)),
        receipt,
        edition,
        base,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.stack || String(error));
  process.exit(1);
});
