# ODA sözler ve canlı koç

## 600 kaynaklı düşünce

`src/data/quoteCollection.ts`, inanç, felsefe, bilim ve toplum derlemelerini tek sırada birleştirir. Her kayıt İngilizce/Türkçe metin, kaynak kişi/eser, bölüm veya ayet/hadis numarası, birincil kaynak bağlantısı ve `adaptation` ya da `translation` etiketi taşır. Koleksiyonda 573 özgün uyarlama ve 27 çeviri bulunur. Uyarlamalar birebir alıntı gibi sunulmaz; anlatımları ODA için yazılmıştır. Kaynaklar kamu malı klasik eserleri, ayet ve hadisleri, bilim kurumlarının açıklamalarını ve araştırmacıların birincil metinlerini kapsar.

- 185 inanç, 165 felsefe, 75 toplum, 175 bilim kaydı.
- Korku, belirsizlik ve cesaret için ayrı filtre; arama ve cihazda kaydedilen favoriler.
- İlk 300 kaynaklı kaydın sırası korunur. `quoteExpansionFaithMore.ts`, `quoteExpansionScienceMore.ts` ve `quoteExpansionPhilosophyMore.ts` dosyalarından 100'er yeni kayıt, inanç/bilim/felsefe sırasıyla eklenir.
- 418 eski günlük kayıt ile toplam 1.018 günlük metin; kaynaklı 600 kaydın bağlantıları günlük kartta da görünür.
- Yeni bilim derlemesinde kuantum fiziği, enerji, madde ve araştırma süreçleri bulunur. Bilimsel olgulara dayanan ODA anlatımları, bilim insanlarının birebir sözleri veya düşünceyle evreni yönetme iddiaları olarak sunulmaz.
- Altı farklı bildirim/gün, üyenin yerel takvim günü üzerinden seçilir. 600 kaynaklı kayıt 100 günde tamamlanır, sonra döngü başlar. Bildirim saatleri değiştirilebilir; bildirimler izin verilmeden etkinleşmez.

Söz değişikliğinden sonra `node --import tsx scripts/export-push-quotes.ts` çalıştırın. Ön yüz ve sunucu kopyasının aynı olması testle zorunlu tutulur. Her kaydın `reference` ve `sourceUrl` alanı kaynağa geri dönmek içindir.

## Gerçek cihaz içi AI

**Durum: deneysel.** Gerçek model yüklemesi ve yanıt üretimi tarayıcıda doğrulandı, ancak Türkçe sohbet testlerinde yanıtlar fazla genel ve yer yer anlamsız kaldı. Doğal Türkçe koç hedefi henüz karşılanmış sayılmamalıdır. Arayüz bu durumu indirmeden önce belirtir; yaşam döngüsü testlerinin geçmesi konuşma kalitesinin yeterli olduğunu göstermez.

`@mlc-ai/web-llm` (Apache-2.0) ve Qwen3.5-2B (Apache-2.0), tarayıcı WebGPU üzerinde yeni yanıt üretir. Hazır yanıtları AI gibi sunan bir yedek yol yoktur. Worker, model ve ağırlıklar yalnız kullanıcının **Koçumu hazırla** düğmesinden sonra yüklenir. İlk model indirmesi yaklaşık 1,1 GB; yeterli GPU/bellek ve WebGPU desteği gerekir. Destek yoksa veya indirme başarısızsa açıklayıcı hata gösterilir. API anahtarı veya ücretli servis gerekmez.

Sohbet akışı önceki mesajları sınırlı bağlamda tutar, parça parça gösterilir ve durdurulabilir. Yazılı konuşma sunucuya gönderilmez; sayfadan ayrılınca bellekten çıkar. Küçük yerel modelin yanıt kalitesi büyük bulut modelleriyle eşdeğer değildir. Sesli giriş ve okuma tarayıcı hizmetleridir; ses tanıma sağlayıcıya ses gönderebilir ve bu bilgi arayüzde verilir. Ses hizmetleri ve ses kalitesi cihaz/tarayıcıya göre değişir.

Kaynaklar: [WebLLM](https://webllm.mlc.ai/docs/), [WebLLM lisansı](https://github.com/mlc-ai/web-llm/blob/main/LICENSE), [Qwen3.5-2B model kartı](https://huggingface.co/Qwen/Qwen3.5-2B).

Model dosyaları WebLLM'nin desteklenen IndexedDB arka ucuyla saklanır. Qwen3.5 için durdurma kimlikleri `248044` ve `248046` olarak açıkça ayarlanır: [tokenizer](https://huggingface.co/mlc-ai/Qwen3.5-2B-q4f16_1-MLC/blob/main/tokenizer_config.json) bu değerleri kullanırken MLC model yapılandırması eski Qwen3 kimliklerini içerir. Model ailesi değiştirildiğinde bu ayar yeniden kontrol edilmelidir. Dağıtımdaki yazılım lisansları `public/third-party-notices.txt` içindedir.

## Üyelik ve arka plan bildirimleri

Kapalı uygulama teslimatı için [Web Push kurulumu](PUSH_NOTIFICATIONS.md) gerekir. GitHub Pages tek başına üyelik sunucusu ve zamanlı gönderim çalıştırmaz. Arka uç bağlanmadan yalnız açık uygulamadaki yerel bildirimler kullanılabilir; arayüz bu ayrımı gösterir. Sunucu kurulumunun veya gerçek cihaz bildiriminin yapıldığını yalnız kaynak kodun bulunmasından çıkararak varsaymayın.
