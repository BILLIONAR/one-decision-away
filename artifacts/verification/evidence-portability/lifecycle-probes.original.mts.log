import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { RecordedNarration } from '/workspace/one-decision-away/src/utils/recordedNarration.ts';
import { VoiceGuide } from '/workspace/one-decision-away/src/utils/voiceGuide.ts';
import { geminiVoice } from '/workspace/one-decision-away/src/utils/geminiVoice.ts';

const out = '/workspace/scratch/oda-narration-integration-review';
const digest = (bytes: ArrayBuffer) => Promise.resolve(createHash('sha256').update(Buffer.from(bytes)).digest('hex'));
const bytes = Uint8Array.of(21, 31, 41, 51);
const asset = (cueIndex = 0, sessionId = 'review') => ({ sessionId, cueIndex, language: 'en-US' as const, version: 'v1', text: `Original English cue ${cueIndex}.`, file: `assets/oda/narration/en-US/v1/clips/${sessionId}-${cueIndex}.mp3`, bytes: bytes.length, checksum: createHash('sha256').update(bytes).digest('hex'), sourceTextHash: createHash('sha256').update(`Original English cue ${cueIndex}.`).digest('hex'), decodedDurationSeconds: 5, containerDurationSeconds: 5.04, scheduledStartSeconds: cueIndex * 20, slotSeconds: 20 });
const slot = (cueIndex = 0, sessionId = 'review') => ({ sessionId, cueIndex, maxDurationSeconds: 20 });
const settle = async () => { for (let i = 0; i < 16; i++) await new Promise(resolve => setImmediate(resolve)); };
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(res => { resolve = res; }); return { promise, resolve }; }
class FakeContext {
  state = 'running'; currentTime = 0; destination = {}; starts: { offset: number; gain: number; source: any }[] = []; sources: any[] = [];
  gain = { gain: { value: 1 }, connect() {} };
  createGain() { return this.gain; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  decodeAudioData() { return Promise.resolve({ duration: 5, numberOfChannels: 1 }); }
  createBufferSource() {
    const owner = this;
    const source: any = { buffer: null, onended: null, stopped: 0, connect() {}, disconnect() {}, stop() { source.stopped++; }, start(_when: number, offset: number) { owner.starts.push({offset, gain: owner.gain.gain.value, source}); } };
    this.sources.push(source); return source;
  }
}
class FakeCache {
  data = new Map<string, Response>(); puts = 0;
  async match(key: string) { return this.data.get(key)?.clone(); }
  async put(key: string, response: Response) { this.data.set(key, response.clone()); this.puts++; }
  async delete(key: string | Request) { return this.data.delete(typeof key === 'string' ? key : new URL(key.url).pathname); }
  async keys() { return [...this.data.keys()].map(key => new Request(`http://localhost${key}`)); }
}
function fixture(count = 6, cacheStorage: any = null) {
  const context = new FakeContext(); let clock = 0; let contexts = 0;
  const loads: { url: string; signal: AbortSignal; resolve: (r: Response) => void }[] = [];
  const assets = Array.from({length: count}, (_, i) => asset(i));
  const narration = new RecordedNarration(assets, { basePath: '/', cacheStorage, createContext: () => { contexts++; return context as any; }, sha256: digest, now: () => clock, fetch: ((url: string, options: any) => { const d = deferred<Response>(); loads.push({url, signal: options.signal, resolve: d.resolve}); return d.promise; }) as any });
  const resolve = (i = 0, response = new Response(bytes)) => loads[i].resolve(response);
  return { narration, context, loads, assets, resolve, contexts: () => contexts, clock: (n: number) => {clock = n;} };
}
const results: any[] = [];
const probe = async (name: string, fn: () => Promise<any>) => { try { results.push({name, status:'passed', details:await fn()}); } catch (error) { results.push({name, status:'failed', error:String(error)}); } };

await probe('Construction dormant; at most current plus two upcoming fetched', async () => {
  const h = fixture(); assert.equal(h.contexts(), 0); assert.equal(h.loads.length, 0);
  h.narration.prefetch(h.assets.map(a => a.text), h.assets.map(a => slot(a.cueIndex)));
  await settle(); assert.equal(h.loads.length, 3);
  h.resolve(0); h.resolve(1); h.resolve(2); await settle();
  assert.equal((h.narration as any).decoded.size, 3); h.narration.stop();
  return { requests: h.loads.map(l => l.url), decoded: 3 };
});
await probe('Volume zero set during async load persists at source start', async () => {
  const h=fixture(); let started=0; const request=h.narration.speak(h.assets[0].text, .8, () => started++, () => {}, slot());
  await settle(); h.narration.setVolume(0); h.resolve(); assert.equal(await request, true);
  assert.equal(h.context.starts[0].gain, 0); assert.equal(started, 1); h.narration.stop(); return {gain:0};
});
await probe('Stop cancels pending load and prevents late playback', async () => {
  const h=fixture(); let started=0; const request=h.narration.speak(h.assets[0].text, 1, () => started++, () => {}, slot());
  await settle(); h.narration.stop(); assert.equal(h.loads[0].signal.aborted, true); h.resolve(); assert.equal(await request, false);
  assert.equal(started,0); assert.equal(h.context.starts.length,0); return {lateStarts:0};
});
await probe('Pause/resume playing cue restores offset with pause-adjusted deadline', async () => {
  const h=fixture(); let ended=0; const request=h.narration.speak(h.assets[0].text, .7, () => {}, () => ended++, slot());
  await settle();h.resolve();assert.equal(await request,true);h.context.currentTime=1.4;h.clock(1400);h.narration.pause();
  assert.equal(h.narration.isPlaying(),false);h.clock(101400);await h.narration.resume();assert.equal(h.context.starts.length,2);
  assert.equal(h.context.starts[1].offset,1.4);h.context.sources[1].onended();assert.equal(ended,1);return {offset:1.4,ended};
});
await probe('Pause during load does not revive stale load, Resume restores current cue', async () => {
  const h=fixture();let started=0;const request=h.narration.speak(h.assets[0].text,1,() => started++,() => {},slot());
  await settle();h.clock(600);h.narration.pause();h.resolve();assert.equal(await request,false);assert.equal(started,0);
  h.clock(30600);const resumed=h.narration.resume();await settle();
  if(h.loads.length>1)h.resolve(1);await resumed;await settle();
  assert.equal(h.context.starts.length,1,'Resume must restore the current cue after aborting its pending load');return {starts:h.context.starts.length};
});
await probe('Replay interrupts prior source and ignores captured old ended callback',async () => {
  const h=fixture();let ended=0;const first=h.narration.speak(h.assets[0].text,1,() => {},() => ended++,slot());await settle();h.resolve();await first;
  const callback=h.context.sources[0].onended;await h.narration.speak(h.assets[0].text,.5,() => {},() => ended++,slot());callback();
  assert.equal(ended,0);assert.equal(h.narration.isPlaying(),true);assert.equal(h.context.sources[0].stopped,1);h.narration.stop();return {sources:2,staleEndIgnored:true};
});
await probe('Session switching aborts old loads, clears decoded session and never plays late old cue',async () => {
  const h=fixture();const other=asset(0,'other');(h.narration as any).assets=[...h.assets,other];let oldStarts=0;
  const first=h.narration.speak(h.assets[0].text,1,() => oldStarts++,() => {},slot());await settle();
  const second=h.narration.speak(other.text,1,() => {},() => {},slot(0,'other'));await settle();h.resolve(0);h.resolve(1);
  assert.equal(await first,false);assert.equal(await second,true);assert.equal(oldStarts,0);assert.equal(h.context.starts.length,1);
  assert.deepEqual([...(h.narration as any).decoded.keys()],['other:0']);h.narration.stop();return {oldStarts,decodedKeys:['other:0']};
});
await probe('Verified persistence remains at 32 clips, decoded memory at 3',async () => {
  const cache=new FakeCache();const h=fixture(36,{open:async () => cache});
  // Request and play each cue in order, never bulk-warm the pack.
  for(let i=0;i<36;i++){const p=h.narration.speak(h.assets[i].text,1,() => {},() => {},slot(i));await settle();h.resolve(i);assert.equal(await p,true);}
  assert.equal(cache.data.size,32);assert.equal((h.narration as any).decoded.size,3);h.narration.stop();return {persistent:cache.data.size,decoded:3};
});
await probe('Corrupt cached clip is deleted; verified network bytes replace it',async () => {
  const cache=new FakeCache();cache.data.set('/'+asset().file,new Response(Uint8Array.of(0,0,0,0)));const h=fixture(1,{open:async () => cache});
  const p=h.narration.speak(h.assets[0].text,1,() => {},() => {},slot());await settle();assert.equal(h.loads.length,1);h.resolve();assert.equal(await p,true);
  assert.deepEqual(new Uint8Array(await cache.data.get('/'+asset().file)!.clone().arrayBuffer()),bytes);h.narration.stop();return {networkRetry:1};
});

const original = new Map(['window','SpeechSynthesisUtterance','localStorage'].map(n => [n,Object.getOwnPropertyDescriptor(globalThis,n)]));
const provider=geminiVoice.speak;let providerCalls=0;(geminiVoice as any).speak=async () => {providerCalls++;throw Error('No provider permitted');};
class Utterance { voice:any=null;lang='';rate=1;pitch=1;volume=1;onstart:any=null;onend:any=null;onerror:any=null;constructor(public text:string){} }
const english={lang:'en-US',name:'Review English',voiceURI:'en-review',default:false};const turkish={lang:'tr-TR',name:'Review Turkish',voiceURI:'tr-review',default:true};
let voices:any[]=[turkish,english];let spoken:any[]=[];
const synthesis={speaking:false,paused:false,getVoices:() => voices,addEventListener(){},cancel(){this.speaking=false;},speak(u:any){spoken.push(u);},pause(){this.paused=true;},resume(){this.paused=false;}};
Object.defineProperty(globalThis,'window',{configurable:true,value:{speechSynthesis:synthesis,SpeechSynthesisUtterance:Utterance}});
Object.defineProperty(globalThis,'SpeechSynthesisUtterance',{configurable:true,value:Utterance});
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:() => JSON.stringify({engine:'gemini',geminiApiKey:'synthetic-not-a-key',voiceURI:'tr-review'}),setItem(){}}});
for(const failure of ['missing','corrupt','decode'] as const)await probe(`${failure} recording falls back strictly to English device without paid provider`,async () => {
  spoken=[];const h=fixture(1);if(failure==='decode')h.context.decodeAudioData=() => Promise.reject(Error('Synthetic decode failure'));
  const guide=new VoiceGuide();guide.setRecordedNarration(h.narration);assert.equal(guide.speak(h.assets[0].text,slot()),true);await settle();
  h.resolve(0,failure==='missing'?new Response('',{status:404}):failure==='corrupt'?new Response(Uint8Array.of(0,0,0,0)):new Response(bytes));await settle();
  assert.equal(spoken.length,1);assert.equal(spoken[0].voice,english);assert.equal(spoken[0].lang,'en-US');assert.equal(providerCalls,0);guide.stop();return {fallback:'en-US',providerCalls};
});
await probe('Device fallback pause/resume never retries a failed recording alongside device narration',async () => {
  voices=[turkish,english];spoken=[];const h=fixture(1);const guide=new VoiceGuide();guide.setRecordedNarration(h.narration);
  guide.speak(h.assets[0].text,slot());await settle();h.resolve(0,new Response('',{status:404}));await settle();assert.equal(spoken.length,1);
  synthesis.speaking=true;spoken[0].onstart();h.clock(500);guide.pause();assert.equal(synthesis.paused,true);
  h.clock(30500);guide.resume();await settle();if(h.loads.length>1)h.resolve(1);await settle();
  const observed={mode:guide.getPlaybackMode(),recordedStarts:h.context.starts.length,deviceSpeaking:synthesis.speaking,devicePaused:synthesis.paused,retriedLoads:h.loads.length};guide.stop();
  assert.equal(observed.recordedStarts,0,'Resume must not start a failed recording while resuming the active device fallback: '+JSON.stringify(observed));return observed;
});
await probe('Missing recording after pause during load + Resume falls back to installed English device',async () => {
  voices=[turkish,english];spoken=[];const h=fixture(1);const guide=new VoiceGuide();guide.setRecordedNarration(h.narration);
  guide.speak(h.assets[0].text,slot());await settle();h.clock(500);guide.pause();h.resolve(0,new Response('',{status:404}));await settle();
  h.clock(30500);guide.resume();await settle();assert.equal(h.loads.length,2);h.resolve(1,new Response('',{status:404}));await settle();
  const observed={mode:guide.getPlaybackMode(),deviceQueue:spoken.length,providerCalls};guide.stop();
  assert.equal(spoken.length,1,'An installed English device fallback must remain available for a missing resumed recording: '+JSON.stringify(observed));
  assert.equal(spoken[0].lang,'en-US');return observed;
});
await probe('No installed English voice never substitutes Turkish when recorded clip is missing',async () => {
  voices=[turkish];spoken=[];const h=fixture(1);const guide=new VoiceGuide();guide.setRecordedNarration(h.narration);guide.speak(h.assets[0].text,slot());await settle();h.resolve(0,new Response('',{status:404}));await settle();
  assert.equal(spoken.length,0);assert.equal(guide.getPlaybackMode(),'unavailable');assert.equal(providerCalls,0);guide.stop();return {mode:'unavailable',spoken:0};
});
geminiVoice.speak=provider;for(const [name,descriptor]of original){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else Reflect.deleteProperty(globalThis,name);}
const sources=['src/utils/recordedNarration.ts','src/utils/voiceGuide.ts','public/sw.js'].map(file => ({file,sha256:createHash('sha256').update(readFileSync('/workspace/one-decision-away/'+file)).digest('hex')}));
const report={at:new Date().toISOString(),kind:'Independent controlled lifecycle probes, no network/provider',sources,results,passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length};
writeFileSync(out+'/lifecycle-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
