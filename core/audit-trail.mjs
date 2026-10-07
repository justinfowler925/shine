#!/usr/bin/env node
/**
 * DDR audit trail — enterprise-agent plan §5.
 *
 * Append-only Action/Observation event log keyed by immutable ddrId.
 * Prove completion receipts link by content hash; supersede links forward —
 * never rewrite or delete prior events.
 *
 * Usage:
 *   node core/audit-trail.mjs init --ddr ddr_…
 *   node core/audit-trail.mjs append --ddr ddr_… --kind action|observation \
 *     --type accept-ddr --payload '{"status":"accepted"}'
 *   node core/audit-trail.mjs link-receipt --ddr ddr_… --receipt last-completion.json
 *   node core/audit-trail.mjs supersede --from ddr_old --to ddr_new
 *   node core/audit-trail.mjs show --ddr ddr_…
 */

import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { linkReceiptToDdr } from "./ddr.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
void ROOT; // CLI sibling parity; trail files live under SHINE_AUDIT_DIR

export const AUDIT_SCHEMA = "shine-audit/v1";
export const EVENT_KINDS = Object.freeze(["action", "observation"]);
export const TRAIL_STATUSES = Object.freeze(["active", "superseded"]);

/** Well-known action types (open set — custom types allowed). */
export const ACTION_TYPES = Object.freeze([
  "mint-ddr",
  "accept-ddr",
  "refuse-ddr",
  "implement",
  "measure",
  "prove",
  "critic",
  "reflexion",
  "supersede",
  "learn-commit",
]);

/** Well-known observation types. */
export const OBSERVATION_TYPES = Object.freeze([
  "measure-result",
  "prove-result",
  "critic-verdict",
  "receipt-linked",
  "superseded",
  "error",
]);

export function defaultAuditDir() {
  return process.env.SHINE_AUDIT_DIR || join(homedir(), ".cache/shine/audit");
}

export function trailPath(ddrId, auditDir = defaultAuditDir()) {
  const id = String(ddrId || "").trim();
  if (!id.startsWith("ddr_")) throw new Error("ddrId required (ddr_…)");
  return join(auditDir, `${id}.json`);
}

const text = (value) => String(value || "").trim();

/** Stable JSON for hashing — sorted object keys, no whitespace variance. */
export function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => canonicalJson(v)).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
}

/** SHA-256 of a prove/completion receipt payload (content-addressed link). */
export function receiptHash(receipt) {
  if (!receipt || typeof receipt !== "object") {
    throw new Error("receiptHash requires a receipt object");
  }
  return createHash("sha256").update(canonicalJson(receipt)).digest("hex");
}

export function emptyTrail(ddrId, { supersedes = null } = {}) {
  const id = text(ddrId);
  if (!id.startsWith("ddr_")) throw new Error("ddrId required (ddr_…)");
  const now = new Date().toISOString();
  return {
    $schema: AUDIT_SCHEMA,
    ddrId: id,
    status: "active",
    supersedes: supersedes ? text(supersedes) : null,
    supersededBy: null,
    proveReceiptHash: null,
    events: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function validateEvent(event) {
  const errors = [];
  if (!event?.id || text(event.id).length < 8) errors.push("id required");
  if (!Number.isInteger(event?.seq) || event.seq < 1) errors.push("seq must be ≥1 int");
  if (!EVENT_KINDS.includes(event?.kind)) {
    errors.push(`kind must be ${EVENT_KINDS.join("|")}`);
  }
  if (!text(event?.type)) errors.push("type required");
  if (!text(event?.at)) errors.push("at required");
  if (event?.payload == null || typeof event.payload !== "object" || Array.isArray(event.payload)) {
    errors.push("payload must be an object");
  }
  return errors;
}

export function validateTrail(trail) {
  const errors = [];
  if (trail?.$schema !== AUDIT_SCHEMA) errors.push(`$schema must be ${AUDIT_SCHEMA}`);
  if (!text(trail?.ddrId).startsWith("ddr_")) errors.push("ddrId required (ddr_…)");
  if (!TRAIL_STATUSES.includes(trail?.status)) {
    errors.push(`status must be ${TRAIL_STATUSES.join("|")}`);
  }
  if (!Array.isArray(trail?.events)) errors.push("events must be an array");
  let prevSeq = 0;
  for (const [i, ev] of (trail?.events || []).entries()) {
    for (const err of validateEvent(ev)) errors.push(`events[${i}]: ${err}`);
    if (ev?.seq !== prevSeq + 1) errors.push(`events[${i}]: seq must be contiguous`);
    prevSeq = ev?.seq ?? prevSeq;
  }
  if (trail?.proveReceiptHash != null) {
    if (!/^[a-f0-9]{64}$/.test(trail.proveReceiptHash)) {
      errors.push("proveReceiptHash must be sha256 hex or null");
    }
  }
  if (trail?.status === "superseded" && !text(trail?.supersededBy).startsWith("ddr_")) {
    errors.push("superseded trail requires supersededBy ddrId");
  }
  return errors;
}

export function loadTrail(ddrId, { auditDir = defaultAuditDir() } = {}) {
  const path = trailPath(ddrId, auditDir);
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const errors = validateTrail(raw);
  if (errors.length) throw new Error(`audit trail invalid: ${errors.join("; ")}`);
  return raw;
}

export function saveTrail(trail, { auditDir = defaultAuditDir() } = {}) {
  const errors = validateTrail(trail);
  if (errors.length) throw new Error(`audit trail invalid: ${errors.join("; ")}`);
  const path = trailPath(trail.ddrId, auditDir);
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(trail, null, 2) + "\n", { mode: 0o600 });
  renameSync(tmp, path);
  return path;
}

/**
 * Init a trail for ddrId. Refuses if a trail already exists (no overwrite).
 */
export function initTrail(ddrId, { auditDir = defaultAuditDir(), supersedes = null } = {}) {
  const existing = loadTrail(ddrId, { auditDir });
  if (existing) {
    throw new Error(`audit trail for ${ddrId} already exists — supersede, do not rewrite`);
  }
  const trail = emptyTrail(ddrId, { supersedes });
  const withMint = appendEvent(trail, {
    kind: "action",
    type: "mint-ddr",
    payload: { ddrId: text(ddrId), supersedes: supersedes || null },
  });
  saveTrail(withMint, { auditDir });
  return withMint;
}

/**
 * Append one Action or Observation. Never mutates prior events.
 * Refuses writes on superseded trails (except observation type=superseded which
 * is applied via supersedeTrail).
 */
export function appendEvent(trail, { kind, type, payload = {}, at = null, id = null } = {}) {
  if (!trail || typeof trail !== "object") throw new Error("trail required");
  if (trail.status === "superseded") {
    throw new Error(`trail ${trail.ddrId} is superseded — append on the successor, do not rewrite history`);
  }
  if (!EVENT_KINDS.includes(kind)) {
    throw new Error(`kind must be ${EVENT_KINDS.join("|")}`);
  }
  const eventType = text(type);
  if (!eventType) throw new Error("type required");
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("payload must be an object");
  }
  const prev = trail.events || [];
  // Freeze prior events: clone array + shallow-clone each event so callers cannot
  // mutate history through shared references.
  const frozenPrev = prev.map((ev) => ({ ...ev, payload: { ...(ev.payload || {}) } }));
  const event = {
    id: text(id) || `evt_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    seq: frozenPrev.length + 1,
    kind,
    type: eventType,
    at: at || new Date().toISOString(),
    payload: { ...payload },
  };
  const errors = validateEvent(event);
  if (errors.length) throw new Error(`invalid event: ${errors.join("; ")}`);
  return {
    ...trail,
    events: [...frozenPrev, event],
    updatedAt: event.at,
  };
}

export function appendAndSave(ddrId, event, { auditDir = defaultAuditDir() } = {}) {
  let trail = loadTrail(ddrId, { auditDir });
  if (!trail) trail = initTrail(ddrId, { auditDir });
  const next = appendEvent(trail, event);
  saveTrail(next, { auditDir });
  return next;
}

/**
 * Decision-path auto-append: packet accept|refuse → Action on the ddrId trail.
 * Inits the trail (mint-ddr) when missing. Not only the manual `append` CLI.
 * @param {string} ddrId
 * @param {{ decision: "accept"|"refuse", reason?: string|null, source?: string }} opts
 */
export function recordDdrDecision(
  ddrId,
  { decision, reason = null, source = "ddr.mjs" } = {},
  { auditDir = defaultAuditDir() } = {},
) {
  const d = text(decision);
  if (d !== "accept" && d !== "refuse") {
    throw new Error("recordDdrDecision: decision must be accept|refuse");
  }
  return appendAndSave(
    ddrId,
    {
      kind: "action",
      type: d === "accept" ? "accept-ddr" : "refuse-ddr",
      payload: {
        status: d === "accept" ? "accepted" : "refused",
        reason: reason ? text(reason) : null,
        source: text(source) || "ddr.mjs",
      },
    },
    { auditDir },
  );
}

/**
 * Decision-path auto-append: prove completion → action:prove + receipt-linked hash.
 * Wired from verify/prove.mjs when --ddr is set — not only manual link-receipt.
 */
export function recordProveCompletion(ddrId, receipt, { auditDir = defaultAuditDir() } = {}) {
  if (!receipt || typeof receipt !== "object") {
    throw new Error("recordProveCompletion requires a receipt object");
  }
  appendAndSave(
    ddrId,
    {
      kind: "action",
      type: "prove",
      payload: {
        tool: receipt.tool || "prove.mjs",
        verdict: receipt.verdict || receipt.status || null,
        cite: receipt.cite || null,
      },
    },
    { auditDir },
  );
  return linkProveReceiptAndSave(ddrId, receipt, { auditDir });
}

/**
 * Link a prove/completion receipt by content hash.
 * Appends observation `receipt-linked` and sets tip `proveReceiptHash`.
 * Prior events stay intact; tip may advance to a newer receipt hash.
 */
export function linkProveReceipt(trail, receipt, { ddrId = null } = {}) {
  const id = text(ddrId) || trail.ddrId;
  const linked = linkReceiptToDdr(receipt, id);
  const hash = receiptHash(linked);
  const next = appendEvent(trail, {
    kind: "observation",
    type: "receipt-linked",
    payload: {
      proveReceiptHash: hash,
      cite: linked.cite || null,
      verdict: linked.verdict || linked.status || null,
      tool: linked.tool || null,
      ddrId: id,
      ddrLinked: true,
    },
  });
  return {
    ...next,
    proveReceiptHash: hash,
  };
}

export function linkProveReceiptAndSave(ddrId, receipt, { auditDir = defaultAuditDir() } = {}) {
  let trail = loadTrail(ddrId, { auditDir });
  if (!trail) trail = initTrail(ddrId, { auditDir });
  const next = linkProveReceipt(trail, receipt, { ddrId });
  saveTrail(next, { auditDir });
  return next;
}

/**
 * Supersede: close old trail (append + tip pointers), open successor.
 * Old events are never deleted or edited.
 */
export function supersedeTrail(oldTrail, nextDdrId, { reason = "", auditDir = null } = {}) {
  const nextId = text(nextDdrId);
  if (!nextId.startsWith("ddr_")) throw new Error("next ddrId required (ddr_…)");
  if (!oldTrail?.ddrId) throw new Error("old trail required");
  if (oldTrail.ddrId === nextId) throw new Error("cannot supersede a DDR with itself");
  if (oldTrail.status === "superseded") {
    throw new Error(`trail ${oldTrail.ddrId} already superseded by ${oldTrail.supersededBy}`);
  }
  if (auditDir && loadTrail(nextId, { auditDir })) {
    throw new Error(`successor trail ${nextId} already exists — refuse rewrite`);
  }

  const closed = {
    ...appendEvent(oldTrail, {
      kind: "action",
      type: "supersede",
      payload: { supersededBy: nextId, reason: text(reason) || null },
    }),
    status: "superseded",
    supersededBy: nextId,
  };
  // Append observation after status flip via direct event (status already superseded
  // would block appendEvent) — build manually to keep history append-only.
  const obsAt = new Date().toISOString();
  const obs = {
    id: `evt_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    seq: closed.events.length + 1,
    kind: "observation",
    type: "superseded",
    at: obsAt,
    payload: { supersededBy: nextId, priorEventCount: oldTrail.events.length },
  };
  const closedFinal = {
    ...closed,
    events: [...closed.events, obs],
    updatedAt: obsAt,
  };
  const errs = validateTrail(closedFinal);
  if (errs.length) throw new Error(`supersede close invalid: ${errs.join("; ")}`);

  const successor = emptyTrail(nextId, { supersedes: oldTrail.ddrId });
  const successorReady = appendEvent(successor, {
    kind: "action",
    type: "mint-ddr",
    payload: { ddrId: nextId, supersedes: oldTrail.ddrId, reason: text(reason) || null },
  });

  if (auditDir) {
    saveTrail(closedFinal, { auditDir });
    saveTrail(successorReady, { auditDir });
  }
  return { superseded: closedFinal, next: successorReady };
}

/** Events for one ddrId (empty if missing). */
export function eventsForDdr(ddrId, { auditDir = defaultAuditDir() } = {}) {
  const trail = loadTrail(ddrId, { auditDir });
  return trail ? trail.events.map((ev) => ({ ...ev, payload: { ...ev.payload } })) : [];
}

function opt(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const auditDir = opt(args, "--dir") || defaultAuditDir();
  try {
    if (cmd === "init") {
      const ddr = opt(args, "--ddr");
      const trail = initTrail(ddr, { auditDir, supersedes: opt(args, "--supersedes") || null });
      process.stdout.write(JSON.stringify({ ok: true, ddrId: trail.ddrId, events: trail.events.length }, null, 2) + "\n");
    } else if (cmd === "append") {
      const ddr = opt(args, "--ddr");
      const kind = opt(args, "--kind");
      const type = opt(args, "--type");
      const payloadRaw = opt(args, "--payload") || "{}";
      const payload = JSON.parse(payloadRaw);
      const trail = appendAndSave(ddr, { kind, type, payload }, { auditDir });
      process.stdout.write(
        JSON.stringify({ ok: true, ddrId: trail.ddrId, seq: trail.events.at(-1).seq, events: trail.events.length }, null, 2) +
          "\n",
      );
    } else if (cmd === "link-receipt") {
      const ddr = opt(args, "--ddr");
      const receiptPath = opt(args, "--receipt");
      if (!receiptPath || !existsSync(receiptPath)) throw new Error("--receipt path required");
      const raw = JSON.parse(readFileSync(receiptPath, "utf8"));
      // Accept either a bare receipt or a store with receipts[]
      const receipt = Array.isArray(raw?.receipts) ? raw.receipts.at(-1) : raw;
      if (!receipt) throw new Error("no receipt object found");
      const trail = linkProveReceiptAndSave(ddr, receipt, { auditDir });
      process.stdout.write(
        JSON.stringify({ ok: true, ddrId: trail.ddrId, proveReceiptHash: trail.proveReceiptHash }, null, 2) + "\n",
      );
    } else if (cmd === "supersede") {
      const from = opt(args, "--from");
      const to = opt(args, "--to");
      const reason = opt(args, "--reason") || "";
      let old = loadTrail(from, { auditDir });
      if (!old) old = initTrail(from, { auditDir });
      const { superseded, next } = supersedeTrail(old, to, { reason, auditDir });
      process.stdout.write(
        JSON.stringify(
          {
            ok: true,
            superseded: superseded.ddrId,
            next: next.ddrId,
            oldEvents: superseded.events.length,
          },
          null,
          2,
        ) + "\n",
      );
    } else if (cmd === "show") {
      const ddr = opt(args, "--ddr");
      const trail = loadTrail(ddr, { auditDir });
      if (!trail) throw new Error(`no trail for ${ddr}`);
      process.stdout.write(JSON.stringify(trail, null, 2) + "\n");
    } else {
      throw new Error(
        "usage: audit-trail.mjs init|append|link-receipt|supersede|show --ddr … [--dir …]",
      );
    }
  } catch (error) {
    console.error(`shine audit: ${error.message}`);
    process.exit(1);
  }
}
