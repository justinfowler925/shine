#!/usr/bin/env node
// Generate site/shine-skill.md — ONE self-contained file. No external file references,
// no Node tooling, no corpus. Source of truth is the Cowork plugin's adapted references.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const refs = join(here, "plugin/skills/shine/references");
const out = join(here, "../site/shine-skill.md");

// Reading order. EVERY reference is inlined — a self-contained file may not point at a
// file the reader does not have. Adding a reference to the plugin without adding it here
// is a build failure, not a silent omission.
const ORDER = [
  ["diagnose", "The loop — how to find what is wrong"],
  ["wireframe", "Wireframe — discovery before build"],
  ["direction", "Direction — art direction before code"],
  ["templates", "Templates — start from a real page"],
  ["contracts", "Component contracts — what every named control owes"],
  ["foundations", "Foundations — tokens, states, accessibility floor"],
  ["taste", "Taste — measured thresholds and failure tells"],
  ["color-type", "Color and type — the method"],
  ["motion", "Motion — durations, easing, reduced motion"],
  ["layout", "Layout — structure as information"],
  ["patterns", "Patterns — screen archetypes"],
  ["techniques", "Techniques — craft transfer"],
  ["interaction", "Interaction — keyboard and pointer behavior"],
  ["anti-patterns", "Anti-patterns — lane-relative"],
  ["voices", "Voices — three legal paints"],
  ["kits", "Kits — which library, and worked recipes"],
  ["dashboards", "Dashboards — surfaces that answer questions"],
  ["dataviz", "Data visualization — encoding rules"],
  ["ai-surfaces", "AI surfaces — topologies"],
  ["copy", "Copy — the presentation layer as an argument"],
  ["adoption", "Adoption — will anyone open it"],
  ["voice", "Voice — surfaces that speak or listen"],
  ["brand", "Brand mode — the adapter"],
  ["salesforce", "Salesforce — Lightning and SLDS 2"],
  ["performance", "Performance — budgets and thresholds"],
  ["imagegen", "Imagery — anti-stock rules"],
  ["ecosystem", "Ecosystem — libraries, licenses, maintenance"],
  ["cross-media", "Cross-media — decks, PDFs, reports, and email"],
  ["usability", "Usability proof — executable, not inferred"],
  ["audit", "Audit — rubric and report template"],
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const included = new Set(ORDER.map(([id]) => id));
// Link text is the short name (before the em dash) so an inline cross-reference stays
// readable mid-sentence; the anchor still points at the full section heading.
const short = (title) => title.split(" — ")[0];
const anchor = new Map(ORDER.map(([id, title]) => [id, `[§ ${short(title)}](#${slug(title)})`]));

// Demote headings so each file nests under its `##` section, and rewrite cross-file
// references into in-document links (or plain prose when the file was not included).
function transform(id, body) {
  let t = body.replace(/^#\s+.*\n+/, ""); // drop the file's own H1 — the section head replaces it
  t = t.replace(/^(#{1,5})\s/gm, (_, h) => "#".repeat(Math.min(h.length + 2, 6)) + " ");
  t = t.replace(/\[([^\]]+)\]\(([a-z0-9-]+)\.md\)/g, (m, text, target) => {
    if (!included.has(target)) throw new Error(`${id}.md links to ${target}.md, which is not inlined`);
    return anchor.get(target);
  });
  t = t.replace(/`(?:references\/)?([a-z0-9-]+)\.md`(\s*§\s*[^\n,.;)]+)?/g, (m, target, sect) => {
    if (!included.has(target)) throw new Error(`${id}.md references ${target}.md, which is not inlined`);
    return anchor.get(target) + (sect || "");
  });
  // Blueprints are 14 separate region-map files; they ship in the plugin bundle, not here.
  // Say so plainly rather than implying the reader already has them.
  t = t.replace(
    "bundled with this skill in\n  `references/blueprints/<id>.md`: an ordered region map, host facts, do-nots, and an\n  agent checklist.",
    "an ordered region map, host facts, do-nots, and an\n  agent checklist for each. These ship as separate files in the full plugin bundle,\n  not in this single file — build from the row's regions and the rules below.");
  if (/references\/blueprints/.test(t)) throw new Error(`${id}.md has an unhandled blueprints reference`);
  return t.trim();
}

const head = readFileSync(join(here, "plugin/skills/shine/SKILL.md"), "utf8")
  .replace(/^---\n[\s\S]*?\n---\n/, "")            // strip plugin frontmatter
  .trim()
  .replace(/^#\s+Shine\s*\n+/, "")                 // this doc supplies its own H1
  .replace(/the references in this skill decide/, "the sections below decide")
  .replace(/## References — open on demand[\s\S]*$/, "")  // the file map is replaced by the TOC
  .replace("bundled blueprint in `references/blueprints/`, or public demo)",
           "bundled blueprint region map, or public demo)")
  .replace(/`references\/([a-z0-9-]+)\.md`/g, (m, id) => {
    if (!included.has(id)) throw new Error(`SKILL.md references ${id}.md, which is not inlined`);
    return anchor.get(id);
  })
  .trim();

const toc = ORDER.map(([, title]) => `- [${title}](#${slug(title)})`).join("\n");

const doc = `---
name: shine
description: >-
  Design, build, or audit interfaces using real template structure, complete interaction
  contracts, measured craft rules, and browser proof. Use for any UI or UX work: web pages,
  dashboards, tables, forms, landing pages, charts, HTML artifacts, email, Salesforce
  Lightning, prototypes, mockups, wireframes, design reviews, or visual polish.
---

# Shine — self-contained design authority

All ${ORDER.length} Shine references are inlined below. Nothing to install, no corpus to
clone, no other file to open. Adapted from Shine v4.0
(github.com/justinfowler925/shine, MIT).

**Not in this file:** the 14 blueprint region maps (records, settings, wizards, marketing,
checkout, blog, and the Salesforce Lightning set) and their four authored \`page.tsx\`
sources. Rows marked *blueprint* in the template catalog name a real screen, but you build
from the catalog row and the rules here rather than a bundled region map. Those files ship
in the plugin bundle at github.com/justinfowler925/shine.

## Contents

${toc}

${head}

${ORDER.map(([id, title]) => {
  const body = transform(id, readFileSync(join(refs, `${id}.md`), "utf8"));
  return `---\n\n## ${title}\n\n${body}`;
}).join("\n\n")}
`;

writeFileSync(out, doc);
const bytes = Buffer.byteLength(doc);
console.log(`built ${out}`);
console.log(`  ${bytes.toLocaleString()} bytes · ${doc.split("\n").length.toLocaleString()} lines · ~${Math.round(bytes / 4000)}k tokens`);

// Self-check: no dangling file references survived.
const dangling = [...doc.matchAll(/`(?:references\/)?([a-z0-9-]+\.md)`|\]\(([a-z0-9-]+\.md)\)/g)]
  .map((m) => m[1] || m[2])
  .filter((n) => n !== "SKILL.md" && n !== "DESIGN.md" && n !== "brand.local.md");
if (dangling.length) {
  console.error(`FAIL — ${dangling.length} dangling file reference(s): ${[...new Set(dangling)].join(", ")}`);
  process.exit(1);
}
console.log("  no dangling file references");

// Drift check. The plugin's references are copies of skill/references. Verbatim copies must
// stay byte-identical; the template catalog must carry the same rows. Drift here means a
// download that silently disagrees with the repo — warn loudly rather than ship it quietly.
const upstream = join(here, "../skill/references");
// Verbatim copies only. The rest are deliberately adapted (repo tooling stripped) and
// cannot be byte-compared — the catalog row count below is the drift signal for those.
const VERBATIM = ["adoption", "ai-surfaces", "color-type", "copy", "dashboards", "dataviz",
  "ecosystem", "imagegen", "interaction", "motion", "patterns", "performance", "taste", "voice"];
const stale = [];
for (const id of VERBATIM) {
  try {
    if (readFileSync(join(upstream, `${id}.md`), "utf8") !== readFileSync(join(refs, `${id}.md`), "utf8")) {
      stale.push(`${id}.md`);
    }
  } catch { stale.push(`${id}.md (unreadable)`); }
}
const rows = (f) => (readFileSync(f, "utf8").match(/^\| [a-z]/gm) || []).length;
const up = rows(join(upstream, "templates.md")), mine = rows(join(refs, "templates.md"));
if (up !== mine) stale.push(`templates.md catalog (repo ${up} rows, bundle ${mine})`);
if (stale.length) {
  console.warn(`  STALE vs skill/references — refresh before publishing: ${stale.join(", ")}`);
} else {
  console.log("  references match skill/references");
}
