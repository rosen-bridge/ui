import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { type BreakpointQuery, useBreakpoint, useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogOverrides {}

export type DialogOwnProps = {
  open?: boolean;
  maxWidth?: string;
  stickOn?: BreakpointQuery;
  onClose?: () => void;
};

export type DialogBaseProps = ElementBaseProps<'div', DialogOwnProps>;

export type DialogProps = OverridableType<DialogBaseProps, DialogOverrides, never>;

export const Dialog = (props: DialogProps) => {
  const { open, maxWidth, stickOn, onClose, ...rest } = useConfig('Dialog', props);

  const stick = useBreakpoint(stickOn || 'mobile');

  void maxWidth;

  return (
    <DialogBaseUI.Root
      data-stick={(stickOn && stick) || null}
      open={open}
      onOpenChange={(open) => !open && onClose?.()}
    >
      <DialogBaseUI.Portal>
        <DialogBaseUI.Backdrop className="RosenDialog-backdrop" />
        <DialogBaseUI.Popup {...rest} />
      </DialogBaseUI.Portal>
    </DialogBaseUI.Root>
  );
};

Dialog.displayName = 'Dialog';
