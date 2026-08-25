#!/usr/bin/env node
import {existsSync, readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {retrieveDirections} from "../corpus/art-direction.mjs";
import {findUntitledExamples} from "../corpus/untitledui.mjs";
import {detectProject, RECIPES} from "../integrations/resolve.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const catalog=JSON.parse(readFileSync(join(ROOT,"corpus/templates.json"),"utf8")).templates;
const categories={
 datagrid:{test:/table|grid|queue|records|admin|remainder|claims|fraud/i,regions:["context header","decision toolbar","data grid","pagination","row detail"],controls:["search","sort","filters","column visibility","pagination","row selection","row actions"],states:["loading","empty","error","populated"]},
 form:{test:/form|application|checkout|intake|settings/i,regions:["context header","sectioned fields","validation summary","actions","confirmation"],controls:["labels","help","validation","cancel","submit"],states:["pristine","invalid","submitting","success","error"]},
 marketing:{test:/landing|marketing|homepage|launch/i,regions:["navigation","evidence-led hero","product proof","workflow","conversion"],controls:["primary evidence action","secondary action"],states:["default","interaction result"]},
 dashboard:{test:/dashboard|analytics|metrics|cockpit/i,regions:["context header","decision summary","primary visualization","drilldown","exceptions"],controls:["time range","filters","drilldown"],states:["loading","empty","error","populated"]},
 voice:{test:/voice|chat|assistant|conversation/i,regions:["session context","transcript","composer","tool and source state","recovery"],controls:["send","stop or retry"],states:["idle","listening or composing","working","success","error"]},
 lex:{test:/salesforce|lightning|lex|record/i,regions:["host context","record highlights","detail","related work","record actions"],controls:["edit","save","cancel"],states:["view","edit","saving","success","error"]}
};
const classify=job=>Object.entries(categories).find(([,v])=>v.test.test(job))?.[0]||"dashboard";
const packPaths=row=>{const dir=join(ROOT,"corpus/packs",row.id);const manifest=join(dir,"manifest.json");const files=existsSync(manifest)?JSON.parse(readFileSync(manifest,"utf8")).files.slice(0,3).map(f=>join(dir,"source",f.path)):[];return {shot:existsSync(join(dir,"shot.png"))?join(dir,"shot.png"):null,tokens:existsSync(join(dir,"tokens.css"))?join(dir,"tokens.css"):null,sourceExcerpts:files.map(path=>({path,excerpt:readFileSync(path,"utf8").slice(0,1200)}))};};

export function createDesignPacket({job,lane="saas",project=process.cwd(),framework=""}){
 if(!job?.trim())throw new Error("job is required");
 const detected=detectProject(project),category=classify(job);
 const fallback={datagrid:"queue records",form:"settings wizard",marketing:"landing marketing",dashboard:"dashboard analytics",voice:"assistant chat",lex:"lightning record"}[category];
 let retrieval=retrieveDirections(catalog,job,{lane,framework,licenseMode:"source"});
 if(!retrieval.selected.length)retrieval=retrieveDirections(catalog,`${job} ${fallback}`,{lane,framework,licenseMode:"source"});
 if(!retrieval.selected.length)throw new Error(`no eligible template: ${retrieval.gaps.join("; ")}`);
 const candidates=retrieval.selected.slice(0,3).map(({template,score,matches,distance})=>({id:template.id,title:template.title,kit:template.kit,family:template.dna?.family,score,distance,matches,paths:packPaths(template)}));
 const selected=candidates[0],recipeKey=detected.framework==="lex"?"lex":detected.installed[0]||"native";
 const examples=findUntitledExamples(job,8);
 const starter=category==="datagrid"&&recipeKey==="native"?join(ROOT,"verify/fixtures/full-table.html"):category==="marketing"?join(ROOT,"verify/fixtures/marketing.html"):null;
 return {version:1,job,lane,category,project:detected,selected,candidates,examples,starter,regionGraph:categories[category].regions,controlInventory:categories[category].controls,requiredStates:categories[category].states,integration:{key:recipeKey,contract:RECIPES[recipeKey].contract,packages:RECIPES[recipeKey].packages,imports:RECIPES[recipeKey].imports},proof:{artifactAttribute:`data-cite=\"${selected.id}\"`,commands:[`node ${join(ROOT,"verify/measure.mjs")} <artifact> --cite ${selected.id} --shot /tmp/shine-after.png`,`node ${join(ROOT,"verify/compare.mjs")} <artifact> --cite ${selected.id} --lane ${lane}`]},gaps:retrieval.gaps};
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:"";
 try{process.stdout.write(JSON.stringify(createDesignPacket({job:opt("--job")||args[0],lane:opt("--lane")||"saas",project:resolve(opt("--project")||process.cwd()),framework:opt("--framework")}),null,2)+"\n");}catch(error){console.error(`shine packet: ${error.message}`);process.exit(1)}
}
