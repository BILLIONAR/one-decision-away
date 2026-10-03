from pathlib import Path
import concurrent.futures
import datetime
import hashlib
import json
import re
import urllib.request

repo=Path('/workspace/oda-reference-redesign')
root=Path('/workspace/scratch/oda-reference-redesign/domino-logo/deployment')
base='https://billionar.github.io/one-decision-away/'
paths=['sw.js','manifest.webmanifest','icon-192.png','icon-512.png','icon-192-maskable.png','icon-512-maskable.png','apple-touch-icon.png','brand/domino8/oda-mark-domino8-v1-256.png','brand/domino8/oda-app-domino8-v1-192.png','brand/domino8/oda-app-domino8-v1-512.png','brand/domino8/oda-app-domino8-v1-maskable-192.png','brand/domino8/oda-app-domino8-v1-maskable-512.png','brand/domino8/oda-apple-domino8-v1-180.png','brand/domino8/oda-favicon-domino8-v1-32.png','brand/domino8/og-image-domino8-v1.png']
def request(path):
    req=urllib.request.Request(base+path,headers={'User-Agent':'ODA-authorized-served-release-verification','Cache-Control':'no-cache'})
    with urllib.request.urlopen(req,timeout=30) as response:
        b=response.read()
        return b,{'url':response.url,'status':response.status,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'contentType':response.headers.get('Content-Type'),'etag':response.headers.get('ETag'),'lastModified':response.headers.get('Last-Modified')}
index,index_receipt=request('')
(root/'live-index.html').write_bytes(index)
html=index.decode()
assert 'domino8/oda-favicon-domino8-v1-32.png' in html
assert 'domino8/oda-apple-domino8-v1-180.png' in html
assert 'domino8/og-image-domino8-v1.png' in html
def verify_static(path):
    b,r=request(path)
    local=(repo/'public'/path).read_bytes()
    assert b==local,path
    r.update(path=path,exactPublicSourceBytes=True)
    return r
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    assets=list(pool.map(verify_static,paths))
scripts=re.findall(r'<script[^>]+src="([^"]+)"',html)
styles=re.findall(r'<link[^>]+href="([^"]+\.css)"',html)
entries=[]
for src in scripts+styles:
    path=src.removeprefix('/one-decision-away/')
    assert not path.startswith(('http:','https:','/')),src
    b,r=request(path)
    local=repo/'dist'/path
    r.update(path=path,localCompiledFileExists=local.is_file(),matchesLocalBlankEnvBuild=local.is_file() and b==local.read_bytes())
    if path.endswith('.css'):assert r['matchesLocalBlankEnvBuild'],path
    entries.append(r)
manifest=json.loads((repo/'public/manifest.webmanifest').read_text())
assert manifest['name']=='ODA' and manifest['short_name']=='ODA'
receipt={'observedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'deployedCommit':'9e07fb13ee1f3ba1b06ec0a69d64fa536bd6a429','testedSourceCommit':'84ecbf8776146b766a30964bf8e6487234dd1dd4','pagesWorkflowRun':37147734045,'previousProductionCommit':'350aa158f30c773a373f2895e267119f9f2eb17a','index':index_receipt,'indexSelectsNewLogoReferences':True,'publicStaticAssets':assets,'allPublicStaticAssetsExact':True,'entries':entries,'appLabelODA':True,'limits':'Normal HTTPS GETs only. CI existing public VITE build variables may change entry/index JS compared with the local blank-env build; exact source/artifact binding is recorded separately.'}
(root/'live-served-assets.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'staticAssetsExact':len(assets),'entries':entries,'indexSelectsNewLogo':True,'receipt':str(root/'live-served-assets.json')}))
