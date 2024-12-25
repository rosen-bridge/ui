'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import React from 'react';

import { NoSsr } from '@mui/material';
import { App as AppBase } from '@rosen-bridge/ui-kit';

import { theme } from '@/_theme/theme';

import { WalletContextProvider } from './_contexts/walletContext';
import { TokenMapProvider } from './_hooks';
import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

export const App = ({ children }: { children?: React.ReactNode }) => {
  return (
    <NoSsr>
      <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
        <TokenMapProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </TokenMapProvider>
      </AppBase>
    </NoSsr>
  );
};
