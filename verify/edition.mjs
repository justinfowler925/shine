import {existsSync,readFileSync,readdirSync,realpathSync} from 'node:fs';
import {join,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
export function profileDigest(path){const files=[];const walk=dir=>{for(const e of readdirSync(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Profile symlinks are not allowed');const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())files.push(p);}};walk(path);const h=createHash('sha256');for(const p of files.sort())h.update(relative(path,p).replaceAll('\\','/')).update(readFileSync(p));return h.digest('hex');}
export function editionSkill(base,profile){return readFileSync(join(base,'skill/SKILL.md'),'utf8').replace('# Shine\n','# Shine\n'+readFileSync(join(profile,'profile-instructions.md'),'utf8')).replace('Use for UI, UX, dashboards, tables, forms, landing pages, charts, email, Lightning, decks, PDFs, or visual polish.','Use for UI, UX, dashboards, tables, forms, landing pages, charts, email, Lightning, decks, PDFs, or visual polish. Includes the Clearspeed application profile for Nucleus and Clearspeed work.');}
export function verifySkillDeployment(skill,base){try{
 base=realpathSync(base);skill=realpathSync(skill);if(skill===join(base,'skill'))return {status:'passed',kind:'base'};
 const edition=dirname(skill),manifest=JSON.parse(readFileSync(join(edition,'clearspeed-edition.json'),'utf8')),profile=join(skill,'references/clearspeed');
 let revision=base.split('/').at(-1);if(existsSync(join(base,'.git')))revision=execFileSync('git',['-C',base,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 if(manifest.skill!=='shine'||manifest.profile!=='clearspeed'||manifest.baseRelease!==revision)throw Error('Edition is bound to a different base release');
 if(profileDigest(profile)!==manifest.profileHash)throw Error('Edition profile content hash differs');
 if(readFileSync(join(skill,'SKILL.md'),'utf8')!==editionSkill(base,profile))throw Error('Edition loader differs from base plus profile instructions');
 for(const e of readdirSync(base,{withFileTypes:true}))if(e.name!=='skill'&&realpathSync(join(edition,e.name))!==realpathSync(join(base,e.name)))throw Error('Edition runtime differs: '+e.name);
 const walk=(dir)=>{for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name),rel=relative(join(base,'skill'),p);if(rel==='SKILL.md')continue;if(e.isDirectory())walk(p);else if(!readFileSync(join(skill,rel)).equals(readFileSync(p)))throw Error('Inherited skill reference differs: '+rel);}};walk(join(base,'skill'));
 return {status:'passed',kind:'edition',profile:manifest.profile,profileVersion:manifest.profileVersion,baseRelease:revision,profileHash:manifest.profileHash};
 }catch(error){return {status:'failed',reason:error.message};}}
