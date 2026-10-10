#!/usr/bin/env node
/**
 * Kit-walk cite proof — HeroUI + Tailwind pages must be selectable and
 * retrievable for representative jobs. Doctor-gated against green theater:
 * Shot paths, no clone packs, primary cite for critical jobs, named-kit gaps.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";
import { referenceHealth } from "../corpus/reference-health.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(SHINE, "corpus/templates.json"), "utf8"));
const templates = catalog.templates || catalog;
const byId = Object.fromEntries(templates.map((t) => [t.id, t]));

assert.ok(byId["heroui-button"], "heroui-button atom missing from catalog");
assert.notEqual(byId["heroui-button"].selectable, false, "heroui-button must be live");
assert.equal(byId["heroui-button"].kit, "heroui");

assert.ok(byId["heroui-next-app"], "heroui-next-app row missing");
assert.notEqual(byId["heroui-next-app"].selectable, false, "heroui-next-app must be un-retired");

assert.ok(byId["flowbite-sign-up"], "flowbite-sign-up missing — Tailwind kit-walk gap");
assert.ok(byId["tailadmin-signup"], "tailadmin-signup missing");
assert.ok(byId["heroui-table"], "heroui-table missing");
assert.ok(byId["heroui-modal"], "heroui-modal missing");

// Page-true marketing keepers must be live; pricing + aliases stay retired.
for (const id of ["heroui-home", "heroui-about", "heroui-docs", "heroui-blog"]) {
  assert.notEqual(byId[id]?.selectable, false, `${id} must be live after page-true harvest`);
}
assert.equal(byId["heroui-pricing"]?.selectable, false, "heroui-pricing must stay retired (404 gap)");
for (const id of [
  "heroui-menu",
  "heroui-menu-item",
  "heroui-menu-section",
  "heroui-list-box-item",
  "heroui-list-box-section",
  "heroui-tag",
  "heroui-switch-group",
]) {
  assert.equal(byId[id]?.selectable, false, `${id} must be retired (alias shared-shot pack)`);
}
assert.equal(byId["heroui-empty-state"]?.selectable, false, "heroui-empty-state stays retired");
assert.ok(
  (byId["heroui-header"]?.jobs || []).includes("navbar"),
  "heroui-header must carry navbar job for cite",
);

const herouiLive = templates.filter((t) => t.kit === "heroui" && t.selectable !== false);
assert.ok(herouiLive.length >= 60, `expected ≥60 live HeroUI rows after retirements, got ${herouiLive.length}`);

// No two selectable heroui packs may share a shot SHA (clone / alias landfill).
const shaToIds = new Map();
for (const row of herouiLive) {
  const shot = join(SHINE, "corpus/packs", row.id, "shot.png");
  if (!existsSync(shot)) continue;
  const sha = createHash("sha256").update(readFileSync(shot)).digest("hex");
  const list = shaToIds.get(sha) || [];
  list.push(row.id);
  shaToIds.set(sha, list);
}
const shared = [...shaToIds.entries()].filter(([, ids]) => ids.length > 1);
assert.equal(
  shared.length,
  0,
  `selectable HeroUI packs must not share shot SHA: ${shared.map(([sha, ids]) => `${sha.slice(0, 12)}→${ids.join(",")}`).join("; ")}`,
);

// Page-true marketing packs must have distinct shot SHAs from each other.
const mktIds = ["heroui-home", "heroui-about", "heroui-docs", "heroui-blog"];
const mktShas = mktIds.map((id) => {
  const shot = join(SHINE, "corpus/packs", id, "shot.png");
  assert.ok(existsSync(shot), `${id} shot missing`);
  return createHash("sha256").update(readFileSync(shot)).digest("hex");
});
assert.equal(new Set(mktShas).size, mktIds.length, `marketing shots must be unique: ${mktShas.map((s) => s.slice(0, 12)).join(",")}`);

// Keeper health must bind real selector/text/source — not theater.
const buttonHealth = referenceHealth(SHINE, "heroui-button");
assert.equal(buttonHealth.status, "passed", `heroui-button health: ${buttonHealth.reasons?.join("; ")}`);
for (const id of mktIds) {
  const h = referenceHealth(SHINE, id);
  assert.equal(h.status, "passed", `${id} health must pass after page-true harvest: ${h.reasons?.join("; ")}`);
}
for (const id of ["heroui-pricing", "heroui-menu-item"]) {
  const h = referenceHealth(SHINE, id);
  assert.equal(h.status, "failed", `${id} health must fail (gap/alias), got ${h.status}`);
}

const mapPath = join(SHINE, "knowledge/kits/figma-library-map.json");
assert.ok(existsSync(mapPath), "figma-library-map.json missing");
const map = JSON.parse(readFileSync(mapPath, "utf8"));
assert.ok(map.heroUiDesignFiles?.some((f) => f.fileKey === "GAn1SrbKJYiKqz9SmHHCRm"), "HeroUI prefer fileKey missing from map");

function cite(job, extraArgs = []) {
  const r = spawnSync(process.execPath, [join(SHINE, "corpus/cite.mjs"), ...extraArgs, job], {
    encoding: "utf8",
    cwd: SHINE,
    env: process.env,
  });
  return { code: r.status ?? 1, out: `${r.stdout || ""}\n${r.stderr || ""}` };
}

function assertPrimaryCite(job, idPattern, label = job) {
  const { code, out } = cite(job);
  assert.equal(code, 0, `cite ${JSON.stringify(label)} exit ${code}:\n${out.slice(0, 800)}`);
  assert.match(out, new RegExp(`Template: ${idPattern}`), `cite ${JSON.stringify(label)} primary Template:\n${out.slice(0, 800)}`);
  assert.match(out, /Shot: \S+shot\.png/, `cite ${JSON.stringify(label)} must emit Shot path:\n${out.slice(0, 800)}`);
  assert.doesNotMatch(out, /Shot: none/, `cite ${JSON.stringify(label)} must not be Shot:none`);
}

assertPrimaryCite("heroui button", "heroui-button");
assertPrimaryCite("heroui navbar", "heroui-header");
assertPrimaryCite("heroui about", "heroui-about");
assertPrimaryCite("heroui docs", "heroui-docs");
assertPrimaryCite("heroui home", "heroui-home");
assertPrimaryCite("tailgrids forms", "figma-tailgrids-form-elements");
assertPrimaryCite("flowbite sign up", "flowbite-sign-up");

const dashOut = cite("tailwind dashboard");
assert.equal(dashOut.code, 0, dashOut.out.slice(0, 400));
assert.match(
  dashOut.out,
  /Template: (flowbite-dashboard|tailadmin-dashboard|windmill-dashboard)/,
  `cite "tailwind dashboard" should hit a Tailwind kit page:\n${dashOut.out.slice(0, 800)}`,
);

// Named-kit gaps — refuse silent steal.
for (const [job, ban] of [
  ["heroui empty state", /Template: shadcn-empty-icon/],
  ["heroui pricing", /Template: (heroui-home|heroui-about|flowbite-|untitled-|tailadmin-)/],
  ["untitled dashboard", /Template: (tailadmin-dashboard|flowbite-dashboard)/],
  ["untitled settings", /Template: flowbite-settings/],
]) {
  const { code, out } = cite(job);
  assert.notEqual(code, 0, `cite ${JSON.stringify(job)} must gap (exit≠0), got ${code}`);
  assert.doesNotMatch(out, ban, `cite ${JSON.stringify(job)} must not steal:\n${out.slice(0, 800)}`);
  assert.match(out, /named|gap|nothing matches|no selectable/i, `cite ${JSON.stringify(job)} must explain gap:\n${out.slice(0, 800)}`);
}

// Clearspeed Operate edition still hits TW gold for decide jobs.
const operate = cite("Decide Pursue/Review/Dismiss", ["--edition", "clearspeed-operate"]);
assert.equal(operate.code, 0, operate.out.slice(0, 400));
assert.match(
  operate.out,
  /Template: (tailadmin-tables|flowbite-|untitled-|tailadmin-)/,
  `Operate decide must stay on TW gold:\n${operate.out.slice(0, 800)}`,
);

console.log(
  `kit-walk-cite.test.mjs: ok (${herouiLive.length} live HeroUI · shot-unique · navbar/forms/named-kit gaps · Operate TW gold)`,
);
