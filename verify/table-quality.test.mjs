import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync, realpathSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from './deps.mjs';
import { auditTables, sourceProof } from './table-quality.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const fixture=join(root,'fixtures/table-quality');
const dir=mkdtempSync(join(tmpdir(),'shine-table-quality-'));cpSync(fixture,dir,{recursive:true});
const original=JSON.parse(readFileSync(join(dir,'shine-tables.json')));
const server=createServer((req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  try{const file=readFileSync(join(dir,path));res.setHeader('Content-Type',path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.json')?'application/json':'text/html');res.end(file)}catch{res.writeHead(404);res.end()}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await load('playwright').chromium.launch();
const contractPath=join(dir,'shine-tables.json');
let passed=0;
async function run({mutate,script='',css='',contract=structuredClone(original),target='candidate.html',missing=false}={}){
  contract.grids[0].reference.target=`${base}/reference.html`;
  writeFileSync(contractPath,JSON.stringify(contract));
  const context=await browser.newContext();
  if(script)await context.addInitScript(script);
  if(css)await context.route('**/candidate.html',async route=>route.fulfill({contentType:'text/html',body:readFileSync(join(dir,'candidate.html'),'utf8').replace('</head>',`<style>${css}</style></head>`)}));
  if(mutate)await context.route('**/shared.js',async route=>route.fulfill({contentType:'text/javascript',body:mutate(readFileSync(join(dir,'shared.js'),'utf8'))}));
  const page=await context.newPage();await page.goto(`${base}/${target}`,{waitUntil:'networkidle'});
  try{return await auditTables({page,target:`${base}/${target}`,contractPath:missing?join(dir,'absent.json'):contractPath,timeout:300});}finally{await context.close();}
}
function passes(name,result){assert.equal(result.status,'passed',`${name}: ${JSON.stringify(result.checks.filter(c=>c.status!=='passed'))}`);passed++;}
function fails(name,result,fragment){assert.equal(result.status,'failed',name);assert(result.checks.some(c=>c.status!=='passed'&&`${c.name} ${c.reason}`.includes(fragment)),`${name}: ${JSON.stringify(result)}`);passed++;}
try{
  passes('working shared pattern',await run());
  // Exercise the actual measure CLI too: implicit browser.newPage contexts cannot
  // open scenario pages, a regression the import-level test alone cannot catch.
  const measured=await promisify(execFile)(process.execPath,[join(root,'measure.mjs'),`${base}/candidate.html`,'--table-contract',contractPath,'--json',join(dir,'measure.json')],{cwd:dir,maxBuffer:1024*1024});
  assert.equal(JSON.parse(readFileSync(join(dir,'measure.json'))).tableQuality.status,'passed',measured.stdout);passed++;
  fails('missing proof fails closed',await run({missing:true}),'not proof');
  fails('sort arrow only',await run({mutate:s=>s.replace('if(direction)rows.sort','if(false)rows.sort')}),'sort');
  fails('decorative action',await run({mutate:s=>s.replace("$('#detail').textContent=","button.dataset.fake=")}), 'rowAction');
  fails('inert search',await run({mutate:s=>s.replace('query=e.target.value','query=\'\'')}),'search');
  fails('inert filter',await run({mutate:s=>s.replace('owner=e.target.value',"owner='' ")}), 'filter');
  fails('fake pagination',await run({mutate:s=>s.replace('page++;render()',"$('#range').textContent='next' ")}), 'pagination');
  fails('inert columns',await run({mutate:s=>s.replace('showOwner=!showOwner','showOwner=true')}),'visibility');
  fails('hidden loading marker',await run({mutate:s=>s.replace("$('#loading').hidden=false","$('#loading').hidden=true")}), 'loading');
  fails('hidden error marker',await run({mutate:s=>s.replace("$('#error').hidden=false","$('#error').hidden=true")}), 'error');
  fails('inert retry',await run({mutate:s=>s.replace("$('#retry').onclick=fetchRecords","$('#retry').onclick=()=>{}")}), 'retry');
  fails('hodgepodge cell styling',await run({css:'td{padding:3px 27px;font-size:11px}th{font-size:22px}'}),'product pattern');
  fails('missing toolbar',await run({css:'#toolbar{display:none}'}),'product pattern');
  const noVisibility=structuredClone(original);delete noVisibility.grids[0].cases.visibility;
  const fakeRecords=structuredClone(original);fakeRecords.grids[0].cases.search.steps[0]={op:'rows',selector:'h1',equals:['Deal support']};
  fails('labels cannot masquerade as record assertions',await run({contract:fakeRecords}),'actual table cells');
  fails('missing capability scenario',await run({contract:noVisibility}), 'visibility');
  const missingSource=structuredClone(original);missingSource.grids[0].source.entry='data.json';
  fails('parallel component',await run({contract:missingSource}),'same shared table');
  const self=structuredClone(original);self.grids[0].reference.selector='#missing';
  fails('reference selector absent',await run({contract:self}),'product pattern');
  const staticContract=structuredClone(original);staticContract.grids[0].kind='static';staticContract.grids[0].reason='pretend this queue is static';
  fails('static escape hatch',await run({contract:staticContract}),'interactive records');
  const bulk=structuredClone(original);bulk.grids[0].bulkActions=true;
  fails('bulk selection missing',await run({contract:bulk}), 'selection');
  const onePage=structuredClone(original);onePage.grids[0].cases.pagination={routes:[{url:'**/data.json',responses:[{body:[{account:'Bravo',owner:'Unassigned'}]}]}],steps:[{op:'rows',selector:'tbody .account',equals:['Bravo']},{op:'disabled',selector:'#next'},{op:'disabled',selector:'#previous'}]};
  passes('valid one-page pagination',await run({contract:onePage}));
  for(const name of ['full-table.html','queue.html','table-presence-clone.html','pretty-empty-table.html']){
    cpSync(join(root,'fixtures',name),join(dir,name));
    fails(`reject ${name}`,await run({target:name,missing:true}),'not proof');
  }
  const proof=sourceProof(original.grids[0].source,dir);assert(proof.files[realpathSync(join(dir,'shared.js'))]);passed++;
  // Real installed state engine, tsconfig alias, and re-export resolution.
  symlinkSync(join(root,'fixtures/integrations/node_modules'),join(dir,'node_modules'));
  writeFileSync(join(dir,'package.json'),JSON.stringify({dependencies:{react:'19','@tanstack/react-table':'9'}}));
  writeFileSync(join(dir,'tsconfig.json'),JSON.stringify({compilerOptions:{moduleResolution:'bundler',baseUrl:'.',paths:{'@/*':['./*']}}}));
  writeFileSync(join(dir,'engine.ts'),"import { useTable } from '@tanstack/react-table'; export { useTable };\n");
  writeFileSync(join(dir,'barrel.ts'),"export * from './engine';\n");
  writeFileSync(join(dir,'entry.ts'),"import {useTable} from '@/barrel'; export {useTable};\n");
  const engine={entry:'entry.ts',referenceEntry:'barrel.ts',shared:'engine.ts',package:'@tanstack/react-table'};
  assert.equal(sourceProof(engine,dir).package,'@tanstack/react-table');passed++;
  assert.throws(()=>sourceProof({...engine,package:'fake-grid'},dir),/does not resolve/);passed++;
  assert.throws(()=>sourceProof({...engine,package:undefined},dir),/React record tables/);passed++;
  console.log(`table quality PASS: ${passed} positive and rejection cases; real browser outcomes, shared source, scoped pattern at two widths`);
}finally{await browser.close();await new Promise(done=>server.close(done));rmSync(dir,{recursive:true,force:true});}
