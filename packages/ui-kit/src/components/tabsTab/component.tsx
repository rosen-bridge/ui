import { ComponentProps } from 'react';

import { Tabs } from '@base-ui/react/tabs';

import { Action, Icon, IconOverriddenProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsTabOverrides {}

export type TabsTabOwnProps = {
  icon?: IconOverriddenProps['name'];
  iconPosition?: 'start' | 'top';
  slots?: {
    icon?: IconOverriddenProps;
  };
};

type TabsTabAsAnchor = ElementBaseProps<
  'a',
  TabsTabOwnProps & { href: string | undefined }
>;

type TabsTabAsButton = ElementBaseProps<
  'button',
  TabsTabOwnProps & { href?: never; value: number | string | undefined }
>;

export type TabsTabBaseProps = TabsTabAsAnchor | TabsTabAsButton;

export type TabsTabOverriddenProps =
  | OverridableType<TabsTabAsAnchor, TabsTabOverrides, never>
  | OverridableType<TabsTabAsButton, TabsTabOverrides, never>;

export const TabsTabBase = ({
  children,
  icon,
  iconPosition,
  slots,
  ...rest
}: TabsTabOverriddenProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = Tabs.Tab as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (rest as any).value;

  return (
    <Component
      data-icon-position={iconPosition}
      nativeButton={!rest.href}
      {...rest}
      value={rest.href ?? value}
      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      render={(props: {}) => (
        <Action {...props} {...rest}>
          {icon && <Icon name={icon} size="small" {...slots?.icon} />}
          {children && <span>{children}</span>}
        </Action>
      )}
    />
  );
};

TabsTabBase.displayName = 'TabsTab';

export const TabsTab = Wrap(TabsTabBase);

export type TabsTabProps = ComponentProps<typeof TabsTab>;
