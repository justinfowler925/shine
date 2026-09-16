#!/usr/bin/env node
// Text inside a closed <details> is not readable, and its glyph box samples whatever
// is painted over it. On a live product page three list items inside a collapsed
// "setup" disclosure reported 1.10:1 for #111 on #fff and failed measure. The sweep
// must skip collapsed content and keep measuring the summary that reveals it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "shine-closed-details-"));
try {
  // The collapsed body has deliberately unreadable text: if the sweep measured it,
  // contrast would fail. The summary and heading are legible and must be measured.
  const page = join(dir, "page.html");
  writeFileSync(page, `<!doctype html><html lang="en" data-cite="shadcn-settings" data-shine-voice="kit-faithful" data-dna-family="shadcn-zinc"><meta charset="utf-8"><title>closed details</title>
<style>html{color-scheme:light}body{font:16px system-ui;margin:0;padding:32px;background:#fff;color:#111}details summary{color:#111}details p{color:#fefefe}</style>
<main><h1>Package</h1><p>Install the approved package.</p>
<details><summary>Setup and first task</summary><p>unreadable collapsed copy</p><p>more unreadable collapsed copy</p></details>
<details open><summary>Always visible</summary><p style="color:#111">legible open copy</p></details>
</main></html>`);
  const r = spawnSync(process.execPath, [join(SHINE, "verify/measure.mjs"), page, "--shot", join(dir, "shot.png")], { encoding: "utf8", cwd: SHINE });
  const out = `${r.stdout}\n${r.stderr}`;
  const contrast = /contrast: (\d+) text elements measured, worst ([\d.]+):1/.exec(out);
  assert.ok(contrast, `measure must report contrast:\n${out.slice(-800)}`);
  assert.ok(Number(contrast[2]) >= 4.5, `collapsed copy must not be measured (worst ${contrast[2]}:1)`);
  assert.doesNotMatch(out, /unreadable collapsed copy/, "collapsed text must not appear in findings");
  // h1, the intro paragraph and the open disclosure's paragraph are measured; the two
  // collapsed paragraphs are not. (summary is not in the sweep's element list.)
  assert.equal(Number(contrast[1]), 3, `open content is still measured (got ${contrast[1]} elements)`);
  console.log(`measure closed-details PASS: ${contrast[1]} elements, worst ${contrast[2]}:1, collapsed disclosure content skipped`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
