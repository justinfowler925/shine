#!/usr/bin/env node
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { axisDistance, candidateAxes, directionMetadata, retrieveDirections } from "../corpus/art-direction.mjs";
import catalog from "../corpus/templates.json" with { type: "json" };

const templates = catalog.templates;
const query = "internal operator queue datagrid dense serious";
const baseline = JSON.stringify(retrieveDirections(templates, query));
for (let i = 0; i < 20; i += 1) assert.equal(JSON.stringify(retrieveDirections(templates, query)), baseline, `determinism run ${i + 1}`);
const diverse = retrieveDirections(templates, query);
assert.equal(diverse.selected.length, 0, "queue stays blocked until a human-approved replacement lands");
for (let i = 0; i < diverse.selected.length; i += 1) for (let j = i + 1; j < diverse.selected.length; j += 1)
  assert.ok(axisDistance(diverse.selected[i].axes, diverse.selected[j].axes) >= 3, "selected candidates must be semantically distinct");
for (const template of templates) {
  const axes = candidateAxes(template, diverse.brief);
  for (const axis of directionMetadata.axes) assert.ok(axes[axis] !== undefined, `${template.id} missing ${axis}`);
}
const muiOnly = retrieveDirections(templates, "queue datagrid", { framework: "mui" });
assert.equal(muiOnly.selected.length, 0);
const sourceOnly = retrieveDirections(templates, "dashboard", { licenseMode: "source" });
assert.ok(sourceOnly.exclusions.some((item) => item.template.kind === "query-only" && item.reasons.some((reason) => reason.startsWith("license:"))));
const lex = retrieveDirections(templates, "lightning record");
assert.ok(lex.selected.length && lex.selected.every((candidate) => candidate.axes.framework === "lex"));
const gap = retrieveDirections(templates, "underwater submarine configurator");
assert.equal(gap.selected.length, 0);
assert.ok(gap.gaps.some((item) => item.startsWith("job:")));
const dir = mkdtempSync(join(tmpdir(), "shine-history-"));
try {
  const history = join(dir, "history.json");
  writeFileSync(history, JSON.stringify({ citations: ["shadcn-sidebar-07", "shadcn-sidebar-07"] }));
  const without = retrieveDirections(templates, "app shell");
  const withHistory = retrieveDirections(templates, "app shell", { history });
  assert.equal(without.selected[0].template.id, "shadcn-sidebar-07");
  assert.notEqual(withHistory.selected[0].template.id, "shadcn-sidebar-07", "history breaks only an equal-score tie toward less-used work");
  assert.equal(withHistory.selected[0].score, without.selected[0].score, "history must not override eligibility score");
} finally { rmSync(dir, { recursive: true, force: true }); }
const plain = retrieveDirections(templates, "dashboard");
assert.deepEqual(plain.brief.demandedSlop, []);
assert.ok(plain.selected.every((item) => !directionMetadata.slopStyles.some((style) => item.axes.signature.includes(style))));
assert.deepEqual(retrieveDirections(templates, "gradient saas queue datagrid").brief.demandedSlop, ["gradient"]);
console.log("art direction PASS: determinism=20/20 · distance>=3 · constraints/license/framework/history/gaps/slop verified");
