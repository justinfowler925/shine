#!/usr/bin/env node
/**
 * Design Decision Record (DDR) helpers — ADR-lite on the Shine packet.
 * Immutable ddrId; status proposed → accepted; supersede don't edit.
 * Prove receipts may link ddrId. Actor implement requires status=accepted.
 */

import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_OPERATE_CONSTITUTION_ID,
  operateConstitutionIds,
  resolveOperateConstitution,
} from "./constitution.mjs";

export const DDR_STATUSES = Object.freeze(["proposed", "accepted", "superseded"]);

/** Default Operate denoise constitution — critic must cite these IDs. */
export const OPERATE_DENOISE_CONSTITUTION = Object.freeze(operateConstitutionIds());

export { DEFAULT_OPERATE_CONSTITUTION_ID };

export function mintDdrId({ job = "", lane = "", category = "", mode = "" } = {}) {
  const stamp = randomUUID().slice(0, 8);
  const digest = createHash("sha256")
    .update([job, lane, category, mode, stamp].join("\0"))
    .digest("hex")
    .slice(0, 12);
  return `ddr_${digest}_${stamp}`;
}

/**
 * Build the DDR block for a design packet.
 * @param {object} opts
 * @param {"proposed"|"accepted"} [opts.status]
 */
export function buildDdr({
  job,
  lane = "saas",
  category = "",
  mode = "existing",
  primaryCite = "",
  antiCites = [],
  restructureVsRepaint = "repaint",
  restructureOps = [],
  constitutionIds = null,
  constitutionEdition = DEFAULT_OPERATE_CONSTITUTION_ID,
  openRisks = [],
  status = "proposed",
  ctaBudget = null,
  focalRegion = null,
  productSibling = null,
  wireframeBrief = null,
  supersedes = null,
} = {}) {
  if (!DDR_STATUSES.includes(status)) {
    throw new Error(`ddr status must be ${DDR_STATUSES.join("|")}; got ${status}`);
  }
  const resolved = resolveOperateConstitution({
    lane,
    mode,
    constitutionIds,
    editionId: constitutionEdition || DEFAULT_OPERATE_CONSTITUTION_ID,
  });
  return {
    ddrId: mintDdrId({ job, lane, category, mode }),
    status,
    job,
    lane,
    category,
    mode,
    primaryCite,
    antiCites: [...antiCites],
    restructureVsRepaint,
    restructureOps: [...restructureOps],
    constitutionIds: resolved.constitutionIds,
    /** Numbered edition principles — critic cites by id or n. */
    constitution: resolved.principles,
    constitutionEdition: resolved.editionId,
    openRisks: openRisks.length
      ? openRisks
      : ["Confirm product sibling still owns conventions before inventing chrome."],
    ctaBudget,
    focalRegion,
    productSibling,
    wireframeBrief,
    supersedes,
    acceptedAt: status === "accepted" ? new Date().toISOString() : null,
    instruction:
      status === "accepted"
        ? "DDR accepted — Actor may implement. Prove receipt must link ddrId. Critic must cite constitutionIds. Supersede to change decisions."
        : "DDR proposed — refuse Actor implement until status=accepted (--accept or ddr.mjs accept).",
  };
}

/** Fail-closed: Actor editing requires accepted DDR. */
export function assertDdrAccepted(ddr, { action = "implement" } = {}) {
  if (!ddr?.ddrId) throw new Error(`DDR missing ddrId — cannot ${action}`);
  if (ddr.status !== "accepted") {
    throw new Error(
      `DDR ${ddr.ddrId} status is ${ddr.status || "missing"} — refuse ${action} until accepted ` +
        `(rerun packet with --accept, or: node core/ddr.mjs accept <packet.json>)`,
    );
  }
  return true;
}

export function acceptDdr(ddr) {
  if (!ddr?.ddrId) throw new Error("cannot accept DDR without ddrId");
  if (ddr.status === "superseded") throw new Error(`DDR ${ddr.ddrId} is superseded — mint a new packet`);
  return {
    ...ddr,
    status: "accepted",
    acceptedAt: ddr.acceptedAt || new Date().toISOString(),
    instruction:
      "DDR accepted — Actor may implement. Prove receipt must link ddrId. Supersede to change decisions.",
  };
}

/**
 * Supersede don't edit: mark old DDR superseded and return the successor
 * with a forward link. Callers should also append audit-trail events via
 * `core/audit-trail.mjs` supersedeTrail.
 * @returns {{ superseded: object, next: object }}
 */
export function supersedeDdr(oldDdr, nextDdr) {
  if (!oldDdr?.ddrId) throw new Error("cannot supersede without old ddrId");
  if (!nextDdr?.ddrId) throw new Error("cannot supersede without next ddrId");
  if (oldDdr.ddrId === nextDdr.ddrId) throw new Error("cannot supersede a DDR with itself");
  if (oldDdr.status === "superseded") {
    throw new Error(`DDR ${oldDdr.ddrId} already superseded`);
  }
  const superseded = {
    ...oldDdr,
    status: "superseded",
    supersededBy: nextDdr.ddrId,
  };
  const next = {
    ...nextDdr,
    supersedes: oldDdr.ddrId,
    status: nextDdr.status || "proposed",
  };
  return { superseded, next };
}

/** Attach ddrId onto a prove/completion receipt payload (non-mutating clone). */
export function linkReceiptToDdr(receipt, ddrId, { constitutionIds = null, constitutionEdition = "" } = {}) {
  if (!ddrId) return receipt;
  const ids = Array.isArray(constitutionIds)
    ? constitutionIds.map((id) => String(id || "").trim()).filter(Boolean)
    : Array.isArray(receipt?.constitutionIds)
      ? receipt.constitutionIds
      : [];
  return {
    ...receipt,
    ddrId,
    ddrLinked: true,
    ...(ids.length
      ? {
          constitutionIds: ids,
          constitutionEdition: constitutionEdition || receipt?.constitutionEdition || "",
          constitutionLinked: true,
        }
      : {}),
  };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const cmd = args[0];
  try {
    if (cmd === "accept") {
      const path = resolve(args[1] || "shine-packet.json");
      if (!existsSync(path)) throw new Error(`missing packet ${path}`);
      const packet = JSON.parse(readFileSync(path, "utf8"));
      if (!packet.ddr) throw new Error("packet has no ddr block");
      packet.ddr = acceptDdr(packet.ddr);
      packet.editing = {
        ...(packet.editing || {}),
        allowed: packet.mode !== "audit",
        instruction:
          "DDR accepted. Fix diagnosed defects in priority order; denoise: no polish until primaryTaskCheck green.",
      };
      writeFileSync(path, JSON.stringify(packet, null, 2) + "\n");
      process.stdout.write(JSON.stringify({ ok: true, ddrId: packet.ddr.ddrId, status: packet.ddr.status }, null, 2) + "\n");
    } else if (cmd === "check") {
      const path = resolve(args[1] || "shine-packet.json");
      const packet = JSON.parse(readFileSync(path, "utf8"));
      assertDdrAccepted(packet.ddr);
      process.stdout.write(JSON.stringify({ ok: true, ddrId: packet.ddr.ddrId }, null, 2) + "\n");
    } else {
      throw new Error("usage: ddr.mjs accept <packet.json> | check <packet.json>");
    }
  } catch (error) {
    console.error(`shine ddr: ${error.message}`);
    process.exit(1);
  }
}
