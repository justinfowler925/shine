// Source-level readiness is distinct from rendered behavior and installation availability.
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {createRequire} from 'node:module';
import {load} from '../verify/deps.mjs';
const ts=load('typescript');
export function inspectReadiness(project, files, {prefix='', sourceRoot=null, cache=new Map()}={}) {
 const require=createRequire(join(resolve(project),'package.json')), errors=[], dependencies=new Set(), controls=new Set(), seen=new Set();
 let css=cache.get('consumer-css');if(css===undefined){const found=[];const walk=dir=>{if(!existsSync(dir))return;for(const e of readdirSync(dir,{withFileTypes:true})){if(e.isSymbolicLink()||['node_modules','.next','dist'].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.css'))found.push(readFileSync(p,'utf8'));}};for(const dir of ['src','app','styles'])walk(join(project,dir));css=found.join('\n');cache.set('consumer-css',css);}
 const config=ts.findConfigFile(project,ts.sys.fileExists,'tsconfig.json');
 const options=config?ts.parseJsonConfigFileContent(ts.readConfigFile(config,ts.sys.readFile).config,ts.sys,dirname(config)).options:{moduleResolution:ts.ModuleResolutionKind.Bundler,jsx:ts.JsxEmit.ReactJSX};
 const visit=(file,source)=>{if(seen.has(file))return;seen.add(file);source??=existsSync(file)?readFileSync(file,'utf8'):null;if(source===null){errors.push('Missing source: '+file);return;}
  for(const match of source.matchAll(/(?:bg|text|border|ring)-(background|foreground|muted(?:-foreground)?|primary(?:-foreground)?|secondary(?:-foreground)?|destructive(?:-foreground)?|border|input|ring|card(?:-foreground)?)(?=[\s"'`/])/g)){if(!new RegExp('--(?:color-)?'+match[1]+'\\s*:').test(css))errors.push('Missing consumer semantic token: '+match[1]);}
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  for(const node of ast.statements){if(!ts.isImportDeclaration(node)||!ts.isStringLiteral(node.moduleSpecifier))continue;const spec=node.moduleSpecifier.text;
   if(spec.startsWith('.')||spec.startsWith('@/')){
    let target;
    if(sourceRoot){const base=spec.startsWith('@/')?join(sourceRoot,spec.slice(2)):resolve(dirname(file),spec);target=[base,base+'.tsx',base+'.ts',join(base,'index.tsx'),join(base,'index.ts')].find(existsSync);}
    else target=ts.resolveModuleName(spec,file.startsWith(resolve(project)+'/')?file:join(project,'src/components/shine',file.split('/').at(-1)),options,ts.sys).resolvedModule?.resolvedFileName;
    if(!target){errors.push('Unresolved source/control: '+spec);continue;}
    controls.add(spec);
    const child=readFileSync(target,'utf8'), imported=node.importClause?.namedBindings;
    // Use the compiler's actual module exports, including re-exports.
    let names=cache.get(target);if(!names){const program=ts.createProgram([target],options),checker=program.getTypeChecker(),sf=program.getSourceFile(target),symbol=sf&&checker.getSymbolAtLocation(sf);names=new Set(symbol?checker.getExportsOfModule(symbol).map(x=>x.name):[]);cache.set(target,names);}
    if(imported&&ts.isNamedImports(imported))for(const item of imported.elements){const name=(item.propertyName||item.name).text;if(!names.has(name))errors.push('Missing export '+name+' from '+spec);}
    visit(target,child);
   }else{const pkg=spec.startsWith('@')?spec.split('/').slice(0,2).join('/'):spec.split('/')[0];dependencies.add(pkg);try{require.resolve(spec);}catch{errors.push('Missing installed dependency: '+spec);}}
  }
 };
 for(const file of files)visit(file.path,file.source);
 if(prefix)errors.push('Adapt source utilities to consumer Tailwind prefix '+prefix+' and run compatibility verification');
 if(sourceRoot)errors.push('Port source aliases and Untitled theme tokens to approved consumer owners; run compatibility and browser verification');
 return {status:errors.length?'needs-adaptation':'ready',errors:[...new Set(errors)],dependencies:[...dependencies].sort(),controls:[...controls].sort(),sourceFiles:[...seen],browserStatus:'not_tested'};
}
