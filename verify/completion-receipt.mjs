import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,renameSync,readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
const hash=value=>createHash('sha256').update(value).digest('hex');
export function sourceBinding(project){
 if(!project)throw new Error('browser completion receipt requires --project');
 const root=resolve(project),git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 const commit=git('rev-parse','HEAD');
 if(git('status','--porcelain'))throw new Error('commit the source and keep the project clean before binding browser proof');
 return {project:root,commit};
}
export function bindBrowser({target,project,expectedCommit,expectedBuild,observed}){
 const source=sourceBinding(project);
 if(expectedCommit&&expectedCommit!==source.commit)throw new Error('requested commit differs from project HEAD');
 if(!observed?.sourceCommit||observed.sourceCommit!==source.commit)throw new Error('rendered app source commit does not match project HEAD');
 if(!observed.buildId)throw new Error('rendered app did not expose a build identity');
 if(expectedBuild&&expectedBuild!==observed.buildId)throw new Error('rendered build identity does not match requested build');
 if(new URL(target).href!==new URL(observed.url).href)throw new Error('rendered URL differs from requested URL (redirect or login)');
 if(!Number.isFinite(observed.status)||observed.status<200||observed.status>=300)throw new Error(`render returned HTTP ${observed.status}`);
 return {...source,url:observed.url,buildId:observed.buildId,renderedSha256:observed.renderedSha256,screenshotSha256:observed.screenshotSha256};
}
const requiredChecks=['accessibility','styling','layout','interactions','referenceValidity','visualComparison','buildBinding'];
const complete=checks=>checks&&requiredChecks.every(k=>checks[k]?.status==='passed')&&Object.values(checks).every(c=>c.status==='passed');
export function writeCompletionReceipt(path,report,binding){
 if(report.status!=='passed'||!complete(report.checks))throw new Error('cannot issue completion receipt for partial or failed checks');
 const receipt={version:1,kind:'completion',verdict:'passed',at:Date.now(),binding,reportSha256:hash(JSON.stringify(report)),checks:report.checks};
 mkdirSync(dirname(resolve(path)),{recursive:true});const temp=path+'.'+process.pid+'.tmp';writeFileSync(temp,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});renameSync(temp,path);return receipt;
}
export function validateCompletionReceipt(path,project,{buildId,now=Date.now()}={}){
 try{const receipt=JSON.parse(readFileSync(path,'utf8')),source=sourceBinding(project);
 if(receipt.kind!=='completion'||receipt.verdict!=='passed'||!complete(receipt.checks))return ['not a complete verification receipt'];
 if(receipt.binding?.commit!==source.commit||receipt.binding?.project!==source.project)return ['source changed after verification'];
 if(buildId&&buildId!==receipt.binding.buildId)return ['build changed after verification'];
 if(!Number.isFinite(receipt.at)||receipt.at>now+60000||now-receipt.at>20*60*1000)return ['receipt expired or future-dated'];
 return [];
 }catch(error){return [error.message];}
}
