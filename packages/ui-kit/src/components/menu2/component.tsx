import { ReactNode } from 'react';

import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuOverrides {}

export type ChangeEventDetailsType = MenuBaseUI.Root.ChangeEventDetails;

export type MenuOwnProps = {
  children?: ReactNode;
  handle?: MenuBaseUI.Handle<unknown>;
  open?: boolean;
  onOpenChange?: (open: boolean, eventDetails: ChangeEventDetailsType) => void;
};

export type MenuBaseProps = ElementBaseProps<'div', MenuOwnProps>;

export type Menu2Props = OverridableType<MenuBaseProps, MenuOverrides, never>;

export const Menu2 = (props: Menu2Props) => {
  const { children, handle, open, onOpenChange, ...rest } = useConfig(
    'Menu2',
    props,
  );

  return (
    <MenuBaseUI.Root
      handle={handle}
      open={open}
      onOpenChange={onOpenChange}
      {...rest}
    >
      {children}
    </MenuBaseUI.Root>
  );
};

Menu2.displayName = 'Menu2';
