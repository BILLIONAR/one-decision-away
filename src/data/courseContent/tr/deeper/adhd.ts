import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/adhd.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'adhd-cbt-meta', title: 'Young, Moghaddam & Tickle · 2020 · Yetişkin ADHD için BDT meta-analizi', url: 'https://journals.sagepub.com/doi/abs/10.1177/1087054716664413', type: 'research', finding: 'Dokuz randomize çalışma bulundu, sekizi birleştirildi. Bekleme listesi kontrolleriyle karşılaştırıldığında (4 çalışma, 160 kişi) BDT, ADHD belirtilerini orta ile büyük arası bir etkiyle azalttı (SMD = 0,76). Aktif kontrol gruplarıyla karşılaştırıldığında (3 çalışma, 191 kişi) etki küçük ile orta arasındaydı (SMD = 0,43).', limitation: 'Çalışma sayısı az ve örneklemler mütevazı; bu yüzden sonuçlar geçicidir. Bunlar terapist eşliğinde yürütülen programlardır, kendi kendine okuma değildir. Yalnızca özet okundu.' },
  { id: 'adhd-cbt-program', title: 'Sprich, Knouse, Cooper-Vince, Burbridge & Safren · Yetişkinlerde ADHD için BDT: tanım ve gösterim (Cognitive and Behavioral Practice)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3874265', type: 'guidance', finding: 'Modüler BDT programını anlatır: her gün bakılan tek bir takvim ve tek bir görev listesi, öncelik puanları, problem çözme ve işleri yönetilebilir adımlara bölme; bir “dikkat dağınıklığını erteleme” yöntemi (ölçülen dikkat süren kadar çalış, dikkat dağıtanları not al, zamanlayıcı bitince onlarla ilgilen); dikkat dağıtıcılardan arınmış, malzemelerin elinin altında olduğu bir çalışma alanı; hem aşırı olumsuz hem aşırı iyimser düşünceleri ele alan uyumlu düşünme.', limitation: 'Programı geliştirenlerin, terapistler için yazdığı klinik bir tanımdır; her tekniği ayrı ayrı sınamaz. PubMed Central’daki tam metin okundu.' },
  { id: 'adhd-safren-workbook', title: 'Steven A. Safren, Susan E. Sprich, Carol A. Perlman & Michael W. Otto · Mastering Your Adult ADHD, Client Workbook (2. baskı, 2017)', url: 'https://global.oup.com/academic/product/mastering-your-adult-adhd-9780190235567', type: 'technique', finding: 'İlaçtan sonra da beceri desteğine ihtiyaç duyan yetişkinler için BDT programının danışan çalışma kitabı: düzenleme ve planlama (randevu ve görev sistemleri, problem çözme), dikkat dağınıklığını azaltma (dikkat süresini değerlendirme, çevreyi değiştirme), uyumlu düşünme; ayrıca erteleme ve nüksü önleme için isteğe bağlı modüller.', limitation: 'Çalışma kitabı bir terapistle birlikte kullanılmak üzere tasarlanmıştır. Yayıncının tanıtımı okundu; teknikler burada ODA’nın kendi sözleriyle yeniden anlatılıyor.' },
  { id: 'adhd-barkley', title: 'Russell A. Barkley · ADHD’de yürütücü işlevlerin ve öz düzenlemenin önemli rolü (bilgi formu)', url: 'https://www.russellbarkley.org/factsheets/ADHD_EF_and_SR.pdf', type: 'technique', finding: 'Barkley, ADHD’yi esas olarak bilgi değil performans bozukluğu olarak tanımlar: insanlar çoğu zaman ne yapacaklarını bilir ama yapmakta zorlanır. “Performans noktasında” (sorunun yaşandığı yer ve an) yardım almayı, bilgiyi orada fiziksel ve görünür kılmayı, uzun projeleri hızlı geri bildirimli günlük adımlara bölmeyi, ödül ve hesap verebilirlik gibi dış motivasyon eklemeyi önerir.', limitation: 'Bir klinisyenin kuramsal bilgi formudur, deneme değildir; önerilen ipuçları tek tek sınanmamıştır. Çocukları ve okulları da kapsar; buradaki yetişkin uygulamaları ODA’nın uyarlamasıdır.' },
  { id: 'adhd-body-doubling', title: 'Eagle, Baltaxe-Admony & Ringland · 2024 · Nörofarklı katılımcılarla eşlikçi çalışma (ACM TACCESS)', url: 'https://leyabreanna.com/papers/body_double_taccess.pdf', type: 'research', finding: '220 kişiyle (193’ü nörofarklı, çoğu ADHD’li) yapılan çevrim içi anket. %75’i eşlikçi çalışma (body doubling) kullandığını söyledi: bir işe başlarken veya yaparken odada, çevrim içi ya da medya aracılığıyla biri yanında bulunuyor; çoğunlukla arkadaş, aile veya iş arkadaşlarıyla ve çoğunlukla ev işleri, ödev ve iş görevleri için. İnsanlar bunu işe başlamak, odakta kalmak, daha az kaygılanmak ve motivasyon bulmak için kullandı.', limitation: 'Kendi isteğiyle katılanların çevrim içi deneyim anketidir, kontrollü bir deneme değildir: insanların eşlikçi çalışmayı nasıl kullandığını gösterir, ne kadar işe yaradığını değil. Katılımcılar çoğunlukla ABD/AB kökenli ve kendini kadın olarak tanımlayan kişilerdir.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'adhd-1': {
    deeper: [
      { heading: 'Neden işe yarar: hatırlatıcıyı işin yapıldığı yere koy',
        paragraphs: [
          'Barkley’nin temel fikri “performans noktası”dır: harekete geçmen gereken yer ve an. Yalnızca zihninde tutulan hatırlatıcılar o anda zayıf kalır; bu yüzden bilgiyi tam orada fiziksel ve görünür kılmayı önerir. Buzdolabındaki bir liste, dizüstü bilgisayarın kapağındaki bir not ya da net bir etiketi olan bir alarm hatırlama işini üstlenir; çalışma belleğin bunu yapmak zorunda kalmaz.',
          'Hedefin daha iyi bir hafıza değil de tek bir liste olmasının nedeni budur. Listenin güzel olması gerekmez. İhtiyacın olduğunda gözünün önünde olması gerekir.',
        ],
        visual: { kind: 'compare', title: 'Zihninde tutmak ya da dünyada tutmak',
          left: { label: 'Zihninde tutulan', items: ['Gece 2’de hatırlanır, öğleden sonra 2’de unutulur', 'Aklından geçen her şeyle yarışır', 'Tam ihtiyacın olduğunda görünmez'] },
          right: { label: 'Dünyada tutulan', items: ['Baktığın tek bir yere yazılır', 'İşin yapıldığı yere konur', 'Dikkatini işin kendisine bırakır'] },
          note: 'Barkley’nin performans noktası fikrine dayanır: bilgiyi çevrene taşı.' } },
      { heading: 'BDT programı bunu nasıl yapıyor?',
        paragraphs: [
          'Steven Safren ve arkadaşlarının geliştirdiği programda ilk seanslar iki araç kurar: tarihi veya saati olan her şey için tek bir takvim, geri kalan her şey için tek bir görev listesi; ikisine de her gün bakılır. Görevlere basit bir öncelik puanı verilir, büyük işler yönetilebilir adımlara bölünür.',
          'Programdan akılda tutmaya değer bir nokta var: listene bakmak, üzerindeki her şeyi hemen yapmak zorunda olduğun anlamına gelmez. Liste sana seçeneklerini net gösterir. Ondan kaçınmak, görevleri sürprize çevirir; bu da bir listenin yaratabileceğinden daha stresli gelir.',
        ],
        visual: { kind: 'table', title: 'İki araç, iki iş',
          columns: ['Araç', 'Oraya ne girer', 'Ne zaman bakarsın'],
          rows: [
            ['Takvim', 'Randevular, son tarihler, saati olan her şey', 'Günde bir kez, sabit bir anda'],
            ['Görev listesi', 'Yapman gereken diğer her şey', 'Aynı günlük anda'],
            ['Başka hiçbir yer', 'Yapışkan notlar ve dağınık hatırlatıcılar buraya taşınır', 'Birini bulduğunda'],
          ],
          note: 'Yetişkin ADHD için BDT programının düzenleme modülünden uyarlanmıştır. Programın tamamı bir terapistle yürütülür.' } },
    ],
    example: { title: 'Elif, 34, diş hekimi yardımcısı',
      text: 'Elif işlerini dört yerde tutuyordu: iki uygulama, bir defter ve elinin tersi. Pazar akşamı birini seçti: telefonunun ana ekranındaki sade bir not. Beş şeyi oraya taşıdı: araç muayenesini yenilemek, ev sahibini aramak, kız kardeşine doğum günü kartı almak, kütüphane kitabını iade etmek, göz muayenesi için randevu almak. Göz muayenesi ve ev sahibiyle görüşme saatleriyle birlikte takvimine girdi. Her sabah kahvesi demlenirken nota göz atmaya karar verdi. Pazartesi yalnızca doğum günü kartını halledebildi. Sorun değildi; diğer dört iş zihninde uçuşmak yerine salı günü de yerindeydi. Cumaya kadar üçü tamamlandı ve not bütün bir hafta ayakta kaldı; bu, onun için bir ilkti.' },
  },
  'adhd-2': {
    deeper: [
      { heading: 'Küçük adımlar neden yardımcı olur?',
        paragraphs: [
          'Barkley, ADHD’nin uzak geleceği silik, tam önündekini ise gürültülü hissettirdiğine dikkat çeker. Bir ay sonra teslim edilecek bir proje, acil olana kadar neredeyse hiç hissedilmez. Önerisi, uzun işleri kısa adımlara bölmek ve her birine hızlı geri bildirim eklemektir; böylece ilerleme bir gün değil bugün görünür olur.',
          'Yetişkin ADHD için BDT programı aynı hamleyi başka bir açıdan öğretir: bunaltıcı gelen işler yönetilebilir adımlara bölünür ve her adım kendi başına listeye girer.',
        ],
        visual: { kind: 'steps', title: 'Belirsizden görünene',
          steps: [
            { label: 'Adını koy', text: 'İşi genelde düşündüğün gibi yaz: “vergileri hallet.”' },
            { label: 'Sor', text: 'Elim ilk ne yapardı?' },
            { label: 'Fiil + nesne', text: '“Vergi klasörünü aç ve geçen yılın beyannamesini bul.”' },
            { label: 'Küçült', text: 'Hâlâ takılıyor musun? Daha da küçült: “Klasörü raftan indir.”' },
          ],
          note: 'Bir ilk hareket, bir dakika içinde başlayabileceğin kadar küçükse yeterince küçüktür.' } },
      { heading: 'Başlangıcı bilerek daha çekici yap',
        paragraphs: [
          'Barkley ayrıca hatırlatıcıların tek başına çoğu zaman yetmediğini savunur; çünkü uzak bir ödülün çekim gücü zayıftır. Performans noktasına motivasyon eklemeyi önerir: adımın hemen ardından küçük bir ödül, senden haber bekleyen biri ya da bir başkasıyla paylaştığın bir son tarih.',
          'Kendi versiyonlarını deneyebilirsin: yalnızca evrak işleri için açtığın sevdiğin bir çalma listesi, ilk e-posta gittikten sonra bir kahve ya da başladığında iki kelimelik bir mesaj aldığı bir arkadaş. Bunları kanıtlanmış yöntemler olarak değil, kişisel denemeler olarak gör ve sana işe yarayanları tut.',
        ] },
      { heading: 'Sık yapılan hatalar',
        paragraphs: [
          'En sık yapılanı, bir adımı kısaltıp netleştirmemektir. “Rapor üzerinde biraz çalış” hâlâ belirsizdir; “raporu aç ve son paragrafı oku” değildir. Bir diğeri, adımı sayılmayacak kadar küçük bulup yargılamaktır. Gerçekten yapılan küçük bir başlangıç, yapılmayan büyük bir plandan iyidir.',
        ] },
    ],
    example: { title: 'Murat, 41, depo sorumlusu',
      text: 'Üç haftadır “sigorta hasar dosyasını hallet” listesinin en üstünde duruyordu ve Murat sürekli atlıyordu. Perşembe günü ona bakıp elinin ilk ne yapacağını sordu. Cevap neredeyse komikti: sigorta şirketinden gelen e-postayı bulmak. Görevi “gelen kutusunda ‘hasar numarası’ diye ara ve e-postayı yıldızla” diye yeniden yazdı. Kırk saniye sürdü. E-posta zaten açıktı, formu indirdi. Orada durdu ve bu iyi hissettirdi. Cuma günü bir sonraki hareket netti: birinci sayfayı doldurmak. Kardeşine “dosyaya başladım” yazdı; gelen başparmak emojisi şaşırtıcı derecede iyi bir ödül oldu. Dosya bir sonraki salı gönderildi.' },
  },
  'adhd-3': {
    deeper: [
      { heading: 'Zaman neden elden kayıp gider?',
        paragraphs: [
          'Barkley, ADHD’de bir tür “zaman miyopluğu”ndan söz eder: davranışı çoğunlukla şu an olanlar yönlendirir, henüz uzakta olan sonuçlar daha az. Gelecek cumanın son tarihi, perşembe gecesine kadar gerçek gelmez. Bu bir karakter kusuru değil; etrafından dolanarak tasarlayabileceğin bir örüntüdür.',
          'Tasarım cevabı zamanı yakınlaştırmaktır. Onu fiziksel, görünür ve işin yakınında yap; uzun boşlukları hızlı geri bildirimli kısa aralıklara böl. Görünür bir geri sayım “sonra”yı “sekiz dakika sonra”ya çevirir.',
        ],
        visual: { kind: 'table', title: 'Zamanı görünür kılmanın yolları',
          columns: ['Araç', 'Ne yapar', 'Ne zaman dene'],
          rows: [
            ['Görüş alanındaki saat', 'Telefona bakmadan zamanı gözünün önünde tutar', 'Öğleden sonrayı kaçırdığında'],
            ['Görünür geri sayım sayacı', 'Azalan zamanı bir şekil veya sayı olarak gösterir', 'İşlere geç başladığında ya da süreyi aştığında'],
            ['Etiketli alarm', 'Eylemin adını söyler: “Şimdi çocuğu almaya çık”', 'Geçişleri kaçırdığında'],
            ['Tahmin ve kontrol kaydı', 'Tahminini gerçek süreyle karşılaştırır', 'Planların hep fazla dolu olduğunda'],
          ],
          note: 'Zamanı dışsallaştırmanın pratik uygulamaları. Hiçbir aracın en iyisi olduğu kanıtlanmamıştır; sana işe yarayanı tut.' } },
      { heading: 'Beceri programları hakkında araştırma ne diyor?',
        paragraphs: [
          'Planlama ve zaman becerilerini de içeren, yetişkin ADHD için yapılandırılmış BDT randomize çalışmalarda sınanmıştır. 2020 tarihli bir meta-analiz, bekleme listeleriyle karşılaştırıldığında belirtiler üzerinde orta ile büyük arası, aktif kontrol gruplarıyla karşılaştırıldığında ise küçük ile orta arası bir etki buldu.',
          'Bu programlar eğitimli terapistler tarafından birkaç hafta boyunca yürütülür. Bunun gibi kısa bir kurs becerileri tanıtabilir ama aynı şey değildir ve kendisi sınanmamıştır.',
        ],
        visual: { kind: 'bars', title: 'Yetişkin ADHD için BDT: belirtiler üzerindeki ortalama etki',
          bars: [
            { label: 'bekleme listesine karşı (4 çalışma)', value: 0.76, display: 'SMD 0,76' },
            { label: 'aktif kontrole karşı (3 çalışma)', value: 0.43, display: 'SMD 0,43' },
          ],
          note: 'Young, Moghaddam & Tickle 2020: çalışma sayısı az, örneklemler mütevazı. Terapist eşliğinde programlar, kendi kendine okuma değil; bu kurs sınanmadı.',
          sourceId: 'adhd-cbt-meta' } },
    ],
    example: { title: 'Ayşe, 27, yüksek lisans öğrencisi',
      text: 'Ayşe, danışmanının e-postasını yanıtlamanın “iki dakika” süreceğini sanıyordu; bu yüzden sürekli sıkıştırırım diye erteliyordu. Çarşamba günü tahminini bir yapışkan nota yazdı — 5 dakika — ve gözünün önünde duran bir telefon sayacı başlattı. Sayaç çaldığında işin ancak yarısındaydı. Gerçek toplam 17 dakika çıktı. Üzülmedi; işe yaradı. Sonraki turu bir makale bölümünü okumaktı: 20 dakika tahmin etti, 26 sürdü. Cumaya gelince bir örüntü fark etti — tahminleri yaklaşık üçte bir kısaydı — ve takvimine bu payı eklemeye başladı. Öğleden sonraları daha az telaşlı geçmeye başladı; daha hızlı çalıştığı için değil, planları sonunda saate uyduğu için.' },
  },
  'adhd-4': {
    deeper: [
      { heading: '“Dikkat dağınıklığını erteleme” nasıl çalışır?',
        paragraphs: [
          'Yetişkin ADHD için BDT programı, dikkat dağınıklığını erteleme adında bir teknik içerir. Önce, çekici olmayan bir işte zihnin dağılmadan önce genelde ne kadar kalabildiğini öğrenirsin. Sonra yanında bir not defteriyle, yaklaşık o uzunlukta bölümler hâlinde çalışırsın. Bir dikkat dağıtıcı geldiğinde, ona göre davranmak yerine yazarsın. Zamanlayıcı bittiğinde notlara bakar, gerekiyorsa neyin yapılması gerektiğine karar verirsin.',
          'Bunu katlanılır kılan şey nottur. Düşünceyi görmezden gelmiyorsun; ona bir randevu veriyorsun.',
        ],
        visual: { kind: 'cycle', title: 'Dikkat dağınıklığını erteleme döngüsü', center: 'Bir çalışma bölümü',
          nodes: [
            { label: 'Çalış', text: 'Olağan dikkat süren kadar uzun bir bölüm başlat.' },
            { label: 'Düşünce belirir', text: 'Başka bir şey dikkatini istiyor.' },
            { label: 'Yaz', text: '“Sonra” kâğıdına birkaç kelime.' },
            { label: 'Geri dön', text: 'Kaldığın yeri bul ve bir hareket daha yap.' },
            { label: 'Zamanlayıcı biter', text: 'Kâğıda bak ve neyin yapılması gerektiğine karar ver.' },
          ],
          note: 'Yetişkin ADHD için BDT programının dikkat dağınıklığı modülünden uyarlanmıştır.' } },
      { heading: 'Eşlikçi çalışma: birinin yanında çalışmak',
        paragraphs: [
          'ADHD’li pek çok kişi “eşlikçi çalışma”yı (body doubling) anlatır: bir işe başlarken ya da yaparken yanında birinin bulunması — odada, görüntülü görüşmede ya da hatta bir “benimle çalış” videosunda. 220 kişinin (çoğu ADHD’li) katıldığı 2024 tarihli bir ankette her dört kişiden üçü bunu kullandığını söyledi; başlıca ev işleri, ödev ve iş görevleri için, işe başlamak, odakta kalmak ve daha az kaygılanmak amacıyla.',
          'Bu anket deneyimleri anlatır; eşlikçi çalışmanın herkes için işe yaradığını kanıtlamaz. Yine de denemesi kolaydır. Bir arkadaşından 25 dakika yanında e-postalarını yanıtlamasını iste ya da sakin bir çevrim içi ortak çalışma odasına katıl.',
        ] },
      { heading: 'Çevrendeki alanı şekillendir',
        paragraphs: [
          'Aynı program çevreyi de değiştirir: alışıldık dikkat dağıtıcılardan uzak bir çalışma noktası, ihtiyacın olan malzemelerin elinin altında olması, telefonun gözden uzakta durması ve planlı molalar. Önceden kaldırdığın her dikkat dağıtıcı, o anda direnmek zorunda kalmayacağın bir dikkat dağıtıcıdır.',
        ] },
    ],
    example: { title: 'Cem, 38, serbest grafik tasarımcı',
      text: 'Cem bir faturayı bitirmek için oturdu ve bir dakika içinde diş hekimini, bir müşterinin yazı tipi sorusunu ve bulaşık makinesini hatırladı. Normalde her düşünce bir sapağa dönüşürdü. Bu kez klavyenin yanında “Sonra” yazan bir fiş kâğıdı ve 12 dakikalık bir sayaç vardı; idari işlerde genelde bu kadar dayanırdı. “Diş hekimi”, “yazı tipi sorusu”, “bulaşık makinesi” diye birer iki kelime yazdı ve parmağını kaldığı fatura satırına geri koydu. Sayaç çaldığında fatura bitmişti. Kâğıda baktı: yazı tipi sorusunun yanıta ihtiyacı vardı, diğer ikisi akşama kalabilirdi. Ertesi gün aynı şeyi görüntülü görüşmede bir arkadaşıyla, ikisi de sessizce çalışarak denedi. Beklediğinden çok daha fazla yardımı oldu.' },
  },
  'adhd-5': {
    deeper: [
      { heading: 'Kendini değil, aracı sorunla',
        paragraphs: [
          'Yetişkin ADHD için BDT programı iki düşünce tuzağına özellikle dikkat eder. Biri aşırı olumsuzdur: “Bunu asla beceremeyeceğim, neden uğraşayım.” Diğeri aşırı iyimserdir: “Bugün on işi birden yapacağım”; gün bittiğinde hayal kırıklığı ve öz eleştiri gelir. İkisi de listeden tamamen kaçınmaya yol açabilir.',
          'Programın yanıtı, bu düşünceleri yakalayıp yerine gerçekte olanlara dayanan gerçekçi düşünceler koymaktır. Aracını gözden geçirmek de tam olarak budur: kendin hakkındaki bir hükmü, sistem hakkında bir soruya çevirir.',
        ],
        visual: { kind: 'compare', title: 'İki düşünce tuzağı ve gerçekçi bir yanıt',
          left: { label: 'Tuzak', items: ['“Listelerde umutsuz vakayım.” (fazla olumsuz)', '“Bugün on işin hepsini bitireceğim.” (fazla iyimser)', '“Bir kez tutmadı, demek ki işe yaramıyor.”'] },
          right: { label: 'Gerçekçi yanıt', items: ['“Liste gözden uzaktaydı; onu buzdolabına asacağım.”', '“İkisini seçeceğim ve günün nasıl gittiğine bakacağım.”', '“Bir şeyi değiştirip üç kez daha deneyeceğim.”'] },
          note: 'Yetişkin ADHD için BDT programının uyumlu düşünme modülünden uyarlanmıştır.' } },
      { heading: 'Ne zaman ve nasıl profesyonel yardım alınır?',
        paragraphs: [
          'ABD Ulusal Ruh Sağlığı Enstitüsü’ne (NIMH) göre ADHD tanısını bir sağlık uzmanı koyar; yetişkinlerde bu, belirtilerin çocuklukta başlayıp başlamadığına bakmayı da içerir. Yetişkinler için en yaygın tedaviler ilaç, genellikle uyarıcılar, ile davranışçı veya bilişsel davranışçı terapidir. Bazı yetişkinler ayrıca bir ADHD koçuyla çalışır ya da işte makul uyarlamalar ister.',
          'Randevu almak için kusursuz bir hikâyeye ihtiyacın yok. Birkaç somut örnek, şimdiye kadar denediklerin ve sorularınla git. İlaç kullanıyorsan onu asla kendi başına bırakma ya da değiştirme; reçete eden doktorunla konuş.',
        ],
        visual: { kind: 'steps', title: 'Randevuya hazırlanmak',
          steps: [
            { label: 'Örnekler', text: 'Dikkat veya düzen yüzünden gerçek sorun yaşadığın üç yakın durumu yaz.' },
            { label: 'Nerede ve ne zaman', text: 'İşte mi, evde mi, ilişkilerde mi oluyor — ve ne zamandan beri; not al.' },
            { label: 'Ne denedin', text: 'Bu kurstaki araçları ve neyin işe yarayıp yaramadığını listele.' },
            { label: 'Sorular', text: 'Değerlendirme ve tedavi seçenekleriyle ilgili sorularını götür.' },
          ],
          note: 'Hazırlık görüşmeye yardımcı olur; değerlendirmenin kendisini bir uzman yapar.' } },
    ],
    example: { title: 'Hülya, 45, okul müdür yardımcısı',
      text: 'Hülya’nın listesi iki hafta işe yaradı, sonra sessizce bir posta yığınının altında kayboldu. İlk düşüncesi “Ben hep sistemleri bozarım” oldu. Meseleye öbür yönden bakmayı denedi: tam olarak ne ters gitti? Liste masasındaydı ama sabahları mutfakta başlıyordu. Bir şeyi değiştirdi — kahve makinesinin yanına bir beyaz tahta — ve sonraki üç denemede onu sürdürdü. Tuttu. Aynı zamanda güçlüklerinin listelerin çok ötesine geçtiğini kabul etti: kaçan faturalar, yarım kalan projeler, bir ömür “yeterince çabalamıyorsun” sözü. Üç somut örnek yazdı ve doktoruna götürdü. Hızlı bir yanıt beklemiyordu ama ilk kez sorunu doğru biçimde anlattığını hissetti.' },
    sources: ['adhd-cbt-program'],
  },
};
// Ders başına ek kaynak kimlikleri (Türkçe dersin kendi listesinde olmayanlar).
EXTRAS['adhd-1'].sources = ['adhd-barkley', 'adhd-cbt-program', 'adhd-safren-workbook'];
EXTRAS['adhd-2'].sources = ['adhd-cbt-program', 'adhd-barkley'];
EXTRAS['adhd-3'].sources = ['adhd-barkley', 'adhd-cbt-meta'];
EXTRAS['adhd-4'].sources = ['adhd-cbt-program', 'adhd-safren-workbook', 'adhd-body-doubling'];
