import type { ContentLocale } from './courses';

const en = {
  overview: 'Course overview', about: 'About this course', outcome: 'What you will practise', lessons: 'Inside this course',
  startFirst: 'Start lesson 1', continueLesson: 'Continue lesson {number}', previewCourse: 'Preview course', nextGoal: 'Your small goal',
};
type EntryCopy = { [K in keyof typeof en]: string };
const tr: EntryCopy = {
  overview: 'Kursa genel bakış', about: 'Bu kurs hakkında', outcome: 'Neyi deneyeceksin?', lessons: 'Bu kurstaki dersler',
  startFirst: '1. derse başla', continueLesson: '{number}. derse devam et', previewCourse: 'Kursu incele', nextGoal: 'Küçük hedefin',
};
const es: EntryCopy = {
  overview: 'Resumen del curso', about: 'Sobre este curso', outcome: 'Lo que vas a practicar', lessons: 'Lecciones de este curso',
  startFirst: 'Empezar la lección 1', continueLesson: 'Continuar la lección {number}', previewCourse: 'Ver el curso', nextGoal: 'Tu pequeño objetivo',
};
export const courseEntryCopy = (locale: ContentLocale): EntryCopy => ({ en, tr, es })[locale];
