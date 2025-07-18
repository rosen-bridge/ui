import React from 'react';

import { SWRConfig as SWRConfigBase } from 'swr';

import { FakeData, mockMiddlewareFactory } from './mockMiddlewareFactory';

export interface SWRConfigProps {
  children: React.ReactNode;
  useMockedApis: boolean;
  fakeData: FakeData;
}
/**
 * wrap `SWRConfig` of `swr`, adding a mock middleware to use mocked apis if
 * needed
 *
 * @param children
 * @param useMockedApis whether to use mocked apis instead of main ones
 * @param fakeData mocked data to use in mocked apis
 */
export const SWRConfig = ({
  children,
  useMockedApis,
  fakeData,
}: SWRConfigProps) => (
  <SWRConfigBase
    value={{
      use: useMockedApis ? [mockMiddlewareFactory(fakeData)] : [],
    }}
  >
    {children}
  </SWRConfigBase>
);
