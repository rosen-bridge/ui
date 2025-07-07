/**
 * TODO: remove the inline ESLint comment
 * local:ergo/rosen-bridge/ui#441
 */

/* eslint-disable */
import { Key, Middleware, SWRHook } from 'swr';

export interface FakeData {
  withStringKeys: Record<string, any>;
  withObjectKeys: Record<string, (params: any) => any>;
}
/**
 * return a swr middleware to mock `useSWR` fetcher and `useSWRMutation` mutator
 * with a fake version, returning fake data after a random period of time
 * (between 0 * to 5 seconds) or rejecting if fake data for the route is not
 * defined
 *
 * @param fakeData
 */
export const mockMiddlewareFactory: (fakeData: FakeData) => Middleware =
  (fakeData) => (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const mockedFetcher = (key: Key) =>
      new Promise<any>((resolve, reject) => {
        if (typeof key === 'string') {
          const response = fakeData.withStringKeys[key];

          setTimeout(() => {
            response
              ? resolve(response)
              : reject(new Error(`Cannot find mocked data for ${key} route`));
          }, 5000 * Math.random());
        } else if (Array.isArray(key)) {
          const [url, params] = key;
          const response = fakeData.withObjectKeys[url](params);

          setTimeout(() => {
            response
              ? resolve(response)
              : reject(new Error(`Cannot find mocked data for ${key} route`));
          }, 5000 * Math.random());
        }
      });

    return useSWRNext(key, mockedFetcher, config);
  };
