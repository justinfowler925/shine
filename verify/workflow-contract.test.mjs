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
  [/runs-on: \[self-hosted, macOS, ARM64, shine\]/, "self-hosted runner"],
  [/node verify\/doctor\.mjs --ci --quiet/, "default doctor command"],
  [/node verify\/doctor\.mjs --ci --full --quiet/, "full doctor command"],
  [/working-directory: verify\/fixtures\/integrations[\s\S]*?npm ci --ignore-scripts/, "real integration dependencies"],
];
const missing = required.filter(([pattern]) => !pattern.test(source)).map(([, label]) => label);
for (const [pattern,label] of [[/^  benchmark-smoke:\s*$/m,"benchmark-smoke job"],[/^  benchmark-full:\s*$/m,"benchmark-full job"],[/npm run benchmark:full/,"benchmark full command"],[/fetch-depth: 0/,"baseline history checkout"]]) if(!pattern.test(benchmark)) missing.push(label);
if (missing.length) {
  console.error(`workflow contract FAIL: ${missing.join(", ")}`);
  process.exit(1);
}
console.log("workflow contract PASS: default + full named lanes, self-hosted, real dependencies");
