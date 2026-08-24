import assert from "node:assert/strict";
import {outputQualityGaps} from "./quality.mjs";
const clone=i=>({id:`queue-${i}`,category:"datagrid",structureFingerprint:"same",visiblePhrases:["Review evidence before deciding"],decisionData:{status:"Needs review",owner:"Team 1"}});
for(let n=0;n<20;n++)assert(outputQualityGaps(Array.from({length:6},(_,i)=>clone(i))).length>=3,"clone/copy/data escape");
const distinct=Array.from({length:6},(_,i)=>({id:`q${i}`,category:"datagrid",structureFingerprint:`s${i}`,visiblePhrases:[`Job ${i} evidence`],decisionData:{value:i}}));
assert.deepEqual(outputQualityGaps(distinct),[]);
console.log("benchmark quality PASS: clone structure, repeated copy and repeated decision data bite 20/20; distinct path passes");
