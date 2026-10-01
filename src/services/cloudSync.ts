import { getAppBase } from '../utils/routing';
/**
 * CloudSync — optional Supabase-backed backup & sync of the whole UserData document.
 * Works only when a Supabase URL + anon key are configured (env or Settings);
 * otherwise the app keeps running purely on localStorage.
 */
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { UserData } from '../types/models';
import { t } from '../i18n';
import { createBackupSnapshot, prepareBackupRestore } from './backup';
import { APP_DATA_STORAGE_KEY } from './storageKeys';
import { REPLACEMENT_EPOCH_KEY } from './dataSnapshots';

const CFG_KEY = 'oda_cloud_cfg';
const LAST_SYNC_KEY = 'oda_cloud_last_sync';
const LOCAL_SYNC_SCOPE_KEY = `${LAST_SYNC_KEY}:local_scope`;
const PENDING_RESTORE_KEY = 'oda_cloud_pending_restore';
const UNBOUND_RESTORE_KEY = `${PENDING_RESTORE_KEY}:unbound`;
const TABLE = 'oda_user_data';

interface CloudConfig {
  url: string;
  anonKey: string;
}

type Listener = (state: CloudState) => void;
export interface CloudState {
  configured: boolean;
  session: Session | null;
  lastSyncAt: string | null;
  syncing: boolean;
  error: string | null;
  scopeRevision: number;
}

class CloudSync {
  private client: SupabaseClient | null = null;
  private config: CloudConfig | null = null;
  private session: Session | null = null;
  private pushTimer: number | null = null;
  private listeners = new Set<Listener>();
  private syncing = false;
  private error: string | null = null;
  private initialized = false;
  private pushQueue: Promise<boolean> = Promise.resolve(false);
  private scopeRevision = 0;
  private authSubscription: { unsubscribe: () => void } | null = null;
  private pendingPulls = new WeakMap<UserData, { updatedAt: string; userId: string; projectUrl: string; client: SupabaseClient; revision: number; restoreScope: string; localRecord: string | null }>();

  private setSession(session: Session | null): void {
    if (this.session?.user.id !== session?.user.id) {
      this.scopeRevision += 1;
      this.syncing = false;
      this.error = null;
    }
    this.session = session;
  }

  /** Token refreshes retain a scope; signing out, changing accounts or projects expires it. */
  public currentAccountGuard(): () => boolean {
    const userId = this.session?.user.id;
    const projectUrl = this.config?.url;
    const client = this.client;
    const revision = this.scopeRevision;
    return () => !!userId && !!projectUrl && this.session?.user.id === userId && this.config?.url === projectUrl
      && this.client === client && this.scopeRevision === revision;
  }

  /** Keep an asynchronous user action bound to its original account and local snapshot. */
  public currentOperationGuard(): () => boolean {
    const current = this.currentAccountGuard();
    const localRecord = localStorage.getItem(APP_DATA_STORAGE_KEY);
    return () => current() && localStorage.getItem(APP_DATA_STORAGE_KEY) === localRecord;
  }

  private syncKey(projectUrl: string, userId: string): string {
    return `${LAST_SYNC_KEY}:${encodeURIComponent(projectUrl)}:${userId}`;
  }

  private localEpoch(raw: string | null): string | null | undefined {
    if (!raw) return undefined;
    try {
      const record = JSON.parse(raw);
      if (!record || typeof record !== 'object' || Array.isArray(record)) return undefined;
      const epoch = record[REPLACEMENT_EPOCH_KEY];
      return epoch === undefined ? null : typeof epoch === 'string' ? epoch : undefined;
    } catch { return undefined; }
  }

  private markLocalSyncScope(key: string, raw: string | null, updatedAt: string): void {
    const epoch = this.localEpoch(raw);
    if (epoch !== undefined) localStorage.setItem(LOCAL_SYNC_SCOPE_KEY, JSON.stringify({ key, epoch, updatedAt }));
  }

  private lastSyncAt(): string | null {
    if (!this.config || !this.session) return null;
    const key = this.syncKey(this.config.url, this.session.user.id);
    // Returning to A after B synchronized cannot use A's historical timestamp
    // as evidence that the current device document still belongs to A.
    try {
      const owner = JSON.parse(localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) || 'null');
      const epoch = this.localEpoch(localStorage.getItem(APP_DATA_STORAGE_KEY));
      const updatedAt = localStorage.getItem(key);
      return epoch !== undefined && owner?.key === key && owner.epoch === epoch && owner.updatedAt === updatedAt ? updatedAt : null;
    } catch { return null; }
  }

  constructor() {
    this.config = this.readConfig();
  }

  private readConfig(): CloudConfig | null {
    const envUrl = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
    const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;
    try {
      const saved = localStorage.getItem(CFG_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.url && p.anonKey) return { url: p.url, anonKey: p.anonKey };
      }
    } catch {
      /* ignore */
    }
    if (envUrl && envKey) return { url: envUrl, anonKey: envKey };
    return null;
  }

  public getConfig(): CloudConfig | null {
    return this.config;
  }

  public setConfig(url: string, anonKey: string) {
    const u = url.trim().replace(/\/$/, '');
    const k = anonKey.trim();
    if (!u || !k) {
      localStorage.removeItem(CFG_KEY);
      this.config = this.readConfig();
    } else {
      localStorage.setItem(CFG_KEY, JSON.stringify({ url: u, anonKey: k }));
      this.config = { url: u, anonKey: k };
    }
    this.scopeRevision += 1;
    this.authSubscription?.unsubscribe();
    this.authSubscription = null;
    this.setSession(null);
    this.client = null;
    this.syncing = false;
    this.error = null;
    this.initialized = false;
    this.emit();
  }

  public isConfigured(): boolean {
    return !!this.config;
  }

  private async getClient(): Promise<SupabaseClient | null> {
    if (!this.config) return null;
    if (this.client) return this.client;
    const config = this.config;
    const { createClient } = await import('@supabase/supabase-js');
    if (this.config !== config) return null;
    this.client = createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return this.client;
  }

  /** Restores an existing session (call once on app start). */
  public async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    const config = this.config;
    const revision = this.scopeRevision;
    const client = await this.getClient();
    if (!client) return;
    try {
      const { data } = await client.auth.getSession();
      if (this.config !== config || this.client !== client || this.scopeRevision !== revision) return;
      this.setSession(data.session);
      const { data: { subscription } } = client.auth.onAuthStateChange((_evt, session) => {
        if (this.config !== config || this.client !== client) return;
        this.setSession(session);
        this.emit();
      });
      this.authSubscription = subscription;
    } catch (e) {
      this.error = (e as Error).message;
    }
    this.emit();
  }

  public getState(): CloudState {
    return {
      configured: this.isConfigured(),
      session: this.session,
      lastSyncAt: this.lastSyncAt(),
      syncing: this.syncing,
      error: this.error,
      scopeRevision: this.scopeRevision,
    };
  }

  public subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  private emit() {
    const st = this.getState();
    this.listeners.forEach((l) => l(st));
  }

  public isSignedIn(): boolean {
    return !!this.session;
  }

  private restoreScope(): string {
    if (!this.config || !this.session) return UNBOUND_RESTORE_KEY;
    const scope = `${PENDING_RESTORE_KEY}:${encodeURIComponent(this.config.url)}:${this.session.user.id}`;
    // An offline import follows the first subsequent connected account. Once bound,
    // it remains isolated from any other account or project on this device.
    const unbound = localStorage.getItem(UNBOUND_RESTORE_KEY);
    if (unbound) {
      localStorage.setItem(scope, unbound);
      localStorage.removeItem(UNBOUND_RESTORE_KEY);
    }
    return scope;
  }

  /** An explicit local import wins until it has been uploaded to this account/project. */
  public markLocalRestore(): void {
    if (this.pushTimer) window.clearTimeout(this.pushTimer);
    this.pushTimer = null;
    localStorage.setItem(this.restoreScope(), globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  }

  public async signInWithEmail(email: string): Promise<{ ok: boolean; message: string }> {
    const client = await this.getClient();
    if (!client) return { ok: false, message: t('Cloud sync is not configured.') };
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: new URL(getAppBase(), window.location.origin).href },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: t('Magic link sent — check your inbox and open it on this device.') };
  }

  /** Signs in with the 6-digit code from the same email (the iPhone app cannot open web links). */
  public async verifyEmailCode(email: string, code: string): Promise<{ ok: boolean; message?: string }> {
    const client = await this.getClient();
    if (!client) return { ok: false, message: t('Cloud sync is not configured.') };
    const { error } = await client.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    if (error) return { ok: false, message: t('That code didn’t work. Check it or send a new email.') };
    return { ok: true };
  }

  public async signOut() {
    const current = this.currentAccountGuard();
    const client = await this.getClient();
    if (!client || !current()) return;
    await client.auth.signOut();
    if (!current()) return;
    this.setSession(null);
    this.emit();
  }

  /**
   * Permanently deletes the signed-in account and its cloud data through the
   * delete-account edge function, then signs out. Data on this device stays.
   */
  public async deleteAccount(): Promise<{ ok: boolean; message?: string }> {
    const current = this.currentAccountGuard();
    const session = this.session;
    const client = await this.getClient();
    if (!client || !session || !current()) return { ok: false, message: t('You are not signed in.') };
    if (this.pushTimer) window.clearTimeout(this.pushTimer);
    this.pushTimer = null;
    const { error } = await client.functions.invoke('delete-account', {
      method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) return { ok: false, message: t('We couldn’t delete your account. Check your connection and try again.') };
    // The original account was deleted, but a newer connection belongs to its own member.
    if (!current()) return { ok: true };
    try { await client.auth.signOut({ scope: 'local' }); } catch { /* the user no longer exists */ }
    if (!current()) return { ok: true };
    this.setSession(null);
    this.emit();
    return { ok: true };
  }

  /** Debounced push after local saves. */
  public schedulePush(data: UserData) {
    if (!this.session) return;
    if (this.pushTimer) window.clearTimeout(this.pushTimer);
    const current = this.currentOperationGuard();
    this.pushTimer = window.setTimeout(() => { if (current()) void this.push(data); }, 3000);
  }

  public async push(data: UserData): Promise<boolean> {
    const snapshot = createBackupSnapshot(data);
    const localRecord = localStorage.getItem(APP_DATA_STORAGE_KEY);
    // Capture account and restore identity now: an older queued upload cannot clear a newer import.
    const userId = this.session?.user.id;
    const projectUrl = this.config?.url;
    const revision = this.scopeRevision;
    const client = this.client;
    const restoreScope = this.restoreScope();
    const restoreToken = localStorage.getItem(restoreScope);
    const run = async () => {
      if (!userId || !projectUrl || this.session?.user.id !== userId || this.config?.url !== projectUrl
        || this.scopeRevision !== revision || this.client !== client || localStorage.getItem(APP_DATA_STORAGE_KEY) !== localRecord) return false;
      return this.pushSnapshot(snapshot, userId, projectUrl, revision, restoreScope, restoreToken, localRecord);
    };
    const result = this.pushQueue.then(run, run);
    this.pushQueue = result;
    return result;
  }

  private async pushSnapshot(data: UserData, userId: string, projectUrl: string, revision: number, restoreScope: string, restoreToken: string | null, localRecord: string | null): Promise<boolean> {
    const client = await this.getClient();
    const currentScope = () => this.client === client && this.session?.user.id === userId
      && this.config?.url === projectUrl && this.scopeRevision === revision;
    if (!client || !currentScope() || localStorage.getItem(APP_DATA_STORAGE_KEY) !== localRecord) return false;
    this.syncing = true;
    this.error = null;
    this.emit();
    try {
      const { error } = await client
        .from(TABLE)
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (!currentScope()) return false;
      if (error) throw error;
      const key = this.syncKey(projectUrl, userId);
      const updatedAt = new Date().toISOString();
      localStorage.setItem(key, updatedAt);
      if (localStorage.getItem(APP_DATA_STORAGE_KEY) === localRecord) this.markLocalSyncScope(key, localRecord, updatedAt);
      if (restoreToken && localStorage.getItem(restoreScope) === restoreToken) localStorage.removeItem(restoreScope);
      return true;
    } catch (e) {
      if (currentScope()) this.error = (e as Error).message;
      return false;
    } finally {
      if (currentScope()) { this.syncing = false; this.emit(); }
    }
  }

  /** Compare timestamps only within the account/project that synchronized them. */
  public async pullIfNewer(local: UserData | null): Promise<UserData | null> {
    const userId = this.session?.user.id;
    const projectUrl = this.config?.url;
    const revision = this.scopeRevision;
    const restoreScope = this.restoreScope();
    if (!userId || !projectUrl || localStorage.getItem(restoreScope)) return null;
    const localRecord = localStorage.getItem(APP_DATA_STORAGE_KEY);
    const client = await this.getClient();
    const currentScope = () => this.client === client && this.session?.user.id === userId
      && this.config?.url === projectUrl && this.scopeRevision === revision
      && !localStorage.getItem(restoreScope) && localStorage.getItem(APP_DATA_STORAGE_KEY) === localRecord;
    if (!client || !currentScope()) return null;
    this.error = null;
    try {
      const { data, error } = await client.from(TABLE).select('data, updated_at').eq('user_id', userId).maybeSingle();
      // A response belongs to the account, project and saved record that requested it.
      // Logout, explicit imports or newer local work cannot be overwritten by a late response.
      if (!currentScope()) return null;
      if (error) throw error;
      if (!data) return null;
      // A local import may have happened while the remote read was in flight.
      if (localStorage.getItem(restoreScope)) return null;
      const remote = data.data as UserData;
      const remoteTs = new Date(data.updated_at).getTime();
      // An unsynchronized device profile may belong to another account. Its opening
      // date and a legacy global sync date cannot establish this account's freshness.
      const synchronizedAt = this.lastSyncAt();
      const localTs = local && synchronizedAt ? new Date(synchronizedAt).getTime() : 0;
      if (!local || remoteTs > localTs + 2000) {
        const restored = prepareBackupRestore(remote);
        this.pendingPulls.set(restored, { updatedAt: data.updated_at, userId, projectUrl, client, revision, restoreScope, localRecord });
        return restored;
      }
      return null;
    } catch (e) {
      if (currentScope()) { this.error = (e as Error).message; this.emit(); }
      return null;
    }
  }

  /** Recheck inside the personal-data write lock, including after an open review or a queued commit. */
  public canApplyRemote(data: UserData, originalRecord?: string | null): boolean {
    const pending = this.pendingPulls.get(data);
    if (!pending || pending.userId !== this.session?.user.id || pending.projectUrl !== this.config?.url
      || pending.client !== this.client || pending.revision !== this.scopeRevision) return false;
    try {
      // A queued replacement validates its original authoritative record again
      // after the async commit, while its own projection already contains new data.
      const localRecord = originalRecord === undefined ? localStorage.getItem(APP_DATA_STORAGE_KEY) : originalRecord;
      return !localStorage.getItem(pending.restoreScope) && localRecord === pending.localRecord;
    } catch { return false; }
  }

  /** A preview or cancelled restore is not a sync; record the timestamp only after the local commit. */
  public markRemoteApplied(data: UserData): void {
    const pending = this.pendingPulls.get(data);
    if (!pending || pending.userId !== this.session?.user.id || pending.projectUrl !== this.config?.url
      || pending.client !== this.client || pending.revision !== this.scopeRevision || localStorage.getItem(pending.restoreScope)
      || localStorage.getItem(APP_DATA_STORAGE_KEY) !== JSON.stringify(data)) return;
    try {
      const key = this.syncKey(pending.projectUrl, pending.userId);
      localStorage.setItem(key, pending.updatedAt);
      this.markLocalSyncScope(key, localStorage.getItem(APP_DATA_STORAGE_KEY), pending.updatedAt);
    } catch { /* The personal record is already committed. */ }
    this.pendingPulls.delete(data);
    this.emit();
  }
}

export const cloudSync = new CloudSync();
