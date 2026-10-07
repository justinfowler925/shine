#!/usr/bin/env node
/**
 * N0 + DDR bites: denoise skill mode refuses without category, DDR gates Actor,
 * denoise.md is loadable, constitution IDs present.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDesignPacket, normalizePacketCategory } from "../core/design-packet.mjs";
import { acceptDdr, assertDdrAccepted, refuseDdr, OPERATE_DENOISE_CONSTITUTION } from "../core/ddr.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const denoiseMd = join(ROOT, "skill/references/denoise.md");
assert.ok(existsSync(denoiseMd), "skill/references/denoise.md must exist");
const denoiseBody = readFileSync(denoiseMd, "utf8");
assert.match(denoiseBody, /CTA budget|cta-budget/i);
assert.match(denoiseBody, /dual-focal|collapse-peer-grids/i);
assert.match(denoiseBody, /xor-saved-view|XOR recipe|shared DataGrid/i);
assert.match(denoiseBody, /kpi-collapse|KPI soup/i);
assert.match(denoiseBody, /primaryTaskCheck/);
assert.match(denoiseBody, /No polish|no polish/i);

assert.equal(normalizePacketCategory("queue"), "datagrid");
assert.equal(normalizePacketCategory("settings"), "form");

assert.throws(
  () => createDesignPacket({ job: "Fix the design and UX problems", lane: "saas", mode: "denoise" }),
  /denoise refuses without --category/,
);
assert.throws(
  () =>
    createDesignPacket({
      job: "Decide Pursue/Review/Dismiss on the next notice",
      lane: "saas",
      mode: "denoise",
    }),
  /denoise refuses without --category/,
);

const proposed = createDesignPacket({
  job: "Decide Pursue/Review/Dismiss on the next notice",
  lane: "saas",
  mode: "denoise",
  category: "queue",
  project: ROOT,
});
assert.equal(proposed.mode, "denoise");
assert.equal(proposed.category, "datagrid");
assert.equal(proposed.ddr.status, "proposed");
assert.equal(proposed.editing.allowed, false);
assert.match(proposed.editing.instruction, /DDR not accepted|refuse denoise/i);
assert.ok(proposed.ddr.ddrId.startsWith("ddr_"));
assert.equal(proposed.ddrId, proposed.ddr.ddrId);
assert.ok(proposed.denoise?.required);
assert.match(proposed.denoise.reference, /denoise\.md$/);
assert.ok(proposed.procedure.phases.includes("denoise"));
for (const id of ["cta-pressure", "dual-focal-ban", "kpi-soup-off-path", "prove-mandatory"]) {
  assert.ok(proposed.ddr.constitutionIds.includes(id), id);
}
assert.equal(proposed.ddr.constitutionEdition, "clearspeed-operate");
assert.ok(Array.isArray(proposed.ddr.constitution) && proposed.ddr.constitution.length >= 7);
assert.equal(proposed.ddr.constitution[0].n, 1);
assert.equal(proposed.ddr.constitution[0].id, "cta-pressure");
assert.equal(proposed.ddr.ctaBudget, 1);
assert.throws(() => assertDdrAccepted(proposed.ddr), /refuse implement|status is proposed/);

const accepted = createDesignPacket({
  job: "Decide Pursue/Review/Dismiss on the next notice",
  lane: "saas",
  mode: "denoise",
  category: "queue",
  project: ROOT,
  accept: true,
});
assert.equal(accepted.ddr.status, "accepted");
assert.equal(accepted.editing.allowed, true);
assert.match(accepted.editing.instruction, /No polish|primaryTaskCheck/i);
assertDdrAccepted(accepted.ddr);

const dir = mkdtempSync(join(tmpdir(), "shine-ddr-"));
try {
  const packetPath = join(dir, "shine-packet.json");
  writeFileSync(packetPath, JSON.stringify(proposed, null, 2));
  const run = spawnSync(process.execPath, [join(ROOT, "core/ddr.mjs"), "accept", packetPath], {
    encoding: "utf8",
  });
  assert.equal(run.status, 0, run.stderr);
  const after = JSON.parse(readFileSync(packetPath, "utf8"));
  assert.equal(after.ddr.status, "accepted");
  assert.equal(after.editing.allowed, true);
  const check = spawnSync(process.execPath, [join(ROOT, "core/ddr.mjs"), "check", packetPath], {
    encoding: "utf8",
  });
  assert.equal(check.status, 0, check.stderr);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const skill = readFileSync(join(ROOT, "skill/SKILL.md"), "utf8");
assert.match(skill, /denoise/);
assert.match(skill, /references\/denoise\.md/);

assert.ok(OPERATE_DENOISE_CONSTITUTION.includes("cta-pressure"));
const acceptedDdr = acceptDdr({ ...proposed.ddr, status: "proposed" });
assert.equal(acceptedDdr.status, "accepted");
const refusedDdr = refuseDdr({ ...proposed.ddr, status: "proposed" }, { reason: "ambiguous category" });
assert.equal(refusedDdr.status, "refused");
assert.match(refusedDdr.refuseReason || "", /ambiguous/);
assert.throws(() => acceptDdr(refusedDdr), /refused/);

console.log(
  "denoise-packet PASS: denoise.md · category refuse · DDR proposed→accepted|refused · numbered constitutionIds · --accept gate",
);
