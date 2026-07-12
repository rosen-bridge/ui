'use client';

import type { PropsWithChildren } from 'react';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  FrameworkProvider,
  NoSsr,
  ThemeProvider,
  ToastProvider,
} from '@rosen-bridge/ui-kit';

import { theme } from '@/theme/theme';
import { UIKitProvider } from '@/uiKitProvider';

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
        <UIKitProvider>
          <ThemeProvider theme={theme}>
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </UIKitProvider>
      </FrameworkProvider>
    </NoSsr>
  );
};
