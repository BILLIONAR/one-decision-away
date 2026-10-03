import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useSavedCourseProgress } from '../src/hooks/useSavedCourseProgress';
import { getInitialDemoState } from '../src/services/repository';
import { courseCatalogFor } from '../src/data/courseCatalog';
import type { UserData } from '../src/types/models';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';

const lesson = courseCatalogFor('en')[0].lessons[0];
function record(completed: boolean) {
  const data = getInitialDemoState();
  data.courseProgress = { version: 1, lessons: { [lesson.id]: { checked: Array(lesson.practiceCount).fill(true), answer: lesson.correct, reflection: 'Synthetic confirmed seed', completed } } };
  return data;
}
function Probe({ data }: { data: UserData | null }) {
  const progress = useSavedCourseProgress(data);
  return createElement('output', null, Object.values(progress.lessons).filter(lesson => lesson.completed).length);
}
function withProjection(data: UserData, run: () => void) {
  const previous = Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key: string) => key === APP_DATA_STORAGE_KEY ? JSON.stringify(data) : null}});
  try { run(); } finally { if (previous) Object.defineProperty(globalThis,'localStorage',previous); else Reflect.deleteProperty(globalThis,'localStorage'); }
}

test('saved-progress first render uses confirmed provider data rather than a provisional completed projection', () => {
  withProjection(record(true), () => assert.equal(renderToStaticMarkup(createElement(Probe,{data:record(false)})),'<output>0</output>'));
});
test('a confirmed completed seed remains visible when the projection currently says incomplete', () => {
  withProjection(record(false), () => assert.equal(renderToStaticMarkup(createElement(Probe,{data:record(true)})),'<output>1</output>'));
});
test('no confirmed provider record means empty progress rather than unconfirmed local completion', () => {
  withProjection(record(true), () => assert.equal(renderToStaticMarkup(createElement(Probe,{data:null})),'<output>0</output>'));
});
