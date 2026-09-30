# ODA'yı App Store'a çıkarmak

Bu belge iki kısımdır: depoda **hazır olanlar** ve yayına çıkmak için **Ümit'in yapması gerekenler**. En altta App Store Connect'e yapıştırılacak metinler var.

Satıcı: **bireysel Apple Developer hesabı** (mağazada kişi adı görünür) · Uygulama adı: **ODA – One Decision Away** · Paket kimliği (bundle ID): `com.yahya.onedecisionaway`

## Depoda hazır olanlar

| Konu | Nerede | Not |
| --- | --- | --- |
| iOS uygulama kabuğu (Capacitor 8, Swift Package Manager; CocoaPods gerekmez) | `ios/`, `capacitor.config.ts` | iOS 16.4 ve üzeri; sadece iPhone, dikey ekran. Ekran üstü/altı güvenli alanlar hesaba katıldı. |
| Uygulama ikonu (1024 px, opak) ve açılış ekranı | `ios/App/App/Assets.xcassets` | C4 logosundan üretildi, logo değiştirilmedi. |
| Cihazda hatırlatmalar | `src/services/nativeNotifications.ts` | Uygulama kapalıyken de çalışır; 7 gün önceden planlanır, karar tutulunca bugünün hatırlatması kalkar. |
| Titreşim (haptic) | `src/services/native.ts` | Karar tutulunca başarı titreşimi, alışkanlık işaretlenince hafif dokunuş. |
| Destek sayfası (TR/EN/ES) | Uygulamada `/app/support`; statik: `public/support.html` | Hesap gerekmez; iletişim, yedekleme, kurs, bildirim, abonelik ve hesap yardımı. İçerik: `src/data/support.ts`; üretim: `npx tsx scripts/build-support.ts`. |
| Durum çubuğu temaya uyar | `src/utils/theme.ts` | |
| Uygulama içi hesap silme (Kural 5.1.1(v)) | Hesap sayfası → "Hesabımı sil"; `supabase/functions/delete-account` | Tüm tablolar `on delete cascade`, bulut verisi hesapla birlikte silinir. |
| E-postadaki 6 haneli kodla giriş | Hesap sayfası | iPhone uygulaması web bağlantısı açamadığı için kod girişi eklendi. |
| Gizlilik politikası ve kullanım koşulları (TR/EN/ES) | Uygulamada `/privacy`, `/terms`; statik: `public/legal/privacy.html`, `public/legal/terms.html` | Yayındaki adresler aşağıda. `src/data/legal.ts` değişince `npm run legal`. |
| ODA abonelik seviyeleri: Essentials, Pro, Pro Coach (RevenueCat) | `src/services/purchases.ts`, `src/pages/Upgrade.tsx` | Fiyatlar App Store'dan gelir; aylık/yıllık seçici, üç seviye kartı, karşılaştırma tablosu, deneme zaman çizelgesi (yalnızca Pro yıllık), geri yükleme ve Apple yenileme metni ekranda. Web'de satış yok, her şey açık. |
| Seviye kilitleri (yalnızca iPhone'da ve satın alma açıkken) | `src/services/entitlements.ts` | Ücretsiz: günlük karar, kanıt ağacı, defter, yedekleme, Dönüm Noktası Günü kursunun tamamı, her kursun ilk 2 dersi, Ses Odası'nda her kategorinin ilk 2 sesi, ayda 30 koç mesajı. Essentials: 6 temel kurs (erteleme, odak, uyku, stres ve sakinlik, özgüven, motivasyon) tamamen + Ses Odası'nın tamamı + ayda 150 mesaj. Pro: 18 kursun tamamı + ayda 600 mesaj. Pro Coach: ayda 3000 mesaj (adil kullanım), haftalık kişisel plan, izinle defter ve kararları okuyan koç, sesli yanıt. |
| Bulut yapay zekâ koçu (hesap gerekir, seviyeye göre aylık mesaj sınırı) | `supabase/functions/coach-chat`, `src/services/cloudCoach.ts`, `src/pages/Coach.tsx` | Mesajlar sunucumuz üzerinden OpenAI'a gider, saklanmaz; yalnızca aylık sayaç tutulur. Kriz kelimelerinde model çağrılmadan güvenli mesaj gösterilir. Kurulum: `docs/AI_COACH.md`. |

Gizlilik ve koşullar adresleri (App Store Connect'e bunlar girilir):

- https://billionar.github.io/one-decision-away/legal/privacy.html
- https://billionar.github.io/one-decision-away/legal/terms.html

## Ümit'in yapması gerekenler (sırasıyla)

1. **Apple Developer Program** üyeliği (yıllık 99 $). Hesap **bireysel** açıldı: satıcı adı kişi adı olarak görünür. "YAHYA" adının satıcı adı olması için ileride kayıtlı bir şirket ve D-U-N-S numarası gerekir (hesap türü sonradan değiştirilebilir).
2. **Mac'te Xcode**: App Store'dan Xcode'u kur, sonra Terminal'de bir kez `sudo xcodebuild -license accept` çalıştır (şifreyi senin girmen gerekiyor).
3. **App Store Connect'te uygulamayı oluştur**: Uygulamalar → + → Yeni Uygulama. Platform iOS, ad "ODA – One Decision Away", birincil dil Türkçe, bundle ID `com.yahya.onedecisionaway` (Certificates, Identifiers & Profiles'ta önce bu kimliği oluştur).
4. **Abonelikleri oluştur** (App Store Connect → uygulama → Abonelikler). Tek abonelik grubu: `ODA`. Grup içi seviye sırası (1 en yüksek): **coach = 1, pro = 2, essentials = 3**; böylece seviyeler arası geçiş yükseltme/düşürme olur, ikinci abonelik açılmaz.

   | Seviye | Ürün kimliği | Süre | Önerilen fiyat |
   | --- | --- | --- | --- |
   | Essentials | `oda_essentials_monthly` | 1 ay | 3,99 $ |
   | Essentials | `oda_essentials_annual` | 1 yıl | 29,99 $ |
   | Pro | `oda_pro_monthly` | 1 ay | 7,99 $ |
   | Pro | `oda_pro_annual` | 1 yıl | 49,99 $ · tanıtım teklifi: 1 hafta ücretsiz |
   | Pro Coach | `oda_coach_monthly` | 1 ay | 14,99 $ |
   | Pro Coach | `oda_coach_annual` | 1 yıl | 99,99 $ |

   - Görünen ad ve açıklamalar (TR/EN/ES, sınır 30 ve 45 karakter): `store/subscriptions.json`.
   - Fiyatlar öneri; istediğin gibi değiştir, uygulama App Store fiyatını otomatik gösterir. "Yüzde x tasarruf" rozeti gerçek fiyatlardan hesaplanır.
5. **RevenueCat** hesabı (ücretsiz başlar): yeni proje → iOS uygulaması (bundle ID yukarıdaki) → App Store Connect'ten In-App Purchase anahtarını bağla → üç Entitlement, kimlikleri tam olarak `essentials`, `pro`, `coach` (her biri kendi iki ürününe bağlı; uygulama en yüksek etkin olanı seçer: coach > pro > essentials) → Offering `default`, içine altı ürünün hepsini ekle (paketleri ürün kimliğiyle bulur; eksik ürün "Fiyat App Store'da gösterilir" olarak görünür). Sonra **Public iOS SDK key**'i (`appl_` ile başlar) bana gönder ya da `.env` dosyasına `VITE_REVENUECAT_IOS_KEY` olarak yaz. Bu anahtar herkese açık türdendir; gizli anahtarları asla sohbete yapıştırma.
6. **Supabase** (hesap ve yedekleme için):
   - SQL: `supabase/schema.sql` (ve istersen `push-notifications.sql`).
   - Authentication → Email Templates → "Magic Link" şablonuna `{{ .Token }}` satırını ekle ("Giriş kodun: {{ .Token }}"). iPhone'da giriş bu kodla yapılır.
   - Hesap silme fonksiyonu: `supabase functions deploy delete-account` (JWT doğrulaması açık kalsın).
   - Bulut koçu fonksiyonu: `supabase functions deploy coach-chat` (JWT doğrulaması açık kalsın) ve iki gizli anahtar (`OPENAI_API_KEY`, `REVENUECAT_SECRET_KEY`). Adımlar: `docs/AI_COACH.md`. Bunlar olmadan uygulama çalışır; bulut koçu görünmez, cihaz içi koç kalır.
   - Project URL ve anon key'i GitHub → Settings → Variables'a `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` olarak ekle.
7. **Derle ve yükle** (Mac'te, proje klasöründe):
   ```
   npm ci
   VITE_SUPABASE_URL=… VITE_SUPABASE_ANON_KEY=… VITE_REVENUECAT_IOS_KEY=appl_… npm run build:ios
   npx cap open ios
   ```
   Xcode'da: App hedefi → Signing & Capabilities → Team seç; **In-App Purchase** ve **Push Notifications gerekmez** (hatırlatmalar yerel). Sonra Product → Archive → Distribute App → App Store Connect.
8. **TestFlight**'ta kendi telefonunda dene: satın almayı sandbox hesabıyla test et, "Satın alımları geri yükle"yi dene, hesap açıp sil.
9. **İncelemeye gönder** (metinler aşağıda).

## App Store Connect metinleri

**Ad (30):** ODA – One Decision Away
**Alt başlık (30), TR:** Her gün tek karar, küçük adım · **EN:** One decision a day, kept

**Kategori:** Sağlık ve Fitness (ikincil: Yaşam Tarzı) · **Yaş sınırı:** 4+ (anketin tamamında "Yok") · **Fiyat:** Ücretsiz, uygulama içi satın alma var

**Anahtar kelimeler (100), TR:** alışkanlık,karar,motivasyon,meditasyon,odak,erteleme,günlük,özgüven,uyku,nefes,kişisel gelişim
**EN:** habit,decision,motivation,meditation,focus,procrastination,journal,confidence,sleep,breath,growth

**Tanıtım metni (170), TR:** Korksan da başlayabilirsin. Her gün tek bir küçük karar ver, yap, işaretle. Tuttuğun her söz kanıt ağacında bir yaprak olur.

**Açıklama, TR:**

> ODA, büyük hedefleri bugün atabileceğin tek bir küçük karara indirir.
>
> Her sabah bugünün tek kararını yaz. Küçük tut: iki dakikada başlanabilecek kadar. Yaptığında işaretle. Tuttuğun her söz kanıt ağacında bir yaprak açar; motivasyon çoğu zaman eylemden sonra gelir ve ODA bunu sana her gün gösterir.
>
> İçinde neler var:
> • Bugünün tek kararı ve engellere 30 saniyelik plan
> • Kanıt ağacı ve haftalık geriye bakış
> • Defter, hayaller ve üç küçük alışkanlık
> • Rehberli kurslar: erteleme, odak, uyku, stres, özgüven, meditasyon, telkin ve daha fazlası
> • Ses Odası: sakinlik, uyku, odak ve nefes için sesler
> • Cihazında çalışan yapay zekâ koçu: yazdıkların cihazından çıkmaz. Hesap açarsan isteğe bağlı bulut koçu da var
> • Akıllı hatırlatmalar: günde en fazla iki, gerçekten işe yarayınca
>
> Reklam yok, izleme yok. Hesap açmak isteğe bağlı; açarsan kanıtların yedeklenir ve her cihazda seninle olur.
>
> ODA Essentials altı temel kursu ve Ses Odası'nın tamamını açar; ODA Pro bütün kursları; ODA Pro Coach ayrıca haftalık kişisel plan ve izninle defterini okuyan bir koç ekler. Günlük karar, kanıt ağacı, defter ve yedekleme her zaman ücretsiz.
>
> ODA tıbbi ya da psikolojik tavsiye vermez ve tedavinin yerine geçmez.
>
> Kullanım koşulları: https://billionar.github.io/one-decision-away/legal/terms.html
> Gizlilik: https://billionar.github.io/one-decision-away/legal/privacy.html

**Description, EN:**

> ODA turns big goals into one small decision you can keep today.
>
> Each morning, write today's one decision. Keep it small enough to start in two minutes. Mark it when it's done. Every promise you keep grows a leaf on your evidence tree: motivation usually follows action, and ODA shows you that every day.
>
> Inside: today's one decision with a 30-second obstacle plan, the evidence tree and a weekly look-back, a notebook, dreams and three small habits, guided courses (procrastination, focus, sleep, stress, confidence, meditation and more), a Sound Room for calm, sleep, focus and breath, an AI coach that runs on your device (plus an optional cloud coach with an account), and smart reminders (at most two a day).
>
> No ads, no tracking. An account is optional; with one, your proof is backed up and follows you to every device.
>
> ODA Essentials opens six core courses and the whole Sound Room; ODA Pro opens every course; ODA Pro Coach adds a weekly personal plan and a coach that reads your journal with your consent. Today's decision, the evidence tree, the notebook and backup stay free.
>
> ODA does not give medical or psychological advice and is not a substitute for treatment.

**Destek adresi:** https://billionar.github.io/one-decision-away/support.html · **İletişim:** ufrldk13@gmail.com

## Uygulama gizlilik etiketi (App Privacy)

"Veri topluyor musunuz?" → **Evet**, yalnızca hesap açan ve satın alan kullanıcılar için:

| Veri türü | Kullanıcıya bağlı mı | Amaç | İzleme |
| --- | --- | --- | --- |
| İletişim bilgisi → E-posta adresi | Evet | Uygulama işlevselliği | Hayır |
| Kullanıcı içeriği → Diğer kullanıcı içeriği (kararlar, notlar; bulut koçuna yazılan mesajlar) | Evet | Uygulama işlevselliği | Hayır |
| Satın almalar → Satın alma geçmişi | Evet | Uygulama işlevselliği | Hayır |
| Tanımlayıcılar → Kullanıcı kimliği | Evet | Uygulama işlevselliği | Hayır |

Reklam, analiz, konum, sağlık verisi yok; izleme (tracking) yok.

**Bulut koçu notu:** Kullanıcı içeriği satırı, bulut koçuna yazılan mesajlar için de geçerlidir (yalnızca hesap açan ve koçu kullanan kişiler). Mesajlar yanıt üretmek için sunucumuz üzerinden OpenAI'a gönderilir; ODA bunları saklamaz, yalnızca aylık mesaj sayacını tutar; OpenAI'ın API veri politikası kapsamında modelleri eğitmek için kullanılmaz. Amaç yalnızca **Uygulama işlevselliği**; reklam, izleme veya üçüncü tarafla pazarlama paylaşımı yoktur, dolayısıyla **İzleme: Hayır**. Apple'ın "toplanan veri" tanımına karşı temkinli davranıp bu satırı işaretli bırakıyoruz. Pro Coach'taki "bugünün kararını ve defter satırlarını oku" seçeneği kapalı gelir; kullanıcı açarsa aynı kategoriye girer.

## İnceleme notu (App Review Information → Notes)

> ODA works fully without an account; no sign-in is needed to review it. Accounts are optional and use a one-time email code; accounts can be deleted in-app (Me → Account → Delete my account). ODA offers three auto-renewable subscription levels (Essentials, Pro, Pro Coach) in one subscription group "ODA"; the paywall is at Me → Pro plan and includes Restore Purchases, the trial timeline and links to the Terms and Privacy Policy. The Coach tab has two parts. The on-device coach runs entirely on the device and downloads a language model (about 1.1 GB) only when the user starts it. The optional cloud coach uses a cloud AI (OpenAI, through our own server): it needs a signed-in account, has a monthly message limit per subscription level, and is not needed to review the app; the on-device coach and the offline exercises work without it. Messages are sent to our server and to OpenAI only to write the reply and are not stored by us; the app says so next to the message box. The coach presents itself as an AI, not a therapist. Crisis handling: if a message mentions self-harm, suicide, abuse or immediate danger (English, Turkish, Spanish), the server does not call the AI but returns a fixed, caring message that points to local emergency services (112 in Türkiye and Europe, 911 and 988 in the US), and the AI's own instructions also require it to stop coaching and point to emergency help in that case. The Sound Room makes no health claims and shows this in the app.

## Ekran görüntüleri

Zorunlu boyut: 6,9" iPhone (1320 × 2868 dikey). Tasarımlar Design tuvalinde ("ODA iOS tasarımı", App Store görseli 1 ve 2); TestFlight'taki gerçek ekranlardan da alınabilir.

**Hazır görseller (29 Eyl 2026):** Masaüstünde `one-decision-away/app-store-screenshots.zip` — EN, TR, ES için 6'şar görsel, 1290 × 2796 (6,9" yuvasına yüklenir). Sıra: 1 Günde tek karar, 2 Kurslar, 3 Ders görseli, 4 Kanıt ağacı, 5 Ses Odası, 6 Koyu tema. Yeniden üretmek için `scripts/store-screenshots.mjs`.


## Bulutta doğrulanan hazırlık ve cihazda kalan kontroller

30 Eylül 2026 geliştirmesi: web görünümü, Capacitor kabuğu, Swift pencere arka planı ve açılış ekranı arka planı sıcak fildişi `#F7F3EA` ile hizalandı. Orijinal ODA ikonları ve açılış görseli korundu. Açılış görselinin kapanması uzak resim veya yazı tipi indirmesini beklemez; azaltılmış hareket tercihinde geçişsiz kapanır. Uygulama ön plana döndüğünde günlük tarih kontrolleri ve bildirim izni yenilenir, sonraki yedi günün hatırlatmaları yeniden planlanır. Üst üste gelen plan değişiklikleri sırayla uygulanır; en yeni karar durumu son durumda kalır. Bildirim önizlemesi günlük planın kimliklerini kullanmaz.

Statik destek sayfası ve dört mağaza dilinin destek URL alanları depoda hazırdır. Bu geliştirme sırasında yayın, dağıtım veya mağazaya yükleme yapılmadı. **Mağazaya yüklemeden önce** `support.html` dosyasını normal web sürümünle yayınla ve `https://billionar.github.io/one-decision-away/support.html` adresini gizli pencerede açarak iletişim bağlantısını ve üç dili kontrol et. Yalnızca yerel dosyanın bulunması, URL'nin canlı olduğunu kanıtlamaz. Apple'ın [destek URL gereksinimi](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/), kullanıcıların gerçek iletişim bilgisine ulaşmasını ister.

Linux bulut ortamı Xcode, gerçek iPhone, TestFlight veya App Store incelemesinin yerini tutmaz. Bir Mac ve gerçek cihazda ayrıca şunları kontrol et:

- Soğuk açılışta açılış ekranı kapanıyor; çentik ve ana ekran göstergesi içerik veya düğmeleri örtmüyor. Büyük metin ve VoiceOver ile günlük karar, kurs ve destek akışları okunabiliyor.
- Bir karar yazarken uygulamayı arka plana alıp geri dön; kaydedilen veri ve egzersiz taslağı kalıyor. Gece yarısından sonra geri dönünce günlük tarih yenileniyor.
- Bildirim iznini iPhone Ayarlar'dan kapatıp aç; ODA'ya dönüşte durum güncelleniyor. Test bildirimini dene; kararını tutunca günün kalan hatırlatmaları kalkıyor. Odak/Zamanlanmış Özet etkisini hesaba kat.
- Uygulamayı birkaç gün sonra aç; cihazdaki sonraki yedi günlük plan yenileniyor. Uygulama yedi günden uzun süre hiç açılmazsa yeni hatırlatmalar otomatik üretilmez.
- JSON yedeğini Dosyalar'a dışa aktar, başka bir temiz cihazda geri yükle; kurs ve karar ilerlemesini karşılaştır. Çevrimdışı yeniden açılışı dene.
- Apple sandbox hesabıyla satın alma, geri yükleme, iptal/yenileme ve seviye değişiklikleri; isteğe bağlı bulut hesabıyla giriş kodu ve hesap silme.

Teknik dayanak: [Capacitor 8 foreground olayları](https://capacitorjs.com/docs/apis/app), [durum çubuğu metin stilleri](https://capacitorjs.com/docs/apis/status-bar). Swift arka plan değişikliği ve cihaz davranışları burada derlenmiş veya cihazda doğrulanmış olarak sunulmaz.

### Tarayıcı ve iOS sürüm sınırı

ODA'nın iOS uygulama alt sınırı **iOS 16.4** olarak belirlendi. Xcode projesinin ve App hedefinin Debug/Release yapılandırmalarındaki dört `IPHONEOS_DEPLOYMENT_TARGET` alanı 16.4'tür. Uygulama Tailwind CSS 4 kullanır. [Tailwind'in resmî uyumluluk belgesi](https://tailwindcss.com/docs/compatibility), temel tarayıcı sınırlarını Safari 16.4, Chrome 111 ve Firefox 128 olarak belirtir. Bu karar, uygulamanın CSS sınırının altındaki iOS sürümlerine kurulmasını önler; eski tarayıcılar için CSS uyumluluğu iddiası değildir. Mağaza sürümünden önce iOS 16.4 ve güncel iOS üzerinde gerçek cihaz akışlarını ayrıca doğrula. Yerel veriler ve ortak Modal yedeği bu ayarla değişmez.

**SDK/kütüphane alt sınırı ile uygulama alt sınırı farklıdır.** [Capacitor 8'in SDK alt sınırı iOS 15.0'dır ve Xcode 26.0+ ister](https://capacitorjs.com/docs/updating/8-0). Kurulu Capacitor eklentileri ve RevenueCat Swift paketleri iOS 15 kütüphane sınırını korur. Capacitor 8.5.2 CLI, App projesindeki hedefin yalnızca ana sürümünü okuyarak `CapApp-SPM/Package.swift` dosyasını `.iOS(.v16)` ile üretir; bu üretilmiş kütüphane sınırı 16.0'dır, kurulan uygulamanın sınırı yine 16.4'tür. [Swift Package Manager](https://docs.swift.org/package-manager/PackageDescription/PackageDescription.html#supportedplatform), bağımlılık sürüm sınırlarının tüketen paket sınırından yüksek olmamasını ister. Daha düşük kütüphane sınırları uygulamanın kurulum sınırını düşürmez. Üçüncü taraf paketleri veya CLI kaynaklarını değiştirme; `cap sync ios` sonrasında aşağıdaki yerel kontrolü tekrar çalıştır:

```sh
node --import tsx --test tests/native-baseline.test.ts
```

Bu kontrol tüm proje/uygulama yapılandırmalarını, Capacitor'ın ürettiği ana sürümü, kurulu yerel paketlerin sınırlarını ve olası plist/xcconfig geçersiz kılmalarını denetler; `npm run check` içine de dahildir. Yapılandırma denetimi Xcode derlemesi veya cihaz testi yerine geçmez.

[WebKit, yerel `dialog` desteğini Safari/iOS 15.4'te ekledi](https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/). Ortak Modal, `showModal` veya `close` API'si olmadığında erişilebilir bir HTML katmanına geçer; klavye odağını içeride tutar, arka planı yardımcı teknolojilerden gizler ve kapanınca önceki odağı/kaydırmayı geri getirir. `scripts/qa-modal-fallback.mjs`, derlenmiş web önizlemesinde bu API'leri devre dışı bırakarak açma/kapatma, tekrar açma, Tab/Shift+Tab, Escape, arka plana tıklama, veri koruma ve axe kontrollerini tekrarlar. Bu test, eski Safari'nin CSS motorunu veya gerçek iPhone'u taklit etmez ve iOS 15 uyumluluğu iddiası değildir.
