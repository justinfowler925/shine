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

/**
 * Files compare can actually load and render. Everything else — a .tsx, a .vue,
 * a .svelte — is a *source* that produces an artifact; it is never the artifact.
 */
export const RENDERABLE_ARTIFACT = /\.html?$/i;

/**
 * The weaker claim a component source can honestly make.
 *
 * A source cannot be a compare target: point compare at a .tsx and the browser
 * paints TypeScript as text, so `facts.cite` is empty and it fails with
 * "artifact data-cite missing" and "0 regions". Keying proof to the source
 * therefore demanded a receipt no run of compare has ever been able to write —
 * every receipt in the store's history is keyed to a rendered .html.
 *
 * So a source claims its CITE, not its bytes: "a component citing X changed,
 * and some artifact bound to X passed compare inside the freshness window."
 * That is genuinely weaker than an artifact claim and is named as such, but it
 * is a real gate — you still have to render the surface and compare it — and
 * unlike the artifact claim it can be satisfied.
 */
export function citeClaim(cite, source) {
  return { cite, source: realpathSync(resolve(source)) };
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

/** Everything a receipt must satisfy regardless of what claimed it. */
function receiptFaults(rec, label, now) {
  if (rec.verdict !== "pass" || rec.tool !== "compare.mjs" || !rec.proof?.structureFingerprint)
    return [`${label}: proof is not a compare PASS`];
  if (typeof rec.at !== "number" || rec.at > now + 60_000 || now - rec.at > MAX_AGE_MS)
    return [`${label}: compare proof is stale or future-dated`];
  if (!rec.templateShot || !existsSync(rec.templateShot)) return [`${label}: template shot is missing`];
  if (sha256(readFileSync(rec.templateShot)) !== rec.templateShotSha256)
    return [`${label}: template shot changed after compare.mjs`];
  return [];
}

/**
 * Two claim shapes, because two different things can change.
 *
 * `{artifact,cite,artifactSha256}` — a rendered artifact changed. It must have
 * its own fresh PASS, bound to those exact bytes. Unchanged.
 *
 * `{cite,source}` — a component source changed. It needs a fresh PASS for that
 * cite on some artifact, because the source is not renderable and cannot carry
 * a receipt of its own.
 */
export function proveGaps(claims, now = Date.now()) {
  const artifacts = claims.filter((c) => c?.artifact && c?.cite && c?.artifactSha256);
  const sources = claims.filter((c) => !c?.artifact && c?.cite && c?.source);
  const wanted = artifacts.length + sources.length;
  if (!wanted) return claims.length ? ["invalid artifact proof claim"] : [];
  const store = readProveReceipt();
  if (store?.version !== VERSION || !Array.isArray(store.receipts))
    return [
      ...artifacts.map((c) => `${c.artifact}: no artifact-bound compare.mjs proof`),
      ...sources.map((c) => `${c.source}: no compare.mjs proof for ${c.cite}`),
    ];
  const artifactGaps = artifacts.flatMap((claim) => {
    const rec = store.receipts.find((r) => r.artifact === claim.artifact && r.cite === claim.cite);
    if (!rec) return [`${claim.artifact}: no compare.mjs proof for ${claim.cite}`];
    const faults = receiptFaults(rec, claim.artifact, now);
    if (faults.length) return faults;
    if (rec.artifactSha256 !== claim.artifactSha256) return [`${claim.artifact}: changed after compare.mjs`];
    return [];
  });
  const sourceGaps = sources.flatMap((claim) => {
    // Newest first: an older stale receipt for the same cite must not mask a
    // fresh one, and a fresh one must not be judged by an older one's faults.
    const candidates = store.receipts
      .filter((r) => r.cite === claim.cite)
      .sort((a, b) => (b.at || 0) - (a.at || 0));
    if (!candidates.length)
      return [`${claim.source}: no compare.mjs proof for ${claim.cite} — render the surface and compare that artifact`];
    if (candidates.some((rec) => !receiptFaults(rec, claim.source, now).length)) return [];
    return receiptFaults(candidates[0], claim.source, now);
  });
  return [...artifactGaps, ...sourceGaps];
}

export function citeIdsIn(text) {
  return [...String(text).matchAll(/data-cite\s*=\s*["']([\w-]+)["']/g)].map((m) => m[1]);
}
