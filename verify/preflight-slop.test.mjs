#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { scanPreflightSlop } from "./preflight-slop.mjs";
import { adaptSnaplineStop } from "./adapters/snapline.mjs";
import { adaptImpeccable } from "./adapters/impeccable.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const sled = join(SHINE, ".."); // unused; fixtures live in verify + store copy

// Prefer in-repo CTA dual fixture + composition fixtures; also sled-shaped queue if present.
const queueBeforeCandidates = [
  join(SHINE, "verify/fixtures/denoise/queue-cta-before.html"),
  join(SHINE, "verify/fixtures/cta-pressure/dual-primary.html"),
];
const queueAfterCandidates = [
  join(SHINE, "verify/fixtures/denoise/queue-cta-after.html"),
  join(SHINE, "verify/fixtures/cta-pressure/single-primary.html"),
];

function firstExisting(paths) {
  for (const p of paths) {
    try {
      readFileSync(p);
      return p;
    } catch {
      /* next */
    }
  }
  return null;
}

const beforePath = firstExisting(queueBeforeCandidates);
const afterPath = firstExisting(queueAfterCandidates);
assert.ok(beforePath, "need a dual-CTA / queue-before fixture");
assert.ok(afterPath, "need a single-CTA / queue-after fixture");

const before = scanPreflightSlop(readFileSync(beforePath, "utf8"), {
  gate: true,
  screen: "queue",
});
assert.ok(
  before.signals.some((s) => s.id === "ai-slop-cta-mania") || before.failures.some((f) => /cta-mania/.test(f)),
  JSON.stringify(before),
);

const after = scanPreflightSlop(readFileSync(afterPath, "utf8"), { gate: true, screen: "queue" });
assert.ok(!after.failures.some((f) => /cta-mania/.test(f)), JSON.stringify(after));

const carnival = scanPreflightSlop(
  readFileSync(join(SHINE, "verify/fixtures/composition-slop/card-soup.html"), "utf8"),
  { gate: true, screen: "catalog" },
);
assert.ok(carnival.signals.some((s) => s.id === "ai-slop-card-carnival" && s.severity === "fail"));
assert.ok(carnival.failures.some((f) => /ai-slop-card-carnival/.test(f)));
assert.equal(
  carnival.signals.find((s) => s.id === "ai-slop-card-carnival").count,
  4,
  "host count must not double-count slot+class+article",
);

const filler = scanPreflightSlop(
  readFileSync(join(SHINE, "verify/fixtures/composition-slop/filler-empty.html"), "utf8"),
  { gate: true },
);
assert.ok(filler.signals.some((s) => s.id === "ai-slop-filler-copy"));

const snap = adaptSnaplineStop({
  findings: [{ id: "too-many-primaries", message: "Two primary buttons compete" }],
});
assert.ok(snap.citeSafe);
assert.ok(snap.preflightHints.includes("ai-slop-cta-mania"));
const snapCards = adaptSnaplineStop({
  findings: [{ id: "card-soup", message: "Nested card grid carnival" }],
});
assert.ok(snapCards.preflightHints.includes("ai-slop-card-carnival"));
assert.ok(snapCards.preflightHints.includes("ai-slop-nested-cards"));
const snapBadge = adaptSnaplineStop({
  findings: [{ id: "badge-spam", message: "Too many pill chips" }],
});
assert.ok(snapBadge.preflightHints.includes("ai-slop-badge-spam"));

const blocked = adaptImpeccable("distill", { cite: "shadcn-queue", structureGreen: false });
assert.equal(blocked.allowed, false);
const ok = adaptImpeccable("quieter", { cite: "shadcn-queue", structureGreen: true });
assert.equal(ok.allowed, true);
assert.ok(ok.citeSafe);

const cli = spawnSync(
  process.execPath,
  [join(SHINE, "verify/preflight-slop.mjs"), beforePath],
  { encoding: "utf8" },
);
assert.notEqual(cli.status, 0);


const badgeBefore = join(SHINE, "verify/fixtures/denoise/queue-pill-badge-before.html");
const badgeAfter = join(SHINE, "verify/fixtures/denoise/queue-pill-badge-after.html");
const badgeFail = scanPreflightSlop(readFileSync(badgeBefore, "utf8"), { gate: true, screen: "queue" });
assert.ok(
  badgeFail.failures.some((f) => /ai-slop-badge-spam/.test(f)),
  `queue badge-spam should hard-fail: ${JSON.stringify(badgeFail)}`,
);
const badgePass = scanPreflightSlop(readFileSync(badgeAfter, "utf8"), { gate: true, screen: "queue" });
assert.ok(
  !badgePass.failures.some((f) => /ai-slop-badge-spam/.test(f)),
  `collapsed badge stack should clear: ${JSON.stringify(badgePass)}`,
);


const kpiBefore = join(SHINE, "verify/fixtures/denoise/queue-kpi-before.html");
const kpiAfter = join(SHINE, "verify/fixtures/denoise/queue-kpi-after.html");
const metricFail = scanPreflightSlop(readFileSync(kpiBefore, "utf8"), { gate: true, screen: "queue" });
assert.ok(
  metricFail.failures.some((f) => /ai-slop-metric-grid/.test(f)),
  `queue metric-grid should hard-fail: ${JSON.stringify(metricFail)}`,
);
const metricPass = scanPreflightSlop(readFileSync(kpiAfter, "utf8"), { gate: true, screen: "queue" });
assert.ok(
  !metricPass.failures.some((f) => /ai-slop-metric-grid/.test(f)),
  `collapsed KPI stack should clear metric-grid: ${JSON.stringify(metricPass)}`,
);

const nestedBefore = join(SHINE, "verify/fixtures/denoise/catalog-card-soup-before.html");
const nestedAfter = join(SHINE, "verify/fixtures/denoise/catalog-card-soup-after.html");
const nestedFail = scanPreflightSlop(readFileSync(nestedBefore, "utf8"), { gate: true, screen: "catalog" });
assert.ok(
  nestedFail.failures.some((f) => /ai-slop-nested-cards/.test(f)),
  `catalog nested-cards should hard-fail: ${JSON.stringify(nestedFail)}`,
);
assert.ok(
  nestedFail.failures.some((f) => /ai-slop-card-carnival/.test(f)),
  `catalog card-carnival should hard-fail: ${JSON.stringify(nestedFail)}`,
);
const nestedPass = scanPreflightSlop(readFileSync(nestedAfter, "utf8"), { gate: true, screen: "catalog" });
assert.ok(
  !nestedPass.failures.some((f) => /ai-slop-nested-cards/.test(f)),
  `collapsed Card stack should clear nested-cards: ${JSON.stringify(nestedPass)}`,
);
assert.ok(
  !nestedPass.failures.some((f) => /ai-slop-card-carnival/.test(f)),
  `collapsed Card stack should clear card-carnival: ${JSON.stringify(nestedPass)}`,
);

console.log("preflight-slop PASS: cta-mania · card-carnival · badge-spam · metric-grid · nested-cards FAIL→PASS · filler · Snapline/Impeccable adapters");
