"use client";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { DataGrid, type DataGridProps } from "@/components/shine/data-grid";
import { DetailSheet } from "@/components/shine/detail-sheet";
import { RecordEditor, type EditorField } from "@/components/shine/record-editor";
/** A complete list → detail → edit workflow. Product adapters own reads and writes. */
export function RecordListPage<T>({ title, description, grid, details, editor }: {
 title: string; description: string; grid: Omit<DataGridProps<T>, "onOpen">;
 details: (row: T) => ReactNode;
 editor?: { fields: EditorField[]; values: (row: T) => Record<string, string>; save: (row: T, values: Record<string, string>) => Promise<void> };
}) {
 const [selectedId, setSelectedId] = useState<string | null>(null), [editing, setEditing] = useState(false), editButton = useRef<HTMLButtonElement>(null);
 const selected = grid.rows.find(row => grid.getRowId(row) === selectedId);
 return <main data-product-pattern="record-list-page" data-cite="shadcn-queue" className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6"><header className="space-y-2"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-muted-foreground">{description}</p></header>
  <DataGrid {...grid} onOpen={row => setSelectedId(grid.getRowId(row))} />
  <DetailSheet open={Boolean(selected)} onOpenChange={open => { if (!open) setSelectedId(null); }} title={selected ? grid.rowLabel(selected) : "Record"} description="Review the record before making changes." actions={selected && editor ? <Button ref={editButton} type="button" onClick={() => setEditing(true)}>Edit record</Button> : undefined}>{selected && details(selected)}</DetailSheet>
  {selected && editor && editing && <RecordEditor key={grid.getRowId(selected)} title={"Edit " + grid.rowLabel(selected)} description="Save updates to this record." fields={editor.fields} initialValues={editor.values(selected)} onSave={values => editor.save(selected, values)} onClose={() => setEditing(false)} returnFocus={() => editButton.current} />}
 </main>;
}
