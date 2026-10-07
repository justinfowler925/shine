#!/usr/bin/env node
/**
 * Enterprise §3 — ClearSpeed Operate numbered constitution in DDR + critic cite gate.
 */
import assert from "node:assert/strict";
import { createDesignPacket } from "../core/design-packet.mjs";
import { OPERATE_DENOISE_CONSTITUTION, buildDdr } from "../core/ddr.mjs";
import {
  assertCriticCitesConstitution,
  assertDdrHasEditionCatalog,
  enforceCriticConstitutionCitation,
  extractConstitutionCitations,
  formatNumberedConstitution,
  listConstitutions,
  loadConstitution,
  operateConstitutionIds,
  resolveOperateConstitution,
  resolveProveConstitution,
  validateConstitution,
} from "../core/constitution.mjs";
import { buildCriticPrompt, heuristicCritic, runReflexion } from "../core/reflexion.mjs";
import { writeCompletionProveReceipt } from "../hooks/receipt.mjs";
import { verifyOperateDdrConstitution } from "./edition.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const doc = loadConstitution("clearspeed-operate");
assert.deepEqual(validateConstitution(doc), []);
assert.equal(doc.edition, "clearspeed");
assert.ok(doc.principles.length >= 7);
assert.equal(doc.principles[0].n, 1);
assert.equal(doc.principles[0].id, "cta-pressure");
assert.deepEqual(
  operateConstitutionIds(doc),
  doc.principles.map((p) => p.id),
);
assert.ok(listConstitutions().some((c) => c.id === "clearspeed-operate"));

const resolved = resolveOperateConstitution({ lane: "saas", mode: "denoise" });
assert.equal(resolved.editionId, "clearspeed-operate");
assert.ok(resolved.principles.every((p) => Number.isInteger(p.n) && p.n >= 1));
assert.ok(formatNumberedConstitution(resolved.principles).includes("1. `cta-pressure`"));

assert.deepEqual([...OPERATE_DENOISE_CONSTITUTION], resolved.constitutionIds);

const ddr = buildDdr({
  job: "Decide Pursue/Review/Dismiss on the next notice",
  lane: "saas",
  mode: "denoise",
  category: "queue",
  primaryCite: "shadcn-queue",
});
assert.equal(ddr.constitutionEdition, "clearspeed-operate");
assert.ok(Array.isArray(ddr.constitution) && ddr.constitution.length >= 7);
assert.equal(ddr.constitution[0].n, 1);
assert.equal(ddr.constitution[0].id, "cta-pressure");
assert.ok(ddr.constitutionIds.includes("restructure-before-repaint"));

const packet = createDesignPacket({
  job: "Decide Pursue/Review/Dismiss on the next notice",
  lane: "saas",
  mode: "denoise",
  category: "queue",
  project: ROOT,
  accept: true,
});
assert.equal(packet.ddr.constitutionEdition, "clearspeed-operate");
assert.equal(packet.ddr.constitution.length, packet.ddr.constitutionIds.length);
assert.ok(packet.ddr.constitution.every((p, i) => p.id === packet.ddr.constitutionIds[i]));

const prompt = buildCriticPrompt({
  goal: "Decide Pursue",
  failures: ["cta-pressure: 2 filled"],
  constitutionIds: packet.ddr.constitutionIds,
  constitutionPrinciples: packet.ddr.constitution,
  ddrId: packet.ddrId,
});
assert.match(prompt, /MUST cite/);
assert.match(prompt, /1\. `cta-pressure`/);
assert.match(prompt, /7\. `restructure-before-repaint`/);

const cited = extractConstitutionCitations(
  { constitutionIds: ["1"], recommendation: "fix CTA pressure" },
  { principles: packet.ddr.constitution, constitutionIds: packet.ddr.constitutionIds },
);
assert.ok(cited.includes("cta-pressure"));

const gateOk = assertCriticCitesConstitution(
  { verdict: "partial", constitutionIds: ["cta-pressure"] },
  { constitutionIds: packet.ddr.constitutionIds, principles: packet.ddr.constitution },
);
assert.equal(gateOk.ok, true);

const gateFail = assertCriticCitesConstitution(
  { verdict: "partial", recommendation: "do something", constitutionIds: [] },
  { constitutionIds: packet.ddr.constitutionIds, principles: packet.ddr.constitution },
);
assert.equal(gateFail.ok, false);

const enforced = enforceCriticConstitutionCitation(
  { verdict: "partial", recommendation: "vague", nextStep: "try again", constitutionIds: [] },
  { constitutionIds: packet.ddr.constitutionIds, principles: packet.ddr.constitution },
);
assert.equal(enforced.verdict, "error");
assert.match(enforced.citationError || enforced.recommendation, /must cite/i);

const heuristic = heuristicCritic({ failures: ["cta-pressure: 2 filled in main"] });
assert.ok(heuristic.constitutionIds.includes("cta-pressure"));

const offline = await runReflexion({
  goal: "Decide Pursue",
  failures: ["cta-pressure: 2 filled primaries in main"],
  ddrId: "ddr_constitution_test",
  constitutionIds: packet.ddr.constitutionIds,
  constitutionPrinciples: packet.ddr.constitution,
  storeLesson: false,
});
assert.equal(offline.verdict, "partial");
assert.ok(offline.constitutionCited?.includes("cta-pressure"));
assert.equal(offline.constitutionEdition, "clearspeed-operate");

const llmMissingCite = await runReflexion({
  goal: "Decide Pursue",
  failures: ["cta-pressure: 2 filled"],
  ddrId: "ddr_constitution_llm",
  constitutionIds: packet.ddr.constitutionIds,
  constitutionPrinciples: packet.ddr.constitution,
  storeLesson: false,
  callCritic: async () =>
    JSON.stringify({
      verdict: "partial",
      recommendation: "Fix the buttons somehow",
      nextStep: "Change styles",
      constitutionIds: [],
      antiPatternIds: [],
      lesson: "uncited",
    }),
});
assert.equal(llmMissingCite.verdict, "error");
assert.match(llmMissingCite.recommendation || "", /must cite/i);

const llmNumberCite = await runReflexion({
  goal: "Decide Pursue",
  failures: ["cta-pressure: 2 filled"],
  ddrId: "ddr_constitution_num",
  constitutionIds: packet.ddr.constitutionIds,
  constitutionPrinciples: packet.ddr.constitution,
  storeLesson: false,
  callCritic: async () =>
    JSON.stringify({
      verdict: "partial",
      recommendation: "Demote peers per principle 1",
      nextStep: "Apply cta-budget",
      constitutionIds: ["1"],
      antiPatternIds: ["competing-filled-ctas"],
      lesson: "one primary",
    }),
});
assert.equal(llmNumberCite.verdict, "partial");
assert.ok(llmNumberCite.constitutionCited.includes("cta-pressure"));

// Edition verify bite: DDR must carry the full clearspeed-operate catalog.
assertDdrHasEditionCatalog(packet.ddr);
const editionOk = verifyOperateDdrConstitution(packet.ddr);
assert.equal(editionOk.status, "passed");
assert.equal(editionOk.constitutionIds.length, packet.ddr.constitutionIds.length);

const omitEmpty = verifyOperateDdrConstitution({
  ddrId: "ddr_omit_empty",
  constitutionIds: [],
  constitutionEdition: "clearspeed-operate",
});
assert.equal(omitEmpty.status, "failed");
assert.match(omitEmpty.reason, /omits constitutionIds/);

const omitPartial = verifyOperateDdrConstitution({
  ddrId: "ddr_omit_partial",
  constitutionIds: ["cta-pressure", "dual-focal-ban"],
  constitutionEdition: "clearspeed-operate",
});
assert.equal(omitPartial.status, "failed");
assert.match(omitPartial.reason, /omits catalog constitutionIds/);
assert.match(omitPartial.reason, /prove-mandatory/);

assert.throws(
  () =>
    assertDdrHasEditionCatalog({
      ddrId: "ddr_no_ids",
      constitutionEdition: "clearspeed-operate",
    }),
  /omits constitutionIds/,
);

// Prove receipt wiring: saas defaults to full catalog; stamps completion store.
const proveResolved = resolveProveConstitution({ lane: "saas" });
assert.equal(proveResolved.constitutionEdition, "clearspeed-operate");
assert.deepEqual(proveResolved.constitutionIds, operateConstitutionIds());

const provePartial = resolveProveConstitution({
  lane: "saas",
  constitutionIds: "cta-pressure,dual-focal-ban",
});
assert.deepEqual(provePartial.constitutionIds, ["cta-pressure", "dual-focal-ban"]);

const receiptDir = mkdtempSync(join(tmpdir(), "shine-constitution-receipt-"));
process.env.SHINE_COMPLETION_RECEIPT = join(receiptDir, "completion.json");
try {
  const checks = Object.fromEntries(
    ["accessibility", "styling", "layout", "interactions", "referenceValidity", "visualComparison", "buildBinding"].map(
      (k) => [k, { status: "passed" }],
    ),
  );
  const stamped = writeCompletionProveReceipt({
    cite: "shadcn-queue",
    lane: "saas",
    screen: "queue",
    checks,
    ddrId: packet.ddrId,
    constitutionIds: proveResolved.constitutionIds,
    constitutionEdition: proveResolved.constitutionEdition,
  });
  assert.equal(stamped.ddrLinked, true);
  assert.equal(stamped.constitutionLinked, true);
  assert.deepEqual(stamped.constitutionIds, proveResolved.constitutionIds);
  assert.equal(stamped.constitutionEdition, "clearspeed-operate");
} finally {
  delete process.env.SHINE_COMPLETION_RECEIPT;
  rmSync(receiptDir, { recursive: true, force: true });
}

console.log(
  "constitution PASS: numbered clearspeed-operate · DDR constitution[] · critic must cite (id|n) · prove receipt + edition catalog bite",
);
