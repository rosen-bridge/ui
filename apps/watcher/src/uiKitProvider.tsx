import { type PropsWithChildren, useMemo } from 'react';
import type { Route } from 'next';
import NextLink from 'next/link';

import * as icons from '@rosen-bridge/icons';
import { type ConfigContextType, ConfigProvider, type DefaultColor } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network } from '@rosen-ui/types';

import { Actions } from './app/Actions';

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

const getUiKitConfig: () => ConfigContextType = () => ({
  components: {
    CardTitle: {
      defaultProps: {
        weight: 'bold',
      },
    },
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
        tokens: {},
      },
    },
  },
});

export const UIKitProvider = ({ children }: PropsWithChildren) => {
  const config = useMemo(() => getUiKitConfig(), []);
  return <ConfigProvider configs={config}>{children}</ConfigProvider>;
};
