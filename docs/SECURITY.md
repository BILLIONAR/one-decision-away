# ODA güvenliği

Amaç: saldırıyı pahalı ve zahmetli kılmak, bir şey olursa zararı küçük tutmak. "Hiç çalınamaz, hiç saldırılamaz" diye bir uygulama yok; ama aşağıdakiler bilinen saldırıların neredeyse tamamını kapatır.

## Uygulamada olanlar (kod ve testler)

| Tehdit | Önlem | Nerede |
| --- | --- | --- |
| Sayfaya kötü kod sokma (XSS), veri sızdırma | Sıkı İçerik Güvenliği Politikası (CSP): yalnızca kendi kodumuz çalışır; satır içi script, `eval`, eklenti yok; veri yalnızca bilinen adreslere gider (Supabase, model deposu, Unsplash görselleri, isteğe bağlı Gemini) | `index.html`, `tests/security.test.ts` |
| Ham HTML ekleme | Kodda `innerHTML` / `dangerouslySetInnerHTML` / `eval` yok; test bunu her derlemede denetler | `tests/security.test.ts` |
| Yeni sekmeden geri erişim (tabnabbing) | Dış bağlantılar `rel="noopener noreferrer"` | test |
| Başkasının verisini okuma/yazma | Supabase satır düzeyi güvenlik: herkes yalnızca kendi satırını görür, değiştirir, siler; anonim anahtar hiçbir şey okuyamaz; tek kayıt 5 MB sınırı | `supabase/schema.sql`, `tests/schema-rls.test.ts` (gerçek PostgreSQL'de) |
| Hesap silme uç noktasının kötüye kullanılması | Oturum anahtarı zorunlu, kişi yalnızca kendini silebilir; tarayıcıdan yalnızca ODA'nın kendi adresleri çağırabilir (CORS) | `supabase/functions/delete-account` |
| Bildirim sunucusu | Gizli anahtar sabit zamanlı karşılaştırılır, uç noktalar beyaz listede | `supabase/functions/send-nudges` |
| Gizli anahtarın koda karışması | Kodda `service_role`, özel anahtar, canlı ödeme anahtarı olamaz (test) | `tests/security.test.ts` |
| Pro'yu kandırma | Pro durumu cihazda saklanmaz; her açılışta Apple/RevenueCat'ten doğrulanır | `src/services/purchases.ts` |
| Paket açıkları | `npm audit`: 0 açık; Dependabot her hafta paketleri ve CI adımlarını günceller; CI adımları sabit sürüme (SHA) kilitli | `.github/dependabot.yml`, `.github/workflows` |
| iPhone uygulamasının kurcalanması | Yayın sürümünde Web Inspector kapalı; web görünümü yalnızca uygulamanın kendisini açar, başka her bağlantı Safari'de; Apple'ın imzası ve App Store taraması; yalnızca HTTPS (ATS) | `capacitor.config.ts` |
| Kaynak kodun okunması | Yayın kodu küçültülür (minify), kaynak haritası yok | `vite.config.ts` |

Not: Web'de çalışan her uygulamanın kodu tarayıcıya iner; küçültme okumayı zorlaştırır ama imkânsız kılmaz. Asıl değerli olanlar (kullanıcı verisi, satın almalar, sunucu anahtarları) sunucu tarafında ve yukarıdaki kurallarla korunuyor. Kurs metinleri uygulamanın içinde olduğundan teknik biri okuyabilir; Pro kilidi bir satış kapısıdır, kasa değil.

## Ümit'in panelde açması gerekenler

**Supabase → Authentication:**
- *URL Configuration*: Site URL `https://billionar.github.io/one-decision-away/`. Redirect URLs listesinde yalnızca bu adres (ve geliştirmedeysen `http://localhost:3000`).
- *Rate Limits*: e-posta gönderimi saatte düşük tut (ör. 4). Doğrulama denemeleri varsayılan sınırda kalsın.
- *Email*: OTP süresi 10 dakika (600 sn). "Secure email change" açık.
- *Attack Protection*: CAPTCHA (Cloudflare Turnstile) açılabilir; açılırsa bana söyle, giriş formuna eklerim.

**Supabase → Project Settings → API:** `service_role` anahtarı yalnızca Supabase fonksiyonlarının gizli ayarlarında durur. Uygulamaya, GitHub'a ya da sohbete asla yazılmaz.

**GitHub → Settings:**
- *Code security*: Dependabot alerts, Secret scanning, Push protection → açık.
- *Branches*: `main` için "Require status checks" (derleme ve testler geçmeden yayın olmasın).
- Hesabında iki adımlı doğrulama (2FA) açık olsun.

**Apple / RevenueCat:** iki hesapta da iki adımlı doğrulama. RevenueCat'te yalnızca herkese açık iOS anahtarı (`appl_…`) uygulamaya girer.
