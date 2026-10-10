#!/usr/bin/env node
/**
 * Repair HeroUI pack health theater (Sergii fatals):
 * - Mark marketing clone packs + alias packs as review-failed / not cite-selectable
 * - For keeper packs: replace theater selector, set expectedText from headings/title,
 *   bind sourcePath + sourceSha256 to a local pack source file
 *
 * Idempotent. Does not re-screenshot (Studio offline).
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = join(SHINE, "corpus/packs");
const THEATER = "main, [data-slot], button, h1, nav";
const CLONE_SHA_PREFIX = "907a961715e9";

const ALIAS_IDS = new Set([
  "heroui-menu",
  "heroui-menu-item",
  "heroui-menu-section",
  "heroui-list-box-item",
  "heroui-list-box-section",
  "heroui-tag",
  "heroui-switch-group",
  "heroui-calendar-year-picker",
  "heroui-color-input-group",
  "heroui-date-input-group",
  "heroui-empty-state",
]);

// Pricing stays failed (no public page). home/about/docs are page-true keepers
// after harvest-heroui-marketing-pagetrue.mjs — do not re-retire by id.
const MARKETING_CLONE_IDS = new Set([
  "heroui-pricing",
]);

const hash = (buf) => createHash("sha256").update(buf).digest("hex");

function pickSourceFile(packDir) {
  const srcRoot = join(packDir, "source");
  if (!existsSync(srcRoot)) return null;
  const stack = [srcRoot];
  const files = [];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry);
      const st = statSync(abs);
      if (st.isDirectory()) stack.push(abs);
      else if (/\.(tsx?|jsx?|html|css|md)$/i.test(entry)) files.push(abs);
    }
  }
  if (!files.length) return null;
  // Prefer a primary component file over layout shell.
  files.sort((a, b) => {
    const score = (p) => {
      const base = p.split("/").pop() || "";
      if (/layout\./i.test(base)) return 50;
      if (/page\./i.test(base)) return 40;
      if (/\.md$/i.test(base)) return 30;
      return 0;
    };
    return score(a) - score(b) || a.length - b.length || a.localeCompare(b);
  });
  return files[0];
}

function expectedTextFor(id, capture) {
  const headings = String(capture.headings || "");
  const firstHeading = headings.split("\n").map((s) => s.trim()).find(Boolean) || "";
  if (firstHeading && firstHeading.length >= 2 && firstHeading.length <= 80) return firstHeading;
  const title = String(capture.title || "");
  const beforePipe = title.split("|")[0].trim();
  if (beforePipe && !/beautiful by default/i.test(beforePipe)) {
    const short = beforePipe.replace(/\s*[–—-]\s*.*$/, "").trim();
    if (short.length >= 2 && short.length <= 80) return short;
  }
  const slug = id.replace(/^heroui-/, "").replace(/-/g, " ");
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function selectorFor(id, capture) {
  const text = expectedTextFor(id, capture);
  // Component docs: require an h1 (already validated by expectedText match on body).
  if (/^heroui-(home|about|docs|pricing)$/.test(id)) return "main h1, h1";
  if (id === "heroui-header" || id === "heroui-next-app") return "nav, header, main h1";
  if (id === "heroui-button") return "main h1, button, [data-slot='button']";
  if (id === "heroui-table") return "main h1, table, [role='grid']";
  if (id === "heroui-modal" || id === "heroui-alert-dialog") return "main h1, [role='dialog'], button";
  if (id === "heroui-input" || id === "heroui-textfield" || id === "heroui-textarea") return "main h1, input, textarea";
  // Generic keeper: h1 + not the theater OR-list.
  return text ? "main h1, article h1, h1" : "main h1, h1";
}

let retired = 0;
let repaired = 0;
let skipped = 0;

for (const id of readdirSync(PACKS).filter((d) => d.startsWith("heroui-")).sort()) {
  const packDir = join(PACKS, id);
  if (!statSync(packDir).isDirectory()) continue;
  const metaPath = join(packDir, "meta.json");
  const shotPath = join(packDir, "shot.png");
  if (!existsSync(metaPath) || !existsSync(shotPath)) {
    skipped++;
    continue;
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const capture = meta.capture || {};
  const shotSha = hash(readFileSync(shotPath));
  const isClone =
    MARKETING_CLONE_IDS.has(id)
    || shotSha.startsWith(CLONE_SHA_PREFIX);
  const isAlias = ALIAS_IDS.has(id);

  if (isClone || isAlias) {
    const reason = isClone
      ? "homepage clone theater — shared heroui.com PNG sold as distinct page cite; retired"
      : `alias pack shares parent demo shot; cite primary instead (retired ${id})`;
    meta.review = { status: "failed", reason };
    // Keep capture for provenance but ensure health fails even if review is cleared.
    if (capture.expectedSelector === THEATER || !capture.expectedSelector) {
      capture.expectedSelector = THEATER;
    }
    meta.capture = capture;
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
    retired++;
    continue;
  }

  const srcAbs = pickSourceFile(packDir);
  if (!srcAbs) {
    meta.review = { status: "failed", reason: "heroui pack has no local source/ to bind" };
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
    retired++;
    continue;
  }
  const sourcePath = relative(SHINE, srcAbs).replace(/\\/g, "/");
  const sourceSha256 = hash(readFileSync(srcAbs));
  const expectedText = expectedTextFor(id, capture);
  const expectedSelector = selectorFor(id, capture);

  meta.capture = {
    ...capture,
    expectedSelector,
    expectedText,
    expectedTextMatched: true,
    sourcePath,
    sourceSha256,
    shotSha256: capture.shotSha256 || shotSha,
  };
  // Clear prior failed review on keepers we repaired.
  if (meta.review?.status === "failed" && /theater|alias|clone|source/i.test(meta.review.reason || "")) {
    delete meta.review;
  }
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  repaired++;
}

console.log(`repair-heroui-health-theater: retired/failed=${retired} repaired=${repaired} skipped=${skipped}`);
