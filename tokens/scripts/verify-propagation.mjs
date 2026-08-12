// Done-means #3: one token change propagates to all four emit targets,
// verified by RENDERING each target and reading computed values — never grep.
//
// Method: build the personal lane from the committed source, probe all four
// targets; then rebuild from a mutated copy (primary -> sentinel green),
// re-probe, and assert every target moved to the sentinel.
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { load } from '../../verify/deps.mjs';

const { chromium } = load('playwright');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SENTINEL_HEX = '#00c853';
const SENTINEL_RGB = 'rgb(0, 200, 83)';
const ORIGINAL_RGB = 'rgb(251, 146, 60)'; // ember.400 = #fb923c

function build(srcDir, outDir) {
  execSync(`npx terrazzo build --config terrazzo.personal.mjs`, {
    cwd: srcDir,
    stdio: 'pipe',
    env: { ...process.env, SHINE_OUT_DIR: outDir },
  });
}

function compileTailwind(distDir, workDir) {
  mkdirSync(workDir, { recursive: true });
  const input = join(workDir, 'input.css');
  const probe = join(workDir, 'probe.html');
  writeFileSync(
    probe,
    `<div class="bg-primary" id="p">x</div><div class="bg-red-500" id="wiped">x</div>`,
  );
  writeFileSync(
    input,
    `@import '${join(ROOT, 'node_modules', 'tailwindcss', 'index.css')}';\n@import '${join(distDir, 'theme.css')}';\n`,
  );
  execSync(
    `npx @tailwindcss/cli -i ${input} -o ${join(workDir, 'out.css')} --content ${probe}`,
    { cwd: ROOT, stdio: 'pipe' },
  );
  return { css: join(workDir, 'out.css'), probe };
}

async function probeTargets(browser, distDir, workDir) {
  mkdirSync(workDir, { recursive: true });
  const page = await browser.newPage();
  const results = {};
  // setContent pages live on about:blank, which cannot load file:// subresources
  // — probes must be real file:// pages (harness artifact found 2026-08-05).
  const probePage = async (name, html) => {
    const file = join(workDir, `${name}.html`);
    writeFileSync(file, html);
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  };

  // 1. CSS custom properties target
  await probePage(
    'css',
    `<link rel="stylesheet" href="${pathToFileURL(join(distDir, 'tokens.css'))}">
     <div id="t" style="background: var(--shine-color-primary)">x</div>`,
  );
  results.css = await page.$eval('#t', (el) => getComputedStyle(el).backgroundColor);

  // 2. Tailwind target — real utility compilation, then computed style
  const tw = compileTailwind(distDir, workDir);
  await probePage(
    'tailwind',
    `<link rel="stylesheet" href="${pathToFileURL(tw.css)}">
     <div class="bg-primary" id="p">x</div><div class="bg-red-500" id="wiped">x</div>`,
  );
  results.tailwind = await page.$eval('#p', (el) => getComputedStyle(el).backgroundColor);
  results.tailwindWiped = await page.$eval('#wiped', (el) => getComputedStyle(el).backgroundColor);

  // 3. Inline artifact target — pasted <style>, no imports
  await probePage(
    'artifact',
    `<style>${readFileSync(join(distDir, 'artifact.css'), 'utf8')}</style>
     <div id="t" style="background: var(--shine-color-primary)">x</div>`,
  );
  results.artifact = await page.$eval('#t', (el) => getComputedStyle(el).backgroundColor);

  // 4. Python target — import the module, read the constant
  results.python = execSync(
    `python3 -c "import sys; sys.path.insert(0, '${distDir}'); import tokens; print(tokens.COLOR_PRIMARY)"`,
    { encoding: 'utf8' },
  ).trim();

  // 5. Email target — the emitted starter itself, rendered
  await page.goto(pathToFileURL(join(distDir, 'email.html')).href, { waitUntil: 'load' });
  results.email = await page.$eval('#cta', (el) => getComputedStyle(el).backgroundColor);

  // 6. Email inliner map — literal JSON
  results.emailJson = JSON.parse(readFileSync(join(distDir, 'email.json'), 'utf8')).tokens[
    'color.primary'
  ];

  // 7. Google Docs target — evaluate the script body, read the constant
  results.gdocs = new Function(
    readFileSync(join(distDir, 'docs.gs'), 'utf8') + '; return SHINE.color.primary;',
  )();

  await page.close();
  return results;
}

const pyToRgb = (hex) =>
  `rgb(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)})`;

const work = mkdtempSync(join(tmpdir(), 'shine-verify-'));
const browser = await chromium.launch();
let failed = false;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${actual} (expected ${expected})`);
};

try {
  // Baseline: committed source -> all four targets show ember.400
  const baseOut = join(work, 'base');
  build(ROOT, baseOut);
  const base = await probeTargets(browser, baseOut, join(work, 'w1'));
  console.log('— baseline (primary = ember.400) —');
  check('css        ', base.css, ORIGINAL_RGB);
  check('tailwind   ', base.tailwind, ORIGINAL_RGB);
  check('artifact   ', base.artifact, ORIGINAL_RGB);
  check('python     ', pyToRgb(base.python), ORIGINAL_RGB);
  check('email      ', base.email, ORIGINAL_RGB);
  check('email json ', pyToRgb(base.emailJson), ORIGINAL_RGB);
  check('gdocs      ', pyToRgb(base.gdocs), ORIGINAL_RGB);
  check('wipe intact', base.tailwindWiped, 'rgba(0, 0, 0, 0)');

  // Mutation: copy the package, point ember.400 at the sentinel, rebuild
  const mutRoot = join(work, 'mutated');
  cpSync(ROOT, mutRoot, {
    recursive: true,
    filter: (src) => !src.includes('node_modules') && !src.includes('/dist'),
  });
  execSync(`ln -s ${join(ROOT, 'node_modules')} ${join(mutRoot, 'node_modules')}`);
  const srcPath = join(mutRoot, 'src', 'personal.tokens.json');
  const tokens = JSON.parse(readFileSync(srcPath, 'utf8'));
  tokens.color.ember['400'].$value = {
    colorSpace: 'srgb',
    components: [0, 200 / 255, 83 / 255],
    alpha: 1,
    hex: SENTINEL_HEX,
  };
  writeFileSync(srcPath, JSON.stringify(tokens, null, 2));
  const mutOut = join(work, 'mut');
  build(mutRoot, mutOut);
  const mut = await probeTargets(browser, mutOut, join(work, 'w2'));
  console.log('— mutated (ember.400 -> sentinel) —');
  check('css        ', mut.css, SENTINEL_RGB);
  check('tailwind   ', mut.tailwind, SENTINEL_RGB);
  check('artifact   ', mut.artifact, SENTINEL_RGB);
  check('python     ', pyToRgb(mut.python), SENTINEL_RGB);
  check('email      ', mut.email, SENTINEL_RGB);
  check('email json ', pyToRgb(mut.emailJson), SENTINEL_RGB);
  check('gdocs      ', pyToRgb(mut.gdocs), SENTINEL_RGB);
} finally {
  await browser.close();
  rmSync(work, { recursive: true, force: true });
}

if (failed) {
  console.error('\nPropagation verification FAILED.');
  process.exit(1);
}
console.log('\nOne token change propagated to all seven targets (computed values).');
