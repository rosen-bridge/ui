import { Route } from 'next';
import NextLink from 'next/link';
import { PropsWithChildren, useMemo } from 'react';

import * as AllIcons from '@rosen-bridge/icons';
import {
  ConfigProvider,
  type ConfigContextType,
  type DefaultColor,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

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

export const getUiKitConfig: () => ConfigContextType = () => ({
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
        icons: Object.fromEntries(
          Object.entries(AllIcons).filter(([key]) => key !== 'TOKENS'),
        ),
      },
    },
    Link: {
      defaultProps: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        as: NextLink as any,
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
        tokens: {},
      },
    },
  },
});

export const UIKitProvider = ({ children }: PropsWithChildren) => {
  const config = useMemo(() => getUiKitConfig(), []);
  return <ConfigProvider configs={config}>{children}</ConfigProvider>;
};
