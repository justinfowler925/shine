#!/usr/bin/env node
import { mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveIntegration } from "./resolve.mjs";

const bodies = {
  "shadcn-tanstack": `const features = tableFeatures({ columnFilteringFeature, columnVisibilityFeature, rowPaginationFeature, rowSortingFeature, filteredRowModel: createFilteredRowModel(), paginatedRowModel: createPaginatedRowModel(), sortedRowModel: createSortedRowModel() });\nexport function useShineDataGrid(options) { return useTable({ ...options, features }) }`,
  native: `export const shineDataGridElement = "table";`,
  lex: `export const shineDataGridElement = "lightning-datatable";`,
};

export function scaffold(project, out, kit = "") {
  const resolved = resolveIntegration(project, kit);
  const dest = resolve(out);
  mkdirSync(dest, { recursive: true });
  const v8 = `export function useShineDataGrid<TData extends RowData>(options: Omit<TableOptions<TData>, "getCoreRowModel"> & Partial<Pick<TableOptions<TData>, "getCoreRowModel">>) {\n  return useReactTable({ getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(), ...options });\n}`;
  const body = resolved.recipe.tableMajor === 8 ? v8 : bodies[resolved.kit] || (resolved.recipe.packages.includes("@tanstack/react-table") ? bodies["shadcn-tanstack"] : `// Reuse the consumer's existing controls. Add a shared DataGrid only when required.\nexport const shineComponentLayer = ${JSON.stringify(resolved.layers.components.name)};`);
  const source = [...resolved.recipe.imports, "", body, ""].join("\n");
  const tableAdapter = Boolean(resolved.recipe.tableMajor) || ["native", "lex"].includes(resolved.kit);
  const filename = tableAdapter ? "ShineDataGrid.tsx" : "ShineComponents.tsx";
  writeFileSync(join(dest, filename), source);
  writeFileSync(join(dest, "shine-integration.json"), JSON.stringify({
    ...resolved, scaffoldKind: "adapter-only", filename,
    completion: tableAdapter ? "This adapter is not a rendered DataGrid or workflow proof. Reuse the product grid and run shine-tables.json scenarios." : "Reuse installed consumer controls; implement and verify the packet workflow. No table engine is required.",
    requiredControls: tableAdapter ? ["search", "sort", "filters", "column visibility", "pagination", "row selection", "row actions"] : [],
    requiredStates: tableAdapter ? ["loading", "empty", "error", "populated"] : [],
  }, null, 2) + "\n");
  return { dest, source, resolved };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); const opt = (n) => args.includes(n) ? args[args.indexOf(n) + 1] : "";
  try { const result = scaffold(opt("--project") || process.cwd(), opt("--out") || join(process.cwd(), "shine-integration"), opt("--kit")); console.log(`${result.resolved.kit}: ${result.dest}`); }
  catch (err) { console.error(`scaffold: ${err.message}`); process.exit(1); }
}
