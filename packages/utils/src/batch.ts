/**
 * Merge concurrent single-key async lookups into one batched call.
 */
export const batch = <Key, Value>(
  load: (keys: Key[]) => Promise<Map<Key, Value | undefined> | Record<string, Value | undefined>>,
): ((key: Key) => Promise<Value | undefined>) => {
  const store = new Map<Key, Promise<Value | undefined>>();

  let pending: Array<[Key, (value: Value | undefined) => void, (reason: unknown) => void]> = [];

  const flush = () => {
    const entries = pending;

    pending = [];

    Promise.resolve()
      .then(() => load(entries.map(([key]) => key)))
      .then(
        (result) => {
          const read = (key: Key) =>
            result instanceof Map
              ? result.get(key)
              : (result as Record<string, Value | undefined>)[String(key)];

          for (const [key, resolve] of entries) resolve(read(key));
        },
        (error) => {
          for (const [key, , reject] of entries) {
            store.delete(key);
            reject(error);
          }
        },
      );
  };

  return (key) => {
    const cached = store.get(key);

    if (cached) return cached;

    const promise = new Promise<Value | undefined>((resolve, reject) => {
      pending.push([key, resolve, reject]);
    });

    store.set(key, promise);

    if (pending.length === 1) queueMicrotask(flush);

    return promise;
  };
};
