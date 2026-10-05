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
  { query: "settings page", screen: "settings" },
  { query: "account settings", screen: "settings" },
  { query: "form", screen: "form" },
  { query: "queue", screen: "queue" },
  { query: "record", screen: "record" },
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
assert.ok(count("settings") >= 3, `settings page rows ≥3, got ${count("settings")}`);
assert.ok(count("dashboard", (t) => t.dna?.density === "dense") >= 3, `dense dashboard page rows ≥3, got ${count("dashboard", (t) => t.dna?.density === "dense")}`);
assert.ok(count("form") + count("record") >= 4, `form+record pages ≥4 (form-app/record floor), got form=${count("form")} record=${count("record")}`);

// Chart-led briefs without a page screen still retrieve chart atoms.
const chartsOnly = retrieveDirections(templates, "charts", { lane: "saas" });
assert.equal(chartsOnly.selected[0].template.screen, "charts", "explicit charts job keeps chart atoms");
assert.equal(chartsOnly.brief.chartExplicit, true);

const analyticsOnly = retrieveDirections(templates, "analytics", { lane: "saas" });
assert.equal(analyticsOnly.selected[0].template.screen, "charts", "soft analytics alone stays chart-family");

// CLI smoke: cite.mjs primary line for soft dashboard analytics.
const cite = spawnSync(process.execPath, [join(SHINE, "corpus/cite.mjs"), "dashboard analytics"], { encoding: "utf8" });
assert.equal(cite.status, 0, cite.stderr);
assert.match(cite.stdout, /Template: \S+/);
assert.doesNotMatch(cite.stdout, /Template: shadcn-chart-/);
const templateLine = cite.stdout.split("\n").find((line) => line.startsWith("Template:"));
assert.ok(templateLine && !/chart/i.test(templateLine.split("—")[0]), `cite primary must be a page, got ${templateLine}`);

console.log(`cite operate PASS: ${OPERATE_JOBS.length} Operate jobs → page primaries · charts/analytics stay chart-family · cite CLI smoke`);
