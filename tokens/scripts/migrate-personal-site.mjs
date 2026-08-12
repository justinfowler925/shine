// One-shot migration: a personal site's per-page :root blocks -> one import
// of the generated token sheet. Value-preserving by construction; proven by
// scripts/sitediff.mjs (pixel compare of every page, before vs after).
//
//   node scripts/migrate-personal-site.mjs /path/to/a personal site-worktree
import { readFileSync, writeFileSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = process.argv[2];
if (!site) throw new Error('usage: migrate-personal-site.mjs <site-dir>');
const TOKENS = fileURLToPath(new URL('../dist/personal/personal-site.css', import.meta.url));
const LINK = '<link rel="stylesheet" href="/assets/tokens.css" />';

copyFileSync(TOKENS, join(site, 'assets', 'tokens.css'));
console.log('assets/tokens.css <- dist/personal/personal-site.css');

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlFiles.push(p);
  }
})(site);

let migrated = 0;
for (const file of htmlFiles) {
  const src = readFileSync(file, 'utf8');
  if (!/:root\s*\{/.test(src)) continue;
  const stripped = src.replace(/[ \t]*:root\s*\{[^{}]*\}\n?/, '');
  if (stripped === src) throw new Error(`${file}: :root present but not matched`);
  const linked = stripped.replace(/<style>/, `${LINK}\n<style>`);
  if (linked === stripped) throw new Error(`${file}: no <style> tag to anchor the link`);
  writeFileSync(file, linked);
  migrated++;
  console.log(`migrated ${file.slice(site.length + 1)}`);
}
console.log(`${migrated} page(s) migrated.`);
