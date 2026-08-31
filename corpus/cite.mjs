#!/usr/bin/env node
// cite.mjs — turn a job (in plain words) into a template you can actually see and read.
//
//   node corpus/cite.mjs dashboard
//   node corpus/cite.mjs "settings page"
//   node corpus/cite.mjs queue
//   node corpus/cite.mjs --list
//
// Output per match: the pack screenshot (read it first — pixels are the design),
// readable source files vendored in the pack (registry JSON is extracted if the
// pack is missing), the kit token sheet, and the preview URL.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { collectCorpusSource, packSourceFiles } from "./pack-files.mjs";
import { retrieveDirections } from "./art-direction.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = resolve(process.env.DESIGN_CORPUS || join(homedir(), "design-corpus"));
const CATALOG = join(SHINE, "corpus/templates.json");
const EXTRACT = join(SHINE, "corpus/extracted");
const die = (code, msg) => {
  process.stderr.write(msg.endsWith("\n") ? msg : msg + "\n");
  process.exit(code);
};

if (!existsSync(CATALOG)) die(2, `cite: missing ${CATALOG}`);
const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
const templates = catalog.templates ?? [];

const argv = process.argv.slice(2);
const value = (name) => argv.includes(name) ? argv[argv.indexOf(name) + 1] : "";
const valued = new Set(["--lane","--audience","--density","--shape","--brand","--interaction","--tone","--type","--image","--framework","--license","--history"]);
const arg = argv.filter((item, index) => !item.startsWith("-") && !valued.has(argv[index - 1])).join(" ").trim();
if (process.argv.includes("--list")) {
  process.stdout.write("screen\tid\tkind\tjobs\n");
  for (const t of templates) process.stdout.write(`${t.screen}\t${t.id}\t${t.kind}\t${(t.jobs || []).join(",")}\n`);
  process.exit(0);
}
if (!arg) {
  die(1, `usage: node corpus/cite.mjs <job, in plain words>\n       node corpus/cite.mjs --list`);
}

const retrieval = retrieveDirections(templates, arg, {
  lane:value("--lane"), audience:value("--audience"), density:value("--density"), informationShape:value("--shape"),
  brand:value("--brand"), interaction:value("--interaction"), tone:value("--tone"), type:value("--type"), image:value("--image"),
  framework:value("--framework"), licenseMode:value("--license") || "source", history:value("--history")
});
if (!retrieval.selected.length) {
  const jobs = [...new Set(templates.flatMap((t) => t.jobs ?? []))].sort().join(", ");
  die(
    1,
    `cite: nothing matches ${JSON.stringify(arg)}\nGaps: ${retrieval.gaps.join("; ")}\nknown jobs: ${jobs}\n` +
      `No row for this screen? Start from the nearest row + references/patterns.md; ` +
      `add a row (corpus/index-templates.mjs) after the screen ships, if it earned it.`,
  );
}
const row = retrieval.selected[0].template;
const alternates = retrieval.selected.slice(1).map((candidate) => candidate.template);

// ---- collect readable source --------------------------------------------------
// Prefer the vendored pack (shot + source/ + tokens.css). Fall back to the pinned
// corpus so materialize and a fresh clone without packs still work.
const packDir = join(SHINE, "corpus/packs", row.id);
const packSrc = packSourceFiles(packDir);
let files = packSrc;
let show = packSrc.slice(0, 3);
let extra = Math.max(0, packSrc.length - show.length);
let fromPack = packSrc.length > 0;

if (!fromPack) {
  const abs = row.path ? join(CORPUS, row.path) : "";
  if (row.kind === "source" && abs && !existsSync(abs)) {
    die(2, `cite: ${row.id} path missing: ${abs}\nrun: corpus/acquire.sh`);
  }
  const collected = collectCorpusSource(row, { corpus: CORPUS, extractDir: EXTRACT });
  files = collected.files;
  show = collected.show;
  extra = collected.extra;
}

// ---- pack (harvested pixels) ---------------------------------------------------
const shot = join(packDir, "shot.png");
const packTokens = join(packDir, "tokens.css");
const family = row.dna?.family || "shine";
const voiceCss = join(SHINE, "tokens/voices", `${family}.css`);

const out = [];
out.push(`Brief axes: ${["job","lane","audience","density","informationShape","brand","interaction","tone","type","image","framework"].map((axis) => `${axis}=${retrieval.brief[axis]}`).join(" · ")}`);
if (retrieval.brief.demandedSlop.length) out.push(`Demanded style (brief-explicit only): ${retrieval.brief.demandedSlop.join(", ")}`);
out.push(`Template: ${row.id} — ${row.title || ""}`);
const primary = retrieval.selected[0];
out.push(`Direction: ${["job","lane","audience","density","informationShape","brand","interaction","tone","type","image","framework","signature"].map((axis) => `${axis}=${primary.axes[axis]}`).join(" · ")}`);
out.push(`Why eligible: score=${primary.score}; matched axes=${primary.matches.join(", ") || "job"}; history tie-break count=${primary.history}`);
out.push(`Kit: ${row.kit}   Kind: ${row.kind}   License: ${row.license || ""}`);
out.push(`Jobs: ${(row.jobs || []).join(", ")}`);
if (existsSync(shot)) {
  out.push(`Shot: ${shot}   ← read this image first; the pixels are the design`);
} else if (row.preview) {
  out.push(`Shot: none harvested yet — preview: ${row.preview}`);
} else if (row.kind === "blueprint") {
  // A row's note is a full sentence that stands on its own, so it is printed
  // verbatim; only the fallback gets the "structure lives in" lead-in. Reading
  // the note as a noun phrase produced "structure lives in <sentence>".
  //
  // The fallback is the row's own region map. It used to be references/salesforce.md,
  // which is right for the LEX rows and sent every other blueprint to Salesforce.
  out.push(row.note
    ? `Shot: none — blueprint row; ${row.note}`
    : `Shot: none — blueprint row; structure lives in corpus/blueprints/${row.id}.md`);
}
if (existsSync(packTokens)) out.push(`Kit tokens: ${packTokens}`);
if (existsSync(voiceCss)) out.push(`Voice sheet: tokens/voices/${family}.css (import when kit-faithful)`);
out.push(`Family: ${family}   Density: ${row.dna?.density || ""}`);
if (show.length) {
  out.push(``);
  const srcKind = fromPack
    ? ", in the pack"
    : files.some((f) => f.startsWith(EXTRACT))
      ? ", extracted from registry JSON"
      : "";
  out.push(`Source (readable${srcKind}):`);
  for (const f of show) out.push(`  ${f}`);
  if (extra > 0) out.push(`  … ${extra} more in ${fromPack ? join(packDir, "source") : row.path || "the corpus"}`);
}
if (alternates.length) {
  out.push(``);
  out.push(`Also consider:`);
  for (const alt of alternates) {
    const candidate = retrieval.selected.find((item) => item.template.id === alt.id);
    out.push(`  ${alt.id} — ${alt.title || alt.screen}; semantic distance ${candidate.distance}; matches ${(candidate.matches || []).join(", ") || "job"}`);
  }
}
const explained = retrieval.exclusions.slice(0, 4);
if (explained.length) {
  out.push(``); out.push(`Excluded:`);
  for (const item of explained) out.push(`  ${item.template.id} — ${item.reasons.join("; ")}`);
}
if (retrieval.gaps.length) { out.push(``); out.push(`Catalog gaps: ${retrieval.gaps.join("; ")}`); }
out.push(``);
out.push(`Copy the regions from the source; paint with the voice sheet / kit tokens (or house/brand lane). references/voices.md.`);
out.push(`Integration: node ${join(SHINE, "integrations/resolve.mjs")} --project <consumer-root> --kit ${family === "material" ? "mui" : family === "ant" ? "ant" : family === "carbon" ? "carbon" : family === "shadcn-zinc" ? "shadcn-tanstack" : "native"}`);
out.push(`Scaffold: node ${join(SHINE, "integrations/scaffold.mjs")} --project <consumer-root> --out <destination>`);
process.stdout.write(out.join("\n") + "\n");
process.exit(0);
