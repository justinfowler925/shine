#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createNucleusShapedStore } from "../benchmark/records-pilot/adapters/nucleus-shaped.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = join(root, "benchmark/records-pilot/nucleus-api-server.mjs");

function startApi() {
  return new Promise((resolveListen, reject) => {
    const child = spawn(process.execPath, [serverPath, "--port", "0"], {
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
        /* keep */
      }
    };
    child.stdout.on("data", onData);
    child.on("error", reject);
    setTimeout(() => reject(new Error("api start timeout")), 10_000);
  });
}

const { child, baseUrl } = await startApi();
try {
  const editor = createNucleusShapedStore({ baseUrl, role: "editor" });
  assert.equal(editor.adapterId, "nucleus-shaped");
  const rows = await editor.list();
  assert.equal(rows.length, 3);

  await editor.armSaveFailure();
  await assert.rejects(() => editor.save("r1", { notes: "draft" }), /save failed/i);
  assert.equal((await editor.get("r1")).notes, "");

  const saved = await editor.save("r1", { notes: "after retry" });
  assert.equal(saved.notes, "after retry");

  const viewer = createNucleusShapedStore({ baseUrl, role: "viewer" });
  assert.equal(viewer.canSave(), false);
  await assert.rejects(() => viewer.save("r1", { notes: "nope" }), /viewer/i);

  console.log("records-pilot-nucleus-adapter.test.mjs: ok");
} finally {
  child.kill("SIGTERM");
}
