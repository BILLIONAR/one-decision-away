import type { TestContext } from 'node:test';
import { SoundSynthesizer, soundSynthesizer } from '../../src/utils/soundSynthesizer';

type Automation = { type: 'set' | 'linear' | 'target'; time: number; value: number; constant?: number };
export function soundSynthesizerFixture(t: TestContext) {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const contexts: FakeContext[] = [];
  const timers = new Map<number, { callback: () => void; at: number; interval?: number }>();
  const engines: SoundSynthesizer[] = [];
  let timeMs = 0, timerId = 0;
  t.mock.method(Date, 'now', () => 1_700_000_000_000 + timeMs);
  t.mock.method(globalThis, 'clearTimeout', (id: number) => { timers.delete(Number(id)); });
  t.mock.method(globalThis, 'clearInterval', (id: number) => { timers.delete(Number(id)); });

  class FakeParam {
    events: Automation[] = [];
    constructor(private ctx: FakeContext) {}
    get value() { return this.at(this.ctx.currentTime); }
    at(time: number) {
      let value = 1, cursor = 0, previous: Automation | undefined;
      for (const event of this.events) {
        if (event.time > time) {
          if (event.type === 'linear') return value + (event.value - value) * Math.max(0, time - cursor) / (event.time - cursor);
          return previous?.type === 'target' ? previous.value + (value - previous.value) * Math.exp(-(time - cursor) / previous.constant!) : value;
        }
        if (previous?.type === 'target') value = previous.value + (value - previous.value) * Math.exp(-(event.time - cursor) / previous.constant!);
        if (event.type !== 'target') value = event.value;
        cursor = event.time; previous = event;
      }
      return previous?.type === 'target' ? previous.value + (value - previous.value) * Math.exp(-(time - cursor) / previous.constant!) : value;
    }
    setValueAtTime(value: number, time: number) { this.events.push({ type: 'set', value, time }); this.events.sort((a,b) => a.time - b.time); }
    linearRampToValueAtTime(value: number, time: number) { this.events.push({ type: 'linear', value, time }); this.events.sort((a,b) => a.time - b.time); }
    exponentialRampToValueAtTime(value: number, time: number) { this.linearRampToValueAtTime(value, time); }
    setTargetAtTime(value: number, time: number, constant: number) { this.events.push({ type: 'target', value, time, constant }); this.events.sort((a,b) => a.time - b.time); }
    cancelScheduledValues(time: number) { this.events = this.events.filter(event => event.time < time); }
    cancelAndHoldAtTime(time: number) { const value = this.at(time); this.cancelScheduledValues(time); this.setValueAtTime(value, time); }
  }
  class FakeNode {
    connections: unknown[] = [];
    disconnected = false;
    gain: FakeParam;
    frequency: FakeParam;
    Q: FakeParam;
    type = 'sine';
    buffer: { numberOfChannels: number; length: number } | null = null;
    loop = false;
    starts = 0;
    stops: (number | undefined)[] = [];
    onended: (() => void) | null = null;
    private endTimer: number | null = null;
    constructor(private ctx: FakeContext) { this.gain = new FakeParam(ctx); this.frequency = new FakeParam(ctx); this.Q = new FakeParam(ctx); }
    connect(destination: unknown) { this.connections.push(destination); }
    disconnect() { this.disconnected = true; this.connections = []; }
    start() { this.starts++; }
    stop(time?: number) {
      this.stops.push(time);
      if (this.endTimer !== null) timers.delete(this.endTimer);
      this.endTimer = null;
      if (time !== undefined && time > this.ctx.currentTime) {
        const id = ++timerId;
        this.endTimer = id;
        timers.set(id, { at: time * 1000, callback: () => { this.endTimer = null; this.onended?.(); } });
      } else this.onended?.();
    }
  }
  class FakeContext {
    state = 'running';
    currentTime = 0;
    sampleRate = 8000;
    destination = {};
    gains: FakeNode[] = [];
    sources: FakeNode[] = [];
    nodes: FakeNode[] = [];
    constructor() { contexts.push(this); }
    createNode() { const node = new FakeNode(this); this.nodes.push(node); return node; }
    createGain() { const node = this.createNode(); this.gains.push(node); return node; }
    createBufferSource() { const node = this.createNode(); this.sources.push(node); return node; }
    createOscillator() { return this.createBufferSource(); }
    createBiquadFilter() { return this.createNode(); }
    createChannelMerger() { return this.createNode(); }
    createBuffer(numberOfChannels: number, length: number) {
      const channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
      return { numberOfChannels, length, getChannelData: (channel: number) => channels[channel] };
    }
    async resume() { this.state = 'running'; }
  }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    AudioContext: FakeContext,
    setTimeout: (callback: () => void, delay: number) => { const id = ++timerId; timers.set(id, { callback, at: timeMs + delay }); return id; },
    setInterval: (callback: () => void, delay: number) => { const id = ++timerId; timers.set(id, { callback, at: timeMs + delay, interval: delay }); return id; },
  }});
  function advance(seconds: number) {
    const end = timeMs + seconds * 1000;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a,b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, timer] = next;
      timeMs = timer.at; contexts.forEach(ctx => { ctx.currentTime = timeMs / 1000; });
      if (timer.interval) timer.at += timer.interval; else timers.delete(id);
      timer.callback();
    }
    timeMs = end; contexts.forEach(ctx => { ctx.currentTime = timeMs / 1000; });
  }
  t.after(() => {
    engines.forEach(engine => engine.stopAmbient());
    soundSynthesizer.stopAmbient();
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else Reflect.deleteProperty(globalThis, 'window');
  });
  return { contexts, timers, advance, engine: () => { const engine = new SoundSynthesizer(); engines.push(engine); return engine; } };
}

