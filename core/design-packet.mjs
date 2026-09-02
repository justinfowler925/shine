#!/usr/bin/env node
import {existsSync, readFileSync, realpathSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {retrieveDirections} from "../corpus/art-direction.mjs";
import {findUntitledExamples} from "../corpus/untitledui.mjs";
import {detectProject, RECIPES, RECIPE_KITS} from "../integrations/resolve.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const catalog=JSON.parse(readFileSync(join(ROOT,"corpus/templates.json"),"utf8")).templates;
const categories={
 datagrid:{fallback:"queue records table",regions:["context header","decision toolbar","data grid","pagination","row detail"],controls:["search","sort","filters","column visibility","pagination","row selection","row actions"],states:["loading","empty","filtered-empty","error","populated"]},
 form:{fallback:"settings wizard form",regions:["context header","sectioned fields","validation summary","actions","confirmation"],controls:["labels","help","validation","cancel","submit"],states:["pristine","invalid","submitting","success","error"]},
 marketing:{fallback:"landing marketing conversion",regions:["navigation","evidence-led hero","product proof","workflow","conversion"],controls:["primary evidence action","secondary action"],states:["default","interaction result"]},
 dashboard:{fallback:"dashboard analytics metrics",regions:["application navigation","context header","decision summary","primary visualization","drilldown","exceptions"],controls:["time range","filters","drilldown"],states:["loading","empty","error","populated"]},
 voice:{fallback:"assistant chat citations",regions:["session context","transcript","composer","tool and source state","recovery"],controls:["send","stop or retry","inspect source"],states:["idle","listening or composing","working","success","error"]},
 record:{fallback:"record detail profile",regions:["record identity","decision summary","detail groups","activity","next actions"],controls:["edit","primary next action","related record navigation"],states:["loading","error","populated","editing","saved"]},
 lex:{fallback:"lightning record",regions:["host context","record highlights","detail","related work","record actions"],controls:["edit","save","cancel"],states:["view","edit","saving","success","error"]}
};
const signals={
 lex:[[6,/\b(salesforce|lightning|lwc|slds|lex)\b/i]],
 marketing:[[6,/\b(landing|homepage|marketing|campaign|conversion)\b/i],[5,/\b(request|book|schedule) (a )?demo\b/i],[4,/\b(buyers?|visitors?|prospects?)\b.*\b(understand|explain|learn)\b|\bexplain\b.*\bproduct\b/i]],
 voice:[[6,/\b(chat|assistant|conversation|transcript|voice)\b/i],[5,/\bfollow[- ]?up questions?\b|\binspect citations?\b|\bsources?\b.*\banswer/i]],
 dashboard:[[6,/\b(dashboard|cockpit|analytics|metrics?|kpis?|forecast)\b/i],[5,/\b(monday|weekly|daily|monthly)\b.*\b(review|meeting|call)\b/i],[4,/\b(trends?|performance|overview|rollup|portfolio)\b/i]],
 datagrid:[[6,/\b(datagrid|data grid|table|queue|worklist|inbox)\b/i],[5,/\b(triage|bulk|assign owners?|scan|sort|filter)\b/i],[4,/\b(customers?|records?|claims?|cases?|tickets?|items?)\s+(list|queue)\b|\bunresolved support\b/i]],
 form:[[6,/\b(form|checkout|application|intake|wizard|settings|preferences)\b/i],[5,/\b(abandon|drop off|complete|entering|submitted?)\b.*\b(address|field|application|setup|checkout)\b/i],[4,/\b(onboarding|setup|access|alerts?|retention|configure|control)\b/i]],
 record:[[6,/\b(record detail|detail page|profile page|case detail|claim detail|customer detail|account detail)\b/i],[5,/\b(one|single|this)\s+(claim|customer|account|case|record|ticket)\b/i],[4,/\b(adjusters?|reviewers?)\b.*\b(claim|case)\b.*\b(next action|decide|understand)\b/i]]
};

export function classifyJob(job,explicit=""){
 if(explicit){if(!categories[explicit])throw new Error(`unknown category ${explicit}; use ${Object.keys(categories).join("|")}`);return {category:explicit,confidence:"explicit",scores:{[explicit]:99}};}
 const scores=Object.fromEntries(Object.entries(signals).map(([category,rules])=>[category,rules.reduce((sum,[weight,re])=>sum+(re.test(job)?weight:0),0)]));
 const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
 if(ranked[0][1]<4||ranked[0][1]===ranked[1][1])throw new Error(`cannot infer the interface job from ${JSON.stringify(job)}; add --category ${Object.keys(categories).join("|")}`);
 return {category:ranked[0][0],confidence:ranked[0][1]-ranked[1][1]>=3?"high":"medium",scores};
}

const excerpt=(path)=>{
 const source=readFileSync(path,"utf8"),found=source.search(/^export\s+(?:default\s+)?(?:function|const|class)\b/m),start=Math.max(0,found);
 const imports=source.slice(0,Math.min(start,1400)).trim(),body=source.slice(start,start+3000).trim();
 return [imports,body].filter(Boolean).join("\n\n/* selected implementation */\n").slice(0,4400);
};
const packPaths=row=>{
 const dir=join(ROOT,"corpus/packs",row.id),manifest=join(dir,"manifest.json");
 const listed=existsSync(manifest)?JSON.parse(readFileSync(manifest,"utf8")).files:[],preferred=[...(row.entrypoints||[])];
 const ranked=[...listed].sort((a,b)=>{const rank=f=>preferred.includes(f.path)?0:/(^|\/)(page|index|app)\.(tsx|jsx|ts|js)$/.test(f.path)?1:/\.(tsx|jsx)$/.test(f.path)?2:3;return rank(a)-rank(b)||a.path.localeCompare(b.path);}).slice(0,3).map(f=>join(dir,"source",f.path)).filter(existsSync);
 return {shot:existsSync(join(dir,"shot.png"))?join(dir,"shot.png"):null,tokens:existsSync(join(dir,"tokens.css"))?join(dir,"tokens.css"):null,sourceExcerpts:ranked.map(path=>({path,excerpt:excerpt(path)}))};
};

export function createDesignPacket({job,lane="saas",project=process.cwd(),framework="",category="",mode="existing"}){
 if(!job?.trim())throw new Error("job is required");
 if(!["existing","new"].includes(mode))throw new Error("mode must be existing or new");
 const detected=detectProject(project),classification=classifyJob(job,category),kind=classification.category;
 // The installed kit decides the build recipe, so it must also constrain which
 // page reference can win — otherwise the packet contradicts itself.
 //
 // The lex lane outranks whatever is installed. A Lightning surface is hosted by
 // Salesforce, so a shadcn/Tailwind repo on disk says nothing about what can be
 // built there, and detected.framework is a filesystem guess while the lane is
 // the caller stating the target host. Reading only the guess let kit affinity
 // promote a shadcn reference over the Lightning one for a lex brief.
 const recipeKey=(lane==="lex"||detected.framework==="lex")?"lex":detected.installed[0]||"native";
 const retrieval=retrieveDirections(catalog,`${job} ${categories[kind].fallback}`,{lane,framework,licenseMode:"source",installedKits:RECIPE_KITS[recipeKey]||[],limit:12});
 if(!retrieval.selected.length)throw new Error(`no eligible template: ${retrieval.gaps.join("; ")}`);
 const shape=({template,score,matches,distance,port,portNote})=>({id:template.id,title:template.title,kit:template.kit,family:template.dna?.family,screen:template.screen,scope:template.scope||"page",reference:template.reference||{},score,distance,matches,...(port?{port:true,portNote}:{}),paths:packPaths(template)});
 // Page and component references are chosen from their own pools. Slicing one
 // ranked list starved the page slot as soon as the corpus carried many
 // component packs scoring on the same brief (70 shadcn chart blocks buried the
 // dashboard page reference), which read as "no composed page reference".
 const ranked=retrieval.selected.map(shape);
 const candidates=ranked.filter(item=>item.scope==="page").slice(0,3),components=ranked.filter(item=>item.scope==="component").slice(0,3);
 const allCandidates=[...candidates,...components];
 if(!candidates.length)throw new Error(`no composed page reference matched ${JSON.stringify(job)}; use --category or add a catalog page row`);
 const selected=candidates[0],examples=findUntitledExamples(job,3);
 const starter=kind==="datagrid"&&recipeKey==="native"?join(ROOT,"verify/fixtures/full-table.html"):kind==="marketing"?join(ROOT,"verify/fixtures/marketing.html"):null;
 const diagnosis=mode==="existing"?{required:true,reference:join(ROOT,"skill/references/diagnose.md"),command:`node ${join(ROOT,"core/diagnosis.mjs")} init --job ${JSON.stringify(job)} --category ${kind} --out shine-diagnosis.json`}:{required:false};
 const usability={required:true,reference:join(ROOT,"skill/references/usability.md"),contract:"shine-usability.json",commands:[`node ${join(ROOT,"verify/usability.mjs")} <artifact> --contract shine-usability.json --cite ${selected.id}`]};
 return {version:3,job,lane,mode,category:kind,classification,project:detected,selected,candidates,componentReferences:components,examples,starter,diagnosis,usability,regionGraph:categories[kind].regions,controlInventory:categories[kind].controls,requiredStates:categories[kind].states,integration:{key:recipeKey,contract:RECIPES[recipeKey].contract,packages:RECIPES[recipeKey].packages,imports:RECIPES[recipeKey].imports},proof:{artifactAttribute:`data-cite=\"${selected.id}\"`,commands:[`node ${join(ROOT,"verify/measure.mjs")} <artifact> --cite ${selected.id} --shot /tmp/shine-after.png`,...usability.commands,`node ${join(ROOT,"verify/compare.mjs")} <artifact> --cite ${selected.id} --lane ${lane}${mode==="existing"?" --mode existing --diagnosis shine-diagnosis.json":""}`]},gaps:retrieval.gaps};
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:"";
 try{process.stdout.write(JSON.stringify(createDesignPacket({job:opt("--job")||args[0],lane:opt("--lane")||"saas",project:resolve(opt("--project")||process.cwd()),framework:opt("--framework"),category:opt("--category"),mode:opt("--mode")||"existing"}),null,2)+"\n");}catch(error){console.error(`shine packet: ${error.message}`);process.exit(1)}
}
