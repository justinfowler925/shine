#!/usr/bin/env node
/**
 * Clearspeed TW gold — cite must select Flowbite/TailAdmin/Untitled packs
 * (not shadcn-operate-decide house blueprints, not HeroUI/M3 landfill).
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isClearspeedTwGoldKit,
  loadClearspeedTwGoldStandard,
} from "../core/edition-siblings.mjs";
import { retrieveDirections } from "../corpus/art-direction.mjs";
import catalog from "../corpus/templates.json" with { type: "json" };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templates = catalog.templates;
const gold = loadClearspeedTwGoldStandard();
assert.ok(gold, "gold-standard.json required");
assert.equal(gold.winner, "flowbite-tailadmin-untitled");
assert.ok((gold.kits || []).includes("tailadmin-react"));
assert.ok((gold.kits || []).includes("flowbite-admin"));
assert.ok((gold.kits || []).includes("untitled-ui-react"));

const JOBS = [
  {
    query: "Decide Pursue/Review/Dismiss on the next notice",
    expect: "tailadmin-tables",
  },
  {
    query: "Fix or pause a matching recipe on Sources",
    expect: "flowbite-settings",
  },
  {
    query: "Find Usul coverage gaps Nucleus-only aging",
    expect: "flowbite-dashboard",
  },
  {
    query: "Scan Scout research signals feed",
    expect: "untitled-table",
  },
  {
    query: "settings page",
    expect: "flowbite-settings",
  },
  {
    query: "Admin Adoption KPI strip with collapsed table",
    expect: "flowbite-dashboard",
  },
  {
    query: "Company Tools catalog: find and install a package",
    expect: "flowbite-products",
  },
];

for (const { query, expect } of JOBS) {
  const run = spawnSync(
    process.execPath,
    [join(ROOT, "corpus/cite.mjs"), "--edition", "clearspeed-operate", query],
    { encoding: "utf8", cwd: ROOT },
  );
  assert.equal(run.status, 0, `${query}: cite exit ${run.status}\n${run.stderr}`);
  const line = (run.stdout || "").split("\n").find((l) => l.startsWith("Template:"));
  assert.ok(line, `${query}: Template line missing`);
  assert.match(line, new RegExp(`^Template: ${expect}\\b`), `${query}: ${line}`);
  const tmpl = templates.find((t) => t.id === expect);
  assert.ok(tmpl, `${expect} in catalog`);
  assert.notEqual(tmpl.selectable, false, `${expect} must be selectable`);
  assert.ok(
    isClearspeedTwGoldKit(tmpl.kit, gold) || isClearspeedTwGoldKit(tmpl.dna?.family, gold),
    `${expect} must be TW gold kit`,
  );
}

// retrieveDirections preferredCite force works even when NL score < 40
const forced = retrieveDirections(templates, "xyzzy matching recipe sources pause", {
  lane: "saas",
  edition: "clearspeed-operate",
  preferredCite: "flowbite-settings",
  twGold: true,
});
assert.equal(forced.selected[0]?.template.id, "flowbite-settings", "force preferredCite into empty ranked");

console.log(
  `clearspeed-tw-gold-cite PASS: ${JOBS.length} Operate jobs → TW gold (${gold.label})`,
);
