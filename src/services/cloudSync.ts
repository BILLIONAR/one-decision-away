import { getAppBase } from '../utils/routing';
/**
 * CloudSync — optional Supabase-backed backup & sync of the whole UserData document.
 * Works only when a Supabase URL + anon key are configured (env or Settings);
 * otherwise the app keeps running purely on localStorage.
 */
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { UserData } from '../types/models';
import { getLocale, t } from '../i18n';
import { createBackupSnapshot, prepareBackupRestore } from './backup';
import { APP_DATA_STORAGE_KEY } from './storageKeys';
import { REPLACEMENT_EPOCH_KEY } from './dataSnapshots';
import { backupCopy } from '../data/backupCopy';
import { canonicalDocumentJson, isRemoteVersion, nextRemoteVersion, remoteDocumentFingerprint } from './cloudUploadReadiness';
import { queueDataWrite, subscribeDataCommitted } from './dataWrites';

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

interface RemoteAcknowledgement { remoteVersion: string; remoteFingerprint: string }
type UploadPauseCopy = 'cloudUploadUnreviewed' | 'cloudUploadChanged' | 'cloudUploadReadFailed'
  | 'cloudUploadConflict' | 'cloudUploadImportConflict' | 'cloudUploadUnconfirmed';

type Listener = (state: CloudState) => void;
export interface CloudState {
  configured: boolean;
  session: Session | null;
  lastSyncAt: string | null;
  currentDocumentConfirmed: boolean;
  lastSuccessfulSyncAt: string | null;
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
  private initializing: Promise<void> | null = null;
  private sessionHydrated = false;
  private pushQueue: Promise<boolean> = Promise.resolve(false);
  private scopeRevision = 0;
  private confirmedLocalRecord: string | null | undefined;
  private confirmedLocalFingerprint: string | undefined;
  private confirmationProbe: { raw: string; owner: string } | null = null;
  private confirmationBootstrap: Promise<void> | null = null;
  private authSubscription: { unsubscribe: () => void } | null = null;
  private pendingPulls = new WeakMap<UserData, { updatedAt: string; remoteFingerprint: string; userId: string; projectUrl: string; client: SupabaseClient; revision: number; restoreScope: string; localRecord: string | null; ownerRecord: string | null }>();

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

  private markLocalSyncScope(key: string, raw: string | null, updatedAt: string, remoteFingerprint: string, displayConfirmed = true, localFingerprint?: string): void {
    const epoch = this.localEpoch(raw);
    if (epoch === undefined) throw new Error('Invalid local record');
    localStorage.setItem(LOCAL_SYNC_SCOPE_KEY, JSON.stringify({ key, epoch, updatedAt: displayConfirmed ? updatedAt : null, remoteVersion: updatedAt, remoteFingerprint, confirmedLocalFingerprint: localFingerprint }));
    this.confirmedLocalRecord = displayConfirmed && localFingerprint ? raw : undefined;
    this.confirmedLocalFingerprint = displayConfirmed ? localFingerprint : undefined;
  }

  /** A display timestamp or an earlier account's history is never upload permission. */
  private remoteAcknowledgement(key: string, raw: string | null): RemoteAcknowledgement | null {
    try {
      const owner = JSON.parse(localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) || 'null');
      const epoch = this.localEpoch(raw);
      return epoch !== undefined && owner?.key === key && owner.epoch === epoch
        && isRemoteVersion(owner.remoteVersion) && typeof owner.remoteFingerprint === 'string' && /^[a-f0-9]{64}$/.test(owner.remoteFingerprint)
        ? { remoteVersion: owner.remoteVersion, remoteFingerprint: owner.remoteFingerprint } : null;
    } catch { return null; }
  }

  private pauseUpload(copy: UploadPauseCopy): false {
    this.error = backupCopy(getLocale())[copy];
    return false;
  }

  private acknowledgedSyncAt(): string | null {
    if (!this.config || !this.session) return null;
    const key = this.syncKey(this.config.url, this.session.user.id);
    // Returning to A after B synchronized cannot use A's historical timestamp
    // as evidence that the current device document still belongs to A.
    try {
      const owner = JSON.parse(localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) || 'null');
      const epoch = this.localEpoch(localStorage.getItem(APP_DATA_STORAGE_KEY));
      const updatedAt = localStorage.getItem(key);
      return epoch !== undefined && owner?.key === key && owner.epoch === epoch
        && isRemoteVersion(owner.remoteVersion) && owner.remoteVersion === updatedAt ? updatedAt : null;
    } catch { return null; }
  }

  private lastSyncAt(): string | null {
    try {
      const raw = localStorage.getItem(APP_DATA_STORAGE_KEY);
      const owner = JSON.parse(localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) || 'null');
      if (raw !== this.confirmedLocalRecord || !this.confirmedLocalFingerprint
        || owner?.confirmedLocalFingerprint !== this.confirmedLocalFingerprint
        || owner.updatedAt !== this.lastSuccessfulSyncAt()) return null;
      return this.acknowledgedSyncAt();
    } catch { return null; }
  }

  private lastSuccessfulSyncAt(): string | null {
    if (!this.config || !this.session) return null;
    try {
      const stamp = localStorage.getItem(this.syncKey(this.config.url, this.session.user.id));
      return isRemoteVersion(stamp) ? stamp : null;
    } catch { return null; }
  }

  /** Dirty display metadata is not a change to the acknowledged remote baseline. */
  private remoteOwnerIdentity(raw: string | null): string {
    if (raw === null) return 'absent';
    try {
      const owner = JSON.parse(raw);
      if (typeof owner?.key === 'string' && (owner.epoch === null || typeof owner.epoch === 'string')
        && isRemoteVersion(owner.remoteVersion) && typeof owner.remoteFingerprint === 'string'
        && /^[a-f0-9]{64}$/.test(owner.remoteFingerprint)) {
        return canonicalDocumentJson({ key: owner.key, epoch: owner.epoch, remoteVersion: owner.remoteVersion, remoteFingerprint: owner.remoteFingerprint });
      }
    } catch { /* An invalid marker still has an exact identity. */ }
    return `invalid:${raw}`;
  }

  private ownerIsCurrent(raw: string | null): boolean {
    return this.remoteOwnerIdentity(localStorage.getItem(LOCAL_SYNC_SCOPE_KEY)) === this.remoteOwnerIdentity(raw);
  }

  /** Called only after durable commit/hydration; failed provisional writes never dirty a backup. */
  private observeCommittedRecord(): void {
    try {
      const raw = localStorage.getItem(APP_DATA_STORAGE_KEY);
      const ownerRecord = localStorage.getItem(LOCAL_SYNC_SCOPE_KEY);
      if (raw === this.confirmedLocalRecord && this.confirmedLocalFingerprint) return;
      const previousFingerprint = this.confirmedLocalFingerprint;
      this.confirmedLocalRecord = undefined;
      this.confirmedLocalFingerprint = undefined;
      if (!raw || !ownerRecord) { this.confirmationProbe = null; this.emit(); return; }
      const owner = JSON.parse(ownerRecord);
      const knownChanged = (previousFingerprint !== undefined && previousFingerprint === owner?.confirmedLocalFingerprint)
        || (this.confirmationProbe !== null && this.confirmationProbe.raw !== raw && this.confirmationProbe.owner === ownerRecord);
      if (knownChanged && owner?.updatedAt) {
        localStorage.setItem(LOCAL_SYNC_SCOPE_KEY, JSON.stringify({ ...owner, updatedAt: null }));
        this.confirmationProbe = null;
        this.emit();
        return;
      }
      this.emit();
      if (!this.config || !this.session || owner?.key !== this.syncKey(this.config.url, this.session.user.id)
        || owner.epoch !== this.localEpoch(raw) || !isRemoteVersion(owner.updatedAt)
        || typeof owner.confirmedLocalFingerprint !== 'string') return;
      if (this.confirmationProbe?.raw === raw && this.confirmationProbe.owner === ownerRecord) return;
      const snapshot = createBackupSnapshot(JSON.parse(raw));
      prepareBackupRestore(snapshot);
      const frozen = JSON.parse(canonicalDocumentJson(snapshot));
      const probe = { raw, owner: ownerRecord };
      this.confirmationProbe = probe;
      const accountIsCurrent = this.currentAccountGuard();
      const work = remoteDocumentFingerprint(frozen).then(fingerprint => {
        if (this.confirmationProbe !== probe || !accountIsCurrent()
          || localStorage.getItem(APP_DATA_STORAGE_KEY) !== raw || localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) !== ownerRecord) return;
        return queueDataWrite(() => {
        if (this.confirmationProbe !== probe) return;
        this.confirmationProbe = null;
        if (!accountIsCurrent() || localStorage.getItem(APP_DATA_STORAGE_KEY) !== raw
          || localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) !== ownerRecord) return;
        if (fingerprint === owner.confirmedLocalFingerprint) {
          this.confirmedLocalRecord = raw;
          this.confirmedLocalFingerprint = fingerprint;
        } else localStorage.setItem(LOCAL_SYNC_SCOPE_KEY, JSON.stringify({ ...owner, updatedAt: null }));
        this.emit();
        });
      }).catch(() => {
        try {
          if (this.confirmationProbe !== probe || !accountIsCurrent() || localStorage.getItem(APP_DATA_STORAGE_KEY) !== raw
            || localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) !== ownerRecord) return;
          this.confirmationProbe = null;
          localStorage.setItem(LOCAL_SYNC_SCOPE_KEY, JSON.stringify({ ...owner, updatedAt: null }));
          this.emit();
        } catch { /* An unreadable record stays unconfirmed. */ }
      }).finally(() => {
        if (this.confirmationProbe === probe) this.confirmationProbe = null;
        if (this.confirmationBootstrap === work) this.confirmationBootstrap = null;
      });
      this.confirmationBootstrap = work;
    } catch {
      this.confirmedLocalRecord = undefined;
      this.confirmedLocalFingerprint = undefined;
      this.confirmationProbe = null;
      this.emit();
    }
  }

  constructor() {
    this.config = this.readConfig();
    subscribeDataCommitted(() => this.observeCommittedRecord());
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
    this.initializing = null;
    this.sessionHydrated = false;
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
  public init(): Promise<void> {
    if (this.initializing) return this.initializing;
    if (this.initialized) return Promise.resolve();
    this.initialized = true;
    const pending = this.initializeSession().finally(() => {
      if (this.initializing === pending) this.initializing = null;
    });
    this.initializing = pending;
    return pending;
  }

  private async initializeSession(): Promise<void> {
    const config = this.config;
    const revision = this.scopeRevision;
    let ownedRevision = revision;
    try {
      const client = await this.getClient();
      if (!client) return;
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (this.config !== config || this.client !== client || this.scopeRevision !== revision) return;
      this.setSession(data.session);
      ownedRevision = this.scopeRevision;
      const { data: { subscription } } = client.auth.onAuthStateChange((_evt, session) => {
        if (this.config !== config || this.client !== client) return;
        this.setSession(session);
        this.sessionHydrated = true;
        this.emit();
      });
      this.authSubscription = subscription;
      this.sessionHydrated = true;
      this.error = null;
      // Verification reads the same durable authority as app readers. Its hash
      // and final publication happen outside/inside separate short lock phases.
      await queueDataWrite(() => undefined);
      await this.confirmationBootstrap;
      if (this.config !== config || this.client !== client || this.scopeRevision !== ownedRevision) return;
    } catch (e) {
      if (this.config !== config || this.scopeRevision !== ownedRevision) return;
      this.error = (e as Error).message;
      this.sessionHydrated = false;
      this.initialized = false;
    }
    this.emit();
  }

  /** A missing session before hydration is unknown, rather than signed out. */
  public isSessionReady(): boolean { return !this.config || this.sessionHydrated; }

  public getState(): CloudState {
    const lastSyncAt = this.lastSyncAt();
    return {
      configured: this.isConfigured(),
      session: this.session,
      lastSyncAt,
      currentDocumentConfirmed: lastSyncAt !== null,
      lastSuccessfulSyncAt: this.lastSuccessfulSyncAt(),
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
    const originalAccount = this.currentAccountGuard();
    try {
    // Freeze caller-owned objects before yielding; a later render/mutation is
    // neither the user's original payload nor permission to upload another record.
    const supplied = JSON.parse(JSON.stringify(data)) as UserData;
    // Capture account and restore identity now: an older queued upload cannot clear a newer import.
    const userId = this.session?.user.id;
    const projectUrl = this.config?.url;
    const revision = this.scopeRevision;
    const client = this.client;
    const restoreScope = this.restoreScope();
    const restoreToken = localStorage.getItem(restoreScope);
    const captured = await queueDataWrite(() => {
      if (!originalAccount() || localStorage.getItem(restoreScope) !== restoreToken) return null;
      const localRecord = localStorage.getItem(APP_DATA_STORAGE_KEY);
      if (!localRecord) throw new Error('Missing saved document');
      const parsed: unknown = JSON.parse(localRecord);
      prepareBackupRestore(parsed);
      const authoritative = createBackupSnapshot(parsed as UserData);
      const snapshot = createBackupSnapshot(supplied);
      prepareBackupRestore(authoritative);
      prepareBackupRestore(snapshot);
      const payloadJson = canonicalDocumentJson(snapshot);
      if (payloadJson !== canonicalDocumentJson(authoritative)) {
        this.pauseUpload('cloudUploadUnconfirmed'); this.emit(); return null;
      }
      return { snapshot: JSON.parse(payloadJson) as UserData, localRecord };
    });
    if (!captured || !originalAccount()) return false;
    const { snapshot, localRecord } = captured;
    const run = async () => {
      if (!userId || !projectUrl || this.session?.user.id !== userId || this.config?.url !== projectUrl
        || this.scopeRevision !== revision || this.client !== client || localStorage.getItem(APP_DATA_STORAGE_KEY) !== localRecord) return false;
      return this.pushSnapshot(snapshot, userId, projectUrl, revision, restoreScope, restoreToken, localRecord);
    };
    const result = this.pushQueue.then(run, run);
    this.pushQueue = result;
    return await result;
    } catch {
      if (originalAccount()) { this.pauseUpload('cloudUploadUnconfirmed'); this.emit(); }
      return false;
    }
  }

  private async pushSnapshot(data: UserData, userId: string, projectUrl: string, revision: number, restoreScope: string, restoreToken: string | null, localRecord: string | null): Promise<boolean> {
    const ownerRecord = localStorage.getItem(LOCAL_SYNC_SCOPE_KEY);
    const client = await this.getClient();
    const currentScope = () => this.client === client && this.session?.user.id === userId
      && this.config?.url === projectUrl && this.scopeRevision === revision;
    const currentRecord = () => currentScope() && localStorage.getItem(APP_DATA_STORAGE_KEY) === localRecord
      && localStorage.getItem(restoreScope) === restoreToken && this.ownerIsCurrent(ownerRecord);
    if (!client || !currentRecord()) return false;
    this.syncing = true;
    this.error = null;
    this.emit();
    let failureCopy: UploadPauseCopy = 'cloudUploadReadFailed';
    try {
      const { data: remote, error: readError } = await client.from(TABLE).select('data, updated_at').eq('user_id', userId).maybeSingle();
      if (!currentRecord()) return false;
      if (readError) return this.pauseUpload('cloudUploadReadFailed');
      const key = this.syncKey(projectUrl, userId);
      let result;
      let payloadFingerprint: string;
      let previousVersion: string | undefined;
      if (remote) {
        if (!isRemoteVersion(remote.updated_at) || !remote.data || typeof remote.data !== 'object' || Array.isArray(remote.data)) return this.pauseUpload('cloudUploadReadFailed');
        const acknowledged = this.remoteAcknowledgement(key, localRecord);
        if (!acknowledged) return this.pauseUpload(restoreToken ? 'cloudUploadImportConflict' : 'cloudUploadUnreviewed');
        const fingerprint = await remoteDocumentFingerprint(remote.data);
        if (!currentRecord()) return false;
        if (acknowledged.remoteVersion !== remote.updated_at || acknowledged.remoteFingerprint !== fingerprint) {
          return this.pauseUpload(restoreToken ? 'cloudUploadImportConflict' : 'cloudUploadChanged');
        }
        failureCopy = 'cloudUploadUnconfirmed';
        payloadFingerprint = await remoteDocumentFingerprint(data);
        if (!currentRecord()) return false;
        previousVersion = remote.updated_at;
        // Every writer using this guard advances its version. Legacy writers that
        // keep the timestamp while changing data after this SELECT remain a limit.
        result = await client.from(TABLE).update({ data, updated_at: nextRemoteVersion(remote.updated_at) })
          .eq('user_id', userId).eq('updated_at', remote.updated_at).select('data, updated_at');
      } else {
        // A row appearing after SELECT must conflict; it must never be upserted.
        failureCopy = 'cloudUploadUnconfirmed';
        payloadFingerprint = await remoteDocumentFingerprint(data);
        if (!currentRecord()) return false;
        result = await client.from(TABLE).insert({ user_id: userId, data, updated_at: nextRemoteVersion() }).select('data, updated_at');
      }
      if (!currentScope() || !this.ownerIsCurrent(ownerRecord) || localStorage.getItem(restoreScope) !== restoreToken) return false;
      if (result.error) return currentRecord() ? this.pauseUpload(result.error.code === '23505' ? 'cloudUploadConflict' : 'cloudUploadUnconfirmed') : false;
      if (!Array.isArray(result.data) || result.data.length !== 1) return currentRecord() ? this.pauseUpload('cloudUploadConflict') : false;
      const written = result.data[0];
      if (!isRemoteVersion(written?.updated_at) || !written.data || typeof written.data !== 'object' || Array.isArray(written.data)) return currentRecord() ? this.pauseUpload('cloudUploadUnconfirmed') : false;
      if ((written.user_id !== undefined && written.user_id !== userId)
        || (previousVersion !== undefined && Date.parse(written.updated_at) <= Date.parse(previousVersion))) return currentRecord() ? this.pauseUpload('cloudUploadUnconfirmed') : false;
      prepareBackupRestore(written.data);
      const fingerprint = await remoteDocumentFingerprint(written.data);
      if (!currentScope() || !this.ownerIsCurrent(ownerRecord)) return false;
      if (fingerprint !== payloadFingerprint) return currentRecord() ? this.pauseUpload('cloudUploadUnconfirmed') : false;
      // A later ordinary save still shares this dataset's acknowledged cloud
      // baseline, so its queued conditional upload can continue. A replacement
      // or newer import cannot inherit that permission or lose its barrier.
      return await queueDataWrite(() => {
        const currentRaw = localStorage.getItem(APP_DATA_STORAGE_KEY);
        if (!currentScope() || !this.ownerIsCurrent(ownerRecord)
          || this.localEpoch(currentRaw) !== this.localEpoch(localRecord)
          || localStorage.getItem(restoreScope) !== restoreToken) return false;
        const currentSnapshot = currentRaw ? createBackupSnapshot(JSON.parse(currentRaw)) : null;
        const displayConfirmed = currentSnapshot !== null && canonicalDocumentJson(currentSnapshot) === canonicalDocumentJson(data);
        const updatedAt = written.updated_at;
        localStorage.setItem(key, updatedAt);
        this.markLocalSyncScope(key, currentRaw, updatedAt, fingerprint, displayConfirmed, payloadFingerprint);
        if (restoreToken && localStorage.getItem(restoreScope) === restoreToken) localStorage.removeItem(restoreScope);
        return true;
      });
    } catch {
      try { if (currentRecord()) this.pauseUpload(failureCopy); } catch { /* A newer or unreadable device record is not this operation's status. */ }
      return false;
    } finally {
      if (currentScope()) { this.syncing = false; this.emit(); }
    }
  }

  /** Compare timestamps only within the account/project that synchronized them. */
  public async pullIfNewer(local: UserData | null, options?: { forReview?: boolean }): Promise<UserData | null> {
    const userId = this.session?.user.id;
    const projectUrl = this.config?.url;
    const revision = this.scopeRevision;
    const restoreScope = this.restoreScope();
    const restoreToken = localStorage.getItem(restoreScope);
    if (!userId || !projectUrl || (restoreToken && !options?.forReview)) return null;
    const localRecord = localStorage.getItem(APP_DATA_STORAGE_KEY);
    const ownerRecord = localStorage.getItem(LOCAL_SYNC_SCOPE_KEY);
    const client = await this.getClient();
    const currentScope = () => this.client === client && this.session?.user.id === userId
      && this.config?.url === projectUrl && this.scopeRevision === revision
      && localStorage.getItem(restoreScope) === restoreToken && localStorage.getItem(APP_DATA_STORAGE_KEY) === localRecord
      && localStorage.getItem(LOCAL_SYNC_SCOPE_KEY) === ownerRecord;
    if (!client || !currentScope()) return null;
    this.error = null;
    try {
      const { data, error } = await client.from(TABLE).select('data, updated_at').eq('user_id', userId).maybeSingle();
      // A response belongs to the account, project and saved record that requested it.
      // Logout, explicit imports or newer local work cannot be overwritten by a late response.
      if (!currentScope()) return null;
      if (error) throw error;
      if (!data) return null;
      if (restoreToken) { this.pauseUpload('cloudUploadImportConflict'); this.emit(); return null; }
      // A local import may have happened while the remote read was in flight.
      if (localStorage.getItem(restoreScope)) return null;
      const remote = data.data as UserData;
      if (!isRemoteVersion(data.updated_at)) throw new Error(backupCopy(getLocale()).cloudUploadReadFailed);
      const remoteTs = new Date(data.updated_at).getTime();
      // An unsynchronized device profile may belong to another account. Its opening
      // date and a legacy global sync date cannot establish this account's freshness.
      const synchronizedAt = this.acknowledgedSyncAt();
      const localTs = local && synchronizedAt ? new Date(synchronizedAt).getTime() : 0;
      const fingerprint = await remoteDocumentFingerprint(remote);
      if (!currentScope()) return null;
      const acknowledged = this.remoteAcknowledgement(this.syncKey(projectUrl, userId), localRecord);
      const changedForReview = options?.forReview && (!acknowledged || acknowledged.remoteVersion !== data.updated_at || acknowledged.remoteFingerprint !== fingerprint);
      if (!local || remoteTs > localTs + 2000 || changedForReview) {
        const restored = prepareBackupRestore(remote);
        this.pendingPulls.set(restored, { updatedAt: data.updated_at, remoteFingerprint: fingerprint, userId, projectUrl, client, revision, restoreScope, localRecord, ownerRecord });
        if (changedForReview) { this.pauseUpload(acknowledged ? 'cloudUploadChanged' : 'cloudUploadUnreviewed'); this.emit(); }
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
      return !localStorage.getItem(pending.restoreScope) && localRecord === pending.localRecord
        && this.ownerIsCurrent(pending.ownerRecord);
    } catch { return false; }
  }

  /** A preview or cancelled restore is not a sync; record the timestamp only after the local commit. */
  public async markRemoteApplied(data: UserData): Promise<boolean> {
    const pending = this.pendingPulls.get(data);
    if (!pending || pending.userId !== this.session?.user.id || pending.projectUrl !== this.config?.url
      || pending.client !== this.client || pending.revision !== this.scopeRevision) return false;
    let confirmed = false;
    let statusChanged = false;
    const accountIsCurrent = this.currentAccountGuard();
    let raw: string | undefined;
    try {
      raw = JSON.stringify(data);
      if (localStorage.getItem(pending.restoreScope) || localStorage.getItem(APP_DATA_STORAGE_KEY) !== raw
        || !this.ownerIsCurrent(pending.ownerRecord)) return false;
      const localFingerprint = await remoteDocumentFingerprint(createBackupSnapshot(data));
      if (!accountIsCurrent() || localStorage.getItem(pending.restoreScope)
        || localStorage.getItem(APP_DATA_STORAGE_KEY) !== raw || !this.ownerIsCurrent(pending.ownerRecord)) return false;
      confirmed = await queueDataWrite(() => {
        if (!accountIsCurrent() || localStorage.getItem(pending.restoreScope)
          || localStorage.getItem(APP_DATA_STORAGE_KEY) !== raw || !this.ownerIsCurrent(pending.ownerRecord)) return false;
        const key = this.syncKey(pending.projectUrl, pending.userId);
        localStorage.setItem(key, pending.updatedAt);
        this.markLocalSyncScope(key, raw, pending.updatedAt, pending.remoteFingerprint, true, localFingerprint);
        this.error = null;
        return true;
      });
    } catch {
      try {
        if (accountIsCurrent() && raw !== undefined && localStorage.getItem(APP_DATA_STORAGE_KEY) === raw
          && this.ownerIsCurrent(pending.ownerRecord) && !localStorage.getItem(pending.restoreScope)) {
          this.pauseUpload('cloudUploadUnconfirmed'); statusChanged = true;
        }
      } catch { /* An obsolete or unreadable record cannot publish backup status. */ }
    }
    this.pendingPulls.delete(data);
    if (accountIsCurrent() && (confirmed || statusChanged)) this.emit();
    return confirmed;
  }
}

export const cloudSync = new CloudSync();
