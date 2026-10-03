from pathlib import Path
import datetime
import hashlib
import json
import os
import re
import subprocess
import time

repo = Path('/workspace/oda-reference-redesign')
out = Path('/workspace/scratch/oda-reference-redesign/domino-logo/final-build')
out.mkdir(exist_ok=False)
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=repo, text=True).strip()
assert subprocess.check_output(['git', 'status', '--porcelain'], cwd=repo, text=True) == ''
paths = subprocess.check_output(['git', 'ls-files', '-z'], cwd=repo).decode().split('\0')
paths = [p for p in paths if p and not p.startswith('artifacts/')]

def rows(names):
    result = []
    for name in sorted(names):
        b = (repo / name).read_bytes()
        result.append({'file': name, 'bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest()})
    return result

before = rows(paths)
for record in before:
    committed = subprocess.check_output(['git', 'show', head + ':' + record['file']], cwd=repo)
    assert hashlib.sha256(committed).hexdigest() == record['sha256']
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
start = time.monotonic()
with (out / 'aggregate-check.log').open('wb') as log:
    run = subprocess.run(['npm', 'run', 'check'], cwd=repo,
                         env={**os.environ, 'VITE_BASE_PATH': '/one-decision-away/'},
                         stdout=log, stderr=subprocess.STDOUT)
body = (out / 'aggregate-check.log').read_bytes()
text = body.decode(errors='replace')
passed = re.findall(r'(?:#|ℹ) pass (\d+)', text)
failed = re.findall(r'(?:#|ℹ) fail (\d+)', text)
after = rows(paths)
build = rows([str(p.relative_to(repo)) for p in (repo / 'dist').rglob('*') if p.is_file()])
receipt = {
    'sourceCommit': head, 'baselineCommit': 'dc7208922ecbe026a2523ee4c571735e3f375bae',
    'previousProductionCommit': '350aa158f30c773a373f2895e267119f9f2eb17a',
    'startedAtUtc': started, 'finishedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'command': 'VITE_BASE_PATH=/one-decision-away/ npm run check', 'argv': ['npm', 'run', 'check'],
    'exitCode': run.returncode, 'elapsedSeconds': round(time.monotonic() - start, 3),
    'log': 'aggregate-check.log', 'logBytes': len(body), 'logSha256': hashlib.sha256(body).hexdigest(),
    'passed': int(passed[-1]) if passed else None, 'failed': int(failed[-1]) if failed else None,
    'sourceFileCount': len(before), 'source': before, 'allSourcesMatchCommittedSource': True,
    'unchangedDuringRun': before == after, 'buildFileCount': len(build), 'build': build,
    'branch': subprocess.check_output(['git', 'branch', '--show-current'], cwd=repo, text=True).strip(),
    'cleanAfterRun': subprocess.check_output(['git', 'status', '--porcelain'], cwd=repo, text=True) == '',
    'limits': ['Existing aggregate lint/types/translations/data/functional tests and Vite production build; final independent browser/logo/release review separate.',
               'No physical iOS, native Xcode or real account/provider validation implied.'],
}
(out / 'build-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({k: receipt[k] for k in ['sourceCommit', 'exitCode', 'passed', 'failed', 'logBytes', 'logSha256', 'sourceFileCount', 'buildFileCount', 'unchangedDuringRun', 'cleanAfterRun']}))
assert before == after and receipt['cleanAfterRun']
raise SystemExit(run.returncode)
