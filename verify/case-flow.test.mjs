import assert from "node:assert/strict";
import {mkdtempSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {attachKnowledge, openPilotCase} from "../core/case-flow.mjs";
import {readCase, seedCase, writeCase} from "../core/case.mjs";
import {loadPrinciples} from "../knowledge/retrieve.mjs";

assert.ok(loadPrinciples().length >= 12, "Phase 0 continue target: at least 12 principles");

const opened = openPilotCase({});
assert.equal(opened.stage, "choose");
assert.ok(opened.checkpoints.length >= 2);
assert.ok(Array.isArray(opened.decision.principles));
assert.ok(opened.decision.principles.length >= 1, "records pilot job should retrieve principles");

const dir = mkdtempSync(join(tmpdir(), "shine-case-flow-"));
const file = join(dir, "case.json");
writeCase(file, opened);
assert.equal(readCase(file).decision.principles.length, opened.decision.principles.length);

const bare = seedCase({job: "zzzz with no cue tokens whatsoever here"});
const attached = attachKnowledge(bare);
assert.equal(attached.stage, "choose");

console.log("case-flow.test.mjs: ok");
