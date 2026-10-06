#!/usr/bin/env node
/**
 * N3 — Impeccable distill/quieter adapter (opt-in, post-cite only).
 *
 * Vendors guidance into denoise skill after cite is locked and CTA/focal ops
 * have run. Never overrides data-cite. Never replaces measure/prove.
 *
 * Usage: node verify/adapters/impeccable.mjs --mode distill|quieter [--cite id]
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const IMPECCABLE_MODES = Object.freeze(["distill", "quieter"]);

/**
 * @param {"distill"|"quieter"} mode
 * @param {{ cite?: string, structureGreen?: boolean }} [opts]
 */
export function adaptImpeccable(mode, { cite = "", structureGreen = false } = {}) {
  if (!IMPECCABLE_MODES.includes(mode)) {
    throw new Error(`impeccable mode must be ${IMPECCABLE_MODES.join("|")}`);
  }
  if (!structureGreen) {
    return {
      allowed: false,
      mode,
      cite: cite || null,
      citeSafe: true,
      instruction:
        "Refuse Impeccable distill/quieter until cite is locked and structure gates (CTA/focal/primaryTask) are green. Cite is never overridden.",
      prompts: [],
    };
  }
  const prompts =
    mode === "distill"
      ? [
          "Simplify visual noise without changing information hierarchy or data-cite.",
          "Remove decorative chrome that does not serve the Monday job.",
          "Keep one filled primary; do not invent new CTAs.",
        ]
      : [
          "Quieter pass: reduce contrast shouting and equal-weight panels.",
          "Preserve focal region and cite id attributes exactly.",
          "Do not retheme Operate into marketing DNA.",
        ];
  return {
    allowed: true,
    mode,
    cite: cite || null,
    citeSafe: true,
    instruction:
      "Post-cite polish only. data-cite is immutable. Re-run measure after edits; prove still required for Operate.",
    prompts,
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
  const mode = opt("--mode") || "distill";
  const structureGreen = args.includes("--structure-green");
  try {
    const result = adaptImpeccable(mode, { cite: opt("--cite"), structureGreen });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exit(result.allowed ? 0 : 2);
  } catch (error) {
    console.error(`shine impeccable: ${error.message}`);
    process.exit(1);
  }
}
