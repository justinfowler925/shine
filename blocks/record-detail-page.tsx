"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkspaceTabs } from "@/components/shine/workspace-tabs";
import { FormPanel, type FormField } from "@/components/shine/form-panel";
export function RecordDetailPage({ title, description, back, facts, activity, editor }: {
 title: string; description: string; back: { href: string; label: string }; facts: { label: string; value: string }[];
 activity: { id: string; title: string; detail: string; dateLabel: string }[];
 editor?: { fields: FormField[]; initialValues: Record<string, string>; onSave: (values: Record<string, string>) => Promise<void> };
}) {
 const [tab, setTab] = useState("details");
 return <main data-product-pattern="record-detail-page" data-cite="shadcn-record" className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6"><header className="space-y-3"><Button asChild variant="ghost"><a href={back.href}>{back.label}</a></Button><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-muted-foreground">{description}</p></header><WorkspaceTabs label="Record sections" value={tab} onValueChange={setTab} tabs={[
  { value: "details", label: "Details", content: <section className="rounded-lg border border-border p-5"><h2 className="mb-4 text-lg font-semibold">Record details</h2><dl className="grid gap-4 sm:grid-cols-2">{facts.map(fact => <div key={fact.label} className="min-w-0"><dt className="text-sm text-muted-foreground">{fact.label}</dt><dd className="break-words font-medium">{fact.value || "Not recorded"}</dd></div>)}</dl></section> },
  { value: "activity", label: "Activity", content: <section className="space-y-3"><h2 className="text-lg font-semibold">Activity</h2>{activity.length ? <ol className="space-y-3">{activity.map(item => <li key={item.id} className="space-y-1 rounded-lg border border-border p-4"><h3 className="font-medium">{item.title}</h3><p className="text-sm text-muted-foreground">{item.dateLabel}</p><p>{item.detail}</p></li>)}</ol> : <p role="status">No activity recorded.</p>}</section> },
  ...(editor ? [{ value: "edit", label: "Edit", content: <FormPanel title="Edit record" description="Changes are saved to this record." {...editor} /> }] : [])
 ]} /></main>;
}
