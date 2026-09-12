"use client";
import type { ReactNode } from "react";
import { DateRange, type DateRangeValue } from "@/components/shine/date-range";
import { DataGrid, type DataGridProps } from "@/components/shine/data-grid";
export function ReportPage<T>({ title, description, period, onPeriodChange, onApplyPeriod, metrics, evidence, explanation, visualization }: {
 title: string; description: string; period: DateRangeValue; onPeriodChange: (period: DateRangeValue) => void; onApplyPeriod: (period: DateRangeValue) => Promise<void>;
 metrics: { label: string; value: string; detail: string }[]; evidence: DataGridProps<T>; explanation: string; visualization?: ReactNode;
}) {
 return <main data-product-pattern="report-page" data-cite="shadcn-queue" className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6"><header className="space-y-2"><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="text-muted-foreground">{description}</p></header><DateRange value={period} onChange={onPeriodChange} onApply={onApplyPeriod} /><section aria-label="Report summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{metrics.map(metric => <article key={metric.label} className="space-y-2 rounded-lg border border-border p-5"><h2 className="text-sm font-medium text-muted-foreground">{metric.label}</h2><p className="text-2xl font-semibold tabular-nums">{metric.value}</p><p className="text-sm text-muted-foreground">{metric.detail}</p></article>)}</section>{visualization}<section aria-label="Evidence"><DataGrid {...evidence} /></section><section className="rounded-lg border border-border p-5"><h2 className="mb-2 text-lg font-semibold">How to read this report</h2><p>{explanation}</p></section></main>;
}
