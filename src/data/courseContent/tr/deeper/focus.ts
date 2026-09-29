import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/focus.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'focus-attention-residue', title: 'Leroy · 2009 · İşler arasında geçerken dikkat artığı', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0749597809000399', type: 'research', finding: 'İki deneyde Sophie Leroy, insanlar ikinci bir işe geçtikten sonra birinci işe dair düşüncelerin sürdüğünü (“dikkat artığı”) ve bunun ikinci işteki performansı düşürdüğünü buldu. Birinci işi yarım bırakmak durumu kötüleştirdi, bitirmek her zaman zihinsel olarak bırakmaya yetmedi, birinci işi bir miktar zaman baskısı altında bitirmek ise insanların ondan kopmasına yardımcı oldu.', limitation: 'Yalnızca özet okundu; örneklem büyüklükleri ve etki büyüklükleri kontrol edilmedi. Deneylerde laboratuvar görevleri kullanıldı; zaman baskısının yardımcı rolü genel olarak baskı altında çalışmaya değil, birinci işi kapatmaya ilişkindi.' },
  { id: 'focus-ready-to-resume', title: 'Leroy & Glomb · 2018 · “Devam etmeye hazır plan” (Washington Üniversitesi haber bülteni)', url: 'https://www.washington.edu/news/2018/01/16/task-interrupted-a-plan-for-returning-helps-you-move-on/', type: 'technique', finding: 'Üniversitenin Organization Science’ta yayımlanan bir makale özetine göre, dört deney (202 çalışan profesyonelle yapılan bir çalışma ve öğrenci katılımcılarla yapılan laboratuvar çalışmaları) “devam etmeye hazır planı” sınadı: bölündüklerinde insanlar yaklaşık bir dakika ayırıp nerede kaldıklarını, neyin çözülmemiş olduğunu ve sonra ne yapacaklarını yazdı. Plan dikkat artığını azalttı; bölen işte daha iyi kararlara ve bilginin daha iyi hatırlanmasına yol açtı.', limitation: 'Makalenin kendisi değil, bir üniversite haber bülteni; etki büyüklükleri verilmedi. Planın, bölünen asıl işteki sonraki performansı iyileştirip iyileştirmediği sınanmadı.' },
  { id: 'focus-newport-time-blocking', title: 'Cal Newport · 2013 · “Deep Habits: The Importance of Planning Every Minute of Your Work Day” (calnewport.com)', url: 'https://calnewport.com/deep-habits-the-importance-of-planning-every-minute-of-your-work-day/', type: 'technique', finding: 'Yazar ve bilgisayar bilimcisi Cal Newport zaman bloklamayı anlatıyor: her akşam 10–20 dakika görev listelerini ve takvimini gözden geçiriyor, ertesi iş gününü kâğıt üzerinde etiketli bloklara bölüyor; beklenmedik bir şey olduğunda planı yeniden çizebilmek için blokların yanında boşluk bırakıyor ve tepkisel işlere kendi bloklarını veriyor. Yöntemin stresini azalttığını ve verimini büyük ölçüde artırdığını söylüyor.', limitation: 'Kişisel bir blog yazısı (ilk yayım 2013, güncelleme 2023); ne kadar daha verimli olduğuna dair tahmini kişisel bir izlenim, bir çalışma değil. Zaman bloklamaya ilişkin kontrollü bir deneme bulunamadı.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'focus-1': {
    deeper: [
      { heading: 'Dikkat artığı: bir parçan geride kalır', paragraphs: [
        'Yönetim araştırmacısı Sophie Leroy tanıdık bir hisse ad verdi. İki deneyde, insanlar bir işten ötekine geçtiğinde dikkatlerinin bir kısmının birinci işte kaldığını buldu. Buna dikkat artığı dedi: düşüncelerin bıraktığın işin çevresinde dönüp durur, yeni iş sana göründüğünden daha az pay alır ve o işteki performans düşer.',
        'Çalışmasından iki ayrıntı işe yarar. Birinci iş yarım bırakıldığında dikkat artığı daha güçlüydü. Bitirmek de her zaman bırakmaya yetmiyordu; insanlar birinci işi biraz zaman baskısı altında toparladıklarında ondan daha kolay kopuyordu, bu da işi kapatmalarına yardım etmiş görünüyor. Yalnızca özet okundu; bunları ayrıntılı tablo olarak değil, ana bulgular olarak değerlendir.',
      ],
        visual: { kind: 'cycle', title: 'Geçiş döngüsü', center: 'Açık kalan iş seni çağırır',
          nodes: [
            { label: 'Geçiş', text: 'Son işi kapatmadan yeni bir şeye geçersin.' },
            { label: 'Artık', text: 'Zihnin bir kısmı eski iş üzerinde çalışmayı sürdürür.' },
            { label: 'Yavaş başlangıç', text: 'Yeni işe girmek daha uzun sürer ve hataya davet eder.' },
            { label: 'Geri çekiliş', text: 'Eski işe “bir dakikalığına” bakarsın ve yine geçersin.' },
          ],
          note: 'Bize ait bir çizim; geçiş bedeli araştırmasından (Monsell) ve dikkat artığından (Leroy) yararlanıyor; ölçülmüş bir model değil.' } },
      { heading: 'Geçmeden önce bir dakikalık not', paragraphs: [
        'Leroy, Theresa Glomb’la sonraki çalışmasında basit bir çözümü sınadı. Bir bölünme geldiğinde insanlar yaklaşık bir dakika ayırıp nerede kaldıklarını, nelerin açık kaldığını ve geri döndüklerinde önce ne yapacaklarını yazdı. Üniversitenin özetine göre bu “devam etmeye hazır plan” dikkat artığını azalttı ve insanların, çalışan profesyonellerle yapılan bir çalışma da dahil, bölen iş üzerinde daha iyi kararlar vermesine yardımcı oldu.',
        'Sınanmayan şey, planın sonrasında asıl işe de yardım edip etmediği; ayrıca bilgimiz makalenin tamamından değil, üniversitenin özetinden geliyor. Yine de bir dakika kadar sürüyor ve bugünkü alıştırmadaki hazırlık cümlesinin daha dolu bir hali: bir sonraki kapıyı açmadan önce bir kapıyı kapatan kısa bir not.',
      ] },
    ],
    example: { title: 'Leila, 34, proje yöneticisi', text: 'Leila bir salı sabahı bir saat boyunca klavyesinin yanında yapışkan bir not tuttu ve her geçişte bir çizgi çekti. Saat ona geldiğinde on dokuz çizgisi vardı. Ayırınca on ikisi sohbet bildirimlerinden ve uğrayan iş arkadaşlarından geliyordu; yalnızca yedisi kendi seçimiydi. O gün başka bir şeyi değiştirmedi. Ama kendi geçişlerinin her birinden önce sessizce “Şimdi bütçe tablosuna geçiyorum” demeyi denedi. Bir iş arkadaşı iki kez sözünü kestiğinde önce tek satır karaladı: “40. satırda kaldım, sırada seyahat masraflarına bak.” Geri dönmek belirgin biçimde kolaylaşmıştı. Gün dönüşmedi, ama işten her zamankinden biraz daha az dağınık çıktı.' },
    sources: ['focus-attention-residue', 'focus-ready-to-resume'],
  },
  'focus-2': {
    deeper: [
      { heading: 'Küçük bir etkiyi dürüstçe okumak', paragraphs: [
        'Bu çalışmadaki d = 0,44 etki büyüklüğü, farkı puanların ne kadar değiştiğiyle kıyaslayan standartlaştırılmış bir ölçüdür. Anketin kendisinde iki hafta arasındaki fark yalnızca yaklaşık 0,1 puandı. İkisi aynı anda doğru: fark ölçülecek kadar gerçekti ve gündelik ölçüde küçüktü. Katılımcılar hangi haftada olduklarını da biliyordu; bu yüzden beklentileri rol oynamış olabilir.',
        'Bu ders bildirimleri susturmayı bir tedavi olarak değil, ucuz bir deney olarak sunuyor. Birkaç ayarı değiştirmenin karşılığı huzursuzlukta hafif bir düşüşse, bu yine adil bir takas. Hiçbir fark görmezsen de kendin hakkında neredeyse hiç maliyetsiz bir şey öğrenmiş olursun.',
      ] },
      { heading: 'Önemli olanı kaçırmadan ayarlamak', paragraphs: [
        'İnsanların telefonlarını susturmaktan duyduğu ana endişe önemli bir şeyi kaçırmak. Çoğu telefon “Rahatsız Etme” modunda sana kimlerin ulaşabileceğini seçmene izin verir; böylece önce istisnaları kurup sonra geri kalanı susturabilirsin. Bildirimlerini aşağıdaki tabloda olduğu gibi birkaç gruba ayırmak ve yeni bir uygulama her sorduğunda değil, bir kere karar vermek işine yarayabilir.',
      ],
        visual: { kind: 'table', title: 'Bir odak bloğu için bildirimlerini ayırmak', columns: ['Bildirim türü', 'Örnek', 'Odak bloğu sırasında'],
          rows: [
            ['Sana acil ihtiyacı olabilecek kişiler', 'Aile, bakım sorumluluğu, nöbetçi iş', 'İçeri alınır'],
            ['Zamana bağlı iş araçları', 'Son teslim gününde ekip sohbeti', 'Belirli saatlerde bakılır'],
            ['Geri kalan her şey', 'Sosyal medya, alışveriş, haberler', 'Susturulur'],
          ],
          note: 'Sınanmış bir kural değil, bir öneri. İşine ve sorumluluklarına göre ayarla; acil durum ya da bakım için gereken aramaları asla susturma.' } },
    ],
    example: { title: 'Daniel, 27, yüksek lisans öğrencisi', text: 'Daniel bildirim geçmişine baktı ve şaşırdı: bir saat içinde bir alışveriş uygulaması, iki haber uygulaması ve bir oyun titremişti. Dördünü de kapattı. Sonra dokuzda tez bölümünün başına oturmadan önce iki saatliğine Rahatsız Etme’yi açtı ve iki istisna ekledi: bebek bekleyen ablasını ve danışmanını. İlk yirmi dakikada alışkanlıktan üç kez telefona uzandı ve ekranda hiçbir şey bulamadı. Saat on birde mesajlarına baktı; hiçbiri ona ihtiyaç duymamıştı. Her zamankinden fazla yazıp yazmadığından emin değil, ama daha az paragrafı yeniden okuduğunu fark etti ve yarın aynı düzeni tekrarlamayı planlıyor.' },
  },
  'focus-3': {
    deeper: [
      { heading: 'Popüler bir bulgu nasıl sallantıya girdi', paragraphs: [
        'Asıl deneyler özenliydi ve buldukları etki küçüktü. Fikir çarpıcı ve gözde canlandırması kolay olduğu için yayıldı. Başka bir ekip ikinci deneyi 380’den fazla öğrenciyle ve önceden kaydedilmiş bir planla tekrarladığında, telefonun konumu çalışma belleğinde hiçbir fark yaratmadı.',
        'Meta-analiz bir katman daha ekledi. 33 çalışmanın tamamında genel bir etki yoktu ve çalışma belleği üzerindeki küçük bir etki, yazarlar yayın yanlılığını, yani olumlu sonuçlu çalışmaların daha sık yayımlanma eğilimini düzelttiğinde ortadan kayboldu. Bu bir skandal değil. Bilimin kendini düzeltmesi tam olarak böyle olmalı ve tek tek çarpıcı bulguları biraz daha gevşek tutmak için iyi bir neden.',
      ],
        visual: { kind: 'steps', title: 'Tek bir iddia zaman içinde nasıl sınandı',
          steps: [
            { label: 'İlk çalışma', text: 'İki deney, masadaki telefonun küçük bir etkisini buluyor.' },
            { label: 'Geniş ilgi', text: 'Fikir, gözde canlandırması kolay olduğu için hızla yayılıyor.' },
            { label: 'Tekrarlama', text: 'Deneyin önceden kaydedilmiş bir tekrarı etki bulamıyor.' },
            { label: 'Meta-analiz', text: '33 çalışma birlikte genel bir etki göstermiyor.' },
          ],
          note: 'Bu dersin kaynaklarındaki üç çalışmanın özeti.' } },
      { heading: 'Yakında bulunmak ile uzanmak', paragraphs: [
        'İki soruyu ayrı tutmak işe yarar. Biri, yakında duran sessiz bir telefonun zihninin ne kadar iyi çalıştığını değiştirip değiştirmediği; kanıt şimdi genel olarak hayır diyor. Öbürü, telefonun seni bölmesine izin verildiğinde ya da ona sürekli uzandığında ne olduğu. Önceki dersteki bildirim deneyi bu ikinci soruya ait ve orada etki küçüktü ama vardı.',
        'Yani telefonun başka bir odadayken daha iyi çalışıyorsan, bundan vazgeçmen gerekmez. Fayda büyük olasılıkla telefonun yalnızca orada olmasıyla değil, uzanmayla ilgili ve kendi iki günlük karşılaştırman sana herhangi bir manşetten daha çok şey söyler.',
      ],
        visual: { kind: 'compare', title: 'İki farklı soru',
          left: { label: 'Telefon yalnızca yakında', items: ['Birçok laboratuvar çalışmasında sınandı', 'Performansa genel bir etkisi yok', 'Çalışma belleği üzerindeki küçük bir etki yanlılık düzeltmesinden sonra kayboldu'] },
          right: { label: 'Telefon kullanımda ya da uyarılar açık', items: ['Ayrı bir soru', 'Uyarılar açık ve telefon görünürde: kendi bildirimine göre biraz daha fazla dikkatsizlik', 'Ona ne sıklıkla uzandığın daha önemli olabilir'] },
          note: 'Sağ taraf 2. dersteki bildirim çalışmasına dayanıyor; “uzanma” bizim çıkarımımız.' } },
    ],
    example: { title: 'Marcus, 41, muhasebeci', text: 'Marcus masadaki telefonun “beynini tükettiğini” okumuştu ve her gördüğünde suçluluk duyuyordu. Bunun yerine sınamaya karar verdi. Pazartesi iki saatlik bir blokta telefonu koridordaki paltosunun içinde bıraktı ve almak istediği her seferinde bir not defterine çizgi attı: altı çizgi, çoğu ilk yarım saatte. Çarşamba günü telefonu masada ekranı aşağı bakacak ve sessize alınmış halde tuttu. Dokuz kez eline aldı ve iki kez, kaydırmaya başlamışken fark etti. Vardığı sonuç mütevazıydı. Sorun orada duran telefon gibi görünmüyordu; ele almanın ne kadar kolay olduğuydu. Şimdi yoğun günlerde koridorda tutuyor, hafif günlerde suçluluk duymuyor.' },
  },
  'focus-4': {
    deeper: [
      { heading: 'Sabit molalar mı, canın istediğinde mola mı?', paragraphs: [
        'Hollanda’da yapılan küçük bir çalışma, bir çalışma seansı sırasında mola vermenin üç yolunu karşılaştırdı. Molalarını kendi seçen öğrenciler daha uzun aralıklarla çalışıp dinlendi, ama sabit bir programdaki öğrencilere göre daha fazla yorgunluk ve dikkat dağınıklığı, daha az konsantrasyon ve motivasyon bildirdi. Ne kadar iş çıkardıkları anlamlı biçimde farklı değildi.',
        'Bu, yukarıdaki meta-analizle uyumlu: molalar, ne kadar ürettiğinden çok nasıl hissettiğini daha açık biçimde değiştiriyor gibi görünüyor. Pratik bir noktaya da işaret ediyor. Molaya ihtiyacın olduğunu hissedene kadar beklemek, molayı sana iyi gelecek olandan daha geç vermen anlamına gelebilir; bu yüzden nazik, planlı bir mola denemeye değer.',
      ],
        visual: { kind: 'table', title: 'Bir çalışmadaki üç mola programı', columns: ['Program', 'Nasıl işledi', 'Öğrencilerin bildirdiği'],
          rows: [
            ['Kendi seçtikleri', 'İstedikleri zaman mola', 'Daha fazla yorgunluk ve dikkat dağınıklığı, daha az konsantrasyon ve motivasyon'],
            ['Sabit, Pomodoro tarzı', 'Her 24 dakikada 6 dakikalık mola', 'Daha iyi ruh hali; benzer miktarda iş'],
            ['Sabit, daha kısa', 'Her 12 dakikada 3 dakikalık mola', 'Daha iyi ruh hali; benzer miktarda iş'],
          ],
          note: 'Biwer ve ark. 2023: tek bir seansta 87 üniversite öğrencisi; yalnızca özet okundu. Belirli bir dakika sayısını değil, bir program denemeyi destekler.' } },
      { heading: 'Molayı nasıl hissettiğine göre değerlendir', paragraphs: [
        'Performans kanıtı zayıf olduğundan bir molanın en adil sınavı bugünkü alıştırmadaki sınav: moladan önce ve sonra ne kadar yorgun hissettiğin. Puanın 4’ten 2’ye düşüyorsa, yapılacaklar listen aynı görünse bile mola işini yapmıştır.',
        'Yazmak, kod yazmak ya da zor bir konuyu çalışmak gibi çok yoğun işler yapıyorsan birkaç dakika toparlanmaya yetmeyebilir; daha uzun bir ara ya da iş değiştirmek sana daha iyi gelebilir. Bir hafta boyunca farklı süreler dene ve işine yarayanları tut.',
      ] },
    ],
    example: { title: 'Grace, 45, müşteri destek ekibi yöneticisi', text: 'Grace genellikle öğleden sonra boyunca ara vermeden çalışır, saat dörtte bitkin hissederdi. Perşembe günü 14.00 seansını yedi dakikalık bir molayla bitirmek için zamanlayıcı kurdu. Öncesinde yorgunluğunu 5 üzerinden 4 olarak puanladı. Kulaklığını masada bıraktı, koridorun sonuna kadar yürüyüp döndü ve su şişesini doldurdu. Sonra kendini 2 olarak puanladı. Talepleri daha hızlı yanıtlayıp yanıtlamadığını söyleyemedi ve öyleymiş gibi de yapmadı. Fark ettiği, günün son saatinin daha az angarya gibi hissettirmesiydi. Öğleden sonra yürüyüşünü sürdürüyor ve şimdi saat on birde ikincisini deniyor.' },
    sources: ['procrastination-pomodoro-breaks'],
  },
  'focus-5': {
    deeper: [
      { heading: 'Cal Newport gününü nasıl planlıyor', paragraphs: [
        'Odaklı, dikkati dağılmayan çalışma üzerine yazan bilgisayar bilimcisi ve yazar Cal Newport zaman bloklamayı blogunda anlattı. Her akşam on ile yirmi dakika görevlerine ve takvimine bakıyor, ardından ertesi günün çalışma saatlerini kâğıt üzerinde, her biri ne yapacağını belirten etiketli bloklara bölüyor.',
        'İki ayrıntı yöntemi göründüğünden daha esnek yapıyor. Beklenmedik bir şey olduğunda günün geri kalanını yeniden çizebilmek için blokların yanında boşluk bırakıyor ve e-posta gibi tepkisel işlere gelmeyecekmiş gibi davranmak yerine kendi bloklarını veriyor. Yaklaşımın stresini azalttığını ve çıktısını çok artırdığını söylüyor; bu onun kendi izlenimi, ölçülmüş bir sonuç değil.',
      ] },
      { heading: 'Pomodoro: minyatür bir blok', paragraphs: [
        'Francesco Cirillo’nun Pomodoro Tekniği, zaman bloklamanın daha küçük bir akrabası. Genellikle 25 dakika odaklı çalışma ve ardından kısa bir mola olarak öğretilir ve tekrarlanır. Cirillo’nun kendisi, amacın olabildiğince çok tur toplamak değil, çalışırken zihninin ne yaptığını fark etmek olduğunu vurguluyor.',
        'Önceki dersteki Hollandalı mola çalışması buna mütevazı bir destek veriyor: sabit molalardaki öğrenciler, kendi molalarını seçenlerden daha az iş çıkarmadan daha iyi hissetti. Bütün bir sabah bloğu sana fazla büyük geliyorsa, 25 dakikalık tek bir tur ilk deneyin olabilir.',
      ] },
      { heading: 'Planla–dene–ayarla döngüsü', paragraphs: [
        'Bir odak planı, tek seferlik bir karardan çok bir döngü olarak en iyi işler. İlerleme takibi araştırması, nasıl gittiğini takip eden insanların, özellikle yazıya döktüklerinde, hedeflerine ulaşma olasılığının daha yüksek olduğunu buldu. Gözden geçirme adımının önemi bu: her bloktan sonra iki satırlık bir not, kötü bir günü işe yarar bir bilgiye çevirir.',
      ],
        visual: { kind: 'cycle', title: 'Planla–dene–ayarla döngüsü', center: 'Her tur sana bir şey öğretir',
          nodes: [
            { label: 'Planla', text: 'Tek bir iş, bir süre ve bir eğer/o zaman cümlesi.' },
            { label: 'Koru', text: 'Bildirimler susturulmuş, telefon kolay erişimin dışında.' },
            { label: 'Çalış', text: 'İşte kal; dağınık düşünceleri not et ve dön.' },
            { label: 'Dinlen', text: 'Ekrandan uzakta kısa bir mola.' },
            { label: 'Değerlendir', text: 'Neyin işe yaradığını yaz ve bir dahaki sefere bir şeyi değiştir.' },
          ],
          note: 'Önerilen bir rutin, sınanmış bir teknik değil. Değerlendirme adımı, ilerleme takibini hedefe ulaşmaya bağlayan araştırmaya dayanıyor.' } },
    ],
    example: { title: 'Priya, 38, serbest çevirmen', text: 'Priya, öğleden sonraya ertelemeye devam ettiği işi, yani bir sözleşme çevirisini, sabah 9’da 45 dakikalık bir bloğa yerleştirdi. Bir gece önce bunu kâğıttan bir plana yazdı ve bir cümle ekledi: “E-postama bakmak istersem, düşünceyi bloknota yazıp devam edeceğim.” Sabah Rahatsız Etme’yi açtı; tek istisna kızının okuluydu. İki kez dağıldı ve bloknota “fatura” ve “bankayı ara” yazdı. 30 dakika sonra bir müşteri acil bir şeyle aradı ve blok erken bitti. Buna başarısızlık demedi. Notu şöyleydi: “30 dakika, 4 sayfa. Bir dahaki sefere 8.30’da başla, müşteriler uyanmadan önce.”' },
    sources: ['if-then-plans', 'focus-newport-time-blocking', 'procrastination-pomodoro', 'procrastination-pomodoro-breaks'],
  },
};
