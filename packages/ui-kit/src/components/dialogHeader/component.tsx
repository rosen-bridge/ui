import { ReactNode } from 'react';

import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { CloseButton, CloseButtonProps, Icon, IconProps } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogHeaderOverrides {}

// TODO
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

export const DialogHeaderBase = ({
  actions,
  closeable,
  children,
  icon,
  ...rest
}: DialogHeaderProps) => {
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

DialogHeaderBase.displayName = 'DialogHeader';

export const DialogHeader = Wrap(DialogHeaderBase);
