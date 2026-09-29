import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/confidence.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'confidence-fear-ladder', title: 'Psychology Tools · Korku merdiveni (aşamalı yüzleşme hiyerarşisi)', url: 'https://www.psychologytools.com/resource/fear-ladder', type: 'guidance', finding: 'Kaygı için bilişsel davranışçı terapide kullanılan korku merdivenini anlatan bir klinisyen kaynağıdır: korkuyu belirle, korkulan durumları listele, her birine tahmini bir korku puanı ver, en az korkutucudan en çok korkutucuya sırala ve alt basamaklardan başlayarak aşamalı yüzleşmeye geç, zamanla yukarı çık. Kişi bunalırsa hızın ayarlanması gerektiğini ve sürece genellikle bir terapistin eşlik ettiğini belirtir.', limitation: 'Klinisyenlere yönelik pratik bir rehberdir, bir çalışma değildir; yüzleşmenin terapide nasıl yapıldığını anlatır, kendi kendine uygulanan bir sürümünü sınamaz. Bu kurs fikri yalnızca gündelik ve güvenli zorluklar için kullanır.' },
  { id: 'confidence-five-second-rule', title: 'Mel Robbins · 5 Saniye Kuralı (2017) · “Motivasyon çöptür” podcast bölümü', url: 'https://www.melrobbins.com/episode/episode-3/', type: 'technique', finding: 'Robbins, “5, 4, 3, 2, 1” diye geriye sayıp hemen harekete geçmeyi anlatır; böylece bir dürtü ile korku, bahaneler ve kendinden şüphenin seni vazgeçirdiği an arasındaki kısa aralıkta harekete geçersin. Önce eylemin geldiğini, motivasyonun ardından geldiğini savunur.', limitation: 'Yazarın kendi podcast sayfasıdır. 5 Saniye Kuralı’nın kendisini sınayan kontrollü bir çalışma bulamadık; kanıt çoğunlukla kişisel hikâyelerdir. Kullanışlı özü, küçük ve planlı bir eylemi başlatan net bir işaret, eğer/o zaman planlamasıyla örtüşür.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'confidence-1': {
    deeper: [
      {
        heading: 'Etiketler neden bu kadar yapışkan?',
        paragraphs: [
          'Etiket verimlidir. “Söz almakta kötüyüm” demek, her durumu tek tek incelemenin zahmetinden seni kurtarır ve seni koruyor gibi de görünür: zaten başarısız olmayı bekliyorsan hiçbir şey seni şaşırtamaz. Bedeli, etiketin tutulacak bir sapı olmamasıdır. “Işe yaramaz olmamayı” çalışamazsın ama “Pazartesi toplantısında tek bir cümle söylemeyi” çalışabilirsin.',
          'Kendinle bir arkadaşınla konuşur gibi konuşmak, iyi hissetmek için bir numara değildir. Öz şefkat müdahaleleri 56 randomize denemede stres ve kaygıda küçük ile orta düzeyde kısa vadeli azalmalar gösterdi, ama çalışmaların genel yanlılık riski yüksekti. Daha sakin ve daha adil bir iç ses, gerçekte ne olduğunu görmen için daha çok yer bırakır.',
        ],
        visual: {
          kind: 'table', title: 'Bir etiketi duruma çevirmek', columns: ['Etiket', 'Durum + his', 'Olası sonraki adım'],
          rows: [
            ['Ben beceriksizim.', 'Yabancılarla dolu partilerde diken üstünde hissediyorum.', 'Birine soracağım bir soru hazırla'],
            ['Ben korkağım.', 'Yöneticim benimle aynı fikirde olmayınca geri çekildim.', 'Söylemek istediğim noktayı yaz'],
            ['Bu işte çaresizim.', 'Sunumda ilk denemede yerimi kaybettim.', 'Girişi yüksek sesle iki kez çalış'],
          ],
          note: 'Ortadaki sütun hissi dürüstçe söyler; sağdaki sütun ona gidecek bir yer verir.',
        },
      },
      {
        heading: 'Bedeninin payı',
        paragraphs: [
          'Albert Bandura, bir şeyi yapabileceğine dair inancın, yani öz yeterliğin dört kaynağı arasında beden durumunu da saydı. Hızlı atan bir kalp, kuruyan bir ağız ya da titreyen bir ses kolayca kanıt gibi okunabilir: “Gördün mü, bunu yapamıyorum.” Ama çarpan bir kalp, sadece bir şeyin senin için önemli olduğu anlamına da gelebilir. Bu, o anla ilgili bir bilgidir; yeteneğine dair bir hüküm değil.',
          'Bu yüzden durumu anlatırken bedeni de dahil edebilir, ama karar vermesine izin vermezsin: “Kalbim çarpıyordu ve yine de cümlemi söyledim.” İkisi de doğru ve birlikte “tam bir sinir küpüydüm” cümlesinden çok farklı bir hikâye anlatırlar.',
        ],
      },
    ],
    example: { title: 'Olivia, 33, laboratuvar teknisyeni', text: 'Olivia ekip toplantılarında nadiren konuşurdu ve sonra “Ben zaten özgüvenli biri değilim” diye düşünürdü. Salı akşamı alıştırmayı denedi. Güvenli durum: amirinin yorum istediği haftalık laboratuvar toplantısı. Etiket: “Gruplarda çaresizim.” Şöyle yeniden yazdı: “Haftalık toplantıda herkes bana baktığında yüzümün kızardığını hissediyorum ve donuyorum.” Sonra aynı durumdaki arkadaşı Mei’ye ne diyeceğini sordu ve yazdı: “Pek çok insan bütün gözler üzerindeyken donar. Sen işini biliyorsun.” Bir sonraki toplantıda hiçbir şey değişmedi. Ama yüzü kızardığında “işte kanıt” yerine “işte sıcaklık” diye düşündü ve bu biraz daha hafif geldi.' },
    sources: ['bandura-self-efficacy'],
  },
  'confidence-2': {
    deeper: [
      {
        heading: 'Üç sürümden bir merdivene',
        paragraphs: [
          'Kolay–orta–zor alıştırması, terapistlerin kullandığı korku merdiveni ya da yüzleşme hiyerarşisi denen aracın küçük bir sürümüdür. Tek bir korkuyla bağlantılı durumları listelersin, her birinin ne kadar korkutucu hissettireceğini tahmin edersin ve en azdan en çoğa sıralarsın. Sonra alta yakın bir yerden başlar ve ancak bir adım baş edilebilir gelmeye başladığında yukarı çıkarsın. Kaygı için bilişsel davranışçı terapide bu aşamalı yaklaşım temel araçlardan biridir.',
          'Gündelik özgüven için aynı biçim daha küçük ölçekte işler. 0 (korku yok) ile 10 (hayal edebileceğin en çok) arasında bir puan yeter. İlk denemelerini 3 ya da 4 gibi gelen basamaklara yönelt: rahatsız edici ama yapılabilir. Bir adım 9 çıkarsa bu başarısızlık değil; altına bir basamak eklemen gerektiğini söyler.',
        ],
        visual: {
          kind: 'steps', title: 'Örnek bir özgüven merdiveni: işte söz almak',
          steps: [
            { label: 'Korku 2', text: 'Toplantıdan önce tek bir yorum yaz.' },
            { label: 'Korku 4', text: 'Yorumu toplantıdan sonra bir meslektaşınla paylaş.' },
            { label: 'Korku 5', text: 'Küçük bir toplantıda bir soru sor.' },
            { label: 'Korku 7', text: 'Tüm ekibin katıldığı toplantıda görüşünü söyle.' },
            { label: 'Korku 9', text: 'Bütün bölüme kısa bir bilgilendirme sun.' },
          ],
          note: 'Yalnızca mevcut basamak baş edilebilir gelince yukarı çık. Yoğun ya da travmaya dayanan kaygıda merdiveni eğitimli bir terapistle kur ve tırman.',
        },
      },
      {
        heading: 'Yapmak neden beklemekten iyi?',
        paragraphs: [
          'Albert Bandura, ustalık deneyimlerini, yani gerçekten yaptığın şeyleri, bir şeyi yapabileceğine dair inancın en güçlü kaynağı olarak gördü. Başkalarını izlemek, cesaret verici sözler ve sakin bir beden de yardımcı olur ama hiçbiri kendi deneyiminin ağırlığını taşımaz. Korku geçene kadar beklemek, onu azaltacak şeyin tam kendisini atlamaktır.',
          'Adımın senin olması gerekmesinin nedeni de bu. Birinin seni ittiği ya da başa çıkabileceğinin çok ötesine geçen bir deneme, öğrenmekten çok kaçışla bitme olasılığı taşır. Kendi seçtiğin, bitirebileceğin düzeydeki bir adım, güvenebileceğin bir kanıt bırakır.',
        ],
      },
    ],
    example: { title: 'Ben, 24, mağaza satış elemanı', text: 'Ben yöneticisinden daha fazla saat istemek istiyordu ama hep donup kalıyordu. Üç kutu çizdi. Zor: mağaza katında yüz yüze sormak. Orta: beş dakika konuşmak için kısa bir mesaj göndermek. Kolay: tam olarak ne istediğini ve nedenini yazmak. Kolay neredeyse hile gibi geldi ama öğle molasında personel odasında oturup yaptı: “Haftada dört saat daha istiyorum, tercihen Cumartesi; bu ay iki kez yerine baktım.” Orta adımı 6 olarak puanladı ve bir gün beklemeye karar verdi. Perşembe günü mesajı gönderdi. Gönder’e bastığında elleri soğuktu. Yönetici “Tabii, Cuma kapanıştan sonra” diye yanıt verdi. Asıl konuşma hâlâ ileride idi ama artık arkasında iki adım vardı.' },
    sources: ['confidence-fear-ladder', 'bandura-self-efficacy'],
  },
  'confidence-3': {
    deeper: [
      {
        heading: 'Bandura’nın dört kaynağı, denemene uygulanmış hâliyle',
        paragraphs: [
          'Bandura öz yeterliği besleyen dört kaynak tanımladı: ustalık deneyimleri, başkalarını izlemek, başkalarından gelen cesaret verici sözler ve beden durumu. Denediğin her deneme dördünden de yararlanabilir, ama yalnızca fark edersen. Kamera tarzı bir kayıt, ilkine ve en güçlü olana yardım eder: bulanık bir anıyı net bir “Bunu yaptım” cümlesine çevirir.',
          'Bandura ayrıca, tekrarlanan başarıyla kurulmuş bir inancın ara sıra yaşanan aksaklıklarla daha az sarsıldığını yazdı. Kaydetmenin tek bir sonuçtan daha önemli olmasının nedeni bu. Yolunda giden beş kayıtlı konuşmanın yanında tek bir beceriksiz konuşma, olduğu şey gibi görünür: tek bir veri noktası.',
        ],
        visual: {
          kind: 'table', title: 'Bir cesaret denemesinde öz yeterliğin dört kaynağı', columns: ['Kaynak', 'Denemenden sonra nelere bakmalı?'],
          rows: [
            ['Ustalık deneyimi', 'Gerçekte ne yaptım? Notu değil, davranışı yaz.'],
            ['Başkalarını izlemek', 'Başka birinin benzer bir şeyi kusurlu da olsa yapıp ayakta kaldığını gördüm mü?'],
            ['Cesaret verici sözler', 'Biri nazikçe karşılık verdi mi, ya da kendime adil bir cümle söyleyebilir miyim?'],
            ['Beden durumu', 'Heyecan zirve yapıp sonra yatıştı mı? Ne zaman?'],
          ],
          note: 'Bandura ustalık deneyimini en güçlü kaynak olarak gördü. Bu tablo bir düşünme yardımcısıdır, tedavi planı değil.',
        },
      },
      {
        heading: 'Tekrar oynatma tuzağı',
        paragraphs: [
          'Sosyal bir andan sonra pek çok insan onu tekrar tekrar oynatır ve tek bir beceriksiz saniyeye yakınlaşır. Her tekrar öğrenmek gibi hissettirir ama çoğunlukla başladığın tahmini güçlendirir. Kamera sorusu bunu keser: iki gözlem ister, sonra durmana izin verir.',
          'Geniş bir meta-analizde ilerlemeyi yazılı takip etmek daha iyi hedef başarısıyla, fiziksel olarak kaydetmek ise daha büyük bir yararla ilişkiliydi. Tekrar oynatma bir kayıt değildir. Kayıt kısa, olgusal ve bitmiştir; defteri kapatabilirsin.',
        ],
      },
    ],
    example: { title: 'Lucas, 30, yazılım geliştirici', text: 'Lucas bir konferansın soru–cevap bölümünde soru sormuştu; haftalık denemesi buydu. Salondan çıkarken zihni bunu çoktan yeniden oynatıyordu: sesi çatallanmıştı ve herkes kesin fark etmişti. O gece notlarını açtı ve öncesindeki tahminini yazdı: “Kekeleyeceğim, konuşmacı küçümseyecek, insanlar dik dik bakacak.” Sonra iki kamera gözlemi: “Geçiş takvimini sordum. Konuşmacı iyi bir soru olduğunu söyledi ve yaklaşık bir dakika yanıtladı.” Ekledi: “Sesim ilk kelimede çatallandı.” Üç satırı birlikte okuyunca çatallanma diğerlerinin yanında küçük göründü. Bir dahaki sefer için bir satır daha yazdı: “Aynı türden bir soru, daha küçük bir oturumda.”' },
    sources: ['bandura-self-efficacy'],
  },
  'confidence-4': {
    deeper: [
      {
        heading: 'Öz şefkat araştırması ne gösteriyor?',
        paragraphs: [
          '56 randomize denemede öz şefkat müdahaleleri stres, kaygı ve depresif belirtilerde küçük ile orta düzeyde kısa vadeli azalmalar gösterdi. Bu gerçek ama mütevazı bir etki ve çalışmaların genel yanlılık riski yüksekti; bu yüzden bulguyu hafif tutmak adil. Ayrıca bir erteleme çalışmasıyla da uyuyor: bir sınavı ertelediği için kendini daha çok affeden öğrenciler bir sonrakinden önce daha az erteledi.',
          'Şöyle düşünmek işe yarar: sertlik de nezaket de aynı şeyi hedefler, bir dahaki sefer daha iyisini yapmak; ama sertlik üstüne korku ekler ve korku bir sonraki denemeyi daha riskli hissettirir. Adil ve sıcak bir cümle dersi yerinde bırakır, fazladan tehdidi alır.',
        ],
      },
      {
        heading: 'Abartılı olumlamalar neden ters tepebilir?',
        paragraphs: [
          'Bandura cesaret verici sözleri öz yeterliğin kaynakları arasında saydı ama onları kendi deneyiminden daha zayıf gördü. Bir tökezlemenin hemen ardından kendine “Her şeyde harikayım” demek, az önce yaşadıklarınla çatışır ve buna inanmayı zorlaştırabilir.',
          'Gerçekçi destek kanıta karşı değil, kanıtla birlikte çalışır. Ne olduğunu adlandırır, emeği fark eder ve bir sonraki adımı gösterir. Aşağıdaki iki sütunu karşılaştır ve kötü bir günde hangilerine gerçekten inanabileceğine bak.',
        ],
        visual: {
          kind: 'compare', title: 'Abartı mı, gerçekçi destek mi?',
          left: { label: 'Abartı', items: ['“Mükemmelim ve hiçbir şey ters gitmedi.”', '“O hatayı bir daha asla yapmayacağım.”', '“Herkes bayıldı.”'] },
          right: { label: 'Gerçekçi destek', items: ['“Bu zordu ve yine de yaptım.”', '“Bir dahaki sefer hangi kısmı düzelteceğimi biliyorum.”', '“Bir kişi ilgili görünüyordu; bu bir başlangıç.”'] },
          note: 'Cesaret verme, gerçekte olanla uyuştuğunda en inanılır olandır.',
        },
      },
    ],
    example: { title: 'Fatima, 42, okul idarecisi', text: 'Fatima velilere gönderdiği e-postada okul gezisinin tarihini yanlış yazmıştı. Bir veli yanıtlayıp bunu belirttiğinde midesi düştü ve tanıdık ses başladı: “Nasıl bu kadar dikkatsiz olabilirsin? Herkes işini yapamadığını düşünecek.” Cümleyi fark etti ve onunla tartışmadı. Usulca dedi ki: “Bu zordu. Tarihte bir hata yaptım.” Sonra adil kısmı: “Bir saat içinde düzeltebilirim.” Tüm velilere kısa bir düzeltme gönderdi, fark eden veliye teşekkür etti ve e-posta şablonuna bir tarih kontrolü ekledi. Mahcubiyet öğleden sonra boyunca sürdü. Ama enerjisini hükme değil, onarıma harcamıştı.' },
    sources: ['bandura-self-efficacy', 'self-forgiveness'],
  },
  'confidence-5': {
    deeper: [
      {
        heading: 'Dürüstçe 5 Saniye Kuralı',
        paragraphs: [
          'Mel Robbins, tereddüt anı için basit bir hareketi yaygınlaştırdı: beşten geriye say ve birde fiziksel olarak eyleme doğru hareket et. Fikrine göre bir dürtü ile harekete geçmemek için üşüşen gerekçeler arasında kısa bir aralık var ve geri sayım onu kullanmana yardım ediyor. Pek çok insan bunu yararlı bir dürtme olarak buluyor.',
          'Kanıt konusunda net olmakta yarar var: 5 Saniye Kuralı’nın kendisini sınayan kontrollü bir çalışma bulamadık ve desteği çoğunlukla kişisel hikâyelerden geliyor. Kullanışlı özü, yerleşik bir işareti olan bir eğer/o zaman planına çok benziyor: “Kendimi tereddüt ederken fark edersem, o zaman geriye sayıp ilk küçük eylemi yapacağım.” Bu biçimde, zaten seçtiğin ve güvenli olan bir adım için kullanıldığında düşük maliyetli bir deneme.',
        ],
      },
      {
        heading: 'Merdiveni sürdürmek',
        paragraphs: [
          'Özgüven eşit olmayan biçimde büyür. Bazı haftalar bir basamak çıkarsın; bazı haftalar hayat ağırlaştığı için yerinde kalır ya da bir basamak inersin. Kısa bir haftalık gözden geçirme, bunu not vermeye dönüştürmeden seni dürüst tutar. İlerleme izleme araştırmalarında yazılı kayıtlar daha büyük bir yararla ilişkiliydi; bu yüzden kâğıda yazılan birkaç satır iki dakikaya değer.',
          'Gözden geçirmeyi bir sonraki basamağı seçmek için kullan, sonuncuyu yargılamak için değil. Bir adım üst üste iki kez 3 gibi geldiyse yukarı çıkma zamanı gelmiş olabilir. 8 gibi geldiyse altına daha küçük bir adım ekle. Her iki durumda da cesaretinin nasıl çalıştığını öğreniyorsun.',
        ],
        visual: {
          kind: 'table', title: 'İki dakikalık haftalık gözden geçirme', columns: ['Soru', 'Örnek cevap'],
          rows: [
            ['Ne denedim?', 'Küçük toplantıda bir soru sordum.'],
            ['0–10 arası ne kadar korkutucuydu?', 'Önce: 6. Sonra: 3.'],
            ['Bir kamera ne görürdü?', 'Sordum; yöneticim not aldı.'],
            ['Sonraki basamak?', 'Aynı adımı bir kez daha, sonra tüm ekibin olduğu toplantıda bir yorum.'],
          ],
          note: 'Puanlar bir sonraki adımı seçmek içindir, kendine not vermek için değil.',
        },
      },
    ],
    example: { title: 'Rosa, 57, yıllar sonra çalışma hayatına dönen', text: 'Rosa kütüphanedeki diğer gönüllülere kendini tanıtmak istiyordu ama her hafta içeri süzülüyor, kitapları ayırıyor ve çıkıyordu. Planı: Cumartesi günü bir gönüllüye merhaba deyip adını söylemek. Başlangıç planı: “Kaçıp gitmek istersem, önce beşten geriye sayıp ‘Merhaba, ben Rosa’ diyeceğim.” Destek: Cumartesi akşamı arayacak olan kızı. Cumartesi günü kendini arka odaya doğru giderken yakaladı. Saydı, döndü ve iade masasındaki kadına söyledi. Kadın gülümsedi, kendi adını söyledi ve işine döndü. Hepsi buydu. Rosa iki dakikalık gözden geçirmesinde şunu yazdı: “Önceki korku: 7. Sonra: 3. Sıradaki: birine ne zamandır gönüllü olduğunu sormak.”' },
    sources: ['confidence-five-second-rule', 'confidence-fear-ladder'],
  },
};
