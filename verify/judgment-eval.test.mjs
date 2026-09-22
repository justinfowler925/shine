import assert from "node:assert/strict";
import {evaluateJudgment, recommend, scoreRecommendation} from "../benchmark/judgment-eval.mjs";
import {loadPrinciples} from "../knowledge/retrieve.mjs";

assert.ok(loadPrinciples().length >= 20, `expected >=20 principles, found ${loadPrinciples().length}`);

const report = evaluateJudgment();
assert.equal(report.total, 8);
assert.ok(report.meetsMachineFloor, `machine floor 7/8 not met: ${JSON.stringify(report.results.filter((r) => !r.ok))}`);
assert.ok(report.passed >= 7);

const healthy = recommend("Audit a healthy support queue that already meets task — recommend changes only if evidenced");
assert.equal(healthy.verdict, "no-change");
const scored = scoreRecommendation(healthy, {
  verdict: "no-change",
  mustHitPrincipleIds: ["no-change-when-sound"],
  modality: "ui",
});
assert.equal(scored.ok, true);

console.log(`judgment-eval.test.mjs: ok (${report.passed}/8)`);
