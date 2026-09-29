import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/calm.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'calm-nhs-anxiety', title: 'NHS Every Mind Matters · Kaygı', url: 'https://www.nhs.uk/every-mind-matters/mental-health-issues/anxiety/', type: 'guidance', finding: 'Kaygının bedensel ve zihinsel işaretlerini sıralar: yorgunluk, huzursuzluk, baş dönmesi, konsantrasyon güçlüğü, geçmiş ya da gelecek için endişelenme, felaket düşünceleri, baş ağrısı, mide ağrısı, kas gerginliği, çarpıntı ve nefes darlığı. Durumlardan kaçınmanın ya da bizi güvende tuttuğunu sandığımız alışkanlıklara yaslanmanın kaygıyı aslında kötüleştirebileceği konusunda uyarır; korkulan durumlarla nefes egzersizleri, tetikleyici günlüğü, günlük sabit bir endişe zamanı ve duruma farklı açılardan bakmayla birlikte kademeli olarak yüzleşmeyi önerir. Kaygı günlük hayatı ciddi biçimde etkiliyorsa NHS 111’i ya da bir aile hekimini aramayı, baş edemiyorsan ya da kendini güvende tutamıyorsan acil yardım almayı öğütler.', limitation: 'İngiltere için hazırlanmış, kanıt ayrıntısı içermeyen genel öz-yardım rehberidir; hizmetler ve telefon numaraları ülkeye göre değişir. Türkiye’de acil durumlarda 112 aranır.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'calm-1': {
    deeper: [
      { heading: 'Stres nerede kendini gösterebilir',
        paragraphs: [
          'Stres nadiren “stres” kelimesiyle gelir. Çoğu zaman önce sıkılmış bir çene, düğümlenmiş bir mide, kısalmış bir sabır ya da işten işe atlayıp duran bir zihin olarak çıkar karşına. NHS işaretleri beden ve zihin boyunca sıralar; kaygı sayfaları buna çarpıntıyı, nefes darlığını, huzursuzluğu ve felaket düşüncelerini, yani hemen en kötü sonuca atlamayı ekler.',
          'Kendi örüntün genellikle sandığından daha tutarlıdır. Kimi insan bunu omuzlarında, kimi uykusunda, kimi sabrında hisseder. İlk iki üç işaretini bilmek, stres henüz üzerinde çalışabileceğin kadar küçükken sana erken bir uyarı verir.',
        ],
        visual: { kind: 'table', title: 'Stres ve kaygının yaygın işaretleri', columns: ['Nerede', 'Neler fark edebilirsin'],
          rows: [
            ['Beden', 'Baş ağrısı, kas gerginliği, mide ağrısı, çarpıntı'],
            ['Zihin', 'Konsantre olmakta güçlük, bunalmışlık, en kötüsünü beklemek'],
            ['Duygu durumu', 'Sinirlilik, huzursuzluk'],
            ['Dinlenme', 'Uyku değişiklikleri, yorgunluk'],
          ],
          note: 'NHS’in stres ve kaygı sayfalarından. Bu işaretlerin birçok olası nedeni vardır; sürüyorsa ya da seni endişelendiriyorsa bir hekime başvur.' } },
      { heading: 'Tek bir kelime neden işe yarayabilir',
        paragraphs: [
          'Torre ve Lieberman, bir duyguyu adlandırma eylemini, yani duygu adlandırmayı, sessiz bir duygu düzenleme biçimi olarak tarif eder. Duygunu bilerek değiştirmeye çalıştığın tekniklerin aksine, adlandırmak hiçbir şey yapıyormuş gibi hissettirmeyebilir. Cazibesinin bir kısmı da bu: doğru yapılacak bir şey yok.',
          'İşe yarayan bir ad özgül ve küçüktür. “Her şey berbat” tüm hayatın hakkında verilmiş bir hükümdür; “Yarınki sunum yüzünden gerginim” ise şu anı anlatır. İkincisi, yapabileceğin bir şeye işaret eder: bir slaytı hazırlamak ya da bir iş arkadaşından görüş istemek gibi. Adlandırmak sorunu çözmez ve sorun değil. Yalnızca onu daha net görmene yardım eder.',
        ] },
    ],
    example: { title: 'Elif, 34, proje koordinatörü',
      text: 'Elif’in çenesi öğleden sonraya doğru sık sık ağrırdı, akşamları da eşine küçücük şeyler yüzünden çıkışırdı. Buna hep “yoğun bir hafta işte” derdi. Salı günü, gergin bir toplantının ardından masasında durup kendine ne hissettiğini sordu. İlk gelen kelime “sinirli” oldu, sonra daha doğrusu “endişeli”. Not uygulamasına tek satır yazdı: “Müşteri teslim tarihini öne çektiği için endişeliyim.” Teslim tarihi hiç değişmedi. Ama omuzlarının biraz gevşediğini fark etti ve yöneticisine hangi işin bekleyebileceğini soran kısa bir mesaj gönderdi. O akşam eşiyle bulaşık yüzünden tartışmak yerine işten dolayı stresli olduğunu söyledi. Küçük bir kayma oldu ve akşamı kolaylaştırdı.' },
    sources: ['calm-nhs-anxiety'],
  },
  'calm-2': {
    deeper: [
      { heading: 'Çalışma aslında neyi karşılaştırdı',
        paragraphs: [
          'Gönüllüler rastgele dört uygulamadan birine atandı. Döngüsel iç çekme; burundan yavaş bir nefes alış, akciğerleri tamamen doldurmak için ikinci kısa bir alış, ardından ağızdan yavaş ve tam bir nefes veriş demekti. Kutu nefesinde alış, tutuş ve veriş eşit uzunluktaydı. Üçüncü grup, hızlı ve derin nefes turları yaptı ve ardından nefesini tuttu. Dördüncü grup farkındalık meditasyonu yaptı: dikkati tek bir noktaya bırakıp zihin dağıldığında nazikçe oraya geri döndürmek.',
          'Araştırmacılar, uzun bir nefes verişin sinir sisteminin sakinleştirici koluna dokunarak yardımcı olabileceğini öne sürüyor. Bu makul bir açıklama, ama bu çalışmanın kanıtladığı bir şey değil. Grafik, nefes gruplarının birlikte ve meditasyonun olumlu duygudaki ortalama günlük artışını gösteriyor.',
        ],
        visual: { kind: 'bars', title: 'Olumlu duyguda ortalama günlük artış',
          bars: [
            { label: 'Nefes egzersizleri (üç grup birlikte)', value: 1.91, display: '1,91' },
            { label: 'Farkındalık meditasyonu', value: 1.22, display: '1,22' },
          ],
          note: 'Balban ve ark. 2023: 28 gün boyunca kişi başı günlük ortalama değişim, çoğu sağlıklı 108 öğrenci. Nefes grupları içinde en büyük kazancı döngüsel iç çekme gösterdi. Durumluk kaygı tüm gruplarda azaldı, meditasyonda biraz daha fazla (−3,95’e karşı −3,03).',
          sourceId: 'cyclic-sighing' } },
      { heading: 'Ne zaman durmalı, nefes ne zaman yetmez',
        paragraphs: [
          'NHS inform, rahatsızlık ya da ağrı hissedersen herhangi bir nefes egzersizini bırakmanı, sonrasında başın dönmesin diye bir süre oturmaya devam etmeni ve nefes sorunu gibi bir sağlık durumun varsa önce hekiminle konuşmanı öneriyor. Nazik ol; ne nefes alışını ne de vermeni zorlaman gerekiyor.',
          'Yavaş nefes, panik atak sırasında, yani ani ve yoğun bir korku dalgasında, NHS’in öz-yardım adımlarından biri. Ataklar korkutucudur ama tehlikeli değildir. Sürekli geri geliyorlarsa tek başına bir nefes egzersizi cevap değildir: bir hekime başvur, çünkü bilişsel davranışçı terapi gibi konuşma terapileri panik bozukluğunun başlıca tedavileri arasındadır.',
        ] },
    ],
    example: { title: 'Murat, 45, otobüs şoförü',
      text: 'Murat geç vardiyadan çıktığında çoğu zaman gergin olurdu; trafikte ucuz atlattığı anları kafasında tekrar tekrar oynatır, sonra da uyuyamadan yatardı. Eve sürmeden önce park ettiği arabasında döngüsel iç çekmeyi denemeye karar verdi. 5 dakikalık bir zamanlayıcı kurdu, burnundan nefes aldı, kısa bir ikinci yudum hava ekledi, sonra ağzından yavaşça verdi. İlk akşam bir dakika sonra biraz başı hafifledi, o yüzden yavaşladı ve daha nazik nefes aldı. Bazı günler sonrasında daha sakin hissetti; bazılarında pek bir şey fark etmedi ve bunu da yazdı. İki hafta sonra bu rutin iş ile ev arasında net bir çizgi hâline gelmişti. Gergin vardiyaları değişmedi, ama kapıdan içeri biraz daha az gergin giriyordu.' },
    sources: ['state-nhs-breathing-tips', 'state-nhs-panic'],
  },
  'calm-3': {
    deeper: [
      { heading: 'Ceza değil, mola olsun',
        paragraphs: [
          'Egzersiz planları çoğu zaman ceza gibi kurulduğu için tutmaz: çok uzun, çok zor ve günün en kötü saatine konmuş. DSÖ stresle baş etmek için düzenli egzersizi öneriyor; hareket kısa olduğunda ve zaten yaptığın bir şeye bağlandığında düzenli olmak çok daha kolaylaşıyor.',
          'Gerginliğini hareketten önce ve sonra 0’dan 10’a puanlamak bunu küçük bir deneye çevirir. Bir hafta içinde, yapman gerektiğini düşündüğün hareketi değil, sana gerçekten hangi hareketin iyi geldiğini öğrenirsin.',
        ],
        visual: { kind: 'compare', title: 'Hareketi planlamanın iki yolu',
          left: { label: 'Ceza modu', items: ['Bir saat spor salonu ya da hiç', 'İlk günden var gücünle zorlamak', 'Bir gün aksatınca vazgeçmek'] },
          right: { label: 'Mola modu', items: ['Öğle yemeğinden sonra on dakika tempolu yürüyüş', 'Dans ya da bisiklet gibi keyif aldığın bir şey', 'Ertesi gün yeniden başlamak, telafi gerekmeden'] },
          note: 'Pratik öneriler; sınanmış kurallar değil. Bir sağlık sorunun varsa temponu hekiminle konuş.' } },
      { heading: 'Sayılara dürüstçe bakmak',
        paragraphs: [
          'Grafikteki sayılar standart etki büyüklükleri: farklı anketler kullanan çalışmaların sonuçlarını karşılaştırmanın bir yolu. Bu aralıktaki değerler kabaca orta düzeydedir. Birçok insanda ortalama değişimi anlatırlar; sana ne olacağını değil.',
          'Kalite uyarısı önemli. Bir şemsiye derlemedeki derlemelerin çoğu kritik düzeyde düşük kalitede olduğunda, bulgunun yönü kesin büyüklüğünden daha güvenilirdir. Dürüst özet şu: bedenini hareket ettirmek, stres için diğer desteklerin yanında denemeye değer, makul ve düşük riskli bir şey.',
        ] },
    ],
    example: { title: 'Leyla, 52, diş kliniği sekreteri',
      text: 'Leyla’nın günleri telefonlar ve bekleme salonu şikâyetleriyle akıp geçiyordu; saat dörde doğru hem gergin hem ağır hissediyordu. Eskiden kendine bir saatlik spor salonu sözü verir, sonra vazgeçerdi. Bu sefer öğle yemeğinden sonra, güvenle yapabildiği tek mola olan, blok çevresinde 12 dakikalık tempolu bir yürüyüş seçti. Çıkmadan önce gerginliğini 7 olarak puanladı; döndüğünde 5’ti. Bazı günler yalnızca bir puan düştü, yağmurlu bir günde ise bunun yerine binanın merdivenlerini çıktı. Üç hafta sonra yürüyüş olağanlaşmıştı ve sakin günlerde ikinci bir tur ekledi. İşi daha az yoğun değildi, ama öğleden sonraları eskisi kadar ezici gelmiyordu.' },
    sources: [],
  },
  'calm-4': {
    deeper: [
      { heading: 'Kaçınma kaygıyı nasıl sürdürür',
        paragraphs: [
          'Bir düşünceyi bastırmanın davranıştaki yakın akrabası, durumdan tümüyle kaçınmaktır. NHS, durumlardan uzak durmanın ya da bizi güvende tuttuğunu sandığımız alışkanlıklara yaslanmanın kaygıyı aslında kötüleştirebileceği konusunda uyarır. O anda kaçınmak hızlı bir rahatlama getirir; bu da bir dahaki sefere yine kaçınmayı cazip kılar. Bu arada başa çıkabileceğini keşfetme şansını hiç bulamazsın.',
          'Çıkış yolu genellikle kademelidir. NHS, korkulan durumlarla adım adım yüzleşmeyi öneriyor; böylece bu durumlar yönetilebilir hissettirmeye başlayabilir. Buna, duruma farklı açılardan bakmak gibi araçlar da eşlik eder. Bir düşünceye bakış açını değiştirmek ile bir duruma doğru küçük bir adım atmak birlikte iyi çalışır. Kaygı günlük hayatını aksatıyorsa, bu çalışma en iyi bir profesyonelle yapılır.',
        ],
        visual: { kind: 'cycle', title: 'Kaygı–kaçınma döngüsü', center: 'Hızlı rahatlama, kalıcı korku',
          nodes: [
            { label: 'Tetikleyici', text: 'Zor bir telefon görüşmesi gibi tehdit edici hissettiren bir durum.' },
            { label: 'Kaygılı düşünce', text: '“Bu kötü geçecek ve baş edemeyeceğim.”' },
            { label: 'Kaçınma', text: 'Aramayı ertelersin ya da bir çıkış yolu bulursun.' },
            { label: 'Rahatlama', text: 'Gerginlik şimdilik düşer.' },
            { label: 'Korku büyür', text: 'Başa çıkabileceğini hiç öğrenmezsin; bir sonraki tetikleyici daha büyük gelir.' },
          ],
          note: 'Basitleştirilmiş bir döngü. NHS rehberi durumlardan kaçınmanın kaygıyı kötüleştirebileceği konusunda uyarır ve onlarla kademeli yüzleşmeyi önerir. Kaygı günlük hayatını aksatıyorsa bir profesyonele başvur.' } },
      { heading: 'Yeniden değerlendirmek numara yapmak değildir',
        paragraphs: [
          'Sık yapılan bir hata, yeniden değerlendirmeyi zorlama olumluluk saymaktır: “Yöneticimin beni eleştirmesi aslında harika.” Bu genelde yapay çalar ve zihin onu reddeder. Daha işe yarar bir yeniden değerlendirme gerçeklere sadık kalır ve yalnızca dışarıda bıraktığın şeyi ekler.',
          'Aşağıdaki sorular bu daha tam resmi bulmanın bir yolu. Hepsine gerek yok; dürüst tek bir cevap bile ilk yorumunun sıkı tutuşunu gevşetmeye yetebilir.',
        ],
        visual: { kind: 'table', title: 'İlk okumadan daha tam bir okumaya', columns: ['Soru', 'Örnek cevap'],
          rows: [
            ['Sade gerçekler olarak ne oldu?', 'Yöneticim raporumdaki iki hatayı gösterdi.'],
            ['Bu başka ne anlama gelebilir?', 'Rapor önemli olduğu için işimi yakından okuyor.'],
            ['Dışarıdan bir gözlemci nasıl görürdü?', 'Uzun bir raporda iki hata yaygındır ve düzeltilebilir.'],
            ['Hangi kısmı değiştirebilirim?', 'Bugün düzeltebilirim ve bir dahaki sefere ikinci bir kontrol isteyebilirim.'],
          ],
          note: 'Webb ve ark. 2012’deki stratejilere (yeniden değerlendirme ve perspektif alma) dayanır; sorular pratik ipuçlarıdır, sınanmış senaryolar değil.' } },
    ],
    example: { title: 'Kaan, 27, yeni başlayan web geliştirici',
      text: 'Kaan’a takım liderinden kısa bir mesaj geldi: “Yarın konuşabilir miyiz?” İlk okuması işten çıkarılacağı yönündeydi ve akşamı bunu düşünmemeye çalışarak geçirdi; bu da düşünceyi yalnızca daha gürültülü yaptı. Dokuz sularında durumu tek cümleyle yazdı ve kendine başka ne anlama gelebileceğini sordu. İki seçenek çıkardı: yeni bir proje ya da geçen haftaki hatayla ilgili geri bildirim. Sonra bir arkadaşının bunu nasıl göreceğini hayal etti: belirsiz bir mesaj, başka bir şey değil. Yine de gergindi, ama her ihtimale karşı üzerinde çalıştığı işlerin kısa bir listesini yaptı ve beklediğinden iyi uyudu. Toplantı bir teslim tarihi değişikliği hakkında çıktı. Bir dahaki sefere kaleme daha erken uzanacaktı.' },
    sources: ['calm-nhs-anxiety'],
  },
  'calm-5': {
    deeper: [
      { heading: 'Destek listeni hazırlamak',
        paragraphs: [
          'Bir destek listesi, zor bir günün ortasında değil, sakin bir günde yazıldığında en iyi işe yarar. Stres yüksekken kimi arayacağını düşünmek zorlaşır ve yalnızca yük olacağına karar vermek kolaylaşır.',
          'Farklı türde destekleri ekle: sadece konuşabileceğin biri, pratik konularda yardım edebilecek biri ve profesyonel iletişim bilgileri. Listeyi çabuk bulabileceğin bir yerde tut; örneğin telefonunun not uygulamasında.',
        ],
        visual: { kind: 'steps', title: 'Destek listen için dört satır',
          steps: [
            { label: 'Konuşacak biri', text: 'Zor bir günde arayabileceğin ya da yazabileceğin bir arkadaş veya aile üyesi.' },
            { label: 'Pratik yardım', text: 'Bir işi üzerinden alabilecek bir iş arkadaşı, komşu ya da akraba.' },
            { label: 'Hekimin', text: 'Stres yönetilemez olursa başvuracağın aile sağlığı merkezi ya da klinik.' },
            { label: 'Acil durum', text: 'Kendine zarar verme düşüncesi ya da acil tehlike için 112.' },
          ],
          note: 'DSÖ ve NHS’in bağlantıda kalma ve ne zaman yardım alınacağı konusundaki önerilerine dayanır. Varsa ülken için bir kriz hattı ekle.' } },
      { heading: 'Panik ataklar ve günlük hayatı aksatan kaygı',
        paragraphs: [
          'Panik atak, çoğu zaman güçlü bedensel duyumlarla gelen ani ve yoğun bir korku dalgasıdır. NHS ataklar korkutucudur ama tehlikeli değildir diyor ve bir atak sırasında yavaş nefesin yardımcı olabileceğini söylüyor. Ataklar düzenli olarak yaşanıyorsa bu panik bozukluk olabilir ve bir hekime görünmeye değer: bilişsel davranışçı terapi (BDT) gibi konuşma terapisi başlıca tedavilerden biri, ilaç da bazı insanlara yardımcı oluyor.',
          'NHS ayrıca kaygı günlük hayatını ciddi biçimde etkiliyorsa yardım almanı, baş edemiyorsan ya da kendini güvende tutamıyorsan acil yardım almanı öğütlüyor. Eğitimli bir terapistle BDT genellikle 5 ila 15 seans sürer; bu kurstaki kısa alıştırmalar ona eşlik edebilir ama yerini tutmaz.',
        ] },
    ],
    example: { title: 'Rukiye, 61, emekli hemşire',
      text: 'Eşinin ameliyatından beri Rukiye onun randevularını, evi ve kendi kaygılarını tek başına yönetiyordu. Kendine kimseyi rahatsız etmek istemediğini söyleyip duruyordu. Sakin bir sabah bu dersteki destek tablosuyla oturdu ve dört satır yazdı: konuşmak için kız kardeşi, hastaneye götürmesi için komşusu, aile hekimi ve 112. O hafta kız kardeşini aradı ve ilk kez yorgun ve korkmuş olduğunu açıkça söyledi. Kız kardeşi perşembe günleri gelmeyi önerdi. Rukiye ayrıca hekimine randevu aldı, çünkü uykusu bir aydan uzun süredir kötüydü. Hiçbir şey bir gecede düzelmedi, ama artık her şeyi tek başına taşıdığını hissetmiyordu.' },
    sources: ['calm-nhs-anxiety', 'state-nhs-panic', 'optimism-nhs-cbt'],
  },
};
