import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/suggestion.ts (ders id'leri aynı).
// Bu derslerin dayandığı tüm kaynaklar Türkçe derslerin kendi listesinde zaten var.
export const SOURCES: CourseSource[] = [];

export const EXTRAS: Record<string, LessonExtra> = {
  'suggestion-1': {
    deeper: [
      { heading: 'Beklenti gerçektir ve sınırları vardır',
        paragraphs: [
          'Grafikteki etki hayalî değil. Güvendiğin biri sana bir işlemin daha az acıtacağını söylediğinde, birçok insan gerçekten daha az ağrı hisseder. Beklenti, dikkatin nereye gittiğini, bedenin ne kadar gerildiğini ve bir duyumun nasıl okunduğunu değiştirir. Bu gerçek bir etki ve kullanmaya değer.',
          'Yine de çalışmaların neyi ölçtüğüne dikkat et: ağrı, yani hissettiğin ve bildirdiğin bir şey. Beklentinin bir tümörü küçülttüğünü, kan şekerini düşürdüğünü ya da bir enfeksiyonu temizlediğini göstermiyorlar; Coué’nin organik hastalıkları iyileştirme iddiaları da tutmadı. İki yarıyı birden akılda tut. Telkin, zor bir anın nasıl hissettirdiğini ve bir sonraki adımda ne yaptığını değiştirebilir. Bakımın yerine geçmez.',
        ],
        visual: { kind: 'compare', title: 'Telkin nerede yardımcı olabilir, nerede olamaz',
          left: { label: 'Kaydırabilir', items: ['Zor bir andan önce ne kadar gergin hissettiğini', 'Ağrı gibi bir duyumun ne kadar güçlü hissedildiğini', 'Dikkatinin nereye gittiğini', 'Bir sonraki küçük adımın ne olduğunu'] },
          right: { label: 'Yerine geçemez', items: ['İlacın ya da tıbbi tedavinin', 'Bir belirtinin tanısının', 'Başkalarının kararlarının', 'Alıştırma ve hazırlığın'] },
          note: 'Ağrı çalışmalarında telkinleri araştırmacılar ya da klinisyenler verdi. Kendi kendine telkin ayrıca sınanmadı.' } },
      { heading: 'Coué’nin fark ettiği döngü',
        paragraphs: [
          'Coué hastalarında gördüğünü anlattı: biri sinirli olmamak için ne kadar zorlanırsa o kadar sinirleniyordu. Birçok insan bunu uykuya dalmaya çalışırken ya da kızarmamaya çalışırken bilir. Çaba, dikkati tam da kurtulmak istediğin şeyin üzerine çeker ve o dikkat onu besler.',
          'Coué bunu bir yasa olarak ele aldı. Daha doğrusu, sık uyan bir gözlem; kanıtlanmış bir kural değil. Yine de bu kursun neden cümleni yumuşakça söyleyip sonra bırakmanı, dişini sıkarak zorlamak yerine, istediğini açıklıyor.',
        ],
        visual: { kind: 'cycle', title: 'Zorlama döngüsü', center: 'Çok fazla çaba',
          nodes: [
            { label: 'Gerilme', text: 'Kendine kararlılıkla söylersin: sinirli olma.' },
            { label: 'Gözleme', text: 'Sinirlilik işaretlerini taramaya başlarsın.' },
            { label: 'Bulma', text: 'Hızlı bir kalp atışı ya da kuru bir ağız bütün dikkatini alır.' },
            { label: 'Endişe', text: 'İşaretler, işe yaramadığının kanıtı gibi gelir.' },
            { label: 'Daha çok zorlama', text: 'Daha da çok zorlarsın ve döngü yeniden başlar.' },
          ],
          note: 'Coué’nin gözlemi, bizim sözlerimizle yeniden anlatıldı; deneysel olarak kanıtlanmış bir yasa değildir.' } },
    ],
    example: { title: 'Leyla, 34, diş hijyenisti',
      text: 'Pazartesi ekip toplantılarından önce Leyla kendine hep kararlılıkla “Bu sefer telaşlanma” derdi. Konuşma sırası geldiğinde yüzü kızarmış olur, sözlerini aceleyle söylerdi. Pazar günü dersi denedi. Zorlayıcı cümleyi ve yanına daha yumuşak bir cümleyi yazdı: “Acele etmeden konuşabilirim.” Toplantıdan önce omuzlarını bıraktı, üç yavaş nefes aldı ve yumuşak cümleyi sessizce söyledi; ilk noktasından önce duraksadığını hayal etti. Yüzü yine biraz ısındı. Ama bir kez duraksadığını ve sözlerin sırayla çıktığını fark etti. Sonra telefonuna tek satır yazdı: “Çene daha az sıkı.” Sihirli bir şey olmadı; toplantı yalnızca bir tık daha az savaş gibi geldi.' },
  },
  'suggestion-2': {
    deeper: [
      { heading: 'Sade bir cümle neden yine de işe yarayabilir',
        paragraphs: [
          'Formül bilerek sıkıcı. Senden alçak bir sesten ve birkaç dakikadan başka bir şey istemiyor; tekrarlamasının kolay olmasının nedeni tam da bu. Lally ve arkadaşlarının alışkanlık çalışmasında, bir davranışı aynı ortamda tekrarlayan insanlar, bunun giderek daha az düşünce gerektirdiğini gördü; bunun ne kadar sürdüğü çok değişse de arada bir günü kaçırmak süreci bozmadı.',
          'Bu, formüle gerçekçi bir görev veriyor: uyanmaya ve yatmaya bağlanmış küçük, düzenli bir ritüel. Ruh hâline ne yaptığını bir çalışmanın vaat etmesi değil, senin fark etmen gerekir. Bazı insanlar onu yatıştırıcı bulur; bazıları ilk başta tuhaf bulur ve birkaç gecenin ardından alışır.',
        ],
        visual: { kind: 'cycle', title: 'Aynı ana bağlanmış bir ritüel', center: 'Aynı zaman, aynı yer',
          nodes: [
            { label: 'İpucu', text: 'Uyanırsın ya da gece yatağa uzanırsın.' },
            { label: 'Rutin', text: 'Düğümler ya da boncuklarla sayılan yirmi sakin tekrar.' },
            { label: 'An', text: 'Güne ya da uykuya girmeden kısa bir sakinlik molası.' },
            { label: 'Tekrar', text: 'Yarın aynı ipucu, başlamayı kolaylaştırır.' },
          ],
          note: 'Aynı bağlamda tekrar, bir davranışı zamanla daha otomatik hâle getirir (Lally ve ark., 2010). Formülün kendi etkisi sınanmadı.' } },
      { heading: 'Sık yapılan hatalar',
        paragraphs: [
          'Formülün ters gitmesinin çoğu yolu, onu bir sınav gibi görmekten gelir. İnsanlar yüksek sesle söyler, her turdan sonra bir şey değişti mi diye yoklar ya da zihni dağılınca sinirlenir. Coué her noktada bunun tersini önerdi.',
        ],
        visual: { kind: 'table', title: 'Sık yapılan hatalar ve daha nazik alternatifler', columns: ['Hata', 'Daha nazik alternatif'],
          rows: [
            ['Yüksek sesle ve zorlayarak söylemek', 'Alçak, düzgün bir ses, neredeyse mırıltı'],
            ['Her turdan sonra sonuç yoklamak', 'Sayımı düğümlere bırak; bir hafta sonra gözden geçir'],
            ['Zihni dağılınca kendini azarlamak', 'Fark et ve cümleyi yeniden eline al'],
            ['Hekime gitmek yerine kullanmak', 'İhtiyaç duyduğun her bakımın yanında kullan'],
          ] } },
    ],
    example: { title: 'Sami, 42, otobüs şoförü',
      text: 'Sami’nin erken vardiyaları, sabah 4.30’da trafiği düşünerek uyanmak demekti. Tespih çeken kız kardeşi ona yirmilik kısa bir tespih ödünç verdi. Salı gecesi uzandı ve formülü her seferinde bir boncuk çevirerek yirmi kez mırıldandı. İki kez sayıyı kaybetti ve yoluna devam etti. Çarşamba sabahı ayakları yere değmeden bir kez daha yaptı. Yaklaşık iki dakika sürdü. Değişmiş gibi hissetmedi. Fark ettiği şey, kafasındaki ilk şeyin çevre yolu değil, sessiz bir cümle olmasıydı. Bir yapışkan nota “daha az telaşlı başlangıç” yazdı. Cuma günü bunu düşünmeden yapıyordu, cumartesi ise tamamen unuttu ve bunun sorun olmadığına karar verdi.' },
  },
  'suggestion-3': {
    deeper: [
      { heading: 'İnanılmayan cümle neden ters tepebilir',
        paragraphs: [
          'Popüler öğütler çoğu zaman olumlu bir cümleyi inanana kadar tekrarlamanı söyler. Wood deneyleri bir püf noktası olduğunu gösteriyor. Kendini zaten iyi hisseden insanlar için cümle uydu ve biraz iyi geldi. Hissetmeyenler için her tekrar, sessiz bir “bu doğru değil”i davet etmiş gibiydi ve cümle ile kendi bakışları arasındaki fark daha belirgin hâle geldi.',
          'Bu tek bir cümleydi ve öğrencilerle birkaç dakika boyunca denendi; yani tüm olumlamaların zararlı olduğunu göstermez. Ama basit bir kontrol öneriyor: bir cümle seni ürpertiyorsa, mümkün gelene kadar küçült.',
        ],
        visual: { kind: 'cycle', title: 'İnanmadığın bir cümle nasıl ters tepebilir', center: 'Aradaki fark',
          nodes: [
            { label: 'İddialı cümle', text: '“Kendime tamamen güveniyorum.”' },
            { label: 'İç itiraz', text: 'Bir ses cevap verir: bu doğru değil.' },
            { label: 'Karşı kanıt', text: 'Tersine dair anılar akla gelir.' },
            { label: 'Daha kötü ruh hâli', text: 'Aradaki fark eskisinden büyük hissedilir.' },
          ],
          note: 'Araştırmacıların sunduğu olası bir açıklama; adım adım ölçtükleri bir şey değil. Etki, özgüveni düşük kişilerde görüldü.' } },
      { heading: 'Değerler üzerine araştırma ne diyor',
        paragraphs: [
          'Öz-onaylama, kendin hakkında güzel şeyler söylemekten farklıdır. Hissetmeyebileceğin bir özelliği iddia etmezsin. Önemsediğin bir şey hakkında, örneğin aile, dürüstlük ya da inanç ve bunun neden önemli olduğu hakkında yazarsın. Fikir şu: eleştiri ya da korkutucu bir sağlık mesajı gibi bir tehdit, bu durumda kendine dair bütün resmin içinde daha az yer kaplar.',
          'Etkiler mütevazı. Birçok deneyde değer yazısı insanları sağlık mesajlarına biraz daha açık yaptı ve, biraz daha net biçimde, sonrasında davranışlarını değiştirme olasılıklarını artırdı. Zamanlama önemliydi ve okullardaki bazı büyük denemeler önceki sonuçları tekrarlamadı.',
        ],
        visual: { kind: 'bars', title: 'Öz-onaylama ve sağlık davranışı',
          bars: [
            { label: 'Mesajı kabul etme (34 test)', value: 0.17, display: 'd = 0,17' },
            { label: 'Değişim niyeti (64 test)', value: 0.14, display: 'd = 0,14' },
            { label: 'Sonraki davranış (46 test)', value: 0.32, display: 'd = 0,32' },
          ],
          note: 'Epton ve ark. (2015), 144 deneysel test. Küçük etkiler, çoğunlukla bir sağlık mesajıyla birlikte ölçüldü; tek başına değer yazısı ve bu kurs sınanmadı.',
          sourceId: 'self-affirmation-health' } },
    ],
    example: { title: 'Pınar, 27, genç muhasebeci',
      text: 'Pınar’ın aynasında “İşimde harikayım” yazan bir yapışkan not vardı. Her sabah onu okuyor ve küçük bir sızı hissediyordu, çünkü geçen hafta bir raporda hata yapmıştı. Perşembe günü ona ne kadar inandığını puanladı: on üzerinden üç. Yeniden yazdı: “Bu işi öğreniyorum ve işimi kontrol ediyorum.” Bu yedi çıktı. Ayrıca en çok önemsediği değer olan dürüstlük hakkında ve yakın zamanda bir hatasını yöneticisine üstlendiği bir an hakkında on dakika yazdı. Ertesi sabah yeni not onu harika hissettirmedi. Sadece sızlatmadı. Bir değerlendirme toplantısından önce dürüstlük paragrafını yeniden okudu ve içeri biraz daha sağlam girdi.' },
  },
  'suggestion-4': {
    deeper: [
      { heading: 'Ad neden mesafe yaratır',
        paragraphs: [
          '“Ben” diye düşündüğünde durumun içindesin, her duyuma ve korkuya yakınsın. Adını kullandığında zihnin, başkaları için kullandığın dilbilgisini ödünç alır. Çoğumuz bir arkadaşımızın sorunu hakkında kendi sorunumuzdan daha bilgeyizdir, çünkü onun bütününü görebiliriz. Ad, o arkadaşın sandalyesine oturmanın hızlı bir yoludur.',
          'Kross bunu ve ilişkili birkaç aracı Chatter kitabında anlatıyor: olayı bir yıl sonra nasıl göreceğini hayal etmek, onun hakkında yazmak ya da güvendiğin biriyle konuşmak. Hepsinin ortak bir hamlesi var, bir adım geri çekilmek, ve her biri farklı bir ana uyar.',
        ],
        visual: { kind: 'steps', title: 'İki dakikalık mesafeli bir yoklama',
          steps: [
            { label: 'Ad', text: 'Kendine seslen: “Ali, şu an neler oluyor?”' },
            { label: 'Betimle', text: 'Olanı “ben” değil “sen” diyerek söyle.' },
            { label: 'Öğüt ver', text: 'Aynı durumdaki bir arkadaşına ne söylerdin, onu söyle.' },
            { label: 'Uzaklaş', text: 'Bunun bir yıl sonra sana nasıl görüneceğini sor.' },
            { label: 'Sonraki adım', text: 'Bir sonraki dakika için tek bir somut eylemle bitir.' },
          ],
          note: 'Ethan Kross’un araçlarından uyarlandı. Laboratuvar çalışmaları ad ya da “sen” kullanmayı sınadı; diğer adımlar birlikte sınanmadı.' } },
      { heading: 'Sert değil, şefkatli',
        paragraphs: [
          'Mesafe en çok sıcaklıkla birlikte geldiğinde yardımcı olur. “Ali, seni aptal” demek adını kullanır ama eleştirmeni de beraberinde getirir. Onlarca denemeyi inceleyen bir derleme, öz-şefkat uygulamalarının, yani kendine bir arkadaşa göstereceğin nezaketle davranmanın, kısa vadede stresi ve kaygıyı küçük–orta miktarlarda azalttığını buldu; ancak denemelerin çoğunun zayıf yönleri vardı.',
          'Yararlı bir sınama basit: bu cümleyi, bu tonla, sevdiğin birine söyler miydin? Söylemezsen, sözcükleri değiştirmeden önce tonu değiştir.',
        ] },
    ],
    example: { title: 'Metin, 38, hemşire',
      text: 'Metin, gözünü korkutan yeni bir sorumlu hemşireye kısa bir devir teslim yapmak zorundaydı. Servise yürürken kafası “Bunu berbat edeceğim, hep bir şeyi unutuyorum” ile doluydu. Malzeme odasında iki dakika durdu ve dersi fısıltıyla denedi: “Metin, gergin olmanın nedeni bunu doğru yapmak istemen. Yüzlerce devir teslim yaptın.” Sonra genç bir meslektaşına ne söyleyeceğini sordu: “En ağır hastayla başla ve sırayla git.” Bunu da kendine söyledi. Devir teslim kusursuz olmadı; bir tahlil sonucunu unuttu ve sonda ekledi. Ama sonraki bir saati onu yeniden oynatmakla geçirmediğini fark etti, ki genellikle olan buydu.' },
  },
  'suggestion-5': {
    deeper: [
      { heading: 'Eğitsel mi, motive edici mi?',
        paragraphs: [
          'İkisinin de yeri var. Eğitsel ipuçları dikkati tek bir ayrıntıya yöneltir; bu, iş yeni ya da hassas olduğunda ve zihnin dağılmaya ya da gerilmeye eğilimli olduğunda yardımcı olur. Motive edici ipuçları ise çabaya ve dayanıklılığa, örneğin bir koşunun son kısmına ya da öğleden sonranın onuncu e-postasına daha çok yardım eder.',
          'Kullanışlı bir kural: öğreniyorsan ya da hassasiyet gerekiyorsa bir talimat seç; ne yapacağını biliyor ama isteğin azalıyorsa cesaret verici bir şey seç. İpucu her zaman tek nefeste söylenebilecek kadar kısa olmalı.',
        ],
        visual: { kind: 'table', title: 'Gündelik işler için ipucu kelimeleri', columns: ['İş', 'Eğitsel ipucu', 'Motive edici ipucu'],
          rows: [
            ['Rapor yazmak', 'Önce taslak', 'Devam et'],
            ['Toplantıda konuşmak', 'Yavaş ve net', 'Hazırsın'],
            ['Araba kullanmayı öğrenmek', 'Ayna, sinyal', 'Sakin'],
            ['Yeni bir tarif pişirmek', 'Tadına bak', 'Keyfini çıkar'],
          ],
          note: 'Yalnızca örnekler; spor ve motor görevleri kapsayan meta-analizde sınanmadılar.' } },
      { heading: 'Gallwey bunu nasıl yapıyor',
        paragraphs: [
          'Bir tenis antrenörü olan Tim Gallwey, oyuncuların kendilerine nutuk çektiklerinde çoğu zaman daha kötü oynadığını fark etti. Yargılayan sese Benlik 1, gerçekten öğrenen bedene Benlik 2 dedi. Cevabı daha fazla talimat değil, daha basit bir dikkatti: top yere değdiğinde “zıpla”, raketle buluştuğunda “vur” demek ve olanı iyi ya da kötü diye adlandırmadan izlemek.',
          'Araştırma onun yöntemini tek başına sınamadı. Yine de meta-analizin dikkati yönlendiren kısa ipuçları hakkında bulduğuyla örtüşüyor ve hataları ele almanın nazik bir yolunu sunuyor: bir hüküm yerine, bir dahaki sefere izleyeceğin tek bir şeyi seç.',
        ],
        visual: { kind: 'compare', title: 'Benlik 1 mi, basit bir ipucu mu?',
          left: { label: 'Yargılayan ses (Benlik 1)', items: ['“Bu berbattı.”', 'Aynı anda beş düzeltmelik bir liste', 'Gerginlik ve fazla düşünme'] },
          right: { label: 'Basit ipucu', items: ['Tek bir ana bağlanmış tek bir kelime', 'Olanı izlemek', 'Bir dahaki sefere fark edilecek tek şey'] },
          note: 'Gallwey’nin anlatımı, bizim sözlerimizle. Yöntemin kendisi meta-analizlerde ayrıca sınanmadı.' } },
      { heading: 'İpucunu ihtiyaç duymadan önce alıştır',
        paragraphs: [
          'Meta-analizdeki en net örüntülerden biri, insanların iç konuşmalarını önceden alıştırdığı programların, alıştırmadıklarından daha iyi işlemesiydi. Bir ipucu, ona ihtiyaç duyduğun anda zaten tanıdık olduğunda en iyi işler. Önce kolay bir turda dene, sonra zor olana taşı.',
        ] },
    ],
    example: { title: 'Aylin, 45, okul idari görevlisi',
      text: 'Aylin işte yeni bir hesap tablosu sistemini öğreniyordu ve veri girerken sürekli küçük hatalar yapıp sonra kendini azarlıyordu. İki ipucu seçti. Eğitsel: “sütunu kontrol et”. Motive edici: “her seferinde bir satır”. Pazartesi günü gerçek işten önce onları on kolay satırda denedi; her seferinde yazmadan önce “sütunu kontrol et” dedi. Sonra gerçek işe geçti. Elli satırda yine iki hata yaptı, her zamankinden azdı ve onları fark ettiğinde kendine dikkatsiz demedi. Sadece defterine yazdı: “tarihlere dikkat”. Çarşamba günü “tarihlere dikkat”i yeni ipucu olarak ekledi. Küçük bir şeydi, ama öğleden sonra not veriliyormuş gibi hissettirmedi.' },
  },
  'suggestion-6': {
    deeper: [
      { heading: 'Uyku ne yapar, ne yapmaz',
        paragraphs: [
          'Uyku, bellek için boş zaman değildir. Paller ve arkadaşlarının derlemesine göre günün anıları gece boyunca yeniden oynatılıp pekiştirilir; bu, sorun çözmeye ve duyguların yatışmasına yardımcı olabilir. Bu da yatmadan önce yapılan kısa ve sakin bir provaya makul bir rol veriyor: gün içinde alıştırdığın son şeylerden biri o.',
          'Uykunun yapmadığı şey emir almaktır. Uykuda gerçekten yeni malzeme öğrenmek yalnızca çok basit türlerle sınırlı ve derleme, endişeleri tekrar tekrar gözden geçirmenin zarar verebileceği konusunda da uyarıyor. Murphy’nin kitabındaki bilinçaltı itaatkâr bir cin gibi çalışır. Araştırma daha sıradan bir şey anlatıyor: alıştırmaya karşılık veren alışkanlıklar, dikkat ve bellek.',
        ],
        visual: { kind: 'compare', title: 'Uyku ve telkin: kanıtla uyanlar',
          left: { label: 'Kanıtla uyuyor', items: ['Yatmadan önce ilk adımı prova etmek', 'Kısa bir cümleyi sakince tekrarlamak', 'Uykunun alıştırdığını pekiştirmesine izin vermek'] },
          right: { label: 'Desteklenmiyor', items: ['Bilinçaltının para ya da sağlık getirmesi', 'Uykuda karmaşık yeni beceriler öğrenmek', 'Düşüncenin hastalığı iyileştirmesi'] },
          note: 'Uyku öncesi telkini doğrudan sınamayan Paller, Creery ve Schechtman (2021) derlemesine dayanır.' } },
      { heading: 'Engeli neden eklemeli',
        paragraphs: [
          'Hoş bir hayal ilerleme gibi hissettirebilir. Kappes ve Oettingen’in deneylerinde, idealize edilmiş bir geleceği hayal eden insanların sonrasında enerjisi daha azdı ve bir çalışmada takip eden hafta daha az iş yaptılar. Zihin, hedefe zaten ulaşılmış gibi gevşiyor gibi görünüyor.',
          'Çözüm hayal etmeyi bırakmak değil, iki adım eklemek. Sonucu gördükten sonra, önüne çıkabilecek içindeki asıl şeyi adlandır ve onu bir eğer–o zaman planına bağla. 21 çalışmada bu birleşim, hedeflere ulaşmada küçük–orta bir ortalama etki gösterdi.',
        ],
        visual: { kind: 'steps', title: 'Akşam sahnesinden sabah planına',
          steps: [
            { label: 'Dilek', text: 'Uykun gelirken yavaşça tekrarlanan kısa bir cümle.' },
            { label: 'Sahne', text: 'Bir arkadaşının seni tebrik etmesi gibi sonucun kısa bir görüntüsü.' },
            { label: 'Engel', text: 'Sabah: içinde önüne ne çıkabilir?' },
            { label: 'Plan', text: '“Eğer … olursa, … yapacağım.”' },
          ],
          note: 'İstenen geleceği engel ve bir eğer–o zaman planıyla eşleştirmek, 21 çalışmada g = 0,336’lık bir ortalama etki gösterdi (Wang, Wang & Gai, 2021).' } },
      { heading: 'Zihnin endişeye kayarsa',
        paragraphs: [
          'Bazı geceler cümle, ters gidebilecek her şeyin listesine kayar. Bu tekniğin başarısızlığı değil. Sahneyi bırak, gerekirse endişeyi yatağın yanındaki bir not defterine yaz ve yavaş nefese dön. Uyku, alıştırmadan daha önemli. Endişe çoğu gece seni uyanık tutuyorsa, bunu bir hekimle konuşmaya değer.',
        ] },
    ],
    example: { title: 'Tuna, 33, genç mimar',
      text: 'Tuna’nın cuma günü bir tasarım değerlendirmesi vardı ve geceleri felaket senaryolarını prova edip duruyordu. Çarşamba günü dersi denedi. Dileğini “Değerlendirme sorunsuz geçti” cümlesine indirdi ve bir karta yazdı. Yatakta, uykusu gelirken bunu yavaşça tekrarladı ve meslektaşı İnci’nin “Vaziyet planında iyi iş çıkarmışsın” dediğini canlandırdı. Sahne bitmeden uyudu. Perşembe sabahı gerçek engeli yazdı: “Biri bana soru sorunca acele ediyorum.” Ve planı: “Biri bir ayrıntıya itiraz ederse durup soruyu tekrarlayacak ve bildiğim kısmı cevaplayacağım.” Cuma günü ortaklardan biri otopark yerleşimine gerçekten itiraz etti. Tuna biraz beceriksizce duraksadı ve cevap verdi. Değerlendirme kusursuz değildi, ama prova ettiği felaket de değildi.' },
  },
  'suggestion-7': {
    deeper: [
      { heading: 'Parçalar nasıl birbirine oturur',
        paragraphs: [
          'Kartın her parçası farklı bir iş yapar. Cümle tonu belirler, imge ilk hamleyi gösterir, plan işlerin zorlaştığı anı karşılar ve zaman onu bir ruh hâli değil, bir alışkanlık yapar. Tek başına her biri küçük bir araç. Birlikte bir hafta boyunca çalıştırıp sonra ayarlayabileceğin bir döngü oluştururlar.',
          'Araştırma bu döngünün bazı halkalarını diğerlerinden daha çok destekliyor: eğer–o zaman planları ve ilerlemeyi izleme en net desteğe, zihinsel prova küçük bir etkiye sahip; cümlenin kendisi ise çoğunlukla yolunu tıkamayarak işe yarıyor.',
        ],
        visual: { kind: 'cycle', title: 'Haftalık bir döngü olarak telkin kartı', center: 'Kartın',
          nodes: [
            { label: 'Cümle', text: 'İnanılabilir bir cümle, belki adınla başlayan.' },
            { label: 'İmge', text: 'İlk adımının kısa bir sahnesi.' },
            { label: 'Plan', text: 'Engel çıkarsa ne yapacağını bilirsin.' },
            { label: 'Eylem', text: 'O gün gerçekten attığın küçük adım.' },
            { label: 'Gözden geçirme', text: '7 gün sonra: tut, değiştir ya da küçült.' },
          ],
          note: 'Döngü önceki derslerdeki araçları birleştirir; kartın bütünü tek bir yöntem olarak sınanmadı.' } },
      { heading: 'Ayna çalışması, nazikçe',
        paragraphs: [
          'Louise Hay ayna çalışmasını yaygınlaştırdı: kendi yansımana nazik bir cümle söylemek. Bazı insanlar için bu dokunaklı; bazıları için dayanılmaz. İkisi de olağan tepkiler ve kimlere yardımcı olduğunu söyleyen kontrollü bir araştırma yok.',
          'Wood deneylerinin bulduklarını göz önünde bulundurarak aynayı bir görev olarak değil, bir sınama olarak kullan. Kendi gözlerine bakınca cümle biraz daha doğru geliyorsa, tut. Daha güçlü bir “hayır” tetikliyorsa, kâğıda dön ya da önce cümleyi yumuşat.',
        ] },
      { heading: 'Suçlamadan gözden geçirmek',
        paragraphs: [
          'Gözden geçirme bir ayar oturumudur, sınav değil. İnsanların ilerlemesini ne sıklıkla kontrol ettiğini artıran çalışmalar hedeflere ulaşmada orta düzeyde bir ortalama fayda buldu ve ilerlemeyi kâğıda ya da ekrana kaydetmek, kafada tutmaktan daha çok yardımcı oldu. Cevaplarını, kısaca da olsa, yaz.',
        ],
        visual: { kind: 'table', title: '7 günlük gözden geçirme için sorular', columns: ['Soru', 'Evetse', 'Hayırsa'],
          rows: [
            ['Kartı günlerin çoğunda okudum mu?', 'Saati olduğu gibi tut', 'Diş fırçalamak gibi daha sağlam bir ipucuna bağla'],
            ['Cümleye inandım mı?', 'Tut', 'Daha küçük ve süreç odaklı yap'],
            ['Engel geldiğinde plan devreye girdi mi?', 'Planı tut', '“Eğer” kısmını daha belirgin yap'],
          ],
          note: 'İlerlemeyi izlemek, Harkin ve ark. (2016) çalışmasında ortalama olarak hedefe ulaşmayı destekledi (d = 0,40); bu belirli sorular sınanmadı.' } },
    ],
    example: { title: 'Hande, 51, eczane teknisyeni',
      text: 'Hande akşamları yürüyüşe başlamak istiyordu ama hep kanepede bitiriyordu. Bir fiş kartının ön yüzüne şunu yazdı: “Hande, on dakika yapabilirsin.” Altına bir imge: kapının yanında ayakkabılarını bağlamak. Arka yüze: “Akşam yemeğinden sonra oturursam, karar vermeden önce kalkıp ayakkabılarımı giyeceğim.” Ve saat: akşam 7, sofrayı topladıktan sonra okunacak. Aynayı bir kez denedi ve kendini aptal gibi hissetti; bunun yerine kartı kâğıttan okudu. Yedi günde dört kez yürüdü, ikisi yalnızca on dakikaydı. Gözden geçirmede cümleyi tuttu, imgeyi yemekten önce ayakkabılarını hazır koymaya çevirdi ve okuma saatini öne aldı. Yedide dört, sıfırdan fazlaydı.' },
  },
};
