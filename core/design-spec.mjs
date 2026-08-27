import {readFileSync} from "node:fs";

const categories=new Set(["datagrid","dashboard","form","marketing","record","lex","voice"]);
const clean=value=>String(value||"").replace(/[<>]/g,"").trim().slice(0,240);
const words=value=>clean(value).split(/\s+/).filter(Boolean);
const title=value=>words(value).map(word=>word[0]?.toUpperCase()+word.slice(1)).join(" ");

export function seedDesignSpec({brief,packet}){
 const subject=title(brief.brief.replace(/\b(dense|records?|compact|executive)\b/gi,"").trim());
 return {version:1,briefId:brief.id,category:brief.category,lane:brief.lane,cite:packet.selected.id,
  direction:{name:`${subject} signal desk`,principle:"Make the next consequential action obvious before showing supporting detail.",density:["datagrid","dashboard","lex"].includes(brief.category)?"dense":"focused"},
  copy:{eyebrow:title(brief.category),title:subject,summary:`A purpose-built ${brief.brief} that turns live evidence into a clear next action.`,primaryAction:{datagrid:"Review selected",dashboard:"Open exceptions",form:"Save settings",marketing:"Explore the product",record:"Take next action",lex:"Edit record",voice:"Send message"}[brief.category],secondaryAction:"View activity"},
  data:{metrics:["Priority","In review","Resolved"],rows:[["Aster","High","Ready"],["Beacon","Medium","Review"],["Cinder","Low","Resolved"]],fields:["Workspace name","Notification email","Review cadence"],insight:"Three items changed since the previous review."}};
}

export function validateDesignSpec(spec,{brief}={}){
 const errors=[];
 if(spec?.version!==1)errors.push("version must be 1");
 if(!categories.has(spec?.category))errors.push("unknown category");
 if(brief&&spec?.category!==brief.category)errors.push("category changed");
 if(brief&&spec?.briefId!==brief.id)errors.push("briefId changed");
 for(const path of [["cite",spec?.cite],["direction.name",spec?.direction?.name],["direction.principle",spec?.direction?.principle],["copy.title",spec?.copy?.title],["copy.summary",spec?.copy?.summary],["copy.primaryAction",spec?.copy?.primaryAction],["data.insight",spec?.data?.insight]])if(clean(path[1]).length<4)errors.push(`${path[0]} is missing`);
 const payload=JSON.stringify(spec);if(payload.length>12000)errors.push("spec exceeds 12KB");
 if(/lorem ipsum|dashboard title|sample data|placeholder/i.test(payload))errors.push("placeholder content is forbidden");
 if(brief){const stems=words(brief.brief).filter(x=>x.length>4).map(x=>x.toLowerCase().slice(0,6));if(stems.length&&!stems.some(stem=>payload.toLowerCase().includes(stem)))errors.push("spec does not name the brief subject");}
 return errors;
}

export function readDesignSpec(path,options={}){const spec=JSON.parse(readFileSync(path,"utf8"));const errors=validateDesignSpec(spec,options);if(errors.length)throw new Error(`invalid design spec: ${errors.join("; ")}`);return spec;}
