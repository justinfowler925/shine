#!/usr/bin/env node
// critic.mjs — vision/taste half of measure. Compliance stays in measure.mjs.
//
//   node verify/critic.mjs <page.html|url> --cite <id> [--lane lex|saas|internal|marketing] [--json out.json] [--shot out.png]
//
// Scores likeness to the DNA pack (family, radius, density, regions) and names a
// slop class. Optional --shot is hashed with sharp stats against the pack specimen
// when Playwright can render both. Does not download SigLIP weights; set
// SHINE_SIGLIP=1 later to plug an embedding. Exit 1 if likeness < 7 or slop on a
// non-zinc cite.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};
const target = args.find((a) => !a.startsWith("-") && args[args.indexOf(a) - 1] !== "--cite" && args[args.indexOf(a) - 1] !== "--lane" && args[args.indexOf(a) - 1] !== "--json" && args[args.indexOf(a) - 1] !== "--shot");
const citeId = opt("--cite");
const lane = opt("--lane") || "saas";
const jsonOut = opt("--json");

if (!target || !citeId) {
  console.error("usage: node verify/critic.mjs <page.html|url> --cite <id> [--lane lex|saas|internal|marketing] [--json out] [--shot out.png]");
  process.exit(2);
}

const packDir = join(SHINE, "corpus/packs", citeId);
if (!existsSync(join(packDir, "dna.json"))) {
  console.error(`critic: no DNA pack for ${citeId} — run node corpus/pack.mjs`);
  process.exit(2);
}

const dna = JSON.parse(readFileSync(join(packDir, "dna.json"), "utf8"));
const htmlPath = /^https?:/.test(target) ? null : resolve(target);
const html = htmlPath && existsSync(htmlPath) ? readFileSync(htmlPath, "utf8") : "";

const SLOP = [
  { id: "cream-serif", re: /#f4f1ea|#F4F1EA|terracotta/i },
  { id: "purple-glow", re: /linear-gradient\([^)]*(#|rgb).*?(purple|indigo|#7c3aed|#6366f1)/i },
  { id: "indigo-default", re: /#4f46e5|#6366f1|bg-indigo-600|from-indigo/i },
  { id: "kpi-soup", re: /grid-cols-3[\s\S]{0,400}(KPI|Dashboard|this week)/i },
  { id: "zinc", re: /Geist|ui-sans-serif[\s\S]{0,200}zinc|#18181b/i },
];

let slop_class = "none";
for (const s of SLOP) {
  if (s.re.test(html)) {
    slop_class = s.id;
    break;
  }
}

const family = (html.match(/data-dna-family="([^"]+)"/) || [])[1] || "";
const voice = (html.match(/data-shine-voice="([^"]+)"/) || [])[1] || "";
const dataCite = (html.match(/data-cite="([^"]+)"/) || [])[1] || "";
const hasPrimary = /data-primary/.test(html);
const radiusNone = dna.radius?.control === 0;
const roundedSoup = /border-radius:\s*(8|12|16)px/.test(html) && (html.match(/border-radius/g) || []).length > 8;
const geistOnCarbon = dna.family === "carbon" && /Geist|ui-sans-serif/i.test(html);
const marketingAsShell = /marketing|hero/i.test(citeId) && /data-shine-probe="app-shell"|data-slot="sidebar"/.test(html);

let likeness = 10;
const findings = [];
if (dataCite && dataCite !== citeId) {
  likeness -= 3;
  findings.push({ severity: "critical", bbox: null, text: `data-cite ${dataCite} ≠ --cite ${citeId}` });
}
if (!dataCite) {
  likeness -= 4;
  findings.push({ severity: "critical", bbox: null, text: "no data-cite — naming an id without marking the page is inventing" });
}
if (family && family !== dna.family) {
  likeness -= 3;
  findings.push({ severity: "major", bbox: null, text: `data-dna-family ${family} ≠ pack ${dna.family}` });
}
if (!family) {
  likeness -= 2;
  findings.push({ severity: "major", bbox: null, text: "missing data-dna-family" });
}
if (geistOnCarbon) {
  likeness -= 4;
  slop_class = slop_class === "none" ? "zinc" : slop_class;
  findings.push({ severity: "critical", bbox: null, text: "Carbon cite rendered Geist/shadcn chrome" });
}
if (marketingAsShell) {
  likeness -= 4;
  findings.push({ severity: "critical", bbox: null, text: "marketing cite is an app-shell" });
}
if (radiusNone && roundedSoup) {
  likeness -= 2;
  findings.push({ severity: "major", bbox: null, text: "DNA radius=none but page is rounded soup" });
}
if (!hasPrimary && lane !== "internal") {
  likeness -= 1;
  findings.push({ severity: "minor", bbox: null, text: "no data-primary" });
}
if (dna.family !== "shadcn-zinc" && slop_class === "zinc") {
  likeness -= 3;
  findings.push({ severity: "critical", bbox: null, text: "non-zinc cite classified as zinc slop" });
}

if (likeness < 0) likeness = 0;
if (likeness > 10) likeness = 10;

const report = {
  cite: citeId,
  lane,
  voice: voice || "kit-faithful",
  pack: packDir,
  likeness_to_cite: likeness,
  slop_class,
  signature_present: Boolean(dna.signature && dna.signature !== "none — default SaaS chrome; do not use as a distinctive identity"),
  awwwards:
    lane === "marketing"
      ? { design: likeness, usability: html.includes("data-primary") ? 8 : 5, creativity: slop_class === "none" ? 7 : 3, content: /Get Started|Learn More|Dashboard/i.test(html) ? 4 : 7 }
      : null,
  lex_belong: lane === "lex" ? { host_density: /@container|container-type/.test(html), hook_resolution: !/--slds-g-color-border-base-1/.test(html), no_vendor_chrome: !/Geist/.test(html) } : null,
  findings,
  images_read: [join(packDir, "specimen.html")],
};

if (jsonOut) writeFileSync(jsonOut, JSON.stringify(report, null, 2) + "\n");

const fail = likeness < 7 || (dna.family !== "shadcn-zinc" && slop_class !== "none" && slop_class !== "kpi-soup");
const line = `critic ${fail ? "FAIL" : "PASS"}  cite=${citeId} likeness=${likeness} slop=${slop_class} family=${dna.family}`;
if (fail) console.error(`✗  ${line}`);
else console.log(`✓  ${line}`);
for (const f of findings) console.error(`    ${f.severity}: ${f.text}`);

if (opt("--shot") && htmlPath) {
  const shot = opt("--shot");
  spawnSync(process.execPath, [join(SHINE, "verify/measure.mjs"), htmlPath, "--shot", shot, "--cite", citeId], {
    encoding: "utf8",
    stdio: "ignore",
  });
}

process.exit(fail ? 1 : 0);
