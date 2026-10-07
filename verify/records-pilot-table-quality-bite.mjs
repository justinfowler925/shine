#!/usr/bin/env node
/**
 * Doctor bite — records/worklist operate pilot table-quality deepen.
 * Proves kind=worklist contract + shine-tables.json fixture path is wired into
 * denoise recommend for records jobs, and that the fixture auditTables PASS.
 */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import catalog from "../corpus/templates.json" with { type: "json" };
import {
  RECORDS_WORKLIST_TABLE_FIXTURE as REC_FIXTURE_FROM_RECOMMEND,
  recommendPattern,
  tableQualityForRecordsJob,
} from "../corpus/recommend.mjs";
import { createDesignPacket } from "../core/design-packet.mjs";
import { load } from "./deps.mjs";
import {
  RECORDS_WORKLIST_TABLE_FIXTURE,
  WORKLIST_CASES,
  auditTables,
} from "./table-quality.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIX = join(ROOT, "verify/fixtures/records-worklist");
const PILOT_CONTRACT = join(ROOT, "benchmark/records-pilot/shine-tables.json");
const doctorSrc = readFileSync(join(ROOT, "verify/doctor.mjs"), "utf8");
const pkg = readFileSync(join(ROOT, "package.json"), "utf8");

let passed = 0;
const bite = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`PASS bite ${name}`);
};

await bite("fixture path constants agree", () => {
  assert.equal(RECORDS_WORKLIST_TABLE_FIXTURE, REC_FIXTURE_FROM_RECOMMEND);
  assert.equal(RECORDS_WORKLIST_TABLE_FIXTURE, "verify/fixtures/records-worklist/shine-tables.json");
});

await bite("worklist fixture + pilot companion exist", () => {
  assert.ok(existsSync(join(FIX, "shine-tables.json")), "fixture contract");
  assert.ok(existsSync(join(FIX, "worklist.html")), "fixture html");
  assert.ok(existsSync(PILOT_CONTRACT), "pilot companion");
  const fixture = JSON.parse(readFileSync(join(FIX, "shine-tables.json"), "utf8"));
  const pilot = JSON.parse(readFileSync(PILOT_CONTRACT, "utf8"));
  assert.equal(fixture.version, 1);
  assert.equal(fixture.grids[0].kind, "worklist");
  assert.ok(fixture.grids[0].reason?.trim());
  for (const name of WORKLIST_CASES) {
    assert.ok(fixture.grids[0].cases?.[name]?.steps?.length, `fixture case ${name}`);
  }
  assert.equal(pilot.grids[0].kind, "worklist");
  assert.equal(pilot.grids[0].selector, "#records");
  assert.equal(pilot.grids[0].toolbar, "#toolbar");
  assert.equal(pilot.grids[0].executableFixture, RECORDS_WORKLIST_TABLE_FIXTURE);
});

await bite("pilot HTML binds #records + #toolbar", () => {
  const html = readFileSync(join(ROOT, "benchmark/records-pilot/index.html"), "utf8");
  assert.match(html, /id="records"/);
  assert.match(html, /id="toolbar"/);
  assert.match(html, /data-region="focal"/);
});

await bite("recommend emits tableQuality.fixture for records jobs", () => {
  const jobs = [
    { job: "records inspect edit persist worklist", category: "record" },
    { job: "Operate worklist list to detail", category: "datagrid" },
    { job: "customer account record detail", category: "record" },
    { job: "queue triage inbox worklist", category: "queue" },
  ];
  for (const { job, category } of jobs) {
    const rec = recommendPattern(catalog.templates, job, { lane: "saas", category, limit: 6 });
    assert.ok(rec.tableQuality, `${job}: tableQuality`);
    assert.equal(rec.tableQuality.fixture, RECORDS_WORKLIST_TABLE_FIXTURE, job);
    assert.equal(rec.tableQuality.contract, "shine-tables.json", job);
    assert.ok(["worklist", "records"].includes(rec.tableQuality.kind), job);
    assert.match(rec.tableQuality.instruction || "", /shine-tables|worklist|DataGrid/i);
    const direct = tableQualityForRecordsJob(job, { category });
    assert.equal(direct.fixture, RECORDS_WORKLIST_TABLE_FIXTURE);
  }
  const settings = recommendPattern(catalog.templates, "account settings preferences", {
    lane: "saas",
    category: "form",
    limit: 6,
  });
  assert.equal(settings.tableQuality, null, "settings job must not bind records worklist fixture");
});

await bite("denoise packet binds fixture into tableQuality.example", () => {
  const packet = createDesignPacket({
    job: "Records inspect → edit → persist on the Operate worklist",
    lane: "saas",
    mode: "denoise",
    category: "record",
    project: ROOT,
    accept: true,
  });
  assert.ok(packet.recommendation?.tableQuality?.fixture);
  assert.equal(packet.recommendation.tableQuality.fixture, RECORDS_WORKLIST_TABLE_FIXTURE);
  assert.match(packet.tableQuality.example, /records-worklist\/shine-tables\.json$/);
  assert.match(packet.tableQuality.fixture, /records-worklist\/shine-tables\.json$/);
  assert.match(packet.recommendation.instruction || "", /tableQuality\.fixture/);
});

await bite("doctor + npm script wire this bite", () => {
  assert.match(doctorSrc, /records-pilot-table-quality-bite\.mjs/);
  assert.match(pkg, /records-pilot-table-quality-bite/);
});

const server = createServer((req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  try {
    const file = readFileSync(join(FIX, path === "/" ? "worklist.html" : path));
    const type = path.endsWith(".js")
      ? "text/javascript"
      : path.endsWith(".css")
        ? "text/css"
        : path.endsWith(".json")
          ? "application/json"
          : "text/html";
    res.setHeader("Content-Type", type);
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await load("playwright").chromium.launch();
try {
  await bite("fixture auditTables PASS (kind=worklist)", async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(`${base}/worklist.html`, { waitUntil: "networkidle" });
      const result = await auditTables({
        page,
        target: `${base}/worklist.html`,
        contractPath: join(FIX, "shine-tables.json"),
        timeout: 2000,
      });
      assert.equal(
        result.status,
        "passed",
        JSON.stringify(result.checks.filter((c) => c.status !== "passed"), null, 2),
      );
      assert.ok(result.checks.some((c) => c.name.includes("worklist presentation")));
      for (const name of WORKLIST_CASES) {
        assert.ok(
          result.checks.some((c) => c.name.endsWith(` ${name}`) && c.status === "passed"),
          name,
        );
      }
    } finally {
      await context.close();
    }
  });

  await bite("worklist rejects static escape hatch", async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(`${base}/worklist.html`, { waitUntil: "networkidle" });
      const bad = {
        version: 1,
        project: ".",
        grids: [
          {
            selector: "#records",
            kind: "static",
            reason: "pretend interactive worklist is static",
          },
        ],
      };
      const tmp = join(FIX, ".bite-static.json");
      const { writeFileSync, unlinkSync } = await import("node:fs");
      writeFileSync(tmp, JSON.stringify(bad));
      try {
        const result = await auditTables({
          page,
          target: `${base}/worklist.html`,
          contractPath: tmp,
          timeout: 500,
        });
        assert.equal(result.status, "failed");
        assert.ok(
          result.checks.some((c) => /interactive records/i.test(`${c.name} ${c.reason}`)),
          JSON.stringify(result.checks),
        );
      } finally {
        unlinkSync(tmp);
      }
    } finally {
      await context.close();
    }
  });
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}

console.log(`records-pilot-table-quality-bite.mjs: ok (${passed} bites)`);
