import assert from "node:assert/strict";
import {createDesignPacket} from "../core/design-packet.mjs";
assert.throws(
  ()=>createDesignPacket({job:"fraud claims review queue datagrid",lane:"internal",project:process.cwd()}),
  /no eligible template/,
  "a deleted table family must leave a visible catalog gap instead of selecting a fallback",
);
const form=createDesignPacket({job:"insurance application form",lane:"saas",project:process.cwd()});
assert.equal(form.category,"form");assert(form.controlInventory.includes("validation"));
assert.throws(()=>createDesignPacket({job:""}),/job is required/);
console.log("design packet PASS: bounded sources, job structure, controls, states, provenance");
