"use client";
import { useState } from "react";
import { WorkspaceTabs } from "@/components/shine/workspace-tabs";
import { FormPanel, type FormField } from "@/components/shine/form-panel";
export function SettingsPage({ title, description, sections }: {
 title: string; description: string; sections: { id: string; title: string; description: string; fields: FormField[]; initialValues: Record<string, string>; onSave: (values: Record<string, string>) => Promise<void>; disabled?: boolean }[];
}) {
 const [active, setActive] = useState(sections.find(section => !section.disabled)?.id || "");
 return <main data-product-pattern="settings-page" data-cite="shadcn-settings" className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6"><header className="space-y-2"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-muted-foreground">{description}</p></header>{sections.length ? <WorkspaceTabs label="Settings sections" value={active} onValueChange={setActive} tabs={sections.map(section => ({ value: section.id, label: section.title, disabled: section.disabled, content: <FormPanel key={section.id} title={section.title} description={section.description} fields={section.fields} initialValues={section.initialValues} onSave={section.onSave} /> }))} /> : <p role="status">No settings are available.</p>}</main>;
}
