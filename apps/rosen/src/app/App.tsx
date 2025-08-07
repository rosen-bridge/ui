'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { PropsWithChildren } from 'react';

import { NoSsr } from '@mui/material';
import { App as AppBase } from '@rosen-bridge/ui-kit';

import { theme } from '@/theme/theme';

import { TokenMapProvider } from '../hooks';
import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

export const App = ({ children }: PropsWithChildren) => {
  return (
    <NoSsr>
      <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
        <TokenMapProvider>{children}</TokenMapProvider>
      </AppBase>
    </NoSsr>
  );
};
