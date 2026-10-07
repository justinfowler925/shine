#!/usr/bin/env node
/**
 * Doctor bite — reflexion host doctorBiteOk + observedCite wiring when cite-ban
 * fires. Proves Critic≠Actor host / denoise planRepairFromMeasure pass-through
 * commits cite bans (not only direct runReflexion test calls).
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  planRepairFromMeasure,
  runCriticActorHostRound,
} from "../core/critic-actor-host.mjs";
import {
  emptyStore,
  isCiteFailCategory,
  loadRepertoire,
  observedCiteFromFailures,
} from "../core/learn.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const hostSrc = readFileSync(join(ROOT, "core/critic-actor-host.mjs"), "utf8");
const loopSrc = readFileSync(join(ROOT, "verify/denoise-loop.mjs"), "utf8");
const learnSrc = readFileSync(join(ROOT, "core/learn.mjs"), "utf8");
const reflexionSrc = readFileSync(join(ROOT, "core/reflexion.mjs"), "utf8");

let passed = 0;
const bite = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

const CITE_FAIL =
  "cite-honesty: page cite shadcn-dashboard-01 does not match category queue — rebind cite / fix packet --category — anti-pattern:wrong-cite-category";

await bite("observedCiteFromFailures parses page cite", () => {
  assert.equal(
    observedCiteFromFailures([CITE_FAIL]),
    "shadcn-dashboard-01",
  );
  assert.equal(
    observedCiteFromFailures(["cta-pressure: 2 filled in main"]),
    "",
  );
  assert.ok(isCiteFailCategory(CITE_FAIL));
});

await bite("host round without doctorBiteOk infers but does not commit", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shine-reflexion-cite-dry-"));
  const storePath = join(dir, "repertoire.json");
  writeFileSync(storePath, JSON.stringify(emptyStore(), null, 2) + "\n");
  const round = await runCriticActorHostRound({
    goal: "Decide Pursue on the next notice",
    failures: [CITE_FAIL],
    ddrId: "ddr_test_reflexion_cite_host_dry",
    constitutionIds: ["cite-honesty"],
    doctorBiteOk: false,
    observedCite: "shadcn-dashboard-01",
    expectedCite: "shadcn-queue",
    category: "queue",
    edition: "clearspeed-operate",
    learnStorePath: storePath,
  });
  assert.ok(round.reflexion.inferredCiteBan, "inferred ban attached");
  assert.equal(round.reflexion.inferredCiteBan.citeId, "shadcn-dashboard-01");
  assert.equal(round.reflexion.citeBanLearn, undefined);
  const reloaded = loadRepertoire(storePath);
  assert.equal(reloaded.citeBans.length, 0, "no commit without doctorBiteOk");
  rmSync(dir, { recursive: true, force: true });
});

await bite("host round with doctorBiteOk + observedCite commits cite ban", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shine-reflexion-cite-host-"));
  const storePath = join(dir, "repertoire.json");
  writeFileSync(storePath, JSON.stringify(emptyStore(), null, 2) + "\n");
  const round = await runCriticActorHostRound({
    goal: "Decide Pursue on the next notice",
    failures: [CITE_FAIL],
    ddrId: "ddr_test_reflexion_cite_host_001",
    constitutionIds: ["cite-honesty"],
    doctorBiteOk: true,
    observedCite: "shadcn-dashboard-01",
    expectedCite: "shadcn-queue",
    category: "queue",
    edition: "clearspeed-operate",
    learnStorePath: storePath,
  });
  assert.ok(round.reflexion.citeBanLearn, "citeBanLearn committed via host");
  assert.equal(round.reflexion.citeBanLearn.skipped, false);
  assert.equal(round.reflexion.citeBanLearn.citeBan.citeId, "shadcn-dashboard-01");
  assert.equal(round.reflexion.citeBanLearn.citeBan.ddrId, "ddr_test_reflexion_cite_host_001");
  assert.ok(round.reflexion.citeBanLearn.episode, "episodic ban with demotion");
  const reloaded = loadRepertoire(storePath);
  assert.ok(
    reloaded.citeBans.some((b) => b.ddrId === "ddr_test_reflexion_cite_host_001"),
  );
  assert.ok(
    reloaded.episodes.some(
      (e) => e.ddrId === "ddr_test_reflexion_cite_host_001" && e.failCategory === "cite-honesty",
    ),
  );
  rmSync(dir, { recursive: true, force: true });
});

await bite("planRepairFromMeasure commits when cite-ban fires with doctor opts", async () => {
  const dir = mkdtempSync(join(tmpdir(), "shine-reflexion-cite-plan-"));
  const storePath = join(dir, "repertoire.json");
  writeFileSync(storePath, JSON.stringify(emptyStore(), null, 2) + "\n");
  const observed = observedCiteFromFailures([CITE_FAIL]);
  assert.equal(observed, "shadcn-dashboard-01");
  const planned = await planRepairFromMeasure({
    goal: "Decide Pursue on the next notice",
    failures: [CITE_FAIL],
    ddrId: "ddr_test_reflexion_cite_plan_001",
    constitutionIds: ["cite-honesty"],
    doctorBiteOk: true,
    observedCite: observed,
    expectedCite: "shadcn-queue",
    category: "queue",
    edition: "clearspeed-operate",
    learnStorePath: storePath,
  });
  assert.equal(planned.phase, "measure-repair-plan");
  assert.ok(planned.reflexion.citeBanLearn?.citeBan);
  assert.equal(planned.reflexion.citeBanLearn.citeBan.citeId, "shadcn-dashboard-01");
  rmSync(dir, { recursive: true, force: true });
});

await bite("wiring: host + denoise-loop + learn + doctor", () => {
  assert.match(learnSrc, /observedCiteFromFailures/);
  assert.match(hostSrc, /doctorBiteOk/);
  assert.match(hostSrc, /observedCite/);
  assert.match(hostSrc, /learnStorePath/);
  assert.match(reflexionSrc, /commitCiteBansFromProveFail/);
  assert.match(loopSrc, /observedCiteFromFailures/);
  assert.match(loopSrc, /doctorBiteOk/);
  assert.match(loopSrc, /isCiteFailCategory/);
  assert.match(doctorSrc, /reflexion-cite-doctor-bite\.mjs/);
});

console.log(
  `reflexion-cite-doctor-bite: ok (${passed} bites — host doctorBiteOk+observedCite · planRepair · wiring)`,
);
