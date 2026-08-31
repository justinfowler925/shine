import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, FlexRender, rowPaginationFeature, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table";

type Row = { id: number; name: string; role: string };
const seed: Row[] = [{ id: 1, name: "Ada", role: "Analyst" }, { id: 2, name: "Grace", role: "Lead" }];
const filtered = (query: string) => seed.filter((row) => `${row.name} ${row.role}`.toLowerCase().includes(query.toLowerCase()));

function Shell({ kit, query, setQuery, children }: { kit: string; query: string; setQuery: (value: string) => void; children: React.ReactNode }) {
  return <main data-grid data-client-mode>
    <h1>{kit} employees</h1><p>Real {kit} runtime.</p>
    <div data-toolbar role="search"><input aria-label="Search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} /><button data-clear-filters onClick={() => setQuery("")}>Clear</button></div>
    <span data-state="loading">Loading</span><span data-state="empty">Empty</span><span data-state="filtered-empty">Filtered empty</span><span data-state="error" role="alert">Error <button data-retry>Retry</button></span>
    <span role="separator" data-column-resize aria-orientation="vertical" />
    <div data-grid-scroll style={{ overflowX: "auto" }}>{children}</div>
  </main>;
}




// The `native` recipe: no library at all, the semantic table plus the same
// executable DataGrid contract. It is here because Shine supports exactly two
// non-Lightning build paths — shadcn/TanStack and native — and a runtime harness
// must exercise what Shine actually recommends. It used to exercise MUI, Carbon
// and Ant instead: three runtimes no consumer of this skill can build against.
function Native() {
  const [query, setQuery] = useState("");
  const rows = filtered(query);
  const [sort, setSort] = useState<"none" | "ascending" | "descending">("none");
  const sorted = sort === "none" ? rows : [...rows].sort((a, b) => sort === "ascending" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  return <Shell kit="native" query={query} setQuery={setQuery}><div data-virtualized><table><thead><tr>
    <th aria-sort={sort} style={{ position: "sticky", top: 0 }}><button onClick={() => setSort(sort === "ascending" ? "descending" : "ascending")}>Name</button></th>
    <th aria-sort="none" style={{ position: "sticky", top: 0 }}><button>Role</button></th>
    <th style={{ position: "sticky", top: 0 }}>Actions</th>
  </tr></thead><tbody>{sorted.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.role}</td><td><button data-row-action>Open</button></td></tr>)}</tbody></table></div></Shell>;
}

const features = tableFeatures({ columnFilteringFeature, columnVisibilityFeature, rowPaginationFeature, rowSortingFeature, filteredRowModel: createFilteredRowModel(), paginatedRowModel: createPaginatedRowModel(), sortedRowModel: createSortedRowModel() });
const helper = createColumnHelper<typeof features, Row>();
function Tanstack() {
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<any[]>([]);
  const columns = useMemo(() => helper.columns([helper.accessor("name", { header: "Name" }), helper.accessor("role", { header: "Role" }), helper.display({ id: "actions", header: "Actions", cell: () => <button data-row-action>Open</button> })]), []);
  const table = useTable({ features, data: filtered(query), columns, state: { sorting }, onSortingChange: setSorting });
  return <Shell kit="shadcn-tanstack" query={query} setQuery={setQuery}><div data-virtualized><table><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th key={header.id} aria-sort={header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none"} style={{ position: "sticky", top: 0 }}><button onClick={header.column.getToggleSortingHandler()}><FlexRender header={header} /></button></th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}><FlexRender cell={cell} /></td>)}</tr>)}</tbody></table></div></Shell>;
}

const kit = new URLSearchParams(location.search).get("kit") || "tanstack";
const views: Record<string, React.ReactNode> = { tanstack: <Tanstack />, native: <Native /> };
createRoot(document.getElementById("root")!).render(views[kit] || <Tanstack />);
