import type { Locale } from './index';
import type { PurchaseResult } from '../services/purchaseStatus';

/** Purchase readiness copy stays scoped so existing web/level translations remain intact. */
const copy = {
  en: {
    retry: 'Try loading plans again', retryHelp: 'Check your connection, then try again.',
    identityPending: 'Checking the subscription for this account…',
    identityFailed: 'The subscription for this account couldn’t be verified.',
    identityHelp: 'Paid access and purchasing are paused until this account is verified. Check your connection and try again.',
    identityRetry: 'Retry account verification',
    unknownTrial: 'The App Store will confirm whether an introductory offer applies before you approve a purchase.',
    ineligibleTrial: 'The standard subscription price applies to this plan.',
    trialStart: 'On confirmation', trialStartBody: 'Pro opens after the App Store confirms your trial.',
    trialEndBody: 'The paid subscription begins after the trial unless you cancel under the App Store terms.',
    cancelled: 'Purchase cancelled.', pending: 'The purchase is pending. Check your App Store subscriptions before trying again.',
    unconfirmed: 'The store responded, but access to this plan is not confirmed yet. Restore purchases or check your App Store subscriptions.',
    failed: 'We couldn’t confirm the purchase. Check your App Store subscriptions before trying again.',
    restoreFailed: 'We couldn’t check your purchases. Check your connection and try restoring again.',
  },
  tr: {
    retry: 'Planları yeniden yükle', retryHelp: 'Bağlantını kontrol edip yeniden dene.',
    identityPending: 'Bu hesabın aboneliği kontrol ediliyor…',
    identityFailed: 'Bu hesabın aboneliği doğrulanamadı.',
    identityHelp: 'Bu hesap doğrulanana kadar ücretli erişim ve satın alma duraklatıldı. Bağlantını kontrol edip yeniden dene.',
    identityRetry: 'Hesap doğrulamasını yeniden dene',
    unknownTrial: 'Satın almayı onaylamadan önce App Store, başlangıç teklifinin geçerli olup olmadığını gösterecek.',
    ineligibleTrial: 'Bu plan için standart abonelik fiyatı geçerlidir.',
    trialStart: 'Onaylandığında', trialStartBody: 'App Store denemeni onayladıktan sonra Pro açılır.',
    trialEndBody: 'App Store koşullarına göre iptal etmezsen denemeden sonra ücretli abonelik başlar.',
    cancelled: 'Satın alma iptal edildi.', pending: 'Satın alma beklemede. Yeniden denemeden önce App Store aboneliklerini kontrol et.',
    unconfirmed: 'Mağaza yanıt verdi ancak bu plana erişim henüz doğrulanmadı. Satın alımları geri yükle veya App Store aboneliklerini kontrol et.',
    failed: 'Satın almayı doğrulayamadık. Yeniden denemeden önce App Store aboneliklerini kontrol et.',
    restoreFailed: 'Satın alımlarını kontrol edemedik. Bağlantını kontrol edip geri yüklemeyi yeniden dene.',
  },
  es: {
    retry: 'Volver a cargar los planes', retryHelp: 'Comprueba tu conexión y vuelve a intentarlo.',
    identityPending: 'Comprobando la suscripción de esta cuenta…',
    identityFailed: 'No se pudo verificar la suscripción de esta cuenta.',
    identityHelp: 'El acceso de pago y las compras están en pausa hasta verificar esta cuenta. Comprueba tu conexión y vuelve a intentarlo.',
    identityRetry: 'Reintentar la verificación de la cuenta',
    unknownTrial: 'El App Store confirmará si se aplica una oferta introductoria antes de que apruebes la compra.',
    ineligibleTrial: 'A este plan se aplica el precio estándar de suscripción.',
    trialStart: 'Al confirmarse', trialStartBody: 'Pro se abre cuando el App Store confirma tu prueba.',
    trialEndBody: 'La suscripción de pago comienza después de la prueba salvo que canceles según las condiciones del App Store.',
    cancelled: 'Compra cancelada.', pending: 'La compra está pendiente. Revisa tus suscripciones del App Store antes de volver a intentarlo.',
    unconfirmed: 'La tienda respondió, pero el acceso a este plan aún no está confirmado. Restaura las compras o revisa tus suscripciones del App Store.',
    failed: 'No pudimos confirmar la compra. Revisa tus suscripciones del App Store antes de volver a intentarlo.',
    restoreFailed: 'No pudimos comprobar tus compras. Comprueba tu conexión e intenta restaurarlas de nuevo.',
  },
} as const;

export const purchaseCopy = (locale: Locale) => copy[locale];
export const purchaseFeedback = (result: Exclude<PurchaseResult, 'purchased'>, locale: Locale): string => copy[locale][result];
