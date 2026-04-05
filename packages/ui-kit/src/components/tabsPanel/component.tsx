import { ComponentProps } from 'react';

import { Tabs } from '@base-ui/react/tabs';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsPanelOverrides {}

export type TabsPanelOwnProps = {
  value?: number | string;
};

export type TabsPanelBaseProps = ElementBaseProps<'div', TabsPanelOwnProps>;

export type TabsPanelOverriddenProps = OverridableType<
  TabsPanelBaseProps,
  TabsPanelOverrides,
  never
>;

export const TabsPanelBase = ({ value, ...rest }: TabsPanelOverriddenProps) => {
  return (
    <Root as={Tabs.Panel} value={value} {...rest} />
  );
};

TabsPanelBase.displayName = 'TabsPanel';

export const TabsPanel = Wrap(TabsPanelBase);

export type TabsPanelProps = ComponentProps<typeof TabsPanel>;
