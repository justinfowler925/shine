#!/usr/bin/env node
// Golden cite tests: Operate-lane jobs retrieve composed pages, not chart atoms.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { retrieveDirections } from "../corpus/art-direction.mjs";
import catalog from "../corpus/templates.json" with { type: "json" };

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const templates = catalog.templates;

const OPERATE_JOBS = [
  { query: "dashboard", screen: "dashboard" },
  { query: "dashboard analytics", screen: "dashboard" },
  { query: "dense dashboard", screen: "dashboard" },
  { query: "ops cockpit", screen: "dashboard" },
  { query: "revenue cockpit", screen: "dashboard" },
  { query: "adoption cockpit", screen: "dashboard" },
  { query: "compliance cockpit", screen: "dashboard" },
  { query: "settings page", screen: "settings" },
  { query: "account settings", screen: "settings" },
  { query: "notification settings", screen: "settings" },
  { query: "billing settings", screen: "settings" },
  { query: "form", screen: "form" },
  { query: "invite teammate form", screen: "form" },
  { query: "queue", screen: "queue" },
  { query: "record", screen: "record" },
  { query: "catalog", screen: "catalog" },
  { query: "integrations catalog", screen: "catalog" },
  { query: "template gallery", screen: "catalog" },
  { query: "skills catalog", screen: "catalog" },
  { query: "company tools catalog", screen: "catalog" },
  { query: "chat", screen: "chat" },
  { query: "assistant sidecar", screen: "chat" },
  { query: "support chat", screen: "chat" },
  { query: "chat inbox", screen: "chat" },
];

for (const { query, screen } of OPERATE_JOBS) {
  const retrieval = retrieveDirections(templates, query, { lane: "saas", limit: 6 });
  assert.ok(retrieval.selected.length, `${query}: must resolve`);
  const primary = retrieval.selected[0].template;
  assert.equal(primary.scope || "page", "page", `${query}: primary must be scope:page, got ${primary.id} (${primary.scope})`);
  assert.notEqual(primary.screen, "charts", `${query}: chart atom ${primary.id} must not be the primary page cite`);
  assert.equal(primary.screen, screen, `${query}: expected screen=${screen}, got ${primary.screen} (${primary.id})`);
  assert.ok(retrieval.brief.operatePage === screen || retrieval.selected[0].matches.includes("operatePage"), `${query}: operate page intent missing`);
  // Charts / components may appear only as secondary refs.
  for (const candidate of retrieval.selected.slice(1)) {
    if (candidate.template.screen === "charts") {
      assert.notEqual(candidate.template.id, primary.id);
    }
  }
}

// M4b inventory: dense dashboard briefs prefer dense DNA pages; form-app is a page.
const dense = retrieveDirections(templates, "dense dashboard", { lane: "saas", limit: 6 });
assert.equal(dense.selected[0].template.screen, "dashboard");
assert.equal(dense.selected[0].axes.density, "dense", `dense dashboard primary should be dense DNA, got ${dense.selected[0].template.id} density=${dense.selected[0].axes.density}`);
assert.ok(
  dense.selected.some((c) => c.template.dna?.density === "dense" || c.axes.density === "dense"),
  "dense dashboard shortlist must include a dense page row",
);

const formApp = retrieveDirections(templates, "form-app", { lane: "saas", limit: 6 });
assert.equal(formApp.selected[0].template.scope || "page", "page");
assert.equal(formApp.selected[0].template.screen, "form", `form-app primary must be form page, got ${formApp.selected[0].template.id}`);
assert.ok(
  (formApp.selected[0].template.jobs || []).includes("form-app") || formApp.selected[0].template.id === "shadcn-form",
  "form-app primary should carry form-app job or be shadcn-form",
);

// Inventory floors from the harvest slice (page-scope, selectable).
const pages = templates.filter((t) => (t.scope || "page") === "page" && t.selectable !== false);
const count = (screen, pred = () => true) => pages.filter((t) => t.screen === screen && pred(t)).length;
assert.ok(count("settings") >= 6, `settings page rows ≥6 (P2 harvest), got ${count("settings")}`);
assert.ok(count("dashboard", (t) => t.dna?.density === "dense") >= 7, `dense dashboard/cockpit page rows ≥7 (S3 deepen), got ${count("dashboard", (t) => t.dna?.density === "dense")}`);
assert.ok(count("form") + count("record") >= 6, `form+record pages ≥6 (P2 harvest), got form=${count("form")} record=${count("record")}`);
assert.ok(count("catalog") >= 5, `catalog page rows ≥5 (S3 deepen), got ${count("catalog")}`);
assert.ok(count("chat") >= 5, `chat page rows ≥5 (S3 deepen), got ${count("chat")}`);
assert.ok(
  pages.filter((t) => t.screen === "dashboard" && (t.jobs || []).includes("cockpit") && t.dna?.density === "dense").length >= 4,
  "dense cockpit job rows ≥4 (S3 deepen)",
);

const catalogCite = retrieveDirections(templates, "integrations catalog", { lane: "saas", limit: 6 });
assert.equal(catalogCite.selected[0].template.screen, "catalog", `integrations catalog primary must be catalog, got ${catalogCite.selected[0].template.id}`);
const skillsCite = retrieveDirections(templates, "skills catalog", { lane: "saas", limit: 6 });
assert.equal(skillsCite.selected[0].template.screen, "catalog", `skills catalog primary must be catalog, got ${skillsCite.selected[0].template.id}`);
const chatCite = retrieveDirections(templates, "assistant sidecar", { lane: "saas", limit: 6 });
assert.equal(chatCite.selected[0].template.screen, "chat", `assistant sidecar primary must be chat, got ${chatCite.selected[0].template.id}`);
const supportCite = retrieveDirections(templates, "support chat", { lane: "saas", limit: 6 });
assert.equal(supportCite.selected[0].template.screen, "chat", `support chat primary must be chat, got ${supportCite.selected[0].template.id}`);
const cockpitCite = retrieveDirections(templates, "ops cockpit", { lane: "saas", limit: 6 });
assert.equal(cockpitCite.selected[0].template.screen, "dashboard");
assert.ok(
  cockpitCite.selected[0].template.dna?.density === "dense" || cockpitCite.selected[0].axes.density === "dense",
  `ops cockpit primary should be dense, got ${cockpitCite.selected[0].template.id}`,
);
const adoptionCite = retrieveDirections(templates, "adoption cockpit", { lane: "saas", limit: 6 });
assert.equal(adoptionCite.selected[0].template.screen, "dashboard");
assert.ok(
  adoptionCite.selected[0].template.dna?.density === "dense" || adoptionCite.selected[0].axes.density === "dense",
  `adoption cockpit primary should be dense, got ${adoptionCite.selected[0].template.id}`,
);

// Explicit chart wording still retrieves chart atoms; soft analytics prefers a composed dashboard.
const chartsOnly = retrieveDirections(templates, "charts", { lane: "saas" });
assert.equal(chartsOnly.selected[0].template.screen, "charts", "explicit charts job keeps chart atoms");
assert.equal(chartsOnly.brief.chartExplicit, true);

const analyticsOnly = retrieveDirections(templates, "analytics", { lane: "saas" });
assert.equal(analyticsOnly.selected[0].template.screen, "dashboard", "soft analytics alone prefers composed dashboard (chart gravity demotion)");
assert.equal(analyticsOnly.brief.chartExplicit, false);
assert.notEqual(analyticsOnly.selected[0].template.screen, "charts");

// CLI smoke: cite.mjs primary line for soft dashboard analytics.
const cite = spawnSync(process.execPath, [join(SHINE, "corpus/cite.mjs"), "dashboard analytics"], { encoding: "utf8" });
assert.equal(cite.status, 0, cite.stderr);
assert.match(cite.stdout, /Template: \S+/);
assert.doesNotMatch(cite.stdout, /Template: shadcn-chart-/);
const templateLine = cite.stdout.split("\n").find((line) => line.startsWith("Template:"));
assert.ok(templateLine && !/chart/i.test(templateLine.split("—")[0]), `cite primary must be a page, got ${templateLine}`);

console.log(`cite operate PASS: ${OPERATE_JOBS.length} Operate jobs → page primaries · explicit charts stay chart-family · soft analytics → dashboard · cite CLI smoke`);
