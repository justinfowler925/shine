#!/usr/bin/env node
// Resolve one compatible UI implementation path from the consumer's actual stack.
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

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
  shadcn: ["shadcn-registry", "untitled-ui-react"],
  tailwind: ["untitled-ui-react", "shadcn-registry"],
  "tailwind-tanstack": ["untitled-ui-react", "shadcn-registry"],
  tanstack: ["untitled-ui-react", "shadcn-registry"],
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

// Styling, interactive primitives and data state are independent capabilities.
RECIPES.shadcn = { packages: [], cite: "shadcn-dashboard-01", imports: [], api: [], contract: "installed shadcn controls; consumer tokens and layout; no table engine required" };
RECIPES.tailwind = { packages: ["tailwindcss"], cite: "untitled-table", imports: [], api: [], contract: "Tailwind layout and styling around existing consumer components and semantic HTML" };
RECIPES.tanstack = { ...RECIPES["shadcn-tanstack"], contract: "consumer table chrome over installed TanStack state; no shadcn imports" };
RECIPES["tailwind-tanstack"] = { ...RECIPES.tanstack, packages: ["tailwindcss", "@tanstack/react-table"], contract: "Tailwind table layout and styling over installed TanStack state; preserve consumer controls" };

const allDeps = (pkg) => ({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });
function cssPrefixes(root,entry){
  const prefixes=new Set(),seen=new Set();
  const visit=file=>{file=resolve(file);if(seen.has(file)||!existsSync(file)||!file.startsWith(root+"/"))return;seen.add(file);const css=readFileSync(file,"utf8").replace(/\/\*[\s\S]*?\*\//g,"");
    for(const match of css.matchAll(/@import\s+["']([^"']+)["']([^;]*);/g)){if(match[1].startsWith("tailwindcss"))prefixes.add(match[2].match(/prefix\(([^)]+)\)/)?.[1]||"");else if(match[1].startsWith("."))visit(resolve(dirname(file),match[1]));}
  };if(entry)visit(resolve(root,entry));return [...prefixes];
}
export function detectProject(project) {
  const root = resolve(project);
  const pkgPath = join(root, "package.json");
  const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf8")) : {};
  const deps = allDeps(pkg);
  const configPath = join(root, "components.json");
  const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : null;
  const tailwind = Boolean(deps.tailwindcss);
  const shadcn = Boolean(config);
  const tanstack = Boolean(deps["@tanstack/react-table"]);
  const installed = shadcn ? [tanstack ? "shadcn-tanstack" : "shadcn"] : tailwind ? [tanstack ? "tailwind-tanstack" : "tailwind"] : tanstack ? ["tanstack"] : [];
  const lex = existsSync(join(root, "sfdx-project.json")) || existsSync(join(root, "force-app"));
  const framework = lex ? "lex" : deps.next ? "next" : deps.vite ? "vite" : deps.react ? "react" : "native";
  const managers = [["pnpm-lock.yaml", "pnpm"], ["yarn.lock", "yarn"], ["bun.lock", "bun"], ["bun.lockb", "bun"], ["package-lock.json", "npm"]];
  const layers = {
    styling: { name: tailwind ? "tailwind" : "consumer-css", declaredVersion: deps.tailwindcss || null, css: config?.tailwind?.css || null, config: config?.tailwind?.config || null, prefix: config?.tailwind?.prefix || "", responsibility: "layout, spacing, typography, responsive and visual states; reuse consumer tokens" },
    components: { name: shadcn ? "shadcn" : "consumer", aliases: config?.aliases || {}, responsibility: "reuse installed controls and their keyboard, focus and accessibility behavior; preserve shared product components" },
    data: { name: tanstack ? "tanstack" : "consumer", declaredVersion: deps["@tanstack/react-table"] || null, responsibility: "table sorting, filtering, selection and pagination only when the workflow needs them" },
  };
  if(tailwind&&config?.tailwind?.css)layers.styling.cssPrefixes=cssPrefixes(root,config.tailwind.css);
  return { root, framework, packageManager: managers.find(([f]) => existsSync(join(root, f)))?.[1] || (existsSync(pkgPath) ? "npm" : "none"), installed, layers };
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
  if (kit === "lex") detected.layers = { styling: { name: "slds" }, components: { name: "lightning" }, data: { name: "lightning-datatable" } };
  const recipe = { ...RECIPES[kit], packages: [...RECIPES[kit].packages] };
  if (kit !== "lex" && detected.layers.styling.name === "tailwind" && !recipe.packages.includes("tailwindcss")) recipe.packages.push("tailwindcss");
  const missingPackages = recipe.packages.filter((name) => !existsSync(join(detected.root, "node_modules", ...name.split("/"), "package.json")));
  if (missingPackages.length) throw new Error(`${kit} packages are declared but not installed: ${missingPackages.join(", ")}`);
  // Corpus symbol matching is provenance, not consumer compatibility.
  if (recipe.packages.includes("@tanstack/react-table")) {
    const runtime = JSON.parse(readFileSync(join(detected.root, "node_modules/@tanstack/react-table/package.json"), "utf8"));
    const major = Number(runtime.version.split(".")[0]);
    if (![8, 9].includes(major)) throw new Error(`TanStack ${runtime.version}: generated adapters support v8/v9; preserve the existing DataGrid instead of upgrading it`);
    detected.layers.data.installedVersion = runtime.version;
    recipe.tableMajor = major;
    if (major === 8) {
      recipe.api = ["useReactTable", "getCoreRowModel", "getFilteredRowModel", "getSortedRowModel", "getPaginationRowModel"];
      recipe.imports = [`import { ${recipe.api.join(", ")} } from '@tanstack/react-table';`, "import type { RowData, TableOptions } from '@tanstack/react-table';"];
      recipe.apiReference = "https://tanstack.com/table/v8/docs/guide/tables";
    }
    // Resolve exports from the consumer, not from Shine's corpus or dependencies.
    const runtimeExports = createRequire(join(detected.root, "package.json"))("@tanstack/react-table");
    const missingExports = recipe.api.filter(name => !(name in runtimeExports));
    if (missingExports.length) throw new Error(`installed TanStack ${runtime.version} lacks required exports: ${missingExports.join(", ")}`);
  }
  if (recipe.packages.includes("tailwindcss")) {
    const runtime = JSON.parse(readFileSync(join(detected.root, "node_modules/tailwindcss/package.json"), "utf8"));
    if (![3, 4].includes(Number(runtime.version.split(".")[0]))) throw new Error(`Tailwind ${runtime.version}: supported styling guidance is v3/v4; inspect this version before generating CSS`);
    detected.layers.styling.installedVersion = runtime.version;
    if(Number(runtime.version.split('.')[0])===4&&detected.layers.styling.cssPrefixes?.some(prefix=>prefix!==detected.layers.styling.prefix))throw new Error(`Tailwind prefix mismatch: components.json declares ${JSON.stringify(detected.layers.styling.prefix)} but the imported CSS compiles ${JSON.stringify(detected.layers.styling.cssPrefixes)}. Align the existing configuration before adding controls; uncompiled utility classes are not styling proof.`);
  }
  const unverified = recipe.tableMajor === 8 ? [] : verifyRecipeApi(recipe);
  if (unverified.length) throw new Error(`recipe API not proven by ${recipe.cite}: ${unverified.join(", ")}`);
  const manifest = JSON.parse(readFileSync(join(SHINE, "corpus/packs", recipe.cite, "manifest.json"), "utf8"));
  return { ...detected, kit, recipe, provenance: { cite: recipe.cite, upstream: manifest.upstream, files: manifest.files.length } };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); const opt = (n) => args.includes(n) ? args[args.indexOf(n) + 1] : "";
  try { console.log(JSON.stringify(resolveIntegration(opt("--project") || process.cwd(), opt("--kit")), null, 2)); }
  catch (err) { console.error(`integration: ${err.message}`); process.exit(1); }
}
