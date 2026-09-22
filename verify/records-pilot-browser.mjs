#!/usr/bin/env node
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pilot = join(root, "benchmark/records-pilot");

function contentType(path) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".mjs") || path.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "text/plain; charset=utf-8";
}

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  let rel = url.pathname === "/" ? "/index.html" : url.pathname;
  rel = rel.replace(/^\//, "");
  if (rel.includes("..")) {
    res.writeHead(400);
    res.end("bad path");
    return;
  }
  try {
    const body = readFileSync(join(pilot, rel));
    res.writeHead(200, {"content-type": contentType(rel)});
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("missing");
  }
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1280, height: 800}});
page.setDefaultTimeout(5000);
let checked = 0;
const check = async (name, fn) => {
  await fn();
  checked += 1;
  console.log(`PASS ${name}`);
};

try {
  await page.goto(`${base}/index.html`);
  await page.getByRole("heading", {name: "Records inspect → edit → persist"}).waitFor();
  await check("lists three records", async () => {
    assert.equal(await page.locator("#rows tr").count(), 3);
  });
  await page.locator("#rows tr").first().click();
  await check("opens editor", async () => {
    assert.equal(await page.locator("#editor").isVisible(), true);
    assert.match(await page.locator("#title").inputValue(), /Acme/);
  });
  await page.locator("#notes").fill("kept after failure");
  await page.getByRole("button", {name: "Arm next save failure"}).click();
  await page.getByRole("button", {name: "Save", exact: true}).click();
  await check("failed save retains draft", async () => {
    await page.getByText(/save failed/i).waitFor();
    assert.equal(await page.locator("#notes").inputValue(), "kept after failure");
    assert.match(await page.locator("#status").innerText(), /Draft retained/i);
    assert.equal(await page.locator("#draft-flag").evaluate((el) => el.hidden), false);
  });
  await page.getByRole("button", {name: "Save", exact: true}).click();
  await check("retry persists", async () => {
    await page.getByText("Saved.", {exact: true}).waitFor();
    assert.equal(await page.locator("#draft-flag").isVisible(), false);
  });

  await page.goto(`${base}/index.html?role=viewer`);
  await page.locator("#rows tr").first().click();
  await check("viewer explains forbidden save", async () => {
    await page.getByText(/role is viewer/i).waitFor();
    assert.equal(await page.getByRole("button", {name: "Save", exact: true}).isDisabled(), true);
  });

  console.log(`records-pilot browser PASS: ${checked} checks`);
} finally {
  await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
