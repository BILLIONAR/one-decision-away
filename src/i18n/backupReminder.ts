import type { Locale } from './index';

interface BackupReminderCopy {
  label: string;
  title: string;
  local: string;
  cloudUnconfirmed: string;
  cloudError: string;
  lastExport: (days: number) => string;
  download: string;
  cloudSync: string;
  dismiss: string;
}

const copy = {
  en: {
    label: 'Backup reminder',
    title: 'Keep a copy of your progress.',
    local: 'Your work is saved on this device. Keep a backup before changing devices or clearing browser storage.',
    cloudUnconfirmed: 'A recent cloud backup has not been confirmed. Download a copy, or check cloud sync in Settings.',
    cloudError: 'Cloud sync needs attention. Download a backup while you check it in Settings.',
    lastExport: (days: number) => `Your last downloaded backup was ${days} day${days === 1 ? '' : 's'} ago.`,
    download: 'Download backup', cloudSync: 'Cloud sync', dismiss: 'Not now',
  },
  tr: {
    label: 'Yedekleme hatırlatması',
    title: 'İlerlemenin bir kopyasını sakla.',
    local: 'Çalışmaların bu cihazda kayıtlı. Cihaz değiştirmeden veya tarayıcı verilerini temizlemeden önce bir yedek al.',
    cloudUnconfirmed: 'Yakın tarihli bir bulut yedeği doğrulanmadı. Bir kopya indir veya Ayarlar’dan bulut eşitlemesini kontrol et.',
    cloudError: 'Bulut eşitlemesini kontrol etmen gerekiyor. Ayarlar’dan kontrol ederken bir yedek indir.',
    lastExport: (days: number) => `Son indirdiğin yedek ${days} gün önceydi.`,
    download: 'Yedek indir', cloudSync: 'Bulut eşitleme', dismiss: 'Şimdi değil',
  },
  es: {
    label: 'Recordatorio de copia de seguridad',
    title: 'Guarda una copia de tu progreso.',
    local: 'Tu trabajo está guardado en este dispositivo. Haz una copia antes de cambiar de dispositivo o borrar los datos del navegador.',
    cloudUnconfirmed: 'No se ha confirmado una copia reciente en la nube. Descarga una copia o revisa la sincronización en Ajustes.',
    cloudError: 'La sincronización en la nube necesita atención. Descarga una copia mientras la revisas en Ajustes.',
    lastExport: (days: number) => `Descargaste tu última copia hace ${days} día${days === 1 ? '' : 's'}.`,
    download: 'Descargar copia', cloudSync: 'Sincronización', dismiss: 'Ahora no',
  },
} satisfies Record<Locale, BackupReminderCopy>;

export const backupReminderCopy = (locale: Locale): BackupReminderCopy => copy[locale];
