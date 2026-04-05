import { ComponentProps } from 'react';

import { Tabs } from '@base-ui/react/tabs';

import { Icon, IconOverriddenProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsTabOverrides {}

export type TabsTabOwnProps = {
  icon?: IconOverriddenProps['name'];
  iconPosition?: 'start' | 'top';
  slots?: {
    icon?: IconOverriddenProps
  };
  value?: number | string;
};

export type TabsTabBaseProps = ElementBaseProps<'button', TabsTabOwnProps>;

export type TabsTabOverriddenProps = OverridableType<
  TabsTabBaseProps,
  TabsTabOverrides,
  never
>;

export const TabsTabBase = ({ children, icon, iconPosition, slots, value, ...rest }: TabsTabOverriddenProps) => {
  return (
    <Root as={Tabs.Tab} reflects={{ iconPosition }} value={value} {...rest}>
      {icon && <Icon name={icon} size="small" {...slots?.icon} />}
      {children && <span>{children}</span>}
    </Root>
  );
};

TabsTabBase.displayName = 'TabsTab';

export const TabsTab = Wrap(TabsTabBase);

export type TabsTabProps = ComponentProps<typeof TabsTab>;
