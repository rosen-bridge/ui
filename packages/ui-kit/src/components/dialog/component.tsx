import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogOverrides {}

export type DialogOwnProps = {
  open?: boolean;
  maxWidth?: string;
  placement?: 'center' | 'bottom';
  onClose?: () => void;
};

export type DialogBaseProps = ElementBaseProps<'div', DialogOwnProps>;

export type DialogProps = OverridableType<DialogBaseProps, DialogOverrides, never>;

export const Dialog = (props: DialogProps) => {
  const { open, maxWidth, placement = 'center', onClose, ...rest } = useConfig('Dialog', props);

  void maxWidth;

  return (
    <DialogBaseUI.Root open={open} onOpenChange={(open) => !open && onClose?.()}>
      <DialogBaseUI.Portal>
        <DialogBaseUI.Backdrop className="RosenDialog-backdrop" />
        <DialogBaseUI.Popup data-placement={placement} {...rest} />
      </DialogBaseUI.Portal>
    </DialogBaseUI.Root>
  );
};

Dialog.displayName = 'Dialog';
