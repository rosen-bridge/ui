'use client';

import React, { useEffect } from 'react';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { NoSsr } from '@mui/material';
import { ApiKeyContextProvider } from '@rosen-bridge/shared-contexts';
import {
  AppSnackbar,
  styled,
  SnackbarProvider,
  ThemeProvider,
  CssBaseline,
} from '@rosen-bridge/ui-kit';
import { SWRConfig } from '@rosen-ui/swr-mock';
import { upperFirst } from 'lodash-es';

import { useInfo } from './_hooks/useInfo';
import { mockedData } from './_mock/mockedData';
import { theme } from './_theme/theme';
import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.secondary.dark,
  backgroundImage:
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg, ${theme.palette.gradient.a} 0%, ${theme.palette.gradient.b} 20%, ${theme.palette.gradient.c} 40%, ${theme.palette.gradient.d} 60%, ${theme.palette.gradient.e} 80%, ${theme.palette.gradient.f} 100%)`
      : 'none',
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'column',
    backgroundImage:
      theme.palette.mode === 'light'
        ? `linear-gradient(90deg, ${theme.palette.gradient.a} 0%, ${theme.palette.gradient.b} 20%, ${theme.palette.gradient.c} 40%, ${theme.palette.gradient.d} 60%, ${theme.palette.gradient.e} 80%, ${theme.palette.gradient.f} 100%)`
        : 'none',
  },
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  minHeight: '100%',
  backgroundColor: theme.palette.background.default,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  paddingTop: theme.shape.borderRadius,
  paddingBottom: theme.shape.borderRadius * 3,
  paddingLeft: theme.shape.borderRadius * 2,
  paddingRight: theme.shape.borderRadius * 2,

  [theme.breakpoints.down('tablet')]: {
    backgroundColor: theme.palette.background.paper,
    borderTopRightRadius: theme.shape.borderRadius * 2,
    borderBottomLeftRadius: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.shape.borderRadius * 6,
  },
}));

interface AppProps {
  children?: React.ReactNode;
}

export const App = ({ children }: AppProps) => {
  const { data: info } = useInfo();

  /**
   * TODO: In the next phase, refactor this React hook to utilize SSR and data fetching
   * local:ergo/rosen-bridge/ui#408
   */
  useEffect(() => {
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
      <ThemeProvider theme={theme}>
        <>
          <CssBaseline />
          <SnackbarProvider>
            <ApiKeyContextProvider>
              <Root>
                <SideBar />
                <SWRConfig
                  useMockedApis={
                    process.env.NEXT_PUBLIC_USE_MOCKED_APIS === 'true'
                  }
                  fakeData={mockedData}
                >
                  <Main>
                    <Toolbar />
                    {children}
                    <AppSnackbar />
                  </Main>
                </SWRConfig>
              </Root>
            </ApiKeyContextProvider>
          </SnackbarProvider>
        </>
      </ThemeProvider>
    </NoSsr>
  );
};
