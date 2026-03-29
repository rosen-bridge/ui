import { createContext, ReactNode, useContext } from 'react';
import { Components } from './components';

export const useConfig = () => {
  const context = useContext(ConfigContext);

  if (context === null) {
    throw new Error('useConfigs must be used within ConfigProvider');
  }

  return context;
};

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
    <ConfigContext.Provider value={configs}>123
      {children}
    </ConfigContext.Provider>
  );
};
