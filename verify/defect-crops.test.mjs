#!/usr/bin/env node
/**
 * Doctor bite — pinned FAIL→PASS cropped receipts for CTA / KPI / wrong-cite / dual-grid XOR.
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

ensureDefectCropReceipts(RECEIPTS, {
  xorAfterHtml: buildXorFoldCropHtml({ keptTitle: "Queue", chipLabel: "David's 10 today" }),
});

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

console.log(
  `defect-crops PASS: ${DEFECT_CROP_PAIRS.length} FAIL→PASS pairs (CTA · KPI · wrong-cite · dual-grid XOR)`,
);
