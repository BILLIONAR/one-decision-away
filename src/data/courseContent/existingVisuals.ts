import type { LessonVisual } from '../courses';

/**
 * One visual per existing lesson (confidence, adhd, motivation, faith, manifest).
 * Bars quote only numbers from COURSE_SOURCES findings of a source the lesson already cites.
 * Faith visuals are practical ODA adaptations; religious texts are referenced by title only.
 */
export const EXISTING_VISUALS: Record<string, LessonVisual> = {
  // ── Özgüven ──────────────────────────────────────────────
  'confidence-1': {
    kind: 'compare',
    title: 'Etiketten durum tarifine',
    left: { label: 'Etiket', items: ['Ben yetersizim.', 'Ben hep başarısızım.', 'Ben böyle bir insanım.'] },
    right: {
      label: 'Durum tarifi',
      items: ['Konuşurken heyecanlanıyorum.', 'Bu konuşmada gerildim.', 'Toplantıda fikir söylerken çekiniyorum.'],
    },
    note: 'Sağdaki cümleler duyguyu inkâr etmez; değiştirilebilir bir sonraki adıma yer açar.',
  },
  'confidence-2': {
    kind: 'table',
    title: 'Aynı işin üç sürümü',
    columns: ['Sürüm', 'Örnek deneme'],
    rows: [
      ['Kolay', 'Bir soruyu önceden hazırlamak'],
      ['Orta', 'Güvendiğin bir kişiye fikrini anlatmak'],
      ['Zor', 'Herkesin önünde konuşmak'],
      ['Senin işin', 'Kolay: … / Orta: … / Zor: …'],
    ],
    note: 'Bugün güvenle deneyebileceğin en küçük sürümü seç. Rahatsızlık fazla yükselirse durabilir veya adımı küçültebilirsin.',
  },
  'confidence-3': {
    kind: 'compare',
    title: 'Kamera ne görürdü?',
    left: { label: 'Tahmin', items: ['Herkes benimle alay etti.', 'Herkes gerildiğimi fark etti.', 'Ben böyle bir insanım.'] },
    right: { label: 'Gözlem', items: ['Sorumu sordum.', 'Bir kişi yanıt verdi.', 'Sesim titredi ama sorumu sordum.'] },
    note: 'Kimin ne düşündüğünü varsaymak yerine görülen ve duyulanı kaydet. Bu kayıt bir performans notu değildir.',
  },
  'confidence-4': {
    kind: 'steps',
    title: 'Sert iç sesten destek cümlesine',
    steps: [
      { label: 'Fark et', text: 'Sert cümleyi gör; tekrar tekrar okumak zorunda değilsin.' },
      { label: 'Kabul et', text: '“Bu benim için zordu.”' },
      { label: 'Adil konuş', text: '“Hata yaptım; düzeltilecek kısmı belirleyebilirim.”' },
      { label: 'Tek adım', text: 'Özür dile, bilgiyi kontrol et veya not hazırla.' },
    ],
    note: 'Kendine iyi davranmak sorumluluktan vazgeçmek değildir; abartılı olumlamaya da gerek yok.',
  },
  'confidence-5': {
    kind: 'table',
    title: 'Cesaret planı şablonu',
    columns: ['Plan parçası', 'Senin yanıtın'],
    rows: [
      ['Deneme', 'Tek güvenli davranış ve zamanı: …'],
      ['Başlangıç planı', '“Ertelemek istersem, önce … yapacağım.”'],
      ['Değerlendirme', 'Denemeden sonra iki dakika: ne oldu?'],
      ['Destek', 'Gerektiğinde ulaşabileceğin kişi: …'],
      ['Dinlenme', 'Mola vereceğin an: …'],
    ],
    note: 'Bir gün deneme yapmaman ilerlemeyi silmez. İşe yaramayan adımı değiştirebilirsin.',
  },

  // ── ADHD ile günlük yaşam ────────────────────────────────
  'adhd-1': {
    kind: 'steps',
    title: 'Zihinden tek bir dış kayda',
    steps: [
      { label: 'Yer seç', text: 'Kâğıt, telefon notu veya ODA defteri: yalnızca biri.' },
      { label: 'Aktar', text: 'Aklındaki en fazla beş işi yaz; hepsi bugün bitmeyecek.' },
      { label: 'Saatliler', text: 'Randevu gibi saatli işleri takvime ekle.' },
      { label: 'Kontrol', text: 'Listeye ne zaman bakacağını belirle.' },
    ],
    note: 'Dış kayıt, hafızanın yükünü azaltmak için bir araçtır; tanı veya tedavi değildir.',
  },
  'adhd-2': {
    kind: 'compare',
    title: 'Belirsiz görev ve görünen hareket',
    left: { label: 'Belirsiz görev', items: ['Dosyaları hallet.', 'Hayatımı düzene sokmak.', 'Daha disiplinli olmak.'] },
    right: {
      label: 'İlk görünen hareket',
      items: ['Mavi klasörü aç, ilk belgenin adını yaz.', 'Ödeme belgesini aç, son tarihi kontrol et.'],
    },
    note: 'Açık bir fiil ve nesne, elinin ilk ne yapacağını gösterir. Takılırsan hareketi daha da küçült.',
  },
  'adhd-3': {
    kind: 'table',
    title: 'Tahmin ve gerçek süre',
    columns: ['Deneme', 'Tahmin', 'Gerçek süre', 'Sonraki aralık'],
    rows: [
      ['1. aralık', '… dk', '… dk', '… dk'],
      ['2. aralık', '… dk', '… dk', '… dk'],
      ['3. aralık', '… dk', '… dk', '… dk'],
    ],
    note: 'İki, beş veya on dakika gibi rahat bir başlangıç seçebilirsin. Bu ideal odak süresi değil, bir denemedir.',
  },
  'adhd-4': {
    kind: 'steps',
    title: 'Dikkat dağıldığında geri dönüş',
    steps: [
      { label: 'Fark et', text: 'Aklına başka bir iş geldi.' },
      { label: 'Acil mi?', text: 'Acil veya güvenlikle ilgiliyse bekletme.' },
      { label: 'Not al', text: 'Değilse birkaç kelimeyle “sonra” alanına yaz.' },
      { label: 'İzi bul', text: 'Kaldığın yeri parmağınla veya bir işaretle bul.' },
      { label: 'Dön', text: 'Önündeki işte bir hareket daha dene.' },
    ],
    note: 'Kaç kez dağıldığını saymak zorunda değilsin; önemli olan geri dönüş için bir iz bırakmak.',
  },
  'adhd-5': {
    kind: 'table',
    title: 'Aracı sana uydur',
    columns: ['Zorlanan nokta', 'Tek değişiklik'],
    rows: [
      ['Liste görünür değildi', 'Daha görünür bir kayıt yeri seç'],
      ['Liste çok uzundu', 'Daha kısa bir liste dene'],
      ['Kontrol saati uymadı', 'Başka bir saat dene'],
    ],
    note: 'Gelecek üç denemede yalnızca bir şeyi değiştir. Güçlükler günlük yaşamını belirgin etkiliyorsa bir sağlık uzmanıyla konuşabilirsin.',
  },

  // ── Motivasyon ───────────────────────────────────────────
  'motivation-1': {
    kind: 'compare',
    title: 'Hedefi netleştiren sorular',
    left: { label: 'Dışarıya bakan soru', items: ['Herkes beni nasıl görür?', 'En iddialı hedef hangisi?'] },
    right: {
      label: 'Sana ait soru',
      items: ['Bunu yapınca günümde ne değişsin istiyorum?', 'Kimse görmese de bunu ister miydim?'],
    },
    note: 'Önemini kaybetmiş bir hedefi küçültmek veya bırakmak da bir seçimdir.',
  },
  'motivation-2': {
    kind: 'table',
    title: 'Başlangıcı küçült',
    columns: ['Hedef davranış', 'Kısa sürüm', 'Hazırlık'],
    rows: [
      ['Her akşam bir bölüm okumak', 'Bir sayfa okumak veya kitabı açmak', 'Kitabı görünür yere koymak'],
      ['Senin hedefin: …', 'Kısa sürüm: …', 'Tek malzeme: …'],
    ],
    note: 'Kısa sürüm bir alt sınırdır, tavan değil; istersen devam edebilirsin. Sonuç garantisi değil, bir başlangıç tasarımıdır.',
  },
  'motivation-3': {
    kind: 'steps',
    title: 'Niyetine bir başlangıç anı ver',
    steps: [
      { label: 'İşaret', text: 'Gününde zaten olan bir an: “Akşam çayını koyunca…”' },
      { label: 'Davranış', text: '“…kitabı açacağım.”' },
      { label: 'Deneme', text: 'İşaretin geldiği ilk uygun anda kısa sürümü dene.' },
      { label: 'Gözlem', text: 'İşaret işe yaradı mı? Gerekirse başka bir an seç.' },
    ],
    note: 'Alışkanlığın oluşma süresi herkes için aynı değildir. Bugün yalnızca başlangıç işaretini sınıyorsun.',
  },
  'motivation-4': {
    kind: 'bars',
    title: 'Engel + eğer/o zaman planı: ortalama etki',
    bars: [{ label: 'Wang ve ark. 2021 · 21 çalışma', value: 0.336, display: 'g = 0,336' }],
    note: 'Hedefi gerçek engelle karşılaştırıp eğer/o zaman planı kurmanın ortalama etkisi küçük–orta düzeydeydi. Yayın yanlılığı olası; bu bir ortalamadır, kişisel garanti değildir.',
    sourceId: 'mcii',
  },
  'motivation-5': {
    kind: 'table',
    title: 'Haftalık kısa kontrol',
    columns: ['Hafta', 'Yaptım / kısmen / yapamadım', 'Yardımcı olan', 'Tek değişiklik'],
    rows: [
      ['1. hafta', '…', '…', '…'],
      ['2. hafta', '…', '…', '…'],
      ['3. hafta', '…', '…', '…'],
    ],
    note: 'Kaçırılan günleri iki katıyla telafi etmen gerekmez. Bir sonraki uygun işarette küçük sürümle dönebilirsin.',
  },

  // ── İnanç ────────────────────────────────────────────────
  'faith-1': {
    kind: 'steps',
    title: 'Niyetten küçük bir emeğe',
    steps: [
      { label: 'İş', text: 'Bugün yapacağın sıradan bir işi seç.' },
      { label: 'Niyet', text: 'Bu iş kime ve nasıl fayda sağlasın istiyorsun?' },
      { label: 'Hazırlık', text: 'Niyetini davranışa bağlayan küçük bir adım at.' },
    ],
    note: 'Kaynak: Sahîh-i Buhârî 1, niyet hadisi. Bu adımlar hadisin sözleri değil, ODA’nın günlük uygulama uyarlamasıdır.',
  },
  'faith-2': {
    kind: 'compare',
    title: 'Hazırlık ve tevekkül',
    left: {
      label: 'Elimden gelen hazırlık',
      items: ['Konuyu çalışmak', 'Anlamadığım yeri sormak', 'Güvendiğim birinden görüş almak'],
    },
    right: { label: 'Kontrolümün dışında', items: ['Sınavın sonucu', 'Sonucun istediğim gibi olması'] },
    note: 'Âl-i İmrân 3:159’un istişare, karar ve tevekkül vurgusundan hareketle ODA yorumudur; sonuç vaat etmez.',
  },
  'faith-3': {
    kind: 'table',
    title: 'Teşekkür notu şablonu',
    columns: ['Parça', 'Senin notun'],
    rows: [
      ['Kime?', 'Güvenli bir kişi veya küçük bir iyilik: …'],
      ['Ne yaptı?', '“Şunu yaptığında…”'],
      ['Nasıl yardımcı oldu?', '“…bana şu konuda yardımcı oldun.”'],
      ['Seçimin', 'Kendine sakla veya uygunsa ilet.'],
    ],
    note: 'Şükretmek sıkıntıyı inkâr etmek değildir; hem yorgun hem minnettar olabilirsin.',
  },
  'faith-4': {
    kind: 'steps',
    title: 'Bugün için bir dayanak',
    steps: [
      { label: 'Kabul et', text: 'Zorlandığını fark et; bu bir kusur değildir.' },
      { label: 'Adlandır', text: '“Bugün … desteğine ihtiyacım var.”' },
      { label: 'Seç', text: 'Dua, güvendiğin biri, dinlenme veya uzman desteği.' },
      { label: 'Yaklaş', text: 'Bu desteğe doğru küçük bir adım at.' },
    ],
    note: 'İnşirâh 94:5–6 üzerine düşünmekten hareketle ODA uygulamasıdır; sıkıntının ne zaman biteceğine dair vaat içermez.',
  },
  'faith-5': {
    kind: 'table',
    title: 'Küçük iyilik planı',
    columns: ['Küçük iyilik', 'Ne zaman / nerede?', 'Sonra ne fark ettin?'],
    rows: [
      ['Birini dikkatle dinlemek', '…', '…'],
      ['Ortak alanı düzenlemek', '…', '…'],
      ['Verilen sözü takip etmek', '…', '…'],
    ],
    note: 'Sınırlarına uygun, ücretsiz ve gönüllü bir davranış seç; karşılık beklemeyi şart koşma.',
  },

  // ── Manifest ─────────────────────────────────────────────
  'manifest-1': {
    kind: 'compare',
    title: 'Dilekten davranışa',
    left: {
      label: 'Sonuç isteği',
      items: ['Daha iyi bir iş istiyorum.', 'İşverenin beni kesin seçmesi', 'Hiç aksilik yaşanmaması'],
    },
    right: {
      label: 'Davranış hedefi',
      items: ['Bu hafta özgeçmişimin ilk bölümünü düzenlemek', 'Yarın üç satır taslak yazmak'],
    },
    note: 'Başkalarının kararını garanti edemezsin; kendi hazırlığını somutlaştırabilirsin.',
  },
  'manifest-2': {
    kind: 'steps',
    title: 'Sonuçtan ilk harekete prova',
    steps: [
      { label: 'Anlam', text: 'Sonuca ulaşmak senin için ne ifade ederdi?' },
      { label: 'Yer', text: 'Bugün nerede oturuyorsun?' },
      { label: 'Araç', text: 'Hangi dosyayı açıyorsun?' },
      { label: 'İlk satır', text: 'İlk satırda ne yazıyorsun?' },
      { label: 'Gerçek adım', text: 'Provadan sonra bir hazırlığı gerçekten yap.' },
    ],
    note: 'Görüntü oluşmuyorsa adımları kelimelerle tarif etmen yeterli. Prova, gerçek denemenin yerini almaz.',
  },
  'manifest-3': {
    kind: 'table',
    title: 'Engeli dürüstçe ayrıştır',
    columns: ['Engel', 'Türü', 'Olası yanıt'],
    rows: [
      ['Başlamakta çekinmek', 'İçsel', 'Adımı küçültmek'],
      ['Plan çok büyük', 'Plan', 'Hedefin boyutunu küçültmek'],
      ['Gereken bilgiye erişememek', 'Erişim', 'Destek istemek'],
      ['Zaman, para, bakım sorumluluğu', 'Dış koşul', 'Zamanlamayı veya boyutu değiştirmek'],
    ],
    note: 'Dış koşullar gerçektir; kişiliğinin kusuru değildir. Sonuçlar yalnızca düşüncelerinle belirlenmez.',
  },
  'manifest-4': {
    kind: 'steps',
    title: 'İstek → sonuç → engel → plan',
    steps: [
      { label: 'İstek', text: 'Ne istiyorsun? Örn. özgeçmişimin ilk taslağı.' },
      { label: 'Sonuç', text: 'Olunca senin için ne değişirdi?' },
      { label: 'Engel', text: '“Dosyayı açınca nereden başlayacağımı bilemem.”' },
      { label: 'Plan', text: '“Eğer takılırsam, o zaman yalnızca başlığı yazarım.”' },
    ],
    note: 'Olumlama kullanacaksan gerçekçi olsun: “İlk taslağı deneyebilirim.” Planın değeri, seçtiğin davranışı hatırlatmasında.',
  },
  'manifest-5': {
    kind: 'bars',
    title: 'İlerlemeyi izlemek: ortalama etki',
    bars: [{ label: 'Harkin ve ark. 2016 · 138 çalışma', value: 0.4, display: 'd = 0,40' }],
    note: 'İlerlemeyi izlemeyi artıran müdahalelerin hedefe ulaşmadaki ortalama etkisidir; farklı hedef ve yöntemler birleştirildi. Bu tek alıştırma için etki veya sonuç garantisi anlamına gelmez.',
    sourceId: 'monitoring',
  },
};
