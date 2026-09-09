#!/usr/bin/env python3
"""Build every public format from canonical sources, never from a previous export."""
import argparse, hashlib, io, json, os, pathlib, subprocess, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
def digest(data): return hashlib.sha256(data).hexdigest()
def revision(root):
    value=os.environ.get('VERCEL_GIT_COMMIT_SHA') or (json.loads((root/'release.json').read_text())['sha'] if (root/'release.json').exists() else None) or subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
    if len(value)!=40 or any(c not in '0123456789abcdef' for c in value): raise ValueError('a full source commit is required')
    return value

def zipped(files):
    output=io.BytesIO()
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for name,data in sorted(files.items()):
            info=zipfile.ZipInfo(name,(2020,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
            archive.writestr(info,data)
    return output.getvalue()

def render(root=ROOT):
    source=revision(root); canonical=(root/'skill/SKILL.md').read_bytes()
    refs={p.name:p.read_bytes() for p in sorted((root/'skill/references').glob('*.md')) if not p.name.endswith('.local.md')}
    refs['media-layout-proof.md']=(root/'docs/media-layout-proof.md').read_bytes()
    refs['distribution-dod.md']=(root/'docs/distribution-dod.md').read_bytes()
    notice='\n\nThis guidance download does not include Node tools. Executable verifiers require the full repository install. Never claim executable completion from this file alone.\n'
    guide=canonical.decode()+notice+''.join('\n\n---\n\n## Reference: '+name+'\n\n'+data.decode() for name,data in refs.items())
    plugin={'skills/shine/SKILL.md':(canonical.decode().replace('../docs/','references/')+notice).encode()}
    plugin.update({'skills/shine/references/'+n:d for n,d in refs.items()})
    for p in sorted((root/'corpus/blueprints').rglob('*')):
        if p.is_file(): plugin['skills/shine/references/blueprints/'+str(p.relative_to(root/'corpus/blueprints'))]=p.read_bytes()
    plugin['.claude-plugin/plugin.json']=json.dumps({'name':'shine','version':json.loads((root/'package.json').read_text())['version'],'description':'Shine design guidance; install the repository for executable proof.'},sort_keys=True).encode()
    identity={'version':1,'skill':'shine','sourceRepository':'justinfowler925/shine','sourceRevision':source,'skillSha256':digest(canonical)}
    plugin['release.json']=json.dumps(identity,sort_keys=True).encode()
    exports={'SKILL.md':canonical,'shine-skill.md':guide.encode(),'shine.plugin':zipped(plugin)}
    identity['artifacts']={name:digest(data) for name,data in exports.items()}
    return identity,exports

def build(root=ROOT):
    identity,exports=render(root)
    for name,data in exports.items(): (root/'site'/name).write_bytes(data)
    with zipfile.ZipFile(io.BytesIO(exports['shine.plugin'])) as archive:
        for name in archive.namelist():
            path=root/'cowork/plugin'/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(archive.read(name))
    (root/'site/release.json').write_text(json.dumps(identity,indent=2)+'\n')
    return identity
if __name__=='__main__': print(json.dumps(build(),indent=2))
