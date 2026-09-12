#!/usr/bin/env node
// The product's source owns reuse. A catalog reference never authorizes another implementation.
import {existsSync,readFileSync,readdirSync,realpathSync} from 'node:fs';
import {dirname,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {load} from '../verify/deps.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const blocks=JSON.parse(readFileSync(join(ROOT,'blocks/catalog.json'),'utf8')).blocks;
const ignored=new Set(['node_modules','.git','.next','dist','build','coverage','.vercel','vendor']);
export function sourceInventory(project){
 const root=realpathSync(project),ts=load('typescript'),files=[];
 const visit=dir=>{for(const entry of readdirSync(dir,{withFileTypes:true})){if(entry.isSymbolicLink()||ignored.has(entry.name)||entry.name.startsWith('.'))continue;const path=join(dir,entry.name);if(entry.isDirectory())visit(path);else if(/\.[jt]sx?$/.test(path)&&!/(?:\.test|\.spec|\.d)\.[jt]sx?$/.test(path))files.push(path);}};
 for(const dir of ['src','app','components','pages'])if(existsSync(join(root,dir)))visit(join(root,dir));
 return [...new Set(files)].sort().map(path=>{const source=readFileSync(path,'utf8'),ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true),exports=[];
  for(const node of ast.statements){if(!node.modifiers?.some(mod=>mod.kind===ts.SyntaxKind.ExportKeyword))continue;
   if(ts.isFunctionDeclaration(node)||ts.isClassDeclaration(node)){if(node.name)exports.push(node.name.text);}
   if(ts.isVariableStatement(node))for(const declaration of node.declarationList.declarations)if(ts.isIdentifier(declaration.name))exports.push(declaration.name.text);
  }
  return {path:relative(root,path),exports,sha256:createHash('sha256').update(source).digest('hex')};
 });
}
export function planBlocks(project,category=''){
 const inventory=sourceInventory(project);
 const coveragePath=join(project,"shine-coverage.json"),declared=existsSync(coveragePath)?JSON.parse(readFileSync(coveragePath,"utf8")).patterns||[]:[];
 return {version:1,project:resolve(project),scannedFiles:inventory.length,blocks:blocks.filter(b=>!category||b.categories.includes(category)).map(block=>{
  const binding=declared.find(pattern=>pattern.id===block.id&&pattern.decision==="reuse");
  const candidates=inventory.flatMap(file=>file.exports.filter(name=>block.matches.includes(name)||(file.path===binding?.source&&name===binding?.export)).map(name=>({path:file.path,export:name,sha256:file.sha256})));
  return {id:block.id,kind:block.kind||"block",title:block.title,decision:candidates.length?'reuse':'install-if-needed',candidates,registry:`https://shine-blond.vercel.app/r/${block.id}.json`,source:join(ROOT,`blocks/${block.id}.tsx`),instruction:candidates.length?'Import the existing implementation. Extend it for a demonstrated gap; do not install a competing block.':'Use this block only when the page needs this object. Install through the consumer shadcn CLI; preserve aliases, prefix, tokens and existing primitives.'};
 })};
}
/** Bind each repeated object to an actual exported component and prove every entry imports it. */
export function verifyReuse(project,contract){
 const ts=load('typescript'),root=realpathSync(project),inventory=sourceInventory(root),errors=[],checked=[];
 if(contract.version!==1||!Array.isArray(contract.bindings)||!contract.bindings.length)throw new Error('reuse contract needs nonempty version 1 bindings');
 const config=ts.findConfigFile(root,ts.sys.fileExists,'tsconfig.json');const options=config?ts.parseJsonConfigFileContent(ts.readConfigFile(config,ts.sys.readFile).config,ts.sys,dirname(config)).options:{allowJs:true,moduleResolution:ts.ModuleResolutionKind.Bundler};
 const graph=entry=>{const visited=new Set();const walk=file=>{file=realpathSync(file);if(visited.has(file)||file.includes('/node_modules/'))return;visited.add(file);const ast=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);const visit=node=>{let spec;if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))spec=node.moduleSpecifier.text;else if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0]))spec=node.arguments[0].text;if(spec){const resolved=ts.resolveModuleName(spec,file,options,ts.sys).resolvedModule?.resolvedFileName;if(resolved&&!resolved.includes('/node_modules/'))walk(resolved);}ts.forEachChild(node,visit);};visit(ast);};walk(resolve(root,entry));return visited;};
 const ids=new Set();for(const binding of contract.bindings){
  const block=blocks.find(b=>b.id===binding.block);if(!block||ids.has(binding.block)){errors.push(`unknown or duplicate block ${binding.block}`);continue;}ids.add(binding.block);
  const source=inventory.find(file=>file.path===binding.source&&file.exports.includes(binding.export));if(!source){errors.push(`${binding.block}: source must export ${binding.export}`);continue;}
  const duplicates=inventory.filter(file=>file.path!==source.path&&file.exports.some(name=>block.matches.includes(name)));
  for(const duplicate of duplicates){const allowed=binding.exceptions?.find(e=>e.source===duplicate.path&&typeof e.reason==='string'&&e.reason.trim().length>=20);if(!allowed)errors.push(`${binding.block}: competing implementation ${duplicate.path}; reuse or document the different job`);}
  if(!Array.isArray(binding.entries)||!binding.entries.length)errors.push(`${binding.block}: no consumer entrypoints`);
  for(const entry of binding.entries||[])try{if(!graph(entry).has(realpathSync(join(root,source.path))))errors.push(`${entry} does not import ${source.path}`);else checked.push({block:binding.block,entry,source:source.path,sha256:source.sha256});}catch(error){errors.push(`${entry}: ${error.message}`);}
 }
 return {status:errors.length?'failed':'passed',scannedFiles:inventory.length,bindings:contract.bindings.length,checked,errors};
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),opt=n=>args.includes(n)?args[args.indexOf(n)+1]:'';
 try{const result=opt('--contract')?verifyReuse(opt('--project')||process.cwd(),JSON.parse(readFileSync(opt('--contract'),'utf8'))):planBlocks(opt('--project')||process.cwd(),opt('--category'));console.log(JSON.stringify(result,null,2));if(result.status==='failed')process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=1;}
}
