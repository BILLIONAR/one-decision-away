import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/faith.ts (ders id'leri aynı).
// Ayetler ve hadisler aktarılırken telif hakkı olan meal alıntılanmaz; anlam özetlenir ve psikoloji araştırmalarından ayrı gösterilir.
export const SOURCES: CourseSource[] = [
  { id: 'faith-hadith-good-intention', title: 'Sahîh-i Buhârî 6491 · İyi bir işe niyet etmek', url: 'https://sunnah.com/bukhari:6491', type: 'religious', finding: 'İbn Abbâs’tan rivayet edilmiştir: Peygamber (s.a.v.), bir kimse iyi bir işe niyet edip de onu yapamazsa Allah’ın bunu ona tam bir iyilik olarak yazdığını, niyet edip yaparsa kat kat yazdığını; niyet edilip de yapılmayan bir kötülüğün de bir iyilik olarak yazıldığını söylemiştir.', limitation: 'Niyetle ilgili anlamı için anılmıştır; dersin bunu planlamaya uygulaması ODA’nın yorumudur, hüküm değildir.' },
  { id: 'faith-hadith-camel', title: 'Câmiu’t-Tirmizî 2517 · “Önce bağla, sonra tevekkül et”', url: 'https://sunnah.com/tirmidhi:2517', type: 'religious', finding: 'Enes b. Mâlik’ten rivayet edilmiştir: bir adam, devesini bağlayıp Allah’a mı tevekkül etsin, yoksa salıp da mı tevekkül etsin diye sormuş; Peygamber (s.a.v.) ona “Önce bağla, sonra Allah’a tevekkül et” buyurmuştur. Hasen (Darussalam) olarak derecelendirilmiştir.', limitation: 'Tirmizî bunu bizzat garîb (nadir) bir rivayet olarak nitelemiş, yalnızca bu senetle bildiğini ve Amr b. Ümeyye’den benzer bir rivayet bulunduğunu belirtmiştir. Ders bunu hüküm olarak değil, yaygın anılan bir örnek olarak kullanır.' },
  { id: 'faith-quran-sufficient', title: 'Kur’an-ı Kerim · Talâk 65:3', url: 'https://quran.com/65/3', type: 'religious', finding: 'Ayet, kim Allah’a tevekkül ederse Allah’ın ona yeteceğini ve Allah’ın her şey için bir ölçü koyduğunu bildirir.', limitation: 'Burada özetlenmiştir. Ders belirli bir dünyevî sonucu vaat etmez.' },
  { id: 'faith-quran-gratitude', title: 'Kur’an-ı Kerim · İbrâhîm 14:7', url: 'https://quran.com/14/7', type: 'religious', finding: 'Ayet, Allah’ın şükredenlere daha fazlasını vereceğine dair bildirimini hatırlatır ve nankörlükten sakındırır.', limitation: 'Burada özetlenmiştir. Bu dinî bir öğretidir, psikolojik bir bulgu değildir; ders bundan belirli bir maddî kazanç vaadi çıkarmaz.' },
  { id: 'faith-hadith-thank-people', title: 'Sünen-i Ebû Dâvûd 4811 · İnsanlara teşekkür etmek', url: 'https://sunnah.com/abudawud:4811', type: 'religious', finding: 'Ebû Hüreyre’den rivayet edilmiştir: Peygamber (s.a.v.), insanlara teşekkür etmeyenin Allah’a da şükretmiş olmayacağını söylemiştir. Elbânî tarafından sahih olarak derecelendirilmiştir.', limitation: 'Anlamı için anılmıştır; teşekkür notu alıştırması ODA’nın uyarlamasıdır.' },
  { id: 'faith-hadith-believer', title: 'Sahîh-i Müslim 2999 · Müminin hâli', url: 'https://sunnah.com/muslim:2999', type: 'religious', finding: 'Süheyb’den rivayet edilmiştir: Peygamber (s.a.v.), müminin hâlinin şaşılacak olduğunu, çünkü her hâlinin kendisi için hayır olduğunu söylemiştir: hoşuna giden bir şey olunca şükreder, bu onun için hayırdır; bir sıkıntı gelince sabreder, bu da onun için hayırdır.', limitation: 'Dersin sabrı etkin bir dayanıklılık olarak okuması ODA’nın yorumudur, hüküm değildir. Zorluğun gizlenmesi ya da yardım almadan katlanılması gerektiği anlamına gelmez.' },
  { id: 'faith-quran-patience', title: 'Kur’an-ı Kerim · Bakara 2:153', url: 'https://quran.com/2/153', type: 'religious', finding: 'Ayet, müminleri sabır ve namazla yardım aramaya çağırır ve Allah’ın sabredenlerle beraber olduğunu bildirir.', limitation: 'Burada özetlenmiştir. Psikolojik bir tedavi değildir ve tıbbi ya da ruh sağlığı bakımının yerini almaz.' },
  { id: 'faith-religious-coping', title: 'Ano & Vasconcelles · 2005 · Dinî başa çıkma ve stresle uyum üzerine meta-analiz', url: 'https://mhwbf.org/wp-content/uploads/2019/02/Ano-2005-Religious-coping-and-psychological-ad.pdf', type: 'research', finding: '49 çalışma, 13.512 kişi. Olumlu dinî başa çıkma (Pargament’ın terimiyle örneğin manevî bağ arama, birlikte başa çıkma, din görevlilerinden destek arama, iyiliksever yeniden değerlendirme) olumlu sonuçlarla orta düzeyde (r = 0,33), olumsuz sonuçların azlığıyla ise mütevazı düzeyde ilişkiliydi. Olumsuz dinî başa çıkma (örneğin manevî hoşnutsuzluk, zorluğu Tanrı’dan gelen bir ceza olarak görme) daha fazla sıkıntıyla ve diğer olumsuz sonuçlarla ilişkiliydi (r = 0,22).', limitation: 'Çoğunlukla kesitsel, öz bildirime dayalı çalışmalardır; bu yüzden nedeni değil, ilişkileri gösterir. Katılımcıların yaklaşık %85’i Protestan ya da Katolikti; bulgular doğrudan Müslümanlara aktarılamayabilir. Tam metin okundu.' },
  { id: 'faith-hadith-consistent', title: 'Sahîh-i Buhârî 6464 · Devamlı işler', url: 'https://sunnah.com/bukhari:6464', type: 'religious', finding: 'Âişe’den rivayet edilmiştir: Peygamber (s.a.v.), iyi işleri doğru, samimi ve ölçülü yapmayı öğütlemiş ve Allah’a en sevimli işin, az da olsa en düzenli ve devamlı olanı olduğunu söylemiştir.', limitation: 'Anlamı için anılmıştır; iyilik planı ODA’nın uygulamasıdır.' },
  { id: 'faith-hadith-smile', title: 'Câmiu’t-Tirmizî 1956 · Gündelik sadaka örnekleri', url: 'https://sunnah.com/tirmidhi:1956', type: 'religious', finding: 'Ebû Zer’den rivayet edilmiştir: Peygamber (s.a.v.), kardeşine gülümsemeyi, yolunu şaşırana yol göstermeyi, görmesi zayıf olana yardım etmeyi, yoldan taş, diken ya da kemik kaldırmayı ve kovandan başkasının kovasına su boşaltmayı sadaka saymıştır. Hasen (Darussalam) olarak derecelendirilmiştir.', limitation: 'Özetlenmiştir; dersteki çağdaş örnekler ODA’nın uyarlamasıdır.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'faith-1': {
    deeper: [
      { heading: 'Niyet ne demek?',
        paragraphs: [
          'Niyet, kalpteki maksattır; bir davranışa yönünü veren amaç. Aynı dışsal eylem — yemek pişirmek, işe gitmek, komşuya yardım etmek — neden yapıldığına göre çok farklı anlamlar taşıyabilir.',
          'Buhârî’deki bir başka hadis, İbn Abbâs’tan rivayetle, umut verici bir not ekler: bir kimse iyi bir işe niyet edip de onu yapamazsa, yine de kendisi için bir iyilik olarak yazılır. Samimi niyet, eylem tamamlanmadan önce bile önemlidir. Bu, niyet etmekle yetinmek için bir sebep değildir ama bir plan yarım kaldığında umutsuzluğa kapılmamak için bir sebeptir.',
        ],
        visual: { kind: 'table', title: 'Niyet üzerine iki hadis',
          columns: ['Kaynak', 'Anlamı (özetlenmiştir)', 'Bu dersin ondan aldığı'],
          rows: [
            ['Buhârî 1', 'Ameller niyetlere göre değerlendirilir', 'Sıradan bir işin ardındaki “neden”e bak'],
            ['Buhârî 6491', 'Niyet edilen iyilik, yapılamasa da yazılır', 'Bir plan yarım kaldığında umutsuzluğa kapılma'],
          ],
          note: 'sunnah.com’dan özetlenmiştir. Sağ sütun ODA’nın yorumudur, dinî hüküm değildir.' } },
      { heading: 'Niyet mükemmeliyetçilik değildir',
        paragraphs: [
          'Bazı insanlar, güdülerinin karışık olmasından endişe ettikleri için iyi işleri erteler. Dürüst bir iç bakış değerlidir ama kusursuz bir kalbi beklemek sessizce kaçınmaya dönüşebilir. Karışık bir güdüyü fark edebilir, güçlendirmek istediğin daha iyi olanı adlandırabilir ve küçük bir biçimde onun doğrultusunda davranabilirsin.',
          'Basit bir plan burada da yardımcı olur. Niyetini ne zaman ve nerede eyleme dökeceğine karar vermek, planlamaya dair bir psikoloji bulgusudur ve bu dersin kaynaklarında ayrıca gösterilir. Uygulamayı destekler; dinî olan hiçbir şeyi ne kanıtlar ne de çürütür.',
        ] },
    ],
    example: { title: 'Yusuf, 29, bilgi işlem teknisyeni',
      text: 'Yusuf, yaşlı komşusuna yeni telefonunu kurmasında yardım edeceğine söz vermişti ve sürekli erteliyordu. Salı günü durup bunu neden yapmak istediğini kendine sordu. Cevabın bir kısmı suçluluktu, bir kısmı iyi bir komşu görünmek istemek. Ama bunun altında önemsediği bir şey buldu: komşusunun torunlarından kopuk hissetmesini istemiyordu. Bu sebebe tutunmaya karar verdi. Küçük bir hazırlık seçti — telefonu şarj etmek ve Wi-Fi şifresini yazmak — ve perşembe günü işten sonra kapısını çaldı. Kırk dakika sürdü. Dönüş yolunda suçluluğun gittiğini, seçtiği niyetin ise hâlâ yerinde durduğunu fark etti.' },
    sources: ['faith-hadith-good-intention'],
  },
  'faith-2': {
    deeper: [
      { heading: 'Tevekkül: emekle yürüyen güven',
        paragraphs: [
          'Tirmizî’nin derlemesindeki tanınmış bir hadis, devesini bağlayıp Allah’a mı tevekkül etsin, yoksa salıp da mı tevekkül etsin diye soran bir adamı anlatır. Peygamber (s.a.v.) ona önce bağlamasını, sonra Allah’a tevekkül etmesini söylemiştir. Tirmizî, bu rivayetin senedinin alışılmadık olduğunu belirtmiştir; yine de tevekkülü, emek ve güveni birlikte, bu kadar net resmettiği için yaygın olarak anılır.',
          'Talâk 65:3, kim Allah’a tevekkül ederse Allah’ın ona yeteceğini bildirir. Bu derste bu, elinin ötesindekiler konusunda bir dinginlik kaynağı olarak okunur — her sonucun dileklerine uyacağının vaadi olarak değil.',
        ],
        visual: { kind: 'steps', title: 'Âl-i İmrân 3:159’dan çıkarılan bir örüntü',
          steps: [
            { label: 'İstişare et', text: 'Güvendiğin biriyle konuş.' },
            { label: 'Karar ver', text: 'Bir eylem yolu seç.' },
            { label: 'Hazırlan', text: 'Elinin yettiği kısmı yap: “deveyi bağla.”' },
            { label: 'Tevekkül et', text: 'Sonucu Allah’a bırak ve gerisini bırak.' },
          ],
          note: 'ODA’nın 3:159 ve Tirmizî 2517 üzerine yorumudur; belirli bir sonuç vaat etmez.' } },
      { heading: 'Kaygı ağırlaştığında',
        paragraphs: [
          'Belirsiz bir sonuç için endişelenmek insanî bir deneyimdir, zayıf imanın işareti değildir. Süreklilik kazanırsa, uykunu bozarsa ya da günlük yaşamdan seni alıkoyarsa diğer her yük gibi özen hak eder. Güvendiğin biriyle konuşmak, bilgili bir imamla ya da bir ruh sağlığı uzmanıyla görüşmek, “deveyi bağlamanın” parçası olabilir.',
        ] },
    ],
    example: { title: 'Fatma, 22, hemşirelik öğrencisi',
      text: 'Fatma’nın mesleki yeterlilik sınavına iki hafta vardı ve her gece uyanık yatıp başarısız olursa neler olacağını düşünüyordu. Pazar günü bir kâğıt aldı ve ortasından bir çizgi çekti. Sola yapabileceklerini yazdı: kalp ilaçlarını tekrar etmek, günde bir deneme sınavı çözmek, hocasına sürekli yanlış yaptığı sorular hakkında danışmak. Sağa kontrol edemeyeceklerini yazdı: tam olarak hangi soruların geleceği, ne kadar heyecanlanacağı, sonuç. O akşam hocasına bir e-posta gönderdi. Sonra yatsı namazından sonra kendi sözleriyle kısa bir dua etti ve sağ sütunu bilinçli olarak Allah’a bıraktı. Kaygı kaybolmadı ama yaşayacağı yer daha küçülmüştü.' },
    sources: ['faith-hadith-camel', 'faith-quran-sufficient'],
  },
  'faith-3': {
    deeper: [
      { heading: 'İslam geleneğinde şükür',
        paragraphs: [
          'Şükür, Kur’an’ın merkezî temalarından biridir. İbrâhîm 14:7’de Allah, şükrederlerse insanlara daha fazlasını vereceğini bildirir ve ayet nankörlükten sakındırır. Burada şükür, önce her iyiliğin kaynağı olan Allah’a yöneliktir.',
          'Ebû Dâvûd’un derlemesindeki, Elbânî’nin sahih olarak derecelendirdiği bir hadis bunu gündelik hayata bağlar: Peygamber (s.a.v.), insanlara teşekkür etmeyenin Allah’a da şükretmiş olmayacağını söylemiştir. Sana yardım edene teşekkür etmek, şükrün kendisinin bir parçasıdır.',
        ] },
      { heading: 'Psikoloji araştırması ne buldu — ayrı olarak',
        paragraphs: [
          '6.745 kişilik 25 randomize çalışmayı kapsayan 2023 tarihli bir meta-analiz, minnettarlığı ifade etmenin, nötr etkinliklere kıyasla iyi oluş üzerinde küçük bir olumlu etkisi olduğunu buldu. Etki, yerleşik terapötik yaklaşımlardan belirgin biçimde farklı değildi.',
          'Bu çalışmalar, çoğunlukla klinik olmayan gruplarda ruh hâlini ve yaşam doyumunu ölçer. Şükre dair dinî öğretiyi ne doğrular ne sorgular ve üzüntünü minnettar bir yüzün ardına gizlemek için bir sebep değildir.',
        ],
        visual: { kind: 'bars', title: 'Minnettarlığı ifade etmek: ortalama etkiler',
          bars: [
            { label: 'Mutluluk', value: 0.16, display: 'g = 0,16' },
            { label: 'Yaşam doyumu', value: 0.22, display: 'g = 0,22' },
            { label: 'Olumlu duygulanım', value: 0.21, display: 'g = 0,21' },
          ],
          note: 'Kirca, Malouff & Meynadier 2023, nötr etkinliklerle karşılaştırıldığında: çalışmalar arasında değişen küçük etkiler. Psikoloji araştırması; kutsal metinden ayrı gösterilir.',
          sourceId: 'gratitude' } },
    ],
    example: { title: 'Ömer, 58, taksi şoförü',
      text: 'Ömer için zor bir aydı: dizi ağrıyordu ve müşteri azdı. Ders ondan yardımcı olmuş tek bir davranışı düşünmesini istediğinde, bir cuma günü arabasını onarmak için geç saate kadar kalan genç tamirciyi hatırladı; böylece hafta sonu işinden olmamıştı. Ömer parasını ödemiş ve çabucak bir teşekkür etmişti, o kadar. O akşam bir karta üç cümle yazdı: “Geçen cuma geç saate kadar kaldığında hafta sonumu kurtardın. Çalışabildim ve kiramı zamanında ödedim. Bunu unutmadım.” Tereddüt etti, sonra pazartesi günü kartı tamirhaneye bıraktı. Tamirci sırıttı ve kartı tezgâhının üstüne iğneledi. Ömer’in dizi hâlâ ağrıyordu ama eve daha hafif döndü.' },
    sources: ['faith-quran-gratitude', 'faith-hadith-thank-people'],
  },
  'faith-4': {
    deeper: [
      { heading: 'Sabır: yürümeye devam eden sabır',
        paragraphs: [
          'Sabır çoğu zaman beklemek olarak anlaşılır ama sessizce beklemekten daha zengindir. Bakara 2:153’te müminler sabır ve namazla yardım aramaya çağrılır ve Allah’ın sabredenlerle beraber olduğu bildirilir. Burada sabır, aracılığıyla yardım aradığın bir şeydir — etkin, istikrarlı bir dayanıklılık.',
          'Sahîh-i Müslim’deki bir hadis, müminin hâlini şaşılacak bir hâl olarak anlatır; çünkü hâlinin hepsinde hayır vardır: hoşuna giden bir şey olunca şükür, sıkıntı gelince sabır. Şükür ve sabır, karşıt değil, tek bir hayatın iki yüzü olarak sunulur.',
        ],
        visual: { kind: 'compare', title: 'Tek bir hayatın iki yüzü (Sahîh-i Müslim 2999)',
          left: { label: 'Hoşuna giden bir şey olduğunda', items: ['Fark et', 'Şükret', 'İyiliği paylaş'] },
          right: { label: 'Sıkıntı geldiğinde', items: ['Dürüstçe adlandır', 'Sabırla dayan', 'Dua ve insanlar aracılığıyla yardım ara'] },
          note: 'Hadis sunnah.com’dan özetlenmiştir; maddeler ODA’nın yorumudur, hüküm değildir.' } },
      { heading: 'Dinî başa çıkma hakkında araştırma ne diyor?',
        paragraphs: [
          'Psikolog Kenneth Pargament, olumlu dinî başa çıkmayı — manevî bağ aramak, sorunlarla Tanrı ile ortaklık içinde yüzleşmek ya da din görevlilerinden destek aramak gibi — olumsuz dinî başa çıkmadan, yani Tanrı’dan hoşnutsuzluktan ya da zorluğu ceza olarak görmekten ayırır. 49 çalışmalık 2005 tarihli bir meta-analiz, olumlu dinî başa çıkmanın daha iyi sonuçlarla orta düzeyde, olumsuz dinî başa çıkmanın ise daha fazla sıkıntıyla ilişkili olduğunu buldu.',
          'Bu çalışmalar nedenleri değil ilişkileri gösterir ve katılımcıların çoğu Hristiyandı. Kendini cezalandırılmış ya da Allah’tan uzak hissediyorsan bu bir iman kusuru değildir; bilgili bir imamla ve bir ruh sağlığı uzmanıyla paylaşmaya değer, ağır bir deneyimdir.',
        ],
        visual: { kind: 'bars', title: 'Dinî başa çıkma ve uyum: ortalama korelasyonlar',
          bars: [
            { label: 'Olumlu başa çıkma ↔ olumlu sonuçlar', value: 0.33, display: 'r = 0,33' },
            { label: 'Olumsuz başa çıkma ↔ sıkıntı', value: 0.22, display: 'r = 0,22' },
          ],
          note: 'Ano & Vasconcelles 2005, 49 çalışma, 13.512 kişi. Çoğunlukla kesitsel ve yaklaşık %85’i Hristiyan örneklemler: ilişkiler, nedenin kanıtı değil. Psikoloji araştırması; kutsal metinden ayrı gösterilir.',
          sourceId: 'faith-religious-coping' } },
    ],
    example: { title: 'Leyla, 39, eczane kasiyeri',
      text: 'Babası hastalandığından beri Leyla her akşam işten sonra hastaneye gidiyor ve herkese iyi olduğunu söylüyordu. Bir gece, imanı daha güçlü olsaydı bu kadar yorgun hissetmeyeceğini düşünürken yakaladı kendini. O düşüncede durdu. Bugün neye ihtiyacı olduğunu kendine sordu ve tek bir cümle yazdı: “Bugün uyuyabilmem için babamın yanında oturacak birine ihtiyacım var.” Kuzenine mesaj attı; kuzeni hemen evet dedi. O gece Leyla kendi sözleriyle dua etti, yedi saat uyudu ve ertesi hafta için hastanenin danışmanından randevu aldı. Babasının hastalığıyla ilgili hiçbir şey değişmemişti. Ama artık hepsini tek başına taşımıyordu.' },
    sources: ['faith-quran-patience', 'faith-hadith-believer', 'faith-religious-coping'],
  },
  'faith-5': {
    deeper: [
      { heading: 'Küçük ama devamlı işler',
        paragraphs: [
          'Sahîh-i Buhârî’deki, Âişe’den rivayet edilen bir hadis, Allah’a en sevimli işin az da olsa en düzenli yapılan olduğunu söyler ve iyiliği samimiyetle ve ölçülü yapmayı öğütler. Tirmizî’nin derlemesindeki bir diğeri, kardeşine gülümsemeyi, yolunu şaşırana yol göstermeyi ya da yoldan diken veya taş kaldırmayı sadaka sayar.',
          'Bunlar birlikte, sıradan günlere sığan bir iyilik tablosu çizer: boyutu mütevazı, tekrar eden ve iyi bir niyetle yapılan — bu da seni ilk derse geri götürür.',
        ],
        visual: { kind: 'table', title: 'Gündelik sadaka, o zaman ve şimdi',
          columns: ['Hadisten (özetlenmiştir)', 'Çağdaş bir karşılığı'],
          rows: [
            ['Kardeşine gülümsemek', 'Bir iş arkadaşını sıcak biçimde selamlamak'],
            ['Yolunu şaşırana yol göstermek', 'Birinin doğru formu ya da otobüsü bulmasına yardım etmek'],
            ['Yoldan zararı kaldırmak', 'Ortak bir merdivenden tehlikeli bir şeyi kaldırmak'],
            ['Kovandan başkasının kovasına boşaltmak', 'Fazlasına sahip olduğun şeyi paylaşmak'],
          ],
          note: 'Tirmizî 1956 ve Buhârî 6464, sunnah.com’dan özetlenmiştir. Çağdaş karşılıklar ODA’nın örnekleridir.' } },
      { heading: 'İyilik hakkında araştırma ne diyor — ayrı olarak',
        paragraphs: [
          'Psikologlar, iyiliğin, onu yapan kişiye ne yaptığını da incelemiştir. 4.045 katılımcılı 27 çalışmayı kapsayan 2018 tarihli bir meta-analiz, iyilik eylemleri yapmanın, yapanın iyi oluşu üzerinde küçük ile orta arası olumlu bir etkisi olduğunu buldu.',
          'Bu, kısa sürelerde ölçülmüş ruh hâli ve iyi oluşa dair bir bulgudur. Dinî anlamda karşılık hakkında bir şey söylemez ve yalnızca kendini iyi hissettirdiğinde iyi olmak için bir sebep değildir.',
        ] },
    ],
    example: { title: 'Nadire, 44, ofis müdürü',
      text: 'Nadire’nin ilk fikri iddialıydı: her hafta sonu gıda bankasında gönüllü olmak. Gerçek haftasına bakınca — iki çocuk, uzun bir işe gidiş gelişi, yaşlanan bir anne — bunun bir ay bile sürmeyeceğini anladı. Daha küçük bir şey seçti: her çarşamba annesinin yalnız yaşayan yaşlı komşusunu arayıp sadece nasıl olduğunu soracaktı. Bunu yemekten sonra, akşam 18.30’da takvimine koydu. İlk görüşme sekiz dakika sürdü ve çoğunlukla havadan konuşuldu. Üçüncü görüşme yirmi dakika sürdü ve komşu, bütün hafta kimseyle konuşmadığını söyledi. Nadire teşekkür beklemiyordu ama çarşambaları iple çekmeye başladığını fark etti. Arama takviminde kaldı.' },
    sources: ['faith-hadith-consistent', 'faith-hadith-smile', 'faith-kindness'],
  },
};
