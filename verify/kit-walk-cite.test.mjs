#!/usr/bin/env node
/**
 * Kit-walk cite proof — HeroUI + Tailwind pages must be selectable and
 * retrievable for representative jobs (Justin absorb override 2026-10-09).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";

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

const herouiCount = templates.filter((t) => t.kit === "heroui" && t.selectable !== false).length;
assert.ok(herouiCount >= 80, `expected ≥80 live HeroUI rows, got ${herouiCount}`);

const mapPath = join(SHINE, "knowledge/kits/figma-library-map.json");
assert.ok(existsSync(mapPath), "figma-library-map.json missing");
const map = JSON.parse(readFileSync(mapPath, "utf8"));
assert.ok(map.heroUiDesignFiles?.some((f) => f.fileKey === "GAn1SrbKJYiKqz9SmHHCRm"), "HeroUI prefer fileKey missing from map");

function cite(job) {
  const r = spawnSync(process.execPath, [join(SHINE, "corpus/cite.mjs"), job], {
    encoding: "utf8",
    cwd: SHINE,
    env: process.env,
  });
  return `${r.stdout || ""}\n${r.stderr || ""}`;
}

const buttonOut = cite("heroui button");
assert.match(buttonOut, /heroui-button/, `cite "heroui button" should hit heroui-button:\n${buttonOut.slice(0, 800)}`);

const twOut = cite("flowbite sign up");
assert.match(twOut, /flowbite-sign-up/, `cite "flowbite sign up" should hit flowbite-sign-up:\n${twOut.slice(0, 800)}`);

const dashOut = cite("tailwind dashboard");
assert.match(dashOut, /flowbite-dashboard|tailadmin-dashboard|windmill-dashboard/, `cite "tailwind dashboard" should hit a Tailwind kit page:\n${dashOut.slice(0, 800)}`);

console.log(
  `kit-walk-cite.test.mjs: ok (${herouiCount} live HeroUI rows · button+signup+dashboard cites)`,
);
