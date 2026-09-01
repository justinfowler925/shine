#!/usr/bin/env node
// Generate the skill file listing in site/index.html from what is actually on disk.
//
// This block used to be hand-typed, which made it wrong the moment anyone edited a
// reference file — and the doctor check that compares it to disk would then fail for
// a condition nobody had introduced on purpose. A session starting mid-edit saw a
// FAIL that resolved itself. Numbers a human maintains by hand drift by default; the
// fix is to stop asserting them and derive them instead.
//
//   node site/scripts/skill-listing.mjs --check   exit 1 and print the drift
//   node site/scripts/skill-listing.mjs --write   rewrite the block in place
//
// Alignment is reproduced exactly as the page already had it, including the one-column
// difference between the <strong>-wrapped rows and the plain ones — so a run against an
// already-current page is a no-op, byte for byte.

import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PAGE = join(ROOT, "site/index.html");
const PUBLIC_SKILL = join(ROOT, "site/SKILL.md");
const CANONICAL_SKILL = join(ROOT, "skill/SKILL.md");
const REFS = "skill/references";

// Visible (tag-stripped) column at which the numbers end.
const EDGE_PLAIN = 34; // reference rows, no markup
const EDGE_BOLD = 33; // SKILL.md and the total, both wrapped in <strong>
const EDGE_HEAD = 35; // the "lines" header

const lineCount = (rel) => readFileSync(join(ROOT, rel), "utf8").split("\n").length - 1;

const refs = readdirSync(join(ROOT, REFS))
  .filter((f) => f.endsWith(".md") && !f.endsWith(".local.md"))
  .sort();

const skillLines = lineCount("skill/SKILL.md");
const refLines = refs.map((f) => [f, lineCount(`${REFS}/${f}`)]);
const total = skillLines + refLines.reduce((a, [, n]) => a + n, 0);

const pad = (left, right, edge) => left + " ".repeat(Math.max(1, edge - left.length - right.length)) + right;
const group = (n) => n.toLocaleString("en-US");

const built = [
  `<pre>${pad("skill/", "lines", EDGE_HEAD)}`,
  // visible text is "  SKILL.md" + gap + count; the tags do not occupy a column
  `  <strong>SKILL.md</strong>${" ".repeat(EDGE_BOLD - 2 - "SKILL.md".length - String(skillLines).length)}${skillLines}`,
  `  references/`,
  ...refLines.map(([f, n]) => pad(`    ${f}`, String(n), EDGE_PLAIN)),
  `${" ".repeat(EDGE_BOLD - group(total).length)}<strong>${group(total)}</strong></pre>`,
].join("\n");

const page = readFileSync(PAGE, "utf8");
const canonicalSkill = readFileSync(CANONICAL_SKILL, "utf8");
const publicSkillCurrent = existsSync(PUBLIC_SKILL) && readFileSync(PUBLIC_SKILL, "utf8") === canonicalSkill;
const re = /<pre>skill\/[\s\S]*?<\/pre>/;
const current = page.match(re);

if (!current) {
  console.error("skill-listing: no skill tree block found in site/index.html");
  process.exit(2);
}

const write = process.argv.includes("--write");
const check = process.argv.includes("--check");

if (current[0] === built && publicSkillCurrent) {
  console.log(`skill-listing: current — ${refs.length} files, ${total} lines; public SKILL.md matches canonical`);
  process.exit(0);
}

if (check) {
  // Report the drift the way a person can act on, not as a wall of diff.
  const claimed = new Map(
    [...current[0].matchAll(/^\s{4}([\w.-]+\.md)\s+([\d,]+)$/gm)].map((m) => [m[1], Number(m[2].replace(/,/g, ""))]),
  );
  const problems = [];
  for (const [f, n] of refLines) {
    if (!claimed.has(f)) problems.push(`${f} missing from the listing`);
    else if (claimed.get(f) !== n) problems.push(`${f} says ${claimed.get(f)}, is ${n}`);
  }
  for (const f of claimed.keys()) if (!refLines.some(([g]) => g === f)) problems.push(`${f} listed but not on disk`);
  const claimedTotal = Number((current[0].match(/<strong>([\d,]+)<\/strong><\/pre>/) ?? [])[1]?.replace(/,/g, ""));
  if (claimedTotal !== total) problems.push(`total says ${claimedTotal}, is ${total}`);
  if (!publicSkillCurrent) problems.push("site/SKILL.md differs from skill/SKILL.md");
  if (!problems.length) problems.push("block differs only in whitespace");
  console.error(`skill-listing: STALE — ${problems.join("; ")}`);
  console.error("  fix: node site/scripts/skill-listing.mjs --write");
  process.exit(1);
}

if (write) {
  writeFileSync(PAGE, page.replace(re, built));
  writeFileSync(PUBLIC_SKILL, canonicalSkill);
  console.log(`skill-listing: written — ${refs.length} files, ${total} lines; public SKILL.md synced`);
  process.exit(0);
}

console.error("skill-listing: out of date. Pass --check to see what, or --write to fix.");
process.exit(1);
