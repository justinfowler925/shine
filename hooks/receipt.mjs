#!/usr/bin/env node
// last-prove.json — compare.mjs writes this; stop-sweep requires it for UI pages.
// data-cite without a prove receipt is still freelance paint (the attribute stamp).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const MAX_AGE_MS = 20 * 60 * 1000;

export function receiptPath() {
  return process.env.SHINE_RECEIPT || join(homedir(), ".cache/shine/last-prove.json");
}

export function writeProveReceipt({ cite, tool = "compare.mjs" }) {
  const p = receiptPath();
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify({ cite, tool, at: Date.now() }) + "\n");
}

export function readProveReceipt() {
  const p = receiptPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Cite ids on pages written this turn that have no matching compare.mjs receipt. */
export function proveGaps(citeIds, now = Date.now()) {
  const ids = [...new Set(citeIds.filter(Boolean))];
  if (!ids.length) return [];
  const rec = readProveReceipt();
  if (!rec || typeof rec.at !== "number" || now - rec.at > MAX_AGE_MS)
    return ids.map((id) => `${id}: no compare.mjs this turn`);
  return ids.filter((id) => rec.cite !== id).map((id) => `${id}: last prove was ${rec.cite || "(none)"}`);
}

export function citeIdsIn(text) {
  return [...String(text).matchAll(/data-cite\s*=\s*["']([\w-]+)["']/g)].map((m) => m[1]);
}
