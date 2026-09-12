"use client";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export type AsyncStateProps =
  | { state: "loading"; title?: string }
  | { state: "error"; title?: string; message: string; onRetry: () => void }
  | { state: "empty"; title?: string; message: string; action?: ReactNode }
  | { state: "filtered-empty"; title?: string; onClear: () => void };

/** One state vocabulary; callers supply domain copy and real recovery callbacks. */
export function AsyncState(props: AsyncStateProps) {
  return <div data-product-pattern="async-state" role={props.state === "error" ? "alert" : "status"}
    aria-busy={props.state === "loading"} className="flex flex-col items-start gap-3 rounded-lg border p-6 text-sm">
    <p className="font-medium">{props.title || ({ loading: "Loading…", error: "Could not load records", empty: "No records yet", "filtered-empty": "No matching records" })[props.state]}</p>
    {"message" in props && <p className="text-muted-foreground">{props.message}</p>}
    {props.state === "error" && <Button className="min-h-11" type="button" variant="outline" onClick={props.onRetry}>Retry</Button>}
    {props.state === "filtered-empty" && <Button className="min-h-11" type="button" variant="outline" onClick={props.onClear}>Clear filters</Button>}
    {props.state === "empty" && props.action}
  </div>;
}
