'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import React from 'react';

import { NoSsr } from '@mui/material';
import {
  styled,
  AppSnackbar,
  SnackbarProvider,
  CssBaseline,
  ThemeProvider,
} from '@rosen-bridge/ui-kit';

import { theme } from '@/_theme/theme';

import { WalletContextProvider } from './_contexts/walletContext';
import { SideBar } from './SideBar';
import Toolbar from './Toolbar';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  background: theme.palette.background.body(true),
}));

const Main = styled('main')(({ theme }) => ({
  position: 'relative',
  flexGrow: 1,
  overflowY: 'auto',
  minHeight: '100%',
  backgroundColor: theme.palette.background.default,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderBottomLeftRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
}));

interface AppProps {
  children?: React.ReactNode;
}

const App = ({ children }: AppProps) => {
  return (
    <NoSsr>
      <ThemeProvider theme={theme}>
        <>
          <CssBaseline />
          <SnackbarProvider>
            <WalletContextProvider>
              <Root>
                <SideBar />
                <Main>
                  <Toolbar />
                  {children}
                </Main>
                <AppSnackbar />
              </Root>
            </WalletContextProvider>
          </SnackbarProvider>
        </>
      </ThemeProvider>
    </NoSsr>
  );
};

export default App;
