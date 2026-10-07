/**
 * S7 — sync-tokens rewrite bite.
 * Proves brand.json anchors, emit/check, and refusal to treat placeholder
 * indigo as ClearSpeed input. Plugin write uses CLEARSPEED_BRAND_ROOT.
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(ROOT, "scripts/sync-tokens.mjs");
const BRAND = join(ROOT, "skill/references/clearspeed/brand.json");
const KIT = join(ROOT, "skill/references/clearspeed/brand-tokens.json");

function run(args = [], env = {}) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

// Committed palette is Clearspeed (not placeholder indigo).
const brand = JSON.parse(readFileSync(BRAND, "utf8"));
assert.equal(String(brand.color.brand.action).toUpperCase(), "#ED5925");
assert.equal(String(brand.color.brand.anchor).toLowerCase(), "#0a1648");
assert.equal(String(brand.color.brand.navy).toLowerCase(), "#112578");

// Emit + check round-trip on the real tree (shine kit only).
const emit = run(["--no-plugin"]);
assert.equal(emit.status, 0, emit.stderr || emit.stdout);
assert.match(emit.stdout, /emitted/);
assert.ok(existsSync(KIT));
const kit = JSON.parse(readFileSync(KIT, "utf8"));
assert.equal(kit.tokens["color.brand.action"], "#ed5925");
assert.equal(kit.tokens["color.brand.anchor"], "#0a1648");
assert.equal(kit.source.brandJson, "skill/references/clearspeed/brand.json");
assert.match(kit.$comment, /Claude Design/);
assert.match(kit.retiredGenerator, /office\.json/);
assert.equal(kit.source.brandJson.includes("office.json"), false);
assert.equal(Object.hasOwn(kit.source, "office"), false);

const check = run(["--check", "--no-plugin"]);
assert.equal(check.status, 0, check.stderr || check.stdout);

// Refuse a brand.json missing ClearSpeed anchors.
const tmp = mkdtempSync(join(tmpdir(), "shine-s7-"));
try {
  mkdirSync(join(tmp, "scripts"), { recursive: true });
  mkdirSync(join(tmp, "skill/references/clearspeed"), { recursive: true });
  cpSync(SCRIPT, join(tmp, "scripts/sync-tokens.mjs"));
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
  assert.match(refuse.stderr, /not the Clearspeed palette|refusing/i);
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
  assert.equal(pk.tokens["color.brand.action"], "#ed5925");
  assert.match(pk.retiredGenerator || "", /retired/i);
  assert.equal(pk.source.brandJson, "skill/references/clearspeed/brand.json");
} finally {
  rmSync(plugin, { recursive: true, force: true });
}

console.log("PASS: sync-tokens emit/check, ClearSpeed anchors, placeholder refuse, plugin repoint");
