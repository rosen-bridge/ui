import { useCallback, useMemo } from 'react';
import JSONBigInt from 'json-bigint';

/**
 * a utility hook to manage local storage
 */

export const useLocalStorageManager = () => {
  const set = useCallback(<T>(key: string, value: T) => {
    localStorage.setItem(
      key,
      JSONBigInt({
        useNativeBigInt: true,
        alwaysParseAsBig: true,
      }).stringify(value),
    );
  }, []);

  const get = useCallback(<T>(key: string) => {
    const rawData = localStorage.getItem(key);
    return rawData
      ? (JSONBigInt({
          useNativeBigInt: true,
          alwaysParseAsBig: true,
        }).parse(rawData) as T)
      : null;
  }, []);

  const remove = useCallback((key: string) => {
    localStorage.removeItem(key);
  }, []);

  const localStorageManager = useMemo(
    () => ({
      set,
      get,
      remove,
    }),
    [set, get, remove],
  );

  return localStorageManager;
};
