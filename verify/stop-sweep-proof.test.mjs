#!/usr/bin/env node
//
// The stop sweep must stay satisfiable for component sources.
//
// The bug this locks out: the sweep built `artifactClaim(changedFile, cite)`
// for every `data-cite` it found, including in .tsx/.vue/.svelte sources, and
// proveGaps then demanded a receipt keyed to that source's realpath. compare
// only writes a receipt keyed to what it rendered, and a component source
// cannot be rendered — point compare at a .tsx and the browser paints
// TypeScript as text, so `facts.cite` is empty and it fails. The store's whole
// history bore this out: every receipt ever written was keyed to a .html.
//
// Net effect in a React estate: touching any component carrying a data-cite
// blocked the turn, and docs/media-layout-proof.md forbids hand-writing a
// receipt to escape. The gate had no honest exit.
//
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { RENDERABLE_ARTIFACT, artifactClaim, citeClaim, citeIdsIn, proveGaps, writeProveReceipt } from "../hooks/receipt.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const sweep = join(repo, "hooks/stop-sweep.mjs");
const shot = join(repo, "corpus/packs/shadcn-weekly-board/shot.png");
const CITE = "shadcn-weekly-board";

const dir = mkdtempSync(join(tmpdir(), "shine-stop-sweep-"));
const receipt = join(dir, "receipts.json");
// Set on THIS process too, not only the child's env: writeProveReceipt runs
// in-process here and receiptPath() reads process.env, so without this the test
// mints into the developer's real ~/.cache/shine store.
process.env.SHINE_RECEIPT = receipt;
const env = { ...process.env, SHINE_RECEIPT: receipt };

/** A git repo holding one component source that carries a data-cite. */
function repoWithSource(name, body) {
  const root = join(dir, name);
  mkdirSync(join(root, "src"), { recursive: true });
  const git = (...a) => spawnSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  writeFileSync(join(root, "src/Panel.tsx"), body);
  git("add", "-A");
  git("commit", "-qm", "init");
  // Modify after the commit so `git status --porcelain` reports it, which is
  // what the sweep reads.
  writeFileSync(join(root, "src/Panel.tsx"), body + "\nexport const touched = true;\n");
  return root;
}

const runSweep = (cwd) => {
  const r = spawnSync(process.execPath, [sweep], {
    cwd: repo,
    encoding: "utf8",
    env,
    input: JSON.stringify({ hook_event_name: "Stop", cwd }),
  });
  const out = (r.stdout || "").trim();
  return { blocked: out.includes('"decision":"block"'), reason: out ? (JSON.parse(out).reason ?? "") : "", status: r.status };
};

const mint = (cite, artifact, at = Date.now()) => {
  writeFileSync(artifact, `<!doctype html><html data-cite="${cite}"><body>proof</body></html>`);
  const rec = writeProveReceipt({
    cite,
    target: artifact,
    templateShot: shot,
    proof: { structureFingerprint: "test-fingerprint" },
  });
  if (at !== rec.at) {
    const store = JSON.parse(readFileSync(receipt, "utf8"));
    store.receipts = store.receipts.map((r) => (r.artifact === rec.artifact && r.cite === rec.cite ? { ...r, at } : r));
    writeFileSync(receipt, JSON.stringify(store));
  }
  return rec;
};

try {
  const SOURCE = `export function Panel() {\n  return <main data-cite="${CITE}"><h1>Week</h1></main>;\n}\n`;
  assert.deepEqual(citeIdsIn(SOURCE), [CITE], "a data-cite in a .tsx must be discovered");

  // A source is not a renderable artifact; a rendered page is.
  assert.equal(RENDERABLE_ARTIFACT.test("/x/Panel.tsx"), false);
  assert.equal(RENDERABLE_ARTIFACT.test("/x/page.html"), true);
  assert.equal(RENDERABLE_ARTIFACT.test("/x/page.HTM"), true);

  // 1. No proof at all still blocks. The gate must not be loosened into nothing.
  const project = repoWithSource("react-estate", SOURCE);
  rmSync(receipt, { force: true });
  const unproven = runSweep(project);
  assert.equal(unproven.blocked, true, "an unproven cited source must block");
  assert.match(unproven.reason, /Panel\.tsx/, "the blocking message must name the file");
  assert.match(unproven.reason, /compare\.mjs proof/);
  // and it must say why the obvious move does not work
  assert.match(unproven.reason, /component source is not a\s+compare target/);

  // 2. THE REGRESSION. A passing compare on the artifact the source renders
  //    into clears the source. Before the fix this was unreachable: no receipt
  //    could ever be keyed to the .tsx, so the sweep blocked forever.
  mint(CITE, join(dir, "rendered.html"));
  const proven = runSweep(project);
  assert.equal(proven.blocked, false, `a rendered artifact proving the cite must clear the source: ${proven.reason}`);
  assert.equal(proven.status, 0);

  // 3. A receipt for some other cite proves nothing about this one.
  rmSync(receipt, { force: true });
  mint("untitled-table", join(dir, "other.html"));
  const wrongCite = runSweep(project);
  assert.equal(wrongCite.blocked, true, "a different cite must not satisfy the claim");
  assert.match(wrongCite.reason, /no compare\.mjs proof for shadcn-weekly-board/);

  // 4. Freshness still applies to a source claim.
  rmSync(receipt, { force: true });
  mint(CITE, join(dir, "stale.html"), Date.now() - 45 * 60 * 1000);
  const stale = runSweep(project);
  assert.equal(stale.blocked, true, "a stale proof must not clear a source");
  assert.match(stale.reason, /stale or future-dated/);

  // 5. A fresh receipt must not be masked by an older stale one for the same cite.
  mint(CITE, join(dir, "fresh.html"));
  assert.equal(runSweep(project).blocked, false, "a fresh proof must win over an older stale one");

  // 6. The artifact path keeps its strict bytes binding — a cite-level receipt
  //    from a different file must NOT clear a changed .html artifact.
  const page = join(dir, "surface.html");
  mint(CITE, page);
  const pageClaim = artifactClaim(page, CITE);
  assert.deepEqual(proveGaps([pageClaim]), [], "an artifact with its own fresh receipt passes");
  writeFileSync(page, `<!doctype html><html data-cite="${CITE}"><body>edited after proof</body></html>`);
  const edited = proveGaps([artifactClaim(page, CITE)]);
  assert.equal(edited.length, 1);
  assert.match(edited[0], /changed after compare\.mjs/, "editing a proven artifact must re-open the gate");

  // 7. Claim shapes are validated, not silently accepted.
  assert.deepEqual(proveGaps([]), []);
  assert.deepEqual(proveGaps([{ cite: CITE }]), ["invalid artifact proof claim"]);
  assert.equal(proveGaps([citeClaim(CITE, page)]).length, 0, "citeClaim resolves against any artifact for that cite");

  console.log("stop-sweep proof keying: 7 groups passed");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
