"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
export type UploadContext = { signal: AbortSignal; onProgress: (percent: number) => void };
/** Client validation is feedback; authorization and content validation remain on the server. */
export function FileUpload({ label, accept, maxBytes, multiple = false, onUpload, disabled = false }: {
 label: string; accept: string; maxBytes: number; multiple?: boolean; onUpload: (files: File[], context: UploadContext) => Promise<void>; disabled?: boolean;
}) {
 const id = useId(), input = useRef<HTMLInputElement>(null), controller = useRef<AbortController | null>(null);
 const [files, setFiles] = useState<File[]>([]), [busy, setBusy] = useState(false), [progress, setProgress] = useState<number | null>(null), [error, setError] = useState(""), [status, setStatus] = useState("");
 useEffect(() => () => controller.current?.abort(), []);
 function choose(selected: File[]) {
  if (controller.current || disabled) return;
  const rules = accept.toLowerCase().split(",").map(rule => rule.trim()).filter(Boolean);
  const invalid = selected.find(file => file.size > maxBytes || !rules.some(rule => rule.startsWith(".") ? file.name.toLowerCase().endsWith(rule) : rule.endsWith("/*") ? file.type.toLowerCase().startsWith(rule.slice(0, -1)) : file.type.toLowerCase() === rule));
  setStatus(""); setProgress(null);
  if ((!multiple && selected.length > 1) || invalid) { setError(invalid ? invalid.name + " exceeds the size limit or is not an accepted file type." : "Choose one file."); if (input.current) input.current.value = ""; return; }
  setError(""); setFiles(selected);
 }
 async function upload() {
  if (controller.current || disabled || !files.length) return;
  const task = new AbortController(); controller.current = task; setBusy(true); setError(""); setStatus(""); setProgress(null);
  try {
   await onUpload([...files], { signal: task.signal, onProgress: value => { if (controller.current === task && Number.isFinite(value)) setProgress(Math.max(0, Math.min(100, value))); } });
   if (controller.current !== task || task.signal.aborted) return;
   setFiles([]); if (input.current) input.current.value = ""; setStatus("Upload complete.");
  } catch (cause) { if (controller.current === task && !task.signal.aborted) setError(cause instanceof Error ? cause.message : "Upload failed. Your files are still selected; retry."); }
  finally { if (controller.current === task) { controller.current = null; setBusy(false); } }
 }
 function cancel() { controller.current?.abort(); controller.current = null; setBusy(false); setProgress(null); setStatus("Upload stopped locally. Check the destination before retrying."); }
 return <section aria-labelledby={id + "-title"} data-product-pattern="file-upload" className="text-foreground min-w-0 space-y-3 rounded-lg border border-border p-4">
  <h3 id={id + "-title"} className="font-semibold">{label}</h3><p id={id + "-help"} className="text-sm text-muted-foreground">Accepted: {accept}. Maximum {new Intl.NumberFormat().format(maxBytes)} bytes per file.</p>
  <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); choose(Array.from(e.dataTransfer.files)); }} className="rounded-md border border-border border-dashed p-4">
   <label htmlFor={id} className="block text-sm font-medium">Choose files or drop them here</label><input ref={input} id={id} type="file" accept={accept} multiple={multiple} disabled={disabled || busy} aria-describedby={id + "-help"} className="mt-2 block w-full min-w-0 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground" onChange={e => choose(Array.from(e.target.files || []))} />
  </div>
  <ul className="space-y-2">{files.map((file, index) => <li key={file.name + index} className="flex min-w-0 items-center justify-between gap-2"><span className="min-w-0 break-all text-sm">{file.name}</span><Button type="button" variant="ghost" disabled={busy || disabled} aria-label={"Remove " + file.name} onClick={() => { setFiles(current => current.filter((_, i) => i !== index)); if (input.current) input.current.value = ""; }}>Remove</Button></li>)}</ul>
  <p role="alert" className="text-sm text-destructive">{error}</p><p role="status" className="text-sm">{busy ? "Uploading…" : status}</p>{busy && <progress aria-label="Upload progress" max={100} value={progress === null ? undefined : progress} className="w-full" />}
  <div className="flex flex-wrap gap-2"><Button type="button" disabled={disabled || busy || !files.length} onClick={() => void upload()}>{error ? "Retry upload" : "Upload files"}</Button>{busy && <Button type="button" variant="outline" onClick={cancel}>Cancel upload</Button>}</div>
 </section>;
}
