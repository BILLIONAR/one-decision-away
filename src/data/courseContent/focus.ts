import type { CourseSource, GuidedCourse } from '../courses';

/**
 * Sources verified for the "Odak" course (research notes, 25 Sep 2026).
 * Not cited on purpose: Fitz et al. 2019 (notification batching; Ariely
 * co-author, data-integrity concerns) and any "multitasking costs X%" figure.
 * Ward 2017 appears only alongside its failed replication and the meta-analysis.
 * Mark et al. 2008 is used qualitatively (its table values were not re-checked).
 * Existing ids reused: 'mcii', 'monitoring'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'task-switching', title: 'Monsell · 2003 · Görev değiştirmenin bedeli', url: 'https://pubmed.ncbi.nlm.nih.gov/12639695/', type: 'research', finding: 'Bu derlemeye göre insanlar bir görevden ötekine geçtikten hemen sonra yavaşlıyor ve genellikle daha çok hata yapıyor; bu geçiş bedeli hazırlıkla azalıyor ama tamamen kaybolmuyor.', limitation: 'Yalnızca yayın özeti incelendi ve özette sayısal değer yok; laboratuvardaki basit görevlerden gelen kısa gecikmeler gerçek işteki kayıplara doğrudan çevrilemez.' },
  { id: 'interruptions', title: 'Mark, Gudith & Klocke · 2008 · Bölünen işin bedeli: hız ve stres', url: 'https://ics.uci.edu/~gmark/chi08-mark.pdf', type: 'research', finding: '48 kişilik laboratuvar deneyinde işi bölünen katılımcılar görevi biraz daha kısa sürede ve kaliteyi düşürmeden bitirdi, ama daha yüksek stres, hayal kırıklığı, zaman baskısı ve çaba bildirdi.', limitation: 'Çoğunluğu üniversite öğrencisi olan küçük bir örneklemde yapay bir e-posta yanıtlama görevi kullanıldı; sonuçlar gerçek iş yaşamına doğrudan aktarılamaz.' },
  { id: 'notifications', title: 'Kushlev, Proulx & Dunn · 2016 · Bildirimler ve dikkatsizlik deneyi', url: 'https://interruptions.net/literature/Kushlev-CHI16.pdf', type: 'research', finding: '221 üniversite öğrencisi bir hafta bildirimleri açık ve telefonu görünür, bir hafta bildirimleri kapalı ve telefonu uzakta tuttu; bildirimli haftada daha fazla dikkatsizlik (d=0,44) ve hareketlilik (d=0,45) bildirdi.', limitation: 'Ölçümler öz bildirime dayanıyor, katılımcılar hangi koşulda olduklarını biliyordu ve ham farklar yaklaşık 0,1 puan kadar küçüktü; yazarlar bunun klinik ADHD’ye yol açtığı anlamına gelmediğini vurguluyor.' },
  { id: 'phone-presence', title: 'Hartanto ve ark. · 2024 · Telefonun yalnızca yanında olması meta-analizi', url: 'https://assets.pubpub.org/mgkf17za/tmb_tmb0000123-41706626995650.pdf', type: 'research', finding: '33 çalışmayı ve 4.368 katılımcıyı birleştiren meta-analizde telefonun yalnızca yakında durmasının bilişsel performansa genel bir etkisi bulunmadı (d=−0,02) ve çalışma belleğinde görülen küçük etki yayın yanlılığı düzeltmesinden sonra kayboldu.', limitation: 'Laboratuvar görevlerine dayanır ve telefonu kullanmayı ya da bildirim almayı değil, yalnızca yakında durmasını inceler; yazarlar yayımlanmış çalışmalarda yayın yanlılığı işareti buldu.' },
  { id: 'brain-drain', title: 'Ward, Duke, Gneezy & Bos · 2017 · “Beyin boşalması” deneyi (tekrarlanamadı)', url: 'https://www.journals.uchicago.edu/doi/full/10.1086/691462', type: 'research', finding: 'İki deneyde (N=520 ve N=275) telefonu masada olanlar, telefonu başka odada olanlara göre çalışma belleği görevinde biraz daha düşük puan aldı ve etkiler küçüktü (kısmi η²=0,014–0,026).', limitation: 'Ön kayıtlı doğrudan tekrarında etki bulunmadı ve 33 çalışmalık meta-analiz genel bir etki göstermedi; bu bulgu tek başına kanıt olarak kullanılmamalı.' },
  { id: 'brain-drain-replication', title: 'Ruiz Pardo & Minda · 2022 · “Beyin boşalması” tekrar çalışması', url: 'https://www.sciencedirect.com/science/article/pii/S0001691822002323', type: 'research', finding: 'Ward ve arkadaşlarının ikinci deneyinin ön kayıtlı doğrudan tekrarında (N=383) telefonun konumu çalışma belleği performansını etkilemedi (p=0,91).', limitation: 'Örneklem genç üniversite öğrencilerinden oluşuyor ve çalışma tek bir laboratuvarda yapıldı.' },
  { id: 'microbreaks', title: 'Albulescu ve ark. · 2022 · Mikro molalar meta-analizi', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460', type: 'research', finding: '22 örneklemi (N=2.335) birleştiren meta-analizde en fazla 10 dakikalık mikro molalar zindeliği artırdı (d=0,36) ve yorgunluğu azalttı (d=0,35), genel performans üzerindeki etki ise anlamlı değildi (d=0,16).', limitation: 'Çalışma sayısı az, iyi oluş ölçümleri öz bildirime dayanıyor, performans için yayın yanlılığı işareti var ve zihinsel olarak yoğun işlerde molanın performansa etkisi görülmedi.' },
];

export const COURSE: GuidedCourse = {
  id: 'focus', title: 'Odak', subtitle: 'Dikkatin sınırlı; ona iyi bak.',
  description: 'Görev değiştirmenin bedelini gör, bildirimlerini düzenle, telefon hakkındaki iddiaları kanıtla karşılaştır, kısa molaları dene ve kendi odak planını kur.',
  scope: 'Gündelik çalışma düzeni için öneriler; dikkat bozukluğu tanısı veya tedavisi değildir. Dikkat güçlükleri kalıcıysa ve günlük yaşamını etkiliyorsa bir sağlık uzmanına danış. Acil durum, bakım veya iş için gereken aramaları sessize alma.',
  outcome: 'Düzenlenmiş bildirimler, denenmiş bir odak bloğu ve mola planı.',
  lessons: [
    { id: 'focus-1', title: 'Dikkat sınırlı, geçişin bir bedeli var', minutes: 7,
      goal: 'Gün içinde işler arasında ne sıklıkla geçtiğini ve bunun sana nasıl hissettirdiğini fark et.',
      reading: ['Bir işten ötekine geçtiğinde zihnin kısa bir “vites değiştirme” yapar. Laboratuvar çalışmalarını özetleyen bir derlemeye göre insanlar geçişten hemen sonra yavaşlıyor ve genellikle daha çok hata yapıyor. Hazırlık bu bedeli azaltıyor ama tamamen silmiyor.', 'Bölünmek her zaman yavaşlatmaz. Küçük bir deneyde işi bölünen kişiler görevi biraz daha hızlı bitirdi, ama daha fazla stres, hayal kırıklığı ve zaman baskısı bildirdi. Tek işte kalmanın faydası yalnızca verim değil, daha sakin çalışmak da olabilir. “Çoklu görev şu kadar verim kaybettirir” gibi popüler sayılara dayanmıyoruz.'],
      practice: ['Önümüzdeki bir saat boyunca başka bir işe veya uygulamaya her geçtiğinde bir çizgi çek.', 'Geçişlerin kaçının senin seçimin, kaçının bir bildirimden ya da başkasından geldiğini ayır.', 'Bir sonraki geçişten önce “Şimdi … işine geçiyorum” diye kısa bir hazırlık cümlesi dene.'],
      reflection: 'Geçişler sana en çok nasıl hissettirdi?', question: 'Bu derse göre bölünerek çalışmanın bedeli ne olabilir?', options: ['Her zaman işi çok daha yavaş bitirmek.', 'Bölünmenin hiçbir bedeli yoktur.', 'Hız korunsa bile daha fazla stres ve baskı hissetmek.'], correct: 2,
      feedback: 'Küçük bir deneyde bölünenler biraz hızlandı ama daha çok stres bildirdi. Bedel bazen zamanda değil, nasıl hissettiğinde görülür.', takeaway: 'Her geçiş küçük bir yük; gerekmeyenleri azaltabilirsin.', sources: ['task-switching', 'interruptions'],
      visual: { kind: 'compare', title: 'İki çalışma biçimi',
        left: { label: 'Sık bölünerek', items: ['Sık sık vites değiştirmek', 'Geçişten sonra kısa yavaşlama ve hata riski', 'Daha fazla stres ve zaman baskısı'] },
        right: { label: 'Tek işte kalarak', items: ['Daha az geçiş', 'Geçişe hazırlanmak için zaman', 'Daha sakin bir tempo olasılığı'] },
        note: 'Laboratuvar bulgularından çıkarılmış genel bir karşılaştırmadır; kesin bir kazanç veya kayıp sayısı vermez.' } },
    { id: 'focus-2', title: 'Bildirimler dikkatini nasıl çeker?', minutes: 7,
      goal: 'Bildirimlerini gözden geçir ve bir çalışma süresi için sessize al.',
      reading: ['Bir deneyde 221 üniversite öğrencisi bir hafta bildirimleri açık ve telefonu görünür tuttu, bir hafta da bildirimleri kapalı ve telefonu uzakta. Bildirimli haftada biraz daha fazla dikkatsizlik ve hareketlilik bildirdiler. Fark küçüktü ama ölçülebilirdi.', 'Bu, bildirimlerin bir dikkat bozukluğuna yol açtığı anlamına gelmez; yazarlar da bunu vurguluyor. Dürüst mesaj şu: sessize almak tek başına her şeyi çözmez ama maliyeti düşük bir adım. Önemli kişiler ve acil durumlar için istisna bırakabilirsin. Mesajlarına gün içinde birkaç sabit saatte bakmayı da deneyebilirsin.'],
      practice: ['Son bir saatte hangi uygulamaların sana bildirim gönderdiğine bak.', 'Beklemesi sorun olmayan en az iki uygulamanın bildirimini kapat veya sessize al.', 'Bir çalışma süresi için “Rahatsız Etme” modunu aç ve acil kişiler için istisna ekle.'],
      reflection: 'Hangi bildirimi kapatmak kolay geldi, hangisi zor?', question: 'Bu çalışmanın sonucu için en dürüst özet hangisi?', options: ['Bildirimleri azaltmak küçük ama ölçülebilir bir fark gösterdi.', 'Bildirimler ADHD’ye yol açar.', 'Bildirimleri kapatmak bütün dikkat sorunlarını çözer.'], correct: 0,
      feedback: 'Fark yaklaşık 0,1 puanlıktı ve öz bildirimle ölçüldü. Sessize almayı mucize beklemeden, maliyeti düşük bir deneme olarak düşünebilirsin.', takeaway: 'Sessize almak küçük bir adım; küçük adımlar da sayılır.', sources: ['notifications'],
      visual: { kind: 'bars', title: 'Dikkatsizlik ortalaması (öz bildirim)', sourceId: 'notifications',
        bars: [
          { label: 'Bildirimler açık, telefon görünür', value: 2.38, display: '2,38' },
          { label: 'Bildirimler kapalı, telefon uzakta', value: 2.27, display: '2,27' },
        ],
        note: '221 öğrenci, her koşulda birer hafta. Fark küçük (d=0,44), öz bildirime dayanıyor ve katılımcılar hangi haftada olduklarını biliyordu.' } },
    { id: 'focus-3', title: 'Masadaki telefon: iddia ve kanıt', minutes: 8,
      goal: 'Telefonun yalnızca yanında durmasıyla onu kullanmayı birbirinden ayır.',
      reading: ['“Telefon masada dursa bile zihnini boşaltır” iddiası çok paylaşıldı. Bunu ilk öne süren 2017 tarihli deneylerde küçük bir etki bulunmuştu. Ancak ön kayıtlı doğrudan tekrarında etki görülmedi. 33 çalışmayı birleştiren bir meta-analiz de telefonun yalnızca yakında durmasının bilişsel performansa genel bir etkisini bulmadı.', 'Bu, telefonun dikkati hiç etkilemediği anlamına gelmez. İncelenen şey telefonun yalnızca orada durmasıydı; onu kullanmak ve bildirim almak ayrı konular. Telefonu başka odaya koymak sana yine de iyi gelebilir; nedeni muhtemelen eline alma isteğini azaltmasıdır. Bu bir çıkarım, sınanmış bir bulgu değil.'],
      practice: ['Çalışırken telefonu genelde nerede tuttuğunu ve kaç kez eline aldığını fark et.', 'Bir çalışma süresi için telefonu uzanamayacağın bir yere koy ve eline alma isteği geldiğinde not et.', 'Başka bir gün telefonu masada ama sessiz tutarak dene; iki günü kendi gözleminle karşılaştır.'],
      reflection: 'Seni asıl zorlayan telefonun orada olması mı, onu eline alma isteği mi?', question: 'Güncel kanıtlar telefonun yalnızca masada durması hakkında ne söylüyor?', options: ['Zihni kesin olarak boşaltır.', 'Genel bir etkisi bulunmadı; kullanmak ve bildirimler ayrı bir konu.', 'Telefonu başka odaya koymanın hiçbir anlamı yoktur.'], correct: 1,
      feedback: 'Tek bir ilk çalışma yerine tekrar çalışmalarına ve meta-analize bakmak daha güvenilir bir tablo verir. Bilimde ilk bulgular her zaman tekrarlanmaz. Telefonu uzakta tutmak yine de kişisel bir deneme olarak işine yarayabilir.', takeaway: 'Telefonun orada olmasından çok, ona ne sıklıkla uzandığın önemli olabilir.', sources: ['phone-presence', 'brain-drain', 'brain-drain-replication', 'notifications'],
      visual: { kind: 'table', title: '“Telefon masada” iddiasının izi', columns: ['Çalışma', 'Tür', 'Sonuç'],
        rows: [
          ['Ward ve ark. 2017', 'İlk deneyler (N=520 ve 275)', 'Küçük etki'],
          ['Ruiz Pardo & Minda 2022', 'Ön kayıtlı doğrudan tekrar (N=383)', 'Etki yok'],
          ['Hartanto ve ark. 2024', 'Meta-analiz, 33 çalışma (N=4.368)', 'Genel etki yok (d=−0,02)'],
        ],
        note: 'Tek bir çalışma değil, zaman içinde biriken kanıt daha güvenilir bir tablo verir.' } },
    { id: 'focus-4', title: 'Kısa molalar: ne vaat eder, ne etmez?', minutes: 6,
      goal: 'Kısa bir molayı dene ve sana nasıl geldiğini gözle.',
      reading: ['22 örneklemi birleştiren bir meta-analizde en fazla 10 dakikalık molalar zindeliği artırdı ve yorgunluğu azalttı. Genel performans üzerindeki etki ise istatistiksel olarak anlamlı değildi. Yani mola seni daha iyi hissettirebilir; işini mutlaka hızlandıracağı söylenemez.', 'Zihinsel olarak çok yoğun işlerde kısa molaların performansa etkisi görülmedi; bu tür işlerde daha uzun molalar gerekebilir. Molada ne yapacağına dair kesin bir reçete yok. İşten zihnen uzaklaşmanı sağlayan bir şey, örneğin ekrandan kalkmak ya da kısa bir yürüyüş, denemeye değer.'],
      practice: ['Bir çalışma süresinin sonuna beş ila on dakikalık bir mola koy.', 'Molada ekrandan uzaklaşan bir şey seç: kalkıp su içmek, pencereden bakmak veya kısa bir yürüyüş.', 'Moladan önce ve sonra ne kadar yorgun hissettiğini 1–5 arasında kendine not et.'],
      reflection: 'Molan sende neyi değiştirdi, neyi değiştirmedi?', question: 'Kısa molalar için hangi ifade kanıta daha uygun?', options: ['Performansı her işte kesin artırır.', 'Mola vermek yalnızca zaman kaybıdır.', 'Zindelik ve yorgunluk için umut verici; performans etkisi belirsiz.'], correct: 2,
      feedback: 'Kanıt, iyi hissetme konusunda performanstan daha tutarlı. Molayı işi hızlandırma aracı değil, kendine bakımın bir parçası olarak düşünebilirsin.', takeaway: 'Kısa mola daha zinde hissettirebilir; mucize beklemeden dene.', sources: ['microbreaks'],
      visual: { kind: 'bars', title: 'Mikro molaların ortalama etkisi', sourceId: 'microbreaks',
        bars: [
          { label: 'Zindelikte artış', value: 0.36, display: 'd = 0,36' },
          { label: 'Yorgunlukta azalma', value: 0.35, display: 'd = 0,35' },
          { label: 'Genel performans (anlamlı değil)', value: 0.16, display: 'd = 0,16' },
        ],
        note: 'd değeri etkinin büyüklüğünü gösterir; 0,36 küçük–orta bir etkidir. Performans etkisi istatistiksel olarak anlamlı değildi ve çalışma sayısı az.' } },
    { id: 'focus-5', title: 'Kendi odak planın', minutes: 8,
      goal: 'Bildirim, telefon, çalışma bloğu ve mola kararlarını tek bir kişisel denemede birleştir.',
      reading: ['Zaman blokları, yani belirli bir süreyi tek bir işe ayırmak, birçok kişinin kullandığı bir yöntem. Bu yöntemi doğrudan sınayan sağlam bir çalışma incelemedik. Yine de görev değiştirmenin bedeli ve bölünmelerin stresi düşünüldüğünde, denemeye değer makul bir kişisel deney.', 'Planına dikkatin dağıldığında ne yapacağını da ekle: “Eğer telefonu elime almak istersem, o zaman önce cümlemi bitireceğim.” Blok bitince kısa bir mola ver ve nasıl gittiğine bak. Blok kısa kaldıysa veya hiç yapamadıysan bu bir başarısızlık değil, planını ayarlamak için bir bilgi.'],
      practice: ['Yarın için tek bir iş ve sana uygun bir blok süresi seç; kısa başlamak da olur.', '“Eğer dikkatim dağılırsa, o zaman …” cümlesini tamamla ve bildirim ayarını bloktan önce yap.', 'Blok ve moladan sonra neyin işe yaradığını, neyi değiştireceğini kısaca not et.'],
      reflection: 'Odak planında seni en çok destekleyen parça hangisi?', question: 'Zaman blokları için en dürüst yaklaşım hangisi?', options: ['Herkes için kanıtlanmış en iyi yöntemdir.', 'Makul bir kişisel deney; sonuca bakıp ayarlanır.', 'Blok bozulursa bütün gün boşa gitmiş demektir.'], correct: 1,
      feedback: 'Zaman blokları mantıklı bir deneme ama kanıtlanmış bir teknik değil. Sende nasıl çalıştığını gözlemek ve ayarlamak planın parçası. Dikkat güçlüklerin kalıcıysa bir sağlık uzmanıyla konuşabilirsin.', takeaway: 'Odak planın bir deney: dene, bak, ayarla.', sources: ['interruptions', 'mcii', 'monitoring'],
      visual: { kind: 'steps', title: 'Bir odak bloğu',
        steps: [
          { label: 'Seç', text: 'Tek bir iş ve sana uygun bir süre seç.' },
          { label: 'Hazırla', text: 'Bildirimleri sustur, acil kişilere istisna bırak.' },
          { label: 'Çalış', text: 'Dağılırsan aklına geleni not et ve işe dön.' },
          { label: 'Mola ver', text: 'Ekrandan kalk, birkaç dakika uzaklaş.' },
          { label: 'Değerlendir', text: 'Neyin işe yaradığını not et, planı ayarla.' },
        ],
        note: 'Bu akış kanıtlanmış bir teknik değil, kendi üzerinde deneyeceğin bir öneridir.' } },
  ],
};
