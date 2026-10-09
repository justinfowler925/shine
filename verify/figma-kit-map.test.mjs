#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getAntiPattern, validateAntiPattern } from "../knowledge/retrieve.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const map = JSON.parse(readFileSync(join(SHINE, "knowledge/kits/figma-library-map.json"), "utf8"));

assert.equal(map.version, 1);
assert.ok(Array.isArray(map.librariesSubscribed) && map.librariesSubscribed.length >= 5);
assert.ok(Array.isArray(map.silhouetteMap) && map.silhouetteMap.length >= 4);
assert.ok(map.heroUiDesignFiles?.length >= 1);
assert.equal(map.heroUiDesignFiles[0].fileKey, "GAn1SrbKJYiKqz9SmHHCRm");

const heroui = (map.namedKitsJustinMentioned || []).find((k) => k.name === "HeroUI");
assert.ok(heroui, "HeroUI named kit missing");
assert.ok(
  Array.isArray(heroui.harvestPacks) && heroui.harvestPacks.length >= 40,
  `HeroUI harvestPacks expected ≥40, got ${heroui.harvestPacks?.length}`,
);
assert.equal(heroui.deepHarvestFileKey, "GAn1SrbKJYiKqz9SmHHCRm");
const pages = JSON.parse(readFileSync(join(SHINE, "knowledge/kits/heroui-figma-pages.json"), "utf8"));
assert.equal(pages.fileKey, "GAn1SrbKJYiKqz9SmHHCRm");
assert.equal(pages.pageCount, 38);
assert.ok(pages.preferFileComplete === true);
assert.ok(pages.harvestedPackCount >= 40);

const bypass = getAntiPattern("kit-silhouette-bypass");
assert.ok(bypass, "kit-silhouette-bypass anti-pattern missing");
assert.deepEqual(validateAntiPattern(bypass), []);

console.log(
  `figma-kit-map.test.mjs: ok (${map.librariesSubscribed.length} libs · ${map.silhouetteMap.length} silhouettes · ${heroui.harvestPacks.length} heroui packs · ${pages.pageCount} pages)`,
);
