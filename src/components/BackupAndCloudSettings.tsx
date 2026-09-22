import { disablePush } from '../services/pushNotifications';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Field, Input } from './ui';
import { Download, Upload, LogOut, RefreshCw, Mail } from 'lucide-react';
import { cloudSync, CloudState } from '../services/cloudSync';
import { useT } from '../i18n';

export const BackupAndCloudSettings: React.FC = () => {
  const t = useT();
  const { exportDataJson, importDataJson, syncFromCloud, data, showToast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [cloud, setCloud] = useState<CloudState>(cloudSync.getState());
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const cfg = cloudSync.getConfig();
  const [url, setUrl] = useState(cfg?.url || '');
  const [anonKey, setAnonKey] = useState(cfg?.anonKey || '');

  useEffect(() => {
    cloudSync.init();
    return cloudSync.subscribe(setCloud);
  }, []);

  const lastBackup = (() => {
    try {
      return localStorage.getItem('oda_last_backup');
    } catch {
      return null;
    }
  })();

  const handleSignOut = async () => {
    try { await disablePush(); await cloudSync.signOut(); }
    catch (error) { showToast(error instanceof Error ? error.message : t('Something went wrong. Please try again.'), 'error'); }
  };

  const handleSendLink = async () => {
    if (!email.trim()) return;
    setSending(true);
    const res = await cloudSync.signInWithEmail(email);
    setMsg(res.message);
    setSending(false);
  };

  const handleSyncNow = async () => {
    if (!data) return;
    const pulled = await syncFromCloud();
    if (!pulled) {
      const ok = await cloudSync.push(data);
      showToast(ok ? t('Backed up to cloud.') : t('Cloud backup failed — check your connection.'), ok ? 'success' : 'error');
    }
  };

  return (
    <Card padding="md" className="space-y-5">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Backup and sync')}</h3>
        <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
          {cloud.session ? t('Cloud: {email}', { email: cloud.session.user.email || '' }) : t('Local only')}
        </p>
      </div>

      <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
        {t('Everything lives in this browser. Download a backup regularly, and sign in to sync across your phone and laptop.')}
        {lastBackup && (
          <>
            {' '}
            {t('Last backup:')} <span className="text-[var(--fg)] font-medium">{new Date(lastBackup).toLocaleDateString()}</span>.
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" icon={Download} onClick={exportDataJson}>
          {t('Download backup')}
        </Button>
        <Button variant="secondary" size="sm" icon={Upload} onClick={() => fileRef.current?.click()}>
          {t('Restore')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importDataJson(f);
            e.currentTarget.value = '';
          }}
        />
      </div>

      <div className="pt-4 border-t border-[var(--border)] space-y-3">
        <h4 className="text-[15px] font-semibold text-[var(--fg)]">{t('Cloud sync (optional)')}</h4>

        {!cloud.configured ? (
          <div className="text-[14px] text-[var(--fg-muted)] leading-relaxed space-y-2">
            <p>
              {t("Not connected to a cloud project yet. To enable sync, create a free Supabase project, run {schema}, and paste the project URL and anon key here (or set {url} / {key} at build time).", { schema: 'supabase/schema.sql', url: 'VITE_SUPABASE_URL', key: 'VITE_SUPABASE_ANON_KEY' })}
            </p>
            <Button variant="secondary" size="sm" onClick={() => setShowSetup(!showSetup)}>
              {showSetup ? t('Hide setup') : t('Enter project keys')}
            </Button>
            {showSetup && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Input id="sb-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
                <Input id="sb-key" value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder={t('anon public key')} />
                <div>
                  <Button variant="secondary" size="sm" onClick={() => cloudSync.setConfig(url, anonKey)}>
                    {t('Save keys')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : !cloud.session ? (
          <div className="space-y-2">
            <Field id="cloud-email" label={t('Sign in with email')} helper={t("We'll send a magic link — no password to remember.")}>
              <div className="flex gap-2">
                <Input
                  id="cloud-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1"
                />
                <Button variant="primary" size="sm" icon={Mail} onClick={handleSendLink} disabled={sending || !email.trim()}>
                  {sending ? t('Sending…') : t('Send link')}
                </Button>
              </div>
            </Field>
            {msg && <p className="text-[13px] text-[var(--fg-muted)]">{msg}</p>}
            <button type="button" onClick={() => setShowSetup(!showSetup)} className="h-9 text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer">
              {t('Change project keys')}
            </button>
            {showSetup && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Input id="sb-url2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
                <Input id="sb-key2" value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder={t('anon public key')} />
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => cloudSync.setConfig(url, anonKey)}>{t('Save keys')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => cloudSync.setConfig('', '')}>{t('Disconnect')}</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[14px] text-[var(--fg-muted)]">
              {t('Signed in as')} <span className="text-[var(--fg)] font-medium">{cloud.session.user.email}</span>.
              {cloud.lastSyncAt && <> {t('Last sync {time}.', { time: new Date(cloud.lastSyncAt).toLocaleString() })}</>}
              {cloud.error && <span className="text-[var(--danger)]"> {cloud.error}</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleSyncNow} disabled={cloud.syncing}>
                {cloud.syncing ? t('Syncing…') : t('Sync now')}
              </Button>
              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleSignOut}>
                {t('Sign out')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
