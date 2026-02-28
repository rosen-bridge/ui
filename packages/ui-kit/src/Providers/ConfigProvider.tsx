import { createContext, ReactNode, useContext } from 'react';

import type {
  CenterProps,
  ColumnsProps,
  GridContainerProps,
  IconProps,
  IdentifierProps,
  StackProps,
} from '../components';

type Components = {
  Center: CenterProps;
  Columns: ColumnsProps;
  GridContainer: GridContainerProps;
  Icon: IconProps;
  Identifier: IdentifierProps;
  StackProps: StackProps;
};

export const useConfigs = () => {
  const context = useContext(ConfigsContext);

  if (context === null) {
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
    <ConfigsContext.Provider value={configs}>
      {children}
    </ConfigsContext.Provider>
  );
};
