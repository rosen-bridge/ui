import { Tabs } from '@base-ui/react/tabs';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

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

export const TabsPanelBase = ({ value, ...rest }: TabsPanelProps) => {
  return <Tabs.Panel value={value} {...rest} />;
};

TabsPanelBase.displayName = 'TabsPanel';

export const TabsPanel = Wrap(TabsPanelBase);
