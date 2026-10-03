import type { Locale } from './index';

const COPY = {
  en: {
    settingsHint: 'Sign in with an email code. Enter it in ODA without opening a browser.',
    continue: 'Sign in with a code',
    back: 'Back to Settings',
    summary: 'Sign in with an email code to back up your decisions and notes. Enter the code here in ODA.',
    local: 'Your decisions and notes stay on this device until you sign in.',
    request: 'Email me a sign-in code',
    newAccount: 'New here? The same code creates your account.',
    resend: 'Send a new code',
    resent: 'A new code was sent. Use the latest code from your email.',
    sendFailed: 'The code couldn’t be sent. Check your connection and try again.',
    verifyFailed: 'The code couldn’t be checked. Check your connection and try again.',
    backupLocal: 'Everything stays on this device. Download a backup regularly, or sign in to sync across your phone and laptop.',
  },
  tr: {
    settingsHint: 'E-posta koduyla giriş yap. Tarayıcı açmadan kodu ODA içinde gir.',
    continue: 'Kodla giriş yap',
    back: 'Ayarlara dön',
    summary: 'Kararlarını ve notlarını yedeklemek için e-posta koduyla giriş yap. Kodu burada, ODA içinde gir.',
    local: 'Giriş yapana kadar kararların ve notların bu cihazda kalır.',
    request: 'Bana giriş kodu gönder',
    newAccount: 'Yeni misin? Aynı kod hesabını oluşturur.',
    resend: 'Yeni kod gönder',
    resent: 'Yeni bir kod gönderildi. E-postandaki en son kodu kullan.',
    sendFailed: 'Kod gönderilemedi. Bağlantını kontrol edip yeniden dene.',
    verifyFailed: 'Kod kontrol edilemedi. Bağlantını kontrol edip yeniden dene.',
    backupLocal: 'Her şey bu cihazda kalır. Düzenli olarak yedek indir veya telefonunla bilgisayarın arasında eşitlemek için giriş yap.',
  },
  es: {
    settingsHint: 'Inicia sesión con un código por correo. Escríbelo en ODA sin abrir un navegador.',
    continue: 'Iniciar sesión con un código',
    back: 'Volver a Ajustes',
    summary: 'Inicia sesión con un código por correo para respaldar tus decisiones y notas. Escribe el código aquí, en ODA.',
    local: 'Tus decisiones y notas permanecen en este dispositivo hasta que inicies sesión.',
    request: 'Enviarme un código de acceso',
    newAccount: '¿Eres nuevo? El mismo código crea tu cuenta.',
    resend: 'Enviar un código nuevo',
    resent: 'Se envió un código nuevo. Usa el último código de tu correo.',
    sendFailed: 'No se pudo enviar el código. Comprueba tu conexión y vuelve a intentarlo.',
    verifyFailed: 'No se pudo comprobar el código. Comprueba tu conexión y vuelve a intentarlo.',
    backupLocal: 'Todo permanece en este dispositivo. Descarga una copia con frecuencia o inicia sesión para sincronizar entre tu teléfono y ordenador.',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export const accountCopy = (locale: Locale) => COPY[locale];
