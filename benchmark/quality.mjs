const norm=s=>String(s||"").toLowerCase().match(/[a-z0-9]+/g)||[];
export function outputQualityGaps(rows){
 const gaps=[];
 const byCategory=new Map();
 for(const row of rows){const xs=byCategory.get(row.category)||[];xs.push(row);byCategory.set(row.category,xs)}
 for(const [category,xs] of byCategory){
  const unique=new Set(xs.map(x=>x.structureFingerprint)).size;
  if(xs.length>1&&unique/xs.length<.5)gaps.push(`${category}: ${unique}/${xs.length} distinct structures`);
 }
 const phrases=new Map();
 for(const row of rows)for(const phrase of row.visiblePhrases||[]){const key=norm(phrase).join(" ");if(key.length<12)continue;const ids=phrases.get(key)||new Set();ids.add(row.id);phrases.set(key,ids)}
 for(const [phrase,ids] of phrases)if(ids.size>=3)gaps.push(`repeated copy across ${ids.size} briefs: ${phrase.slice(0,60)}`);
 const data=new Map();
 for(const row of rows){const key=JSON.stringify(row.decisionData||null);if(key==="null")continue;const ids=data.get(key)||[];ids.push(row.id);data.set(key,ids)}
 for(const [key,ids] of data)if(ids.length>=3)gaps.push(`repeated decision data across ${ids.length} briefs: ${key.slice(0,80)}`);
 return gaps;
}
