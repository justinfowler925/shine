#!/usr/bin/env node
/**
 * N2 — vibe-check / preflight-slop signals (seconds-to-soup).
 *
 * Ports signal IDs inspired by vibe-check `slop-scan` (git install only —
 * not npm package `slop-scan`). Emits ai-slop-* notes that measure can promote
 * to hard-fail on Operate denoise fixtures.
 *
 * Pure HTML/static analysis — no browser required for triage.
 */

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @typedef {{ id: string, severity: "fail"|"note", message: string, count?: number }} SlopSignal */

export const SIGNAL_IDS = Object.freeze([
  "ai-slop-cta-mania",
  "ai-slop-card-carnival",
  "ai-slop-badge-spam",
  "ai-slop-kpi-strip",
  "ai-slop-metric-grid",
  "ai-slop-nested-cards",
  "ai-slop-filler-copy",
]);

const FILLER_RE =
  /welcome to your dashboard|get started with your (new )?dashboard|no data to display|nothing here yet|coming soon|lorem ipsum|your (amazing )?content (goes|here)/i;

/**
 * @param {string} html
 * @param {{ gate?: boolean, screen?: string }} [opts]
 * @returns {{ signals: SlopSignal[], failures: string[], notes: string[] }}
 */
export function scanPreflightSlop(html, { gate = true, screen = "" } = {}) {
  const src = String(html || "");
  const signals = [];

  // Distinct filled *treatments* (not per-row Pursue repeats). Peer class or
  // second opaque style-block button = mania; row-repeated .filled alone is OK.
  const hasFilled = /\bclass=["'][^"']*\bfilled\b/.test(src);
  const hasFilledPeer = /\bfilled-peer\b/.test(src);
  const variantDefault = (src.match(/variant=["']default["']/gi) || []).length;
  const styleFilled = (src.match(/button#[\w-]+\s*\{[^}]*background:\s*#[0-9a-f]{3,8}[^}]*\}/gi) || []).length;
  // Buttons in toolbars / action rows outside <td> with filled class
  const outsideTable = src.replace(/<t[dh][\s\S]*?<\/t[dh]>/gi, " ");
  const toolbarFilled = (outsideTable.match(/class=["'][^"']*\bfilled\b[^"']*["']/gi) || []).length;
  const ctaKinds =
    (hasFilled ? 1 : 0) + (hasFilledPeer ? 1 : 0) + (variantDefault >= 2 ? 1 : 0) + (styleFilled >= 2 ? 1 : 0);
  const ctaCount = Math.max(ctaKinds, toolbarFilled >= 2 ? 2 : toolbarFilled >= 1 && hasFilledPeer ? 2 : 0);
  if (ctaCount >= 2) {
    signals.push({
      id: "ai-slop-cta-mania",
      severity: "fail",
      message: `≥2 filled primary treatments detected in static HTML (kinds≈${ctaCount}, toolbarFilled=${toolbarFilled})`,
      count: ctaCount,
    });
  }

  const cards = (src.match(/\bdata-slot=["']card["']|\bclass=["'][^"']*\bcard\b|\b<article\b/gi) || []).length;
  if (cards >= 4) {
    signals.push({
      id: "ai-slop-card-carnival",
      severity: "fail",
      message: `≥4 card-like roots in markup (count=${cards}) — card carnival`,
      count: cards,
    });
  }

  // Parked metrics / filter pills inside collapse <details> are not on the decide path.
  // Strip <style> so .metrics/.metric CSS rules cannot false-positive cluster detect.
  const srcVisible = src
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(
      /<details\b[^>]*(?:data-shine-kpi-rest|data-shine-pill-rest)[^>]*>[\s\S]*?<\/details>/gi,
      "",
    );

  // Badge/chip hosts only (not the word "badge" in titles/comments). Aligns with
  // pill-filter measure hosts; pill-collapse parks excess in data-shine-pill-rest.
  const badges = (
    srcVisible.match(
      /<(?:button|span|a|div)\b[^>]*(?:data-slot=["']badge["']|class=["'][^"']*\b(?:badge|chip)\b)[^>]*>/gi,
    ) || []
  ).length;
  if (badges >= 5) {
    const operateQueue =
      /queue|datagrid|app-shell/i.test(screen) || /data-cite=["'][^"']*queue/i.test(src);
    // Operate queue: hard-fail ≥5 (pill-filter twin). Elsewhere: note only at ≥8 spam.
    if (operateQueue || badges >= 8) {
      signals.push({
        id: "ai-slop-badge-spam",
        severity: operateQueue ? "fail" : "note",
        message: `badge/chip spam count=${badges}`,
        count: badges,
      });
    }
  }
  // Count tiles — not bare "kpi" substrings in data-kpi= / data-shine-kpi-rest.
  const metrics = (
    srcVisible.match(/\bclass=["'][^"']*\bmetric\b[^"']*["']|\bdata-shine-kpi=(["'])[^"']*\1/gi) || []
  ).length;
  if (metrics >= 4) {
    const operateQueue = /queue|datagrid|app-shell/i.test(screen) || /data-cite=["'][^"']*queue/i.test(src);
    signals.push({
      id: "ai-slop-kpi-strip",
      severity: operateQueue ? "fail" : "note",
      message: `≥4 metric/KPI markers (count=${metrics}) — KPI strip / soup risk`,
      count: metrics,
    });
  }

  // Metric-grid: markup cluster — metrics/kpi-strip container with ≥4 visible hosts.
  // CSS-only .metrics/.metric rules are stripped above; kpi-collapse parks excess in
  // data-shine-kpi-rest so Operate queue FAIL→PASS with the existing auto-safe op.
  const metricHosts = (
    srcVisible.match(
      /<(?:div|section|article|li|span)\b[^>]*(?:class=["'][^"']*\bmetric\b[^"']*["']|data-shine-kpi=)[^>]*>/gi,
    ) || []
  ).length;
  const hasMetricsContainer =
    /<(?:div|section|ul)\b[^>]*(?:class=["'][^"']*\bmetrics\b|data-shine-kpi-strip|data-shine-metrics)[^>]*>/i.test(
      srcVisible,
    );
  if (hasMetricsContainer && metricHosts >= 4) {
    const operateQueue =
      /queue|datagrid|app-shell/i.test(screen) || /data-cite=["'][^"']*queue/i.test(src);
    signals.push({
      id: "ai-slop-metric-grid",
      severity: operateQueue ? "fail" : "note",
      message: `metric-grid cluster (≥4 hosts in metrics container, count=${metricHosts})`,
      count: metricHosts,
    });
  }

  if (/<(?:div|section|article)[^>]*card[\s\S]{0,400}<(?:div|section|article)[^>]*card/i.test(src)) {
    signals.push({
      id: "ai-slop-nested-cards",
      severity: "note",
      message: "nested card-like containers detected",
    });
  }

  if (FILLER_RE.test(src)) {
    signals.push({
      id: "ai-slop-filler-copy",
      severity: "fail",
      message: "filler empty/dashboard copy phrase in markup",
    });
  }

  const failures = [];
  const notes = [];
  for (const s of signals) {
    const line = `${s.id}: ${s.message}`;
    if (gate && s.severity === "fail") failures.push(line);
    else notes.push(line);
  }
  return { signals, failures, notes, signalIds: SIGNAL_IDS };
}

export function formatPreflightFailures(result) {
  return result?.failures || [];
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : "";
  if (!file || !existsSync(file)) {
    console.error("usage: preflight-slop.mjs <file.html> [--json out]");
    process.exit(1);
  }
  const html = readFileSync(resolve(file), "utf8");
  const screenMatch = html.match(/data-cite=["']([^"']+)["']/);
  const result = scanPreflightSlop(html, { gate: true, screen: screenMatch?.[1] || "" });
  const report = { file: resolve(file), ...result };
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  process.exit(result.failures.length ? 1 : 0);
}
