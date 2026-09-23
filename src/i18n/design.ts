import type { Locale } from './index';

const copy = {
  tr: { learn: 'Öğren ve düşün', courses: 'Kurslar', inspiration: 'İlham', discover: 'Kendine bir alan aç', daily: 'Bir karar. Bugün.', quote: 'Günün düşüncesi', skip: 'İçeriğe geç' },
  en: { learn: 'Learn & reflect', courses: 'Courses', inspiration: 'Inspiration', discover: 'Make a little room for yourself', daily: 'One decision. Today.', quote: 'A thought for today', skip: 'Skip to content' },
  es: { learn: 'Aprende y reflexiona', courses: 'Cursos', inspiration: 'Inspiración', discover: 'Hazte un pequeño espacio', daily: 'Una decisión. Hoy.', quote: 'Una idea para hoy', skip: 'Ir al contenido' },
} satisfies Record<Locale, Record<string, string>>;
export const designCopy = (locale: Locale) => copy[locale];
