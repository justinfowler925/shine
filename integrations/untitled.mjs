#!/usr/bin/env node
// Public source adapter: never silently installs a second control system.
import {readFileSync,existsSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';
import {inspectReadiness} from './readiness.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
export function planUntitled(project,id){
 const catalog=JSON.parse(readFileSync(join(root,'corpus/untitledui-examples.json'),'utf8'));
 const example=catalog.examples.find(x=>x.id===id);if(!example)throw Error('Unknown public Untitled example: '+id);
 const corpus=process.env.DESIGN_CORPUS||join(homedir(),'design-corpus'),sourceRoot=join(corpus,'untitled-ui-react'),source=join(corpus,example.sourceFile);
 const config=existsSync(join(project,'components.json'))?JSON.parse(readFileSync(join(project,'components.json'),'utf8')):{};
 const readiness=inspectReadiness(project,[{path:source}],{prefix:config.tailwind?.prefix||'',sourceRoot});
 return {provider:'Untitled UI',id,export:example.export,source,license:example.license,upstream:catalog.upstream,readiness,themeSource:join(sourceRoot,'styles/globals.css'),instructions:['Reuse an existing product owner when it already serves this job.','Review the complete sourceFiles closure; sourceExcerpt is not an implementation.','Explicitly resolve missing dependencies, aliases and theme tokens before copying.','Run integrations/compatibility.mjs against adapted files, then browser tests.'],mutation:false};
}
if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){const a=process.argv.slice(2),opt=n=>a.includes(n)?a[a.indexOf(n)+1]:undefined;console.log(JSON.stringify(planUntitled(resolve(opt('--project')||'.'),opt('--example')),null,2));}
