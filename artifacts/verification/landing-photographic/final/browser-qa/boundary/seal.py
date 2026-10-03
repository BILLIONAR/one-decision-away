import hashlib,json,pathlib,subprocess,datetime
root=pathlib.Path('/workspace/scratch/oda-landing-photographic/browser-qa/boundary')
repo=pathlib.Path('/workspace/oda-landing-photographic')
receipt_path=pathlib.Path('/workspace/scratch/oda-landing-photographic/final-build/build-receipt.json')
sha=lambda b:hashlib.sha256(b).hexdigest()
def record(path,label=None):
 b=path.read_bytes();return {'file':label or str(path.relative_to(root)),'bytes':len(b),'sha256':sha(b)}
receipt=json.loads(receipt_path.read_text())
assert receipt['sourceCommit']=='f02ce3344c3b75090e99e7e3e9c1f988251c3f24'
for a in receipt['source']+receipt['build']:
 b=(repo/a['file']).read_bytes();assert len(b)==a['bytes'] and sha(b)==a['sha256'],a['file']
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();assert head==receipt['sourceCommit']
attempts=[];reports=[];pngs=[]
for directory in [root,root/'remaining-768',root/'remaining-es-768']:
 r=json.loads((directory/'report.json').read_text());reports.append(r)
 assert not r['pageErrors'] and not r['responseErrors'] and not r['blockedExternal']
 attempts.append({'report':record(directory/'report.json'),'log':record(directory/'run.log'),'error':r.get('error'),'cases':[c['name'] for c in r['cases']],'recordedPassingChecks':len(r['checks']),'browserClosed':True})
 for p in r['pngs']:
  file=directory/p['file'];actual=record(file)
  assert actual['bytes']==p['bytes'] and actual['sha256']==p['sha256'],actual['file']
  pngs.append({**actual,'diagnostic':p.get('diagnostic',False)})
cases=[];failures=[]
for r in reports:
 for c in r['cases']:
  if 'contrast' not in c:continue
  assert not c['observed']['issues']
  assert len(c['photoRequests'])==len(c['photoResponses'])==1
  assert all(control['height']>=44 for control in c['observed']['controls'])
  ratio=[]
  for region in c['contrast']['analysis']['regions']:
   for run in region['runs']:
    ratio.append(run['actualGlyphMinRatio'])
    if not run['pass']:
     failure={k:run[k] for k in ['selector','text','actualGlyphMinRatio','threshold','conservativeBoxMinRatio']}
     failure.update({'case':c['name'],'region':region['name'],'worstActualPixel':run['actual_changed_glyph_pixel_minimum']})
     failures.append(failure)
  cases.append({'name':c['name'],'width':c['width'],'height':c['observed']['height'],'locale':c['locale'],'dpr':1,'textFitPass':True,'allVisibleControlHeight44pxPass':True,'controlCount':len(c['observed']['controls']),'servedPhoto':c['photoResponses'][0],'photoRequestCount':1,'contrastPass':c['contrast']['analysis']['pass'],'minimumSampledGlyphRatio':min(ratio),'contrastAnalysis':str((pathlib.Path(c['contrast']['analysis']['metadata']['path']).parent/c['contrast']['output']).relative_to(root)),'photoCover':c.get('cover')})
assert len(cases)==6 and len(failures)==2
support=[]
for directory in [root,root/'remaining-768',root/'remaining-es-768']:
 for file in sorted(directory.glob('*.json')):
  if file.name=='report.json':continue
  support.append(record(file))
 for file in sorted(directory.glob('*harness.mjs')):support.append(record(file))
support.append(record(root.parent/'boundary.mjs','../boundary.mjs'))
support.append(record(root/'seal.py'))
seal={'sourceCommit':head,'status':'REQUIRES_CORRECTION','synthetic':True,'published':False,'physicalDevice':False,'sealedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'buildReceipt':record(receipt_path,str(receipt_path)),'hashesVerifiedAfter':{'source':len(receipt['source']),'compiled':len(receipt['build'])},'cases':cases,'blockingFindings':failures,'attempts':attempts,'methodCorrections':['First attempt stopped at EN768 because delegated1280/67,698 expectation was an unapproved harness assumption. Actual768/30,084 source selection matches frozen srcset and build. Original log/report/harness retained unchanged.','Continuation ran EN/TR768 only until the real TR contrast failure; final separate run measured only remaining ES768. No360 retest.','Initial shell log redirection failed before any browser launch because output directory did not yet exist; directory created and first actual run recorded.'],'manualPixelReview':{'inspectedOriginalResolution':['landing-en-light-360-hero.png','landing-en-light-768-hero.png','remaining-768/landing-tr-light-768-hero.png','remaining-es-768/landing-es-light-768-hero.png','landing-en-light-360.png','remaining-768/landing-en-light-768.png'],'observations':['Clean PNGs show no clipped copy or controls. 360 hero retains lit peak beneath copy and curving trail below; full credit is visible in full-hero PNG.','768 hero retains lit right peak and trail. Landscape details look soft at1.697× cover upsampling; no approved numeric sharpness threshold was supplied.','TR/ES gold heading extends over brighter sky at768. Actual pixels corroborate the measured contrast failures.']},'pngs':pngs,'supportingEvidence':support,'limits':['Local installed Chromium DPR1 with synthetic saved state and fixed clock; not physical-device or production verification.','All six cases measured; four sampled text contrast passes, two blocking failures. This receipt does not accept the candidate.','DOM character rectangles and control geometry are supplemented by listed clean PNG inspection. Other PNGs recorded and hashed, not all individually visually reviewed.','Paired screenshot background and changed-glyph samples cover nav/hero captured states only. No broad WCAG compliance claim; native emoji glyph colors and complex group opacity are outside CSS foreground model.','No repository source edits, build rerun, install, external/provider/account call, security bypass or publication. Own browsers closed.']}
out=root/'boundary-review-f02ce33.json';assert not out.exists();out.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':str(out),'bytes':out.stat().st_size,'sha256':sha(out.read_bytes()),'cases':len(cases),'failures':len(failures),'pngs':len(pngs),'source':len(receipt['source']),'compiled':len(receipt['build'])}))
