import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/meditation.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'meditation-mind-wandering-cycle', title: 'Hasenkamp ve ark. · 2012 · Odaklı meditasyonda zihin dağılması ve dikkat (NeuroImage)', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1053811911007695', type: 'research', finding: 'Deneyimli on dört meditasyoncu fMRI tarayıcısında nefese odaklı meditasyon yaptı ve zihinlerinin dağıldığını fark ettikleri her an bir düğmeye basıp nefese döndü. Araştırmacılar dört aşamadan oluşan, kendini tekrarlayan bir döngü tarif etti: zihnin dağılması, dağıldığının farkına varma, dikkati geri kaydırma ve sürdürülen odak. Farklı beyin ağları farklı aşamalarda daha etkindi (zihin dağılırken varsayılan mod ağı, farkındalıkta belirginlik ağı, geri kaydırma ve odakta yürütücü bölgeler) ve bazı etkinlik örüntüleri ömür boyu meditasyon deneyimiyle ilişkiliydi.', limitation: '14 deneyimli meditasyoncuyla yapılmış küçük bir beyin görüntüleme çalışmasıdır; uygulama sırasında olanı betimler, sağlık yararı göstermez ve beyin farklarına uygulamanın yol açtığını kanıtlamaz. Yayıncı sayfasındaki özet okundu.' },
  { id: 'meditation-trauma-sensitive', title: 'David Treleaven · Travmaya duyarlı farkındalık (davidtreleaven.com)', url: 'https://davidtreleaven.com/', type: 'guidance', finding: 'Farkındalık öğretmenleri yetiştiren bir eğitmen olan Treleaven, farkındalığın istemeden travmatik stres belirtilerini harekete geçirebileceği ve travması olan kişilerin dikkati içe çeviren uygulamalar sırasında geçmişe dönüşler (flashback), düzensizleşme ya da ayrışma yaşayabileceği konusunda uyarır. Sitesi, öğretmenlerin ve uygulayıcıların bu tuzaklardan kaçınmasına yardım eden eğitim ve kaynaklar sunar.', limitation: 'Bir eğitmenin web sitesidir, bir çalışma değildir. Yalnızca ana sayfa okundu; belirli uyarlamalar sıralanmıyor, bu yüzden bu kurstaki öneriler (gözler açık, kısa oturuşlar, dışa dönük bir çıpa, eğitimli bir öğretmen) bu sayfadan çıkan bulgular değil, yaygın güvenlik uygulamalarıdır.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'meditation-1': {
    deeper: [
      { heading: 'Dağılmak neden uygulamanın parçası',
        paragraphs: [
          'Küçük bir beyin görüntüleme çalışması, bir oturuşun aslında nasıl göründüğüne dair işe yarar bir resim veriyor. Deneyimli on dört meditasyoncu nefese odaklandı ve zihinlerinin kaydığını fark ettikleri her an bir düğmeye bastı. Araştırmacılar durmadan tekrarlanan bir döngü tarif etti: zihin dağılır, bunu fark edersin, dikkati geri kaydırırsın ve o yine dağılana kadar bir süre nefesle kalırsın.',
          'Deneyimli meditasyoncular bile bu döngüde defalarca döndü. Huzursuz bir günde bunu hatırlamaya değer. Dağılmalarla dolu bir oturuş başarısız bir oturuş değildir; en önemli iki hamlenin, yani fark etmenin ve geri dönmenin, çok kez tekrarlandığı bir oturuştur. Çalışma küçüktü ve sağlık etkilerini göstermiyor, ama döngünün kendisi çoğu insanın yaşadığıyla örtüşüyor.',
        ],
        visual: { kind: 'cycle', title: 'Her oturuşun içindeki döngü', center: 'Çıpa olarak nefes',
          nodes: [
            { label: 'Dağıl', text: 'Dikkat bir plana, bir anıya ya da bir endişeye kayar.' },
            { label: 'Fark et', text: 'Artık nefesle olmadığını anlarsın.' },
            { label: 'Geri dön', text: 'Kendini azarlamadan dikkatini nazikçe geri kaydırırsın.' },
            { label: 'Kal', text: 'Yeniden dağılana kadar birkaç an nefesle dinlenirsin.' },
          ],
          note: 'Hasenkamp ve ark. (2012) tarafından 14 deneyimli meditasyoncuda tarif edilen dört aşamaya dayanır. Döngü olağandır; fark etmek ve geri dönmek eğitimin kendisidir.' } },
      { heading: 'Sık yapılan hatalar',
        paragraphs: [
          'En sık yapılan hata nefesi kontrol etmeye çalışmaktır: daha derin, daha yavaş ya da daha “doğru” yapmak. Bu alıştırmada yalnızca izlersin. İzlemek nefesini yapay hissettiriyorsa dikkatini daha nötr gelen bir yere taşı; örneğin havanın burun deliklerindeki hissine ya da karnın kalkışına.',
          'İkinci hata, her geri dönüşü küçük bir azara çevirmektir. “Düşünce” gibi sessiz bir zihinsel not ve nazik bir dönüş, sinirlenmekten daha iyi işler. Beş dakikayla başlamak yeterli; tekrar ettiğin kısa bir oturuş, ürktüğün uzun bir oturuştan iyidir.',
        ] },
    ],
    example: { title: 'Leyla, 31, eczacı',
      text: 'Leyla sabah vardiyasından önce beş dakikalık bir zamanlayıcı kurdu ve ayakları düz basarak mutfak sandalyesine oturdu. Çıpa olarak karnının inip kalkışını seçti. İlk dakika içinde zihninde sevkiyat programını yeniden düzenliyordu. Fark etti, içinden “düşünce” dedi ve karnına döndü. Sonra cevaplaması gereken bir mesaj. Sonra bir şarkı. Sonunda kaç kez döndüğünün sayısını kaybetmişti ve zihninin bu kadar meşgul olmasına biraz sinirlenmişti. Otobüste dersteki döngüyü hatırladı: dağıl, fark et, geri dön, kal. Az önce alıştırmayı düzinelerce kez yapmıştı. Ertesi sabah yine oturdu, biraz daha az sinirli; sinirlenmenin kendisi fark edilecek bir şey daha oldu.' },
    sources: ['meditation-mind-wandering-cycle'],
  },
  'meditation-2': {
    deeper: [
      { heading: 'Tarama nasıl ilerler',
        paragraphs: [
          'Basit bir güzergâh, taramanın bir tahmin oyununa dönüşmesini önler. Duyumların genelde kolay bulunduğu bir yerden, örneğin ayak tabanlarından başla ve yavaşça yukarı çık. Her bölgede birkaç nefes kal, orada ne olduğunu fark et, sonra bir nefes verişte bırakıp ilerle.',
          'Bedenin her santimini gezmen gerekmiyor. Gerçek dikkatle yapılmış beş altı bölgelik kısa bir tarama, bütün bedenin aceleyle gezilmesinden iyidir.',
        ],
        visual: { kind: 'steps', title: 'Kısa bir beden taraması güzergâhı',
          steps: [
            { label: 'Ayaklar', text: 'Parmaklar, tabanlar, topuklar: basınç, sıcaklık, zeminle ya da yatakla temas.' },
            { label: 'Bacaklar', text: 'Baldırlar, dizler, uyluklar: ağırlık, gerginlik ya da özel bir şey yok.' },
            { label: 'Gövde', text: 'Karın ve sırt: nefesin hareketi, yüzeyle temas.' },
            { label: 'Kollar ve eller', text: 'Parmaklar, avuç içleri, ön kollar: karıncalanma, sıcaklık, durgunluk.' },
            { label: 'Omuzlar ve yüz', text: 'Boyun, çene, gözler, alın: sonra bütün beden tek bir bütün olarak.' },
          ],
          note: 'MBSR beden taramasına dayanan sadeleştirilmiş bir güzergâh. Ağrılı ya da rahatsız edici gelen bir bölgeyi atla ya da hafifçe geç.' } },
      { heading: 'Bedenin zor bir yer olduğunda',
        paragraphs: [
          'Bazı insanlar için, özellikle travma geçmişi ya da kronik ağrısı olanlar için, bedene uzun süre yakından dikkat etmek sakinlik yerine sıkıntı getirebilir. Travma eğitmenleri, içe dönük uygulamanın bazen geçmişe dönüşleri ya da kopukluk hissini tetikleyebileceği konusunda uyarır.',
          'Kontrol sende kalır. Gözlerini açık tutabilir, uzanmak yerine oturabilir, taramayı birkaç dakikaya kısaltabilir ya da yalnızca ellerini ve ayaklarını tarayabilirsin. Yine de fazla geliyorsa, odadaki sesler gibi dışa dönük bir çıpa seç ve eğitimli bir öğretmenle öğrenmeyi düşün.',
        ] },
    ],
    example: { title: 'Tolga, 46, kurye',
      text: 'Tolga uzun bir vardiyanın ardından yatağında uzanarak beden taramasını denedi ve dizlerine varmadan uyuyakaldı. Ertesi akşam bunun yerine bir koltukta, gözleri yarı açık oturdu ve sekiz dakikalık bir zamanlayıcı kurdu. Ayakları sıcak ve ağır hissediyordu. Baldırları pek bir şey hissettirmiyordu ve bunun doğru mu yanlış mı olduğuna karar verme dürtüsünü fark etti. Sadece adını koydu: burada belirgin bir duyum yok. Belinin altına geldiğinde tanıdık ağrı oradaydı. Düzeltmeye çalışmadı; iki nefes kaldı ve ilerledi. Sonunda telefonuna üç kelime yazdı: ağır, ağrı, sıcak. Derin bir gevşeme değildi. Ama haftalardır ilk kez bedeni şikâyet etmeden önce onu fark etmişti.' },
    sources: ['meditation-trauma-sensitive'],
  },
  'meditation-3': {
    deeper: [
      { heading: 'Pasif tutum neden önemli',
        paragraphs: [
          'Birçok insan meditasyonu iyi yapılması gereken bir görev daha yapar. Düşüncelerle savaşır, ilerlemesini yoklar ve gevşemediği için gerilir. Benson’un yöntemi bu baskıyı bilerek ortadan kaldırır. Kelime, zihne tutunacak basit bir şey verir; pasif tutum ise bir düşüncenin çözülecek bir sorun değil, yalnızca geri dönme işareti olduğu anlamına gelir.',
          'Bu, nefes alıştırmasındaki hamlenin aynısı, sadece çıpa farklı. Bazı insanlar kelimeyi nefesten daha kolay bulur, çünkü izlediği bir şey değil, yaptığı bir şeydir. Bazıları ise fazla mekanik bulur. İkisi de olur; aradığın, sana uyan çıpa.',
        ],
        visual: { kind: 'compare', title: 'Çaba mı, rahatlık mı?',
          left: { label: 'Zorlamak', items: ['Düşünceleri itmek', 'Artık gevşedim mi diye yoklamak', 'Dikkatim dağılınca kelimeyi daha hızlı tekrarlamak'] },
          right: { label: 'Pasif tutum', items: ['Düşüncelerin gelip geçmesine izin vermek', 'Oturuşa not vermemek', 'Kelimeye aynı rahat hızla dönmek'] },
          note: 'Benson yöntemindeki pasif tutumun, Harvard Health özetinde anlatıldığı şekliyle bizim özetimiz.' } },
      { heading: 'Kelimeni seçmek',
        paragraphs: [
          'İyi bir kelime kısadır, bir nefes verişte içinden söylemesi kolaydır ve senin için hoş ya da nötrdür. İnancından gelebilir, örneğin kısa bir dua ya da bir zikir sözü olabilir; “sakin”, “burada” ya da “bir” gibi gündelik bir kelime de olabilir. Benson yöntemi ikisiyle de aynı şekilde işler.',
          'Aynı kelimeyi en az bir hafta tutmaya çalış. Her gün değiştirmek, uygulamayı mükemmel kelimeyi arama işine çevirir; bu da zorlamanın bir başka biçimidir.',
        ] },
    ],
    example: { title: 'Mehmet, 58, emekli öğretmen',
      text: 'Mehmet nefesini izlemenin kendini huzursuz ettiğini fark etti ve öğleden sonra çayının ardından Benson yöntemini denedi. Dualarından, çocukluğundan beri bildiği kısa bir zikir sözü seçti. Koltuğuna oturdu, kaslarını ayaklarından yüzüne doğru gevşetti ve her nefes verişte sözü içinden söyledi. Torununun sınavıyla ilgili düşünceler gelip durdu. Her seferinde kendi kendine “önemli değil” deyip aynı yavaş hızla söze döndü. On dakika sonra kalkmadan önce bir dakika daha sessizce oturdu. Değişmiş gibi hissetmedi. Ama on bir dakikadır telefonuna bakmadığını fark etti; bu yeniydi. Haftanın geri kalanında aynı sözü ve aynı koltuğu sürdürmeye karar verdi.' },
    sources: [],
  },
  'meditation-4': {
    deeper: [
      { heading: 'Gündelik hayatta',
        paragraphs: [
          'Özel bir yola ihtiyacın yok. Çoğu insan yürüyüş meditasyonunu zaten yaptığı yürüyüşlere bağlamayı en kolay bulur: durağa giden son kısım, iş yerindeki bir koridor, arabadan ön kapıya yürüyüş. Bilinçli adımlarla geçen bir dakika bile sayılır.',
          'Yavaş yürüyüş en iyi sakin ve güvenli bir yerde işler. Kalabalık sokaklarda normal hızında yürü ve gözlerin çevrende olacak şekilde yalnızca ayaklarını ve yüzündeki havayı hisset.',
        ],
        visual: { kind: 'table', title: 'Nerede ve nasıl bilinçli yürünür', columns: ['Yer', 'Hız', 'Çıpa'],
          rows: [
            ['Evde koridor ya da oda', 'Çok yavaş', 'Her ayağın kalkışı, ilerleyişi, yere basışı'],
            ['Park ya da sakin bir yol', 'Yavaş', 'Nefese uydurulmuş adımlar'],
            ['İşe ya da durağa yürüyüş', 'Normal', 'Ayaklar ve çevrendeki sesler, gözler açık'],
          ],
          note: 'Plum Village rehberliğine dayanan kendi önerilerimiz. Trafikte, merdivenlerde ve kalabalıkta önce güvenlik gelir.' } },
      { heading: 'Hareket eden bir çıpa neden yardımcı olabilir',
        paragraphs: [
          'Gözleri kapalı oturmakta huzursuz, uykulu ya da tedirgin hisseden insanlar için yürüyüş, kafanın dışında ve bulması kolay bir çıpa sunar: ayağın tabanının yere değmesi. Gözlerin açık kalır ve bedenin bir şey yapar.',
          'Bu, yürüyüş meditasyonunu oturmanın imkânsız geldiği günler için iyi bir seçenek ve içe dönük uygulamayı rahatsız edici bulan herkes için daha yumuşak bir giriş yapar.',
        ] },
    ],
    example: { title: 'Ada, 27, hemşire',
      text: 'Gece vardiyalarından sonra Ada oturamayacak kadar gergin oluyordu; bu yüzden hastanenin yanındaki küçük parkta yürüyüş meditasyonunu denedi. Yaklaşık on beş adımlık sakin bir patika seçti. Başta nefes alırken iki, verirken üç adım sayıyordu ve beceriksiz hissettirdi; bu yüzden ikiye iki olarak oturmasına izin verdi. Zihni zor geçen bir hasta devrini tekrar tekrar oynatıyordu. Fark ettiği her seferde dikkatini topuğunun çakıla değdiği ana geri getirdi. Son iki dakika saymayı bıraktı ve dinledi: frenleyen bir otobüs, serçeler, ağaçlarda rüzgâr. Toplam yedi dakika sürdü. Yine yorgun eve gitti, ama devir teslim artık tramvayda kafasında dönüp durmuyordu.' },
    sources: [],
  },
  'meditation-5': {
    deeper: [
      { heading: 'Araştırma ne diyor',
        paragraphs: [
          'Meta-analiz iki tür olumlu duyguya baktı: coşku ve neşe gibi enerjik olanlar ile hoşnutluk ve huzur gibi sakin olanlar. Sevgi-şefkat meditasyonu, bekleme listesi gruplarına kıyasla ikisini de benzer ve ılımlı bir miktarda artırdı.',
          'Bunlar cesaret verici ama sınırlı sonuçlar. Çalışmaların çoğu uygulamayı hiçbir şey yapmamayla karşılaştırdı, birçoğunda yanlılık riski yüksekti ve bir şefkat meditasyonu çalışmasına katılan insanlar zaten daha iyi hissedeceklerini bekliyor olabilir. Adil özet: olumlu duygularda küçük–orta bir yükselme; bir kişilik dönüşümü değil.',
        ],
        visual: { kind: 'bars', title: 'Sevgi-şefkat meditasyonu ve günlük olumlu duygular',
          bars: [
            { label: 'Yüksek uyarılmışlıklı olumlu duygular', value: 0.395, display: 'g = 0,395' },
            { label: 'Düşük uyarılmışlıklı olumlu duygular', value: 0.392, display: 'g = 0,392' },
          ],
          note: 'Zeng ve ark. (2015), 1.759 kişiyi kapsayan 24 çalışmanın meta-analizi: randomize çalışmalarda bekleme listesi kontrollerine karşı standart etki büyüklükleri. Çalışmaların %38,9’unda yanlılık riski yüksekti.',
          sourceId: 'meditation-lovingkindness' } },
      { heading: 'Sık yapılan hatalar',
        paragraphs: [
          'İlk hata sıcaklığı zorlamaya çalışmaktır. Cümleleri niyetle tekrarlamak uygulamanın kendisidir; duygu daha sonra ya da başka bir gün gelebilir. İkincisi, en zor kişiyle başlamaktır. Zor birini denemeden önce haftalarca kendine, sevdiğin birine ve nötr bir kişiye çalışmak gayet uygun.',
          'Üçüncüsü, iyi dilekleri teslim olmakla karıştırmaktır. Birine acıdan kurtulmasını dilemek, yaptığını mazur görmek, barışmak ya da sınırlarını indirmek demek değildir. Kendine dilek göndermek acı veriyorsa sevdiğin biriyle başla ve kendine daha sonra dön.',
        ] },
    ],
    example: { title: 'Zeynep, 38, grafik tasarımcı',
      text: 'Zeynep sevgi-şefkatin duygusal göründüğünü düşünüyordu, ama bir müşteriyle geçen gergin bir haftanın ardından denedi. E-postasını açmadan önce masasında sessizce şunu söyledi: güvende olayım, rahat olayım, kendime karşı nazik olayım. Tebrik kartı okumak gibi geldi. Yine de sürdürdü, sonra aynı dilekleri kız kardeşine, sonra adını bilmediği köşedeki bakkalın sahibine gönderdi. Neredeyse hiçbir şey hissetmedi ve derse göre bu gayet iyiydi. Zor müşteriyi atladı; hazır değildi. O günün ilerleyen saatlerinde müşteri bir sert mesaj daha yolladı. Zeynep, cevabının hâlâ net olmakla birlikte alışılandan biraz daha az keskin çıktığını fark etti. Küçük bir değişiklikti ve ertesi sabah tekrar denemeye karar verdi.' },
    sources: [],
  },
  'meditation-6': {
    deeper: [
      { heading: 'İşleyen çekirdek ve bir kenara bırakılacak iddialar',
        paragraphs: [
          'Dispenza’nın meditasyonu pratik unsurları büyük iddialarla karıştırıyor ve bunları nazikçe ayırmak işe yarıyor. İşleyen çekirdeğin üç parçası var. Dikkat: eski örüntüyü olduktan sonra değil, olurken yakalamak. Prova: yeni tepkiyi belirli bir sahnede zihninde baştan sona yaşamak. Duygu: provanın sakinlik ya da özgüven gibi bir duyguyu taşımasına izin vermek; bu onu daha canlı ve akılda kalıcı yapar.',
          'Bu parçalar, araştırmanın alışkanlıkları fark etme, zihinsel pratik ve planlama hakkında söylediğiyle örtüşüyor. Etraflarındaki iddialar, yani meditasyonun kuantum alanı aracılığıyla gerçekliği yeniden şekillendirdiği, genleri açıp kapattığı ya da hastalığı düşünceyle iyileştirdiği, bilimsel destek görmüyor. İddiaları kabul etmeden çekirdeği kullanabilirsin ve tedavini asla bu iddialar yüzünden değiştirmemelisin.',
        ],
        visual: { kind: 'compare', title: 'Dispenza’nın meditasyonu: neyi tutmalı, neyi bir kenara bırakmalı',
          left: { label: 'İşleyen çekirdek', items: ['Eski örüntüyü ve tetikleyicilerini fark etmek', 'Yeni bir tepkiyi belirli bir sahnede prova etmek', 'Prova sırasında yeni hâlin duygusunu hissetmek', 'Sonrasında gerçek hayatta küçük bir adım atmak'] },
          right: { label: 'Kanıtla desteklenmeyenler', items: ['Kuantum alanı aracılığıyla gerçekliği değiştirmek', 'Düşünerek genleri açıp kapatmak', 'Tedavi yerine düşünceyle hastalığı iyileştirmek'] },
          note: 'Kitabın anlatımına ve zihinsel pratik ile eğer–o zaman planları araştırmalarına dayanan kendi özetimiz.' } },
      { heading: 'Dispenza bunu nasıl yapıyor ve nasıl pratik hâle getirilir',
        paragraphs: [
          'Kitapta meditasyon dört hafta içinde, her seferinde bir aşama ekleyerek gelişir: bedene yerleşmek, eski hâli tanıyıp kabul etmek, onu bırakmak, devreye girdiği anları fark etmek ve yeni benliği prova etmek. Bu ders onu tek bir dokuz dakikalık oturuşa sıkıştırıyor; bu bir sadeleştirme.',
          'Zihinsel pratik araştırmaları ondan daha fazla verim almanın net bir yolunu gösteriyor: belirli, gerçekçi bir sahneyi prova et, sonra harekete geç. “Yöneticim işimi eleştirirse durup nefes verecek ve tek bir soru soracağım” gibi bir eğer–o zaman planı, provayı aynı gün gerçekten deneyebileceğin bir davranışa çevirir.',
        ] },
    ],
    example: { title: 'Kerem, 42, satış müdürü',
      text: 'Kerem, rakamlar geciktiğinde ekibine çıkışmayı bırakmak istiyordu. Dokuz dakikalık bir oturuşta önce eski örüntüyü ayrıntısıyla canlandırdı: gelen rapor, göğsündeki sıcaklık, kimsenin bunu ciddiye almadığı düşüncesi, kısa kesen mesaj. Bunu açıkça kabul etti ve onu yere bıraktığını hayal etti. Sonra pazartesi toplantısını olmak istediği yönetici olarak üç kez prova etti: duruyor, nefes veriyor, raporu neyin engellediğini soruyordu. Bunu canlandırırken kendine gergin değil, dingin hissetmesine izin verdi. Gözlerini açmadan önce tek bir plan yaptı: bir rapor gecikirse başka bir şey söylemeden önce tek bir soru soracağım. Pazartesi bir rapor gecikti. Sıcaklığı hissetti, planı hatırladı ve soruyu sordu. Toplantı biraz daha iyi geçti.' },
    sources: [],
  },
  'meditation-7': {
    deeper: [
      { heading: 'Düzenini kurmak',
        paragraphs: [
          'Bir düzen üç şeye dayanır: zaten sahip olduğun bir ipucu, kötü bir günde yönetebileceğin bir süre ve plan tutmadığında bir yedek. Bir eğer–o zaman planı bunları birbirine bağlar: “Sabah çayımı koyduysam, on dakika oturacağım.” Bu biçimdeki planlar, birçok çalışmada insanların niyetleri eyleme dönüştürmesine yardım etti.',
          'İlk haftayı sade tut. Bir teknik, bir zaman, bir yer. Haftanın sonunda neyin işe yaradığına bak ve baştan başlamak yerine süreyi ya da tekniği ayarla.',
        ],
        visual: { kind: 'steps', title: 'Bir haftalık başlangıç düzeni',
          steps: [
            { label: 'Bir ipucu seç', text: 'Çay koymak ya da arabayı park etmek gibi zaten her gün yaptığın bir şey.' },
            { label: 'Bir teknik seç', text: 'Nefes, beden taraması, kelime, yürüyüş, metta ya da prova.' },
            { label: 'Bir süre belirle', text: 'Normal günlerde on dakika, en az üç dakika.' },
            { label: 'Bir yedek yaz', text: '“Oturamazsam üç dakika bilinçli yürüyeceğim.”' },
            { label: 'Gözden geçir', text: 'Yedi gün sonra neyin yardımcı olduğunu not et ve bir şeyi ayarla.' },
          ],
          note: 'Sabit bağlamda alışkanlık ve eğer–o zaman planları araştırmalarına dayanan kendi şablonumuz.' } },
      { heading: 'Meditasyon bir şeyleri kıpırdattığında',
        paragraphs: [
          'Bazen sessiz bir oturuş zor duyguları, anıları ya da beden duyumlarını yüzeye çıkarır. Bu yanlış yaptığının işareti değildir ve zorlayarak sürdürmen gerektiğinin de işareti değildir. Travma eğitmenleri, dikkati içe çeviren uygulamaların, özellikle travması olan insanlarda zaman zaman geçmişe dönüşleri, güçlü düzensizleşmeyi ya da kopukluk hissini tetikleyebileceğini belirtir.',
          'Pratik uyarlamalar birçok insana yardımcı olur: gözlerini açık tut, oturuşları kısa tut, sesler ya da yere basan ayakların gibi dışa dönük bir çıpa seç ve ihtiyaç duyduğunda dur. Travma geçmişin varsa eğitimli bir öğretmenle ya da bir terapistin yanında öğrenmek mantıklı bir seçimdir. Bazı insanlar, bir oturuştan önce ya da sonra uzun bir nefes verişle birkaç yavaş nefesin yerleşmelerine yardım ettiğini görür.',
        ] },
    ],
    example: { title: 'Elif, 35, öğretmen',
      text: 'Elif tekniği olarak beden taramasını seçti ve onu işten sonra arabasını park ettiği ana bağladı. Dört gün iyi gitti. Beşinci gün, taramanın yarısında göğsündeki bir sıkışma yıllar önceki acı bir anıyı geri getirdi ve titrek hissetti. Dersi hatırladı: gözlerini açtı, ayaklarını arabanın zeminine bastırdı, dışarıdaki ağaçlara baktı ve birkaç uzun nefes verdi. O gün için durdu. Ertesi gün yazılı yedek planına, gözler açık üç dakikalık yürüyüş meditasyonuna geçti. Anı o hafta yine gelince bunu terapistine söyledi; terapist şimdilik oturuşları kısa ve gözleri açık tutmasını önerdi. Elif, durmanın da uygulamanın bir parçası olduğunu fark etti.' },
    sources: ['meditation-trauma-sensitive'],
  },
};
