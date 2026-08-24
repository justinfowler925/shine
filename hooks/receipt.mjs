#!/usr/bin/env node
// Proof is bound to one exact artifact and one exact template image.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const VERSION = 3;
const MAX_AGE_MS = 20 * 60 * 1000;

export function receiptPath() {
  return process.env.SHINE_RECEIPT || join(homedir(), ".cache/shine/last-prove.json");
}

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export function artifactClaim(target, cite) {
  const artifact = realpathSync(resolve(target));
  return { artifact, cite, artifactSha256: sha256(readFileSync(artifact)) };
}

export function writeProveReceipt({ cite, target, templateShot, compareVersion = "compare-v3", tool = "compare.mjs", proof = null }) {
  if (!target || !templateShot) throw new Error("proof receipt requires target and templateShot");
  const claim = artifactClaim(target, cite);
  const shot = realpathSync(resolve(templateShot));
  const receipt = {
    version: VERSION,
    verdict: "pass",
    ...claim,
    templateShot: shot,
    templateShotSha256: sha256(readFileSync(shot)),
    compareVersion,
    tool,
    proof,
    at: Date.now(),
  };
  const p = receiptPath();
  mkdirSync(dirname(p), { recursive: true });
  const current = readProveReceipt();
  const receipts = current?.version === VERSION && Array.isArray(current.receipts) ? current.receipts : [];
  const kept = receipts.filter((r) => !(r.artifact === receipt.artifact && r.cite === receipt.cite));
  const tmp = `${p}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify({ version: VERSION, receipts: [...kept, receipt] }) + "\n", { mode: 0o600 });
  renameSync(tmp, p);
  return receipt;
}

export function readProveReceipt() {
  const p = receiptPath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/** Claims are `{artifact,cite,artifactSha256}`. Every artifact needs its own fresh PASS. */
export function proveGaps(claims, now = Date.now()) {
  const wanted = claims.filter((c) => c?.artifact && c?.cite && c?.artifactSha256);
  if (!wanted.length) return claims.length ? ["invalid artifact proof claim"] : [];
  const store = readProveReceipt();
  if (store?.version !== VERSION || !Array.isArray(store.receipts))
    return wanted.map((c) => `${c.artifact}: no artifact-bound compare.mjs proof`);
  return wanted.flatMap((claim) => {
    const rec = store.receipts.find((r) => r.artifact === claim.artifact && r.cite === claim.cite);
    if (!rec) return [`${claim.artifact}: no compare.mjs proof for ${claim.cite}`];
    if (rec.verdict !== "pass" || rec.tool !== "compare.mjs" || !rec.proof?.structureFingerprint) return [`${claim.artifact}: proof is not a compare PASS`];
    if (typeof rec.at !== "number" || rec.at > now + 60_000 || now - rec.at > MAX_AGE_MS)
      return [`${claim.artifact}: compare proof is stale or future-dated`];
    if (rec.artifactSha256 !== claim.artifactSha256) return [`${claim.artifact}: changed after compare.mjs`];
    if (!rec.templateShot || !existsSync(rec.templateShot)) return [`${claim.artifact}: template shot is missing`];
    if (sha256(readFileSync(rec.templateShot)) !== rec.templateShotSha256)
      return [`${claim.artifact}: template shot changed after compare.mjs`];
    return [];
  });
}

export function citeIdsIn(text) {
  return [...String(text).matchAll(/data-cite\s*=\s*["']([\w-]+)["']/g)].map((m) => m[1]);
}
