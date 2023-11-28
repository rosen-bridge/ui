'use client';

import React from 'react';
import { RosenTokens } from '@rosen-bridge/tokens';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { NoSsr } from '@mui/material';

import { styled, AppSnackbar, SnackbarProvider } from '@rosen-bridge/ui-kit';

import SideBar from './SideBar';
import Toolbar from './Toolbar';

import ThemeProvider from '@/_theme/ThemeProvider';
import { WalletContextProvider } from './_contexts/walletContext';
import { TokensMapProvider } from './_contexts/tokenMapProvider';

const Root = styled('div')(({ theme }) => ({
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.background.root,
  backgroundImage:
    theme.palette.mode === 'light'
      ? `linear-gradient(${theme.palette.gradient.baseOrange} 0%, ${theme.palette.gradient.lightOrange} 30%, ${theme.palette.gradient.lightDarkBackground} 70%, ${theme.palette.gradient.baseDarkBackground} 100%)`
      : `radial-gradient(circle at 10% -12.9%, ${theme.palette.gradient.darkBackgroundMid} 0.3%, ${theme.palette.gradient.darkBackgroundMain} 50.2%)`,
  [theme.breakpoints.down('tablet')]: {
    flexDirection: 'column',
    backgroundImage:
      theme.palette.mode === 'light'
        ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.secondary.dark} 100%)`
        : 'none',
  },
}));

const Main = styled('main')(({ theme }) => ({
  position: 'relative',
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

interface AppProps {
  children?: React.ReactNode;
  tokensMap: RosenTokens;
}

const App = ({ children, tokensMap }: AppProps) => {
  return (
    <NoSsr>
      <ThemeProvider>
        <SnackbarProvider>
          <TokensMapProvider tokensMap={tokensMap}>
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
          </TokensMapProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </NoSsr>
  );
};

export default App;
