import { Menu as MenuBaseUI } from '@base-ui/react/menu';

import { Button } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MenuTriggerOverrides {}

export type MenuTriggerOwnProps<Payload = unknown> = {
  handle?: MenuBaseUI.Handle<Payload>;
  openOnHover?: boolean;
  payload?: Payload;
};

export type MenuTriggerBaseProps = ElementBaseProps<
  'button',
  MenuTriggerOwnProps
>;

export type MenuTriggerProps = OverridableType<
  MenuTriggerBaseProps,
  MenuTriggerOverrides,
  never
>;

export const MenuTrigger = (props: MenuTriggerProps) => {
  const { children, handle, openOnHover, payload, ...rest } = useConfig(
    'MenuTrigger',
    props,
  );

  return (
    <MenuBaseUI.Trigger
      render={<Button />}
      handle={handle}
      openOnHover={openOnHover}
      payload={payload}
      {...rest}
    >
      {children}
    </MenuBaseUI.Trigger>
  );
};

MenuTrigger.displayName = 'MenuTrigger';
