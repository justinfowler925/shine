#!/usr/bin/env node
/**
 * Doctor bite — S6 records → Nucleus-shaped consumer.
 * Proves the adapter + harness fail closed on contract / role / validation /
 * stale-write / save-fail paths, and that doctor.mjs still wires the suite.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createNucleusShapedStore } from "../benchmark/records-pilot/adapters/nucleus-shaped.mjs";
import { assertRecordRow, RECORD_ERROR_CODES } from "../benchmark/records-pilot/adapters/contract.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = join(root, "benchmark/records-pilot/nucleus-api-server.mjs");
const doctorSrc = readFileSync(join(root, "verify/doctor.mjs"), "utf8");

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

let passed = 0;
const bite = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

await bite("doctor wires nucleus-shaped adapter + browser + this bite", () => {
  assert.match(doctorSrc, /records-pilot-nucleus-adapter\.test\.mjs/);
  assert.match(doctorSrc, /records-pilot-nucleus-browser\.mjs/);
  assert.match(doctorSrc, /records-pilot-nucleus-bite\.mjs/);
  assert.match(doctorSrc, /records-pilot:test|records pilot nucleus/);
});

await bite("missing baseUrl refuses construct", () => {
  assert.throws(() => createNucleusShapedStore({}), /requires baseUrl/);
});

await bite("assertRecordRow rejects incomplete rows", () => {
  assert.throws(() => assertRecordRow({ id: "x" }), /record\.title/);
  assert.throws(() => assertRecordRow({ id: "x", title: "t", owner: "o", status: "s", revision: 0 }), /revision/);
  assertRecordRow({ id: "x", title: "t", owner: "o", status: "s", notes: "", revision: 1 });
});

await bite("RECORD_ERROR_CODES cover fail/retry paths", () => {
  for (const code of ["FORBIDDEN", "SAVE_FAILED", "VALIDATION", "STALE_WRITE"]) {
    assert.ok(RECORD_ERROR_CODES.includes(code), code);
  }
});

const { child, baseUrl } = await startApi();
try {
  const editor = createNucleusShapedStore({ baseUrl, role: "editor" });
  const viewer = createNucleusShapedStore({ baseUrl, role: "viewer" });

  await bite("list contract requires rows array", async () => {
    const broken = createNucleusShapedStore({
      baseUrl,
      role: "editor",
      fetchImpl: async () =>
        new Response(JSON.stringify({ notRows: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    });
    await assert.rejects(() => broken.list(), /rows required/);
  });

  await bite("viewer FORBIDDEN on PATCH", async () => {
    await assert.rejects(() => viewer.save("r1", { notes: "x" }), (err) => err.code === "FORBIDDEN");
  });

  await bite("SAVE_FAILED then retry succeeds", async () => {
    await editor.armSaveFailure();
    await assert.rejects(
      () => editor.save("r1", { notes: "x" }, { expectedRevision: 1 }),
      (err) => err.code === "SAVE_FAILED" && err.status === 503,
    );
    const saved = await editor.save("r1", { notes: "retried" }, { expectedRevision: 1 });
    assert.equal(saved.notes, "retried");
    assert.equal(saved.revision, 2);
  });

  await bite("VALIDATION on empty title", async () => {
    await assert.rejects(
      () => editor.save("r1", { title: "  " }, { expectedRevision: 2 }),
      (err) => err.code === "VALIDATION" && err.status === 400,
    );
  });

  await bite("STALE_WRITE on revision mismatch", async () => {
    await assert.rejects(
      () => editor.save("r1", { notes: "nope" }, { expectedRevision: 1 }),
      (err) => err.code === "STALE_WRITE" && err.status === 409,
    );
  });

  await bite("server-side filter q narrows list", async () => {
    const rows = await editor.list({ q: "Beta" });
    assert.equal(rows.length, 1);
    assert.match(rows[0].title, /Beta/);
  });
} finally {
  child.kill("SIGTERM");
}

const empty = await startApi(["--seed", "empty"]);
try {
  await bite("empty seed returns zero rows", async () => {
    const store = createNucleusShapedStore({ baseUrl: empty.baseUrl });
    assert.equal((await store.list()).length, 0);
  });
} finally {
  empty.child.kill("SIGTERM");
}

console.log(`records-pilot-nucleus-bite.mjs: ok (${passed} bites)`);
