import { createContext, ReactNode, useContext } from 'react';

import type {
  AvatarOverriddenProps,
  CenterOverriddenProps,
  ColumnsOverriddenProps,
  ConnectorOverriddenProps,
  CopyButtonOverriddenProps,
  GridContainerOverriddenProps,
  IconOverriddenProps,
  IconButtonOverriddenProps,
  IdentifierOverriddenProps,
  ImageOverriddenProps,
  LabelGroupOverriddenProps,
  LinkOverriddenProps,
  NetworkOverriddenProps,
  StackOverriddenProps,
  TableGridOverriddenProps,
  TableGridBodyOverriddenProps,
  TableGridBodyDetailsOverriddenProps,
  TableGridCellOverriddenProps,
  TableGridHeaderOverriddenProps,
  TableGridRowOverriddenProps,
  TextOverriddenProps,
  ThemeToggleButtonOverriddenProps,
  TokenOverriddenProps,
  ToolbarOverriddenProps,
  TooltipOverriddenProps,
  TruncateOverriddenProps,
  ViewToggleOverriddenProps,
} from '../components';

type Components = {
  Avatar: AvatarOverriddenProps;
  Center: CenterOverriddenProps;
  Columns: ColumnsOverriddenProps;
  Connector: ConnectorOverriddenProps;
  CopyButton: CopyButtonOverriddenProps;
  GridContainer: GridContainerOverriddenProps;
  Icon: IconOverriddenProps;
  IconButton: IconButtonOverriddenProps;
  Identifier: IdentifierOverriddenProps;
  Image: ImageOverriddenProps;
  LabelGroup: LabelGroupOverriddenProps;
  Link: LinkOverriddenProps;
  Network: NetworkOverriddenProps;
  Stack: StackOverriddenProps;
  TableGrid: TableGridOverriddenProps;
  TableGridBody: TableGridBodyOverriddenProps;
  TableGridBodyDetails: TableGridBodyDetailsOverriddenProps;
  TableGridCell: TableGridCellOverriddenProps;
  TableGridHeader: TableGridHeaderOverriddenProps;
  TableGridRow: TableGridRowOverriddenProps;
  Text: TextOverriddenProps;
  ThemeToggleButton: ThemeToggleButtonOverriddenProps;
  Token: TokenOverriddenProps;
  Toolbar: ToolbarOverriddenProps;
  Tooltip: TooltipOverriddenProps;
  Truncate: TruncateOverriddenProps;
  ViewToggle: ViewToggleOverriddenProps;
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
