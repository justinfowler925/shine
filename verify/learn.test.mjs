#!/usr/bin/env node
/**
 * Doctor bite — repertoire / episodic learn stub.
 * Proven job→cite→kit + restructureHints; episodes require ddrId + prove fail.
 * Version bump is doctor-gated. No preference / RLAIF.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_STORE,
  PREFERENCE_KEYS,
  REPERTOIRE_SCHEMA,
  commitLearning,
  emptyStore,
  episodesForDdr,
  loadRepertoire,
  matchRepertoire,
  validateEpisode,
  validateRepertoireEntry,
  validateStore,
} from "../core/learn.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");

// Seeded store validates and bans preference language in the bar.
const seeded = loadRepertoire(DEFAULT_STORE);
assert.equal(seeded.$schema, REPERTOIRE_SCHEMA);
assert.equal(seeded.version, 1);
assert.match(seeded.bar, /no preference/i);
assert.ok(seeded.entries.length >= 2, "seeded repertoire entries");
assert.ok(seeded.episodes.length >= 1, "seeded episodic lesson");
assert.equal(validateStore(seeded).length, 0);

for (const e of seeded.entries) {
  assert.equal(validateRepertoireEntry(e).length, 0, e.id);
  assert.ok(e.restructureHints.some((h) => String(h).startsWith("restructure:")), e.id);
}
for (const ep of seeded.episodes) {
  assert.equal(validateEpisode(ep).length, 0, ep.id);
  assert.ok(ep.ddrId.startsWith("ddr_"));
}

// Match stub finds the Sled queue recipe.
const hits = matchRepertoire("Decide Pursue/Review/Dismiss on the next notice", {
  category: "queue",
});
assert.ok(hits.length >= 1);
assert.equal(hits[0].entry.primaryCite, "shadcn-queue");
assert.ok(hits[0].entry.kitRecipe.length >= 8);

assert.equal(episodesForDdr("ddr_seed_sled_queue_cta").length, 1);
assert.equal(episodesForDdr("ddr_missing").length, 0);

// Refuse commit without doctor gate.
const dir = mkdtempSync(join(tmpdir(), "shine-learn-"));
const storePath = join(dir, "repertoire.json");
writeFileSync(storePath, JSON.stringify(emptyStore(), null, 2) + "\n");

assert.throws(
  () =>
    commitLearning({
      storePath,
      doctorBiteOk: false,
      entry: {
        job: "Decide Pursue on the next notice",
        category: "queue",
        primaryCite: "shadcn-queue",
        kitRecipe: "shadcn-queue / DataGrid recipe",
        restructureHints: ["restructure:cta-budget"],
        ddrId: "ddr_test_learn_001",
        proveFailCategories: ["cta-pressure"],
      },
    }),
  /doctorBiteOk/,
);

// Refuse episode without ddrId / fail category.
assert.throws(
  () =>
    commitLearning({
      storePath,
      doctorBiteOk: true,
      episode: {
        ddrId: "",
        failCategory: "cta-pressure",
        lesson: "Apply cta-budget",
        verdict: "partial",
      },
    }),
  /ddrId/,
);

assert.throws(
  () =>
    commitLearning({
      storePath,
      doctorBiteOk: true,
      episode: {
        ddrId: "ddr_test_learn_001",
        failCategory: "",
        lesson: "Apply cta-budget",
        verdict: "partial",
      },
    }),
  /failCategory/,
);

// Refuse preference / RLAIF fields on entry.
assert.ok(PREFERENCE_KEYS.includes("rlaif"));
assert.throws(
  () =>
    commitLearning({
      storePath,
      doctorBiteOk: true,
      entry: {
        job: "Decide Pursue on the next notice",
        category: "queue",
        primaryCite: "shadcn-queue",
        kitRecipe: "shadcn-queue / DataGrid recipe",
        restructureHints: ["restructure:cta-budget"],
        ddrId: "ddr_test_learn_001",
        proveFailCategories: ["cta-pressure"],
        rlaif: { reward: 1 },
      },
    }),
  /preference|rlaif/i,
);

// Doctor-gated bump: version 1 → 2 with entry + episode.
const committed = commitLearning({
  storePath,
  doctorBiteOk: true,
  at: "2026-10-07T16:00:00.000Z",
  entry: {
    job: "Decide Pursue on the next notice",
    category: "queue",
    primaryCite: "shadcn-queue",
    kitRecipe: "shadcn-queue / DataGrid recipe; TanStack state",
    restructureHints: ["restructure:cta-budget", "restructure:set-focal"],
    ddrId: "ddr_test_learn_001",
    proveFailCategories: ["cta-pressure"],
    validatedBy: "verify/learn.test.mjs",
  },
  episode: {
    ddrId: "ddr_test_learn_001",
    failCategory: "cta-pressure",
    lesson: "One filled Pursue; demote Assign before any paint pass.",
    verdict: "partial",
    nextStep: "Apply cta-budget maxFilled=1",
  },
});

assert.equal(committed.bumped, true);
assert.equal(committed.previousVersion, 1);
assert.equal(committed.version, 2);
assert.equal(committed.entry.primaryCite, "shadcn-queue");
assert.equal(committed.episode.ddrId, "ddr_test_learn_001");

const reloaded = loadRepertoire(storePath);
assert.equal(reloaded.version, 2);
assert.equal(reloaded.entries.length, 1);
assert.equal(reloaded.episodes.length, 1);
assert.match(readFileSync(storePath, "utf8"), /shine-repertoire\/v1/);

// Doctor wiring: learn bite registered next to skill A/B.
const doctorSrc = readFileSync(join(SHINE, "verify/doctor.mjs"), "utf8");
assert.match(doctorSrc, /verify\/learn\.test\.mjs/);
assert.match(doctorSrc, /repertoire|episodic learn/i);

rmSync(dir, { recursive: true, force: true });

console.log(
  "learn PASS: repertoire job→cite→kit+hints · episodic ddrId · doctor-gated bump · no preference/RLAIF",
);
