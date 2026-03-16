import { Route } from 'next';
import NextImage from 'next/image';
import NextLink from 'next/link';

import * as AllIcons from '@rosen-bridge/icons';
import type { ConfigProviderProps, DefaultColor } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { TOKENS_MAPPER } from '../configs';
import { Actions } from './app/Actions';

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

export const uiKitConfigs: ConfigProviderProps['configs'] = {
  components: {
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
        actions: <Actions />
      }
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
  },
};
