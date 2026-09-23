# ODA tasarım yönü

Tarih: 23 Eylül 2026. Kapsam: mevcut ODA arayüzünün, özellikle kurslar ve giriş sayfasının görsel gelişimi. Bu belge tasarım kararlarını, başlangıç bulgularını ve uygulama doğrulamasını kaydeder.

## Yöntem ve kanıt sınırı

Bağımsız AI rolleri kullanıldı; insan tasarımcılarla görüşüldüğü iddia edilmez.

- **A / marka ve kompozisyon:** `design_brand_review`, kaynak kodunu ve tasarım yönlerini değerlendirdi. Tarayıcıyla görsel inceleme yapmadı.
- **A / öğrenme deneyimi:** `design_learning_review`, kurs ve ilham akışını kaynak üzerinden değerlendirdi. Tarayıcıyla görsel inceleme yapmadı.
- **B / teknik inceleme:** `design_detector_review`, A bulgularını görmeden yerel Impeccable CLI taramasını ve renk hesaplarını tamamladı. Bulgular A tamamlandıktan sonra birleştirildi.
- `design-craft` ve `impeccable` rehberleri kullanıldı. B yalnızca CLI/kaynak kanıtı üretti. CUA değerlendirmesi salt okunur olduğundan canlı detector script'i enjekte edilmedi; overlay sunucusu açılmadı, görünür overlay oluşturulmadı.

Ana görevde gerçek tarayıcı görüntüleriyle yapılan kontroller aşağıda kayıtlıdır.

## Karşılaştırılan yönler

| Yön | Kazandırdığı | ODA açısından sınırı |
|---|---|---|
| **Çalışma defteri / editoryal rehber** | Sıcak kâğıt, güçlü okuma hiyerarşisi, küçük alıştırmalar ve sakin ilerleme | Metin yoğunluğu; işlevli çizimler ve belirgin bölüm ritmiyle çözülmeli |
| **Rota haritası** | Kursları ve adımları görünür bir yol olarak sunma | Özellikle ADHD içeriğinde dikkat yükünü artırabilecek oyun ve harita katmanı |
| **Botanik inziva** | Doğa, yeşil tonlar ve duygusal sıcaklık | Atmosferin günlük kararın ve dersin önüne geçmesi; genel bir meditasyon markasına benzeme riski |

**Seçim:** çalışma defteri ile sakin editoryal rehber. Sıcak kâğıt yüzey, koyu yeşil ana vurgu, bordo eylemler; **C4 işareti ve altındaki noktasız ODA aynı kalır**. Arayüzde mevcut sans yazı karakteri korunur; seçilmiş büyük başlıklarda ücretsiz sistem serif kullanılabilir. Okuma alanı dar ve rahat; mobil düzen tek sütun olur.

## Uygulama hedefleri

1. Kurs girişinde gerçek ilerleme varsa “Kaldığın yerden devam” eylemini öne çıkar. Tanıtım bloğunu küçült; kurs seçimini ve kaynak bağlantısını kolay bulunur yap.
2. Beş kursa özgün küçük SVG çizimleri ekle. ADHD için görev → küçük parça → zaman kutusu; manifest için hedef → engel → eğer/o zaman planı gibi içeriği açıklayan görseller kullan. Dersleri “Anla / Dene / Pekiştir” ritmiyle düzenle.
3. Bugün ekranında günlük kararı keşif kutularından önce göster. Masaüstünde Kurslar ve İlham için görünür ikincil gezinme sağla; mobil beş ana hedefi koru.
4. Yeşil ve bordo rollerini ortak tema tokenlarına taşı. Marka bordosunu hata renginden ayır; koyu tema karşılıklarını birlikte tanımla.
5. Özgün SVG ve sistem yazı tipleriyle ilerle. Yeni ücretli araç, deneme aboneliği veya satın alınmış içerik kullanılmaz. Referans sitelerin yerleşimleri, illüstrasyonları, metinleri ve sağlık iddiaları kopyalanmaz.

## Başlangıç bulguları ve hedeflenen düzeltmeler

B komutu: `impeccable detect --json src/pages/Courses.tsx src/pages/Landing.tsx`. Çıkış kodu **2**; **1 uyarı**, **0 hata**. `Courses.tsx:70` içindeki `border-l-2`, `side-tab` kuralına takıldı. Tek bir cevap geri bildirimi için kullanılan bu çizgi bağlamsal olarak düşük değerli/yanlış pozitif sinyaldir; otomatik kaldırma gerekçesi değildir. Landing için bulgu yoktur. Temiz mekanik tarama, iyi hiyerarşi veya erişilebilirlik kanıtı sayılmaz.

| Öncelik | Başlangıç sorunu | Hedef |
|---|---|---|
| **P1** | A incelemesi: `index.html` yakınlaştırmayı `maximum-scale=1.0, user-scalable=no` ile sınırlandırıyor | Kullanıcı yakınlaştırmasını serbest bırak |
| **P1** | B hesabı: `--fg-subtle` açık zeminde **3,46:1**; mobil menü ve küçük ikincil metinlerde kullanılıyor | Normal metin için en az **4,5:1** sağlayan renk rolü |
| **P1** | B hesabı: koyu temada aktif dersin beyaz yazısı/açık yeşil zemini **2,49:1** | Temaya duyarlı `on-accent` yazı rengi |
| **P2** | B hesabı: sabit bordo kurs numarası/koyu zemin **2,36:1** | Temaya duyarlı bordo metin veya numarayı farklı biçimde sunma |
| **P2** | A incelemeleri: benzer ağırlıktaki uzun metin alanları, gizli kurs girişi, zayıf devam etme hiyerarşisi | Okuma ritmi, açıklayıcı görseller ve görünür sonraki adım |

Kontrast değerleri başlangıçtaki CSS renkleri üzerinden WCAG bağıl parlaklık formülüyle hesaplandı; ekran görüntüsünden tahmin edilmedi. Çoğu ders düğmesinin en az 44 px yüksekliği, tıklanabilir checkbox/radio etiketleri, `aria-current`, durum mesajları ve başlığa odak aktarımı korunması gereken güçlü yönlerdir.

## Açık referanslar

- [Headspace uygulama tanıtımı](https://www.headspace.com/app): içerikleri kullanıcı ihtiyacı ve kullanım bağlamıyla anlaşılır gruplara ayırma. Bu bir ürün tasarımı referansıdır; ODA'nın etkililiğine kanıt değildir.
- [Brilliant](https://brilliant.org/): görsel anlatımı kısa etkileşimlerle birleştiren öğrenme yaklaşımı. ODA'ya çıkarımımız, dekorasyon yerine alıştırmayı açıklayan çizimler kullanmaktır.
- [USWDS adım göstergesi](https://designsystem.digital.gov/components/step-indicator/): etkin adımı görünür kılma, açık başlık ve ayrı ileri/geri gezinme.
- [GOV.UK görev listesi](https://design-system.service.gov.uk/components/task-list/): görev durumu ile gezinme yapısını ayırma; sıralı akışta devam etme ihtiyacına uygun yapı seçme.
- [W3C metin kontrastı](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): normal metinde 4,5:1, büyük metinde 3:1 asgari oran. Devre dışı kontrollerin istisnası etkin ders düğmesine uygulanmaz.

Bu kaynakların herkese açık sayfaları incelendi. Ürün üyeliği veya ücretli deneme açılmadı. Buradaki görsel yön ve uygulama seçimleri ODA için yapılan tasarım çıkarımlarıdır.


## Uygulama ve doğrulama

- Giriş, Bugün, Kurslar ve İlham yenilendi. Beş özgün SVG kurs çizimi, özgün giriş şeması, kaynaklara bağlı içerik ve gerçek ilerlemeye göre devam eylemi eklendi.
- C4 şeffaf PNG ve noktasız ODA korundu; koyu temada yalnız sunum filtresiyle görünürlük artırıldı. Yakınlaştırma engeli kaldırıldı, içerik atlama bağlantısı ve kısa ekranlarda kayabilen kenar çubuğu eklendi.
- Tarayıcı: 1280×900 ve 1280×720 masaüstü; 390×844 mobil. Giriş, Bugün, kurs kataloğu ve ikinci ders görüntüleri incelendi. Mobil giriş ve derste belge genişliği 385 px / kaydırma genişliği 385 px: yatay taşma yok. Dersin odaklanan başlığı, aktif ikinci adımı, kilitli sonraki dersleri ve eksik çalışmada pasif tamamlama düğmesi doğrulandı.
- Koyu tema ders görünümü incelendi; aktif açık yeşil adımda koyu yazı doğrulandı. Testten sonra açık tema ve Türkçe seçimi geri getirildi. Girişte EN/TR/ES seçimleri ve ana uygulamaya giden düğme çalıştı.
- Renk hesabı: açık temada subtle/bg 4,56:1; muted/elevated 5,49:1; accent/on-accent 9,14:1; burgundy/on-burgundy 7,51:1. Koyu temada sırasıyla 7,88 / 8,02 / 8,30 / 7,59. Bu dört metin çifti AA eşiğini geçer; tüm uygulamanın eksiksiz WCAG sertifikasyonu değildir.
- TypeScript, mevcut çeviri ve yönlendirme kontrolleri, 18 kurs içerik/ilerleme testi ve toplam 46 birim testi geçti. Notebook ve ses kontrolleri geçti. GitHub Pages yolu ile üretim derlemesi geçti. Önceden mevcut yerel AI paketinin büyük parça uyarısı devam ediyor.
- Kurs metinleri halen Türkçe; üç dilde olan yeni giriş metni ve genel arayüzdür. Canlı AI deneyseldir. Kapalı uygulamada bildirim gönderimi servis bağlantısı gerektirir; görsel değişiklik bu işlevleri hazırmış gibi sunmaz.
