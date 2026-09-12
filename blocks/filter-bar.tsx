"use client";
import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export type FilterChoice = { id: string; label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void };
/** Controlled values keep filtering in the product's actual data model. */
export function FilterBar({ label, query, onQueryChange, filters = [], onClear, children, disabled = false, resultLabel }: {
 label: string; query: string; onQueryChange: (value: string) => void; filters?: FilterChoice[]; onClear: () => void; children?: ReactNode; disabled?: boolean; resultLabel?: string;
}) {
 const id = useId();
 return <section aria-label={label + " filters"} data-product-pattern="filter-bar" className="text-foreground min-w-0 space-y-2">
  <div className="flex min-w-0 flex-wrap items-end gap-3">
   <label className="min-w-0 flex-1 basis-64 space-y-1" htmlFor={id}><span className="text-sm font-medium">{label}</span><Input id={id} type="search" className="h-11 w-full" value={query} onChange={e => onQueryChange(e.target.value)} disabled={disabled} /></label>
   {filters.map(filter => <label key={filter.id} className="min-w-0 flex-1 basis-40 space-y-1"><span className="text-sm font-medium">{filter.label}</span><select aria-label={filter.label} className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2" value={filter.value} disabled={disabled} onChange={e => filter.onChange(e.target.value)}>{filter.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}
   <Button type="button" variant="outline" className="min-h-11" disabled={disabled} onClick={onClear}>Clear filters</Button>{children}
  </div><p role="status" className="text-sm text-muted-foreground">{resultLabel || ""}</p>
 </section>;
}
