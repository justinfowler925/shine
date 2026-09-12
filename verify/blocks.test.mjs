import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {blocks,planBlocks,verifyReuse} from '../integrations/blocks.mjs';
const temp=mkdtempSync(join(tmpdir(),'shine-reuse-'));
try{
 mkdirSync(join(temp,'src/ui'),{recursive:true});
 writeFileSync(join(temp,'tsconfig.json'),JSON.stringify({compilerOptions:{jsx:'react-jsx',moduleResolution:'bundler',baseUrl:'.',paths:{'@/*':['src/*']}}}));
 writeFileSync(join(temp,'src/ui/data-grid.tsx'),'export function DataGrid(){return <table/>}');
 writeFileSync(join(temp,'src/page.tsx'),'import {DataGrid} from "@/ui/data-grid"; export function Page(){return <DataGrid/>}');
 let plan=planBlocks(temp,'datagrid');assert.equal(plan.blocks.find(b=>b.id==='data-grid').decision,'reuse');assert.equal(plan.blocks.find(b=>b.id==='data-grid').candidates[0].path,'src/ui/data-grid.tsx');
 const contract={version:1,bindings:[{block:'data-grid',source:'src/ui/data-grid.tsx',export:'DataGrid',entries:['src/page.tsx']}]};
 assert.equal(verifyReuse(temp,contract).status,'passed');
 writeFileSync(join(temp,'src/page.tsx'),'export function Page(){return <table/>}');
 assert.equal(verifyReuse(temp,contract).status,'failed');
 writeFileSync(join(temp,'src/page.tsx'),'import {DataGrid} from "@/ui/data-grid"; export function Page(){return <DataGrid/>}');
 writeFileSync(join(temp,'src/ui/second.tsx'),'export function DataTable(){return <table/>}');
 assert.match(verifyReuse(temp,contract).errors.join('\n'),/competing implementation/);
 assert.throws(()=>verifyReuse(temp,{version:1,bindings:[]}),/nonempty/);
 contract.bindings[0].exceptions=[{source:'src/ui/second.tsx',reason:'A static printable statement, not an operational record collection.'}];
 assert.equal(verifyReuse(temp,contract).status,'passed');
 for(const block of blocks){const item=JSON.parse(readFileSync(new URL(`../site/r/${block.id}.json`,import.meta.url),'utf8'));assert.equal(item.type,'registry:block');assert.equal(item.files[0].content,readFileSync(new URL(`../blocks/${block.id}.tsx`,import.meta.url),'utf8'));assert.equal(item.cssVars,undefined);for(const primitive of block.primitives)assert.ok(item.registryDependencies.includes(primitive));}
 console.log(`blocks PASS: ${blocks.length} registry sources, existing-component discovery, source imports, duplicate and empty-denominator negative controls`);
}finally{rmSync(temp,{recursive:true,force:true});}
