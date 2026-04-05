import { ComponentProps, ReactNode } from 'react';

import { Tabs } from '@base-ui/react/tabs';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsTriggerOverrides {}

export type TabsTriggerOwnProps = {
  icon?: ReactNode;
  iconPosition?: 'start' | 'top';
  value?: number | string;
};

export type TabsTriggerBaseProps = ElementBaseProps<'button', TabsTriggerOwnProps>;

export type TabsTriggerOverriddenProps = OverridableType<
  TabsTriggerBaseProps,
  TabsTriggerOverrides,
  never
>;

export const TabsTriggerBase = ({ children, icon, iconPosition, value, ...rest }: TabsTriggerOverriddenProps) => {
  return (
    <Root as={Tabs.Tab} reflects={{ iconPosition }} value={value} {...rest}>
      {icon}<span>{children}</span>
    </Root>
  );
};

TabsTriggerBase.displayName = 'TabsTrigger';

export const TabsTrigger = Wrap(TabsTriggerBase);

export type TabsTriggerProps = ComponentProps<typeof TabsTrigger>;
