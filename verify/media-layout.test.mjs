import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,mkdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {captureHealth,referenceHealth,hash,inspectReferencePage} from '../corpus/reference-health.mjs';
import {createDesignPacket,classifyJob} from '../core/design-packet.mjs';
import {readLayoutContract,proveLayout,mediaWaste} from './layout.mjs';
import {checkDefectAssertions,prove,activeSurfaceVideos} from './prove.mjs';
import {sourceBinding,bindBrowser,writeCompletionReceipt,validateCompletionReceipt} from './completion-receipt.mjs';
import {load} from './deps.mjs';
const root=resolve(import.meta.dirname,'..'),temp=mkdtempSync(join(tmpdir(),'shine-media-regression-'));
const {chromium}=load('playwright');
let browser,server;
try{
 assert.equal(classifyJob('Put the video broadcast before the newspaper').category,'media');
 assert.equal(classifyJob('Repair the editorial publication').category,'editorial');
 assert.equal(classifyJob('Ask follow-up questions in an assistant chat').category,'voice');
 const packet=createDesignPacket({job:'Repair the embedded broadcast player',project:root,lane:'internal'});
 assert.equal(packet.selected.id,'shadcn-broadcast');assert.equal(packet.selected.referenceHealth.status,'passed');assert.equal(packet.layout.required,true);assert.ok(packet.completion.command.includes('prove.mjs'));
 assert.equal(createDesignPacket({job:'Read the editorial publication',project:root,lane:'internal'}).selected.id,'shadcn-blog');
 assert.equal(referenceHealth(root,'spectrum-ai-chat').status,'failed');
 const valid={status:200,title:'Broadcast demo',headings:'The broadcast',expectedSelector:'video',expectedCount:1,sourceUrl:'https://example.test/player',finalUrl:'https://example.test/player'};
 assert.equal(captureHealth(valid).status,'passed');
 for(const patch of [{status:404},{title:'Error 404: Page not found'},{title:'Just a moment...'},{expectedSelector:'main, h1'},{expectedCount:0}])assert.equal(captureHealth({...valid,...patch}).status,'failed');
 const reference=join(temp,'corpus/packs/test');mkdirSync(reference,{recursive:true});writeFileSync(join(reference,'shot.png'),'image fixture');
 const capture={...valid,capturedAt:new Date().toISOString(),shotSha256:hash(readFileSync(join(reference,'shot.png')))};
 writeFileSync(join(reference,'meta.json'),JSON.stringify({capture}));assert.equal(referenceHealth(temp,'test').status,'passed');writeFileSync(join(reference,'shot.png'),'changed image');assert.equal(referenceHealth(temp,'test').status,'failed');
 const contract=JSON.parse(readFileSync(join(root,'verify/fixtures/media-layout/layout.json'),'utf8'));
 const good=join(root,'corpus/blueprints/shadcn-broadcast/reference.html');
 const result=await proveLayout({target:good,contractPath:join(root,'verify/fixtures/media-layout/layout.json')});
 assert.equal(result.status,'passed',JSON.stringify(result.failures));assert.equal(result.scenarios,25);assert.equal(result.checks.length,100);
 const broken=join(temp,'broken.html');writeFileSync(broken,readFileSync(good,'utf8').replace('</style>','.screen{min-height:1100px}.screen>div{height:100%}.context{contain:none}</style>'));
 const short={...contract,viewports:[{width:390,height:1000},{width:1280,height:1000}]};const layoutPath=join(temp,'layout.json');writeFileSync(layoutPath,JSON.stringify(short));
 const bad=await proveLayout({target:broken,contractPath:layoutPath});assert.equal(bad.status,'failed');assert.ok(bad.failures.some(f=>/gap|unused below media/.test(f)),JSON.stringify(bad.failures));
 const invalid=join(temp,'invalid.json');writeFileSync(invalid,JSON.stringify({...short,checks:[]}));assert.throws(()=>readLayoutContract(invalid),/checks are required/);
 writeFileSync(invalid,JSON.stringify({...short,states:['baseline']}));assert.throws(()=>readLayoutContract(invalid),/required state/);
 const missing=await proveLayout({target:good,contractPath:join(temp,'missing.json')});assert.equal(missing.status,'not_tested');assert.equal(missing.scenarios,0);
 const defect={defects:[{id:'remove-gap',severity:'major',assertions:['caption-controls','frame-ratio']}]};
 assert.equal(checkDefectAssertions(defect,result,{status:0}).status,'passed');
 assert.equal(checkDefectAssertions(defect,bad,{status:0}).status,'failed');
 assert.equal(checkDefectAssertions({defects:[{severity:'major'}]},result,{status:0}).status,'failed');
 assert.equal(checkDefectAssertions({defects:[{id:'fake',severity:'major',assertions:['nonexistent']}]},result,{status:0}).status,'failed');
 // Exercise real HTTP responses, including a 200 soft-404 that still has <main>.
 server=createServer((req,res)=>{res.statusCode=req.url==='/hard404'?404:200;res.setHeader('content-type','text/html');res.end(req.url==='/good'?readFileSync(good):'<title>Error 404: Page not found</title><main><h1>Page not found</h1><video></video></main>');});server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch();const page=await browser.newPage();
 for(const path of ['/hard404','/soft404']){const url=base+path,response=await page.goto(url);await assert.rejects(()=>inspectReferencePage(page,response,{url,expect:'video'}),/HTTP|error/);}
 const url=base+'/good',response=await page.goto(url);assert.equal((await inspectReferencePage(page,response,{url,expect:'video'})).status,200);
 await page.goto('file://'+broken);assert.ok((await mediaWaste(page)).length,'media descendants must not exempt empty wrappers');

 // A navigation logo does not turn the enclosing application shell into a
 // player frame. Empty media wrappers within its main content still fail.
 const logo='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><rect width="100" height="30" fill="navy"/></svg>');
 await page.setContent(`<div style="min-height:1200px"><nav><img src="${logo}" alt="Product"><a href="#work">Work</a></nav><main><h1>Record collection</h1><p>Choose a record.</p></main></div>`);
 assert.deepEqual(await mediaWaste(page),[],'application shell whitespace is not unused logo media space');
 await page.setContent(`<div style="min-height:1200px"><nav><img src="${logo}" alt="Product"></nav><main><h1>Broadcast</h1><section id="empty-player-wrapper" style="height:900px"><img src="${logo}" alt="Poster"></section></main></div>`);
 assert.ok((await mediaWaste(page)).some(row=>row.selector==='#empty-player-wrapper'),'the shell boundary must not exempt empty content media wrappers');
 await page.setContent('<main><h1>Records</h1><dialog><video hidden></video></dialog></main>');
 assert.equal(await activeSurfaceVideos(page),0,'a closed dialog is a separate workflow');
 await page.locator('dialog').evaluate(dialog=>dialog.showModal());
 assert.equal(await activeSurfaceVideos(page),1,'an opened dialog requires media proof even before playback');
 await page.setContent('<main><h1>Player</h1><video hidden></video></main>');
 assert.equal(await activeSurfaceVideos(page),1,'a hidden player on the active page still requires media proof');
 await browser.close();browser=null;await new Promise(r=>server.close(r));server=null;
 // Browser identity must match the real clean source checkout and the rendered build.
 const project=join(temp,'project');mkdirSync(project);writeFileSync(join(project,'app.html'),'source');
 const git=(...args)=>execFileSync('git',args,{cwd:project,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 git('init');git('add','app.html');git('-c','user.name=Test','-c','user.email=test@example.test','commit','-m','fixture');
 const source=sourceBinding(project),observed={url:'http://localhost:4321/home',status:200,sourceCommit:source.commit,buildId:'build-a',renderedSha256:hash('render'),screenshotSha256:hash('shot')};
 const binding=bindBrowser({target:observed.url,project,observed});
 for(const patch of [{sourceCommit:'wrong'},{buildId:''},{url:'http://localhost:4321/login'},{status:500}])assert.throws(()=>bindBrowser({target:observed.url,project,observed:{...observed,...patch}}));
 const receipt=join(temp,'receipt.json');assert.throws(()=>writeCompletionReceipt(receipt,{status:'incomplete',checks:{layout:{status:'not_tested'}}},binding));assert.equal(existsSync(receipt),false);
 assert.throws(()=>writeCompletionReceipt(receipt,{status:'passed',checks:{layout:{status:'passed'}}},binding));
 const allChecks=Object.fromEntries(['accessibility','styling','layout','interactions','referenceValidity','visualComparison','buildBinding'].map(k=>[k,{status:'passed'}]));
 writeCompletionReceipt(receipt,{status:'passed',checks:allChecks},binding);assert.deepEqual(validateCompletionReceipt(receipt,project,{buildId:'build-a'}),[]);
 assert.ok(validateCompletionReceipt(receipt,project,{buildId:'other'}).length);
 server=createServer((req,res)=>{res.setHeader('content-type','text/html');res.setHeader('x-shine-source-commit',source.commit);res.setHeader('x-shine-build-id','build-a');res.end(readFileSync(good));});server.listen(0,'127.0.0.1');await once(server,'listening');
 const liveTarget=`http://127.0.0.1:${server.address().port}/home`,liveReceipt=join(temp,'live.json');
 const options={target:liveTarget,citeId:'shadcn-broadcast',layoutPath,usabilityPath:join(root,'verify/fixtures/media-layout/usability.json'),project,buildId:'build-a',receiptPath:liveReceipt};
 const completeReport=await prove(options);assert.equal(completeReport.status,'passed',JSON.stringify(completeReport.checks));assert.deepEqual(validateCompletionReceipt(liveReceipt,project,{buildId:'build-a'}),[]);
 const absentReceipt=join(temp,'absent.json'),incompleteReport=await prove({...options,layoutPath:undefined,receiptPath:absentReceipt});assert.notEqual(incompleteReport.status,'passed');assert.equal(existsSync(absentReceipt),false);
 await new Promise(r=>server.close(r));server=null;
 writeFileSync(join(project,'app.html'),'changed');assert.ok(validateCompletionReceipt(receipt,project).length);
 console.log('media layout PASS: 25 content/media/viewport scenarios; old 442px-gap class rejected; hard and soft 404s quarantined; executable defects; missing-proof and stale-build receipts rejected');
}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));rmSync(temp,{recursive:true,force:true});}
