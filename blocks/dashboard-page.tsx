"use client";
import type { ComponentProps,ReactNode } from "react";
import { ChartPanel } from "@/components/shine/chart-panel";
import { DateRange } from "@/components/shine/date-range";
export function DashboardPage({title,description,metrics,charts,dateRange,evidence}:{title:string;description:string;metrics:{label:string;value:string;context:string;href:string}[];charts:ComponentProps<typeof ChartPanel>[];dateRange:ComponentProps<typeof DateRange>;evidence:ReactNode}) {
 return <article data-product-pattern="dashboard-page" className="min-w-0 space-y-6"><header className="space-y-2"><h1 className="text-2xl font-semibold">{title}</h1><p className="text-muted-foreground">{description}</p></header><DateRange {...dateRange}/><dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-4">{metrics.map(metric=><div key={metric.label} className="space-y-2 rounded-lg border border-border p-5"><dt className="text-sm text-muted-foreground">{metric.label}</dt><dd className="text-2xl font-semibold"><a href={metric.href} className="underline decoration-border underline-offset-4">{metric.value}</a></dd><dd className="text-sm text-muted-foreground">{metric.context}</dd></div>)}</dl><div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,24rem),1fr))] gap-5">{charts.map(chart=><ChartPanel key={chart.title} {...chart}/>)}</div>{evidence}</article>;
}
