#!/usr/bin/env node
/**
 * Doctor bite — pinned FAIL→PASS cropped receipts for CTA / KPI / wrong-cite /
 * dual-grid XOR / Usul focal / stacked Sled bloat.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFECT_CROP_PAIRS,
  assertCropPairOk,
  ensureDefectCropReceipts,
  buildCtaBeforeCropHtml,
  buildCtaAfterCropHtml,
  buildKpiBeforeCropHtml,
  buildKpiAfterCropHtml,
  buildWrongCiteBeforeCropHtml,
  buildWrongCiteAfterCropHtml,
  buildDualGridBeforeCropHtml,
  buildUsulFocalBeforeCropHtml,
  buildUsulFocalAfterCropHtml,
  buildSledBloatBeforeCropHtml,
  buildSledBloatAfterCropHtml,
} from "./restructure/defect-crops.mjs";
import { buildXorFoldCropHtml } from "./restructure/xor-saved-view.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECEIPTS = join(SHINE, "verify/fixtures/denoise/receipts");

assert.notEqual(buildCtaBeforeCropHtml(), buildCtaAfterCropHtml(), "CTA crops must not be twins");
assert.notEqual(buildKpiBeforeCropHtml(), buildKpiAfterCropHtml(), "KPI crops must not be twins");
assert.notEqual(buildWrongCiteBeforeCropHtml(), buildWrongCiteAfterCropHtml(), "cite crops must not be twins");
assert.notEqual(
  buildDualGridBeforeCropHtml(),
  buildXorFoldCropHtml({ keptTitle: "Queue", chipLabel: "David's 10 today" }),
  "dual-grid crops must not be twins",
);
assert.notEqual(buildUsulFocalBeforeCropHtml(), buildUsulFocalAfterCropHtml(), "usul crops must not be twins");
assert.notEqual(buildSledBloatBeforeCropHtml(), buildSledBloatAfterCropHtml(), "sled-bloat crops must not be twins");

assert.ok(DEFECT_CROP_PAIRS.length >= 6, "at least 6 pinned crop pairs");
for (const id of ["queue-cta", "queue-kpi", "sources-cite", "queue-dual-grid", "usul-focal", "queue-sled-bloat"]) {
  assert.ok(
    DEFECT_CROP_PAIRS.some((p) => p.id === id),
    `missing crop pair ${id}`,
  );
}

// Dual-grid after is self-contained via buildAfter → buildXorFoldCropHtml (no override required).
ensureDefectCropReceipts(RECEIPTS);

const read = (name) => {
  const path = join(RECEIPTS, name);
  assert.ok(existsSync(path), `missing crop ${name}`);
  return readFileSync(path, "utf8");
};

for (const pair of DEFECT_CROP_PAIRS) {
  const result = assertCropPairOk(pair, read);
  assert.equal(result.ok, true, `${pair.id}: ${result.errors.join("; ")}`);
}

assert.ok(existsSync(join(SHINE, "verify/fixtures/denoise/queue-kpi-before.html")), "dedicated KPI before");
assert.match(
  readFileSync(join(SHINE, "verify/fixtures/denoise/queue-kpi-before.html"), "utf8"),
  /data-kpi="Missed"/,
);
assert.match(read("usul-focal-after-crop.html"), /data-region="focal"/);
assert.match(read("queue-sled-bloat-after-crop.html"), /data-shine-kpi-rest/);

console.log(
  `defect-crops PASS: ${DEFECT_CROP_PAIRS.length} FAIL→PASS pairs (CTA · KPI · wrong-cite · dual-grid XOR · Usul focal · Sled bloat)`,
);
