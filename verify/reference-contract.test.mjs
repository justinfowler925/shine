import assert from "node:assert/strict";
import {assessStructure} from "./compare/structure.mjs";
import {assessVisual} from "./compare/visual.mjs";

const facts={regions:[{tag:"main",role:"",name:"dashboard",box:{share:.7}},{tag:"section",role:"",name:"summary",box:{share:.2}}],focalShare:.7,tableCount:1,rowCount:4,toolbar:true,controls:[{tag:"button"}],interactions:{search:true,sort:true,page:true,rowAction:true,primary:true,form:false},navigationCount:0,chartCount:0,summaryCount:1,density:.2,signature:null,structureFingerprint:"generic",typography:[],palette:[],spacing:[],radii:[],bodyFont:"Arial",bodySize:"16px",bodyBg:"white",bodyColor:"black",voice:"adapted",adaptation:"generic cards and table",family:""};
const shadcn=assessStructure({facts,screen:"dashboard",reference:{required:["navigation","summary","chart","table"]}});
assert.match(shadcn.failures.join(" "),/navigation required/);assert.match(shadcn.failures.join(" "),/chart required/);
const untitled=assessStructure({facts,screen:"dashboard",reference:{required:["chart"]}});assert.match(untitled.failures.join(" "),/chart required/);
const related=structuredClone(facts);related.navigationCount=1;related.chartCount=1;
assert.deepEqual(assessStructure({facts:related,screen:"dashboard",reference:{required:["navigation","summary","chart","table"]}}).failures,[]);
const row={dna:{family:"shadcn-zinc"},reference:{required:["chart"]}};
assert.match(assessVisual({facts:{...related,voice:"",adaptation:""},row}).failures.join(" "),/data-shine-voice/);
assert.match(assessVisual({facts:{...related,voice:"adapted",adaptation:""},row}).failures.join(" "),/structural adaptation/);
assert.match(assessVisual({facts:{...related,voice:"kit-faithful",family:"untitled"},row}).failures.join(" "),/kit-faithful family/);
/*
 * Every authored blueprint declares the selector that proves it rendered.
 *
 * capture-local.mjs used to expect `article details` for everything that was
 * not a broadcast. That is true only of a blog post, so shadcn-queue and
 * shadcn-weekly-board could never be recaptured: their captures stayed legacy,
 * referenceHealth stayed not_tested, and every prove.mjs run citing them
 * reported referenceValidity and visualComparison as not_tested — a completion
 * receipt was unreachable no matter how good the surface was.
 */
{
  const { existsSync, readFileSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const SHINE = join(dirname(fileURLToPath(import.meta.url)), "..");
  const rows = JSON.parse(readFileSync(join(SHINE, "corpus/templates.json"), "utf8")).templates;
  const authored = rows.filter((r) => r.kind === "blueprint" && existsSync(join(SHINE, "corpus/blueprints", r.id, "reference.html")));
  assert.ok(authored.length >= 4, "expected authored blueprints to exist");
  const bare = /^(?:body|main|h1|a|header|article)\s*$/;
  for (const row of authored) {
    const expect = row.reference?.captureExpect;
    assert.ok(expect, `${row.id}: authored blueprint must declare reference.captureExpect`);
    // captureHealth rejects a selector that proves nothing; catch it here, at
    // declaration time, rather than after a capture run.
    assert.ok(expect.split(",").some((part) => !bare.test(part.trim())),
      `${row.id}: captureExpect "${expect}" is not a meaningful selector`);
    const html = readFileSync(join(SHINE, "corpus/blueprints", row.id, "reference.html"), "utf8");
    const marker = expect.startsWith("[") ? expect.slice(1, -1).split("=")[0] : expect.split(/[\s>]/).pop();
    assert.ok(html.includes(marker), `${row.id}: reference.html contains no ${marker} for captureExpect ${expect}`);
  }
  // and the capture tool refuses to guess when a blueprint has not declared one
  const capture = readFileSync(join(SHINE, "corpus/capture-local.mjs"), "utf8");
  assert.match(capture, /Refusing to guess/, "capture-local must refuse an undeclared expectation");
  assert.doesNotMatch(capture, /'article details'/, "capture-local must not hardcode a blueprint expectation");
  console.log(`  blueprint capture expectations: ${authored.length} declared and present`);
}

console.log("reference contract PASS: generic dashboard fails shadcn + Untitled structure; declared relative passes");
