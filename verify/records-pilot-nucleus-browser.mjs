#!/usr/bin/env node
/**
 * S6 deepen — Records pilot → Nucleus-shaped consumer E2E.
 * Covers list/edit/fail/retry plus filter, empty, validation, stale-write, list refresh.
 * Boots the local Nucleus-shaped API + static pilot UI; no SSO bypass.
 */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium } from "playwright";
import { createNucleusShapedStore } from "../benchmark/records-pilot/adapters/nucleus-shaped.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pilot = join(root, "benchmark/records-pilot");

function contentType(path) {
  if (path.endsWith(".html")) return "text/html; charset=utf-8";
  if (path.endsWith(".mjs") || path.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "text/plain; charset=utf-8";
}

function startApi(extraArgs = []) {
  return new Promise((resolveListen, reject) => {
    const child = spawn(process.execPath, [join(pilot, "nucleus-api-server.mjs"), "--port", "0", ...extraArgs], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let buf = "";
    const onData = (chunk) => {
      buf += chunk;
      const line = buf.trim().split("\n").filter(Boolean).pop();
      if (!line) return;
      try {
        const info = JSON.parse(line);
        if (info.baseUrl) {
          child.stdout.off("data", onData);
          resolveListen({ child, baseUrl: info.baseUrl });
        }
      } catch {
        /* keep buffering */
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", (c) => process.stderr.write(c));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code) reject(new Error(`nucleus-api-server exited ${code}`));
    });
    setTimeout(() => reject(new Error("nucleus-api-server start timeout")), 10_000);
  });
}

const staticServer = createServer((req, res) => {
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
    res.writeHead(200, { "content-type": contentType(rel) });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("missing");
  }
});

const { child: apiChild, baseUrl: apiBase } = await startApi();
await new Promise((r) => staticServer.listen(0, "127.0.0.1", r));
const uiBase = `http://127.0.0.1:${staticServer.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.setDefaultTimeout(10_000);
let checked = 0;
const check = async (name, fn) => {
  await fn();
  checked += 1;
  console.log(`PASS ${name}`);
};

try {
  const url = `${uiBase}/index.html?adapter=nucleus-shaped&api=${encodeURIComponent(apiBase)}&delayMs=120`;
  await page.goto(url);
  await page.getByRole("heading", { name: "Records inspect → edit → persist" }).waitFor();
  await page.getByText(/adapter:\s*nucleus-shaped/i).waitFor();

  await check("shows loading then lists three records over HTTP", async () => {
    await page.getByText(/Loading records/i).waitFor();
    await page.locator("#rows tr").first().waitFor();
    assert.equal(await page.locator("#rows tr").count(), 3);
    assert.equal(await page.locator("#list-loading").isVisible(), false);
  });

  await page.locator("#rows tr").first().click();
  await check("opens editor from nucleus-shaped get", async () => {
    await page.locator("#editor").waitFor({ state: "visible" });
    assert.match(await page.locator("#title").inputValue(), /Acme/);
  });

  await page.locator("#notes").fill("kept after nucleus-shaped failure");
  await page.getByRole("button", { name: "Arm next save failure" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await check("failed save retains draft", async () => {
    await page.getByText(/save failed/i).waitFor();
    assert.equal(await page.locator("#notes").inputValue(), "kept after nucleus-shaped failure");
    assert.match(await page.locator("#status").innerText(), /Draft retained/i);
    assert.equal(await page.locator("#draft-flag").evaluate((el) => el.hidden), false);
  });

  await page.getByRole("button", { name: "Save", exact: true }).click();
  await check("retry persists through PATCH", async () => {
    await page.getByText("Saved.", { exact: true }).waitFor();
    assert.equal(await page.locator("#draft-flag").isVisible(), false);
  });

  await page.locator("#title").fill("Acme renewed via HTTP");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await check("list refreshes with edited title after save", async () => {
    await page.getByText("Saved.", { exact: true }).waitFor();
    await page.getByRole("cell", { name: "Acme renewed via HTTP" }).waitFor();
  });

  const api = createNucleusShapedStore({ baseUrl: apiBase, role: "editor" });
  await check("fresh GET confirms persisted notes after UI save", async () => {
    const row = await api.get("r1");
    assert.equal(row.notes, "kept after nucleus-shaped failure");
    assert.equal(row.title, "Acme renewed via HTTP");
    assert.ok(row.revision >= 3);
  });

  // Whitespace bypasses HTML5 required so the PATCH reaches the harness VALIDATION path.
  await page.locator("#title").fill("   ");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await check("validation error surfaces without clearing draft", async () => {
    await page.locator("#title-error").waitFor({ state: "visible" });
    assert.match(await page.locator("#title-error").innerText(), /title is required/i);
    assert.match(await page.locator("#status").innerText(), /title and owner are required/i);
  });
  await page.locator("#title").fill("Acme renewed via HTTP");

  // Stale write: bump revision out-of-band, then save from the UI's old revision.
  await api.save("r1", { notes: "server won" }, { expectedRevision: (await api.get("r1")).revision });
  await page.locator("#notes").fill("client draft after conflict");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await check("stale-write retains draft and offers reload", async () => {
    await page.getByText(/stale write/i).waitFor();
    assert.equal(await page.locator("#notes").inputValue(), "client draft after conflict");
    assert.equal(await page.getByRole("button", { name: "Reload record" }).isVisible(), true);
  });
  await page.getByRole("button", { name: "Reload record" }).click();
  await page.getByText(/Draft reapplied/i).waitFor();
  assert.equal(await page.locator("#notes").inputValue(), "client draft after conflict");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await check("reload then retry persists after stale-write", async () => {
    await page.getByText("Saved.", { exact: true }).waitFor();
    assert.equal((await api.get("r1")).notes, "client draft after conflict");
  });

  await page.getByLabel("Filter").fill("absent-term");
  await check("filtered empty recovers over HTTP", async () => {
    await page.getByText(/No matching records/i).waitFor();
    await page.getByRole("button", { name: "Clear filter" }).click();
    await page.locator("#rows tr").first().waitFor();
    assert.equal(await page.locator("#rows tr").count(), 3);
  });

  await page.goto(
    `${uiBase}/index.html?adapter=nucleus-shaped&api=${encodeURIComponent(apiBase)}&role=viewer`,
  );
  await page.locator("#rows tr").first().click();
  await check("viewer forbidden over HTTP", async () => {
    await page.getByText(/role is viewer/i).waitFor();
    assert.equal(await page.getByRole("button", { name: "Save", exact: true }).isDisabled(), true);
  });

  console.log(`records-pilot nucleus-shaped browser PASS: ${checked} checks · api ${apiBase}`);
} finally {
  await browser.close();
  await new Promise((r) => staticServer.close(r));
  apiChild.kill("SIGTERM");
}

// Empty seed — separate harness instance proves empty state without SSO.
const empty = await startApi(["--seed", "empty"]);
const emptyStatic = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1");
  let rel = url.pathname === "/" ? "/index.html" : url.pathname;
  rel = rel.replace(/^\//, "");
  try {
    const body = readFileSync(join(pilot, rel));
    res.writeHead(200, { "content-type": contentType(rel) });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("missing");
  }
});
await new Promise((r) => emptyStatic.listen(0, "127.0.0.1", r));
const emptyUi = `http://127.0.0.1:${emptyStatic.address().port}`;
const emptyBrowser = await chromium.launch();
const emptyPage = await emptyBrowser.newPage({ viewport: { width: 1280, height: 800 } });
try {
  await emptyPage.goto(
    `${emptyUi}/index.html?adapter=nucleus-shaped&api=${encodeURIComponent(empty.baseUrl)}`,
  );
  await emptyPage.getByText(/No records yet/i).waitFor();
  console.log("PASS empty seed shows no-records state");
  checked += 1;
  console.log(`records-pilot nucleus-shaped browser PASS (with empty): ${checked} checks`);
} finally {
  await emptyBrowser.close();
  await new Promise((r) => emptyStatic.close(r));
  empty.child.kill("SIGTERM");
}
