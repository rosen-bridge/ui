'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import React from 'react';

import { NoSsr } from '@mui/material';
import { App as AppBase } from '@rosen-bridge/ui-kit';

import { TokenMapProvider } from '@/_hooks';
import { theme } from '@/_theme/theme';

import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

export const App = ({ children }: { children?: React.ReactNode }) => {
  return (
    <NoSsr>
      <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
        <TokenMapProvider>{children}</TokenMapProvider>
      </AppBase>
    </NoSsr>
  );
};
