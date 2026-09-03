#!/usr/bin/env node
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compareProduct } from "./compare-product.mjs";

const root=dirname(fileURLToPath(import.meta.url)),fixture=(name)=>join(root,"fixtures",name);
const pass=await compareProduct({target:fixture("product-match.html"),reference:fixture("product-precedent.html"),outPath:"/tmp/shine-product-match.png"});
assert.equal(pass.status,0,pass.failures.join("; "));
const fail=await compareProduct({target:fixture("product-divergence.html"),reference:fixture("product-precedent.html"),outPath:"/tmp/shine-product-divergence.png"});
assert.equal(fail.status,1);
assert.match(fail.failures.join("; "),/missing product pattern action-flow|root changed from div to table/);
console.log("product consistency PASS: shared precedent accepted · parallel table invention rejected");
