import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {detectProject, resolveIntegration} from '../integrations/resolve.mjs';
import {scaffold} from '../integrations/scaffold.mjs';
import {createDesignPacket} from '../core/design-packet.mjs';
const root=mkdtempSync(join(tmpdir(),'shine-layers-'));
function fixture(name,{tailwind=false,shadcn=false,tanstack=false,version='4.1.0',installed=true}={}) {
 const dir=join(root,name);mkdirSync(dir,{recursive:true});
 const dependencies={react:'19.0.0',...(tailwind?{tailwindcss:version}:{}),...(tanstack?{'@tanstack/react-table':'9.1.2'}:{})};
 writeFileSync(join(dir,'package.json'),JSON.stringify({dependencies}));
 if(shadcn)writeFileSync(join(dir,'components.json'),JSON.stringify({tailwind:{css:'src/theme.css',prefix:'tw'},aliases:{ui:'@/shared/ui'}}));
 if(installed)for(const [name,version] of Object.entries(dependencies)) {
  const pkg=join(dir,'node_modules',name);
  if(name==='@tanstack/react-table') {mkdirSync(join(dir,'node_modules/@tanstack'),{recursive:true});symlinkSync(new URL('./fixtures/integrations/node_modules/@tanstack/react-table',import.meta.url).pathname,pkg);}
  else {mkdirSync(pkg,{recursive:true});writeFileSync(join(pkg,'package.json'),JSON.stringify({name,version}));}
 }
 return dir;
}
try {
 const cases=[['tailwind',{tailwind:true},'tailwind'],['shadcn',{shadcn:true},'shadcn'],['tanstack',{tanstack:true},'tanstack'],['combined',{tailwind:true,shadcn:true,tanstack:true},'shadcn-tanstack'],['custom-table',{tailwind:true,tanstack:true},'tailwind-tanstack'],['shadcn-styled',{tailwind:true,shadcn:true},'shadcn']];
 for(const [name,options,key] of cases) {
  const dir=fixture(name,options),resolved=resolveIntegration(dir);
  assert.equal(resolved.kit,key);assert.equal(resolved.layers.components.name,options.shadcn?'shadcn':'consumer');
  assert.equal(resolved.layers.styling.name,options.tailwind?'tailwind':'consumer-css');
  assert.equal(resolved.recipe.packages.includes('@tanstack/react-table'),Boolean(options.tanstack));
  const built=scaffold(dir,join(root,`${name}-output`));
  assert(!built.source.includes('undefined'));
  if(!options.tanstack)assert(!built.source.includes('@tanstack/'));
  const contract=JSON.parse(readFileSync(join(built.dest,'shine-integration.json'),'utf8'));assert.equal(contract.scaffoldKind,'adapter-only');
  if(!options.tanstack){assert.deepEqual(contract.requiredControls,[]);assert.equal(contract.filename,'ShineComponents.tsx');}
  const packet=createDesignPacket({job:'review customer records',category:'datagrid',project:dir});
  assert.equal(packet.integration.key,key);assert.deepEqual(packet.integration.layers,resolved.layers);assert.equal(packet.integration.validated,true);
  if(options.shadcn)assert.equal(resolved.layers.components.aliases.ui,'@/shared/ui');
 }
 const missingPacket=createDesignPacket({job:'review customer records',category:'datagrid',project:fixture('packet-missing',{tailwind:true,installed:false})});
 assert.equal(missingPacket.integration.validated,false);assert.deepEqual(missingPacket.integration.imports,[]);assert.match(missingPacket.integration.validationError,/not installed/);
 const badExports=fixture('bad-exports');
 writeFileSync(join(badExports,'package.json'),JSON.stringify({dependencies:{react:'19', '@tanstack/react-table':'9.1.2'}}));
 mkdirSync(join(badExports,'node_modules/@tanstack/react-table'),{recursive:true});
 writeFileSync(join(badExports,'node_modules/@tanstack/react-table/package.json'),JSON.stringify({name:'@tanstack/react-table',version:'9.1.2',main:'index.cjs'}));
 writeFileSync(join(badExports,'node_modules/@tanstack/react-table/index.cjs'),'module.exports = {};');
 assert.throws(()=>resolveIntegration(badExports),/lacks required exports/);
 const tw3=resolveIntegration(fixture('tw3',{tailwind:true,version:'3.4.17'}));assert.equal(tw3.layers.styling.installedVersion,'3.4.17');
 assert.throws(()=>resolveIntegration(fixture('missing',{tailwind:true,installed:false})),/declared but not installed/);
 assert.throws(()=>resolveIntegration(fixture('unknown-version',{tailwind:true,version:'99.0.0'})),/supported styling guidance/);
 assert.throws(()=>resolveIntegration(fixture('no-kit')),/choose explicitly/);
 assert.throws(()=>resolveIntegration(fixture('custom',{tailwind:true}),'shadcn'),/refusing to add/);
 const lexDir=fixture('lex',{tailwind:true,shadcn:true});writeFileSync(join(lexDir,'sfdx-project.json'),'{}');
 const lex=createDesignPacket({job:'review a claim',category:'record',project:lexDir,lane:'lex'});assert.equal(lex.integration.layers.styling.name,'slds');
 console.log('component layers PASS: six stack combinations, v3/v4, missing/unsupported dependency refusal, no forced component kit, Salesforce isolation; metadata fixtures plus real TanStack v9 exports');
} finally {rmSync(root,{recursive:true,force:true});}
