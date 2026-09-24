# Momentum: erteleyen birinin gerçekten başlaması için

24 Eyl 2026'da eklenen davranış değişimi katmanı. Mantık `src/services/momentum.ts` (saf fonksiyonlar, `tests/momentum.test.ts`), arayüz `src/components/momentum/` ve `src/pages/Evidence.tsx`.

| Özellik | Nerede | Dayanak |
| --- | --- | --- |
| Duygu kontrolü + öz şefkat cümlesi | Karar planı, 1. adım | Erteleme bir duygu düzenleme sorunudur (Sirois & Pychyl 2013) |
| Engel + "eğer-o zaman" planı | Karar planı, 2–3. adım; karar kurulunca otomatik açılır | Uygulama niyetleri meta-analizi (Gollwitzer & Sheeran 2006), WOOP / zihinsel karşıtlama (Oettingen) |
| "Başla · sadece 2 dakika" | Karar kartı | Başlama eşiğini düşürmek; `startedAt` kaydedilir |
| Şefkatli dönüş | Today üstü kart (1 gün kaçırınca / 3+ gün aradan sonra) | Tek kaçırılan gün alışkanlığı bozmaz (Lally ve ark. 2010); kendini affetmek sonraki ertelemeyi azaltır (Wohl, Pychyl & Bennett 2010) |
| Temiz sayfa | Pazartesi ve ayın 1'i | Fresh start etkisi (Dai, Milkman & Riis 2014) |
| Kanıt defteri | Today şeridi + `/app/evidence` | Kimlik temelli motivasyon: tutulan her karar "sözümü tutarım" kanıtı |
| Bir kişiye söyle | Karar kartı (paylaş / kopyala) | Hesap verebilirlik |
| İlk hafta sade mod | Today; 7 gün veya 3 tutulan karar sonra açılır, "Hepsini göster" ile kapatılır | Yeni kullanıcıyı kalabalıkla boğmamak |
| Hayal için "Gerçeğe dönüştür" | Dreams → hayal detayı | Sadece olumlu hayal etmek enerjiyi düşürebilir (Kappes & Oettingen 2011) |
| 14. gün sorusu | Today kartı; e-posta uygulamasıyla ekibe gönderilebilir | Etkinin gerçek ölçüsü: "Ertelediğin bir şeye başladın mı?" |

Veri: `Mission.plan`, `Mission.startedAt`, `UserData.dreamPlans`, `Profile.simpleModeOff`, `Profile.twoWeekCheckIn` — hepsi normal kayıt ve bulut senkronu ile taşınır. Tarihler yerel takvim günüdür.
