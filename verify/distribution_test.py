import contextlib, importlib.util, io, json, pathlib, tempfile, unittest, zipfile
from unittest.mock import patch
from datetime import datetime, timezone, timedelta
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module
build=load('build',ROOT/'scripts/build-distribution.py');dist=load('dist',ROOT/'scripts/distribute.py')
class Distribution(unittest.TestCase):
    def test_exports_are_deterministic_and_current(self):
        first,files=build.render();second,again=build.render();self.assertEqual(files,again)
        self.assertEqual(files['SKILL.md'],(ROOT/'skill/SKILL.md').read_bytes())
        self.assertIn(b'Layout and completion proof',files['shine-skill.md'])
        self.assertIn(b'Definition of done: skill distribution',files['shine-skill.md'])
        with zipfile.ZipFile(io.BytesIO(files['shine.plugin'])) as z:
            self.assertIn('skills/shine/references/blueprints/shadcn-broadcast/reference.html',z.namelist())
            self.assertIn(b'Layout and completion proof',z.read('skills/shine/SKILL.md'))
            self.assertEqual(json.loads(z.read('release.json'))['skillSha256'],first['skillSha256'])
        self.assertEqual(set(first['artifacts']),{'SKILL.md','shine-skill.md','shine.plugin'})
    def test_full_archive_is_exact_and_has_no_local_secrets(self):
        if not (ROOT/'.git').exists(): self.skipTest('archive export runs from the clean source checkout, not an installed release')
        revision=dist.source()['sourceRevision'];a=dist.package(revision);self.assertEqual(a,dist.package(revision))
        with zipfile.ZipFile(io.BytesIO(a)) as z:
            self.assertEqual(json.loads(z.read('release.json'))['sourceRevision'],revision)
            self.assertFalse(any('node_modules/' in n or n.endswith('.env.local') or n.startswith('.git/') for n in z.namelist()))
    def test_missing_or_stale_targets_never_pass(self):
        with tempfile.TemporaryDirectory() as temp,patch.object(dist,'get',side_effect=RuntimeError('offline')),contextlib.redirect_stdout(io.StringIO()):
            out=pathlib.Path(temp)/'proof.json';self.assertEqual(dist.verify(out),1)
            report=json.loads(out.read_text());self.assertEqual(report['status'],'incomplete');self.assertEqual(report['required'],14)
            self.assertEqual(set(report['checks']),set(dist.CONFIG['requiredDestinations']))
        with self.assertRaises(RuntimeError):dist.check_identity({'sourceRevision':'stale','skillSha256':'fake'},dist.source())
    def test_attestation_rejects_stale_or_altered_packages(self):
        expected=dist.source()
        value={**expected,'method':'server-computed-sha256','archiveSha256':'a'*64,'archiveBytes':123,'checkedAt':datetime.now(timezone.utc).isoformat()}
        self.assertEqual(dist.validate_attestation(value,expected,'a'*64),value)
        for change in ({'archiveSha256':'b'*64},{'sourceRevision':'stale'},{'archiveBytes':0},{'method':'manifest-only'},{'checkedAt':(datetime.now(timezone.utc)-timedelta(minutes=6)).isoformat()}):
            with self.subTest(change=change),self.assertRaises(RuntimeError):dist.validate_attestation({**value,**change},expected,'a'*64)
    def test_access_boundary_rejects_public_or_wrong_redirects(self):
        import urllib.error
        url='https://example.test/company-tools'
        for status,location,valid in [(307,'/login?reason=required',True),(200,'',False),(307,'https://other.test/login?reason=required',False),(307,'/login',False),(503,'',False)]:
            error=urllib.error.HTTPError(url,status,'probe',{'Location':location},None)
            with self.subTest(status=status,location=location),patch.object(dist.urllib.request.OpenerDirector,'open',side_effect=error):
                if valid:self.assertEqual(dist.access_boundary(url)['status'],307)
                else:
                    with self.assertRaises(RuntimeError):dist.access_boundary(url)
    def test_extra_destination_cannot_be_silently_skipped(self):
        with tempfile.TemporaryDirectory() as temp,patch.dict(dist.CONFIG,{'requiredDestinations':dist.CONFIG['requiredDestinations']+['new-agent']}),patch.object(dist,'get',side_effect=RuntimeError('offline')),contextlib.redirect_stdout(io.StringIO()):
            out=pathlib.Path(temp)/'proof.json';self.assertEqual(dist.verify(out),1);self.assertEqual(json.loads(out.read_text())['checks']['new-agent']['status'],'not_tested')
if __name__=='__main__':unittest.main()
