'use client';

import React from 'react';
import { SWRConfig } from 'swr';

import { NoSsr, styled } from '@rosen-bridge/ui-kit';

import SideBar from '@/_components/SideBar';
import Toolbar from '@/_components/Toolbar';

import ThemeProvider from '@/_theme/ThemeProvider';

import { mockFetcherMiddleware } from './_mock/mockFetcherMiddleware';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.secondary.dark,
  backgroundImage:
    theme.palette.mode === 'light'
      ? // FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
        `linear-gradient(180deg, #845ec2 0%, #2c73d2 20%, #0081cf 40%, #0089ba 60%, #008e9b 80%, #008f7a 100%)`
      : 'none',
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'column',
    backgroundImage:
      theme.palette.mode === 'light'
        ? // FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
          `linear-gradient(90deg, #845ec2 0%, #2c73d2 20%, #0081cf 40%, #0089ba 60%, #008e9b 80%, #008f7a 100%)`
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

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    /**
     * TODO: get `lang` from url language path segment
     *
     * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/13
     */
    <html lang="en">
      <body>
        <NoSsr>
          <ThemeProvider>
            <Root>
              <SideBar />
              <SWRConfig
                value={{
                  use:
                    process.env.NEXT_PUBLIC_USE_MOCKED_APIS === 'true'
                      ? [mockFetcherMiddleware]
                      : [],
                }}
              >
                <Main>
                  <Toolbar />
                  {children}
                </Main>
              </SWRConfig>
            </Root>
          </ThemeProvider>
        </NoSsr>
      </body>
    </html>
  );
};

export default RootLayout;
