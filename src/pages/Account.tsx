import React, { useState } from 'react';
import { CheckCircle2, LogOut, Mail, RefreshCw } from 'lucide-react';
import { useApp } from '../store/useApp';
import { useT, formatDate, getLocale } from '../i18n';
import { cloudSync } from '../services/cloudSync';
import { useCloudState } from '../services/useCloudState';
import { disablePush } from '../services/pushNotifications';
import { keptDecisions } from '../services/momentum';
import { EvidenceTree } from '../components/momentum/EvidenceTree';
import { Modal } from '../components/ui';
import { isNative } from '../services/native';
import { backupCopy } from '../data/backupCopy';

/**
 * Optional membership. ODA works fully without an account (everything stays
 * on the device); signing in with a one-time email link backs the data up
 * and keeps it the same on every device. No passwords.
 */
export const Account: React.FC = () => {
  const t = useT();
  const { data, syncFromCloud, showToast, setActiveRoute } = useApp();
  const cloud = useCloudState();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  if (!data) return null;
  const kept = keptDecisions(data.missions).length;

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value) || sending) { setError(t('Please enter a valid email address.')); return; }
    setSending(true); setError(null);
    const res = await cloudSync.signInWithEmail(value);
    setSending(false);
    if (res.ok) setSentTo(value); else setError(res.message);
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sentTo || verifying || !/^\d{6,8}$/.test(code.trim())) { setError(t('Enter the code from the email.')); return; }
    setVerifying(true); setError(null);
    const res = await cloudSync.verifyEmailCode(sentTo, code);
    setVerifying(false);
    if (!res.ok) setError(res.message ?? null);
  };

  const syncNow = async () => {
    const current = cloudSync.currentOperationGuard();
    const pulled = await syncFromCloud();
    if (!pulled) {
      if (!current()) { showToast(backupCopy(getLocale()).cloudChanged, 'info'); return; }
      const ok = await cloudSync.push(data);
      if (!current()) { showToast(backupCopy(getLocale()).cloudChanged, 'info'); return; }
      showToast(ok ? t('Backed up to cloud.') : t('Cloud backup failed — check your connection.'), ok ? 'success' : 'error');
    }
  };

  const signOut = async () => {
    const current = cloudSync.currentAccountGuard();
    try { await disablePush(); } catch { /* signing out must never be blocked by notifications */ }
    if (!current()) { showToast(backupCopy(getLocale()).cloudChanged, 'info'); return; }
    await cloudSync.signOut();
    if (cloudSync.getState().session) { showToast(backupCopy(getLocale()).cloudChanged, 'info'); return; }
    showToast(t('Signed out. Your data stays on this device.'), 'success');
  };

  const deleteAccount = async () => {
    if (deleting) return;
    const current = cloudSync.currentAccountGuard();
    setDeleting(true);
    try { await disablePush(); } catch { /* deletion must not wait on notifications */ }
    if (!current()) {
      setDeleting(false);
      setConfirmDelete(false);
      showToast(backupCopy(getLocale()).cloudChanged, 'info');
      return;
    }
    const res = await cloudSync.deleteAccount();
    setDeleting(false);
    setConfirmDelete(false);
    showToast(res.ok ? t('Your account and cloud backup are deleted. What is on this device stays until you reset it in Settings.') : (res.message ?? t('We couldn’t delete your account. Check your connection and try again.')), res.ok ? 'success' : 'error');
  };

  const header = (
    <header className="space-y-2">
      <p className="oda-kicker text-[var(--accent)]">{t('Account')}</p>
      <h1 className="oda-display text-[32px] sm:text-[40px] leading-tight tracking-tight">{cloud.session ? t('Your proof is safe') : t('Keep your proof with you')}</h1>
      <p className="text-[15px] leading-relaxed text-[var(--fg-muted)] max-w-[52ch]">
        {cloud.session
          ? t('Your decisions, evidence tree and notes are backed up and stay the same on every device where you sign in.')
          : t('Sign in and your decisions, evidence tree and notes are backed up and follow you to every device. No password: just tap the link we email you.')}
      </p>
    </header>
  );

  if (!cloud.configured) {
    return (
      <div className="space-y-8">
        {header}
        <section className="oda-surface p-6 space-y-2">
          <p className="text-[15px] font-semibold">{t('Accounts are coming soon')}</p>
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{t('Until then everything stays on this device. You can download a backup any time in Settings.')}</p>
        </section>
      </div>
    );
  }

  if (cloud.session) {
    return (
      <div className="space-y-8">
        {header}
        <section className="oda-surface p-6 space-y-5">
          <div className="flex items-center gap-4">
            <span className="oda-icon-chip w-11 h-11"><CheckCircle2 size={20} /></span>
            <div className="min-w-0">
              <p className="text-[13px] text-[var(--fg-muted)]">{t('Signed in as')}</p>
              <p className="text-[16px] font-semibold truncate">{cloud.session.user.email}</p>
            </div>
          </div>
          <div className="oda-rule" />
          <p className="text-[14px] text-[var(--fg-muted)]">
            {cloud.syncing ? t('Syncing…') : cloud.lastSyncAt ? t('Last synced {date}', { date: formatDate(cloud.lastSyncAt, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }) : t('Syncs automatically after every change.')}
          </p>
          {cloud.error && <p role="alert" className="text-[13px] text-[var(--danger)]">{cloud.error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void syncNow()} disabled={cloud.syncing} className="h-11 px-4 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-[14px] font-semibold inline-flex items-center gap-2 disabled:opacity-50"><RefreshCw size={16} />{t('Sync now')}</button>
            <button type="button" onClick={() => void signOut()} className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[14px] font-medium inline-flex items-center gap-2"><LogOut size={16} />{t('Sign out')}</button>
          </div>
        </section>
        <section className="px-1 space-y-2">
          <h2 className="text-[15px] font-semibold">{t('Delete account')}</h2>
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{t('Permanently deletes your account and everything backed up in the cloud. What is on this device stays until you reset it in Settings.')}</p>
          <button type="button" onClick={() => setConfirmDelete(true)} className="min-h-11 text-[14px] font-medium text-[var(--danger)] underline underline-offset-4">{t('Delete my account')}</button>
        </section>
        <Modal isOpen={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} title={t('Delete your account?')} subtitle={cloud.session.user.email ?? undefined}>
          <div className="space-y-4">
            <p className="text-[15px] leading-relaxed">{t('Your account and your cloud backup will be deleted for good. This cannot be undone.')}</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting} className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-[14px] font-medium">{t('Cancel')}</button>
              <button type="button" onClick={() => void deleteAccount()} disabled={deleting} className="h-11 px-4 rounded-[var(--radius-sm)] bg-[var(--danger)] text-white text-[14px] font-semibold disabled:opacity-60">{deleting ? t('Deleting…') : t('Delete my account')}</button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {header}
      <section className="oda-surface p-6 space-y-5">
        <div className="flex items-center gap-4">
          <EvidenceTree count={kept} className="w-24 h-20 shrink-0" label={t('Your evidence tree: {n} leaves', { n: kept })} />
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{kept ? t('{n} kept decisions live only in this browser right now. One link keeps them safe.', { n: kept }) : t('Right now everything lives only in this browser.')}</p>
        </div>
        {sentTo ? (
          <div className="rounded-[var(--radius-md)] bg-[var(--accent-soft)] p-4 space-y-1" role="status">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[var(--accent)]"><Mail size={17} />{t('Check your inbox')}</p>
            <p className="text-[14px] leading-relaxed">{isNative() ? t('We sent a sign-in code to {email}. Enter it below.', { email: sentTo }) : t('We sent a sign-in link to {email}. Open it on this device; it signs you in and brings you back here.', { email: sentTo })}</p>
            <form onSubmit={verify} className="flex gap-2 pt-2" noValidate>
              <label htmlFor="account-code" className="sr-only">{t('Code from the email')}</label>
              <input id="account-code" inputMode="numeric" autoComplete="one-time-code" maxLength={8} value={code} onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(null); }} placeholder={t('Code from the email')} className="flex-1 min-w-0 h-11 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border)] text-[16px] tracking-[0.2em] outline-none focus:border-[var(--accent)]" />
              <button type="submit" disabled={verifying} className="h-11 px-4 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--on-accent)] text-[14px] font-semibold disabled:opacity-50">{verifying ? t('Checking…') : t('Sign in')}</button>
            </form>
            {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
            <button type="button" onClick={() => { setSentTo(null); setCode(''); }} className="min-h-10 text-[13px] font-medium text-[var(--fg-muted)] underline underline-offset-4">{t('Use a different email')}</button>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-3" noValidate>
            <label htmlFor="account-email" className="block text-[13px] font-semibold">{t('Email')}</label>
            <input id="account-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setError(null); }} placeholder={t('you@example.com')} className="w-full h-12 px-4 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[16px] outline-none focus:border-[var(--accent)]" aria-describedby={error ? 'account-error' : undefined} />
            {error && <p id="account-error" role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
            <button type="submit" disabled={sending} className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--on-accent)] text-[15px] font-semibold disabled:opacity-50">{sending ? t('Sending…') : t('Email me a sign-in link')}</button>
            <p className="text-[12px] text-center text-[var(--fg-muted)]">{t('New here? The same link creates your account.')}</p>
            <p className="text-[12px] text-center text-[var(--fg-muted)]">{t('By signing in you accept the')} <button type="button" onClick={() => setActiveRoute('/terms')} className="underline underline-offset-2">{t('Terms of use')}</button> · <button type="button" onClick={() => setActiveRoute('/privacy')} className="underline underline-offset-2">{t('Privacy policy')}</button></p>
          </form>
        )}
      </section>

      <section className="space-y-4" aria-label={t('Why sign in')}>
        {[
          { title: t('Backed up'), body: t('A lost or reset phone no longer means lost progress.') },
          { title: t('On every device'), body: t('The same decisions and notes on your phone and laptop.') },
          { title: t('Only yours'), body: t('Your data can be read only with your account.') },
        ].map((item, i) => (
          <div key={item.title} className={`flex gap-4 px-1 ${i ? 'pt-4 border-t border-[var(--border)]' : ''}`}>
            <span className="oda-numeral text-[20px] leading-6 text-[var(--fg-subtle)] w-5 shrink-0">{i + 1}</span>
            <p className="text-[14.5px] leading-relaxed text-[var(--fg-muted)]"><span className="font-semibold text-[var(--fg)]">{item.title}.</span> {item.body}</p>
          </div>
        ))}
      </section>
      <p className="text-[13px] text-center text-[var(--fg-muted)]">{t('You can keep using ODA without an account; nothing changes.')}</p>
    </div>
  );
};
