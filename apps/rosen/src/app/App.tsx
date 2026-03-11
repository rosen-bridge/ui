'use client';

/**
 * FIXME: import NoSsr from ui-kit
 * local:ergo/rosen-bridge/ui#193
 */
import { Route } from 'next';
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
import { NETWORKS } from '@rosen-ui/constants';

import { theme } from '@/theme/theme';

import { TOKENS_MAPPER } from '../../configs';
import { TokenMapProvider } from '../hooks';
import { SideBar } from './SideBar';
import { Toolbar } from './Toolbar';

function kebabToPascal(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
            Image: {
              defaultProps: {
                as: NextImage,
              },
            },
            Token: {
              defaultProps: {
                tokens: Object.fromEntries(
                  Object.entries(TOKENS_MAPPER).map(
                    ([tokenId, { name, ergoSideTokenId }]) => [
                      tokenId,
                      {
                        label: name,
                        logo: AllIcons.TOKENS[
                          ergoSideTokenId as keyof (typeof AllIcons)['TOKENS']
                        ],
                      },
                    ],
                  ),
                ),
              },
            },
            Icon: {
              defaultProps: {
                icons: Object.fromEntries(
                  Object.entries(AllIcons).filter(([key]) => key !== 'TOKENS'),
                ),
              },
            },
            Link: {
              defaultProps: {
                as: NextLink,
              },
            },
            Network: {
              defaultProps: {
                networks: Object.fromEntries(
                  Object.entries(NETWORKS).map(([key, value]) => [
                    key,
                    {
                      label: value.label,
                      logo: AllIcons[
                        kebabToPascal(key) as keyof typeof AllIcons
                      ],
                    },
                  ]),
                ),
              },
            },
          },
        }}
      >
        <FrameworkProvider
          router={{
            pathname,
            search: searchParams.toString(),
            push: (href) =>
              router.push(href as unknown as Route, { scroll: false }),
          }}
        >
          <AppBase sideBar={<SideBar />} theme={theme} toolbar={<Toolbar />}>
            {/* <img src={AllIcons.TOKENS.erg}/> */}
            <TokenMapProvider>{children}</TokenMapProvider>
          </AppBase>
        </FrameworkProvider>
      </ConfigProvider>
    </NoSsr>
  );
};
