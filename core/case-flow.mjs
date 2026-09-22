#!/usr/bin/env node
/**
 * Bind knowledge retrieval into a Shine case at choose-stage.
 * Does not invent decisions — attaches ranked principles for the agent to apply.
 */
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {checkpoint, seedCase, writeCase} from "../core/case.mjs";
import {retrievePrinciples} from "../knowledge/retrieve.mjs";

export function attachKnowledge(caseValue, {limit = 6} = {}) {
  const hits = retrievePrinciples(caseValue.job, {limit});
  const next = structuredClone(caseValue);
  next.decision = {
    ...next.decision,
    principles: hits,
  };
  if (!next.decision.rationale) {
    next.decision.rationale = hits.length
      ? `Retrieved ${hits.length} principle(s); choose among them with task-specific judgment.`
      : "No principle hits; diagnose from packet and product owners only.";
  }
  return checkpoint(next, {
    stage: "choose",
    summary: hits.length
      ? `Attached ${hits.length} knowledge hits for decision`
      : "Choose stage with empty knowledge retrieval",
  });
}

export function openPilotCase({
  job = "Records inspect edit persist through consumer adapter",
  category = "record",
  pilotId = "records-inspect-edit-persist",
  project = process.cwd(),
} = {}) {
  let value = seedCase({job, category, pilotId, project, lane: "saas", mode: "existing"});
  value = checkpoint(value, {
    stage: "understand",
    summary: "Opened pilot case with declared job and support boundary",
  });
  value = attachKnowledge(value);
  return value;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const out = process.argv.includes("--out")
    ? process.argv[process.argv.indexOf("--out") + 1]
    : "";
  const value = openPilotCase({});
  if (out) {
    writeCase(out, value);
    console.log(JSON.stringify({ok: true, path: resolve(out), principles: value.decision.principles?.length || 0}));
  } else {
    console.log(JSON.stringify(value, null, 2));
  }
}
