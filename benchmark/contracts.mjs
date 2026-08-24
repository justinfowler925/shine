export const REQUIRED_BENCHMARK_CATEGORIES=Object.freeze({datagrid:6,dashboard:4,form:4,marketing:4,lex:3,voice:3});
export function benchmarkPopulationGaps(briefs){
 const gaps=[];if(!Array.isArray(briefs)||briefs.length<24)gaps.push(`population ${(briefs||[]).length}/24`);
 for(const [category,want] of Object.entries(REQUIRED_BENCHMARK_CATEGORIES)){const got=(briefs||[]).filter(b=>b.category===category).length;if(got!==want)gaps.push(`${category} ${got}/${want}`)}
 return gaps;
}
