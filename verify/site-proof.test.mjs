import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const captures = {
  "shine-v3-before.png": {
    width: 1280,
    height: 4255,
    sha256: "5dab5d922630c60e5757e1de401b542063243230697af072fdf5d85a611962d1",
  },
  "shine-v4-after.png": {
    width: 1280,
    height: 4321,
    sha256: "01aa797fd033064631f314e0fc10198142445e0d14eafea6b251a3a6bba8c70d",
  },
  "shine-v3-before-fold.png": {
    width: 1280,
    height: 800,
    sha256: "e355bd6f8365b89b7ec67e908c874f03a5a6a916ae1baeb6ded6564e7ddd0a2e",
    source: "shine-v3-before.png",
  },
  "shine-v4-after-fold.png": {
    width: 1280,
    height: 800,
    sha256: "36466521c4df2dc24c142828f37d10a34961c936f6badc83951feb5e6e2e8f86",
    source: "shine-v4-after.png",
  },
};

const digest = (buffer) => createHash("sha256").update(buffer).digest("hex");

const readCapture = async (name) => {
  const buffer = await readFile(new URL(`../site/img/${name}`, import.meta.url));
  const metadata = await sharp(buffer).metadata();
  return { buffer, metadata };
};

test("public rebuild proof compares two real page captures", async () => {
  const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");
  const comparison = html.match(/<div class="compare" data-testid="rebuild-comparison">([\s\S]*?)<\/div><\/div><\/section>/)?.[1] ?? "";

  assert.match(comparison, /src="\/img\/shine-v3-before-fold\.png"/);
  assert.match(comparison, /src="\/img\/shine-v4-after-fold\.png"/);
  assert.equal((comparison.match(/<img\b/g) ?? []).length, 2);
  assert.equal((comparison.match(/width="1280" height="800"/g) ?? []).length, 2);
  assert.doesNotMatch(comparison, /after-visual|after-card/);
});

test("reviewed V3 and V4 pixels are immutable and folds are exact first-viewport crops", async () => {
  for (const [name, expected] of Object.entries(captures)) {
    const { buffer, metadata } = await readCapture(name);
    assert.equal(metadata.width, expected.width, `${name} width drifted`);
    assert.equal(metadata.height, expected.height, `${name} height drifted`);
    assert.equal(digest(buffer), expected.sha256, `${name} no longer matches the reviewed capture`);

    if (expected.source) {
      const { buffer: source } = await readCapture(expected.source);
      const crop = await sharp(source)
        .extract({ left: 0, top: 0, width: expected.width, height: expected.height })
        .png()
        .toBuffer();
      assert.equal(digest(crop), expected.sha256, `${name} is not the first fold of ${expected.source}`);
    }
  }

  const unrelated = await sharp({
    create: { width: 1280, height: 800, channels: 3, background: "#ffffff" },
  }).png().toBuffer();
  assert.notEqual(
    digest(unrelated),
    captures["shine-v3-before-fold.png"].sha256,
    "same-dimension unrelated pixels must fail the capture identity gate",
  );
});
