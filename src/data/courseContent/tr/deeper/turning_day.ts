import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/turning-day.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'turning-day-commitment-contract', title: 'Giné, Karlan & Zinman · 2010 · Sigarayı bırakmak için taahhüt sözleşmesi', url: 'https://www.aeaweb.org/articles?id=10.1257%2Fapp.2.4.213', type: 'research', finding: 'Sigara içenlere bir tasarruf hesabı önerildi: altı ay boyunca para yatırıyor, ardından nikotin ve kotinin için idrar testine giriyorlardı. Testi geçenlerin parası geri veriliyor, geçemeyenlerinki bir hayır kurumuna gidiyordu. Hesap önerilenlerin %11’i katıldı. Hesap rastgele önerilen sigara içenlerin altı aylık testi geçme olasılığı 3 yüzde puan daha yüksekti ve fark 12. aydaki sürpriz testlerde de sürdü.', limitation: 'Yalnızca özet okundu. Tek bir davranış (sigara) üzerinde tek bir alan deneyidir; katılım düşüktü ve ortalama etki küçüktü. Bir taahhüt aracının bazı insanlara yardımcı olabileceğini gösterir, herkese uyduğunu değil.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'turning-day-1': {
    deeper: [
      {
        heading: 'Yeni başlangıç neden işe yarar?',
        paragraphs: [
          'Dai, Milkman ve Riis etkiyi şöyle açıklıyor: yeni bir hafta, yeni bir yıl ya da kendi işaretlediğin bir gün gibi bir zaman işareti, geçmişle şimdi arasına bir çizgi çeker. “Eski sen”in hataları biraz daha uzakta gibi durur; böylece yeniden denemek, bir başarısızlığı tekrarlamaktan çok yeni bir bölüm açmak gibi hissettirir. Deneylerinde aynı tarih, bir başlangıç olarak sunulduğunda daha çok hedef hatırlatıcısı çekti.',
          'Aynı araştırma zayıf noktayı da gösteriyor: yükseliş gerçek ama kısa ömürlü. Onu seni taşıyan bir akıntı olarak değil, kıyıdan itilmene yardım eden bir dalga olarak düşün. Bu yüzden bu kurs, bugünün enerjisini küçük ve somut bir şeye harcamanı, sonra da yarın tekrarlamanı ister.',
        ],
        visual: {
          kind: 'compare', title: 'İşaret beklemek mi, işaret koymak mı?',
          left: { label: 'Pazartesiyi beklemek', items: ['“Haftaya düzgünce başlayacağım.”', 'İstek birikir, kullanılmadan sönüp gider.', 'Kaçırılan bir gün, bir sonraki Pazartesiyi beklemek demektir.'] },
          right: { label: 'Bugünü işaretlemek', items: ['“Bugün başlangıç günüm.”', 'İstek, küçük ve gerçek bir adıma harcanır.', 'Kaçırılan bir gün, yarın sabah yeniden başlamak demektir.'] },
          note: 'Deneylerde bir günü yeni başlangıç olarak sunmak başlama isteğini artırdı; ne kadar süreceği bundan sonra ne yaptığına bağlı.',
        },
      },
      {
        heading: 'Başlangıç gününde sık yapılan hatalar',
        paragraphs: [
          'Birincisi, her şeyi aynı anda seçmek: aynı sabah yeni bir diyet, yeni bir spor planı ve yeni bir iş düzeni. Birkaç değişiklik aynı sınırlı enerji için yarışır ve biri aksadığında hepsi kaybedilmiş gibi hissedilebilir. Bir gün için tek bir alan yeter.',
          'İkincisi, bir alanı senin için önemli olduğundan değil, kulağa etkileyici geldiği için seçmek. Gerçekten sana ait bir neden (“çünkü çocuklarımla yürüyüşte yetişebilmek istiyorum”), yorgun bir öğleden sonrada ödünç alınmış bir nedenden (“çünkü herkes yapmam gerektiğini söylüyor”) genellikle daha dayanıklıdır. Nedenini yüksek sesle söylediğinde içinde bir boşluk hissediyorsan, biraz daha aramaya devam et.',
        ],
      },
    ],
    example: { title: 'Dana, 34, vardiyalı hemşire', text: 'Dana aylardır “Pazartesi başlıyorum” diyordu ama vardiyaları yüzünden Pazartesi çoğu zaman gece nöbetine denk geliyordu. İzinli bir Çarşamba günü defterine tarihi yazdı, yanına da “Başlangıç günüm” notunu düştü. Kendini biraz saçma hissetti. Kafasındaki uzun listeden (uyku, yemek yapmak, para, kız kardeşini aramak) yalnızca birini seçti: hareket. Nedenini bulması birkaç deneme aldı: “Çünkü on iki saatlik vardiyadan sonra sırtımın ağrımasını istemiyorum.” Bu gerçek geldi. Bunu telefonuna günün tek kararı olarak ekledi ve başka dramatik bir şey yapmadı. Gün henüz bir dönüm noktası gibi hissettirmedi. Ama bir iş arkadaşı planlarını sorduğunda tek cümlede bir alan ve bir neden söyleyebildi; bu yeniydi.' },
  },
  'turning-day-2': {
    deeper: [
      {
        heading: 'Neden plan, o anki irade gücünden iyi çalışır?',
        paragraphs: [
          'Eğer/o zaman planı, bir kararı geçmişteki kendine devreder. Öğlen, sakin ve berrakken, akşam altıda yorgun olduğunda ne yapacağına karar verirsin. Saat altı geldiğinde kendinle pazarlık etmen gerekmez; işaret (“yorgunum”) zaten küçük bir eyleme (“yalnızca on dakika”) bağlanmıştır. Bu yüzden “eğer” kısmı somut olduğunda, yani bir saat, bir yer ya da tanıyabileceğin bir duygu içerdiğinde en iyi işler.',
          'İyi bir plan aynı zamanda kötü bir güne dayanacak kadar küçüktür. “Yorgunsam yine de antrenmanın tamamını yapacağım”, yorgun olmayan bir versiyonuna verilmiş bir sözdür. “Yorgunsam iki dakikalık versiyonunu yapacağım” ise orada gerçekten bulunacak olan kişi için yapılmış bir plandır.',
        ],
      },
      {
        heading: 'Taahhüt araçları: planını bırakmayı zorlaştırmak',
        paragraphs: [
          'Taahhüt aracı, şimdi verdiğin ve gelecekteki kendinin geri adım atmasını zorlaştıran bir seçimdir. Yumuşak olabilir, bir arkadaşına söylemek gibi; ya da sert olabilir, paranı ortaya koymak gibi. Bir alan deneyinde sigara içenlere bir tasarruf hesabı önerildi: altı ay para yatırıyor, sonra nikotin testine giriyorlardı. Geçenlerin parası geri veriliyor, geçemeyenlerinki bir hayır kurumuna gidiyordu. Hesap önerilenlerin yalnızca %11’i katıldı, ama hesap önerilen grubun testi geçme olasılığı 3 yüzde puan daha yüksekti ve fark bir yıl sonraki sürpriz testlerde de sürdü.',
          'Bu, düşük katılımlı küçük bir etki; ve dürüst tablo da bu: taahhüt araçları bazı insanlara, bazen yardımcı oluyor. Yeni başlangıç çalışması, insanların bu tür sözleşmeler imzaladığı stickK sitesinde yeni taahhütlerin her haftanın başında, yılın başında ise daha da çok arttığını buldu. Fikir hoşuna gidiyorsa, sana hâlâ gerçek gelen en yumuşak sürümle başla.',
        ],
        visual: {
          kind: 'table', title: 'Taahhüt araçları, yumuşaktan sağlama', columns: ['Tür', 'Örnek', 'Vazgeçmenin bedeli'],
          rows: [
            ['Söz', 'Destekleyici bir kişiye ne yapacağını ve ne zaman yapacağını söyle', 'Biraz mahcup edici bir konuşma'],
            ['Sürtünme', 'Baştan çıkaran uygulamayı bir hafta boyunca telefonunun son ekranında bir klasöre koy', 'Birkaç fazladan dokunuş'],
            ['Peşin ödeme', 'Bir dersin yerini önceden ayırtıp ücretini öde', 'Ücreti kaybetmek'],
            ['Sözleşme', 'Sözünü tutmazsan kaybedeceğin bir para', 'Depozitoyu kaybetmek'],
          ],
          note: 'Daha sert olan her zaman daha iyi değildir: seçmiş olmaktan memnun kalacağın bir araç seç; sana ya da bir başkasına zarar verebilecek bir araç asla seçme.',
        },
      },
    ],
    example: { title: 'Marcus, 41, depo sorumlusu', text: 'Marcus o sabah sağlığı seçmişti: işten sonra kısa bir yürüyüş. Öğle arasında sandviççiye yürürken kendine onu gerçekten neyin durduracağını sordu. Dürüst cevap yağmur ya da zaman değildi. Kanepeydi ve “dinlenmeyi hak ettim” düşüncesiydi. Telefonuna şunu yazdı: “Yürüyüşten önce kanepeye oturursam, kalkıp yalnızca köşeye kadar gidip döneceğim.” Saymayacak kadar küçük geliyordu. Saat 6.15’te gerçekten oturdu ve düşünce tam zamanında geldi. Notu hatırladı, söylenerek köşeye kadar yürüdü. Sonra devam etti ve on iki dakika yürüdü. Ertesi gün köşeyi geçmedi ve bunun da sayılmasına izin verdi.' },
    sources: ['turning-day-commitment-contract', 'fresh-start-effect'],
  },
  'turning-day-3': {
    deeper: [
      {
        heading: 'Küçük kazanımlar neden sayılır?',
        paragraphs: [
          'İki dakikalık bir adımı “Bu sayılmaz, bunu herkes yapar” diyerek geçiştirmek kolay. Ama öz yeterlik, bir adımın ne kadar etkileyici göründüğü üzerine kurulmaz; bir şeyi yapmaya karar verip sonra yapmış olma deneyimi üzerine kurulur. Bu her gerçekleştiğinde, “Ben sözümü tutmam” hikâyesine karşı küçük, somut bir kanıt biriktirirsin.',
          'Adımı yazmak önemli, çünkü hafıza haksızdır. Zor bir akşamda neyin ters gittiğini kolayca hatırlar, neyin iyi gittiğini unutursun. Yazılı bir “Bugün … yaptım” cümlesine itiraz etmek daha zordur. Günler içinde bu notlar, inancının yaslanabileceği bir kayıt oluşturur.',
        ],
        visual: {
          kind: 'cycle', title: 'Küçük kanıt döngüsü', center: 'Öz yeterlik',
          nodes: [
            { label: 'Küçük adım', text: 'Bitirebileceğin iki dakikalık bir eylem.' },
            { label: 'Kanıt', text: 'Ne yaptığını yazarsın.' },
            { label: 'İnanç', text: '“Bunu yapabilirim” inancı biraz büyür.' },
            { label: 'Sonraki adım', text: 'Yarınki adım biraz daha hafif gelir.' },
          ],
          note: 'Bandura’nın ustalık deneyimi fikrinin bir örneklemesidir; ölçülmüş bir etki değildir.',
        },
      },
      {
        heading: 'Sık yapılan hatalar',
        paragraphs: [
          'İlk adımı fazla büyük tutmak en yaygın hatadır. Adım iyi bir ruh hali, boş bir saat ya da mükemmel koşullar gerektiriyorsa henüz bir ilk adım değildir. Ona “hayır” demek zor olana kadar küçült.',
          'Bir başka hata, iki dakika sınırını mutlaka durman gereken bir kural ya da mutlaka aşman gereken bir hedef sanmaktır. İkisi de sorun değil: devam etmek istiyorsan devam et, durmak istiyorsan dur. Tek görev başlamak ve başladığını fark etmek.',
        ],
      },
    ],
    example: { title: 'Priya, 27, genç grafik tasarımcı', text: 'Priya öğrenmeyi seçmişti: el yazısı harf çizimini geliştirmek istiyordu ama her düşündüğünde bitmiş bir afiş hayal edip kendini geride hissediyordu. Öğleden sonra üçte, müşteri dosyaları arasında iki dakikalık bir zamanlayıcı kurdu ve bir kâğıt parçasına tek satır harf yazdı. Titrek çıkmışlardı. Zamanlayıcı çaldığında durdu ve not uygulamasına şunu yazdı: “Bugün iki dakika harf çizimi çalıştım.” Ekranda biraz komik göründü. Ama o akşam her zamanki düşünce geldiğinde (“sen hiçbir hobiyi sürdüremezsin”), ona verecek küçük ve somut bir cevabı vardı. Ertesi öğleden sonra başlamak biraz daha kolay geldi ve beş dakika çalıştı.' },
  },
  'turning-day-4': {
    deeper: [
      {
        heading: 'Çevren işin bir kısmını neden yapar?',
        paragraphs: [
          'İrade gücü tam da en çok gerektiği anda en az bulunur: uzun bir günün sonunda, aç, yorgun ya da keyifsizken. Çevren ise her zaman oradadır. Görebildiğin bir işaret (kapının yanındaki ayakkabılar) seni zahmetsizce hatırlatır; yarıya kadar hazırlanmış bir adım da sahip olmadığın enerjiyi daha az ister.',
          'Aynı mantık tersine de işler. Çoğumuz bir saat boyunca kaydırmayı seçmeyiz; telefon yalnızca kitaptan daha yakındır. Bunu değiştirmek için başka biri olman gerekmez. Bu gece tek bir eşyayı yerinden oynatmak, yarın büyük bir karar vermekten çoğu zaman daha kolaydır.',
        ],
        visual: {
          kind: 'steps', title: 'Yarınki adımı bu gece hazırla',
          steps: [
            { label: 'Anı seç', text: 'Yarınki adım tam olarak ne zaman olacak? Kahveden sonra, işten sonra, yatmadan önce.' },
            { label: 'İşareti koy', text: 'İhtiyacın olan eşyayı o anda gözünün önüne gelecek yere bırak.' },
            { label: 'Bir engeli kaldır', text: 'Kıyafetleri hazırla, dosyayı aç, su şişesini doldur.' },
            { label: 'Bir cazibeyi uzaklaştır', text: 'Seni genellikle çeken şeyi bir oda öteye taşı.' },
          ],
          note: 'Bu gece birkaç dakikalık dört küçük hareket. Hiçbiri yarın motivasyon gerektirmiyor.',
        },
      },
      {
        heading: 'Kime söyleyeceğini seçmek',
        paragraphs: [
          'Araştırma bulgusu ilerlemeyi bildirmekle ilgili, alkış aramakla değil. En yararlı kişi, sadece “Eee, nasıl geçti?” diye soran ve iki cevabı da dinleyen kişidir. Seninle dalga geçecek, seninle yarışacak ya da planını kendi projesine çevirecek bir arkadaş bu adım için uygun değildir.',
          'Mesajı kısa ve net tut: ne yapıyorsun, ne zaman ve ne zaman haber vereceksin. “Bu hafta işten sonra on dakika yürüyorum; Pazar günü nasıl geçtiğini sana anlatabilir miyim?” yeter. Şu anda gerçekten kimse yoksa, kendine yazdığın haftalık bir not yine de fiziksel bir kayıt sayılır.',
        ],
      },
    ],
    example: { title: 'Tomás, 52, lise öğretmeni', text: 'Tomás yatmadan önce kaydırmak yerine kitap okumak istiyordu. Akşam beşte, ödev okumaya başlamadan önce romanı oturma odasındaki raftan alıp yastığının üzerine koydu. Telefon şarj aletini mutfağa taşıdı; bu tuhaf biçimde dramatik geldi. Sonra tarifini bir yapışkan nota yazdı: “Dişlerimi fırçaladıktan sonra bir sayfa okuyacağım.” Son olarak, aynı kitabı bir zamanlar okumuş olan ağabeyine mesaj attı: “Bu hafta her gece bir sayfa okumaya çalışıyorum. Pazar günü nereye kadar geldiğimi sana söylerim.” Ağabeyi bir başparmakla karşılık verdi ve başka bir şey yazmadı; tam olması gerektiği gibi. O gece kitap oradaydı, telefon değildi.' },
  },
  'turning-day-5': {
    deeper: [
      {
        heading: 'Yarını gerçekçi bir ideal gün olarak tasarlamak',
        paragraphs: [
          'Franklin yalnızca iki sorusunu sormakla kalmadı; bütün gününü saat saat, iş, yemek, okuma ve dinlenme zamanlarıyla planladı. Senin bu kadar ayrıntılı bir programa ihtiyacın yok. Ama bu gece bir dakikanı gerçekçi bir ideal günü (mükemmel bir günü değil) gözünde canlandırmaya ayırmak, yarınki adımın nereye oturduğunu ve neyin onu sıkıştırabileceğini görmene yardım eder.',
          'İşe yarar bir ideal günün yalnızca birkaç sabit noktası vardır: seçtiğin alan için tek adım, bir dinlenme anı ve başka biriyle bir bağ kurma anı. Geri kalan her şey esnek kalabilir. Yalnızca hiçbir şey ters gitmediğinde işleyen bir gün tasarlarsan, gerçekleşmeyecek bir gün tasarlamışsındır; beklenmedik şeylere yer bırak.',
        ],
        visual: {
          kind: 'table', title: 'Gerçekçi bir ideal gün: üç çıpa', columns: ['Çıpa', 'Ne zaman', 'Örnek'],
          rows: [
            ['Tek adımın', 'Zaten yaptığın bir şeye bağlı', 'Sabah kahvesinden sonra: 10 dakikalık yürüyüş'],
            ['Dinlenme', 'Korunan bir mola', 'Öğle yemeğini ekrandan uzakta yemek'],
            ['Bağ', 'Kısa ama gerçek bir temas', 'Akşam bir kişiye mesaj at ya da onu ara'],
          ],
          note: 'Üç sabit nokta ve bol esneklik. Bu bir planlama yardımcısı; gününün nasıl geçmesi gerektiğine dair bir kural değil.',
        },
      },
      {
        heading: 'Nazik olmak, kendini sorumluluktan kurtarmak değildir',
        paragraphs: [
          'Bazı insanlar kendilerine nazik davranmanın onları tembelleştireceğinden korkar. Bu dersteki araştırma ise, temkinle de olsa, tersini gösteriyor: Wohl çalışmasında kendini daha çok affeden öğrenciler bir sonraki sefer daha az erteledi ve bu bağlantı, göreve karşı daha az olumsuz duyguyla açıklandı. Kendini eleştirmek görevi daha kötü hissettirir; daha kötü hissettiren bir görevden kaçınmak da daha kolaydır.',
          'Nazik bir değerlendirme yine de olanı adıyla söyler. “İşte geç kaldığım için yürüyüşü atladım” dürüsttür. Buna “ve bu anlaşılır; yarın köşeye kadar gidip dönme sürümünü yapacağım” eklemek naziktir. İlk yarıyı atlamak kaçınma olurdu; ikinci yarıyı atlamak sertlik olurdu.',
        ],
      },
    ],
    example: { title: 'Aisha, 38, muhasebeci ve iki çocuk annesi', text: 'Aisha öğle yemeğinden sonra on dakikalık bir esneme planlamıştı ama bir müşteri görüşmesi uzadı ve yatma saatine kadar unuttu. Dişlerini fırçalarken ilk düşüncesi “İlk gün ve şimdiden başarısız oldum” oldu. Bunun yerine defteriyle yatağın kenarına oturdu. “Bugün hangi iyiliği yaptım?” başlığının altına şunu yazdı: “Yoga matını masanın yanına koydum. Sam’e planımı anlattım.” “Neyi zorlaştırdı?” başlığının altına: “Görüşme uzadı; öğleden sonra esneme takvime bağlı.” Nazik cümlesi: “Yoğun bir günde aksaması çok normal; yine de hazırlığı yapmıştım.” Yarının adımı: “Sabah 7.30, çocuklar uyanmadan önce, matın üstünde üç dakika.” Defteri kapattı ve ışığı söndürdü.' },
  },
  'turning-day-6': {
    deeper: [
      {
        heading: 'Yeni başlangıçlar yenilenebilir',
        paragraphs: [
          'Yeni başlangıç araştırması, önündeki hafta için sessiz bir ders taşıyor: bir başlangıcın takvimden gelmesi gerekmez. 2015 deneylerinde sıradan bir güne başlangıç demek bile insanların başlama isteğini artırdı. Bunu bilerek kullanabilirsin. Kaçırılan bir günden sonra yarın sabah gayet iyi bir işarettir; bir sonraki haftanın başı da öyle, zor bir projeyi bitirdiğin gün de.',
          'İşe yaramayan ise bir sonraki işareti beklemek için gerekçe yapmak. Çarşamba günü “Pazartesi yeniden başlarım” demek dört günü elden çıkarmaktır. Daha iyisi, “Yarın haftamın ikinci yarısının ilk günü” demek. Eski ile yeni arasındaki çizgiyi ihtiyacın olan yere çekebilirsin.',
        ],
      },
      {
        heading: '7. gün geriye bakışın',
        paragraphs: [
          '7. günde kutulara kendine not vermeden bak. Dört işaretli, üç boş bir hafta başarısız bir hafta değildir; adımın hayatına ne zaman uyup ne zaman uymadığına dair bir veridir. Aşağıdaki sorular yaklaşık on dakika sürer. Mümkünse yazılı yanıtla, çünkü izleme araştırmasında fiziksel bir kayıt daha büyük bir yararla ilişkiliydi.',
          'Sonra üç yoldan birini seç: adımı olduğu gibi sürdür, küçült ya da çıpayı veya saati değiştir. Daha fazlasını eklemek de bir seçenek, ama yalnızca mevcut adım kolay gelmeye başladıysa. İkinci haftanın amacı ilk haftayla aynı: tekrarlanacak kadar küçük.',
        ],
        visual: {
          kind: 'table', title: '7. gün soruları', columns: ['Soru', 'Sana ne söyler?'],
          rows: [
            ['Hangi günlerde kolayca gerçekleşti?', 'Adımını destekleyen koşullar'],
            ['Hangi günlerde aksadı ve neden?', 'Bir sonraki eğer/o zaman planının hedef alması gereken engel'],
            ['Kaçırılan günden sonra geri döndüm mü?', 'En küçük sürümünün yeterince küçük olup olmadığı'],
            ['Sürdür, küçült ya da değiştir?', 'Önümüzdeki yedi gün için planın'],
          ],
          note: 'Geriye bakış öğrenmek içindir, not vermek için değil. Boşluklar bilgidir.',
        },
      },
    ],
    example: { title: 'Jonah, 23, kurye ve yarı zamanlı öğrenci', text: 'Jonah’ın adımı akşam yemeğinden sonra yirmi dakika muhasebe tekrarıydı. Bir zarfın arkasına yedi kutu çizdi ve buzdolabına yapıştırdı. Pazartesi ve Salı işaretlendi. Çarşamba geç saatlere kadar çalıştı ve zarf boş kaldı; tanıdık “haftaya sıfırdan başlarım” dürtüsünü hissetti. Bunun yerine birinci gün yazdığı cümleye baktı: “Kaçırırsam beş bilgi kartı yaparım.” Perşembe günü beş kart çalıştı, sonra sekiz. Pazara kadar yedi kutunun beşi işaretliydi. Geriye bakışında iki boşluğun da geç vardiya günleri olduğunu fark etti; ikinci hafta için o günlerde adımı öğle molasına taşıdı.' },
    sources: ['fresh-start-framing'],
  },
};
