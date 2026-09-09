import { type PropsWithChildren, useMemo } from 'react';
import type { Route } from 'next';
import NextImage from 'next/image';
import NextLink from 'next/link';

import * as icons from '@rosen-bridge/icons';
import * as tokenIcons from '@rosen-bridge/token-icons';
import {
  type ConfigContextType,
  ConfigProvider,
  type DefaultColor,
  type TokenMeta,
  type TokenProps,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';
import { batch } from '@rosen-ui/utils';

import { Actions } from './app/(main)/Actions';
import { getTokensByIds } from './backend/tokens/actions';
import { unwrap } from './safeServerAction';

declare module '@rosen-bridge/ui-kit' {
  interface ColorOverrides extends Record<DefaultColor, true> {
    UNLISTED: false;
  }

  interface IconOverrides {
    name: keyof typeof icons;
  }

  interface LinkOverrides {
    href: Route;
  }

  interface NetworkOverrides {
    value: Network;
  }
}

const resolveToken: TokenProps['resolver'] = batch<string, TokenMeta>(async (ids) => {
  const data = await unwrap(getTokensByIds)(ids);

  const result: Record<string, TokenMeta> = {};

  for (const token of data) {
    result[token.id] = {
      label: token.name,
      // biome-ignore lint/performance/noDynamicNamespaceImportAccess: Keep it
      logo: tokenIcons[`Token_${token.ergoSideTokenId}` as keyof typeof tokenIcons],
    };
  }

  return result;
});

const getUiKitConfig: () => ConfigContextType = () => ({
  components: {
    Connector: {
      defaultProps: {
        slots: {
          icon: {
            color: 'text-secondary',
          },
        },
      },
    },
    DialogTitle: {
      defaultProps: {
        color: 'secondary-dark',
        variant: 'h2',
      },
    },
    Icon: {
      defaultProps: {
        icons,
      },
    },
    Image: {
      defaultProps: {
        as: NextImage,
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
              // biome-ignore lint/performance/noDynamicNamespaceImportAccess: Keep it
              logo: icons[
                key
                  .split('-')
                  .filter(Boolean)
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join('') as keyof typeof icons
              ],
            },
          ]),
        ),
      },
    },
    PageHeading: {
      defaultProps: {
        actions: <Actions />,
      },
    },
    Token: {
      defaultProps: {
        resolver: resolveToken,
      },
    },
  },
});

export const UIKitProvider = ({ children }: PropsWithChildren) => {
  const config = useMemo(() => getUiKitConfig(), []);
  return <ConfigProvider configs={config}>{children}</ConfigProvider>;
};
