import { Route } from 'next';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { PropsWithChildren, useMemo } from 'react';

import * as AllIcons from '@rosen-bridge/icons';
import { TokenMap } from '@rosen-bridge/tokens';
import {
  ConfigProvider,
  type ConfigContextType,
  type DefaultColor,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { Actions } from './app/Actions';
import { useTokenMap } from './hooks';

declare module '@rosen-bridge/ui-kit' {
  interface ColorOverrides extends Record<DefaultColor, true> {
    UNLISTED: false;
  }

  interface IconOverrides {
    name: Exclude<keyof typeof AllIcons, 'TOKENS'>;
  }

  interface LinkOverrides {
    href: Route;
  }

  interface NetworkOverrides {
    value: Network;
  }
}

export const getUiKitConfig: (
  tokenMap: TokenMap,
) => ConfigContextType = (tokenMap) => ({
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
        // TODO: this old ThemeOptions
        // fontSize: theme.spacing(3),
      },
    },
    Icon: {
      defaultProps: {
        icons: Object.fromEntries(
          Object.entries(AllIcons).filter(([key]) => key !== 'TOKENS'),
        ),
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
              logo: AllIcons[
                key
                  .split('-')
                  .filter(Boolean)
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join('') as keyof typeof AllIcons
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
        tokens: Object.fromEntries(
          tokenMap
            .getConfig()
            .map((tokens) =>
              Object.entries(tokens).map(([, token]) => [
                token.tokenId,
                {
                  label: token.name,
                  logo: AllIcons.TOKENS[
                    tokens.ergo.tokenId as keyof (typeof AllIcons)['TOKENS']
                  ],
                },
              ]),
            )
            .flat(1),
        ),
      },
    },
  },
});

export const UIKitProvider = ({ children }: PropsWithChildren) => {
  const tokenMap = useTokenMap();

  const config = useMemo(() => getUiKitConfig(tokenMap), [tokenMap]);

  return <ConfigProvider configs={config}>{children}</ConfigProvider>;
};
