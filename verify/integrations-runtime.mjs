#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { evaluateDataGrids } from "./contracts/table.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const fixture = join(root, "fixtures", "integrations");
const port = 4179;
const server = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(port)], { cwd: fixture, stdio: ["ignore", "pipe", "pipe"] });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
try {
  let ready = false;
  for (let i = 0; i < 40; i += 1) {
    try { const response = await fetch(`http://127.0.0.1:${port}`); if (response.ok) { ready = true; break; } } catch {}
    await sleep(100);
  }
  if (!ready) throw new Error("Vite production preview did not become ready");
  const browser = await chromium.launch();
  try {
    for (const kit of ["tanstack", "native"]) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${port}/?kit=${kit}`, { waitUntil: "networkidle" });
      const before = await page.locator("main").innerText();
      if (!before.includes("Ada") || !before.includes("Grace")) throw new Error(`${kit}: real rows did not render`);
      await page.getByRole("searchbox").fill("Grace");
      await page.waitForFunction(() => !document.querySelector("main")?.innerText.includes("Ada"));
      await page.getByRole("button", { name: "Clear" }).click();
      await page.waitForFunction(() => document.querySelector("main")?.innerText.includes("Ada"));
      if (kit === "tanstack" || kit === "native") {
        const header = page.locator("thead button").first();
        const beforeSort = await page.locator("thead th").first().getAttribute("aria-sort");
        await header.click();
        const afterSort = await page.locator("thead th").first().getAttribute("aria-sort");
        if (afterSort === beforeSort) throw new Error(`${kit}: real sortable header was inert`);
      }
      const contract = await page.evaluate(evaluateDataGrids);
      const failures = contract.flatMap((grid) => Object.entries(grid).filter(([key, value]) => !["selector", "area"].includes(key) && !value).map(([key]) => key));
      if (!contract.length || failures.length) throw new Error(`${kit}: DataGrid contract failed (${failures.join(", ") || "zero grids"}) ${JSON.stringify(contract)}`);
      if (errors.length) throw new Error(`${kit}: browser errors: ${errors.join(" | ")}`);
      console.log(`integration runtime PASS: ${kit} · grids=${contract.length} · filter=Grace→Clear · contract=12/12`);
      await page.close();
    }
  } finally { await browser.close(); }
} finally {
  server.kill("SIGTERM");
}
