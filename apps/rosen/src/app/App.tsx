'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { NoSsr } from '@mui/material';
import { App as AppBase, FrameworkProvider } from '@rosen-bridge/ui-kit';

import { theme } from '@/theme/theme';
import { UIKitProvider } from '@/uiKitProvider';

import { TokenMapProvider } from '../hooks';
import { UIKitProvider } from '../uiKitProvider';
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
          push: (href) =>
            router.push(href as unknown as Route, { scroll: false }),
        }}
      >
        <TokenMapProvider>
          <UIKitProvider>
            <AppBase sidebar={<Sidebar />} theme={theme}>
              {children}
            </AppBase>
          </UIKitProvider>
        </TokenMapProvider>
      </FrameworkProvider>
    </NoSsr>
  );
};
