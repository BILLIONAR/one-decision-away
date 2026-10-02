import concurrent.futures, hashlib, json, math, pathlib, re, subprocess, sys, time
import numpy as np

BUNDLE = pathlib.Path('/workspace/scratch/oda-english-guided-narration-v1')
OUT = pathlib.Path('/workspace/scratch/oda-narration-audit')
REPO = pathlib.Path('/workspace/one-decision-away')
manifest = json.loads((BUNDLE/'manifest.json').read_text())
inventory = json.loads((BUNDLE/'source-cues.json').read_text())
source = json.loads((OUT/'current-source-cues.json').read_text())
source_map = {session['id']: session for session in source}
inventory_map = {session['id']: session for session in inventory['sessions']}
failures = []
def verify(condition, message, target=failures):
    if not condition: target.append(message)
def sha(data): return hashlib.sha256(data).hexdigest()

source_bytes = (REPO/'src/data/guidedMeditations.ts').read_bytes()
source_sha = sha(source_bytes)
source_blob = subprocess.check_output(['git','hash-object','src/data/guidedMeditations.ts'],cwd=REPO,text=True).strip()
for metadata_name, metadata in [('manifest', manifest), ('source-cues', inventory)]:
    verify(metadata['source']['sha256'] == source_sha, metadata_name + ': source file SHA mismatch')
    verify(metadata['source']['gitBlob'] == source_blob, metadata_name + ': source git blob mismatch')
    verify(metadata['source']['path'] == 'src/data/guidedMeditations.ts', metadata_name + ': unexpected source path')
verify(len(source) == len(manifest['sessions']) == 11, 'session count mismatch')
verify(set(source_map) == {session['id'] for session in manifest['sessions']}, 'session IDs differ')
verify(set(source_map) == set(inventory_map), 'source inventory session IDs differ')

tasks = []
for session in manifest['sessions']:
    session_id = session['id']
    expected = source_map[session_id]
    listed = inventory_map[session_id]
    verify(session['durationMinutes'] == expected['durationMinutes'] == listed['durationMinutes'], session_id + ': duration mismatch')
    verify(len(session['cues']) == len(expected['cues']) == len(listed['cues']), session_id + ': cue count mismatch')
    for index, cue in enumerate(session['cues']):
        actual = expected['cues'][index]
        inventory_cue = listed['cues'][index]
        next_start = expected['cues'][index+1]['atSeconds'] if index+1 < len(expected['cues']) else expected['durationMinutes']*60
        cue_failures = []
        label = session_id + ':' + str(index)
        verify(cue['index'] == index == inventory_cue['index'], label + ': index mismatch', cue_failures)
        verify(cue['sessionId'] == session_id, label + ': session mapping mismatch', cue_failures)
        verify(cue['text'] == actual['text'] == inventory_cue['text'], label + ': exact English text mismatch', cue_failures)
        verify(cue['sourceTextSha256'] == sha(actual['text'].encode()), label + ': source text SHA mismatch', cue_failures)
        verify(cue['atSeconds'] == cue['scheduledStartSeconds'] == actual['atSeconds'] == inventory_cue['atSeconds'], label + ': start mismatch', cue_failures)
        verify(cue['nextSlotOrSessionEndSeconds'] == next_start, label + ': cue/session boundary mismatch', cue_failures)
        verify(cue['availableUntilNextCueSeconds'] == next_start-actual['atSeconds'] == inventory_cue['availableUntilNextCueSeconds'], label + ': remaining slot mismatch', cue_failures)
        verify(cue['language'] == 'en-US' and cue['voice'] == 'af_heart' and cue['speed'] == 0.72, label + ': voice/language/speed metadata mismatch', cue_failures)
        expected_path = 'clips/' + session_id + '-' + f'{index:02d}' + '.en-US.v1.mp3'
        verify(cue['file'] == expected_path, label + ': filename mapping mismatch', cue_failures)
        tasks.append((cue, next_start, cue_failures))

verify(len(tasks) == 160, 'manifest must contain exactly 160 mapped clips')
declared_paths = [cue['file'] for cue, _, _ in tasks]
verify(len(set(declared_paths)) == len(declared_paths), 'duplicate manifest clip paths')
actual_paths = {str(path.relative_to(BUNDLE)) for path in (BUNDLE/'clips').glob('*.mp3')}
verify(actual_paths == set(declared_paths), 'missing or extra MP3 files')
all_paths = list(BUNDLE.rglob('*'))
verify(not any(path.is_symlink() for path in all_paths), 'bundle contains symlinks')
for path in all_paths:
    verify(path.suffix.lower() not in ['.onnx','.safetensors','.pt','.bin','.wasm'], 'unexpected shipped model/runtime artifact: ' + str(path))

def inspect(task):
    cue, next_start, errors = task
    label = cue['sessionId'] + ':' + str(cue['index'])
    file = (BUNDLE/cue['file']).resolve()
    verify(file.is_relative_to(BUNDLE.resolve()), label + ': path escape', errors)
    data = file.read_bytes()
    verify(len(data) == cue['mp3Bytes'], label + ': byte count mismatch', errors)
    verify(sha(data) == cue['sha256'], label + ': MP3 SHA mismatch', errors)
    probe_result = subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)],capture_output=True,text=True)
    verify(probe_result.returncode == 0 and not probe_result.stderr.strip(), label + ': ffprobe failure ' + probe_result.stderr.strip(), errors)
    probe = json.loads(probe_result.stdout)
    streams = [stream for stream in probe['streams'] if stream['codec_type'] == 'audio']
    verify(len(streams) == 1, label + ': audio stream count mismatch', errors)
    audio = streams[0]
    rate = int(audio['sample_rate'])
    verify(audio['codec_name'] == 'mp3' and rate == 24000 and audio['channels'] == 1, label + ': actual codec/rate/channels mismatch', errors)
    verify(int(audio.get('bit_rate',0)) == 128000, label + ': actual stream bitrate mismatch', errors)
    decoded = subprocess.run(['ffmpeg','-nostdin','-v','error','-threads','1','-i',str(file),'-map','0:a:0','-f','f32le','-acodec','pcm_f32le','pipe:1'],capture_output=True)
    verify(decoded.returncode == 0 and not decoded.stderr.strip(), label + ': full decode failure ' + decoded.stderr.decode(errors='replace').strip(), errors)
    verify(len(decoded.stdout) > 0 and len(decoded.stdout)%4 == 0, label + ': invalid decoded PCM byte count', errors)
    pcm = np.frombuffer(decoded.stdout,dtype='<f4')
    duration = len(pcm)/rate
    container = float(probe['format']['duration'])
    stream_duration = float(audio.get('duration',container))
    conservative = max(duration, container, stream_duration)
    margin = next_start - cue['scheduledStartSeconds'] - conservative
    finite = bool(np.isfinite(pcm).all())
    clipped = int(np.count_nonzero(np.abs(pcm) >= 1))
    peak = float(np.max(np.abs(pcm)))
    edge = max(1,round(rate*0.01))
    first_peak = float(np.max(np.abs(pcm[:edge])))
    last_peak = float(np.max(np.abs(pcm[-edge:])))
    verify(finite and clipped == 0, label + ': non-finite/clipped decoded samples', errors)
    verify(first_peak < 0.001 and last_peak < 0.001, label + ': 10ms endpoint silence fails -60dBFS', errors)
    verify(len(pcm) == cue['decodedMetrics']['decodedSamples'], label + ': decoded sample count differs from manifest', errors)
    verify(abs(duration-cue['decodedMetrics']['decodedDurationSeconds']) <= 1/rate, label + ': decoded duration differs from manifest', errors)
    verify(abs(container-cue['containerDurationSeconds']) < 0.000001, label + ': container duration differs from manifest', errors)
    verify(margin >= 0.25, label + ': exceeds remaining cue/session slot', errors)
    verify(abs(margin-cue['marginSeconds']) < 0.000001, label + ': timing margin differs from manifest', errors)
    return {
        'sessionId':cue['sessionId'],'index':cue['index'],'file':cue['file'],
        'sourceTextSha256':sha(cue['text'].encode()),'mp3Sha256':sha(data),'mp3Bytes':len(data),
        'codec':audio['codec_name'],'sampleRate':rate,'channels':audio['channels'],'bitRate':int(audio.get('bit_rate',0)),
        'decodedSamples':len(pcm),'decodedDurationSeconds':duration,'containerDurationSeconds':container,'conservativeDurationSeconds':conservative,
        'scheduledStartSeconds':cue['scheduledStartSeconds'],'remainingSlotSeconds':next_start-cue['scheduledStartSeconds'],
        'marginSeconds':margin,'peak':peak,'clippedSamples':clipped,'finite':finite,
        'first10msPeak':first_peak,'last10msPeak':last_peak,'decodedPcmSha256':sha(decoded.stdout),'failures':errors,
    }

start = time.monotonic()
rows = []
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(inspect, task) for task in tasks]
    for number, future in enumerate(concurrent.futures.as_completed(futures),1):
        try: rows.append(future.result())
        except Exception as error: failures.append('Clip audit exception: '+repr(error))
        if number%20 == 0: print(f'Completed {number}/160 full decodes',flush=True)
rows.sort(key=lambda row:(row['sessionId'],row['index']))
for row in rows: failures.extend(row['failures'])
decoded_total = sum(row['decodedDurationSeconds'] for row in rows)
byte_total = sum(row['mp3Bytes'] for row in rows)
verify(len(rows) == 160, 'not every clip independently decoded')
verify(abs(decoded_total-manifest['validation']['decodedClipDurationSeconds']) < 1/24000, 'decoded total differs from manifest')
verify(byte_total == manifest['validation']['totalMp3Bytes'], 'total MP3 bytes differ from manifest')
minimum = min(rows,key=lambda row:row['marginSeconds']) if rows else None
verify(minimum is not None and abs(minimum['marginSeconds']-manifest['validation']['minimumConservativeMarginSeconds']) < 0.000001,'minimum timing margin differs from manifest')
approved = next((row for row in rows if row['sessionId'] == 'gm-sleep' and row['index'] == 1),None)
verify(approved is not None and approved['mp3Sha256'] == manifest['approvedSample']['sha256'], 'approved sample checksum mismatch')

license_bytes = (BUNDLE/'LICENSE-APACHE-2.0.txt').read_bytes()
license_text = license_bytes.decode()
notice_bytes = (BUNDLE/'NOTICE.txt').read_bytes()
notice_text = notice_bytes.decode()
verify('Version 2.0, January 2004' in license_text and 'END OF TERMS AND CONDITIONS' in license_text, 'incomplete/unrecognized Apache license')
for section in range(1,10): verify(re.search(r'\n\s+'+str(section)+r'\. ',license_text) is not None, 'missing Apache section '+str(section))
verify(all(term in notice_text for term in ['Kokoro-82M v1.0','hexgrad','onnx-community','kokoro-js 1.2.1','Apache License 2.0','not distributed','original exercise text']), 'NOTICE provenance/attribution incomplete')

summary = {
    'status':'passed' if not failures else 'blocked','failures':failures,'sessionCount':len(source),'cueCount':len(tasks),'fullDecodedClipCount':len(rows),
    'sourceFileSha256':source_sha,'sourceGitBlob':source_blob,'repositoryHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip(),
    'decodedDurationSecondsIncludingWithinClipPauses':decoded_total,'scheduledSessionMinutes':sum(session['durationMinutes'] for session in source),
    'totalMp3Bytes':byte_total,'minimumConservativeMarginSeconds':minimum['marginSeconds'] if minimum else None,
    'minimumMarginClip':minimum['file'] if minimum else None,'maximumDecodedPeak':max((row['peak'] for row in rows),default=None),
    'clippedSamples':sum(row['clippedSamples'] for row in rows),'nonFiniteClips':sum(not row['finite'] for row in rows),
    'license':{'declared':'Apache-2.0','includedFileSha256':sha(license_bytes),'includedFileBytes':len(license_bytes),'noticeSha256':sha(notice_bytes),'modelsOrRuntimeShipped':False,'scope':'Document and provenance completeness; no legal-rights guarantee or independent model/runtime-output licensing clearance.'},
    'approvedSleepCue1Sha256':approved['mp3Sha256'] if approved else None,'elapsedAuditSeconds':time.monotonic()-start,
    'limits':['All 160 MP3s fully decoded; no human listening or independent transcription performed.','Input text hashes do not prove every spoken word or pronunciation.','Original WAVs are not in this bundle; raw-to-MP3 waveform correlation and generation records were not independently rechecked.','Archive SHA/size admission prerequisite was verified by the parent, not recalculated here.'],
    'tools':{tool:subprocess.check_output([tool,'-version'],text=True).splitlines()[0] for tool in ['ffmpeg','ffprobe']},
}
(OUT/'clips-audit.json').write_text(json.dumps(rows,indent=2)+'\n')
(OUT/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary,indent=2),flush=True)
sys.exit(0 if not failures else 1)
