#!/usr/bin/env node
import {untitledEvidence} from '../corpus/untitled-proof.mjs';
import {inspectReadiness} from './readiness.mjs';
import {findUntitledExamples} from '../corpus/untitledui.mjs';
import {homedir} from 'node:os';
import {readFileSync,existsSync,realpathSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {blocks,sourceInventory} from './blocks.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const words=value=>String(value).replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase().match(/[a-z0-9]+/g)||[];
const aliases={table:['grid','records'],search:['command','filter'],dashboard:['chart','report'],navigation:['sidebar','shell','nav'],wizard:['form','steps'],upload:['file','attachment','import']};
export function selectImplementation(project,job,{pattern,upstream=[]}={}){
 pattern ||= /\b(server|remote)\b.*\b(table|grid|records|pagination)\b/i.test(job)?'server-data-grid':/\bcsv\b.*\b(import|preview)\b/i.test(job)?'csv-import':undefined;
 const terms=new Set(words(job).flatMap(word=>[word,...(aliases[word]||[])]));if(!terms.size&&!pattern)throw Error('State the user job or requested pattern');
 const inventory=sourceInventory(project),pkg=existsSync(join(project,'package.json'))?JSON.parse(readFileSync(join(project,'package.json'),'utf8')):{},config=existsSync(join(project,'components.json'))?JSON.parse(readFileSync(join(project,'components.json'),'utf8')):{};
 const score=text=>words(text).filter(word=>terms.has(word)).length;
 const ranked=blocks.map(block=>({block,score:pattern===block.id?100:score([block.id,block.title,block.description,...(block.capabilities||[])].join(' '))})).filter(row=>pattern?row.block.id===pattern:row.score>0).sort((a,b)=>b.score-a.score);
 const declared=existsSync(join(project,'shine-coverage.json'))?JSON.parse(readFileSync(join(project,'shine-coverage.json'),'utf8')).patterns:[];
 const candidates=[];for(const file of inventory)for(const name of file.exports){const fit=score(name+" "+file.path);if(!pattern&&fit>0&&/\.[jt]sx$/.test(file.path)&&/^[A-Z]/.test(name)&&!blocks.some(block=>block.matches.includes(name)))candidates.push({tier:"product",score:fit,source:file.path,export:name,sha256:file.sha256,available:true,action:"inspect-and-import",reason:"Existing product export matches this job; inspect its API and capabilities before use."});}
 for(const {block,score:fit} of ranked){const binding=declared.find(row=>row.id===block.id&&row.decision==='reuse');for(const file of inventory)for(const name of file.exports)if(block.matches.includes(name)||(file.path===binding?.source&&name===binding.export))candidates.push({tier:'product',pattern:block.id,score:fit,source:file.path,export:name,sha256:file.sha256,available:true,action:'import',reason:'Existing product implementation owns this workflow.'});candidates.push({tier:'shine',pattern:block.id,score:fit,available:Boolean(config.$schema||config.aliases?.ui),action:'install',registry:'https://shine-blond.vercel.app/r/'+block.id+'.json',reason:'Finished workflow; adapt through the existing component system.'});}
 const localPath=join(project,'shine-providers.local.json'),authorized=existsSync(localPath)?JSON.parse(readFileSync(localPath,'utf8')).sources||[]:[];
 const providers=JSON.parse(readFileSync(join(root,'integrations/providers.json'),'utf8'));
 for(const item of [...providers,...upstream]){const fit=score([item.id,...item.capabilities].join(' '));if(!fit)continue;const licensed=item.access!=='licensed';const local=authorized.find(source=>source.id===item.id&&source.authorization==='authorized-use'&&typeof source.path==='string'&&existsSync(resolve(project,source.path))&&statSync(resolve(project,source.path)).isFile());candidates.push({...item,tier:'upstream',score:fit,authorizedLocalSource:local?resolve(project,local.path):undefined,available:Boolean(local)||licensed&&item.kits.some(kit=>kit==='shadcn'&&Boolean(config.$schema||config.aliases?.ui)),action:local?'inspect-authorized-local-source':licensed?'inspect-and-install':'requires-authorized-source',reason:licensed?'Use upstream controls to fill a specific missing workflow region.':'Licensed source is not included in Shine; supply an authorized local source. Do not redistribute it.'});}
 candidates.sort((a,b)=>['product','shine','upstream'].indexOf(a.tier)-['product','shine','upstream'].indexOf(b.tier)||b.score-a.score);
 // References can be installable without being ready to import into this consumer.
 const corpus=process.env.DESIGN_CORPUS||join(homedir(),'design-corpus');
 for(const example of findUntitledExamples(job,8)){
  const source=join(corpus,example.sourceFile),present=existsSync(source),evidence=untitledEvidence(example,corpus);
  candidates.push({id:example.id,provider:'Untitled UI',tier:'upstream',score:example.score,source,export:example.export,license:'MIT',evidence,access:'open-source',available:false,installable:present&&evidence.render!=='failed',action:evidence.render==='failed'?'resolve-failed-browser-proof':'adapt-public-source',planCommand:`node ${join(root,'integrations/untitled.mjs')} --project ${JSON.stringify(project)} --example ${example.id}`,reason:'Public source exists; preserve installed product owners and adapt dependencies, aliases and theme.',readiness:present?{status:'needs-adaptation',errors:['Run readiness with the complete source closure before importing'],browserStatus:'not_tested'}:{status:'missing-source',errors:['Acquire the pinned public Untitled source'],browserStatus:'not_tested'}});
 }
 const readinessCache=new Map();
 for(const candidate of candidates){
  if(candidate.tier==='shine'){
   const block=blocks.find(x=>x.id===candidate.pattern),seen=new Set(),files=[];
   const gather=b=>{if(!b||seen.has(b.id))return;seen.add(b.id);files.push({path:join(root,'blocks',b.id+'.tsx')});for(const id of b.blocks||[])gather(blocks.find(x=>x.id===id));};gather(block);
   candidate.readiness=inspectReadiness(project,files,{prefix:config.tailwind?.prefix||'',cache:readinessCache});
   candidate.installable=Boolean(config.$schema||config.aliases?.ui);candidate.available=candidate.readiness.status==='ready';candidate.action=candidate.available?'install-and-verify':'adapt-and-verify';
  }else if(candidate.tier==='upstream'&&candidate.provider==='shadcn'){
   const match=inventory.find(file=>file.path.endsWith('/ui/'+candidate.registryItem+'.tsx'));
   const expected=candidate.registryItem.split('-').map(part=>part[0].toUpperCase()+part.slice(1)).join('');
   candidate.installable=Boolean(config.$schema||config.aliases?.ui);candidate.readiness=match?inspectReadiness(project,[{path:join(project,'src/components/shine/candidate.tsx'),source:`import {${expected}} from '${config.aliases?.ui||'@/components/ui'}/${candidate.registryItem}';`}],{cache:readinessCache}):{status:'needs-installation',errors:['Required control source not installed at the standard UI owner path'],browserStatus:'not_tested'};candidate.available=Boolean(match)&&candidate.readiness.status==='ready';
  }
 }
 candidates.sort((a,b)=>['product','shine','upstream'].indexOf(a.tier)-['product','shine','upstream'].indexOf(b.tier)||b.score-a.score);
 const selected=candidates.find(row=>row.available)||candidates.find(row=>row.installable);
 const pageExamples=JSON.parse(readFileSync(join(root,'blocks/examples.json'),'utf8')).examples.map(example=>({...example,score:score([example.id,example.name,example.category,example.description,example.eyebrow].join(' '))})).filter(example=>example.score>0).sort((a,b)=>b.score-a.score).slice(0,5);

 return {version:1,job,pageExamples,exampleInstruction:'Page examples are compositions, not additional registry blocks. Inspect the example source, shared theme and imported blocks; preserve the consumer component system and connect real adapters.',project:resolve(project),selected:selected||null,candidates,customWork:{allowed:!selected,reason:selected?'Inspect the selected implementation and resolve its readiness errors before import. A custom alternative needs an explicit unmet requirement.':'No available implementation matched. Record the missing capability before building.'},installedPackages:Object.keys({...pkg.dependencies,...pkg.devDependencies}),instruction:'Inspect the selected source and its real API before importing. Product components take precedence; a reference is not an installable implementation.'};
}
if(process.argv[1]&&existsSync(process.argv[1])&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:undefined;console.log(JSON.stringify(selectImplementation(resolve(opt('--project')||'.'),opt('--job')||'',{pattern:opt('--pattern')}),null,2));}
