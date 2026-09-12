import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { blocks } from '../integrations/blocks.mjs';
import { libraryInventory, controlCensus, verifyCoverage } from '../integrations/coverage.mjs';
const root=mkdtempSync(join(tmpdir(),'shine-coverage-'));
try{
 mkdirSync(join(root,'src'));writeFileSync(join(root,'src/page.tsx'),'export function Page(){return <form><input type="file"/><input type="search"/></form>}');
 const census=controlCensus(root);assert.equal(census.controls,3);assert.equal(census.files,1);
 const contract={version:1,patterns:blocks.map(block=>({id:block.id,decision:'not-needed',reason:'This test consumer has no matching finished workflow; classify the population explicitly.'}))};
 assert.match(verifyCoverage(root,contract).errors.join('\n'),/raw controls exist/);
 writeFileSync(join(root,'src/page.tsx'),'export function Page(){return <p>No interactive workflows</p>}');
 assert.equal(verifyCoverage(root,contract).status,'passed');
 const missing={...contract,patterns:contract.patterns.slice(1)};assert.match(verifyCoverage(root,missing).errors.join('\n'),/Unclassified/);
 writeFileSync(join(root,'src/grid.tsx'),'export function DataGrid(){return <table/>}');assert.match(verifyCoverage(root,contract).errors.join('\n'),/cannot be marked absent/);
 writeFileSync(join(root,'src/page.tsx'),'import {DataGrid} from "./grid";export function Page(){return <DataGrid/>}');writeFileSync(join(root,'browser-proof.mjs'),'// executable consumer proof location');
 const pattern=contract.patterns.find(row=>row.id==='data-grid');Object.assign(pattern,{decision:'reuse',source:'src/grid.tsx',export:'DataGrid',entries:['src/page.tsx'],proofs:['browser-proof.mjs'],reason:'The installed product grid owns all record-list behavior.'});assert.equal(verifyCoverage(root,contract).status,'passed');
 pattern.proofs=['missing.mjs'];assert.match(verifyCoverage(root,contract).errors.join('\n'),/executable consumer proof/);pattern.proofs=['browser-proof.mjs'];writeFileSync(join(root,'src/page.tsx'),'export function Page(){return <table/>}');assert.match(verifyCoverage(root,contract).errors.join('\n'),/does not import/);
 const counts=libraryInventory();assert.equal(counts.implementations.blocks,14);assert.equal(counts.implementations.pages,5);assert.equal(counts.references.total,130);
 console.log('coverage PASS: reference/implementation counts, raw control census, missing pattern, false absence, disconnected source and missing proof controls');
}finally{rmSync(root,{recursive:true,force:true});}
