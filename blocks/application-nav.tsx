"use client";
import { useId, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
/** Route navigation stays links; wrapping preserves every destination on phones. */
export function ApplicationNav({ label, items, current, brand, actions }: {
 label: string; items: { id: string; label: string; href: string; description?: string }[]; current: string; brand?: ReactNode; actions?: ReactNode;
}) {
 const id = useId();
 return <header className="border-b bg-background" data-product-pattern="application-nav">
  <a href={"#" + id} className="sr-only focus:not-sr-only focus:block focus:p-3">Skip navigation</a>
  <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 p-4">{brand}<nav aria-label={label} className="min-w-0 flex-1"><ul className="flex flex-wrap gap-1">{items.map(item => <li key={item.id}><Button variant={current === item.id ? "secondary" : "ghost"} className="min-h-11 whitespace-normal text-left" asChild><a href={item.href} aria-current={current === item.id ? "page" : undefined} title={item.description}>{item.label}</a></Button></li>)}</ul></nav>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div><span id={id} tabIndex={-1} />
 </header>;
}
