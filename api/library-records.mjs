// Public, fictional demonstration records only. Never connect this handler to product data.
import { randomUUID } from 'node:crypto';
const sessions=new Map();
export default async function records(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');
 const send=(status,value)=>{res.statusCode=status;res.end(JSON.stringify(value));};
 const url=new URL(req.url,'http://localhost');let session=req.headers.cookie?.match(/(?:^|;\s*)shine_demo=([a-f0-9-]{36})(?:;|$)/)?.[1];
 if(!session){session=randomUUID();res.setHeader('Set-Cookie','shine_demo='+session+'; HttpOnly; SameSite=Strict; Path=/api/library-records');}
 if(!sessions.has(session)){if(sessions.size>=1000)sessions.delete(sessions.keys().next().value);sessions.set(session,new Map());}const edits=sessions.get(session);
 try{
  if(req.method==='PATCH'){
   let body=req.body;if(!body){let text='';for await(const chunk of req){text+=chunk;if(text.length>4096)return send(413,{error:'Body too large'});}body=JSON.parse(text);}if(typeof body==='string')body=JSON.parse(body);
   if(body.fail)return send(503,{error:'Simulated failure'});if(!/^\d{1,6}$/.test(body.id)||Number(body.id)<1||Number(body.id)>100000||body.column!=='name'||typeof body.value!=='string'||!body.value.trim()||body.value.length>200)return send(400,{error:'Invalid edit'});if(edits.size>=1000&&!edits.has(body.id))return send(400,{error:'Demo edit limit reached'});edits.set(body.id,body.value);return send(200,{saved:true});
  }
  if(req.method!=='GET')return send(405,{error:'Method not allowed'});
  if(url.searchParams.has('fail'))return send(503,{error:'Simulated failure'});
  const query=JSON.parse(url.searchParams.get('query')||'{}');if(![10,25,50,100].includes(query.pagination?.pageSize)||!Number.isInteger(query.pagination?.pageIndex)||query.pagination.pageIndex<0||query.pagination.pageIndex>10000||typeof query.search!=='string'||query.search.length>200||!Array.isArray(query.sorting)||query.sorting.length>2||query.sorting.some(sort=>!['name','amount'].includes(sort.id)||typeof sort.desc!=='boolean'))return send(400,{error:'Invalid query'});
  let rows=Array.from({length:100000},(_,index)=>({id:String(index+1),name:edits.get(String(index+1))||'Account '+String(index+1).padStart(6,'0'),amount:(index+1)*10,owner:index%2?'Morgan':'Riley'})).filter(row=>row.name.toLowerCase().includes(query.search.toLowerCase())&&(!query.filters?.owner||row.owner===query.filters.owner));
  rows.sort((a,b)=>{for(const sort of query.sorting){const delta=sort.id==='amount'?a.amount-b.amount:a.name.localeCompare(b.name);if(delta)return sort.desc?-delta:delta;}return Number(a.id)-Number(b.id);});const start=query.pagination.pageIndex*query.pagination.pageSize;return send(200,{sourceRevision:process.env.VERCEL_GIT_COMMIT_SHA||null,rowCount:rows.length,rows:rows.slice(start,start+query.pagination.pageSize)});
 }catch{return send(400,{error:'Invalid request'});}
}
