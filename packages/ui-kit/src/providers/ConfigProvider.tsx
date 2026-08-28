import { createContext, type ReactNode } from 'react';

import type { Components } from './ConfigProvider.components';

export type ConfigContextType = ConfigProviderProps['configs'];

export const ConfigContext = createContext<ConfigContextType | null>(null);

type PresetKey<T> = T extends { preset?: infer P } ? Extract<P, string> : never;

export type ConfigProviderProps = {
  children?: ReactNode;
  configs?: {
    components?: {
      [C in keyof Components]?: {
        defaultProps?: {
          [P in keyof Components[C]]?: Partial<Components[C][P]>;
        };
        presets?: {
          [key in PresetKey<Components[C]>]?: Omit<Partial<Components[C]>, 'preset'>;
        };
      };
    };
  };
};

export const ConfigProvider = ({ children, configs }: ConfigProviderProps) => {
  return <ConfigContext.Provider value={configs}>{children}</ConfigContext.Provider>;
};
