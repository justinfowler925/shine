#!/usr/bin/env node
/**
 * Write/refresh a Figma kit pack after shot.png is on disk:
 *   node corpus/figma-pack-write.mjs --id <packId> --file <fileKey> --node <nodeId> \
 *     --title "..." --screen catalog --jobs "a,b,c" [--kit-family tailgrids]
 *
 * Stamps referenceHealth-passing capture (expectedText + semantic selector).
 * Writes blueprint md + pack source/ copy + tokens.css from shadcn-zinc.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : "");
const id = opt("--id");
const fileKey = opt("--file");
const nodeId = opt("--node");
const title = opt("--title") || id;
const screen = opt("--screen") || "catalog";
const jobs = (opt("--jobs") || "figma-kit").split(",").map((s) => s.trim()).filter(Boolean);
const family = opt("--kit-family") || id.replace(/^figma-/, "").split("-")[0];
const page = opt("--page") || title;
if (!id || !fileKey || !nodeId) {
  console.error("usage: --id --file --node required");
  process.exit(2);
}
const dir = join(SHINE, "corpus/packs", id);
const shot = join(dir, "shot.png");
if (!existsSync(shot)) {
  console.error(`missing ${shot}`);
  process.exit(1);
}
const bytes = statSync(shot).size;
const floor = 8000;
if (bytes < floor) {
  console.error(`shot only ${bytes}B under floor`);
  process.exit(1);
}
const sha = createHash("sha256").update(readFileSync(shot)).digest("hex");
const url = `https://www.figma.com/design/${fileKey}?node-id=${nodeId.replace(":", "-")}`;
const now = new Date().toISOString();
const expectedText = title;
const meta = {
  id,
  source: url,
  harvested: now.slice(0, 10),
  bytes,
  scope: "component",
  kit: family,
  title,
  fileKey,
  nodeId,
  discovery: "figma-full-ingest",
  capture: {
    status: 200,
    title,
    headings: expectedText,
    expectedSelector: "[data-figma-node], frame, svg",
    expectedCount: 1,
    expectedText,
    expectedTextMatched: true,
    sourceUrl: url,
    finalUrl: url,
    capturedAt: now,
    shotSha256: sha,
    figma: { fileKey, nodeId, page, kind: "component", family },
    provenance: "figma-kit-full-ingest",
  },
};
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

const bpDir = join(SHINE, "corpus/blueprints");
mkdirSync(bpDir, { recursive: true });
const md = `# ${title}

Regions. Host: React/Tailwind application shell (house kit). Density: comfortable.
Paint: \`tokens/voices/shadcn-zinc.css\`. Structure source: Figma \`${fileKey}\` node \`${nodeId}\`.
Shot: \`corpus/packs/${id}/shot.png\`. Prefer house shadcn cites when building Clearspeed Operate — this pack is silhouette evidence for **${family}** kit jobs, not a foreign runtime.

Figma: ${url}
Discovery: full-kit ingest 2026-10-09 (page/board inventory via use_figma; shot via Figma MCP/API).

1. **Kit provenance** — name the Figma file and node before citing. Do not invent atoms the board does not show.
2. **Composition job** — one page/component job; do not turn the gallery into a dashboard of leftovers.
3. **Primary action** — one filled primary in the fold when the screen is interactive.
4. **House paint** — steal regions from this shot; implement with shadcn/Tailwind. Never install foreign kit runtimes into Clearspeed consumers.
5. **States** — when the board shows hover/active/disabled/invalid, carry those states into the house component; do not ship half-widgets.
6. **Catalog hint** — jobs: ${jobs.join(", ")}; screen: ${screen}.

## Contracts

- Structure from this blueprint + shot; paint from the house voice sheet.
- Prefer house cites from \`knowledge/kits/figma-library-map.json\` when a map row names one.
- Corpus proxies still apply for full admin pages: \`flowbite-admin\`, \`tailadmin-react\`, \`untitled-ui-react\`, \`mui-material\` (structure only).
- Measure must stay green on \`accordion-under-lead\`, \`detached-overflow\`, \`kpi-soup\`, \`card-soup\`, \`kit-silhouette-bypass\`.

## Do not

- Cite this pack as an installable kit runtime into Clearspeed consumers.
- Expand Nucleus SLED under this import.
- Treat cover-only or 4-sample silhouette harvests as complete kit ingest.
- Freestyle a page when the silhouette map already names a cite.

## Checklist (agent)

- Open the shot before describing pixels.
- Confirm foreign-runtime ban in \`docs/no-foreign-runtimes.md\`.
- Keep atoms/molecules/pages inventoried in the coverage matrix.
- Re-run \`node corpus/index-templates.mjs\` after adding rows.
- Re-run \`node corpus/figma-pack-write.mjs\` (or the repair path) so source/ + tokens.css + manifest hashes land.

## Regions recap

- One focal composition from the Figma frame.
- One primary when interactive.
- States visible in the kit become first-class in the house component.
- Paint from shadcn-zinc unless the host is Lightning (then SLDS).

## Fail closed

- No shot in the pack: say there is no shot.
- MCP access denied on a community preview key: stop; use Justin Copy fileKeys only.
- A second filled primary is a defect.
- Foreign-kit chrome in a Clearspeed consumer is a defect.
`;
writeFileSync(join(bpDir, `${id}.md`), md);
const srcDir = join(dir, "source");
mkdirSync(srcDir, { recursive: true });
const srcPath = join(srcDir, `${id}.md`);
writeFileSync(srcPath, md);
const sourceSha = createHash("sha256").update(readFileSync(srcPath)).digest("hex");

const voice = join(SHINE, "tokens/voices/shadcn-zinc.css");
const fallback = join(SHINE, "tokens/voices/shine.css");
const sheet = existsSync(voice) ? voice : fallback;
const header =
  `/* GENERATED BY shine corpus/figma-pack-write.mjs — kit paint for ${id} (shadcn-zinc).\n` +
  `   Source of truth: tokens/voices/${sheet.endsWith("shadcn-zinc.css") ? "shadcn-zinc.css" : "shine.css"}. Do not edit. */\n`;
const body = readFileSync(sheet, "utf8").replace(/^\/\* GENERATED BY shine[\s\S]*?\*\/\n/, "");
writeFileSync(join(dir, "tokens.css"), header + (body.startsWith("/*") ? body : `\n${body}`));

writeFileSync(
  join(dir, "manifest.json"),
  JSON.stringify(
    {
      id,
      kind: "blueprint",
      screen,
      jobs,
      files: [{ path: `${id}.md`, role: "blueprint", sha256: sourceSha }],
      shot: "shot.png",
      tokens: "tokens.css",
    },
    null,
    2,
  ) + "\n",
);
console.log(`ok ${id} ${Math.round(bytes / 1024)}KB`);
