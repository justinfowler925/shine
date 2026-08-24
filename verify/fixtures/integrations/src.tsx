import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { DataTable, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@carbon/react";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import { columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel, createSortedRowModel, FlexRender, rowPaginationFeature, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table";
import "@carbon/styles/css/styles.css";
import "antd/dist/reset.css";

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

function Mui() {
  const [query, setQuery] = useState("");
  const columns: GridColDef<Row>[] = [{ field: "name", headerName: "Name", flex: 1 }, { field: "role", headerName: "Role", flex: 1 }, { field: "actions", headerName: "Actions", renderCell: () => <button data-row-action>Open</button> }];
  return <Shell kit="mui" query={query} setQuery={setQuery}><div data-virtualized style={{ height: 420 }}><DataGrid rows={filtered(query)} columns={columns} pageSizeOptions={[1, 2]} initialState={{ pagination: { paginationModel: { pageSize: 2, page: 0 } } }} /></div></Shell>;
}

function Carbon() {
  const [query, setQuery] = useState("");
  const headers = [{ key: "name", header: "Name" }, { key: "role", header: "Role" }, { key: "action", header: "Actions" }];
  const rows = filtered(query).map((row) => ({ id: String(row.id), name: row.name, role: row.role, action: "Open" }));
  return <Shell kit="carbon" query={query} setQuery={setQuery}><div data-virtualized><DataTable isSortable rows={rows} headers={headers}>{({ rows, headers, getHeaderProps, getRowProps }) => <TableContainer><Table><TableHead><TableRow>{headers.map((header) => <TableHeader {...getHeaderProps({ header, isSortable: header.key !== "action" })} key={header.key}>{header.header}</TableHeader>)}</TableRow></TableHead><TableBody>{rows.map((row) => <TableRow {...getRowProps({ row })} key={row.id}>{row.cells.map((cell) => <TableCell key={cell.id}>{cell.id.endsWith(":action") ? <button data-row-action>Open</button> : cell.value}</TableCell>)}</TableRow>)}</TableBody></Table></TableContainer>}</DataTable></div></Shell>;
}

function Ant() {
  const [query, setQuery] = useState("");
  const columns: ProColumns<Row>[] = [{ title: "Name", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name) }, { title: "Role", dataIndex: "role" }, { title: "Actions", render: () => <button data-row-action>Open</button> }];
  return <Shell kit="ant" query={query} setQuery={setQuery}><div data-virtualized><ProTable<Row> rowKey="id" dataSource={filtered(query)} columns={columns} search={false} pagination={{ pageSize: 2 }} /></div></Shell>;
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

const kit = new URLSearchParams(location.search).get("kit") || "mui";
const views: Record<string, React.ReactNode> = { mui: <Mui />, carbon: <Carbon />, ant: <Ant />, tanstack: <Tanstack /> };
createRoot(document.getElementById("root")!).render(views[kit] || <Mui />);
