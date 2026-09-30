import type { Locale } from './index';

const COPY = {
  en: {
    blocked: 'Notifications are off on this iPhone.',
    allow: 'Allow notifications in iPhone Settings → Notifications → ODA.',
    delivery: 'Reminders on this iPhone',
    deliveryHint: 'Scheduled on your device for the next seven days. Open ODA regularly to refresh them. Focus and Scheduled Summary can delay delivery.',
    preview: 'Your daily wisdom preview is ready.',
  },
  tr: {
    blocked: 'Bu iPhone’da bildirimler kapalı.',
    allow: 'iPhone Ayarlar → Bildirimler → ODA bölümünden bildirimlere izin ver.',
    delivery: 'Bu iPhone’daki hatırlatmalar',
    deliveryHint: 'Sonraki yedi gün için cihazında planlanır. Yenilemek için ODA’yı düzenli olarak aç. Odak ve Zamanlanmış Özet teslimi geciktirebilir.',
    preview: 'Günlük bilgelik önizlemen hazır.',
  },
  es: {
    blocked: 'Las notificaciones están desactivadas en este iPhone.',
    allow: 'Permite las notificaciones en Ajustes de iPhone → Notificaciones → ODA.',
    delivery: 'Recordatorios en este iPhone',
    deliveryHint: 'Se programan en tu dispositivo para los próximos siete días. Abre ODA regularmente para renovarlos. Concentración y el Resumen programado pueden retrasarlos.',
    preview: 'Tu vista previa de sabiduría diaria está lista.',
  },
} as const;

export const nativeCopy = (locale: Locale) => COPY[locale];
