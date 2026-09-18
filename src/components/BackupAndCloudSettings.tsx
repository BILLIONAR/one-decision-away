import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Field, Input, Badge } from './ui';
import { Cloud, Download, Upload, LogOut, RefreshCw, ShieldCheck, Mail } from 'lucide-react';
import { cloudSync, CloudState } from '../services/cloudSync';

export const BackupAndCloudSettings: React.FC = () => {
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
      showToast(ok ? 'Backed up to cloud.' : 'Cloud backup failed — check your connection.', ok ? 'success' : 'error');
    }
  };

  return (
    <Card padding="lg" className="space-y-5 bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-sage)]" />
          <h3 className="font-display font-bold text-base text-[var(--fg)]">Backup, Restore & Cloud Sync</h3>
        </div>
        <Badge variant={cloud.session ? 'sage' : 'subtle'}>
          {cloud.session ? `Cloud: ${cloud.session.user.email}` : 'Local only'}
        </Badge>
      </div>

      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
        Your whole life OS lives in this browser. Download a backup regularly, and sign in to sync it across your phone
        and laptop.
        {lastBackup && (
          <>
            {' '}
            Last backup: <strong>{new Date(lastBackup).toLocaleDateString()}</strong>.
          </>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" icon={Download} onClick={exportDataJson}>
          Download backup (.json)
        </Button>
        <Button variant="outline" size="sm" icon={Upload} onClick={() => fileRef.current?.click()}>
          Restore from backup
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
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-[var(--color-slate)]" />
          <h4 className="text-sm font-bold text-[var(--fg)]">Cloud sync (optional)</h4>
        </div>

        {!cloud.configured ? (
          <div className="text-xs text-[var(--fg-muted)] space-y-2">
            <p>
              Not connected to a cloud project yet. To enable sync, create a free Supabase project, run{' '}
              <code className="px-1 bg-[var(--bg-muted)] rounded">supabase/schema.sql</code>, and paste the project URL
              and anon key here (or set <code className="px-1 bg-[var(--bg-muted)] rounded">VITE_SUPABASE_URL</code> /{' '}
              <code className="px-1 bg-[var(--bg-muted)] rounded">VITE_SUPABASE_ANON_KEY</code> at build time).
            </p>
            <Button variant="outline" size="sm" onClick={() => setShowSetup(!showSetup)}>
              {showSetup ? 'Hide setup' : 'Enter project keys'}
            </Button>
            {showSetup && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Input id="sb-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
                <Input id="sb-key" value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder="anon public key" />
                <div>
                  <Button variant="secondary" size="sm" onClick={() => cloudSync.setConfig(url, anonKey)}>
                    Save keys
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : !cloud.session ? (
          <div className="space-y-2">
            <Field id="cloud-email" label="Sign in with email" helper="We'll send a magic link — no password to remember.">
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
                  {sending ? 'Sending…' : 'Send link'}
                </Button>
              </div>
            </Field>
            {msg && <p className="text-[11px] text-[var(--fg-muted)]">{msg}</p>}
            <button type="button" onClick={() => setShowSetup(!showSetup)} className="text-[11px] underline text-[var(--fg-subtle)] cursor-pointer">
              Change project keys
            </button>
            {showSetup && (
              <div className="grid grid-cols-1 gap-2 pt-1">
                <Input id="sb-url2" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
                <Input id="sb-key2" value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder="anon public key" />
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => cloudSync.setConfig(url, anonKey)}>Save keys</Button>
                  <Button variant="ghost" size="sm" onClick={() => cloudSync.setConfig('', '')}>Disconnect</Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs text-[var(--fg-muted)]">
              Signed in as <strong className="text-[var(--fg)]">{cloud.session.user.email}</strong>.
              {cloud.lastSyncAt && <> Last sync {new Date(cloud.lastSyncAt).toLocaleString()}.</>}
              {cloud.error && <span className="text-red-500"> {cloud.error}</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleSyncNow} disabled={cloud.syncing}>
                {cloud.syncing ? 'Syncing…' : 'Sync now'}
              </Button>
              <Button variant="ghost" size="sm" icon={LogOut} onClick={() => cloudSync.signOut()}>
                Sign out
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
