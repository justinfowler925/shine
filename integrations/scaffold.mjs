#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveIntegration } from "./resolve.mjs";

const bodies = {
  mui: `export function ShineDataGrid({rows,columns,loading=false,onRowSelectionModelChange}) { return <DataGrid rows={rows} columns={columns} loading={loading} checkboxSelection disableRowSelectionOnClick showToolbar pagination pageSizeOptions={[25,50,100]} onRowSelectionModelChange={onRowSelectionModelChange} /> }`,
  ant: `export function ShineDataGrid({request,columns,rowSelection,onRow}) { return <ProTable rowKey="id" request={request} columns={columns} rowSelection={rowSelection} onRow={onRow} search={{labelWidth:"auto"}} options={{density:true,fullScreen:true,reload:true,setting:true}} pagination={{showSizeChanger:true,pageSize:25}} /> }`,
  carbon: `export function ShineDataGrid({rows,headers,children}) { return <DataTable rows={rows} headers={headers} isSortable useZebraStyles>{children}</DataTable> }`,
  "shadcn-tanstack": `const features = tableFeatures({ columnFilteringFeature, columnVisibilityFeature, rowPaginationFeature, rowSortingFeature, filteredRowModel: createFilteredRowModel(), paginatedRowModel: createPaginatedRowModel(), sortedRowModel: createSortedRowModel() });\nexport function useShineDataGrid(options) { return useTable({ ...options, features }) }`,
  native: `export const shineDataGridElement = "table";`,
  lex: `export const shineDataGridElement = "lightning-datatable";`,
};

export function scaffold(project, out, kit = "") {
  const resolved = resolveIntegration(project, kit);
  const dest = resolve(out);
  mkdirSync(dest, { recursive: true });
  const source = [...resolved.recipe.imports, "", bodies[resolved.kit], ""].join("\n");
  writeFileSync(join(dest, "ShineDataGrid.tsx"), source);
  writeFileSync(join(dest, "shine-integration.json"), JSON.stringify({...resolved,requiredControls:["search","sort","filters","column visibility","pagination","row selection","row actions"],requiredStates:["loading","empty","error","populated"]}, null, 2) + "\n");
  return { dest, source, resolved };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); const opt = (n) => args.includes(n) ? args[args.indexOf(n) + 1] : "";
  try { const result = scaffold(opt("--project") || process.cwd(), opt("--out") || join(process.cwd(), "shine-integration"), opt("--kit")); console.log(`${result.resolved.kit}: ${result.dest}`); }
  catch (err) { console.error(`scaffold: ${err.message}`); process.exit(1); }
}
