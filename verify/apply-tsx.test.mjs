#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyTsxRestructure, ctaBudgetTsx, rebindCiteTsx, setFocalTsx } from "./restructure/apply-tsx.mjs";
import { buildRestructurePlan } from "./restructure/schema.mjs";

const FIX = join(dirname(fileURLToPath(import.meta.url)), "fixtures/denoise/tsx");
const dual = readFileSync(join(FIX, "queue-dual-cta.tsx"), "utf8");
const settings = readFileSync(join(FIX, "settings-wrong-cite.tsx"), "utf8");

const cta = ctaBudgetTsx(dual, { maxFilled: 1, preferLabels: ["Pursue"] });
assert.match(cta, /variant="default">Pursue/);
assert.match(cta, /variant="outline">Assign lead/);
assert.ok((cta.match(/variant="default"/g) || []).length === 1 || /Open queue/.test(cta));

const rebound = rebindCiteTsx(settings, { from: "shadcn-queue", to: "shadcn-settings" });
assert.match(rebound, /data-cite="shadcn-settings"/);

const focal = setFocalTsx(dual, {});
assert.match(focal, /data-region="focal"/);

const plan = buildRestructurePlan({
  job: "Decide Pursue",
  category: "queue",
  ops: [
    { op: "cta-budget", maxFilled: 1, preferLabels: ["Pursue"] },
    { op: "set-focal" },
    { op: "collapse-peer-grids", mode: "xor-saved-view" },
  ],
});
const result = applyTsxRestructure(dual, plan);
assert.ok(result.applied.includes("cta-budget"));
assert.ok(result.applied.includes("set-focal"));
assert.ok(result.plans.length >= 1, "dual-grid must be plan-only");
assert.equal(result.humanGate, true);
assert.match(result.plans[0], /collapse-peer-grids/);
assert.ok(!/delete|removeChild|Dangerously/i.test(result.source));

const settingsPlan = buildRestructurePlan({
  job: "Fix or pause a matching recipe",
  category: "settings",
  citePrimary: "shadcn-settings",
  ops: [{ op: "rebind-cite", from: "shadcn-queue", to: "shadcn-settings" }],
});
const settingsResult = applyTsxRestructure(settings, settingsPlan);
assert.ok(settingsResult.applied.includes("rebind-cite"));

console.log("apply-tsx PASS: cta-budget · set-focal · rebind-cite · dual-grid plan-only");
