#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { findUntitledExamples, validateUntitledCatalog } from "../corpus/untitledui.mjs";

const SHINE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(SHINE, "corpus/untitledui-examples.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(SHINE, "node_modules/untitledui/package.json"), "utf8"));

assert.equal(pkg.version, "0.1.64", "official CLI package is not pinned to the audited release");
assert.equal(pkg.license, "MIT", "official CLI package license changed");
assert.equal(pkg.bin?.untitledui, "dist/index.mjs", "official CLI binary is missing");
assert.deepEqual(catalog.counts, { demoFiles: 36, storyFiles: 39, examples: 392, renderableStories: 187 });
assert.deepEqual(validateUntitledCatalog(catalog), []);
assert.equal(catalog.upstream.sha, "d29a2adf6909e5aaeb234bccf82dcffeb67fdb2e");

const queue = findUntitledExamples("queue table", 12, catalog);
assert.ok(queue.some((item) => item.sourceFile.endsWith("application/table/table.demo.tsx")), "table search did not reach the table examples");
const dashboard = findUntitledExamples("dashboard analytics", 12, catalog);
assert.ok(dashboard.some((item) => item.sourceFile.includes("application/charts/")), "dashboard search did not reach chart examples");

const seeded = structuredClone(catalog);
seeded.examples[1].id = seeded.examples[0].id;
seeded.counts.examples = 0;
const seededErrors = validateUntitledCatalog(seeded);
assert.ok(seededErrors.some((error) => error.includes("duplicate ids")), "duplicate-id gate did not bite");
assert.ok(seededErrors.some((error) => error.includes("count mismatch")), "zero-denominator gate did not bite");

console.log("untitledui PASS: CLI 0.1.64; 392/392 public examples indexed; seeded duplicate + zero count rejected");
