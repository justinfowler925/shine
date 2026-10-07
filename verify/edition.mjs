import {existsSync,readFileSync,readdirSync,realpathSync,lstatSync} from 'node:fs';
import {join,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {
 assertDdrHasEditionCatalog,
 DEFAULT_OPERATE_CONSTITUTION_ID,
} from '../core/constitution.mjs';
import {
 loadEditionSiblingMap,
 validateEditionSiblingMap,
 DEFAULT_OPERATE_SIBLING_EDITION,
} from '../core/edition-siblings.mjs';
export function profileDigest(path){const files=[];const walk=dir=>{for(const e of readdirSync(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Profile symlinks are not allowed');const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())files.push(p);}};walk(path);const h=createHash('sha256');for(const p of files.sort())h.update(relative(path,p).replaceAll('\\','/')).update(readFileSync(p));return h.digest('hex');}
/**
 * Edition verify bite: ClearSpeed Operate DDR must carry the full catalog ids.
 * Fails closed when constitutionIds is missing or omits any clearspeed-operate principle.
 */
export function verifyOperateDdrConstitution(ddr,{editionId=DEFAULT_OPERATE_CONSTITUTION_ID}={}){
 try{
  const result=assertDdrHasEditionCatalog(ddr,{editionId});
  return {status:'passed',editionId:result.editionId,constitutionIds:result.constitutionIds,ddrId:ddr?.ddrId||null};
 }catch(error){
  return {status:'failed',reason:error.message,editionId,ddrId:ddr?.ddrId||null};
 }
}
/**
 * Edition verify bite: sibling map must load + validate (enterprise §4).
 */
export function verifyEditionSiblingMap({editionId=DEFAULT_OPERATE_SIBLING_EDITION}={}){
 try{
  const doc=loadEditionSiblingMap(editionId);
  const errors=validateEditionSiblingMap(doc);
  if(errors.length)throw Error(errors.join('; '));
  return {status:'passed',editionId:doc.editionId,siblings:doc.siblings.length,owners:doc.owners.length};
 }catch(error){
  return {status:'failed',reason:error.message,editionId};
 }
}
export function editionSkill(base,profile){return readFileSync(join(base,'skill/SKILL.md'),'utf8').replace('# Shine\n','# Shine\n'+readFileSync(join(profile,'profile-instructions.md'),'utf8')).replace(/Use for UI,\s+UX,[\s\S]*?visual polish\./,m=>m+' Includes the Clearspeed application profile for Nucleus and Clearspeed work.');}
function walkTextFiles(dir,out=[]){for(const e of readdirSync(dir,{withFileTypes:true})){if(e.name==='node_modules'||e.name==='.git')continue;const p=join(dir,e.name);if(e.isSymbolicLink())continue;if(e.isDirectory())walkTextFiles(p,out);else if(e.isFile())out.push(p);}return out;}
function assertClearspeedBrand(edition,profile){
 const brandFile=join(profile,'brand.json');
 if(!existsSync(brandFile))return;
 const brand=JSON.parse(readFileSync(brandFile,'utf8'));
 const action=String(brand?.color?.brand?.action||'');
 if(action.toUpperCase()!=='#ED5925')throw Error('Clearspeed brand.json action must be #ED5925');
 const tokens=join(edition,'tokens');
 if(!existsSync(tokens)||lstatSync(tokens).isSymbolicLink())throw Error('Clearspeed brand overlay requires a materialized tokens tree');
 const blob=walkTextFiles(tokens).map(f=>readFileSync(f,'utf8')).join('\n');
 if(/#4338ca/i.test(blob))throw Error('Placeholder #4338ca remains in edition tokens');
 if(!/#ED5925/i.test(blob))throw Error('Clearspeed #ED5925 missing from edition tokens');
 const profileBlob=walkTextFiles(profile).map(f=>readFileSync(f,'utf8')).join('\n');
 if(/#4338ca/i.test(profileBlob))throw Error('Placeholder #4338ca remains in Clearspeed profile');
 if(!/#ED5925/i.test(profileBlob))throw Error('Clearspeed #ED5925 missing from profile');
}
export function verifySkillDeployment(skill,base){try{
 base=realpathSync(base);skill=realpathSync(skill);if(skill===join(base,'skill'))return {status:'passed',kind:'base'};
 const edition=dirname(skill),manifest=JSON.parse(readFileSync(join(edition,'clearspeed-edition.json'),'utf8')),profile=join(skill,'references/clearspeed');
 let revision=base.split('/').at(-1);if(existsSync(join(base,'.git')))revision=execFileSync('git',['-C',base,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 if(manifest.skill!=='shine'||manifest.profile!=='clearspeed'||manifest.baseRelease!==revision)throw Error('Edition is bound to a different base release');
 if(profileDigest(profile)!==manifest.profileHash)throw Error('Edition profile content hash differs');
 if(readFileSync(join(skill,'SKILL.md'),'utf8')!==editionSkill(base,profile))throw Error('Edition loader differs from base plus profile instructions');
 const brandOverlay=existsSync(join(profile,'brand.json'));
 for(const e of readdirSync(base,{withFileTypes:true})){
  if(e.name==='skill')continue;
  if(e.name==='tokens'&&brandOverlay){
   if(lstatSync(join(edition,e.name)).isSymbolicLink())throw Error('Edition tokens must be materialized when brand.json is present');
   continue;
  }
  if(realpathSync(join(edition,e.name))!==realpathSync(join(base,e.name)))throw Error('Edition runtime differs: '+e.name);
 }
 // Clearspeed profile is edition-owned when brand.json is present — do not
 // require byte-identity with the base release's profile copy.
 const walk=(dir)=>{for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name),rel=relative(join(base,'skill'),p);if(rel==='SKILL.md')continue;if(brandOverlay&&(rel==='references/clearspeed'||rel.startsWith('references/clearspeed/')))continue;if(e.isDirectory())walk(p);else if(!readFileSync(join(skill,rel)).equals(readFileSync(p)))throw Error('Inherited skill reference differs: '+rel);}};walk(join(base,'skill'));
 assertClearspeedBrand(edition,profile);
 return {status:'passed',kind:'edition',profile:manifest.profile,profileVersion:manifest.profileVersion,baseRelease:revision,profileHash:manifest.profileHash,brandAccent:brandOverlay?'#ED5925':null};
 }catch(error){return {status:'failed',reason:error.message};}}
