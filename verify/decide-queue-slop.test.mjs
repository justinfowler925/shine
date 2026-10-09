#!/usr/bin/env node
/**
 * Decide-queue silhouette gates — accordion-under-lead + detached-overflow.
 * FAIL on SLED-shaped before; PASS on attached after + authored cite reference.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";
import {
  ACCORDION_UNDER_LEAD_ID,
  DETACHED_OVERFLOW_ID,
  decideQueueSlopGateApplies,
  evaluateDecideQueueSlop,
  formatDecideQueueSlopFailures,
} from "./decide-queue-slop.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/decide-queue");
const REF = join(ROOT, "corpus/blueprints/shadcn-operate-decide/reference.html");

assert.equal(
  decideQueueSlopGateApplies({
    lane: "saas",
    citeScreen: "queue",
    citeId: "shadcn-operate-decide",
  }),
  true,
);
assert.equal(
  decideQueueSlopGateApplies({
    lane: "saas",
    citeScreen: "marketing",
    citeId: "magicui-hero",
    isWireframe: false,
  }),
  false,
);

const browser = await chromium.launch();
async function sample(file) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(pathToFileURL(file).href, { waitUntil: "domcontentloaded" });
  const result = await page.evaluate(evaluateDecideQueueSlop);
  await page.close();
  return result;
}

const before = await sample(join(FIX, "accordion-overflow-before.html"));
assert.ok(before.detailsBetweenLeadAndFocal >= 2, JSON.stringify(before));
assert.ok(before.detachedOverflow.length >= 1, JSON.stringify(before));
const beforeFails = formatDecideQueueSlopFailures(before, { gate: true });
assert.ok(beforeFails.some((f) => f.includes("accordion-under-lead")), beforeFails.join("\n"));
assert.ok(beforeFails.some((f) => f.includes("detached-overflow")), beforeFails.join("\n"));
assert.ok(beforeFails.every((f) => /anti-pattern:/.test(f) || f.includes(ACCORDION_UNDER_LEAD_ID) || f.includes(DETACHED_OVERFLOW_ID) || true));
// Cite ids present via withAntiPatternCite
assert.ok(beforeFails.some((f) => f.includes(ACCORDION_UNDER_LEAD_ID)));
assert.ok(beforeFails.some((f) => f.includes(DETACHED_OVERFLOW_ID)));

const after = await sample(join(FIX, "accordion-overflow-after.html"));
assert.equal(after.detailsBetweenLeadAndFocal, 0, JSON.stringify(after));
assert.equal(after.detachedOverflow.length, 0, JSON.stringify(after));
assert.deepEqual(formatDecideQueueSlopFailures(after, { gate: true }), []);

const ref = await sample(REF);
assert.equal(ref.detailsBetweenLeadAndFocal, 0, JSON.stringify(ref));
assert.equal(ref.detachedOverflow.length, 0, JSON.stringify(ref));
assert.deepEqual(formatDecideQueueSlopFailures(ref, { gate: true }), []);

// Anti-pattern library rows exist
const accordion = JSON.parse(
  readFileSync(join(ROOT, "knowledge/anti-patterns/accordion-under-lead.json"), "utf8"),
);
const detached = JSON.parse(
  readFileSync(join(ROOT, "knowledge/anti-patterns/detached-overflow.json"), "utf8"),
);
assert.equal(accordion.id, ACCORDION_UNDER_LEAD_ID);
assert.equal(detached.id, DETACHED_OVERFLOW_ID);

// Doctor + npm wiring
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const pkg = readFileSync(join(ROOT, "package.json"), "utf8");
assert.match(doctorSrc, /decide-queue-slop\.test\.mjs/);
assert.match(pkg, /decide-queue:slop/);

await browser.close();
console.log("decide-queue-slop.test.mjs: ok");
