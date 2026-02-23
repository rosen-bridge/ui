'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import NextImage from 'next/image';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { NoSsr } from '@mui/material';
import * as AllIcons from '@rosen-bridge/icons';
import {
  App as AppBase,
  ConfigProvider,
  FrameworkProvider,
} from '@rosen-bridge/ui-kit';

import { theme } from '@/theme/theme';

import { TokenMapProvider } from '../hooks';
import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

const icons = Object.fromEntries(
  Object.entries(AllIcons).filter(([key]) => key !== 'TOKENS'),
);

export const App = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  return (
    <NoSsr>
      <ConfigProvider
        configs={{
          components: {
            Icon: { defaultProps: { icons } },
          },
        }}
      >
        <FrameworkProvider
          components={{
            Anchor: (props) => <NextLink {...props} />,
            Image: (props) => <NextImage {...props} />,
          }}
          router={{
            pathname,
            search: searchParams.toString(),
            push: (href: string) => router.push(href, { scroll: false }),
          }}
        >
          <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
            <TokenMapProvider>{children}</TokenMapProvider>
          </AppBase>
        </FrameworkProvider>
      </ConfigProvider>
    </NoSsr>
  );
};
