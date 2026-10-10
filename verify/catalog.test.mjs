#!/usr/bin/env node
// The owned lane: licensed kits index into a private catalog that every reader
// merges and nothing publishes. Exercised end to end against temp directories so
// the committed catalog is never touched.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog, loadTemplates } from "../corpus/catalog.mjs";
import { retrieveDirections } from "../corpus/art-direction.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const committed = JSON.parse(readFileSync(join(SHINE, "corpus/templates.json"), "utf8"));
const tmp = mkdtempSync(join(tmpdir(), "shine-catalog-"));
try {
  // 1. Loader: public only, then public + owned, owned metadata forced, collisions dropped.
  const root = join(tmp, "root");
  mkdirSync(join(root, "corpus"), { recursive: true });
  writeFileSync(join(root, "corpus/templates.json"), JSON.stringify({ templates: committed.templates.slice(0, 5) }));
  assert.equal(loadCatalog(root).ownedCount, 0);
  writeFileSync(join(root, "corpus/templates.owned.json"), JSON.stringify({ templates: [
    { id: "tw-spotlight-home", screen: "marketing", kit: "tailwind-plus", title: "Tailwind Plus Spotlight home", path: "owned/tailwind-plus/spotlight/page.tsx", kind: "source", license: "MIT", jobs: ["marketing", "landing", "personal"], dna: { family: "tw-spotlight", density: "editorial" }, startFrom: 1 },
    { id: committed.templates[0].id, screen: "x", kit: "tailwind-plus", title: "collides with a public id", path: "owned/x.tsx" },
  ] }));
  const merged = loadCatalog(root);
  assert.equal(merged.ownedCount, 1, "a colliding owned id must not shadow a public row");
  const owned = merged.templates.find((row) => row.id === "tw-spotlight-home");
  assert.equal(owned.kind, "owned", "kind is forced to owned regardless of the manifest");
  assert.equal(owned.publication, "private-reference-only");
  assert.equal(loadTemplates(root).length, 6);
  // An owned row is selectable like a public one.
  const picked = retrieveDirections(merged.templates, "marketing landing personal site", { licenseMode: "source" });
  assert.ok(picked.selected.some((c) => c.template.id === "tw-spotlight-home"), "owned rows must be retrievable");

  // 2. Generator: an owned manifest under a private directory writes templates.owned.json
  //    and leaves the public catalog byte-identical.
  const ownedDir = join(tmp, "owned");
  mkdirSync(join(ownedDir, "tailwind-plus/templates/spotlight"), { recursive: true });
  writeFileSync(join(ownedDir, "tailwind-plus/templates/spotlight/page.tsx"), "export default function Page(){return <main/>}\n");
  writeFileSync(join(ownedDir, "tailwind-plus/manifest.json"), JSON.stringify({
    id: "tailwind-plus", kit: "tailwind-plus", license: "proprietary", publication: "private-reference-only",
    templates: [
      { id: "tw-spotlight-home", screen: "marketing", title: "Spotlight home", path: "owned/tailwind-plus/templates/spotlight/page.tsx", jobs: ["marketing", "landing"], dna: { family: "tw-spotlight", density: "editorial" } },
      { id: "tw-missing", screen: "marketing", title: "points nowhere", path: "owned/tailwind-plus/templates/nope.tsx" },
      { id: committed.templates[0].id, screen: "marketing", title: "collides", path: "owned/tailwind-plus/templates/spotlight/page.tsx" },
    ],
  }));
  // Public catalog must be identical with vs without owned kits. Compare two
  // regenerations under the same DESIGN_CORPUS — do not deep-equal against the
  // committed file (that couples this test to every index-kit-walk drift and to
  // whatever ~/design-corpus the host happens to have).
  const corpusStub = join(tmp, "corpus-stub");
  mkdirSync(corpusStub, { recursive: true });
  const emptyOwned = join(tmp, "owned-empty");
  mkdirSync(emptyOwned, { recursive: true });
  const outPublic = join(tmp, "out-public");
  mkdirSync(outPublic);
  const baseEnv = { ...process.env, DESIGN_CORPUS: corpusStub, SHINE_CATALOG_OUT: outPublic, SHINE_OWNED_DIR: emptyOwned };
  const baseRun = spawnSync(process.execPath, [join(SHINE, "corpus/index-templates.mjs")], { encoding: "utf8", env: baseEnv });
  assert.equal(baseRun.status, 0, `base reindex failed: ${baseRun.stderr}\n${baseRun.stdout}`);
  const publicOnly = JSON.parse(readFileSync(join(outPublic, "templates.json"), "utf8"));

  const out = join(tmp, "out");
  mkdirSync(out);
  const run = spawnSync(process.execPath, [join(SHINE, "corpus/index-templates.mjs")], {
    encoding: "utf8",
    env: { ...process.env, DESIGN_CORPUS: corpusStub, SHINE_OWNED_DIR: ownedDir, SHINE_CATALOG_OUT: out },
  });
  assert.equal(run.status, 0, `status ${run.status} signal ${run.signal} error ${run.error?.code}\n${run.stderr}\n${run.stdout}`);
  assert.match(run.stderr, /tw-missing .*path not on disk/, "a row pointing nowhere is reported");
  // Collision is against the regenerated public catalog (pack-derived rows under
  // corpusStub), not the host's full design-corpus — seed a colliding public id.
  assert.match(run.stdout, /templates\.owned\.json: \d+ private rows/);
  const generatedPublic = JSON.parse(readFileSync(join(out, "templates.json"), "utf8"));
  assert.deepEqual(generatedPublic.templates, publicOnly.templates, "the public catalog must not change when owned kits are present");
  const privateRows = JSON.parse(readFileSync(join(out, "templates.owned.json"), "utf8")).templates;
  assert.ok(privateRows.length >= 1, "owned generator must write at least the valid spotlight row");
  assert.equal(privateRows[0].license, "proprietary");
  assert.equal(privateRows[0].kind, "owned");
  assert.ok(!readFileSync(join(out, "templates.md"), "utf8").includes("tw-spotlight-home"), "the public index must not list private rows");

  // 3. Nothing owned is ever published: gitignored, and absent from the git archive.
  assert.match(readFileSync(join(SHINE, ".gitignore"), "utf8"), /corpus\/templates\.owned\.json/);
  // `git archive` only packs tracked files, so an ignored, untracked file can never
  // reach the Nucleus package. check-ignore exits 0 when the path is ignored.
  const ignored = spawnSync("git", ["check-ignore", "-q", "corpus/templates.owned.json"], { cwd: SHINE, encoding: "utf8" });
  assert.equal(ignored.status, 0, "the private catalog must be gitignored");
  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "corpus/templates.owned.json"], { cwd: SHINE, encoding: "utf8" });
  assert.notEqual(tracked.status, 0, "the private catalog must never be tracked");

  console.log("catalog PASS: owned rows merge and retrieve · generator writes the private file only · public catalog unchanged · never archived");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
