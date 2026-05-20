import { PropsWithChildren, useMemo } from 'react';

import { TokenMap } from '@rosen-bridge/tokens';
import { ConfigProvider, type ConfigContextType } from '@rosen-bridge/ui-kit';

import { useTokenMap } from './hooks';

declare module '@rosen-bridge/ui-kit' {}

const getUiKitConfig: (tokenMap: TokenMap) => ConfigContextType = () => ({
  components: {},
});

export const UIKitProvider = ({ children }: PropsWithChildren) => {
  const tokenMap = useTokenMap();

  const config = useMemo(() => getUiKitConfig(tokenMap), [tokenMap]);

  return <ConfigProvider configs={config}>{children}</ConfigProvider>;
};
