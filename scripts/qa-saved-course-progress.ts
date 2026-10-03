import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { build } from 'esbuild';
import { chromium, type Browser, type Page } from 'playwright';
import { existsSync } from 'node:fs';

// Actual React hook + record queue + native IndexedDB in disposable Chromium.
// Only the provider props, account events and held persistence boundary are synthetic.
let browser: Browser;
let bundle: string;
before(async () => {
  const built = await build({ stdin: { resolveDir: process.cwd(), loader: 'tsx', contents: `
    import React, {useLayoutEffect} from 'react';
    import {createRoot} from 'react-dom/client';
    import {flushSync} from 'react-dom';
    import {useSavedCourseProgress} from './src/hooks/useSavedCourseProgress';
    import {LocalDemoRepository, getInitialDemoState} from './src/services/repository';
    import {courseCatalogFor} from './src/data/courseCatalog';
    import {mutateCourseProgress, normalizeCourseProgress} from './src/services/courseProgress';
    import {queueDataWrite} from './src/services/dataWrites';
    import {cloudSync} from './src/services/cloudSync';
    const key='one_decision_away_app_data_v1', lesson=courseCatalogFor('en')[0].lessons[0];
    const count=p=>Object.values(p?.lessons||{}).filter(x=>x.completed).length;
    const seed=getInitialDemoState(); seed.profile.id='synthetic-reader-A'; seed.profile.locale='en';
    seed.courseProgress={version:1,lessons:{[lesson.id]:{checked:Array(lesson.practiceCount).fill(true),answer:lesson.correct,reflection:'Synthetic saved prerequisites',completed:false}}};
    localStorage.setItem(key,JSON.stringify(seed));
    const repository=new LocalDemoRepository(); let root, props=seed, mutation;
    const observations=[], events=[]; let transactions=0;
    const nativeTransaction=IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction=function(...args){transactions++; return nativeTransaction.apply(this,args);};
    addEventListener('focus',e=>events.push({type:e.type,trusted:e.isTrusted}));
    function Probe(){const p=useSavedCourseProgress(props);useLayoutEffect(()=>{observations.push({count:count(p),profile:props.profile.id,epoch:props._odaReplacementEpoch});});return <output id="saved-progress">{count(p)}</output>;}
    const render=()=>flushSync(()=>root.render(<Probe/>));
    const nativePut=IDBObjectStore.prototype.put, nativeGet=IDBObjectStore.prototype.get;
    let gate={phase:'idle',armed:false,nativePuts:0};
    const complete=s=>!!JSON.parse(s?.appData||'null')?.courseProgress?.lessons?.[lesson.id]?.completed;
    IDBObjectStore.prototype.put=function(value,recordKey){
      if(!gate.armed||this.transaction.db.name!=='oda_personal_record_v1'||this.name!=='record'||recordKey!=='current'||!complete(value))return nativePut.apply(this,arguments);
      gate.armed=false;gate.phase='held';gate.nativePuts=0;gate.reads=0;gate.mode=this.transaction.mode;gate.events=[];
      const store=this,tx=this.transaction,started=performance.now();
      tx.addEventListener('complete',()=>{gate.phase='committed';gate.events.push('complete');});
      tx.addEventListener('abort',()=>{gate.phase='aborted';gate.events.push('abort');});
      const pump=()=>{const request=nativeGet.call(store,'current');request.onsuccess=()=>{
        gate.reads++;gate.authorityCompleted=complete(request.result);
        if(gate.release==='abort'||performance.now()-started>12000){tx.abort();return;}
        if(gate.release==='commit'){gate.nativePuts++;nativePut.call(store,value,recordKey);return;}
        pump();
      };return request;};return pump();
    };
    window.__savedTest={seed,lesson,observations,events,
      ready:()=>repository.load(),
      mount:()=>{root=createRoot(document.getElementById('root'));render();},
      unmount:()=>{flushSync(()=>root.unmount());root=null;},
      replaceProps:next=>{props=next;render();},
      scopeProps:(profile,epoch)=>{props={...seed,profile:{...seed.profile,id:profile},_odaReplacementEpoch:epoch,courseProgress:{version:1,lessons:{}}};render();},
      replaceDurable:()=>repository.replaceAll(props),
      changeAccount:id=>{cloudSync.setSession(id?{user:{id},access_token:'synthetic-test-only'}:null);cloudSync.emit();},
      arm:()=>{gate={phase:'idle',armed:true,nativePuts:0};mutation=mutateCourseProgress(p=>normalizeCourseProgress({...p,lessons:{...p.lessons,[lesson.id]:{...p.lessons[lesson.id],completed:true}}}));},
      release:mode=>{gate.release=mode;},
      finish:async()=>{const result=await mutation;await queueDataWrite(()=>undefined);return {saved:!!result,gate};},
      drain:()=>queueDataWrite(()=>undefined),
      gate:()=>gate,
      stats:()=>({transactions,observations,events}),
      authority:()=>new Promise((resolve,reject)=>{const open=indexedDB.open('oda_personal_record_v1',1);open.onerror=()=>reject(open.error);open.onsuccess=()=>{const db=open.result,tx=db.transaction('record','readonly'),r=tx.objectStore('record').get('current');tx.oncomplete=()=>{db.close();resolve({completed:complete(r.result),projectionCompleted:!!JSON.parse(localStorage.getItem(key))?.courseProgress?.lessons?.[lesson.id]?.completed});};}}),
      failNextRead:()=>{const nativeGet=IDBObjectStore.prototype.get;let fail=true;IDBObjectStore.prototype.get=function(...args){const r=nativeGet.apply(this,args);if(fail&&this.transaction.db.name==='oda_personal_record_v1'&&this.transaction.mode==='readonly'){fail=false;this.transaction.abort();IDBObjectStore.prototype.get=nativeGet;}return r;};},
      guardedNotification:()=>{const e=new CustomEvent('oda:course-progress-changed',{detail:{canSync:()=>false}});dispatchEvent(e);}
    };
  ` }, bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022', define: { 'import.meta.env': '{}' }, logLevel: 'silent' });
  bundle = built.outputFiles[0].text;
  browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined) });
});
after(async () => { await browser?.close(); });

async function fixture(run: (page: Page) => Promise<void>) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const errors: string[] = [];
  await context.route('**/*', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><div id="root"></div>' }));
  const page = await context.newPage();page.setDefaultTimeout(5000);
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:9876/synthetic-saved-progress-regression');
    await page.addScriptTag({ content: bundle });
    await page.evaluate(() => (window as any).__savedTest.ready());
    await run(page);
    assert.deepEqual(errors, [], 'actual hook/queue must not throw page errors');
  } finally { await context.close(); }
}
const mount = async (page: Page) => { await page.evaluate(() => (window as any).__savedTest.mount()); };
const count = async (page: Page) => Number(await page.locator('#saved-progress').textContent());
const settled = async (page: Page, expected: number) => { await page.waitForFunction(expected => Number(document.querySelector('#saved-progress')?.textContent) === expected, expected); };
async function hold(page: Page) {
  await page.evaluate(() => (window as any).__savedTest.arm());
  await page.waitForFunction(() => (window as any).__savedTest.gate().phase === 'held' && (window as any).__savedTest.gate().reads > 0);
  const gate = await page.evaluate(() => (window as any).__savedTest.gate());
  assert.equal(gate.mode, 'readwrite');assert.equal(gate.nativePuts, 0);assert.equal(gate.authorityCompleted, false);assert.deepEqual(gate.events, []);
}
async function release(page: Page, mode: 'commit' | 'abort') {
  await page.evaluate(mode => (window as any).__savedTest.release(mode), mode);
  const result = await page.evaluate(() => (window as any).__savedTest.finish());
  assert.equal(result.saved, mode === 'commit');assert.equal(result.gate.phase, mode === 'commit' ? 'committed' : 'aborted');
  assert.equal(result.gate.nativePuts, mode === 'commit' ? 1 : 0);
}

test('initial mount during a genuinely pending save uses confirmed provider progress, then observes commit', () => fixture(async page => {
  await hold(page);await mount(page);
  assert.equal(await count(page), 0);
  const first = await page.evaluate(() => (window as any).__savedTest.observations[0]);assert.equal(first.count, 0, 'first committed React render cannot inspect the provisional projection');
  await release(page, 'commit');await settled(page, 1);
  assert.deepEqual(await page.evaluate(() => (window as any).__savedTest.authority()), {completed:true,projectionCompleted:true});
}));

test('navigation remount during a pending save cannot manufacture completion and abort retains the confirmed zero', () => fixture(async page => {
  await mount(page);await page.evaluate(() => (window as any).__savedTest.drain());
  await page.evaluate(() => (window as any).__savedTest.unmount());await hold(page);await mount(page);
  assert.equal(await count(page), 0);await release(page, 'abort');await settled(page, 0);
  assert.deepEqual(await page.evaluate(() => (window as any).__savedTest.authority()), {completed:false,projectionCompleted:false});
  assert.ok((await page.evaluate(() => (window as any).__savedTest.stats())).observations.every((x: any) => x.count === 0));
}));

for (const mode of ['commit','abort'] as const) test(`synthetic window focus events wait for the durable ${mode} and coalesce repeated refreshes`, () => fixture(async page => {
  await mount(page);await page.evaluate(() => (window as any).__savedTest.drain());await hold(page);
  await page.evaluate(() => { for(let i=0;i<100;i++) dispatchEvent(new Event('focus')); });
  assert.equal(await count(page), 0);await release(page, mode);await settled(page, mode === 'commit' ? 1 : 0);
  await page.evaluate(() => (window as any).__savedTest.drain());
  const stats = await page.evaluate(() => (window as any).__savedTest.stats());
  assert.equal(stats.events.length, 100);assert.ok(stats.events.every((e: any) => e.trusted === false), 'these are explicitly synthetic window events');
  assert.ok(stats.transactions < 20, `100 events must not spawn an unbounded read queue: ${stats.transactions}`);
}));

for (const profile of ['synthetic-reader-A','synthetic-reader-B']) test(`pending read cannot publish old progress after ${profile.endsWith('A') ? 'same-profile epoch' : 'profile'} replacement`, () => fixture(async page => {
  await mount(page);await page.evaluate(() => (window as any).__savedTest.drain());await hold(page);
  await page.evaluate(() => dispatchEvent(new Event('focus')));
  await page.evaluate(profile => (window as any).__savedTest.scopeProps(profile,'synthetic-replacement-B'), profile);
  assert.equal(await count(page), 0, 'new scope renders its own confirmed provider seed');
  await release(page,'commit');await page.evaluate(() => (window as any).__savedTest.drain());
  assert.equal(await count(page), 0, 'a mismatched durable record must not populate the new scope');
  await page.evaluate(async () => { await (window as any).__savedTest.replaceDurable(); await (window as any).__savedTest.drain(); });
  await settled(page,0);
  const observations = (await page.evaluate(() => (window as any).__savedTest.stats())).observations;
  assert.ok(observations.filter((x: any) => x.epoch === 'synthetic-replacement-B').every((x: any) => x.count === 0));
}));

test('synthetic cloud account scope change fences pending old reads without requiring an online account for local progress', () => fixture(async page => {
  await mount(page);await page.evaluate(() => (window as any).__savedTest.drain());await hold(page);
  await page.evaluate(() => dispatchEvent(new Event('focus')));
  await page.evaluate(() => { (window as any).__savedTest.changeAccount('synthetic-cloud-B'); (window as any).__savedTest.scopeProps('synthetic-reader-B','account-B'); });
  assert.equal(await count(page),0);await release(page,'commit');await page.evaluate(() => (window as any).__savedTest.drain());assert.equal(await count(page),0);
  await page.evaluate(async () => { await (window as any).__savedTest.replaceDurable(); (window as any).__savedTest.changeAccount(null); await (window as any).__savedTest.drain(); });
  await settled(page,0);
  assert.ok((await page.evaluate(() => (window as any).__savedTest.stats())).observations.filter((x: any) => x.profile === 'synthetic-reader-B').every((x: any) => x.count === 0));
}));

test('expired guarded course notifications cannot bypass the pending-save boundary', () => fixture(async page => {
  await mount(page);await page.evaluate(() => (window as any).__savedTest.drain());await hold(page);
  await page.evaluate(() => (window as any).__savedTest.guardedNotification());assert.equal(await count(page),0);
  await release(page,'abort');assert.equal(await count(page),0);
}));

test('failed authoritative focus read retains confirmed progress and a later focus can recover', () => fixture(async page => {
  await hold(page);await release(page,'commit');
  const next = await page.evaluate(() => { const t=(window as any).__savedTest; return {...t.seed,courseProgress:JSON.parse(localStorage.getItem('one_decision_away_app_data_v1')!).courseProgress}; });
  await mount(page);await page.evaluate(next => (window as any).__savedTest.replaceProps(next), next);await settled(page,1);
  await page.evaluate(() => (window as any).__savedTest.drain());
  await page.evaluate(() => { (window as any).__savedTest.failNextRead(); dispatchEvent(new Event('focus')); });
  await page.evaluate(() => (window as any).__savedTest.drain());assert.equal(await count(page),1);
  await page.evaluate(() => dispatchEvent(new Event('focus')));await page.evaluate(() => (window as any).__savedTest.drain());assert.equal(await count(page),1);
}));

test('unmount cancels publication from a pending authoritative refresh', () => fixture(async page => {
  await mount(page);await page.evaluate(() => (window as any).__savedTest.drain());await hold(page);
  await page.evaluate(() => { dispatchEvent(new Event('focus')); (window as any).__savedTest.unmount(); });
  const before = (await page.evaluate(() => (window as any).__savedTest.stats())).observations.length;
  await release(page,'commit');await page.evaluate(() => (window as any).__savedTest.drain());
  assert.equal((await page.evaluate(() => (window as any).__savedTest.stats())).observations.length,before);
}));

test('a newer confirmed provider seed is visible even when its same-scope authoritative refresh fails', () => fixture(async page => {
  await mount(page);await page.evaluate(() => (window as any).__savedTest.drain());assert.equal(await count(page),0);
  await hold(page);await release(page,'commit');
  const next = await page.evaluate(() => { const t=(window as any).__savedTest; return {...t.seed,courseProgress:JSON.parse(localStorage.getItem('one_decision_away_app_data_v1')!).courseProgress}; });
  await page.evaluate(() => (window as any).__savedTest.failNextRead());
  await page.evaluate(next => (window as any).__savedTest.replaceProps(next),next);
  assert.equal(await count(page),1,'confirmed replacement must render before the failing refresh');
  await page.evaluate(() => (window as any).__savedTest.drain());assert.equal(await count(page),1);
}));
