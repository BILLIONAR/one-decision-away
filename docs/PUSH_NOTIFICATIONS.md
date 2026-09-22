# ODA: üyelere günde altı Web Push bildirimi

Bu özellik **Supabase arka ucu kurulup dağıtılana kadar site kapalıyken çalışmaz**. GitHub Pages tek başına zamanlanmış sunucu işi çalıştıramaz. Açık uygulamadaki yerel bildirimler bundan ayrı çalışır; doğrulanmış bir push aboneliği varsa yerel zamanlayıcı aynı bildirimi tekrar göndermez.

Buradaki kod ücretsiz, açık kaynak Web Push protokolünü ve mevcut isteğe bağlı Supabase üyeliğini kullanır. Ücretli API, deneme aboneliği veya satın alma içermez. Supabase hesabında yalnız Free planı kullanın; kullanım kotasını Dashboard üzerinden izleyin, ücretli plana geçmeyin. Hesap, proje ve anahtarlar bu depoya eklenmemiştir.

## Dosyalar ve davranış

- `src/services/pushNotifications.ts`: kullanıcı butonuyla izin isteği, üyeye bağlı cihaz kaydı, kapatma ve saat güncelleme.
- `public/sw.js`: uygulama sekmesi kapalıyken gelen gerçek `push` olayını görünür bildirime çevirir.
- `supabase/push-notifications.sql`: üyeye özel RLS, altı saat ve IANA saat dilimi doğrulaması, atomik gönderim kayıtları.
- `supabase/functions/send-nudges/`: özel cron sırrıyla korunan Deno Edge Function ve 600 sözün sunucu kopyası.

Sıra: `morning`, `lateMorning`, `midday`, `afternoon`, `evening`, `night`. Altı saat birbirinden farklı olmalıdır. Sunucu ve ön yüz, üyenin **yerel takvim tarihi** üzerinden aynı sözü seçer: `(gün × 6 + sıra) mod 600`. Böylece bir günde altı farklı söz ve 100 günlük bir döngü oluşur. Çeviri/yorumlama kaynak etiketi bildirim metninde korunur. İlk 300 kaydın ardından eklenen 300 inanç, bilim ve felsefe kaydı da bu döngüye dahildir; derlemeler [kaynak koleksiyonu belgesinde](INSPIRATION_AND_COACH.md) açıklanır.

## 1. Ücretsiz Supabase projesini bağlama

Mevcut Supabase Auth e-posta bağlantısıyla üyeliği etkinleştirin. Auth URL Configuration bölümünde sitenin URL'sini ve dönüş adresini tanımlayın:

```
https://billionar.github.io/one-decision-away/
```

Ön yüzde mevcut yapılandırmayı (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` veya uygulamanın bulut ayarları) kullanın. Anon/publishable anahtar tarayıcıya gidebilir; **service-role/secret anahtarı tarayıcıya veya VITE değişkenlerine koymayın**. Üyelik olmadan abonelik oluşturulmaz.

SQL Editor'da önce gerekiyorsa `supabase/schema.sql`, ardından `supabase/push-notifications.sql` çalıştırın. Bu işlem tablo/kuralları oluşturur; kimseye bildirim göndermez ve cron başlatmaz.

## 2. VAPID anahtarları ve özel sırlar

Depo kökünde bir defa çalıştırın:

```sh
node supabase/functions/send-nudges/generate-keys.mjs
```

Komut özel anahtarları ve cron sırrını Git tarafından yok sayılan `.env.push` dosyasına yalnız sahibi okuyabilecek şekilde yazar. Var olan dosyanın üzerine yazmaz. Ekrana yalnız herkese açık `VITE_VAPID_PUBLIC_KEY` değerini basar. Bu değeri GitHub deposunda Settings → Secrets and variables → Actions → Variables bölümüne `VITE_VAPID_PUBLIC_KEY` adıyla ekleyin; aynı yerde `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` public değişkenlerini de tanımlayın. Workflow bu üç değeri okur; yalnız bu **public** anahtar ön yüze gider.

`.env.push` içinde `VAPID_SUBJECT` alanını size ait bir iletişim e-postasıyla doldurun. `PUSH_SITE_URL` sonu `/` ile biten gerçek yayın adresi olmalıdır. `VAPID_KEYS_JSON` ve `PUSH_CRON_SECRET` özel kalmalıdır; sohbetlere, loglara veya repoya yapıştırmayın. Anahtarları her dağıtımda yenilemeyin; yenilemek mevcut abonelikleri geçersiz kılar.

Supabase CLI ile mevcut projenize giriş yapıp bağlandıktan sonra sırları yükleyin:

```sh
supabase secrets set --env-file .env.push
```

Supabase, `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini Edge Function ortamında sağlar. Bunlar yalnız sunucuda kullanılır.

## 3. 600 sözü ve fonksiyonu dağıtma

`supabase/functions/send-nudges/quotes.json` ön yüzdeki `QUOTE_COLLECTION` ile aynı sıra ve içerikte 600 nesne içermelidir (`id`, `text`, `tr`, `source`, `sourceTr`, `kind`). Boş veya eksik kopyayla fonksiyon `503` döndürür; gönderim sırası ayırmaz. Sözler değiştiğinde depo kökünde `node --import tsx scripts/export-push-quotes.ts` çalıştırın. CI, kopyanın ön yüzle aynı sıra ve içeriği taşıdığını doğrular.

Tür denetimi ve dağıtım:

```sh
cd supabase/functions/send-nudges
deno task check
cd ../../..
supabase functions deploy send-nudges --no-verify-jwt
```

`--no-verify-jwt` yalnız gateway JWT kontrolünü kapatır. Fonksiyonun kendi kimlik doğrulaması zorunludur: doğru, en az 32 karakterlik `x-oda-cron-secret` başlığı yoksa `401` döner. Tarayıcı bu uç noktayı çağırmaz; kendi RLS korumalı abonelik satırını Supabase REST üzerinden yazar.

## 4. Dakikada bir güvenli zamanlama

Supabase Dashboard'da `pg_cron`, `pg_net` ve Vault uzantılarını etkinleştirin. Vault'a Dashboard üzerinden şu üç kaydı ekleyin; sırrı SQL metnine kaydetmek zorunda değilsiniz:

| Vault adı | Değer |
| --- | --- |
| `oda_project_url` | `https://PROJE_KODU.supabase.co` |
| `oda_publishable_key` | Bu projenin public publishable/anon anahtarı |
| `oda_push_cron_secret` | `.env.push` içindeki `PUSH_CRON_SECRET` ile aynı özel değer |

Ardından SQL Editor'da:

```sql
select cron.schedule(
  'oda-six-daily-nudges',
  '* * * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'oda_project_url') || '/functions/v1/send-nudges',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'oda_publishable_key'),
        'x-oda-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'oda_push_cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 10000
    );
  $job$
);
```

Aynı isimli bir iş varsa yeni kopya oluşturmak yerine mevcut işi güncelleyin. Durdurmak için `select cron.unschedule('oda-six-daily-nudges');` yeterlidir. Sırlar yoksa veya fonksiyon dağıtılmadıysa cron'u etkinleştirmeyin.

## 5. Gerçek cihazla kabul denetimi

1. HTTPS yayında üyeliğe giriş yapın; bildirim ayarlarından arka plan bildirimlerini bilerek açın. Altı farklı saat kaydedin; ilkini birkaç dakika sonraya koyun.
2. Bildirim iznini verin. `oda_push_subscriptions` tablosunda yalnız o üyeye ait cihaz kaydı oluştuğunu doğrulayın. Farklı bir üyelikle diğer üyenin satırına erişilememelidir.
3. Tüm site sekmelerini kapatın. Seçilen saatte gelen bildirimi ve tıklanınca doğru `/one-decision-away/#/app` adresinin açıldığını doğrulayın.
4. Fonksiyonu aynı dakika tekrar çalıştırın: aynı cihaz/tarih/saat için ikinci bir claim olmamalıdır. `oda_push_deliveries` anahtarı bunu sunucuda engeller.
5. Bildirimleri kapatın ve çıkış yapın. Cihaz aboneliği iptal edilmeli; sunucu kaydı silinmeli. İnternet kesikse tarayıcı aboneliği yine iptal edilir, kalan sunucu kaydı bir sonraki gönderimde `404/410` ile temizlenir; arayüz temizlik hatasını açıkça gösterir.
6. Başka üye, ikinci cihaz, izin reddi, token süresi dolması, saat değişikliği, iPhone ana ekran kurulumu ve Android için ayrı kontroller yapın.

Yerel otomatik denetimler (hiçbir gerçek bildirim göndermez):

```sh
node --import tsx --test supabase/functions/send-nudges/core.test.ts supabase/functions/send-nudges/push-worker.test.ts tests/service-worker.test.ts
```

`supabase/functions/send-nudges` klasöründe `deno task test-schema`, SQL'i gerçek bellek içi PostgreSQL/WASM üzerinde çalıştırır. RLS, altı zaman dilimi, tekrar önleme, DST, endpoint doğrulaması, cihaz sınırı ve kayıt silme işlemleri için izole bir denetimdir; Supabase hesabı kullanmaz ve bildirim göndermez.

SQL saat dilimi dönüşümünü üretimden önce şu salt okunur kontrolle de doğrulayın:

```sql
select
  timestamp '2026-03-29 02:30' at time zone 'Europe/Berlin' as spring_gap,
  timestamp '2026-10-25 02:30' at time zone 'Europe/Berlin' as autumn_repeat;
-- UTC sonuçları sırasıyla 2026-03-29 01:30:00+00 ve 2026-10-25 01:30:00+00.
```

## Teslimatın sınırları

Zamanlar IANA saat dilimiyle `AT TIME ZONE` üzerinden UTC'ye çevrilir; sabit UTC farkı kullanılmaz. Yaz saatine geçişte olmayan bir saat PostgreSQL'in standart kuralıyla ileri taşınır; saat geri alınırken yinelenen duvar saati için tek teslimat anı seçilir. Üye saat dilimi değiştirince açık uygulama tercihlerini yeniden senkronlamalıdır.

Cron kısa kesintiler için son 10 dakikayı yakalar; daha eski altı mesajı topluca yığmaz. Her çağrı en çok 100 işi altı paralel göndericiyle işler. Gönderim kaydı **önce** atomik olarak ayrılır. Bu tercih aynı sözü tekrar yollamayı önler; işlem ayrımdan sonra kesilirse o mesaj kaybolabilir. Web Push uçtan uca tam bir kez veya dakikasında ulaşma garantisi vermez. Ağ, cihazın pil ayarları, işletim sistemi ve tarayıcı bildirimleri geciktirebilir; kuyruktaki mesaj bir saat sonra geçersizleşir.

iPhone/iPad'de Web Push, desteklenen iOS/iPadOS sürümünde ana ekrana eklenen web uygulamasından izin verilmesini gerektirir. Açık sekme testi arka plan teslimatı kanıtlamaz. Backend hesabı bağlanmadan ve gerçek cihaz testi geçmeden özellik “site kapalıyken çalışıyor” diye raporlanmamalıdır.

## Birincil kaynaklar

- [Supabase: Scheduled Edge Functions ve Vault](https://supabase.com/docs/guides/functions/schedule-functions)
- [Supabase: Edge Functions çalışma ortamı](https://supabase.com/docs/guides/functions)
- [@negrel/webpush 0.5.0: Deno/WebCrypto API ve MIT lisansı](https://jsr.io/@negrel/webpush@0.5.0)
- [Web Push kütüphanesinin sunucu örneği](https://github.com/negrel/webpush/blob/master/example/main.ts)
- [WebKit: iOS/iPadOS için Web Push](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [PostgreSQL: geçersiz veya belirsiz zaman damgalarının yorumu](https://www.postgresql.org/docs/current/datetime-invalid-input.html)
