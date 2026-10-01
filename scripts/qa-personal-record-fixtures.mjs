/** Post-initialization fixtures for bundled browser tests: commit the real canonical snapshot under its Web Lock. */
export async function readPersonalRecordFixture(page) {
  return page.evaluate(() => navigator.locks.request('oda-data-writes', async () => {
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('oda_personal_record_v1', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
    try {
      const snapshot = await new Promise((resolve, reject) => {
        const transaction = database.transaction('record', 'readonly');
        const request = transaction.objectStore('record').get('current');
        transaction.oncomplete = () => resolve(request.result);
        transaction.onabort = () => reject(transaction.error || new Error('Fixture read aborted'));
        transaction.onerror = () => reject(transaction.error);
      });
      const committed = snapshot?.pendingPrevious || snapshot;
      return committed?.appData ? JSON.parse(committed.appData) : null;
    } finally { database.close(); }
  }));
}

export async function patchPersonalRecordFixture(page, updates) {
  return page.evaluate(async updates => {
    if (!navigator.locks) throw new Error('Fixture requires the personal-record Web Lock');
    return navigator.locks.request('oda-data-writes', async () => {
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open('oda_personal_record_v1', 1);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Fixture database is blocked'));
        request.onupgradeneeded = () => request.result.createObjectStore('record');
        request.onsuccess = () => resolve(request.result);
      });
      try {
        const snapshot = await new Promise((resolve, reject) => {
          const transaction = database.transaction('record', 'readonly');
          const request = transaction.objectStore('record').get('current');
          transaction.oncomplete = () => resolve(request.result);
          transaction.onabort = () => reject(transaction.error || new Error('Fixture read aborted'));
          transaction.onerror = () => reject(transaction.error);
        });
        if (!snapshot || snapshot.version !== 1 || typeof snapshot.appData !== 'string'
          || (snapshot.legacyCourse !== null && typeof snapshot.legacyCourse !== 'string')) {
          throw new Error('Fixture requires an initialized canonical personal record');
        }
        const record = JSON.parse(snapshot.appData);
        for (const { path, value } of updates) {
          if (!Array.isArray(path) || !path.length || path.some(key => ['__proto__', 'constructor', 'prototype'].includes(key))) throw new Error('Invalid fixture path');
          let target = record;
          for (const key of path.slice(0, -1)) target = target[key];
          target[path.at(-1)] = value;
        }
        const next = { version: 1, appData: JSON.stringify(record), legacyCourse: snapshot.legacyCourse };
        await new Promise((resolve, reject) => {
          const transaction = database.transaction('record', 'readwrite');
          transaction.oncomplete = resolve;
          transaction.onabort = () => reject(transaction.error || new Error('Fixture commit aborted'));
          transaction.onerror = () => reject(transaction.error);
          transaction.objectStore('record').put(next, 'current');
        });
        for (const [key, raw] of [
          ['one_decision_away_app_data_v1', next.appData],
          ['oda_course_progress_v1', next.legacyCourse],
        ]) {
          if (localStorage.getItem(key) === raw) continue;
          if (raw === null) localStorage.removeItem(key);
          else localStorage.setItem(key, raw);
        }
        return record;
      } finally { database.close(); }
    });
  }, updates);
}
