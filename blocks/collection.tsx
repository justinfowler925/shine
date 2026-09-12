"use client";
import { useId, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Details stay mounted so closing a collection never discards table/editor state. */
export function Collection({ title, total, summary, children, revealKey }: {
  title: string; total: number | null; summary?: ReactNode; children: ReactNode; revealKey?: string;
}) {
  const id = useId();
  const [choice, setChoice] = useState<boolean | null>(null);
  const [seenReveal, setSeenReveal] = useState(revealKey);
  if (seenReveal !== revealKey) { setSeenReveal(revealKey); if (revealKey) setChoice(true); }
  const open = choice ?? (total === null || total <= 10);
  return <section data-product-pattern="collection" aria-label={title} className="min-w-0 space-y-4">
    {summary}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{title} <span className="font-normal text-muted-foreground">{total === null ? "" : `(${total})`}</span></h2>
      <Button className="min-h-11" type="button" variant="outline" aria-expanded={open} aria-controls={id} onClick={() => setChoice(!open)}>{open ? "Hide details" : "Show details"}</Button>
    </div>
    <div id={id} hidden={!open}>{children}</div>
  </section>;
}
