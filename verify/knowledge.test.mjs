import assert from "node:assert/strict";
import {loadPrinciples, retrievePrinciples, validatePrinciple} from "../knowledge/retrieve.mjs";

const principles = loadPrinciples();
assert.ok(principles.length >= 30, `expected at least 30 seed principles, found ${principles.length}`);
for (const item of principles) assert.deepEqual(validatePrinciple(item), []);

const hits = retrievePrinciples("Alexis chart interrupt selection voice why this");
assert.ok(hits.some((h) => h.id === "shared-selection-for-multimodal"));

const owners = retrievePrinciples("reuse product DataGrid owners before installing a new block");
assert.ok(owners.some((h) => h.id === "product-owners-before-catalog"));

const noChange = retrievePrinciples("healthy queue audit should not invent defects");
assert.ok(noChange.some((h) => h.id === "no-change-when-sound"));

console.log("knowledge.test.mjs: ok");
