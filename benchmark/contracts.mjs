export const REQUIRED_BENCHMARK_CATEGORIES=Object.freeze({datagrid:6,dashboard:4,form:4,marketing:4,lex:3,voice:3});
export function benchmarkPopulationGaps(briefs){
 const gaps=[];if(!Array.isArray(briefs)||briefs.length<24)gaps.push(`population ${(briefs||[]).length}/24`);
 for(const [category,want] of Object.entries(REQUIRED_BENCHMARK_CATEGORIES)){const got=(briefs||[]).filter(b=>b.category===category).length;if(got!==want)gaps.push(`${category} ${got}/${want}`)}
 return gaps;
}

export function humanReviewVerdict({briefs,key,choices,threshold=.75}){
 const ids=(briefs||[]).map(b=>b.id), expected=new Set(ids), seen=new Set(), gaps=[];let current=0;
 if(!ids.length)gaps.push("review denominator is zero");
 for(const choice of choices||[]){
  if(!expected.has(choice.id))gaps.push(`unknown pair ${choice.id}`);
  if(seen.has(choice.id))gaps.push(`duplicate pair ${choice.id}`);seen.add(choice.id);
  if(!["A","B","tie","unusable"].includes(choice.choice))gaps.push(`invalid choice ${choice.id}`);
  if((choice.choice==="A"||choice.choice==="B")&&key?.[choice.id]?.[choice.choice]==="current")current++;
 }
 for(const id of ids)if(!seen.has(id))gaps.push(`missing pair ${id}`);
 const denominator=ids.length,rate=denominator?current/denominator:0;
 return {pass:gaps.length===0&&rate>=threshold,rate,current,denominator,gaps};
}
