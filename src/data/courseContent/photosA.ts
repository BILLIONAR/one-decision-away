import type { CoursePhoto } from '../courses';

export const COURSE_PHOTOS: Record<string, CoursePhoto> = {
  procrastination: { id: '1758598304525-c2bc7aada66d', alt: 'Bitkilerle çevrili masada dizüstü bilgisayarla çalışan kadın' }, // alt: 1768219565623-501f93ae384b laptop, notebook and coffee on a desk
  confidence: { id: '1756244834590-b1a32e94df40', alt: 'Gün doğarken dağ gölüne bakan kadın' }, // alt: 1477332552946-cfb384aeaf1c woman walking on a pathway in daylight
  adhd: { id: '1759984782055-defe1abc0394', alt: 'Kulaklıkla masada çalışan genç kadın' }, // alt: 1604933762021-54a5858c9832 woman with braids working on a laptop at a desk
};

export const LESSON_PHOTOS: Record<string, CoursePhoto> = {
  'procrastination-1': { id: '1552360708-ebcdf76845ac', alt: 'Pencere kenarında oturup düşünen kadın' }, // alt: 1658279366796-e0c28623cd27 woman sitting on a window sill
  'procrastination-2': { id: '1448387473223-5c37445527e7', alt: 'Merdivende ilk basamağa adım atan ayak' }, // alt: 1529089095055-10df44d104b1 person walking up concrete stairs
  'procrastination-3': { id: '1553044020-8c90843adf96', alt: 'Sarı yapışkan notlar ve kalem' }, // alt: 1565688167125-9b0617543b44 person writing on a sticky note beside a laptop
  'procrastination-4': { id: '1778958619388-b529cc4e78e8', alt: 'Pencere kenarında çay içen genç kadın' }, // alt: 1602891867080-1d56348202a3 woman holding a white ceramic mug
  'procrastination-5': { id: '1506784983877-45594efa4cbe', alt: 'Ajandanın üzerinde kahve fincanı' }, // alt: 1763529896738-9eafa27c1324 black planner with a pen on a wooden desk

  'confidence-1': { id: '1579017308347-e53e0d2fc5e9', alt: 'Açık deftere elle not yazan kişi' },
  'confidence-2': { id: '1635895752485-99ba511c07e1', alt: 'Gün batımında suyun üzerinden geçen basamak taşları' },
  'confidence-3': { id: '1572020487535-31e268b25e21', alt: 'Deftere not alan adam' }, // alt: 1719267687289-3f2283937665 person writing in a notebook at a table
  'confidence-4': { id: '1573497491208-6b1acb260507', alt: 'Masada oturup sohbet eden iki kadın' }, // alt: 1753351058013-995eed991252 two women talking at a cafe
  'confidence-5': { id: '1748609422318-7301636fb625', alt: 'Onay kutulu deftere plan yazan el' }, // alt: 1484480974693-6ca0a78fb36b person writing a list in a notebook

  'adhd-1': { id: '1488190211105-8b0e65b80b4e', alt: 'Deftere kalemle liste yazan el' }, // alt: 1763729625610-f356196f587a hands writing in a notebook near laptop and phone
  'adhd-2': { id: '1754548930574-6a995e5eb5a7', alt: 'Tablette yapılacaklar listesini işaretleyen el' },
  'adhd-3': { id: '1604344797006-2e4e8b39b79d', alt: 'Ahşap masada kum saati' }, // alt: 1744829415356-241dc0b027ae hourglass next to a coffee cup
  'adhd-4': { id: '1624207616909-8bc0ca58743b', alt: 'Dizüstü bilgisayara yapıştırılmış sarı notlar' }, // alt: 1662146494044-c3ecd3f7a3e5 yellow notepad on a keyboard
  'adhd-5': { id: '1549582100-d67ab35b3507', alt: 'Beyaz masada ajanda ve renkli kalemler' },
};
