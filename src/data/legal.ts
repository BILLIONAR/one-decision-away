/**
 * Privacy policy and terms of use for One Decision Away (ODA), published by
 * YAHYA. One source feeds the in-app pages (/privacy, /terms) and the static
 * pages under public/legal/ (scripts/build-legal.ts), which are the URLs given
 * to the App Store. Keep every statement true to what the code does.
 */
import { FEEDBACK_EMAIL } from './contact';

export const LEGAL_COMPANY = 'YAHYA';
export const LEGAL_CONTACT = FEEDBACK_EMAIL;
export const LEGAL_UPDATED = '2026-09-29';

export type LegalLang = 'tr' | 'en' | 'es';
export type LegalDoc = { title: string; updated: string; intro: string; sections: { heading: string; body: string[] }[] };

const C = LEGAL_COMPANY;
const M = LEGAL_CONTACT;

export const PRIVACY: Record<LegalLang, LegalDoc> = {
  tr: {
    title: 'Gizlilik Politikası',
    updated: 'Son güncelleme: 29 Eylül 2026',
    intro: `One Decision Away (“ODA”) ${C} tarafından geliştirilir ve sunulur. ODA’yı, verin mümkün olduğunca senin cihazında kalacak şekilde tasarladık. Bu metin neyi, neden ve nerede sakladığımızı sade bir dille anlatır.`,
    sections: [
      { heading: 'Kısaca', body: [
        'Reklam yok, izleme yok, üçüncü taraf analiz aracı yok. Verini satmıyoruz ve kimseyle pazarlama için paylaşmıyoruz.',
        'Hesap açmadan kullanırsan her şey yalnızca cihazında kalır.',
      ] },
      { heading: 'Cihazında sakladıkların', body: [
        'Adın, kararların, notların, hayallerin, alışkanlıkların, kanıt ağacın ve ayarların cihazının uygulama depolamasında tutulur. Biz bunları göremeyiz.',
        'İstediğin an Ayarlar’dan yedek indirebilir veya “Tüm verileri sil” ile hepsini silebilirsin.',
      ] },
      { heading: 'İsteğe bağlı hesap ve yedekleme', body: [
        'Giriş yaparsan e-posta adresin ve uygulama verilerin, yedeklenmesi ve cihazların arasında eşitlenmesi için Supabase altyapısında barındırılan veritabanımızda saklanır. Şifre kullanmayız; girişi e-postana gönderilen tek kullanımlık bağlantı ya da kodla yaparsın.',
        'Bu veriler yalnızca yedekleme ve eşitleme için kullanılır. Kayıtlara yalnızca kendi hesabınla erişilebilir.',
        'Hesabını uygulamanın içinden, Hesap sayfasındaki “Hesabımı sil” ile kalıcı olarak silebilirsin. Bu, hesabını ve bulutta tutulan bütün verini siler.',
      ] },
      { heading: 'Hatırlatmalar', body: [
        'iPhone uygulamasında hatırlatmalar cihazında planlanır. Web sürümünde bildirimleri açarsan, tarayıcının verdiği bildirim adresi ve seçtiğin saatler hatırlatma gönderebilmemiz için saklanır; bildirimleri kapatınca silinir.',
      ] },
      { heading: 'Cihaz içi yapay zekâ koçu', body: [
        'Cihaz içi koç, cihazında çalışan bir dil modeliyle çalışır. Bu koça yazdıkların bize ya da bir yapay zekâ şirketine gönderilmez. Model dosyaları ilk kullanımda herkese açık bir model deposundan (Hugging Face) indirilir.',
        'Ayarlar’dan kendi Google Gemini anahtarını eklersen, doğal seslendirme için okunacak rehber metni senin anahtarınla Google’a gönderilir. Bu isteğe bağlıdır.',
      ] },
      { heading: 'Bulut koçu (hesap gerekir)', body: [
        'Giriş yaptıysan koç sekmesinde bulut koçunu kullanabilirsin. Bulut koçuna yazdığın mesajlar (son birkaç mesaj ve dil seçimin), yanıtı yazabilmesi için sunucumuza ve oradan OpenAI’ın yapay zekâ hizmetine gönderilir. OpenAI’ın API veri politikası kapsamında, API üzerinden gönderilen içerik modelleri eğitmek için kullanılmaz.',
        'ODA mesajlarını ve koçun yanıtlarını saklamaz ve kayıt tutmaz; yalnızca aylık mesaj sayacını (kaç mesaj kullandığını) ve seviyeni doğrulamak için kısa süreli bir önbellek kaydını hesabınla birlikte tutar. Seviyeni doğrulamak için hesap kimliğin RevenueCat’e gönderilir.',
        'En üst seviyede “Koç bugünün kararını ve defterindeki son satırları okuyabilsin” seçeneğini kendin açarsan, bugünün kararın, son tuttuğun kararlar ve defterinden birkaç kısa satır da mesajınla birlikte gönderilir. Bu seçenek varsayılan olarak kapalıdır ve istediğin an kapatabilirsin.',
        'Bulut koçu bir yapay zekâdır; terapist ya da acil yardım hizmeti değildir. Kendine zarar verme, istismar veya acil tehlike belirten mesajlarda koçluğu bırakır ve yerel acil servisleri (Türkiye’de 112) aramanı önerir. Bulut koçunu kullanmak istemezsen hesap açmana gerek yoktur; cihaz içi koç ve çevrimdışı araçlar her zaman kullanılabilir.',
      ] },
      { heading: 'Görseller', body: [
        'Kurslardaki fotoğraflar Unsplash’tan yüklenir. Her web isteğinde olduğu gibi Unsplash, fotoğrafı gönderebilmek için IP adresini görür.',
      ] },
      { heading: 'Satın alımlar', body: [
        'ODA abonelikleri (Essentials, Pro, Pro Coach) Apple üzerinden satın alınır; ödeme bilgilerini biz görmeyiz. Aboneliğinin durumunu doğrulamak için RevenueCat hizmetini kullanırız; RevenueCat anonim bir uygulama kimliği ve satın alma kayıtlarını işler.',
      ] },
      { heading: 'Saklama süresi ve hakların', body: [
        'Bulut verin, hesabın açık olduğu sürece saklanır ve hesabını sildiğinde silinir. Cihazındaki veri, uygulamayı silene veya verileri silene kadar cihazında kalır.',
        `KVKK ve GDPR kapsamındaki erişim, düzeltme, silme, taşıma ve itiraz haklarını kullanmak için ${M} adresine yazabilirsin. Veri sorumlusu ${C}’dır.`,
      ] },
      { heading: 'Çocuklar', body: [
        'ODA 13 yaşın altındaki çocuklara yönelik değildir ve bu yaştaki çocuklardan bilerek veri toplamayız.',
      ] },
      { heading: 'Değişiklikler ve iletişim', body: [
        `Bu politikayı değiştirirsek güncelleme tarihini yenileriz; önemli değişiklikleri uygulamada duyururuz. Sorun için: ${M}`,
      ] },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: 29 September 2026',
    intro: `One Decision Away (“ODA”) is developed and provided by ${C}. We designed ODA so that your data stays on your device as much as possible. This page explains, in plain words, what we keep, why and where.`,
    sections: [
      { heading: 'In short', body: [
        'No ads, no tracking, no third-party analytics. We do not sell your data or share it with anyone for marketing.',
        'If you use ODA without an account, everything stays on your device.',
      ] },
      { heading: 'What stays on your device', body: [
        'Your name, decisions, notes, dreams, habits, evidence tree and settings are kept in the app’s storage on your device. We cannot see them.',
        'You can download a backup or erase everything with “Delete all data” in Settings at any time.',
      ] },
      { heading: 'Optional account and backup', body: [
        'If you sign in, your email address and app data are stored in our database, hosted on Supabase infrastructure, to back them up and keep your devices in sync. We use no passwords: you sign in with a one-time link or code sent to your email.',
        'This data is used only for backup and sync. Records can be read only with your own account.',
        'You can permanently delete your account inside the app with “Delete my account” on the Account page. This removes your account and all of your cloud data.',
      ] },
      { heading: 'Reminders', body: [
        'In the iPhone app, reminders are scheduled on your device. On the web, if you turn on notifications, the notification address your browser provides and the times you choose are stored so we can send reminders; they are deleted when you turn notifications off.',
      ] },
      { heading: 'On-device AI coach', body: [
        'The on-device coach runs on a language model on your device. What you write to it is not sent to us or to an AI company. The model files are downloaded from a public model host (Hugging Face) the first time you use it.',
        'If you add your own Google Gemini key in Settings, the guidance text to be read aloud is sent to Google with your key for natural voices. This is optional.',
      ] },
      { heading: 'Cloud coach (account required)', body: [
        'If you are signed in, you can use the cloud coach in the Coach tab. The messages you write to it (the last few messages and your language) are sent to our server and from there to OpenAI’s AI service to generate the reply. Under OpenAI’s API data policy, content sent through the API is not used to train its models.',
        'ODA does not store your messages or the coach’s replies and keeps no log of them. We keep only a monthly message counter (how many messages you have used) and a short-lived cache of your subscription level, both tied to your account. To confirm your level, your account ID is sent to RevenueCat.',
        'At the top level, if you switch on “Let the coach read today’s decision and recent notebook lines”, your decision for today, your recently kept decisions and a few short notebook lines are sent with your message. This is off by default and you can turn it off at any time.',
        'The cloud coach is an AI, not a therapist or an emergency service. If a message mentions self-harm, abuse or immediate danger, the coach stops coaching and encourages you to contact local emergency services (911 in the US, 112 in Türkiye). You never need an account to use the on-device coach and the offline tools.',
      ] },
      { heading: 'Images', body: [
        'Course photos load from Unsplash. As with any web request, Unsplash sees your IP address in order to deliver the photo.',
      ] },
      { heading: 'Purchases', body: [
        'ODA subscriptions (Essentials, Pro, Pro Coach) are bought through Apple; we never see your payment details. We use RevenueCat to confirm your subscription status; RevenueCat processes an anonymous app user ID and purchase records.',
      ] },
      { heading: 'Retention and your rights', body: [
        'Cloud data is kept while your account exists and is deleted when you delete your account. Data on your device stays there until you delete the app or the data.',
        `To exercise your rights to access, correct, delete, port or object under GDPR and Turkey’s KVKK, write to ${M}. The data controller is ${C}.`,
      ] },
      { heading: 'Children', body: [
        'ODA is not directed at children under 13, and we do not knowingly collect data from them.',
      ] },
      { heading: 'Changes and contact', body: [
        `If we change this policy we update the date above and announce important changes in the app. Questions: ${M}`,
      ] },
    ],
  },
  es: {
    title: 'Política de privacidad',
    updated: 'Última actualización: 29 de septiembre de 2026',
    intro: `One Decision Away (“ODA”) es desarrollada y ofrecida por ${C}. Diseñamos ODA para que tus datos se queden en tu dispositivo en la medida de lo posible. Aquí explicamos con claridad qué guardamos, por qué y dónde.`,
    sections: [
      { heading: 'En resumen', body: [
        'Sin anuncios, sin rastreo, sin herramientas de analítica de terceros. No vendemos tus datos ni los compartimos con nadie para marketing.',
        'Si usas ODA sin cuenta, todo se queda en tu dispositivo.',
      ] },
      { heading: 'Lo que se queda en tu dispositivo', body: [
        'Tu nombre, decisiones, notas, sueños, hábitos, árbol de evidencias y ajustes se guardan en el almacenamiento de la app en tu dispositivo. Nosotros no podemos verlos.',
        'Puedes descargar una copia o borrarlo todo con “Borrar todos los datos” en Ajustes cuando quieras.',
      ] },
      { heading: 'Cuenta opcional y copia de seguridad', body: [
        'Si inicias sesión, tu correo y los datos de la app se guardan en nuestra base de datos, alojada en la infraestructura de Supabase, para hacer copia y sincronizar tus dispositivos. No usamos contraseñas: entras con un enlace o código de un solo uso enviado a tu correo.',
        'Estos datos solo se usan para la copia y la sincronización. Los registros solo se pueden leer con tu propia cuenta.',
        'Puedes eliminar tu cuenta de forma permanente dentro de la app con “Eliminar mi cuenta” en la página Cuenta. Eso borra tu cuenta y todos tus datos en la nube.',
      ] },
      { heading: 'Recordatorios', body: [
        'En la app de iPhone los recordatorios se programan en tu dispositivo. En la web, si activas las notificaciones, guardamos la dirección de notificación que da tu navegador y las horas que eliges para poder enviarlos; se borran al desactivarlas.',
      ] },
      { heading: 'Coach con IA en el dispositivo', body: [
        'El coach en el dispositivo funciona con un modelo de lenguaje en tu dispositivo. Lo que le escribes no se envía ni a nosotros ni a ninguna empresa de IA. Los archivos del modelo se descargan de un repositorio público (Hugging Face) la primera vez que lo usas.',
        'Si añades tu propia clave de Google Gemini en Ajustes, el texto de la guía que se leerá en voz alta se envía a Google con tu clave para voces naturales. Es opcional.',
      ] },
      { heading: 'Coach en la nube (requiere cuenta)', body: [
        'Si has iniciado sesión, puedes usar el coach en la nube en la pestaña Coach. Los mensajes que le escribes (los últimos mensajes y tu idioma) se envían a nuestro servidor y desde allí al servicio de IA de OpenAI para generar la respuesta. Según la política de datos de la API de OpenAI, el contenido enviado por la API no se usa para entrenar sus modelos.',
        'ODA no guarda tus mensajes ni las respuestas del coach y no conserva ningún registro de ellos. Solo guardamos un contador mensual de mensajes (cuántos has usado) y una copia temporal de tu nivel de suscripción, ambos vinculados a tu cuenta. Para confirmar tu nivel, el identificador de tu cuenta se envía a RevenueCat.',
        'En el nivel superior, si activas “Que el coach lea la decisión de hoy y las últimas líneas del cuaderno”, se envían junto con tu mensaje tu decisión de hoy, tus decisiones cumplidas recientes y algunas líneas cortas del cuaderno. Está desactivado por defecto y puedes desactivarlo cuando quieras.',
        'El coach en la nube es una IA, no un terapeuta ni un servicio de emergencias. Si un mensaje menciona autolesiones, abuso o peligro inmediato, el coach deja de hacer coaching y te anima a contactar con los servicios de emergencia locales (112 en Türkiye y en España, 911 en EE. UU.). Nunca necesitas una cuenta para usar el coach en el dispositivo y las herramientas sin conexión.',
      ] },
      { heading: 'Imágenes', body: [
        'Las fotos de los cursos se cargan desde Unsplash. Como en cualquier solicitud web, Unsplash ve tu dirección IP para poder enviar la foto.',
      ] },
      { heading: 'Compras', body: [
        'Las suscripciones de ODA (Essentials, Pro, Pro Coach) se compran a través de Apple; nunca vemos tus datos de pago. Usamos RevenueCat para confirmar el estado de tu suscripción; RevenueCat procesa un identificador anónimo de la app y los registros de compra.',
      ] },
      { heading: 'Conservación y tus derechos', body: [
        'Los datos en la nube se conservan mientras exista tu cuenta y se borran cuando la eliminas. Los datos del dispositivo se quedan ahí hasta que borres la app o los datos.',
        `Para ejercer tus derechos de acceso, rectificación, supresión, portabilidad u oposición según el RGPD y la KVKK de Turquía, escribe a ${M}. El responsable del tratamiento es ${C}.`,
      ] },
      { heading: 'Menores', body: [
        'ODA no está dirigida a menores de 13 años y no recopilamos datos de ellos a sabiendas.',
      ] },
      { heading: 'Cambios y contacto', body: [
        `Si cambiamos esta política actualizamos la fecha y anunciamos los cambios importantes en la app. Preguntas: ${M}`,
      ] },
    ],
  },
};

export const TERMS: Record<LegalLang, LegalDoc> = {
  tr: {
    title: 'Kullanım Koşulları',
    updated: 'Son güncelleme: 27 Eylül 2026',
    intro: `Bu koşullar, ${C} tarafından sunulan One Decision Away (“ODA”) uygulamasını ve web sitesini kullanımını düzenler. ODA’yı kullanarak bu koşulları kabul etmiş olursun.`,
    sections: [
      { heading: 'ODA nedir, ne değildir', body: [
        'ODA; günlük kararlar, alışkanlıklar, kurslar ve sesler aracılığıyla kişisel gelişimini desteklemek için tasarlanmış bir araçtır.',
        'ODA tıbbi, psikolojik, hukuki veya finansal tavsiye vermez; tedavi yerine geçmez. Ses Odası ve meditasyonlar sağlık iddiası taşımaz. Kendini kötü hissediyorsan bir uzmana veya yerel acil hatlara başvur.',
      ] },
      { heading: 'Hesap', body: [
        'Hesap açmak isteğe bağlıdır. Hesabının güvenliğinden, e-posta adresine erişimin korunmasından sen sorumlusun. Hesabını istediğin an uygulamanın içinden silebilirsin.',
      ] },
      { heading: 'ODA abonelikleri', body: [
        'Günlük karar, kanıt ağacı ve defter her zaman ücretsizdir. ODA abonelikleri (Essentials, Pro, Pro Coach), ek içerikler ve daha fazla yapay zekâ koçu kullanımı sunan isteğe bağlı aboneliklerdir.',
        'Abonelik Apple Kimliği hesabın üzerinden satın alınır ve dönem bitmeden en az 24 saat önce iptal edilmezse otomatik olarak yenilenir. Ücret, onayladığın anda ve her yenilemede Apple Kimliği hesabından alınır.',
        'Ücretsiz deneme sunulursa, deneme bitmeden iptal etmediğin sürece abonelik başlar. Denemenin kullanılmamış kısmı abonelik satın alındığında sona erer.',
        'Aboneliğini iPhone’unda Ayarlar › Apple Kimliği › Abonelikler bölümünden yönetebilir ve iptal edebilirsin. İadeler Apple’ın kurallarına tabidir.',
      ] },
      { heading: 'Hayal Doları (D$)', body: [
        'D$, sözünü tuttukça kazandığın uygulama içi bir puandır. Parasal değeri yoktur, satın alınamaz, satılamaz ve nakde çevrilemez.',
      ] },
      { heading: 'İçerik ve kullanım', body: [
        `Uygulamadaki metinler, kurslar, sesler, tasarım ve marka ${C}’ya veya lisans verenlerine aittir. Sana ODA’yı kişisel ve ticari olmayan amaçlarla kullanman için devredilemez, sınırlı bir lisans veririz.`,
        'Yazdığın notlar ve kararlar sana aittir. Uygulamayı kötüye kullanmamayı, güvenliğini aşmaya çalışmamayı ve başkalarının haklarını ihlal etmemeyi kabul edersin.',
      ] },
      { heading: 'Sorumluluk', body: [
        'ODA “olduğu gibi” sunulur. Yürürlükteki hukukun izin verdiği ölçüde, ODA’yı kullanmandan doğan dolaylı zararlardan sorumlu değiliz. Tüketici olarak kanundan doğan hakların saklıdır.',
      ] },
      { heading: 'Değişiklikler, hukuk ve iletişim', body: [
        'Koşulları değiştirirsek tarihi güncelleriz; önemli değişiklikleri uygulamada duyururuz.',
        `Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir; tüketici mevzuatından doğan hakların saklıdır. İletişim: ${M}`,
      ] },
    ],
  },
  en: {
    title: 'Terms of Use',
    updated: 'Last updated: 27 September 2026',
    intro: `These terms govern your use of the One Decision Away (“ODA”) app and website provided by ${C}. By using ODA you agree to them.`,
    sections: [
      { heading: 'What ODA is and is not', body: [
        'ODA is a tool designed to support personal growth through daily decisions, habits, courses and sounds.',
        'ODA does not give medical, psychological, legal or financial advice and is not a substitute for treatment. The Sound Room and meditations make no health claims. If you are struggling, reach out to a professional or your local emergency line.',
      ] },
      { heading: 'Account', body: [
        'An account is optional. You are responsible for keeping access to your email secure. You can delete your account inside the app at any time.',
      ] },
      { heading: 'ODA subscriptions', body: [
        'Today’s decision, the evidence tree and the notebook are always free. ODA subscriptions (Essentials, Pro, Pro Coach) are optional and add more content and more AI coach use.',
        'Subscriptions are bought with your Apple ID and renew automatically unless cancelled at least 24 hours before the end of the current period. Payment is charged to your Apple ID account at confirmation and at each renewal.',
        'If a free trial is offered, the subscription starts when it ends unless you cancel before then. Any unused part of a trial ends when you buy a subscription.',
        'You can manage and cancel your subscription in iPhone Settings › Apple ID › Subscriptions. Refunds follow Apple’s rules.',
      ] },
      { heading: 'Dream Dollars (D$)', body: [
        'D$ are in-app points you earn by keeping your word. They have no monetary value and cannot be bought, sold or exchanged for money.',
      ] },
      { heading: 'Content and use', body: [
        `The texts, courses, sounds, design and brand in the app belong to ${C} or its licensors. We grant you a limited, non-transferable licence to use ODA for personal, non-commercial purposes.`,
        'Your notes and decisions are yours. You agree not to misuse the app, try to break its security or infringe the rights of others.',
      ] },
      { heading: 'Liability', body: [
        'ODA is provided “as is”. To the extent the law allows, we are not liable for indirect damages arising from your use of ODA. Your statutory rights as a consumer are not affected.',
      ] },
      { heading: 'Changes, law and contact', body: [
        'If we change these terms we update the date and announce important changes in the app.',
        `These terms are governed by the laws of the Republic of Türkiye, without prejudice to your statutory consumer rights. Contact: ${M}`,
      ] },
    ],
  },
  es: {
    title: 'Términos de uso',
    updated: 'Última actualización: 27 de septiembre de 2026',
    intro: `Estos términos regulan el uso de la app y la web One Decision Away (“ODA”) ofrecidas por ${C}. Al usar ODA los aceptas.`,
    sections: [
      { heading: 'Qué es ODA y qué no es', body: [
        'ODA es una herramienta pensada para apoyar tu crecimiento personal con decisiones diarias, hábitos, cursos y sonidos.',
        'ODA no ofrece consejo médico, psicológico, legal ni financiero y no sustituye ningún tratamiento. La Sala de sonido y las meditaciones no hacen afirmaciones de salud. Si lo estás pasando mal, busca a un profesional o la línea de emergencias local.',
      ] },
      { heading: 'Cuenta', body: [
        'Crear una cuenta es opcional. Eres responsable de mantener seguro el acceso a tu correo. Puedes eliminar tu cuenta dentro de la app cuando quieras.',
      ] },
      { heading: 'Suscripciones de ODA', body: [
        'La decisión del día, el árbol de evidencias y el cuaderno son siempre gratuitos. Las suscripciones de ODA (Essentials, Pro, Pro Coach) son opcionales y añaden más contenido y más uso del coach de IA.',
        'Las suscripciones se compran con tu Apple ID y se renuevan automáticamente salvo que las canceles al menos 24 horas antes del final del periodo. El cobro se hace en tu cuenta de Apple ID al confirmar y en cada renovación.',
        'Si se ofrece una prueba gratuita, la suscripción empieza al terminar salvo que canceles antes. La parte no usada de una prueba termina al comprar una suscripción.',
        'Puedes gestionar y cancelar tu suscripción en Ajustes del iPhone › Apple ID › Suscripciones. Los reembolsos siguen las normas de Apple.',
      ] },
      { heading: 'Dólares de sueño (D$)', body: [
        'Los D$ son puntos de la app que ganas cumpliendo tu palabra. No tienen valor monetario y no se pueden comprar, vender ni cambiar por dinero.',
      ] },
      { heading: 'Contenido y uso', body: [
        `Los textos, cursos, sonidos, diseño y marca de la app pertenecen a ${C} o a sus licenciantes. Te concedemos una licencia limitada e intransferible para usar ODA con fines personales y no comerciales.`,
        'Tus notas y decisiones son tuyas. Aceptas no hacer un mal uso de la app, no intentar vulnerar su seguridad y no infringir derechos de terceros.',
      ] },
      { heading: 'Responsabilidad', body: [
        'ODA se ofrece “tal cual”. En la medida que permita la ley, no somos responsables de daños indirectos derivados del uso de ODA. Tus derechos legales como consumidor no se ven afectados.',
      ] },
      { heading: 'Cambios, ley y contacto', body: [
        'Si cambiamos estos términos actualizamos la fecha y anunciamos los cambios importantes en la app.',
        `Estos términos se rigen por las leyes de la República de Turquía, sin perjuicio de tus derechos como consumidor. Contacto: ${M}`,
      ] },
    ],
  },
};
