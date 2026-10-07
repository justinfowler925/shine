/**
 * S7 — sync-tokens rewrite bite + edition brandAccent fail-closed.
 * Proves brand.json anchors, emit/check, refusal to treat placeholder
 * indigo as ClearSpeed input, kit brandAccent #ed5925, and edition
 * manifest brandAccent drift from #ED5925 fails closed.
 */
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  cpSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  CLEARSPEED_BRAND_ACCENT,
  assertClearspeedBrandAccent,
  brandAccentFromBrand,
} from "../core/clearspeed-brand-accent.mjs";
import { assertEditionBrandAccent } from "./edition.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(ROOT, "scripts/sync-tokens.mjs");
const BRAND = join(ROOT, "skill/references/clearspeed/brand.json");
const KIT = join(ROOT, "skill/references/clearspeed/brand-tokens.json");
const CORE_ACCENT = join(ROOT, "core/clearspeed-brand-accent.mjs");

function run(args = [], env = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

// Shared constant is Signal Orange.
assert.equal(CLEARSPEED_BRAND_ACCENT, "#ED5925");
assert.equal(assertClearspeedBrandAccent("#ed5925"), "#ED5925");
assert.throws(() => assertClearspeedBrandAccent("#4338ca"), /must be #ED5925/);

// Committed palette is Clearspeed (not placeholder indigo).
const brand = JSON.parse(readFileSync(BRAND, "utf8"));
assert.equal(brandAccentFromBrand(brand), "#ED5925");
assert.equal(String(brand.color.brand.action).toUpperCase(), "#ED5925");
assert.equal(String(brand.color.brand.anchor).toLowerCase(), "#0a1648");
assert.equal(String(brand.color.brand.navy).toLowerCase(), "#112578");

// Emit + check round-trip on the real tree (shine kit only).
const emit = run(["--no-plugin"]);
assert.equal(emit.status, 0, emit.stderr || emit.stdout);
assert.match(emit.stdout, /emitted/);
assert.ok(existsSync(KIT));
const kit = JSON.parse(readFileSync(KIT, "utf8"));
assert.equal(kit.brandAccent, "#ed5925");
assert.equal(kit.tokens["color.brand.action"], "#ed5925");
assert.equal(kit.tokens["color.brand.anchor"], "#0a1648");
assert.equal(kit.source.brandJson, "skill/references/clearspeed/brand.json");
assert.match(kit.$comment, /Claude Design/);
assert.match(kit.retiredGenerator, /office\.json/);
assert.equal(kit.source.brandJson.includes("office.json"), false);
assert.equal(Object.hasOwn(kit.source, "office"), false);

const check = run(["--check", "--no-plugin"]);
assert.equal(check.status, 0, check.stderr || check.stdout);

// Refuse a brand.json missing ClearSpeed anchors (incl. action ≠ #ED5925).
const tmp = mkdtempSync(join(tmpdir(), "shine-s7-"));
try {
  mkdirSync(join(tmp, "scripts"), { recursive: true });
  mkdirSync(join(tmp, "core"), { recursive: true });
  mkdirSync(join(tmp, "skill/references/clearspeed"), { recursive: true });
  cpSync(SCRIPT, join(tmp, "scripts/sync-tokens.mjs"));
  cpSync(CORE_ACCENT, join(tmp, "core/clearspeed-brand-accent.mjs"));
  writeFileSync(
    join(tmp, "skill/references/clearspeed/brand.json"),
    JSON.stringify({
      color: {
        brand: {
          action: "#4338ca",
          anchor: "#151d3b",
          navy: "#1e2a55",
          canvas: "#ffffff",
          "canvas-subtle": "#f7f7f8",
          hairline: "#ececee",
          text: "#111111",
          "text-muted": "#54586b",
          tint: "#f5f5fb",
          "action-hover": "#3730a3",
        },
      },
    }),
  );
  const refuse = spawnSync(process.execPath, [join(tmp, "scripts/sync-tokens.mjs"), "--no-plugin"], {
    encoding: "utf8",
  });
  assert.equal(refuse.status, 2, refuse.stderr || refuse.stdout);
  assert.match(refuse.stderr, /not the Clearspeed palette|refusing|#ED5925/i);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// Plugin refresh when CLEARSPEED_BRAND_ROOT points at a fake plugin tree.
const plugin = mkdtempSync(join(tmpdir(), "shine-s7-plugin-"));
try {
  mkdirSync(join(plugin, "skills/clearspeed-brand/references"), { recursive: true });
  const withPlugin = run([], { CLEARSPEED_BRAND_ROOT: plugin });
  assert.equal(withPlugin.status, 0, withPlugin.stderr || withPlugin.stdout);
  const pluginKit = join(plugin, "skills/clearspeed-brand/references/brand-tokens.json");
  assert.ok(existsSync(pluginKit));
  const pk = JSON.parse(readFileSync(pluginKit, "utf8"));
  assert.equal(pk.brandAccent, "#ed5925");
  assert.equal(pk.tokens["color.brand.action"], "#ed5925");
  assert.match(pk.retiredGenerator || "", /retired/i);
  assert.equal(pk.source.brandJson, "skill/references/clearspeed/brand.json");
} finally {
  rmSync(plugin, { recursive: true, force: true });
}

// Edition brandAccent fail-closed: drift / missing / mismatch vs brand.json.
const goodBrand = {
  color: { brand: { action: "#ED5925", anchor: "#0a1648", navy: "#112578" } },
};
assert.equal(
  assertEditionBrandAccent({ brandAccent: "#ED5925" }, goodBrand),
  "#ED5925",
);
assert.equal(
  assertEditionBrandAccent({ brandAccent: "#ed5925" }, goodBrand),
  "#ED5925",
);
assert.throws(
  () => assertEditionBrandAccent({ brandAccent: "#4338ca" }, goodBrand),
  /brandAccent must be #ED5925/,
);
assert.throws(
  () => assertEditionBrandAccent({}, goodBrand),
  /brandAccent must be #ED5925/,
);
assert.throws(
  () =>
    assertEditionBrandAccent(
      { brandAccent: "#ED5925" },
      { color: { brand: { action: "#112578" } } },
    ),
  /must be #ED5925/,
);
assert.equal(assertEditionBrandAccent({}, null), null);
assert.throws(
  () => assertEditionBrandAccent({ brandAccent: "#ED5925" }, null),
  /without brand\.json/,
);

console.log(
  "PASS: sync-tokens emit/check, ClearSpeed anchors, brandAccent kit, placeholder refuse, plugin repoint, edition brandAccent fail-closed",
);
