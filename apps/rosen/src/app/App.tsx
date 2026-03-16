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
  ConfigProvider,
  FrameworkProvider,
} from '@rosen-bridge/ui-kit';

import { theme } from '@/theme/theme';

import { TokenMapProvider } from '../hooks';
import { uiKitConfigs } from '../uiKitConfigs';
import { Sidebar } from './Sidebar';

export const App = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  return (
    <NoSsr>
      <ConfigProvider configs={uiKitConfigs}>
        <FrameworkProvider
          router={{
            pathname,
            search: searchParams.toString(),
            push: (href) =>
              router.push(href as unknown as Route, { scroll: false }),
          }}
        >
          <AppBase sidebar={<Sidebar />} theme={theme}>
            <TokenMapProvider>{children}</TokenMapProvider>
          </AppBase>
        </FrameworkProvider>
      </ConfigProvider>
    </NoSsr>
  );
};
