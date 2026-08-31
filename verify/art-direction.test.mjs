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
// Single-source policy: shadcn is the house kit and the Ant/MUI records pages
// were deleted outright on 2026-08-31, so a records brief no longer has three
// kits to offer. What must
// hold is that a candidate exists, that no retired pack is ever offered, and
// that thin coverage is REPORTED rather than padded with a kit the consumer
// cannot build. The old assertion (exactly three candidates) encoded the
// multi-kit corpus and could only pass by keeping the contamination.
assert.ok(diverse.selected.length >= 1, "a records brief must still resolve to a reference");
assert.ok(diverse.selected.every((candidate) => candidate.template.selectable !== false), "a retired pack must never be offered");
if (diverse.selected.length < 3) assert.ok(diverse.gaps.some((gap) => gap.startsWith("diversity:")), "thin coverage must be named in gaps, not hidden");
for (let i = 0; i < diverse.selected.length; i += 1) for (let j = i + 1; j < diverse.selected.length; j += 1)
  assert.ok(axisDistance(diverse.selected[i].axes, diverse.selected[j].axes) >= 3, "selected candidates must be semantically distinct");
for (const template of templates) {
  const axes = candidateAxes(template, diverse.brief);
  for (const axis of directionMetadata.axes) assert.ok(axes[axis] !== undefined, `${template.id} missing ${axis}`);
}
// The foreign-runtime kits are not merely unselectable, they are gone. This is
// the regression gate on the deletion: a row carrying one of these kits or ids
// must never reappear in the catalog, because a row an agent can read is a row
// an agent can imitate.
const DELETED_KITS = ["mui-material", "mui-store", "ant-design", "ant-design-pro", "carbon"];
const DELETED_IDS = [
  "mui-crud-dashboard", "mui-dashboard", "mui-marketing-page", "mui-checkout", "mui-blog",
  "mui-sign-in-side", "query-mui-store", "query-mui-free-gallery",
  "antd-pro-app", "antd-pro-list", "antd-pro-crud", "antd-pro-profile", "antd-pro-settings",
  "antd-pro-step-form", "antd-pro-chatbot", "carbon-datatable", "carbon-uishell",
];
for (const kit of DELETED_KITS)
  assert.ok(!templates.some((t) => t.kit === kit), `${kit} was deleted from the corpus; a row brought it back`);
for (const id of DELETED_IDS)
  assert.ok(!templates.some((t) => t.id === id), `${id} was deleted from the corpus; a row brought it back`);
// An unsatisfiable framework constraint must return nothing and say why, rather
// than substituting a kit the brief did not ask for.
const unsatisfiable = retrieveDirections(templates, "queue datagrid", { framework: "mui" });
assert.equal(unsatisfiable.selected.length, 0, "an unsatisfiable framework filter must not substitute another kit");
assert.ok(unsatisfiable.gaps.length, "an unsatisfiable framework constraint must be reported as a gap");
// The framework filter itself must still work where coverage exists.
const shadcnOnly = retrieveDirections(templates, "dashboard analytics", { framework: "react" });
assert.ok(shadcnOnly.selected.every((candidate) => candidate.axes.framework === "react"), "framework filter must exclude non-matching candidates");
assert.ok(unsatisfiable.exclusions.some((item) => item.reasons.some((reason) => reason.startsWith("framework:"))));
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
  // Rotation needs somewhere to rotate TO. Under the single-source policy no
  // screen is guaranteed two equal-scored references, so the mechanism is
  // tested against a synthetic pair rather than against whatever the corpus
  // happens to contain — that keeps this a test of the tie-break, not of
  // corpus composition.
  // The corpus now carries all 16 shadcn sidebar blocks, so which variant wins a
  // tie is a detail; what must hold is that the house kit owns the slot.
  const shell = retrieveDirections(templates, "app shell");
  assert.equal(shell.selected[0].template.kit, "shadcn-registry", "shadcn is the house app-shell reference");
  assert.match(shell.selected[0].template.id, /^shadcn-sidebar-\d+$/, "the app-shell slot resolves to a sidebar block");

  const twin = (id) => ({ id, kit: "shadcn-registry", screen: "app-shell", scope: "page", jobs: ["app-shell"],
    kind: "source", reference: { required: ["navigation"] }, dna: { family: "shadcn-zinc", density: "comfortable" }, startFrom: 1 });
  const pair = [twin("twin-a"), twin("twin-b")];
  const pairPlain = retrieveDirections(pair, "app shell");
  assert.equal(pairPlain.selected[0].template.id, "twin-a", "equal scores resolve deterministically by id");
  writeFileSync(history, JSON.stringify({ citations: ["twin-a", "twin-a"] }));
  const pairHistory = retrieveDirections(pair, "app shell", { history });
  assert.equal(pairHistory.selected[0].template.id, "twin-b", "history breaks an equal-score tie toward less-used work");
  assert.equal(pairHistory.selected[0].score, pairPlain.selected[0].score, "history must not override eligibility score");
} finally { rmSync(dir, { recursive: true, force: true }); }
const plain = retrieveDirections(templates, "saas queue datagrid");
assert.equal(plain.selected[0].template.id, "untitled-table", "Untitled is the default table reference");
assert.ok(plain.exclusions.some((item) => item.template.selectable === false && item.reasons.some((reason) => reason.startsWith("retired:"))), "retired rows must be excluded with a retired: reason, not silently ranked");
const hybrid = retrieveDirections(templates, "Untitled UI shadcn CEO judgment queue datagrid");
assert.equal(hybrid.selected[0].template.id, "untitled-table", "visual reference and implementation framework are independent");
assert.deepEqual(plain.brief.demandedSlop, []);
assert.ok(plain.selected.every((item) => !directionMetadata.slopStyles.some((style) => item.axes.signature.includes(style))));
assert.deepEqual(retrieveDirections(templates, "gradient saas queue datagrid").brief.demandedSlop, ["gradient"]);
console.log("art direction PASS: determinism=20/20 · distance>=3 · constraints/license/framework/history/gaps/slop verified");
