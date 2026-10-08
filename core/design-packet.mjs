#!/usr/bin/env node
import {selectImplementation} from "../integrations/library-select.mjs";
import {existsSync, readFileSync, realpathSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {referenceHealth} from '../corpus/reference-health.mjs';
import {retrieveDirections} from "../corpus/art-direction.mjs";
import {recommendPattern,formatRecommendationSummary} from "../corpus/recommend.mjs";
import {findUntitledExamples} from "../corpus/untitledui.mjs";
import {detectProject, resolveIntegration, RECIPES, RECIPE_KITS} from "../integrations/resolve.mjs";
import {libraryInventory} from "../integrations/coverage.mjs";
import {planBlocks} from "../integrations/blocks.mjs";
import {loadTemplates} from "../corpus/catalog.mjs";
import {retrievePrinciples} from "../knowledge/retrieve.mjs";
import {recommend} from "../benchmark/judgment-eval.mjs";
import {isOperateProveScreen} from "../hooks/receipt.mjs";
import {buildDdr} from "./ddr.mjs";
import {assertNewSurfaceBrief, readBrief, wireframeBriefRef} from "./wireframe-brief.mjs";
import {resolveEditionSibling} from "./edition-siblings.mjs";
import {
  commitSiblingLearnFromResolve,
  learnedCiteBansFor,
  siblingPrefsFor,
} from "./learn.mjs";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const catalog=loadTemplates(ROOT);
const categories={
 media:{fallback:'broadcast video player',regions:['publication navigation','broadcast context','media frame','caption','playback controls','viewing notes','written reporting'],controls:['play','stop','transcript','inspect source'],states:['poster','connecting','playing','stopped','error','missing-media']},
 editorial:{fallback:'blog article editorial',regions:['masthead','headline','source attribution','figure','reporting','related stories'],controls:['read source','expand source details'],states:['populated','long-content','missing-media']},
 datagrid:{fallback:"queue records table",regions:["context header","decision toolbar","data grid","pagination","row detail"],controls:["search","sort","filters","column visibility","pagination","row selection","row actions"],states:["loading","empty","filtered-empty","error","populated"]},
 form:{fallback:"settings wizard form",regions:["context header","sectioned fields","validation summary","actions","confirmation"],controls:["labels","help","validation","cancel","submit"],states:["pristine","invalid","submitting","success","error"]},
 marketing:{fallback:"landing marketing conversion",regions:["navigation","evidence-led hero","product proof","workflow","conversion"],controls:["primary evidence action","secondary action"],states:["default","interaction result"]},
 dashboard:{fallback:"dashboard analytics metrics",regions:["application navigation","context header","decision summary","primary visualization","drilldown","exceptions"],controls:["time range","filters","drilldown"],states:["loading","empty","error","populated"]},
 voice:{fallback:"assistant chat citations",regions:["session context","transcript","composer","tool and source state","recovery"],controls:["send","stop or retry","inspect source"],states:["idle","listening or composing","working","success","error"]},
 // A card catalog is not a data grid: a handful of rich records, each with its own
 // actions and disclosure, found by search and a couple of filters. Under the ten-row
 // threshold cards are the right presentation, so the reference must not be a table.
 catalog:{fallback:"catalog cards library",regions:["context header","search and filter bar","result count","card list","card actions","card detail disclosure"],controls:["search","type filters","clear filters","per-card primary action","expand details"],states:["loading","empty","filtered-empty","error","populated"]},
 record:{fallback:"record detail profile",regions:["record identity","decision summary","detail groups","activity","next actions"],controls:["edit","primary next action","related record navigation"],states:["loading","error","populated","editing","saved"]},
 lex:{fallback:"lightning record",regions:["host context","record highlights","detail","related work","record actions"],controls:["edit","save","cancel"],states:["view","edit","saving","success","error"]}
};
const signals={
 media:[[12,/\b(video|broadcast|television|presenter|avatar|media player|tv section)\b/i]],
 editorial:[[8,/\b(newspaper|publication|editorial|article page|news site)\b/i]],
 lex:[[6,/\b(salesforce|lightning|lwc|slds|lex)\b/i]],
 marketing:[[6,/\b(landing|homepage|marketing|campaign|conversion)\b/i],[5,/\b(request|book|schedule) (a )?demo\b/i],[4,/\b(buyers?|visitors?|prospects?)\b.*\b(understand|explain|learn)\b|\bexplain\b.*\bproduct\b/i]],
 voice:[[6,/\b(chat|assistant|conversation|transcript|voice)\b/i],[5,/\bfollow[- ]?up questions?\b|\binspect citations?\b|\bsources?\b.*\banswer/i]],
 dashboard:[[6,/\b(dashboard|cockpit|analytics|metrics?|kpis?|forecast)\b/i],[5,/\b(monday|weekly|daily|monthly)\b.*\b(review|meeting|call)\b/i],[4,/\b(trends?|performance|overview|rollup|portfolio)\b/i]],
 datagrid:[[6,/\b(datagrid|data grid|table|queue|worklist|inbox)\b/i],[5,/\b(triage|bulk|assign owners?|scan|sort|filter)\b/i],[4,/\b(customers?|records?|claims?|cases?|tickets?|items?)\s+(list|queue)\b|\bunresolved support\b/i]],
 form:[[6,/\b(form|checkout|application|intake|wizard|settings|preferences)\b/i],[5,/\b(abandon|drop off|complete|entering|submitted?)\b.*\b(address|field|application|setup|checkout)\b/i],[4,/\b(onboarding|setup|access|alerts?|retention|configure|control)\b/i]],
 catalog:[[7,/\b(catalog|catalogue|library|directory|gallery|card list|cards)\b/i],[5,/\b(packages?|skills?|tools|plugins?|templates?|apps?)\b.*\b(find|browse|install|choose|pick|discover)\b/i]],
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
 // Hugo/Astro-style HTML pages open with front matter; the markup is the excerpt.
 const source=readFileSync(path,"utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,""),found=source.search(/^export\s+(?:default\s+)?(?:function|const|class)\b/m),start=Math.max(0,found);
 const imports=source.slice(0,Math.min(start,1400)).trim(),body=source.slice(start,start+3000).trim();
 return [imports,body].filter(Boolean).join("\n\n/* selected implementation */\n").slice(0,4400);
};
const packPaths=row=>{
 const dir=join(ROOT,"corpus/packs",row.id),manifest=join(dir,"manifest.json");
 const listed=existsSync(manifest)?JSON.parse(readFileSync(manifest,"utf8")).files:[],preferred=[...(row.entrypoints||[])];
 const ranked=[...listed].sort((a,b)=>{const rank=f=>preferred.includes(f.path)?0:/(^|\/)(page|index|app)\.(tsx|jsx|ts|js)$/.test(f.path)?1:/\.(tsx|jsx)$/.test(f.path)?2:3;return rank(a)-rank(b)||a.path.localeCompare(b.path);}).slice(0,3).map(f=>join(dir,"source",f.path)).filter(existsSync);
 return {shot:existsSync(join(dir,"shot.png"))?join(dir,"shot.png"):null,tokens:existsSync(join(dir,"tokens.css"))?join(dir,"tokens.css"):null,sourceExcerpts:ranked.map(path=>({path,excerpt:excerpt(path)}))};
};

/** Map Operate denoise shorthand categories onto packet kinds. */
const DENOISE_CATEGORY_ALIASES=Object.freeze({
 queue:"datagrid",
 worklist:"datagrid",
 triage:"datagrid",
 settings:"form",
 preferences:"form",
});

export function normalizePacketCategory(category=""){
 const raw=String(category||"").trim().toLowerCase();
 if(!raw)return "";
 return DENOISE_CATEGORY_ALIASES[raw]||raw;
}

export function createDesignPacket({job,lane="saas",project=process.cwd(),framework="",category="",mode="existing",productReference="",productReferenceName="",accept=false,ddrStatus="",wireframeBrief="",slug="",requireWireframeLock=false,doctorBiteOk=false,learnStorePath=undefined,learnStore=undefined}){
 if(!job?.trim())throw new Error("job is required");
 // Packet --mode: existing|new|audit|denoise. Skill procedure phases (Wireframe,
 // Build, Polish, Copy, Adoption) are agent routing — see skill/references/polish.md
 // and README § Modes — not extra packet modes and not prove categories.
 // audit: look, name, measure, report. It edits nothing and issues no completion
 // receipt. denoise: cleanup path (skill/references/denoise.md) — triage→restructure
 // →prove; refuse without --category when ambiguous; DDR must be accepted before Actor.
 if(!["existing","new","audit","denoise"].includes(mode))throw new Error("mode must be existing, new, audit or denoise");
 const reviewing=mode==="existing"||mode==="audit"||mode==="denoise";
 const explicitCategory=normalizePacketCategory(category);
 // Denoise fail-closed: always lock category explicitly (no silent inference).
 if(mode==="denoise"&&!explicitCategory){
  throw new Error(`denoise refuses without --category (queue|settings|catalog|record|dashboard|datagrid|form|…); job was ${JSON.stringify(job)}`);
 }
 const detected=detectProject(project),classification=classifyJob(job,explicitCategory),kind=classification.category;
 // The installed kit decides the build recipe, so it must also constrain which
 // page reference can win — otherwise the packet contradicts itself.
 //
 // The lex lane outranks whatever is installed. A Lightning surface is hosted by
 // Salesforce, so a shadcn/Tailwind repo on disk says nothing about what can be
 // built there, and detected.framework is a filesystem guess while the lane is
 // the caller stating the target host. Reading only the guess let kit affinity
 // promote a shadcn reference over the Lightning one for a lex brief.
 const recipeKey=(lane==="lex"||detected.framework==="lex")?"lex":detected.installed[0]||"native";
 let resolvedIntegration=null,integrationError=null;
 if(recipeKey!=="lex")try{resolvedIntegration=resolveIntegration(project);}catch(error){integrationError=error.message;}
 const integrationRecipe=resolvedIntegration?.recipe||RECIPES[recipeKey];
 const retrieval=retrieveDirections(catalog.filter(row=>referenceHealth(ROOT,row.id).status!=='failed' && (kind!=='media'||row.screen==='broadcast') && (kind!=='editorial'||row.screen==='blog')),`${job} ${categories[kind].fallback}`,{lane,framework,licenseMode:"source",installedKits:RECIPE_KITS[recipeKey]||[],limit:12});
 if(!retrieval.selected.length)throw new Error(`no eligible template: ${retrieval.gaps.join("; ")}`);
 const shape=({template,score,matches,distance,port,portNote})=>({id:template.id,title:template.title,kit:template.kit,family:template.dna?.family,screen:template.screen,scope:template.scope||"page",reference:template.reference||{},score,distance,matches,...(port?{port:true,portNote}:{}),paths:packPaths(template),referenceHealth:referenceHealth(ROOT,template.id)});
 // Page and component references are chosen from their own pools. Slicing one
 // ranked list starved the page slot as soon as the corpus carried many
 // component packs scoring on the same brief (70 shadcn chart blocks buried the
 // dashboard page reference), which read as "no composed page reference".
 const ranked=retrieval.selected.map(shape);
 // The house kit's page reference must stay in the shortlist even when three other
 // Tailwind kits outscore it on a job word: product precedent and the consumer's own
 // components are shadcn, so the shadcn composition has to remain an offered choice.
 const recipeKits=RECIPE_KITS[recipeKey]||[],houseKit=recipeKits.includes("shadcn-registry")?"shadcn-registry":recipeKits[0];
 const pages=ranked.filter(item=>item.scope==="page");
 let candidates=pages.slice(0,3);
 const housePage=pages.find(item=>item.kit===houseKit);
 if(housePage&&!candidates.includes(housePage))candidates=[...candidates.slice(0,2),housePage];
 const components=ranked.filter(item=>item.scope==="component").slice(0,3);
 const allCandidates=[...candidates,...components];
 if(!candidates.length)throw new Error(`no composed page reference matched ${JSON.stringify(job)}; use --category or add a catalog page row`);
 let selected=candidates[0];const examples=findUntitledExamples(job,3);
 const starter=kind==="datagrid"&&recipeKey==="native"?join(ROOT,"verify/fixtures/table-quality/candidate.html"):kind==="marketing"?join(ROOT,"verify/fixtures/marketing.html"):null;
 const diagnosis=reviewing?{required:true,reference:join(ROOT,"skill/references/diagnose.md"),command:`node ${join(ROOT,"core/diagnosis.mjs")} init --job ${JSON.stringify(job)} --category ${kind} --lane ${lane} --out shine-diagnosis.json`,verdicts:["defects","no-change"],instruction:mode==="denoise"
  ?"Denoise diagnose order (locked): primary job → competing CTA → empty/error triad → composition (dual-focal, KPI soup, wrong cite) → craft. No polish until primaryTaskCheck is green. Name only evidenced defects. For lane=saas Operate pages fill primaryTaskCheck, emptyErrorTriadCheck, competingCtaCheck, plus copy/adoption checks. Bind critical/major usability defects to flow:<id>. Emit shine-restructure.json when restructureRequired."
  :"Name only defects you can evidence; one real defect is a complete diagnosis. If the surface is sound, record verdict no-change with verdictEvidence and every bucket in checked, and stop. Do not invent defects or inflate severity to satisfy a count. For lane=saas Operate page categories, fill primaryTaskCheck, emptyErrorTriadCheck, competingCtaCheck, plus copyHeadlineCheck/copyBeliefCheck/copyInstructionalCheck and adoptionRitualCheck/adoptionPrivateWinCheck/adoptionAbsenceCheck (schema checks presence; honesty of the note is yours). Marketing/catalog saas jobs need the copy checks. Bind critical/major usability and adoption defects to flow:<id> assertions when a usability flow exists."}:{required:false};
 const usability={required:true,reference:join(ROOT,"skill/references/usability.md"),contract:"shine-usability.json",commands:[`node ${join(ROOT,"verify/usability.mjs")} <artifact> --contract shine-usability.json --cite ${selected.id}`]};
 const productPrecedent=reviewing?{required:true,provided:Boolean(productReference),name:productReferenceName||productReference||null,reference:productReference||null,instruction:productReference?"Reuse or extract the sibling conventions; document justified differences in shine-diagnosis.json.":"Inventory shipped sibling surfaces. If the same object or user job exists, rerun with --product-reference and --product-reference-name before editing."}:null;
 const productCommands=productReference?[`node ${join(ROOT,"verify/compare-product.mjs")} <artifact> ${JSON.stringify(productReference)} --name ${JSON.stringify(productReferenceName||productReference)}`]:[];
 const reusableBlocks=planBlocks(project,kind);
 reusableBlocks.required=detected.framework!=="native"&&detected.framework!=="lex"&&reusableBlocks.blocks.length>0;
 reusableBlocks.contract="shine-reuse.json";
 reusableBlocks.command=`node ${join(ROOT,"integrations/blocks.mjs")} --project ${JSON.stringify(resolve(project))} --contract shine-reuse.json`;
 const knowledgeHits=retrievePrinciples(job,{limit:6});
 const judgment=recommend(job,{limit:6});
 // Denoise: DDR starts proposed (Actor blocked) until --accept.
 // Other modes: DDR auto-accepted on mint for backward compatibility; still emit ddrId.
 const statusWanted=mode==="denoise"
  ?(ddrStatus==="refused"?"refused":(ddrStatus==="accepted"||accept)?"accepted":"proposed")
  :(ddrStatus==="refused"?"refused":(ddrStatus==="proposed"&&!accept)?"proposed":"accepted");
 const ddrAccepted=statusWanted==="accepted";
 const editingAllowed=mode!=="audit"&&(mode!=="denoise"||ddrAccepted)&&statusWanted!=="refused";
 const editingInstruction=mode==="audit"
  ?"Audit edits nothing: deliver shine-diagnosis.json, the before screenshot and the measure/usability facts, then stop. Building is a separate, explicit request."
  :statusWanted==="refused"
   ?"DDR refused — refuse Actor implement. Mint a revised packet or: node core/ddr.mjs refuse was already applied."
   :mode==="denoise"&&!ddrAccepted
   ?"DDR not accepted — refuse denoise implement. Rerun with --accept or: node core/ddr.mjs accept shine-packet.json"
   :mode==="denoise"
    ?"Denoise: fix structure defects in diagnose order; no polish until primaryTaskCheck green; leave what diagnosis did not name."
    :"Fix diagnosed defects in priority order; leave what the diagnosis did not name.";
 const packet={version:8,editing:{allowed:editingAllowed,instruction:editingInstruction},knowledge:{required:true,principles:knowledgeHits,instruction:"Apply retrieved principles with task-specific judgment. Do not treat the list as a checklist to satisfy; expose uncertainty when evidence conflicts."},judgment:{verdict:judgment.verdict,modality:judgment.modality,patterns:judgment.patterns,uncertainty:judgment.uncertainty,rationale:judgment.rationale,command:`node ${join(ROOT,"benchmark/judgment-eval.mjs")}`,instruction:"Machine recommendation is a starting point. Phase 1 human review remains authoritative for expertise claims."},implementationSelection:selectImplementation(project,job),surfaceAudit:{contract:"shine-surfaces.json",census:`node ${join(ROOT,"integrations/surface-audit.mjs")} --project ${JSON.stringify(resolve(project))}`,instruction:"Whole-site audits must classify every discovered route and control owner, declare workflow states, execute them against the current build, and pass the generated receipt to completion with --surface-contract and --surface-receipt. Ready-state smoke checks do not prove other workflows."},upgrades:{track:`node ${join(ROOT,"integrations/upgrade.mjs")} --project ${JSON.stringify(resolve(project))} --track <block> --path <installed-source>`,check:`node ${join(ROOT,"integrations/upgrade.mjs")} --project ${JSON.stringify(resolve(project))}`,instruction:"Track the installed baseline, review three-way changes, and apply only conflict-free compatible upgrades."},library:libraryInventory(),coverage:{contract:"shine-coverage.json",command:`node ${join(ROOT,"integrations/coverage.mjs")} --project ${JSON.stringify(resolve(project))} --contract shine-coverage.json`,instruction:"Classify the complete finished-pattern population; bind existing product implementations before installing. References are not finished blocks."},reusableBlocks,job,lane,mode,category:kind,classification,project:detected,selected,candidates,componentReferences:components,examples,starter,diagnosis,productPrecedent,usability,tableQuality:{presentation:{pattern:"summary-and-accordion",threshold:"more than 10 total dataset rows before table search and pagination",defaultExpanded:false,reference:join(ROOT,"skill/references/table-summary.md"),instruction:"Keep meaningful KPIs or an infographic visible above the adjacent collapsed shared DataGrid; preserve state and provide real drill-down."},required:"every record table, including tables nested inside dashboards",contract:"shine-tables.json",reference:join(ROOT,"skill/references/table-quality.md"),example:join(ROOT,"verify/fixtures/table-quality/shine-tables.json"),enforcedBy:["measure","compare"]},regionGraph:categories[kind].regions,controlInventory:categories[kind].controls,requiredStates:categories[kind].states,integration:{key:recipeKey,layers:recipeKey==="lex"?{styling:{name:"slds"},components:{name:"lightning"},data:{name:"lightning-datatable"}}:resolvedIntegration?.layers||detected.layers,validated:recipeKey==="lex"||Boolean(resolvedIntegration),validationError:integrationError,reference:join(ROOT,"skill/references/component-layers.md"),contract:integrationRecipe.contract,packages:integrationRecipe.packages,imports:integrationError?[]:integrationRecipe.imports},proof:{artifactAttribute:`data-cite=\"${selected.id}\"`,commands:[`node ${join(ROOT,"verify/measure.mjs")} <artifact> --cite ${selected.id} --lane ${lane} --shot /tmp/shine-after.png`,...usability.commands,...productCommands,`node ${join(ROOT,"verify/compare.mjs")} <artifact> --cite ${selected.id} --lane ${lane}${(mode==="existing"||mode==="denoise")?" --mode existing --diagnosis shine-diagnosis.json":""}`]},layout:{required:true,contract:'shine-layout.json',command:`node ${join(ROOT,'verify/layout.mjs')} <artifact> --contract shine-layout.json`,viewports:[390,768,1280,1440,1920],states:['baseline','long-content','missing-media',...(kind==='media'?['media-loaded']:[]),'large-text']},completion:{command:null,requires:[...(reusableBlocks.required?['reuse','patternCoverage']:[]),'accessibility','styling','layout','interactions','referenceValidity','visualComparison','buildBinding',...((mode==='existing'||mode==='denoise')?['defectAssertions','copyAdoption']:[])],instruction:'Individual checks are partial evidence. Only the aggregate verifier can issue completion proof. Pass the same --lane as compare so saas/marketing originality is enforced on completion. For lane=saas existing/denoise jobs, copyAdoption proves diagnosis copy/adoption check fields are present. Link prove receipt to packet.ddr.ddrId via --ddr (stamps constitutionIds from the Operate catalog).'},gaps:retrieval.gaps};
 // completion.command filled after DDR mint so --ddr can bind.
 // A reference whose capture has not been validated cannot carry completion:
 // prove.mjs requires referenceValidity to pass. Say so in the packet, up front,
 // with the passed alternatives, instead of letting the agent discover it at the
 // end of the build.
 if(selected.referenceHealth?.status!=="passed"){
  const alternatives=allCandidates.filter(item=>item.id!==selected.id&&item.referenceHealth?.status==="passed").map(item=>item.id);
  packet.gaps=[...packet.gaps,`reference: ${selected.id} is ${selected.referenceHealth?.status||"unknown"} (${(selected.referenceHealth?.reasons||[]).join("; ")||"no validated capture"}); completion proof will fail referenceValidity until it is harvested (node corpus/harvest.mjs ${selected.id} && node corpus/materialize-packs.mjs ${selected.id})${alternatives.length?`; validated alternatives: ${alternatives.join(", ")}`:""}`];
 }
 // Tiny phase hint: procedure phases are documentation for the agent, not a
 // second mode enum. Copy/Adoption use diagnosis check fields + prove presence
 // gates (not a separate NLP prove category).
 const editionForLearn=lane==="saas"?"clearspeed-operate":"";
 const recommendation=recommendPattern(catalog,`${job} ${categories[kind].fallback}`,{lane,limit:6,framework,licenseMode:"source",installedKits:RECIPE_KITS[recipeKey]||[],category:kind,edition:editionForLearn,learnStorePath,learnStore});
 // Episodic wrong-cite bans fail-close packet selected cite (demote or refuse paint).
 const selectedBanHits=learnedCiteBansFor(selected.id,{
  category:kind,
  screen:selected.screen||"",
  edition:editionForLearn,
  storePath:learnStorePath,
  store:learnStore,
 });
 let citeBanFailClosed=recommendation.citeBanFailClosed||null;
 if(selectedBanHits.length){
  const ban=selectedBanHits[0];
  const altId=recommendation.primary?.id&&recommendation.primary.id!==selected.id
   ?recommendation.primary.id
   :null;
  const alt=altId
   ?allCandidates.find((item)=>item.id===altId)||candidates.find((item)=>item.id===altId)||null
   :null;
  if(alt){
   const bannedCite=selected.id;
   selected=alt;
   candidates=[alt,...candidates.filter((item)=>item.id!==alt.id)].slice(0,3);
   packet.selected=selected;
   packet.candidates=candidates;
   packet.proof={
    ...packet.proof,
    artifactAttribute:`data-cite=\"${selected.id}\"`,
    commands:[
     `node ${join(ROOT,"verify/measure.mjs")} <artifact> --cite ${selected.id} --lane ${lane} --shot /tmp/shine-after.png`,
     ...usability.commands.map((cmd)=>cmd.replace(/--cite\s+\S+/g,`--cite ${selected.id}`)),
     ...productCommands,
     `node ${join(ROOT,"verify/compare.mjs")} <artifact> --cite ${selected.id} --lane ${lane}${(mode==="existing"||mode==="denoise")?" --mode existing --diagnosis shine-diagnosis.json":""}`,
    ],
   };
   packet.usability={
    ...usability,
    commands:[`node ${join(ROOT,"verify/usability.mjs")} <artifact> --contract shine-usability.json --cite ${selected.id}`],
   };
   citeBanFailClosed={
    bannedCite,
    ban,
    reason:`cite-ban: ${bannedCite} banned — fail-closed; packet demote to ${selected.id}`,
    replacedWith:selected.id,
    failClosed:true,
   };
   packet.gaps=[...packet.gaps,citeBanFailClosed.reason];
  }else{
   citeBanFailClosed={
    bannedCite:selected.id,
    ban,
    reason:`cite-ban: ${selected.id} banned for ${ban.category||kind} (${ban.failCategory}; ${ban.ddrId}) — fail-closed; no non-banned packet cite`,
    replacedWith:null,
    failClosed:true,
   };
   packet.gaps=[...packet.gaps,citeBanFailClosed.reason];
   const refuseAst=recommendation.wrongCiteAst;
   const refuseCrop=refuseAst?.cropPairId
    ?` Copy FAIL→PASS crops from recommendation.wrongCiteAst (${refuseAst.cropPairId}); apply-tsx AST rebind-cite.`
    :"";
   packet.editing={
    allowed:false,
    instruction:`Refuse paint: learned cite-ban fail-closed on ${selected.id} (${ban.failCategory}; ${ban.ddrId}). Rebind cite (restructure:rebind-cite / apply-tsx AST) before Actor implement.${refuseCrop}`,
   };
  }
 }
 packet.citeBanFailClosed=citeBanFailClosed;
 packet.recommendation=recommendation;
 packet.recommendationSummary=formatRecommendationSummary(recommendation);
 packet.recommendation.instruction="Read packet.recommendation before editing: productSibling (edition map), primary cite, antiPatterns (learned cite-bans fail-closed), restructureHints (restructure vs repaint), kitRecipe, confidence, tableQuality.fixture (records/worklist shine-tables.json), ctaPressureAst.fixtureTsx/crop* (TSX AST cta-budget maxFilled=1 FAIL→PASS), kpiSoupAst.fixtureTsx/crop* (TSX AST kpi-collapse maxVisible=3 FAIL→PASS), pillFilterAst.fixtureTsx/crop* (TSX AST pill-collapse maxVisible=3 FAIL→PASS), pageTitleAst.fixtureTsx/crop* (TSX AST title-singular FAIL→PASS), chromePressureAst.fixtureTsx/crop* (TSX AST chrome-budget maxFilledChrome=0 FAIL→PASS), filterReversibleAst.fixtureTsx/crop* (TSX AST filter-clearable FAIL→PASS), marketingDnaAst.fixtureTsx/crop* (TSX AST strip-marketing-dna FAIL→PASS), fillerEmptyAst.fixtureTsx/crop* (TSX AST rewrite-filler-empty FAIL→PASS), cardSoupAst.fixtureTsx/crop* (TSX AST collapse-card-soup FAIL→PASS), emptyTriadAst.fixtureTsx/crop* (TSX AST split-empty-triad FAIL→PASS), decorativeChartAst.fixtureTsx/crop* (TSX AST stamp-chart-units FAIL→PASS), dualFocalAst.fixtureTsx/crop* (TSX AST collapse-peer-grids XOR FAIL→PASS), worklistFirstAst.fixtureTsx/crop* (TSX AST worklist-first composition FAIL→PASS), setFocalAst.fixtureTsx/crop* (TSX AST set-focal NO-FOCAL FAIL→PASS), wrongCiteAst.fixtureTsx/crop* (TSX AST rebind-cite refuse-until-rebound FAIL→PASS), xorSavedView.fixture*/crop* (D10 dual-grid XOR HTML FAIL→PASS).";
 // Denoise / records jobs: bind the concrete worklist fixture path into packet.tableQuality.
 if(recommendation.tableQuality?.fixture){
  packet.tableQuality={
   ...packet.tableQuality,
   kind:recommendation.tableQuality.kind||packet.tableQuality.kind,
   fixture:join(ROOT,recommendation.tableQuality.fixture),
   example:join(ROOT,recommendation.tableQuality.fixture),
   pilotCompanion:recommendation.tableQuality.pilotCompanion
    ?join(ROOT,recommendation.tableQuality.pilotCompanion)
    :packet.tableQuality.pilotCompanion,
   instruction:recommendation.tableQuality.instruction||packet.tableQuality.instruction,
  };
 }
 // Denoise / queue jobs: bind CTA pressure TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.ctaPressureAst?.fixtureTsx){
  const c=recommendation.ctaPressureAst;
  packet.ctaPressureAst={
   mode:c.mode||"tsx-ast",
   op:c.op||"cta-budget",
   maxFilled:c.maxFilled??1,
   preferLabels:c.preferLabels||["Pursue"],
   demotePolicy:c.demotePolicy||"outline",
   fixtureTsx:join(ROOT,c.fixtureTsx),
   fixtureTsxAst:join(ROOT,c.fixtureTsxAst||c.fixtureTsx),
   cropBefore:join(ROOT,c.cropBefore),
   cropAfter:join(ROOT,c.cropAfter),
   cropPairId:c.cropPairId||"queue-cta-tsx",
   helper:join(ROOT,c.helper||"verify/restructure/apply-tsx.mjs"),
   reference:c.reference||"skill/references/denoise.md",
   instruction:c.instruction||"Apply apply-tsx cta-budget (AST, maxFilled=1) on consumer Button TSX.",
  };
 }
 // Denoise / queue jobs: bind KPI soup TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.kpiSoupAst?.fixtureTsx){
  const k=recommendation.kpiSoupAst;
  packet.kpiSoupAst={
   mode:k.mode||"tsx-ast",
   op:k.op||"kpi-collapse",
   maxVisible:k.maxVisible??3,
   rest:k.rest||"details",
   fixtureTsx:join(ROOT,k.fixtureTsx),
   fixtureTsxAst:join(ROOT,k.fixtureTsxAst||k.fixtureTsx),
   cropBefore:join(ROOT,k.cropBefore),
   cropAfter:join(ROOT,k.cropAfter),
   cropPairId:k.cropPairId||"queue-kpi-tsx",
   helper:join(ROOT,k.helper||"verify/restructure/apply-tsx.mjs"),
   reference:k.reference||"skill/references/denoise.md",
   instruction:k.instruction||"Apply apply-tsx kpi-collapse (AST, maxVisible=3) on consumer metric TSX.",
  };
 }
 // Denoise / queue jobs: bind pill-filter-stack TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.pillFilterAst?.fixtureTsx){
  const p=recommendation.pillFilterAst;
  packet.pillFilterAst={
   mode:p.mode||"tsx-ast",
   op:p.op||"pill-collapse",
   maxVisible:p.maxVisible??3,
   rest:p.rest||"details",
   fixtureTsx:join(ROOT,p.fixtureTsx),
   fixtureTsxAst:join(ROOT,p.fixtureTsxAst||p.fixtureTsx),
   cropBefore:join(ROOT,p.cropBefore),
   cropAfter:join(ROOT,p.cropAfter),
   cropPairId:p.cropPairId||"queue-pill-tsx",
   helper:join(ROOT,p.helper||"verify/restructure/apply-tsx.mjs"),
   reference:p.reference||"skill/references/denoise.md",
   instruction:p.instruction||"Apply apply-tsx pill-collapse (AST, maxVisible=3) on consumer filter-pill TSX.",
  };
 }
 // Denoise / Operate jobs: bind competing-page-titles TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.pageTitleAst?.fixtureTsx){
  const t=recommendation.pageTitleAst;
  packet.pageTitleAst={
   mode:t.mode||"tsx-ast",
   op:t.op||"title-singular",
   demote:t.demote||"kicker",
   fixtureTsx:join(ROOT,t.fixtureTsx),
   fixtureTsxAst:join(ROOT,t.fixtureTsxAst||t.fixtureTsx),
   cropBefore:join(ROOT,t.cropBefore),
   cropAfter:join(ROOT,t.cropAfter),
   cropPairId:t.cropPairId||"queue-titles-tsx",
   helper:join(ROOT,t.helper||"verify/restructure/apply-tsx.mjs"),
   reference:t.reference||"skill/references/denoise.md",
   instruction:t.instruction||"Apply apply-tsx title-singular (AST) on competing page-title TSX.",
  };
 }
 // Denoise / queue jobs: bind dual-chrome-actions TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.chromePressureAst?.fixtureTsx){
  const c=recommendation.chromePressureAst;
  packet.chromePressureAst={
   mode:c.mode||"tsx-ast",
   op:c.op||"chrome-budget",
   maxFilledChrome:c.maxFilledChrome??0,
   demotePolicy:c.demotePolicy||"outline",
   scope:c.scope||"chrome",
   fixtureTsx:join(ROOT,c.fixtureTsx),
   fixtureTsxAst:join(ROOT,c.fixtureTsxAst||c.fixtureTsx),
   cropBefore:join(ROOT,c.cropBefore),
   cropAfter:join(ROOT,c.cropAfter),
   cropPairId:c.cropPairId||"queue-chrome-tsx",
   helper:join(ROOT,c.helper||"verify/restructure/apply-tsx.mjs"),
   reference:c.reference||"skill/references/denoise.md",
   instruction:c.instruction||"Apply apply-tsx chrome-budget (AST, maxFilledChrome=0) on chrome Button TSX.",
  };
 }




 // Denoise / catalog jobs: bind card-soup TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.cardSoupAst?.fixtureTsx){
  const c=recommendation.cardSoupAst;
  packet.cardSoupAst={
   mode:c.mode||"tsx-ast",
   op:c.op||"collapse-card-soup",
   maxVisible:c.maxVisible??1,
   fixtureTsx:join(ROOT,c.fixtureTsx),
   fixtureTsxAst:join(ROOT,c.fixtureTsxAst||c.fixtureTsx),
   cropBefore:join(ROOT,c.cropBefore),
   cropAfter:join(ROOT,c.cropAfter),
   cropPairId:c.cropPairId||"catalog-card-soup-tsx",
   helper:join(ROOT,c.helper||"verify/restructure/apply-tsx.mjs"),
   reference:c.reference||"skill/references/denoise.md",
   instruction:c.instruction||"Apply apply-tsx collapse-card-soup (AST) on equal Card soup TSX.",
  };
 }
 // Denoise / queue jobs: bind decorative-chart TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.decorativeChartAst?.fixtureTsx){
  const d=recommendation.decorativeChartAst;
  packet.decorativeChartAst={
   mode:d.mode||"tsx-ast",
   op:d.op||"stamp-chart-units",
   fixtureTsx:join(ROOT,d.fixtureTsx),
   fixtureTsxAst:join(ROOT,d.fixtureTsxAst||d.fixtureTsx),
   cropBefore:join(ROOT,d.cropBefore),
   cropAfter:join(ROOT,d.cropAfter),
   cropPairId:d.cropPairId||"queue-decorative-chart-tsx",
   helper:join(ROOT,d.helper||"verify/restructure/apply-tsx.mjs"),
   reference:d.reference||"skill/references/denoise.md",
   instruction:d.instruction||"Apply apply-tsx stamp-chart-units (AST) on decorative chart TSX.",
  };
 }
 // Denoise / queue jobs: bind empty-triad TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.emptyTriadAst?.fixtureTsx){
  const e=recommendation.emptyTriadAst;
  packet.emptyTriadAst={
   mode:e.mode||"tsx-ast",
   op:e.op||"split-empty-triad",
   fixtureTsx:join(ROOT,e.fixtureTsx),
   fixtureTsxAst:join(ROOT,e.fixtureTsxAst||e.fixtureTsx),
   cropBefore:join(ROOT,e.cropBefore),
   cropAfter:join(ROOT,e.cropAfter),
   cropPairId:e.cropPairId||"queue-empty-triad-tsx",
   helper:join(ROOT,e.helper||"verify/restructure/apply-tsx.mjs"),
   reference:e.reference||"skill/references/denoise.md",
   instruction:e.instruction||"Apply apply-tsx split-empty-triad (AST) on conflated empty/error TSX.",
  };
 }
 // Denoise / queue jobs: bind filler-empty-copy TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.fillerEmptyAst?.fixtureTsx){
  const f=recommendation.fillerEmptyAst;
  packet.fillerEmptyAst={
   mode:f.mode||"tsx-ast",
   op:f.op||"rewrite-filler-empty",
   fixtureTsx:join(ROOT,f.fixtureTsx),
   fixtureTsxAst:join(ROOT,f.fixtureTsxAst||f.fixtureTsx),
   cropBefore:join(ROOT,f.cropBefore),
   cropAfter:join(ROOT,f.cropAfter),
   cropPairId:f.cropPairId||"queue-filler-empty-tsx",
   helper:join(ROOT,f.helper||"verify/restructure/apply-tsx.mjs"),
   reference:f.reference||"skill/references/denoise.md",
   instruction:f.instruction||"Apply apply-tsx rewrite-filler-empty (AST) on filler empty-state TSX.",
  };
 }
 // Denoise / queue jobs: bind marketing-dna-operate TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.marketingDnaAst?.fixtureTsx){
  const m=recommendation.marketingDnaAst;
  packet.marketingDnaAst={
   mode:m.mode||"tsx-ast",
   op:m.op||"strip-marketing-dna",
   fixtureTsx:join(ROOT,m.fixtureTsx),
   fixtureTsxAst:join(ROOT,m.fixtureTsxAst||m.fixtureTsx),
   cropBefore:join(ROOT,m.cropBefore),
   cropAfter:join(ROOT,m.cropAfter),
   cropPairId:m.cropPairId||"queue-marketing-dna-tsx",
   helper:join(ROOT,m.helper||"verify/restructure/apply-tsx.mjs"),
   reference:m.reference||"skill/references/denoise.md",
   instruction:m.instruction||"Apply apply-tsx strip-marketing-dna (AST) on Operate chrome TSX.",
  };
 }
 // Denoise / queue jobs: bind irreversible-filters TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.filterReversibleAst?.fixtureTsx){
  const f=recommendation.filterReversibleAst;
  packet.filterReversibleAst={
   mode:f.mode||"tsx-ast",
   op:f.op||"filter-clearable",
   perChip:f.perChip!==false,
   clearAll:f.clearAll!==false,
   fixtureTsx:join(ROOT,f.fixtureTsx),
   fixtureTsxAst:join(ROOT,f.fixtureTsxAst||f.fixtureTsx),
   cropBefore:join(ROOT,f.cropBefore),
   cropAfter:join(ROOT,f.cropAfter),
   cropPairId:f.cropPairId||"queue-filters-tsx",
   helper:join(ROOT,f.helper||"verify/restructure/apply-tsx.mjs"),
   reference:f.reference||"skill/references/denoise.md",
   instruction:f.instruction||"Apply apply-tsx filter-clearable (AST) on irreversible filter chip TSX.",
  };
 }
 // Denoise / queue jobs: bind dual-focal ban TSX AST FAIL→PASS fixture + crop paths.
 if(recommendation.dualFocalAst?.fixtureTsx){
  const d=recommendation.dualFocalAst;
  packet.dualFocalAst={
   mode:d.mode||"tsx-ast",
   op:d.op||"collapse-peer-grids",
   xorMode:d.xorMode||"xor-saved-view",
   keepTitleIncludes:d.keepTitleIncludes||["Queue"],
   foldTitleIncludes:d.foldTitleIncludes||["David"],
   fixtureTsx:join(ROOT,d.fixtureTsx),
   fixtureTsxAst:join(ROOT,d.fixtureTsxAst||d.fixtureTsx),
   fixtureTsxAfter:join(ROOT,d.fixtureTsxAfter||"verify/fixtures/denoise/tsx/queue-dual-xor-after.tsx"),
   cropBefore:join(ROOT,d.cropBefore),
   cropAfter:join(ROOT,d.cropAfter),
   cropPairId:d.cropPairId||"queue-dual-grid-tsx",
   helper:join(ROOT,d.helper||"verify/restructure/apply-tsx.mjs"),
   reference:d.reference||"skill/references/denoise.md",
   instruction:d.instruction||"Apply apply-tsx collapse-peer-grids (AST XOR) on consumer peer-grid TSX.",
  };
 }
 // Denoise / queue|records jobs: bind worklist-first composition TSX AST FAIL→PASS fixture + crops.
 if(recommendation.worklistFirstAst?.fixtureTsx){
  const w=recommendation.worklistFirstAst;
  packet.worklistFirstAst={
   mode:w.mode||"tsx-ast",
   op:w.op||"worklist-first",
   attr:w.attr||"data-region",
   value:w.value||"focal",
   on:w.on||"primary-worklist",
   fixtureTsx:join(ROOT,w.fixtureTsx),
   fixtureTsxAst:join(ROOT,w.fixtureTsxAst||w.fixtureTsx),
   cropBefore:join(ROOT,w.cropBefore),
   cropAfter:join(ROOT,w.cropAfter),
   cropPairId:w.cropPairId||"queue-worklist-first-tsx",
   helper:join(ROOT,w.helper||"verify/restructure/apply-tsx.mjs"),
   reference:w.reference||"skill/references/kits.md",
   instruction:w.instruction||"Apply apply-tsx worklist-first (AST) so records/worklist precedes KPI chrome.",
  };
 }
 // Denoise / composition jobs: bind set-focal TSX AST FAIL→PASS fixture + crops (NO-FOCAL / Usul).
 if(recommendation.setFocalAst?.fixtureTsx){
  const s=recommendation.setFocalAst;
  packet.setFocalAst={
   mode:s.mode||"tsx-ast",
   op:s.op||"set-focal",
   attr:s.attr||"data-region",
   value:s.value||"focal",
   on:s.on||"primary-work-object",
   fixtureTsx:join(ROOT,s.fixtureTsx),
   fixtureTsxAst:join(ROOT,s.fixtureTsxAst||s.fixtureTsx),
   cropBefore:join(ROOT,s.cropBefore),
   cropAfter:join(ROOT,s.cropAfter),
   cropPairId:s.cropPairId||"usul-focal-tsx",
   helper:join(ROOT,s.helper||"verify/restructure/apply-tsx.mjs"),
   reference:s.reference||"skill/references/denoise.md",
   instruction:s.instruction||"Apply apply-tsx set-focal (AST) to stamp data-region=focal on the primary work object.",
  };
 }
 // Denoise / settings|sources jobs: bind wrong-cite TSX AST FAIL→PASS fixture + crops (refuse until rebound).
 if(recommendation.wrongCiteAst?.fixtureTsx){
  const c=recommendation.wrongCiteAst;
  packet.wrongCiteAst={
   mode:c.mode||"tsx-ast",
   op:c.op||"rebind-cite",
   from:c.from||"shadcn-queue",
   to:c.to||"shadcn-settings",
   refusePaintUntilRebound:c.refusePaintUntilRebound!==false,
   fixtureTsx:join(ROOT,c.fixtureTsx),
   fixtureTsxAst:join(ROOT,c.fixtureTsxAst||c.fixtureTsx),
   cropBefore:join(ROOT,c.cropBefore),
   cropAfter:join(ROOT,c.cropAfter),
   cropPairId:c.cropPairId||"sources-cite-tsx",
   helper:join(ROOT,c.helper||"verify/restructure/apply-tsx.mjs"),
   reference:c.reference||"skill/references/denoise.md",
   instruction:c.instruction||"Refuse paint until rebound; apply apply-tsx rebind-cite (AST) on consumer data-cite TSX.",
  };
 }
 // Denoise / queue jobs: bind D10 XOR dual-grid FAIL→PASS fixture + crop paths.
 if(recommendation.xorSavedView?.fixtureBefore){
  const x=recommendation.xorSavedView;
  packet.xorSavedView={
   mode:x.mode||"xor-saved-view",
   op:x.op||"collapse-peer-grids",
   keepTitleIncludes:x.keepTitleIncludes||["Queue"],
   foldTitleIncludes:x.foldTitleIncludes||["David"],
   fixtureBefore:join(ROOT,x.fixtureBefore),
   fixtureAfter:join(ROOT,x.fixtureAfter),
   cropBefore:join(ROOT,x.cropBefore),
   cropAfter:join(ROOT,x.cropAfter),
   cropPairId:x.cropPairId||"queue-dual-grid",
   helper:join(ROOT,x.helper||"verify/restructure/xor-saved-view.mjs"),
   reference:x.reference||"skill/references/kits.md",
   instruction:x.instruction||"Apply xor-saved-view after collapse-peer-grids plan (humanGate).",
  };
 }
 const restructureHints=recommendation.restructureHints||[];
 const needsRestructure=restructureHints.some((h)=>String(h).startsWith("restructure:"));
 const wantsXor=
  Boolean(recommendation.xorSavedView?.fixtureBefore)||
  Boolean(recommendation.dualFocalAst?.fixtureTsx)||
  restructureHints.some((h)=>/collapse-peer-grids|xor-saved-view|dual-focal/i.test(String(h)));
 const wantsWorklistFirst=
  Boolean(recommendation.worklistFirstAst?.fixtureTsx)||
  restructureHints.some((h)=>/worklist-first/i.test(String(h)));
 // Refuse / rebind path only — do not treat fixture bind alone as needsRestructure
 // (settings packets always carry wrongCiteAst FAIL→PASS crops for the Actor).
 const wantsWrongCite=
  Boolean(citeBanFailClosed?.failClosed)||
  restructureHints.some((h)=>/rebind-cite|wrong-cite|cite-honesty/i.test(String(h)));
 const learnedHits=lane==="saas"?siblingPrefsFor(kind,{edition:"clearspeed-operate",job,storePath:learnStorePath,store:learnStore}):[];
 const siblingResolved=lane==="saas"?resolveEditionSibling({category:kind,screen:recommendation?.primary?.screen||"",job,editionId:"clearspeed-operate",learnedPrefs:learnedHits.map((h)=>h.pref)}):null;
 const siblingLabel=productReferenceName||productReference||recommendation?.productSibling?.name||siblingResolved?.sibling?.name||null;
 // Wireframe brief lock (enterprise plan §3): mode=new surfaces bind
 // shine-wireframe/<slug>.brief.md; structure locked until "unlock structure".
 const briefPath=wireframeBrief||(slug?join(resolve(project),"shine-wireframe",`${String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}.brief.md`):"");
 let briefRef=null;
 if(briefPath&&existsSync(briefPath)){
  briefRef=wireframeBriefRef(briefPath,readBrief(briefPath));
 }else if(briefPath){
  briefRef=wireframeBriefRef(briefPath,null);
 }else if(mode==="new"){
  briefRef=null; // assertNewSurfaceBrief may refuse when requireWireframeLock
 }
 const wantsPill=
  Boolean(recommendation.pillFilterAst?.fixtureTsx)||
  restructureHints.some((h)=>/pill-collapse|pill-filter|filter-stack/i.test(String(h)));
 const wantsTitle=
  Boolean(recommendation.pageTitleAst?.fixtureTsx)||
  restructureHints.some((h)=>/title-singular|page-title|competing[- ]?title/i.test(String(h)));
 const wantsChrome=
  Boolean(recommendation.chromePressureAst?.fixtureTsx)||
  restructureHints.some((h)=>/chrome-budget|chrome-pressure|nav-chrome|dual-chrome/i.test(String(h)));
 const wantsFilter=
  Boolean(recommendation.filterReversibleAst?.fixtureTsx)||
  restructureHints.some((h)=>/filter-clearable|filter-reversible|irreversible[- ]?filters/i.test(String(h)));
 const wantsMarketingDna=
  Boolean(recommendation.marketingDnaAst?.fixtureTsx)||
  restructureHints.some((h)=>/strip-marketing-dna|marketing[- ]?dna|glow|gradient[- ]?operate/i.test(String(h)));
 const wantsFillerEmpty=
  Boolean(recommendation.fillerEmptyAst?.fixtureTsx)||
  restructureHints.some((h)=>/rewrite-filler-empty|filler[- ]?empty/i.test(String(h)));
 const wantsCardSoup=
  Boolean(recommendation.cardSoupAst?.fixtureTsx)||
  restructureHints.some((h)=>/collapse-card-soup|card[- ]?soup|equal cards?/i.test(String(h)));
 const wantsEmptyTriad=
  Boolean(recommendation.emptyTriadAst?.fixtureTsx)||
  restructureHints.some((h)=>/split-empty-triad|empty[- ]?triad|filtered[- ]?empty|empty[- ]?filtered/i.test(String(h)));
 const wantsDecorativeChart=
  Boolean(recommendation.decorativeChartAst?.fixtureTsx)||
  restructureHints.some((h)=>/stamp-chart-units|decorative[- ]?chart|chart[- ]?units|no[- ]?units/i.test(String(h)));
 const ddrOps=needsRestructure
  ?["cta-budget","set-focal","kpi-collapse","rebind-cite",...(wantsPill?["pill-collapse"]:[]),...(wantsTitle?["title-singular"]:[]),...(wantsChrome?["chrome-budget"]:[]),...(wantsFilter?["filter-clearable"]:[]),...(wantsMarketingDna?["strip-marketing-dna"]:[]),...(wantsFillerEmpty?["rewrite-filler-empty"]:[]),...(wantsCardSoup?["collapse-card-soup"]:[]),...(wantsEmptyTriad?["split-empty-triad"]:[]),...(wantsDecorativeChart?["stamp-chart-units"]:[]),...(wantsWorklistFirst?["worklist-first"]:[]),...(wantsXor?["collapse-peer-grids"]:[])].filter(Boolean)
  :wantsWrongCite
   ?["rebind-cite"]
   :[];
 packet.ddr=buildDdr({
  job,
  lane,
  category:kind,
  mode,
  primaryCite:selected.id,
  antiCites:(recommendation.antiPatterns||[]).slice(0,6),
  restructureVsRepaint:(needsRestructure||wantsWrongCite)?"restructure":"repaint",
  restructureOps:ddrOps,
  // constitutionIds omitted → buildDdr resolves numbered ClearSpeed Operate edition
  openRisks:packet.gaps.slice(0,4),
  status:statusWanted,
  ctaBudget:lane==="saas"||mode==="denoise"?(siblingResolved?.sibling?.ctaBudget??1):null,
  focalRegion:mode==="denoise"||kind==="datagrid"?(siblingResolved?.sibling?.focalRegion||"worklist"):(siblingResolved?.sibling?.focalRegion||null),
  productSibling:siblingLabel,
  wireframeBrief:briefRef,
 });
 if(siblingResolved?.sibling&&!productReference){
  packet.editionSibling={
   id:siblingResolved.sibling.id,
   name:siblingResolved.sibling.name,
   route:siblingResolved.sibling.route||null,
   preferredCite:siblingResolved.preferredCite,
   kitRecipe:siblingResolved.kitRecipe,
   owners:siblingResolved.owners,
   reason:siblingResolved.reason,
   instruction:"Edition sibling map (enterprise §4): prefer this Nucleus/Sled surface for conventions before external catalog fashion. Pass --product-reference to bind a concrete page.",
  };
  // Repertoire→sibling learn: when cite/kit resolves via edition siblings, persist
  // episodic + siblingPref (doctor-gated) so the next packet prefers that mapping.
  if(doctorBiteOk&&packet.ddr?.ddrId){
   try{
    packet.siblingLearn=commitSiblingLearnFromResolve({
     storePath:learnStorePath,
     store:learnStore,
     doctorBiteOk:true,
     ddrId:packet.ddr.ddrId,
     edition:"clearspeed-operate",
     category:kind,
     job,
     resolved:siblingResolved,
    });
   }catch(error){
    packet.siblingLearnError=error.message;
   }
  }
 }
 packet.ddrId=packet.ddr.ddrId;
 if(mode==="new"){
  packet.wireframe={
   required:true,
   reference:join(ROOT,"skill/references/wireframe.md"),
   brief:briefRef,
   instruction:briefRef?.structureLocked
    ?`Structure LOCKED at ${briefRef.path} — honour regions/primary/kit; unlock only if user says "unlock structure".`
    :"New surface: discover → gray-box → lock shine-wireframe/<slug>.brief.md before Build paint. Structure immutable while LOCKED.",
  };
  // Fail-closed on Build/Actor path. Discovery may mint with a DRAFT brief bound.
  if(requireWireframeLock){
   assertNewSurfaceBrief(packet);
  }else if(ddrAccepted){
   packet.editing.instruction=
    (packet.editing.instruction?packet.editing.instruction+" ":"")+
    `mode=new: lock shine-wireframe/<slug>.brief.md before paint (node core/wireframe-brief.mjs --require via design-packet --require-wireframe-lock); structure locked until "unlock structure".`;
  }
 }
 packet.completion.command=`node ${join(ROOT,"verify/prove.mjs")} <artifact> --cite ${selected.id} --lane ${lane} --layout shine-layout.json --usability shine-usability.json --project ${JSON.stringify(resolve(project))} --ddr ${packet.ddr.ddrId}${reusableBlocks.required?" --reuse shine-reuse.json --coverage shine-coverage.json":""}${(mode==="existing"||mode==="denoise")?" --diagnosis shine-diagnosis.json":""}`;
 if(mode==="denoise"){
  packet.denoise={
   required:true,
   reference:join(ROOT,"skill/references/denoise.md"),
   instruction:"No polish until primaryTaskCheck green. Refuse paint while restructureHints start with restructure: and primary task is red. Prove links ddrId + constitutionIds.",
   polishAllowed:false,
  };
 }
 packet.procedure={
  phases:mode==="denoise"
   ?["denoise","wireframe","build","polish","audit","copy","adoption"]
   :["wireframe","build","polish","audit","copy","adoption"],
  packetMode:mode,
  instruction:mode==="denoise"
   ?"Denoise is a packet --mode (skill/references/denoise.md). Triage→structure decisions→restructure→prove. Wireframe/Polish/Copy/Adoption remain procedure phases. No polish until primaryTaskCheck green. DDR must be accepted before Actor."
   :"Wireframe/Polish/Copy/Adoption are skill procedure phases, not --mode values. Map: wireframe→new; build→new|existing; polish→existing (references/polish.md); audit→audit; copy|adoption→audit|existing; denoise→denoise. For lane=saas, fill copy/adoption diagnosis check fields; prove binds them via copyAdoption + defectAssertions (assertion ids when flows exist). Lightweight measure heuristics catch missing title/H1 and stub empty-state copy — not a full NLP critic.",
 };
 // Operate SaaS page cites: completion is mandatory — stop-sweep fails without a
 // fresh prove.mjs receipt. Marketing / non-allowlisted screens stay soft.
 const operateCompletion=isOperateProveScreen(selected.screen);
 packet.completion.required=operateCompletion;
 if(operateCompletion){
  packet.completion.instruction="Operate SaaS completion is mandatory. Run prove.mjs before finishing; compare.mjs alone is partial and will not clear stop-sweep. Pass the same --lane as compare so saas originality is enforced. Wireframe surfaces skip this gate until Build.";
 }
 if(mode==="audit"){
  packet.proof.commands=packet.proof.commands.filter((command)=>!/compare\.mjs/.test(command));
  packet.completion={required:false,command:null,requires:[],instruction:"An audit issues no completion receipt. Report the diagnosis (verdict, defects, evidence), the measure facts and the screenshot. For lane=saas, copy/adoption check fields must be present in the diagnosis even when you only report; prove on a later build pass binds those fields. Nothing may be edited in this mode."};
 }
 return packet;
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:"";
 try{process.stdout.write(JSON.stringify(createDesignPacket({job:opt("--job")||args[0],lane:opt("--lane")||"saas",project:resolve(opt("--project")||process.cwd()),framework:opt("--framework"),category:opt("--category"),mode:opt("--mode")||"existing",productReference:opt("--product-reference"),productReferenceName:opt("--product-reference-name"),accept:args.includes("--accept"),ddrStatus:opt("--ddr-status"),wireframeBrief:opt("--wireframe-brief"),slug:opt("--slug"),requireWireframeLock:args.includes("--require-wireframe-lock")}),null,2)+"\n");}catch(error){console.error(`shine packet: ${error.message}`);process.exit(1)}
}
