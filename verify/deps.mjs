// Dependency resolution for shine's verification loop.
//
// measure.mjs, doctor.mjs, verify-propagation.mjs and sitediff.mjs each held a
// hardcoded absolute path into a *different* repo's node_modules
// historically borrowed from a sibling project's node_modules. That coupling
// broke when the sibling stopped carrying sharp — shine now declares its own deps.
//
// shine has its own package.json now. This module resolves from it first and
// keeps the sibling checkout only as a fallback, so an un-installed shine still
// measures instead of erroring. When neither has it, the failure names the
// package and the command rather than throwing MODULE_NOT_FOUND from a path the
// reader has no reason to recognise.

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SHINE_ROOT = dirname(HERE);

// shine root, then tokens/ — run `npm install` at the repo root.
const CANDIDATES = [
  join(SHINE_ROOT, "node_modules"),
  join(SHINE_ROOT, "tokens", "node_modules"),
];

const roots = CANDIDATES.filter((p) => existsSync(p));

/** Absolute path to a file inside a package, or null. */
export function resolvePath(spec) {
  for (const root of roots) {
    try {
      return createRequire(join(root, "/")).resolve(spec);
    } catch {
      /* next root */
    }
  }
  return null;
}

function fail(spec) {
  const pkg = spec.split("/")[0];
  throw new Error(
    `shine: cannot resolve "${spec}".\n` +
      `  Looked in: ${roots.join("\n             ") || "(no candidate node_modules exists)"}\n` +
      `  Fix: cd ${SHINE_ROOT} && npm install\n` +
      `  (shine declares ${pkg} in its own package.json; the sibling-checkout path is a fallback only.)`,
  );
}

/** require() a package from the first root that has it. */
export function load(spec) {
  for (const root of roots) {
    try {
      return createRequire(join(root, "/"))(spec);
    } catch (err) {
      if (err?.code !== "MODULE_NOT_FOUND") throw err;
    }
  }
  return fail(spec);
}

/** Absolute path to a file inside a package, throwing the same guided error. */
export function pathTo(spec) {
  return resolvePath(spec) ?? fail(spec);
}

/**
 * NODE_PATH for a child process that needs the same resolution. Every root, so a
 * child inherits the fallback rather than only the first hit.
 */
export const NODE_PATH = roots.join(":");
