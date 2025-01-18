'use client';

import React, { PropsWithChildren } from 'react';

import { NoSsr } from '@mui/material';
import { ApiKeyContextProvider } from '@rosen-bridge/shared-contexts';
import { App as AppBase } from '@rosen-bridge/ui-kit';
import { SWRConfig } from '@rosen-ui/swr-mock';

import { theme } from '@/_theme/theme';

import { mockedData } from './_mock/mockedData';
import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

export const App = ({ children }: PropsWithChildren) => {
  return (
    <NoSsr>
      <ApiKeyContextProvider>
        <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
          <SWRConfig
            useMockedApis={process.env.NEXT_PUBLIC_USE_MOCKED_APIS === 'true'}
            fakeData={mockedData}
          >
            {children}
          </SWRConfig>
        </AppBase>
      </ApiKeyContextProvider>
    </NoSsr>
  );
};
