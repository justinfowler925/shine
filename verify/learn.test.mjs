#!/usr/bin/env node
/**
 * Doctor bite — repertoire / episodic / cite-ban / sibling-prefer learn.
 * Proven job→cite→kit + restructureHints; episodes require ddrId + prove fail.
 * Cite bans + edition anti-cites write only after real cite-related prove fails.
 * Sibling prefs persist when cite/kit resolves via edition siblings (next packet prefer).
 * Version bump is doctor-gated. No preference / RLAIF.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CITE_FAIL_CATEGORIES,
  DEFAULT_STORE,
  PREFERENCE_KEYS,
  REPERTOIRE_SCHEMA,
  SIBLING_LEARN_FAIL_CATEGORY,
  citeBansFor,
  commitCiteBansFromProveFail,
  commitLearning,
  commitSiblingLearnFromResolve,
  editionAntiCitesFor,
  emptyStore,
  episodesForDdr,
  inferCiteBansFromProveFail,
  inferSiblingLearnFromResolve,
  loadRepertoire,
  matchRepertoire,
  siblingPrefsFor,
  validateCiteBan,
  validateEditionAntiCite,
  validateEpisode,
  validateRepertoireEntry,
  validateSiblingPref,
  validateStore,
} from "../core/learn.mjs";
import { resolveEditionSibling } from "../core/edition-siblings.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");

// Seeded store validates and bans preference language in the bar.
const seeded = loadRepertoire(DEFAULT_STORE);
assert.equal(seeded.$schema, REPERTOIRE_SCHEMA);
assert.equal(seeded.version, 1);
assert.match(seeded.bar, /no preference/i);
assert.ok(seeded.entries.length >= 2, "seeded repertoire entries");
assert.ok(seeded.episodes.length >= 1, "seeded episodic lesson");
assert.ok(seeded.citeBans.length >= 2, "seeded operate demotions");
assert.ok(seeded.editionAntiCites.length >= 1, "seeded edition anti-cites");
assert.ok(seeded.siblingPrefs.length >= 1, "seeded sibling prefs");
assert.equal(validateStore(seeded).length, 0);

for (const e of seeded.entries) {
  assert.equal(validateRepertoireEntry(e).length, 0, e.id);
  assert.ok(e.restructureHints.some((h) => String(h).startsWith("restructure:")), e.id);
}
for (const ep of seeded.episodes) {
  assert.equal(validateEpisode(ep).length, 0, ep.id);
  assert.ok(ep.ddrId.startsWith("ddr_"));
}
for (const ban of seeded.citeBans) {
  assert.equal(validateCiteBan(ban).length, 0, ban.id);
  assert.ok(ban.ddrId.startsWith("ddr_"));
  assert.ok(CITE_FAIL_CATEGORIES.includes(ban.failCategory));
}
for (const ban of seeded.editionAntiCites) {
  assert.equal(validateEditionAntiCite(ban).length, 0, ban.id);
  assert.equal(ban.edition, "clearspeed");
}
for (const pref of seeded.siblingPrefs) {
  assert.equal(validateSiblingPref(pref).length, 0, pref.id);
  assert.ok(pref.ddrId.startsWith("ddr_"));
  assert.ok(pref.siblingId.length >= 3);
}

// Match stub finds the Sled queue recipe.
const hits = matchRepertoire("Decide Pursue/Review/Dismiss on the next notice", {
  category: "queue",
});
assert.ok(hits.length >= 1);
assert.equal(hits[0].entry.primaryCite, "shadcn-queue");
assert.ok(hits[0].entry.kitRecipe.length >= 8);

assert.ok(episodesForDdr("ddr_seed_sled_queue_cta").length >= 1);
assert.equal(episodesForDdr("ddr_missing").length, 0);

const seededSibling = siblingPrefsFor("queue", {
  edition: "clearspeed-operate",
  job: "Decide Pursue/Review/Dismiss on the next notice",
});
assert.ok(seededSibling.length >= 1);
assert.equal(seededSibling[0].pref.siblingId, "sled-capture-queue");
assert.equal(seededSibling[0].pref.preferredCite, "shadcn-queue");

const queueBans = citeBansFor("queue");
assert.ok(queueBans.some((b) => b.citeId === "shadcn-dashboard-01"));
assert.ok(citeBansFor("settings").some((b) => b.citeId === "shadcn-queue"));
const editionBans = editionAntiCitesFor("clearspeed", { category: "queue" });
assert.ok(editionBans.some((b) => b.citeId === "magicui-*"));

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

// Infer + hook: refuse without doctor; skip non-cite fails; write on cite-honesty.
assert.throws(
  () =>
    commitCiteBansFromProveFail({
      storePath,
      doctorBiteOk: false,
      ddrId: "ddr_test_cite_ban_001",
      failures: ["cite-honesty: dashboard on queue"],
      observedCite: "shadcn-dashboard-01",
      expectedCite: "shadcn-queue",
      category: "queue",
      edition: "clearspeed",
    }),
  /doctorBiteOk/,
);

const skipped = commitCiteBansFromProveFail({
  storePath,
  doctorBiteOk: true,
  ddrId: "ddr_test_cite_ban_001",
  failures: ["cta-pressure: 2 filled in main"],
  observedCite: "shadcn-dashboard-01",
  category: "queue",
});
assert.equal(skipped.skipped, true);
assert.match(skipped.reason, /not cite-related/);

const noDdr = inferCiteBansFromProveFail({
  ddrId: "",
  failures: ["cite-honesty"],
  observedCite: "shadcn-dashboard-01",
  category: "queue",
});
assert.match(noDdr.refused, /ddrId/);

const banned = commitCiteBansFromProveFail({
  storePath,
  doctorBiteOk: true,
  at: "2026-10-07T16:05:00.000Z",
  ddrId: "ddr_test_cite_ban_001",
  failures: ["cite-honesty: page cite must match category"],
  observedCite: "shadcn-dashboard-01",
  expectedCite: "shadcn-queue",
  category: "queue",
  edition: "clearspeed",
  reason: "Dashboard silhouette failed prove on triage job",
});
assert.equal(banned.skipped, false);
assert.equal(banned.bumped, true);
assert.equal(banned.previousVersion, 2);
assert.equal(banned.version, 3);
assert.equal(banned.citeBan.kind, "operate-demotion");
assert.equal(banned.citeBan.citeId, "shadcn-dashboard-01");
assert.equal(banned.citeBan.ddrId, "ddr_test_cite_ban_001");
assert.equal(banned.editionAntiCite.edition, "clearspeed");
assert.equal(banned.editionAntiCite.citeId, "shadcn-dashboard-01");

assert.throws(
  () =>
    commitLearning({
      storePath,
      doctorBiteOk: true,
      citeBan: {
        citeId: "shadcn-dashboard-01",
        category: "queue",
        reason: "Looks good enough without machine fail",
        failCategory: "cta-pressure",
        ddrId: "ddr_test_cite_ban_002",
        rlaif: true,
      },
    }),
  /preference|rlaif|cite-related/i,
);

// Refuse cite ban with non-cite fail category (no RLAIF theater).
assert.throws(
  () =>
    commitLearning({
      storePath,
      doctorBiteOk: true,
      citeBan: {
        citeId: "shadcn-dashboard-01",
        category: "queue",
        reason: "Demote dashboard on triage",
        failCategory: "cta-pressure",
        ddrId: "ddr_test_cite_ban_002",
      },
    }),
  /cite-related/,
);

const afterBan = loadRepertoire(storePath);
assert.ok(afterBan.citeBans.some((b) => b.ddrId === "ddr_test_cite_ban_001"));
assert.ok(afterBan.editionAntiCites.some((b) => b.edition === "clearspeed"));

// Sibling learn: refuse without doctor; skip incomplete resolve; commit + prefer.
assert.throws(
  () =>
    commitSiblingLearnFromResolve({
      storePath,
      doctorBiteOk: false,
      ddrId: "ddr_test_sibling_001",
      edition: "clearspeed-operate",
      category: "queue",
      job: "Decide Pursue on the next notice",
      siblingId: "sled-capture-queue",
      preferredCite: "shadcn-queue",
      kitRecipe: "shadcn-queue / DataGrid recipe; worklist-first",
    }),
  /doctorBiteOk/,
);

const noSibling = inferSiblingLearnFromResolve({
  ddrId: "ddr_test_sibling_001",
  preferredCite: "shadcn-queue",
  kitRecipe: "shadcn-queue / DataGrid recipe",
});
assert.match(noSibling.refused, /siblingId/);

const resolved = resolveEditionSibling({
  category: "queue",
  job: "Decide Pursue/Review/Dismiss on the next notice",
  editionId: "clearspeed-operate",
});
assert.ok(resolved.sibling, "edition sibling resolve required for learn hook");

const siblingLearn = commitSiblingLearnFromResolve({
  storePath,
  doctorBiteOk: true,
  at: "2026-10-07T16:10:00.000Z",
  ddrId: "ddr_test_sibling_001",
  edition: "clearspeed-operate",
  category: "queue",
  job: "Decide Pursue/Review/Dismiss on the next notice",
  resolved,
});
assert.equal(siblingLearn.skipped, false);
assert.equal(siblingLearn.bumped, true);
assert.equal(siblingLearn.siblingPref.siblingId, "sled-capture-queue");
assert.equal(siblingLearn.siblingPref.preferredCite, "shadcn-queue");
assert.equal(siblingLearn.episode.failCategory, SIBLING_LEARN_FAIL_CATEGORY);
assert.equal(siblingLearn.episode.verdict, "done");

const afterSibling = loadRepertoire(storePath);
assert.ok(afterSibling.siblingPrefs.some((p) => p.ddrId === "ddr_test_sibling_001"));
assert.ok(
  afterSibling.episodes.some(
    (e) => e.ddrId === "ddr_test_sibling_001" && e.failCategory === SIBLING_LEARN_FAIL_CATEGORY,
  ),
);

// Next resolve prefers the proven sibling mapping (learnedPrefs boost).
const preferHits = siblingPrefsFor("queue", {
  edition: "clearspeed-operate",
  job: "Decide Pursue/Review/Dismiss on the next notice",
  store: afterSibling,
});
assert.ok(preferHits.length >= 1);
const preferred = resolveEditionSibling({
  category: "queue",
  job: "Decide Pursue/Review/Dismiss on the next notice",
  editionId: "clearspeed-operate",
  learnedPrefs: preferHits.map((h) => h.pref),
});
assert.equal(preferred.sibling?.id, "sled-capture-queue");
assert.match(preferred.reason, /repertoire sibling prefer/);
assert.equal(preferred.learnedPrefer?.siblingId, "sled-capture-queue");

// Doctor wiring: learn bite registered next to skill A/B.
const doctorSrc = readFileSync(join(SHINE, "verify/doctor.mjs"), "utf8");
assert.match(doctorSrc, /verify\/learn\.test\.mjs/);
assert.match(doctorSrc, /repertoire|episodic learn|cite-ban|sibling/i);

// Reflexion hook import surface (prove-fail → learn).
const reflexionSrc = readFileSync(join(SHINE, "core/reflexion.mjs"), "utf8");
assert.match(reflexionSrc, /commitCiteBansFromProveFail/);

// Recommend + packet surfaces for sibling learn.
const recommendSrc = readFileSync(join(SHINE, "corpus/recommend.mjs"), "utf8");
assert.match(recommendSrc, /commitSiblingLearnFromResolve|siblingPrefsFor/);
const packetSrc = readFileSync(join(SHINE, "core/design-packet.mjs"), "utf8");
assert.match(packetSrc, /commitSiblingLearnFromResolve/);

rmSync(dir, { recursive: true, force: true });

console.log(
  "learn PASS: repertoire job→cite→kit+hints · episodic ddrId · cite-ban/edition anti-cite after prove fail · sibling prefer after edition resolve · doctor-gated bump · no preference/RLAIF",
);
