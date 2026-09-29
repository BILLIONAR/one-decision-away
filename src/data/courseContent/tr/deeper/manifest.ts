import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/manifest.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'manifest-positive-fantasies', title: 'Kappes & Oettingen · 2011 · İdealleştirilmiş gelecek hayalleri enerjiyi tüketir', url: 'https://www.sciencedirect.com/science/article/abs/pii/S002210311100031X', type: 'research',
    finding: 'Dört deney. İdealleştirilmiş bir gelecekle ilgili olumlu hayallere daldırılan kişilerde, hem fizyolojik hem davranışsal göstergelerle ölçülen enerji; istenen geleceği sorgulayan hayallere, olumsuz hayallere ya da nötr hayallere göre daha düşük çıktı. Hayal daha acil bir ihtiyaçla ilgiliyse enerji düşüşü daha büyüktü. Yazarlar, kendiliğinden gelen olumlu hayallerin daha zayıf başarıyı neden yordadığının bir nedeninin düşük enerji olduğu sonucuna varıyor.',
    limitation: 'Küçük örneklemli laboratuvar deneyleri. Hayal kurmanın her zaman zararlı olduğunu göstermez; yalnızca engel ve plan içermeyen idealleştirilmiş bir hayalin harekete geçme enerjisini azaltabileceğini gösterir. Yalnızca özet okundu.' },
  { id: 'manifest-belief-study', title: 'Dixon, Hornsey & Hartley · Personality and Social Psychology Bulletin · Manifestasyon inancının psikolojisi (Queensland Üniversitesi özeti, 2023)', url: 'https://news.uq.edu.au/2023-09-20-manifesting-your-way-bankruptcy', type: 'research',
    finding: '1.023 katılımcılı üç çalışma. Katılımcıların yaklaşık üçte biri manifestasyon inançlarını benimsiyordu. İnananlar kendi başarılarını daha güçlü algılıyor ve daha yüksek hedefler koyuyordu; ama aynı zamanda riskli yatırımlara daha yatkındı, iflas yaşamış olma ihtimalleri daha yüksekti ve çabuk zengin olmaya dair gerçekçi olmayan beklentileri daha sık taşıyordu. Araştırmacılar manifestasyonun işe yaradığına dair nesnel bir kanıt bulamadı.',
    limitation: 'Nedeni değil, ilişkiyi gösteren anket araştırması. Makalenin kendisi değil, üniversitenin haber özeti okundu; bu yüzden ölçümlerin ayrıntıları kontrol edilmedi.' },
  { id: 'manifest-murphy', title: 'Joseph Murphy · The Power of Your Subconscious Mind (1963; Tarcher baskısı 2008)', url: 'https://www.penguinrandomhouse.com/books/296695/the-power-of-your-subconscious-mind-by-joseph-murphy-phd-dd/', type: 'technique',
    finding: 'Murphy, uykudan hemen önceki uyuşuk halin telkine en açık an olduğunu öğretir. Bir dileği kısa bir cümleye indirmeyi, onu ninni gibi sakince tekrarlamayı, sonuç şu an gerçekleşiyormuş gibi kısa bir sahneyi (örneğin bir arkadaşının seni tebrik etmesini) gözünde canlandırmayı ve sahneyi bir şükran duygusuyla bitirmeyi önerir. Yayıncı, kitabın temel fikrini çekincesiz inanmak ve sonucu öyle canlandırmak olarak tanımlıyor ki içsel engeller düşsün.',
    limitation: 'Yayıncının sayfası okundu. Uykudan önce yapılan prova ve net bir niyet hazırlanmana yardım edebilir. Kitabın, bilinçaltının zenginlik, başarı ya da bedensel iyileşme getirdiği yönündeki iddiaları araştırmayla desteklenmiyor; kimse bu yüzden tıbbi tedavisini değiştirmemeli.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'manifest-1': {
    deeper: [
      { heading: 'Neyin sağlam, neyin değil olduğu', paragraphs: [
        'Manifest kitapları ve videoları genellikle birbirinden çok farklı iki şeyi karıştırır. Biri sıradan ve yararlı alışkanlıklardır: ne istediğine net karar vermek, onu gözünde canlandırmak, gözünün önünde tutmak ve harekete geçmek. Diğeri ise dünyanın nasıl işlediğine dair bir hikâyedir; çoğu zaman “çekim yasası” denir: benzer benzeri çeker, düşüncelerin bir sinyal yayar, evren olayları bu sinyale uyacak şekilde düzenler ve kimi zaman kuantum fiziği bunların hepsini kanıtlar.',
        'İlk kısmı tutup ikincisini kenara koyabilirsin; işe yarayan hiçbir şeyi kaybetmezsin. Fizikçiler dünyayı böyle anlatmaz ve hiçbir çalışma, para, partner ya da iş hakkında düşünmenin onu kendiliğinden getirdiğini göstermedi. Alışkanlıklar ise sınanmış yöntemlerle örtüşür: net hedefler, zihinsel prova, engel için plan yapmak ve ilerlemeyi takip etmek. Bu kurs bunların üzerine kurulu.',
      ],
        visual: { kind: 'compare', title: 'İşe yarayan çekirdek ve kenara koyulacak iddialar',
          left: { label: 'Tut: işe yarayan çekirdek', items: ['Net ve belirli bir niyet', 'Adımları zihninde prova etmek', 'Engeli görüp ona plan yapmak', 'Harekete geçmek, sonra dürüstçe gözden geçirmek'] },
          right: { label: 'Kenara koy: kanıtı yok', items: ['Düşünceleri olayları çeken bir mıknatıs saymak', '“Evren” odaklandığın şeyi getirir', 'Kuantum fiziğinin gerçekliğini yeniden şekillendirmesi', 'Bir aksiliği olumsuz düşünmenin kanıtı saymak'] },
          note: 'Sağ sütunu kenara koymak umudu bırakmak demek değildir. Umudunun bir planı olsun demektir.' } },
      { heading: 'Manifestasyon inançları üzerine araştırma ne buldu', paragraphs: [
        'Queensland Üniversitesi’nden araştırmacılar manifestasyona inanan insanları inceledi. 1.023 katılımcılı üç çalışmada, katılımcıların yaklaşık üçte biri manifestasyon inançlarını benimsiyordu. Bu inananlar kendilerini daha başarılı hissediyor ve daha yükseğe hedefliyordu; bu kulağa cesaret verici geliyor. Ama aynı zamanda riskli yatırımlara daha yatkındılar, iflas yaşamış olma ihtimalleri daha yüksekti ve hızlı zenginlik beklentisi taşıma ihtimalleri de. Araştırmacılar manifestasyonun işe yaradığına dair nesnel bir kanıt bulamadı.',
        'Bunlar anketlerdi; yani bir bağlantıyı gösterir, nedeni değil. Yine de örüntü kursun geri kalanıyla uyumlu. Sorun dilek değil. Risk, güçlü bir kesinlik hissinin gerçekleri kontrol etmenin, tavsiye almanın ve küçük, sınanabilir adımlar atmanın yerini almasıyla başlıyor. Davranış hedefi seni gerçeklikle temasta tutar.',
      ] },
    ],
    example: { title: 'Daniel, 31, depo vardiya amiri', text: 'Daniel lojistik planlama işine geçmek istiyordu. Aylardır telefonunun duvar kâğıdında bir ofis masası vardı ve doğru işin kendisini bulacağını söylüyordu. Pazar günü alıştırmayı denedi. Dilek: “bir planlama işi.” Davranış: “Perşembeye kadar özgeçmişimin ilk üç satırını, zaten hazırladığım vardiya çizelgelerinden söz edecek şekilde yeniden yaz.” Bunu çarşamba akşamı yemekten sonra yaklaşık yirmi dakikada yaptı. Bir satır hâlâ tuhaf duruyordu ve o hafta kimse aramadı. Ama artık gönderebileceği bir sayfası vardı ve sonraki adım, karşılaştırmak için iki iş ilanı bulmak, gayet açıktı. Duvar kâğıdı yerinde kaldı; sadece artık ona bağlı bir görev vardı.' },
    sources: ['manifest-belief-study'],
  },
  'manifest-2': {
    deeper: [
      { heading: 'Zihinsel prova üzerine araştırma ne diyor', paragraphs: [
        '2021’de yayımlanan bir meta-analiz, zihinsel simülasyon, yani gelecekteki bir eylemi ya da olayı bilerek gözünde canlandırma üzerine 94 randomize çalışmayı bir araya getirdi. Genel olarak, sonraki davranışı orta düzeyde değiştirdi. Canlandırmanın türü önemliydi. Eylemi yaparken, özellikle iyi yaparken kendini görmek en iyi sonucu verdi. Yalnızca istenen sonucu canlandırmanın etkisi küçüktü. Yalnızca süreç adımlarını canlandırmak güvenilir değildi, ancak bu tahmin yalnızca beş etkiye dayanıyor; sonucu süreçle birleştiren sekiz çalışma ise daha büyük bir etki gösterdi.',
        'Beceri ve spor alanındaki zihinsel pratiği inceleyen ayrı bir derleme küçük ama gerçek bir fayda buldu ve fiziksel pratiğin tek başına zihinsel pratikten üstün olduğunu gösterdi. Yani dürüst özet şu: işi yaparken kendini görmek küçük ile orta arası yardım eder; işi yapmak daha çok yardım eder.',
      ],
        visual: { kind: 'bars', title: 'Zihinsel simülasyon ve sonraki davranış (ortalama etki, Hedges g)',
          bars: [
            { label: 'Kendini iyi performans gösterirken prova etmek', value: 0.67, display: 'g = 0,67' },
            { label: 'Standart performans provası', value: 0.48, display: 'g = 0,48' },
            { label: 'İstenen sonucu canlandırmak', value: 0.23, display: 'g = 0,23' },
            { label: 'Yalnızca süreç adımlarını canlandırmak (5 etki)', value: 0.17, display: 'g = 0,17' },
          ],
          note: 'Cole ve ark. (2021), 94 randomize çalışma. Yaklaşık 0,2 küçük, 0,5 orta sayılır. Katılımcıların çoğu öğrenciydi, bazı türler az sayıda çalışmaya dayanıyor ve yalnızca süreç tahmini istatistiksel olarak güvenilir değildi.',
          sourceId: 'identity-cole' } },
      { heading: 'Joseph Murphy ve Dr. Joe Dispenza bunu nasıl yapıyor', paragraphs: [
        'İki tanınmış öğretmen yöntemlerini prova üzerine kuruyor. Joseph Murphy, The Power of Your Subconscious Mind kitabında uykudan önceki uyuşuk dakikaları öneriyor: dileğini kısa bir cümleye indir, sakince tekrarla, sonuç zaten gerçekleşiyormuş gibi kısa bir sahne canlandır ve bir şükran duygusuyla bitir. Dr. Joe Dispenza ise Breaking the Habit of Being Yourself kitabında, yeni benliğinin nasıl düşündüğünü, davrandığını ve hissettiğini ayrıntılı biçimde prova ettiğin bir sabah meditasyonu kullanıyor.',
        'İkisinde de yararlı bir çekirdek var ve ikisi de kanıtın çok ötesine geçiyor. Murphy bilinçaltının zenginlik ve şifa getirebileceğini yazıyor; Dispenza uygulamasını bir kuantum alanına ve genlerini değiştirmeye bağlıyor. Provayı tutup gerisini nazikçe bırakabilirsin.',
      ],
        visual: { kind: 'table', title: 'İki prova yöntemi, dürüstçe ayrıştırılmış', columns: ['Öğretmen', 'Ne yapıyorsun', 'Tut', 'Kenara koy'],
          rows: [
            ['Joseph Murphy', 'Uykudan önce kısa bir cümle ve tamamlanmış bir sahne', 'Sakin, net bir niyet; bir sahneyi prova etmek', 'Bilinçaltının para ya da şifa çekmesi'],
            ['Dr. Joe Dispenza', 'Yeni benliği prova eden sabah meditasyonu', 'Nasıl davranıp yanıt vereceğini prova etmek', 'Kuantum alanı ve gen değiştirme iddiaları'],
            ['Bu kurs', 'Önce sonuç, sonra ilk somut hareket', 'Adımı yaparken kendini görmek', 'Resmi eylemin yerine koymak'],
          ],
          note: 'Her yöntemin bir özeti; tam anlatımı değil. İkisi de bir bütün olarak kontrollü denemelerde sınanmadı.' } },
    ],
    example: { title: 'Priya, 27, çocuk hemşiresi', text: 'Priya bir uzmanlık eğitim programına başvurmak istiyordu ve yeni rozetini taktığı günü sık sık gözünde canlandırıyordu. Bu iyi geliyordu ama hiçbir şeyi değiştirmiyordu. Bir gece yatakta farklı bir sahne denedi. Rozetten sonra, yarın sabahı canlandırdı: kahvaltıdan sonra mutfak masası, açık dizüstü, ekranda başvuru portalı, “kişisel yazı” kutusu. Giriş şifresini bilmediğini ve yazının bir ilk cümleye ihtiyacı olduğunu fark etti. Sabah şifresini yeniledi, çocuk hemşireliğini neden seçtiğine dair kaba bir cümle yazdı ve on dakika sonra dizüstünü kapattı. Rozet hâlâ aylarca uzaktaydı. Ama başvuru nihayet başlamıştı.' },
    sources: ['manifest-murphy', 'identity-cole', 'identity-toth', 'identity-dispenza-habit'],
  },
  'manifest-3': {
    deeper: [
      { heading: 'Hoş bir hayal seni neden yorabilir', paragraphs: [
        'Oettingen’in ekibinin daha önceki araştırması, gelecek hakkında kendiliğinden pembe hayallere dalan insanların daha az başarı gösterme eğiliminde olduğunu bulmuştu. Nedenini sınamak için Heather Barry Kappes ve Gabriele Oettingen, insanlardan idealleştirilmiş bir gelecek hayal etmelerini istedikleri dört deney yaptı. O geleceği sorgulayan hayallerle, olumsuz ya da nötr hayallerle karşılaştırıldığında, olumlu hayaller insanları hem bedende hem davranışta ölçülen daha düşük bir enerjiyle bıraktı. İhtiyaç daha acil hissedildiğinde düşüş daha büyüktü.',
        'Bunu anlamanın bir yolu şu: idealleştirilmiş bir resim, yolculuk olmadan varışın tadına bakmana izin verir; beden de iş bitmiş gibi gevşer. Bu, hayal kurmanın kötü olduğu anlamına gelmez. Hayalin bir varış noktasından çok bir başlangıç noktası olarak daha iyi çalıştığı anlamına gelir.',
      ],
        visual: { kind: 'cycle', title: 'Hayal döngüsü', center: 'Yalnızca hayal',
          nodes: [
            { label: 'İdealleştirilmiş resim', text: 'Bitmiş sonucu, hiç engel olmadan hayal edersin.' },
            { label: 'Varmış gibi hissettirir', text: 'Zihin, sanki zaten gerçekmiş gibi tadını çıkarır.' },
            { label: 'Enerji düşer', text: 'Harekete geçme aciliyeti azalır; beden gevşer.' },
            { label: 'Az eylem', text: 'Gün somut bir adım atılmadan geçer.' },
            { label: 'Dilek hâlâ uzakta', text: 'Aradaki boşluk acı verir, sen de hayale dönersin.' },
          ],
          note: 'Kappes & Oettingen (2011) çalışmasına dayanan sadeleştirilmiş bir resim. Döngüden çıkışın yolu hayal kurmayı bırakmak değil, engeli ve bir planı eklemektir.' } },
      { heading: 'Önce hayal et, sonra bak: WOOP nasıl çalışır', paragraphs: [
        'Oettingen zihinsel karşılaştırmayı WOOP adlı dört adımlı bir yönteme dönüştürdü: Wish (Dilek), Outcome (Sonuç), Obstacle (Engel), Plan. Hoş kısımla başlarsın: dileğini adlandırır ve en iyi sonucu hayal edersin; ancak ondan sonra içindeki asıl engele dönersin; bu bir alışkanlık, bir duygu ya da bir inanç olabilir. Son adım olan plan, bir sonraki derste geliyor.',
        '15.907 katılımcılı 21 çalışmanın 2021 tarihli bir meta-analizi, zihinsel karşılaştırmanın eğer/o zaman planlarıyla birleştiğinde hedefe ulaşmada küçük–orta düzeyde ortalama bir etki gösterdiğini buldu. Bu gerçek bir etki, ama garanti değil. WOOP, sana uymadığında da yararlı bilgi verir: engele dürüstçe baktığında dilek artık gerçekçi gelmiyorsa, bu onu yeniden şekillendirme işaretidir, başarısızlık değil.',
      ] },
    ],
    example: { title: 'Lena, 38, ortaokul öğretmeni', text: 'Lena veri becerileri üzerine bir çevrim içi kursu bitirmek istiyordu. Her zamanki hayali sertifika ve ilçe milli eğitim müdürlüğünde yeni bir görevdi. Bu kez WOOP’u kullandı. Dilek: bu ay üçüncü modülü bitirmek. Sonuç: işte tablolarda kendini yetkin hissetmek. Sonra engel. Dürüst olanı tembellik değildi: kâğıtları okuyup iki çocuğunu yatırdıktan sonra saat 21.30 oluyordu, bitkindi ve telefonuna uzanıyordu. Bunun bir kısmı değiştiremeyeceği bir dış koşuldu. Bu yüzden planı değiştirdi: eşi çocukları parka götürürken cumartesi sabahları kırk beş dakika. İlk cumartesi bir ders bitirdi; umduğundan azdı ama önceki üç haftada yaptığından fazlaydı.' },
    sources: ['oettingen-woop-method', 'manifest-positive-fantasies'],
  },
  'manifest-4': {
    deeper: [
      { heading: 'Eğer/o zaman planları neden işe yarar', paragraphs: [
        'Psikologlar bu planlara uygulama niyetleri der. Peter Gollwitzer ve Paschal Sheeran 94 bağımsız testi bir araya getirdi ve ne zaman, nerede, nasıl davranacağını önceden söyleyen planların hedefe ulaşmada orta ile büyük arası bir ortalama etkisi olduğunu buldu. Yayın yanlılığını düzelten daha yeni analizler gerçek etkiyi daha düşük bulabilir, ama yön tutarlı.',
        'Olası neden basit. Bir durumu bir yanıta önceden bağladığında durumun kendisi hatırlatıcı olur. Artık anın içinde, yorgunken ya da huzursuzken ve en kolay seçenek kaydırmakken karar vermen gerekmez. Plan, kararı senin yerine çoktan vermiştir.',
      ],
        visual: { kind: 'compare', title: 'Belirsiz niyetler ve kullanılabilir planlar',
          left: { label: 'Belirsiz', items: ['Bu hafta üzerinde çalışırım.', 'Daha disiplinli olmaya çalışırım.', 'Ne olursa olsun pozitif kalırım.'] },
          right: { label: 'Eğer/o zaman', items: ['Salı akşamı saat 8 olursa, mutfak masasında dosyayı açarım.', 'Telefonuma uzanırsam, onu 15 dakikalığına öbür odaya bırakırım.', 'Cesaretim kırılırsa, işe yarayan bir şeyi yazarım.'] },
          note: 'İyi bir “eğer”, fark edeceğin bir şeydir; iyi bir “o zaman”, kötü bir günde bile yapabileceğin kadar küçüktür.' } },
      { heading: 'Sık yapılan hatalar', paragraphs: [
        'En yaygını belirsiz bir işarettir: “vaktim olursa” nadiren gelir. Planı saate, yere ya da öğle yemeğini bitirmek gibi zaten bildiğin bir ana bağla. İkincisi fazla büyük bir yanıttır: “o zaman bütün bölümü yazarım” aynı kaçınmayı davet eder. Üçüncüsü aynı anda çok fazla plan yapmaktır. Gerçekten kullandığın bir iki plan, bir sayfa kuraldan iyidir.',
        'Bir plan işlemezse bunu bir bilgi olarak gör, hakkındaki bir hüküm olarak değil. Belki işaret gizliydi ya da eylem hâlâ fazla büyüktü. Bir parçayı ayarla ve yeniden dene.',
      ] },
    ],
    example: { title: 'Tomás, 35, serbest grafik tasarımcı', text: 'Tomás bir yıldır bir portfolyo sitesini “manifest ediyordu”. Siteyi net görebiliyordu, ama site oluşturucuyu her açtığında boş sayfa onu e-postaya geçirtiyordu. Bu yüzden ekranının yanına yapışkan bir nota iki plan yazdı. “Oluşturucuyu açıp tıkanırsam, yalnızca sayfa başlığını ve iki projenin adını yazacağım.” Ve: “Salı sabahı saat 9 olup başlamamışsam, on dakikalık bir zamanlayıcı kuracağım.” Salı günü ikinci plan 9.05’te devreye girdi. Başlığı ve üç projenin adını yazdı, on iki dakika sonra durdu. Henüz bir site değildi, ama ilk kez zihnindeki bir resimden fazlasıydı.' },
    sources: ['if-then-plans'],
  },
  'manifest-5': {
    deeper: [
      { heading: 'Neyi takip etmeli ve yazmak neden yardımcı olur', paragraphs: [
        'Yaklaşık 20.000 kişiyle yapılan 138 deneyin bir meta-analizi, insanların ilerlemesini izlemesini sağlayan müdahalelerin hedefe ulaşmalarına küçük–orta düzeyde bir ortalama etkiyle yardım ettiğini buldu. İlerleme kâğıtta ya da bir uygulamada fiziksel olarak kaydedildiğinde ve bir başkasına bildirildiğinde fayda daha büyüktü. Notlarını paylaşmak zorunda değilsin, ama yazılı kısa bir satır, işlerin nasıl gittiğine dair belirsiz bir hisse göre daha iyi işliyor gibi görünüyor.',
        'Çoğunlukla kontrol ettiğin şeyi takip et: adımı yaptın mı, ne zaman, hangi koşullarda? Sonuç da önemli, ama sonuçlar çoğu zaman emeğin gerisinden gelir ve başkalarına bağlıdır. Yalnızca sonucu takip edersen, davranışın istikrarlı olsa bile yavaş geçen bir ay başarısızlık gibi görünebilir.',
      ],
        visual: { kind: 'cycle', title: 'Gözden geçirme döngüsü', center: 'Gözden geçirme günü',
          nodes: [
            { label: 'Dene', text: 'Planladığın küçük adımı at.' },
            { label: 'Kaydet', text: 'Bir satır yaz: ne yaptın, ne zaman, hangi koşullarda.' },
            { label: 'Bak', text: 'Gözden geçirme gününde notları birlikte oku.' },
            { label: 'Öğren', text: 'Ne yardımcı oldu? Ne engel oldu?' },
            { label: 'Yeniden seç', text: 'Sürdür, küçült, destek al ya da hedefi değiştir.' },
          ],
          note: 'Döngü, işlemeyenler dahil her denemeyi bir sonrakine bilgiye çevirir.' } },
      { heading: 'Sonuç gelmediğinde', paragraphs: [
        'Popüler manifest anlayışının burada gizli bir bedeli var. Düşünceler gerçekliği yaratıyorsa, gelmeyen bir sonuç düşüncelerinin yanlış olduğu anlamına gelmeli; o zaman tek çare daha çok inanmak. Bu, insanları yerinde tutabilir ve bazen riskli bahislere iter. Manifestasyona güçlü biçimde inananlar üzerine anket araştırması tam da bu bağı riskli yatırımlar ve iflasla buldu, ama nedeni gösteremez.',
        'Daha nazik ve daha yararlı bir soru şu: kendi denemelerimden gelen kanıt ne söylüyor? Bazen yanıt sürdürmektir, çünkü emek ve sonuç şimdilik birbirine uymuyor. Bazen planı değiştirmek, yardım istemek ya da bir hedefi bırakmaktır. Her biri meşru bir seçim.',
      ],
        visual: { kind: 'table', title: 'Gözden geçirmeni okumak', columns: ['Ne görüyorsun', 'Makul bir sonraki seçim'],
          rows: [
            ['Adımları attın; sonuç yavaş', 'Sürdür ve sonraki gözden geçirme tarihini koy'],
            ['Adımı nadiren attın', 'Küçült ya da “eğer” işaretini değiştir'],
            ['Bir dış koşul seni sürekli engelledi', 'Zamanlamayı değiştir ya da destek iste'],
            ['Hedef artık senin için önemli değil', 'Bırak ya da yeni bir dilek seç'],
          ],
          note: 'Bu seçeneklerin hiçbiri başarısızlık değildir; her biri gerçekte olana dayanan bir karardır.' } },
    ],
    example: { title: 'Aisha, 45, küçük bir ev pastanesi işletiyor', text: 'Aisha çeyrek sonuna kadar haftalık on düzenli sipariş istiyordu. Altı hafta boyunca her pazartesi fotoğraf paylaştı ve iki yerel kafede numune dağıttı; her seferinde bir defterde tek satır yazdı. Gözden geçirme gününde notları okudu. Dokuz paylaşımı, altı numune günü ve on değil, dört düzenli siparişi vardı. Yeterince inanmadığına karar vermek yerine daha yakından baktı. Dört düzenli müşterinin üçü, müşterilerle yüz yüze konuştuğu aynı kafeden gelmişti. Bu yüzden ayda iki paylaşımı bırakıp o zamanı ikinci bir kafeye ayırmayı seçti. Hedef tarihi bir ay ileri kaydı ve bu, bir yenilgi gibi değil bir karar gibi hissettirdi.' },
    sources: ['manifest-belief-study'],
  },
};
