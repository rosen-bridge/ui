import { ComponentProps } from 'react';

import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogOverrides {}

// TODO
export type DialogOwnProps = {
  open?: boolean;
  maxWidth?: string;
  stickOn?: string;
  onClose?: () => void;
};

export type DialogBaseProps = ElementBaseProps<'div', DialogOwnProps>;

export type DialogOverriddenProps = OverridableType<
  DialogBaseProps,
  DialogOverrides,
  never
>;

export const DialogBase = ({
  open,
  maxWidth,
  stickOn,
  onClose,
  ...rest
}: DialogOverriddenProps) => {
  void maxWidth;
  void stickOn;
  return (
    <DialogBaseUI.Root
      open={open}
      onOpenChange={(open) => !open && onClose?.()}
    >
      <DialogBaseUI.Portal>
        <DialogBaseUI.Backdrop className="RosenDialog-backdrop" />
        <Root as={DialogBaseUI.Popup} {...rest} />
      </DialogBaseUI.Portal>
    </DialogBaseUI.Root>
  );
};

DialogBase.displayName = 'Dialog';

export const Dialog = Wrap(DialogBase);

export type DialogProps = ComponentProps<typeof Dialog>;
