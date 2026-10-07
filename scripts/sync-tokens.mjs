#!/usr/bin/env node
/**
 * Clearspeed brand-tokens sync (S7 rewrite) — versioned in shine.
 *
 * RETIRES the old clearspeed-brand/sync-tokens.mjs generator premise:
 *   - It claimed Shine `tokens/dist/clearspeed/office.json` was the machine
 *     authority and wrote the Cowork plugin kit from that path.
 *   - That path never existed (lane is `tokens/dist/brand`, placeholder
 *     indigo `#4338ca`). Dead checkouts (`~/Projects/shine`) made it ENOENT.
 *   - Brand authority since 2026-08-31 is Claude Design → clearspeed-brand
 *     plugin snapshots; Shine's ClearSpeed machine seam is
 *     `skill/references/clearspeed/brand.json` (edition overlay).
 *
 * This script:
 *   1. Reads ONLY `skill/references/clearspeed/brand.json` (never the public
 *      brand-lane office.json / placeholder indigo).
 *   2. Emits `skill/references/clearspeed/brand-tokens.json` for Shine-owned
 *      writers / drift checks.
 *   3. Optionally refreshes a local clearspeed-brand plugin kit when
 *      CLEARSPEED_BRAND_ROOT is set or ~/Projects/clearspeed-brand exists.
 *
 * Usage:
 *   node scripts/sync-tokens.mjs              # emit + verify anchors
 *   node scripts/sync-tokens.mjs --check      # exit 1 if committed kit drifts
 *   node scripts/sync-tokens.mjs --plugin-only # skip shine emit; plugin if present
 *   node scripts/sync-tokens.mjs --no-plugin  # shine emit only
 *
 * Exit: 0 ok · 1 drift (--check) · 2 refuse (bad/missing brand.json)
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import {
  CLEARSPEED_BRAND_ACCENT,
  brandAccentFromBrand,
  normalizeBrandAccent,
} from "../core/clearspeed-brand-accent.mjs";

const SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BRAND_JSON = join(SOURCE, "skill/references/clearspeed/brand.json");
const OUT_KIT = join(SOURCE, "skill/references/clearspeed/brand-tokens.json");
const CLAUDE_DESIGN =
  "https://claude.ai/design/p/555a765e-34c0-4b2c-acae-a9ba7e577005?via=share";

const REQUIRED_ANCHORS = {
  action: normalizeBrandAccent(CLEARSPEED_BRAND_ACCENT).toLowerCase(),
  anchor: "#0a1648",
  navy: "#112578",
};

const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const NO_PLUGIN = args.includes("--no-plugin");
const PLUGIN_ONLY = args.includes("--plugin-only");

function die(code, ...msg) {
  for (const m of msg) console.error(m);
  process.exit(code);
}

function hex(v) {
  return String(v || "").trim().toLowerCase();
}

function loadBrand() {
  if (!existsSync(BRAND_JSON)) {
    die(
      2,
      "sync-tokens: missing skill/references/clearspeed/brand.json",
      "",
      "Brand authority is Claude Design → clearspeed-brand plugin.",
      `  ${CLAUDE_DESIGN}`,
      "Shine's ClearSpeed machine seam is brand.json (edition overlay).",
      "Do NOT invent tokens/dist/clearspeed/office.json from the public",
      "placeholder brand lane (#4338ca).",
    );
  }
  const brand = JSON.parse(readFileSync(BRAND_JSON, "utf8"));
  const c = brand?.color?.brand || {};
  const action = hex(c.action);
  const anchor = hex(c.anchor);
  const navy = hex(c.navy);
  const missing = [];
  if (action !== REQUIRED_ANCHORS.action) missing.push(`action=${c.action || "(missing)"} (need ${REQUIRED_ANCHORS.action})`);
  if (anchor !== REQUIRED_ANCHORS.anchor) missing.push(`anchor=${c.anchor || "(missing)"} (need ${REQUIRED_ANCHORS.anchor})`);
  if (navy !== REQUIRED_ANCHORS.navy) missing.push(`navy=${c.navy || "(missing)"} (need ${REQUIRED_ANCHORS.navy})`);
  if (missing.length) {
    die(
      2,
      "sync-tokens: brand.json is not the Clearspeed palette — refusing to emit.",
      ...missing.map((m) => `  ${m}`),
      "",
      "Refuse path: never overwrite a kit from Shine's placeholder brand lane",
      "(tokens/dist/brand/office.json, #4338ca).",
      `Edition brandAccent must stay ${CLEARSPEED_BRAND_ACCENT}.`,
    );
  }
  // Fail closed: action is the edition brandAccent — must be Signal Orange.
  try {
    brandAccentFromBrand(brand);
  } catch (error) {
    die(2, `sync-tokens: ${error.message}`);
  }
  // Guard: public brand-lane office.json must never be treated as input.
  const deadOffice = join(SOURCE, "tokens/dist/clearspeed/office.json");
  const placeholderOffice = join(SOURCE, "tokens/dist/brand/office.json");
  if (existsSync(deadOffice)) {
    die(
      2,
      `sync-tokens: unexpected ${deadOffice}`,
      "A clearspeed office.json lane must not be reintroduced as generator input.",
      "Delete it; brand.json is the ClearSpeed machine seam.",
    );
  }
  if (existsSync(placeholderOffice)) {
    const office = JSON.parse(readFileSync(placeholderOffice, "utf8"));
    const primary = hex(office?.tokens?.["color.brand.action"] || office?.theme?.colors?.accent1);
    if (primary === "#4338ca") {
      // Expected public placeholder — do not use as source. Continue.
    }
  }
  return brand;
}

function fontStack(list, fallback) {
  const names = Array.isArray(list) && list.length ? list : fallback;
  return names.map((n) => (/^[a-z-]+$/i.test(n) ? n : `"${n}"`)).join(", ");
}

function buildKit(brand) {
  const c = brand.color.brand;
  const fonts = brand.font || {};
  const action = hex(c.action);
  const hover = hex(c["action-hover"]);
  const anchor = hex(c.anchor);
  const navy = hex(c.navy);
  const canvas = hex(c.canvas);
  const canvasSubtle = hex(c["canvas-subtle"]);
  const hairline = hex(c.hairline);
  const text = hex(c.text);
  const textMuted = hex(c["text-muted"]);
  const tint = hex(c.tint);

  const brandAccent = brandAccentFromBrand(brand).toLowerCase();
  return {
    $comment:
      "GENERATED BY shine scripts/sync-tokens.mjs from skill/references/clearspeed/brand.json. DO NOT EDIT. Narrative/visual SSOT remains Claude Design → clearspeed-brand plugin; this kit is the Shine-owned ClearSpeed machine seam for writers/drift.",
    source: {
      brandJson: "skill/references/clearspeed/brand.json",
      claudeDesign: CLAUDE_DESIGN,
      plugin: "clearspeed-brand (Cowork / Cursor skill snapshots)",
    },
    retiredGenerator:
      "Old clearspeed-brand/sync-tokens.mjs pointed at dead ~/Projects/shine/tokens/dist/clearspeed/office.json and treated Shine tokens as authority — retired 2026-10-07 (S7).",
    brandAccent,
    theme: {
      colors: {
        dk1: text,
        lt1: canvas,
        dk2: anchor,
        lt2: canvasSubtle,
        accent1: action,
        accent2: navy,
        hlink: navy,
        folHlink: textMuted,
      },
      fonts: {
        major: (fonts.display && fonts.display[0]) || "Cal Sans",
        minor: (fonts.body && fonts.body[0]) || "Roboto",
      },
    },
    tokens: {
      "color.bg": canvas,
      "color.bg-subtle": canvasSubtle,
      "color.border": hairline,
      "color.brand.action": action,
      "color.brand.action-hover": hover,
      "color.brand.anchor": anchor,
      "color.brand.canvas": canvas,
      "color.brand.canvas-subtle": canvasSubtle,
      "color.brand.hairline": hairline,
      "color.brand.navy": navy,
      "color.brand.text": text,
      "color.brand.text-muted": textMuted,
      "color.brand.tint": tint,
      "color.fg": text,
      "color.fg-muted": textMuted,
      "color.info": navy,
      "color.primary": action,
      "color.primary-fg": "#ffffff",
      "color.primary-hover": hover,
      "color.ring": navy,
      "font.body": fontStack(fonts.body, ["Roboto", "Helvetica Neue", "Arial", "sans-serif"]),
      "font.display": fontStack(fonts.display, ["Cal Sans", "Roboto", "sans-serif"]),
      "font.ui": fontStack(fonts.ui, ["Jura", "Roboto", "sans-serif"]),
    },
    wordmarkGradient: {
      from: "#2E4BFF",
      to: "#16E0FF",
      rule: "wordmark only — use bundled PNGs",
    },
  };
}

function serialize(kit) {
  return JSON.stringify(kit, null, 2) + "\n";
}

function writeKit(path, kit) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, serialize(kit));
}

function resolvePluginRoot() {
  if (NO_PLUGIN) return "";
  const env = process.env.CLEARSPEED_BRAND_ROOT;
  if (env && existsSync(env)) return resolve(env);
  const home = join(homedir(), "Projects/clearspeed-brand");
  if (existsSync(home)) return home;
  return "";
}

const brand = loadBrand();
const kit = buildKit(brand);
const body = serialize(kit);

let wrote = 0;

if (!PLUGIN_ONLY) {
  if (CHECK) {
    if (!existsSync(OUT_KIT)) {
      die(1, `sync-tokens --check: missing ${OUT_KIT} — run without --check to emit`);
    }
    const onDisk = readFileSync(OUT_KIT, "utf8");
    if (onDisk !== body) {
      die(1, `sync-tokens --check: ${OUT_KIT} drifts from brand.json — re-run scripts/sync-tokens.mjs`);
    }
    console.log(`OK  shine kit in sync (${OUT_KIT})`);
  } else {
    writeKit(OUT_KIT, kit);
    wrote++;
    console.log(`OK  emitted ${OUT_KIT}`);
  }
}

const pluginRoot = resolvePluginRoot();
if (pluginRoot) {
  const pluginOut = join(pluginRoot, "skills/clearspeed-brand/references/brand-tokens.json");
  // Alternate layout used by Cursor-synced skill copies
  const altOut = existsSync(join(pluginRoot, "references"))
    ? join(pluginRoot, "references/brand-tokens.json")
    : "";
  const targets = [pluginOut];
  if (altOut && altOut !== pluginOut) targets.push(altOut);

  for (const dest of targets) {
    if (!existsSync(dirname(dest)) && !existsSync(join(pluginRoot, "skills"))) {
      // Plugin root found but neither skills/ nor references/ — skip quietly.
      continue;
    }
    if (!existsSync(dirname(dest))) {
      mkdirSync(dirname(dest), { recursive: true });
    }
    if (CHECK) {
      if (!existsSync(dest)) {
        console.error(`sync-tokens --check: plugin kit missing ${dest}`);
        process.exit(1);
      }
      if (readFileSync(dest, "utf8") !== body) {
        console.error(`sync-tokens --check: plugin kit drifts ${dest}`);
        process.exit(1);
      }
      console.log(`OK  plugin kit in sync (${dest})`);
    } else {
      writeKit(dest, kit);
      wrote++;
      console.log(`OK  refreshed plugin kit ${dest}`);
    }
  }
} else if (!NO_PLUGIN && !CHECK) {
  console.log(
    "NOTE  no clearspeed-brand plugin root (set CLEARSPEED_BRAND_ROOT or ~/Projects/clearspeed-brand) — shine kit only",
  );
}

if (CHECK) {
  console.log("sync-tokens: check passed (brand.json anchors + kit byte-identity)");
} else {
  console.log(
    `sync-tokens: done (${wrote} write(s)). Authority: Claude Design → clearspeed-brand; Shine seam: brand.json.`,
  );
}
