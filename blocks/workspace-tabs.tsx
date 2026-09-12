"use client";
import { useState, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Radix/Base UI owns tab semantics and keyboard; mounted panels preserve drafts. */
export function WorkspaceTabs({ label, tabs, defaultValue, value, onValueChange }: {
  label: string; tabs: { value: string; label: string; content: ReactNode; disabled?: boolean }[];
  defaultValue?: string; value?: string; onValueChange?: (value: string) => void;
}) {
  const [local, setLocal] = useState(defaultValue || tabs.find(tab => !tab.disabled)?.value || "");
  const selected = value ?? local;
  return <Tabs data-product-pattern="workspace-tabs" value={selected} onValueChange={next => { setLocal(next); onValueChange?.(next); }} className="min-w-0 gap-4">
    <div className="max-w-full overflow-x-auto"><TabsList aria-label={label} className="h-auto min-h-11 w-max justify-start">
      {tabs.map(tab => <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled} className="min-h-11 text-foreground">{tab.label}</TabsTrigger>)}
    </TabsList></div>
    {tabs.map(tab => <TabsContent key={tab.value} value={tab.value} forceMount hidden={selected !== tab.value} className="min-w-0 data-[state=inactive]:hidden">{tab.content}</TabsContent>)}
  </Tabs>;
}
