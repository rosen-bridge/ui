import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuGroupLabelOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type MenuGroupLabelOwnProps = {};

export type MenuGroupLabelBaseProps = ElementBaseProps<
  'div',
  MenuGroupLabelOwnProps
>;

export type MenuGroupLabelProps = OverridableType<
  MenuGroupLabelBaseProps,
  MenuGroupLabelOverrides,
  never
>;

export const MenuGroupLabel = (props: MenuGroupLabelProps) => {
  const { ...rest } = useConfig('MenuGroupLabel', props);

  return <MenuBaseUI.GroupLabel {...rest} />;
};

MenuGroupLabel.displayName = 'MenuGroupLabel';
