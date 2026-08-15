import { Dialog as DialogBaseUI } from '@base-ui/react/dialog';

import { type BreakpointQuery, useBreakpoint, useConfig } from '@/hooks';
import type { Breakpoint, ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface DialogOverrides {}

export type DialogOwnProps = {
  edge?: boolean;
  open?: boolean;
  placement?: 'center' | 'bottom';
  size?: 'small' | 'medium' | 'large' | 'full';
  unstick?: Breakpoint;
  onClose?: () => void;
};

export type DialogBaseProps = ElementBaseProps<'div', DialogOwnProps>;

export type DialogProps = OverridableType<DialogBaseProps, DialogOverrides, never>;

export const Dialog = (props: DialogProps) => {
  let {
    edge,
    open,
    placement = 'center',
    size = 'medium',
    unstick,
    onClose,
    ...rest
  } = useConfig('Dialog', props);

  const isUnstick = useBreakpoint(`${unstick}-up` as BreakpointQuery);

  if (unstick && !isUnstick) {
    edge = true;
    placement = 'bottom';
    size = 'full';
  }

  return (
    <DialogBaseUI.Root open={open} onOpenChange={(open) => !open && onClose?.()}>
      <DialogBaseUI.Portal>
        <DialogBaseUI.Backdrop className="RosenDialog-backdrop" />
        <DialogBaseUI.Popup
          data-edge={edge || null}
          data-placement={placement}
          data-size={size}
          {...rest}
        />
      </DialogBaseUI.Portal>
    </DialogBaseUI.Root>
  );
};

Dialog.displayName = 'Dialog';
