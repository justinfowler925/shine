"use client";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export type DateRangeValue = { start: string; end: string };
export function dateRangeError(value: DateRangeValue): string | undefined {
 for (const [label, date] of [["Start", value.start], ["End", value.end]]) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) return label + " must be a valid date.";
 }
 if (value.start > value.end) return "End must be on or after start.";
}
/** Dates are calendar values, never implicitly converted to the browser timezone. */
export function DateRange({ value, onChange, onApply, disabled = false, label = "Date range" }: {
 value: DateRangeValue; onChange: (value: DateRangeValue) => void; onApply: (value: DateRangeValue) => void | Promise<void>; disabled?: boolean; label?: string;
}) {
 const id = useId(), lock = useRef(false), [busy, setBusy] = useState(false), [error, setError] = useState("");
 async function apply() {
  if (lock.current || disabled) return;
  const invalid = dateRangeError(value); setError(invalid || ""); if (invalid) return;
  lock.current = true; setBusy(true);
  try { await onApply({ ...value }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Dates could not be applied. Try again."); }
  finally { lock.current = false; setBusy(false); }
 }
 return <fieldset className="text-foreground min-w-0 space-y-2" data-product-pattern="date-range" disabled={disabled || busy} aria-describedby={error ? id : undefined}>
  <legend className="mb-2 text-sm font-medium">{label}</legend><div className="flex flex-wrap items-end gap-3">
   <label className="min-w-0 flex-1 basis-40 space-y-1"><span className="text-sm">Start</span><Input className="h-11 w-full" type="date" value={value.start} onChange={e => { onChange({ ...value, start: e.target.value }); setError(""); }} /></label>
   <label className="min-w-0 flex-1 basis-40 space-y-1"><span className="text-sm">End</span><Input className="h-11 w-full" type="date" value={value.end} onChange={e => { onChange({ ...value, end: e.target.value }); setError(""); }} /></label>
   <Button type="button" variant="outline" className="min-h-11" onClick={() => void apply()}>{busy ? "Applying…" : "Apply dates"}</Button>
  </div><p id={id} role="alert" className="text-sm text-destructive">{error}</p>
 </fieldset>;
}
