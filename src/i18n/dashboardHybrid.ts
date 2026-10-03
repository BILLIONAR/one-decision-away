const en = {
  progress: 'Course library progress', progressHint: 'Completed lessons across the whole library.',
  lessons: (done: number, total: number) => `${done} of ${total} lessons completed`,
  keptDays: 'Kept days · last 7', habits: 'Habits · today', actions: 'Today’s actions',
  viewAll: 'All habits', confirm: 'Confirm your decision is complete', choose: 'Choose your one decision',
  addHabit: 'Add a habit', focus: 'Timer focus streak', days: (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`,
  utc: 'UTC days · completed timer sessions', focusToday: (n: number) => `${n} recorded minutes today`,
  focusEmpty: 'Complete a timer session to begin.', openFocus: 'Open focus timer',
  mission: 'Current course', suggested: 'Suggested course', roadmap: 'View roadmap', next: 'Next lesson', complete: 'Course completed',
};
const tr: typeof en = {
  progress: 'Kurs kütüphanesi ilerlemesi', progressHint: 'Tüm kütüphanede tamamlanan dersler.',
  lessons: (done, total) => `${total} dersin ${done} tanesi tamamlandı`,
  keptDays: 'Karar tamamlanan gün · son 7', habits: 'Alışkanlıklar · bugün', actions: 'Bugünkü adımların',
  viewAll: 'Tüm alışkanlıklar', confirm: 'Kararını tamamladığını onayla', choose: 'Bugünkü tek kararını seç',
  addHabit: 'Alışkanlık ekle', focus: 'Zamanlayıcılı odak serisi', days: n => `${n} gün`,
  utc: 'UTC günleri · tamamlanan zamanlayıcı oturumları', focusToday: n => `Bugün kaydedilen ${n} dakika`,
  focusEmpty: 'Başlamak için bir zamanlayıcı oturumu tamamla.', openFocus: 'Odak zamanlayıcısını aç',
  mission: 'Mevcut kurs', suggested: 'Önerilen kurs', roadmap: 'Ders yolunu gör', next: 'Sonraki ders', complete: 'Kurs tamamlandı',
};
const es: typeof en = {
  progress: 'Progreso de la biblioteca de cursos', progressHint: 'Lecciones completadas en toda la biblioteca.',
  lessons: (done, total) => `${done} de ${total} lecciones completadas`,
  keptDays: 'Días cumplidos · últimos 7', habits: 'Hábitos · hoy', actions: 'Tus acciones de hoy',
  viewAll: 'Todos los hábitos', confirm: 'Confirma que cumpliste tu decisión', choose: 'Elige tu decisión del día',
  addHabit: 'Añadir un hábito', focus: 'Racha de enfoque con temporizador', days: n => `${n} ${n === 1 ? 'día' : 'días'}`,
  utc: 'Días UTC · sesiones de temporizador completadas', focusToday: n => `${n} minutos registrados hoy`,
  focusEmpty: 'Completa una sesión de temporizador para empezar.', openFocus: 'Abrir temporizador',
  mission: 'Curso actual', suggested: 'Curso sugerido', roadmap: 'Ver recorrido', next: 'Próxima lección', complete: 'Curso completado',
};
export const dashboardHybridCopy = (locale: string) => locale === 'tr' ? tr : locale === 'es' ? es : en;
