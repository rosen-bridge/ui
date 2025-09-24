import { createContext, ReactNode, useContext, } from 'react';

import { CenterProps, IconProps } from '../components';

type Components = {
  Center: CenterProps;
  Icon: IconProps;
};

export const useConfigs = () => {
  const context = useContext(ConfigsContext);

  if (!context) {
    throw new Error('useConfigs must be used within ConfigProvider');
  }

  return context;
};

export type ConfigsContextType = ConfigProviderProps['configs'];

export const ConfigsContext = createContext<ConfigsContextType | null>(null);

export type ConfigProviderProps = {
  children?: ReactNode;
  configs?: {
    components?: {
      [K in keyof Components]?: {
        defaultProps: Partial<Components[K]>;
      }
    };
  }
};

export const ConfigProvider = ({ children, configs }: ConfigProviderProps) => {
  return (
    <ConfigsContext.Provider value={configs}>{children}</ConfigsContext.Provider>
  );
};
