import React from 'react';
import { getLocale } from '../i18n';
import { publicAssetPath } from '../utils/routing';
import { APP_DATA_STORAGE_KEY, COURSE_PROGRESS_STORAGE_KEY } from '../services/storageKeys';
import { LogoLockup } from './Logo';

const COPY = {
  en: { title: 'Let’s get your space open again.', body: 'ODA could not open this screen. Your saved record has not been reset. Try reloading, or keep a recovery copy before asking for help.', reload: 'Reload ODA', export: 'Download a recovery copy', help: 'Help and support', note: 'A recovery copy can contain your private writing. It is not a regular import backup.', failed: 'This browser could not download the record. Open support for other recovery options.' },
  tr: { title: 'Alanını yeniden açalım.', body: 'ODA bu ekranı açamadı. Kayıtların sıfırlanmadı. Yeniden yüklemeyi dene veya yardım istemeden önce bir kurtarma kopyası al.', reload: 'ODA’yı yeniden yükle', export: 'Kurtarma kopyasını indir', help: 'Yardım ve destek', note: 'Kurtarma kopyası özel yazılarını içerebilir. Normal bir içe aktarma yedeği değildir.', failed: 'Tarayıcı kaydı indiremedi. Diğer kurtarma seçenekleri için desteği aç.' },
  es: { title: 'Volvamos a abrir tu espacio.', body: 'ODA no pudo abrir esta pantalla. Tus datos guardados no se han restablecido. Intenta recargar o conserva una copia de recuperación antes de pedir ayuda.', reload: 'Recargar ODA', export: 'Descargar copia de recuperación', help: 'Ayuda y soporte', note: 'La copia puede incluir tus escritos privados. No es una copia normal para importar.', failed: 'El navegador no pudo descargar los datos. Abre la ayuda para ver otras opciones.' },
};

/** Unexpected rendering errors must not turn into a blank screen or an automatic data reset. */
export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean; exportFailed: boolean }> {
  state = { failed: false, exportFailed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  private exportRecovery = () => {
    try {
      const record = { format: 'oda-recovery-v1', createdAt: new Date().toISOString(), appRecord: localStorage.getItem(APP_DATA_STORAGE_KEY), legacyCourses: localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY) };
      const url = URL.createObjectURL(new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'oda-recovery-record.json'; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { this.setState({ exportFailed: true }); }
  };
  render() {
    if (!this.state.failed) return this.props.children;
    const copy = COPY[getLocale()] ?? COPY.en;
    return <main className="min-h-screen flex flex-col items-center justify-center p-6 text-[var(--fg)]"><section role="alert" className="w-full max-w-lg oda-surface p-6 sm:p-9 space-y-5"><LogoLockup className="w-12 h-18" /><h1 className="oda-display text-3xl">{copy.title}</h1><p className="text-[var(--fg-muted)]">{copy.body}</p><div className="flex flex-wrap gap-3"><button type="button" onClick={() => window.location.reload()} className="oda-btn-primary min-h-12 rounded-full px-5 font-semibold">{copy.reload}</button><button type="button" onClick={this.exportRecovery} className="min-h-12 rounded-full border border-[var(--border-strong)] px-5">{copy.export}</button></div><p className="text-xs text-[var(--fg-muted)]">{copy.note}</p>{this.state.exportFailed && <p className="text-sm text-[var(--danger)]">{copy.failed}</p>}<a href={publicAssetPath('support.html')} className="inline-flex items-center min-h-11 underline underline-offset-4">{copy.help}</a></section></main>;
  }
}
