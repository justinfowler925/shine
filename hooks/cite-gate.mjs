#!/usr/bin/env node
// cite-gate.mjs — a UI page written this turn must name the catalog row it cloned.
// Instruction-only dispatch is how zinc clones ship with shine-ux sitting unread.
// This is not proof shine-ux ran; it is proof the page is cited. data-cite is the
// token; a comment `<!-- cite: id -->` is the HTML/host-language fallback.

import { readFileSync } from "node:fs";

const PAGE_EXT = /\.(html|tsx|jsx|svelte|vue)$/;
const HOST_EXT = /\.(py|go|rb)$/;
export const CITE_EXEMPT = /(^|\/)(corpus|tokens|verify\/fixtures|site|hooks|node_modules|dist)\//;
const CITE = /data-cite\s*=\s*["'][\w-]+["']|<!--\s*cite:\s*[\w-]+/;

export function citeGaps(paths, readText = (p) => readFileSync(p, "utf8")) {
  const gaps = [];
  for (const p of paths) {
    if (CITE_EXEMPT.test(p.replace(/\\/g, "/"))) continue;
    if (!PAGE_EXT.test(p) && !HOST_EXT.test(p)) continue;
    let text;
    try {
      text = readText(p);
    } catch {
      continue;
    }
    if (HOST_EXT.test(p) && !/<html[\s>]|<body[\s>]|<div[\s>]/i.test(text)) continue;
    if (!CITE.test(text)) gaps.push(p);
  }
  return gaps;
}
