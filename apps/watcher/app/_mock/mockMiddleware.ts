import { Key, Middleware, SWRHook } from 'swr';

import * as mockedData from './mockedData';

import { ChartPeriod } from '@/_types';

const fakeResponseWithStringKey: Record<string, any> = {
  '/info': mockedData.info,
  '/address/assets': mockedData.addressAssets,
  '/health/status': mockedData.healthStatus,
  '/withdraw': mockedData.withdraw,
  '/permit': mockedData.permit,
};

const fakeResponseWithObjectKey: Record<string, (params: any) => any> = {
  '/revenue/chart': ({ period }: { period: ChartPeriod }) => {
    return mockedData.revenueChart[period];
  },
};

/**
 * mock `useSWR` fetcher and `useSWRMutation` mutator with a fake version,
 * returning fake data after a random period of time (between 0 to 5 seconds) or
 * rejecting if fake data for the route is not defined
 * @param useSWRNext
 */
const mockMiddleware: Middleware =
  (useSWRNext: SWRHook) => (key, fetcher, config) => {
    const mockedFetcher = (key: Key) =>
      new Promise<any>((resolve, reject) => {
        if (typeof key === 'string') {
          const response = fakeResponseWithStringKey[key];

          setTimeout(() => {
            response
              ? resolve(response)
              : reject(new Error(`Cannot find mocked data for ${key} route`));
          }, 5000 * Math.random());
        } else if (Array.isArray(key)) {
          const [url, params] = key;
          const response = fakeResponseWithObjectKey[url](params);

          setTimeout(() => {
            response
              ? resolve(response)
              : reject(new Error(`Cannot find mocked data for ${key} route`));
          }, 5000 * Math.random());
        }
      });

    return useSWRNext(key, mockedFetcher, config);
  };

export default mockMiddleware;
