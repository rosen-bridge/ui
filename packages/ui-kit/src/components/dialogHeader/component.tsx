import { ComponentProps, ReactNode } from 'react';

import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { OverridableType } from '@/types';
import { CloseButton, CloseButtonProps, Icon, IconProps } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';

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

export type DialogHeaderOverriddenProps = OverridableType<
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
}: DialogHeaderOverriddenProps) => {
  return (
    <Root {...rest}>
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
    </Root>
  );
};

DialogHeaderBase.displayName = 'DialogHeader';

export const DialogHeader = Wrap(DialogHeaderBase);

export type DialogHeaderProps = ComponentProps<typeof DialogHeader>;
