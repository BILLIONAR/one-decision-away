import { t } from '../i18n';
/** Local inference only. The model download starts exclusively in initialize(). */
export const COACH_MODEL = {
  id: 'Qwen3.5-2B-q4f16_1-MLC',
  name: 'Qwen3.5 · cihazında çalışan yapay zekâ',
  downloadNote: 'İlk açılışta yaklaşık 1,1 GB model indirilir; hazırlık birkaç dakika sürebilir. Uyumlu bir tarayıcı ve yaklaşık 3 GB boş cihaz belleği gerekir. Sonraki açılışlarda tarayıcı önbelleği kullanılır.',
  privacyNote: 'Mesajların bu cihazda işlenir; bir yapay zekâ sunucusuna gönderilmez. Model dosyaları Hugging Face ve MLC üzerinden indirilir.',
} as const;

export const MAX_COACH_MESSAGE_LENGTH = 1500;
const MAX_HISTORY_CHARACTERS = 4400;
const MAX_HISTORY_MESSAGES = 14;

export type CoachMessage = { role: 'user' | 'assistant'; content: string };
export type CoachProgress = { progress: number; text: string };
export type CoachAvailability = { supported: boolean; reason?: string; modelId?: string };

const SYSTEM_PROMPT = `You are ODA Coach, an AI companion for everyday decisions, motivation and habits. Answer in the user's language; use natural Turkish when they write Turkish. Pay attention to the latest message and earlier turns. Be warm, clear and specific. Usually write 2–4 short sentences, without headings, numbered lists or emojis. Understand the person's actual concern, then suggest one small feasible action. Ask at most one relevant question when you need context. Do not merely repeat the user's words, recite slogans or promise success. Do not claim the user's experiences as your own. When drafting words they can say, clearly label them as an example. Respect their choices; never shame them.
Discuss fear, uncertainty, procrastination, hope, focus and gratitude. If requested, discuss faith, prayer and trust respectfully without assuming the user's beliefs. Never invent quotations or attribute unverified words to scripture, prophets, scientists or thinkers. Use energy to mean everyday vitality, never supernatural guarantees. Admit uncertainty.
You are not a human, therapist or religious authority. Do not diagnose or recommend medicine or treatment. If the person expresses imminent danger or intent to harm themselves, prioritize immediate human support and local emergency services (112 in Turkey). Ordinary worry does not by itself mean a crisis. Do not reveal internal reasoning.
Türkçe konuşurken karşıdaki kişiye "sen" diye hitap et. Kendi korkularından söz etme. Sade, düzgün Türkçe kullan. Her mesajı yeni bir konuya çekmeden önceki konuşmaya bağla. Önceki yanıtını tekrar etme. /no_think`;

type PromptMessage = { role: 'system' | CoachMessage['role']; content: string };
type StreamChunk = { choices: Array<{ delta: { content?: string | null } }> };
type StreamRequest = {
  messages: PromptMessage[];
  stream: true;
  temperature: number;
  top_p: number;
  max_tokens: number;
  repetition_penalty: number;
  extra_body: { enable_thinking: false };
};

/** Small boundary permits lifecycle tests without downloading a language model. */
export type CoachRuntime = {
  load(modelId: string): Promise<void>;
  generate(request: StreamRequest): Promise<AsyncIterable<StreamChunk>>;
  interrupt(): Promise<void>;
  reset(): Promise<void>;
  dispose(): void;
  failure: Promise<never>;
};

type CoachDependencies = {
  checkAvailability?: () => Promise<CoachAvailability>;
  createRuntime?: (onProgress: (progress: CoachProgress) => void) => Promise<CoachRuntime>;
};

export class CoachError extends Error {
  constructor(public readonly code: 'unsupported' | 'not-ready' | 'busy' | 'input' | 'network' | 'memory' | 'runtime', message: string) {
    super(message);
    this.name = 'CoachError';
  }
}

const abortError = () => new DOMException(t('The operation was stopped.'), 'AbortError');
const isAbort = (error: unknown) => error instanceof Error && error.name === 'AbortError';

export function coachErrorMessage(error: unknown): string {
  if (error instanceof CoachError) return error.message;
  const detail = String(error instanceof Error ? error.message : error).toLowerCase();
  if (/memory|out of|allocation|buffer size|device.?lost|gpu device/.test(detail)) {
    return t("Your device couldn't free up enough memory for the AI. Close other tabs and try restarting the coach.");
  }
  if (/fetch|network|offline|download|cache|quota|storage/.test(detail)) {
    return t("The model files couldn't be loaded. Check your internet connection and your browser's free storage, then try again.");
  }
  if (/webgpu|adapter|shader-f16/.test(detail)) {
    return t("This browser or device doesn't support the AI engine. Try again in an up-to-date browser with WebGPU support.");
  }
  return t("The AI couldn't finish its reply. Restart the coach and try again.");
}

/** Checks capabilities only; never imports WebLLM or downloads model weights. */
export async function getCoachAvailability(): Promise<CoachAvailability> {
  if (typeof navigator === 'undefined' || typeof Worker === 'undefined') {
    return { supported: false, reason: t('The live coach needs an up-to-date browser with WebGPU support.') };
  }
  if (!globalThis.isSecureContext) {
    return { supported: false, reason: t("Open the live coach from the site's secure HTTPS address.") };
  }
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ features: { has(feature: string): boolean } } | null> } }).gpu;
  if (!gpu) return { supported: false, reason: t("WebGPU isn't available in this browser. Try again with an up-to-date Chrome or Edge.") };
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) return { supported: false, reason: t("Couldn't access the graphics card. Turn on hardware acceleration in your browser and try again.") };
    return {
      supported: true,
      modelId: adapter.features.has('shader-f16') ? COACH_MODEL.id : 'Qwen3.5-2B-q4f32_1-MLC',
    };
  } catch {
    return { supported: false, reason: t("The browser couldn't access the graphics card. Try another up-to-date browser with WebGPU support.") };
  }
}

const VOICE_NOTE = 'Sound like ODA: a warm friend who believes in the person. No guilt, no pressure, no streak threats, no fake urgency.';
let coachFocus: string | null = null;
/** Who the member said they want to become at sign-up (English label), or null. */
export function setCoachFocus(focus: string | null) { coachFocus = focus?.trim().slice(0, 120) || null; }

function systemPrompt(): string {
  const focus = coachFocus ? ` At sign-up the person said who they want to become: "${coachFocus}". Keep it in mind when suggesting a small action, but follow what they write now.` : '';
  return `${SYSTEM_PROMPT}\n${VOICE_NOTE}${focus}`;
}

/** Keep recent complete turns within the model's 4096-token context budget. */
export function prepareCoachMessages(messages: readonly CoachMessage[]): PromptMessage[] {
  const clean: CoachMessage[] = [];
  for (const message of messages) {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') continue;
    const content = message.content.trim();
    if (!content) continue;
    const bounded = content.slice(0, MAX_COACH_MESSAGE_LENGTH);
    const previous = clean.at(-1);
    if (previous?.role === message.role) {
      previous.content = `${previous.content}\n${bounded}`.slice(-MAX_COACH_MESSAGE_LENGTH);
    } else {
      clean.push({ role: message.role, content: bounded });
    }
  }
  if (clean.at(-1)?.role !== 'user') throw new CoachError('input', t('Write a message to send to the coach.'));
  const recent = clean.slice(-MAX_HISTORY_MESSAGES);
  let size = recent.reduce((sum, message) => sum + message.content.length, 0);
  while (recent.length > 1 && (size > MAX_HISTORY_CHARACTERS || recent[0].role !== 'user')) {
    size -= recent.shift()!.content.length;
  }
  return [{ role: 'system', content: systemPrompt() }, ...recent];
}

function visibleReply(raw: string): string {
  return raw.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '').replace(/<\/?(?:think)?$/i, '').trimStart();
}

function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const abort = () => reject(abortError());
    signal.addEventListener('abort', abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

function forwardAbort(source: AbortSignal | undefined, target: AbortController): () => void {
  const abort = () => target.abort();
  if (source?.aborted) abort();
  else source?.addEventListener('abort', abort, { once: true });
  return () => source?.removeEventListener('abort', abort);
}

async function createBrowserRuntime(onProgress: (progress: CoachProgress) => void): Promise<CoachRuntime> {
  const { WebWorkerMLCEngine, prebuiltAppConfig } = await import('@mlc-ai/web-llm');
  const worker = new Worker(new URL('./aiCoach.worker.ts', import.meta.url), { type: 'module' });
  let fail: (error: Error) => void;
  const failure = new Promise<never>((_resolve, reject) => { fail = reject; });
  // A worker can fail while idle; retain the rejection for the next operation.
  void failure.catch(() => undefined);
  const workerError = () => fail(new CoachError('runtime', t('The AI engine stopped. Restart the coach and try again.')));
  worker.addEventListener('error', workerError);
  worker.addEventListener('messageerror', workerError);
  const engine = new WebWorkerMLCEngine(worker, {
    // IndexedDB uses fetch + storage rather than Cache.add, which can fail
    // during large model downloads in otherwise supported browsers.
    appConfig: { ...prebuiltAppConfig, cacheBackend: 'indexeddb' },
    logLevel: 'ERROR',
    initProgressCallback: report => {
      const progress = Math.max(0, Math.min(1, Number.isFinite(report.progress) ? report.progress : 0));
      onProgress({ progress, text: progress >= 1 ? t('Model ready.') : t('Downloading and preparing the model · {percent}%', { percent: Math.round(progress * 100) }) });
    },
  });
  return {
    load: modelId => engine.reload(modelId, {
      context_window_size: 4096,
      // Qwen3.5's tokenizer uses new end-of-text/end-of-turn IDs. The MLC
      // model config still carries Qwen3 IDs, which could truncate replies.
      conv_config: { stop_token_ids: [248044, 248046] },
    }),
    generate: request => engine.chat.completions.create(request),
    interrupt: async () => { engine.interruptGenerate(); },
    reset: () => engine.resetChat(),
    failure,
    dispose: () => {
      worker.removeEventListener('error', workerError);
      worker.removeEventListener('messageerror', workerError);
      worker.terminate();
      fail(abortError());
    },
  };
}

export function createAICoach(dependencies: CoachDependencies = {}) {
  const checkAvailability = dependencies.checkAvailability ?? getCoachAvailability;
  const makeRuntime = dependencies.createRuntime ?? createBrowserRuntime;
  let runtime: CoachRuntime | null = null;
  let ready = false;
  let loading: Promise<void> | null = null;
  let generating: Promise<string> | null = null;
  let controller: AbortController | null = null;

  const dispose = () => {
    ready = false;
    runtime?.dispose();
    runtime = null;
  };

  const initialize = (onProgress: (progress: CoachProgress) => void = () => undefined, signal?: AbortSignal): Promise<void> => {
    if (ready) return Promise.resolve();
    if (loading) return loading;
    const operation = new AbortController();
    controller = operation;
    const unlink = forwardAbort(signal, operation);
    loading = (async () => {
      try {
        onProgress({ progress: 0, text: t('Checking device compatibility…') });
        const availability = await abortable(checkAvailability(), operation.signal);
        if (!availability.supported) throw new CoachError('unsupported', availability.reason ?? t("The live coach isn't supported on this device."));
        const created = makeRuntime(progress => { if (!operation.signal.aborted) onProgress(progress); }).then(value => {
          if (operation.signal.aborted) { value.dispose(); throw abortError(); }
          return value;
        });
        runtime = await abortable(created, operation.signal);
        await abortable(Promise.race([runtime.load(availability.modelId ?? COACH_MODEL.id), runtime.failure]), operation.signal);
        if (operation.signal.aborted) throw abortError();
        ready = true;
        onProgress({ progress: 1, text: t('The coach is ready. You can start talking.') });
      } catch (error) {
        dispose();
        if (isAbort(error)) throw error;
        if (!(error instanceof CoachError)) console.warn('[ODA Coach] Model initialization failed:', error);
        throw error instanceof CoachError ? error : new CoachError('runtime', coachErrorMessage(error));
      } finally {
        unlink();
        if (controller === operation) controller = null;
        loading = null;
      }
    })();
    return loading;
  };

  /** onText receives the accumulated visible reply, not a token delta. */
  const stream = (messages: readonly CoachMessage[], onText: (fullText: string) => void, signal?: AbortSignal): Promise<string> => {
    if (!ready || !runtime) return Promise.reject(new CoachError('not-ready', t('Start the live coach first.')));
    if (generating) return Promise.reject(new CoachError('busy', t('Wait for the previous reply to finish or stop it.')));
    let prompt: PromptMessage[];
    try { prompt = prepareCoachMessages(messages); } catch (error) { return Promise.reject(error); }
    const activeRuntime = runtime;
    const operation = new AbortController();
    controller = operation;
    const unlink = forwardAbort(signal, operation);
    const interrupt = () => { void activeRuntime.interrupt().catch(() => undefined); };
    operation.signal.addEventListener('abort', interrupt, { once: true });
    generating = (async () => {
      let iterator: AsyncIterator<StreamChunk> | undefined;
      try {
        if (operation.signal.aborted) throw abortError();
        const chunks = await abortable(Promise.race([activeRuntime.generate({
          messages: prompt, stream: true, temperature: 0.7, top_p: 0.8,
          max_tokens: 384, repetition_penalty: 1.08, extra_body: { enable_thinking: false },
        }), activeRuntime.failure]), operation.signal);
        iterator = chunks[Symbol.asyncIterator]();
        let raw = '';
        let visible = '';
        while (true) {
          const next = await abortable(Promise.race([iterator.next(), activeRuntime.failure]), operation.signal);
          if (next.done) break;
          raw += next.value.choices[0]?.delta.content ?? '';
          const updated = visibleReply(raw);
          if (updated !== visible) { visible = updated; onText(visible); }
        }
        if (!visible.trim()) throw new CoachError('runtime', t("The coach couldn't create a reply this time. You can send your message again."));
        return visible.trim();
      } catch (error) {
        if (isAbort(error)) {
          // Drive the worker iterator to completion so its generation lock is released.
          // If the GPU stalls, terminate the worker instead of leaving the UI locked.
          let timer: ReturnType<typeof setTimeout> | undefined;
          const drain = async () => {
            await activeRuntime.interrupt();
            if (!iterator) throw abortError();
            while (!(await iterator.next()).done) { /* discard cancelled tokens */ }
          };
          try {
            await Promise.race([drain(), activeRuntime.failure, new Promise<never>((_, reject) => {
              timer = setTimeout(() => reject(abortError()), 3000);
            })]);
          } catch {
            if (runtime === activeRuntime) dispose();
          } finally { clearTimeout(timer); }
          throw abortError();
        }
        if (runtime === activeRuntime) dispose();
        if (!(error instanceof CoachError)) console.warn('[ODA Coach] Generation failed:', error);
        throw error instanceof CoachError ? error : new CoachError('runtime', coachErrorMessage(error));
      } finally {
        unlink();
        operation.signal.removeEventListener('abort', interrupt);
        if (controller === operation) controller = null;
        generating = null;
      }
    })();
    return generating;
  };

  return {
    get isReady() { return ready; },
    initialize,
    stream,
    cancel() { controller?.abort(); },
    async reset() {
      controller?.abort();
      await generating?.catch(() => undefined);
      await loading?.catch(() => undefined);
      if (ready && runtime) {
        try { await Promise.race([runtime.reset(), runtime.failure]); }
        catch (error) { dispose(); throw new CoachError('runtime', coachErrorMessage(error)); }
      }
    },
    async unload() {
      controller?.abort();
      dispose();
      await Promise.allSettled([loading, generating]);
    },
  };
}
