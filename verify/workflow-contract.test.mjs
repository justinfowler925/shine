#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, ".github/workflows/doctor.yml"), "utf8");
const benchmark = readFileSync(join(root, ".github/workflows/benchmark.yml"), "utf8");
const required = [
  [/^  doctor-default:\s*$/m, "doctor-default job"],
  [/^  doctor-full:\s*$/m, "doctor-full job"],
  [/runs-on:\s*ubuntu-latest/, "github-hosted ubuntu-latest runner"],
  [/node verify\/doctor\.mjs --ci --quiet/, "default doctor command"],
  [/node verify\/doctor\.mjs --ci --full --quiet/, "full doctor command"],
  [/working-directory: verify\/fixtures\/integrations[\s\S]*?npm ci --ignore-scripts/, "real integration dependencies"],
  [/npx playwright install --with-deps chromium/, "playwright bootstrap on clean runner"],
];
const missing = required.filter(([pattern]) => !pattern.test(source)).map(([, label]) => label);
for (const [pattern, label] of [
  [/^  benchmark-smoke:\s*$/m, "benchmark-smoke job"],
  [/^  benchmark-full:\s*$/m, "benchmark-full job"],
  [/npm run benchmark:full/, "benchmark full command"],
  [/fetch-depth: 0/, "baseline history checkout"],
  [/runs-on:\s*ubuntu-latest/, "benchmark github-hosted ubuntu-latest runner"],
]) {
  if (!pattern.test(benchmark)) missing.push(label);
}
const runsOn = [...`${source}\n${benchmark}`.matchAll(/^\s*runs-on:\s*(.+)$/gm)].map((m) => m[1]);
if (!runsOn.length || runsOn.some((v) => !/^ubuntu-latest\s*$/.test(v))) {
  missing.push("every runs-on must be ubuntu-latest");
}
if (missing.length) {
  console.error(`workflow contract FAIL: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("workflow contract PASS: default + full named lanes, ubuntu-latest, real dependencies");
