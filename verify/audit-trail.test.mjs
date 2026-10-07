#!/usr/bin/env node
/**
 * Doctor bite — DDR audit trail (enterprise §5).
 * ddrId + Action/Observation event log + prove receipt hash link;
 * supersede don't rewrite history.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { buildDdr, supersedeDdr } from "../core/ddr.mjs";
import {
  AUDIT_SCHEMA,
  appendEvent,
  eventsForDdr,
  initTrail,
  linkProveReceipt,
  linkProveReceiptAndSave,
  loadTrail,
  receiptHash,
  supersedeTrail,
  validateTrail,
} from "../core/audit-trail.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "shine-audit-"));

try {
  const ddr = buildDdr({
    job: "Decide Pursue/Review/Dismiss on the next notice",
    lane: "saas",
    category: "queue",
    mode: "denoise",
    primaryCite: "shadcn-queue",
    status: "proposed",
  });
  assert.ok(ddr.ddrId.startsWith("ddr_"));

  const trail = initTrail(ddr.ddrId, { auditDir: dir });
  assert.equal(trail.$schema, AUDIT_SCHEMA);
  assert.equal(trail.status, "active");
  assert.equal(trail.proveReceiptHash, null);
  assert.equal(trail.events.length, 1);
  assert.equal(trail.events[0].kind, "action");
  assert.equal(trail.events[0].type, "mint-ddr");
  assert.equal(validateTrail(trail).length, 0);

  // Refuse overwrite init.
  assert.throws(() => initTrail(ddr.ddrId, { auditDir: dir }), /already exists|do not rewrite/);

  // Action + Observation append; prior events immutable.
  const snap = structuredClone(trail.events[0]);
  let next = appendEvent(trail, {
    kind: "action",
    type: "accept-ddr",
    payload: { status: "accepted" },
  });
  next = appendEvent(next, {
    kind: "observation",
    type: "measure-result",
    payload: { status: "failed", failCategory: "cta-pressure" },
  });
  assert.equal(next.events.length, 3);
  assert.equal(next.events[0].seq, 1);
  assert.equal(next.events[1].kind, "action");
  assert.equal(next.events[2].kind, "observation");
  assert.deepEqual(trail.events[0], snap, "prior event must not mutate");
  next.events[0].payload.hacked = true;
  assert.equal(trail.events[0].payload.hacked, undefined, "append must not alias prior payloads");

  // Prove receipt hash link.
  const receipt = {
    version: 1,
    kind: "completion",
    verdict: "passed",
    tool: "prove.mjs",
    cite: "shadcn-queue",
    checks: { measure: { status: "passed" }, usability: { status: "passed" } },
    at: Date.now(),
  };
  const linked = linkProveReceipt(next, receipt, { ddrId: ddr.ddrId });
  assert.ok(/^[a-f0-9]{64}$/.test(linked.proveReceiptHash));
  assert.equal(linked.proveReceiptHash, receiptHash({ ...receipt, ddrId: ddr.ddrId, ddrLinked: true }));
  const linkObs = linked.events.at(-1);
  assert.equal(linkObs.kind, "observation");
  assert.equal(linkObs.type, "receipt-linked");
  assert.equal(linkObs.payload.proveReceiptHash, linked.proveReceiptHash);
  assert.equal(linkObs.payload.ddrLinked, true);

  // Persist + reload.
  const saved = linkProveReceiptAndSave(ddr.ddrId, receipt, { auditDir: dir });
  // init already had mint; linkProveReceiptAndSave loads and appends from disk trail
  // which only had mint — so prove hash tip is set.
  assert.ok(saved.proveReceiptHash);
  const loaded = loadTrail(ddr.ddrId, { auditDir: dir });
  assert.equal(loaded.proveReceiptHash, saved.proveReceiptHash);
  assert.ok(loaded.events.some((e) => e.type === "receipt-linked"));

  // Supersede: old history preserved, successor links back.
  const { superseded: oldDdrMarked, next: nextDdr } = supersedeDdr(ddr, {
    ...buildDdr({
      job: "Decide Pursue/Review/Dismiss on the next notice",
      lane: "saas",
      category: "queue",
      mode: "denoise",
      primaryCite: "shadcn-queue",
      status: "proposed",
    }),
    // force distinct id
  });
  // buildDdr always mints a new id — ensure distinct
  assert.notEqual(oldDdrMarked.ddrId, nextDdr.ddrId);
  assert.equal(oldDdrMarked.status, "superseded");
  assert.equal(oldDdrMarked.supersededBy, nextDdr.ddrId);
  assert.equal(nextDdr.supersedes, oldDdrMarked.ddrId);

  const beforeCount = loadTrail(ddr.ddrId, { auditDir: dir }).events.length;
  const beforeEvents = structuredClone(loadTrail(ddr.ddrId, { auditDir: dir }).events);
  const { superseded, next: successor } = supersedeTrail(loadTrail(ddr.ddrId, { auditDir: dir }), nextDdr.ddrId, {
    reason: "category clarified to queue focal",
    auditDir: dir,
  });
  assert.equal(superseded.status, "superseded");
  assert.equal(superseded.supersededBy, nextDdr.ddrId);
  assert.ok(superseded.events.length > beforeCount);
  // Original prefix unchanged (mint + receipt-linked still present, same payloads).
  for (let i = 0; i < beforeEvents.length; i++) {
    assert.equal(superseded.events[i].id, beforeEvents[i].id);
    assert.equal(superseded.events[i].type, beforeEvents[i].type);
    assert.deepEqual(
      { ...superseded.events[i].payload },
      beforeEvents[i].payload,
    );
  }
  assert.ok(superseded.events.some((e) => e.type === "supersede" && e.kind === "action"));
  assert.ok(superseded.events.some((e) => e.type === "superseded" && e.kind === "observation"));

  assert.equal(successor.supersedes, ddr.ddrId);
  assert.equal(successor.status, "active");
  assert.throws(
    () =>
      appendEvent(superseded, {
        kind: "action",
        type: "implement",
        payload: {},
      }),
    /superseded/,
  );

  // Refuse rewrite of successor init.
  assert.throws(() => initTrail(nextDdr.ddrId, { auditDir: dir }), /already exists/);

  assert.equal(eventsForDdr(ddr.ddrId, { auditDir: dir }).length, superseded.events.length);
  assert.ok(eventsForDdr(nextDdr.ddrId, { auditDir: dir }).length >= 1);

  // CLI smoke: show + append.
  const show = spawnSync(
    process.execPath,
    [join(SHINE, "core/audit-trail.mjs"), "show", "--ddr", nextDdr.ddrId, "--dir", dir],
    { encoding: "utf8" },
  );
  assert.equal(show.status, 0, show.stderr);
  assert.match(show.stdout, /shine-audit\/v1/);

  const append = spawnSync(
    process.execPath,
    [
      join(SHINE, "core/audit-trail.mjs"),
      "append",
      "--ddr",
      nextDdr.ddrId,
      "--dir",
      dir,
      "--kind",
      "action",
      "--type",
      "implement",
      "--payload",
      '{"op":"cta-budget"}',
    ],
    { encoding: "utf8" },
  );
  assert.equal(append.status, 0, append.stderr);

  // CLI link-receipt
  const receiptFile = join(dir, "receipt.json");
  writeFileSync(receiptFile, JSON.stringify(receipt, null, 2) + "\n");
  const linkCli = spawnSync(
    process.execPath,
    [
      join(SHINE, "core/audit-trail.mjs"),
      "link-receipt",
      "--ddr",
      nextDdr.ddrId,
      "--dir",
      dir,
      "--receipt",
      receiptFile,
    ],
    { encoding: "utf8" },
  );
  assert.equal(linkCli.status, 0, linkCli.stderr);
  const afterLink = loadTrail(nextDdr.ddrId, { auditDir: dir });
  assert.ok(afterLink.proveReceiptHash);
  assert.match(readFileSync(join(dir, `${nextDdr.ddrId}.json`), "utf8"), /receipt-linked/);

  console.log(
    "audit-trail PASS: ddrId Action/Observation log · prove receipt hash · supersede no rewrite",
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
