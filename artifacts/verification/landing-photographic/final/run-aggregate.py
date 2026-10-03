from pathlib import Path
import json,hashlib,subprocess,datetime,time,os,re
repo=Path('/workspace/oda-landing-photographic')
out=Path('/workspace/scratch/oda-landing-photographic/corrected-build');out.mkdir(exist_ok=False)
def sha(b):return hashlib.sha256(b).hexdigest()
def rows(paths):
 return [{'file':name,'bytes':len(b),'sha256':sha(b)} for name in sorted(paths) for b in [(repo/name).read_bytes()]]
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
assert not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip()
paths=[p for p in subprocess.check_output(['git','ls-files','-z'],cwd=repo).decode().split('\0') if p and not p.startswith('artifacts/')]
before=rows(paths)
for r in before:assert sha(subprocess.check_output(['git','show',head+':'+r['file']],cwd=repo))==r['sha256'],r['file']
started=datetime.datetime.now(datetime.timezone.utc).isoformat();start=time.monotonic()
with (out/'aggregate-check.log').open('wb') as log:
 result=subprocess.run(['npm','run','check'],cwd=repo,env={**os.environ,'VITE_BASE_PATH':'/one-decision-away/'},stdout=log,stderr=subprocess.STDOUT)
b=(out/'aggregate-check.log').read_bytes();after=rows(paths);assert before==after
text=b.decode(errors='replace')
passes=re.findall(r'(?:#|ℹ) pass (\d+)',text);fails=re.findall(r'(?:#|ℹ) fail (\d+)',text)
build=rows([str(p.relative_to(repo)) for p in (repo/'dist').rglob('*') if p.is_file()])
r={'sourceCommit':head,'baselineCommit':'9e07fb13ee1f3ba1b06ec0a69d64fa536bd6a429','startedAtUtc':started,'finishedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'command':'VITE_BASE_PATH=/one-decision-away/ npm run check','argv':['npm','run','check'],'exitCode':result.returncode,'elapsedSeconds':round(time.monotonic()-start,3),'log':'aggregate-check.log','logBytes':len(b),'logSha256':sha(b),'passed':int(passes[-1]) if passes else None,'failed':int(fails[-1]) if fails else None,'sourceFileCount':len(before),'source':before,'allSourcesMatchCommittedSource':True,'unchangedDuringRun':True,'buildFileCount':len(build),'build':build,'branch':subprocess.check_output(['git','branch','--show-current'],cwd=repo,text=True).strip(),'cleanAfterRun':not subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).strip(),'limits':['Existing typecheck, translation/data/routing/notebook tests, aggregate unit cases and production Vite build. Independent runtime and visual QA reported separately.','No real account, native device, provider, paid service, production deployment or security bypass.']}
(out/'build-receipt.json').write_text(json.dumps(r,indent=2)+'\n')
print(json.dumps({k:r[k] for k in ['sourceCommit','exitCode','elapsedSeconds','passed','failed','logBytes','logSha256','sourceFileCount','buildFileCount','cleanAfterRun']}))
raise SystemExit(result.returncode)
