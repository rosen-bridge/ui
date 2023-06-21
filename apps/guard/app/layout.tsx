'use client';

import React from 'react';

import { styled } from '@rosen-bridge/ui-kit';

import SideBar from '@/_components/SideBar';
import ThemeProvider from '@/_theme/ThemeProvider';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.info.dark,
  backgroundImage:
    theme.palette.mode === 'light'
      ? `linear-gradient(180deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.dark} 100%)`
      : 'none',
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'column',
    backgroundImage:
      theme.palette.mode === 'light'
        ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.dark} 100%)`
        : 'none',
  },
}));

const Main = styled('main')(() => ({
  flexGrow: 1,
  overflowY: 'auto',
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
        <ThemeProvider>
          <Root>
            <SideBar />
            <Main>{children}</Main>
          </Root>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
