#!/usr/bin/env node
/**
 * Doctor bite — DDR audit trail (enterprise §5).
 * ddrId + Action/Observation event log + prove receipt hash link;
 * supersede don't rewrite history.
 * Auto-append on packet accept/refuse + prove completion (decision path, not only manual).
 * Denoise-loop measure/critic/reflexion auto-append when SHINE_AUDIT_DIR set.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { buildDdr, refuseDdr, supersedeDdr } from "../core/ddr.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";
import {
  AUDIT_SCHEMA,
  appendEvent,
  autoAppendDenoiseLoop,
  eventsForDdr,
  initTrail,
  linkProveReceipt,
  linkProveReceiptAndSave,
  loadTrail,
  receiptHash,
  recordCriticReflexionTurn,
  recordDdrDecision,
  recordMeasureTurn,
  recordProveCompletion,
  shineAuditDirEnabled,
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

  // ---- Decision-path auto-append (not only manual CLI) ----
  const decisionDir = mkdtempSync(join(tmpdir(), "shine-audit-decision-"));
  try {
    const proposed = createDesignPacket({
      job: "Decide Pursue/Review/Dismiss on the next notice",
      lane: "saas",
      mode: "denoise",
      category: "queue",
      project: SHINE,
    });
    assert.equal(proposed.ddr.status, "proposed");
    const acceptPath = join(decisionDir, "accept-packet.json");
    writeFileSync(acceptPath, JSON.stringify(proposed, null, 2) + "\n");
    const acceptRun = spawnSync(
      process.execPath,
      [join(SHINE, "core/ddr.mjs"), "accept", acceptPath, "--audit-dir", decisionDir],
      { encoding: "utf8" },
    );
    assert.equal(acceptRun.status, 0, acceptRun.stderr);
    const acceptOut = JSON.parse(acceptRun.stdout);
    assert.equal(acceptOut.status, "accepted");
    assert.ok(acceptOut.auditSeq >= 2);
    const acceptTrail = loadTrail(acceptOut.ddrId, { auditDir: decisionDir });
    assert.ok(acceptTrail.events.some((e) => e.type === "mint-ddr"));
    assert.ok(
      acceptTrail.events.some(
        (e) => e.kind === "action" && e.type === "accept-ddr" && e.payload.status === "accepted",
      ),
      "ddr.mjs accept must auto-append accept-ddr",
    );

    const proposed2 = createDesignPacket({
      job: "Configure account profile fields",
      lane: "saas",
      mode: "denoise",
      category: "settings",
      project: SHINE,
    });
    const refusePath = join(decisionDir, "refuse-packet.json");
    writeFileSync(refusePath, JSON.stringify(proposed2, null, 2) + "\n");
    const refuseRun = spawnSync(
      process.execPath,
      [
        join(SHINE, "core/ddr.mjs"),
        "refuse",
        refusePath,
        "--reason",
        "wrong category — not settings",
        "--audit-dir",
        decisionDir,
      ],
      { encoding: "utf8" },
    );
    assert.equal(refuseRun.status, 0, refuseRun.stderr);
    const refuseOut = JSON.parse(refuseRun.stdout);
    assert.equal(refuseOut.status, "refused");
    const refusePacket = JSON.parse(readFileSync(refusePath, "utf8"));
    assert.equal(refusePacket.ddr.status, "refused");
    assert.equal(refusePacket.editing.allowed, false);
    assert.match(refusePacket.ddr.refuseReason || "", /wrong category/);
    const refuseTrail = loadTrail(refuseOut.ddrId, { auditDir: decisionDir });
    assert.ok(
      refuseTrail.events.some(
        (e) => e.kind === "action" && e.type === "refuse-ddr" && e.payload.status === "refused",
      ),
      "ddr.mjs refuse must auto-append refuse-ddr",
    );

    // Pure refuseDdr + recordDdrDecision API (library path).
    const refused = refuseDdr(proposed2.ddr, { reason: "duplicate" });
    assert.equal(refused.status, "refused");
    const apiTrail = recordDdrDecision(
      refused.ddrId,
      { decision: "refuse", reason: "duplicate", source: "test" },
      { auditDir: decisionDir },
    );
    // Same ddrId already has refuse-ddr from CLI — another refuse append is ok (append-only).
    assert.ok(apiTrail.events.filter((e) => e.type === "refuse-ddr").length >= 2);

    // Prove completion auto-append (decision path helper used by prove.mjs).
    const proveDdr = buildDdr({
      job: "Decide Pursue/Review/Dismiss on the next notice",
      lane: "saas",
      category: "queue",
      mode: "denoise",
      primaryCite: "shadcn-queue",
      status: "accepted",
    });
    const proveReceipt = {
      version: 1,
      kind: "completion",
      verdict: "passed",
      tool: "prove.mjs",
      cite: "shadcn-queue",
      ddrId: proveDdr.ddrId,
      ddrLinked: true,
      checks: { accessibility: { status: "passed" }, styling: { status: "passed" } },
      at: Date.now(),
    };
    const proveTrail = recordProveCompletion(proveDdr.ddrId, proveReceipt, { auditDir: decisionDir });
    assert.ok(proveTrail.proveReceiptHash);
    assert.ok(proveTrail.events.some((e) => e.type === "prove" && e.kind === "action"));
    assert.ok(proveTrail.events.some((e) => e.type === "receipt-linked" && e.kind === "observation"));
    assert.equal(proveTrail.proveReceiptHash, receiptHash(proveReceipt));
  } finally {
    rmSync(decisionDir, { recursive: true, force: true });
  }

  // ---- Denoise-loop measure/critic/reflexion auto-append (SHINE_AUDIT_DIR) ----
  const loopDir = mkdtempSync(join(tmpdir(), "shine-audit-loop-"));
  const prevAuditEnv = process.env.SHINE_AUDIT_DIR;
  try {
    delete process.env.SHINE_AUDIT_DIR;
    assert.equal(shineAuditDirEnabled(), null);
    const loopDdr = buildDdr({
      job: "Decide Pursue/Review/Dismiss on the next notice",
      lane: "saas",
      category: "queue",
      mode: "denoise",
      primaryCite: "shadcn-queue",
      status: "accepted",
    });
    // No-op when env unset and no explicit dir.
    assert.equal(
      autoAppendDenoiseLoop(loopDdr.ddrId, {
        type: "measure",
        round: 1,
        status: 1,
        failures: ["cta-pressure: 2 filled"],
      }),
      null,
    );
    assert.equal(loadTrail(loopDdr.ddrId, { auditDir: loopDir }), null);

    // Library helpers (explicit auditDir — same events denoise-loop writes).
    let loopTrail = recordMeasureTurn(
      loopDdr.ddrId,
      {
        round: 1,
        status: 1,
        failures: ["cta-pressure: 2 filled in main", "dual-focal: peer grids"],
        source: "audit-trail.test",
      },
      { auditDir: loopDir },
    );
    assert.ok(loopTrail.events.some((e) => e.kind === "action" && e.type === "measure"));
    assert.ok(
      loopTrail.events.some(
        (e) =>
          e.kind === "observation" &&
          e.type === "measure-result" &&
          e.payload.status === "failed" &&
          e.payload.failures.length === 2,
      ),
    );
    loopTrail = recordCriticReflexionTurn(
      loopDdr.ddrId,
      {
        verdict: "partial",
        nextStep: "Apply cta-budget maxFilled=1",
        disposition: "actor-proceed",
        criticAgentId: "critic.test",
        actorAgentId: "actor.test",
        source: "audit-trail.test",
      },
      { auditDir: loopDir },
    );
    assert.ok(loopTrail.events.some((e) => e.kind === "action" && e.type === "critic"));
    assert.ok(loopTrail.events.some((e) => e.kind === "action" && e.type === "reflexion"));
    assert.ok(
      loopTrail.events.some(
        (e) =>
          e.kind === "observation" &&
          e.type === "critic-verdict" &&
          e.payload.verdict === "partial",
      ),
    );

    // Env opt-in wire used by denoise-loop.mjs.
    process.env.SHINE_AUDIT_DIR = loopDir;
    assert.equal(shineAuditDirEnabled(), loopDir);
    const envDdr = buildDdr({
      job: "Configure account profile fields",
      lane: "saas",
      category: "settings",
      mode: "denoise",
      primaryCite: "shadcn-settings",
      status: "accepted",
    });
    const envTrail = autoAppendDenoiseLoop(envDdr.ddrId, {
      type: "measure",
      round: 1,
      status: 0,
      failures: [],
    });
    assert.ok(envTrail);
    assert.ok(envTrail.events.some((e) => e.type === "measure"));
    assert.ok(
      envTrail.events.some(
        (e) => e.type === "measure-result" && e.payload.status === "passed",
      ),
    );
    const criticTrail = autoAppendDenoiseLoop(envDdr.ddrId, {
      type: "critic-reflexion",
      verdict: "done",
      disposition: "host-accepted",
      criticAgentId: "critic.env",
      actorAgentId: "actor.env",
    });
    assert.ok(criticTrail.events.some((e) => e.type === "critic"));
    assert.ok(criticTrail.events.some((e) => e.type === "reflexion"));
    assert.ok(criticTrail.events.some((e) => e.type === "critic-verdict"));
    assert.throws(
      () => autoAppendDenoiseLoop(envDdr.ddrId, { type: "nope" }),
      /measure\|critic-reflexion/,
    );
  } finally {
    if (prevAuditEnv === undefined) delete process.env.SHINE_AUDIT_DIR;
    else process.env.SHINE_AUDIT_DIR = prevAuditEnv;
    rmSync(loopDir, { recursive: true, force: true });
  }

  console.log(
    "audit-trail PASS: ddrId Action/Observation log · prove receipt hash · supersede no rewrite · accept/refuse+prove auto-append · measure/critic/reflexion loop",
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
