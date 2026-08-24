import {existsSync,readFileSync} from "node:fs";
import {join} from "node:path";
import {outputQualityGaps} from "./quality.mjs";
import {validateRunRecord} from "./agent-production.mjs";

const visiblePhrases=source=>[...source.matchAll(/<(?:h1|h2|h3|p|article|button)[^>]*>([^<]{8,})<\//g)].map(x=>x[1].replace(/<[^>]+>/g,"").trim());
export function scoreAgentCorpus({briefs,records}){
 const gaps=[];const arms={};
 for(const arm of ["baseline","current"]){
  const xs=records.filter(x=>x.arm===arm);if(xs.length!==briefs.length)gaps.push(`${arm}: population ${xs.length}/${briefs.length}`);
  const ids=new Set(xs.map(x=>x.brief));for(const brief of briefs)if(!ids.has(brief.id))gaps.push(`${arm}: missing ${brief.id}`);
  const critical=xs.flatMap(x=>validateRunRecord(x).map(g=>`${arm}/${x.brief}: ${g}`));
  const qualityRows=xs.map(x=>({id:x.brief,category:briefs.find(b=>b.id===x.brief)?.category,structureFingerprint:x.receipt?.proof?.structureFingerprint,visiblePhrases:x.visiblePhrases||[],decisionData:x.decisionData||null}));
  const quality=outputQualityGaps(qualityRows);const material=xs.filter(x=>JSON.stringify(x.receipt?.proof?.pagePalette||[])!==JSON.stringify(x.receipt?.proof?.templatePalette||[])).length;
  arms[arm]={population:xs.length,critical,quality,kitMateriality:{measured:material,total:xs.length}};
  if(arm==="current")gaps.push(...critical,...quality.map(x=>`current quality: ${x}`));
 }
 return {version:1,population:briefs.length,arms,gaps,automatedGate:gaps.length?"fail":"pass",humanReview:"pending-valid-baseline-corpus"};
}

export function loadAgentCorpus(root,briefs){
 const records=[];for(const arm of ["baseline","current"])for(const b of briefs){const file=join(root,arm,b.id,"record.json");if(!existsSync(file))continue;const record=JSON.parse(readFileSync(file,"utf8"));const source=existsSync(record.artifact)?readFileSync(record.artifact,"utf8"):"";record.visiblePhrases=visiblePhrases(source);record.decisionData=[...source.matchAll(/\b\d[\d,.%$kKmM]*\b/g)].slice(0,20).map(x=>x[0]);records.push(record)}return records;
}
