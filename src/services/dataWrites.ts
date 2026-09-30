/** One queue for every writer of the personal record, with cross-tab Web Locks where available. */
let writeQueue: Promise<unknown> = Promise.resolve();

export function queueDataWrite<T>(operation: () => Promise<T> | T): Promise<T> {
  const run = () => typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('oda-data-writes', async () => operation())
    : operation();
  const result = writeQueue.then(run, run);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}
