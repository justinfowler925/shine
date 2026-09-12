#!/usr/bin/env node
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blocks, sourceInventory, verifyReuse } from './blocks.mjs';
import { load } from '../verify/deps.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function libraryInventory(){
 const references=JSON.parse(readFileSync(join(root,'corpus/templates.json'),'utf8')).templates;
 return {references:{total:references.length,pages:references.filter(row=>row.scope==='page').length,components:references.filter(row=>row.scope==='component').length,retired:references.filter(row=>row.selectable===false).length},implementations:{blocks:blocks.filter(row=>row.kind!=='page').length,pages:blocks.filter(row=>row.kind==='page').length,total:blocks.length},patterns:blocks.map(row=>({id:row.id,kind:row.kind||'block',title:row.title,registry:'https://shine-blond.vercel.app/r/'+row.id+'.json'}))};
}
/** Raw element census is a review aid, not a claim of behavioral equivalence. */
export function controlCensus(project){
 const ts=load('typescript'),inventory=sourceInventory(project),findings=[];
 for(const file of inventory){if(/fixture/i.test(file.path))continue;const source=readFileSync(join(project,file.path),'utf8'),ast=ts.createSourceFile(file.path,source,ts.ScriptTarget.Latest,true);const controls=[];
  const visit=node=>{if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){const tag=node.tagName.getText(ast),attr=name=>node.attributes.properties.find(value=>ts.isJsxAttribute(value)&&value.name.getText(ast)===name)?.initializer;const type=attr('type');const value=type&&ts.isStringLiteral(type)?type.text:'';const kind=tag==='form'?'form':value==='file'?'file-upload':value==='date'?'date-input':value==='search'?'search':tag==='nav'?'navigation':tag==='table'?'table':null;if(kind)controls.push({kind,line:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1,tag});}ts.forEachChild(node,visit);};visit(ast);if(controls.length)findings.push({source:file.path,controls});
 }
 return {scannedFiles:inventory.length,files:findings.length,controls:findings.reduce((sum,file)=>sum+file.controls.length,0),findings};
}
export function verifyCoverage(project,contract){
 const inventory=sourceInventory(project),census=controlCensus(project),errors=[],checked=[];
 if(contract?.version!==1||!Array.isArray(contract.patterns)||!contract.patterns.length)return {status:'failed',required:blocks.length,checked:[],errors:['coverage needs a nonempty version 1 pattern population']};
 const seen=new Set();
 for(const pattern of contract.patterns){const block=blocks.find(row=>row.id===pattern.id);if(!block||seen.has(pattern.id)){errors.push('Unknown or duplicate pattern '+pattern.id);continue;}seen.add(pattern.id);
  if(pattern.decision==='not-needed'){
   if(typeof pattern.reason!=='string'||pattern.reason.trim().length<40)errors.push(pattern.id+': explain why this workflow is absent');
   const candidates=inventory.filter(file=>file.exports.some(name=>block.matches.includes(name)));
   const rawKinds=({'file-upload':['file-upload'],'filter-bar':['search'],'application-nav':['navigation']}[pattern.id]||[]);
   const raw=census.findings.filter(file=>file.controls.some(control=>rawKinds.includes(control.kind)));
   if(raw.length)errors.push(pattern.id+': raw controls exist and need a shared implementation or explicit product binding: '+raw.map(file=>file.source).join(', '));
   if(candidates.length)errors.push(pattern.id+': existing implementations cannot be marked absent: '+candidates.map(file=>file.path).join(', '));
   checked.push({id:pattern.id,decision:'not-needed',reason:pattern.reason});continue;
  }
  if(pattern.decision!=='reuse'){errors.push(pattern.id+': unfinished decision '+pattern.decision);continue;}
  if(typeof pattern.reason!=='string'||pattern.reason.trim().length<20)errors.push(pattern.id+': identify the product convention this source owns');
  const result=verifyReuse(project,{version:1,bindings:[{block:pattern.id,source:pattern.source,export:pattern.export,entries:pattern.entries,exceptions:pattern.exceptions}]});
  if(result.status!=='passed')errors.push(...result.errors.map(error=>pattern.id+': '+error));
  if(!Array.isArray(pattern.proofs)||!pattern.proofs.length||pattern.proofs.some(path=>typeof path!=='string'||!existsSync(join(project,path))))errors.push(pattern.id+': name existing executable consumer proof files');
  checked.push({id:pattern.id,decision:'reuse',source:pattern.source,export:pattern.export,proofs:pattern.proofs,importChecks:result.checked.length});
 }
 for(const block of blocks)if(!seen.has(block.id))errors.push('Unclassified pattern '+block.id);
 return {status:errors.length?'failed':'passed',required:blocks.length,classified:seen.size,checked,errors,scope:'Source coverage and executable-proof locations. Run the named browser workflows separately.'};
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=name=>args.includes(name)?args[args.indexOf(name)+1]:undefined,project=resolve(opt('--project')||process.cwd()),path=opt('--contract');
 const result={library:libraryInventory(),census:controlCensus(project),...(path?{coverage:verifyCoverage(project,JSON.parse(readFileSync(path,'utf8')))}:{coverage:{status:'not_tested',reason:'Supply --contract shine-coverage.json to classify every finished pattern.'}})};console.log(JSON.stringify(result,null,2));if(path&&result.coverage.status!=='passed')process.exitCode=1;
}
