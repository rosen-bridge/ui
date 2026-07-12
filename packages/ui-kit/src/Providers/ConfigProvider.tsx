import { createContext, type ReactNode } from 'react';

import type { Components } from './ConfigProvider.components';

export type ConfigContextType = ConfigProviderProps['configs'];

export const ConfigContext = createContext<ConfigContextType | null>(null);

export type ConfigProviderProps = {
  children?: ReactNode;
  configs?: {
    components?: {
      [C in keyof Components]?: {
        defaultProps?: {
          [P in keyof Components[C]]?: Partial<Components[C][P]>;
        };
      };
    };
  };
};

export const ConfigProvider = ({ children, configs }: ConfigProviderProps) => {
  return (
    <ConfigContext.Provider value={configs}>{children}</ConfigContext.Provider>
  );
};
