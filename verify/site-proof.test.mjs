import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public rebuild proof compares two real page captures", async () => {
  const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
  const comparison = html.match(/<div class="compare" data-testid="rebuild-comparison">([\s\S]*?)<\/div><\/div><\/section>/)?.[1] ?? "";

  assert.match(comparison, /src="\/img\/shine-v3-before-fold\.png"/);
  assert.match(comparison, /src="\/img\/shine-v4-after-fold\.png"/);
  assert.equal((comparison.match(/<img\b/g) ?? []).length, 2);
  assert.equal((comparison.match(/width="1280" height="800"/g) ?? []).length, 2);
  assert.doesNotMatch(comparison, /after-visual|after-card/);
});
