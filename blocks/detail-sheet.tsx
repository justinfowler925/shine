"use client";
import { useRef, type ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";

export function DetailSheet({ open, onOpenChange, title, description, children, actions }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; children: ReactNode; actions?: ReactNode;
}) {
  const opener = useRef<HTMLElement | null>(null);
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent data-product-pattern="detail-sheet" className="flex w-full flex-col gap-0 sm:max-w-xl" onOpenAutoFocus={() => { opener.current = document.activeElement as HTMLElement; }} onCloseAutoFocus={event => { event.preventDefault(); if(opener.current?.isConnected)opener.current.focus(); }}>
      <SheetHeader className="shrink-0 border-b"><SheetTitle>{title}</SheetTitle><SheetDescription>{description}</SheetDescription></SheetHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      {actions && <SheetFooter className="shrink-0 border-t">{actions}</SheetFooter>}
    </SheetContent>
  </Sheet>;
}
