#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import axe from "axe-core";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const base = new URL(process.argv[2] ?? "https://shine-blond.vercel.app/");
const environment = ["127.0.0.1", "localhost"].includes(base.hostname) ? "local" : "production";
const outFlag = process.argv.indexOf("--out");
const out = resolve(root, outFlag >= 0 ? process.argv[outFlag + 1] : "docs/receipts/shine-live.json");
const screenshotDir = dirname(out);
const expectedAssets = {
  "/img/shine-v3-before-fold.png": "e355bd6f8365b89b7ec67e908c874f03a5a6a916ae1baeb6ded6564e7ddd0a2e",
  "/img/shine-v4-after-fold.png": "36466521c4df2dc24c142828f37d10a34961c936f6badc83951feb5e6e2e8f86",
};
const viewports = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

await mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const response = await page.goto(base.href, { waitUntil: "networkidle" });
    assert.equal(response?.status(), 200, `${viewport.name}: public page did not return 200`);

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    assert.ok(overflow.document <= overflow.viewport + 1, `${viewport.name}: horizontal overflow`);

    const comparison = page.locator("[data-testid=rebuild-comparison]");
    const show = page.locator("[data-testid=show-proof]");
    await show.click();
    await comparison.waitFor({ state: "visible" });
    assert.equal(await show.textContent(), "Rebuild revealed");

    const images = await comparison.locator("img").evaluateAll((nodes) => nodes.map((node) => ({
      src: new URL(node.src).pathname,
      complete: node.complete,
      width: node.naturalWidth,
      height: node.naturalHeight,
    })));
    assert.deepEqual(images, [
      { src: "/img/shine-v3-before-fold.png", complete: true, width: 1280, height: 800 },
      { src: "/img/shine-v4-after-fold.png", complete: true, width: 1280, height: 800 },
    ]);

    const theme = page.locator("[data-theme-toggle]");
    const beforeTheme = await page.locator("html").getAttribute("data-theme");
    await theme.click();
    const afterTheme = await page.locator("html").getAttribute("data-theme");
    assert.notEqual(afterTheme, beforeTheme, `${viewport.name}: theme did not change`);

    await page.evaluate(axe.source);
    const accessibility = await page.evaluate(async () => await globalThis.axe.run(document));
    assert.equal(
      accessibility.violations.length,
      0,
      `${viewport.name}: axe violations found: ${JSON.stringify(accessibility.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target),
      })))}`,
    );

    const screenshot = resolve(screenshotDir, `shine-live-${viewport.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    const screenshotSha256 = sha256(await readFile(screenshot));

    const skillHref = await page.locator('a[href="/skill"]').first().getAttribute("href");
    assert.equal(skillHref, "/skill");
    const skillUrl = new URL(skillHref, base);
    if (["127.0.0.1", "localhost"].includes(skillUrl.hostname)) skillUrl.pathname = "/skill.html";
    const skillResponse = await page.goto(skillUrl.href, { waitUntil: "networkidle" });
    assert.equal(skillResponse?.status(), 200, `${viewport.name}: /skill did not return 200`);
    assert.ok((await page.locator("body").innerText()).includes("Shine"), `${viewport.name}: /skill body missing Shine`);

    results.push({
      viewport,
      pageStatus: 200,
      comparisonRevealed: true,
      images,
      theme: { before: beforeTheme, after: afterTheme },
      axeViolations: accessibility.violations.length,
      horizontalOverflowPx: Math.max(0, overflow.document - overflow.viewport),
      skillStatus: 200,
      screenshot: screenshot.startsWith(`${root}/`) ? screenshot.slice(root.length + 1) : screenshot,
      screenshotSha256,
    });
    await context.close();
  }

  for (const [path, expected] of Object.entries(expectedAssets)) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200, `${path}: live asset did not return 200`);
    assert.equal(sha256(Buffer.from(await response.arrayBuffer())), expected, `${path}: live bytes drifted`);
  }

  const receipt = {
    version: 1,
    generatedAt: new Date().toISOString(),
    environment,
    url: base.href,
    repositorySha: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
    expectedAssets,
    results,
    status: "PASS",
  };
  await writeFile(out, `${JSON.stringify(receipt, null, 2)}\n`);
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await browser.close();
}
