from pathlib import Path
from PIL import Image,ImageChops
import hashlib,json,subprocess,re,math,datetime,plistlib

ROOT=Path('/workspace/oda-reference-redesign')
OUT=Path('/workspace/scratch/oda-reference-redesign/domino-logo/independent-assets')
BASE='dc7208922ecbe026a2523ee4c571735e3f375bae'
HEAD='84ecbf8776146b766a30964bf8e6487234dd1dd4'
RECEIPT=Path('/workspace/scratch/oda-reference-redesign/domino-logo/final-build/build-receipt.json')
EXPECTED_SOURCE='49ebd132ec6f67282a95a9e941631fccfd3e1d72bd5049a45179c277dcf78a96'
checks=[]
def check(name,condition,evidence=None):
    checks.append({'name':name,'passed':bool(condition),'evidence':evidence})
    if not condition:raise AssertionError(name)
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def tree(commit):
    result={}
    for record in git('ls-tree','-rz','--full-tree',commit).split(b'\0'):
        if record:
            meta,name=record.split(b'\t',1);mode,kind,oid=meta.decode().split()
            if kind=='blob':result[name.decode()]={'mode':mode,'blob':oid}
    return result
baseline=tree(BASE);current=tree(HEAD)
check('Frozen source commit exact',git('rev-parse','HEAD').decode().strip()==HEAD)
check('Checkout clean before audit',not git('status','--porcelain').strip())
changed={p for p in set(baseline)|set(current) if baseline.get(p)!=current.get(p)}
authorized_existing={
 'README.md','docs/BRAND.md','index.html','public/manifest.webmanifest','public/sw.js',
 'public/icon-192.png','public/icon-512.png','public/icon-192-maskable.png','public/icon-512-maskable.png','public/apple-touch-icon.png',
 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
 'ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png','ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png','ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png',
 'scripts/brand.mjs','src/brand/current.ts','src/components/Logo.tsx','src/pages/Settings.tsx','src/services/notificationScheduler.ts','src/styles/coach.css',
 'supabase/functions/send-nudges/push-worker.test.ts','tests/service-worker.test.ts'}
authorized_new={
 'brand-assets/domino8/GENERATION-PROMPT.txt','brand-assets/domino8/ODA-Icon8-Comparison.png','brand-assets/domino8/ODA-Icon8-Reconstruction-Master-1254.png','brand-assets/domino8/ODA-Icon8-Small-Size-QA.png','brand-assets/domino8/README.txt','brand-assets/domino8/SHA256SUMS.txt','brand-assets/domino8/derivatives.json',
 'brand-assets/ios/c4/AppIcon-512@2x.png','brand-assets/ios/c4/splash-2732x2732.png','brand-assets/ios/domino8/AppIcon-512@2x.png','brand-assets/ios/domino8/splash-2732x2732.png',
 'public/brand/domino8/oda-app-domino8-v1-192.png','public/brand/domino8/oda-app-domino8-v1-512.png','public/brand/domino8/oda-app-domino8-v1-maskable-192.png','public/brand/domino8/oda-app-domino8-v1-maskable-512.png','public/brand/domino8/oda-apple-domino8-v1-180.png','public/brand/domino8/oda-favicon-domino8-v1-32.png','public/brand/domino8/oda-mark-domino8-v1-256.png','public/brand/domino8/og-image-domino8-v1.png','scripts/brand-domino8-assets.mjs','src/components/brand/LogoDomino8.tsx'}
check('Only the43authorized brand/source paths changed',changed==authorized_existing|authorized_new,{'changedPaths':sorted(changed),'count':len(changed)})
protected=set(baseline)-authorized_existing
check('Every prior protected tracked file has identical blob and mode',all(current.get(p)==baseline[p] for p in protected),{'count':len(protected)})
for p in ['src/pages/Today.tsx','src/styles/todayPalette.css','src/styles/tokens.css','capacitor.config.ts','ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json','ios/App/App/Assets.xcassets/Splash.imageset/Contents.json','ios/App/App/Base.lproj/LaunchScreen.storyboard','ios/App/App/Info.plist','ios/App/App.xcodeproj/project.pbxproj']:
    check('Protected exact: '+p,current[p]==baseline[p],{'blob':current[p]['blob']})
old='brand/oda-app-c4-v1-192.png';new='brand/domino8/oda-app-domino8-v1-192.png'
for p in ['src/pages/Settings.tsx','src/services/notificationScheduler.ts']:
    before=git('show',BASE+':'+p).decode();after=(ROOT/p).read_text()
    check('Functional source identical after icon-reference substitution: '+p,after==before.replace(old,new))
p='src/styles/coach.css';before=git('show',BASE+':'+p).decode();after=(ROOT/p).read_text()
check('Coach CSS change only excludes new opaque logo from old C4 backing',after==before.replace('.oda-sidebar > button:first-child .oda-brand-mark {','.oda-sidebar > button:first-child .oda-brand-mark:not(.oda-domino8-mark) {'))
legacy=[p for p in baseline if p.startswith(('public/brand/','src/components/brand/','brand-assets/ios/v4/'))]
check('All legacy C4/v2/v3/v4 brand assets/components remain identical',all(current.get(p)==baseline[p] for p in legacy),{'count':len(legacy)})
for newpath,oldpath in [('brand-assets/ios/c4/AppIcon-512@2x.png','ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'),('brand-assets/ios/c4/splash-2732x2732.png','ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png')]:
    check('Original native C4 archived exact: '+newpath,current[newpath]['blob']==baseline[oldpath]['blob'])
master=ROOT/'brand-assets/domino8/ODA-Icon8-Reconstruction-Master-1254.png'
check('Accepted reconstructed master exact hash',sha(master)==EXPECTED_SOURCE,{'sha256':sha(master),'bytes':master.stat().st_size,'provenance':'Accepted reference-guided reconstruction, not the missing original'})
derivatives=json.loads((ROOT/'brand-assets/domino8/derivatives.json').read_text())
metadata=[]
for entry in derivatives['files']:
    p=ROOT/entry['file']
    with Image.open(p) as im:
        im.load();info={'file':entry['file'],'bytes':p.stat().st_size,'sha256':sha(p),'size':list(im.size),'mode':im.mode,'alphaExtrema':list(im.getchannel('A').getextrema()) if 'A' in im.getbands() else None}
        check('Derivative bytes/dimensions/opaque RGB: '+entry['file'],info['bytes']==entry['bytes'] and info['sha256']==entry['sha256'] and im.size==(entry['width'],entry['height']) and im.mode=='RGB',info)
        metadata.append(info)
for alias,target in [('public/icon-192.png','public/brand/domino8/oda-app-domino8-v1-192.png'),('public/icon-512.png','public/brand/domino8/oda-app-domino8-v1-512.png'),('public/icon-192-maskable.png','public/brand/domino8/oda-app-domino8-v1-maskable-192.png'),('public/icon-512-maskable.png','public/brand/domino8/oda-app-domino8-v1-maskable-512.png'),('public/apple-touch-icon.png','public/brand/domino8/oda-apple-domino8-v1-180.png')]:
    check('Active root alias exact bytes: '+alias,(ROOT/alias).read_bytes()==(ROOT/target).read_bytes(),{'target':target,'sha256':sha(ROOT/alias)})
for imageset in ['AppIcon.appiconset','Splash.imageset']:
    folder=ROOT/'ios/App/App/Assets.xcassets'/imageset
    catalog=json.loads((folder/'Contents.json').read_text())
    for item in catalog['images']:
        p=folder/item['filename'];target=ROOT/'brand-assets/ios/domino8'/('AppIcon-512@2x.png' if imageset.startswith('AppIcon') else 'splash-2732x2732.png')
        check('Native catalog mapping exact: '+str(p.relative_to(ROOT)),p.read_bytes()==target.read_bytes(),{'entry':item,'sha256':sha(p)})
manifest=json.loads((ROOT/'public/manifest.webmanifest').read_text());before=json.loads(git('show',BASE+':public/manifest.webmanifest'))
check('PWA identity/configuration preserved except icon URLs',{k:v for k,v in manifest.items() if k!='icons'}=={k:v for k,v in before.items() if k!='icons'})
for item in manifest['icons']:
    p=ROOT/'public'/item['src'].removeprefix('./')
    with Image.open(p) as im:check('PWA manifest readable declared PNG size/purpose: '+item['src'],item['sizes']==f'{im.width}x{im.height}' and item['type']=='image/png' and item['purpose'] in ['any','maskable'],item)
check('Native ODA application label retained',plistlib.loads((ROOT/'ios/App/App/Info.plist').read_bytes()).get('CFBundleDisplayName')=='ODA')
check('Accessible logo API retained',(ROOT/'src/components/brand/LogoDomino8.tsx').read_text().count('title')>=8 and 'aria-label={title}' in (ROOT/'src/components/brand/LogoDomino8.tsx').read_text())
check('SW scoped cache version6 active','const SHELL_CACHE = `${CACHE_PREFIX}v6`;' in (ROOT/'public/sw.js').read_text())
size=1254;scale=.7;cx=cy=size/2;bounds=[80,190,1170,1045]
corners=[(cx+(x-cx)*scale,cy+(y-cy)*scale) for x in [bounds[0],bounds[2]] for y in [bounds[1],bounds[3]]]
maxradius=max(math.hypot(x-cx,y-cy)/size for x,y in corners)
check('Conservative essential bounds fully inside40percent safe circle',maxradius<.4,{'sourceBounds':bounds,'uniformScale':scale,'farthestNormalizedRadius':maxradius,'safeRadius':.4,'sourceSpaceMarginPixels':(.4-maxradius)*size})
oldsocial=Image.open(ROOT/'public/og-image.png').convert('RGB');newsocial=Image.open(ROOT/'public/brand/domino8/og-image-domino8-v1.png').convert('RGB')
diffbox=ImageChops.difference(oldsocial,newsocial).getbbox()
check('Social image only changes prior logo area',diffbox is not None and diffbox[0]>=90 and diffbox[1]>=75 and diffbox[2]<=140 and diffbox[3]<=137,{'pixelDifferenceBounds':diffbox})
r=json.loads(RECEIPT.read_text());check('Build receipt binds exact source/aggregate',r['sourceCommit']==HEAD and r['exitCode']==0 and r['passed']==621 and r['failed']==0)
for key in ['source','build']:
    mismatches=[entry['file'] for entry in r[key] if not (ROOT/entry['file']).is_file() or (ROOT/entry['file']).stat().st_size!=entry['bytes'] or sha(ROOT/entry['file'])!=entry['sha256']]
    check('Every actual '+key+' file matches frozen build receipt',not mismatches,{'count':len(r[key]),'mismatches':mismatches})
log=RECEIPT.parent/r['log'];check('Exact aggregate log matches recorded bytes/hash',log.stat().st_size==r['logBytes'] and sha(log)==r['logSha256'],{'file':str(log),'bytes':log.stat().st_size,'sha256':sha(log)})
check('Checkout still clean after read-only source/asset audit',not git('status','--porcelain').strip())
report={
 'reviewedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'passed','sourceCommit':HEAD,'baselineCommit':BASE,
 'scope':'Independent read-only source/protection/asset audit; only own scratch receipts and normal-browser synthetic mask previews were written.',
 'checks':checks,'passed':len(checks),'failed':0,'changedPaths':sorted(changed),'protectedPriorTrackedFiles':len(protected),'legacyProtectedBrandFiles':len(legacy),
 'assets':metadata,'buildReceipt':{'file':str(RECEIPT),'bytes':RECEIPT.stat().st_size,'sha256':sha(RECEIPT),'sourceFiles':len(r['source']),'buildFiles':len(r['build'])},
 'visualInspection':{'actualMasterAndComparisonInspected':True,'actualCommittedPreviewsInspected':['web-pwa-mask-preview.png','favicon-small-size-preview.png','native-icon-mask-preview.png','native-splash-390.png','native-splash-320.png'],
   'findings':['No important domino artwork clipped by40percent PWA safe-circle preview or rounded-square native approximation.','Opaque square assets contain no baked outer rounded frame.','Gold foreground and ruby following dominos identifiable at16/32CSSpixels; fine metallic detail reduced naturally.','Slight squared tonal gradient seam in padded maskable background is visible at larger scales; cosmetic and acceptable, with exact source preserved.','Full square master retained on warm-ivory native splash and fits390/320portrait previews.','Native circle comparison is illustrative only; native asset is not declared maskable.']},
 'limitations':['Synthetic Chromium CSS-size and mask previews are not physical iPhone installation, native Xcode asset compilation or App Store acceptance.','Rounded-square preview approximates system masking; it is not an exact iOS squircle measurement.','Android/native monochrome notification-badge rendering is untested; selected full-color icon is wired as before.','No new independent aggregate rerun; exact existing frozen run was inspected and bound.','Original artwork was unavailable; accepted reconstruction is explicitly labelled.']}
OUT.mkdir(parents=True,exist_ok=True);p=OUT/'asset-source-audit-84ecbf8.json';p.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'report':str(p),'bytes':p.stat().st_size,'sha256':sha(p),'passed':len(checks),'failed':0,'protectedFiles':len(protected),'changedPaths':len(changed)}))
