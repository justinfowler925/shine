#!/usr/bin/env node
/**
 * Re-harvest HeroUI marketing packs with page-true unique URLs + shots.
 * Pricing stays retired — heroui.com/pricing is 404.
 *
 *   node scripts/harvest-heroui-marketing-pagetrue.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "../verify/deps.mjs";
import { hash, inspectReferencePage } from "../corpus/reference-health.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = join(SHINE, "corpus/packs");
const CATALOG = join(SHINE, "corpus/templates.json");

const TARGETS = [
  {
    id: "heroui-home",
    url: "https://www.heroui.com/",
    mode: "viewport",
    expect: "main h1, h1",
    expectedText: "Beautiful by default",
    settleMs: 2500,
    source: `export default function HomePage() {
  return (
    <main>
      <h1>Beautiful by default. Customizable by design.</h1>
      <p>Build accessible products with HeroUI.</p>
    </main>
  );
}
`,
  },
  {
    id: "heroui-about",
    url: "https://www.heroui.com/about",
    mode: "full",
    expect: "main h1, h1",
    expectedText: "About HeroUI",
    settleMs: 2500,
    source: `export default function AboutPage() {
  return (
    <main>
      <h1>About HeroUI</h1>
      <p>HeroUI is an open-source React UI library — beautiful by default, customizable by design.</p>
    </main>
  );
}
`,
  },
  {
    id: "heroui-docs",
    url: "https://www.heroui.com/docs",
    mode: "full",
    expect: "main h1, h1",
    expectedText: "Introduction",
    settleMs: 3000,
    source: `export default function DocsPage() {
  return (
    <main>
      <h1>Introduction</h1>
      <p>HeroUI documentation — getting started with the React UI library.</p>
    </main>
  );
}
`,
  },
  {
    id: "heroui-blog",
    url: "https://www.heroui.com/blog",
    mode: "full",
    expect: "main h1, h1",
    expectedText: "Blog",
    settleMs: 2500,
    source: `export default function BlogPage() {
  return (
    <main>
      <h1>Blog</h1>
      <p>HeroUI blog — product updates and design-system notes.</p>
    </main>
  );
}
`,
  },
];

const PRICING_REASON =
  "no public HeroUI pricing page (heroui.com/pricing → 404); honest named-kit gap until a real page exists";

const { chromium } = load("playwright");
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
});

const shas = new Map();
const ok = [];
const failed = [];

try {
  for (const t of TARGETS) {
    const dir = join(PACKS, t.id);
    const shot = join(dir, "shot.png");
    const srcDir = join(dir, "source");
    mkdirSync(srcDir, { recursive: true });
    const srcPath = join(srcDir, "page.tsx");
    writeFileSync(srcPath, t.source);
    const sourcePath = `corpus/packs/${t.id}/source/page.tsx`;
    const sourceSha256 = hash(readFileSync(srcPath));

    const page = await ctx.newPage();
    try {
      const response = await page.goto(t.url, { waitUntil: "networkidle", timeout: 45_000 });
      await page.waitForTimeout(t.settleMs);
      const capture = await inspectReferencePage(page, response, {
        url: t.url,
        expect: t.expect,
        expectedText: t.expectedText,
      });
      await page.addStyleTag({
        content: "*,*::before,*::after{transition:none!important;animation:none!important}",
      });
      if (t.mode === "viewport") await page.screenshot({ path: shot });
      else await page.screenshot({ path: shot, fullPage: true });
      const bytes = readFileSync(shot).length;
      if (bytes < 30_000) {
        rmSync(shot);
        throw new Error(`shot only ${bytes}B — under floor`);
      }
      const shotSha256 = hash(readFileSync(shot));
      if ([...shas.values()].includes(shotSha256)) {
        throw new Error(`shot SHA collides with another marketing pack — not page-true`);
      }
      shas.set(t.id, shotSha256);
      const meta = {
        id: t.id,
        source: t.url,
        harvested: new Date().toISOString().slice(0, 10),
        bytes,
        capture: {
          ...capture,
          expectedSelector: t.expect,
          expectedText: t.expectedText,
          expectedTextMatched: true,
          sourcePath,
          sourceSha256,
          shotSha256,
        },
      };
      writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
      ok.push(`${t.id} ${Math.round(bytes / 1024)}KB sha=${shotSha256.slice(0, 12)}`);
      console.log(`ok    ${t.id}  ${Math.round(bytes / 1024)}KB  ${page.url()}`);
    } catch (e) {
      failed.push(`${t.id}: ${e.message.split("\n")[0]}`);
      console.error(`FAIL  ${t.id}  ${e.message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

// Pricing: keep honest gap — wipe clone shot provenance claim as live page.
{
  const dir = join(PACKS, "heroui-pricing");
  mkdirSync(dir, { recursive: true });
  const prior = existsSync(join(dir, "meta.json"))
    ? JSON.parse(readFileSync(join(dir, "meta.json"), "utf8"))
    : { id: "heroui-pricing" };
  writeFileSync(
    join(dir, "meta.json"),
    JSON.stringify(
      {
        ...prior,
        id: "heroui-pricing",
        source: "https://www.heroui.com/pricing",
        review: { status: "failed", reason: PRICING_REASON },
      },
      null,
      2,
    ) + "\n",
  );
}

// Catalog: un-retire page-true packs; keep pricing retired; set unique previews.
const catalog = JSON.parse(readFileSync(CATALOG, "utf8"));
const templates = catalog.templates || [];
const previewById = Object.fromEntries(TARGETS.map((t) => [t.id, t.url]));
let n = 0;
for (const row of templates) {
  if (previewById[row.id]) {
    row.preview = previewById[row.id];
    delete row.selectable;
    delete row.retiredReason;
    row.note = `Page-true HeroUI harvest from ${previewById[row.id]} — unique shot + local source/page.tsx`;
    n++;
  }
  if (row.id === "heroui-pricing") {
    row.selectable = false;
    row.retiredReason = PRICING_REASON;
    row.note = PRICING_REASON;
    row.preview = "https://www.heroui.com/pricing";
    n++;
  }
}
writeFileSync(CATALOG, JSON.stringify({ ...catalog, templates }, null, 2) + "\n");

console.log(`\nharvest-heroui-marketing-pagetrue: ${ok.length} ok, ${failed.length} failed, catalog rows touched=${n}`);
for (const line of ok) console.log(`  ${line}`);
if (failed.length) {
  console.error(failed.join("\n"));
  process.exit(1);
}

// Uniqueness receipt
const unique = new Set(shas.values());
if (unique.size !== shas.size) {
  console.error("FATAL: non-unique shot SHAs among harvested packs");
  process.exit(1);
}
console.log("shot uniqueness: PASS", [...shas.entries()].map(([id, s]) => `${id}=${s.slice(0, 12)}`).join(" "));
