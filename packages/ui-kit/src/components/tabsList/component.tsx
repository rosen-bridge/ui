import { Tabs } from '@base-ui/react/tabs';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsListOverrides {}

export type TabsListOwnProps = {
  align?: 'start' | 'center' | 'end';
  grow?: boolean;
};

export type TabsListBaseProps = ElementBaseProps<'div', TabsListOwnProps>;

export type TabsListProps = OverridableType<
  TabsListBaseProps,
  TabsListOverrides,
  never
>;

export const TabsListBase = ({
  align,
  children,
  grow,
  ...rest
}: TabsListProps) => {
  return (
    <Tabs.List data-align={align} data-grow={grow} {...rest}>
      {children}
      <Tabs.Indicator className="RosenTabsIndicator" />
    </Tabs.List>
  );
};

TabsListBase.displayName = 'TabsList';

export const TabsList = Wrap(TabsListBase);
