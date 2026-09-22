// Browser evidence is optional and source-bound; catalog membership never implies proof.
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {homedir} from 'node:os';
export function untitledSourceFingerprint(root){const files=[];const walk=dir=>{if(!existsSync(dir))return;for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())files.push(p);}};for(const dir of ['components','hooks','styles','utils'])walk(join(root,dir));const hash=createHash('sha256');for(const f of files.sort())hash.update(f.slice(root.length+1)).update(readFileSync(f));return hash.digest('hex');}
export function untitledEvidence(example,corpus,receiptPath=process.env.SHINE_UNTITLED_PROOF||join(homedir(),'.local/share/shine/evidence/untitled-public.json')){
 if(!receiptPath||!existsSync(receiptPath))return {render:'not_tested',interactions:'not_tested'};
 try{const receipt=JSON.parse(readFileSync(receiptPath,'utf8'));if(receipt.kind!=='shine-untitled-render')throw Error('Wrong receipt kind');if(receipt.sourceFingerprint!==untitledSourceFingerprint(join(corpus,'untitled-ui-react')))throw Error('Source closure changed since render');
 const matches=receipt.results.filter(x=>x.id===example.id);if(matches.length!==1)throw Error('Missing or duplicate example result');const result=matches[0];
 const sha=createHash('sha256').update(readFileSync(join(corpus,example.sourceFile))).digest('hex');if(sha!==result.sourceSha256)throw Error('Source changed since render');
 return {render:result.status,interactions:result.interactionStatus||'not_tested',widths:result.widths,createdAt:receipt.createdAt};
 }catch(error){return {render:'not_tested',interactions:'not_tested',reason:error.message};}
}
