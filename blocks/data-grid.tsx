"use client";
import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type RowSelectionState, type SortingState, type VisibilityState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { AsyncState } from "@/components/shine/async-state";
import { Collection } from "@/components/shine/collection";

type Filter = { column: string; label: string; options: { value: string; label: string }[] };
export type DataGridProps<T> = {
  title: string; rows: T[]; columns: ColumnDef<T>[]; getRowId: (row: T) => string; rowLabel: (row: T) => string;
  onOpen: (row: T) => void; columnLabels: Record<string, string>; filters?: Filter[]; summary?: ReactNode;
  state?: "ready" | "loading" | "error"; errorMessage?: string; onRetry: () => void; emptyMessage: string;
  bulkAction?: { label: string; run: (rows: T[]) => Promise<void> }; revealKey?: string;
};
/** Complete client-side grid. Remote paging must use the consumer's server grid, never silently page a partial dataset. */
export function DataGrid<T>({ title, rows, columns, getRowId, rowLabel, onOpen, columnLabels, filters = [], summary, state = "ready", errorMessage = "The source could not be read.", onRetry, emptyMessage, bulkAction, revealKey }: DataGridProps<T>) {
  const id = useId(), running = useRef(false);
  const callbacks = useRef({ rowLabel, onOpen });
  callbacks.current = { rowLabel, onOpen };
  const selectable = Boolean(bulkAction);
  const [query, setQuery] = useState(""), [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]), [visibility, setVisibility] = useState<VisibilityState>({});
  const [selection, setSelection] = useState<RowSelectionState>({}), [busy, setBusy] = useState(false), [actionError, setActionError] = useState(""), [notice, setNotice] = useState("");
  const resolvedColumns = useMemo<ColumnDef<T>[]>(() => [
    ...(selectable ? [{ id: "selection", enableSorting: false, enableHiding: false, header: ({ table }) => <Checkbox aria-label="Select this page" checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={checked => table.toggleAllPageRowsSelected(Boolean(checked))} />, cell: ({ row }) => <Checkbox aria-label={`Select ${callbacks.current.rowLabel(row.original)}`} checked={row.getIsSelected()} onCheckedChange={checked => row.toggleSelected(Boolean(checked))} /> } satisfies ColumnDef<T>] : []),
    ...columns,
    { id: "actions", enableSorting: false, enableHiding: false, header: "Actions", cell: ({ row }) => <Button className="min-h-11" variant="ghost" type="button" aria-label={`Open ${callbacks.current.rowLabel(row.original)}`} onClick={() => callbacks.current.onOpen(row.original)}>Open</Button> },
  ], [columns, selectable]);
  const table = useReactTable({ data: rows, columns: resolvedColumns, getRowId, state: { globalFilter: query, sorting, columnFilters, columnVisibility: visibility, rowSelection: selection }, onGlobalFilterChange: setQuery, onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, onColumnVisibilityChange: setVisibility, onRowSelectionChange: setSelection, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageIndex: 0, pageSize: 10 } } });
  const clear = () => { setQuery(""); setColumnFilters([]); table.setPageIndex(0); };
  const filtered = table.getFilteredRowModel().rows.length, selected = table.getSelectedRowModel().rows;
  const page = table.getState().pagination, count = table.getRowModel().rows.length;
  return <Collection title={title} total={state === "ready" ? rows.length : null} summary={summary} revealKey={revealKey}>
    <div data-product-pattern="data-grid" data-grid className="min-w-0 space-y-4" aria-busy={state === "loading"}>
      <div data-grid-toolbar className="flex flex-wrap items-end gap-3">
        <label htmlFor={`${id}-search`} className="flex w-full min-w-0 flex-none flex-col gap-2 text-sm sm:w-auto sm:min-w-64 sm:flex-1">Search {title.toLowerCase()}<Input className="h-11" id={`${id}-search`} value={query} onChange={event => { setQuery(event.target.value); table.setPageIndex(0); }} /></label>
        {filters.map(filter => <label key={filter.column} className="flex flex-col gap-2 text-sm">{filter.label}<select aria-label={filter.label} className="h-11 rounded-md border bg-background px-3 text-foreground" value={String(table.getColumn(filter.column)?.getFilterValue() || "")} onChange={event => { table.getColumn(filter.column)?.setFilterValue(event.target.value || undefined); table.setPageIndex(0); }}><option value="">All</option>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}
        <Button className="min-h-11" type="button" variant="outline" disabled={!query && !columnFilters.length} onClick={clear}>Clear filters</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button className="min-h-11" type="button" variant="outline">Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{table.getAllLeafColumns().filter(column => column.getCanHide()).map(column => <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} disabled={column.getIsVisible() && table.getVisibleLeafColumns().filter(c => c.getCanHide()).length <= 1} onSelect={event => event.preventDefault()} onCheckedChange={checked => column.toggleVisibility(Boolean(checked))}>{columnLabels[column.id] || column.id}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>
      </div>
      {bulkAction && <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"><span role="status" className="text-sm">{selected.length} selected</span><div className="flex gap-2"><Button className="min-h-11" type="button" variant="ghost" disabled={!selected.length || busy} onClick={() => setSelection({})}>Clear selection</Button><Button className="min-h-11" type="button" variant="outline" disabled={!selected.length || busy || state !== "ready"} onClick={async () => { if (running.current) return; running.current = true; setBusy(true); setActionError(""); setNotice(""); try { await bulkAction.run(selected.map(row => row.original)); setSelection({}); setNotice(`${bulkAction.label} completed`); } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Action failed. Selection retained; try again."); } finally { running.current = false; setBusy(false); } }}>{busy ? "Working…" : bulkAction.label}</Button></div></div>}
      {actionError && <p role="alert" className="text-sm">{actionError}</p>}<p role="status" className="text-sm">{notice}</p>
      {state === "loading" ? <AsyncState state="loading" /> : state === "error" ? <AsyncState state="error" message={errorMessage} onRetry={onRetry} /> : rows.length === 0 ? <AsyncState state="empty" message={emptyMessage} /> : filtered === 0 ? <AsyncState state="filtered-empty" onClear={clear} /> : <>
        <div className="max-w-full overflow-x-auto rounded-lg border" tabIndex={0} role="region" aria-label={`${title} table`}>
          <Table><TableHeader>{table.getHeaderGroups().map(group => <TableRow key={group.id}>{group.headers.map(header => <TableHead key={header.id} aria-sort={header.column.getCanSort() ? (header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none") : undefined}>{header.isPlaceholder ? null : header.column.getCanSort() ? <Button className="min-h-11" type="button" variant="ghost" onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}<span aria-hidden>{header.column.getIsSorted() === "asc" ? "↑" : header.column.getIsSorted() === "desc" ? "↓" : "↕"}</span></Button> : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
          <TableBody>{table.getRowModel().rows.map(row => <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>{row.getVisibleCells().map(cell => <TableCell key={cell.id} className={typeof cell.getValue() === "number" ? "text-right tabular-nums" : undefined}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)}</TableBody></Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><label className="flex items-center gap-2">Rows per page<select className="h-11 rounded-md border bg-background px-2" value={page.pageSize} onChange={event => table.setPageSize(Number(event.target.value))}>{[10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}</select></label><span role="status">{page.pageIndex * page.pageSize + 1}–{page.pageIndex * page.pageSize + count} of {filtered}</span><div className="flex gap-2"><Button className="min-h-11" type="button" variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>Previous</Button><Button className="min-h-11" type="button" variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>Next</Button></div></div>
      </>}
    </div>
  </Collection>;
}
