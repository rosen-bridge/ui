import { Tabs } from '@base-ui/react/tabs';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

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

export const TabsList = (props: TabsListProps) => {
  const { align, children, grow, ...rest } = useConfig('TabsList', props);

  return (
    <Tabs.List data-align={align} data-grow={grow} {...rest}>
      {children}
      <Tabs.Indicator className="RosenTabsIndicator" />
    </Tabs.List>
  );
};

TabsList.displayName = 'TabsList';
