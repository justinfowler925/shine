"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DetailSheet } from "@/components/shine/detail-sheet";
export type NotificationItem = { id: string; title: string; description: string; read: boolean; href?: string };
/** The consumer persists read state. Failures keep the item unread and retryable. */
export function NotificationCenter({ items, onMarkRead, loading = false, error, onRetry }: {
 items: NotificationItem[]; onMarkRead: (ids: string[]) => Promise<void>; loading?: boolean; error?: string; onRetry: () => void;
}) {
 const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [failure, setFailure] = useState(""), [status, setStatus] = useState(""); const lock = useRef(false);
 const unread = items.filter(item => !item.read);
 async function mark(ids: string[]) { if (lock.current || !ids.length) return; lock.current = true; setBusy(true); setFailure(""); setStatus(""); try { await onMarkRead(ids); setStatus(ids.length + " notifications marked read."); } catch (cause) { setFailure(cause instanceof Error ? cause.message : "Could not mark read. Try again."); } finally { lock.current = false; setBusy(false); } }
 return <div data-product-pattern="notification-center"><Button type="button" variant="outline" onClick={() => setOpen(true)}>Notifications ({unread.length})</Button><DetailSheet open={open} onOpenChange={setOpen} title="Notifications" description={unread.length + " unread"} actions={<Button type="button" disabled={busy || loading || Boolean(error) || !unread.length} onClick={() => void mark(unread.map(item => item.id))}>Mark all read</Button>}>
  <p role="status" className="text-sm">{loading ? "Loading notifications…" : status}</p>{(error || failure) && <p role="alert" className="mb-3 text-sm text-destructive">{error || failure}{error && <Button type="button" variant="outline" onClick={onRetry}>Retry notifications</Button>}</p>}
  {!loading && !error && !items.length && <p>No notifications.</p>}
  {!loading && !error && <ul className="space-y-3">{items.map(item => <li key={item.id} className="space-y-2 rounded-md border border-border p-3"><h3 className="font-medium">{item.title}</h3><p className="text-sm text-muted-foreground">{item.description}</p><div className="flex flex-wrap items-center gap-2">{item.href && <Button asChild variant="outline"><a href={item.href}>Open {item.title}</a></Button>}{item.read ? <span className="text-sm">Read</span> : <Button type="button" disabled={busy} variant="ghost" aria-label={"Mark " + item.title + " read"} onClick={() => void mark([item.id])}>Mark read</Button>}</div></li>)}</ul>}
 </DetailSheet></div>;
}
