'use client';

import { PropsWithChildren, useEffect } from 'react';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { NoSsr } from '@mui/material';
import { ApiKeyContextProvider } from '@rosen-bridge/shared-contexts';
import { App as AppBase } from '@rosen-bridge/ui-kit';
import { SWRConfig } from '@rosen-ui/swr-mock';
import { upperFirst } from 'lodash-es';

import { useInfo } from './_hooks/useInfo';
import { mockedData } from './_mock/mockedData';
import { theme } from './_theme/theme';
import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

export const App = ({ children }: PropsWithChildren) => {
  const { data: info } = useInfo();

  /**
   * TODO: In the next phase, refactor this React hook to utilize SSR and data fetching
   * local:ergo/rosen-bridge/ui#408
   */
  useEffect(() => {
    document.title = `Watcher`;

    if (!info) return;

    document.title = `[${upperFirst(info.network)}] Watcher`;

    let faviconLink = document.querySelector(
      "link[rel~='icon']",
    ) as HTMLLinkElement;

    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }

    faviconLink.href = `/chains/${info.network.toLowerCase()}.svg`;
  }, [info]);

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
