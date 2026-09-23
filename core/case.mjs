#!/usr/bin/env node
/**
 * Resumable Shine case record — Phase 0/2 scaffolding for the expert-agent roadmap.
 * Extends the design-packet era with checkpoints; does not replace design-packet.mjs.
 */
import {createHash} from "node:crypto";
import {existsSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

export const stages = [
  "understand",
  "diagnose",
  "choose",
  "prototype",
  "implement",
  "verify",
  "deliver",
  "learn",
];

export const caseStatuses = new Set([
  "open",
  "blocked",
  "ready-for-verify",
  "verified",
  "delivered",
  "abandoned",
]);

const text = (value) => String(value || "").trim();
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function seedCase({
  job,
  category = "",
  lane = "saas",
  mode = "existing",
  project = process.cwd(),
  pilotId = "",
} = {}) {
  return {
    version: 1,
    id: "",
    job: text(job),
    category: text(category),
    lane: text(lane) || "saas",
    mode,
    project,
    pilotId: text(pilotId),
    status: "open",
    stage: "understand",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    packetPath: "",
    diagnosisPath: "",
    decision: {
      pattern: "",
      modalities: [],
      rationale: "",
      alternatives: [],
      uncertainty: "",
    },
    workflow: {
      family: "",
      states: [],
      objects: [],
      adapters: [],
    },
    implementation: {
      bindings: [],
      changedPaths: [],
      upgradeTracks: [],
    },
    evidence: {
      checks: [],
      unknowns: [],
      sourceSha: "",
      buildId: "",
    },
    unresolved: [],
    checkpoints: [],
    learnings: [],
  };
}

export function validateCase(value) {
  const errors = [];
  if (value?.version !== 1) errors.push("version must be 1");
  if (text(value?.job).length < 8) errors.push("job is missing");
  if (!stages.includes(value?.stage)) errors.push(`stage must be one of ${stages.join("|")}`);
  if (!caseStatuses.has(value?.status)) errors.push("status is invalid");
  if (!value?.decision || typeof value.decision !== "object") errors.push("decision is required");
  if (!Array.isArray(value?.unresolved)) errors.push("unresolved must be an array");
  if (!Array.isArray(value?.checkpoints)) errors.push("checkpoints must be an array");
  value?.checkpoints?.forEach((item, index) => {
    if (!stages.includes(item?.stage)) errors.push(`checkpoints[${index}].stage is invalid`);
    if (text(item?.at).length < 8) errors.push(`checkpoints[${index}].at is missing`);
    if (text(item?.summary).length < 8) errors.push(`checkpoints[${index}].summary is missing`);
  });
  if (value?.status === "delivered") {
    if (!text(value?.evidence?.sourceSha)) errors.push("delivered cases require evidence.sourceSha");
    if (!Array.isArray(value?.evidence?.checks) || value.evidence.checks.length < 1) {
      errors.push("delivered cases require at least one evidence.check");
    }
  }
  if (value?.stage === "learn" && (!Array.isArray(value?.learnings) || value.learnings.length < 1)) {
    errors.push("learn stage requires at least one learning record");
  }
  return errors;
}

export function checkpoint(value, {stage, summary, artifact = ""} = {}) {
  if (!stages.includes(stage)) throw new Error(`unknown stage ${stage}`);
  if (text(summary).length < 8) throw new Error("checkpoint summary is required");
  const next = structuredClone(value);
  next.stage = stage;
  next.updatedAt = new Date().toISOString();
  next.checkpoints = [
    ...(next.checkpoints || []),
    {stage, at: next.updatedAt, summary: text(summary), artifact: text(artifact)},
  ];
  return next;
}

export function hashCase(value) {
  const body = structuredClone(value);
  delete body.hash;
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export function readCase(path) {
  const absolute = resolve(path);
  const value = JSON.parse(readFileSync(absolute, "utf8"));
  const errors = validateCase(value);
  if (errors.length) throw new Error(`invalid case: ${errors.join("; ")}`);
  return {...value, hash: hashCase(value), path: absolute};
}

export function writeCase(path, value) {
  const errors = validateCase(value);
  if (errors.length) throw new Error(`invalid case: ${errors.join("; ")}`);
  const absolute = resolve(path);
  const stamped = {...value, updatedAt: new Date().toISOString()};
  writeFileSync(absolute, `${JSON.stringify(stamped, null, 2)}\n`);
  return readCase(absolute);
}

export function loadExpertBriefs(root = ROOT) {
  const path = resolve(root, "benchmark/expert-briefs.json");
  if (!existsSync(path)) throw new Error(`missing ${path}`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const learning = data.learning || [];
  const heldOut = data.heldOut || [];
  if (learning.length !== 12) throw new Error(`expected 12 learning briefs, found ${learning.length}`);
  if (heldOut.length !== 8) throw new Error(`expected 8 held-out briefs, found ${heldOut.length}`);
  if (heldOut.some((item) => item.sealedUntil !== "phase-5")) {
    throw new Error("held-out briefs must declare sealedUntil phase-5");
  }
  return data;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const cmd = process.argv[2] || "seed";
  if (cmd === "validate-briefs") {
    const data = loadExpertBriefs();
    console.log(JSON.stringify({learning: data.learning.length, heldOut: data.heldOut.length, ok: true}));
    process.exit(0);
  }
  if (cmd === "seed") {
    const job = process.argv.slice(3).join(" ") || "Records inspect edit persist through consumer adapter";
    const seeded = seedCase({job, category: "record", pilotId: "records-inspect-edit-persist"});
    console.log(JSON.stringify(seeded, null, 2));
    process.exit(0);
  }
  console.error("usage: node core/case.mjs seed|validate-briefs");
  process.exit(1);
}
