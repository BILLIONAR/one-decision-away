/**
 * CloudSync — optional Supabase-backed backup & sync of the whole UserData document.
 * Works only when a Supabase URL + anon key are configured (env or Settings);
 * otherwise the app keeps running purely on localStorage.
 */
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { UserData } from '../types/models';
import { t } from '../i18n';

const CFG_KEY = 'oda_cloud_cfg';
const LAST_SYNC_KEY = 'oda_cloud_last_sync';
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

  constructor() {
    this.config = this.readConfig();
  }

  private readConfig(): CloudConfig | null {
    const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
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
    this.client = null;
    this.initialized = false;
    this.emit();
  }

  public isConfigured(): boolean {
    return !!this.config;
  }

  private async getClient(): Promise<SupabaseClient | null> {
    if (!this.config) return null;
    if (this.client) return this.client;
    const { createClient } = await import('@supabase/supabase-js');
    this.client = createClient(this.config.url, this.config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return this.client;
  }

  /** Restores an existing session (call once on app start). */
  public async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    const client = await this.getClient();
    if (!client) return;
    try {
      const { data } = await client.auth.getSession();
      this.session = data.session;
      client.auth.onAuthStateChange((_evt, session) => {
        this.session = session;
        this.emit();
      });
    } catch (e) {
      this.error = (e as Error).message;
    }
    this.emit();
  }

  public getState(): CloudState {
    return {
      configured: this.isConfigured(),
      session: this.session,
      lastSyncAt: localStorage.getItem(LAST_SYNC_KEY),
      syncing: this.syncing,
      error: this.error,
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

  public async signInWithEmail(email: string): Promise<{ ok: boolean; message: string }> {
    const client = await this.getClient();
    if (!client) return { ok: false, message: t('Cloud sync is not configured.') };
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: t('Magic link sent — check your inbox and open it on this device.') };
  }

  public async signOut() {
    const client = await this.getClient();
    if (!client) return;
    await client.auth.signOut();
    this.session = null;
    this.emit();
  }

  /** Debounced push after local saves. */
  public schedulePush(data: UserData) {
    if (!this.session) return;
    if (this.pushTimer) window.clearTimeout(this.pushTimer);
    this.pushTimer = window.setTimeout(() => this.push(data), 3000);
  }

  public async push(data: UserData): Promise<boolean> {
    const client = await this.getClient();
    if (!client || !this.session) return false;
    this.syncing = true;
    this.error = null;
    this.emit();
    try {
      const { error } = await client
        .from(TABLE)
        .upsert({ user_id: this.session.user.id, data, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) throw error;
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      return true;
    } catch (e) {
      this.error = (e as Error).message;
      return false;
    } finally {
      this.syncing = false;
      this.emit();
    }
  }

  /** Returns remote data if it is newer than the local copy (by profile.lastOpenedAt / updated_at). */
  public async pullIfNewer(local: UserData | null): Promise<UserData | null> {
    const client = await this.getClient();
    if (!client || !this.session) return null;
    try {
      const { data, error } = await client.from(TABLE).select('data, updated_at').eq('user_id', this.session.user.id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const remote = data.data as UserData;
      const remoteTs = new Date(data.updated_at).getTime();
      const localTs = local ? new Date(localStorage.getItem(LAST_SYNC_KEY) || local.profile.lastOpenedAt || 0).getTime() : 0;
      if (!local || remoteTs > localTs + 2000) {
        localStorage.setItem(LAST_SYNC_KEY, data.updated_at);
        return remote;
      }
      return null;
    } catch (e) {
      this.error = (e as Error).message;
      this.emit();
      return null;
    }
  }
}

export const cloudSync = new CloudSync();
