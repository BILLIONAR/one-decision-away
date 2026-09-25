import type { CourseSource, GuidedCourse } from '../courses';

/**
 * Sources verified for the "Erteleme" course (research notes, 25 Sep 2026).
 * Ariely & Wertenbroch (2002) on self-imposed deadlines was retracted on
 * 2 Sep 2026 and is deliberately not cited; lesson 5 presents deadlines as
 * a limited-evidence experiment. Existing ids reused: 'mcii', 'self-compassion', 'monitoring'.
 */
export const SOURCES: CourseSource[] = [
  { id: 'procrastination-interventions', title: 'van Eerde & Klingsieck · 2018 · Erteleme müdahaleleri meta-analizi', url: 'https://www.sciencedirect.com/science/article/abs/pii/S1747938X18300472', type: 'research', finding: '24 çalışmayı (N=1.173) birleştiren meta-analizde müdahalelerden sonra ertelemede büyük bir azalma görüldü (öncesi–sonrası ortalama etki −1,07), azalma izleme ölçümlerinde de sürdü ve en güçlü sonuç bilişsel davranışçı terapiden geldi.', limitation: 'Değer kontrol grubuyla değil öncesi–sonrası farkla hesaplandığı için etki olduğundan büyük görünebilir; yalnızca yayın özeti incelendi ve bu ODA kursunun etkililiği sınanmadı.' },
  { id: 'task-aversiveness', title: 'Steel · 2007 · Ertelemenin nedenleri meta-analizi', url: 'https://studypedia.au.dk/fileadmin/www.studiemetro.au.dk/Procrastination_2.pdf', type: 'research', finding: '691 korelasyona dayanan meta-analizde erteleme; görevin itici gelmesiyle (r=0,40), düşük öz denetimle (r=−0,58) ve düşük öz yeterlikle (r=−0,38) ilişkiliydi, çalışma niyetiyle ise neredeyse hiç ilişkili değildi (r=0,03).', limitation: 'Bulgular korelasyoneldir ve neden-sonuç göstermez; okunan PDF’te eksi işaretleri kaybolduğu için ilişkilerin yönü metindeki ifadelerden çıkarıldı.' },
  { id: 'mood-repair', title: 'Sirois & Pychyl · 2013 · Erteleme ve ruh hâli onarımı', url: 'https://eprints.whiterose.ac.uk/91793/1/Compass%20Paper%20revision%20FINAL.pdf', type: 'research', finding: 'Bu kuramsal derleme ertelemeyi, itici bir görevin yarattığı kötü hissi o an hafifletme çabası olarak açıklar ve bedelin gelecekteki benliğe kaldığını savunur; aktarılan küçük bir analizde erteleme düşük öz şefkatle ilişkili bulunmuştur (r=−0,31).', limitation: 'Yeni veri içermeyen bir anlatı derlemesidir ve r=−0,31 değeri o sırada henüz yayımlanmamış bir çalışmadan aktarılır; kabul edilmiş yazar sürümü okundu.' },
  { id: 'self-forgiveness', title: 'Wohl, Pychyl & Bennett · 2010 · Kendini affetme ve erteleme', url: 'https://www.sciencedirect.com/science/article/abs/pii/S0191886910000474', type: 'research', finding: 'İki ara sınav boyunca izlenen 119 birinci sınıf öğrencisinde, ilk sınav için ertelediği için kendini daha çok affedenler ikinci sınava daha az erteleyerek hazırlandı ve bu ilişkiyi olumsuz duygudaki azalma açıklıyordu.', limitation: 'Çalışma deneysel değil korelasyoneldir, tek bir ders ve öğrenci grubunda yürütüldü ve ilk ölçüme katılan 312 kişiden analize yalnızca 119’u kaldı.' },
  { id: 'mcii-procrastination', title: 'Zhou ve ark. · 2026 · WOOP (MCII) ile erteleme deneyi', url: 'https://www.sciencedirect.com/science/article/pii/S0001691825014829', type: 'research', finding: '81 üniversite öğrencisiyle yapılan randomize çalışmada WOOP (dilek, sonuç, engel, plan) uygulayan grup görevleri daha az itici buldu ve günlerin %58,8’inde göreve başladı; yalnızca olumlu düşünen kontrol grubunda bu oran %47,3’tü.', limitation: 'Tek bir üniversitede, bir haftalık izlemle ve ön kayıt olmadan yürütülen küçük bir çalışmadır (kayıp oranı %19,8); bu ODA kursunun etkililiği sınanmadı.' },
  { id: 'if-then-plans', title: 'Gollwitzer & Sheeran · 2006 · Eğer/o zaman planları meta-analizi', url: 'https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0065260106380021', type: 'research', finding: '94 bağımsız testte, ne zaman, nerede ve nasıl sorularını önceden yanıtlayan “Eğer … olursa, … yapacağım” planları hedefe ulaşmada orta–büyük olumlu bir etki gösterdi (d=0,65).', limitation: 'Yalnızca yayın özeti incelendi, yayın yanlılığını düzelten daha yeni analizlere bakılmadığı için gerçek etki daha küçük olabilir ve çalışma ertelemeye özgü değildir.' },
];

export const COURSE: GuidedCourse = {
  id: 'procrastination', title: 'Erteleme', subtitle: 'Tembellik değil, bir his.',
  description: 'Ertelemenin ardındaki hissi fark et, işi küçült, gerçek engeline bir plan bağla ve erteledikten sonra kendine yüklenmeden geri dön.',
  scope: 'Gündelik erteleme için beceri eğitimi; terapi değildir. Erteleme yoğun kaygı, uzun süren çökkünlük veya dikkat güçlükleriyle birlikte sürüyor ve hayatını belirgin biçimde etkiliyorsa bir uzmandan destek alabilirsin.',
  outcome: 'Küçültülmüş bir görev, eğer/o zaman planı ve erteledikten sonra geri dönüş cümlesi.',
  lessons: [
    { id: 'procrastination-1', title: 'Ertelemenin ardındaki his', minutes: 7,
      goal: 'Ertelediğin bir işin sende uyandırdığı hissi adlandır.',
      reading: ['Ertelemek çoğu zaman tembellik değildir. Büyük bir derlemede erteleyen kişilerin çalışma niyeti başkalarından düşük çıkmadı; zorlandıkları yer, niyeti eyleme dökmekti. Aynı derlemeye göre üniversite öğrencilerinin %80–95’i bir ölçüde erteliyor. Bunu yaşayan tek kişi sen değilsin.', 'Görev sıkıcı, belirsiz veya kaygı verici geldikçe erteleme artma eğiliminde. Bir açıklamaya göre ertelediğimizde kaçtığımız şey işin kendisi değil, işin bizde uyandırdığı his: o an rahatlarız, bedelini sonraki hâlimiz öder. Bugün bu hissi yargılamadan fark etmeye çalışacağız.'],
      practice: ['Bir süredir ertelediğin tek bir işi seç.', 'İşi düşündüğünde ne hissettiğini bir iki kelimeyle adlandır: sıkıntı, kaygı, belirsizlik veya başka bir şey.', 'Bu hissi işin hangi kısmının uyandırdığını düşün; çözmeye çalışmadan yalnızca not et.'],
      reflection: 'Ertelediğin işte seni asıl zorlayan his ne?', question: 'Bu derse göre ertelemeyi hangisi daha iyi açıklar?', options: ['Erteleyenler aslında çalışmak istemez.', 'Görevin uyandırdığı hoş olmayan histen o an uzaklaşmak.', 'Ertelemek hiç değişmeyen bir karakter özelliğidir.'], correct: 1,
      feedback: 'Görevin itici gelmesi ertelemeyle ilişkili bulundu; niyet eksikliği ise neredeyse hiç ilişkili çıkmadı. Bunlar neden-sonuç kanıtı değildir ama kendine bakışını yumuşatabilir.', takeaway: 'Ertelediğin şey çoğu zaman bir histir; tembelliğinin kanıtı değil.', sources: ['task-aversiveness', 'mood-repair'],
      visual: { kind: 'bars', title: 'Ertelemeyle ilişki gücü', sourceId: 'task-aversiveness',
        bars: [
          { label: 'Öz denetim (ters yönde)', value: 0.58, display: 'r = −0,58' },
          { label: 'Görevin itici gelmesi', value: 0.40, display: 'r = 0,40' },
          { label: 'Öz yeterlik (ters yönde)', value: 0.38, display: 'r = −0,38' },
          { label: 'Çalışma niyeti', value: 0.03, display: 'r = 0,03' },
        ],
        note: 'Çubuklar ertelemeyle ilişkinin gücünü gösterir; eksi işaret, öz denetim veya öz yeterlik azaldıkça ertelemenin arttığı anlamına gelir. Bunlar korelasyondur, neden-sonuç göstermez.' } },
    { id: 'procrastination-2', title: 'İşi küçült, ilk hareketi bul', minutes: 6,
      goal: 'Ertelediğin işi, ağır gelmeyecek kadar küçük ve somut bir ilk harekete çevir.',
      reading: ['“Sunumu hazırla” veya “evi topla” nereden başlayacağını söylemez. Belirsizlik, işi olduğundan daha ağır hissettirebilir. “Belgeyi aç ve üç başlık yaz” ise gözünle görebileceğin bir başlangıçtır. Küçük olması önemsiz olduğu anlamına gelmez.', '“Bunu yapabilirim” duygusu ertelemeyle ters yönde ilişkili bulundu. Küçük ve başarılabilir ilk adımların bu duyguyu besleyebileceğini düşünüyoruz; bu bir çıkarım, doğrudan bir bulgu değil. İlk hareketi yaptıktan sonra devam etmek zorunda değilsin; durmak da bir seçenek.'],
      practice: ['Önceki derste seçtiğin işi tek cümleyle yaz veya söyle.', 'İşi üç küçük parçaya böl; ilkine aç, yaz, ara veya seç gibi açık bir fiille başla.', 'İlk parça hâlâ ağır geliyorsa onu iki dakikalık bir sürüme küçült ve şimdi dene.'],
      reflection: 'İşinin en küçük ilk hareketi ne oldu?', question: 'Hangisi somut bir ilk hareket?', options: ['Bu hafta daha disiplinli olmak.', 'Projeyi bir an önce halletmek.', 'Rapor dosyasını açıp ilk başlığı yazmak.'], correct: 2,
      feedback: 'Somut bir fiil ve nesne, başlayacağın yeri gösterir. Büyük işi tek seferde çözmen gerekmiyor.', takeaway: 'Başlamak için işin tamamını değil, ilk hareketini görmen yeter.', sources: ['task-aversiveness'],
      visual: { kind: 'steps', title: 'Büyük işten ilk harekete',
        steps: [
          { label: 'Büyük iş', text: 'Sunumu hazırla.' },
          { label: 'Parçalar', text: 'Konu seç, kaynak bul, slaytları yaz.' },
          { label: 'İlk parça', text: 'Sunumun konusunu seç.' },
          { label: 'İlk hareket', text: 'Boş bir belge aç, üç konu adayı yaz.' },
        ],
        note: 'İlk hareket hâlâ ağır geliyorsa bir basamak daha küçült.' } },
    { id: 'procrastination-3', title: 'Gerçek engeline bir plan bağla', minutes: 8,
      goal: 'Dilek, engel ve eğer/o zaman planını ertelediğin işe uygula.',
      reading: ['Yalnızca olumlu hayal kurmak başlamaya yetmeyebilir. WOOP adlı yöntemde önce ne istediğini ve bunun sana ne kazandıracağını düşünürsün, sonra seni içeriden durduran gerçek engele bakarsın. Son adımda engele bir yanıt bağlarsın: “Eğer … olursa, o zaman … yapacağım.”', '81 öğrenciyle yapılan küçük bir deneyde WOOP uygulayanlar görevleri daha az itici buldu ve günlerin daha büyük bir kısmında işe başladı. Bu, tek üniversitede bir hafta süren bir çalışma; kesin bir sonuç değil. Yine de denemesi kolay ve maliyeti düşük bir yöntem.'],
      practice: ['Dilek ve sonuç: ertelediğin işle ilgili bu hafta ne istediğini ve olursa sana ne kazandıracağını düşün.', 'Engel: seni en çok durduran içsel engeli adlandır; örneğin “telefonu elime almak” veya “yetersiz hissetmek”.', 'Plan: “Eğer [engel] olursa, o zaman [küçük davranış] yapacağım” cümlesini tamamla ve bir kez zihninde prova et.'],
      reflection: 'Senin eğer/o zaman cümlen ne?', question: 'WOOP’u yalnızca olumlu düşünmekten ayıran nedir?', options: ['Gerçek engeli görüp ona somut bir yanıt bağlamak.', 'Başarıyı olabildiğince canlı hayal etmek.', 'Engelleri hiç düşünmemeye çalışmak.'], correct: 0,
      feedback: 'Bu yaklaşımda engel görmezden gelinmez; plana dönüştürülür. Araştırmalardaki etkiler ortalama sonuçlardır ve kişiden kişiye değişebilir.', takeaway: 'Engelini gör, ona küçük bir yanıt hazırla.', sources: ['mcii-procrastination', 'if-then-plans', 'mcii'],
      visual: { kind: 'bars', title: 'Göreve başlanan günlerin oranı', sourceId: 'mcii-procrastination',
        bars: [
          { label: 'WOOP (dilek, sonuç, engel, plan)', value: 58.8, display: '%58,8' },
          { label: 'Yalnızca olumlu düşünme', value: 47.3, display: '%47,3' },
        ],
        note: '81 üniversite öğrencisi, bir haftalık izlem. Tek ve küçük bir çalışmadır; sana aynı sonucu garanti etmez.' } },
    { id: 'procrastination-4', title: 'Erteledikten sonra: kendini affet', minutes: 7,
      goal: 'Erteledikten sonra kendine saldırmak yerine hem affedici hem sorumlu bir cümle kur.',
      reading: ['Erteledikten sonra kendine “Yine yaptın, hiç düzelmeyeceksin” demek kolaydır. Bu sert ses sonraki başlangıcı kolaylaştırmayabilir; işi daha da itici hâle getirebilir. Öğrencilerle yapılan bir çalışmada, ilk sınav için ertelediği için kendini daha çok affedenler ikinci sınava daha az erteleyerek hazırlandı.', 'Bu çalışma deneysel değildi; affetmenin ertelemeyi azalttığını kesin olarak göstermez. İlişkiyi olumsuz duygudaki azalmanın açıkladığı görüldü. Kendini affetmek olanı yok saymak değildir: “Erteledim, bu insanca. Bir dahakine şunu farklı yapacağım” demektir.'],
      practice: ['Yakın zamanda ertelediğin bir anı kısaca hatırla ve kendine ne söylediğini fark et.', 'Aynı durumu yaşayan bir arkadaşına söyleyeceğin anlayışlı cümleyi kendine söyle.', 'Ardından bir dahaki sefere farklı yapacağın tek somut adımı belirle.'],
      reflection: 'Kendine söylemek istediğin affedici ama sorumlu cümle ne?', question: 'Kendini affetmek bu derste ne anlama geliyor?', options: ['Olanı önemsiz sayıp hiçbir şeyi değiştirmemek.', 'Ertelemeye devam etmek için kendine izin vermek.', 'Olanı kabul edip bir sonraki adımı seçmek.'], correct: 2,
      feedback: 'Affetmek sorumluluğu bırakmak değildir. Kendine yüklenmek yerine düzeltebileceğin kısma dönmeni kolaylaştırabilir.', takeaway: 'Erteledin; bu seni tanımlamaz. Bir sonraki adım hâlâ senin.', sources: ['self-forgiveness', 'mood-repair', 'self-compassion'],
      visual: { kind: 'compare', title: 'Erteledikten sonra iç ses',
        left: { label: 'Kendine saldırmak', items: ['“Ben tembelin tekiyim.”', 'Tek bir anı bütün kimliğe çevirir.', 'İşi daha da itici hissettirebilir.'] },
        right: { label: 'Kendini affetmek', items: ['“Erteledim, bu insanca.”', 'Olanı kabul eder, sorumluluğu korur.', 'Bir sonraki küçük adıma yer açar.'] },
        note: 'Affetmek, olanı yok saymak veya aynı şekilde sürdürmek demek değildir.' } },
    { id: 'procrastination-5', title: 'Kendi erteleme planın', minutes: 8,
      goal: 'Önümüzdeki hafta için ilk hareket, plan, gözden geçirme ve istersen ara tarihlerle bir deneme kur.',
      reading: ['Erteleme üzerine yapılan müdahale çalışmalarında, müdahaleden sonra ertelemenin belirgin biçimde azaldığı ve bu azalmanın izleme ölçümlerinde de sürdüğü görüldü. Bu değer kontrol grubuyla değil, öncesi–sonrası farkla hesaplandı; etki olduğundan büyük görünebilir. En güçlü sonuçlar uzmanla yürütülen bilişsel davranışçı terapiden geldi ve bu kurs bir terapi değil.', 'Büyük işi takvimde birkaç ara teslime bölmek, yani kendine nazik ara tarihler koymak, denemeye değer bir fikir. Ancak bu konuda sık anılan bir çalışma geri çekildi ve yerine koyabileceğimiz güçlü bir kanıt incelemedik. Bu yüzden ara tarihleri kanıtlanmış bir yöntem olarak değil, kendi üzerinde gözleyeceğin bir deneme olarak düşün.'],
      practice: ['İşini tablodaki satırlara göre yaz: ilk hareket, zaman ve yer, eğer/o zaman planı.', 'İstersen büyük işe birkaç ara tarih koy; bunları katı kurallar değil, kendine nazik hatırlatmalar olarak düşün.', 'Hafta sonunda neyin işe yaradığını ve neyi değiştireceğini iki dakikada gözden geçir.'],
      reflection: 'Planında hangi parçayı koruyacak, hangisini değiştireceksin?', question: 'Kendi koyduğun ara tarihler için en dürüst yaklaşım hangisi?', options: ['Kesin işe yarayan, kanıtlanmış bir yöntemdir.', 'Denemeye değer ama kanıtı sınırlı; sende nasıl çalıştığını gözle.', 'Hiçbir işe yaramaz, hiç denememek gerekir.'], correct: 1,
      feedback: 'Kanıtı sınırlı bir yöntemi denemek sorun değildir; önemli olan sende nasıl çalıştığını dürüstçe gözlemek. Erteleme hayatını belirgin biçimde etkiliyorsa bir uzmandan destek alabilirsin.', takeaway: 'Planını küçük tut, dene, gözden geçir; gerektiğinde destek iste.', sources: ['procrastination-interventions', 'if-then-plans', 'monitoring'],
      visual: { kind: 'table', title: 'Haftalık erteleme planı', columns: ['Adım', 'Örnek', 'Senin planın'],
        rows: [
          ['İlk hareket', 'Belgeyi açıp üç başlık yazmak', '…'],
          ['Zaman ve yer', 'Salı 9.00, mutfak masası', '…'],
          ['Eğer/o zaman', 'Telefonu alırsam önce bir cümle yazarım', '…'],
          ['Ara tarih (deneme)', 'Perşembe: ilk taslak', '…'],
          ['Gözden geçirme', 'Pazar akşamı, iki dakika', '…'],
        ],
        note: 'Ara tarihler kanıtı sınırlı bir denemedir; işe yaramazsa değiştir veya bırak.' } },
  ],
};
