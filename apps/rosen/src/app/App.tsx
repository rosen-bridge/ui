'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import NextImage from 'next/image';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { NETWORKS } from '@rosen-ui/constants';

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
import { Route } from 'next';

function kebabToPascal(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export const App = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  return (
    <NoSsr>
      <ConfigProvider
        configs={{
          components: {
            Icon: {
              defaultProps: {
                icons: Object.fromEntries(
                  Object.entries(AllIcons).filter(([key]) => key !== 'TOKENS'),
                )
              }
            },
            Link: {
              defaultProps: {
                as: NextLink
              },
            },
            Network: {
              defaultProps: {
                networks: Object.fromEntries(
                  Object.entries(NETWORKS).map(([key, value]) => [key, { label: value.label, logo: AllIcons[kebabToPascal(key) as keyof typeof AllIcons] }])
                ),
              }
            }
          },
        }}
      >
        <FrameworkProvider
          components={{
            Image: (props) => <NextImage {...props} />,
          }}
          router={{
            pathname,
            search: searchParams.toString(),
            push: (href) => router.push(href as unknown as Route, { scroll: false }),
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
