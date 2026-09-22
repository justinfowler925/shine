import assert from 'node:assert/strict';
import {untitledEvidence,untitledSourceFingerprint} from '../corpus/untitled-proof.mjs';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,symlinkSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {selectImplementation} from '../integrations/library-select.mjs';
import {inspectReadiness} from '../integrations/readiness.mjs';
import {detectProject,RECIPES} from '../integrations/resolve.mjs';
import {verifySkillDeployment,profileDigest,editionSkill} from './edition.mjs';
const root=mkdtempSync(join(tmpdir(),'shine-readiness-'));const put=(p,v)=>{mkdirSync(join(root,p,'..'),{recursive:true});writeFileSync(join(root,p),typeof v==='string'?v:JSON.stringify(v));};
try{
 put('package.json',{});put('components.json',{$schema:'https://ui.shadcn.com/schema.json',aliases:{ui:'@/components/ui'}});put('tsconfig.json',{compilerOptions:{moduleResolution:'bundler',paths:{'@/*':['./src/*']}}});
 let selection=selectImplementation(root,'filter bar',{pattern:'filter-bar'});assert.equal(selection.selected.installable,true);assert.equal(selection.selected.available,false);assert.match(selection.selected.readiness.errors.join(' '),/Unresolved/);
 put('src/components/ui/button.tsx','export const Wrong=1');put('src/components/ui/input.tsx','export const Input=1');
 let result=inspectReadiness(root,[{path:'candidate.tsx',source:'import {Button} from "@/components/ui/button";'}]);assert.match(result.errors.join(' '),/Missing export Button/);
 put('src/components/ui/button.tsx','export const Button=1');result=inspectReadiness(root,[{path:'candidate.tsx',source:'import {Button} from "@/components/ui/button";'}]);assert.equal(result.status,'ready');
 result=inspectReadiness(root,[{path:'candidate.tsx',source:'import {Button} from "@/components/ui/button";'}],{prefix:'nx'});assert.equal(result.status,'needs-adaptation');
 const untitled=selectImplementation(root,'date picker').candidates.filter(x=>x.provider==='Untitled UI');assert.ok(untitled.length);assert.ok(untitled.every(x=>x.available===false&&x.readiness.browserStatus==='not_tested'));
 rmSync(join(root,'components.json'));put('package.json',{dependencies:{tailwindcss:'4', 'react-aria-components':'1'}});assert.equal(detectProject(root).installed[0],'untitled');assert.ok(RECIPES.untitled.packages.includes('react-aria-components'));
 // Synthetic unit fixture only; never emitted as delivery evidence.
 put('corpus/untitled-ui-react/components/demo.tsx','export const Demo=1');const example={id:'fixture-demo',sourceFile:'untitled-ui-react/components/demo.tsx'},corpus=join(root,'corpus'),receipt=join(root,'unit-receipt.json');
 const data={kind:'shine-untitled-render',sourceFingerprint:untitledSourceFingerprint(join(corpus,'untitled-ui-react')),results:[{id:example.id,status:'rendered',sourceSha256:createHash('sha256').update('export const Demo=1').digest('hex'),interactionStatus:'not_tested'}]};put('unit-receipt.json',data);assert.equal(untitledEvidence(example,corpus,receipt).render,'rendered');put('corpus/untitled-ui-react/styles/theme.css',':root{}');assert.equal(untitledEvidence(example,corpus,receipt).render,'not_tested');
 put('base/skill/SKILL.md','# Shine\nOriginal instructions\n');put('base/core/test.mjs','// base');put('edition/skill/references/clearspeed/profile-instructions.md','Profile instructions\n');put('edition/skill/SKILL.md',editionSkill(join(root,'base'),join(root,'edition/skill/references/clearspeed')));symlinkSync(join(root,'base/core'),join(root,'edition/core'));
 put('edition/clearspeed-edition.json',{skill:'shine',profile:'clearspeed',baseRelease:'base',profileHash:profileDigest(join(root,'edition/skill/references/clearspeed'))});assert.equal(verifySkillDeployment(join(root,'edition/skill'),join(root,'base')).status,'passed');put('edition/skill/references/clearspeed/profile-instructions.md','Tampered');assert.equal(verifySkillDeployment(join(root,'edition/skill'),join(root,'base')).status,'failed');
 console.log('PASS: missing primitive, wrong export, prefix adaptation, Untitled routing, installed recipe, edition integrity and tampering');
}finally{rmSync(root,{recursive:true,force:true});}
