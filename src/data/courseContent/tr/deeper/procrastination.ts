import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/procrastination.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'procrastination-pychyl-start', title: 'Timothy A. Pychyl · 2008 · “Sadece başla” (Psychology Today, Don’t Delay blogu)', url: 'https://www.psychologytoday.com/us/blog/dont-delay/200803/just-get-started', type: 'guidance', finding: 'Erteleme araştırmacısı Tim Pychyl, laboratuvarının deneyim örnekleme verilerini anlatır: insanların kaçındıkları sırada çok stresli ve hoş olmayan diye değerlendirdikleri işler, gerçekten başlandığında çok daha az itici geldi; hatta kısmi bir başlangıç yapanlar ertesi gün kendilerini daha kontrollü ve daha umutlu hissetti. Ayrıca “Yarın daha çok canım isteyecek” inancının nadiren gerçekleştiğini belirtir.', limitation: 'Yazarın kendi araştırmasını genel okuyucu için özetleyen bir blog yazısıdır, hakemli bir makale değildir; Pychyl de başlamayı tam bir çözüm olarak değil, ilk adım olarak sunar.' },
  { id: 'procrastination-pomodoro', title: 'Francesco Cirillo · Pomodoro Tekniği (resmî site)', url: 'https://www.pomodorotechnique.com/francesco-cirillo/', type: 'technique', finding: 'Cirillo tekniği 1980’lerde üniversite derslerine odaklanmakta zorlanırken, domates şeklinde bir mutfak zamanlayıcısıyla geliştirdi (“pomodoro” İtalyanca domates demektir); ilk deneyi, yalnızca iki dakika kesintisiz çalışıp çalışamayacağını görmekti. Teknik yaygın olarak, kısa molalarla ayrılmış 25 dakikalık odaklı bloklar olarak öğretilir. Cirillo, amacın pomodoro biriktirmek değil, çalışırken zihninde neler olduğunun farkına varmak olduğunu vurgular.', limitation: 'Yaratıcısının kendi sitesidir, bağımsız bir değerlendirme değildir; teknik bir bütün olarak kontrollü denemelerde sınanmamıştır. Blok ve mola süreleri araştırma bulgusu değil, geleneksel uygulamadır.' },
  { id: 'procrastination-pomodoro-breaks', title: 'Biwer ve ark. · 2023 · “Pomodoro” molaları ile kendi seçtiği molalar', url: 'https://cris.maastrichtuniversity.nl/en/publications/understanding-effort-regulation-comparing-pomodoro-breaks-and-sel/', type: 'research', finding: '87 Hollandalı üniversite öğrencisi ya kendi seçtikleri molalarla (n = 35), ya her 24 dakikadan sonra 6 dakikalık molalarla (“Pomodoro”, n = 25), ya da her 12 dakikadan sonra 3 dakikalık molalarla (n = 27) çalıştı. Kendi molasını seçen öğrenciler daha uzun aralıklarla çalışıp dinlendi ama daha çok yorgunluk ve dikkat dağınıklığı, daha az konsantrasyon ve motivasyon bildirdi. Görevin tamamlanması ve zihinsel çaba anlamlı biçimde farklılaşmadı; yazarlar sabit molaların ruh hâli açısından yararlı olduğu ve daha verimli göründüğü sonucuna varır.', limitation: 'Yalnızca özet okundu. Üniversite öğrencileriyle tek oturumluk kendi kendine çalışmayı inceleyen küçük bir çalışmadır; erteleme değil mola düzenlerini sınadı ve gruplar küçüktü.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'procrastination-1': {
    deeper: [
      {
        heading: 'Tim Pychyl’in bakışı: zaman değil, duygu sorunu',
        paragraphs: [
          'Uzun yıllardır erteleme üzerine çalışan psikolog Tim Pychyl, ertelemeyi geri tepen bir duygu düzenleme yolu olarak tanımlıyor. Bir iş bizi kaygılı, sıkkın, öfkeli ya da kararsız hissettirir. Ertelemek hızlı bir rahatlama getirir ve kaçınmak bir çözüm gibi görünmeye başlar. Ama iş ortadan kalkmaz; daha sonra, çoğu zaman daha büyük, ek stres ve kendini suçlamayla birlikte geri gelir.',
          'Fuschia Sirois ile birlikte yazdığı bir derlemede Pychyl bunu senin iki versiyonun arasında bir takas olarak anlatıyor: şimdiki sen rahatlamayı alır, gelecekteki sen faturayı öder. Böyle bakınca bir yapılacaklar uygulaması ya da daha sıkı bir program ancak bir yere kadar yardımcı olur. Daha çok işe yarayan, hissi fark etmeyi, onu bir süre taşımayı ve yine de küçük bir adım atmayı öğrenmektir.',
        ],
        visual: {
          kind: 'cycle', title: 'Erteleme döngüsü', center: 'Kısa vadeli rahatlama, uzun vadeli bedel',
          nodes: [
            { label: 'İş', text: 'Belirsiz, sıkıcı ya da tehditkâr gelen bir iş.' },
            { label: 'His', text: 'Korku, kaygı ya da sıkıntı yükselir.' },
            { label: 'Kaçınma', text: 'Daha kolay bir şeye geçersin.' },
            { label: 'Rahatlama', text: 'Kötü his şimdilik hafifler.' },
            { label: 'Dönüş', text: 'İş, artık ek baskı ve kendini suçlamayla geri gelir.' },
          ],
          note: 'Ruh hâli onarımı bakışının (Sirois ve Pychyl) bir anlatımıdır, ölçülmüş bir model değildir. Döngüyü kırmak çoğunlukla hissi fark etmekle başlar.',
        },
      },
      {
        heading: 'Rakamlar ne söylüyor, ne söylemiyor?',
        paragraphs: [
          'Piers Steel’in geniş derlemesinde erteleme, bir işi itici bulmakla ve dürtüselliğle güçlü biçimde, insanların ne kadar çalışmayı niyet ettikleriyle ise neredeyse hiç ilişkili çıkmadı. Steel, ertelemenin yetişkinlerin yaklaşık %15–20’si için süregelen bir sorun olduğunu tahmin ediyor. Bunlar korelasyonlardır: itici işlerin ertelemeye yol açtığını kanıtlamazlar ama nereye bakmaya değeceğini gösterirler.',
          'Cesaret verici olan, rakamların dışarıda bıraktığı şey. Çalışmak istemek eksik parça değil; yani “daha çok istemen” gerekmiyor. İşin çevresindeki his, ilk adımın büyüklüğü ve zor an için yaptığın plan değiştirilebilir ve sonraki dersler tam olarak bunlar üzerinde çalışıyor.',
        ],
      },
    ],
    example: { title: 'Sofia, 31, pazarlama koordinatörü', text: 'Sofia masraf raporundan üç haftadır kaçıyordu. Genellikle kendine “idari işlerde kötüyüm” diyordu. Bir kahve molasında bunun yerine alıştırmayı denedi: rapor şablonunun bulunduğu e-postayı açtı ve ne olduğunu fark etmek için durdu. Gelen kelime “korku” idi ve altında “utanç” vardı. Tetikleyen şey tablo değildi; çantasındaki buruşuk fişlerdi, bir kısmı büyük ihtimalle kaybolmuştu. Yapışkan bir nota şunu yazdı: “Kayıp fişler yüzünden korku + utanç.” O gün rapora başlamadı. Ama “idari işlerde kötüyüm” cümlesi, belirli bir parçaya dair belirli bir hisse dönüşmüştü ve bu, üzerinde çalışılabilecek bir şey gibi geldi.' },
    sources: ['procrastination-pychyl-start'],
  },
  'procrastination-2': {
    deeper: [
      {
        heading: 'Başlamak hissi neden değiştirir?',
        paragraphs: [
          'Tim Pychyl, laboratuvarının araştırmasından bir örüntüyü anlatıyor: insanların kaçınırken çok stresli ve hoş olmayan diye değerlendirdiği işler, gerçekten başlandığında çok daha az hoş olmayan hissettirdi. Kısmi bir başlangıç bile yapanlar ertesi gün kendilerini daha kontrollü ve daha umutlu hissetti. Korkunun büyük kısmı beklemekte yaşıyor.',
          'Ayrıca yaygın bir tuzağa dikkat çekiyor: “Yarın daha çok canım isteyecek.” Yarınki ruh hâli nadiren daha iyi çıkar. Küçük bir ilk hareket doğru ruh hâlini beklemez; sana işle ilgili farklı bir deneyim yaşatarak ruh hâlini değiştirir.',
        ],
      },
      {
        heading: 'Kısa, zamanlı bloklarla çalışmak',
        paragraphs: [
          'Francesco Cirillo, Pomodoro Tekniği’ni 1980’lerde, odaklanamayan bir öğrenciyken geliştirdi. İlk deneyi mütevazıydı: yalnızca iki dakika kesintisiz ders çalışabilir miydi? Teknik buradan, genellikle 25 dakika olarak öğretilen ve kısa molalarla ayrılmış zamanlı odaklı bloklara dönüştü.',
          'Küçük bir çalışma, 87 üniversite öğrencisinde mola düzenlerini karşılaştırdı. Sabit mola veren öğrenciler (her 24 dakikadan sonra 6, ya da her 12 dakikadan sonra 3 dakika) kendi molasını seçenlere göre daha az yorgunluk ve dikkat dağınıklığı, daha çok konsantrasyon ve motivasyon bildirdi ve benzer miktarda iş çıkardı. Tek oturumluk, küçük örneklemli bir çalışmaydı; bu yüzden bir kural değil, bir ipucu olarak al. Sana uyan blok uzunluğu başlangıçta çok daha kısa olabilir.',
        ],
        visual: {
          kind: 'table', title: 'Mola vermenin üç yolu (Biwer ve ark. 2023)', columns: ['Mola düzeni', 'Öğrenci', 'Bildirdikleri'],
          rows: [
            ['Kendi seçtiği molalar', '35', 'Daha uzun aralıklar; daha çok yorgunluk ve dikkat dağınıklığı, daha az konsantrasyon ve motivasyon'],
            ['Her 24 dakikada 6 dakika', '25', 'Daha iyi ruh hâli ölçümleri; benzer görev tamamlama'],
            ['Her 12 dakikada 3 dakika', '27', 'Daha iyi ruh hâli ölçümleri; benzer görev tamamlama'],
          ],
          note: 'Tek bir kendi kendine çalışma oturumunu inceleyen küçük bir çalışma. Doğrudan erteleme değil, mola düzenlerini sınadı.',
        },
      },
    ],
    example: { title: 'Kevin, 45, serbest çevirmen', text: 'Kevin’in çevirmesi gereken 20 sayfalık bir sözleşme vardı ve iki sabahını e-postalara yanıt vererek “hazırlanmakla” geçirmişti. Üçüncü sabah işi “sözleşmeyi çevir” diye yazdı, sonra parçalara böldü: baştan sona oku, bir sözlük oluştur, birinci bölümü çevir. “Baştan sona oku” bile ağır geldi, o yüzden küçülttü: dosyayı aç ve ilk sayfayı oku. 25 dakika fazla geldiği için mutfak zamanlayıcısını on dakikaya kurdu. Çaldığında üç sayfa okumuş ve dört zor terimi not etmişti. Beş dakika mola verdi, çay yaptı ve zamanlayıcıyı yeniden kurdu. Sözleşme hâlâ uzundu ama artık bir duvar değildi; bir sayfa yığınıydı ve bir kısmını yerinden oynatmıştı.' },
    sources: ['procrastination-pychyl-start', 'procrastination-pomodoro', 'procrastination-pomodoro-breaks'],
  },
  'procrastination-3': {
    deeper: [
      {
        heading: 'Piers Steel’in zamansal motivasyon kuramı',
        paragraphs: [
          'Piers Steel, erteleme araştırmalarını zamansal motivasyon kuramı adlı tek bir fikirde topluyor. Bir iş, onda başarılı olacağını beklediğinde (beklenti) ve senin için önemli olduğunda ya da seni ödüllendirdiğinde (değer) seni daha çok çeker. Ödül uzaktayken (gecikme) ve yakındaki şeylerden daha kolay etkilendiğinde (dürtüsellik) ise daha az çeker. Üç hafta sonra teslim edilecek bir rapor, hemen şimdi ödüllendiren bir videoyla kötü rekabet eder.',
          'İşe yarar kısım, her parçanın bir kaldıraç önermesi. Beklentiyi işi küçülterek, değeri işi önemsediğin şeylere bağlayarak artırabilir, gecikmeyi daha yakın kontrol noktaları ve küçük ödüllerle kısaltabilir, dürtüselliği de dikkat dağıtıcıları ulaşamayacağın yere koyarak azaltabilirsin. WOOP ve eğer/o zaman planları esas olarak sonuncusu üzerinde çalışır: çekim geldiğinde ne yapacağına önceden karar verirler.',
        ],
        visual: {
          kind: 'table', title: 'Zamansal motivasyon kuramından dört kaldıraç', columns: ['Etken', 'Ne demek?', 'Denenecek bir şey'],
          rows: [
            ['Beklenti', 'Yapabileceğinden ne kadar emin hissettiğin', 'Başarı olası hissettirene kadar işi küçült'],
            ['Değer', 'Senin için ne kadar önemli ya da ödüllendirici olduğu', 'Neden önemli olduğunu tek satırla yaz'],
            ['Gecikme', 'Karşılığın ne kadar uzakta olduğu', 'Küçük bir ödüllü, daha yakın bir kontrol noktası koy'],
            ['Dürtüsellik', 'Yakındaki cazibelerin ne kadar güçlü çektiği', 'Bir eğer/o zaman planı yap ve dikkat dağıtıcıyı uzaklaştır'],
          ],
          note: 'Korelasyonel bulgulara uyan Steel’in modeline dayanır; bir düşünme biçimidir, sınanmış bir tedavi değildir.',
        },
      },
      {
        heading: 'Eğer/o zaman planlarında sık yapılan hatalar',
        paragraphs: [
          '“Eğer” kısmı çoğu zaman fazla belirsizdir. “Canım istemezse” neredeyse her zaman doğrudur, bu yüzden net bir işaret olamaz. “Masama oturduktan sonra telefonumu eline alırsam” ise gerçekleştiğinde tanıyacağın bir andır.',
          '“O zaman” kısmı çoğu zaman fazla büyüktür. “O zaman iki saat çalışacağım”, engelin tam da tıkadığı çabayı ister. “O zaman önce tek bir cümle yazacağım” ise his güçlüyken bile gerçekleşecek kadar küçüktür. En sık karşılaştığın engel için tek bir plan, hatırlamayacağın beş plandan iyidir.',
        ],
      },
    ],
    example: { title: 'Grace, 26, yüksek lisans öğrencisi', text: 'Grace tezinin literatür taramasını bu hafta bitirmek istiyordu; bitirirse her hafta sonu suçluluk duymayı bırakabilirdi. Engeli ararken bunun zaman olmadığını gördü. Engel, belgeyi açtıktan sonra yeterince bilmediğini hissedip telefona uzandığı andı. Planı şuydu: “Belgeyi açtıktan sonra telefona uzanırsam, o zaman telefonu çekmeceye koyup ilk makale hakkında tek bir cümle yazacağım.” Bunu otobüste bir kez prova etti. Salı günü kendini telefon zaten elindeyken yakaladı, biraz güldü ve telefonu çekmeceye koydu. Yazdığı cümle beceriksizdi. Yine de bir tane daha yazdı.' },
    sources: ['task-aversiveness', 'oettingen-woop-method'],
  },
  'procrastination-4': {
    deeper: [
      {
        heading: 'Kendini affetme çalışması ne buldu?',
        paragraphs: [
          'Michael Wohl, Tim Pychyl ve Shannon Bennett birinci sınıf öğrencilerini iki ara sınav boyunca izledi. İlk sınavdan sonra öğrenciler ne kadar ertelediklerini ve bunun için kendilerini ne kadar affettiklerini bildirdi. Kendini daha çok affedenler ikinci sınavdan önce daha az erteledi ve bağlantı, derse karşı daha az olumsuz hissetmek üzerinden işliyordu.',
          'Çalışmanın gerçek sınırları var: korelasyoneldi, tek bir derste yapıldı ve başlayan 312 öğrenciden yalnızca 119’u son analize girdi. Bu yüzden affetmenin daha az ertelemeye yol açtığını kanıtlayamaz. Ama ruh hâli onarımı bakışına uyuyor: erteleme kötü duygulardan kaçmanın bir yoluysa, üstüne daha fazla kötü duygu yığmak yardımcı olmaz. Daha genel olarak öz şefkat araştırmaları stres ve kaygı için küçük ile orta düzeyde kısa vadeli yararlar gösteriyor.',
        ],
      },
      {
        heading: 'Üç parçalı bir affetme metni',
        paragraphs: [
          'Kendini affetmek belirsiz gelebilir, bu yüzden hazır kelimelere sahip olmak işe yarar. Aşağıdaki üç parça dürüstlüğü ve nezaketi bir arada tutar. Onları içinden söyle ya da yaz; tam ifade senin.',
          'Bunu yaparken sert ses geri gelirse bu normal. Onunla tartışman ya da onu susturman gerekmez. Sadece fark et (“işte eleştirmen yine geldi”) ve metne dön.',
        ],
        visual: {
          kind: 'steps', title: 'Affet, sonra geri dön',
          steps: [
            { label: 'Adını koy', text: '“Raporu bu hafta yine erteledim.”' },
            { label: 'İnsani kıl', text: '“Belirsiz ve stresli geldi; birçok insan böyle işlerden kaçınır.”' },
            { label: 'Sorumluluğu al', text: '“Yine de benim için önemli ve bir kısmını düzeltebilirim.”' },
            { label: 'Sonraki adımı seç', text: '“Yarın saat 9’da dosyayı açıp ilk başlığı yazacağım.”' },
          ],
          note: 'Burada affetmek, saldırıyı bırakmak demek; işi bırakmak değil.',
        },
      },
    ],
    example: { title: 'Daniel, 36, proje yöneticisi', text: 'Daniel ekibine Cuma gününe kadar bir bütçe taslağı sözü vermişti ve Cuma öğleden sonra hâlâ boş bir sayfaydı. Eve dönerken her zamanki sesi duydu: “Hep böyle yapıyorsun. Herkes hiçbir şeyi yönetemediğini görecek.” Arabayı park ettiğinde dizüstünü açmak için bile fazla ağır hissediyordu. Arabada otururken metni denedi. “Taslağı yapmadım. Belirsiz geldi ve kaçınmaya devam ettim; insanların başına gelir. Yine de önemli ve bir kısmını düzeltebilirim.” Sonra adım: ekibine taslağın Pazartesi öğlene kadar geleceğini yazan bir e-posta ve dosyayı 8.30’da açması için bir not. Pazartesi günü başlamak bir hükümle yüzleşmek gibi gelmedi.' },
  },
  'procrastination-5': {
    deeper: [
      {
        heading: 'Araçları takıldığın türe göre eşleştirmek',
        paragraphs: [
          'Erteleme her seferinde aynı görünmez ve bu kurstaki araçlar onun farklı sürümlerine uyar. Bir iş şekilsiz geldiğinde en çok işi küçültmek yardımcı olur. Belirli bir an seni sürekli raydan çıkarıyorsa eğer/o zaman planı uyar. Karşılık uzaktaysa daha yakın bir kontrol noktası gecikmeyi kısaltır; Steel’in modelinin yardımcı olmasını öngördüğü tam da budur.',
          'Hepsine aynı anda ihtiyacın yok. Takılma biçimine uyan bir ya da iki tanesini seç, bir hafta dene ve ne olduğuna bak. Ne yaptığını, basit bir işaretle bile olsa izlemek, geniş bir meta-analizde daha iyi hedef ilerlemesiyle ilişkiliydi ve haftalık gözden geçirmene bakacak gerçek bir şey verir.',
        ],
        visual: {
          kind: 'table', title: 'Hangi takılma türüne hangi araç?', columns: ['İş şöyle geliyorsa…', 'Dene', 'Hangi dersten'],
          rows: [
            ['Ağır ve korkutucu', 'Hissin adını koy, sonra iki dakikalık bir ilk hareket', '1 ve 2'],
            ['Şekilsiz ya da devasa', 'Parçalara ve somut bir fiile böl', '2'],
            ['Belli bir ana kadar sorun yok', 'O an için bir eğer/o zaman planı', '3'],
            ['Uzak ve göz ardı etmesi kolay', 'Küçük ödüllü, daha yakın bir kontrol noktası', '5'],
            ['Zaten ertelediğin için bozulmuş', 'Affetme metni, sonra tek bir adım', '4'],
          ],
          note: 'Bir menü, kontrol listesi değil. Bir hafta için sana uyan bir ya da iki araç yeter.',
        },
      },
      {
        heading: 'Ne zaman daha fazla destek aramalı?',
        paragraphs: [
          'Müdahale araştırmalarındaki en güçlü sonuçlar, eğitimli bir uzmanla yapılan bilişsel davranışçı terapiden geldi. Bunu bilmek değerli, çünkü bazı erteleme, kısa bir kursun ele alamayacağı şeylerle iç içedir: süregelen kaygı, depresyon ya da DEHB gibi dikkat güçlükleri.',
          'Bir doktora ya da terapiste danışma zamanının geldiğine işaretler şunlardır: ertelemek sana iş, not, ilişki ya da sağlık kaybettiriyor; işlerin çevresindeki duygular yoğun ya da sürekli; ya da birkaç yaklaşım denedin ve hiçbir şey kıpırdamıyor. O noktada yardım istemek irade zayıflığı değildir. Daha zor bir sorun için daha güçlü bir araç seçmektir.',
        ],
      },
    ],
    example: { title: 'Nadia, 29, okula başvuran veteriner teknisyeni', text: 'Nadia’nın başvuru yazısı üç hafta sonra teslim edilecekti ve kendini tanıyordu: bir gece öncesinde başlayacaktı. Pazar günü planı doldurdu. İlk hareket: bir belge açıp onu bu mesleği istemeye götüren üç anı sıralamak. Zaman ve yer: Salı akşam 7, akşam yemeğinden sonra mutfak masası. Eğer/o zaman: “Eski e-postaları yeniden okumaya başlarsam, önce tek bir cümle yazacağım.” Deneme olarak iki ara tarih koydu: bir sonraki Pazar’a kadar kaba taslak ve ondan sonraki Çarşamba günü bir arkadaşının okuması. Salı gayet iyi geçti. Perşembe günü hiç yapmadı. Pazar günkü iki dakikalık gözden geçirmede arkadaşının tarihinin onu kendi tarihinden daha çok zorladığını not etti ve arkadaşının okumasını üç gün öne aldı.' },
    sources: ['task-aversiveness'],
  },
};
