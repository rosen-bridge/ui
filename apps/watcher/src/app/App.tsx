'use client';

import type { PropsWithChildren } from 'react';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  ApiKeyProvider,
  App as AppBase,
  ConfirmProvider,
  FrameworkProvider,
  NoSsr,
  ThemeProvider,
  ToastProvider,
} from '@rosen-bridge/ui-kit';
import { mockMiddlewareFactory } from '@rosen-ui/swr-helpers';

import { SWRConfig } from 'swr';

import { Favicon } from '@/components';
import { mockedData } from '@/mock/mockedData';
import { theme } from '@/theme/theme';
import { UIKitProvider } from '@/uiKitProvider';

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
        <UIKitProvider>
          <ApiKeyProvider>
            <ThemeProvider theme={theme}>
              <ConfirmProvider>
                <ToastProvider>
                  <AppBase sidebar={<Sidebar />}>
                    <Favicon />
                    <SWRConfig
                      value={{
                        use:
                          process.env.NEXT_PUBLIC_USE_MOCKED_APIS === 'true'
                            ? [mockMiddlewareFactory(mockedData)]
                            : [],
                      }}
                    >
                      {children}
                    </SWRConfig>
                  </AppBase>
                </ToastProvider>
              </ConfirmProvider>
            </ThemeProvider>
          </ApiKeyProvider>
        </UIKitProvider>
      </FrameworkProvider>
    </NoSsr>
  );
};
