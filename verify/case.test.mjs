import assert from "node:assert/strict";
import {mkdtempSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {
  caseStatuses,
  checkpoint,
  loadExpertBriefs,
  readCase,
  seedCase,
  stages,
  validateCase,
  writeCase,
} from "../core/case.mjs";

const blank = seedCase({job: "short"});
assert.match(validateCase(blank).join(" "), /job is missing/);

const seeded = seedCase({
  job: "Records inspect edit persist through consumer adapter",
  category: "record",
  pilotId: "records-inspect-edit-persist",
});
assert.equal(seeded.stage, "understand");
assert.equal(seeded.status, "open");
assert.deepEqual(validateCase(seeded), []);
assert.ok(stages.includes("deliver"));
assert.ok(caseStatuses.has("delivered"));

const moved = checkpoint(seeded, {
  stage: "diagnose",
  summary: "Named primary task and inspected the existing queue sibling",
  artifact: "shine-diagnosis.json",
});
assert.equal(moved.stage, "diagnose");
assert.equal(moved.checkpoints.length, 1);
assert.deepEqual(validateCase(moved), []);

const delivered = {
  ...moved,
  status: "delivered",
  stage: "deliver",
  evidence: {checks: ["usability"], unknowns: [], sourceSha: "12dd271", buildId: "local"},
};
assert.deepEqual(validateCase(delivered), []);
const incomplete = {...delivered, evidence: {checks: [], unknowns: [], sourceSha: "", buildId: ""}};
assert.match(validateCase(incomplete).join(" "), /sourceSha/);

const dir = mkdtempSync(join(tmpdir(), "shine-case-"));
const file = join(dir, "case.json");
writeCase(file, moved);
assert.match(readCase(file).hash, /^[a-f0-9]{64}$/);

const briefs = loadExpertBriefs();
assert.equal(briefs.learning.length, 12);
assert.equal(briefs.heldOut.length, 8);
assert.ok(briefs.learning.some((b) => b.id === "learn-record-edit-persist"));
assert.ok(briefs.heldOut.every((b) => b.sealedUntil === "phase-5"));

console.log("case.test.mjs: ok");
