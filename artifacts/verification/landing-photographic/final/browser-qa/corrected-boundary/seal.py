import hashlib,json,pathlib,subprocess,datetime
root=pathlib.Path('/workspace/scratch/oda-landing-photographic/browser-qa/corrected-boundary')
repo=pathlib.Path('/workspace/oda-landing-photographic')
receipt_path=pathlib.Path('/workspace/scratch/oda-landing-photographic/corrected-build/build-receipt.json')
sha=lambda b:hashlib.sha256(b).hexdigest()
def record(path,label=None):
 b=path.read_bytes();return {'file':label or str(path.relative_to(root)),'bytes':len(b),'sha256':sha(b)}
receipt=json.loads(receipt_path.read_text())
assert receipt['sourceCommit']=='9627fa22c379f15755d9388d7fbaf49c27c6457c'
for a in receipt['source']+receipt['build']:
 b=(repo/a['file']).read_bytes();assert len(b)==a['bytes'] and sha(b)==a['sha256'],a['file']
aggregate=receipt_path.parent/receipt['log'];aggregate_record=record(aggregate,str(aggregate))
assert aggregate_record['bytes']==receipt['logBytes'] and aggregate_record['sha256']==receipt['logSha256']
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip();assert head==receipt['sourceCommit']
attempts=[];reports=[];pngs=[]
for directory in [root,root/'remaining-768']:
 r=json.loads((directory/'report.json').read_text());reports.append(r)
 assert not r['pageErrors'] and not r['responseErrors'] and not r['blockedExternal']
 for h in r['harnessFiles']:
  b=(directory/h['file']).read_bytes();assert len(b)==h['bytes'] and sha(b)==h['sha256']
 attempts.append({'report':record(directory/'report.json'),'log':record(directory/'run.log'),'error':r.get('error'),'cases':[c['name'] for c in r['cases']],'recordedPassingChecks':len(r['checks']),'browserClosed':True})
 for p in r['pngs']:
  file=directory/p['file'];actual=record(file)
  assert actual['bytes']==p['bytes'] and actual['sha256']==p['sha256'],actual['file']
  pngs.append({**actual,'diagnostic':p.get('diagnostic',False)})
diagnostic=json.loads((root/'diagnostic768/report.json').read_text())
assert diagnostic['browserClosed'] and not diagnostic['errors'] and not diagnostic['external']
assert diagnostic['snapshots'][0]['requestCount']==1 and diagnostic['snapshots'][1]['requestCount']==1
assert diagnostic['requests'][0]['stage']=='initial-page-load'
assert diagnostic['requests'][1]['stage']=='fullPage-clip-hero-screenshot'
assert any(x['width']==1 and x['height']==1 for x in diagnostic['snapshots'][-1]['resizes'])
for p in diagnostic['pngs']:
 actual=record(root/'diagnostic768'/p['file']);assert actual['bytes']==p['bytes'] and actual['sha256']==p['sha256'];pngs.append({**actual,'diagnostic':True})
cases=[]
for r in reports:
 for c in r['cases']:
  if 'contrast' not in c:continue
  assert c['contrast']['analysis']['pass'] and not c['observed']['issues']
  assert len(c['photoRequests'])==len(c['photoResponses'])==1
  assert all(control['height']>=44 for control in c['observed']['controls'])
  em=[run for reg in c['contrast']['analysis']['regions'] for run in reg['runs'] if run['selector'].startswith('em')][0]
  first=c['photoResponses'][0]
  assert first['bytes']==(34224 if c['width']==360 else 130032)
  assert len([p for p in c['photo']['preloads'] if p['matches']])==1
  cases.append({'name':c['name'],'width':c['width'],'height':c['observed']['height'],'locale':c['locale'],'dpr':1,'textFitPass':True,'allVisibleControlHeight44pxPass':True,'controlCount':len(c['observed']['controls']),'servedPhoto':first,'firstViewPhotoRequestCount':1,'matchedPreloadPass':True,'photoSizes':c['photo']['sizes'],'contrastPass':True,'goldHeadingMinimumSampledGlyphRatio':em['actualGlyphMinRatio'],'goldHeadingThreshold':em['threshold'],'contrastAnalysis':str((pathlib.Path(c['contrast']['analysis']['metadata']['path']).parent/c['contrast']['output']).relative_to(root)),'encodedAsset':c['encoded'],'photoCover':c['cover'],'laterCaptureInducedPhotoRequests':c.get('captureInducedPhotoRequests',[]),'laterCaptureInducedPhotoResponses':c.get('captureInducedPhotoResponses',[])})
assert len(cases)==6
support=[]
for directory in [root,root/'remaining-768',root/'diagnostic768']:
 for file in sorted(directory.glob('*.json')):
  if file.name=='report.json' and directory!=root/'diagnostic768':continue
  support.append(record(file))
 for file in sorted(directory.glob('*.mjs')):support.append(record(file))
support.append(record(root/'diagnostic768.log'))
support.append(record(root/'seal.py'))
old=pathlib.Path('/workspace/scratch/oda-landing-photographic/browser-qa/boundary/boundary-review-f02ce33.json')
seal={'sourceCommit':head,'status':'PASS_FOR_SCOPED_LOCAL_BOUNDARY_CHECKS','synthetic':True,'published':False,'physicalDevice':False,'sealedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'buildReceipt':record(receipt_path,str(receipt_path)),'aggregateLogVerified':aggregate_record,'hashesVerifiedAfter':{'source':len(receipt['source']),'compiled':len(receipt['build'])},'uniqueBoundaryChecks':24,'sharedChecks':2,'cases':cases,'blockingFindings':[],'attempts':attempts,'captureTimingDiagnostic':{'report':record(root/'diagnostic768/report.json'),'normalFirstViewPhotoRequests':1,'normalFirstViewPhotoBytes':130032,'afterTopScreenshotPhotoRequests':1,'fullHeroScreenshotIntermediateViewport':{'width':1,'height':1},'additionalRequestDuringCapture':'hero-dolomites-mobile-480.webp','explanation':'Normal Playwright fullPage+clip capture briefly resized viewport1x1, matching mobile picture media and triggering an extra derivative request. This is recorded separately from first-view loading; no app/source change was made.'},'methodCorrections':['Initial corrected run completed all360 cases and stopped EN768 at a count assertion sampled after captures. Actual pre-capture app loading was then measured independently; report/log/harness remain intact.','Only remaining768 EN/TR/ES were run in a separate directory with first-view photo snapshot before any capture. No360 rerun. Later capture-induced requests are explicitly recorded.'],'priorFailureEvidence':record(old,str(old)),'manualPixelReview':{'inspectedOriginalResolution':['landing-en-light-768-hero.png','remaining-768/landing-tr-light-768-hero.png','remaining-768/landing-es-light-768-hero.png'],'observations':['New1920 derivative shows visibly sharper rock and trail detail at768 than the prior768 source. Encoded1920x1091 source covers768x740 at0.6783scale, with no source upsampling.','Actual corrected TR/ES hero PNGs show readable gold headings over darker scrim; all letter rectangles fit without clipping. Their sampled gold-heading minima are4.59124:1 and4.24358:1 against the3:1 large-text threshold.','Lit right peak, snow and curving trail remain visible. No foreground text, controls or credit were clipped in inspected full-hero captures.']},'pngs':pngs,'supportingEvidence':support,'limits':['Local installed Chromium DPR1 with synthetic saved state and fixed clock; not physical-device or production verification.','Twenty-four unique boundary checks plus two shared checks passed. Acceptance applies only to the six360/768 captured EN/TR/ES light cases.','Paired screenshot background and changed-glyph samples cover nav/hero captured states only. No broad WCAG compliance claim; native emoji glyph colors and complex group opacity are outside CSS foreground model.','Only the listed new hero PNGs were personally visually reviewed; all40 PNGs, including diagnostic captures and duplicate evidence, were byte/hash verified.','No repository source edits, build rerun, install, external/provider/account call, security bypass or publication. Own browsers closed.']}
out=root/'boundary-review-9627fa2.json';assert not out.exists();out.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':str(out),'bytes':out.stat().st_size,'sha256':sha(out.read_bytes()),'cases':len(cases),'pngs':len(pngs),'source':len(receipt['source']),'compiled':len(receipt['build'])}))
