import { createContext, ReactNode, useContext } from 'react';

import type {
  ApiKeyDialogOverriddenProps,
  ApiKeyDialogButtonOverriddenProps,
  ApiKeyDialogWarningOverriddenProps,
  AppOverriddenProps,
  AppBarOverriddenProps,
  AvatarOverriddenProps,
  CenterOverriddenProps,
  CloseButtonOverriddenProps,
  CollapsibleOverriddenProps,
  ColumnsOverriddenProps,
  ConnectorOverriddenProps,
  CopyButtonOverriddenProps,
  DialogOverriddenProps,
  DialogContentOverriddenProps,
  DialogDescriptionOverriddenProps,
  DialogFooterOverriddenProps,
  DialogHeaderOverriddenProps,
  DialogTitleOverriddenProps,
  DurationOverriddenProps,
  EventCardOverriddenProps,
  EventDetailsOverriddenProps,
  EventStatusOverriddenProps,
  GridContainerOverriddenProps,
  IconOverriddenProps,
  IconButtonOverriddenProps,
  IdentifierOverriddenProps,
  ImageOverriddenProps,
  InfoIconOverriddenProps,
  LabelGroupOverriddenProps,
  LayoutListOverriddenProps,
  LinkOverriddenProps,
  NetworkOverriddenProps,
  PageHeadingOverriddenProps,
  QrCodeDialogOverriddenProps,
  SkeletonOverriddenProps,
  StackOverriddenProps,
  TableGridOverriddenProps,
  TableGridBodyOverriddenProps,
  TableGridBodyDetailsOverriddenProps,
  TableGridCellOverriddenProps,
  TableGridHeaderOverriddenProps,
  TableGridRowOverriddenProps,
  ThemeToggleButtonOverriddenProps,
  TokenOverriddenProps,
  ToolbarOverriddenProps,
  TooltipOverriddenProps,
  TruncateOverriddenProps,
  TypographyOverriddenProps,
  ViewToggleOverriddenProps,
} from '../components';

type Components = {
  ApiKeyDialog: ApiKeyDialogOverriddenProps;
  ApiKeyDialogButton: ApiKeyDialogButtonOverriddenProps;
  ApiKeyDialogWarning: ApiKeyDialogWarningOverriddenProps;
  App: AppOverriddenProps;
  AppBar: AppBarOverriddenProps;
  Avatar: AvatarOverriddenProps;
  Center: CenterOverriddenProps;
  CloseButton: CloseButtonOverriddenProps;
  Collapsible: CollapsibleOverriddenProps;
  Columns: ColumnsOverriddenProps;
  Connector: ConnectorOverriddenProps;
  CopyButton: CopyButtonOverriddenProps;
  Dialog: DialogOverriddenProps;
  DialogContent: DialogContentOverriddenProps;
  DialogDescription: DialogDescriptionOverriddenProps;
  DialogFooter: DialogFooterOverriddenProps;
  DialogHeader: DialogHeaderOverriddenProps;
  DialogTitle: DialogTitleOverriddenProps;
  Duration: DurationOverriddenProps;
  EventCard: EventCardOverriddenProps;
  EventDetails: EventDetailsOverriddenProps;
  EventStatus: EventStatusOverriddenProps;
  GridContainer: GridContainerOverriddenProps;
  Icon: IconOverriddenProps;
  IconButton: IconButtonOverriddenProps;
  Identifier: IdentifierOverriddenProps;
  Image: ImageOverriddenProps;
  InfoIcon: InfoIconOverriddenProps;
  LabelGroup: LabelGroupOverriddenProps;
  LayoutList: LayoutListOverriddenProps;
  Link: LinkOverriddenProps;
  Network: NetworkOverriddenProps;
  PageHeading: PageHeadingOverriddenProps;
  QrCodeDialog: QrCodeDialogOverriddenProps;
  Skeleton: SkeletonOverriddenProps;
  Stack: StackOverriddenProps;
  TableGrid: TableGridOverriddenProps;
  TableGridBody: TableGridBodyOverriddenProps;
  TableGridBodyDetails: TableGridBodyDetailsOverriddenProps;
  TableGridCell: TableGridCellOverriddenProps;
  TableGridHeader: TableGridHeaderOverriddenProps;
  TableGridRow: TableGridRowOverriddenProps;
  ThemeToggleButton: ThemeToggleButtonOverriddenProps;
  Token: TokenOverriddenProps;
  Toolbar: ToolbarOverriddenProps;
  Tooltip: TooltipOverriddenProps;
  Truncate: TruncateOverriddenProps;
  Typography: TypographyOverriddenProps;
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
