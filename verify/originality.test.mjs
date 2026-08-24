import assert from "node:assert/strict";
import {assessStructure} from "./compare/structure.mjs";
const facts=(signature)=>({
 regions:[{name:"masthead",tag:"header",box:{share:.12}},{name:"proof",tag:"main",box:{share:.4}}],
 focalShare:.4,
 controls:[],interactions:{},tableCount:0,rowCount:0,signature,structureFingerprint:"x"
});
for(let i=0;i<20;i++){
 const stamped=assessStructure({facts:facts({name:"claims-proof",text:"Claims",box:{share:.001}}),screen:"marketing",lane:"marketing",brief:"claims",prior:[]});
 assert.match(stamped.failures.join(" "),/attribute stamp/);
 const generic=assessStructure({facts:facts({name:"owned-moment",text:"Everything in one place",box:{share:.2}}),screen:"marketing",lane:"marketing",brief:"claims",prior:[]});
 assert.match(generic.failures.join(" "),/does not name the brief subject/);
 const owned=assessStructure({facts:facts({name:"claims-evidence",text:"Claims evidence before a decision",box:{share:.2}}),screen:"marketing",lane:"marketing",brief:"claims",prior:[]});
 assert.equal(owned.failures.length,0);
}
console.log("originality PASS: attribute stamp + generic signature bite 20/20; owned region passes");
