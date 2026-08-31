#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scaffold } from "../integrations/scaffold.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const fixture = join(root, "fixtures", "integrations");
const tsc = join(fixture, "node_modules", ".bin", "tsc");
const dir = mkdtempSync(join(fixture, ".bite-"));
const check = (name, source, reason) => {
  const file = join(dir, `${name}.tsx`);
  writeFileSync(file, source);
  const run = spawnSync(tsc, ["--noEmit", "--skipLibCheck", "--jsx", "react-jsx", "--module", "ESNext", "--moduleResolution", "Bundler", file], { encoding: "utf8" });
  const output = `${run.stdout}${run.stderr}`;
  if (run.status === 0 || !reason.test(output)) throw new Error(`${name}: seeded failure escaped (exit ${run.status}) ${output.slice(-300)}`);
  console.log(`integration bite PASS: ${name} · exit=${run.status}`);
};
try {
  for (const kit of ["shadcn-tanstack"]) {
    const generated = join(dir, kit);
    const { source } = scaffold(fixture, generated, kit);
    const file = join(generated, "ShineDataGrid.tsx");
    const run = spawnSync(tsc, ["--noEmit", "--skipLibCheck", "--jsx", "react-jsx", "--module", "ESNext", "--moduleResolution", "Bundler", "--noImplicitAny", "false", file], { encoding: "utf8" });
    if (run.status !== 0) throw new Error(`${kit}: generated scaffold did not typecheck against installed runtime: ${`${run.stdout}${run.stderr}`.slice(-500)}`);
    if (!source.includes("@") && kit !== "native" && kit !== "lex") throw new Error(`${kit}: generated scaffold omitted its runtime import`);
    const contract=JSON.parse(readFileSync(join(generated,"shine-integration.json"),"utf8"));
    for(const control of ["search","sort","filters","column visibility","pagination","row selection","row actions"])if(!contract.requiredControls.includes(control))throw new Error(`${kit}: contract omitted ${control}`);
    for(const state of ["loading","empty","error","populated"])if(!contract.requiredStates.includes(state))throw new Error(`${kit}: contract omitted ${state}`);
    console.log(`integration scaffold PASS: ${kit} · genuine package typecheck`);
  }
  // Seeded failures run against the runtime Shine actually recommends. They used
  // to import @mui/x-data-grid and @carbon/react, which meant proving the gate
  // bites required installing two runtimes no consumer builds against.
  check("renamed-api", `import { InventedTableFeature } from "@tanstack/react-table"; export const feature = InventedTableFeature;`, /no exported member.*InventedTableFeature/i);
  check("missing-package", `import { MissingTable } from "@tanstack/not-a-package"; export const grid = <MissingTable />;`, /Cannot find module.*@tanstack\/not-a-package/i);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
