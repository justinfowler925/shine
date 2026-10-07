import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {emitBlindedPackets} from "../benchmark/judgment-eval.mjs";
import {loadRubric, summarizeReviews, validateReviewSheet} from "../benchmark/judgment/human-review.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rubric = loadRubric();
assert.equal(rubric.dimensions.length, 5);
assert.equal(rubric.passRule.minimumUsableWithoutMajorRedesign, 7);

const a = JSON.parse(readFileSync(join(root, "benchmark/judgment/fixtures/reviewer-a.json"), "utf8"));
const b = JSON.parse(readFileSync(join(root, "benchmark/judgment/fixtures/reviewer-b.json"), "utf8"));
assert.deepEqual(validateReviewSheet(a, rubric), []);
assert.deepEqual(validateReviewSheet(b, rubric), []);

const summary = summarizeReviews([a, b], rubric);
assert.equal(summary.variants, 8);
assert.ok(summary.meetsHumanFloor, `human floor not met: ${summary.usableCount}/8`);
assert.ok(Array.isArray(summary.disagreements));

const bad = structuredClone(a);
bad.reviews[0].dimensions.accessibility = "critical-fail";
bad.reviews[0].overall = "usable";
assert.match(validateReviewSheet(bad, rubric).join(" "), /critical/);

const {packets, key} = emitBlindedPackets();
assert.equal(packets.packets.length, 8);
assert.equal(key.map.length, 8);
assert.equal(packets.packets[0].packetId, "R1");
assert.equal(key.map[0].variantId, "j1-no-change-queue");
assert.ok(!("expected" in packets.packets[0]));
assert.ok(packets.packets[0].recommendation?.verdict);

console.log(`human-review.test.mjs: ok (${summary.usableCount}/8 usable; blinded emit 8)`);
