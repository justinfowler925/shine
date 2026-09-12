"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
export type FormField = { name: string; label: string; type?: "text" | "email" | "number" | "date" | "textarea" | "select" | "checkbox"; required?: boolean; help?: string; options?: { value: string; label: string }[]; validate?: (value: string) => string | undefined };
/** Mount with a key when record identity changes. Successful saves become the reset baseline. */
export function FormPanel({ title, description, fields, initialValues, onSave, saveLabel = "Save changes" }: {
 title: string; description: string; fields: FormField[]; initialValues: Record<string, string>; onSave: (value: Record<string, string>) => Promise<void>; saveLabel?: string;
}) {
 const id = useId(), lock = useRef(false), alert = useRef<HTMLDivElement>(null);
 const [baseline, setBaseline] = useState({ ...initialValues }), [values, setValues] = useState({ ...initialValues });
 const [busy, setBusy] = useState(false), [discard, setDiscard] = useState(false), [error, setError] = useState("");
 const [errors, setErrors] = useState<Record<string, string>>({}), [status, setStatus] = useState("");
 const dirty = fields.some(field => (values[field.name] || "") !== (baseline[field.name] || ""));
 useEffect(() => { if (!dirty) return; const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [dirty]);
 useEffect(() => { if (error || Object.keys(errors).length) alert.current?.focus(); }, [error, errors]);
 const change = (name: string, value: string) => { setValues(current => ({ ...current, [name]: value })); setStatus(""); };
 return <section data-product-pattern="form-panel" aria-labelledby={id + "-title"} className="min-w-0 rounded-lg border border-border bg-background">
  <header className="space-y-2 border-b border-border p-5"><h2 id={id + "-title"} className="text-lg font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{description}</p></header>
  <form noValidate onSubmit={async event => {
   event.preventDefault(); if (lock.current) return;
   const invalid: Record<string, string> = {};
   for (const field of fields) { const value = values[field.name] || ""; const message = field.required && (field.type === "checkbox" ? value !== "true" : !value.trim()) ? field.label + " is required." : field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Enter a valid email address." : field.validate?.(value); if (message) invalid[field.name] = message; }
   setErrors(invalid); setError(""); setStatus(""); if (Object.keys(invalid).length) return;
   lock.current = true; setBusy(true); const submitted = { ...values };
   try { await onSave(submitted); setBaseline(submitted); setStatus("Changes saved."); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save. Your draft is still here."); } finally { lock.current = false; setBusy(false); }
  }}>
   <div className="space-y-5 p-5">{(error || Object.keys(errors).length > 0) && <div role="alert" ref={alert} tabIndex={-1} className="rounded-md border border-destructive p-3 text-sm"><p>{error || "Review these fields."}</p>{Object.entries(errors).map(([name, message]) => <a key={name} href={"#" + id + "-" + name} className="block underline">{message}</a>)}</div>}
   {fields.map(field => { const common = { id: id + "-" + field.name, name: field.name, disabled: busy, required: field.required, "aria-invalid": Boolean(errors[field.name]), "aria-describedby": field.help || errors[field.name] ? id + "-" + field.name + "-help" : undefined }; return <div key={field.name} className="space-y-2"><Label htmlFor={common.id}>{field.label}{field.required ? " (required)" : ""}</Label>
    {field.type === "textarea" ? <textarea {...common} rows={4} className="w-full rounded-md border border-border bg-background p-3 text-sm" value={values[field.name] || ""} onChange={e => change(field.name, e.target.value)} /> : field.type === "select" ? <select {...common} className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm" value={values[field.name] || ""} onChange={e => change(field.name, e.target.value)}><option value="">Choose an option</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "checkbox" ? <input {...common} type="checkbox" className="block size-5 accent-primary" checked={values[field.name] === "true"} onChange={e => change(field.name, String(e.target.checked))} /> : <Input {...common} className="h-11" type={field.type || "text"} value={values[field.name] || ""} onChange={e => change(field.name, e.target.value)} />}
    {(field.help || errors[field.name]) && <p id={common.id + "-help"} className="text-sm text-muted-foreground">{errors[field.name] || field.help}</p>}</div>; })}</div>
   <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4"><p role="status" className="text-sm text-muted-foreground">{status || (dirty ? "Unsaved changes" : "")}</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={busy || !dirty} onClick={() => setDiscard(true)}>Reset changes</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : saveLabel}</Button></div></footer>
  </form>
  <AlertDialog open={discard} onOpenChange={setDiscard}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle><AlertDialogDescription>Restore the last saved values.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={() => { setValues({ ...baseline }); setErrors({}); setError(""); setStatus("Changes reset."); }}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
 </section>;
}
