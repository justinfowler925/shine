#!/usr/bin/env node
// Operate SaaS pages cannot finish on compare alone — prove.mjs completion is mandatory.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  OPERATE_PROVE_SCREENS,
  artifactClaim,
  citeClaim,
  operateProveGaps,
  writeCompletionProveReceipt,
  writeProveReceipt,
} from "../hooks/receipt.mjs";
import { OPERATE_USABILITY_SCREENS } from "./usability.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const sweep = join(repo, "hooks/stop-sweep.mjs");
const shot = join(repo, "corpus/packs/shadcn-settings/shot.png");
const OPERATE_CITE = "shadcn-settings";
const MARKETING_CITE = "magicui-hero";

const dir = mkdtempSync(join(tmpdir(), "shine-operate-prove-"));
const compareReceipt = join(dir, "compare.json");
const completionReceipt = join(dir, "completion.json");
process.env.SHINE_RECEIPT = compareReceipt;
process.env.SHINE_COMPLETION_RECEIPT = completionReceipt;

const allChecks = Object.fromEntries(
  ["accessibility", "styling", "layout", "interactions", "referenceValidity", "visualComparison", "buildBinding"].map(
    (k) => [k, { status: "passed" }],
  ),
);

const screenForCite = (cite) => {
  if (cite === OPERATE_CITE) return "settings";
  if (cite === MARKETING_CITE) return "marketing-hero";
  if (cite === "untitled-table") return "queue";
  return null;
};

function repoWithHtml(name, cite, bodyExtra = "") {
  const root = join(dir, name);
  mkdirSync(root, { recursive: true });
  const git = (...a) => spawnSync("git", a, { cwd: root, encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "t@t");
  git("config", "user.name", "t");
  const html = `<!doctype html><html><body><main data-cite="${cite}">ok${bodyExtra}</main></body></html>\n`;
  writeFileSync(join(root, "app.html"), html);
  git("add", "-A");
  git("commit", "-qm", "init");
  writeFileSync(join(root, "app.html"), html + "<!-- touched -->\n");
  return { root, html: join(root, "app.html") };
}

const runSweep = (cwd) => {
  const r = spawnSync(process.execPath, [sweep], {
    cwd: repo,
    encoding: "utf8",
    env: { ...process.env, SHINE_RECEIPT: compareReceipt, SHINE_COMPLETION_RECEIPT: completionReceipt },
    input: JSON.stringify({ hook_event_name: "Stop", cwd }),
  });
  const out = (r.stdout || "").trim();
  return { blocked: out.includes('"decision":"block"'), reason: out ? JSON.parse(out).reason ?? "" : "", status: r.status };
};

const mintCompare = (cite, artifact) => {
  writeProveReceipt({
    cite,
    target: artifact,
    templateShot: shot,
    proof: { structureFingerprint: "operate-mandatory-test" },
  });
};

const mintCompletion = (cite, artifact, { at = Date.now(), screen = "settings" } = {}) => {
  const rec = writeCompletionProveReceipt({
    cite,
    target: artifact,
    lane: "saas",
    screen,
    checks: allChecks,
  });
  if (at !== rec.at) {
    const store = JSON.parse(readFileSync(completionReceipt, "utf8"));
    store.receipts = store.receipts.map((r) =>
      r.artifact === rec.artifact && r.cite === rec.cite ? { ...r, at } : r,
    );
    writeFileSync(completionReceipt, JSON.stringify(store));
  }
};

try {
  assert.ok(OPERATE_PROVE_SCREENS.includes("settings"));
  assert.ok(OPERATE_PROVE_SCREENS.includes("app-shell"));
  assert.ok(OPERATE_USABILITY_SCREENS.has("settings"), "usability allowlist stays aligned");

  // Unit: missing completion is a gap for Operate; marketing is not.
  rmSync(completionReceipt, { force: true });
  const settingsPage = join(dir, "settings.html");
  writeFileSync(settingsPage, `<!doctype html><html><body><main data-cite="${OPERATE_CITE}">s</main></body></html>`);
  const operateClaim = artifactClaim(settingsPage, OPERATE_CITE);
  assert.match(
    operateProveGaps([operateClaim], { screenForCite }).join("\n"),
    /no prove\.mjs completion/,
    "Operate without completion must gap",
  );

  const marketingPage = join(dir, "marketing.html");
  writeFileSync(marketingPage, `<!doctype html><html><body><main data-cite="${MARKETING_CITE}">m</main></body></html>`);
  assert.deepEqual(
    operateProveGaps([artifactClaim(marketingPage, MARKETING_CITE)], { screenForCite }),
    [],
    "marketing must not require prove completion",
  );

  const wireframePage = join(dir, "wire.html");
  writeFileSync(
    wireframePage,
    `<!doctype html><html data-shine-wireframe><body><main data-cite="${OPERATE_CITE}">w</main></body></html>`,
  );
  assert.deepEqual(
    operateProveGaps([artifactClaim(wireframePage, OPERATE_CITE)], { screenForCite }),
    [],
    "wireframe Operate pages skip mandatory prove until Build",
  );

  mintCompletion(OPERATE_CITE, settingsPage);
  assert.deepEqual(
    operateProveGaps([artifactClaim(settingsPage, OPERATE_CITE)], { screenForCite }),
    [],
    "fresh completion clears Operate gap",
  );

  mintCompletion(OPERATE_CITE, settingsPage, { at: Date.now() - 21 * 60 * 1000 });
  assert.match(
    operateProveGaps([artifactClaim(settingsPage, OPERATE_CITE)], { screenForCite }).join("\n"),
    /stale or future-dated/,
    "stale completion must fail",
  );

  // Stop-sweep: compare-only is not enough for Operate.
  rmSync(compareReceipt, { force: true });
  rmSync(completionReceipt, { force: true });
  const { root: operateRoot, html: operateHtml } = repoWithHtml("operate", OPERATE_CITE);
  mintCompare(OPERATE_CITE, operateHtml);
  const compareOnly = runSweep(operateRoot);
  assert.equal(compareOnly.blocked, true, "compare-only Operate turn must block");
  assert.match(compareOnly.reason, /prove\.mjs completion|Operate SaaS/);

  mintCompletion(OPERATE_CITE, operateHtml);
  const proved = runSweep(operateRoot);
  assert.equal(proved.blocked, false, `valid prove receipt must pass: ${proved.reason}`);

  // Marketing: compare alone still clears (no mandatory prove).
  rmSync(compareReceipt, { force: true });
  rmSync(completionReceipt, { force: true });
  const { root: mktRoot, html: mktHtml } = repoWithHtml("marketing", MARKETING_CITE);
  mintCompare(MARKETING_CITE, mktHtml);
  const mkt = runSweep(mktRoot);
  assert.equal(mkt.blocked, false, `marketing compare-only must pass: ${mkt.reason}`);

  // Source citeClaim for Operate still needs completion.
  rmSync(completionReceipt, { force: true });
  const src = join(dir, "Panel.tsx");
  writeFileSync(src, `export const X = () => <main data-cite="${OPERATE_CITE}">x</main>;\n`);
  assert.match(
    operateProveGaps([citeClaim(OPERATE_CITE, src)], { screenForCite }).join("\n"),
    /no prove\.mjs completion/,
  );

  console.log("operate prove mandatory: unit + stop-sweep fail/pass + marketing exempt");
} finally {
  delete process.env.SHINE_RECEIPT;
  delete process.env.SHINE_COMPLETION_RECEIPT;
  rmSync(dir, { recursive: true, force: true });
}
