'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { NoSsr } from '@mui/material';
import {
  App as AppBase,
  FrameworkProvider,
  ThemeProvider,
  ToastProvider,
} from '@rosen-bridge/ui-kit';

import { theme } from '@/theme/theme';
import { UIKitProvider } from '@/uiKitProvider';

import { TokenMapProvider } from '../hooks';
import { Sidebar } from './Sidebar';

export const App = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  return (
    <NoSsr>
      <FrameworkProvider
        router={{
          pathname,
          search: searchParams.toString(),
          push: (href: string) =>
            router.push(href as unknown as Route, { scroll: false }),
        }}
      >
        <TokenMapProvider>
          <UIKitProvider>
            <ThemeProvider theme={theme}>
              <ToastProvider>
                <AppBase sidebar={<Sidebar />}>{children}</AppBase>
              </ToastProvider>
            </ThemeProvider>
          </UIKitProvider>
        </TokenMapProvider>
      </FrameworkProvider>
    </NoSsr>
  );
};
