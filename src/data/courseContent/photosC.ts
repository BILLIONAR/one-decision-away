import type { CoursePhoto } from '../courses';

export const COURSE_PHOTOS: Record<string, CoursePhoto> = {
  focus: { id: '1505330622279-bf7d7fc918f4', alt: 'Aydınlık, düzenli bir çalışma masası' },
  sleep: { id: '1606796913825-2b02883605e9', alt: 'Yeşil bitkinin yanında beyaz nevresimli yatak' }, // alt: 1552558636-f6a8f071c2b3 leaf plant near bed
  calm: { id: '1557316655-8715fdecd2d1', alt: 'Dağ eteğinde durgun göl' }, // alt: 1528164604878-28ea0fb4f462 trees silhouetted by a lake at sunrise
};

export const LESSON_PHOTOS: Record<string, CoursePhoto> = {
  'focus-1': { id: '1745474633597-be94033b16d6', alt: 'Dizüstü bilgisayarda çalışırken telefona bakan kişi' }, // alt: 1554412664-6a4d8f640b3b man at laptop between tablet and phone
  'focus-2': { id: '1526045612212-70caf35c14df', alt: 'Elinde akıllı telefon tutan kişi' }, // alt: 1772618375204-06b8348417e5 close-up of phone lock screen showing time
  'focus-3': { id: '1635398235411-2c41ca32ffbc', alt: 'Ahşap masanın üzerinde duran telefon' }, // alt: 1535312833541-9fb671a581b0 switched-off phone on wooden board
  'focus-4': { id: '1556833232-52da3e4bd5d8', alt: 'Patikada yürüyüş yapan kadın' }, // alt: 1759193513693-97638b7f1160 two people walking a dog on a park path
  'focus-5': { id: '1632772998001-cc9bf6f7c852', alt: 'Üzerinde iki kalem duran ajanda' }, // alt: 1529651737248-dad5e287768e pens on a calendar planner
  'sleep-1': { id: '1767443522987-a83deb358199', alt: 'Ahşap zeminde klasik çalar saat' },
  'sleep-2': { id: '1527377761-f99968ed8a7f', alt: 'Pencereden yere vuran gün ışığı' }, // alt: 1534432189786-f47e376dc8c7 open blinds with sun rays
  'sleep-3': { id: '1743689374053-be49ca407b7c', alt: 'Pencere kenarında bir fincan kahve' }, // alt: 1662038271111-5b1c0b4157e8 steaming mug before a sunlit window
  'sleep-4': { id: '1789930445611-3b13fd7d6de4', alt: 'Küçük masa lambasının ışığında kitap okuyan kişi' }, // alt: 1730643805910-0bfb8f08072f open book and lamp on a table
  'sleep-5': { id: '1653656120968-accae8452c9e', alt: 'Kanepede oturup başka bir kadınla konuşan kadın' }, // alt: 1758691461935-202e2ef6b69f doctor talking with a patient in an office
  'calm-1': { id: '1758876019128-e76eebf402bd', alt: 'Masada başını eline dayamış yorgun kişi' }, // alt: 1758598497429-6eb3895d5bfa man rubbing his face at a laptop
  'calm-2': { id: '1717691526463-975c4119505c', alt: 'Ağacın önünde gözleri kapalı duran kadın' }, // alt: 1641907173006-6b8930ae1191 woman looking up with eyes closed
  'calm-3': { id: '1758272421829-7028296dee8f', alt: 'Oturma odasında yerde esneme yapan kadın' }, // alt: 1758599880336-ac6f4cb7f204 couple doing yoga in a living room
  'calm-4': { id: '1658279366796-e0c28623cd27', alt: 'Pencere pervazında oturup dışarı bakan kadın' },
  'calm-5': { id: '1747764925585-6c2df83b3fd2', alt: 'Kahve içip sohbet eden iki kadın' }, // alt: 1744972991276-60dc65d9f79a two men chatting on a couch
};
