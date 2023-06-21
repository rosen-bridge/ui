import { Key, Middleware, SWRHook } from 'swr';

import * as mockedFetcherData from './mockedFetcherData';

const fakeResponse: Record<string, any> = {
  '/info': mockedFetcherData.info,
};

/**
 * mock `useSWR` fetcher with a fake version, returning fake data after a random
 * period of time (between 0 to 5 seconds) or rejecting if fake data for the
 * route is not defined
 * @param useSWRNext
 */
const mockFetcherMiddleware: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const mockedFetcher = (key: Key) =>
      new Promise<any>((resolve, reject) => {
        if (typeof key === 'string') {
          const response = fakeResponse[key];

          setTimeout(() => {
            response
              ? resolve(response)
              : reject(new Error(`Canot find mocked data for ${key} route`));
          }, 5000 * Math.random());
        }
      });

    return useSWRNext(key, mockedFetcher, config);
  };

export { mockFetcherMiddleware };
