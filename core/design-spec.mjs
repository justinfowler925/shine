import {readFileSync} from "node:fs";

const categories=new Set(["datagrid","dashboard","form","marketing","record","lex","voice"]);
const clean=value=>String(value||"").replace(/[<>]/g,"").trim().slice(0,240);
const words=value=>clean(value).split(/\s+/).filter(Boolean);
const title=value=>words(value).map(word=>word[0]?.toUpperCase()+word.slice(1)).join(" ");

export function seedDesignSpec({brief,packet}){
 const subject=title(brief.brief.replace(/\b(dense|records?|compact|executive)\b/gi,"").trim());
 const directionByCategory={
  marketing:{archetype:"evidence-led editorial",imageStrategy:"Show the real product or measured before-and-after as the dominant proof object.",signatureMoment:"A wide proof stage reveals the system changing an undirected surface into a cited one."},
  dashboard:{archetype:"decision cockpit",imageStrategy:"Use one primary data visualization and reserve illustration for empty states.",signatureMoment:"Exceptions interrupt the trend exactly where a decision is required."},
  datagrid:{archetype:"operator queue",imageStrategy:"No decorative imagery; density, state, and row actions carry the hierarchy.",signatureMoment:"Selection transforms the toolbar from browsing to consequential action."},
  form:{archetype:"guided completion",imageStrategy:"Use product-specific supporting imagery only when it reduces uncertainty.",signatureMoment:"The completion state replaces ambiguity with the next concrete step."},
  record:{archetype:"identity then decision",imageStrategy:"Use identity media only when it helps distinguish the record.",signatureMoment:"The next action sits beside the evidence that justifies it."},
  lex:{archetype:"host-faithful record",imageStrategy:"Respect the Lightning host; imagery never competes with highlights and actions.",signatureMoment:"The record action remains legible inside the host chrome."},
  voice:{archetype:"evidence conversation",imageStrategy:"Sources and tool states are the visual proof; avoid decorative assistant avatars.",signatureMoment:"The answer exposes the source and recovery path in the same reading flow."}
 }[brief.category];
 return {version:4,briefId:brief.id,category:brief.category,lane:brief.lane,cite:packet.selected.id,
  direction:{name:`${subject} signal desk`,principle:"Make the next consequential action obvious before showing supporting detail.",density:["datagrid","dashboard","lex"].includes(brief.category)?"dense":"focused",...directionByCategory,antiRepetition:"Do not reuse the previous output's family, hero silhouette, section rhythm, or signature device without job-specific evidence."},
  copy:{eyebrow:title(brief.category),title:subject,summary:`A purpose-built ${brief.brief} that turns live evidence into a clear next action.`,primaryAction:{datagrid:"Review selected",dashboard:"Open exceptions",form:"Save settings",marketing:"Explore the product",record:"Take next action",lex:"Edit record",voice:"Send message"}[brief.category],secondaryAction:"View activity"},
  data:{metrics:["Priority","In review","Resolved"],rows:[["Aster","High","Ready"],["Beacon","Medium","Review"],["Cinder","Low","Resolved"]],fields:["Workspace name","Notification email","Review cadence"],insight:"Three items changed since the previous review."}};
}

export function validateDesignSpec(spec,{brief}={}){
 const errors=[];
 if(spec?.version!==4)errors.push("version must be 4");
 if(!categories.has(spec?.category))errors.push("unknown category");
 if(brief&&spec?.category!==brief.category)errors.push("category changed");
 if(brief&&spec?.briefId!==brief.id)errors.push("briefId changed");
 for(const path of [["cite",spec?.cite],["direction.name",spec?.direction?.name],["direction.principle",spec?.direction?.principle],["direction.archetype",spec?.direction?.archetype],["direction.imageStrategy",spec?.direction?.imageStrategy],["direction.signatureMoment",spec?.direction?.signatureMoment],["direction.antiRepetition",spec?.direction?.antiRepetition],["copy.title",spec?.copy?.title],["copy.summary",spec?.copy?.summary],["copy.primaryAction",spec?.copy?.primaryAction],["data.insight",spec?.data?.insight]])if(clean(path[1]).length<4)errors.push(`${path[0]} is missing`);
 const payload=JSON.stringify(spec);if(payload.length>12000)errors.push("spec exceeds 12KB");
 if(/lorem ipsum|dashboard title|sample data|placeholder/i.test(payload))errors.push("placeholder content is forbidden");
 if(brief){const stems=words(brief.brief).filter(x=>x.length>4).map(x=>x.toLowerCase().slice(0,6));if(stems.length&&!stems.some(stem=>payload.toLowerCase().includes(stem)))errors.push("spec does not name the brief subject");}
 return errors;
}

export function readDesignSpec(path,options={}){const spec=JSON.parse(readFileSync(path,"utf8"));const errors=validateDesignSpec(spec,options);if(errors.length)throw new Error(`invalid design spec: ${errors.join("; ")}`);return spec;}
