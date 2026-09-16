// catalog.mjs — the one way to read the template catalog.
//
// corpus/templates.json is the public, generated, committed catalog. Licensed kits
// (Tailwind Plus, Untitled UI PRO, purchased Figma files) may be used in a
// consumer's end product but never redistributed, and Shine is a public repo with
// a public registry and site — so their rows live in corpus/templates.owned.json,
// which is gitignored, excluded from `git archive`, and merged here at read time.
// Every reader that used to open templates.json directly goes through this file so
// an owned row is cite-able, packet-eligible and compare-able exactly like a public
// one, without ever entering the published catalog.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SHINE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function loadCatalog(root = SHINE_ROOT) {
  const publicPath = join(root, "corpus/templates.json");
  const catalog = JSON.parse(readFileSync(publicPath, "utf8"));
  const ownedPath = join(root, "corpus/templates.owned.json");
  let owned = [];
  if (existsSync(ownedPath)) {
    owned = (JSON.parse(readFileSync(ownedPath, "utf8")).templates ?? []).map((row) => ({
      ...row,
      kind: "owned",
      publication: "private-reference-only",
    }));
  }
  const publicIds = new Set((catalog.templates ?? []).map((row) => row.id));
  const merged = [...(catalog.templates ?? []), ...owned.filter((row) => !publicIds.has(row.id))];
  return { ...catalog, templates: merged, publicCount: catalog.templates?.length ?? 0, ownedCount: merged.length - (catalog.templates?.length ?? 0) };
}

export function loadTemplates(root = SHINE_ROOT) {
  return loadCatalog(root).templates;
}
