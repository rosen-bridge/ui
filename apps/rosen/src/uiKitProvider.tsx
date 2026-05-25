import { PropsWithChildren, useMemo } from 'react';

import * as AllIcons from '@rosen-bridge/icons';
import { TokenMap } from '@rosen-bridge/tokens';
import {
  ConfigProvider,
  type ConfigContextType,
  type DefaultColor,
} from '@rosen-bridge/ui-kit';

import { Actions } from './app/Actions';
import { useTokenMap } from './hooks';

declare module '@rosen-bridge/ui-kit' {
  interface ColorOverrides extends Record<DefaultColor, true> {
    UNLISTED: false;
  }

  interface IconOverrides {
    name: Exclude<keyof typeof AllIcons, 'TOKENS'>;
  }
}

export const getUiKitConfig: (
  tokenMap: TokenMap,
) => ConfigContextType = () => ({
  components: {
    Icon: {
      defaultProps: {
        icons: Object.fromEntries(
          Object.entries(AllIcons).filter(([key]) => key !== 'TOKENS'),
        ),
      },
    },
    PageHeading: {
      defaultProps: {
        actions: <Actions />,
      },
    },
  },
});

export const UIKitProvider = ({ children }: PropsWithChildren) => {
  const tokenMap = useTokenMap();

  const config = useMemo(() => getUiKitConfig(tokenMap), [tokenMap]);

  return <ConfigProvider configs={config}>{children}</ConfigProvider>;
};
