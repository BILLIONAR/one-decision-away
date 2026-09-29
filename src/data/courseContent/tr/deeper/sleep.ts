import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';

// Türkçe "Derinleş" bölümleri ve örnekler — kaynak: ../../en/sleep.ts (ders id'leri aynı).
export const SOURCES: CourseSource[] = [
  { id: 'sleep-cbti-overview', title: 'Sleep Foundation · Newsom (Dimitriu, MD tarafından gözden geçirildi) · 2026 · Uykusuzluk için bilişsel davranışçı terapi (BDT-U): nasıl işler', url: 'https://www.sleepfoundation.org/insomnia/treatment/cognitive-behavioral-therapy-insomnia', type: 'guidance', finding: 'BDT-U’nun bölümlerini anlatır: uyaran kontrolü (yatağı yalnızca uyku ve cinsellik için kullan, uyuyamadığında, burada yaklaşık 10 dakika sonra, yatak odası ile uyanıklık arasındaki bağı koparmak için yataktan kalk); uyku kısıtlaması (uyku isteğini artırmak için yatakta geçen süreyi sınırlamak; bipolar bozukluk ya da nöbet gibi uyku kaybının kötüleştirebileceği durumları olanlara önerilmez); uyku hijyeni; nefes egzersizleri ve ilerleyici kas gevşetme gibi gevşeme yöntemleri; ve bilişsel yeniden yapılandırma. Geçmiş kötü gecelerin uykuya dalmaya dair endişeye ve uykuyu zorlamak için yatakta fazladan zaman geçirmeye yol açtığı, bunun da uykuya dalmayı zorlaştırdığı gecelik bir döngüyü anlatır. BDT-U genellikle altı ila sekiz seans sürer ve dijital sürümleri de vardır.', limitation: 'Bir çalışma değil, sağlık bilgi sitesindeki tıbbi olarak gözden geçirilmiş bir genel bakış. 10 dakikalık rakamı AASM’nin 20 dakikasından farklıdır; bu da bunların pratik yönergeler olduğunu gösterir. Etkililik yüzdeleri sayfada adı geçen bir çalışmaya bağlanmadığı için bu kurs onları kullanmaz.' },
];

export const EXTRAS: Record<string, LessonExtra> = {
  'sleep-1': {
    deeper: [
      { heading: 'Kalkış saati neden önce gelir', paragraphs: [
        'Hem CDC hem AASM her gün aynı saatte kalkmayı önerir; AASM özellikle hafta sonlarını da katar. Ne zaman kalkacağını, ne zaman uykuya dalacağından çok daha güvenilir biçimde kontrol edebilirsin; bu yüzden sabit bir kalkış saati en pratik çapadır. Yatış saatin de geceden geceye kaymak yerine bundan çıkar.',
        'Yatağa girdiğin saat ile kalktığın saat arasındaki boşluk uyku penceren: kendine uyuma için verdiğin fırsat. Kalkış saatinden geriye saymak bu pencereyi görünür kılar ve 7 saatin gerçekten sığıp sığmadığını hemen gösterir.',
      ],
        visual: { kind: 'steps', title: 'Kalkış saatinden geriye saymak',
          steps: [
            { label: 'Kalkış saatini belirle', text: 'Örneğin sabah 6.30; hafta içi ve hafta sonu aynı.' },
            { label: '7 saat geriye say', text: 'Bu seni uyumuş olman gereken en geç saat olarak 23.30’a getirir.' },
            { label: 'Uykuya dalma payı ekle', text: 'Uykuya dalman için biraz zaman bırak; ışıklar yaklaşık 23.15’te kapansın.' },
            { label: 'Bir hafta kontrol et', text: 'Ne zaman yattığını ve kalktığını not et; gerekirse ayarla.' },
          ],
          note: 'Uygulamalı bir örnek, reçete değil. 7 saatlik taban CDC ve AASM uzlaşısından gelir; uykuya dalma süren kişiseldir.' } },
      { heading: 'Rakamlar sana neyi söyler, neyi söylemez', paragraphs: [
        '7 saatlik rakam, büyük bir kısmı gözlemsel olan geniş bir araştırma yığınına bakan uzmanların uzlaşısıdır. Bu, bir öneri için makul bir temel; ama 6 saat 50 dakikanın zararlı olduğu ya da herkesin tam aynı miktara ihtiyaç duyduğu anlamına gelmez. CDC’nin aralıkları da yaşa göre biraz değişir.',
        'En çok önemli olan, tek bir gece değil, haftalar boyunca görülen örüntüdür. Düzenli olarak epey eksik kaldığını fark edersen bu işe yarar bir bilgidir ve bu kurs tam da bu tür örüntü üzerinde çalışmana yardım eder.',
      ] },
    ],
    example: { title: 'Daniel, 41, depo amiri', text: 'Daniel’in çalar saati iş günlerinde 5.45’te çalıyordu, ama hafta sonları 9’a kadar uyuyor, sonra pazar gecesi geç saate kadar uyanık yatıyordu. Vardiyası 7’de başladığı için her gün tutabileceği bir kalkış saati olarak 6.15’i seçti. 7 saat geriye sayınca 23.15 çıktı; o yüzden ışıkları 23’te kapatmayı hedefledi. İki saati dolabının kapağının içine yapışkan bir nota yazdı ve telefonunda kısa bir kayıt tuttu. İlk cumartesi 6.15’te isteksizce kalktı ve öğleden sonra kanepede kestirdi. İkinci hafta sonuna gelince daha kolaydı ve pazar gecesi artık bir savaş gibi hissettirmiyordu. Dramatik bir şey değişmedi; haftası sadece daha az sarsıntıyla başlıyordu.' },
  },
  'sleep-2': {
    deeper: [
      { heading: 'Yönergeler yan yana', paragraphs: [
        'Saygın üç kuruluş biraz farklı rakamlar veriyor; bu, bunların kesin eşikler değil pratik yönergeler olduğunu hatırlatmak için işe yarıyor. Hiçbiri ekransız 29 dakikanın başarısız, 31 dakikanın başarılı olduğunu söylemez. Hepsi aynı yönü gösteriyor: gün boyunca daha çok ışık, akşamın son bölümünde daha az ışık ve uyarı.',
        'Bir saat ekransız kalmak imkânsız geliyorsa, 30 dakika yine CDC ve AASM önerisiyle uyumlu. Oradan başlayıp bir fark görürsen sonra uzatabilirsin.',
      ],
        visual: { kind: 'table', title: 'Her rehber ne öneriyor',
          columns: ['Rehber', 'Gündüz', 'Akşam'],
          rows: [
            ['NSF', 'Sabah ya da öğleden sonra en az bir saat dışarıda', 'Işıkları kıs; ekranları yatmadan en az bir saat önce kapat'],
            ['CDC', 'Belirtilmemiş', 'Ekranları yatmadan en az 30 dakika önce kapat'],
            ['AASM', 'Belirtilmemiş', 'Ekranları yatmadan en az 30 dakika önce kapat'],
          ],
          note: 'NSF, CDC ve AASM’nin kamuya açık sayfalarından. Bunlar pratik öneriler; sınanmış kesme noktaları değil.' } },
      { heading: 'Sık yapılan hatalar', paragraphs: [
        'En yaygını ya hep ya hiç düşüncesi: ilk günden bir saat dışarı çıkmaya, bütün ekranları kesmeye ve bütün akşamı değiştirmeye çalışıp iki gün sonra vazgeçmek. Gerçekten sürdürdüğün küçük bir değişiklik, bıraktığın kusursuz bir plandan daha çok işe yarar.',
        'Bir diğeri, yerine hiçbir şey koymadan telefonu almak. Ekran çoğu zaman gerçek bir ihtiyacı karşılar: gevşemek, arkadaşlık ya da kaygılardan uzaklaşmak. Loş ışıkta bir kitap, hafif esneme ya da müzik akşama bir boşluk değil yeni bir biçim verir.',
      ] },
    ],
    example: { title: 'Ana, 29, müşteri hizmetleri temsilcisi', text: 'Ana bütün gün içeride çalışıyor ve yatakta uykusu gelene kadar, çoğu zaman gece yarısını geçerek telefonunda geziniyordu. Her şeyi değiştirmeye çalışmadı. Hafta içi öğle molasını ofisin dışındaki bir bankta, yaklaşık yirmi dakika, ayrıca otobüs durağına kısa bir yürüyüşle geçirmeye başladı. Akşam, her zamanki yatış saatinden yarım saat önce, 22.30’a bir hatırlatıcı kurdu ve telefonunu mutfaktaki bir şarj cihazına taktı. İlk birkaç gece huzursuz geçti; bu yüzden komodininde bir roman ve küçük bir lamba tuttu. Bazı akşamlar yine de kayıp mesajlara baktı. İki hafta sonra telefon çoğu gece mutfakta kalıyordu ve uykuya dalmak biraz daha az beklemek gibi geliyordu.' },
  },
  'sleep-3': {
    deeper: [
      { heading: 'Akşam zaman çizelgeni kurmak', paragraphs: [
        'NHS, AASM ve CDC her biri farklı bir alışkanlık için yatıştan önceki bir süre veriyor. Tek bir zaman çizelgesine yerleştirildiğinde, birinci dersin kalkış saatinden çalıştığı gibi, yatış saatinden geriye doğru giden basit bir akşam programına dönüşüyorlar.',
        'Aşağıdaki saatler örnek olarak 23.00 yatış saatini kullanıyor. Yatış saatin farklıysa her satırı aynı miktarda kaydır. Her satırı aynı anda benimsemen gerekmez; tek net bir sınır iyi bir başlangıç.',
      ],
        visual: { kind: 'table', title: '23.00 yatış saati için akşam zaman çizelgesi',
          columns: ['Alışkanlık', 'Rehber', 'Sınır'],
          rows: [
            ['Çay, kahve, alkol, sigara', 'En az 6 saat önce (NHS)', '17.00'],
            ['Egzersiz', 'En az 4 saat önce (NHS)', '19.00'],
            ['Gevşemeye başlamak', 'En az 1 saat önce (NHS)', '22.00'],
            ['Ekranları kapatmak', 'En az 30 dakika önce (CDC, AASM)', '22.30'],
          ],
          note: 'Saat aralıkları NHS uykusuzluk rehberinden ve AASM ile CDC sayfalarından gelir; saatler uygulamalı bir örnektir. Bunlar pratik alışkanlıklar, sınanmış eşikler değil.' } },
      { heading: 'Kendi izlenimin seni neden yanıltabilir', paragraphs: [
        'Drake çalışmasında, insanların kendi uyku değerlendirmeleri ölçümlerin gösterdiğiyle tam örtüşmedi. Biri öğleden sonra kahvesinin ardından uykuya dalabilir ve yine de olacağından daha az uyuyabilir. Bu yüzden basit bir deney, bir önseziden daha bilgilendirici olabilir: son kahveni bir hafta boyunca erkene al ve sabahlarının nasıl olduğuna bak.',
        'Kafein yalnızca kahvede değil. Siyah ve yeşil çay, kola ve enerji içeceklerinde de var, çok farklı miktarlarda. Bir günlük kayıt çoğu zaman şaşırtıcıdır, çünkü birkaç küçük içecek bir güçlü fincandan fazlasını tutabilir.',
      ] },
    ],
    example: { title: 'Tom, 38, lise öğretmeni', text: 'Tom kafeinin kendisini hiç rahatsız etmediğini düşünüyordu. Kahvaltıda bir kahve, öğle yemeğinde bir tane daha ve saat 19.00 sularında kâğıt okurken bir kola içiyordu. Bir gün boyunca içtiği her kafeinli içeceği yazdı ve akşam kolasına şaşırdı. Yatış saati 23’tü; 6 saat geriye sayıp son kafein saatini 17.00 yaptı. Akşam kolasını gazlı suyla değiştirdi ve koşusunu 20.00’den okul çıkışına aldı. İlk akşamlar kâğıt okurken o küçük canlanmayı özledi. Yaklaşık on gün sonra biraz daha erken uykuya daldığını fark etti, gerçi bazı geceler hâlâ huzursuzdu. Değişikliğin sürdürmeye değer olduğuna karar verdi.' },
    sources: ['sleep-habits', 'cdc-sleep'],
  },
  'sleep-4': {
    deeper: [
      { heading: 'Endişe–uyanıklık döngüsü', paragraphs: [
        'Uykusuzluk için bilişsel davranışçı terapiye (BDT-U) genel bakışlar, birçok kişinin tanıdığı bir örüntüyü anlatır. Birkaç kötü gece, uykuya dair endişeye yol açar. Telafi etmek için yatakta daha uzun kalır ve uykuya dalmak için daha çok çabalarsın. Çaba ve endişe seni uyanık tutar, sen de uyanık yatarsın ve yatak yavaş yavaş dinlenmeyle değil, hayal kırıklığıyla bağlantılı bir yer olur. Bu da bir sonraki geceyi de zorlaştırır.',
        'Kalkmak bu döngüden çıkmanın bir yoludur. Mücadeleyi yataktan çıkarır; böylece zamanla yatak yeniden uyku için bir işaret olabilir. BDT-U’nun bu kısmına uyaran kontrolü denir.',
      ],
        visual: { kind: 'cycle', title: 'Endişe–uyanıklık döngüsü', center: 'Uyumak için daha çok çabalamak',
          nodes: [
            { label: 'Kötü bir gece', text: 'Bir kez ya da birkaç kez kötü uyursun.' },
            { label: 'Endişe', text: '“Bu gece uyuyamazsam yarın felaket olur.”' },
            { label: 'Yatakta daha çok zaman', text: 'Uykuyu zorlamak için erken yatar ya da yatakta daha uzun kalırsın.' },
            { label: 'Daha uyanık', text: 'Çaba ve hayal kırıklığı zihnini açık tutar.' },
            { label: 'Yatak, mücadele demek', text: 'Uyanık yatmak yatağın kendisine bağlanır.' },
          ],
          note: 'BDT-U genel bakışlarının döngüyü anlatış biçimine dayanır. Uyuyamadığında kalkmak ve sabit bir kalkış saati tutmak onu kırmanın yollarıdır.' } },
      { heading: 'Sessiz köşende ne yapmalı', paragraphs: [
        'Amaç zamanı verimli doldurmak değil, uykunun geri dönmesine izin vermek. Her an bırakabileceğin, sakin bir şey seç. BDT-U programları yavaş nefes ve ilerleyici kas gevşetme (kas gruplarını tek tek gerip bırakmak) gibi gevşeme yöntemleri de öğretir; bunlar buraya iyi uyar.',
        'Farklı rehberler yaklaşık 10, 15 ya da 20 dakika sonra kalkmayı öneriyor. Sana uygun hissettiren yaklaşık bir süre seç ve saate bakarak değil, hissederek tahmin et.',
      ],
        visual: { kind: 'compare', title: 'Geceleyin kalkmışken',
          left: { label: 'Genellikle yardım eder', items: ['Loş ışık, sessiz bir yer', 'Sıkıcı bir kitap ya da dergi', 'Yavaş nefes ya da hafif esneme'] },
          right: { label: 'Genellikle seni uyanık tutar', items: ['Telefon, dizüstü ya da TV', 'Sürekli saate bakmak', 'Çalışmak ya da yarını ayrıntılı planlamak'] },
          note: 'AASM önerisinden ve BDT-U genel bakışlarında anlatılan gevşeme yöntemlerinden.' } },
    ],
    example: { title: 'Nadia, 52, muhasebeci', text: 'Vergi döneminde Nadia bir saat boyunca uyanık yatıyor, işi kafasında evirip çeviriyor ve saate bakıyordu. Oturma odasının bir köşesine küçük bir lamba, bir battaniye ve bulduğu hafif sıkıcı eski bir seyahat kitabı koydu. Salı gecesi uzun süredir uyanık olduğunu fark etti ve saate bakmadan kalktı. Birkaç sayfa okudu ve yavaş nefes aldı, sonra gözleri ağırlaşınca geri döndü. Uykuya dalmadan önce bir kez daha kalkması gerekti. Sabah yine 6.45’te kalktı; yorgundu ama programındaydı. Haftanın sonunda uzun uyanık yatma süreleri, tamamen bitmese de, kısalmıştı.' },
    sources: ['sleep-cbti-overview'],
  },
  'sleep-5': {
    deeper: [
      { heading: 'BDT-U aslında neleri içerir', paragraphs: [
        'BDT-U, genellikle eğitimli bir klinisyenle yaklaşık altı ila sekiz seans süren yapılandırılmış bir programdır ve dijital sürümleri de vardır. Birkaç bölümü birleştirir; uyaran kontrolü gibi bazılarıyla bu kursta sadeleştirilmiş biçimde zaten karşılaştın.',
        'Bir bölüm olan uyku kısıtlaması, uyku baskısını artırmak için bir süre yatakta geçen zamanı bilerek sınırlar. Bipolar bozukluk ya da nöbet gibi kaybedilen uykunun kötüleştirebileceği durumları olan kişiler için önerilmez; bu, onun bir kendi kendine yardım kursunda değil bir uzmanla birlikte yer almasının nedenlerinden biri.',
      ],
        visual: { kind: 'table', title: 'BDT-U’nun ana bölümleri',
          columns: ['Bölüm', 'Neleri içerir'],
          rows: [
            ['Uyaran kontrolü', 'Yatak yalnızca uyku ve cinsellik için; uyuyamadığında kalk'],
            ['Uyku kısıtlaması', 'Yatakta geçen süreyi geçici olarak sınırlamak; en iyisi bir uzmanla yapılır'],
            ['Gevşeme', 'Nefes egzersizleri, ilerleyici kas gevşetme ve benzeri yöntemler'],
            ['Bilişsel çalışma', 'Uykuya dair kaygıları ve gerçekçi olmayan beklentileri incelemek'],
            ['Uyku hijyeni', 'Alışkanlıkların, beslenmenin, egzersizin ve yatak odasının uykuyu nasıl etkilediği'],
          ],
          note: 'Tıbbi olarak gözden geçirilmiş bir BDT-U genel bakışından özetlendi. Bu kurs BDT-U değildir; yalnızca daha yumuşak birkaç fikrini ödünç alır.' } },
      { heading: 'Kurs değil hekim gerektiren işaretler', paragraphs: [
        'Bazı uyku sorunları alışkanlıklarla ilgilidir ve bu kurstaki adımlarla düzelebilir. Diğerleri gerçek bir değerlendirme gerektirir. Uzun süren uykusuzluk, uyku apnesi işaretleri ve hayata engel olan gündüz uykululuğu, tek başına daha çok çabalamak yerine randevu almak için iyi nedenlerdir.',
        'Araba kullanırken uyanık kalmanın zor olacağı kadar uykulu hissedersen araba kullanma ve yakında bir hekime git. Yatış saatlerini, kalkış saatlerini ve gece uyanmalarını içeren iki haftalık bir uyku kaydı bu konuşmayı daha kolay ve daha yararlı hale getirir.',
      ],
        visual: { kind: 'compare', title: 'Kendi başına mı, hekime mi?',
          left: { label: 'Kendi başına denemeye değer', items: ['Düzensiz program ya da geç saatte ekran', 'Günün geç saatinde kafein', 'Stresli bir günün ardından ara sıra kötü geceler'] },
          right: { label: 'Hekime gitmeye değer', items: ['3 aydan uzun süre haftada 3+ gece uykusuzluk', 'Yüksek sesli horlama ve nefes duraklamaları, nefes nefese kalma ya da boğulma hissi', 'İşi, günlük yaşamı ya da araba kullanmayı etkileyen gündüz uykululuğu'] },
          note: 'ACP rehberinden ve NHS uykusuzluk ile uyku apnesi sayfalarından. Bu bir tanı kontrol listesi değildir.' } },
    ],
    example: { title: 'Karen, 58, okul kütüphanecisi', text: 'Karen yılın büyük bölümünde kötü uyumuştu ve öğleden sonra erken saatlerde bitkin hissediyordu. Kalkış saatini sabitlemiş ve geç çayı bırakmıştı; bu biraz işe yaradı, ama yetmedi. Bir sabah kocası, bazen bir an nefesinin durup ardından horladığını söyledi. Karen bunu bilmiyordu. O hafta yatış saatlerini, kalkış saatlerini ve kaç kez uyandığını basit bir kayıtta tuttu ve kocasından fark ettiklerini not etmesini istedi. Hekimiyle randevu aldı ve ilaçlarının bir listesiyle birlikte iki notu da götürdü. Kendi başına hiçbir şeyi değiştirmedi. Hekim onu bir uyku değerlendirmesine yönlendirdi ve Karen, önünde bir sonraki adım olduğu için rahatlamış ayrıldı.' },
    sources: ['sleep-cbti-overview'],
  },
};
