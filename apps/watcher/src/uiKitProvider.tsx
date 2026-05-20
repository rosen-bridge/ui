import { PropsWithChildren, useMemo } from 'react';

import { ConfigProvider, type ConfigContextType } from '@rosen-bridge/ui-kit';

declare module '@rosen-bridge/ui-kit' {}

const getUiKitConfig: () => ConfigContextType = () => ({
  components: {},
});

export const UIKitProvider = ({ children }: PropsWithChildren) => {
  const config = useMemo(() => getUiKitConfig(), []);
  return <ConfigProvider configs={config}>{children}</ConfigProvider>;
};
