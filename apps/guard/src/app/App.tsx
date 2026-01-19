'use client';

import { PropsWithChildren } from 'react';

import { NoSsr } from '@mui/material';
import { App as AppBase, ApiKeyProvider } from '@rosen-bridge/ui-kit';
import { mockMiddlewareFactory } from '@rosen-ui/swr-helpers';
import { SWRConfig } from 'swr';

import { mockedData } from '@/mock/mockedData';
import { theme } from '@/theme/theme';

import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

export const App = ({ children }: PropsWithChildren) => {
  return (
    <NoSsr>
      <ApiKeyProvider>
        <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
          <SWRConfig
            value={{
              revalidateOnFocus: false,
              errorRetryCount: 3,
              use:
                process.env.NEXT_PUBLIC_USE_MOCKED_APIS === 'true'
                  ? [mockMiddlewareFactory(mockedData)]
                  : [],
            }}
          >
            {children}
          </SWRConfig>
        </AppBase>
      </ApiKeyProvider>
    </NoSsr>
  );
};
