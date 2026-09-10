// Executable product-table contract. DOM markers are discovery hints, never proof.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { load } from './deps.mjs';

export const REQUIRED_CASES = ['sort', 'search', 'filter', 'pagination', 'visibility', 'rowAction', 'loading', 'empty', 'filteredEmpty', 'error', 'retry', 'keyboard'];
const hash = value => createHash('sha256').update(value).digest('hex');
const asUrl = value => /^(https?|file):/.test(value) ? value : pathToFileURL(resolve(value)).href;
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const resolveTarget = (value, base) => /^(https?|file):/.test(value) ? value : resolve(base,value);

export async function discoverTables(page) {
  return page.locator('table,[role="grid"],[data-shine-datagrid]').evaluateAll(nodes => nodes.filter(el => {
    // A layout label cannot exempt a record-shaped or interactive table.
    return el.matches('[role="grid"],[data-shine-datagrid]') || el.querySelectorAll('th,[role="columnheader"]').length >= 2 || !!el.querySelector('button,input,select');
  }).map(el => ({selector:el.id ? `#${CSS.escape(el.id)}` : null, tag:el.tagName.toLowerCase()})));
}

export function sourceProof(source, project) {
  if (!source?.entry || !source.shared || !source.referenceEntry) throw new Error('source requires entry, shared, and referenceEntry; component labels are not provenance');
  const ts = load('typescript');
  const root = realpathSync(project);
  const canonical = file => realpathSync(resolve(root,file));
  const config = ts.findConfigFile(root,ts.sys.fileExists,'tsconfig.json');
  const options = config ? ts.parseJsonConfigFileContent(ts.readConfigFile(config,ts.sys.readFile).config,ts.sys,dirname(config)).options : {allowJs:true,moduleResolution:ts.ModuleResolutionKind.Bundler};
  const graph = entry => {
    const files = new Map(), packages = new Set();
    const visit = path => {
      path = canonical(path); if(files.has(path) || path.includes('/node_modules/')) return;
      const text = readFileSync(path,'utf8'); files.set(path,hash(text));
      const imports = [];
      if(/\.html?$/.test(path)) for(const match of text.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) imports.push(match[1]);
      else {
        const ast = ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true);
        const walk = node => {
          if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) imports.push(node.moduleSpecifier.text);
          if(ts.isCallExpression(node) && (node.expression.kind===ts.SyntaxKind.ImportKeyword || node.expression.getText(ast)==='require') && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) imports.push(node.arguments[0].text);
          ts.forEachChild(node,walk);
        }; walk(ast);
      }
      for(const spec of imports) {
        if(/^(https?:|data:)/.test(spec)) throw new Error(`unverifiable remote module ${spec}`);
        const resolved = ts.resolveModuleName(spec,path,options,ts.sys).resolvedModule?.resolvedFileName || (spec.startsWith('.') && existsSync(resolve(dirname(path),spec)) ? resolve(dirname(path),spec) : null);
        if(resolved?.includes('/node_modules/')) packages.add(spec);
        else if(resolved) visit(resolved);
      }
    }; visit(entry); return {files,packages};
  };
  const shared = canonical(source.shared), candidate = graph(source.entry), reference = graph(source.referenceEntry), component = graph(source.shared);
  if(!candidate.files.has(shared) || !reference.files.has(shared)) throw new Error('candidate and reference must both import the same shared table implementation');
  if(source.package && !component.packages.has(source.package)) throw new Error(`shared table does not resolve installed ${source.package}`);
  const pkgFile = join(root,'package.json');
  const deps = existsSync(pkgFile) ? JSON.parse(readFileSync(pkgFile,'utf8')) : {};
  if((deps.dependencies?.react || deps.devDependencies?.react) && !source.package) throw new Error('React record tables require the installed table-state package in source.package');
  return {shared,files:Object.fromEntries(new Map([...candidate.files,...reference.files])),package:source.package||'framework-free'};
}

async function pattern(page, grid) {
  const table = page.locator(grid.selector); if(await table.count()!==1) throw new Error(`selector must identify exactly one table: ${grid.selector}`);
  await table.waitFor({state:'visible'});
  if(await page.locator(grid.toolbar).count()!==1 || !await page.locator(grid.toolbar).isVisible()) throw new Error('missing visible, uniquely scoped table toolbar');
  if(!await page.locator(grid.title).isVisible()) throw new Error('missing visible table title');
  const cells = await table.locator('th,td,[role="columnheader"],[role="gridcell"]').evaluateAll(nodes => {
    const props = ['fontFamily','fontSize','fontWeight','lineHeight','paddingTop','paddingRight','paddingBottom','paddingLeft','borderBottomWidth','borderBottomStyle','borderBottomColor','color','backgroundColor','textAlign'];
    const styles = nodes.filter(el=>el.getBoundingClientRect().height>0).map(el=>({kind:el.matches('th,[role="columnheader"]')?'header':'cell',...Object.fromEntries(props.map(key=>[key,getComputedStyle(el)[key]]))}));
    return [...new Set(styles.map(s=>JSON.stringify(s)))].sort();
  });
  if(!cells.some(s=>JSON.parse(s).kind==='cell')) throw new Error('pattern comparison needs populated representative records');
  const toolbar = await page.locator(grid.toolbar).evaluate(el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return {style:[s.display,s.gap,s.padding,s.alignItems,s.flexWrap],controls:[...el.querySelectorAll('input,button,select,[role="button"]')].filter(e=>e.getBoundingClientRect().height>0).map(e=>`${e.tagName}:${e.getAttribute('type')||e.getAttribute('role')||''}`),width:r.width};
  });
  const overflow = await table.evaluate(el => {
    let parent=el.parentElement;
    while(parent && parent!==document.body){const s=getComputedStyle(parent);if(/auto|scroll/.test(s.overflowX))return parent.getBoundingClientRect().right<=innerWidth+1;parent=parent.parentElement;}
    return el.getBoundingClientRect().right<=innerWidth+1;
  });
  if(!overflow) throw new Error('table escapes the viewport without a contained horizontal scroller');
  delete toolbar.width;
  return {cells,toolbar};
}

const assertions = new Set(['rows','text','visible','hidden','disabled','enabled','count','value']);
function validateCase(name, steps) {
  if(!Array.isArray(steps)||!steps.length) throw new Error(`${name}: missing executable scenario`);
  const has = op => steps.some(s=>s.op===op), rows = steps.filter(s=>s.op==='rows');
  if(!steps.some(s=>assertions.has(s.op))) throw new Error(`${name}: no observable outcome`);
  if(['sort','search','filter','pagination'].includes(name) && !rows.length) throw new Error(`${name}: requires exact record assertions`);
  if(name==='sort') {
    if(steps.filter(s=>s.op==='click'||s.op==='press').length<2 || rows.length<2) throw new Error('sort: exercise both directions');
    for(const [i,row] of rows.slice(-2).entries()) {
      if(!Array.isArray(row.equals)||new Set(row.equals).size<2) throw new Error('sort: needs distinct representative values');
      const sorted=[...row.equals].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
      if(i===1)sorted.reverse();
      if(!same(sorted,row.equals)) throw new Error('sort: expected records must be ascending then descending');
    }
  }
  if(name==='search' && (steps.filter(s=>s.op==='fill').length<2 || rows.length<2)) throw new Error('search: prove a match and clearing restores records');
  if(name==='filter' && !has('click')&&!has('select')) throw new Error('filter: exercise the filter control');
  if(name==='pagination' && !has('click')&&!has('disabled')) throw new Error('pagination: prove movement or disabled one-page controls');
  if(name==='visibility' && (!has('hidden')||!has('visible')||!has('click'))) throw new Error('visibility: hide and restore a column');
  if(name==='rowAction') {
    const outcomes=steps.filter(s=>s.op==='text');
    if(!has('click')||outcomes.length<2||outcomes[0].selector!==outcomes.at(-1).selector||outcomes[0].equals===outcomes.at(-1).equals) throw new Error('rowAction: assert the result before and after executing the action');
  }
  if(name==='keyboard' && !has('press')) throw new Error('keyboard: exercise keyboard input');
  if(['loading','empty','filteredEmpty','error'].includes(name) && !has('visible')) throw new Error(`${name}: assert the actual visible state`);
  if(name==='retry' && (!has('click')||!rows.length)) throw new Error('retry: recover records through the retry control');
  if(name==='selection' && (!has('click')||!has('text'))) throw new Error('selection: execute selection and assert its summary or bulk result');
}

async function scenario(context, target, test, timeout, gridSelector, name) {
  const page=await context.newPage(); const evidence=[]; let requests=0;
  page.setDefaultTimeout(timeout);
  try {
    for(const route of test.routes||[]) {
      if(!route.url || !Array.isArray(route.responses) || !route.responses.length) throw new Error('route requires url and responses');
      let index=0;
      await page.route(route.url,async request=>{
        requests++;
        const response=route.responses[Math.min(index++,route.responses.length-1)];
        if(response.hold) return; // Remains pending for the loading-state scenario; closed in finally.
        await request.fulfill({status:response.status||200,contentType:'application/json',body:JSON.stringify(response.body)}).catch(()=>{});
      });
    }
    await page.goto(target,{waitUntil:'domcontentloaded'});
    for(const step of test.steps) {
      const locator=step.selector ? page.locator(step.selector) : null;
      if(name==='visibility' && step.op==='visible') {
        if(!await locator.evaluate((el,selector)=>!!el.closest(selector)&&el.matches('th,td,[role="columnheader"],[role="gridcell"]'),gridSelector))throw new Error('visibility must exercise a real table column');
      }
      if(step.op==='click') await locator.click();
      else if(step.op==='fill') await locator.fill(step.value);
      else if(step.op==='select') await locator.selectOption(step.value);
      else if(step.op==='press') await locator.press(step.key);
      else if(step.op==='reload') await page.reload({waitUntil:'domcontentloaded'});
      else if(assertions.has(step.op)) {
        const read=async()=>{
          if(step.op==='rows')return locator.evaluateAll((nodes,selector)=>nodes.filter(el=>el.getBoundingClientRect().height>0 && getComputedStyle(el).visibility!=='hidden').map(el=>{
            if(!el.closest(selector)||!el.closest('td,[role="gridcell"],[role="cell"]'))throw new Error('record assertions must read actual table cells, not labels or markers');
            return el.textContent.trim();
          }),gridSelector);
          if(step.op==='text')return (await locator.innerText()).trim();
          if(step.op==='value')return locator.inputValue();
          if(step.op==='count')return locator.count();
          if(step.op==='visible'||step.op==='hidden')return locator.isVisible().then(v=>step.op==='visible'?v:!v);
          return locator.isDisabled().then(v=>step.op==='disabled'?v:!v);
        };
        const expected=['visible','hidden','disabled','enabled'].includes(step.op)?true:step.equals;
        if(expected===undefined)throw new Error(`${step.op}: missing expected outcome`);
        const deadline=Date.now()+timeout; let actual;
        do {actual=await read();if(same(actual,expected))break;await page.waitForTimeout(25);}while(Date.now()<deadline);
        if(!same(actual,expected))throw new Error(`${step.op} ${step.selector}: expected ${JSON.stringify(expected)}, observed ${JSON.stringify(actual)}`);
        evidence.push({op:step.op,selector:step.selector,observed:actual});
      } else throw new Error(`unknown step ${step.op}`);
    }
    if(test.routes?.length && !requests)throw new Error('state scenario did not exercise its intercepted data request');
    return evidence;
  } finally {await page.close();}
}

export async function auditTables({page,target,contractPath,timeout=3000}) {
  const tables=await discoverTables(page), checks=[];
  const check=async(name,fn)=>{try{const evidence=await fn();checks.push({name,status:'passed',evidence});}catch(error){checks.push({name,status:'failed',reason:error.message});}};
  const base=/^https?:/.test(target)?process.cwd():dirname(target.startsWith('file:')?fileURLToPath(target):resolve(target));
  const path=contractPath?resolve(contractPath):join(base,'shine-tables.json');
  /*
   * A page with no record tables has nothing for a contract to govern.
   *
   * The contract file lives at the repo root and covers whichever surfaces in
   * that repo carry records. Requiring it to match on a table-free page made
   * one surface's contract fail every other surface in the same repo: Company
   * has no tables at all, and the moment Marketing added its contract,
   * Company's measure run failed with "every discovered table must match
   * exactly one contract" about tables it does not have.
   */
  if(!tables.length)return {status:'passed',checks:[],tables:0};
  if(!existsSync(path))return {status:'failed',tables:tables.length,checks:[{name:'table contract',status:'not_tested',reason:`record tables require ${path}; table markup and state markers are not proof`}]};
  let contract;
  try{contract=JSON.parse(readFileSync(path,'utf8'));if(contract.version!==1||!Array.isArray(contract.grids)||!contract.grids.length)throw new Error('requires version 1 and nonempty grids');}
  catch(error){return {status:'failed',checks:[{name:'table contract',status:'tool_error',reason:error.message}]};}
  await check('coverage',async()=>{
    const coverage=await page.locator('table,[role="grid"],[data-shine-datagrid]').evaluateAll((nodes,selectors)=>nodes.filter(el=>el.matches('[role="grid"],[data-shine-datagrid]')||el.querySelectorAll('th,[role="columnheader"]').length>=2||el.querySelector('button,input,select')).map(el=>selectors.filter(s=>el.matches(s)).length),contract.grids.map(g=>g.selector));
    if(coverage.some(n=>n!==1)||!coverage.length)throw new Error('every discovered table must match exactly one contract; layout labels do not exempt records');
    return coverage.length;
  });
  for(const grid of contract.grids){
    const prefix=grid.selector;
    if(grid.kind==='static'){
      await check(`${prefix} static presentation`,async()=>{
        if(!grid.reason?.trim())throw new Error('static table requires its presentation purpose');
        const table=page.locator(grid.selector);
        if(await table.count()!==1||await table.locator('button,input,select,a,[tabindex],[role="button"]').count())throw new Error('interactive records cannot opt out as static');
        return grid.reason;
      });continue;
    }
    await check(`${prefix} shared implementation`,()=>sourceProof(grid.source,resolve(dirname(path),contract.project||'.')));
    await check(`${prefix} product pattern`,async()=>{
      if(!grid.reference?.target||!grid.reference.selector||!grid.reference.toolbar||!grid.reference.title)throw new Error('requires scoped approved reference target, selector, toolbar and title');
      const refTarget=/^https?:/.test(target) && !/^(https?|file):/.test(grid.reference.target) && !existsSync(grid.reference.target) ? new URL(grid.reference.target,target).href : resolveTarget(grid.reference.target,dirname(path));
      if(asUrl(refTarget)===asUrl(target))throw new Error('a table cannot approve itself as its reference');
      const ref=await page.context().newPage(), candidate=await page.context().newPage();
      try{
        const evidence=[];
        for(const width of [1280,768]){
          await ref.setViewportSize({width,height:900});await candidate.setViewportSize({width,height:900});
          await Promise.all([ref.goto(asUrl(refTarget),{waitUntil:'networkidle'}),candidate.goto(asUrl(target),{waitUntil:'networkidle'})]);
          const want=await pattern(ref,grid.reference),got=await pattern(candidate,grid);
          if(!same(got,want))throw new Error(`${width}px: table cell styling or toolbar anatomy diverges from ${grid.reference.target}`);
          evidence.push({width,patternHash:hash(JSON.stringify(want))});
        }return evidence;
      }finally{await ref.close();await candidate.close();}
    });
    const required=[...REQUIRED_CASES,...(grid.bulkActions?['selection']:[])];
    for(const name of required)await check(`${prefix} ${name}`,async()=>{
      const test=grid.cases?.[name];validateCase(name,test?.steps);
      return scenario(page.context(),asUrl(target),test,timeout,grid.selector,name);
    });
  }
  return {status:checks.every(c=>c.status==='passed')?'passed':'failed',tables:tables.length,contractHash:hash(readFileSync(path)),checks};
}

if(process.argv[1]&&realpathSync(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),target=args[0],i=args.indexOf('--contract');
  if(!target)throw new Error('usage: node verify/table-quality.mjs <url|html> [--contract shine-tables.json]');
  const browser=await load('playwright').chromium.launch();
  try{const context=await browser.newContext();const page=await context.newPage();await page.goto(asUrl(target));const result=await auditTables({page,target,contractPath:i<0?undefined:args[i+1]});console.log(JSON.stringify(result,null,2));process.exitCode=result.status==='passed'?0:1;}finally{await browser.close();}
}
