#!/usr/bin/env node
// Resolve one compatible UI implementation path from the consumer's actual stack.
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = resolve(fileURLToPath(new URL("..", import.meta.url)));
// Which corpus kits a consumer on this recipe can actually build against. Read
// by the packet so the page reference and the build recipe cannot contradict
// each other. shadcn ships Tailwind-token primitives and Untitled UI React is
// the corpus table reference on the same footing, so a shadcn/TanStack consumer
// can port either. The kits that carried their own runtime and theming — MUI,
// Ant Design Pro, Carbon — were deleted from the corpus on 2026-08-31 rather
// than merely excluded here (docs/no-foreign-runtimes.md).
export const RECIPE_KITS = {
  "shadcn-tanstack": ["shadcn-registry", "untitled-ui-react"],
  native: ["untitled-ui-react", "shadcn-registry"],
  lex: ["slds"],
};

export const RECIPES = {
  "shadcn-tanstack": {
    packages: ["@tanstack/react-table"], cite: "shadcn-dashboard-01",
    imports: ["import { FlexRender, columnFilteringFeature, columnVisibilityFeature, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, rowPaginationFeature, rowSortingFeature, tableFeatures, useTable } from '@tanstack/react-table';"],
    api: ["useTable", "tableFeatures", "rowSortingFeature", "columnFilteringFeature", "columnVisibilityFeature", "rowPaginationFeature", "createSortedRowModel", "createFilteredRowModel", "createPaginatedRowModel"],
    contract: "shadcn Table chrome over TanStack Table state models",
  },
  native: {
    packages: [], cite: "untitled-table", imports: [], api: ["table"],
    contract: "semantic native table plus executable Shine DataGrid contract",
  },
  lex: {
    packages: [], cite: "lex-queue", imports: [], api: ["lightning-datatable"],
    contract: "lightning-datatable with onsort, row actions, loading/empty/error and pagination adapter",
  },
};

const allDeps = (pkg) => ({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
export function detectProject(project) {
  const root = resolve(project);
  const pkgPath = join(root, "package.json");
  const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf8")) : {};
  const deps = allDeps(pkg);
  const installed = [];
  if (deps["@tanstack/react-table"] || existsSync(join(root, "components.json"))) installed.push("shadcn-tanstack");
  const lex = existsSync(join(root, "sfdx-project.json")) || existsSync(join(root, "force-app"));
  const framework = lex ? "lex" : deps.next ? "next" : deps.vite ? "vite" : deps.react ? "react" : "native";
  const managers = [["pnpm-lock.yaml", "pnpm"], ["yarn.lock", "yarn"], ["bun.lockb", "bun"], ["package-lock.json", "npm"]];
  return { root, framework, packageManager: managers.find(([f]) => existsSync(join(root, f)))?.[1] || (pkgPath && existsSync(pkgPath) ? "npm" : "none"), installed };
}

const sourceContains = (cite, symbol) => {
  const manifestPath = join(SHINE, "corpus/packs", cite, "manifest.json");
  if (!existsSync(manifestPath)) return false;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return manifest.files.some((f) => {
    const p = join(SHINE, "corpus/packs", cite, "source", f.path);
    return existsSync(p) && readFileSync(p, "utf8").includes(symbol);
  });
};

export function verifyRecipeApi(recipe) {
  return recipe.api.filter((symbol) => !sourceContains(recipe.cite, symbol));
}

export function resolveIntegration(project, requested = "") {
  const detected = detectProject(project);
  const chosen = detected.framework === "lex" ? "lex" : detected.installed[0] || (detected.framework === "native" ? "native" : "");
  if (!chosen) throw new Error(`no supported UI kit is installed in ${detected.root}; choose explicitly before adding a design system`);
  if (detected.installed.length > 1 && !requested) throw new Error(`multiple installed UI kits (${detected.installed.join(", ")}); choose one explicitly`);
  const kit = requested || chosen;
  if (!RECIPES[kit]) throw new Error(`unsupported integration kit: ${kit}`);
  if (requested && chosen && requested !== chosen && detected.installed.length && !detected.installed.includes(requested))
    throw new Error(`refusing to add ${requested}; project already uses ${detected.installed.join(", ")}`);
  if (kit !== "native" && kit !== "lex" && !detected.installed.includes(kit)) throw new Error(`${kit} packages are not installed`);
  const recipe = RECIPES[kit];
  const missingPackages = recipe.packages.filter((name) => !existsSync(join(detected.root, "node_modules", ...name.split("/"), "package.json")));
  if (missingPackages.length) throw new Error(`${kit} packages are declared but not installed: ${missingPackages.join(", ")}`);
  const unverified = verifyRecipeApi(recipe);
  if (unverified.length) throw new Error(`recipe API not proven by ${recipe.cite}: ${unverified.join(", ")}`);
  const manifest = JSON.parse(readFileSync(join(SHINE, "corpus/packs", recipe.cite, "manifest.json"), "utf8"));
  return { ...detected, kit, recipe, provenance: { cite: recipe.cite, upstream: manifest.upstream, files: manifest.files.length } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); const opt = (n) => args.includes(n) ? args[args.indexOf(n) + 1] : "";
  try { console.log(JSON.stringify(resolveIntegration(opt("--project") || process.cwd(), opt("--kit")), null, 2)); }
  catch (err) { console.error(`integration: ${err.message}`); process.exit(1); }
}
