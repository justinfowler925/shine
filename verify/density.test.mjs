#!/usr/bin/env node
// M2 — Density / shell fail-closed: chrome-heavy SaaS shells cannot dodge the
// app-shell content-share floor by omitting data-shine-probe="app-shell".
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  APP_SHELL_CONTENT_SHARE_FLOOR,
  densityGateApplies,
  isDensityShellScreen,
  isMarketingSurface,
} from "./density.mjs";

const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const measure = join(SHINE, "verify/measure.mjs");

assert.equal(APP_SHELL_CONTENT_SHARE_FLOOR, 0.28);
assert.ok(isDensityShellScreen("dashboard"));
assert.ok(isDensityShellScreen("app-shell"));
assert.ok(isDensityShellScreen("settings"));
assert.equal(isDensityShellScreen("queue"), false);
assert.ok(isMarketingSurface({ citeId: "magicui-hero" }));
assert.ok(isMarketingSurface({ screen: "marketing" }));

// Pure policy matrix
assert.equal(densityGateApplies({ appShellProbe: true }), true, "probe always applies");
assert.equal(densityGateApplies({ isWireframe: true, appShellProbe: true }), false, "wireframe skips even with probe");
assert.equal(densityGateApplies({ lane: "saas" }), true, "saas lane alone fails closed");
assert.equal(densityGateApplies({ lane: "internal" }), true, "internal lane alone fails closed");
assert.equal(densityGateApplies({ lane: "marketing" }), false, "marketing lane without probe skips");
assert.equal(densityGateApplies({ lane: "saas", citeScreen: "queue" }), false, "non-shell cite unchanged");
assert.equal(densityGateApplies({ lane: "saas", citeScreen: "form" }), false, "form cite unchanged");
assert.equal(densityGateApplies({ citeScreen: "dashboard" }), true, "dashboard cite without probe");
assert.equal(densityGateApplies({ citeScreen: "settings" }), true, "settings cite without probe");
assert.equal(densityGateApplies({ citeScreen: "app-shell" }), true, "app-shell cite without probe");
assert.equal(densityGateApplies({ citeKind: "dashboard" }), true, "kind alias");
assert.equal(densityGateApplies({ citeJobs: ["dashboard", "analytics"] }), true, "jobs hint");
assert.equal(
  densityGateApplies({ lane: "saas", citeId: "shadcn-marketing", citeScreen: "marketing" }),
  false,
  "marketing cite under saas skips",
);
assert.equal(
  densityGateApplies({ lane: "saas", citeId: "magicui-hero" }),
  false,
  "marketing id under saas skips",
);
assert.equal(densityGateApplies({}), false, "anonymous measure without lane/cite/probe skips");

const chromeHeavy = (attrs = "") =>
  `<!doctype html><html lang="en"${attrs}><head><meta charset="utf-8"><title>Density</title><style>` +
  `:root{color-scheme:dark}body{margin:0;background:#0c0a09;color:#fafaf9;font:15px/1.5 system-ui;display:flex}` +
  `aside{width:420px;height:100vh;border-right:1px solid #333;padding:16px}` +
  `main{flex:1;padding:16px}button{background:#a8a29e;color:#0c0a09;border:0;padding:10px 16px;font:inherit}` +
  `</style></head><body>` +
  `<aside><p>Nav</p><p>Item</p><p>Item</p></aside>` +
  `<main><h1>Almost empty</h1><p><button>Open</button></p></main></body></html>`;

const dir = mkdtempSync(join(tmpdir(), "shine-density-"));
const run = (file, extraArgs = []) =>
  spawnSync(process.execPath, [measure, file, ...extraArgs], {
    encoding: "utf8",
    cwd: SHINE,
    env: { ...process.env, NODE_PATH: join(SHINE, "node_modules") },
  });

try {
  // 1. Probe still bites (legacy)
  const withProbe = join(dir, "probe.html");
  writeFileSync(withProbe, chromeHeavy(` data-shine-probe="app-shell"`));
  const probeRun = run(withProbe);
  assert.equal(probeRun.status, 1, "probe chrome-heavy exits 1");
  assert.match(`${probeRun.stderr}${probeRun.stdout}`, /density: app-shell content share/, "probe density message");

  // 2. Same shell WITHOUT probe + --lane saas → hard-fail (the dodge)
  const noProbe = join(dir, "no-probe.html");
  writeFileSync(noProbe, chromeHeavy());
  const saasRun = run(noProbe, ["--lane", "saas"]);
  assert.equal(saasRun.status, 1, "saas lane chrome-heavy without probe exits 1");
  assert.match(`${saasRun.stderr}${saasRun.stdout}`, /density: app-shell content share/, "saas lane density message");

  const internalRun = run(noProbe, ["--lane", "internal"]);
  assert.equal(internalRun.status, 1, "internal lane chrome-heavy without probe exits 1");

  // 3. Shell cite without probe → hard-fail
  const dashCite = run(noProbe, ["--cite", "shadcn-dashboard-01"]);
  assert.equal(dashCite.status, 1, "dashboard cite without probe exits 1");
  assert.match(`${dashCite.stderr}${dashCite.stdout}`, /density: app-shell content share/);

  // 4. Anonymous (no lane, no cite, no probe) → note only, not density hard-fail
  const anon = run(noProbe);
  const anonOut = `${anon.stderr}${anon.stdout}`;
  assert.doesNotMatch(anonOut, /density: app-shell content share/, "anonymous measure does not density-fail");

  // 5. Marketing cite unchanged (no density hard-fail without probe)
  const mkt = join(dir, "marketing.html");
  writeFileSync(
    mkt,
    `<!doctype html><html lang="en" data-cite="shadcn-marketing"><head><meta charset="utf-8"><title>Mkt</title><style>` +
      `:root{color-scheme:dark}body{margin:0;background:#0c0a09;color:#fafaf9;font:15px/1.5 system-ui}` +
      `header{height:80vh;padding:48px}h1{font-size:64px}</style></head><body>` +
      `<header data-region="hero"><h1>Launch</h1><p>Hero budget copy that fills the fold.</p>` +
      `<button style="background:#a8a29e;color:#0c0a09;border:0;padding:12px 20px;font:inherit">Start</button>` +
      `</header></body></html>`,
  );
  const mktRun = run(mkt, ["--lane", "saas", "--cite", "shadcn-marketing"]);
  const mktOut = `${mktRun.stderr}${mktRun.stdout}`;
  assert.doesNotMatch(mktOut, /density: app-shell content share/, "marketing cite under saas skips density");

  // 6. Non-shell cite (queue) under saas — no density hard-fail from lane alone
  const queueLike = join(dir, "queue-like.html");
  writeFileSync(queueLike, chromeHeavy(` data-cite="untitled-table"`));
  const queueRun = run(queueLike, ["--lane", "saas", "--cite", "untitled-table"]);
  const queueOut = `${queueRun.stderr}${queueRun.stdout}`;
  assert.doesNotMatch(queueOut, /density: app-shell content share/, "non-shell cite unchanged under saas");

  // 7. Wireframe chrome-heavy — skip density
  const wf = join(dir, "wireframe.html");
  writeFileSync(
    wf,
    chromeHeavy(` data-shine-wireframe`).replace(
      "</style>",
      `[data-shine-wireframe]{--wf:1}</style>`,
    ).replace("<body>", `<body data-shine-wireframe>`),
  );
  // Put attribute on a real element the detector finds
  writeFileSync(
    wf,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>WF</title><style>` +
      `:root{color-scheme:dark}body{margin:0;background:#0c0a09;color:#fafaf9;font:15px/1.5 system-ui;display:flex}` +
      `aside{width:420px;height:100vh;padding:16px}main{flex:1;padding:16px}</style></head>` +
      `<body data-shine-wireframe><aside><p>Nav</p></aside><main><h1>Wire</h1>` +
      `<button data-primary style="background:#a8a29e;color:#0c0a09;border:0;padding:10px 16px">Go</button>` +
      `</main></body></html>`,
  );
  const wfRun = run(wf, ["--lane", "saas"]);
  const wfOut = `${wfRun.stderr}${wfRun.stdout}`;
  assert.doesNotMatch(wfOut, /density: app-shell content share/, "wireframe skips density");

  // 8. Committed doctor fixture (no probe) fails under --lane saas
  const fixture = join(SHINE, "verify/fixtures/density-shell-no-probe.html");
  const fixtureHtml = readFileSync(fixture, "utf8");
  assert.doesNotMatch(fixtureHtml, /data-shine-probe=/, "fixture omits probe attribute");
  const fixRun = run(fixture, ["--lane", "saas"]);
  assert.equal(fixRun.status, 1, "density-shell-no-probe fixture fails under saas");
  assert.match(`${fixRun.stderr}${fixRun.stdout}`, /density: app-shell content share/);

  console.log(
    "density gates PASS: probe / saas+internal lane / shell cite fail closed; marketing, non-shell, wireframe, anonymous unchanged",
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
