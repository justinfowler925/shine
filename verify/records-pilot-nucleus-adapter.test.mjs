#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createNucleusShapedStore } from "../benchmark/records-pilot/adapters/nucleus-shaped.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = join(root, "benchmark/records-pilot/nucleus-api-server.mjs");

function startApi(extraArgs = []) {
  return new Promise((resolveListen, reject) => {
    const child = spawn(process.execPath, [serverPath, "--port", "0", ...extraArgs], {
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
          resolveListen({ child, baseUrl: info.baseUrl, seed: info.seed });
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
  assert.equal(rows[0].revision, 1);

  const filtered = await editor.list({ q: "Gamma" });
  assert.equal(filtered.length, 1);
  assert.match(filtered[0].title, /Gamma/);

  await editor.armSaveFailure();
  await assert.rejects(() => editor.save("r1", { notes: "draft" }, { expectedRevision: 1 }), (err) => {
    assert.equal(err.code, "SAVE_FAILED");
    assert.match(err.message, /save failed/i);
    return true;
  });
  assert.equal((await editor.get("r1")).notes, "");

  const saved = await editor.save("r1", { notes: "after retry" }, { expectedRevision: 1 });
  assert.equal(saved.notes, "after retry");
  assert.equal(saved.revision, 2);

  await assert.rejects(
    () => editor.save("r1", { notes: "stale" }, { expectedRevision: 1 }),
    (err) => {
      assert.equal(err.code, "STALE_WRITE");
      assert.equal(err.status, 409);
      return true;
    },
  );

  await assert.rejects(
    () => editor.save("r1", { title: "", owner: "Alex" }, { expectedRevision: 2 }),
    (err) => {
      assert.equal(err.code, "VALIDATION");
      assert.equal(err.status, 400);
      return true;
    },
  );

  const titled = await editor.save("r1", { title: "Acme renewed", notes: "ok" }, { expectedRevision: 2 });
  assert.equal(titled.title, "Acme renewed");
  assert.equal(titled.revision, 3);

  const viewer = createNucleusShapedStore({ baseUrl, role: "viewer" });
  assert.equal(viewer.canSave(), false);
  await assert.rejects(() => viewer.save("r1", { notes: "nope" }), (err) => {
    assert.equal(err.code, "FORBIDDEN");
    return true;
  });

  console.log("records-pilot-nucleus-adapter.test.mjs: ok");
} finally {
  child.kill("SIGTERM");
}

const empty = await startApi(["--seed", "empty"]);
try {
  const store = createNucleusShapedStore({ baseUrl: empty.baseUrl, role: "editor" });
  assert.equal((await store.list()).length, 0);
  console.log("records-pilot-nucleus-adapter.test.mjs: empty seed ok");
} finally {
  empty.child.kill("SIGTERM");
}
