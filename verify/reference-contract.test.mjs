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
console.log("reference contract PASS: generic dashboard fails shadcn + Untitled structure; declared relative passes");
