"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export type EditorField = { name: string; label: string; type?: "text" | "email" | "number" | "date"; required?: boolean; help?: string; validate?: (value: string) => string | undefined };
/** Mount per record (key=record.id). Success closes only after the real save resolves. */
export function RecordEditor({ title, description, initialValues, fields, onSave, onClose, returnFocus }: {
  title: string; description: string; initialValues: Record<string, string>; fields: EditorField[];
  onSave: (values: Record<string, string>) => Promise<void>; onClose: () => void; returnFocus?: () => HTMLElement | null;
}) {
  const id = useId(), saving = useRef(false), errorRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(typeof document === "undefined" ? null : document.activeElement as HTMLElement);
  const [values, setValues] = useState({ ...initialValues });
  const [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({}), [error, setError] = useState("");
  const dirty = fields.some(field => (values[field.name] || "") !== (initialValues[field.name] || ""));
  useEffect(() => { if (!dirty) return; const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [dirty]);
  useEffect(() => { if (error || Object.keys(errors).length) errorRef.current?.focus(); }, [error, errors]);
  const close = () => { if (!saving.current) { if (dirty) setConfirm(true); else onClose(); } };
  return <>
    <Dialog open onOpenChange={open => { if (!open) close(); }}>
      <DialogContent data-product-pattern="record-editor" className="flex max-h-[90dvh] flex-col overflow-hidden p-0" onCloseAutoFocus={event => { event.preventDefault(); const target=returnFocus?.()||opener.current; if(target?.isConnected)target.focus(); }} onInteractOutside={event => { event.preventDefault(); close(); }} onEscapeKeyDown={event => { event.preventDefault(); close(); }}>
        <DialogHeader className="shrink-0 border-b p-6"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <form noValidate className="flex min-h-0 flex-col" onSubmit={async event => {
          event.preventDefault(); if (saving.current) return;
          const next: Record<string, string> = {};
          for (const field of fields) { const value = values[field.name] || ""; const message = field.required && !value.trim() ? `${field.label} is required` : field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Enter a valid email address" : field.validate?.(value); if (message) next[field.name] = message; }
          setErrors(next); setError(""); if (Object.keys(next).length) return;
          saving.current = true; setBusy(true);
          try { await onSave({ ...values }); onClose(); }
          catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save. Your changes are still here."); }
          finally { saving.current = false; setBusy(false); }
        }}>
          <div className="min-h-0 space-y-4 overflow-y-auto p-6">
            {(error || Object.keys(errors).length > 0) && <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-md border border-destructive p-3 text-sm"><p>{error || "Review the fields below."}</p>{Object.entries(errors).map(([name, message]) => <a key={name} className="block underline" href={`#${id}-${name}`}>{message}</a>)}</div>}
            {fields.map(field => <div className="space-y-2" key={field.name}>
              <Label htmlFor={`${id}-${field.name}`}>{field.label}{field.required ? " (required)" : ""}</Label>
              <Input className="h-11" id={`${id}-${field.name}`} name={field.name} type={field.type || "text"} value={values[field.name] || ""} disabled={busy} required={field.required} aria-invalid={Boolean(errors[field.name])} aria-describedby={field.help || errors[field.name] ? `${id}-${field.name}-help` : undefined} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} />
              {(field.help || errors[field.name]) && <p id={`${id}-${field.name}-help`} className="text-sm text-muted-foreground">{errors[field.name] || field.help}</p>}
            </div>)}
          </div>
          <DialogFooter className="shrink-0 border-t p-4"><Button className="min-h-11" type="button" variant="outline" disabled={busy} onClick={close}>Cancel</Button><Button className="min-h-11" type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle><AlertDialogDescription>Your changes have not been saved.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep editing</AlertDialogCancel><AlertDialogAction onClick={onClose}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </>;
}
