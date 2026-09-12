#!/usr/bin/env python3
"""Prepare consumers and independently verify the complete registered distribution."""
import argparse, importlib.util, time, hashlib, io, json, os, pathlib, re, subprocess, sys, tempfile, urllib.request, urllib.error, urllib.parse, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
CONFIG=json.loads((ROOT/'distribution.json').read_text())
def sha(data): return hashlib.sha256(data).hexdigest()
def run(*args,cwd=ROOT): return subprocess.check_output(args,cwd=cwd,text=True).strip()
def source():
    rev=json.loads((ROOT/'release.json').read_text())['sha'] if (ROOT/'release.json').exists() else run('git','rev-parse','HEAD')
    return {'sourceRevision':rev,'skillSha256':sha((ROOT/'skill/SKILL.md').read_bytes())}
def clean(root):
    if run('git','status','--porcelain',cwd=root): raise RuntimeError(f'{root}: use a clean isolated checkout')
    run('git','fetch','origin','main',cwd=root)
    run('git','merge-base','--is-ancestor','origin/main','HEAD',cwd=root)
def write(path,value):
    path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,indent=2)+'\n')
def link():
    current=pathlib.Path('~/.local/share/shine/current').expanduser()
    for key,(name,suffix) in CONFIG['links'].items():
        path=pathlib.Path(name).expanduser(); target=current/suffix
        if not target.exists(): raise RuntimeError(f'{key}: installed target missing')
        if path.exists() and not path.is_symlink(): raise RuntimeError(f'{key}: refusing to replace a real directory/file: {path}')
        path.parent.mkdir(parents=True,exist_ok=True)
        temp=path.with_name(path.name+'.release-next');temp.unlink(missing_ok=True);temp.symlink_to(target);temp.replace(path)
        print(f'{key}: {path} -> {target}')
def package(rev):
    raw=subprocess.check_output(['git','archive','--format=zip',rev],cwd=ROOT)
    generated={}
    if rev==source()['sourceRevision']:
        spec=importlib.util.spec_from_file_location('package_exports',ROOT/'scripts/build-distribution.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        metadata,exports=module.render(ROOT);generated={'site/'+name:data for name,data in exports.items()};generated['site/release.json']=(json.dumps(metadata,indent=2)+'\n').encode()
        with zipfile.ZipFile(io.BytesIO(exports['shine.plugin'])) as plugin:
            generated.update({'cowork/plugin/'+name:plugin.read(name) for name in plugin.namelist()})
    output=io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(raw)) as src,zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as dest:
        for name in src.namelist():
            if name.endswith('/') or name.startswith('.github/') or name in generated: continue
            info=zipfile.ZipInfo(name,(2020,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
            dest.writestr(info,src.read(name))
        for name,data in sorted(generated.items()):
            info=zipfile.ZipInfo(name,(2020,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;dest.writestr(info,data)
        identity={'version':1,'sha':rev,'sourceRevision':rev,'skillSha256':sha(src.read('skill/SKILL.md')),'dependenciesInstalled':False}
        info=zipfile.ZipInfo('release.json',(2020,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
        dest.writestr(info,json.dumps(identity,indent=2)+'\n')
    return output.getvalue()
def prepare(nucleus,portfolio):
    # Preparation is deterministic from committed source; consumers start at current main.
    if run('git','diff','--name-only','HEAD','--','skill','core','verify','scripts','docs'): raise RuntimeError('commit source changes before packaging')
    for root in (nucleus,portfolio): clean(root)
    identity=source();data=package(identity['sourceRevision']);identity.update(skill='shine',archiveSha256=sha(data))
    cfg=CONFIG['consumers']['nucleus'];(nucleus/cfg['archive']).write_bytes(data);write(nucleus/cfg['receipt'],identity)
    p=nucleus/cfg['catalog'];text=p.read_text();start=text.index('    id: "shine"');end=text.index('\n  },',start);block=text[start:end];rev=identity['sourceRevision']
    block=re.sub(r'version: "[^"]+"',f'version: "4.0.2 · {rev[:7]}"',block)
    block=re.sub(r'sourceLabel: "[^"]+"',f'sourceLabel: "Verified public source · main @ {rev[:7]}"',block)
    block=re.sub(r'sourceRevision: "[^"]+"',f'sourceRevision: "{rev}"',block)
    block=re.sub(r'sourceUrl: "[^"]+"',f'sourceUrl: "https://github.com/justinfowler925/shine/tree/{rev}"',block)
    p.write_text(text[:start]+block+text[end:])
    cfg=CONFIG['consumers']['portfolio'];p=portfolio/cfg['catalog'];catalog=json.loads(p.read_text());items=[x for x in catalog['items'] if x['slug']=='shine']
    if len(items)!=1: raise RuntimeError('portfolio must have exactly one Shine entry')
    item=items[0];item['proof']=f"Release {rev[:7]} · executable media/layout proof · verified distribution required";item['sourceRevision']=rev;item['skillSha256']=identity['skillSha256']
    write(p,catalog);write(portfolio/cfg['receipt'],identity)
    run('node','scripts/build-public-work.mjs',cwd=portfolio)
    # A stable current-release link preserves the historical article's dated evidence.
    p=portfolio/'writing/shine.html';text=p.read_text();marker='<!-- shine-current-release -->'
    note=f'{marker}<p>Current release: <a href="https://shine-blond.vercel.app/skill">Shine {rev[:7]} — skill and plugin downloads</a>. <a href="/data/shine-release.json">Release identity</a>.</p><!-- /shine-current-release -->'
    if marker in text: text=re.sub(r'<!-- shine-current-release -->.*?<!-- /shine-current-release -->',lambda _:note,text,flags=re.S)
    else:
        match=re.search(r'</h1>',text)
        if not match: raise RuntimeError('portfolio article title missing')
        text=text[:match.end()]+note+text[match.end():]
    p.write_text(text)
    print(json.dumps(identity,indent=2))
def get(url,cookie=None):
    request=urllib.request.Request(url,headers={'Cache-Control':'no-cache',**({'Cookie':cookie} if cookie else {})})
    with urllib.request.urlopen(request,timeout=40) as response:
        if response.status!=200: raise RuntimeError(f'HTTP {response.status}')
        if response.url.rstrip('/')!=url.rstrip('/'): raise RuntimeError('unexpected redirect: '+response.url)
        return response.read()
def check_identity(actual,expected):
    for key in ('sourceRevision','skillSha256'):
        if actual.get(key)!=expected[key]: raise RuntimeError(key+' differs from source release')
def validate_attestation(value,expected,archive_sha):
    check_identity(value,expected)
    if value.get('method')!='server-computed-sha256' or value.get('archiveSha256')!=archive_sha or not isinstance(value.get('archiveBytes'),int) or value['archiveBytes']<=0:
        raise RuntimeError('deployed package attestation differs from committed source')
    from datetime import datetime
    age=time.time()-datetime.fromisoformat(value.get('checkedAt','').replace('Z','+00:00')).timestamp()
    if not -60 <= age <= 300: raise RuntimeError('package attestation is stale')
    return value
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):return None
def access_boundary(url,cookie=None):
    request=urllib.request.Request(url,headers={'Cache-Control':'no-cache',**({'Cookie':cookie} if cookie else {})})
    try:
        with urllib.request.build_opener(NoRedirect).open(request,timeout=30) as response: raise RuntimeError('protected surface admitted an unauthenticated request')
    except urllib.error.HTTPError as response:
        target=urllib.parse.urlparse(urllib.parse.urljoin(url,response.headers.get('Location','')))
        origin=urllib.parse.urlparse(url)
        if response.code not in (302,303,307,308) or target.netloc!=origin.netloc or target.path!='/login' or urllib.parse.parse_qs(target.query).get('reason')!=['required']:
            raise RuntimeError('protected surface did not enforce the expected login boundary')
        return {'status':response.code,'location':response.headers['Location']}
def verify(receipt):
    expected=source();checks={};spec=importlib.util.spec_from_file_location('exports',ROOT/'scripts/build-distribution.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);expected_public,_=module.render(ROOT)
    def probe(name,fn):
        try: facts=fn();checks[name]={'status':'passed','facts':facts}
        except Exception as error: checks[name]={'status':'failed','reason':str(error)}
    def origin():
        remote=run('git','ls-remote','origin','refs/heads/main').split()[0]
        if remote!=expected['sourceRevision']: raise RuntimeError('release checkout differs from origin/main')
        if run('git','diff','--name-only','HEAD','--','skill','core','verify','scripts','docs'): raise RuntimeError('uncommitted source changes')
        return remote
    probe('source',origin)
    current=pathlib.Path('~/.local/share/shine/current').expanduser()
    for key,(name,suffix) in CONFIG['links'].items():
        def local(name=name,suffix=suffix):
            path=pathlib.Path(name).expanduser()
            if not path.is_symlink() or path.resolve()!=(current/suffix).resolve(): raise RuntimeError('stale or missing agent link')
            release=json.loads((current/'release.json').read_text())
            if release['sha']!=expected['sourceRevision'] or sha((current/'skill/SKILL.md').read_bytes())!=expected['skillSha256']: raise RuntimeError('installed release differs')
            if path.is_file() and sha(path.read_bytes())!=sha((ROOT/suffix).read_bytes()): raise RuntimeError('compatibility agent differs')
            return str(path.resolve())
        probe(key,local)
    base=CONFIG['publicBase'];public={}
    def public_identity():
        value=json.loads(get(base+'/release.json'));check_identity(value,expected);public.update(value);return value
    # A missing manifest makes each dependent download fail, not silently disappear.
    try: public_identity()
    except Exception: pass
    for name,path in [('public-skill','SKILL.md'),('public-markdown','shine-skill.md'),('public-plugin','shine.plugin')]:
        def download(path=path):
            check_identity(public,expected);data=get(base+'/'+path)
            if sha(data)!=public['artifacts'][path] or sha(data)!=expected_public['artifacts'][path]: raise RuntimeError('download hash differs')
            if path=='SKILL.md' and sha(data)!=expected['skillSha256']: raise RuntimeError('canonical skill differs')
            if path=='shine.plugin':
                with zipfile.ZipFile(io.BytesIO(data)) as z: check_identity(json.loads(z.read('release.json')),expected)
            return {'sha256':sha(data),'bytes':len(data)}
        probe(name,download)
    def page(url,needles):
        text=get(url).decode()
        if not all(n in text for n in needles): raise RuntimeError('expected release/page content absent')
        return {'url':url,'sha256':sha(text.encode())}
    probe('public-page',lambda:page(base+'/skill',['shine-skill.md','shine.plugin']))
    def public_blocks():
        catalog=json.loads((ROOT/'blocks/catalog.json').read_text())['blocks']; results=[]
        if not catalog: raise RuntimeError('block catalog is empty')
        registry=json.loads(get(base+'/r/registry.json'))
        for block in catalog:
            if not any(item.get('name')==block['id'] and item.get('type')=='registry:block' for item in registry.get('items',[])): raise RuntimeError('block missing from hosted registry: '+block['id'])
            data=get(base+'/r/'+block['id']+'.json'); expected_data=(ROOT/'site/r'/ (block['id']+'.json')).read_bytes()
            if sha(data)!=sha(expected_data): raise RuntimeError('hosted block differs: '+block['id'])
            results.append({'block':block['id'],'sha256':sha(data),'bytes':len(data)})
        return {'checked':len(results),'required':len(catalog),'blocks':results}
    probe('public-blocks',public_blocks)
    port=CONFIG['portfolioBase']
    def registry():
        entries=json.loads(get(port+'/data/public-work.json'))['items'];matches=[x for x in entries if x.get('slug')=='shine']
        if len(matches)!=1: raise RuntimeError('expected one registry record')
        check_identity(matches[0],expected);check_identity(json.loads(get(port+'/data/shine-release.json')),expected)
        page(port+'/open-source.html',[expected['sourceRevision'][:7]])
        return expected
    probe('portfolio-registry',registry)
    probe('portfolio-page',lambda:page(port+'/writing/shine.html',[expected['sourceRevision'][:7],base+'/skill']))
    nucleus=CONFIG['nucleusBase']
    def internal():
        value=json.loads(get(nucleus+'/api/company-tools/shine/release'))
        return validate_attestation(value,expected,sha(package(expected['sourceRevision'])))
    probe('nucleus-package',internal)
    def protection():
        results=[]
        for path in ['/company-tools','/api/company-tools/shine/download']:
            for cookie in [None,'holloway_session=invalid-release-probe']:
                results.append({'path':path,'credential':'anonymous' if cookie is None else 'invalid',**access_boundary(nucleus+path,cookie)})
        return {'method':'unauthenticated and invalid-session refusal; no protected ZIP transfer', 'checks':results}
    probe('nucleus-access-boundary',protection)
    for name in CONFIG['requiredDestinations']:
        if name not in checks: checks[name]={'status':'not_tested','reason':'destination has no verifier'}
    passed=sum(c['status']=='passed' for c in checks.values());complete=bool(checks) and set(checks)==set(CONFIG['requiredDestinations']) and passed==len(checks)
    report={'version':1,'status':'passed' if complete else 'incomplete','expected':expected,'passed':passed,'required':len(CONFIG['requiredDestinations']),'checks':checks}
    if receipt: write(pathlib.Path(receipt),report)
    print(json.dumps(report,indent=2));return 0 if complete else 1
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('command',choices=['prepare','link','verify']);p.add_argument('--nucleus',type=pathlib.Path);p.add_argument('--portfolio',type=pathlib.Path);p.add_argument('--receipt');a=p.parse_args()
    if a.command=='prepare':
        if not a.nucleus or not a.portfolio: p.error('prepare requires both consumers')
        prepare(a.nucleus,a.portfolio)
    elif a.command=='link': link()
    else: sys.exit(verify(a.receipt))
