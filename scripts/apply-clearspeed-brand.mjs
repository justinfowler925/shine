#!/usr/bin/env node
/**
 * Materialize Clearspeed brand tokens into an edition tokens tree.
 *
 * Uses skill/references/clearspeed/brand.json as SHINE_BRAND_OVERRIDE, builds the
 * brand lane into tokens/local/, promotes it over src/ + dist/brand, writes the
 * documented contrast exception, and scrubs leftover placeholder indigo hexes
 * so the edition tree carries Signal Orange (#ED5925) only.
 *
 * Usage:
 *   node scripts/apply-clearspeed-brand.mjs --tokens <edition/tokens> --brand <brand.json>
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  lstatSync,
  symlinkSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");

const tokensDir = resolve(opt("--tokens") || "");
const brandPath = resolve(opt("--brand") || "");

if (!tokensDir || !existsSync(tokensDir)) {
  console.error("apply-clearspeed-brand: --tokens <dir> required");
  process.exit(1);
}
if (!brandPath || !existsSync(brandPath)) {
  console.error("apply-clearspeed-brand: --brand <brand.json> required");
  process.exit(1);
}

const brand = JSON.parse(readFileSync(brandPath, "utf8"));
const action = brand?.color?.brand?.action;
const hover = brand?.color?.brand?.["action-hover"];
if (String(action).toUpperCase() !== "#ED5925") {
  console.error(`apply-clearspeed-brand: brand.action must be #ED5925 (got ${action})`);
  process.exit(1);
}
if (!hover) {
  console.error("apply-clearspeed-brand: brand.action-hover missing");
  process.exit(1);
}

const gen = existsSync(join(tokensDir, "scripts/gen-source.mjs"))
  ? join(tokensDir, "scripts/gen-source.mjs")
  : join(SOURCE, "tokens/scripts/gen-source.mjs");
const contrast = existsSync(join(tokensDir, "scripts/contrast-gate.mjs"))
  ? join(tokensDir, "scripts/contrast-gate.mjs")
  : join(SOURCE, "tokens/scripts/contrast-gate.mjs");

function hasTerrazzo(nm) {
  return (
    existsSync(join(nm, "@terrazzo/cli/bin/cli.js")) ||
    existsSync(join(nm, ".bin/terrazzo"))
  );
}

function ensureNm() {
  const nm = join(tokensDir, "node_modules");
  if (hasTerrazzo(nm)) return;
  // Staged edition copies often have an empty/incomplete node_modules — replace
  // with a symlink to a checkout that has @terrazzo/cli.
  if (existsSync(nm) || lstatSync(nm, { throwIfNoEntry: false })?.isSymbolicLink()) {
    rmSync(nm, { recursive: true, force: true });
  }
  for (const candidate of [
    join(SOURCE, "tokens/node_modules"),
    join(SOURCE, "node_modules"),
    join(dirname(tokensDir), "node_modules"),
  ]) {
    if (hasTerrazzo(candidate) || existsSync(candidate)) {
      symlinkSync(candidate, nm);
      return;
    }
  }
  throw new Error(`no node_modules for token build under ${tokensDir}`);
}

ensureNm();

const localDir = join(tokensDir, "local");
mkdirSync(localDir, { recursive: true });

// Clearspeed Signal Orange fails normal-text AA on white (3.47:1). Brand book
// locks the fill; navy/dark labels measure worse on APCA. Gate 3.0 + premise
// assertion (primary-fg still beats dark rivals) — residual risk: white label
// is WCAG AA only at large text (≥24px / 18pt bold).
writeFileSync(
  join(localDir, "brand.gates.json"),
  JSON.stringify(
    {
      overrides: [
        {
          fg: "color.primary-fg",
          bg: "color.primary",
          min: 3.0,
          why:
            "Clearspeed Signal Orange #ED5925 is brand-locked; white on it measures 3.47:1 (fails 4.5 normal-text AA). Navy/dark labels lose on APCA. Residual risk: compliant as large text only (≥24px).",
        },
        {
          fg: "color.primary-fg",
          bg: "color.primary-hover",
          min: 3.0,
          why:
            "Clearspeed action-hover #D24A1B is brand-locked with the orange fill; white measures ~4.46:1. Same APCA premise as the fill gate.",
        },
      ],
    },
    null,
    2,
  ) + "\n",
);

const genRun = spawnSync(process.execPath, [gen], {
  cwd: tokensDir,
  encoding: "utf8",
  env: { ...process.env, SHINE_BRAND_OVERRIDE: brandPath },
});
if (genRun.status !== 0) {
  console.error(genRun.stdout || "");
  console.error(genRun.stderr || "");
  throw new Error("gen-source with Clearspeed brand override failed");
}

let buildStatus = 1;
let buildOut = "";
const terrazzoBins = [
  join(tokensDir, "node_modules/@terrazzo/cli/bin/cli.js"),
  join(tokensDir, "node_modules/.bin/terrazzo"),
  join(SOURCE, "tokens/node_modules/@terrazzo/cli/bin/cli.js"),
  join(SOURCE, "tokens/node_modules/.bin/terrazzo"),
];
for (const terrazzoBin of terrazzoBins) {
  if (!existsSync(terrazzoBin)) continue;
  const build = spawnSync(process.execPath, [terrazzoBin, "build", "--config", "terrazzo.brand.mjs"], {
    cwd: tokensDir,
    encoding: "utf8",
  });
  buildStatus = build.status;
  buildOut = (build.stdout || "") + (build.stderr || "");
  if (buildStatus === 0) break;
}
if (buildStatus !== 0) {
  const npmBuild = spawnSync("npm", ["exec", "--", "terrazzo", "build", "--config", "terrazzo.brand.mjs"], {
    cwd: tokensDir,
    encoding: "utf8",
  });
  buildStatus = npmBuild.status;
  buildOut = (npmBuild.stdout || "") + (npmBuild.stderr || "");
}
if (buildStatus !== 0) {
  console.error(buildOut);
  throw new Error("terrazzo brand build failed");
}

const gate = spawnSync(process.execPath, [contrast], {
  cwd: tokensDir,
  encoding: "utf8",
});
if (gate.status !== 0) {
  console.error(gate.stdout || "");
  console.error(gate.stderr || "");
  throw new Error("contrast gate failed for Clearspeed brand lane");
}

const localBrandSrc = join(localDir, "brand.tokens.json");
const localBrandDist = join(localDir, "dist/brand");
if (!existsSync(localBrandSrc) || !existsSync(localBrandDist)) {
  throw new Error("Clearspeed brand build did not produce tokens/local brand outputs");
}

cpSync(localBrandSrc, join(tokensDir, "src/brand.tokens.json"));
rmSync(join(tokensDir, "dist/brand"), { recursive: true, force: true });
mkdirSync(join(tokensDir, "dist/brand"), { recursive: true });
cpSync(localBrandDist, join(tokensDir, "dist/brand"), { recursive: true });
cpSync(join(localDir, "brand.gates.json"), join(tokensDir, "src/brand.gates.json"));

function walkFiles(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

const PLACEHOLDER_ACTION = /#4338ca/gi;
const PLACEHOLDER_HOVER = /#3730a3/gi;
let scrubbed = 0;
for (const file of walkFiles(tokensDir)) {
  const before = readFileSync(file, "utf8");
  if (!/#4338ca/i.test(before) && !/#3730a3/i.test(before)) continue;
  const after = before.replace(PLACEHOLDER_ACTION, action).replace(PLACEHOLDER_HOVER, hover);
  if (after !== before) {
    writeFileSync(file, after);
    scrubbed++;
  }
}

rmSync(localDir, { recursive: true, force: true });

const proof = walkFiles(tokensDir)
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");
if (/#4338ca/i.test(proof)) {
  throw new Error("placeholder #4338ca still present in edition tokens after apply");
}
if (!/#ED5925/i.test(proof)) {
  throw new Error("Clearspeed #ED5925 missing from edition tokens after apply");
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      tokens: tokensDir,
      brand: brandPath,
      action,
      hover,
      scrubbedFiles: scrubbed,
    },
    null,
    2,
  ),
);
