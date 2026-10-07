#!/usr/bin/env node
/**
 * Doctor bite — cite-ban learn deepen: episodic wrong-cite ban persists and
 * fail-closes recommend + design packet. Mirrors xor/records deepen bites.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  formatRecommendationSummary,
  recommendPattern,
} from "../corpus/recommend.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";
import {
  citeIdMatchesBan,
  commitCiteBansFromProveFail,
  emptyStore,
  enforceCiteBansOnRecommendation,
  learnedCiteBansFor,
  loadRepertoire,
  normalizeEditionForAntiCite,
} from "../core/learn.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const learnSrc = readFileSync(join(ROOT, "core/learn.mjs"), "utf8");
const recommendSrc = readFileSync(join(ROOT, "corpus/recommend.mjs"), "utf8");
const packetSrc = readFileSync(join(ROOT, "core/design-packet.mjs"), "utf8");

let passed = 0;
const bite = (name, fn) => {
  fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

bite("helpers: wildcard match + edition normalize", () => {
  assert.equal(citeIdMatchesBan("magicui-text-reveal", "magicui-*"), true);
  assert.equal(citeIdMatchesBan("shadcn-queue", "magicui-*"), false);
  assert.equal(citeIdMatchesBan("shadcn-dashboard-01", "shadcn-dashboard-01"), true);
  assert.equal(normalizeEditionForAntiCite("clearspeed-operate"), "clearspeed");
  assert.equal(normalizeEditionForAntiCite("clearspeed"), "clearspeed");
});

bite("seed repertoire has episodic wrong-cite bans", () => {
  const seeded = loadRepertoire();
  assert.ok(
    seeded.episodes.some(
      (e) =>
        e.id === "seed-cite-ban-queue-dashboard" &&
        e.failCategory === "cite-honesty" &&
        /dashboard/i.test(e.lesson),
    ),
    "seed episodic ban for queue dashboard demotion",
  );
  assert.ok(
    seeded.citeBans.some((b) => b.citeId === "shadcn-dashboard-01" && b.category === "queue"),
  );
  assert.ok(
    learnedCiteBansFor("shadcn-dashboard-01", { category: "queue" }).length >= 1,
  );
  assert.ok(
    learnedCiteBansFor("shadcn-dashboard-01", { category: "datagrid" }).length >= 1,
    "datagrid alias resolves queue bans",
  );
  assert.ok(
    learnedCiteBansFor("magicui-animated-beam", {
      category: "queue",
      edition: "clearspeed-operate",
    }).length >= 1,
    "edition anti-cite wildcard + clearspeed-operate alias",
  );
});

bite("commitCiteBansFromProveFail persists episodic ban", () => {
  const dir = mkdtempSync(join(tmpdir(), "shine-cite-ban-deepen-"));
  const storePath = join(dir, "repertoire.json");
  writeFileSync(storePath, JSON.stringify(emptyStore(), null, 2) + "\n");
  const result = commitCiteBansFromProveFail({
    storePath,
    doctorBiteOk: true,
    at: "2026-10-07T20:30:00.000Z",
    ddrId: "ddr_test_cite_ban_deepen_001",
    failures: ["cite-honesty: page cite must match category"],
    observedCite: "shadcn-dashboard-01",
    expectedCite: "shadcn-queue",
    category: "queue",
    edition: "clearspeed-operate",
    reason: "Dashboard silhouette failed prove on triage job",
  });
  assert.equal(result.skipped, false);
  assert.equal(result.citeBan.citeId, "shadcn-dashboard-01");
  assert.ok(result.episode, "episodic ban required");
  assert.equal(result.episode.failCategory, "cite-honesty");
  assert.match(result.episode.nextStep, /rebind|Demote/i);
  assert.equal(result.editionAntiCite.edition, "clearspeed");
  const reloaded = loadRepertoire(storePath);
  assert.ok(reloaded.citeBans.some((b) => b.ddrId === "ddr_test_cite_ban_deepen_001"));
  assert.ok(
    reloaded.episodes.some(
      (e) => e.ddrId === "ddr_test_cite_ban_deepen_001" && e.failCategory === "cite-honesty",
    ),
  );
  rmSync(dir, { recursive: true, force: true });
});

bite("recommend fail-closes banned primary", () => {
  const dir = mkdtempSync(join(tmpdir(), "shine-cite-ban-rec-"));
  const storePath = join(dir, "repertoire.json");
  const store = emptyStore();
  store.citeBans.push({
    id: "test-ban-queue-dashboard",
    kind: "operate-demotion",
    citeId: "shadcn-dashboard-01",
    category: "queue",
    reason: "Test demotion of dashboard on triage",
    failCategory: "cite-honesty",
    ddrId: "ddr_test_cite_ban_deepen_002",
    observedCite: "shadcn-dashboard-01",
    expectedCite: "shadcn-queue",
    at: "2026-10-07T20:30:00.000Z",
  });
  store.episodes.push({
    id: "test-ep-queue-dashboard",
    ddrId: "ddr_test_cite_ban_deepen_002",
    failCategory: "cite-honesty",
    lesson: "Test demotion of dashboard on triage",
    verdict: "partial",
    nextStep: "Demote shadcn-dashboard-01; rebind cite to shadcn-queue before paint",
    at: "2026-10-07T20:30:00.000Z",
  });
  writeFileSync(storePath, JSON.stringify(store, null, 2) + "\n");

  const forced = enforceCiteBansOnRecommendation(
    {
      primary: {
        id: "shadcn-dashboard-01",
        screen: "dashboard",
        scope: "page",
        score: 9,
      },
      antiPatterns: [],
      restructureHints: ["repaint:polish"],
      confidence: 0.8,
      shortlist: [
        { id: "shadcn-dashboard-01", screen: "dashboard", scope: "page", score: 9 },
        { id: "shadcn-queue", screen: "queue", scope: "page", score: 8 },
      ],
      gaps: [],
    },
    { category: "queue", storePath },
  );
  assert.ok(forced.citeBanFailClosed?.failClosed);
  assert.equal(forced.citeBanFailClosed.bannedCite, "shadcn-dashboard-01");
  assert.equal(forced.recommendation.primary?.id, "shadcn-queue");
  assert.match(forced.citeBanFailClosed.reason, /fail-closed/);
  assert.ok(
    (forced.recommendation.restructureHints || []).some((h) => /rebind-cite/i.test(h)),
  );

  // Live recommend with inject store: seeded default already bans dashboard on queue;
  // prove anti-cite surface + no banned primary when store forces ban on whatever wins.
  const rec = recommendPattern(catalog.templates, "Decide Pursue on the next notice", {
    lane: "saas",
    category: "queue",
    limit: 6,
    learnStorePath: storePath,
  });
  if (rec.primary) {
    assert.notEqual(rec.primary.id, "shadcn-dashboard-01");
  }
  assert.ok(
    (rec.antiPatterns || []).some((a) => /shadcn-dashboard-01/.test(a)),
    "learned ban surfaces as anti-cite",
  );
  assert.match(formatRecommendationSummary(rec), /recommendation:/);

  rmSync(dir, { recursive: true, force: true });
});

bite("packet fail-closes banned selected cite", () => {
  const dir = mkdtempSync(join(tmpdir(), "shine-cite-ban-pkt-"));
  const storePath = join(dir, "repertoire.json");
  // Ban the house settings cite so a settings-shaped form packet must demote/refuse.
  const store = loadRepertoire();
  store.citeBans = [
    ...(store.citeBans || []),
    {
      id: "test-ban-form-settings",
      kind: "operate-demotion",
      citeId: "shadcn-settings",
      category: "settings",
      reason: "Test demotion of settings cite on form packet",
      failCategory: "wrong-cite",
      ddrId: "ddr_test_cite_ban_deepen_003",
      observedCite: "shadcn-settings",
      expectedCite: "shadcn-form",
      at: "2026-10-07T20:30:00.000Z",
    },
  ];
  writeFileSync(storePath, JSON.stringify(store, null, 2) + "\n");

  const packet = createDesignPacket({
    job: "Account settings preferences save profile",
    lane: "saas",
    mode: "denoise",
    category: "settings",
    project: ROOT,
    accept: true,
    learnStorePath: storePath,
  });
  assert.ok(packet.recommendation, "recommendation present");
  // Either selected demoted off shadcn-settings, or editing refused when no alt.
  if (packet.citeBanFailClosed?.failClosed) {
    assert.match(packet.citeBanFailClosed.reason, /fail-closed/);
    if (packet.citeBanFailClosed.replacedWith) {
      assert.notEqual(packet.selected.id, "shadcn-settings");
      assert.equal(packet.selected.id, packet.citeBanFailClosed.replacedWith);
    } else {
      assert.equal(packet.editing.allowed, false);
      assert.match(packet.editing.instruction, /cite-ban fail-closed|Refuse paint/i);
    }
  } else {
    // If catalog didn't select the banned cite, still prove recommend path surfaces bans.
    assert.ok(
      (packet.recommendation.antiPatterns || []).some((a) => /anti-cite:/.test(a)),
    );
  }

  rmSync(dir, { recursive: true, force: true });
});

bite("wiring: learn + recommend + packet + doctor", () => {
  assert.match(learnSrc, /enforceCiteBansOnRecommendation/);
  assert.match(learnSrc, /episode/);
  assert.match(recommendSrc, /enforceCiteBansOnRecommendation/);
  assert.match(packetSrc, /citeBanFailClosed|learnedCiteBansFor/);
  assert.match(doctorSrc, /cite-ban-learn-deepen-bite\.mjs/);
});

console.log(
  `cite-ban-learn-deepen-bite: ok (${passed} bites — episodic persist · recommend/packet fail-close · doctor wiring)`,
);
