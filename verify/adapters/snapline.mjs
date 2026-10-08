#!/usr/bin/env node
/**
 * N3 — Snapline adapter (opt-in).
 *
 * Maps Snapline Stop JSON findings into Shine preflight/diagnose notes.
 * Never replaces verify/stop-sweep.mjs — Shine remains gate of record.
 *
 * Usage: node verify/adapters/snapline.mjs <snapline-stop.json> [--json out]
 */

import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {object} stopJson Snapline Stop export
 * @returns {{ notes: string[], preflightHints: string[], citeSafe: true }}
 */
export function adaptSnaplineStop(stopJson) {
  const findings = Array.isArray(stopJson?.findings)
    ? stopJson.findings
    : Array.isArray(stopJson?.issues)
      ? stopJson.issues
      : Array.isArray(stopJson)
        ? stopJson
        : [];
  const notes = [];
  const preflightHints = [];
  for (const f of findings) {
    const id = f.id || f.rule || f.code || "snapline";
    const msg = f.message || f.detail || f.title || JSON.stringify(f).slice(0, 120);
    const line = `snapline:${id}: ${msg}`;
    notes.push(line);
    if (/cta|button|primary|hierarchy/i.test(`${id} ${msg}`)) preflightHints.push("ai-slop-cta-mania");
    if (/card|soup|nested/i.test(`${id} ${msg}`)) {
      preflightHints.push("ai-slop-card-carnival");
      preflightHints.push("ai-slop-nested-cards");
    }
    if (/badge|chip|pill/i.test(`${id} ${msg}`)) preflightHints.push("ai-slop-badge-spam");
    if (/metric|kpi|grid/i.test(`${id} ${msg}`)) {
      preflightHints.push("ai-slop-metric-grid");
      preflightHints.push("ai-slop-kpi-strip");
    }
    if (/copy|filler|lorem|empty/i.test(`${id} ${msg}`)) preflightHints.push("ai-slop-filler-copy");
  }
  return {
    notes,
    preflightHints: [...new Set(preflightHints)],
    citeSafe: true,
    instruction:
      "Snapline is opt-in agent-host preflight. It never overrides data-cite or replaces stop-sweep.mjs / measure.mjs.",
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file || !existsSync(file)) {
    console.error("usage: snapline.mjs <stop.json> [--json out]");
    process.exit(1);
  }
  const adapted = adaptSnaplineStop(JSON.parse(readFileSync(resolve(file), "utf8")));
  const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : "";
  if (jsonOut) writeFileSync(jsonOut, JSON.stringify(adapted, null, 2) + "\n");
  process.stdout.write(JSON.stringify(adapted, null, 2) + "\n");
}
