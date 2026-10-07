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
  buildCtaAstBeforeCropHtml,
  buildCtaAstAfterCropHtml,
  buildKpiBeforeCropHtml,
  buildKpiAfterCropHtml,
  buildKpiAstBeforeCropHtml,
  buildKpiAstAfterCropHtml,
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
assert.notEqual(buildCtaAstBeforeCropHtml(), buildCtaAstAfterCropHtml(), "CTA AST crops must not be twins");
assert.notEqual(buildKpiBeforeCropHtml(), buildKpiAfterCropHtml(), "KPI crops must not be twins");
assert.notEqual(buildKpiAstBeforeCropHtml(), buildKpiAstAfterCropHtml(), "KPI AST crops must not be twins");
assert.notEqual(buildWrongCiteBeforeCropHtml(), buildWrongCiteAfterCropHtml(), "cite crops must not be twins");
assert.notEqual(
  buildDualGridBeforeCropHtml(),
  buildXorFoldCropHtml({ keptTitle: "Queue", chipLabel: "David's 10 today" }),
  "dual-grid crops must not be twins",
);
assert.notEqual(buildUsulFocalBeforeCropHtml(), buildUsulFocalAfterCropHtml(), "usul crops must not be twins");
assert.notEqual(buildSledBloatBeforeCropHtml(), buildSledBloatAfterCropHtml(), "sled-bloat crops must not be twins");

assert.ok(DEFECT_CROP_PAIRS.length >= 8, "at least 8 pinned crop pairs");
for (const id of [
  "queue-cta",
  "queue-cta-tsx",
  "queue-kpi",
  "queue-kpi-tsx",
  "sources-cite",
  "queue-dual-grid",
  "usul-focal",
  "queue-sled-bloat",
]) {
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
  `defect-crops PASS: ${DEFECT_CROP_PAIRS.length} FAIL→PASS pairs (CTA · CTA-TSX-AST · KPI · KPI-TSX-AST · wrong-cite · dual-grid XOR · dual-grid-TSX-AST · Usul focal · Sled bloat)`,
);
