import { Tabs } from '@base-ui/react/tabs';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsPanelOverrides {}

export type TabsPanelOwnProps = {
  value?: number | string;
};

export type TabsPanelBaseProps = ElementBaseProps<'div', TabsPanelOwnProps>;

export type TabsPanelProps = OverridableType<
  TabsPanelBaseProps,
  TabsPanelOverrides,
  never
>;

export const TabsPanel = (props: TabsPanelProps) => {
  const { value, ...rest } = useConfig('TabsPanel', props);

  return <Tabs.Panel value={value} {...rest} />;
};

TabsPanel.displayName = 'TabsPanel';
