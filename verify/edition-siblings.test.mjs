#!/usr/bin/env node
/**
 * Enterprise §4 — ClearSpeed Operate edition sibling map (cite + kit selection).
 */
import assert from "node:assert/strict";
import { createDesignPacket } from "../core/design-packet.mjs";
import {
  applySiblingToRecommendation,
  editionUsesSiblingMap,
  listEditionSiblingMaps,
  loadEditionSiblingMap,
  normalizeSiblingCategory,
  resolveEditionSibling,
  validateEditionSiblingMap,
} from "../core/edition-siblings.mjs";
import { recommendPattern } from "../corpus/recommend.mjs";
import catalog from "../corpus/templates.json" with { type: "json" };
import { verifyEditionSiblingMap } from "./edition.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templates = catalog.templates;

const doc = loadEditionSiblingMap("clearspeed-operate");
assert.deepEqual(validateEditionSiblingMap(doc), []);
assert.equal(doc.edition, "clearspeed");
assert.equal(doc.editionId, "clearspeed-operate");
assert.ok(doc.siblings.length >= 8, "Capture + Company Tools siblings");
assert.ok(doc.owners.some((o) => o.id === "nucleus-datagrid"));
assert.ok(listEditionSiblingMaps().some((m) => m.editionId === "clearspeed-operate"));

assert.equal(normalizeSiblingCategory("triage"), "queue");
assert.equal(normalizeSiblingCategory("preferences"), "settings");
assert.ok(editionUsesSiblingMap("clearspeed"));
assert.ok(editionUsesSiblingMap("clearspeed-operate"));
assert.equal(editionUsesSiblingMap("marketing"), false);

const cases = [
  {
    job: "Decide Pursue/Review/Dismiss on the next notice",
    category: "queue",
    id: "sled-capture-queue",
    cite: "shadcn-queue",
  },
  {
    job: "Fix or pause a matching recipe on Sources",
    category: "settings",
    id: "sled-capture-sources",
    cite: "shadcn-settings",
  },
  {
    job: "Find Usul coverage gaps Nucleus-only aging",
    category: "dashboard",
    id: "sled-capture-usul",
    cite: "shadcn-dashboard-01",
  },
  {
    job: "Scan Scout research signals feed",
    category: "queue",
    id: "sled-capture-signals",
    cite: "shadcn-queue",
  },
  {
    job: "Notice detail Story + Decide then Pursue panel hand-off",
    category: "record",
    id: "sled-capture-record",
    cite: "shadcn-record",
  },
  {
    job: "Company Tools catalog: find and install a package",
    category: "catalog",
    id: "nucleus-company-tools",
    cite: "shadcn-catalog",
  },
  {
    job: "Admin Adoption KPI strip with collapsed table",
    category: "dashboard",
    id: "nucleus-admin-adoption",
    cite: "shadcn-dashboard-01",
  },
];

for (const row of cases) {
  const resolved = resolveEditionSibling({
    category: row.category,
    job: row.job,
    editionId: "clearspeed-operate",
  });
  assert.ok(resolved.sibling, `${row.job}: sibling required`);
  assert.equal(resolved.sibling.id, row.id, `${row.job}: expected ${row.id}`);
  assert.equal(resolved.preferredCite, row.cite, `${row.job}: cite`);
  assert.ok(resolved.kitRecipe && resolved.kitRecipe.length > 12, `${row.job}: kit`);
}

// Ambiguous dashboard without cues → null (not a false sibling)
const ambiguous = resolveEditionSibling({
  category: "dashboard",
  job: "dashboard analytics metrics cockpit",
  editionId: "clearspeed-operate",
});
assert.equal(ambiguous.sibling, null, "ambiguous dashboard must not invent a sibling");
assert.match(ambiguous.reason, /ambiguous|no sibling/i);

// Queue without cues → Capture Queue default
const queueDefault = resolveEditionSibling({
  category: "queue",
  job: "work queue triage inbox",
  editionId: "clearspeed-operate",
});
assert.equal(queueDefault.sibling?.id, "sled-capture-queue");

// recommend + edition applies sibling kit / productSibling
const rec = recommendPattern(templates, "Decide Pursue/Review/Dismiss on the next notice", {
  lane: "saas",
  edition: "clearspeed-operate",
  category: "queue",
  limit: 6,
});
assert.ok(rec.productSibling?.id === "sled-capture-queue", "recommend productSibling");
assert.match(rec.kitRecipe, /worklist-first|DataGrid|shadcn-queue/i);
assert.ok(
  (rec.antiPatterns || []).some((a) => /edition-sibling:sled-capture-queue/.test(a)),
  "edition sibling anti-cites",
);

const applied = applySiblingToRecommendation(
  {
    primary: { id: "shadcn-dashboard-01", screen: "dashboard", scope: "page" },
    antiPatterns: [],
    restructureHints: [],
    kitRecipe: "default",
    shortlist: [
      { id: "shadcn-queue", screen: "queue", scope: "page", score: 8 },
      { id: "shadcn-dashboard-01", screen: "dashboard", scope: "page", score: 9 },
    ],
  },
  resolveEditionSibling({
    category: "queue",
    job: "Decide Pursue on the next notice",
  }),
  { templates },
);
assert.equal(applied.primary.id, "shadcn-queue", "promote preferred cite from shortlist");
assert.match(applied.restructureHints[0], /edition sibling/);

// Packet / DDR bind productSibling from map when --product-reference omitted
const packet = createDesignPacket({
  job: "Decide Pursue/Review/Dismiss on the next notice",
  lane: "saas",
  mode: "denoise",
  category: "queue",
  project: ROOT,
  accept: true,
});
assert.ok(packet.editionSibling?.id === "sled-capture-queue", "packet.editionSibling");
assert.match(String(packet.ddr.productSibling || ""), /Sled Capture Queue|sled-capture-queue/i);
assert.equal(packet.recommendation?.productSibling?.id, "sled-capture-queue");

const bite = verifyEditionSiblingMap();
assert.equal(bite.status, "passed", bite.reason);
assert.ok(bite.siblings >= 8);

console.log(
  "edition-siblings PASS: clearspeed-operate map · Capture/Company Tools resolve · cite+kit · recommend · packet DDR · edition bite",
);
