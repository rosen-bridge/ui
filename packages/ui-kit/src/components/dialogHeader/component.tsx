import type { ReactNode } from 'react';

import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import {
  CloseButton,
  type CloseButtonProps,
  Icon,
  type IconProps,
} from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogHeaderOverrides {}

export type DialogHeaderOwnProps = {
  actions?: ReactNode;
  closeable?: boolean;
  icon?: IconProps['name'];
};

export type DialogHeaderBaseProps = ElementBaseProps<
  'div',
  DialogHeaderOwnProps
>;

export type DialogHeaderProps = OverridableType<
  DialogHeaderBaseProps,
  DialogHeaderOverrides,
  never
>;

export const DialogHeader = (props: DialogHeaderProps) => {
  const { actions, closeable, children, icon, ...rest } = useConfig(
    'DialogHeader',
    props,
  );

  return (
    <div {...rest}>
      {icon && <Icon name={icon} />}
      {children}
      <div className="RosenDialogHeader-spacer" />
      {actions}
      {closeable && (
        <DialogBaseUI.Close
          render={(props) => (
            <CloseButton {...(props as unknown as CloseButtonProps)} />
          )}
        />
      )}
    </div>
  );
};

DialogHeader.displayName = 'DialogHeader';
