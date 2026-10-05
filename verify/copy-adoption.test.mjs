import assert from "node:assert/strict";
import {mkdtempSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {
  checkCopyAdoptionPresence,
} from "./prove.mjs";
import {
  copyHeuristicGateApplies,
  formatCopyHeuristicFailures,
} from "./copy-adoption.mjs";
import {
  emptySaasAdoptionChecks,
  emptySaasCopyChecks,
  emptySaasProductUxChecks,
  requiresSaasAdoptionChecks,
  requiresSaasCopyChecks,
  saasAdoptionCheckKeys,
  saasCopyCheckKeys,
  seedDiagnosis,
  validateDiagnosis,
} from "../core/diagnosis.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Gate applicability
assert.equal(copyHeuristicGateApplies({lane: "saas"}), true);
assert.equal(copyHeuristicGateApplies({lane: "marketing"}), true);
assert.equal(copyHeuristicGateApplies({lane: "internal"}), false, "internal alone does not force copy heuristics");
assert.equal(copyHeuristicGateApplies({citeScreen: "dashboard"}), true);
assert.equal(copyHeuristicGateApplies({citeScreen: "marketing"}), true);
assert.equal(copyHeuristicGateApplies({}), false, "anonymous measure stays off");
assert.equal(copyHeuristicGateApplies({lane: "saas", isWireframe: true}), false);

assert.deepEqual(
  formatCopyHeuristicFailures({findings: [{kind: "missing-page-title", sel: "html", detail: "x"}]}, {gate: false}),
  [],
);
assert.match(
  formatCopyHeuristicFailures({findings: [{kind: "missing-page-title", sel: "html", detail: "no title"}]}, {gate: true})[0],
  /copy: missing-page-title/,
);

// Schema presence — copy + adoption
assert.deepEqual(saasCopyCheckKeys, ["copyHeadlineCheck", "copyBeliefCheck", "copyInstructionalCheck"]);
assert.deepEqual(saasAdoptionCheckKeys, ["adoptionRitualCheck", "adoptionPrivateWinCheck", "adoptionAbsenceCheck"]);
assert.equal(requiresSaasCopyChecks({lane: "saas", category: "marketing"}), true);
assert.equal(requiresSaasCopyChecks({lane: "saas", category: "dashboard"}), true);
assert.equal(requiresSaasCopyChecks({lane: "saas", category: "voice"}), false);
assert.equal(requiresSaasAdoptionChecks({lane: "saas", category: "dashboard"}), true);
assert.equal(requiresSaasAdoptionChecks({lane: "saas", category: "marketing"}), false);
assert.equal(requiresSaasAdoptionChecks({category: "dashboard"}), false);

const dir = mkdtempSync(join(tmpdir(), "shine-copy-adoption-"));
const artifact = join(dir, "before.html");
const shot = join(dir, "before.png");
writeFileSync(artifact, "<!doctype html><title>x</title>");
writeFileSync(shot, "png");

const product = emptySaasProductUxChecks();
for (const key of Object.keys(product)) product[key] = {ok: true, note: "Product UX reviewed with evidence from the before shot"};
const copy = emptySaasCopyChecks();
copy.copyHeadlineCheck = {ok: true, note: "H1 names the weekly revenue exceptions queue"};
copy.copyBeliefCheck = {ok: false, note: "Belief 2 (works for me) has no named proof adjacent to the claim"};
copy.copyInstructionalCheck = {ok: true, note: "Empty state tells operators how to clear filters"};
const adoption = emptySaasAdoptionChecks();
adoption.adoptionRitualCheck = {ok: true, note: "Monday forecast call projects this screen first"};
adoption.adoptionPrivateWinCheck = {ok: true, note: "Managers get a ranked list they cannot get by asking"};
adoption.adoptionAbsenceCheck = {ok: false, note: "Turning it off for a week would not break any ritual yet"};

const base = {
  version: 1,
  job: "Fix the weekly revenue dashboard nobody opens",
  category: "dashboard",
  lane: "saas",
  primaryTask: "Decide which revenue exception to open next",
  before: {artifact, screenshot: shot},
  verdict: "defects",
  defects: [{
    id: "ritual-missing",
    bucket: "adoption",
    severity: "major",
    assertions: ["flow:open-exception"],
    problem: "No recurring ritual owns this dashboard",
    evidence: "Managers rebuild the same numbers in a spreadsheet before Monday",
    expectedEffect: "Monday call runs off this screen",
  }],
  ...product,
  ...copy,
  ...adoption,
};
assert.deepEqual(validateDiagnosis(base), [], "saas dashboard with product+copy+adoption checks validates");

const missingCopy = {...base};
for (const key of saasCopyCheckKeys) delete missingCopy[key];
const copyErrors = validateDiagnosis(missingCopy, {requireFiles: false});
for (const key of saasCopyCheckKeys) assert.match(copyErrors.join(" "), new RegExp(key));

const missingAdoption = {...base};
for (const key of saasAdoptionCheckKeys) delete missingAdoption[key];
const adoptionErrors = validateDiagnosis(missingAdoption, {requireFiles: false});
for (const key of saasAdoptionCheckKeys) assert.match(adoptionErrors.join(" "), new RegExp(key));

const marketing = {
  ...base,
  category: "marketing",
  defects: [{
    bucket: "completeness",
    severity: "minor",
    problem: "Subhead does not name the job",
    evidence: "Hero subhead restates the product category",
    expectedEffect: "Subhead names the buyer situation",
  }],
  ...copy,
};
for (const key of saasAdoptionCheckKeys) delete marketing[key];
for (const key of Object.keys(product)) delete marketing[key];
assert.deepEqual(validateDiagnosis(marketing), [], "marketing needs copy checks only");

const seed = seedDiagnosis({job: "Fix the weekly revenue dashboard", category: "dashboard", lane: "saas"});
for (const key of saasCopyCheckKeys) assert.deepEqual(seed[key], {ok: false, note: ""});
for (const key of saasAdoptionCheckKeys) assert.deepEqual(seed[key], {ok: false, note: ""});
assert.match(seed.guidance, /copy\/adoption/);

// Prove presence gate
assert.equal(checkCopyAdoptionPresence(base, {lane: "saas"}).status, "passed");
assert.equal(checkCopyAdoptionPresence(missingCopy, {lane: "saas"}).status, "failed");
assert.equal(checkCopyAdoptionPresence({lane: "internal", category: "dashboard"}, {lane: "internal"}).skipped, true);

// Measure heuristic bite: no title + no h1 under --lane saas
const badHtml = join(dir, "no-title.html");
writeFileSync(
  badHtml,
  `<!doctype html><html><body style="background:#fff;color:#111;font:16px sans-serif">
  <main data-cite="shadcn-dashboard-01"><p>Settings body without a page title</p>
  <button style="background:#111;color:#fff;padding:8px 12px">Save</button>
  <div data-shine-empty>No data</div>
  </main></body></html>\n`,
);
const measure = join(ROOT, "verify/measure.mjs");
const bad = spawnSync(process.execPath, [measure, badHtml, "--lane", "saas", "--cite", "shadcn-dashboard-01"], {
  cwd: ROOT,
  encoding: "utf8",
  timeout: 60_000,
});
const badOut = `${bad.stderr || ""}${bad.stdout || ""}`;
assert.notEqual(bad.status, 0, "missing title/H1 must fail measure under lane=saas");
assert.match(badOut, /copy: missing-page-title|copy: empty-instructional/);

const goodHtml = join(dir, "titled.html");
writeFileSync(
  goodHtml,
  `<!doctype html><html><head><title>Revenue exceptions</title></head>
  <body style="background:#fff;color:#111;font:16px/1.4 system-ui,sans-serif">
  <main data-cite="shadcn-dashboard-01" style="padding:24px">
  <h1>Revenue exceptions</h1>
  <p>Open the highest-risk deal before Monday's forecast call.</p>
  <button style="background:#111;color:#fff;padding:8px 12px">Open exception</button>
  <div data-shine-empty>No exceptions this week. When a deal slips, it appears here with the owner and next step.</div>
  </main></body></html>\n`,
);
const goodJson = join(dir, "good.json");
const good = spawnSync(
  process.execPath,
  [measure, goodHtml, "--lane", "saas", "--cite", "shadcn-dashboard-01", "--json", goodJson],
  {cwd: ROOT, encoding: "utf8", timeout: 60_000},
);
const goodOut = `${good.stderr || ""}${good.stdout || ""}`;
assert.doesNotMatch(goodOut, /copy: missing-page-title|copy: empty-instructional/, `unexpected copy fail: ${goodOut.slice(-400)}`);

console.log("copy-adoption PASS: schema presence · prove gate · measure title/empty heuristics");
