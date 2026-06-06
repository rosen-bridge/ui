import { Tabs } from '@base-ui/react/tabs';

import { Action, Icon, IconProps } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TabsTabOverrides {}

export type TabsTabOwnProps = {
  icon?: IconProps['name'];
  iconPosition?: 'start' | 'top';
  slots?: {
    icon?: IconProps;
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

export type TabsTabProps =
  | OverridableType<TabsTabAsAnchor, TabsTabOverrides, never>
  | OverridableType<TabsTabAsButton, TabsTabOverrides, never>;

export const TabsTab = (props: TabsTabProps) => {
  const { children, icon, iconPosition, slots, ...rest } = useConfig(
    'TabsTab',
    props,
  );

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

TabsTab.displayName = 'TabsTab';
