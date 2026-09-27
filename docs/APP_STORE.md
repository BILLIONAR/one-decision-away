# ODA'yı App Store'a çıkarmak

Bu belge iki kısımdır: depoda **hazır olanlar** ve yayına çıkmak için **Ümit'in yapması gerekenler**. En altta App Store Connect'e yapıştırılacak metinler var.

Yayıncı: **YAHYA** · Uygulama adı: **ODA – One Decision Away** · Paket kimliği (bundle ID): `com.yahya.onedecisionaway`

## Depoda hazır olanlar

| Konu | Nerede | Not |
| --- | --- | --- |
| iOS uygulama kabuğu (Capacitor 8, Swift Package Manager; CocoaPods gerekmez) | `ios/`, `capacitor.config.ts` | Sadece iPhone, dikey ekran. Ekran üstü/altı güvenli alanlar hesaba katıldı. |
| Uygulama ikonu (1024 px, opak) ve açılış ekranı | `ios/App/App/Assets.xcassets` | C4 logosundan üretildi, logo değiştirilmedi. |
| Cihazda hatırlatmalar | `src/services/nativeNotifications.ts` | Uygulama kapalıyken de çalışır; 7 gün önceden planlanır, karar tutulunca bugünün hatırlatması kalkar. |
| Titreşim (haptic) | `src/services/native.ts` | Karar tutulunca başarı titreşimi, alışkanlık işaretlenince hafif dokunuş. |
| Durum çubuğu temaya uyar | `src/utils/theme.ts` | |
| Uygulama içi hesap silme (Kural 5.1.1(v)) | Hesap sayfası → "Hesabımı sil"; `supabase/functions/delete-account` | Tüm tablolar `on delete cascade`, bulut verisi hesapla birlikte silinir. |
| E-postadaki 6 haneli kodla giriş | Hesap sayfası | iPhone uygulaması web bağlantısı açamadığı için kod girişi eklendi. |
| Gizlilik politikası ve kullanım koşulları (TR/EN/ES) | Uygulamada `/privacy`, `/terms`; statik: `public/legal/privacy.html`, `public/legal/terms.html` | Yayındaki adresler aşağıda. `src/data/legal.ts` değişince `npm run legal`. |
| ODA Pro ödeme katmanı (RevenueCat) | `src/services/purchases.ts`, `src/pages/Upgrade.tsx` | Fiyatlar App Store'dan gelir; deneme zaman çizelgesi, geri yükleme ve Apple yenileme metni ekranda. Web'de satış yok, her şey açık. |
| Pro kilitleri (yalnızca iPhone'da ve satın alma açıkken) | `src/services/entitlements.ts` | Ücretsiz: günlük karar, kanıt ağacı, defter, koç, yedekleme, Dönüm Noktası Günü kursunun tamamı, her kursun ilk 2 dersi, Ses Odası'nda her kategorinin ilk 2 sesi. |

Gizlilik ve koşullar adresleri (App Store Connect'e bunlar girilir):

- https://billionar.github.io/one-decision-away/legal/privacy.html
- https://billionar.github.io/one-decision-away/legal/terms.html

## Ümit'in yapması gerekenler (sırasıyla)

1. **Apple Developer Program** üyeliği (yıllık 99 $). Şirket (YAHYA) adına açılacaksa D-U-N-S numarası gerekir; bireysel hesapla da başlanabilir, satıcı adı o zaman kişi adı görünür.
2. **Mac'te Xcode**: App Store'dan Xcode'u kur, sonra Terminal'de bir kez `sudo xcodebuild -license accept` çalıştır (şifreyi senin girmen gerekiyor).
3. **App Store Connect'te uygulamayı oluştur**: Uygulamalar → + → Yeni Uygulama. Platform iOS, ad "ODA – One Decision Away", birincil dil Türkçe, bundle ID `com.yahya.onedecisionaway` (Certificates, Identifiers & Profiles'ta önce bu kimliği oluştur).
4. **Abonelikleri oluştur** (App Store Connect → uygulama → Abonelikler):
   - Abonelik grubu: `ODA Pro`
   - `oda_pro_annual` · 1 yıl · önerilen 49,99 $ · tanıtım teklifi: 1 hafta ücretsiz
   - `oda_pro_monthly` · 1 ay · önerilen 6,99 $
   - Fiyatlar öneri; istediğin gibi değiştir, uygulama App Store fiyatını otomatik gösterir.
5. **RevenueCat** hesabı (ücretsiz başlar): yeni proje → iOS uygulaması (bundle ID yukarıdaki) → App Store Connect'ten In-App Purchase anahtarını bağla → Entitlement kimliği tam olarak `pro` → Offering `default`, içine Annual paketine `oda_pro_annual`, Monthly paketine `oda_pro_monthly`. Sonra **Public iOS SDK key**'i (`appl_` ile başlar) bana gönder ya da `.env` dosyasına `VITE_REVENUECAT_IOS_KEY` olarak yaz. Bu anahtar herkese açık türdendir; gizli anahtarları asla sohbete yapıştırma.
6. **Supabase** (hesap ve yedekleme için):
   - SQL: `supabase/schema.sql` (ve istersen `push-notifications.sql`).
   - Authentication → Email Templates → "Magic Link" şablonuna `{{ .Token }}` satırını ekle ("Giriş kodun: {{ .Token }}"). iPhone'da giriş bu kodla yapılır.
   - Hesap silme fonksiyonu: `supabase functions deploy delete-account` (JWT doğrulaması açık kalsın).
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
> • Cihazında çalışan yapay zekâ koçu: yazdıkların cihazından çıkmaz
> • Akıllı hatırlatmalar: günde en fazla iki, gerçekten işe yarayınca
>
> Reklam yok, izleme yok. Hesap açmak isteğe bağlı; açarsan kanıtların yedeklenir ve her cihazda seninle olur.
>
> ODA Pro ile bütün kurslar ve Ses Odası'nın tamamı açılır. Günlük karar, kanıt ağacı, defter, koç ve yedekleme her zaman ücretsiz.
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
> Inside: today's one decision with a 30-second obstacle plan, the evidence tree and a weekly look-back, a notebook, dreams and three small habits, guided courses (procrastination, focus, sleep, stress, confidence, meditation and more), a Sound Room for calm, sleep, focus and breath, an AI coach that runs on your device, and smart reminders (at most two a day).
>
> No ads, no tracking. An account is optional; with one, your proof is backed up and follows you to every device.
>
> ODA Pro opens every course and the whole Sound Room. Today's decision, the evidence tree, the notebook, the coach and backup stay free.
>
> ODA does not give medical or psychological advice and is not a substitute for treatment.

**Destek adresi:** https://billionar.github.io/one-decision-away/ · **İletişim:** ufrldk13@gmail.com

## Uygulama gizlilik etiketi (App Privacy)

"Veri topluyor musunuz?" → **Evet**, yalnızca hesap açan ve satın alan kullanıcılar için:

| Veri türü | Kullanıcıya bağlı mı | Amaç | İzleme |
| --- | --- | --- | --- |
| İletişim bilgisi → E-posta adresi | Evet | Uygulama işlevselliği | Hayır |
| Kullanıcı içeriği → Diğer kullanıcı içeriği (kararlar, notlar) | Evet | Uygulama işlevselliği | Hayır |
| Satın almalar → Satın alma geçmişi | Evet | Uygulama işlevselliği | Hayır |
| Tanımlayıcılar → Kullanıcı kimliği | Evet | Uygulama işlevselliği | Hayır |

Reklam, analiz, konum, sağlık verisi yok; izleme (tracking) yok.

## İnceleme notu (App Review Information → Notes)

> ODA works fully without an account; no sign-in is needed to review it. Accounts are optional and use a one-time email code; accounts can be deleted in-app (Me → Account → Delete my account). ODA Pro is an auto-renewable subscription (group "ODA Pro"); the paywall is at Me → ODA Pro and includes Restore Purchases, the trial timeline and links to the Terms and Privacy Policy. The AI coach runs entirely on the device and downloads a language model (about 1.1 GB) only when the user starts it. The Sound Room makes no health claims and shows this in the app.

## Ekran görüntüleri

Zorunlu boyut: 6,9" iPhone (1320 × 2868 dikey). Tasarımlar Design tuvalinde ("ODA iOS tasarımı", App Store görseli 1 ve 2); TestFlight'taki gerçek ekranlardan da alınabilir.
