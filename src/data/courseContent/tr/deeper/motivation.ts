import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/motivation.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'motivation-lally', title: 'Surrey Üniversitesi · “Bir alışkanlık edinmek gerçekten 66 gün mü sürer?” Dr. Pippa Lally ile söyleşi', url: 'https://www.surrey.ac.uk/news/does-it-really-take-66-days-form-habit-we-asked-expert-dr-pippa-lally', type: 'guidance', finding: 'Lally, 2010 tarihli çalışmasında günlük bir alışkanlığın oluşması için ortalama sürenin 66 gün olduğunu, ancak aralığın 18 ile 254 gün arasında değiştiğini açıklar: alışkanlığın oluşma süresi çok değişkendir. Yalnızca bilginin davranışı değiştirmediğini belirtir ve bir şeyi ne zaman ve nerede yapacağını gösteren net bir plan önerir.', limitation: 'Çalışmayı özetleyen bir üniversite haber söyleşisidir, makalenin kendisi değildir. Rakamlar tek bir örneklemi ve günlük davranışları anlatır; senin süren farklı olabilir.' },
  { id: 'motivation-fogg', title: 'BJ Fogg · Tiny Habits (2020) — Forbes söyleşisi, “Stanford’lı davranış bilimci değişimin anahtarının bu olduğunu söylüyor”', url: 'https://www.forbes.com/sites/alisacohn/2020/02/25/stanford-behavior-scientist-says-this-one-thing-is-the-key-to-change/', type: 'technique', finding: 'Fogg’un yönteminin üç parçası var: bir çıpa (yeni davranışı hatırlatan, diş fırçalamak gibi mevcut bir günlük olay), minik bir davranış (örneğin yirmi dakika yerine bir dakika meditasyon ya da tek bir dişe diş ipi çekmek) ve hemen ardından bir kutlama; çünkü ona göre alışkanlığı oluşturan, davranışa bağlanan olumlu duygudur.', limitation: 'Kitabın söyleşi özetidir; kitap Fogg’un kendi çalışmalarına ve koçluğuna dayanır. Bulabildiğimiz kadarıyla yöntemin bütününün ve kutlama adımının bağımsız kontrollü araştırma desteği azdır.' },
  { id: 'motivation-fogg-model', title: 'BJ Fogg · Fogg Davranış Modeli (behaviormodel.org)', url: 'https://behaviormodel.org/', type: 'guidance', finding: 'Model B = MAP der: bir davranış, motivasyon, yetenek ve bir uyarıcı aynı anda bir araya geldiğinde gerçekleşir. Bir davranış gerçekleşmiyorsa bu üçünden en az biri eksiktir.', limitation: 'Yazarın kendi sitesinde sunulan betimleyici bir modeldir, deney değildir. Takılan bir alışkanlığı tanılamak için yararlı bir yoldur; ölçülmüş bir tahmin değildir.' },
  { id: 'motivation-woop', title: 'Gabriele Oettingen · WOOP: Dilek, Sonuç, Engel, Plan (woopmylife.org)', url: 'https://woopmylife.org/', type: 'technique', finding: 'Psikolog Gabriele Oettingen’in geliştirdiği WOOP’un dört adımı var: bir dilek adlandır, en iyi sonucu hayal et, yoluna çıkan içsel engeli belirle ve o engelle karşılaşınca ne yapacağına dair bir eğer/o zaman planı kur. Site, yöntemi dilekleri gerçekleştirmek ve alışkanlıkları değiştirmek için bilime dayalı bir zihinsel strateji olarak tanımlar.', limitation: 'Yöntemin resmî sitesidir. Zihinsel karşılaştırmayı eğer/o zaman planlarıyla birleştiren araştırmalar küçük ile orta arası ortalama etkiler gösterir (bkz. Wang ve ark. meta-analizi); sitenin kendisi okundu, her çalışma okunmadı.' },
  { id: 'motivation-milkman', title: 'Katy Milkman · Cazibe paketleme (Character Lab önerisi; bkz. ayrıca How to Change, 2021)', url: 'https://characterlab.org/tips-of-the-week/temptation-bundling/', type: 'technique', finding: 'Wharton profesörü Milkman, cazibe paketlemeyi zevk aldığın bir şeyi angarya gibi gelen değerli bir etkinlikle eşleştirmek olarak tanımlar — örneğin sürükleyici bir romanı yalnızca egzersiz yaparken okumak ya da sevdiğin diziyi yalnızca ev işi yaparken izlemek — böylece hedefin peşinden gitmek daha keyifli hâle gelir.', limitation: 'Araştırmacının kısa bir uygulama önerisidir. Saha çalışmaları egzersiz için mütevazı ortalama kazanımlar gösterir; yaşamın diğer alanlarındaki etki daha az incelenmiştir.' },
  { id: 'motivation-bundling-gym', title: 'Milkman, Minson & Volpp · 2014 · Spor salonunda cazibe paketleme (Knowledge at Wharton özeti)', url: 'https://knowledge.wharton.upenn.edu/article/researchers-used-hunger-games-encourage-healthier-choices/', type: 'research', finding: 'Üniversite spor salonu üyelerinden 226 kişiyle yapılan dokuz haftalık bir deneyde, cezbedici sesli kitapları yalnızca spor salonunda dinleyebilenler başlangıçta kontrol grubundan %51 daha fazla geldi; etki Şükran Günü tatilinden sonra sönümlendi. Sonunda katılımcıların %61’i sesli kitaplarının yalnızca salonda kalması için ödeme yapmayı seçti.', limitation: 'Tek bir üniversite örneklemi ve kısa bir çalışma; etki de zamanla geçti. Makalenin bir üniversite haber özeti okundu, makalenin tamamı değil.' },
  { id: 'motivation-bundling-teaching', title: 'Kirgios ve ark. · 2020 · Egzersizi artırmak için cazibe paketlemeyi öğretmek: bir saha deneyi', url: 'https://www.sciencedirect.com/science/article/pii/S074959782030385X', type: 'research', finding: '6.792 spor salonu üyesiyle yapılan geniş bir saha deneyinde, sesli kitap alıp bunu egzersizle eşleştirmeleri için cesaretlendirilenlerin belirli bir haftada antrenman yapma olasılığı %10–14 daha yüksekti ve haftalık antrenman sayıları kontrol grubuna göre %10–12 fazlaydı; yararlar 17 hafta sonrasına kadar hâlâ görüldü.', limitation: 'Spor salonu üyelerinde egzersiz için mütevazı bir ortalama etki; başka hedefler için sınanmadı. Yalnızca özet okundu.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'motivation-1': {
    deeper: [
      { heading: 'Kalıcı motivasyonun ardındaki üç ihtiyaç',
        paragraphs: [
          'Psikologlar Edward Deci ve Richard Ryan’ın geliştirdiği öz belirleme kuramı, üç temel ihtiyaç karşılandığında motivasyonun daha kalıcı olduğunu öne sürer. Özerklik, itilmediğini, seçtiğini hissetmektir. Yeterlik, bunu gerçekten yapabileceğini hissetmektir. İlişkililik ise yol boyunca diğer insanlarla bağlı hissetmektir.',
          'Kuram ayrıca iki tür motivasyonu birbirinden ayırır. Özerk motivasyon ilgiden ya da sahip olduğun değerlerden gelir. Kontrollü motivasyon baskıdan, ödüllerden ya da başkalarının beklentilerinden gelir. İkisi de seni harekete geçirebilir ama ilki daha sabit olma eğilimindedir.',
        ],
        visual: { kind: 'table', title: 'Üç ihtiyaç, üç soru',
          columns: ['İhtiyaç', 'Ne demek', 'Kendine sor'],
          rows: [
            ['Özerklik', 'Seçme duygusuyla hareket etmek', 'Bunu ben mi seçiyorum, yoksa yalnızca bir “meli”ye mi uyuyorum?'],
            ['Yeterlik', 'Bunu yapabilecek gibi hissetmek', 'İlk adım başarabileceğim kadar küçük mü?'],
            ['İlişkililik', 'Başkalarıyla bağlı hissetmek', 'Bunu kim benimle paylaşabilir ya da beni destekleyebilir?'],
          ],
          note: 'Öz belirleme kuramına (Deci ve Ryan) dayanır. Sorular ODA’nın uyarlamasıdır.' } },
      { heading: 'Araştırma ne diyor?',
        paragraphs: [
          '2021 tarihli bir meta-analiz, öz belirleme kuramına dayanan 73 sağlık müdahalesi çalışmasını birleştirdi. Ortalama olarak bunlar özerk motivasyonda ve ilgili ölçümlerde küçük ile orta arası artışlar, fiziksel ve psikolojik sağlıkta ise küçük iyileşmeler üretti. Özerk motivasyonun arttığı yerlerde sağlık davranışları da iyileşme eğilimi gösterdi.',
          'Etkiler mütevazıydı, çalışmalar arasında değişiyordu ve her tür hedefle değil sağlık alışkanlıklarıyla ilgiliydi. Yine de yön yararlı: gerçekten benimsediğin bir hedef, sahip olman gerektiğini hissettiğin bir hedeften daha iyi bir başlangıç noktasıdır.',
        ] },
    ],
    example: { title: 'Serkan, 31, müşteri hizmetleri temsilcisi',
      text: 'Serkan’ın hedef listesinde üç yıldır “maraton koşmak” vardı; çoğunlukla iki iş arkadaşı kendi hedeflerinden bahsettiği için. Gününde neyi değiştirmek istediğini kendine sorduğunda dürüst cevap farklıydı: işten sonra daha az tutuk hissetmek ve hava kararmadan biraz dışarıda zaman geçirmek istiyordu. İkisi için de maraton gerekmiyordu. Hedefi “mesaimden sonra parkta 20 dakikalık yürüyüş, haftada üç gün” diye yeniden yazdı. Aynı saatte köpeğini gezdiren komşusuna da salı günleri ona katılıp katılamayacağını sordu. İlk hafta iki kez yürüdü. Maratondan küçüktü ama kendisinindi ve onu gerçekten iple çekiyordu.' },
    sources: ['motivation-sdt', 'motivation-sdt-meta'],
  },
  'motivation-2': {
    deeper: [
      { heading: 'Davranış motivasyon, yetenek ve bir uyarıcı ister',
        paragraphs: [
          'Stanford’lı davranış bilimci BJ Fogg modelini B = MAP diye özetler: bir davranış, motivasyon, yetenek ve bir uyarıcı aynı anda bir araya geldiğinde gerçekleşir. Bir davranış gerçekleşmiyorsa bu üçünden en az biri eksiktir.',
          'Motivasyon kendiliğinden inip çıkar; bu yüzden en az güvenilir kaldıraçtır. Yetenek — yani davranışın ne kadar kolay olduğu — tasarlayabileceğin bir şeydir. Başlangıcı küçültmenin işe yaramasının nedeni budur: çıtayı öyle indirir ki motivasyonun düşük olduğu bir an bile yeter.',
        ],
        visual: { kind: 'table', title: 'B = MAP: eksik parçayı bul',
          columns: ['Öğe', 'Soru', 'Örnek çözüm'],
          rows: [
            ['Motivasyon', 'Bunu gerçekten istiyor muyum?', 'Neden önemli olduğuyla yeniden bağ kur (1. ders)'],
            ['Yetenek', 'Şu an yeterince kolay mı?', 'Bir bölüm yerine bir sayfa'],
            ['Uyarıcı', 'Beni doğru anda ne hatırlatır?', 'Yastığın üstünde kitap (3. ders)'],
          ],
          note: 'Fogg Davranış Modeli’ne dayanır. Bir davranış takıldığında hangi parçanın eksik olduğuna bak.' } },
      { heading: 'Fogg neden küçük bir kutlama ekliyor?',
        paragraphs: [
          'Tiny Habits’te Fogg, birçok kişinin atladığı bir adım ekler: minik davranışın hemen ardından kutlamak; örneğin sessiz bir “Evet!” ya da bir gülümsemeyle. Ona göre davranışa bağlanan olumlu his, alışkanlığın kök salmasına yardımcı olan şeydir.',
          'Yöntemin bu kısmı kontrollü denemelerden çok Fogg’un kendi deneyimine ve koçluğuna dayanır; bu yüzden onu bir deneme olarak gör. Küçük bir memnuniyet anı yarın geri dönme ihtimalini artırıyorsa tut. Zorlama geliyorsa, basit bir onay işareti aynı işi görebilir.',
        ] },
    ],
    example: { title: 'Nurten, 52, eczacı',
      text: 'Nurten akşamları esneme hareketleri yapmak istiyordu ama yemek toplandığında 20 dakikalık bir rutin imkânsız geliyordu. Onu tek bir harekete küçülttü: üç nefes boyunca parmak uçlarına uzanmak. Yoga minderini koltuğun yanına serdi ve orada bıraktı. Pazartesi günü tek hareketi yaptı ve şaşırarak iki tane daha ekledi. Salı günü bitkindi ve yalnızca tekini yaptı — sonra yüksek sesle “tamam” dedi, bu da onu güldürdü. Hafta sonuna gelince minder oturma odasının bir parçası olmuştu ve tek hareket, çoğu akşam sessizce beş altıya dönüşmüştü. Bazı akşamlar hâlâ yalnızca bir tane oluyordu; o da sayılır diye karar verdi.' },
    sources: ['motivation-fogg', 'motivation-fogg-model'],
  },
  'motivation-3': {
    deeper: [
      { heading: 'Çıpa tarifi',
        paragraphs: [
          'BJ Fogg işarete çıpa der ve onu kısa bir tarif olarak yazar: “[Çıpa]dan sonra [minik davranış]ı yapacağım.” Çıpa, düşünmeden her gün yaptığın bir şey olmalı ve yeni davranış o yere doğal biçimde oturmalı — diş fırçalamadan sonra diş ipi kullanmak gibi, sabah işe gidiş yolculuğundan sonra değil.',
          'Aynı bağlamda çok sayıda tekrardan sonra işaret, davranışı daha az çabayla aklına getirmeye başlar. Araştırmacıların alışkanlık dediği şey, bu giderek artan otomatikleşmedir.',
        ],
        visual: { kind: 'cycle', title: 'Bir işaret nasıl alışkanlığa dönüşür?', center: 'Aynı bağlam, tekrar tekrar',
          nodes: [
            { label: 'İşaret', text: 'Zaten yaptığın bir çıpa: “Çayımı doldurduktan sonra…”' },
            { label: 'Minik davranış', text: '“…kitabımı açacağım.”' },
            { label: 'İyi his', text: 'Küçük bir memnuniyet anı.' },
            { label: 'Tekrar', text: 'Aynı işaret, aynı yer, gün be gün.' },
          ],
          note: 'Alışkanlık araştırmalarına ve Fogg’un tarifine dayanan basitleştirilmiş bir resim; bir yönü anlatır, takvimi değil.' } },
      { heading: 'Ne kadar sürer?',
        paragraphs: [
          'Bir alışkanlığın 21 ya da 66 gün sürdüğünü duymuş olabilirsin. Pippa Lally’nin 2010 tarihli çalışmasında günlük bir alışkanlık için ortalama 66 gündü ama aralık 18 ile 254 gün arasında değişiyordu. Lally’nin kendisi asıl bulgunun, alışkanlık oluşumunun ne kadar değişken olduğu olduğunu vurgular.',
          'Yani tutturulması gereken bir son tarih yok. Alışkanlığın bir ay sonra hâlâ çaba istiyorsa bu olağandır, yanlış yaptığının işareti değildir.',
        ],
        visual: { kind: 'bars', title: 'Günlük bir alışkanlığın otomatik hissedilmesine kadar geçen gün',
          bars: [
            { label: 'En hızlı', value: 18, display: '18 gün' },
            { label: 'Ortalama', value: 66, display: '66 gün' },
            { label: 'En yavaş', value: 254, display: '254 gün' },
          ],
          note: 'Lally 2010, Lally’nin Surrey Üniversitesi söyleşisindeki anlatımıyla: tek bir örneklem ve yalnızca günlük davranışlar; senin süren farklı olabilir.',
          sourceId: 'motivation-lally' } },
      { heading: 'Sık yapılan hatalar',
        paragraphs: [
          'En yaygın işaret aynı zamanda en zayıfıdır: “vaktim olduğunda.” Bu asla zamanında gelmez. Bir başka hata, her gün farklı saatte ya da yerde gerçekleşen bir çıpa seçmektir. Sabit bir şey seç ve birkaç denemeden sonra işe yaramazsa, kendini suçlamadan önce işareti değiştir.',
        ] },
    ],
    example: { title: 'Berk, 24, kurye',
      text: 'Berk İspanyolca çalışmak istiyordu ama hep “sonra vakit bulurum” diyordu ve o vakit hiç gelmiyordu. Her gün aşağı yukarı aynı saatte olan bir şey aradı. Cevap öğle yemeğiydi: hep öğlen civarı minibüste yerdi. Tarifi şöyle oldu: “Yemeğimi açtıktan sonra dil uygulamamda bir ders yapacağım.” İlk iki gün unuttu, çünkü telefonu torpido gözündeydi. Onu bardaklığa taşıdı. Çarşamba günü işe yaradı, perşembe günü de. Cuma günü öğle yemeğini tamamen atladı, yani işaret yoktu — dersi evde yaptı ve bunu dert etmedi. Üç hafta sonra, canı istemeyen günlerde bile yemeğini açmak ona dersi hatırlatıyordu.' },
    sources: ['motivation-fogg', 'motivation-lally'],
  },
  'motivation-4': {
    deeper: [
      { heading: 'Yalnızca hayal etmek neden yetmez?',
        paragraphs: [
          'Psikolog Gabriele Oettingen, zihinsel karşılaştırma adı verilen bir yaklaşım geliştirdi: önemsediğin dileği, yolundaki engele net bir bakışla eşleştirirsin. Bir eğer/o zaman planıyla birleştiğinde bu, dört adımlı WOOP yöntemine dönüştü: Dilek, Sonuç, Engel, Plan (Wish, Outcome, Obstacle, Plan).',
          '21 çalışmalık bir meta-analiz, zihinsel karşılaştırmayı eğer/o zaman planlarıyla birleştirmenin hedeflere ulaşmada küçük ile orta arası bir ortalama etkisi olduğunu buldu. Bu gerçek ama mütevazı bir etki — yararlı bir araç, bir garanti değil.',
        ],
        visual: { kind: 'compare', title: 'Olumlu hayal ya da zihinsel karşılaştırma',
          left: { label: 'Yalnızca mutlu son', items: ['Hedefe çoktan ulaşmış gibi hayal et', 'Şimdi iyi hisset', 'Engelle hazırlıksız karşılaş'] },
          right: { label: 'Zihinsel karşılaştırma (WOOP)', items: ['En iyi sonucu hayal et', 'İçindeki engeli adlandır', 'Onu bir eğer/o zaman planına bağla'] },
          note: 'Gabriele Oettingen’in WOOP yöntemine dayanır. Hayal kurmak serbest; yalnızca engele dürüst bir bakışla birlikte daha iyi işler.' } },
      { heading: 'İçteki engeller ve dıştaki koşullar',
        paragraphs: [
          'WOOP, içindeki engele — bir alışkanlığa, bir duyguya, bir düşünceye — odaklanır; çünkü plan yapabileceğin kısım odur. Hasta bir çocuk, bir gece vardiyası ya da sıkı bir bütçe gibi dış koşullar da gerçektir ama farklı bir yanıt ister: hedefin boyutunu, zamanını veya şeklini değiştirmek ya da yardım istemek.',
          'Bunları ayırt etmek seni iki tuzaktan korur: kontrol edemediğin şeyler için kendini suçlamak ve kontrol edebildiklerini görmezden gelmek.',
        ] },
    ],
    example: { title: 'Gamze, 36, banka gişe görevlisi',
      text: 'Gamze haftada üç akşam gitar çalışmak istiyordu. Eve dönerken otobüste WOOP’u denedi. Dilek: yaza kadar üç şarkıyı iyi çalmak. En iyi sonuç: yeğeninin doğum gününde çalmak. Engel — dürüst olanı: eve gelince “bir dakikalığına” kanepeye oturuyor ve akşam bitiyordu. Plan: “Kanepenin çekimini hissedersem, oturmadan önce gitarı kılıfından çıkaracağım.” İlk akşam planı unuttu. İkinci akşam hatırladı, gitarı çıkardı ve kanepenin üstünde on dakika çaldı. Perşembe günü mesaisi uzadı — bir dış koşul — o yüzden suçluluk duymadan bıraktı ve cumartesi çaldı.' },
    sources: ['motivation-woop'],
  },
  'motivation-5': {
    deeper: [
      { heading: 'Kaçırılan bir gün alışkanlığı silmez',
        paragraphs: [
          'Lally’nin alışkanlık çalışmasında davranışı bir kez kaçırmak, alışkanlığın otomatikleşme sürecini fark edilir biçimde geriye götürmedi. Daha çok önem taşıyan şey geri dönmek gibi görünüyor. Kaçırılan bir günün tehlikesi günün kendisinden çok, ardından gelen hikâyedir: “Serimi bozdum, artık neden uğraşayım.”',
          'Daha nazik ve daha yararlı bir kural, bir sonraki işareti taze bir fırsat saymak ve kahramanca olana değil, minik sürüme dönmektir.',
        ] },
      { heading: 'Geri dönmeyi daha çekici kıl',
        paragraphs: [
          'Wharton profesörü Katy Milkman, cazibe paketleme denen bir numarayı inceler: keyif aldığın bir şeyi kaçınma eğiliminde olduğun bir şeyle eşleştir. İlk çalışmasında, sürükleyici sesli kitapları yalnızca spor salonunda duyabilenler başlangıçta kontrol grubundan %51 daha sık gitti; ancak etki bir tatil arasından sonra sönümlendi.',
          '6.792 spor salonu üyesiyle yapılan sonraki bir saha deneyi daha küçük ama kalıcı bir etki buldu: insanlara sesli kitabı egzersizle eşleştirmeyi öğretmek yalnızca, belirli bir haftada antrenman yapma olasılıklarını %10–14 artırdı ve yararlar 17 hafta sonrasına kadar görüldü. Bu mütevazı bir destek, sihir değil; denemesi de kolay.',
        ],
        visual: { kind: 'table', title: 'İki çalışmada cazibe paketleme',
          columns: ['Çalışma', 'Kim', 'Ne oldu'],
          rows: [
            ['Milkman ve ark. 2014', '226 üniversite spor salonu üyesi', 'Yalnızca salona özel sesli kitaplarla başlangıçta %51 daha fazla ziyaret; etki bir aradan sonra sönümlendi'],
            ['Kirgios ve ark. 2020', '6.792 spor salonu üyesi', 'Paketlemeyi öğrenenlerde belirli bir haftada antrenman yapma olasılığı %10–14 daha yüksek, 17 haftaya kadar'],
          ],
          note: 'İki çalışma da egzersizle ilgilidir. Etki ortalama olarak mütevazıdır ve başka hedefler için farklı olabilir.' } },
    ],
    example: { title: 'Kemal, 47, otobüs tamircisi',
      text: 'Kemal akşam yürüyüşünü on bir gündür sürdürüyordu ki bir aile ziyareti onu beş gün aksattı. İlk düşüncesi yürüyüşü “bozduğu” ve telafi için iki kat uzağa yürümesi gerektiğiydi. Bunun yerine kısa haftalık notuna baktı: neyin yardımı olmuştu? Akşam yemeğinden hemen sonra yürümek ve podcast’i. Neyin olmamıştı? Planla ilgili hiçbir şey — yalnızca yoğun bir hafta. Böylece pazartesi günü küçük sürüme döndü: yemekten sonra sokakta bir tur. Daha davetkâr hâle getirmek için en sevdiği futbol podcast’ini yalnızca yürüyüşlere sakladı. O hafta dört kez yürüdü. Kaçırılan beş gün hâlâ kaçırılmıştı ama artık bir şeyin sonu gibi hissettirmiyordu.' },
    sources: ['motivation-milkman', 'motivation-bundling-gym', 'motivation-bundling-teaching'],
  },
};
