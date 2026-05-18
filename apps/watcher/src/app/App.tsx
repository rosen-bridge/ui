'use client';

import { Route } from 'next';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { NoSsr } from '@mui/material';
import {
  App as AppBase,
  ApiKeyProvider,
  FrameworkProvider,
} from '@rosen-bridge/ui-kit';
import { mockMiddlewareFactory } from '@rosen-ui/swr-helpers';
import { SWRConfig } from 'swr';

import { Favicon } from '@/components';
import { mockedData } from '@/mock/mockedData';
import { theme } from '@/theme/theme';
import { UIKitProvider } from '@/uiKitProvider';

import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

export const App = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  return (
    <NoSsr>
      <FrameworkProvider
        components={{
          Anchor: ({ href, ...props }) => (
            <NextLink href={href as unknown as Route} {...props} />
          ),
          Image: (props) => <NextImage {...props} />,
        }}
        router={{
          pathname,
          search: searchParams.toString(),
          push: (href: string) =>
            router.push(href as unknown as Route, { scroll: false }),
        }}
      >
        <UIKitProvider>
          <ApiKeyProvider>
            <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
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
          </ApiKeyProvider>
        </UIKitProvider>
      </FrameworkProvider>
    </NoSsr>
  );
};
