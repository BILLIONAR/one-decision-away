# ODA bulut yapay zekâ koçu: kurulum

Koç sekmesinde iki koç var: **cihaz içi koç** (her zaman ücretsiz, hesap gerekmez, mesajlar cihazdan çıkmaz) ve **bulut koçu** (giriş gerekir, daha güçlü bir yapay zekâ, seviyeye göre aylık mesaj sınırı). Bu belge bulut koçunun sende yapılması gereken kurulumunu anlatır. Kurulum yapılmadıkça uygulama çalışmaya devam eder; bulut koçu sessizce görünmez olur ve cihaz içi koç kalır.

## Nasıl çalışır

1. Uygulama, giriş yapmış kişinin oturum anahtarıyla `coach-chat` Supabase fonksiyonunu çağırır. Yapay zekâ anahtarı uygulamada yoktur.
2. Fonksiyon oturumu doğrular (hesap silme fonksiyonuyla aynı kural), yalnızca ODA'nın kendi adreslerinden gelen isteği kabul eder.
3. Seviyeyi RevenueCat'ten öğrenir (`GET /v1/subscribers/{supabase kullanıcı kimliği}`), sonucu 10 dakika `ai_tier_cache` tablosunda tutar. En yüksek etkin yetki kazanır: `coach` > `pro` > `essentials`, yoksa `free`. RevenueCat gizli anahtarı tanımlı değilse herkes `free` sayılır.
4. Aylık sınırı tek bir SQL fonksiyonu (`ai_increment_usage`) hem sayar hem denetler; sınır aşılırsa 429 döner. Yapay zekâ yanıt veremezse mesaj geri verilir (`ai_refund_usage`).
5. Mesajlar OpenAI'a gider (`store: false`), yanıt en fazla ~400 token. Mesaj metni hiçbir yerde saklanmaz ya da günlüğe yazılmaz; yalnızca aylık sayaç tutulur.
6. Kendine zarar verme, intihar, istismar ya da acil tehlike kelimeleri (TR/EN/ES) geçerse fonksiyon modeli çağırmadan sabit, şefkatli bir mesaj döner (112 / 911 / 988 / 024) ve bu mesaj hak düşmez.

| Seviye | Aylık mesaj | Yetki kimliği (RevenueCat) |
| --- | --- | --- |
| Ücretsiz | 30 | yok |
| Essentials | 150 | `essentials` |
| Pro | 600 | `pro` |
| Pro Coach | 3000 | `coach` |

Yalnızca Pro Coach seviyesinde, kişi kendisi "Koç bugünün kararını ve defterindeki son satırları okuyabilsin" seçeneğini açarsa bugünün kararı, son tuttuğu kararlar ve defterinden 3 kısa satır mesajla birlikte gönderilir. Varsayılan kapalıdır, seçim yalnızca o cihazda saklanır.

## Senin yapacakların (sırasıyla)

### 1. OpenAI API anahtarı (kısıtlı, harcama sınırlı)

1. platform.openai.com → **API keys** → *Create new secret key*. Ad: `oda-coach`. İzin türü: **Restricted**; yalnızca **Model capabilities → Chat completions / Responses: Write** açık, gerisi *None*.
2. **Settings → Limits** (Billing) bölümünde **aylık bütçe (budget)** koy ve e-posta uyarı eşiği ayarla. Örnek: başlangıçta 20 $ aylık üst sınır, 15 $'da uyarı. Üst sınıra ulaşılınca OpenAI istekleri reddeder; uygulama bu durumda "koç şu an yanıt veremedi, mesaj sayılmadı" der, cihaz içi koç çalışmaya devam eder.
3. Anahtarı yalnızca 2. adımdaki gizli ayara yapıştır. Sohbete, GitHub'a, `.env` dosyasına ya da uygulamaya yazma. Sızdığını düşünürsen OpenAI'da anahtarı hemen sil ve yenisini oluştur.
4. Model: varsayılan `gpt-6-luna`. Başka bir model istersen `OPENAI_MODEL` gizli ayarını ekle; kodu değiştirmene gerek yok.

Maliyet için kaba hesap: bir yanıt yaklaşık 1000 girdi + 300 çıktı token'ıdır; bütçeyi seçtiğin modelin güncel fiyatıyla bölerek kişi başı aylık üst sınırı görürsün. Ücretsiz seviyenin 30 mesajı en kötü durumda sınırlıdır; Pro Coach seviyesindeki 3000 mesaj "adil kullanım" içindir, fiyatı buna göre kontrol et.

### 2. Supabase gizli ayarları (Secrets)

Supabase panelinde **Edge Functions → Secrets → Add new secret**:

| Ad | Değer |
| --- | --- |
| `OPENAI_API_KEY` | 1. adımdaki OpenAI anahtarı |
| `REVENUECAT_SECRET_KEY` | 4. adımdaki RevenueCat gizli anahtarı |
| `OPENAI_MODEL` | (isteğe bağlı) model adı |
| `ODA_EXTRA_ORIGINS` | (isteğe bağlı) ek alan adları, virgülle; hesap silme fonksiyonuyla ortak |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` Supabase tarafından fonksiyonlara kendiliğinden verilir; elle eklemeye gerek yok.

### 3. Veritabanı ve fonksiyon

1. Supabase → SQL Editor'da `supabase/schema.sql` dosyasını yeniden çalıştır (tekrar çalıştırmak güvenlidir). `ai_usage`, `ai_tier_cache` tabloları ve iki fonksiyon oluşur.
2. Terminalde, proje klasöründe:
   ```
   supabase functions deploy coach-chat
   ```
   JWT doğrulamasını **kapatma** (`--no-verify-jwt` verme). Fonksiyon oturumu ayrıca kendisi de doğrular.
3. Uygulamada Supabase adresi ve anon anahtarı zaten tanımlı olmalı (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); yeni bir ayar gerekmez. Site içerik güvenlik politikası (CSP) `*.supabase.co` adresine zaten izin veriyor.

### 4. RevenueCat gizli anahtarı

1. RevenueCat → projen → **API keys** → *+ New secret API key*. Ad: `oda-coach-server`. Sürüm **v1** (fonksiyon v1 REST API kullanır). İzin: yalnızca **Customer information: Read only**, başka izin verme.
2. `sk_…` ile başlayan anahtarı bir kez göreceksin; Supabase'de `REVENUECAT_SECRET_KEY` olarak kaydet. Uygulamadaki herkese açık iOS anahtarıyla (`appl_…`) karıştırma.
3. Üç yetki kimliği tam olarak `essentials`, `pro`, `coach` olmalı ve Supabase kullanıcı kimliğiyle giriş (`purchases.identify`) yapılmış olmalı; uygulama bunu zaten yapar. Yetki kimlikleri farklıysa kimse ücretsiz seviyenin üstüne çıkamaz.

### 5. Deneme

1. Uygulamada giriş yap → Koç. Üstte "30 mesajdan 30 tanesi kaldı" benzeri sakin bir satır görmelisin.
2. Bir mesaj gönder; yanıt gelmeli ve sayı bir azalmalı.
3. Kriz denemesi: "kendime zarar vermek istiyorum" yaz; sabit güvenli mesaj gelmeli, sayı azalmamalı.
4. Sınırı denemek için SQL Editor'da: `update public.ai_usage set count = 30 where user_id = '<kullanıcı kimliği>';` (Supabase hizmet rolüyle çalışır). Koç sekmesi "Bu ay için bu kadar" kartını göstermeli.
5. Hata ayıklama: Supabase → Edge Functions → coach-chat → Logs. Günlükte yalnızca durum kodları görünür (`provider-401`, `provider-429` gibi), mesaj metni asla.

## Sağlayıcıyı değiştirmek

Yapay zekâ çağrısı `supabase/functions/coach-chat/index.ts` içinde tek küçük bir fonksiyondur (`generateReply`). Başka bir sağlayıcıya geçmek için yalnızca o fonksiyonu ve gizli ayarı değiştirmek yeter; seviyeler, sınır, kriz kuralları ve sistem istemi `logic.ts` içindedir ve aynı kalır.

## Gizlilik ve mağaza

- Gizlilik politikası (`src/data/legal.ts`) bulut koçunu açıkça anlatır: mesajlar sunucumuza ve OpenAI'a gider, OpenAI'ın API veri politikası kapsamında model eğitiminde kullanılmaz, ODA mesajları saklamaz.
- App Store gizlilik etiketi ve inceleme notu `docs/APP_STORE.md` içinde güncellendi.
- Kriz kuralı: kelime denetimi `logic.ts` içinde `CRISIS_PATTERNS`. Yeni bir ifade eklersen `tests/coach-chat-logic.test.ts` içine hem yakalanacak hem yakalanmayacak örnek ekle.
- Güvenlik gizli anahtarları için `docs/SECURITY.md`.
