// Screenshot-diff two checkouts of a personal site, page by page.
// Serves both over local HTTP (file:// breaks absolute /assets/ paths),
// freezes animations identically in both runs, waits for fonts, and
// compares raw pixels with sharp. Zero differing pixels = value-preserving.
//
//   node scripts/sitediff.mjs <baseline-dir> <migrated-dir> [out-dir]
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { load } from '../../verify/deps.mjs';

const { chromium } = load('playwright');
// `sharp` must resolve from shine's own node_modules; an old sibling path has not
// had it installed for some time — so this script threw on import and nothing
// noticed, because nothing runs it on a schedule. It is declared in shine's own
// package.json now; `npm install` at the repo root is what makes it real.
const sharp = load('sharp');

const [baseDir, newDir, outDir = '/tmp/shine-sitediff'] = process.argv.slice(2);
if (!baseDir || !newDir) throw new Error('usage: sitediff.mjs <baseline-dir> <migrated-dir> [out-dir]');
mkdirSync(outDir, { recursive: true });

// Pages to compare. Defaults to every .html under the baseline dir, so this
// script carries no site's page list; override with SITEDIFF_PAGES (comma-
// separated, relative paths) when a subset is wanted.
const PAGES = process.env.SITEDIFF_PAGES
  ? process.env.SITEDIFF_PAGES.split(',').map((p) => p.trim()).filter(Boolean)
  : (await readdir(baseDir, { recursive: true }))
      .filter((p) => p.endsWith('.html'))
      .sort();

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' };
function serve(root, port) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = join(root, path === '/' ? 'index.html' : path.slice(1));
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404).end('nope');
      }
    });
    server.listen(port, () => resolve(server));
  });
}

async function shoot(page, origin, path, out) {
  await page.goto(`${origin}/${path}`, { waitUntil: 'networkidle' });
  await page.addStyleTag({
    content: '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, fullPage: true });
}

// renders its own location.href, so different ports register as a page diff
// (harness artifact found 2026-08-05).
const PORT = 48101;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const baseServer = await serve(baseDir, PORT);
for (const p of PAGES) {
  await shoot(page, `http://localhost:${PORT}`, p, join(outDir, `${p.replace(/[/]/g, '__')}.base.png`));
}
await new Promise((r) => baseServer.close(r));
const newServer = await serve(newDir, PORT);
for (const p of PAGES) {
  await shoot(page, `http://localhost:${PORT}`, p, join(outDir, `${p.replace(/[/]/g, '__')}.new.png`));
}
await new Promise((r) => newServer.close(r));
await browser.close();

// A wrong token shifts channels by tens; anti-aliasing re-raster jitters by
// exactly 1/255 (measured: baseline-vs-baseline shows the same jitter).
// Gate: zero differing pixels, or all deltas <= 1 (reported as raster noise).
let failed = false;
for (const p of PAGES) {
  const slug = p.replace(/[/]/g, '__');
  const [imgA, imgB] = await Promise.all(
    ['base', 'new'].map((s) => sharp(join(outDir, `${slug}.${s}.png`)).raw().toBuffer({ resolveWithObject: true })),
  );
  if (imgA.info.width !== imgB.info.width || imgA.info.height !== imgB.info.height) {
    console.log(`FAIL ${p}: size ${imgA.info.width}x${imgA.info.height} vs ${imgB.info.width}x${imgB.info.height}`);
    failed = true;
    continue;
  }
  let diff = 0;
  let maxDelta = 0;
  const ch = imgA.info.channels;
  for (let i = 0; i < imgA.data.length; i += ch) {
    for (let c = 0; c < ch; c++) {
      const d = Math.abs(imgA.data[i + c] - imgB.data[i + c]);
      if (d > maxDelta) maxDelta = d;
      if (d > 0) { diff++; break; }
    }
  }
  const total = imgA.info.width * imgA.info.height;
  const ok = diff === 0 || maxDelta <= 1;
  if (!ok) failed = true;
  const note = diff === 0 ? '' : ` (max channel delta ${maxDelta}${ok ? ' — raster noise' : ''})`;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${p}: ${diff}/${total} differing pixels${note}`);
}
if (failed) {
  console.error(`\nScreenshot diff FAILED — inspect ${outDir}`);
  process.exit(1);
}
console.log('\nAll pages pixel-identical.');
