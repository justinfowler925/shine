#!/usr/bin/env node
//
// The region census measures real boxes, so its floors are locked here.
//
// A summary band used to need 160x60. A dense scoreboard — caps label over a
// 28px numeral, three or four in a row — measures about 54px, so a board whose
// whole design is that density (the ELT weekly board's band is 238x54) reported
// zero summary regions and could never satisfy a cite that requires one. The
// floor is the same relaxation navigation already took, and for the same
// reason; the width floor stays higher so a lone stat chip cannot pass for a
// page-level summary.
//
import assert from "node:assert/strict";
import { load } from "./deps.mjs";
import { capturePage } from "./compare/capture.mjs";

const { chromium } = load("playwright");

/** One box of the given size carrying the marker the census looks for. */
const page = (attr, w, h) => `<!doctype html><html data-cite="x"><body style="margin:0">
  <div ${attr} style="width:${w}px;height:${h}px">band</div>
</body></html>`;

const browser = await chromium.launch();
const census = async (html) => {
  const p = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await p.setContent(html, { waitUntil: "load" });
  const { facts } = await capturePage(p);
  await p.close();
  return facts;
};

try {
  // The case that was wrong: a real scoreboard at the ELT board's own size.
  assert.equal((await census(page("data-summary", 238, 54))).summaryCount, 1,
    "a 238x54 scoreboard is a summary region");

  // Still excluded: too short to be a band of figures, and too narrow to be a
  // page-level summary however tall it is.
  assert.equal((await census(page("data-summary", 238, 24))).summaryCount, 0,
    "a 24px-tall strip is not a summary region");
  assert.equal((await census(page("data-summary", 120, 90))).summaryCount, 0,
    "a lone narrow stat chip is not a page-level summary");

  // Every selector the census accepts reaches the same floor.
  for (const attr of ['data-summary', 'data-region="weekly-summary"', 'class="metrics"', 'class="stats"'])
    assert.equal((await census(page(attr, 238, 54))).summaryCount, 1, `${attr} at 238x54 counts`);

  // Navigation keeps its own, lower width floor — a peer-control row.
  assert.equal((await census(page('data-region="owner-navigation"', 130, 44))).navigationCount, 1,
    "a compact peer-control row is navigation");
  assert.equal((await census(page('data-region="owner-navigation"', 110, 44))).navigationCount, 0,
    "an incidental one-link wrapper is not page-level navigation");

  console.log("region census PASS: summary 160x40, navigation 120x40; narrow and short boxes still refused");
} finally {
  await browser.close();
}
