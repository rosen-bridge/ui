'use client';

import React from 'react';

import { NoSsr, styled } from '@rosen-bridge/ui-kit';

import SideBar from './SideBar';
import Toolbar from './Toolbar';
import AppSnackbar from './_common/AppSnackbar';

import ThemeProvider from '@/_theme/ThemeProvider';
import { SnackbarProvider } from './_contexts/snackbarContext';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.background.root,
  backgroundImage:
    theme.palette.mode === 'light'
      ? `linear-gradient(${theme.palette.gradient.a} 0%, ${theme.palette.gradient.b} 30%, ${theme.palette.gradient.c} 70%, ${theme.palette.gradient.d} 100%)`
      : `radial-gradient(circle at 10% -12.9%, ${theme.palette.gradient.e} 0.3%, ${theme.palette.gradient.f} 50.2%)`,
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'column',
    backgroundImage:
      theme.palette.mode === 'light'
        ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.dark} 100%)`
        : 'none',
  },
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  minHeight: '100%',
  backgroundColor: theme.palette.background.content,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  paddingTop: theme.shape.borderRadius,
  paddingBottom: theme.shape.borderRadius * 4,
  paddingLeft: theme.shape.borderRadius * 2,
  paddingRight: theme.shape.borderRadius * 2,

  [theme.breakpoints.down('tablet')]: {
    backgroundColor: theme.palette.background.paper,
    borderTopRightRadius: theme.shape.borderRadius * 2,
    borderBottomLeftRadius: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
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
            <SnackbarProvider>
              <Root>
                <SideBar />
                <Main>
                  <Toolbar />
                  {children}
                </Main>
                <AppSnackbar />
              </Root>
            </SnackbarProvider>
          </ThemeProvider>
        </NoSsr>
      </body>
    </html>
  );
};

export default RootLayout;
