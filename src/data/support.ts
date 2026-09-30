import { FEEDBACK_EMAIL } from './contact';
import type { Locale } from '../i18n';

export const SUPPORT_EMAIL = FEEDBACK_EMAIL;
/** Public artifact shipped by the web build; publishing still requires a release. */
export const SUPPORT_URL = 'https://billionar.github.io/one-decision-away/support.html';

type SupportTopic = { id: string; title: string; paragraphs: string[]; route?: string; action?: string };
type SupportCopy = {
  title: string; intro: string; back: string; contact: string; contactIntro: string;
  emailAction: string; subject: string; include: string; privacyNote: string;
  quickHelp: string; language: string; privacy: string; terms: string;
  topics: SupportTopic[];
};

/** The same practical help appears inside the offline app and on the public support site. */
export const SUPPORT: Record<Locale, SupportCopy> = {
  en: {
    title: 'A little help, when you need it.',
    intro: 'ODA is built around one small decision you can keep. Find a practical answer below, or reach us directly.',
    back: 'Back to ODA', contact: 'Contact ODA',
    contactIntro: 'For app issues, feedback, accessibility requests or questions about your account, email us.',
    emailAction: 'Write an email', subject: 'ODA support',
    include: 'Please describe what happened, what you expected, your device and app or browser version. A screenshot can help if you remove private information first.',
    privacyNote: 'Never send passwords, sign-in codes, API keys, payment details or your full backup. Your notebook and reflections can stay private.',
    quickHelp: 'Practical answers', language: 'Support language', privacy: 'Privacy policy', terms: 'Terms of use',
    topics: [
      { id: 'backup', title: 'Protect or move your progress', paragraphs: ['Before resetting the app or changing devices, export a JSON backup from Settings → Backup & sync. Keep the file somewhere you trust.', 'On the receiving device, use Restore under Backup & sync and choose your backup file. Restoring replaces the data on that device, so export its existing data first if you need it. An optional account offers cloud sync when it is configured; a local backup remains useful.'], route: '/app/settings', action: 'Open backup settings' },
      { id: 'courses', title: 'Continue a course', paragraphs: ['Open Courses and choose the course you were working on. Return to your next lesson, try the exercise in your real day, and record what you noticed.', 'A missed day does not erase learning. If a lesson is locked in the iPhone app, check the available subscription level or use Restore purchases in Upgrade.'], route: '/app/courses', action: 'Open courses' },
      { id: 'reminders', title: 'Make reminders work for you', paragraphs: ['Turn reminders on in Settings and allow notifications when your device asks. On iPhone, also check Settings → Notifications → ODA; Focus or Scheduled Summary may delay delivery.', 'iPhone reminders are scheduled locally for the week ahead and refreshed when you return to ODA. On the web, open-tab reminders need the app running; background push requires a supported browser, permission and configured cloud service.'], route: '/app/settings', action: 'Open reminder settings' },
      { id: 'purchases', title: 'Restore or manage an iPhone subscription', paragraphs: ['Open Upgrade → Restore purchases using the Apple account that made the purchase. If access does not return, email us with the product name and what you see. Do not send payment details.', 'Manage or cancel renewal in your iPhone Settings → your name → Subscriptions. ODA’s website does not sell subscriptions.'], route: '/app/upgrade', action: 'Open upgrade' },
      { id: 'account', title: 'Sign in or delete an account', paragraphs: ['Request a fresh sign-in email and check spam or junk. In the iPhone app, enter the six-digit code from the latest email. Never share that code.', 'Delete a cloud account from Account → Delete my account. This removes the account and cloud data. To erase the local app data too, use Settings → Reset all data. Export first if you want to keep a copy.'], route: '/app/account', action: 'Open account' },
      { id: 'care', title: 'Know what ODA can help with', paragraphs: ['ODA offers educational exercises, reflection and tools for everyday personal growth. It does not diagnose, provide medical or psychological treatment, or guarantee a particular result.', 'If you need urgent help or feel in immediate danger, contact your local emergency services or someone you trust. This support inbox is not an emergency service.'] },
    ],
  },
  tr: {
    title: 'İhtiyaç duyduğunda küçük bir yardım.',
    intro: 'ODA, tutabileceğin küçük bir karar etrafında kuruldu. Aşağıda pratik bir yanıt bulabilir veya bize doğrudan ulaşabilirsin.',
    back: 'ODA’ya dön', contact: 'ODA ile iletişim',
    contactIntro: 'Uygulama sorunları, geri bildirim, erişilebilirlik talepleri veya hesabınla ilgili sorular için bize e-posta yaz.',
    emailAction: 'E-posta yaz', subject: 'ODA destek',
    include: 'Ne olduğunu, ne beklediğini, cihazını ve uygulama ya da tarayıcı sürümünü anlat. Özel bilgileri kaldırdıktan sonra ekleyeceğin bir ekran görüntüsü yardımcı olabilir.',
    privacyNote: 'Şifre, giriş kodu, API anahtarı, ödeme bilgisi veya tam yedeğini gönderme. Defterin ve kişisel notların özel kalabilir.',
    quickHelp: 'Pratik yanıtlar', language: 'Destek dili', privacy: 'Gizlilik politikası', terms: 'Kullanım koşulları',
    topics: [
      { id: 'backup', title: 'İlerlemeni koru veya taşı', paragraphs: ['Uygulamayı sıfırlamadan veya cihaz değiştirmeden önce Ayarlar → Yedekleme ve eşitleme bölümünden bir JSON yedeği dışa aktar. Dosyayı güvendiğin bir yerde sakla.', 'Yeni cihazda Yedekleme ve eşitleme bölümündeki Geri yükle seçeneğini kullan ve yedek dosyanı seç. Geri yükleme o cihazdaki verilerin yerini alır; ihtiyacın varsa önce mevcut verileri dışa aktar. Yapılandırılmışsa isteğe bağlı hesap bulut eşitlemesi sunar; yerel yedek yine de yararlıdır.'], route: '/app/settings', action: 'Yedekleme ayarlarını aç' },
      { id: 'courses', title: 'Bir kursa devam et', paragraphs: ['Kurslar bölümünde üzerinde çalıştığın kursu seç. Sıradaki dersine dön, egzersizi günlük yaşamında dene ve fark ettiklerini kaydet.', 'Ara verilen bir gün öğrendiklerini silmez. iPhone uygulamasında bir ders kilitliyse abonelik seviyesini kontrol et veya Yükselt bölümünden Satın alımları geri yükle seçeneğini kullan.'], route: '/app/courses', action: 'Kursları aç' },
      { id: 'reminders', title: 'Hatırlatmaları kendine göre ayarla', paragraphs: ['Ayarlar bölümünde hatırlatmaları aç ve cihazın istediğinde bildirim izni ver. iPhone’da Ayarlar → Bildirimler → ODA bölümünü de kontrol et; Odak veya Zamanlanmış Özet teslimi geciktirebilir.', 'iPhone hatırlatmaları sonraki hafta için cihazında planlanır ve ODA’ya döndüğünde yenilenir. Web’de açık sekme hatırlatmaları uygulamanın açık olmasını gerektirir; arka plan bildirimleri desteklenen tarayıcı, izin ve yapılandırılmış bulut hizmeti gerektirir.'], route: '/app/settings', action: 'Hatırlatma ayarlarını aç' },
      { id: 'purchases', title: 'iPhone aboneliğini geri yükle veya yönet', paragraphs: ['Satın almayı yaptığın Apple hesabıyla Yükselt → Satın alımları geri yükle seçeneğini aç. Erişim geri gelmezse ürün adını ve gördüğün durumu bize yaz. Ödeme bilgilerini gönderme.', 'Yenilemeyi iPhone Ayarlar → adın → Abonelikler bölümünden yönet veya iptal et. ODA’nın web sitesi abonelik satmaz.'], route: '/app/upgrade', action: 'Yükselt bölümünü aç' },
      { id: 'account', title: 'Giriş yap veya hesabını sil', paragraphs: ['Yeni bir giriş e-postası iste ve spam klasörünü kontrol et. iPhone uygulamasında en son e-postadaki altı haneli kodu gir. Kodu kimseyle paylaşma.', 'Bulut hesabını Hesap → Hesabımı sil bölümünden sil. Bu işlem hesabı ve bulut verilerini kaldırır. Cihazdaki uygulama verilerini de silmek için Ayarlar → Tüm verileri sıfırla seçeneğini kullan. Kopya saklamak istiyorsan önce dışa aktar.'], route: '/app/account', action: 'Hesabı aç' },
      { id: 'care', title: 'ODA’nın sana nasıl yardımcı olduğunu bil', paragraphs: ['ODA, günlük kişisel gelişim için eğitici egzersizler, düşünme alanı ve araçlar sunar. Tanı koymaz, tıbbi veya psikolojik tedavi sunmaz ve belirli bir sonuç garantisi vermez.', 'Acil yardıma ihtiyacın varsa veya yakın tehlike altındaysan yerel acil yardım hizmetlerine ya da güvendiğin birine ulaş. Bu destek adresi bir acil yardım hizmeti değildir.'] },
    ],
  },
  es: {
    title: 'Un poco de ayuda cuando la necesitas.',
    intro: 'ODA gira en torno a una pequeña decisión que puedes cumplir. Encuentra una respuesta práctica o contacta con nosotros.',
    back: 'Volver a ODA', contact: 'Contactar con ODA',
    contactIntro: 'Escríbenos por problemas con la app, comentarios, solicitudes de accesibilidad o preguntas sobre tu cuenta.',
    emailAction: 'Escribir un correo', subject: 'Soporte de ODA',
    include: 'Describe lo que pasó, lo que esperabas, tu dispositivo y la versión de la app o del navegador. Una captura puede ayudar si primero eliminas la información privada.',
    privacyNote: 'Nunca envíes contraseñas, códigos de acceso, claves API, datos de pago ni tu copia de seguridad completa. Tu cuaderno y tus reflexiones pueden seguir siendo privados.',
    quickHelp: 'Respuestas prácticas', language: 'Idioma del soporte', privacy: 'Política de privacidad', terms: 'Condiciones de uso',
    topics: [
      { id: 'backup', title: 'Protege o traslada tu progreso', paragraphs: ['Antes de restablecer la app o cambiar de dispositivo, exporta una copia JSON desde Ajustes → Copias y sincronización. Guarda el archivo en un lugar de confianza.', 'En el dispositivo de destino, usa Restaurar en Copias y sincronización y elige tu archivo. La restauración sustituye los datos de ese dispositivo; exporta antes los datos existentes si los necesitas. Una cuenta opcional permite sincronización si el servicio está configurado; una copia local sigue siendo útil.'], route: '/app/settings', action: 'Abrir ajustes de copias' },
      { id: 'courses', title: 'Continúa un curso', paragraphs: ['En Cursos, elige el curso en el que estabas trabajando. Vuelve a tu siguiente lección, prueba el ejercicio en tu día y registra lo que observaste.', 'Un día sin practicar no borra lo aprendido. Si una lección está bloqueada en la app de iPhone, revisa tu nivel de suscripción o usa Restaurar compras en Mejorar.'], route: '/app/courses', action: 'Abrir cursos' },
      { id: 'reminders', title: 'Adapta los recordatorios a ti', paragraphs: ['Activa los recordatorios en Ajustes y permite las notificaciones cuando el dispositivo lo pida. En iPhone, revisa también Ajustes → Notificaciones → ODA; Concentración o el Resumen programado pueden retrasarlas.', 'Los recordatorios de iPhone se programan en el dispositivo para la semana siguiente y se renuevan al volver a ODA. En la web, los recordatorios de pestaña necesitan la app abierta; las notificaciones en segundo plano necesitan un navegador compatible, permiso y un servicio de nube configurado.'], route: '/app/settings', action: 'Abrir ajustes de recordatorios' },
      { id: 'purchases', title: 'Restaura o gestiona una suscripción de iPhone', paragraphs: ['Abre Mejorar → Restaurar compras con la cuenta de Apple que realizó la compra. Si no recuperas el acceso, envíanos el nombre del producto y lo que ves. No envíes datos de pago.', 'Gestiona o cancela la renovación en Ajustes de iPhone → tu nombre → Suscripciones. La web de ODA no vende suscripciones.'], route: '/app/upgrade', action: 'Abrir suscripciones' },
      { id: 'account', title: 'Inicia sesión o elimina una cuenta', paragraphs: ['Solicita un correo de acceso nuevo y revisa la carpeta de spam. En la app de iPhone, introduce el código de seis dígitos del último correo. Nunca lo compartas.', 'Elimina la cuenta de nube desde Cuenta → Eliminar mi cuenta. Se eliminan la cuenta y sus datos de nube. Para borrar también los datos locales, usa Ajustes → Restablecer todos los datos. Exporta antes si deseas conservar una copia.'], route: '/app/account', action: 'Abrir cuenta' },
      { id: 'care', title: 'Entiende cómo puede ayudarte ODA', paragraphs: ['ODA ofrece ejercicios educativos, reflexión y herramientas para el crecimiento personal cotidiano. No diagnostica, no ofrece tratamiento médico o psicológico ni garantiza un resultado concreto.', 'Si necesitas ayuda urgente o estás en peligro inmediato, contacta con los servicios de emergencia de tu zona o con alguien de confianza. Este correo de soporte no es un servicio de emergencias.'] },
    ],
  },
};

export function supportEmailHref(locale: Locale): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT[locale].subject)}`;
}
