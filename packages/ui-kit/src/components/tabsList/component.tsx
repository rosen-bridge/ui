import { ComponentProps } from 'react';

import { Tabs } from '@base-ui/react/tabs';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsListOverrides {}

export type TabsListOwnProps = {
  align?: 'start' | 'center' | 'end';
  grow?: boolean;
};

export type TabsListBaseProps = ElementBaseProps<'div', TabsListOwnProps>;

export type TabsListOverriddenProps = OverridableType<
  TabsListBaseProps,
  TabsListOverrides,
  never
>;

export const TabsListBase = ({ align, children, grow, ...rest }: TabsListOverriddenProps) => {
  return (
    <Root as={Tabs.List} reflects={{ align, grow }} {...rest}>
      {children}
      {/* TODO */}
      {/* <Tabs.Indicator /> */}
    </Root>
  );
};

TabsListBase.displayName = 'TabsList';

export const TabsList = Wrap(TabsListBase);

export type TabsListProps = ComponentProps<typeof TabsList>;
