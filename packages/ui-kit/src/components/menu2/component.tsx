import { ReactNode, RefObject } from 'react';

import { Menu as MenuBaseUI, MenuRootActions } from '@base-ui/react/menu';
import { PayloadChildRenderFunction } from '@base-ui/react/utils/popups';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuOverrides {}

export type ChangeEventDetailsType = MenuBaseUI.Root.ChangeEventDetails;

export type MenuOwnProps<Payload = unknown> = {
  actionRef?: RefObject<MenuRootActions | null>;
  children?: ReactNode | PayloadChildRenderFunction<Payload>;
  defaultOpen?: boolean;
  defaultTriggerId?: string | null;
  handle?: MenuBaseUI.Handle<Payload>;
  open?: boolean;
  onOpenChange?: (open: boolean, eventDetails: ChangeEventDetailsType) => void;
  triggerId?: string | null;
};

export type MenuBaseProps = ElementBaseProps<'div', MenuOwnProps>;

export type Menu2Props = OverridableType<MenuBaseProps, MenuOverrides, never>;

export const Menu2 = (props: Menu2Props) => {
  const {
    actionRef,
    children,
    defaultOpen,
    defaultTriggerId,
    handle,
    open,
    onOpenChange,
    triggerId,
    ...rest
  } = useConfig('Menu2', props);

  return (
    <MenuBaseUI.Root
      actionsRef={actionRef}
      defaultOpen={defaultOpen}
      defaultTriggerId={defaultTriggerId}
      handle={handle}
      open={open}
      onOpenChange={onOpenChange}
      triggerId={triggerId}
      {...rest}
    >
      {children}
    </MenuBaseUI.Root>
  );
};

Menu2.displayName = 'Menu';
