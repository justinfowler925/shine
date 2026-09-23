import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
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

const bad = structuredClone(a);
bad.reviews[0].dimensions.accessibility = "critical-fail";
bad.reviews[0].overall = "usable";
assert.match(validateReviewSheet(bad, rubric).join(" "), /critical/);

console.log(`human-review.test.mjs: ok (${summary.usableCount}/8 usable)`);
