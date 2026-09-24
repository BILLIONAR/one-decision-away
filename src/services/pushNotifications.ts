import { cloudSync } from './cloudSync';
import { t } from '../i18n';
import { getAppBase, publicAssetPath } from '../utils/routing';

export type PushTimes = Record<'morning' | 'lateMorning' | 'midday' | 'afternoon' | 'evening' | 'night', string>;
export type PushStatus = {
  supported: boolean;
  configured: boolean;
  signedIn: boolean;
  subscribed: boolean;
  permission: NotificationPermission | 'unsupported';
  reason?: string;
};

const ACTIVE_KEY = 'oda_push_subscription_v1';
const SLOTS = ['morning', 'lateMorning', 'midday', 'afternoon', 'evening', 'night'] as const;
const TABLE = 'oda_push_subscriptions';
const publicKey = () => String(import.meta.env?.VITE_VAPID_PUBLIC_KEY ?? '').trim();
type LocalSubscription = { project: string; userId: string; endpoint: string };

function readLocal(): LocalSubscription | null {
  try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null'); } catch { return null; }
}

function clearLocal() {
  localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new Event('oda:push-status'));
}

/** A confirmed subscription is active only for the currently signed-in member. */
export function isPushActive(): boolean {
  const local = readLocal();
  const config = cloudSync.getConfig();
  const session = cloudSync.getState().session;
  return Boolean(local && config && session && local.project === config.url && local.userId === session.user.id
    && typeof Notification !== 'undefined' && Notification.permission === 'granted');
}

function initialStatus(): PushStatus {
  const supported = globalThis.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const configured = Boolean(cloudSync.getConfig() && /^[A-Za-z0-9_-]{87,88}$/.test(publicKey()));
  const signedIn = Boolean(cloudSync.getState().session);
  return {
    supported, configured, signedIn, subscribed: isPushActive(),
    permission: supported ? Notification.permission : 'unsupported',
    reason: !supported
      ? t("This browser doesn't support background notifications. On iPhone/iPad, add the site to your Home Screen and open it from there.")
      : !configured ? t("The background notification server isn't set up yet.")
      : !signedIn ? t('Sign in to your account to get notifications while the site is closed.') : undefined,
  };
}

function authHeaders(): Record<string, string> {
  const config = cloudSync.getConfig();
  const session = cloudSync.getState().session;
  if (!config || !session) throw new Error(t('Sign in to your account to change notification settings.'));
  return { apikey: config.anonKey, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' };
}

async function rest(path: string, init: RequestInit = {}): Promise<Response> {
  const config = cloudSync.getConfig();
  if (!config) throw new Error(t("The background notification server isn't set up yet."));
  let response: Response;
  try {
    response = await fetch(`${config.url.replace(/\/$/, '')}/rest/v1/${path}`, {
      ...init, headers: { ...authHeaders(), ...init.headers }, signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(t("Couldn't reach the notification server. Check your connection and try again."));
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error(t('Your session needs refreshing. Sign out and sign in again.'));
    if (response.status === 404 || response.status === 400) {
      throw new Error(t("Background notifications aren't ready yet. The notification setup on the server needs to be completed."));
    }
    if (response.status === 403) throw new Error(t("Couldn't verify the notification registration for this account. Try signing in again."));
    throw new Error(t("Couldn't save the notification setting to the server. Try again."));
  }
  return response;
}

function validateTimes(times: PushTimes): PushTimes {
  const result = {} as PushTimes;
  for (const slot of SLOTS) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(times[slot] ?? '')) throw new Error(t('Choose a valid time for all six notifications.'));
    result[slot] = times[slot];
  }
  if (new Set(Object.values(result)).size !== SLOTS.length) throw new Error(t('Choose a different time for each of the six notifications.'));
  return result;
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const scope = new URL(getAppBase(), location.origin).href;
  const existing = await navigator.serviceWorker.getRegistration(scope);
  const registered = existing ?? await navigator.serviceWorker.register(publicAssetPath('sw.js'), { scope: getAppBase() });
  if (registered.active) return registered;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(t("The notification service couldn't start. Refresh the page and try again."))), 15000)),
  ]);
}

export async function getPushStatus(): Promise<PushStatus> {
  const status = initialStatus();
  if (!status.supported || !status.configured || !status.signedIn) return status;
  const owner = cloudSync.getState().session!.user.id;
  const project = cloudSync.getConfig()!.url;
  try {
    const reg = await navigator.serviceWorker.getRegistration(new URL(getAppBase(), location.origin).href);
    const subscription = await reg?.pushManager?.getSubscription();
    if (!subscription || Notification.permission !== 'granted') {
      if (readLocal()) clearLocal();
      return { ...status, subscribed: false };
    }
    const query = new URLSearchParams({ select: 'endpoint,enabled', endpoint: `eq.${subscription.endpoint}`, limit: '1' });
    const response = await rest(`${TABLE}?${query}`);
    const rows = await response.json();
    if (cloudSync.getState().session?.user.id !== owner || cloudSync.getConfig()?.url !== project) return initialStatus();
    const subscribed = Boolean(rows[0]?.enabled);
    if (subscribed) {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify({ project, userId: owner, endpoint: subscription.endpoint }));
    } else clearLocal();
    return { ...status, subscribed };
  } catch (error) {
    return { ...status, reason: error instanceof Error ? error.message : t("Couldn't verify notification status.") };
  }
}

/** Call only from a member's explicit button click: this requests OS permission. */
export async function enablePush(times: PushTimes, locale: string): Promise<PushStatus> {
  const status = initialStatus();
  if (!status.supported || !status.configured || !status.signedIn) throw new Error(status.reason);
  const schedule = validateTimes(times);
  const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
  if (permission !== 'granted') throw new Error(t("Notification permission wasn't granted. You can allow it in your browser's site settings."));
  const reg = await registration();
  let subscription = await reg.pushManager.getSubscription();
  const previous = readLocal();
  const owner = cloudSync.getState().session!.user.id;
  const project = cloudSync.getConfig()!.url;
  // A shared browser must not reuse a different member's endpoint.
  if (subscription && (!previous || previous.userId !== owner || previous.project !== project)) {
    if (!await subscription.unsubscribe()) throw new Error(t("Couldn't close the previous device subscription. Refresh the page and try again."));
    subscription = null;
    clearLocal();
  }
  let created = false;
  if (!subscription) {
    const decoded = atob(publicKey().replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(publicKey().length / 4) * 4, '='));
    const applicationServerKey = Uint8Array.from(decoded, character => character.charCodeAt(0));
    subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    created = true;
  }
  const json = subscription.toJSON();
  try {
    await rest(`${TABLE}?on_conflict=endpoint`, {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        user_id: owner, endpoint: subscription.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', locale: locale === 'tr' ? 'tr' : 'en',
        times: schedule, enabled: true,
      }),
    });
  } catch (error) {
    if (created) await subscription.unsubscribe().catch(() => undefined);
    throw error;
  }
  if (cloudSync.getState().session?.user.id !== owner || cloudSync.getConfig()?.url !== project) {
    await subscription.unsubscribe().catch(() => undefined);
    clearLocal();
    throw new Error(t("The signed-in account changed. Turn notifications on again from the account you're using."));
  }
  localStorage.setItem(ACTIVE_KEY, JSON.stringify({ project, userId: owner, endpoint: subscription.endpoint }));
  window.dispatchEvent(new Event('oda:push-status'));
  return { ...status, permission: 'granted', subscribed: true, reason: undefined };
}

/** Browser unsubscribe stops delivery even if the server is temporarily offline. */
export async function disablePush(): Promise<void> {
  const local = readLocal();
  const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration(new URL(getAppBase(), location.origin).href) : undefined;
  const subscription = await reg?.pushManager?.getSubscription();
  const endpoint = subscription?.endpoint ?? local?.endpoint;
  let serverError: unknown;
  let serverStopped = !endpoint;
  if (endpoint && cloudSync.getState().session && cloudSync.getConfig()) {
    try { await rest(`${TABLE}?${new URLSearchParams({ endpoint: `eq.${endpoint}` })}`, { method: 'DELETE' }); serverStopped = true; }
    catch (error) { serverError = error; }
  }
  let browserStopped = !subscription;
  if (subscription) {
    try { browserStopped = await subscription.unsubscribe(); } catch { browserStopped = false; }
  }
  if (!browserStopped && !serverStopped) throw new Error(t("Notifications couldn't be stopped yet. Check your connection or turn off notification permission in your browser's site settings."));
  clearLocal();
  if (serverError) throw new Error(t("Notifications are off on this device, but the server record couldn't be cleared. Try turning them off again when you're back online."));
  if (!browserStopped) throw new Error(t("Server notifications are off, but the browser subscription couldn't be removed. Refresh the page and try again."));
}

/** Updates an already opted-in device; never requests permission or subscribes. */
export async function syncPushPreferences(times: PushTimes, locale: string): Promise<void> {
  if (!isPushActive()) return;
  const local = readLocal()!;
  await rest(`${TABLE}?${new URLSearchParams({ endpoint: `eq.${local.endpoint}` })}`, {
    method: 'PATCH', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ times: validateTimes(times), locale: locale === 'tr' ? 'tr' : 'en', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' }),
  }).then(async response => {
    if (!(await response.json()).length) { clearLocal(); throw new Error(t("The server subscription wasn't found. Turn background notifications on again.")); }
  });
}
